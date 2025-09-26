import { 
  InputValidator, 
  SecurityCrypto, 
  AuthenticationHelper, 
  ThreatDetector, 
  SecurityReporter, 
  SecurityIntegration 
} from './SecurityUtils';

import { getSecurityManager } from './SecurityManager';

/**
 * Security Module Index - Centralized exports for ResearchHub security system
 * Based on Vibe-Coder-MCP architectural patterns
 */

// Core Security Manager
export {
  SecurityManager,
  getSecurityManager,
  SecurityUtils,
  type SecurityEvent,
  type SecurityEventType,
  type SecuritySeverity,
  type SecurityRule,
  type SecurityRuleType,
  type SecurityCondition,
  type SecurityAction,
  type SecurityPolicy,
  type UserSecurityContext,
  type SecurityConfiguration,
  type PasswordPolicy,
  type RateLimit,
  type SecurityMetrics,
  type SecurityAlert
} from './SecurityManager';

// React Security Hooks
export {
  useAuthentication,
  useAuthorization,
  useSecurityEvents,
  useInputValidation,
  useSession,
  useTrustScore,
  useSecurityAlerts,
  useResearchHubSecurity
} from './SecurityHooks';

// Security Utilities
export {
  InputValidator,
  SecurityCrypto,
  AuthenticationHelper,
  ThreatDetector,
  SecurityReporter,
  SecurityIntegration,
  type ValidationRule,
  type ValidationResult,
  type EncryptionResult,
  type SecurityScore
} from './SecurityUtils';

// Import for Security helper object
/**
 * Quick access to commonly used security functions
 */
export const Security = {
  // Manager
  getManager: getSecurityManager,
  
  // Input Validation
  validateInput: InputValidator.validate,
  validateEmail: InputValidator.validateEmail,
  validatePassword: InputValidator.validatePassword,
  validateStudyTitle: InputValidator.validateStudyTitle,
  sanitizeHtml: InputValidator.sanitizeHtml,
  
  // Crypto
  generateSecureId: SecurityCrypto.generateSecureId,
  hashPassword: SecurityCrypto.hashPassword,
  verifyPassword: SecurityCrypto.verifyPassword,
  generateToken: SecurityCrypto.generateToken,
  verifyToken: SecurityCrypto.verifyToken,
  
  // Authentication
  generateSessionToken: AuthenticationHelper.generateSessionToken,
  validateSessionToken: AuthenticationHelper.validateSessionToken,
  
  // Threat Detection
  analyzeRequest: ThreatDetector.analyzeRequest,
  analyzeBehavior: ThreatDetector.analyzeBehavior,
  
  // Reporting
  generateReport: SecurityReporter.generateSecurityReport,
  
  // Integration
  initialize: SecurityIntegration.initializeResearchHubSecurity,
  createMiddleware: SecurityIntegration.createSecurityMiddleware
};

/**
 * Security constants for ResearchHub
 */
export const SECURITY_CONSTANTS = {
  // Session settings
  DEFAULT_SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 3,
  
  // Password policy
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_MAX_AGE: 90 * 24 * 60 * 60 * 1000, // 90 days
  
  // Rate limiting
  LOGIN_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3
  },
  API_RATE_LIMIT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  },
  
  // Trust scores
  TRUST_THRESHOLDS: {
    EXCELLENT: 0.9,
    GOOD: 0.7,
    MODERATE: 0.5,
    LOW: 0.3,
    CRITICAL: 0.1
  },
  
  // Event severities
  SEVERITY_LEVELS: {
    LOW: 'low' as const,
    MEDIUM: 'medium' as const,
    HIGH: 'high' as const,
    CRITICAL: 'critical' as const
  }
};

/**
 * ResearchHub-specific security configurations
 */
export const RESEARCH_HUB_SECURITY_CONFIG = {
  // Role-based permissions
  ROLE_PERMISSIONS: {
    admin: ['*'],
    researcher: [
      'studies:create',
      'studies:read',
      'studies:update',
      'studies:delete',
      'applications:read',
      'applications:approve',
      'applications:reject',
      'templates:create',
      'templates:read'
    ],
    participant: [
      'studies:read',
      'applications:create',
      'applications:read',
      'sessions:create',
      'sessions:update'
    ]
  },
  
  // Sensitive actions requiring higher trust scores
  SENSITIVE_ACTIONS: [
    'studies:delete',
    'applications:approve',
    'applications:reject',
    'admin:*',
    'users:delete',
    'data:export'
  ],
  
  // Content Security Policy
  CSP_HEADER: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:",
  
  // Allowed origins for CORS
  ALLOWED_ORIGINS: [
    'http://localhost:5175',
    'http://localhost:3003',
    'https://researchhub.vercel.app'
  ]
};
