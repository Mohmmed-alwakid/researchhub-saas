import { apiService } from './api.service';
import type { ParticipantApplication, Study } from '../../shared/types';

export interface PublicStudy {
  _id: string;
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
          demographics?: any;
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
    });

    const queryString = params.toString();
    const url = queryString ? `/participant-applications/studies/public?${queryString}` : '/participant-applications/studies/public';
    
    return apiService.get<PublicStudiesResponse>(url);
  },

  /**
   * Apply to a study
   */
  async applyToStudy(studyId: string, application: ApplicationSubmission): Promise<{
    success: boolean;
    data: ParticipantApplication;
    message: string;
  }> {
    return apiService.post(`/participant-applications/studies/${studyId}/apply`, application);
  },

  /**
   * Get my applications
   */
  async getMyApplications(filters: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApplicationsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/participant-applications/applications/my?${queryString}` : '/participant-applications/applications/my';
    
    return apiService.get<ApplicationsResponse>(url);
  },

  /**
   * Withdraw application
   */
  async withdrawApplication(applicationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiService.patch(`/participant-applications/applications/${applicationId}/withdraw`);
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
    });

    const queryString = params.toString();
    const url = queryString ? `/participant-applications/studies/${studyId}/applications?${queryString}` : `/participant-applications/studies/${studyId}/applications`;
    
    return apiService.get<StudyApplicationsResponse>(url);
  },

  /**
   * Review application (approve/reject)
   */
  async reviewApplication(applicationId: string, review: ApplicationReview): Promise<{
    success: boolean;
    data: ParticipantApplication;
    message: string;
  }> {
    return apiService.patch(`/participant-applications/applications/${applicationId}/review`, review);
  }
};

export default participantApplicationsService;
