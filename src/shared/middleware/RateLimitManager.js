import { createClient } from '@supabase/supabase-js';


/**
 * Rate Limiting Manager for ResearchHub API
 * Implements configurable rate limiting with Redis storage
 * 
 * Features:
 * - Multiple rate limit tiers (free, premium, enterprise)
 * - Per-endpoint specific limits
 * - DDoS protection with progressive penalties
 * - Request analytics and monitoring
 * 
 * @author ResearchHub Team
 * @date June 29, 2025
 */

class RateLimitManager {
  constructor(cacheManager = null) {
    this.cacheManager = cacheManager;
    this.defaultConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };

    // Rate limit tiers based on user roles and subscription
    this.rateLimitTiers = {
      anonymous: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 20,
        burstAllowance: 5
      },
      participant: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
        burstAllowance: 20
      },
      researcher: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 500,
        burstAllowance: 100
      },
      admin: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 1000,
        burstAllowance: 200
      },
      premium: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 2000,
        burstAllowance: 400
      },
      enterprise: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5000,
        burstAllowance: 1000
      }
    };

    // Endpoint-specific rate limits
    this.endpointLimits = {
      '/api/auth': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 10, // Strict for auth endpoints
        ddosProtection: true
      },
      '/api/studies': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 200,
        ddosProtection: false
      },
      '/api/organizations': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
        ddosProtection: false
      },
      '/api/collaboration': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 300,
        ddosProtection: false
      },
      '/api/analytics': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 50,
        ddosProtection: false
      }
    };

    this.ddosThresholds = {
      requests_per_second: 10,
      requests_per_minute: 300,
      suspicious_patterns: {
        rapid_auth_attempts: 5,
        identical_requests: 20,
        ip_rotation_threshold: 10
      }
    };
  }

  /**
   * Get rate limit configuration for user and endpoint
   */
  getRateLimitConfig(userRole, subscriptionTier, endpoint) {
    const baseTier = this.rateLimitTiers[userRole] || this.rateLimitTiers.anonymous;
    const subscriptionMultiplier = this.getSubscriptionMultiplier(subscriptionTier);
    const endpointConfig = this.getEndpointConfig(endpoint);

    return {
      windowMs: endpointConfig.windowMs || baseTier.windowMs,
      maxRequests: Math.floor((endpointConfig.maxRequests || baseTier.maxRequests) * subscriptionMultiplier),
      burstAllowance: Math.floor(baseTier.burstAllowance * subscriptionMultiplier),
      ddosProtection: endpointConfig.ddosProtection || false
    };
  }

  /**
   * Get subscription tier multiplier
   */
  getSubscriptionMultiplier(subscriptionTier) {
    const multipliers = {
      free: 1,
      basic: 1.5,
      premium: 3,
      enterprise: 10
    };
    return multipliers[subscriptionTier] || 1;
  }

  /**
   * Get endpoint-specific configuration
   */
  getEndpointConfig(endpoint) {
    // Find matching endpoint pattern
    for (const [pattern, config] of Object.entries(this.endpointLimits)) {
      if (endpoint.startsWith(pattern)) {
        return config;
      }
    }
    return {};
  }

  /**
   * Check rate limit for request
   */
  async checkRateLimit(clientId, userRole, subscriptionTier, endpoint, req) {
    try {
      const config = this.getRateLimitConfig(userRole, subscriptionTier, endpoint);
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Generate cache key for rate limiting
      const cacheKey = this.generateRateLimitKey(clientId, endpoint);
      
      // Get current request count from cache
      let requestData = null;
      if (this.cacheManager) {
        requestData = await this.cacheManager.get(cacheKey);
      }

      if (!requestData) {
        requestData = {
          requests: [],
          firstRequest: now,
          totalRequests: 0
        };
      }

      // Clean old requests outside the window
      requestData.requests = requestData.requests.filter(timestamp => timestamp > windowStart);

      // Check DDoS protection if enabled
      if (config.ddosProtection) {
        const ddosResult = await this.checkDDoSProtection(clientId, req, requestData);
        if (ddosResult.blocked) {
          return {
            allowed: false,
            remainingRequests: 0,
            resetTime: now + config.windowMs,
            retryAfter: ddosResult.retryAfter,
            reason: 'DDoS protection triggered'
          };
        }
      }

      // Check if request exceeds limit
      const currentCount = requestData.requests.length;
      if (currentCount >= config.maxRequests) {
        // Check burst allowance
        const recentRequests = requestData.requests.filter(timestamp => timestamp > (now - 60000)); // Last minute
        if (recentRequests.length >= config.burstAllowance) {
          return {
            allowed: false,
            remainingRequests: 0,
            resetTime: windowStart + config.windowMs,
            retryAfter: Math.ceil((windowStart + config.windowMs - now) / 1000),
            reason: 'Rate limit exceeded'
          };
        }
      }

      // Allow request and update counter
      requestData.requests.push(now);
      requestData.totalRequests++;

      // Store updated data in cache
      if (this.cacheManager) {
        await this.cacheManager.set(cacheKey, requestData, config.windowMs / 1000);
      }

      return {
        allowed: true,
        remainingRequests: config.maxRequests - requestData.requests.length,
        resetTime: windowStart + config.windowMs,
        totalRequests: requestData.totalRequests
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remainingRequests: 1,
        resetTime: Date.now() + this.defaultConfig.windowMs,
        error: 'Rate limiting temporarily unavailable'
      };
    }
  }

  /**
   * Advanced DDoS protection
   */
  async checkDDoSProtection(clientId, req, requestData) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneSecondAgo = now - 1000;

    // Check requests per second
    const requestsPerSecond = requestData.requests.filter(timestamp => timestamp > oneSecondAgo).length;
    if (requestsPerSecond > this.ddosThresholds.requests_per_second) {
      await this.recordSuspiciousActivity(clientId, 'excessive_requests_per_second', { count: requestsPerSecond });
      return { blocked: true, retryAfter: 60 };
    }

    // Check requests per minute
    const requestsPerMinute = requestData.requests.filter(timestamp => timestamp > oneMinuteAgo).length;
    if (requestsPerMinute > this.ddosThresholds.requests_per_minute) {
      await this.recordSuspiciousActivity(clientId, 'excessive_requests_per_minute', { count: requestsPerMinute });
      return { blocked: true, retryAfter: 300 };
    }

    // Check for suspicious patterns
    const suspiciousActivity = await this.detectSuspiciousPatterns(clientId, req);
    if (suspiciousActivity.detected) {
      return { blocked: true, retryAfter: suspiciousActivity.retryAfter };
    }

    return { blocked: false };
  }

  /**
   * Detect suspicious request patterns
   */
  async detectSuspiciousPatterns(clientId, req) {
    // This would typically check for:
    // - Identical request patterns
    // - Rapid authentication attempts
    // - IP rotation patterns
    // - Bot-like behavior

    // For now, implement basic pattern detection
    const patternKey = `ddos:patterns:${clientId}`;
    
    if (this.cacheManager) {
      const patterns = await this.cacheManager.get(patternKey) || {};
      
      // Check for rapid auth attempts
      if (req.url && req.url.includes('/auth')) {
        patterns.authAttempts = (patterns.authAttempts || 0) + 1;
        if (patterns.authAttempts > this.ddosThresholds.suspicious_patterns.rapid_auth_attempts) {
          await this.recordSuspiciousActivity(clientId, 'rapid_auth_attempts', { count: patterns.authAttempts });
          return { detected: true, retryAfter: 600 };
        }
      }

      // Store updated patterns
      await this.cacheManager.set(patternKey, patterns, 3600); // 1 hour TTL
    }

    return { detected: false };
  }

  /**
   * Record suspicious activity for monitoring
   */
  async recordSuspiciousActivity(clientId, activityType, metadata) {
    const activity = {
      client_id: clientId,
      activity_type: activityType,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      severity: this.getSeverityLevel(activityType)
    };

    // Store in cache for immediate access
    if (this.cacheManager) {
      const activityKey = `security:suspicious:${Date.now()}:${clientId}`;
      await this.cacheManager.set(activityKey, activity, 86400); // 24 hours
    }

    console.warn('Suspicious activity detected:', activity);
  }

  /**
   * Get severity level for activity type
   */
  getSeverityLevel(activityType) {
    const severityMap = {
      excessive_requests_per_second: 'high',
      excessive_requests_per_minute: 'medium',
      rapid_auth_attempts: 'high',
      identical_requests: 'medium',
      ip_rotation: 'high'
    };
    return severityMap[activityType] || 'low';
  }

  /**
   * Generate cache key for rate limiting
   */
  generateRateLimitKey(clientId, endpoint) {
    const cleanEndpoint = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    return `rate_limit:${clientId}:${cleanEndpoint}`;
  }

  /**
   * Get client identifier from request
   */
  getClientIdentifier(req) {
    // Use user ID if authenticated, otherwise use IP + User-Agent
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }

    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               req.ip ||
               'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';
    const fingerprint = this.generateFingerprint(ip, userAgent);
    
    return `anonymous:${fingerprint}`;
  }

  /**
   * Generate client fingerprint
   */
  generateFingerprint(ip, userAgent) {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Get rate limit status for monitoring
   */
  async getRateLimitStatus(clientId, endpoint) {
    const cacheKey = this.generateRateLimitKey(clientId, endpoint);
    
    if (this.cacheManager) {
      const requestData = await this.cacheManager.get(cacheKey);
      if (requestData) {
        return {
          totalRequests: requestData.totalRequests,
          currentWindowRequests: requestData.requests.length,
          firstRequest: requestData.firstRequest,
          windowStart: Date.now() - 15 * 60 * 1000
        };
      }
    }

    return null;
  }
}

export default RateLimitManager;
