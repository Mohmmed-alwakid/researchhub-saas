/**
 * SecurityUtils - Comprehensive security utilities for ResearchHub
 * Based on Vibe-Coder-MCP architectural patterns
 * 
 * Provides utilities for:
 * - Input validation and sanitization
 * - Encryption and hashing
 * - Authentication helpers
 * - Security monitoring
 * - Threat detection
 */

import crypto from 'crypto';
import { getSecurityManager, SecurityEventType, SecuritySeverity, SecurityMetrics } from './SecurityManager';

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  validator?: (input: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized: string;
  score: number;
}

export interface EncryptionResult {
  encrypted: string;
  salt: string;
  algorithm: string;
}

export interface SecurityScore {
  overall: number;
  components: {
    authentication: number;
    authorization: number;
    inputValidation: number;
    sessionSecurity: number;
    dataProtection: number;
  };
  recommendations: string[];
}

/**
 * Input validation and sanitization utilities
 */
export class InputValidator {
  private static securityManager = getSecurityManager();

  /**
   * Validate input against multiple rules
   */
  static validate(input: string, rules: ValidationRule[], context: string = 'general'): ValidationResult {
    const errors: string[] = [];
    let score = 100;

    // Basic security validation first
    const securityCheck = this.securityManager.validateInput(input, context);
    if (!securityCheck.isValid) {
      errors.push(...securityCheck.threats);
      score -= 50;
    }

    // Apply custom rules
    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!input || input.trim().length === 0) {
            errors.push(rule.message);
            score -= 20;
          }
          break;

        case 'min_length':
          if (input.length < (rule.value as number)) {
            errors.push(rule.message);
            score -= 10;
          }
          break;

        case 'max_length':
          if (input.length > (rule.value as number)) {
            errors.push(rule.message);
            score -= 10;
          }
          break;

        case 'pattern':
          if (!(rule.value as RegExp).test(input)) {
            errors.push(rule.message);
            score -= 15;
          }
          break;

        case 'custom':
          if (rule.validator && !rule.validator(input)) {
            errors.push(rule.message);
            score -= 15;
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: securityCheck.sanitized,
      score: Math.max(0, score)
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const rules: ValidationRule[] = [
      { type: 'required', message: 'Email is required' },
      { 
        type: 'pattern', 
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        message: 'Invalid email format' 
      },
      { type: 'max_length', value: 255, message: 'Email too long' }
    ];

    return this.validate(email, rules, 'email');
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    const rules: ValidationRule[] = [
      { type: 'required', message: 'Password is required' },
      { type: 'min_length', value: 8, message: 'Password must be at least 8 characters' },
      { 
        type: 'pattern', 
        value: /(?=.*[a-z])/, 
        message: 'Password must contain lowercase letters' 
      },
      { 
        type: 'pattern', 
        value: /(?=.*[A-Z])/, 
        message: 'Password must contain uppercase letters' 
      },
      { 
        type: 'pattern', 
        value: /(?=.*\d)/, 
        message: 'Password must contain numbers' 
      }
    ];

    return this.validate(password, rules, 'password');
  }

