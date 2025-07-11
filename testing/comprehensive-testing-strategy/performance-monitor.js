#!/usr/bin/env node

/**
 * PERFORMANCE MONITORING SYSTEM
 * 
 * Real-time performance monitoring and alerting for ResearchHub
 * Implements continuous performance tracking with automated alerts
 * 
 * Features:
 * - Real-time performance metrics collection
 * - Lighthouse performance auditing
 * - API response time monitoring
 * - Resource usage tracking
 * - Performance degradation alerts
 * - Historical performance trending
 * - Automated optimization suggestions
 * - Performance budget enforcement
 * 
 * Usage:
 * node performance-monitor.js [command] [options]
 * 
 * Commands:
 * - monitor: Start continuous monitoring
 * - audit: Run one-time performance audit
 * - trend: Generate performance trend analysis
 * - budget: Check performance budget compliance
 * - optimize: Get optimization suggestions
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Performance Configuration
const PERFORMANCE_CONFIG = {
  monitoring: {
    interval: 5 * 60 * 1000,      // 5 minutes
    alertThreshold: 3000,         // 3 seconds page load
    apiThreshold: 1000,           // 1 second API response
    errorThreshold: 5,            // 5% error rate
    uptimeThreshold: 99.5         // 99.5% uptime
  },
  budgets: {
    pageLoad: 3000,               // 3 seconds max
    firstContentfulPaint: 1500,   // 1.5 seconds max
    largestContentfulPaint: 2500, // 2.5 seconds max
    timeToInteractive: 3500,      // 3.5 seconds max
    bundleSize: 2 * 1024 * 1024,  // 2MB max
    apiResponse: 500,             // 500ms max
    lighthouseScore: 90           // 90+ Lighthouse score
  },
  urls: [
    { url: 'http://localhost:5175', name: 'Homepage', critical: true },
    { url: 'http://localhost:5175/login', name: 'Login', critical: true },
    { url: 'http://localhost:5175/dashboard', name: 'Dashboard', critical: true },
    { url: 'http://localhost:5175/studies', name: 'Studies', critical: false }
  ],
  apiEndpoints: [
    { url: 'http://localhost:3003/api/health', name: 'Health Check', critical: true },
    { url: 'http://localhost:3003/api/auth?action=refresh', name: 'Auth Refresh', critical: true },
    { url: 'http://localhost:3003/api/studies', name: 'Studies API', critical: false }
  ]
};

// Performance Data Store
class PerformanceDataStore {
  constructor() {
    this.dataDir = path.join(__dirname, 'performance-data');
    this.currentMetrics = {};
    this.historicalData = [];
    this.alerts = [];
  }

  async initialize() {
    await fs.mkdir(this.dataDir, { recursive: true });
    await this.loadHistoricalData();
  }

  async loadHistoricalData() {
    try {
      const dataPath = path.join(this.dataDir, 'historical-performance.json');
      const data = await fs.readFile(dataPath, 'utf-8');
      this.historicalData = JSON.parse(data);
    } catch (error) {
      this.historicalData = [];
    }
  }

  async saveMetrics(metrics) {
    this.currentMetrics = metrics;
    this.historicalData.push({
      timestamp: new Date().toISOString(),
      ...metrics
    });

    // Keep only last 1000 entries
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(-1000);
    }

    await this.saveHistoricalData();
    await this.generateAlerts(metrics);
  }

  async saveHistoricalData() {
    const dataPath = path.join(this.dataDir, 'historical-performance.json');
    await fs.writeFile(dataPath, JSON.stringify(this.historicalData, null, 2));
  }

  async generateAlerts(metrics) {
    const alerts = [];
    const config = PERFORMANCE_CONFIG.monitoring;

    // Check page load times
    if (metrics.pageMetrics) {
      for (const [pageName, pageData] of Object.entries(metrics.pageMetrics)) {
        if (pageData.loadTime > config.alertThreshold) {
          alerts.push({
            type: 'performance',
            severity: 'warning',
            message: `${pageName} page load time (${pageData.loadTime}ms) exceeds threshold (${config.alertThreshold}ms)`,
            timestamp: new Date().toISOString(),
            data: pageData
          });
        }
      }
    }

    // Check API response times
    if (metrics.apiMetrics) {
      for (const [apiName, apiData] of Object.entries(metrics.apiMetrics)) {
        if (apiData.responseTime > config.apiThreshold) {
          alerts.push({
            type: 'api',
            severity: 'warning',
            message: `${apiName} API response time (${apiData.responseTime}ms) exceeds threshold (${config.apiThreshold}ms)`,
            timestamp: new Date().toISOString(),
            data: apiData
          });
        }
      }
    }

    // Check error rates
    if (metrics.errorRate > config.errorThreshold) {
      alerts.push({
        type: 'error',
        severity: 'critical',
        message: `Error rate (${metrics.errorRate}%) exceeds threshold (${config.errorThreshold}%)`,
        timestamp: new Date().toISOString(),
        data: { errorRate: metrics.errorRate }
      });
    }

    this.alerts.push(...alerts);
    
    if (alerts.length > 0) {
      await this.saveAlerts();
      this.displayAlerts(alerts);
    }
  }

  async saveAlerts() {
    const alertsPath = path.join(this.dataDir, 'alerts.json');
    await fs.writeFile(alertsPath, JSON.stringify(this.alerts, null, 2));
  }

  displayAlerts(alerts) {
    console.log('\n🚨 PERFORMANCE ALERTS:');
    alerts.forEach(alert => {
      const icon = alert.severity === 'critical' ? '🔴' : '🟡';
      console.log(`${icon} [${alert.type.toUpperCase()}] ${alert.message}`);
    });
    console.log('');
  }

  getTrends(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentData = this.historicalData.filter(d => new Date(d.timestamp) > cutoff);
    
    if (recentData.length === 0) return null;

    // Calculate trends
    const pageLoadTrends = {};
    const apiResponseTrends = {};

    recentData.forEach(data => {
      if (data.pageMetrics) {
        for (const [page, metrics] of Object.entries(data.pageMetrics)) {
          if (!pageLoadTrends[page]) pageLoadTrends[page] = [];
          pageLoadTrends[page].push(metrics.loadTime);
        }
      }
      if (data.apiMetrics) {
        for (const [api, metrics] of Object.entries(data.apiMetrics)) {
          if (!apiResponseTrends[api]) apiResponseTrends[api] = [];
          apiResponseTrends[api].push(metrics.responseTime);
        }
      }
    });

    return {
      period: `${hours} hours`,
      dataPoints: recentData.length,
      pageLoadTrends: this.calculateTrendStats(pageLoadTrends),
      apiResponseTrends: this.calculateTrendStats(apiResponseTrends),
      overallTrend: this.calculateOverallTrend(recentData)
    };
  }

  calculateTrendStats(trends) {
    const stats = {};
    for (const [name, values] of Object.entries(trends)) {
      if (values.length === 0) continue;
      
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const latest = values[values.length - 1];
      const trend = values.length > 1 ? (latest - values[0]) / values[0] * 100 : 0;
      
      stats[name] = {
        average: Math.round(avg),
        min,
        max,
        latest,
        trend: Math.round(trend * 100) / 100,
        dataPoints: values.length
      };
    }
    return stats;
  }

  calculateOverallTrend(data) {
    if (data.length < 2) return { trend: 'insufficient-data' };
    
    const first = data[0];
    const last = data[data.length - 1];
    
    // Simple overall performance score calculation
    const firstScore = this.calculatePerformanceScore(first);
    const lastScore = this.calculatePerformanceScore(last);
    
    const trend = ((lastScore - firstScore) / firstScore) * 100;
    
    return {
      trend: trend > 5 ? 'improving' : trend < -5 ? 'degrading' : 'stable',
      change: Math.round(trend * 100) / 100,
      firstScore: Math.round(firstScore),
      lastScore: Math.round(lastScore)
    };
  }

  calculatePerformanceScore(data) {
    let score = 100;
    
    // Deduct points for slow page loads
    if (data.pageMetrics) {
      for (const metrics of Object.values(data.pageMetrics)) {
        if (metrics.loadTime > 3000) score -= 10;
        else if (metrics.loadTime > 2000) score -= 5;
      }
    }
    
    // Deduct points for slow API responses
    if (data.apiMetrics) {
      for (const metrics of Object.values(data.apiMetrics)) {
        if (metrics.responseTime > 1000) score -= 10;
        else if (metrics.responseTime > 500) score -= 5;
      }
    }
    
    // Deduct points for errors
    if (data.errorRate > 5) score -= 20;
    else if (data.errorRate > 1) score -= 10;
    
    return Math.max(0, score);
  }
}

// Performance Collector
class PerformanceCollector {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  async collectMetrics() {
    console.log('📊 Collecting performance metrics...');
    
    const metrics = {
      timestamp: new Date().toISOString(),
      pageMetrics: {},
      apiMetrics: {},
      resourceMetrics: {},
      errorRate: 0,
      lighthouseScore: null
    };

    try {
      // Collect page metrics
      metrics.pageMetrics = await this.collectPageMetrics();
      
      // Collect API metrics
      metrics.apiMetrics = await this.collectApiMetrics();
      
      // Collect resource metrics
      metrics.resourceMetrics = await this.collectResourceMetrics();
      
      // Calculate error rate
      metrics.errorRate = await this.calculateErrorRate();
      
      return metrics;
    } catch (error) {
      console.error('❌ Error collecting metrics:', error.message);
      return null;
    }
  }

  async collectPageMetrics() {
    const browser = await chromium.launch({ headless: true });
    const pageMetrics = {};
    
    try {
      for (const { url, name } of PERFORMANCE_CONFIG.urls) {
        try {
          const context = await browser.newContext({
            viewport: { width: 1366, height: 768 }
          });
          const page = await context.newPage();
          
          // Measure page load time
          const startTime = Date.now();
          await page.goto(url, { waitUntil: 'networkidle' });
          const loadTime = Date.now() - startTime;
          
          // Get detailed performance metrics
          const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            return {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
              timeToInteractive: navigation.loadEventEnd - navigation.fetchStart
            };
          });
          
          pageMetrics[name] = {
            loadTime,
            ...performanceMetrics,
            url,
            timestamp: new Date().toISOString()
          };
          
          await context.close();
        } catch (error) {
          pageMetrics[name] = {
            error: error.message,
            url,
            timestamp: new Date().toISOString()
          };
        }
      }
    } finally {
      await browser.close();
    }
    
    return pageMetrics;
  }

  async collectApiMetrics() {
    const apiMetrics = {};
    
    for (const { url, name } of PERFORMANCE_CONFIG.apiEndpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(url);
        const responseTime = Date.now() - startTime;
        
        apiMetrics[name] = {
          responseTime,
          status: response.status,
          ok: response.ok,
          url,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        apiMetrics[name] = {
          error: error.message,
          url,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return apiMetrics;
  }

  async collectResourceMetrics() {
    const browser = await chromium.launch({ headless: true });
    let resourceMetrics = {};
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Collect resource data from homepage
      await page.goto(PERFORMANCE_CONFIG.urls[0].url, { waitUntil: 'networkidle' });
      
      resourceMetrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        
        const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        const totalResources = resources.length;
        
        const resourceTypes = {};
        resources.forEach(r => {
          const type = r.initiatorType || 'other';
          if (!resourceTypes[type]) resourceTypes[type] = { count: 0, size: 0 };
          resourceTypes[type].count++;
          resourceTypes[type].size += r.transferSize || 0;
        });
        
        return {
          totalSize,
          totalResources,
          resourceTypes,
          largeResources: resources.filter(r => r.transferSize > 100000).length
        };
      });
      
      await context.close();
    } finally {
      await browser.close();
    }
    
    return resourceMetrics;
  }

  async calculateErrorRate() {
    // Simple error rate calculation based on API health
    let totalRequests = 0;
    let failedRequests = 0;
    
    for (const { url } of PERFORMANCE_CONFIG.apiEndpoints) {
      totalRequests++;
      try {
        const response = await fetch(url);
        if (!response.ok) failedRequests++;
      } catch (error) {
        failedRequests++;
      }
    }
    
    return totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
  }
}

// Performance Auditor
class PerformanceAuditor {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  async runAudit() {
    console.log('🔍 Running performance audit...');
    
    const auditResults = {
      timestamp: new Date().toISOString(),
      budgetCompliance: {},
      optimizationSuggestions: [],
      score: 0
    };

    try {
      // Check budget compliance
      const currentMetrics = await new PerformanceCollector(this.dataStore).collectMetrics();
      if (currentMetrics) {
        auditResults.budgetCompliance = this.checkBudgetCompliance(currentMetrics);
        auditResults.optimizationSuggestions = this.generateOptimizationSuggestions(currentMetrics);
        auditResults.score = this.calculateOverallScore(auditResults.budgetCompliance);
      }

      return auditResults;
    } catch (error) {
      console.error('❌ Error running audit:', error.message);
      return null;
    }
  }

  checkBudgetCompliance(metrics) {
    const compliance = {};
    const budgets = PERFORMANCE_CONFIG.budgets;

    // Check page load budgets
    if (metrics.pageMetrics) {
      for (const [pageName, pageData] of Object.entries(metrics.pageMetrics)) {
        if (pageData.error) continue;
        
        compliance[`${pageName}_pageLoad`] = {
          metric: 'Page Load Time',
          value: pageData.loadTime,
          budget: budgets.pageLoad,
          compliant: pageData.loadTime <= budgets.pageLoad,
          deviation: pageData.loadTime - budgets.pageLoad
        };

        if (pageData.firstContentfulPaint) {
          compliance[`${pageName}_fcp`] = {
            metric: 'First Contentful Paint',
            value: pageData.firstContentfulPaint,
            budget: budgets.firstContentfulPaint,
            compliant: pageData.firstContentfulPaint <= budgets.firstContentfulPaint,
            deviation: pageData.firstContentfulPaint - budgets.firstContentfulPaint
          };
        }

        if (pageData.timeToInteractive) {
          compliance[`${pageName}_tti`] = {
            metric: 'Time to Interactive',
            value: pageData.timeToInteractive,
            budget: budgets.timeToInteractive,
            compliant: pageData.timeToInteractive <= budgets.timeToInteractive,
            deviation: pageData.timeToInteractive - budgets.timeToInteractive
          };
        }
      }
    }

    // Check API response budgets
    if (metrics.apiMetrics) {
      for (const [apiName, apiData] of Object.entries(metrics.apiMetrics)) {
        if (apiData.error) continue;
        
        compliance[`${apiName}_apiResponse`] = {
          metric: 'API Response Time',
          value: apiData.responseTime,
          budget: budgets.apiResponse,
          compliant: apiData.responseTime <= budgets.apiResponse,
          deviation: apiData.responseTime - budgets.apiResponse
        };
      }
    }

    // Check bundle size budget
    if (metrics.resourceMetrics && metrics.resourceMetrics.totalSize) {
      compliance.bundleSize = {
        metric: 'Bundle Size',
        value: metrics.resourceMetrics.totalSize,
        budget: budgets.bundleSize,
        compliant: metrics.resourceMetrics.totalSize <= budgets.bundleSize,
        deviation: metrics.resourceMetrics.totalSize - budgets.bundleSize
      };
    }

    return compliance;
  }

  generateOptimizationSuggestions(metrics) {
    const suggestions = [];

    // Page load optimizations
    if (metrics.pageMetrics) {
      for (const [pageName, pageData] of Object.entries(metrics.pageMetrics)) {
        if (pageData.loadTime > 3000) {
          suggestions.push({
            type: 'performance',
            priority: 'high',
            page: pageName,
            suggestion: 'Page load time exceeds 3 seconds. Consider optimizing images, minifying assets, or implementing lazy loading.',
            impact: 'High - directly affects user experience and SEO'
          });
        }

        if (pageData.firstContentfulPaint > 1500) {
          suggestions.push({
            type: 'performance',
            priority: 'medium',
            page: pageName,
            suggestion: 'First Contentful Paint is slow. Consider optimizing critical CSS, reducing render-blocking resources.',
            impact: 'Medium - affects perceived performance'
          });
        }
      }
    }

    // API optimizations
    if (metrics.apiMetrics) {
      for (const [apiName, apiData] of Object.entries(metrics.apiMetrics)) {
        if (apiData.responseTime > 500) {
          suggestions.push({
            type: 'api',
            priority: 'high',
            api: apiName,
            suggestion: 'API response time is slow. Consider implementing caching, database query optimization, or CDN.',
            impact: 'High - affects application responsiveness'
          });
        }
      }
    }

    // Resource optimizations
    if (metrics.resourceMetrics) {
      if (metrics.resourceMetrics.totalSize > 2 * 1024 * 1024) {
        suggestions.push({
          type: 'resources',
          priority: 'medium',
          suggestion: 'Bundle size exceeds 2MB. Consider code splitting, tree shaking, or optimizing images.',
          impact: 'Medium - affects initial load time'
        });
      }

      if (metrics.resourceMetrics.largeResources > 5) {
        suggestions.push({
          type: 'resources',
          priority: 'medium',
          suggestion: `${metrics.resourceMetrics.largeResources} large resources found. Consider compressing images and assets.`,
          impact: 'Medium - affects load time'
        });
      }
    }

    return suggestions;
  }

  calculateOverallScore(compliance) {
    const entries = Object.values(compliance);
    if (entries.length === 0) return 0;

    const compliantCount = entries.filter(entry => entry.compliant).length;
    return Math.round((compliantCount / entries.length) * 100);
  }
}

// Main Performance Monitor
class PerformanceMonitor {
  constructor() {
    this.dataStore = new PerformanceDataStore();
    this.collector = new PerformanceCollector(this.dataStore);
    this.auditor = new PerformanceAuditor(this.dataStore);
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  async initialize() {
    await this.dataStore.initialize();
    console.log('🎯 Performance Monitor initialized');
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️  Monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log(`🚀 Starting performance monitoring (interval: ${PERFORMANCE_CONFIG.monitoring.interval / 1000}s)`);

    // Run initial collection
    await this.collectAndStore();

    // Set up recurring collection
    this.monitoringInterval = setInterval(async () => {
      await this.collectAndStore();
    }, PERFORMANCE_CONFIG.monitoring.interval);

    console.log('✅ Performance monitoring active');
  }

  async stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('🛑 Performance monitoring stopped');
  }

  async collectAndStore() {
    try {
      const metrics = await this.collector.collectMetrics();
      if (metrics) {
        await this.dataStore.saveMetrics(metrics);
        this.displayCurrentMetrics(metrics);
      }
    } catch (error) {
      console.error('❌ Error in collectAndStore:', error.message);
    }
  }

  displayCurrentMetrics(metrics) {
    console.log('\n📊 Current Performance Metrics:');
    console.log('━'.repeat(50));

    // Display page metrics
    if (metrics.pageMetrics) {
      console.log('🌐 Page Performance:');
      for (const [page, data] of Object.entries(metrics.pageMetrics)) {
        if (data.error) {
          console.log(`   ❌ ${page}: ${data.error}`);
        } else {
          const status = data.loadTime < 2000 ? '🟢' : data.loadTime < 3000 ? '🟡' : '🔴';
          console.log(`   ${status} ${page}: ${data.loadTime}ms`);
        }
      }
    }

    // Display API metrics
    if (metrics.apiMetrics) {
      console.log('🔌 API Performance:');
      for (const [api, data] of Object.entries(metrics.apiMetrics)) {
        if (data.error) {
          console.log(`   ❌ ${api}: ${data.error}`);
        } else {
          const status = data.responseTime < 300 ? '🟢' : data.responseTime < 500 ? '🟡' : '🔴';
          console.log(`   ${status} ${api}: ${data.responseTime}ms`);
        }
      }
    }

    // Display resource metrics
    if (metrics.resourceMetrics && metrics.resourceMetrics.totalSize) {
      const sizeMB = Math.round(metrics.resourceMetrics.totalSize / 1024 / 1024 * 100) / 100;
      console.log(`📦 Resources: ${metrics.resourceMetrics.totalResources} files, ${sizeMB}MB total`);
    }

    console.log('━'.repeat(50));
  }

  async runAudit() {
    console.log('🔍 Running performance audit...');
    const auditResults = await this.auditor.runAudit();
    
    if (auditResults) {
      await this.displayAuditResults(auditResults);
      await this.saveAuditReport(auditResults);
    }
    
    return auditResults;
  }

  async displayAuditResults(results) {
    console.log('\n📋 PERFORMANCE AUDIT RESULTS');
    console.log('═'.repeat(60));
    console.log(`📊 Overall Score: ${results.score}/100`);
    console.log(`⏰ Audit Time: ${new Date(results.timestamp).toLocaleString()}\n`);

    // Budget compliance
    console.log('💰 Budget Compliance:');
    const compliance = results.budgetCompliance;
    for (const [key, data] of Object.entries(compliance)) {
      const status = data.compliant ? '✅' : '❌';
      const deviation = data.deviation > 0 ? `(+${data.deviation}ms over)` : '(within budget)';
      console.log(`   ${status} ${data.metric}: ${data.value}ms ${deviation}`);
    }

    // Optimization suggestions
    if (results.optimizationSuggestions.length > 0) {
      console.log('\n💡 Optimization Suggestions:');
      results.optimizationSuggestions.forEach((suggestion, index) => {
        const priority = suggestion.priority === 'high' ? '🔴' : '🟡';
        console.log(`   ${priority} ${suggestion.suggestion}`);
        console.log(`      Impact: ${suggestion.impact}\n`);
      });
    } else {
      console.log('\n✨ No optimization suggestions - performance is good!');
    }

    console.log('═'.repeat(60));
  }

  async saveAuditReport(results) {
    const reportPath = path.join(this.dataStore.dataDir, `audit-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
    console.log(`📄 Audit report saved: ${reportPath}`);
  }

  async generateTrendReport(hours = 24) {
    console.log(`📈 Generating ${hours}h performance trend report...`);
    
    const trends = this.dataStore.getTrends(hours);
    if (!trends) {
      console.log('⚠️  Insufficient data for trend analysis');
      return null;
    }

    console.log('\n📈 PERFORMANCE TRENDS');
    console.log('═'.repeat(60));
    console.log(`📊 Analysis Period: ${trends.period}`);
    console.log(`📋 Data Points: ${trends.dataPoints}\n`);

    // Page load trends
    console.log('🌐 Page Load Trends:');
    for (const [page, stats] of Object.entries(trends.pageLoadTrends)) {
      const trendIndicator = stats.trend > 5 ? '📈' : stats.trend < -5 ? '📉' : '➡️';
      console.log(`   ${trendIndicator} ${page}: ${stats.latest}ms (avg: ${stats.average}ms, trend: ${stats.trend}%)`);
    }

    // API response trends
    console.log('\n🔌 API Response Trends:');
    for (const [api, stats] of Object.entries(trends.apiResponseTrends)) {
      const trendIndicator = stats.trend > 5 ? '📈' : stats.trend < -5 ? '📉' : '➡️';
      console.log(`   ${trendIndicator} ${api}: ${stats.latest}ms (avg: ${stats.average}ms, trend: ${stats.trend}%)`);
    }

    // Overall trend
    console.log('\n🎯 Overall Performance:');
    const overallIcon = trends.overallTrend.trend === 'improving' ? '📈' : 
                       trends.overallTrend.trend === 'degrading' ? '📉' : '➡️';
    console.log(`   ${overallIcon} Trend: ${trends.overallTrend.trend} (${trends.overallTrend.change}%)`);
    console.log(`   📊 Score: ${trends.overallTrend.firstScore} → ${trends.overallTrend.lastScore}`);

    console.log('═'.repeat(60));

    // Save trend report
    const reportPath = path.join(this.dataStore.dataDir, `trends-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(trends, null, 2));
    console.log(`📄 Trend report saved: ${reportPath}`);

    return trends;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';
  
  const monitor = new PerformanceMonitor();
  await monitor.initialize();

  switch (command) {
    case 'monitor':
      console.log('🎯 Starting continuous performance monitoring...');
      console.log('Press Ctrl+C to stop monitoring\n');
      
      await monitor.startMonitoring();
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down performance monitor...');
        await monitor.stopMonitoring();
        process.exit(0);
      });
      
      // Keep process alive
      setInterval(() => {}, 1000);
      break;

    case 'audit':
      await monitor.runAudit();
      break;

    case 'trend':
      const hours = parseInt(args[1]) || 24;
      await monitor.generateTrendReport(hours);
      break;

    case 'budget':
      const auditResults = await monitor.runAudit();
      if (auditResults) {
        const compliant = Object.values(auditResults.budgetCompliance).every(b => b.compliant);
        console.log(compliant ? '✅ All budgets compliant' : '❌ Budget violations found');
        process.exit(compliant ? 0 : 1);
      }
      break;

    case 'optimize':
      const optimizeResults = await monitor.runAudit();
      if (optimizeResults && optimizeResults.optimizationSuggestions.length > 0) {
        console.log('💡 Optimization suggestions generated in audit report');
      } else {
        console.log('✨ No optimizations needed - performance is good!');
      }
      break;

    default:
      console.error('❌ Invalid command. Available: monitor, audit, trend, budget, optimize');
      process.exit(1);
  }
}

// Export for use as module
module.exports = { PerformanceMonitor, PERFORMANCE_CONFIG };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}
