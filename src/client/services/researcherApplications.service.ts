import { apiService } from './api.service';

export interface ResearcherApplication {
  id: string;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
  applicationData?: Record<string, unknown>;
  participant: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ResearcherApplicationsResponse {
  success: boolean;
  data: {
    applications: ResearcherApplication[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ApplicationReview {
  status: 'accepted' | 'rejected';
  notes?: string;
}

/**
 * Researcher Applications API service
 */
export const researcherApplicationsService = {
  /**
   * Get applications for a study (researcher only)
   */
  async getStudyApplications(studyId: string, filters: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ResearcherApplicationsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const baseUrl = `applications?endpoint=study/${studyId}/applications`;
    const url = queryString ? `${baseUrl}&${queryString}` : baseUrl;
    
    return apiService.get<ResearcherApplicationsResponse>(url);
  },

  /**
   * Review application (approve/reject)
   */
  async reviewApplication(applicationId: string, review: ApplicationReview): Promise<{
    success: boolean;
    data: ResearcherApplication;
    message: string;
  }> {
    return apiService.patch(`applications?endpoint=applications/${applicationId}/review`, review);
  }
};

export default researcherApplicationsService;
