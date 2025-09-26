import RateLimitManager from './RateLimitManager.js';


/**
 * Rate Limiting Middleware for ResearchHub API
 * Express.js middleware that implements rate limiting with Redis storage
 * 
 * Features:
 * - Automatic user role detection
 * - Endpoint-specific rate limiting
 * - DDoS protection
 * - Comprehensive logging and monitoring
 * 
 * @author ResearchHub Team
 * @date June 29, 2025
 */

class RateLimitMiddleware {
  constructor(cacheManager = null, options = {}) {
    this.rateLimitManager = new RateLimitManager(cacheManager);
    this.options = {
      enabled: true,
      trustProxy: true,
      skipOnError: true, // Fail open if rate limiting fails
      standardHeaders: true, // Add standard rate limit headers
      legacyHeaders: false,
      ...options
    };
  }

  /**
   * Create Express middleware function
   */
  createMiddleware() {
    return async (req, res, next) => {
      try {
        // Skip if rate limiting is disabled
        if (!this.options.enabled) {
          return next();
        }

        // Get client identifier and user info
        const clientId = this.rateLimitManager.getClientIdentifier(req);
        const userInfo = await this.getUserInfo(req);
        const endpoint = this.normalizeEndpoint(req.path);

        // Check rate limit
        const rateLimitResult = await this.rateLimitManager.checkRateLimit(
          clientId,
          userInfo.role,
          userInfo.subscriptionTier,
          endpoint,
          req
        );

        // Add rate limit headers
        if (this.options.standardHeaders) {
          this.addRateLimitHeaders(res, rateLimitResult);
        }

        // Block request if rate limit exceeded
        if (!rateLimitResult.allowed) {
          return this.handleRateLimitExceeded(res, rateLimitResult);
        }

        // Log rate limit info for monitoring
        this.logRateLimitInfo(req, rateLimitResult, userInfo);

        // Continue to next middleware
        next();

      } catch (error) {
        console.error('Rate limiting middleware error:', error);
        
        if (this.options.skipOnError) {
          // Fail open - continue if rate limiting fails
          next();
        } else {
          res.status(500).json({
            success: false,
            error: 'Rate limiting temporarily unavailable'
          });
        }
      }
    };
  }

  /**
   * Get user information from request
   */
  async getUserInfo(req) {
    const defaultInfo = {
      role: 'anonymous',
      subscriptionTier: 'free',
      userId: null
    };

    try {
      // Check for authenticated user
      if (req.user) {
        return {
          role: req.user.role || 'participant',
          subscriptionTier: req.user.subscription_tier || 'free',
          userId: req.user.id
        };
      }

      // Check for JWT token in headers
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        // Decode JWT to get user info
        const userInfo = await this.decodeUserToken(token);
        if (userInfo) {
          return {
            role: userInfo.role || 'participant',
            subscriptionTier: userInfo.subscription_tier || 'free',
            userId: userInfo.id
          };
        }
      }

      return defaultInfo;

    } catch (error) {
      console.error('Failed to get user info for rate limiting:', error);
      return defaultInfo;
    }
  }

  /**
   * Decode JWT token to get user information
   */
  async decodeUserToken(token) {
    try {
      // Use Supabase client to verify token
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return null;
      }

      // Get user profile for role and subscription info
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, subscription_tier')
        .eq('user_id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email,
        role: profile?.role || 'participant',
        subscription_tier: profile?.subscription_tier || 'free'
      };

    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Normalize endpoint path for rate limiting
   */
  normalizeEndpoint(path) {
    // Remove query parameters and trailing slashes
    const cleanPath = path.split('?')[0].replace(/\/$/, '');
    
    // Replace dynamic segments with placeholders
    const normalized = cleanPath
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[a-zA-Z0-9-_]{20,}/g, '/:token');

    return normalized;
  }

  /**
   * Add standard rate limit headers to response
   */
  addRateLimitHeaders(res, rateLimitResult) {
    res.set({
      'X-RateLimit-Limit': rateLimitResult.maxRequests || 100,
      'X-RateLimit-Remaining': Math.max(0, rateLimitResult.remainingRequests || 0),
      'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000),
      'X-RateLimit-Window': '900' // 15 minutes in seconds
    });

    if (!rateLimitResult.allowed) {
      res.set({
        'Retry-After': rateLimitResult.retryAfter || 60
      });
    }
  }

  /**
   * Handle rate limit exceeded response
   */
  handleRateLimitExceeded(res, rateLimitResult) {
    const statusCode = rateLimitResult.reason === 'DDoS protection triggered' ? 429 : 429;
    
    res.status(statusCode).json({
      success: false,
      error: rateLimitResult.reason || 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: rateLimitResult.retryAfter || 60,
      resetTime: rateLimitResult.resetTime,
      rateLimitInfo: {
        limit: rateLimitResult.maxRequests,
        remaining: 0,
        reset: Math.ceil(rateLimitResult.resetTime / 1000)
      }
    });
  }

  /**
   * Log rate limit information for monitoring
   */
  logRateLimitInfo(req, rateLimitResult, userInfo) {
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      endpoint: req.path,
      clientId: this.rateLimitManager.getClientIdentifier(req),
      userRole: userInfo.role,
      subscriptionTier: userInfo.subscriptionTier,
      rateLimitStatus: rateLimitResult.allowed ? 'allowed' : 'blocked',
      remainingRequests: rateLimitResult.remainingRequests,
      totalRequests: rateLimitResult.totalRequests,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    };

    // Log blocked requests as warnings
    if (!rateLimitResult.allowed) {
      console.warn('Rate limit exceeded:', logData);
    } else if (rateLimitResult.remainingRequests < 10) {
      // Log when approaching rate limit
      console.info('Rate limit warning:', logData);
    }

    // Store in monitoring system (could be sent to analytics service)
    this.sendToMonitoring(logData);
  }

  /**
   * Send rate limit data to monitoring system
   */
  sendToMonitoring(logData) {
    // This could send data to monitoring services like:
    // - DataDog
    // - New Relic
    // - Custom analytics dashboard
    // - Supabase for storage and analysis

    // For now, we'll just store it in a way that can be aggregated
    if (process.env.NODE_ENV === 'production') {
      // In production, send to actual monitoring service
      console.log('MONITORING:', JSON.stringify(logData));
    }
  }

  /**
   * Create rate limiting middleware with custom configuration
   */
  static create(cacheManager, options = {}) {
    const middleware = new RateLimitMiddleware(cacheManager, options);
    return middleware.createMiddleware();
  }

  /**
   * Create stricter rate limiting for sensitive endpoints
   */
  static createStrict(cacheManager) {
    return RateLimitMiddleware.create(cacheManager, {
      enabled: true,
      skipOnError: false, // Fail closed for sensitive endpoints
      standardHeaders: true
    });
  }

  /**
   * Create permissive rate limiting for development
   */
  static createDevelopment(cacheManager) {
    return RateLimitMiddleware.create(cacheManager, {
      enabled: process.env.NODE_ENV === 'production',
      skipOnError: true,
      standardHeaders: true
    });
  }
}

export default RateLimitMiddleware;
