// Week 4 Day 2: Redis Cache Implementation for ResearchHub
// Date: June 29, 2025

import Redis from 'ioredis';

/**
 * Redis configuration and cache manager for ResearchHub enterprise collaboration
 */

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: true,
  // Enable TLS for production
  ...(process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true' ? { tls: {} } : {})
};

// Cache key patterns for enterprise collaboration
export const CACHE_KEYS = {
  // User-specific caches
  USER_ORGANIZATIONS: (userId) => `user:${userId}:organizations`,
  USER_PERMISSIONS: (userId, studyId) => `permissions:${userId}:${studyId}`,
  USER_COLLABORATIVE_STUDIES: (userId) => `user:${userId}:collaborative_studies`,
  
  // Organization-specific caches
  ORGANIZATION_MEMBERS: (orgId) => `org:${orgId}:members`,
  ORGANIZATION_TEAMS: (orgId) => `org:${orgId}:teams`,
  ORGANIZATION_ANALYTICS: (orgId) => `org:${orgId}:analytics`,
  ORGANIZATION_DETAILS: (orgId) => `org:${orgId}:details`,
  
  // Study-specific caches
  STUDY_COLLABORATORS: (studyId) => `study:${studyId}:collaborators`,
  STUDY_COMMENTS: (studyId) => `study:${studyId}:comments`,
  STUDY_ACTIVITY: (studyId) => `study:${studyId}:activity`,
  STUDY_DETAILS: (studyId) => `study:${studyId}:details`,
  
  // Team-specific caches
  TEAM_MEMBERS: (teamId) => `team:${teamId}:members`,
  TEAM_ANALYTICS: (teamId) => `team:${teamId}:analytics`,
  TEAM_DETAILS: (teamId) => `team:${teamId}:details`,
  
  // Analytics and system caches
  SYSTEM_STATS: 'system:stats',
  PERFORMANCE_METRICS: 'system:performance',
  DASHBOARD_ANALYTICS: (userId) => `dashboard:${userId}:analytics`
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  // Short-term caches (5-15 minutes)
  USER_PERMISSIONS: 5 * 60,         // 5 minutes
  STUDY_ACTIVITY: 10 * 60,          // 10 minutes
  STUDY_COMMENTS: 15 * 60,          // 15 minutes
  SYSTEM_STATS: 15 * 60,            // 15 minutes
  
  // Medium-term caches (30 minutes - 1 hour)
  ORGANIZATION_MEMBERS: 30 * 60,    // 30 minutes
  STUDY_COLLABORATORS: 30 * 60,     // 30 minutes
  TEAM_MEMBERS: 45 * 60,            // 45 minutes
  STUDY_DETAILS: 60 * 60,           // 1 hour
  
  // Long-term caches (2-4 hours)
  USER_ORGANIZATIONS: 2 * 60 * 60,  // 2 hours
  ORGANIZATION_TEAMS: 2 * 60 * 60,  // 2 hours
  ORGANIZATION_DETAILS: 4 * 60 * 60, // 4 hours
  TEAM_DETAILS: 4 * 60 * 60,        // 4 hours
  
  // Analytics caches (12-24 hours)
  USER_COLLABORATIVE_STUDIES: 12 * 60 * 60, // 12 hours
  ORGANIZATION_ANALYTICS: 24 * 60 * 60,      // 24 hours
  TEAM_ANALYTICS: 24 * 60 * 60,              // 24 hours
  DASHBOARD_ANALYTICS: 6 * 60 * 60,          // 6 hours
};

/**
 * Cache Manager class for Redis operations
 */
class CacheManager {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0
    };
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.redis = new Redis(redisConfig);
      
      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });
      
      this.redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
        this.isConnected = false;
        this.metrics.errors++;
      });
      
      this.redis.on('close', () => {
        console.log('⚠️  Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('💥 Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Generic cache wrapper with automatic JSON serialization
   */
  async withCache(key, fetchFn, ttl = 3600, options = {}) {
    this.metrics.totalRequests++;
    
    try {
      // Skip cache if Redis is not connected or bypass option is set
      if (!this.isConnected || options.bypassCache) {
        const data = await fetchFn();
        this.metrics.misses++;
        return data;
      }

      // Try to get from cache
      const cached = await this.redis.get(key);
      
      if (cached !== null) {
        this.metrics.hits++;
        try {
          return JSON.parse(cached);
        } catch (parseError) {
          console.error('Cache parse error for key:', key, parseError.message);
          // Continue to fetch fresh data if parse fails
        }
      }

      // Cache miss - fetch fresh data
      const data = await fetchFn();
      this.metrics.misses++;
      
      // Store in cache (fire and forget)
      this.set(key, data, ttl).catch(error => {
        console.error('Cache set error for key:', key, error.message);
      });
      
      return data;
    } catch (error) {
      console.error('Cache operation error:', error.message);
      this.metrics.errors++;
      
      // Fallback to direct fetch if cache fails
      return await fetchFn();
    }
  }

  /**
   * Set cache value with TTL
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.redis.get(key);
      if (cached === null) return null;
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  /**
   * Delete cache keys
   */
  async del(keys) {
    if (!this.isConnected) return false;
    
    try {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      await this.redis.del(...keyArray);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  }

  /**
   * Invalidate cache keys matching a pattern
   */
  async invalidatePattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache pattern invalidation error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests * 100).toFixed(2)
      : 0;
    
    const missRate = this.metrics.totalRequests > 0
      ? (this.metrics.misses / this.metrics.totalRequests * 100).toFixed(2)
      : 0;

    return {
      isConnected: this.isConnected,
      totalRequests: this.metrics.totalRequests,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      errors: this.metrics.errors,
      hitRate: parseFloat(hitRate),
      missRate: parseFloat(missRate)
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0
    };
  }

  /**
   * Get Redis info
   */
  async getRedisInfo() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.redis.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      console.error('Redis info error:', error.message);
      return null;
    }
  }

  /**
   * Parse Redis INFO command output
   */
  parseRedisInfo(infoString) {
    const info = {};
    const lines = infoString.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        info[key] = value;
      }
    }
    
    return {
      memory: info.used_memory_human || 'N/A',
      connectedClients: parseInt(info.connected_clients) || 0,
      totalCommands: parseInt(info.total_commands_processed) || 0,
      uptime: parseInt(info.uptime_in_seconds) || 0,
      keyspace: info.db0 || 'empty'
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) return false;
      
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
    }
  }
}

