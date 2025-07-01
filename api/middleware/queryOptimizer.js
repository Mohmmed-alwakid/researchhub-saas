// Query Optimization and Performance Monitoring
// Provides intelligent query optimization and performance analytics

class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.slowQueries = new Map();
    this.queryStats = new Map();
    this.optimizationRules = new Map();
    
    // Performance thresholds
    this.thresholds = {
      slowQuery: 1000,      // 1 second
      verySlowQuery: 5000,  // 5 seconds
      cacheExpiry: 300000,  // 5 minutes
      maxCacheSize: 1000    // Maximum cached queries
    };
    
    this.initializeOptimizationRules();
  }
  
  // Initialize query optimization rules
  initializeOptimizationRules() {
    // SELECT query optimizations
    this.optimizationRules.set('select_optimization', {
      pattern: /SELECT \* FROM/gi,
      suggestion: 'Avoid SELECT *, specify needed columns explicitly',
      fix: (query) => query.replace(/SELECT \*/g, 'SELECT id, created_at, updated_at')
    });
    
    this.optimizationRules.set('missing_where', {
      pattern: /SELECT .+ FROM \w+ ORDER BY/gi,
      suggestion: 'Consider adding WHERE clause before ORDER BY',
      severity: 'medium'
    });
    
    this.optimizationRules.set('missing_limit', {
      pattern: /SELECT .+ FROM \w+(?!.*LIMIT)/gi,
      suggestion: 'Consider adding LIMIT clause for large tables',
      severity: 'low'
    });
    
    // JOIN optimizations
    this.optimizationRules.set('join_optimization', {
      pattern: /LEFT JOIN.*ON.*=.*WHERE.*IS NOT NULL/gi,
      suggestion: 'Consider using INNER JOIN instead of LEFT JOIN with NOT NULL filter',
      severity: 'medium'
    });
    
    // INDEX suggestions
    this.optimizationRules.set('index_suggestion', {
      pattern: /WHERE\s+(\w+)\s*=/gi,
      suggestion: 'Ensure indexed columns are used in WHERE clauses',
      severity: 'high'
    });
  }
  
  // Analyze and optimize a query
  analyzeQuery(sql, params = []) {
    const analysis = {
      originalQuery: sql,
      optimizedQuery: sql,
      suggestions: [],
      estimatedPerformance: 'unknown',
      cacheableScore: 0,
      riskLevel: 'low'
    };
    
    // Apply optimization rules
    for (const [ruleName, rule] of this.optimizationRules) {
      if (rule.pattern.test(sql)) {
        analysis.suggestions.push({
          rule: ruleName,
          message: rule.suggestion,
          severity: rule.severity || 'low'
        });
        
        // Apply fix if available
        if (rule.fix) {
          analysis.optimizedQuery = rule.fix(analysis.optimizedQuery);
        }
      }
    }
    
    // Calculate cacheability score
    analysis.cacheableScore = this.calculateCacheabilityScore(sql, params);
    
    // Estimate performance impact
    analysis.estimatedPerformance = this.estimatePerformance(sql);
    
    // Determine risk level
    analysis.riskLevel = this.assessRiskLevel(sql, analysis.suggestions);
    
    return analysis;
  }
  
  // Calculate how cacheable a query is
  calculateCacheabilityScore(sql, params) {
    let score = 0;
    
    // SELECT queries are more cacheable
    if (sql.toUpperCase().startsWith('SELECT')) {
      score += 40;
    }
    
    // Queries without parameters are more cacheable
    if (!params || params.length === 0) {
      score += 30;
    }
    
    // Queries without time-sensitive functions
    if (!/NOW\(\)|CURRENT_TIMESTAMP|RANDOM\(\)/gi.test(sql)) {
      score += 20;
    }
    
    // Simple WHERE clauses increase cacheability
    const whereMatches = sql.match(/WHERE/gi);
    if (whereMatches && whereMatches.length === 1) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }
  
  // Estimate query performance
  estimatePerformance(sql) {
    const upperSql = sql.toUpperCase();
    
    // High performance indicators
    if (upperSql.includes('WHERE') && upperSql.includes('LIMIT')) {
      return 'excellent';
    }
    
    // Medium performance indicators
    if (upperSql.includes('WHERE') || upperSql.includes('LIMIT')) {
      return 'good';
    }
    
    // Performance concerns
    if (upperSql.includes('SELECT *') || !upperSql.includes('WHERE')) {
      return 'poor';
    }
    
    // Complex queries
    const joinCount = (sql.match(/JOIN/gi) || []).length;
    const subqueryCount = (sql.match(/\(/g) || []).length;
    
    if (joinCount > 3 || subqueryCount > 2) {
      return 'complex';
    }
    
    return 'fair';
  }
  
  // Assess risk level of query
  assessRiskLevel(sql, suggestions) {
    const highRiskSuggestions = suggestions.filter(s => s.severity === 'high');
    const mediumRiskSuggestions = suggestions.filter(s => s.severity === 'medium');
    
    if (highRiskSuggestions.length > 0) {
      return 'high';
    }
    
    if (mediumRiskSuggestions.length > 1) {
      return 'medium';
    }
    
    // Check for other risk factors
    if (sql.toUpperCase().includes('DELETE') || sql.toUpperCase().includes('UPDATE')) {
      return 'medium';
    }
    
    return 'low';
  }
  
  // Execute query with optimization and monitoring
  async executeOptimizedQuery(queryFn, sql, params = [], options = {}) {
    const startTime = Date.now();
    const queryHash = this.hashQuery(sql, params);
    
    try {
      // Check cache first (for SELECT queries)
      if (options.useCache !== false && sql.toUpperCase().trim().startsWith('SELECT')) {
        const cached = this.getFromCache(queryHash);
        if (cached) {
          this.updateQueryStats(queryHash, Date.now() - startTime, true);
          return cached;
        }
      }
      
      // Analyze query before execution
      const analysis = this.analyzeQuery(sql, params);
      
      // Log performance warnings
      if (analysis.riskLevel === 'high') {
        console.warn('High-risk query detected:', {
          query: sql.substring(0, 100) + '...',
          suggestions: analysis.suggestions
        });
      }
      
      // Execute the query
      const result = await queryFn(analysis.optimizedQuery || sql, params);
      const executionTime = Date.now() - startTime;
      
      // Update statistics
      this.updateQueryStats(queryHash, executionTime, false);
      
      // Log slow queries
      if (executionTime > this.thresholds.slowQuery) {
        this.logSlowQuery(sql, params, executionTime, analysis);
      }
      
      // Cache result if appropriate
      if (analysis.cacheableScore > 50 && executionTime < this.thresholds.slowQuery) {
        this.cacheResult(queryHash, result);
      }
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateQueryStats(queryHash, executionTime, false, true);
      
      console.error('Query execution failed:', {
        query: sql.substring(0, 100) + '...',
        error: error.message,
        executionTime
      });
      
      throw error;
    }
  }
  
  // Generate hash for query caching
  hashQuery(sql, params) {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();
    const paramString = JSON.stringify(params);
    return `${normalizedSql}_${paramString}`;
  }
  
  // Get result from cache
  getFromCache(queryHash) {
    const cached = this.queryCache.get(queryHash);
    
    if (cached && Date.now() - cached.timestamp < this.thresholds.cacheExpiry) {
      return cached.result;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.queryCache.delete(queryHash);
    }
    
    return null;
  }
  
  // Cache query result
  cacheResult(queryHash, result) {
    // Prevent cache from growing too large
    if (this.queryCache.size >= this.thresholds.maxCacheSize) {
      // Remove oldest entries
      const entries = Array.from(this.queryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < Math.floor(this.thresholds.maxCacheSize * 0.1); i++) {
        this.queryCache.delete(entries[i][0]);
      }
    }
    
    this.queryCache.set(queryHash, {
      result,
      timestamp: Date.now()
    });
  }
  
  // Update query performance statistics
  updateQueryStats(queryHash, executionTime, fromCache, isError = false) {
    const existing = this.queryStats.get(queryHash) || {
      executions: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      cacheHits: 0,
      errors: 0,
      lastExecuted: null
    };
    
    existing.executions++;
    existing.lastExecuted = new Date();
    
    if (fromCache) {
      existing.cacheHits++;
    } else {
      existing.totalTime += executionTime;
      existing.avgTime = existing.totalTime / (existing.executions - existing.cacheHits);
      existing.minTime = Math.min(existing.minTime, executionTime);
      existing.maxTime = Math.max(existing.maxTime, executionTime);
    }
    
    if (isError) {
      existing.errors++;
    }
    
    this.queryStats.set(queryHash, existing);
  }
  
  // Log slow query for analysis
  logSlowQuery(sql, params, executionTime, analysis) {
    const slowQueryData = {
      sql,
      params,
      executionTime,
      analysis,
      timestamp: new Date(),
      count: 1
    };
    
    const queryKey = this.hashQuery(sql, params);
    const existing = this.slowQueries.get(queryKey);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
      if (executionTime > existing.maxTime) {
        existing.maxTime = executionTime;
      }
    } else {
      this.slowQueries.set(queryKey, {
        ...slowQueryData,
        maxTime: executionTime,
        lastSeen: new Date()
      });
    }
    
    console.warn(`Slow query detected (${executionTime}ms):`, {
      query: sql.substring(0, 200) + '...',
      suggestions: analysis.suggestions.map(s => s.message)
    });
  }
  
  // Get performance report
  getPerformanceReport() {
    const totalQueries = Array.from(this.queryStats.values())
      .reduce((sum, stat) => sum + stat.executions, 0);
    
    const totalCacheHits = Array.from(this.queryStats.values())
      .reduce((sum, stat) => sum + stat.cacheHits, 0);
    
    const avgExecutionTime = Array.from(this.queryStats.values())
      .reduce((sum, stat) => sum + stat.avgTime, 0) / this.queryStats.size || 0;
    
    const slowQueryCount = this.slowQueries.size;
    
    return {
      summary: {
        totalQueries,
        totalCacheHits,
        cacheHitRate: totalQueries > 0 ? (totalCacheHits / totalQueries * 100).toFixed(2) + '%' : '0%',
        avgExecutionTime: Math.round(avgExecutionTime) + 'ms',
        slowQueryCount,
        cachedQueries: this.queryCache.size
      },
      topSlowQueries: Array.from(this.slowQueries.entries())
        .sort((a, b) => b[1].maxTime - a[1].maxTime)
        .slice(0, 10)
        .map(([key, data]) => ({
          query: data.sql.substring(0, 100) + '...',
          maxTime: data.maxTime + 'ms',
          count: data.count,
          suggestions: data.analysis.suggestions.length
        })),
      cacheStats: {
        size: this.queryCache.size,
        maxSize: this.thresholds.maxCacheSize,
        utilization: (this.queryCache.size / this.thresholds.maxCacheSize * 100).toFixed(2) + '%'
      }
    };
  }
  
  // Clear cache and reset stats
  clearCache() {
    this.queryCache.clear();
    console.log('Query cache cleared');
  }
  
  // Clear all statistics
  resetStats() {
    this.queryStats.clear();
    this.slowQueries.clear();
    this.clearCache();
    console.log('Query optimizer statistics reset');
  }
}

// Singleton instance
let optimizerInstance = null;

// Get or create optimizer instance
function getQueryOptimizer() {
  if (!optimizerInstance) {
    optimizerInstance = new QueryOptimizer();
  }
  return optimizerInstance;
}

module.exports = {
  QueryOptimizer,
  getQueryOptimizer
};
