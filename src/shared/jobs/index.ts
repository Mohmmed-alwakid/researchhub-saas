/**
 * Jobs Module Index
 * Centralized exports for the background job management system
 */

export * from './JobManager';
export * from './JobTypes';
export * from './JobUtils';

// Re-export main classes and utilities
export { 
  JobManager, 
  globalJobManager 
} from './JobManager';

export { 
  StudyJobUtils, 
  JobAnalytics, 
  JobQueueUtils, 
  JobDebugUtils 
} from './JobUtils';

// Convenience exports for common operations
export {
  createStudyJob,
  createExportJob,
  createEmailJob,
  getJobStats,
  getSystemLoad,
  waitForJob,
  createTestJobs
} from './JobUtils';

// Default job manager configuration
export const DEFAULT_JOB_CONFIG = {
  maxConcurrentJobs: 3,
  maxRetries: 3,
  retryDelay: 5000,
  jobTimeout: 300000,
  cleanupInterval: 60000,
  persistJobs: true,
  enableMetrics: true
};

// Job system initialization
export function initializeJobSystem(config?: Partial<typeof DEFAULT_JOB_CONFIG>) {
  // Job system is automatically initialized via globalJobManager
  // This function is provided for explicit configuration if needed
  console.log('Job system initialized', { 
    config: { ...DEFAULT_JOB_CONFIG, ...config } 
  });
}