/**
 * Cache invalidation helper for enterprise collaboration
 */
class CacheInvalidator {
  constructor(cacheManager) {
    this.cache = cacheManager;
  }

  /**
   * Invalidate when organization membership changes
   */
  async onOrganizationMembershipChange(orgId, userId) {
    const keysToInvalidate = [
      CACHE_KEYS.USER_ORGANIZATIONS(userId),
      CACHE_KEYS.ORGANIZATION_MEMBERS(orgId),
      CACHE_KEYS.USER_COLLABORATIVE_STUDIES(userId),
      CACHE_KEYS.ORGANIZATION_ANALYTICS(orgId),
      CACHE_KEYS.DASHBOARD_ANALYTICS(userId)
    ];
    
    await this.cache.del(keysToInvalidate);
    console.log(`🔄 Invalidated cache for org membership change: ${orgId} - ${userId}`);
  }

  /**
   * Invalidate when study collaboration changes
   */
  async onStudyCollaborationChange(studyId, userId) {
    const keysToInvalidate = [
      CACHE_KEYS.STUDY_COLLABORATORS(studyId),
      CACHE_KEYS.USER_COLLABORATIVE_STUDIES(userId),
      CACHE_KEYS.USER_PERMISSIONS(userId, studyId),
      CACHE_KEYS.STUDY_ACTIVITY(studyId),
      CACHE_KEYS.DASHBOARD_ANALYTICS(userId)
    ];
    
    await this.cache.del(keysToInvalidate);
    console.log(`🔄 Invalidated cache for study collaboration change: ${studyId} - ${userId}`);
  }

  /**
   * Invalidate when study comments/activity changes
   */
  async onStudyActivityChange(studyId, userIds = []) {
    const keysToInvalidate = [
      CACHE_KEYS.STUDY_COMMENTS(studyId),
      CACHE_KEYS.STUDY_ACTIVITY(studyId)
    ];
    
    // Invalidate dashboard analytics for all involved users
    userIds.forEach(userId => {
      keysToInvalidate.push(CACHE_KEYS.DASHBOARD_ANALYTICS(userId));
    });
    
    await this.cache.del(keysToInvalidate);
    console.log(`🔄 Invalidated cache for study activity change: ${studyId}`);
  }

  /**
   * Invalidate when team changes
   */
  async onTeamChange(teamId, orgId, userIds = []) {
    const keysToInvalidate = [
      CACHE_KEYS.TEAM_MEMBERS(teamId),
      CACHE_KEYS.TEAM_DETAILS(teamId),
      CACHE_KEYS.ORGANIZATION_TEAMS(orgId),
      CACHE_KEYS.TEAM_ANALYTICS(teamId)
    ];
    
    // Invalidate user-specific caches for team members
    userIds.forEach(userId => {
      keysToInvalidate.push(CACHE_KEYS.USER_COLLABORATIVE_STUDIES(userId));
      keysToInvalidate.push(CACHE_KEYS.DASHBOARD_ANALYTICS(userId));
    });
    
    await this.cache.del(keysToInvalidate);
    console.log(`🔄 Invalidated cache for team change: ${teamId} - ${orgId}`);
  }

  /**
   * Invalidate organization-wide caches
   */
  async onOrganizationChange(orgId) {
    // Use pattern invalidation for organization-wide cache clearing
    await this.cache.invalidatePattern(`org:${orgId}:*`);
    console.log(`🔄 Invalidated all organization caches: ${orgId}`);
  }

  /**
   * Invalidate user-specific caches
   */
  async onUserChange(userId) {
    await this.cache.invalidatePattern(`user:${userId}:*`);
    await this.cache.invalidatePattern(`permissions:${userId}:*`);
    await this.cache.invalidatePattern(`dashboard:${userId}:*`);
    console.log(`🔄 Invalidated all user caches: ${userId}`);
  }
}

// Create singleton instances
const cacheManager = new CacheManager();
const cacheInvalidator = new CacheInvalidator(cacheManager);

// Initialize cache connection
let cacheInitialized = false;
export const initializeCache = async () => {
  if (!cacheInitialized) {
    const connected = await cacheManager.connect();
    cacheInitialized = true;
    
    if (connected) {
      console.log('🚀 Cache system initialized successfully');
    } else {
      console.log('⚠️  Cache system running in fallback mode (no Redis)');
    }
  }
  return cacheManager;
};

// Export instances and utilities
export { cacheManager, cacheInvalidator };
export default cacheManager;
