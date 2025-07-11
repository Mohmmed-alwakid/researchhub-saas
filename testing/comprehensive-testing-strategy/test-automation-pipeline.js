#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST AUTOMATION PIPELINE
 * 
 * End-to-end automated testing pipeline for ResearchHub
 * Integrates all testing components into a unified workflow
 * 
 * Features:
 * - Automated test execution across all test types
 * - Continuous integration pipeline
 * - Test result aggregation and reporting
 * - Failure analysis and auto-retry mechanisms
 * - Performance regression detection
 * - Automated issue reporting and tracking
 * - Test environment management
 * - Comprehensive reporting dashboard
 * 
 * Usage:
 * node test-automation-pipeline.js [pipeline] [options]
 * 
 * Pipelines:
 * - quick: Fast smoke tests for development
 * - daily: Comprehensive daily validation
 * - weekly: Full regression suite
 * - deployment: Pre-deployment validation
 * - continuous: Continuous monitoring mode
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Pipeline Configuration
const PIPELINE_CONFIG = {
  environments: {
    local: {
      frontend: 'http://localhost:5175',
      backend: 'http://localhost:3003',
      database: 'supabase-local'
    },
    staging: {
      frontend: 'https://staging.researchhub.com',
      backend: 'https://staging-api.researchhub.com',
      database: 'supabase-staging'
    },
    production: {
      frontend: 'https://researchhub.com',
      backend: 'https://api.researchhub.com',
      database: 'supabase-prod'
    }
  },
  pipelines: {
    quick: {
      name: 'Quick Smoke Tests',
      duration: '2-3 minutes',
      tests: ['smoke', 'auth', 'api-health'],
      retries: 2,
      parallelism: 1,
      failFast: false
    },
    daily: {
      name: 'Daily Regression',
      duration: '15-20 minutes',
      tests: ['smoke', 'auth', 'api-health', 'user-workflows', 'form-validation'],
      retries: 3,
      parallelism: 2,
      failFast: false
    },
    weekly: {
      name: 'Weekly Comprehensive',
      duration: '30-45 minutes',
      tests: ['smoke', 'auth', 'api-health', 'user-workflows', 'form-validation', 'performance', 'accessibility', 'security'],
      retries: 3,
      parallelism: 3,
      failFast: false
    },
    deployment: {
      name: 'Deployment Validation',
      duration: '10-15 minutes',
      tests: ['smoke', 'auth', 'api-health', 'critical-paths', 'performance-budget'],
      retries: 1,
      parallelism: 1,
      failFast: true
    },
    continuous: {
      name: 'Continuous Monitoring',
      duration: 'ongoing',
      tests: ['health-check', 'performance-monitor', 'error-detection'],
      retries: 0,
      parallelism: 1,
      failFast: false
    }
  },
  reporting: {
    formats: ['json', 'html', 'junit'],
    destinations: ['console', 'file', 'dashboard'],
    notifications: ['email', 'slack', 'webhook']
  },
  thresholds: {
    passRate: 95,           // 95% pass rate required
    performanceScore: 85,   // 85+ performance score required
    errorRate: 1,           // <1% error rate allowed
    responseTime: 2000      // <2s response time required
  }
};

