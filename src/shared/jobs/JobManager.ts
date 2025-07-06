/**
 * Background Job Management System for ResearchHub
 * Handles asynchronous operations like study creation, data processing, notifications
 * Based on Vibe-Coder-MCP architectural patterns
 */

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'critical';
export type JobType = 
  | 'study-creation'
  | 'study-analysis' 
  | 'data-export'
  | 'email-notification'
  | 'template-generation'
  | 'user-sync'
  | 'cleanup'
  | 'backup';

export interface JobMetadata {
  studyId?: string;
  userId?: string;
  templateId?: string;
  participants?: number;
  estimatedDuration?: number;
  retryCount?: number;
  maxRetries?: number;
  dependencies?: string[];
  [key: string]: unknown;
}

export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
  warnings?: string[];
  metrics?: {
    duration: number;
    memoryUsed?: number;
    itemsProcessed?: number;
  };
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  title: string;
  description?: string;
  progress: number; // 0-100
  metadata: JobMetadata;
  result?: JobResult;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  createdBy: string;
  logs: JobLog[];
}

export interface JobLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface JobQueueConfig {
  maxConcurrentJobs: number;
  maxRetries: number;
  retryDelay: number; // milliseconds
  jobTimeout: number; // milliseconds
  cleanupInterval: number; // milliseconds
  persistJobs: boolean;
  enableMetrics: boolean;
}

export interface JobHandler {
  type: JobType;
  handler: (job: Job) => Promise<JobResult>;
  validate?: (metadata: JobMetadata) => boolean;
  estimateDuration?: (metadata: JobMetadata) => number;
}

export class JobManager {
  private jobs: Map<string, Job> = new Map();
  private queue: Job[] = [];
  private running: Map<string, Job> = new Map();
  private handlers: Map<JobType, JobHandler> = new Map();
  private config: JobQueueConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(config: Partial<JobQueueConfig> = {}) {
    this.config = {
      maxConcurrentJobs: 3,
      maxRetries: 3,
      retryDelay: 5000,
      jobTimeout: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      persistJobs: true,
      enableMetrics: true,
      ...config
    };

    this.initialize();
  }

  private initialize(): void {
    // Start cleanup timer
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    // Register default handlers
    this.registerDefaultHandlers();

    // Start processing queue
    this.processQueue();
  }

  /**
   * Register a job handler for a specific job type
   */
  public registerHandler(handler: JobHandler): void {
    this.handlers.set(handler.type, handler);
  }

  /**
   * Create and queue a new job
   */
  public async createJob(
    type: JobType,
    title: string,
    metadata: JobMetadata,
    options: {
      priority?: JobPriority;
      description?: string;
      createdBy: string;
      estimatedDuration?: number;
    }
  ): Promise<string> {
    const id = this.generateJobId();
    const now = new Date();

    // Validate job metadata
    const handler = this.handlers.get(type);
    if (handler?.validate && !handler.validate(metadata)) {
      throw new Error(`Invalid job metadata for type: ${type}`);
    }

    // Estimate duration if handler provides it
    let estimatedDuration = options.estimatedDuration;
    if (!estimatedDuration && handler?.estimateDuration) {
      estimatedDuration = handler.estimateDuration(metadata);
    }

    const job: Job = {
      id,
      type,
      status: 'pending',
      priority: options.priority || 'normal',
      title,
      description: options.description,
      progress: 0,
      metadata: {
        ...metadata,
        maxRetries: this.config.maxRetries,
        retryCount: 0
      },
      createdAt: now,
      estimatedCompletion: estimatedDuration ? 
        new Date(now.getTime() + estimatedDuration) : undefined,
      createdBy: options.createdBy,
      logs: []
    };

    this.jobs.set(id, job);
    this.addToQueue(job);
    this.logJobEvent(job, 'info', `Job created: ${title}`);

    // Trigger queue processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Get job status and details
   */
  public getJob(id: string): Job | null {
    return this.jobs.get(id) || null;
  }

  /**
   * Get all jobs with optional filtering
   */
  public getJobs(filter?: {
    status?: JobStatus;
    type?: JobType;
    userId?: string;
    limit?: number;
  }): Job[] {
    let jobs = Array.from(this.jobs.values());

    if (filter) {
      if (filter.status) {
        jobs = jobs.filter(job => job.status === filter.status);
      }
      if (filter.type) {
        jobs = jobs.filter(job => job.type === filter.type);
      }
      if (filter.userId) {
        jobs = jobs.filter(job => job.createdBy === filter.userId);
      }
      if (filter.limit) {
        jobs = jobs.slice(0, filter.limit);
      }
    }

    return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Cancel a pending or running job
   */
  public async cancelJob(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === 'pending') {
      job.status = 'cancelled';
      this.removeFromQueue(id);
      this.logJobEvent(job, 'info', 'Job cancelled while pending');
      return true;
    }

    if (job.status === 'running') {
      job.status = 'cancelled';
      this.running.delete(id);
      this.logJobEvent(job, 'info', 'Job cancelled while running');
      return true;
    }

    return false;
  }

  /**
   * Update job progress (called by job handlers)
   */
  public updateProgress(id: string, progress: number, message?: string): void {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'running') return;

    job.progress = Math.min(100, Math.max(0, progress));
    
    if (message) {
      this.logJobEvent(job, 'info', message, { progress });
    }

    // Trigger progress update event (for real-time notifications)
    this.emitJobProgress(job);
  }

