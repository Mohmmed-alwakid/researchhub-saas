/**
 * Security Hardening Manager for ResearchHub API
 * Implements comprehensive security measures for API protection
 * 
 * Features:
 * - Input validation and sanitization
 * - SQL injection prevention
 * - XSS protection
 * - CORS security
 * - Request validation
 * - Security headers
 * 
 * @author ResearchHub Team
 * @date June 29, 2025
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

class SecurityManager {
  constructor() {
    this.securityConfig = {
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      maxUrlLength: 2048,
      maxHeaderSize: 8192,
      allowedFileTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv'
      ],
      blockedUserAgents: [
        /bot/i,
        /crawler/i,
        /scraper/i,
        /spider/i
      ],
      suspiciousPatterns: {
        sqlInjection: [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
          /(\b(OR|AND)\b.*\b(=|<|>)\b.*\b(OR|AND)\b)/i,
          /(;|\-\-|\/\*|\*\/|xp_|sp_)/i
        ],
        xss: [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
        ],
        pathTraversal: [
          /\.\.\/|\.\.\\|\.\.\%2f|\.\.\%5c/i,
          /\/etc\/passwd|\/etc\/shadow/i,
          /\\windows\\system32/i
        ]
      }
    };

    this.csrfTokens = new Map();
    this.securityViolations = new Map();
  }

  /**
   * Create comprehensive security middleware
   */
  createSecurityMiddleware() {
    return async (req, res, next) => {
      try {
        // Set security headers
        this.setSecurityHeaders(res);

        // Validate request size and structure
        const sizeValidation = this.validateRequestSize(req);
        if (!sizeValidation.valid) {
          return this.handleSecurityViolation(res, 'request_too_large', sizeValidation.reason);
        }

        // Check for suspicious user agents
        const userAgentCheck = this.validateUserAgent(req);
        if (!userAgentCheck.valid) {
          return this.handleSecurityViolation(res, 'suspicious_user_agent', userAgentCheck.reason);
        }

        // Validate and sanitize input
        const inputValidation = await this.validateAndSanitizeInput(req);
        if (!inputValidation.valid) {
          return this.handleSecurityViolation(res, 'input_validation_failed', inputValidation.reason);
        }

        // Check for security threats
        const threatCheck = this.detectSecurityThreats(req);
        if (threatCheck.detected) {
          return this.handleSecurityViolation(res, 'security_threat_detected', threatCheck.reason);
        }

        // Validate CORS for browser requests
        const corsValidation = this.validateCORS(req);
        if (!corsValidation.valid) {
          return this.handleSecurityViolation(res, 'cors_violation', corsValidation.reason);
        }

        // Continue to next middleware
        next();

      } catch (error) {
        console.error('Security middleware error:', error);
        return this.handleSecurityViolation(res, 'security_check_failed', 'Internal security error');
      }
    };
  }

  /**
   * Set comprehensive security headers
   */
  setSecurityHeaders(res) {
    res.set({
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Content type sniffing protection
      'X-Content-Type-Options': 'nosniff',
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Content Security Policy
      'Content-Security-Policy': this.getCSPHeader(),
      
      // HSTS (if HTTPS)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Permission policy
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      
      // Custom security headers
      'X-Powered-By': '', // Remove server information
      'Server': '', // Remove server information
      
      // API-specific headers
      'X-API-Version': '1.0',
      'X-Request-ID': this.generateRequestId()
    });
  }

  /**
   * Generate Content Security Policy header
   */
  getCSPHeader() {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];

    return directives.join('; ');
  }

  /**
   * Validate request size limits
   */
  validateRequestSize(req) {
    const contentLength = parseInt(req.headers['content-length']) || 0;
    const url = req.url || '';

    if (contentLength > this.securityConfig.maxRequestSize) {
      return {
        valid: false,
        reason: `Request body too large: ${contentLength} bytes (max: ${this.securityConfig.maxRequestSize})`
      };
    }

    if (url.length > this.securityConfig.maxUrlLength) {
      return {
        valid: false,
        reason: `URL too long: ${url.length} characters (max: ${this.securityConfig.maxUrlLength})`
      };
    }

    // Check total header size
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > this.securityConfig.maxHeaderSize) {
      return {
        valid: false,
        reason: `Headers too large: ${headerSize} bytes (max: ${this.securityConfig.maxHeaderSize})`
      };
    }

    return { valid: true };
  }

  /**
   * Validate user agent for suspicious patterns
   */
  validateUserAgent(req) {
    const userAgent = req.headers['user-agent'] || '';

    // Check for blocked user agents
    for (const pattern of this.securityConfig.blockedUserAgents) {
      if (pattern.test(userAgent)) {
        return {
          valid: false,
          reason: `Blocked user agent pattern: ${pattern.source}`
        };
      }
    }

    // Check for missing user agent (suspicious)
    if (!userAgent && req.headers['accept'] && !req.headers['accept'].includes('application/json')) {
      return {
        valid: false,
        reason: 'Missing user agent for browser request'
      };
    }

    return { valid: true };
  }

  /**
   * Validate and sanitize request input
   */
  async validateAndSanitizeInput(req) {
    try {
      // Sanitize URL parameters
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            req.query[key] = this.sanitizeInput(value);
          }
        }
      }

      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = this.sanitizeObject(req.body);
      }

      // Validate specific endpoints
      const validationResult = await this.validateEndpointInput(req);
      if (!validationResult.valid) {
        return validationResult;
      }

      return { valid: true };

    } catch (error) {
      return {
        valid: false,
        reason: `Input validation error: ${error.message}`
      };
    }
  }

  /**
   * Sanitize string input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove potentially dangerous characters
    let sanitized = input
      .replace(/[<>'"]/g, '') // Remove basic XSS characters
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/data:/gi, '') // Remove data protocol
      .trim();

    // Use DOMPurify for HTML content
    if (input.includes('<') || input.includes('>')) {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: []
      });
    }

    return sanitized;
  }

  /**
   * Recursively sanitize object properties
   */
  sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = this.sanitizeInput(key);
      
      if (typeof value === 'string') {
        sanitized[cleanKey] = this.sanitizeInput(value);
      } else if (typeof value === 'object') {
        sanitized[cleanKey] = this.sanitizeObject(value);
      } else {
        sanitized[cleanKey] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate input for specific endpoints
   */
  async validateEndpointInput(req) {
    const endpoint = req.path;
    const method = req.method;

    // Define validation schemas for different endpoints
    const validationSchemas = {
      '/api/auth': {
        POST: z.object({
          email: z.string().email().max(255),
          password: z.string().min(8).max(128),
          action: z.enum(['login', 'register', 'reset-password'])
        })
      },
      '/api/studies': {
        POST: z.object({
          title: z.string().min(1).max(200),
          description: z.string().max(2000).optional(),
          blocks: z.array(z.object({
            type: z.string(),
            settings: z.object({}).passthrough()
          })).max(50)
        })
      },
      '/api/organizations': {
        POST: z.object({
          name: z.string().min(1).max(100),
          description: z.string().max(500).optional(),
          settings: z.object({}).passthrough().optional()
        })
      }
    };

    // Find matching schema
    const endpointSchema = validationSchemas[endpoint];
    if (endpointSchema && endpointSchema[method] && req.body) {
      try {
        endpointSchema[method].parse(req.body);
      } catch (error) {
        return {
          valid: false,
          reason: `Validation error: ${error.message}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Detect security threats in request
   */
  detectSecurityThreats(req) {
    const url = req.url || '';
    const body = JSON.stringify(req.body || {});
    const query = JSON.stringify(req.query || {});
    const headers = JSON.stringify(req.headers || {});

    // Check for SQL injection
    for (const pattern of this.securityConfig.suspiciousPatterns.sqlInjection) {
      if (pattern.test(url) || pattern.test(body) || pattern.test(query)) {
        return {
          detected: true,
          reason: 'SQL injection attempt detected',
          pattern: pattern.source
        };
      }
    }

    // Check for XSS attempts
    for (const pattern of this.securityConfig.suspiciousPatterns.xss) {
      if (pattern.test(url) || pattern.test(body) || pattern.test(headers)) {
        return {
          detected: true,
          reason: 'XSS attempt detected',
          pattern: pattern.source
        };
      }
    }

    // Check for path traversal
    for (const pattern of this.securityConfig.suspiciousPatterns.pathTraversal) {
      if (pattern.test(url) || pattern.test(body)) {
        return {
          detected: true,
          reason: 'Path traversal attempt detected',
          pattern: pattern.source
        };
      }
    }

    return { detected: false };
  }

  /**
   * Validate CORS policy
   */
  validateCORS(req) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:3003',
      'https://your-domain.vercel.app',
      'https://researchhub.com'
    ];

    // Allow requests without origin (mobile apps, Postman, etc.)
    if (!origin) {
      return { valid: true };
    }

    // Check if origin is allowed
    if (!allowedOrigins.includes(origin)) {
      return {
        valid: false,
        reason: `Origin not allowed: ${origin}`
      };
    }

    return { valid: true };
  }

  /**
   * Handle security violations
   */
  handleSecurityViolation(res, violationType, reason) {
    const violation = {
      type: violationType,
      reason: reason,
      timestamp: new Date().toISOString(),
      severity: this.getViolationSeverity(violationType)
    };

    // Log security violation
    console.warn('Security violation detected:', violation);

    // Record for monitoring
    this.recordSecurityViolation(violation);

    // Return appropriate error response
    const statusCode = this.getViolationStatusCode(violationType);
    res.status(statusCode).json({
      success: false,
      error: 'Security policy violation',
      message: this.getPublicErrorMessage(violationType),
      requestId: this.generateRequestId()
    });
  }

  /**
   * Get violation severity level
   */
  getViolationSeverity(violationType) {
    const severityMap = {
      'security_threat_detected': 'critical',
      'input_validation_failed': 'high',
      'suspicious_user_agent': 'medium',
      'cors_violation': 'medium',
      'request_too_large': 'low',
      'security_check_failed': 'high'
    };
    return severityMap[violationType] || 'medium';
  }

  /**
   * Get HTTP status code for violation type
   */
  getViolationStatusCode(violationType) {
    const statusMap = {
      'security_threat_detected': 403,
      'input_validation_failed': 400,
      'suspicious_user_agent': 403,
      'cors_violation': 403,
      'request_too_large': 413,
      'security_check_failed': 500
    };
    return statusMap[violationType] || 400;
  }

  /**
   * Get public error message (don't reveal too much detail)
   */
  getPublicErrorMessage(violationType) {
    const messageMap = {
      'security_threat_detected': 'Request blocked by security policy',
      'input_validation_failed': 'Invalid request data',
      'suspicious_user_agent': 'Request not allowed',
      'cors_violation': 'Origin not allowed',
      'request_too_large': 'Request too large',
      'security_check_failed': 'Security check failed'
    };
    return messageMap[violationType] || 'Request denied';
  }

  /**
   * Record security violation for monitoring
   */
  async recordSecurityViolation(violation) {
    // In production, send to external security monitoring service
    if (process.env.NODE_ENV === 'production') {
      try {
        // Send to external monitoring service (e.g., Sentry, DataDog, custom endpoint)
        if (process.env.SECURITY_MONITORING_ENDPOINT) {
          await fetch(process.env.SECURITY_MONITORING_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SECURITY_MONITORING_TOKEN}`,
            },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              service: 'afkar-research-hub',
              violation,
              environment: process.env.NODE_ENV,
            })
          });
        }
        
        // Also log locally for backup
        console.warn('Security violation reported:', JSON.stringify(violation));
      } catch (error) {
        // Fallback to console logging if external service fails
        console.error('Failed to send security violation to monitoring service:', error);
        console.warn('Security violation (fallback):', JSON.stringify(violation));
      }
    } else {
      // Development logging
      console.warn('SECURITY_VIOLATION:', JSON.stringify(violation));
    }

    // Store in memory for immediate tracking (would be database in production)
    const key = `${violation.type}_${Date.now()}`;
    this.securityViolations.set(key, violation);

    // Clean up old violations (keep last 1000)
    if (this.securityViolations.size > 1000) {
      const oldestKeys = Array.from(this.securityViolations.keys()).slice(0, 100);
      oldestKeys.forEach(key => this.securityViolations.delete(key));
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get security violations summary
   */
  getSecuritySummary() {
    const violations = Array.from(this.securityViolations.values());
    
    return {
      totalViolations: violations.length,
      violationsByType: violations.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
      }, {}),
      violationsBySeverity: violations.reduce((acc, v) => {
        acc[v.severity] = (acc[v.severity] || 0) + 1;
        return acc;
      }, {}),
      recentViolations: violations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
    };
  }
}

export default SecurityManager;