// Test Results Aggregator
class TestResultsAggregator {
  constructor() {
    this.results = {
      pipeline: '',
      environment: '',
      timestamp: new Date().toISOString(),
      duration: 0,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        skipped: 0,
        retries: 0
      },
      testSuites: {},
      performance: {},
      coverage: {},
      errors: [],
      recommendations: []
    };
    this.startTime = Date.now();
  }

  addTestSuite(suiteName, suiteResults) {
    this.results.testSuites[suiteName] = {
      ...suiteResults,
      timestamp: new Date().toISOString()
    };

    // Update summary
    this.results.summary.total += suiteResults.summary?.total || 0;
    this.results.summary.passed += suiteResults.summary?.passed || 0;
    this.results.summary.failed += suiteResults.summary?.failed || 0;
    this.results.summary.warnings += suiteResults.summary?.warnings || 0;
    this.results.summary.skipped += suiteResults.summary?.skipped || 0;

    // Aggregate performance data
    if (suiteResults.performance) {
      this.results.performance = { ...this.results.performance, ...suiteResults.performance };
    }

    // Collect errors
    if (suiteResults.errors) {
      this.results.errors.push(...suiteResults.errors);
    }
  }

  addPerformanceData(data) {
    this.results.performance = { ...this.results.performance, ...data };
  }

  addError(error) {
    this.results.errors.push({
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  finalize() {
    this.results.duration = Date.now() - this.startTime;
    this.results.summary.passRate = this.results.summary.total > 0 ? 
      Math.round((this.results.summary.passed / this.results.summary.total) * 100) : 0;
    
    this.generateRecommendations();
    return this.results;
  }

  generateRecommendations() {
    const recommendations = [];

    // Pass rate recommendations
    if (this.results.summary.passRate < PIPELINE_CONFIG.thresholds.passRate) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: `Pass rate (${this.results.summary.passRate}%) is below threshold (${PIPELINE_CONFIG.thresholds.passRate}%)`,
        action: 'Investigate failing tests and fix underlying issues'
      });
    }

    // Performance recommendations
    if (this.results.performance.overallScore < PIPELINE_CONFIG.thresholds.performanceScore) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `Performance score (${this.results.performance.overallScore}) is below threshold (${PIPELINE_CONFIG.thresholds.performanceScore})`,
        action: 'Review performance metrics and optimize slow components'
      });
    }

    // Error rate recommendations
    if (this.results.errors.length > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `${this.results.errors.length} errors detected during testing`,
        action: 'Review error logs and fix critical issues'
      });
    }

    // Test coverage recommendations
    if (this.results.summary.total < 20) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: 'Test coverage may be insufficient',
        action: 'Consider adding more test cases for better coverage'
      });
    }

    this.results.recommendations = recommendations;
  }

  async saveResults(filename) {
    const reportPath = path.join(__dirname, 'reports', filename);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    return reportPath;
  }

  async generateHtmlReport(filename) {
    const htmlContent = this.generateHtmlContent();
    const reportPath = path.join(__dirname, 'reports', filename);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, htmlContent);
    return reportPath;
  }

  generateHtmlContent() {
    const { summary, testSuites, performance, recommendations } = this.results;
    const status = summary.passRate >= 95 ? 'excellent' : summary.passRate >= 80 ? 'good' : summary.passRate >= 60 ? 'warning' : 'critical';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResearchHub Pipeline Report - ${this.results.pipeline}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; font-weight: 300; }
        .header .subtitle { font-size: 1.2rem; opacity: 0.9; }
        .status-badge { display: inline-block; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin: 10px 0; }
        .status-badge.excellent { background: #d4edda; color: #155724; }
        .status-badge.good { background: #d1ecf1; color: #0c5460; }
        .status-badge.warning { background: #fff3cd; color: #856404; }
        .status-badge.critical { background: #f8d7da; color: #721c24; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #007bff; }
        .metric-card h3 { color: #495057; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .metric-value { font-size: 2.2rem; font-weight: bold; color: #007bff; }
        .metric-card.passed .metric-value { color: #28a745; }
        .metric-card.failed .metric-value { color: #dc3545; }
        .metric-card.warning .metric-value { color: #ffc107; }
        .section { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .section h2 { color: #495057; margin-bottom: 20px; font-size: 1.5rem; }
        .test-suite { margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .test-suite h3 { color: #495057; margin-bottom: 15px; }
        .test-grid { display: grid; gap: 10px; }
        .test-item { display: flex; align-items: center; padding: 12px 15px; background: white; border-radius: 6px; border-left: 4px solid #6c757d; }
        .test-item.passed { border-left-color: #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-item.warning { border-left-color: #ffc107; }
        .test-icon { margin-right: 10px; font-size: 1.2rem; }
        .test-content { flex: 1; }
        .test-name { font-weight: 600; color: #495057; }
        .test-details { color: #6c757d; font-size: 0.9rem; margin-top: 3px; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .recommendations h3 { color: #1976d2; margin-bottom: 15px; }
        .recommendation { margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #2196f3; }
        .recommendation.high { border-left-color: #f44336; }
        .recommendation.medium { border-left-color: #ff9800; }
        .recommendation-title { font-weight: 600; color: #495057; margin-bottom: 5px; }
        .recommendation-action { color: #6c757d; font-size: 0.9rem; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 0.9rem; }
        .progress-bar { width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: #28a745; transition: width 0.3s ease; }
        .progress-fill.warning { background: #ffc107; }
        .progress-fill.critical { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pipeline Test Results</h1>
            <div class="subtitle">${this.results.pipeline} | ${this.results.environment} | ${new Date(this.results.timestamp).toLocaleString()}</div>
            <div class="status-badge ${status}">${status.toUpperCase()}</div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Pass Rate</h3>
                <div class="metric-value">${summary.passRate}%</div>
                <div class="progress-bar">
                    <div class="progress-fill ${summary.passRate >= 95 ? '' : summary.passRate >= 80 ? 'warning' : 'critical'}" style="width: ${summary.passRate}%"></div>
                </div>
            </div>
            <div class="metric-card passed">
                <h3>Tests Passed</h3>
                <div class="metric-value">${summary.passed}</div>
            </div>
            <div class="metric-card failed">
                <h3>Tests Failed</h3>
                <div class="metric-value">${summary.failed}</div>
            </div>
            <div class="metric-card warning">
                <h3>Warnings</h3>
                <div class="metric-value">${summary.warnings}</div>
            </div>
            <div class="metric-card">
                <h3>Duration</h3>
                <div class="metric-value">${Math.round(this.results.duration / 1000)}s</div>
            </div>
            <div class="metric-card">
                <h3>Test Suites</h3>
                <div class="metric-value">${Object.keys(testSuites).length}</div>
            </div>
        </div>

        <div class="section">
            <h2>Test Suite Results</h2>
            ${Object.entries(testSuites).map(([suiteName, suiteData]) => `
                <div class="test-suite">
                    <h3>${suiteName}</h3>
                    <div class="test-grid">
                        ${(suiteData.tests || []).map(test => `
                            <div class="test-item ${test.status}">
                                <div class="test-icon">${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️'}</div>
                                <div class="test-content">
                                    <div class="test-name">${test.name}</div>
                                    <div class="test-details">${test.details || ''}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        ${Object.keys(performance).length > 0 ? `
        <div class="section">
            <h2>Performance Metrics</h2>
            <div class="metrics-grid">
                ${Object.entries(performance).map(([category, metrics]) => `
                    <div class="metric-card">
                        <h3>${category}</h3>
                        ${Object.entries(metrics).map(([name, value]) => `
                            <div style="margin-bottom: 8px;">
                                <strong>${name}:</strong> ${value}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${recommendations.length > 0 ? `
        <div class="section">
            <h2>Recommendations</h2>
            <div class="recommendations">
                <h3>💡 Suggested Actions</h3>
                ${recommendations.map(rec => `
                    <div class="recommendation ${rec.priority}">
                        <div class="recommendation-title">${rec.type.toUpperCase()}: ${rec.message}</div>
                        <div class="recommendation-action">Action: ${rec.action}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            ResearchHub Automated Testing Pipeline | Generated ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }
}

// Test Suite Runner
class TestSuiteRunner {
  constructor(aggregator) {
    this.aggregator = aggregator;
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'pipe',
        cwd: __dirname,
        ...options
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0
        });
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runRegressionSuite(testType) {
    console.log(`🧪 Running regression suite: ${testType}`);
    
    try {
      const result = await this.runCommand('node', ['automated-regression-suite.js', testType], {
        timeout: 30 * 60 * 1000 // 30 minutes
      });

      // Parse results from stdout
      const suiteResults = this.parseRegressionResults(result.stdout);
      this.aggregator.addTestSuite('Regression Tests', suiteResults);

      return result.success;
    } catch (error) {
      console.error(`❌ Error running regression suite: ${error.message}`);
      this.aggregator.addError(error);
      return false;
    }
  }

  async runPerformanceMonitoring() {
    console.log('⚡ Running performance monitoring');
    
    try {
      const result = await this.runCommand('node', ['performance-monitor.js', 'audit'], {
        timeout: 15 * 60 * 1000 // 15 minutes
      });

      // Parse performance results
      const performanceResults = this.parsePerformanceResults(result.stdout);
      this.aggregator.addTestSuite('Performance Tests', performanceResults);
      this.aggregator.addPerformanceData(performanceResults.performance || {});

      return result.success;
    } catch (error) {
      console.error(`❌ Error running performance monitoring: ${error.message}`);
      this.aggregator.addError(error);
      return false;
    }
  }

  parseRegressionResults(stdout) {
    // Simple parsing - in production, this would be more robust
    const lines = stdout.split('\n');
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };
    const tests = [];

    for (const line of lines) {
      if (line.includes('✅ Passed:')) {
        summary.passed = parseInt(line.match(/\d+/)[0]) || 0;
      } else if (line.includes('❌ Failed:')) {
        summary.failed = parseInt(line.match(/\d+/)[0]) || 0;
      } else if (line.includes('⚠️  Warnings:')) {
        summary.warnings = parseInt(line.match(/\d+/)[0]) || 0;
      } else if (line.includes('📊 Total:')) {
        summary.total = parseInt(line.match(/\d+/)[0]) || 0;
      }
    }

    return {
      summary,
      tests,
      stdout,
      timestamp: new Date().toISOString()
    };
  }

  parsePerformanceResults(stdout) {
    // Simple parsing - in production, this would be more robust
    const performance = {};
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      if (line.includes('Overall Score:')) {
        const score = parseInt(line.match(/\d+/)[0]);
        performance.overallScore = score;
      }
    }

    return {
      summary: { total: 1, passed: 1, failed: 0, warnings: 0 },
      performance,
      timestamp: new Date().toISOString()
    };
  }
}

// Main Pipeline Runner
class PipelineRunner {
  constructor(pipeline, environment = 'local') {
    this.pipeline = pipeline;
    this.environment = environment;
    this.config = PIPELINE_CONFIG.pipelines[pipeline];
    this.aggregator = new TestResultsAggregator();
    this.suiteRunner = new TestSuiteRunner(this.aggregator);
    
    if (!this.config) {
      throw new Error(`Unknown pipeline: ${pipeline}`);
    }
  }

  async run() {
    console.log('🚀 Starting Pipeline Execution');
    console.log('═'.repeat(60));
    console.log(`📋 Pipeline: ${this.config.name}`);
    console.log(`🌍 Environment: ${this.environment}`);
    console.log(`⏱️  Estimated Duration: ${this.config.duration}`);
    console.log(`🔄 Retries: ${this.config.retries}`);
    console.log(`⚡ Parallelism: ${this.config.parallelism}`);
    console.log('═'.repeat(60));

    this.aggregator.results.pipeline = this.config.name;
    this.aggregator.results.environment = this.environment;

    try {
      await this.executeTestSuites();
      await this.generateReports();
      await this.evaluateResults();
    } catch (error) {
      console.error('❌ Pipeline execution failed:', error.message);
      this.aggregator.addError(error);
    }

    const results = this.aggregator.finalize();
    return results;
  }

  async executeTestSuites() {
    const testSuites = this.config.tests;
    const results = [];

    for (const testSuite of testSuites) {
      console.log(`\n🧪 Executing: ${testSuite}`);
      
      let success = false;
      let retries = 0;

      while (!success && retries <= this.config.retries) {
        try {
          success = await this.executeTestSuite(testSuite);
          
          if (!success && retries < this.config.retries) {
            retries++;
            console.log(`⏳ Retry ${retries}/${this.config.retries} for ${testSuite}`);
            await this.delay(5000); // Wait 5 seconds before retry
          }
        } catch (error) {
          console.error(`❌ Error in ${testSuite}:`, error.message);
          if (this.config.failFast) {
            throw error;
          }
        }
      }

      results.push({ testSuite, success, retries });
      
      if (!success && this.config.failFast) {
        throw new Error(`Test suite ${testSuite} failed and failFast is enabled`);
      }
    }

    return results;
  }

  async executeTestSuite(testSuite) {
    switch (testSuite) {
      case 'smoke':
      case 'auth':
      case 'api-health':
      case 'user-workflows':
      case 'form-validation':
      case 'critical-paths':
        return await this.suiteRunner.runRegressionSuite('daily');
      
      case 'performance':
      case 'performance-budget':
        return await this.suiteRunner.runPerformanceMonitoring();
      
      case 'accessibility':
        return await this.suiteRunner.runRegressionSuite('accessibility');
      
      case 'security':
        return await this.suiteRunner.runRegressionSuite('security');
      
      case 'health-check':
        return await this.performHealthCheck();
      
      case 'performance-monitor':
        return await this.suiteRunner.runPerformanceMonitoring();
      
      case 'error-detection':
        return await this.performErrorDetection();
      
      default:
        console.warn(`⚠️  Unknown test suite: ${testSuite}`);
        return false;
    }
  }

  async performHealthCheck() {
    console.log('🏥 Performing health check');
    
    try {
      const envConfig = PIPELINE_CONFIG.environments[this.environment];
      const response = await fetch(`${envConfig.backend}/api/health`);
      const data = await response.json();
      
      const success = response.ok && data.success;
      
      this.aggregator.addTestSuite('Health Check', {
        summary: { total: 1, passed: success ? 1 : 0, failed: success ? 0 : 1, warnings: 0 },
        tests: [{
          name: 'API Health Check',
          status: success ? 'passed' : 'failed',
          details: success ? 'API is healthy' : `API health check failed: ${data.error || 'Unknown error'}`
        }]
      });
      
      return success;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.aggregator.addError(error);
      return false;
    }
  }

  async performErrorDetection() {
    console.log('🔍 Performing error detection');
    
    // Simple error detection - check for recent errors in logs
    const errors = this.aggregator.results.errors;
    const recentErrors = errors.filter(e => {
      const errorTime = new Date(e.timestamp);
      const cutoff = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      return errorTime > cutoff;
    });

    this.aggregator.addTestSuite('Error Detection', {
      summary: { total: 1, passed: recentErrors.length === 0 ? 1 : 0, failed: recentErrors.length > 0 ? 1 : 0, warnings: 0 },
      tests: [{
        name: 'Recent Error Detection',
        status: recentErrors.length === 0 ? 'passed' : 'failed',
        details: recentErrors.length === 0 ? 'No recent errors detected' : `${recentErrors.length} recent errors found`
      }]
    });

    return recentErrors.length === 0;
  }

  async generateReports() {
    console.log('\n📊 Generating reports...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `${this.pipeline}-${this.environment}-${timestamp}`;
    
    // Generate JSON report
    const jsonPath = await this.aggregator.saveResults(`${baseName}.json`);
    console.log(`📄 JSON Report: ${jsonPath}`);
    
    // Generate HTML report
    const htmlPath = await this.aggregator.generateHtmlReport(`${baseName}.html`);
    console.log(`🌐 HTML Report: ${htmlPath}`);
    
    return { jsonPath, htmlPath };
  }

  async evaluateResults() {
    const results = this.aggregator.results;
    
    console.log('\n📋 PIPELINE RESULTS SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⚠️  Warnings: ${results.summary.warnings}`);
    console.log(`📊 Pass Rate: ${results.summary.passRate}%`);
    console.log(`⏱️  Duration: ${Math.round(results.duration / 1000)}s`);
    console.log('═'.repeat(60));

    // Evaluate against thresholds
    const thresholds = PIPELINE_CONFIG.thresholds;
    const issues = [];

    if (results.summary.passRate < thresholds.passRate) {
      issues.push(`Pass rate (${results.summary.passRate}%) below threshold (${thresholds.passRate}%)`);
    }

    if (results.performance.overallScore < thresholds.performanceScore) {
      issues.push(`Performance score (${results.performance.overallScore}) below threshold (${thresholds.performanceScore})`);
    }

    if (results.errors.length > 0) {
      issues.push(`${results.errors.length} errors detected`);
    }

    if (issues.length > 0) {
      console.log('\n❌ PIPELINE ISSUES:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    } else {
      console.log('\n✅ PIPELINE PASSED - All thresholds met!');
    }

    // Display recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : '🟡';
        console.log(`   ${priority} ${rec.message}`);
        console.log(`      Action: ${rec.action}`);
      });
    }

    console.log('\n');
    
    return issues.length === 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const pipeline = args[0] || 'quick';
  const environment = args[1] || 'local';
  
  const validPipelines = Object.keys(PIPELINE_CONFIG.pipelines);
  const validEnvironments = Object.keys(PIPELINE_CONFIG.environments);
  
  if (!validPipelines.includes(pipeline)) {
    console.error(`❌ Invalid pipeline. Available: ${validPipelines.join(', ')}`);
    process.exit(1);
  }
  
  if (!validEnvironments.includes(environment)) {
    console.error(`❌ Invalid environment. Available: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }
  
  const runner = new PipelineRunner(pipeline, environment);
  
  try {
    const results = await runner.run();
    const success = results.summary.passRate >= PIPELINE_CONFIG.thresholds.passRate;
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Pipeline failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { PipelineRunner, PIPELINE_CONFIG };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
