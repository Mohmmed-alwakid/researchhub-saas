/**
 * Professional logging utility for Afkar
 * Provides structured logging with different levels and environments
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Type-safe context interface
export interface LogContext {
  userId?: string;
  sessionId?: string;
  action?: string;
  component?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private currentLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: context?.userId,
      sessionId: context?.sessionId
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const levelName = LogLevel[entry.level];
    const prefix = `[${entry.timestamp}] ${levelName}`;
    
    if (this.isDevelopment) {
      // Enhanced console output for development
      const style = this.getConsoleStyle(entry.level);
      console.log(`%c${prefix}`, style, entry.message, entry.context || '');
    } else {
      // Structured logging for production (could be sent to external service)
      console.log(JSON.stringify(entry));
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'color: #ef4444; font-weight: bold;';
      case LogLevel.WARN:
        return 'color: #f59e0b; font-weight: bold;';
      case LogLevel.INFO:
        return 'color: #3b82f6;';
      case LogLevel.DEBUG:
        return 'color: #6b7280;';
      case LogLevel.TRACE:
        return 'color: #9ca3af; font-size: 11px;';
      default:
        return '';
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const entry = this.formatMessage(LogLevel.ERROR, message, context);
    if (error) entry.error = error;
    this.output(entry);
  }

  warn(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.WARN, message, context));
  }

  info(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.DEBUG, message, context));
  }

  trace(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.TRACE, message, context));
  }

  // Specialized logging methods for common scenarios
  security(violation: string, context?: LogContext): void {
    this.error(`SECURITY_VIOLATION: ${violation}`, { 
      type: 'security', 
      ...context 
    });
  }

  performance(metric: string, value: number, context?: LogContext): void {
    this.info(`PERFORMANCE: ${metric}`, { 
      type: 'performance', 
      metric, 
      value, 
      ...context 
    });
  }

  cache(operation: string, context?: LogContext): void {
    this.debug(`CACHE: ${operation}`, { 
      type: 'cache', 
      ...context 
    });
  }

  api(method: string, endpoint: string, status: number, duration?: number): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.output(this.formatMessage(level, `API: ${method} ${endpoint} ${status}`, {
      type: 'api',
      method,
      endpoint,
      status,
      duration
    }));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods
export const log = {
  error: (message: string, context?: LogContext, error?: Error) => 
    logger.error(message, context, error),
  warn: (message: string, context?: LogContext) => 
    logger.warn(message, context),
  info: (message: string, context?: LogContext) => 
    logger.info(message, context),
  debug: (message: string, context?: LogContext) => 
    logger.debug(message, context),
  trace: (message: string, context?: LogContext) => 
    logger.trace(message, context),
  security: (violation: string, context?: LogContext) => 
    logger.security(violation, context),
  performance: (metric: string, value: number, context?: LogContext) => 
    logger.performance(metric, value, context),
  cache: (operation: string, context?: LogContext) => 
    logger.cache(operation, context),
  api: (method: string, endpoint: string, status: number, duration?: number) => 
    logger.api(method, endpoint, status, duration)
};

export default logger;
