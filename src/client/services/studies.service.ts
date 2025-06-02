import { apiService } from './api.service';
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
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });    const queryString = params.toString();
    const url = queryString ? `studies?${queryString}` : 'studies';
    
    return apiService.get<StudiesResponse>(url);
  },
  /**
   * Get study by ID
   */
  async getStudy(studyId: string): Promise<StudyResponse> {
    return apiService.get<StudyResponse>(`studies/${studyId}`);
  },

  /**
   * Create new study
   */
  async createStudy(data: CreateStudyRequest): Promise<StudyResponse> {
    return apiService.post<StudyResponse>('studies', data);
  },

  /**
   * Update study
   */
  async updateStudy(studyId: string, data: UpdateStudyRequest): Promise<StudyResponse> {
    return apiService.put<StudyResponse>(`studies/${studyId}`, data);
  },

  /**
   * Delete study
   */
  async deleteStudy(studyId: string): Promise<{ success: boolean; message: string }> {
    return apiService.delete(`studies/${studyId}`);
  },
  /**
   * Duplicate study
   */
  async duplicateStudy(studyId: string): Promise<StudyResponse> {
    return apiService.post<StudyResponse>(`studies/${studyId}/duplicate`);
  },

  /**
   * Launch study (change status to active)
   */
  async launchStudy(studyId: string): Promise<StudyResponse> {
    return apiService.patch<StudyResponse>(`studies/${studyId}/launch`);
  },

  /**
   * Pause study
   */
  async pauseStudy(studyId: string): Promise<StudyResponse> {
    return apiService.patch<StudyResponse>(`studies/${studyId}/pause`);
  },

  /**
   * Complete study
   */
  async completeStudy(studyId: string): Promise<StudyResponse> {
    return apiService.patch<StudyResponse>(`studies/${studyId}/complete`);
  },

  /**
   * Get study analytics
   */
  async getStudyAnalytics(studyId: string): Promise<{ success: boolean; analytics: StudyAnalytics }> {
    return apiService.get(`studies/${studyId}/analytics`);
  },

  /**
   * Export study data
   */
  async exportStudyData(studyId: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    return apiService.get(`studies/${studyId}/export?format=${format}`, {
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
    return apiService.get(`studies/${studyId}/participants`);
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
    return apiService.post(`studies/${studyId}/invite`, { emails });
  },

  /**
   * Remove participant from study
   */
  async removeParticipant(studyId: string, participantId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiService.delete(`studies/${studyId}/participants/${participantId}`);
  },
};

export default studiesService;
