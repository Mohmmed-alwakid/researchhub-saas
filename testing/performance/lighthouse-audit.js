// Performance Testing Suite - Lighthouse + Custom Performance Tests
// Runs automatically to ensure app performance stays optimal

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { testingConfig } from '../config/testing.config.js';

class PerformanceTestSuite {
  constructor() {
    this.config = testingConfig;
    this.reportDir = path.join(process.cwd(), 'testing', 'reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  // Ensure report directory exists
  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  // Run Lighthouse audit for a single URL
  async runLighthouseAudit(url, options = {}) {
    console.log(`🔍 Running Lighthouse audit for ${url}...`);
    
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const lighthouseOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'seo'],
      port: chrome.port,
      ...options
    };

    const runnerResult = await lighthouse(url, lighthouseOptions);
    await chrome.kill();

    const scores = {
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      seo: runnerResult.lhr.categories.seo.score * 100
    };

    const metrics = {
      firstContentfulPaint: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
      speedIndex: runnerResult.lhr.audits['speed-index'].numericValue,
      timeToInteractive: runnerResult.lhr.audits['interactive'].numericValue,
      totalBlockingTime: runnerResult.lhr.audits['total-blocking-time'].numericValue
    };

    return {
      url,
      scores,
      metrics,
      rawReport: runnerResult.lhr,
      passed: {
        performance: scores.performance >= 90,
        accessibility: scores.accessibility >= 95,
        seo: scores.seo >= 90
      }
    };
  }

  // Run comprehensive performance tests
  async runPerformanceTests() {
    console.log('🚀 Starting performance test suite...');
    this.ensureReportDir();

    const testUrls = [
      this.config.environments.local.baseUrl,
      `${this.config.environments.local.baseUrl}/login`,
      `${this.config.environments.local.baseUrl}/dashboard`,
      `${this.config.environments.local.baseUrl}/create-study`,
      `${this.config.environments.local.baseUrl}/studies`
    ];

    const results = {
      summary: {
        total: testUrls.length,
        passed: 0,
        failed: 0,
        timestamp: new Date().toISOString()
      },
      tests: [],
      aggregated: {
        averagePerformance: 0,
        averageAccessibility: 0,
        averageSEO: 0,
        slowestPage: null,
        fastestPage: null
      }
    };

    // Run tests for each URL
    for (const url of testUrls) {
      try {
        const result = await this.runLighthouseAudit(url);
        results.tests.push(result);
        
        if (result.passed.performance && result.passed.accessibility && result.passed.seo) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        console.error(`❌ Performance test failed for ${url}: ${error.message}`);
        results.tests.push({
          url,
          error: error.message,
          passed: { performance: false, accessibility: false, seo: false }
        });
        results.summary.failed++;
      }
    }

    // Calculate aggregated metrics
    const validTests = results.tests.filter(test => !test.error);
    if (validTests.length > 0) {
      results.aggregated.averagePerformance = validTests.reduce((sum, test) => sum + test.scores.performance, 0) / validTests.length;
      results.aggregated.averageAccessibility = validTests.reduce((sum, test) => sum + test.scores.accessibility, 0) / validTests.length;
      results.aggregated.averageSEO = validTests.reduce((sum, test) => sum + test.scores.seo, 0) / validTests.length;
      
      results.aggregated.slowestPage = validTests.reduce((slowest, test) => 
        test.metrics.largestContentfulPaint > (slowest?.metrics.largestContentfulPaint || 0) ? test : slowest);
      
      results.aggregated.fastestPage = validTests.reduce((fastest, test) => 
        test.metrics.largestContentfulPaint < (fastest?.metrics.largestContentfulPaint || Infinity) ? test : fastest);
    }

    // Generate reports
    await this.generatePerformanceReport(results);
    
    return results;
  }

