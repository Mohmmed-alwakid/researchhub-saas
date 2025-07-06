/**
 * Centralized Logging System for ResearchHub
 * Provides structured logging with different levels and outputs
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  studyId?: string;
  errorId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsoleOutput: boolean;
  enableLocalStorage: boolean;
  enableRemoteLogging: boolean;
  maxLocalEntries: number;
  includeStackTrace: boolean;
  remoteEndpoint?: string;
}

export class Logger {
  private config: LoggerConfig;
  private localLog: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsoleOutput: true,
      enableLocalStorage: true,
      enableRemoteLogging: false,
      maxLocalEntries: 1000,
      includeStackTrace: false,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.loadFromLocalStorage();
  }

  /**
   * Log debug information
   */
  debug(message: string, context?: Record<string, unknown>, category = 'DEBUG'): void {
    this.log(LogLevel.DEBUG, category, message, context);
  }

  /**
   * Log general information
   */
  info(message: string, context?: Record<string, unknown>, category = 'INFO'): void {
    this.log(LogLevel.INFO, category, message, context);
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: Record<string, unknown>, category = 'WARN'): void {
    this.log(LogLevel.WARN, category, message, context);
  }

  /**
   * Log errors
   */
  error(message: string, context?: Record<string, unknown>, category = 'ERROR'): void {
    this.log(LogLevel.ERROR, category, message, context);
  }

  /**
   * Log critical issues
   */
  critical(message: string, context?: Record<string, unknown>, category = 'CRITICAL'): void {
    this.log(LogLevel.CRITICAL, category, message, context);
  }

  /**
   * Log study-related events
   */
  study(message: string, studyId: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, 'STUDY', message, { ...context, studyId });
  }

  /**
   * Log user actions
   */
  userAction(action: string, userId: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, 'USER_ACTION', action, { ...context, userId });
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, 'PERFORMANCE', `${metric}: ${value}ms`, { 
      ...context, 
      metric, 
      value, 
      performanceMetric: true 
    });
  }

  /**
   * Log API calls
   */
  api(method: string, url: string, status: number, duration: number, context?: Record<string, unknown>): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, 'API', `${method} ${url} ${status} (${duration}ms)`, {
      ...context,
      method,
      url,
      status,
      duration,
      apiCall: true
    });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: string,
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (level < this.config.level) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      context: {
        ...context,
        sessionId: this.sessionId,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      }
    };

    // Add stack trace for errors if enabled
    if (this.config.includeStackTrace && level >= LogLevel.ERROR) {
      entry.context!.stackTrace = new Error().stack;
    }

    this.processLogEntry(entry);
  }

  private processLogEntry(entry: LogEntry): void {
    // Console output
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(entry);
    }

    // Store locally
    if (this.config.enableLocalStorage) {
      this.storeLocally(entry);
    }

    // Send to remote service
    if (this.config.enableRemoteLogging) {
      this.sendToRemote(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] ${levelName} [${entry.category}]`;

    const logMethod = this.getConsoleMethod(entry.level);
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      logMethod(`${prefix} ${entry.message}`, entry.context);
    } else {
      logMethod(`${prefix} ${entry.message}`);
    }
  }

  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private storeLocally(entry: LogEntry): void {
    this.localLog.push(entry);

    // Keep log size manageable
    if (this.localLog.length > this.config.maxLocalEntries) {
      this.localLog = this.localLog.slice(-this.config.maxLocalEntries + 100);
    }

    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const recentEntries = this.localLog.slice(-100); // Only save recent entries
        localStorage.setItem('researchhub_logs', JSON.stringify(recentEntries));
      } catch (error) {
        // localStorage might be full or disabled
        console.warn('Failed to save logs to localStorage:', error);
      }
    }
  }

  private loadFromLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('researchhub_logs');
        if (stored) {
          const entries = JSON.parse(stored) as LogEntry[];
          this.localLog = entries.map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
        }
      } catch (error) {
        console.warn('Failed to load logs from localStorage:', error);
      }
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Don't let remote logging failures break the app
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Get logs for debugging and monitoring
   */
  getLogs(filters?: {
    level?: LogLevel;
    category?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.localLog];

    if (filters) {
      if (filters.level !== undefined) {
        filteredLogs = filteredLogs.filter(entry => entry.level >= filters.level!);
      }

      if (filters.category) {
        filteredLogs = filteredLogs.filter(entry => 
          entry.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      if (filters.since) {
        filteredLogs = filteredLogs.filter(entry => entry.timestamp >= filters.since!);
      }

      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs;
  }

  /**
   * Get log statistics
   */
  getStats() {
    const stats = {
      totalEntries: this.localLog.length,
      entriesByLevel: {} as Record<string, number>,
      entriesByCategory: {} as Record<string, number>,
      sessionId: this.sessionId,
      oldestEntry: this.localLog.length > 0 ? this.localLog[0].timestamp : null,
      newestEntry: this.localLog.length > 0 ? this.localLog[this.localLog.length - 1].timestamp : null
    };

    this.localLog.forEach(entry => {
      const levelName = LogLevel[entry.level];
      stats.entriesByLevel[levelName] = (stats.entriesByLevel[levelName] || 0) + 1;
      stats.entriesByCategory[entry.category] = (stats.entriesByCategory[entry.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.localLog = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('researchhub_logs');
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.localLog, null, 2);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global logger instance
export const globalLogger = new Logger({
  level: LogLevel.INFO,
  enableConsoleOutput: true,
  enableLocalStorage: true,
  enableRemoteLogging: false,
  maxLocalEntries: 1000,
  includeStackTrace: true
});

// Convenience functions
export const logDebug = (message: string, context?: Record<string, unknown>, category?: string) => 
  globalLogger.debug(message, context, category);

export const logInfo = (message: string, context?: Record<string, unknown>, category?: string) => 
  globalLogger.info(message, context, category);

export const logWarn = (message: string, context?: Record<string, unknown>, category?: string) => 
  globalLogger.warn(message, context, category);

export const logError = (message: string, context?: Record<string, unknown>, category?: string) => 
  globalLogger.error(message, context, category);

export const logCritical = (message: string, context?: Record<string, unknown>, category?: string) => 
  globalLogger.critical(message, context, category);

export const logStudy = (message: string, studyId: string, context?: Record<string, unknown>) => 
  globalLogger.study(message, studyId, context);

export const logUserAction = (action: string, userId: string, context?: Record<string, unknown>) => 
  globalLogger.userAction(action, userId, context);

export const logPerformance = (metric: string, value: number, context?: Record<string, unknown>) => 
  globalLogger.performance(metric, value, context);

export const logApi = (method: string, url: string, status: number, duration: number, context?: Record<string, unknown>) => 
  globalLogger.api(method, url, status, duration, context);
