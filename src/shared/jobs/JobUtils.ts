/**
 * Job Utilities and Helper Functions for ResearchHub
 * Convenience functions for common job operations
 */

import { 
  globalJobManager, 
  Job, 
  JobType, 
  JobMetadata, 
  JobStatus,
  JobPriority 
} from './JobManager';
import {
  StudyCreationJobData,
  DataExportJobData,
  EmailNotificationJobData,
  CreateStudyJobOptions,
  CreateExportJobOptions,
  CreateEmailJobOptions
} from './JobTypes';

/**
 * Study-specific job creation helpers
 */
export class StudyJobUtils {
  /**
   * Create a study creation job with proper metadata
   */
  static async createStudyCreationJob(
    studyData: StudyCreationJobData,
    options: Omit<CreateStudyJobOptions, 'metadata'>
  ): Promise<string> {
    const metadata: JobMetadata = {
      studyId: `study_${Date.now()}`,
      blocks: studyData.blocks.length,
      templateId: studyData.templateId,
      studyTitle: studyData.studyTitle,
      studyType: studyData.studyType
    };

    return globalJobManager.createJob(
      'study-creation',
      `Creating study: ${studyData.studyTitle}`,
      metadata,
      {
        ...options,
        description: options.description || `Creating study with ${studyData.blocks.length} blocks`,
        estimatedDuration: options.estimatedDuration || (studyData.blocks.length * 500 + 2000)
      }
    );
  }

  /**
   * Create a data export job
   */
  static async createDataExportJob(
    exportData: DataExportJobData,
    options: Omit<CreateExportJobOptions, 'metadata'>
  ): Promise<string> {
    const metadata: JobMetadata = {
      studyId: exportData.studyId,
      exportFormat: exportData.format,
      includeMetadata: exportData.includeMetadata,
      filters: exportData.filters
    };

    return globalJobManager.createJob(
      'data-export',
      `Exporting data for study`,
      metadata,
      {
        ...options,
        description: options.description || `Exporting study data as ${exportData.format}`,
        estimatedDuration: options.estimatedDuration || 5000
      }
    );
  }

  /**
   * Create an email notification job
   */
  static async createEmailJob(
    emailData: EmailNotificationJobData,
    options: Omit<CreateEmailJobOptions, 'metadata'>
  ): Promise<string> {
    const priority: JobPriority = emailData.priority === 'immediate' ? 'high' : 'normal';
    
    const metadata: JobMetadata = {
      recipients: emailData.recipients,
      template: emailData.template,
      variables: emailData.variables,
      emailPriority: emailData.priority
    };
    
    return globalJobManager.createJob(
      'email-notification',
      `Sending email to ${emailData.recipients.length} recipients`,
      metadata,
      {
        ...options,
        priority: options.priority || priority,
        description: options.description || `Email notification using template: ${emailData.template}`,
        estimatedDuration: options.estimatedDuration || (emailData.recipients.length * 100 + 1000)
      }
    );
  }
}

/**
 * Job monitoring and analytics utilities
 */
export class JobAnalytics {
  /**
   * Get job completion statistics
   */
  static getCompletionStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    const jobs = globalJobManager.getJobs();
    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case 'hour':
        cutoff.setHours(now.getHours() - 1);
        break;
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
    }

    const recentJobs = jobs.filter(job => 
      job.completedAt && job.completedAt >= cutoff
    );

    const stats = {
      total: recentJobs.length,
      completed: recentJobs.filter(job => job.status === 'completed').length,
      failed: recentJobs.filter(job => job.status === 'failed').length,
      averageDuration: 0,
      byType: {} as Record<JobType, number>
    };

    if (recentJobs.length > 0) {
      const durations = recentJobs
        .filter(job => job.startedAt && job.completedAt)
        .map(job => job.completedAt!.getTime() - job.startedAt!.getTime());
      
      stats.averageDuration = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0;

      // Count by type
      recentJobs.forEach(job => {
        stats.byType[job.type] = (stats.byType[job.type] || 0) + 1;
      });
    }

    return stats;
  }

  /**
   * Get current system load
   */
  static getSystemLoad() {
    const queueStats = globalJobManager.getQueueStats();
    const loadPercentage = (queueStats.running / queueStats.maxConcurrent) * 100;
    
    return {
      ...queueStats,
      loadPercentage,
      status: loadPercentage < 50 ? 'light' : 
              loadPercentage < 80 ? 'moderate' : 'heavy'
    };
  }

  /**
   * Get job failure analysis
   */
  static getFailureAnalysis(limit = 10) {
    const failedJobs = globalJobManager.getJobs({ status: 'failed', limit });
    
    const analysis = {
      recentFailures: failedJobs.length,
      commonErrors: {} as Record<string, number>,
      failuresByType: {} as Record<JobType, number>,
      retryPatterns: {
        immediateFailures: 0,
        maxRetriesReached: 0
      }
    };

    failedJobs.forEach(job => {
      // Count by type
      analysis.failuresByType[job.type] = (analysis.failuresByType[job.type] || 0) + 1;
      
      // Common errors
      if (job.result?.error) {
        const error = job.result.error;
        analysis.commonErrors[error] = (analysis.commonErrors[error] || 0) + 1;
      }
      
      // Retry patterns
      const retryCount = job.metadata.retryCount || 0;
      if (retryCount === 0) {
        analysis.retryPatterns.immediateFailures++;
      } else if (retryCount >= (job.metadata.maxRetries || 3)) {
        analysis.retryPatterns.maxRetriesReached++;
      }
    });

    return analysis;
  }
}