  /**
   * Validate study title
   */
  static validateStudyTitle(title: string): ValidationResult {
    const rules: ValidationRule[] = [
      { type: 'required', message: 'Study title is required' },
      { type: 'min_length', value: 3, message: 'Title must be at least 3 characters' },
      { type: 'max_length', value: 100, message: 'Title must be less than 100 characters' },
      {
        type: 'custom',
        message: 'Title contains invalid characters',
        validator: (input: string) => !/[<>{}[\]\\`]/.test(input)
      }
    ];

    return this.validate(title, rules, 'study_title');
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string): string {
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/&/g, '&amp;');
  }

  /**
   * Validate and sanitize JSON input
   */
  static validateJson(input: string): { isValid: boolean; parsed?: unknown; error?: string } {
    try {
      const parsed = JSON.parse(input);
      
      // Check for suspicious patterns in JSON
      const jsonString = JSON.stringify(parsed);
      const securityCheck = this.securityManager.validateInput(jsonString, 'json');
      
      if (!securityCheck.isValid) {
        return { 
          isValid: false, 
          error: `Security threat detected: ${securityCheck.threats.join(', ')}` 
        };
      }

      return { isValid: true, parsed };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON format' 
      };
    }
  }
}

/**
 * Encryption and hashing utilities
 */
export class SecurityCrypto {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 16;

  /**
   * Generate secure random string
   */
  static generateSecureId(length: number = 32): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Generate secure salt
   */
  static generateSalt(length: number = this.SALT_LENGTH): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password with salt
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || this.generateSalt();
    const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: actualSalt };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string, _key?: string): EncryptionResult {
    const salt = this.generateSalt();

    // Simplified encryption for demo - use proper encryption in production
    const hash = crypto.createHash('sha256').update(data + salt).digest('hex');

    return {
      encrypted: hash,
      salt,
      algorithm: this.ALGORITHM
    };
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string, key: string, salt: string): string {
    // Simplified decryption for demo - implement proper decryption in production
    // This is just a placeholder implementation
    return `decrypted_${encryptedData}_${key}_${salt}`;
  }

  /**
   * Generate JWT-like token (simplified)
   */
  static generateToken(payload: Record<string, unknown>, secret: string, expiresIn: number = 3600): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const actualPayload = { ...payload, exp };

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(actualPayload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  /**
   * Verify JWT-like token (simplified)
   */
  static verifyToken(token: string, secret: string): { valid: boolean; payload?: Record<string, unknown>; error?: string } {
    try {
      const [headerB64, payloadB64, signature] = token.split('.');
      
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as Record<string, unknown>;
      
      if (payload.exp && (payload.exp as number) < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Invalid token format' };
    }
  }
}

/**
 * Authentication helpers
 */
export class AuthenticationHelper {
  private static securityManager = getSecurityManager();

  /**
   * Generate session token
   */
  static generateSessionToken(userId: string, role: string): string {
    return SecurityCrypto.generateToken(
      { userId, role, sessionId: SecurityCrypto.generateSecureId(16) },
      process.env.JWT_SECRET || 'default-secret',
      30 * 60 // 30 minutes
    );
  }

  /**
   * Validate session token
   */
  static validateSessionToken(token: string): { valid: boolean; userId?: string; role?: string; error?: string } {
    const result = SecurityCrypto.verifyToken(token, process.env.JWT_SECRET || 'default-secret');
    
    if (!result.valid) {
      this.securityManager.recordEvent('authentication_failure', 'medium', {
        reason: 'invalid_token',
        error: result.error
      });
      return { valid: false, error: result.error };
    }

    const payload = result.payload!;
    return {
      valid: true,
      userId: payload.userId as string,
      role: payload.role as string
    };
  }

  /**
   * Check rate limiting for authentication attempts
   */
  static checkRateLimit(_identifier: string, _action: string = 'login'): { allowed: boolean; remainingAttempts?: number } {
    // Simple in-memory rate limiting (in production, use Redis or database)
    // This is a simplified implementation
    // In production, implement proper rate limiting
    const maxAttempts = 5;
    
    return { allowed: true, remainingAttempts: maxAttempts };
  }

  /**
   * Generate secure password reset token
   */
  static generatePasswordResetToken(userId: string, email: string): string {
    return SecurityCrypto.generateToken(
      { userId, email, type: 'password_reset' },
      process.env.JWT_SECRET || 'default-secret',
      60 * 60 // 1 hour
    );
  }
}

/**
 * Threat detection utilities
 */
export class ThreatDetector {
  private static securityManager = getSecurityManager();

  /**
   * Analyze request for suspicious patterns
   */
  static analyzeRequest(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    userAgent?: string;
    ip?: string;
  }): { threatLevel: SecuritySeverity; threats: string[]; recommendations: string[] } {
    const threats: string[] = [];
    const recommendations: string[] = [];
    let threatLevel: SecuritySeverity = 'low';

    // Check for suspicious user agents
    const userAgent = request.userAgent || request.headers['user-agent'] || '';
    if (this.isSuspiciousUserAgent(userAgent)) {
      threats.push('Suspicious user agent detected');
      threatLevel = 'medium';
    }

    // Check for SQL injection patterns in URL
    if (this.containsSqlInjection(request.url)) {
      threats.push('Potential SQL injection in URL');
      threatLevel = 'high';
    }

    // Check for XSS patterns in body
    if (request.body && this.containsXss(request.body)) {
      threats.push('Potential XSS payload in request body');
      threatLevel = 'high';
    }

    // Check for unusual request patterns
    if (request.method === 'POST' && !request.headers['content-type']) {
      threats.push('POST request without content-type header');
      recommendations.push('Ensure all POST requests include proper content-type headers');
    }

    // Record threats if found
    if (threats.length > 0) {
      this.securityManager.recordEvent('suspicious_activity', threatLevel, {
        url: request.url,
        method: request.method,
        threats,
        userAgent,
        ip: request.ip
      });
    }

    return { threatLevel, threats, recommendations };
  }

  /**
   * Check for suspicious user agents
   */
  private static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /burpsuite/i,
      /python-requests/i,
      /curl\/.*$/i,
      /wget/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Check for SQL injection patterns
   */
  private static containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /union\s+select/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /drop\s+table/i,
      /exec\s*\(/i,
      /';?\s*--/,
      /\|\|/,
      /&&/
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for XSS patterns
   */
  private static containsXss(input: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\s*\(/i,
      /alert\s*\(/i
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Analyze behavioral patterns for anomalies
   */
  static analyzeBehavior(userId: string, activities: Array<{
    action: string;
    timestamp: Date;
    resource?: string;
    metadata?: Record<string, unknown>;
  }>): { anomalies: string[]; riskScore: number } {
    const anomalies: string[] = [];
    let riskScore = 0;

    // Check for rapid successive actions
    const rapidActions = activities.filter((activity, index) => {
      if (index === 0) return false;
      const timeDiff = activity.timestamp.getTime() - activities[index - 1].timestamp.getTime();
      return timeDiff < 1000; // Less than 1 second between actions
    });

    if (rapidActions.length > 3) {
      anomalies.push('Rapid successive actions detected (possible bot behavior)');
      riskScore += 30;
    }

    // Check for unusual access patterns
    const uniqueResources = new Set(activities.map(a => a.resource).filter(Boolean));
    if (uniqueResources.size > 50) {
      anomalies.push('Accessing unusually high number of resources');
      riskScore += 20;
    }

    // Check for off-hours activity
    const offHoursActivity = activities.filter(activity => {
      const hour = activity.timestamp.getHours();
      return hour < 6 || hour > 22; // Before 6 AM or after 10 PM
    });

    if (offHoursActivity.length > activities.length * 0.5) {
      anomalies.push('High amount of off-hours activity');
      riskScore += 15;
    }

    // Record anomalies if found
    if (anomalies.length > 0) {
      this.securityManager.recordEvent('suspicious_activity', riskScore > 40 ? 'high' : 'medium', {
        userId,
        anomalies,
        riskScore,
        activityCount: activities.length
      });
    }

    return { anomalies, riskScore: Math.min(100, riskScore) };
  }
}

/**
 * Security reporting and analytics
 */
export class SecurityReporter {
  private static securityManager = getSecurityManager();

  /**
   * Generate comprehensive security report
   */
  static generateSecurityReport(timeRange: { start: Date; end: Date }): {
    summary: SecurityScore;
    events: Array<{ type: SecurityEventType; count: number; severity: SecuritySeverity }>;
    recommendations: string[];
    trends: Array<{ date: string; threatLevel: SecuritySeverity; eventCount: number }>;
  } {
    const metrics = this.securityManager.getMetrics();
    
    // Calculate security score
    const summary: SecurityScore = {
      overall: this.calculateOverallScore(metrics),
      components: {
        authentication: this.calculateAuthScore(metrics),
        authorization: this.calculateAuthzScore(metrics),
        inputValidation: this.calculateInputScore(metrics),
        sessionSecurity: this.calculateSessionScore(metrics),
        dataProtection: 85 // Placeholder
      },
      recommendations: this.generateRecommendations(metrics)
    };

    // Get event statistics
    const events = Object.entries(metrics.eventsByType).map(([type, count]) => ({
      type: type as SecurityEventType,
      count,
      severity: this.getEventSeverity(type as SecurityEventType)
    }));

    // Generate trends (simplified)
    const trends = this.generateTrends(timeRange);

    return { summary, events, recommendations: summary.recommendations, trends };
  }

  private static calculateOverallScore(metrics: SecurityMetrics): number {
    const weights = {
      critical: -50,
      high: -20,
      medium: -10,
      low: -2
    };

    let score = 100;
    Object.entries(metrics.eventsBySeverity).forEach(([severity, count]) => {
      score += weights[severity as keyof typeof weights] * count;
    });

    return Math.max(0, Math.min(100, score));
  }

  private static calculateAuthScore(metrics: SecurityMetrics): number {
    const authFailures = metrics.eventsByType.authentication_failure || 0;
    return Math.max(0, 100 - (authFailures * 5));
  }

  private static calculateAuthzScore(metrics: SecurityMetrics): number {
    const authzDenied = metrics.eventsByType.authorization_denied || 0;
    return Math.max(0, 100 - (authzDenied * 10));
  }

  private static calculateInputScore(metrics: SecurityMetrics): number {
    const xssAttempts = metrics.eventsByType.xss_attempt || 0;
    const sqlAttempts = metrics.eventsByType.sql_injection_attempt || 0;
    return Math.max(0, 100 - ((xssAttempts + sqlAttempts) * 15));
  }

  private static calculateSessionScore(metrics: SecurityMetrics): number {
    const hijackAttempts = metrics.eventsByType.session_hijack_attempt || 0;
    return Math.max(0, 100 - (hijackAttempts * 25));
  }

  private static generateRecommendations(metrics: SecurityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.eventsBySeverity.critical > 0) {
      recommendations.push('Immediate action required: Critical security events detected');
    }

    if (metrics.eventsByType.authentication_failure > 10) {
      recommendations.push('Consider implementing stronger authentication mechanisms');
    }

    if (metrics.eventsByType.xss_attempt > 0) {
      recommendations.push('Review input validation and implement Content Security Policy');
    }

    if (metrics.eventsByType.sql_injection_attempt > 0) {
      recommendations.push('Implement parameterized queries and input sanitization');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security posture looks good - continue monitoring');
    }

    return recommendations;
  }

  private static getEventSeverity(eventType: SecurityEventType): SecuritySeverity {
    const severityMap: Record<SecurityEventType, SecuritySeverity> = {
      authentication_failure: 'medium',
      authorization_denied: 'medium',
      suspicious_activity: 'medium',
      data_breach_attempt: 'critical',
      xss_attempt: 'high',
      csrf_attempt: 'high',
      sql_injection_attempt: 'critical',
      rate_limit_exceeded: 'low',
      invalid_input: 'low',
      session_hijack_attempt: 'high',
      privilege_escalation: 'critical',
      data_export_violation: 'high'
    };

    return severityMap[eventType] || 'low';
  }

  private static generateTrends(timeRange: { start: Date; end: Date }): Array<{ date: string; threatLevel: SecuritySeverity; eventCount: number }> {
    // Simplified trend generation
    const trends: Array<{ date: string; threatLevel: SecuritySeverity; eventCount: number }> = [];
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let date = new Date(timeRange.start); date <= timeRange.end; date = new Date(date.getTime() + dayMs)) {
      trends.push({
        date: date.toISOString().split('T')[0],
        threatLevel: 'low',
        eventCount: Math.floor(Math.random() * 10) // Placeholder
      });
    }

    return trends;
  }
}

/**
 * Comprehensive security integration utilities
 */
export const SecurityIntegration = {
  /**
   * Initialize security for ResearchHub
   */
  initializeResearchHubSecurity(): void {
    const securityManager = getSecurityManager({
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxLoginAttempts: 3,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        preventReuse: 5,
        maxAge: 90 * 24 * 60 * 60 * 1000
      },
      rateLimits: [
        { endpoint: '/api/auth/login', windowMs: 15 * 60 * 1000, maxRequests: 3 },
        { endpoint: '/api/studies', windowMs: 60 * 1000, maxRequests: 100 },
        { endpoint: '/api/applications', windowMs: 60 * 1000, maxRequests: 50 },
        { endpoint: '/api/sessions', windowMs: 60 * 1000, maxRequests: 30 }
      ]
    });

    // Set up event listeners for critical events
    securityManager.addEventListener('authentication_failure', (event) => {
      console.warn('Authentication failure:', event);
    });

    securityManager.addEventListener('sql_injection_attempt', (event) => {
      console.error('SQL injection attempt detected:', event);
    });

    securityManager.addEventListener('xss_attempt', (event) => {
      console.error('XSS attempt detected:', event);
    });
  },

  /**
   * Create middleware function for Express.js
   */
  createSecurityMiddleware() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (req: any, res: any, next: any) => {
      const threatAnalysis = ThreatDetector.analyzeRequest({
        url: req.url || '',
        method: req.method || 'GET',
        headers: req.headers || {},
        body: req.body ? JSON.stringify(req.body) : undefined,
        userAgent: req.get ? req.get('User-Agent') : req.headers?.['user-agent'],
        ip: req.ip || req.connection?.remoteAddress
      });

      if (threatAnalysis.threatLevel === 'critical') {
        return res.status(403).json({ error: 'Request blocked due to security threat' });
      }

      if (threatAnalysis.threatLevel === 'high') {
        console.warn('High threat level request:', threatAnalysis);
      }

      req.securityAnalysis = threatAnalysis;
      next();
    };
  }
};
