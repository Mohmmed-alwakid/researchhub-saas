/**
 * Centralized Error Types for ResearchHub
 * Based on Vibe-Coder-MCP architectural patterns
 */

export enum ErrorCategory {
  // Core business logic errors
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  
  // System and infrastructure errors
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  API = 'API',
  
  // User experience errors
  UI = 'UI',
  FORM = 'FORM',
  NAVIGATION = 'NAVIGATION',
  
  // Study-specific errors
  STUDY_CREATION = 'STUDY_CREATION',
  BLOCK_RENDERING = 'BLOCK_RENDERING',
  PARTICIPANT_SESSION = 'PARTICIPANT_SESSION',
  
  // External integrations
  SUPABASE = 'SUPABASE',
  PAYMENT = 'PAYMENT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  
  // System errors
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',           // Minor issues, doesn't affect core functionality
  MEDIUM = 'MEDIUM',     // Important issues, some functionality affected
  HIGH = 'HIGH',         // Critical issues, major functionality broken
  CRITICAL = 'CRITICAL'  // System-breaking issues, requires immediate attention
}

export interface ErrorContext {
  userId?: string;
  studyId?: string;
  blockId?: string;
  sessionId?: string;
  userRole?: string;
  url?: string;
  userAgent?: string;
  timestamp?: Date;
  additionalData?: Record<string, unknown>;
}

export interface ErrorMetadata {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  context?: ErrorContext;
  recoverable: boolean;
  retryable: boolean;
  userMessage?: string;
  technicalMessage?: string;
}

export class ResearchHubError extends Error {
  public readonly metadata: ErrorMetadata;
  public readonly originalError?: Error;
  public readonly stackTrace: string;
  public readonly errorId: string;

  constructor(
    message: string,
    metadata: ErrorMetadata,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ResearchHubError';
    this.metadata = metadata;
    this.originalError = originalError;
    this.stackTrace = this.stack || new Error().stack || '';
    this.errorId = this.generateErrorId();
    
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ResearchHubError.prototype);
  }

  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ERR_${timestamp}_${random}`.toUpperCase();
  }

  toJSON() {
    return {
      errorId: this.errorId,
      message: this.message,
      metadata: this.metadata,
      stackTrace: this.stackTrace,
      originalError: this.originalError?.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Predefined error codes for common scenarios
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  
  // Study creation errors
  STUDY_INVALID_BLOCK_TYPE: 'STUDY_001',
  STUDY_MISSING_REQUIRED_FIELDS: 'STUDY_002',
  STUDY_TEMPLATE_NOT_FOUND: 'STUDY_003',
  
  // Database errors
  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',
  DB_CONSTRAINT_VIOLATION: 'DB_003',
  
  // API errors
  API_INVALID_REQUEST: 'API_001',
  API_RATE_LIMIT_EXCEEDED: 'API_002',
  API_SERVICE_UNAVAILABLE: 'API_003',
  
  // UI errors
  UI_COMPONENT_RENDER_FAILED: 'UI_001',
  UI_FORM_VALIDATION_FAILED: 'UI_002',
  UI_NAVIGATION_FAILED: 'UI_003',
  
  // File upload errors
  FILE_SIZE_EXCEEDED: 'FILE_001',
  FILE_TYPE_NOT_SUPPORTED: 'FILE_002',
  FILE_UPLOAD_FAILED: 'FILE_003',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_001',
  CONFIGURATION_ERROR: 'CONFIG_001'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
