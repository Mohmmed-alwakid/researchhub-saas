// Week 4 Day 2: Cache Middleware for ResearchHub API Endpoints
// Date: June 29, 2025

import { cacheManager, CACHE_KEYS, CACHE_TTL } from './CacheManager.js';

/**
 * Cache middleware for API endpoints
 * Provides automatic caching with configurable TTL and invalidation
 */

/**
 * Generic cache middleware factory
 */
export const cacheMiddleware = (options = {}) => {
  const {
    keyGenerator,
    ttl = 3600,
    bypassCache = false,
    skipCacheCondition = null,
    onCacheHit = null,
    onCacheMiss = null
  } = options;

  return async (req, res, next) => {
    // Skip caching if condition is met
    if (bypassCache || (skipCacheCondition && skipCacheCondition(req))) {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      
      // Try to get from cache
      const cached = await cacheManager.get(cacheKey);
      
      if (cached !== null) {
        // Cache hit
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        
        if (onCacheHit) {
          onCacheHit(req, cacheKey, cached);
        }
        
        return res.json(cached);
      }

      // Cache miss - continue to route handler
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      
      if (onCacheMiss) {
        onCacheMiss(req, cacheKey);
      }

      // Store original res.json to intercept response
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache successful responses
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          cacheManager.set(cacheKey, data, ttl).catch(error => {
            console.error('Failed to cache response:', error.message);
          });
        }
        
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Specialized cache middleware for user organizations
 */
export const cacheUserOrganizations = cacheMiddleware({
  keyGenerator: (req) => CACHE_KEYS.USER_ORGANIZATIONS(req.user?.id || 'anonymous'),
  ttl: CACHE_TTL.USER_ORGANIZATIONS,
  skipCacheCondition: (req) => !req.user?.id,
  onCacheHit: (req, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Cache hit for user organizations: ${req.user.id}`);
    }
  },
  onCacheMiss: (req, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`💫 Cache miss for user organizations: ${req.user.id}`);
    }
  }
});

/**
 * Cache middleware for organization members
 */
export const cacheOrganizationMembers = cacheMiddleware({
  keyGenerator: (req) => CACHE_KEYS.ORGANIZATION_MEMBERS(req.params.id || req.params.organizationId),
  ttl: CACHE_TTL.ORGANIZATION_MEMBERS,
  skipCacheCondition: (req) => !req.params.id && !req.params.organizationId
});

/**
 * Cache middleware for study collaborators
 */
export const cacheStudyCollaborators = cacheMiddleware({
  keyGenerator: (req) => CACHE_KEYS.STUDY_COLLABORATORS(req.params.studyId),
  ttl: CACHE_TTL.STUDY_COLLABORATORS,
  skipCacheCondition: (req) => !req.params.studyId
});

/**
 * Cache middleware for user collaborative studies
 */
export const cacheUserCollaborativeStudies = cacheMiddleware({
  keyGenerator: (req) => {
    const userId = req.user?.id || 'anonymous';
    const orgFilter = req.query.organization_id ? `:org:${req.query.organization_id}` : '';
    const roleFilter = req.query.role ? `:role:${req.query.role}` : '';
    return `${CACHE_KEYS.USER_COLLABORATIVE_STUDIES(userId)}${orgFilter}${roleFilter}`;
  },
  ttl: CACHE_TTL.USER_COLLABORATIVE_STUDIES,
  skipCacheCondition: (req) => !req.user?.id
});

/**
 * Cache middleware for study comments
 */
export const cacheStudyComments = cacheMiddleware({
  keyGenerator: (req) => CACHE_KEYS.STUDY_COMMENTS(req.params.studyId),
  ttl: CACHE_TTL.STUDY_COMMENTS,
  skipCacheCondition: (req) => !req.params.studyId
});

/**
 * Cache middleware for study activity
 */
export const cacheStudyActivity = cacheMiddleware({
  keyGenerator: (req) => CACHE_KEYS.STUDY_ACTIVITY(req.params.studyId),
  ttl: CACHE_TTL.STUDY_ACTIVITY,
  skipCacheCondition: (req) => !req.params.studyId
});

/**
 * Cache middleware for team members
 */
export const cacheTeamMembers = cacheMiddleware({
  keyGenerator: (req) => CACHE_KEYS.TEAM_MEMBERS(req.params.teamId),
  ttl: CACHE_TTL.TEAM_MEMBERS,
  skipCacheCondition: (req) => !req.params.teamId
});

/**
 * Cache middleware for organization analytics
 */
export const cacheOrganizationAnalytics = cacheMiddleware({
  keyGenerator: (req) => {
    const orgId = req.params.id || req.params.organizationId;
    const days = req.query.days || '30';
    return `${CACHE_KEYS.ORGANIZATION_ANALYTICS(orgId)}:days:${days}`;
  },
  ttl: CACHE_TTL.ORGANIZATION_ANALYTICS,
  skipCacheCondition: (req) => !req.params.id && !req.params.organizationId
});

/**
 * Cache middleware for dashboard analytics
 */
export const cacheDashboardAnalytics = cacheMiddleware({
  keyGenerator: (req) => CACHE_KEYS.DASHBOARD_ANALYTICS(req.user?.id || 'anonymous'),
  ttl: CACHE_TTL.DASHBOARD_ANALYTICS,
  skipCacheCondition: (req) => !req.user?.id
});

/**
 * Conditional cache middleware that only caches for specific conditions
 */
export const conditionalCache = (condition, cacheOptions) => {
  return (req, res, next) => {
    if (condition(req)) {
      return cacheMiddleware(cacheOptions)(req, res, next);
    }
    next();
  };
};

/**
 * Cache warmer utility for preloading frequently accessed data
 */
export class CacheWarmer {
  constructor() {
    this.warmupTasks = [];
  }

  /**
   * Add a cache warmup task
   */
  addTask(name, keyGenerator, dataFetcher, ttl, options = {}) {
    this.warmupTasks.push({
      name,
      keyGenerator,
      dataFetcher,
      ttl,
      options
    });
  }

  /**
   * Warm up cache for a specific user
   */
  async warmUserCache(userId) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔥 Warming cache for user: ${userId}`);
    }
    
    const userTasks = [
      {
        name: 'User Organizations',
        key: CACHE_KEYS.USER_ORGANIZATIONS(userId),
        fetcher: () => this.fetchUserOrganizations(userId),
        ttl: CACHE_TTL.USER_ORGANIZATIONS
      },
      {
        name: 'User Collaborative Studies',
        key: CACHE_KEYS.USER_COLLABORATIVE_STUDIES(userId),
        fetcher: () => this.fetchUserCollaborativeStudies(userId),
        ttl: CACHE_TTL.USER_COLLABORATIVE_STUDIES
      },
      {
        name: 'Dashboard Analytics',
        key: CACHE_KEYS.DASHBOARD_ANALYTICS(userId),
        fetcher: () => this.fetchDashboardAnalytics(userId),
        ttl: CACHE_TTL.DASHBOARD_ANALYTICS
      }
    ];

    const results = await Promise.allSettled(
      userTasks.map(async (task) => {
        try {
          const data = await task.fetcher();
          await cacheManager.set(task.key, data, task.ttl);
          console.log(`   ✅ ${task.name} cached`);
          return { task: task.name, success: true };
        } catch (error) {
          console.error(`   ❌ ${task.name} failed:`, error.message);
          return { task: task.name, success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.value?.success).length;
    console.log(`🎯 Cache warmup completed: ${successful}/${userTasks.length} tasks successful`);
    
    return results;
  }

  /**
   * Warm up cache for an organization
   */
  async warmOrganizationCache(orgId) {
    console.log(`🔥 Warming cache for organization: ${orgId}`);
    
    const orgTasks = [
      {
        name: 'Organization Members',
        key: CACHE_KEYS.ORGANIZATION_MEMBERS(orgId),
        fetcher: () => this.fetchOrganizationMembers(orgId),
        ttl: CACHE_TTL.ORGANIZATION_MEMBERS
      },
      {
        name: 'Organization Teams',
        key: CACHE_KEYS.ORGANIZATION_TEAMS(orgId),
        fetcher: () => this.fetchOrganizationTeams(orgId),
        ttl: CACHE_TTL.ORGANIZATION_TEAMS
      },
      {
        name: 'Organization Analytics',
        key: CACHE_KEYS.ORGANIZATION_ANALYTICS(orgId),
        fetcher: () => this.fetchOrganizationAnalytics(orgId),
        ttl: CACHE_TTL.ORGANIZATION_ANALYTICS
      }
    ];

    const results = await Promise.allSettled(
      orgTasks.map(async (task) => {
        try {
          const data = await task.fetcher();
          await cacheManager.set(task.key, data, task.ttl);
          console.log(`   ✅ ${task.name} cached`);
          return { task: task.name, success: true };
        } catch (error) {
          console.error(`   ❌ ${task.name} failed:`, error.message);
          return { task: task.name, success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.value?.success).length;
    console.log(`🎯 Organization cache warmup completed: ${successful}/${orgTasks.length} tasks successful`);
    
    return results;
  }

  /**
   * Run scheduled cache warmup
   */
  async runScheduledWarmup() {
    console.log('🔥 Running scheduled cache warmup...');
    
    try {
      // Get active users and organizations for warmup
      const activeUsers = await this.getActiveUsers();
      const activeOrganizations = await this.getActiveOrganizations();
      
      // Warm user caches
      const userResults = await Promise.allSettled(
        activeUsers.map(userId => this.warmUserCache(userId))
      );
      
      // Warm organization caches
      const orgResults = await Promise.allSettled(
        activeOrganizations.map(orgId => this.warmOrganizationCache(orgId))
      );
      
      console.log(`🎯 Scheduled warmup completed - Users: ${userResults.length}, Orgs: ${orgResults.length}`);
      
    } catch (error) {
      console.error('💥 Scheduled cache warmup failed:', error.message);
    }
  }

  // Placeholder methods for data fetching (to be implemented with actual API calls)
  async fetchUserOrganizations(userId) {
    // Implementation would call actual API or database
    return [];
  }

  async fetchUserCollaborativeStudies(userId) {
    return [];
  }

  async fetchDashboardAnalytics(userId) {
    return {};
  }

  async fetchOrganizationMembers(orgId) {
    return [];
  }

  async fetchOrganizationTeams(orgId) {
    return [];
  }

  async fetchOrganizationAnalytics(orgId) {
    return {};
  }

  async getActiveUsers() {
    // Return list of active user IDs for warmup
    return [];
  }

  async getActiveOrganizations() {
    // Return list of active organization IDs for warmup
    return [];
  }
}

/**
 * Cache statistics and monitoring utilities
 */
export class CacheMonitor {
  constructor() {
    this.endpointMetrics = new Map();
    this.startTime = Date.now();
  }

  /**
   * Record cache hit for an endpoint
   */
  recordHit(endpoint, responseTime = 0) {
    const metrics = this.getOrCreateEndpointMetrics(endpoint);
    metrics.hits++;
    metrics.totalRequests++;
    metrics.totalResponseTime += responseTime;
    this.endpointMetrics.set(endpoint, metrics);
  }

  /**
   * Record cache miss for an endpoint
   */
  recordMiss(endpoint, responseTime = 0) {
    const metrics = this.getOrCreateEndpointMetrics(endpoint);
    metrics.misses++;
    metrics.totalRequests++;
    metrics.totalResponseTime += responseTime;
    this.endpointMetrics.set(endpoint, metrics);
  }

  /**
   * Get or create metrics for an endpoint
   */
  getOrCreateEndpointMetrics(endpoint) {
    if (!this.endpointMetrics.has(endpoint)) {
      this.endpointMetrics.set(endpoint, {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        totalResponseTime: 0,
        lastAccessed: Date.now()
      });
    }
    return this.endpointMetrics.get(endpoint);
  }

  /**
   * Get overall cache performance metrics
   */
  getOverallMetrics() {
    let totalHits = 0;
    let totalMisses = 0;
    let totalRequests = 0;
    let totalResponseTime = 0;

    for (const metrics of this.endpointMetrics.values()) {
      totalHits += metrics.hits;
      totalMisses += metrics.misses;
      totalRequests += metrics.totalRequests;
      totalResponseTime += metrics.totalResponseTime;
    }

    const hitRate = totalRequests > 0 ? (totalHits / totalRequests * 100) : 0;
    const avgResponseTime = totalRequests > 0 ? (totalResponseTime / totalRequests) : 0;

    return {
      totalRequests,
      totalHits,
      totalMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: Date.now() - this.startTime,
      cacheManagerStats: cacheManager.getStats()
    };
  }

  /**
   * Get top performing endpoints
   */
  getTopPerformingEndpoints(limit = 10) {
    const endpoints = Array.from(this.endpointMetrics.entries())
      .map(([endpoint, metrics]) => ({
        endpoint,
        hitRate: metrics.totalRequests > 0 ? (metrics.hits / metrics.totalRequests * 100) : 0,
        totalRequests: metrics.totalRequests,
        avgResponseTime: metrics.totalRequests > 0 ? (metrics.totalResponseTime / metrics.totalRequests) : 0,
        lastAccessed: metrics.lastAccessed
      }))
      .sort((a, b) => b.hitRate - a.hitRate)
      .slice(0, limit);

    return endpoints;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.endpointMetrics.clear();
    this.startTime = Date.now();
  }
}

// Create singleton instances
export const cacheWarmer = new CacheWarmer();
export const cacheMonitor = new CacheMonitor();
