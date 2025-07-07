/**
 * SecurityManager - Comprehensive security management system for ResearchHub
 * Based on Vibe-Coder-MCP architectural patterns
 * 
 * Provides centralized security management including:
 * - Authentication and authorization
 * - Input validation and sanitization
 * - Security event monitoring
 * - Threat detection and prevention
 * - Role-based access control
 * - Session management
 */

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  userId?: string;
  details: Record<string, any>;
  metadata?: Record<string, any>;
  resolved?: boolean;
  actions?: string[];
}

export type SecurityEventType = 
  | 'authentication_failure'
  | 'authorization_denied'
  | 'suspicious_activity'
  | 'data_breach_attempt'
  | 'xss_attempt'
  | 'csrf_attempt'
  | 'sql_injection_attempt'
  | 'rate_limit_exceeded'
  | 'invalid_input'
  | 'session_hijack_attempt'
  | 'privilege_escalation'
  | 'data_export_violation';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityRule {
  id: string;
  name: string;
  type: SecurityRuleType;
  condition: SecurityCondition;
  action: SecurityAction;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export type SecurityRuleType = 
  | 'authentication'
  | 'authorization'
  | 'input_validation'
  | 'rate_limiting'
  | 'content_security'
  | 'session_security';

export interface SecurityCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
  metadata?: Record<string, any>;
}

export interface SecurityAction {
  type: 'block' | 'warn' | 'log' | 'redirect' | 'throttle';
  parameters?: Record<string, any>;
  notification?: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enforced: boolean;
  created: Date;
  updated: Date;
}

export interface UserSecurityContext {
  userId: string;
  role: string;
  permissions: string[];
  sessionId: string;
  lastActivity: Date;
  securityLevel: 'basic' | 'enhanced' | 'strict';
  trustScore: number;
  flags: string[];
}

