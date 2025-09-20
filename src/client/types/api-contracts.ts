/**
 * API CONTRACT DEFINITIONS
 * 
 * These interfaces ensure consistency between frontend and backend API responses.
 * CRITICAL: Any changes to these interfaces must be coordinated with backend changes.
 */

export interface StudyObject {
  id: number;
  _id: string;
  uuid: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  target_participants: number;
  researcher_id: string;
  type: 'usability' | 'interview' | 'survey' | 'prototype';
  blocks: StudyBlock[];
  compensation: number;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  created_by: string;
  settings: Record<string, unknown>;
}

export interface StudyBlock {
  id: string;
  type: string;
  order: number;
  title: string;
  settings: Record<string, unknown>;
  description: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalStudies: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * CRITICAL: This is the EXACT format that the backend MUST return
 * for the get-studies endpoint. DO NOT CHANGE without updating backend!
 */
export interface StudiesResponse {
  success: true;
  studies: StudyObject[];
  pagination: PaginationInfo;
}

/**
 * Legacy format that should NEVER be used (for reference only)
 * @deprecated This format causes studies page empty state bug
 */
export interface LegacyStudiesResponse {
  success: true;
  data: StudyObject[];
  count: number;
}

/**
 * Response format validation function for frontend
 */
export function validateStudiesResponse(response: unknown): response is StudiesResponse {
  if (!response || typeof response !== 'object') {
    console.error('❌ VALIDATION: Response is not an object');
    return false;
  }
  
  const resp = response as Record<string, unknown>;
  
  if (resp.success !== true) {
    console.error('❌ VALIDATION: Response success is not true');
    return false;
  }
  
  if (!Array.isArray(resp.studies)) {
    console.error('❌ VALIDATION: Response studies is not an array');
    return false;
  }
  
  if (!resp.pagination || typeof resp.pagination !== 'object') {
    console.error('❌ VALIDATION: Response pagination is missing or invalid');
    return false;
  }
  
  const pagination = resp.pagination as Record<string, unknown>;
  const requiredPaginationFields = ['currentPage', 'totalPages', 'totalStudies', 'hasNext', 'hasPrev'];
  for (const field of requiredPaginationFields) {
    if (!(field in pagination)) {
      console.error(`❌ VALIDATION: Pagination missing field: ${field}`);
      return false;
    }
  }
  
  console.log('✅ Frontend studies response validation passed');
  return true;
}