  /**
   * Get queue statistics
   */
  public getQueueStats() {
    const pending = this.queue.length;
    const running = this.running.size;
    const completed = Array.from(this.jobs.values())
      .filter(job => job.status === 'completed').length;
    const failed = Array.from(this.jobs.values())
      .filter(job => job.status === 'failed').length;

    return {
      pending,
      running,
      completed,
      failed,
      total: this.jobs.size,
      maxConcurrent: this.config.maxConcurrentJobs
    };
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0 && this.running.size < this.config.maxConcurrentJobs) {
        const job = this.queue.shift();
        if (!job) break;

        // Start job
        await this.startJob(job);
      }
    } finally {
      this.isProcessing = false;
    }

    // Schedule next processing if queue has items
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  private async startJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      this.failJob(job, `No handler registered for job type: ${job.type}`);
      return;
    }

    job.status = 'running';
    job.startedAt = new Date();
    this.running.set(job.id, job);
    this.logJobEvent(job, 'info', 'Job started');

    try {
      // Set timeout for job
      const timeoutPromise = new Promise<JobResult>((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), this.config.jobTimeout);
      });

      const jobPromise = handler.handler(job);
      const result = await Promise.race([jobPromise, timeoutPromise]);

      this.completeJob(job, result);
    } catch (error) {
      this.handleJobError(job, error);
    }
  }

  private completeJob(job: Job, result: JobResult): void {
    job.status = result.success ? 'completed' : 'failed';
    job.completedAt = new Date();
    job.progress = 100;
    job.result = result;
    this.running.delete(job.id);

    const message = result.success ? 
      'Job completed successfully' : 
      `Job failed: ${result.error}`;
    
    this.logJobEvent(job, result.success ? 'info' : 'error', message);
    this.emitJobCompletion(job);

    // Continue processing queue
    this.processQueue();
  }

  private handleJobError(job: Job, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const retryCount = (job.metadata.retryCount || 0) + 1;
    const maxRetries = job.metadata.maxRetries || this.config.maxRetries;

    this.logJobEvent(job, 'error', `Job error: ${errorMessage}`, { retryCount });

    if (retryCount < maxRetries) {
      // Retry job
      job.metadata.retryCount = retryCount;
      job.status = 'pending';
      job.progress = 0;
      this.running.delete(job.id);
      
      // Add back to queue with delay
      setTimeout(() => {
        this.addToQueue(job);
        this.processQueue();
      }, this.config.retryDelay * retryCount);
      
      this.logJobEvent(job, 'info', `Job scheduled for retry ${retryCount}/${maxRetries}`);
    } else {
      // Max retries reached
      this.failJob(job, `Max retries (${maxRetries}) reached. Last error: ${errorMessage}`);
    }
  }

  private failJob(job: Job, error: string): void {
    job.status = 'failed';
    job.completedAt = new Date();
    job.result = {
      success: false,
      error
    };
    this.running.delete(job.id);
    this.logJobEvent(job, 'error', `Job failed: ${error}`);
    this.emitJobCompletion(job);

    // Continue processing queue
    this.processQueue();
  }

  private addToQueue(job: Job): void {
    // Insert job in priority order
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const jobPriority = priorityOrder[job.priority];

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorityOrder[this.queue[i].priority];
      if (jobPriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, job);
  }

  private removeFromQueue(id: string): void {
    const index = this.queue.findIndex(job => job.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  private cleanup(): void {
    // Remove old completed/failed jobs
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [id, job] of this.jobs.entries()) {
      if ((job.status === 'completed' || job.status === 'failed') && 
          job.completedAt && job.completedAt < cutoff) {
        this.jobs.delete(id);
      }
    }
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private logJobEvent(
    job: Job, 
    level: JobLog['level'], 
    message: string, 
    metadata?: Record<string, unknown>
  ): void {
    const log: JobLog = {
      timestamp: new Date(),
      level,
      message,
      metadata
    };
    
    job.logs.push(log);
    
    // Keep only last 100 logs per job
    if (job.logs.length > 100) {
      job.logs = job.logs.slice(-100);
    }
  }

  private emitJobProgress(job: Job): void {
    // Emit progress event for real-time notifications
    // This will be connected to SSE system in Task 2.2
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('job-progress', { 
        detail: { 
          jobId: job.id, 
          progress: job.progress,
          status: job.status 
        } 
      }));
    }
  }

  private emitJobCompletion(job: Job): void {
    // Emit completion event for real-time notifications
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('job-completed', { 
        detail: { 
          jobId: job.id, 
          status: job.status,
          result: job.result 
        } 
      }));
    }
  }

  private registerDefaultHandlers(): void {
    // Study creation handler
    this.registerHandler({
      type: 'study-creation',
      handler: async (job) => {
        // Simulate study creation process
        try {
          // Validate study data
          this.updateProgress(job.id, 10, 'Validating study data...');
          await this.delay(500);

          // Create study blocks
          this.updateProgress(job.id, 30, 'Creating study blocks...');
          await this.delay(1000);

          // Generate study configuration
          this.updateProgress(job.id, 60, 'Generating configuration...');
          await this.delay(800);

          // Save to database
          this.updateProgress(job.id, 90, 'Saving to database...');
          await this.delay(500);

          this.updateProgress(job.id, 100, 'Study created successfully');

          return {
            success: true,
            data: {
              studyId: job.metadata.studyId,
              blocks: job.metadata.blocks || 0
            },
            metrics: {
              duration: Date.now() - (job.startedAt?.getTime() || 0),
              itemsProcessed: job.metadata.blocks || 0
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      },
      validate: (metadata) => {
        return !!(metadata.studyData && metadata.userId);
      },
      estimateDuration: (metadata) => {
        const blocks = Number(metadata.blocks) || 1;
        return Math.max(2000, blocks * 500); // 500ms per block, minimum 2 seconds
      }
    });

    // Data export handler
    this.registerHandler({
      type: 'data-export',
      handler: async (job) => {
        try {
          this.updateProgress(job.id, 10, 'Preparing export...');
          await this.delay(300);

          this.updateProgress(job.id, 50, 'Processing data...');
          await this.delay(1500);

          this.updateProgress(job.id, 90, 'Generating file...');
          await this.delay(500);

          return {
            success: true,
            data: {
              exportId: `export_${Date.now()}`,
              fileSize: '2.3MB',
              recordCount: job.metadata.participants || 0
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Export failed'
          };
        }
      }
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Shutdown the job manager
   */
  public shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    // Cancel all running jobs
    for (const job of this.running.values()) {
      this.cancelJob(job.id);
    }
  }
}

// Global job manager instance
export const globalJobManager = new JobManager();

// Convenience functions
export const createJob = (
  type: JobType,
  title: string,
  metadata: JobMetadata,
  options: { priority?: JobPriority; description?: string; createdBy: string }
) => globalJobManager.createJob(type, title, metadata, options);

export const getJob = (id: string) => globalJobManager.getJob(id);
export const getJobs = (filter?: Parameters<typeof globalJobManager.getJobs>[0]) => 
  globalJobManager.getJobs(filter);
export const cancelJob = (id: string) => globalJobManager.cancelJob(id);
export const getQueueStats = () => globalJobManager.getQueueStats();
