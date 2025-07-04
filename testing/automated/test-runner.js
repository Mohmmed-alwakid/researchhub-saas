// Automated Test Runner - Runs all tests throughout development cycle
// This script can be run daily, weekly, or before each deployment

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { testingConfig } from '../config/testing.config.js';

class AutomatedTestRunner {
  constructor() {
    this.config = testingConfig;
    this.reportDir = path.join(process.cwd(), 'testing', 'reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.results = {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        startTime: new Date().toISOString(),
        endTime: null
      },
      tests: {}
    };
  }

  // Ensure report directory exists
  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  // Run command and capture output
  async runCommand(command, testName) {
    return new Promise((resolve, reject) => {
      console.log(`🔄 Running ${testName}...`);
      const startTime = Date.now();
      
      exec(command, (error, stdout, stderr) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const result = {
          testName,
          command,
          duration,
          success: !error,
          stdout: stdout || '',
          stderr: stderr || '',
          error: error ? error.message : null
        };
        
        this.results.tests[testName] = result;
        this.results.summary.total++;
        
        if (error) {
          console.log(`❌ ${testName} failed (${duration}ms)`);
          this.results.summary.failed++;
          resolve(result);
        } else {
          console.log(`✅ ${testName} passed (${duration}ms)`);
          this.results.summary.passed++;
          resolve(result);
        }
      });
    });
  }

  // E2E Tests using Playwright
  async runE2ETests() {
    const testCommand = 'npx playwright test testing/automated/e2e --reporter=json';
    return await this.runCommand(testCommand, 'E2E Tests');
  }

  // Integration Tests
  async runIntegrationTests() {
    const testCommand = 'npx playwright test testing/automated/integration --reporter=json';
    return await this.runCommand(testCommand, 'Integration Tests');
  }

  // Unit Tests
  async runUnitTests() {
    const testCommand = 'npm test -- --passWithNoTests';
    return await this.runCommand(testCommand, 'Unit Tests');
  }

  // Performance Tests
  async runPerformanceTests() {
    const testCommand = 'node testing/performance/lighthouse-audit.js';
    return await this.runCommand(testCommand, 'Performance Tests');
  }

  // Accessibility Tests
  async runAccessibilityTests() {
    const testCommand = 'node testing/accessibility/a11y-audit.js';
    return await this.runCommand(testCommand, 'Accessibility Tests');
  }

  // Security Tests
  async runSecurityTests() {
    const testCommand = 'node testing/security/security-audit.js';
    return await this.runCommand(testCommand, 'Security Tests');
  }

  // Visual Regression Tests
  async runVisualTests() {
    const testCommand = 'npx playwright test testing/visual --reporter=json';
    return await this.runCommand(testCommand, 'Visual Tests');
  }

  // Type Checking
  async runTypeChecking() {
    const testCommand = 'npx tsc --noEmit';
    return await this.runCommand(testCommand, 'TypeScript Checking');
  }

  // Linting
  async runLinting() {
    const testCommand = 'npm run lint';
    return await this.runCommand(testCommand, 'Code Linting');
  }

  // Generate HTML Report
  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>ResearchHub Test Report - ${this.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .test-result.passed { border-left: 5px solid #28a745; }
        .test-result.failed { border-left: 5px solid #dc3545; }
        .output { background: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 12px; }
        .timestamp { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <h1>ResearchHub Test Report</h1>
    <div class="timestamp">Generated: ${this.results.summary.startTime}</div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Tests:</strong> ${this.results.summary.total}</p>
        <p><strong class="passed">Passed:</strong> ${this.results.summary.passed}</p>
        <p><strong class="failed">Failed:</strong> ${this.results.summary.failed}</p>
        <p><strong>Success Rate:</strong> ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%</p>
        <p><strong>Duration:</strong> ${this.results.summary.endTime ? 
          ((new Date(this.results.summary.endTime) - new Date(this.results.summary.startTime)) / 1000).toFixed(2) + 's' : 
          'In progress...'}</p>
    </div>

    <div class="test-results">
        <h2>Test Results</h2>
        ${Object.values(this.results.tests).map(test => `
            <div class="test-result ${test.success ? 'passed' : 'failed'}">
                <h3>${test.testName} ${test.success ? '✅' : '❌'}</h3>
                <p><strong>Duration:</strong> ${test.duration}ms</p>
                <p><strong>Command:</strong> <code>${test.command}</code></p>
                ${test.error ? `<p><strong>Error:</strong> ${test.error}</p>` : ''}
                ${test.stdout ? `<div class="output"><strong>Output:</strong><pre>${test.stdout}</pre></div>` : ''}
                ${test.stderr ? `<div class="output"><strong>Error Output:</strong><pre>${test.stderr}</pre></div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const reportPath = path.join(this.reportDir, `test-report-${this.timestamp}.html`);
    fs.writeFileSync(reportPath, html);
    console.log(`📊 HTML Report generated: ${reportPath}`);
  }

  // Generate JSON Report
  generateJSONReport() {
    const reportPath = path.join(this.reportDir, `test-report-${this.timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 JSON Report generated: ${reportPath}`);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive test suite...');
    this.ensureReportDir();

    const tests = [
      () => this.runTypeChecking(),
      () => this.runLinting(),
      () => this.runUnitTests(),
      () => this.runIntegrationTests(),
      () => this.runE2ETests(),
      () => this.runPerformanceTests(),
      () => this.runAccessibilityTests(),
      () => this.runSecurityTests(),
      () => this.runVisualTests()
    ];

    // Run tests sequentially to avoid conflicts
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error(`Test failed: ${error.message}`);
      }
    }

    this.results.summary.endTime = new Date().toISOString();
    
    // Generate reports
    this.generateHTMLReport();
    this.generateJSONReport();
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`Total: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    
    return this.results;
  }

  // Run quick smoke tests (for development)
  async runSmokeTests() {
    console.log('🔥 Running smoke tests...');
    this.ensureReportDir();

    const tests = [
      () => this.runTypeChecking(),
      () => this.runLinting(),
      () => this.runUnitTests()
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error(`Smoke test failed: ${error.message}`);
      }
    }

    this.results.summary.endTime = new Date().toISOString();
    this.generateHTMLReport();
    
    return this.results;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new AutomatedTestRunner();
  const testType = process.argv[2] || 'all';
  
  if (testType === 'smoke') {
    runner.runSmokeTests().then(results => {
      process.exit(results.summary.failed > 0 ? 1 : 0);
    });
  } else {
    runner.runAllTests().then(results => {
      process.exit(results.summary.failed > 0 ? 1 : 0);
    });
  }
}

export default AutomatedTestRunner;
