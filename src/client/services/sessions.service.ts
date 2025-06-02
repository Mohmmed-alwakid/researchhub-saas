import { apiService } from './api.service';
import type { ISession } from '../../shared/types';

export interface CreateSessionRequest {
  studyId: string;
  participantInfo: {
    email?: string;
    name?: string;
    age?: number;
    demographics?: Record<string, unknown>;
  };
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'abandoned';
  feedback?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export interface UpdateProgressRequest {
  action: 'complete_task' | 'next_task' | 'previous_task';
  taskId?: string;
  data?: Record<string, unknown>;
}

export interface SessionsResponse {
  success: boolean;
  sessions?: ISession[];
  data?: {
    sessions: ISession[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface SessionResponse {
  success: boolean;
  session?: ISession;
  data?: ISession | {
    session: ISession;
    recordings?: Array<Record<string, unknown>>;
  };
}

/**
 * Sessions API service
 */
export const sessionsService = {
  /**
   * Start a new session for a study
   */
  async startSession(studyId: string, data: CreateSessionRequest['participantInfo']): Promise<SessionResponse> {
    return apiService.post<SessionResponse>(`sessions/start/${studyId}`, {
      participantInfo: data
    });
  },

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SessionResponse> {
    return apiService.get<SessionResponse>(`sessions/${sessionId}`);
  },

  /**
   * Get all sessions with optional filtering
   */
  async getSessions(params: {
    studyId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<SessionsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `sessions?${queryString}` : 'sessions';
    
    return apiService.get<SessionsResponse>(url);
  },

  /**
   * Get sessions for a specific study
   */
  async getStudySessions(studyId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<SessionsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `sessions/study/${studyId}/sessions?${queryString}` : `sessions/study/${studyId}/sessions`;
    
    return apiService.get<SessionsResponse>(url);
  },

  /**
   * Update session progress (with session token authentication)
   */
  async updateSessionProgress(sessionId: string, data: UpdateProgressRequest): Promise<SessionResponse> {
    return apiService.put<SessionResponse>(`sessions/${sessionId}/progress`, data);
  },

  /**
   * Complete a session
   */
  async completeSession(sessionId: string, feedback?: Record<string, unknown>): Promise<SessionResponse> {
    return apiService.post<SessionResponse>(`sessions/${sessionId}/complete`, {
      feedback
    });
  },

  /**
   * Pause a session
   */
  async pauseSession(sessionId: string): Promise<SessionResponse> {
    return apiService.post<SessionResponse>(`sessions/${sessionId}/pause`);
  },

  /**
   * Resume a session
   */
  async resumeSession(sessionId: string): Promise<SessionResponse> {
    return apiService.post<SessionResponse>(`sessions/${sessionId}/resume`);
  },

  /**
   * Update session (for researchers)
   */
  async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<SessionResponse> {
    return apiService.put<SessionResponse>(`sessions/${sessionId}`, data);
  },

  /**
   * Get session details (for researchers)
   */
  async getSessionDetails(sessionId: string): Promise<SessionResponse> {
    return apiService.get<SessionResponse>(`sessions/${sessionId}/details`);
  },

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return apiService.delete(`sessions/${sessionId}`);
  },
};

export default sessionsService;
