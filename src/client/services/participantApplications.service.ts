import { apiService } from './api-network-resilient.service';
import type { ParticipantApplication, IParticipantApplication } from '../../shared/types';


// Helper function to detect if we're in fallback mode
const isFallbackMode = (): boolean => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      const token = state?.token;
      return Boolean(token && (token.includes('mock-signature') || token.includes('fallback-token')));
    }
  } catch (error) {
    console.warn('Failed to parse auth storage:', error);
  }
  return false;
};

// Helper function to simulate API delay
const simulateDelay = (ms: number = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock data for local development  
const getMockApplications = (): IParticipantApplication[] => {
  const baseTime = Date.now();
  return [
    {
      _id: 'mock-app-001',
      participantId: 'mock-participant-001',
      studyId: 'mock-study-001',
      status: 'approved',
      notes: 'Great fit for our study requirements',
      appliedAt: new Date(baseTime - 86400000 * 2),
      reviewedAt: new Date(baseTime - 86400000 * 1),
      screeningResponses: [
        {
          questionId: 'q1',
          question: 'What is your age range?',
          answer: '25-34'
        }
      ]
    },
    {
      _id: 'mock-app-002',
      participantId: 'mock-participant-001',
      studyId: 'mock-study-002',
      status: 'pending',
      appliedAt: new Date(baseTime - 86400000),
      screeningResponses: [
        {
          questionId: 'q1',
          question: 'Do you use mobile apps daily?',
          answer: 'Yes'
        }
      ]
    },
    {
      _id: 'mock-app-003',
      participantId: 'mock-participant-001',
      studyId: 'mock-study-003',
      status: 'rejected',
      notes: 'Does not meet age criteria',
      appliedAt: new Date(baseTime - 86400000 * 5),
      reviewedAt: new Date(baseTime - 86400000 * 4),
      rejectionReason: 'Age criteria not met',
      screeningResponses: [
        {
          questionId: 'q1',
          question: 'What is your age?',
          answer: '17'
        }
      ]
    }
  ];
};

export interface PublicStudy {
  id: string;
  title: string;
  description: string;
  type: string;
  researcher: {
    name: string;
  };
  configuration: {
    duration: number;
    compensation: number;
    maxParticipants: number;
  };
  participants: {
    enrolled: number;
  };
  createdAt: string;
}

export interface PublicStudiesResponse {
  success: boolean;
  data: {
    studies: PublicStudy[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ApplicationSubmission {
  screeningResponses: Array<{
    questionId: string;
    question: string;
    answer: string;
  }>;
}

export interface ApplicationsResponse {
  success: boolean;
  data: {
    applications: ParticipantApplication[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface StudyApplicationsResponse {
  success: boolean;
  data: {
    applications: Array<ParticipantApplication & {
      participantId: {
        name: string;
        email: string;
        profile?: {
          demographics?: Record<string, unknown>;
        };
      };
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface ApplicationReview {
  action: 'approve' | 'reject';
  rejectionReason?: string;
  notes?: string;
}

/**
 * Participant Applications API service
 */
export const participantApplicationsService = {
  /**
   * Get public studies available for application
   */
  async getPublicStudies(filters: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  } = {}): Promise<PublicStudiesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });    const queryString = params.toString();
    const baseUrl = 'applications?endpoint=studies/public';
    const url = queryString ? `${baseUrl}&${queryString}` : baseUrl;
      return apiService.get<PublicStudiesResponse>(url);
  },

  /**
   * Get study details for application
   */
  async getStudyDetails(studyId: string): Promise<{
    success: boolean;
    study: PublicStudy & {
      configuration: {
        duration: number;
        compensation: number;
        maxParticipants: number;
        participantCriteria: {
          minAge?: number;
          maxAge?: number;
          location?: string[];
          devices?: string[];
          customScreening?: Array<{
            id: string;
            question: string;
            type: 'text' | 'multiple-choice' | 'boolean' | 'number';
            options?: string[];
            required: boolean;
          }>;
        };
        instructions?: string;
      };
    };
  }> {
    return apiService.get(`applications?endpoint=studies/${studyId}/details`);
  },

  /**
   * Check if user has already applied to a study
   */
  async checkApplicationStatus(studyId: string): Promise<{
    success: boolean;
    data: {
      hasApplied: boolean;
      application?: {
        id: string;
        status: string;
        appliedAt: string;
      };
    };
  }> {
    return apiService.get(`applications?endpoint=applications/status/${studyId}`);
  },

  /**
   * Apply to a study
   */  async applyToStudy(studyId: string, application: ApplicationSubmission): Promise<{
    success: boolean;
    data: ParticipantApplication;
    message: string;
  }> {
    // Send studyId in the request body as expected by the API
    const applicationData = {
      ...application,
      studyId: studyId
    };
    return apiService.post(`applications?action=apply`, applicationData);
  },

  /**
   * Get my applications
   */
  async getMyApplications(filters: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApplicationsResponse> {
    // Check if we should use fallback data
    if (isFallbackMode()) {
      console.log('🔧 Participant Applications Service - Using fallback data');
      await simulateDelay();
      
      const mockApps = getMockApplications();
      
      // Apply status filter if provided
      let filteredApps = mockApps;
      if (filters.status && filters.status !== 'all') {
        filteredApps = mockApps.filter(app => app.status === filters.status);
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedApps = filteredApps.slice(startIndex, endIndex);
      
      // Transform to expected format (keep as IParticipantApplication)
      const transformedApps: ParticipantApplication[] = paginatedApps;
      
      const totalPages = Math.ceil(filteredApps.length / limit);
      
      return {
        success: true,
        data: {
          applications: transformedApps,
          pagination: {
            current: page,
            pages: totalPages,
            total: filteredApps.length
          }
        }
      };
    }

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });    const queryString = params.toString();
    const baseUrl = 'applications?endpoint=applications/my-applications';
    const url = queryString ? `${baseUrl}&${queryString}` : baseUrl;
    
    return apiService.get<ApplicationsResponse>(url);
  },

  /**
   * Withdraw application
   */  async withdrawApplication(applicationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiService.patch(`applications?endpoint=applications/${applicationId}/withdraw`);
  },

  /**
   * Get applications for a study (researcher only)
   */
  async getStudyApplications(studyId: string, filters: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<StudyApplicationsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });    const queryString = params.toString();
    const baseUrl = `applications?endpoint=studies/${studyId}/applications`;
    const url = queryString ? `${baseUrl}&${queryString}` : baseUrl;
    
    return apiService.get<StudyApplicationsResponse>(url);
  },

  /**
   * Review application (approve/reject)
   */  async reviewApplication(applicationId: string, review: ApplicationReview): Promise<{
    success: boolean;
    data: ParticipantApplication;
    message: string;
  }> {
    return apiService.patch(`applications?endpoint=applications/${applicationId}/review`, review);
  }
};

export default participantApplicationsService;