export interface SecurityConfiguration {
  policies: SecurityPolicy[];
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: PasswordPolicy;
  encryptionKey?: string;
  csrfProtection: boolean;
  contentSecurityPolicy: string;
  allowedOrigins: string[];
  rateLimits: RateLimit[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  maxAge: number;
}

export interface RateLimit {
  endpoint: string;
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  message?: string;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsBySeverity: Record<SecuritySeverity, number>;
  eventsByType: Record<SecurityEventType, number>;
  blockedRequests: number;
  successfulAuthentications: number;
  failedAuthentications: number;
  activeSessions: number;
  threatLevel: SecuritySeverity;
  lastThreatDetected?: Date;
}

export interface SecurityAlert {
  id: string;
  type: 'threat_detected' | 'policy_violation' | 'system_compromise' | 'anomaly_detected';
  severity: SecuritySeverity;
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  actions: string[];
}

/**
 * SecurityManager - Central security management system
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private events: SecurityEvent[] = [];
  private alerts: SecurityAlert[] = [];
  private userContexts: Map<string, UserSecurityContext> = new Map();
  private configuration: SecurityConfiguration;
  private eventListeners: Map<string, ((event: SecurityEvent) => void)[]> = new Map();

  constructor(configuration?: Partial<SecurityConfiguration>) {
    this.configuration = {
      policies: [],
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        preventReuse: 5,
        maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
      },
      csrfProtection: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      allowedOrigins: ['http://localhost:5175', 'http://localhost:3003'],
      rateLimits: [
        { endpoint: '/api/auth/login', windowMs: 15 * 60 * 1000, maxRequests: 5 },
        { endpoint: '/api/studies', windowMs: 60 * 1000, maxRequests: 100 },
        { endpoint: '/api/applications', windowMs: 60 * 1000, maxRequests: 50 }
      ],
      ...configuration
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(configuration?: Partial<SecurityConfiguration>): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager(configuration);
    }
    return SecurityManager.instance;
  }

  /**
   * Record a security event
   */
  public recordEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    details: Record<string, unknown>,
    userId?: string,
    metadata?: Record<string, unknown>
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      timestamp: new Date(),
      userId,
      details,
      metadata,
      resolved: false,
      actions: []
    };

    this.events.push(event);

    // Trigger event listeners
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Security event listener error:', error);
      }
    });

    // Check for threat escalation
    this.checkThreatEscalation(event);

    // Auto-resolve low severity events after some time
    if (severity === 'low') {
      setTimeout(() => {
        this.resolveEvent(event.id);
      }, 5 * 60 * 1000); // 5 minutes
    }

    return event;
  }

  /**
   * Validate user input for security threats
   */
  public validateInput(input: string, context: string = 'general'): {
    isValid: boolean;
    threats: string[];
    sanitized: string;
  } {
    const threats: string[] = [];
    let sanitized = input;

    // XSS Detection
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        threats.push('XSS attempt detected');
        this.recordEvent('xss_attempt', 'high', { input, context });
      }
    }

    // SQL Injection Detection
    const sqlPatterns = [
      /('|(\\'))|(--;)|(\s|^)(union|select|insert|delete|update|create|drop|exec|execute)\s/gi,
      /\b(union|select|insert|delete|update|create|drop)\b.*\b(from|into|where|values)\b/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        threats.push('SQL injection attempt detected');
        this.recordEvent('sql_injection_attempt', 'critical', { input, context });
      }
    }

    // Basic sanitization
    sanitized = input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Additional context-specific validation
    if (context === 'study_title') {
      // Study titles should not contain certain characters
      if (/[<>{}[\]\\`]/.test(input)) {
        threats.push('Invalid characters in study title');
      }
    }

    return {
      isValid: threats.length === 0,
      threats,
      sanitized
    };
  }

  /**
   * Validate user authentication
   */
  public validateAuthentication(_token: string, userId: string): {
    isValid: boolean;
    context?: UserSecurityContext;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if user context exists
    const context = this.userContexts.get(userId);
    if (!context) {
      errors.push('User context not found');
      this.recordEvent('authentication_failure', 'medium', { userId, reason: 'no_context' });
      return { isValid: false, errors };
    }

    // Check session timeout
    const now = new Date();
    const timeSinceActivity = now.getTime() - context.lastActivity.getTime();
    if (timeSinceActivity > this.configuration.sessionTimeout) {
      errors.push('Session expired');
      this.recordEvent('authentication_failure', 'low', { userId, reason: 'session_expired' });
      this.invalidateUserSession(userId);
      return { isValid: false, errors };
    }

    // Update last activity
    context.lastActivity = now;
    this.userContexts.set(userId, context);

    return { isValid: true, context, errors };
  }

  /**
   * Check user authorization for specific actions
   */
  public checkAuthorization(
    userId: string,
    action: string,
    resource?: string,
    _resourceData?: Record<string, unknown>
  ): {
    authorized: boolean;
    reason?: string;
  } {
    const context = this.userContexts.get(userId);
    if (!context) {
      this.recordEvent('authorization_denied', 'medium', { userId, action, reason: 'no_context' });
      return { authorized: false, reason: 'User context not found' };
    }

    // Check role-based permissions
    const hasPermission = this.checkRolePermissions(context.role, action, resource);
    if (!hasPermission) {
      this.recordEvent('authorization_denied', 'medium', { 
        userId, 
        action, 
        resource, 
        role: context.role,
        reason: 'insufficient_permissions' 
      });
      return { authorized: false, reason: 'Insufficient permissions' };
    }

    // Check trust score for sensitive actions
    if (this.isSensitiveAction(action) && context.trustScore < 0.7) {
      this.recordEvent('authorization_denied', 'high', { 
        userId, 
        action, 
        resource,
        trustScore: context.trustScore,
        reason: 'low_trust_score' 
      });
      return { authorized: false, reason: 'Trust score too low for sensitive action' };
    }

    return { authorized: true };
  }

  /**
   * Create user security context
   */
  public createUserContext(
    userId: string,
    role: string,
    permissions: string[],
    sessionId: string,
    securityLevel: 'basic' | 'enhanced' | 'strict' = 'basic'
  ): UserSecurityContext {
    const context: UserSecurityContext = {
      userId,
      role,
      permissions,
      sessionId,
      lastActivity: new Date(),
      securityLevel,
      trustScore: 1.0,
      flags: []
    };

    this.userContexts.set(userId, context);
    return context;
  }

  /**
   * Update user trust score
   */
  public updateTrustScore(userId: string, delta: number, reason: string): void {
    const context = this.userContexts.get(userId);
    if (!context) return;

    const oldScore = context.trustScore;
    context.trustScore = Math.max(0, Math.min(1, context.trustScore + delta));

    if (context.trustScore < oldScore) {
      this.recordEvent('suspicious_activity', 'medium', {
        userId,
        oldScore,
        newScore: context.trustScore,
        delta,
        reason
      });
    }

    this.userContexts.set(userId, context);
  }

  /**
   * Get security metrics
   */
  public getMetrics(): SecurityMetrics {
    const now = new Date();
    const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => e.timestamp.getTime() > last24Hours);

    const eventsBySeverity = recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<SecuritySeverity, number>);

    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<SecurityEventType, number>);

    // Determine threat level
    let threatLevel: SecuritySeverity = 'low';
    if (eventsBySeverity.critical > 0) threatLevel = 'critical';
    else if (eventsBySeverity.high > 5) threatLevel = 'high';
    else if (eventsBySeverity.medium > 10) threatLevel = 'medium';

    return {
      totalEvents: recentEvents.length,
      eventsBySeverity: {
        low: eventsBySeverity.low || 0,
        medium: eventsBySeverity.medium || 0,
        high: eventsBySeverity.high || 0,
        critical: eventsBySeverity.critical || 0
      },
      eventsByType: eventsByType as Record<SecurityEventType, number>,
      blockedRequests: recentEvents.filter(e => e.details.blocked).length,
      successfulAuthentications: recentEvents.filter(e => e.type === 'authentication_failure').length,
      failedAuthentications: recentEvents.filter(e => e.type === 'authentication_failure').length,
      activeSessions: this.userContexts.size,
      threatLevel,
      lastThreatDetected: recentEvents.find(e => e.severity === 'high' || e.severity === 'critical')?.timestamp
    };
  }

  /**
   * Add event listener
   */
  public addEventListener(eventType: SecurityEventType, listener: (event: SecurityEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(eventType: SecurityEventType, listener: (event: SecurityEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Resolve security event
   */
  public resolveEvent(eventId: string, resolution?: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      if (resolution) {
        event.actions = event.actions || [];
        event.actions.push(resolution);
      }
      return true;
    }
    return false;
  }

  /**
   * Invalidate user session
   */
  public invalidateUserSession(userId: string): void {
    this.userContexts.delete(userId);
    this.recordEvent('suspicious_activity', 'low', {
      userId,
      action: 'session_invalidated',
      reason: 'security_precaution'
    });
  }

  /**
   * Export security events for analysis
   */
  public exportEvents(format: 'json' | 'csv' = 'json', filters?: {
    severity?: SecuritySeverity[];
    types?: SecurityEventType[];
    dateRange?: { start: Date; end: Date };
  }): string {
    let events = [...this.events];

    // Apply filters
    if (filters) {
      if (filters.severity) {
        events = events.filter(e => filters.severity!.includes(e.severity));
      }
      if (filters.types) {
        events = events.filter(e => filters.types!.includes(e.type));
      }
      if (filters.dateRange) {
        events = events.filter(e => 
          e.timestamp >= filters.dateRange!.start && 
          e.timestamp <= filters.dateRange!.end
        );
      }
    }

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      // CSV format
      const headers = ['ID', 'Type', 'Severity', 'Timestamp', 'User ID', 'Details', 'Resolved'];
      const rows = events.map(e => [
        e.id,
        e.type,
        e.severity,
        e.timestamp.toISOString(),
        e.userId || '',
        JSON.stringify(e.details),
        e.resolved ? 'Yes' : 'No'
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  // Private helper methods

  private checkRolePermissions(role: string, action: string, resource?: string): boolean {
    // ResearchHub-specific role permissions
    const rolePermissions: Record<string, string[]> = {
      'admin': ['*'], // Admin has all permissions
      'researcher': [
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
      'participant': [
        'studies:read',
        'applications:create',
        'applications:read',
        'sessions:create',
        'sessions:update'
      ]
    };

    const permissions = rolePermissions[role] || [];
    
    // Check for wildcard permission
    if (permissions.includes('*')) {
      return true;
    }

    // Check for exact permission match
    if (permissions.includes(action)) {
      return true;
    }

    // Check for resource-specific permissions
    if (resource && permissions.includes(`${action}:${resource}`)) {
      return true;
    }

    return false;
  }

  private isSensitiveAction(action: string): boolean {
    const sensitiveActions = [
      'studies:delete',
      'applications:approve',
      'applications:reject',
      'admin:*',
      'users:delete',
      'data:export'
    ];

    return sensitiveActions.some(sensitive => 
      action === sensitive || action.startsWith(sensitive.replace('*', ''))
    );
  }

  private checkThreatEscalation(event: SecurityEvent): void {
    // Check for multiple similar events in short time period
    const recentSimilarEvents = this.events.filter(e => 
      e.type === event.type &&
      e.userId === event.userId &&
      e.timestamp.getTime() > (Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );

    if (recentSimilarEvents.length >= 3) {
      this.createAlert({
        type: 'threat_detected',
        severity: 'high',
        message: `Multiple ${event.type} events detected for user ${event.userId}`,
        details: {
          eventType: event.type,
          userId: event.userId,
          count: recentSimilarEvents.length,
          timeWindow: '5 minutes'
        }
      });
    }
  }

  private createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved' | 'actions'>): SecurityAlert {
    const newAlert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      actions: [],
      ...alert
    };

    this.alerts.push(newAlert);
    return newAlert;
  }
}

/**
 * Get global SecurityManager instance
 */
export function getSecurityManager(configuration?: Partial<SecurityConfiguration>): SecurityManager {
  return SecurityManager.getInstance(configuration);
}

/**
 * Security utilities for common operations
 */
export const SecurityUtils = {
  /**
   * Generate secure random string
   */
  generateSecureId(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Hash password (simple implementation - use proper hashing in production)
   */
  hashPassword(password: string, salt?: string): string {
    // This is a simplified implementation
    // In production, use bcrypt or similar
    const actualSalt = salt || this.generateSecureId(16);
    return btoa(password + actualSalt);
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string, policy: PasswordPolicy): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    } else {
      score += 20;
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (policy.requireUppercase) {
      score += 20;
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (policy.requireLowercase) {
      score += 20;
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (policy.requireNumbers) {
      score += 20;
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (policy.requireSpecialChars) {
      score += 20;
    }

    return {
      isValid: errors.length === 0,
      errors,
      score
    };
  }
};
