// Database Connection Pool Configuration
// Optimizes database connections for high-performance applications

class DatabaseConnectionPool {
  constructor() {
    this.pool = null;
    this.config = {
      // Connection pool settings
      min: 5,                    // Minimum connections
      max: 50,                   // Maximum connections  
      acquireTimeoutMillis: 60000, // 60 seconds
      createTimeoutMillis: 30000,  // 30 seconds
      destroyTimeoutMillis: 5000,  // 5 seconds
      idleTimeoutMillis: 30000,    // 30 seconds
      reapIntervalMillis: 1000,    // 1 second
      createRetryIntervalMillis: 200, // 200ms
      
      // Performance optimizations
      propagateCreateError: false,
      testOnBorrow: true,
      
      // Connection validation
      validationQuery: 'SELECT 1',
      
      // Pool monitoring
      log: (message, logLevel) => {
        console.log(`[DB Pool ${logLevel}] ${message}`);
      }
    };
    
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      pendingRequests: 0,
      totalQueries: 0,
      failedQueries: 0,
      avgQueryTime: 0,
      maxQueryTime: 0,
      connectionErrors: 0
    };
    
    this.queryTimes = [];
    this.maxQueryHistorySize = 1000;
  }
  
  // Initialize the connection pool
  async initialize() {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Database configuration missing');
      }
      
      // For Supabase, we'll implement a custom connection pool
      this.pool = {
        connections: new Map(),
        available: [],
        pending: [],
        stats: { ...this.stats }
      };
      
      // Create initial connections
      for (let i = 0; i < this.config.min; i++) {
        await this.createConnection();
      }
      
      // Start monitoring
      this.startMonitoring();
      
      console.log(`Database connection pool initialized with ${this.config.min} connections`);
      return true;
    } catch (error) {
      console.error('Failed to initialize database connection pool:', error);
      throw error;
    }
  }
  
  // Create a new database connection
  async createConnection() {
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const connection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client: createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            },
            db: {
              schema: 'public'
            }
          }
        ),
        created: new Date(),
        lastUsed: new Date(),
        inUse: false,
        queryCount: 0
      };
      
      this.pool.connections.set(connection.id, connection);
      this.pool.available.push(connection.id);
      this.stats.totalConnections++;
      
      return connection;
    } catch (error) {
      this.stats.connectionErrors++;
      throw error;
    }
  }
  
  // Acquire a connection from the pool
  async acquireConnection() {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection acquisition timeout'));
      }, this.config.acquireTimeoutMillis);
      
      try {
        // Check for available connections
        if (this.pool.available.length > 0) {
          const connectionId = this.pool.available.shift();
          const connection = this.pool.connections.get(connectionId);
          
          if (connection) {
            connection.inUse = true;
            connection.lastUsed = new Date();
            this.stats.activeConnections++;
            this.stats.idleConnections--;
            
            clearTimeout(timeout);
            resolve(connection);
            return;
          }
        }
        
        // Create new connection if under max limit
        if (this.pool.connections.size < this.config.max) {
          const connection = await this.createConnection();
          connection.inUse = true;
          this.stats.activeConnections++;
          
          clearTimeout(timeout);
          resolve(connection);
          return;
        }
        
        // Add to pending queue
        this.pool.pending.push({ resolve, reject, timeout });
        this.stats.pendingRequests++;
        
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }
  
  // Release a connection back to the pool
  releaseConnection(connection) {
    try {
      if (!connection || !this.pool.connections.has(connection.id)) {
        return;
      }
      
      connection.inUse = false;
      connection.lastUsed = new Date();
      this.stats.activeConnections--;
      this.stats.idleConnections++;
      
      // Check for pending requests
      if (this.pool.pending.length > 0) {
        const pending = this.pool.pending.shift();
        this.stats.pendingRequests--;
        
        connection.inUse = true;
        this.stats.activeConnections++;
        this.stats.idleConnections--;
        
        clearTimeout(pending.timeout);
        pending.resolve(connection);
        return;
      }
      
      // Return to available pool
      this.pool.available.push(connection.id);
      
    } catch (error) {
      console.error('Error releasing connection:', error);
    }
  }
  
  // Execute a query with connection pooling
  async query(sql, params = []) {
    const startTime = Date.now();
    let connection = null;
    
    try {
      connection = await this.acquireConnection();
      
      // Execute query
      const result = await connection.client.rpc('execute_sql', {
        query: sql,
        params: params
      });
      
      const queryTime = Date.now() - startTime;
      this.updateQueryStats(queryTime);
      connection.queryCount++;
      this.stats.totalQueries++;
      
      return result;
      
    } catch (error) {
      this.stats.failedQueries++;
      throw error;
    } finally {
      if (connection) {
        this.releaseConnection(connection);
      }
    }
  }
  
  // Update query performance statistics
  updateQueryStats(queryTime) {
    this.queryTimes.push(queryTime);
    
    // Keep only recent query times
    if (this.queryTimes.length > this.maxQueryHistorySize) {
      this.queryTimes.shift();
    }
    
    // Update max query time
    if (queryTime > this.stats.maxQueryTime) {
      this.stats.maxQueryTime = queryTime;
    }
    
    // Calculate average query time
    const sum = this.queryTimes.reduce((a, b) => a + b, 0);
    this.stats.avgQueryTime = Math.round(sum / this.queryTimes.length);
  }
  
  // Start pool monitoring
  startMonitoring() {
    setInterval(() => {
      this.cleanupIdleConnections();
      this.logPoolStats();
    }, this.config.reapIntervalMillis);
  }
  
  // Cleanup idle connections
  cleanupIdleConnections() {
    const now = new Date();
    const idleThreshold = this.config.idleTimeoutMillis;
    
    for (const [connectionId, connection] of this.pool.connections) {
      if (!connection.inUse && 
          (now - connection.lastUsed) > idleThreshold &&
          this.pool.connections.size > this.config.min) {
        
        // Remove from available pool
        const availableIndex = this.pool.available.indexOf(connectionId);
        if (availableIndex > -1) {
          this.pool.available.splice(availableIndex, 1);
        }
        
        // Close connection
        this.pool.connections.delete(connectionId);
        this.stats.totalConnections--;
        this.stats.idleConnections--;
        
        console.log(`Cleaned up idle connection: ${connectionId}`);
      }
    }
  }
  
  // Log pool statistics
  logPoolStats() {
    console.log('Database Pool Stats:', {
      totalConnections: this.stats.totalConnections,
      activeConnections: this.stats.activeConnections,
      idleConnections: this.stats.idleConnections,
      pendingRequests: this.stats.pendingRequests,
      totalQueries: this.stats.totalQueries,
      failedQueries: this.stats.failedQueries,
      avgQueryTime: `${this.stats.avgQueryTime}ms`,
      maxQueryTime: `${this.stats.maxQueryTime}ms`,
      successRate: `${((this.stats.totalQueries - this.stats.failedQueries) / Math.max(this.stats.totalQueries, 1) * 100).toFixed(2)}%`
    });
  }
  
  // Get pool health status
  getHealthStatus() {
    const successRate = (this.stats.totalQueries - this.stats.failedQueries) / Math.max(this.stats.totalQueries, 1) * 100;
    
    return {
      healthy: successRate > 95 && this.stats.avgQueryTime < 1000,
      stats: { ...this.stats },
      pool: {
        totalConnections: this.stats.totalConnections,
        activeConnections: this.stats.activeConnections,
        utilization: (this.stats.activeConnections / this.config.max * 100).toFixed(2) + '%'
      },
      performance: {
        successRate: successRate.toFixed(2) + '%',
        avgQueryTime: this.stats.avgQueryTime + 'ms',
        maxQueryTime: this.stats.maxQueryTime + 'ms'
      }
    };
  }
  
  // Gracefully shutdown the pool
  async shutdown() {
    console.log('Shutting down database connection pool...');
    
    // Clear monitoring interval
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Close all connections
    for (const [connectionId, connection] of this.pool.connections) {
      // Supabase connections don't need explicit closing
      console.log(`Closed connection: ${connectionId}`);
    }
    
    this.pool.connections.clear();
    this.pool.available = [];
    this.pool.pending = [];
    
    console.log('Database connection pool shutdown complete');
  }
}

// Singleton instance
let poolInstance = null;

// Get or create pool instance
function getConnectionPool() {
  if (!poolInstance) {
    poolInstance = new DatabaseConnectionPool();
  }
  return poolInstance;
}

// Initialize pool if not already initialized
async function initializePool() {
  const pool = getConnectionPool();
  if (!pool.pool) {
    await pool.initialize();
  }
  return pool;
}

module.exports = {
  DatabaseConnectionPool,
  getConnectionPool,
  initializePool
};
