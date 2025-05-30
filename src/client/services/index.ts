export { apiService, default as api } from './api.service';
export { authService, default as auth } from './auth.service';
export { studiesService, default as studies } from './studies.service';

// Re-export types for convenience
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ProfileUpdateRequest,
} from './auth.service';

export type {
  CreateStudyRequest,
  UpdateStudyRequest,
  StudyFilters,
  StudiesResponse,
  StudyResponse,
  StudyAnalytics,
} from './studies.service';
