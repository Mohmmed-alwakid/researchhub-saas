// Week 4 Day 1: Database Performance Analysis Utility
// Date: June 29, 2025

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Initialize Supabase client with service role for database access
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
);

/**
 * Comprehensive database performance analysis tool
 * Analyzes query performance, index usage, and identifies bottlenecks
 */
class DatabasePerformanceAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      slowQueries: [],
      indexUsage: [],
      tableStats: [],
      collaborationPerformance: [],
      recommendations: []
    };
  }

  /**
   * Run complete performance analysis
   */
  async runCompleteAnalysis() {
    console.log('🔍 Starting Database Performance Analysis...');
    console.log('================================================');

    try {
      await this.analyzeSlowQueries();
      await this.analyzeIndexUsage();
      await this.analyzeTablePerformance();
      await this.testCollaborationQueries();
      await this.generateRecommendations();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze slow-running queries using pg_stat_statements
   */
  async analyzeSlowQueries() {
    console.log('📊 Analyzing slow queries...');
    
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query: `
          SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows,
            100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS hit_percent
          FROM pg_stat_statements 
          WHERE calls > 5 AND mean_time > 100
          ORDER BY total_time DESC
          LIMIT 10;
        `
      });

      if (error) throw error;
      
      this.results.slowQueries = data || [];
      console.log(`   Found ${this.results.slowQueries.length} slow queries`);
    } catch (error) {
      console.log('   ⚠️  pg_stat_statements not available, skipping slow query analysis');
      this.results.slowQueries = [];
    }
  }

  /**
   * Analyze index usage efficiency
   */
  async analyzeIndexUsage() {
    console.log('📋 Analyzing index usage...');
    
    const { data, error } = await supabase.rpc('execute_sql', {
      query: `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch,
          CASE 
            WHEN idx_tup_read > 0 
            THEN (idx_tup_fetch::float / idx_tup_read * 100)::numeric(5,2)
            ELSE 0 
          END as efficiency_percent
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC;
      `
    });

    if (error) throw error;
    
    this.results.indexUsage = data || [];
    console.log(`   Analyzed ${this.results.indexUsage.length} indexes`);
  }

  /**
   * Analyze table performance statistics
   */
  async analyzeTablePerformance() {
    console.log('📈 Analyzing table performance...');
    
    const { data, error } = await supabase.rpc('execute_sql', {
      query: `
        SELECT 
          schemaname,
          tablename,
          n_tup_ins + n_tup_upd + n_tup_del as total_writes,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          CASE 
            WHEN seq_scan + idx_scan > 0 
            THEN (idx_scan::float / (seq_scan + idx_scan) * 100)::numeric(5,2)
            ELSE 0 
          END as index_usage_percent,
          n_dead_tup,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY total_writes DESC;
      `
    });

    if (error) throw error;
    
    this.results.tableStats = data || [];
    console.log(`   Analyzed ${this.results.tableStats.length} tables`);
  }

  /**
   * Test collaboration-specific query performance
   */
  async testCollaborationQueries() {
    console.log('🤝 Testing collaboration query performance...');
    
    const collaborationTests = [
      {
        name: 'Organization Members Lookup',
        query: `
          SELECT om.*, u.email 
          FROM organization_members om
          LEFT JOIN auth.users u ON om.user_id = u.id
          WHERE om.organization_id IN (
            SELECT id FROM organizations LIMIT 5
          );
        `
      },
      {
        name: 'Study Collaborators with Permissions',
        query: `
          SELECT sc.*, s.title, s.status
          FROM study_collaborators sc
          JOIN studies s ON sc.study_id = s.id
          WHERE sc.role IN ('editor', 'owner')
          ORDER BY sc.added_at DESC
          LIMIT 100;
        `
      },
      {
        name: 'Collaboration Activity Feed',
        query: `
          SELECT ca.*, s.title as study_title
          FROM collaboration_activity ca
          LEFT JOIN studies s ON ca.study_id = s.id
          WHERE ca.created_at >= NOW() - INTERVAL '7 days'
          ORDER BY ca.created_at DESC
          LIMIT 50;
        `
      },
      {
        name: 'Team Analytics Query',
        query: `
          SELECT 
            t.name,
            COUNT(DISTINCT tm.user_id) as member_count,
            COUNT(DISTINCT s.id) as studies_count
          FROM teams t
          LEFT JOIN team_members tm ON t.id = tm.team_id
          LEFT JOIN studies s ON s.created_by = tm.user_id
          GROUP BY t.id, t.name
          ORDER BY studies_count DESC;
        `
      }
    ];

    for (const test of collaborationTests) {
      try {
        const startTime = Date.now();
        
        const { data, error } = await supabase.rpc('execute_sql', {
          query: test.query
        });
        
        const executionTime = Date.now() - startTime;
        
        if (error) throw error;
        
        this.results.collaborationPerformance.push({
          testName: test.name,
          executionTime,
          resultCount: data?.length || 0,
          status: 'success'
        });
        
        console.log(`   ✅ ${test.name}: ${executionTime}ms (${data?.length || 0} rows)`);
      } catch (error) {
        this.results.collaborationPerformance.push({
          testName: test.name,
          executionTime: null,
          resultCount: 0,
          status: 'error',
          error: error.message
        });
        
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }
  }

  /**
   * Generate performance recommendations
   */
  async generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];

    // Check for missing indexes
    const tablesWithHighSeqScan = this.results.tableStats.filter(
      table => table.seq_scan > 1000 && table.index_usage_percent < 80
    );
    
    if (tablesWithHighSeqScan.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Indexing',
        title: 'Tables with high sequential scan ratio detected',
        description: `Tables ${tablesWithHighSeqScan.map(t => t.tablename).join(', ')} have high sequential scan usage. Consider adding appropriate indexes.`,
        tables: tablesWithHighSeqScan.map(t => t.tablename)
      });
    }

    // Check for slow collaboration queries
    const slowCollaborationQueries = this.results.collaborationPerformance.filter(
      test => test.executionTime > 200
    );
    
    if (slowCollaborationQueries.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Query Performance',
        title: 'Slow collaboration queries detected',
        description: `Queries ${slowCollaborationQueries.map(q => q.testName).join(', ')} are executing slowly. Optimization needed.`,
        queries: slowCollaborationQueries
      });
    }

    // Check for unused indexes
    const unusedIndexes = this.results.indexUsage.filter(
      index => index.idx_scan < 10 && !index.indexname.includes('pkey')
    );
    
    if (unusedIndexes.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Index Optimization',
        title: 'Unused indexes detected',
        description: `Indexes ${unusedIndexes.map(i => i.indexname).join(', ')} are rarely used and could be dropped to improve write performance.`,
        indexes: unusedIndexes.map(i => i.indexname)
      });
    }

    // Check for tables needing vacuum
    const tablesNeedingVacuum = this.results.tableStats.filter(
      table => table.n_dead_tup > 1000
    );
    
    if (tablesNeedingVacuum.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Maintenance',
        title: 'Tables need vacuuming',
        description: `Tables ${tablesNeedingVacuum.map(t => t.tablename).join(', ')} have high dead tuple counts and need vacuuming.`,
        tables: tablesNeedingVacuum.map(t => t.tablename)
      });
    }

    this.results.recommendations = recommendations;
    console.log(`   Generated ${recommendations.length} recommendations`);
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const report = {
      summary: {
        timestamp: this.results.timestamp,
        totalTables: this.results.tableStats.length,
        totalIndexes: this.results.indexUsage.length,
        slowQueries: this.results.slowQueries.length,
        recommendations: this.results.recommendations.length
      },
      performance: {
        averageCollaborationQueryTime: this.calculateAverageQueryTime(),
        fastestQuery: this.getFastestQuery(),
        slowestQuery: this.getSlowestQuery()
      },
      details: this.results
    };

    this.printReport(report);
    return report;
  }

  /**
   * Calculate average query execution time
   */
  calculateAverageQueryTime() {
    const successfulQueries = this.results.collaborationPerformance.filter(
      q => q.status === 'success' && q.executionTime
    );
    
    if (successfulQueries.length === 0) return 0;
    
    const totalTime = successfulQueries.reduce((sum, q) => sum + q.executionTime, 0);
    return Math.round(totalTime / successfulQueries.length);
  }

  /**
   * Get fastest query result
   */
  getFastestQuery() {
    const successfulQueries = this.results.collaborationPerformance.filter(
      q => q.status === 'success' && q.executionTime
    );
    
    if (successfulQueries.length === 0) return null;
    
    return successfulQueries.reduce((fastest, current) => 
      current.executionTime < fastest.executionTime ? current : fastest
    );
  }

  /**
   * Get slowest query result
   */
  getSlowestQuery() {
    const successfulQueries = this.results.collaborationPerformance.filter(
      q => q.status === 'success' && q.executionTime
    );
    
    if (successfulQueries.length === 0) return null;
    
    return successfulQueries.reduce((slowest, current) => 
      current.executionTime > slowest.executionTime ? current : slowest
    );
  }

  /**
   * Print formatted performance report
   */
  printReport(report) {
    console.log('\n📊 DATABASE PERFORMANCE ANALYSIS REPORT');
    console.log('==========================================');
    console.log(`📅 Analysis Date: ${report.summary.timestamp}`);
    console.log(`🏢 Tables Analyzed: ${report.summary.totalTables}`);
    console.log(`📋 Indexes Analyzed: ${report.summary.totalIndexes}`);
    console.log(`🐌 Slow Queries Found: ${report.summary.slowQueries}`);
    console.log(`💡 Recommendations: ${report.summary.recommendations}`);
    
    console.log('\n⚡ COLLABORATION QUERY PERFORMANCE');
    console.log('-----------------------------------');
    console.log(`📈 Average Query Time: ${report.performance.averageCollaborationQueryTime}ms`);
    
    if (report.performance.fastestQuery) {
      console.log(`🏃 Fastest Query: ${report.performance.fastestQuery.testName} (${report.performance.fastestQuery.executionTime}ms)`);
    }
    
    if (report.performance.slowestQuery) {
      console.log(`🐌 Slowest Query: ${report.performance.slowestQuery.testName} (${report.performance.slowestQuery.executionTime}ms)`);
    }

    console.log('\n💡 TOP RECOMMENDATIONS');
    console.log('------------------------');
    
    if (report.details.recommendations.length === 0) {
      console.log('✅ No critical performance issues detected!');
    } else {
      report.details.recommendations
        .sort((a, b) => {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 5)
        .forEach((rec, index) => {
          const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
          console.log(`${index + 1}. ${priority} [${rec.category}] ${rec.title}`);
          console.log(`   ${rec.description}`);
        });
    }

    console.log('\n🎯 NEXT STEPS');
    console.log('---------------');
    console.log('1. Apply performance optimization indexes from week4_day1_performance_optimization.sql');
    console.log('2. Implement Redis caching for frequently accessed collaboration data');
    console.log('3. Set up query performance monitoring in production');
    console.log('4. Schedule regular database maintenance and analytics refresh');
    
    console.log('\n✅ Performance analysis complete!');
  }
}

/**
 * Main execution function
 */
async function runPerformanceAnalysis() {
  try {
    const analyzer = new DatabasePerformanceAnalyzer();
    const report = await analyzer.runCompleteAnalysis();
    
    // Save report to file for later reference
    const reportPath = `performance_analysis_${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    return report;
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export {
  DatabasePerformanceAnalyzer,
  runPerformanceAnalysis
};

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceAnalysis();
}
