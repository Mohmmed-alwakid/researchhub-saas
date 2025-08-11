import { apiService } from './api-network-resilient.service';
import type { Study, StudyStatus, StudyType, Task } from '../../shared/types';

export interface CreateStudyRequest {
  title: string;
  description: string;
  type: StudyType;
  targetParticipants: number;
  duration: number;
  compensation: number;
  requirements: string[];
  tasks: Omit<Task, '_id' | 'studyId'>[];
  settings: {
    recordScreen: boolean;
    recordAudio: boolean;
    recordWebcam: boolean;
    trackClicks: boolean;
    trackHovers: boolean;
    trackScrolls: boolean;
  };
}

export interface UpdateStudyRequest extends Partial<CreateStudyRequest> {
  status?: StudyStatus;
}

export interface StudyFilters {
  status?: StudyStatus;
  type?: StudyType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudiesResponse {
  success: boolean;
  studies: Study[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalStudies: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface StudyResponse {
  success: boolean;
  study: Study;
  pointsDeducted?: number;
  message?: string;
}

export interface StudyAnalytics {
  totalParticipants: number;
  completedSessions: number;
  averageSessionDuration: number;
  completionRate: number;
  dropoffPoints: Array<{
    taskId: string;
    taskTitle: string;
    dropoffRate: number;
  }>;  heatmapData: Record<string, unknown>[];
  clickData: Record<string, unknown>[];
  scrollData: Record<string, unknown>[];
}

/**
 * Studies API service
 */
export const studiesService = {
  /**
   * Get all studies with filters
   */
  async getStudies(filters: StudyFilters = {}): Promise<StudiesResponse> {
    const params = new URLSearchParams();
    params.append('action', 'get-studies');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `research-consolidated?${queryString}`;
    
    return apiService.get<StudiesResponse>(url);
  },
  /**
   * Get study by ID
   */
  async getStudy(studyId: string): Promise<StudyResponse> {
    return apiService.get<StudyResponse>(`research-consolidated?action=get-study&study_id=${studyId}`);
  },

  /**
   * Create new study
   */
  async createStudy(data: CreateStudyRequest): Promise<StudyResponse> {
    return apiService.post<StudyResponse>('research-consolidated?action=create-study', data);
  },

  /**
   * Update study
   */
  async updateStudy(studyId: string, data: UpdateStudyRequest): Promise<StudyResponse> {
    return apiService.put<StudyResponse>(`research-consolidated?action=update-study&study_id=${studyId}`, data);
  },

  /**
   * Delete study
   */
  async deleteStudy(studyId: string): Promise<{ success: boolean; message: string }> {
    return apiService.delete(`research-consolidated?action=delete-study`, { 
      data: { id: studyId }
    });
  },
  /**
   * Duplicate study
   */
  async duplicateStudy(studyId: string): Promise<StudyResponse> {
    return apiService.post<StudyResponse>(`studies?action=duplicate-study&id=${studyId}`);
  },

  /**
   * Launch study (change status to active)
   */
  async launchStudy(studyId: string): Promise<StudyResponse> {
    return apiService.patch<StudyResponse>(`research-consolidated?action=launch-study&study_id=${studyId}`);
  },

  /**
   * Pause study
   */
  async pauseStudy(studyId: string): Promise<StudyResponse> {
    return apiService.patch<StudyResponse>(`studies?action=pause-study&id=${studyId}`);
  },

  /**
   * Complete study
   */
  async completeStudy(studyId: string): Promise<StudyResponse> {
    return apiService.patch<StudyResponse>(`studies?action=complete-study&id=${studyId}`);
  },

  /**
   * Get study analytics
   */
  async getStudyAnalytics(studyId: string): Promise<{ success: boolean; analytics: StudyAnalytics }> {
    return apiService.get(`studies?action=get-analytics&id=${studyId}`);
  },

  /**
   * Export study data
   */
  async exportStudyData(studyId: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    return apiService.get(`studies?action=export-data&id=${studyId}&format=${format}`, {
      responseType: 'blob',
    });
  },
  /**
   * Get study participants
   */
  async getStudyParticipants(studyId: string): Promise<{
    success: boolean;
    participants: Array<{
      _id: string;
      user: Record<string, unknown>;
      status: string;
      invitedAt: string;
      joinedAt?: string;
      completedAt?: string;
    }>;
  }> {
    return apiService.get(`studies?action=get-participants&id=${studyId}`);
  },

  /**
   * Invite participants to study
   */
  async inviteParticipants(studyId: string, emails: string[]): Promise<{
    success: boolean;
    invited: string[];
    failed: string[];
    message: string;
  }> {
    return apiService.post(`studies?action=invite-participants&id=${studyId}`, { emails });
  },

  /**
   * Remove participant from study
   */
  async removeParticipant(studyId: string, participantId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiService.delete(`studies?action=remove-participant&id=${studyId}&participantId=${participantId}`);
  },
};

export default studiesService;
