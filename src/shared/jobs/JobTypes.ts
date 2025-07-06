/**
 * Job Types and Interfaces for ResearchHub
 * Centralized type definitions for the background job system
 */

export * from './JobManager';

// Additional job-specific types for ResearchHub
export interface StudyCreationJobData {
  studyTitle: string;
  studyType: string;
  blocks: unknown[];
  templateId?: string;
  collaborators?: string[];
  settings: Record<string, unknown>;
}

export interface DataExportJobData {
  studyId: string;
  format: 'csv' | 'json' | 'xlsx';
  filters?: Record<string, unknown>;
  includeMetadata: boolean;
}

export interface EmailNotificationJobData {
  recipients: string[];
  template: string;
  variables: Record<string, unknown>;
  priority: 'immediate' | 'batch' | 'scheduled';
}

export interface UserSyncJobData {
  userId: string;
  action: 'create' | 'update' | 'delete' | 'sync';
  userData?: Record<string, unknown>;
}

export interface TemplateGenerationJobData {
  sourceStudyId: string;
  templateName: string;
  description: string;
  category: string;
  isPublic: boolean;
}

export interface BackupJobData {
  scope: 'full' | 'incremental' | 'study' | 'user';
  targetId?: string;
  retentionDays: number;
}

export interface CleanupJobData {
  type: 'expired-sessions' | 'temp-files' | 'old-logs' | 'orphaned-data';
  olderThan: Date;
  dryRun: boolean;
}

// Job creation helpers with type safety
export interface CreateJobOptions<T = unknown> {
  priority?: 'low' | 'normal' | 'high' | 'critical';
  description?: string;
  createdBy: string;
  estimatedDuration?: number;
  metadata: T;
}

export type CreateStudyJobOptions = CreateJobOptions<StudyCreationJobData>;
export type CreateExportJobOptions = CreateJobOptions<DataExportJobData>;
export type CreateEmailJobOptions = CreateJobOptions<EmailNotificationJobData>;
export type CreateUserSyncJobOptions = CreateJobOptions<UserSyncJobData>;
export type CreateTemplateJobOptions = CreateJobOptions<TemplateGenerationJobData>;
export type CreateBackupJobOptions = CreateJobOptions<BackupJobData>;
export type CreateCleanupJobOptions = CreateJobOptions<CleanupJobData>;