  // Generate performance report
  async generatePerformanceReport(results) {
    const reportPath = path.join(this.reportDir, `performance-report-${this.timestamp}.html`);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Report - ${this.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .score { font-size: 24px; font-weight: bold; }
        .good { color: #28a745; }
        .needs-improvement { color: #ffc107; }
        .poor { color: #dc3545; }
        .test-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <div class="timestamp">Generated: ${results.summary.timestamp}</div>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metrics-grid">
            <div class="metric">
                <div class="score ${results.aggregated.averagePerformance >= 90 ? 'good' : results.aggregated.averagePerformance >= 50 ? 'needs-improvement' : 'poor'}">
                    ${results.aggregated.averagePerformance.toFixed(1)}
                </div>
                <div>Average Performance</div>
            </div>
            <div class="metric">
                <div class="score ${results.aggregated.averageAccessibility >= 95 ? 'good' : results.aggregated.averageAccessibility >= 80 ? 'needs-improvement' : 'poor'}">
                    ${results.aggregated.averageAccessibility.toFixed(1)}
                </div>
                <div>Average Accessibility</div>
            </div>
            <div class="metric">
                <div class="score ${results.aggregated.averageSEO >= 90 ? 'good' : results.aggregated.averageSEO >= 70 ? 'needs-improvement' : 'poor'}">
                    ${results.aggregated.averageSEO.toFixed(1)}
                </div>
                <div>Average SEO</div>
            </div>
        </div>
        <p><strong>Total Tests:</strong> ${results.summary.total}</p>
        <p><strong>Passed:</strong> ${results.summary.passed}</p>
        <p><strong>Failed:</strong> ${results.summary.failed}</p>
    </div>

    <div class="test-results">
        <h2>Detailed Results</h2>
        <table>
            <thead>
                <tr>
                    <th>URL</th>
                    <th>Performance</th>
                    <th>Accessibility</th>
                    <th>SEO</th>
                    <th>FCP (ms)</th>
                    <th>LCP (ms)</th>
                    <th>TTI (ms)</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${results.tests.map(test => `
                    <tr>
                        <td>${test.url}</td>
                        ${test.error ? `
                            <td colspan="7" style="color: red;">Error: ${test.error}</td>
                        ` : `
                            <td class="${test.scores.performance >= 90 ? 'good' : test.scores.performance >= 50 ? 'needs-improvement' : 'poor'}">
                                ${test.scores.performance.toFixed(1)}
                            </td>
                            <td class="${test.scores.accessibility >= 95 ? 'good' : test.scores.accessibility >= 80 ? 'needs-improvement' : 'poor'}">
                                ${test.scores.accessibility.toFixed(1)}
                            </td>
                            <td class="${test.scores.seo >= 90 ? 'good' : test.scores.seo >= 70 ? 'needs-improvement' : 'poor'}">
                                ${test.scores.seo.toFixed(1)}
                            </td>
                            <td>${test.metrics.firstContentfulPaint.toFixed(0)}</td>
                            <td>${test.metrics.largestContentfulPaint.toFixed(0)}</td>
                            <td>${test.metrics.timeToInteractive.toFixed(0)}</td>
                            <td>${test.passed.performance && test.passed.accessibility && test.passed.seo ? '✅ Pass' : '❌ Fail'}</td>
                        `}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
            ${results.aggregated.averagePerformance < 90 ? '<li>⚡ Optimize JavaScript bundle size and loading</li>' : ''}
            ${results.aggregated.averageAccessibility < 95 ? '<li>♿ Review accessibility compliance (WCAG 2.1 AA)</li>' : ''}
            ${results.aggregated.averageSEO < 90 ? '<li>🔍 Improve SEO meta tags and structure</li>' : ''}
            ${results.aggregated.slowestPage ? `<li>🐌 Focus optimization on slowest page: ${results.aggregated.slowestPage.url}</li>` : ''}
        </ul>
    </div>
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`📊 Performance report generated: ${reportPath}`);

    // Also save JSON report
    const jsonReportPath = path.join(this.reportDir, `performance-report-${this.timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const performanceTest = new PerformanceTestSuite();
  performanceTest.runPerformanceTests().then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  });
}

export default PerformanceTestSuite;