/**
 * Job queue management utilities
 */
export class JobQueueUtils {
  /**
   * Bulk create jobs from a list
   */
  static async createBulkJobs(
    jobs: Array<{
      type: JobType;
      title: string;
      metadata: JobMetadata;
      priority?: JobPriority;
      createdBy: string;
    }>
  ): Promise<string[]> {
    const jobIds: string[] = [];
    
    for (const jobSpec of jobs) {
      try {
        const id = await globalJobManager.createJob(
          jobSpec.type,
          jobSpec.title,
          jobSpec.metadata,
          {
            priority: jobSpec.priority || 'normal',
            createdBy: jobSpec.createdBy
          }
        );
        jobIds.push(id);
      } catch (error) {
        console.error(`Failed to create job: ${jobSpec.title}`, error);
      }
    }
    
    return jobIds;
  }

  /**
   * Wait for job completion
   */
  static async waitForJob(
    jobId: string, 
    timeout = 30000,
    pollInterval = 1000
  ): Promise<Job | null> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const checkJob = () => {
        const job = globalJobManager.getJob(jobId);
        
        if (!job) {
          resolve(null);
          return;
        }
        
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
          resolve(job);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          resolve(job); // Return current state even if not complete
          return;
        }
        
        setTimeout(checkJob, pollInterval);
      };
      
      checkJob();
    });
  }

  /**
   * Get jobs by user with pagination
   */
  static getUserJobs(
    userId: string,
    options: {
      status?: JobStatus;
      type?: JobType;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20, ...filters } = options;
    const allJobs = globalJobManager.getJobs({ ...filters, userId });
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const jobs = allJobs.slice(startIndex, endIndex);
    
    return {
      jobs,
      pagination: {
        page,
        limit,
        total: allJobs.length,
        totalPages: Math.ceil(allJobs.length / limit),
        hasNext: endIndex < allJobs.length,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Cancel all jobs for a user
   */
  static async cancelUserJobs(userId: string): Promise<number> {
    const jobs = globalJobManager.getJobs({ userId });
    let cancelledCount = 0;
    
    for (const job of jobs) {
      if (job.status === 'pending' || job.status === 'running') {
        const cancelled = await globalJobManager.cancelJob(job.id);
        if (cancelled) cancelledCount++;
      }
    }
    
    return cancelledCount;
  }
}

/**
 * Development and debugging utilities
 */
export class JobDebugUtils {
  /**
   * Create test jobs for development
   */
  static async createTestJobs(count = 5, createdBy = 'test-user'): Promise<string[]> {
    const testJobs = [];
    
    for (let i = 0; i < count; i++) {
      testJobs.push({
        type: 'study-creation' as JobType,
        title: `Test Study ${i + 1}`,
        metadata: {
          studyId: `test-study-${i + 1}`,
          blocks: Math.floor(Math.random() * 10) + 1,
          userId: createdBy
        },
        priority: (['low', 'normal', 'high'] as JobPriority[])[Math.floor(Math.random() * 3)],
        createdBy
      });
    }
    
    return JobQueueUtils.createBulkJobs(testJobs);
  }

  /**
   * Get detailed job information for debugging
   */
  static getJobDebugInfo(jobId: string) {
    const job = globalJobManager.getJob(jobId);
    if (!job) return null;
    
    return {
      ...job,
      debugInfo: {
        queuePosition: globalJobManager.getJobs({ status: 'pending' })
          .findIndex(j => j.id === jobId),
        systemLoad: JobAnalytics.getSystemLoad(),
        estimatedStart: job.status === 'pending' ? 
          this.estimateStartTime(jobId) : null
      }
    };
  }

  /**
   * Estimate when a pending job will start
   */
  private static estimateStartTime(jobId: string): Date | null {
    const job = globalJobManager.getJob(jobId);
    if (!job || job.status !== 'pending') return null;
    
    const queueStats = globalJobManager.getQueueStats();
    const pendingJobs = globalJobManager.getJobs({ status: 'pending' });
    const jobPosition = pendingJobs.findIndex(j => j.id === jobId);
    
    if (jobPosition === -1) return null;
    
    // Estimate based on average job duration and queue position
    const averageJobTime = 5000; // 5 seconds default
    const availableSlots = queueStats.maxConcurrent - queueStats.running;
    const estimatedWaitTime = Math.max(0, (jobPosition - availableSlots + 1)) * averageJobTime;
    
    return new Date(Date.now() + estimatedWaitTime);
  }
}

// Export convenience functions
export const createStudyJob = StudyJobUtils.createStudyCreationJob;
export const createExportJob = StudyJobUtils.createDataExportJob;
export const createEmailJob = StudyJobUtils.createEmailJob;
export const getJobStats = JobAnalytics.getCompletionStats;
export const getSystemLoad = JobAnalytics.getSystemLoad;
export const waitForJob = JobQueueUtils.waitForJob;
export const createTestJobs = JobDebugUtils.createTestJobs;
