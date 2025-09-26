import { apiService } from './api.service';
import type { IParticipant } from '../../shared/types';

export interface InviteParticipantRequest {
  studyId: string;
  email: string;
  firstName: string;
  lastName: string;
  demographics?: Record<string, unknown>;
}

export interface UpdateParticipantRequest extends Partial<InviteParticipantRequest> {
  status?: 'invited' | 'accepted' | 'declined' | 'completed' | 'no_show';
  notes?: string;
}

export interface ParticipantsResponse {
  success: boolean;
  participants: IParticipant[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface ParticipantResponse {
  success: boolean;
  participant: IParticipant;
}

export interface ParticipantStatsResponse {
  success: boolean;
  stats: {
    total: number;
    invited: number;
    accepted: number;
    declined: number;
    completed: number;
    noShow: number;
  };
}

/**
 * Participants API service
 */
export const participantsService = {
  /**
   * Get all participants with optional filtering
   */
  async getParticipants(params: {
    studyId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ParticipantsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `participants?${queryString}` : 'participants';
    
    return apiService.get<ParticipantsResponse>(url);
  },

  /**
   * Get participant by ID
   */
  async getParticipant(participantId: string): Promise<ParticipantResponse> {
    return apiService.get<ParticipantResponse>(`participants/${participantId}`);
  },

  /**
   * Invite a new participant
   */
  async inviteParticipant(data: InviteParticipantRequest): Promise<ParticipantResponse> {
    return apiService.post<ParticipantResponse>('participants/invite', data);
  },

  /**
   * Update participant
   */
  async updateParticipant(
    participantId: string, 
    data: UpdateParticipantRequest
  ): Promise<ParticipantResponse> {
    return apiService.put<ParticipantResponse>(`participants/${participantId}`, data);
  },

  /**
   * Delete participant
   */
  async deleteParticipant(participantId: string): Promise<{ success: boolean; message: string }> {
    return apiService.delete(`participants/${participantId}`);
  },

  /**
   * Get participant statistics
   */
  async getParticipantStats(): Promise<ParticipantStatsResponse> {
    return apiService.get<ParticipantStatsResponse>('participants/stats');
  },
};

export default participantsService;
