#!/usr/bin/env node

/**
 * Playwright MCP Test Runner
 * Orchestrates comprehensive testing with professional reporting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class PlaywrightMCPTestRunner {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'testing', 'reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async runComprehensiveTests() {
    console.log('🎭 Starting Playwright MCP Comprehensive Testing...\n');
    
    const testSuites = [
      {
        name: 'E2E Study Creation Flow',
        command: 'npx playwright test testing/playwright-mcp/study-creation-flow.spec.js --project=chromium',
        critical: true
      },
      {
        name: 'Cross-Browser Compatibility (Chrome)',
        command: 'npx playwright test testing/playwright-mcp/cross-browser-tests.spec.js --project=chromium',
        critical: true
      },
      {
        name: 'Visual Regression Testing',
        command: 'npx playwright test testing/playwright-mcp/visual-regression.spec.js --project=chromium',
        critical: false
      }
    ];

    const results = {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0, critical_failures: 0 },
      suites: []
    };

    for (const suite of testSuites) {
      console.log(`🧪 Running: ${suite.name}...`);
      const startTime = Date.now();
      
      try {
        const output = execSync(suite.command, { 
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        
        const duration = Date.now() - startTime;
        const suiteResult = {
          name: suite.name,
          status: 'PASS',
          duration,
          critical: suite.critical,
          output: output.substring(0, 1000) // Truncate for report
        };
        
        results.suites.push(suiteResult);
        results.summary.passed++;
        
        console.log(`✅ ${suite.name} - ${duration}ms`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const suiteResult = {
          name: suite.name,
          status: 'FAIL',
          duration,
          critical: suite.critical,
          error: error.message.substring(0, 1000)
        };
        
        results.suites.push(suiteResult);
        results.summary.failed++;
        
        if (suite.critical) {
          results.summary.critical_failures++;
        }
        
        console.log(`❌ ${suite.name} - FAILED: ${error.message.split('\n')[0]}`);
      }
      
      results.summary.total++;
    }

    // Generate comprehensive report
    await this.generateReport(results);
    
    // Display summary
    this.displaySummary(results);
    
    return results;
  }

  async generateReport(results) {
    const reportPath = path.join(this.reportDir, `playwright-mcp-report-${this.timestamp}.json`);
    
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(results);
    const htmlPath = path.join(this.reportDir, `playwright-mcp-report-${this.timestamp}.html`);
    fs.writeFileSync(htmlPath, htmlReport);
    
    console.log(`\n📊 Reports generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
  }

  generateHTMLReport(results) {
    const passRate = (results.summary.passed / results.summary.total * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Playwright MCP Test Report - ${results.timestamp}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); text-align: center; }
        .metric-value { font-size: 2.5em; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .metric-label { color: #666; font-weight: 500; }
        .suite { background: white; margin: 15px 0; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
        .pass { border-left: 5px solid #10b981; }
        .fail { border-left: 5px solid #ef4444; }
        .critical { background: #fef2f2; }
        .suite-header { display: flex; align-items: center; margin-bottom: 15px; }
        .suite-status { font-size: 1.5em; margin-right: 10px; }
        .suite-name { font-size: 1.2em; font-weight: 600; color: #374151; }
        .suite-details { color: #6b7280; }
        .footer { background: white; padding: 25px; border-radius: 12px; text-align: center; margin-top: 30px; }
        .next-steps { background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 Playwright MCP Test Report</h1>
            <p><strong>Generated:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
            <p><strong>Test Environment:</strong> Local Development (localhost:5175)</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${results.summary.total}</div>
                <div class="metric-label">Total Test Suites</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #10b981;">${results.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #ef4444;">${results.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${passRate}%</div>
                <div class="metric-label">Pass Rate</div>
            </div>
        </div>
        
        <h2 style="color: #374151; margin-bottom: 20px;">📋 Test Suite Results</h2>
        ${results.suites.map(suite => `
            <div class="suite ${suite.status.toLowerCase()} ${suite.critical && suite.status === 'FAIL' ? 'critical' : ''}">
                <div class="suite-header">
                    <div class="suite-status">${suite.status === 'PASS' ? '✅' : '❌'}</div>
                    <div class="suite-name">${suite.name}</div>
                </div>
                <div class="suite-details">
                    <p><strong>Status:</strong> ${suite.status}</p>
                    <p><strong>Duration:</strong> ${suite.duration}ms</p>
                    <p><strong>Critical:</strong> ${suite.critical ? 'Yes' : 'No'}</p>
                    ${suite.error ? `<p><strong>Error:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${suite.error}</code></p>` : ''}
                </div>
            </div>
        `).join('')}
        
        <div class="footer">
            <div class="next-steps">
                <h3 style="margin-top: 0; color: #374151;">🎯 Next Steps</h3>
                ${results.summary.critical_failures > 0 ? 
                  '<p style="color: #ef4444;"><strong>⚠️ Critical failures detected!</strong> Address these issues before deployment.</p>' :
                  '<p style="color: #10b981;"><strong>✅ All critical tests passed!</strong> Ready for deployment.</p>'
                }
                <p>📊 View detailed Playwright reports: <code>npm run test:playwright:report</code></p>
                <p>🔄 Run tests again: <code>npm run test:playwright</code></p>
                <p>🎭 Run specific test: <code>npx playwright test --ui</code></p>
            </div>
            
            <div style="margin-top: 30px; color: #6b7280;">
                <p>Generated by ResearchHub Playwright MCP Testing Framework</p>
                <p>Timestamp: ${results.timestamp}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  displaySummary(results) {
    console.log('\n🎯 Playwright MCP Test Summary:');
    console.log('================================');
    console.log(`Total Suites: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Critical Failures: ${results.summary.critical_failures}`);
    
    const passRate = (results.summary.passed / results.summary.total * 100).toFixed(1);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (results.summary.critical_failures > 0) {
      console.log('\n⚠️  CRITICAL FAILURES DETECTED - DO NOT DEPLOY');
    } else {
      console.log('\n✅ ALL CRITICAL TESTS PASSED - READY FOR DEPLOYMENT');
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new PlaywrightMCPTestRunner();
  
  runner.runComprehensiveTests()
    .then(results => {
      process.exit(results.summary.critical_failures > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

export default PlaywrightMCPTestRunner;
