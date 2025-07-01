// Cache Manager for Redis and In-Memory Caching
// Provides intelligent caching with multiple storage backends

class CacheManager {
  constructor() {
    this.inMemoryCache = new Map();
    this.redisClient = null;
    this.config = {
      defaultTTL: 300,        // 5 minutes
      maxMemorySize: 100,     // 100 MB
      cleanupInterval: 60000, // 1 minute
      redisEnabled: false
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      memoryUsage: 0
    };
    
    this.initialize();
  }
  
  // Initialize cache manager
  async initialize() {
    try {
      // Try to initialize Redis if available
      if (process.env.REDIS_URL) {
        await this.initializeRedis();
      }
      
      // Start cleanup interval for in-memory cache
      this.startCleanup();
      
      console.log('Cache manager initialized:', {
        redisEnabled: this.config.redisEnabled,
        memoryCache: true
      });
      
    } catch (error) {
      console.error('Cache manager initialization error:', error);
    }
  }
  
  // Initialize Redis connection
  async initializeRedis() {
    try {
      // In a real implementation, you would use redis client here
      // For now, we'll simulate Redis availability
      if (process.env.REDIS_URL && process.env.REDIS_URL !== 'disabled') {
        this.config.redisEnabled = true;
        console.log('Redis cache enabled');
      }
    } catch (error) {
      console.warn('Redis initialization failed, using memory cache only:', error);
      this.config.redisEnabled = false;
    }
  }
  
  // Get value from cache
  async get(key) {
    try {
      // Try Redis first if available
      if (this.config.redisEnabled && this.redisClient) {
        try {
          const value = await this.redisClient.get(key);
          if (value !== null) {
            this.stats.hits++;
            return JSON.parse(value);
          }
        } catch (error) {
          console.warn('Redis get error:', error);
          this.stats.errors++;
        }
      }
      
      // Fallback to in-memory cache
      const cached = this.inMemoryCache.get(key);
      if (cached) {
        // Check expiration
        if (Date.now() < cached.expiry) {
          this.stats.hits++;
          return cached.value;
        } else {
          // Remove expired entry
          this.inMemoryCache.delete(key);
        }
      }
      
      this.stats.misses++;
      return null;
      
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.errors++;
      return null;
    }
  }
  
