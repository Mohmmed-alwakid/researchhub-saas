export { apiService, default as api } from './api.service';
export { authService, default as auth } from './auth.service';
export { studiesService, default as studies } from './studies.service';
export { pointsService, default as points } from './payment.service';
export { participantsService, default as participants } from './participants.service';
export { sessionsService, default as sessions } from './sessions.service';
export { adminService } from './admin.service';

// Re-export types for convenience
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ProfileUpdateRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse,
} from './auth.service';

export type {
  CreateStudyRequest,
  UpdateStudyRequest,
  StudyFilters,
  StudiesResponse,
  StudyResponse,
  StudyAnalytics,
} from './studies.service';

export type {
  IPointsBalance,
  IPointsTransaction,
} from '../../shared/types';

export type {
  InviteParticipantRequest,
  UpdateParticipantRequest,
  ParticipantsResponse,
  ParticipantResponse,
  ParticipantStatsResponse,
} from './participants.service';

export type {
  CreateSessionRequest,
  UpdateSessionRequest,
  UpdateProgressRequest,
  SessionsResponse,
  SessionResponse,
} from './sessions.service';
