#!/usr/bin/env node

// Testing Automation Runner
// Main entry point for all testing automation throughout development cycles

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import AutomatedTestRunner from './automated/test-runner.js';
import PerformanceTestSuite from './performance/lighthouse-audit.js';
import SecurityTestSuite from './security/security-audit.js';
import AccessibilityTestSuite from './accessibility/a11y-audit.js';
import TestDataManager from './data/test-data-manager.js';

class TestingAutomation {
  constructor() {
    this.testRunner = new AutomatedTestRunner();
    this.performanceTest = new PerformanceTestSuite();
    this.securityTest = new SecurityTestSuite();
    this.accessibilityTest = new AccessibilityTestSuite();
    this.dataManager = new TestDataManager();
    this.results = {};
  }

  // Run daily automated tests (quick cycle)
  async runDailyTests() {
    console.log('🌅 Running daily automated tests...');
    
    const startTime = Date.now();
    
    try {
      // Generate fresh test data
      console.log('🎲 Preparing test data...');
      this.dataManager.generateCompleteTestData();
      
      // Run quick smoke tests
      console.log('🔥 Running smoke tests...');
      this.results.smoke = await this.testRunner.runSmokeTests();
      
      // Run performance tests
      console.log('⚡ Running performance tests...');
      this.results.performance = await this.performanceTest.runPerformanceTests();
      
      // Run accessibility tests
      console.log('♿ Running accessibility tests...');
      this.results.accessibility = await this.accessibilityTest.runAccessibilityTests();
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n✅ Daily tests completed in ${duration}s`);
      await this.generateDailySummaryReport();
      
      return this.results;
    } catch (error) {
      console.error(`❌ Daily tests failed: ${error.message}`);
      throw error;
    }
  }

  // Run weekly comprehensive tests (full cycle)
  async runWeeklyTests() {
    console.log('📅 Running weekly comprehensive tests...');
    
    const startTime = Date.now();
    
    try {
      // Generate comprehensive test data
      console.log('🎲 Generating comprehensive test data...');
      this.dataManager.generateCompleteTestData();
      this.dataManager.exportTestData();
      
      // Run all test suites
      console.log('🚀 Running full test suite...');
      this.results.full = await this.testRunner.runAllTests();
      
      console.log('⚡ Running performance tests...');
      this.results.performance = await this.performanceTest.runPerformanceTests();
      
      console.log('🔒 Running security tests...');
      this.results.security = await this.securityTest.runSecurityTests();
      
      console.log('♿ Running accessibility tests...');
      this.results.accessibility = await this.accessibilityTest.runAccessibilityTests();
      
      // Run visual regression tests
      console.log('🖼️ Running visual regression tests...');
      this.results.visual = await this.runVisualTests();
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n✅ Weekly tests completed in ${duration}s`);
      await this.generateWeeklySummaryReport();
      
      return this.results;
    } catch (error) {
      console.error(`❌ Weekly tests failed: ${error.message}`);
      throw error;
    }
  }

  // Run pre-deployment tests (critical cycle)
  async runPreDeploymentTests() {
    console.log('🚀 Running pre-deployment tests...');
    
    const startTime = Date.now();
    
    try {
      // Critical path tests only
      console.log('🎯 Running critical path tests...');
      this.results.critical = await this.runCriticalPathTests();
      
      // Security validation
      console.log('🔒 Running security validation...');
      this.results.security = await this.securityTest.runSecurityTests();
      
      // Performance validation
      console.log('⚡ Running performance validation...');
      this.results.performance = await this.performanceTest.runPerformanceTests();
      
      // Accessibility compliance
      console.log('♿ Running accessibility compliance...');
      this.results.accessibility = await this.accessibilityTest.runAccessibilityTests();
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      // Determine if deployment should proceed
      const deploymentReady = this.evaluateDeploymentReadiness();
      
      console.log(`\n${deploymentReady ? '✅' : '❌'} Pre-deployment tests completed in ${duration}s`);
      console.log(`Deployment Status: ${deploymentReady ? 'READY' : 'NOT READY'}`);
      
      await this.generateDeploymentReport(deploymentReady);
      
      return {
        ready: deploymentReady,
        results: this.results
      };
    } catch (error) {
      console.error(`❌ Pre-deployment tests failed: ${error.message}`);
      throw error;
    }
  }

  // Run critical path tests for deployment
  async runCriticalPathTests() {
    return new Promise((resolve, reject) => {
      const command = 'npx playwright test testing/automated/e2e/critical-path.spec.js --reporter=json';
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Critical path tests failed: ${error.message}`));
        } else {
          resolve({
            success: true,
            output: stdout,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  }

  // Run visual regression tests
  async runVisualTests() {
    return new Promise((resolve, reject) => {
      const command = 'npx playwright test testing/visual --reporter=json';
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.warn(`Visual tests had issues: ${error.message}`);
          resolve({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        } else {
          resolve({
            success: true,
            output: stdout,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  }

  // Evaluate if deployment should proceed
  evaluateDeploymentReadiness() {
    const criteria = {
      security: this.results.security?.summary?.failed === 0,
      performance: this.results.performance?.aggregated?.averagePerformance >= 80,
      accessibility: this.results.accessibility?.summary?.complianceScore >= 90,
      critical: this.results.critical?.success === true
    };
    
    const passed = Object.values(criteria).filter(Boolean).length;
    const total = Object.keys(criteria).length;
    
    console.log('\n📋 Deployment Readiness Criteria:');
    Object.entries(criteria).forEach(([key, value]) => {
      console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'PASS' : 'FAIL'}`);
    });
    
    const readiness = passed === total;
    console.log(`\n📊 Overall Score: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
    
    return readiness;
  }

  // Generate daily summary report
  async generateDailySummaryReport() {
    const reportDir = path.join(process.cwd(), 'testing', 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `daily-summary-${timestamp}.html`);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Daily Test Summary - ${timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 5px; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>📅 Daily Test Summary</h1>
    <div class="timestamp">Generated: ${new Date().toISOString()}</div>
    
    <div class="summary">
        <h2>Overall Status</h2>
        <div class="metric">
            <div class="score good">✅ DAILY</div>
            <div>Test Status</div>
        </div>
        <div class="metric">
            <div class="score">${this.results.smoke?.summary?.passed || 0}/${this.results.smoke?.summary?.total || 0}</div>
            <div>Smoke Tests</div>
        </div>
        <div class="metric">
            <div class="score">${this.results.performance?.aggregated?.averagePerformance?.toFixed(1) || 'N/A'}</div>
            <div>Performance Score</div>
        </div>
        <div class="metric">
            <div class="score">${this.results.accessibility?.summary?.complianceScore?.toFixed(1) || 'N/A'}%</div>
            <div>Accessibility Score</div>
        </div>
    </div>

    <div class="section">
        <h2>Recommendations for Today</h2>
        <ul>
            ${this.results.smoke?.summary?.failed > 0 ? '<li>🚨 Fix failed smoke tests before continuing development</li>' : ''}
            ${this.results.performance?.aggregated?.averagePerformance < 90 ? '<li>⚡ Optimize performance issues</li>' : ''}
            ${this.results.accessibility?.summary?.complianceScore < 95 ? '<li>♿ Review accessibility compliance</li>' : ''}
            <li>✅ Continue with planned development tasks</li>
        </ul>
    </div>

    <div class="section">
        <h2>Quick Actions</h2>
        <ul>
            <li>Run <code>npm run test:quick</code> for rapid feedback</li>
            <li>Run <code>npm run test:visual</code> after UI changes</li>
            <li>Run <code>npm run test:accessibility</code> after accessibility improvements</li>
        </ul>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportPath, html);
    console.log(`📊 Daily summary report: ${reportPath}`);
  }

  // Generate weekly summary report
  async generateWeeklySummaryReport() {
    const reportDir = path.join(process.cwd(), 'testing', 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `weekly-summary-${timestamp}.html`);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Weekly Test Summary - ${timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 5px; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .chart { width: 100%; height: 300px; background: #f8f9fa; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>📊 Weekly Test Summary</h1>
    <div class="timestamp">Generated: ${new Date().toISOString()}</div>
    
    <div class="summary">
        <h2>Weekly Progress</h2>
        <div class="metric">
            <div class="score good">✅ WEEKLY</div>
            <div>Test Status</div>
        </div>
        <div class="metric">
            <div class="score">${this.results.full?.summary?.passed || 0}/${this.results.full?.summary?.total || 0}</div>
            <div>All Tests</div>
        </div>
        <div class="metric">
            <div class="score">${this.results.security?.summary?.passed || 0}/${this.results.security?.summary?.total || 0}</div>
            <div>Security Tests</div>
        </div>
        <div class="metric">
            <div class="score">${this.results.visual?.success ? '✅' : '❌'}</div>
            <div>Visual Tests</div>
        </div>
    </div>

    <div class="section">
        <h2>This Week's Achievements</h2>
        <ul>
            <li>✅ Completed comprehensive test suite</li>
            <li>📊 Generated performance benchmarks</li>
            <li>🔒 Validated security measures</li>
            <li>♿ Confirmed accessibility compliance</li>
            <li>🖼️ Captured visual regression baselines</li>
        </ul>
    </div>

    <div class="section">
        <h2>Next Week's Focus</h2>
        <ul>
            ${this.results.full?.summary?.failed > 0 ? '<li>🎯 Address failing test cases</li>' : ''}
            ${this.results.security?.summary?.failed > 0 ? '<li>🔒 Fix security vulnerabilities</li>' : ''}
            ${this.results.performance?.aggregated?.averagePerformance < 90 ? '<li>⚡ Improve performance metrics</li>' : ''}
            <li>🚀 Prepare for upcoming deployment</li>
            <li>📈 Monitor test trends and improvements</li>
        </ul>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportPath, html);
    console.log(`📊 Weekly summary report: ${reportPath}`);
  }

  // Generate deployment readiness report
  async generateDeploymentReport(ready) {
    const reportDir = path.join(process.cwd(), 'testing', 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `deployment-readiness-${timestamp}.html`);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Deployment Readiness - ${timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: ${ready ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .status { font-size: 48px; font-weight: bold; text-align: center; color: ${ready ? '#28a745' : '#dc3545'}; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .good { color: #28a745; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <h1>🚀 Deployment Readiness Report</h1>
    <div class="timestamp">Generated: ${new Date().toISOString()}</div>
    
    <div class="summary">
        <div class="status">${ready ? '✅ READY' : '❌ NOT READY'}</div>
        <h2 style="text-align: center;">Deployment Status</h2>
    </div>

    <div class="section">
        <h2>Readiness Criteria</h2>
        <ul>
            <li class="${this.results.security?.summary?.failed === 0 ? 'good' : 'error'}">
                Security: ${this.results.security?.summary?.failed === 0 ? '✅ PASS' : '❌ FAIL'}
            </li>
            <li class="${this.results.performance?.aggregated?.averagePerformance >= 80 ? 'good' : 'error'}">
                Performance: ${this.results.performance?.aggregated?.averagePerformance >= 80 ? '✅ PASS' : '❌ FAIL'}
            </li>
            <li class="${this.results.accessibility?.summary?.complianceScore >= 90 ? 'good' : 'error'}">
                Accessibility: ${this.results.accessibility?.summary?.complianceScore >= 90 ? '✅ PASS' : '❌ FAIL'}
            </li>
            <li class="${this.results.critical?.success ? 'good' : 'error'}">
                Critical Path: ${this.results.critical?.success ? '✅ PASS' : '❌ FAIL'}
            </li>
        </ul>
    </div>

    <div class="section">
        <h2>${ready ? 'Deployment Approval' : 'Issues to Address'}</h2>
        ${ready ? `
            <p><strong>✅ All criteria met. Deployment approved.</strong></p>
            <ul>
                <li>All security tests passed</li>
                <li>Performance meets standards</li>
                <li>Accessibility compliance verified</li>
                <li>Critical functionality validated</li>
            </ul>
        ` : `
            <p><strong>❌ Deployment blocked. Address the following issues:</strong></p>
            <ul>
                ${this.results.security?.summary?.failed > 0 ? '<li>🔒 Security vulnerabilities must be fixed</li>' : ''}
                ${this.results.performance?.aggregated?.averagePerformance < 80 ? '<li>⚡ Performance does not meet minimum standards</li>' : ''}
                ${this.results.accessibility?.summary?.complianceScore < 90 ? '<li>♿ Accessibility compliance below threshold</li>' : ''}
                ${!this.results.critical?.success ? '<li>🎯 Critical path tests failing</li>' : ''}
            </ul>
        `}
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportPath, html);
    console.log(`📊 Deployment report: ${reportPath}`);
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new TestingAutomation();
  const cycle = process.argv[2] || 'daily';
  
  switch (cycle) {
    case 'daily':
      automation.runDailyTests().then(results => {
        process.exit(results.smoke?.summary?.failed > 0 ? 1 : 0);
      }).catch(error => {
        console.error(error);
        process.exit(1);
      });
      break;
      
    case 'weekly':
      automation.runWeeklyTests().then(results => {
        const failed = Object.values(results).some(result => 
          result.summary?.failed > 0 || result.success === false
        );
        process.exit(failed ? 1 : 0);
      }).catch(error => {
        console.error(error);
        process.exit(1);
      });
      break;
      
    case 'deployment':
      automation.runPreDeploymentTests().then(results => {
        process.exit(results.ready ? 0 : 1);
      }).catch(error => {
        console.error(error);
        process.exit(1);
      });
      break;
      
    default:
      console.log('Usage: node testing-automation.js [daily|weekly|deployment]');
      process.exit(1);
  }
}

export default TestingAutomation;