  // Set value in cache
  async set(key, value, ttl = null) {
    try {
      const actualTTL = ttl || this.config.defaultTTL;
      const expiry = Date.now() + (actualTTL * 1000);
      
      // Try Redis first if available
      if (this.config.redisEnabled && this.redisClient) {
        try {
          await this.redisClient.setex(key, actualTTL, JSON.stringify(value));
        } catch (error) {
          console.warn('Redis set error:', error);
          this.stats.errors++;
        }
      }
      
      // Always set in memory cache as backup
      this.inMemoryCache.set(key, {
        value,
        expiry,
        size: this.estimateSize(value)
      });
      
      this.stats.sets++;
      this.updateMemoryUsage();
      
      return true;
      
    } catch (error) {
      console.error('Cache set error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  // Delete value from cache
  async delete(key) {
    try {
      // Delete from Redis if available
      if (this.config.redisEnabled && this.redisClient) {
        try {
          await this.redisClient.del(key);
        } catch (error) {
          console.warn('Redis delete error:', error);
          this.stats.errors++;
        }
      }
      
      // Delete from memory cache
      const deleted = this.inMemoryCache.delete(key);
      
      if (deleted) {
        this.stats.deletes++;
        this.updateMemoryUsage();
      }
      
      return deleted;
      
    } catch (error) {
      console.error('Cache delete error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  // Check if key exists
  async exists(key) {
    try {
      // Check Redis first
      if (this.config.redisEnabled && this.redisClient) {
        try {
          const exists = await this.redisClient.exists(key);
          if (exists) return true;
        } catch (error) {
          console.warn('Redis exists error:', error);
          this.stats.errors++;
        }
      }
      
      // Check memory cache
      const cached = this.inMemoryCache.get(key);
      if (cached && Date.now() < cached.expiry) {
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Cache exists error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  // Clear all cache
  async clear() {
    try {
      // Clear Redis if available
      if (this.config.redisEnabled && this.redisClient) {
        try {
          await this.redisClient.flushall();
        } catch (error) {
          console.warn('Redis clear error:', error);
          this.stats.errors++;
        }
      }
      
      // Clear memory cache
      this.inMemoryCache.clear();
      this.updateMemoryUsage();
      
      console.log('Cache cleared successfully');
      return true;
      
    } catch (error) {
      console.error('Cache clear error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  // Get cache statistics
  async getStats() {
    const memoryEntries = this.inMemoryCache.size;
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : '0.00';
    
    let redisStats = null;
    if (this.config.redisEnabled && this.redisClient) {
      try {
        // In real implementation, get Redis info
        redisStats = {
          connected: true,
          memoryUsage: 'N/A',
          keys: 'N/A'
        };
      } catch (error) {
        redisStats = { connected: false, error: error.message };
      }
    }
    
    return {
      performance: {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: hitRate + '%',
        operations: {
          sets: this.stats.sets,
          deletes: this.stats.deletes,
          errors: this.stats.errors
        }
      },
      memory: {
        entries: memoryEntries,
        usage: this.formatBytes(this.stats.memoryUsage),
        maxSize: this.formatBytes(this.config.maxMemorySize * 1024 * 1024)
      },
      redis: redisStats,
      config: {
        defaultTTL: this.config.defaultTTL + 's',
        redisEnabled: this.config.redisEnabled,
        cleanupInterval: this.config.cleanupInterval + 'ms'
      }
    };
  }
  
  // Start cleanup interval
  startCleanup() {
    setInterval(() => {
      this.cleanupExpired();
    }, this.config.cleanupInterval);
  }
  
  // Clean up expired entries
  cleanupExpired() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (now >= entry.expiry) {
        this.inMemoryCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.updateMemoryUsage();
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
    
    // Check memory limits
    this.enforceMemoryLimits();
  }
  
  // Enforce memory usage limits
  enforceMemoryLimits() {
    const maxBytes = this.config.maxMemorySize * 1024 * 1024;
    
    if (this.stats.memoryUsage > maxBytes) {
      // Remove oldest entries until under limit
      const entries = Array.from(this.inMemoryCache.entries());
      entries.sort((a, b) => a[1].expiry - b[1].expiry);
      
      let removedCount = 0;
      for (const [key] of entries) {
        if (this.stats.memoryUsage <= maxBytes * 0.8) break;
        
        this.inMemoryCache.delete(key);
        removedCount++;
      }
      
      if (removedCount > 0) {
        this.updateMemoryUsage();
        console.log(`Removed ${removedCount} cache entries to enforce memory limits`);
      }
    }
  }
  
  // Update memory usage statistics
  updateMemoryUsage() {
    let totalSize = 0;
    for (const [key, entry] of this.inMemoryCache.entries()) {
      totalSize += entry.size || 0;
      totalSize += this.estimateSize(key);
    }
    this.stats.memoryUsage = totalSize;
  }
  
  // Estimate object size in bytes
  estimateSize(obj) {
    const jsonString = JSON.stringify(obj);
    return new TextEncoder().encode(jsonString).length;
  }
  
  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Generate cache key with prefix
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }
  
  // Batch operations
  async mget(keys) {
    const results = {};
    
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    
    return results;
  }
  
  async mset(keyValuePairs, ttl = null) {
    const results = {};
    
    for (const [key, value] of Object.entries(keyValuePairs)) {
      results[key] = await this.set(key, value, ttl);
    }
    
    return results;
  }
  
  // Health check
  async healthCheck() {
    try {
      const testKey = 'health_check_' + Date.now();
      const testValue = { test: true, timestamp: new Date() };
      
      // Test set
      const setResult = await this.set(testKey, testValue, 10);
      if (!setResult) {
        throw new Error('Failed to set test value');
      }
      
      // Test get
      const getValue = await this.get(testKey);
      if (!getValue || getValue.test !== true) {
        throw new Error('Failed to retrieve test value');
      }
      
      // Test delete
      const deleteResult = await this.delete(testKey);
      if (!deleteResult) {
        throw new Error('Failed to delete test value');
      }
      
      return {
        healthy: true,
        redis: this.config.redisEnabled,
        memory: true,
        latency: 'low'
      };
      
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        redis: this.config.redisEnabled,
        memory: true
      };
    }
  }
  
  // Graceful shutdown
  async shutdown() {
    try {
      if (this.config.redisEnabled && this.redisClient) {
        await this.redisClient.quit();
      }
      
      this.inMemoryCache.clear();
      console.log('Cache manager shutdown complete');
      
    } catch (error) {
      console.error('Cache manager shutdown error:', error);
    }
  }
}

// Singleton instance
let cacheManagerInstance = null;

// Get or create cache manager instance
function getCacheManager() {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
  }
  return cacheManagerInstance;
}

module.exports = {
  CacheManager,
  getCacheManager
};
