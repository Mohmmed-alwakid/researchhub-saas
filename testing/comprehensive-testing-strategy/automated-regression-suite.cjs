#!/usr/bin/env node

/**
 * AUTOMATED REGRESSION TESTING SUITE (CommonJS)
 * 
 * Comprehensive automated testing system for ResearchHub
 * Compatible with ES module project structure
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:5175',
  apiUrl: 'http://localhost:3003',
  testAccounts: {
    participant: {
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123',
      role: 'participant'
    },
    researcher: {
      email: 'abwanwr77+Researcher@gmail.com',
      password: 'Testtest123',
      role: 'researcher'
    },
    admin: {
      email: 'abwanwr77+admin@gmail.com',
      password: 'Testtest123',
      role: 'admin'
    }
  },
  timeouts: {
    quick: 3 * 60 * 1000,      // 3 minutes
    daily: 20 * 60 * 1000,     // 20 minutes
    weekly: 45 * 60 * 1000     // 45 minutes
  }
};

// Test Results Storage
class TestResults {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testType: '',
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        duration: 0
      },
      tests: [],
      errors: []
    };
    this.startTime = Date.now();
  }

  addTest(testName, status, details = {}) {
    this.results.tests.push({
      name: testName,
      status,
      timestamp: new Date().toISOString(),
      duration: details.duration || 0,
      details: details.details || '',
      error: details.error || null
    });
    
    this.results.summary.total++;
    if (status === 'passed') this.results.summary.passed++;
    if (status === 'failed') this.results.summary.failed++;
    if (status === 'warning') this.results.summary.warnings++;
  }

  finalize() {
    this.results.summary.duration = Date.now() - this.startTime;
    return this.results;
  }

  async saveReport(filename) {
    const reportPath = path.join(__dirname, 'reports', filename);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    return reportPath;
  }
}

// Quick Smoke Tests
class QuickSmokeTests {
  constructor(browser, testResults) {
    this.browser = browser;
    this.results = testResults;
  }

  async run() {
    console.log('🚀 Running Quick Smoke Tests...');
    
    const context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    
    try {
      await this.testApplicationLoads(context);
      await this.testAuthentication(context);
      await this.testApiHealth();
    } finally {
      await context.close();
    }
  }

  async testApplicationLoads(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle', timeout: 15000 });
      
      // Check if main elements are present
      await page.waitForSelector('body', { timeout: 10000 });
      
      const title = await page.title();
      if (!title || title.toLowerCase().includes('error')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      this.results.addTest('Application Loads', 'passed', {
        duration: Date.now() - testStart,
        details: `Application loaded successfully with title: ${title}`
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Application Loads', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testAuthentication(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      await page.goto(`${CONFIG.baseUrl}/login`, { timeout: 15000 });
      
      // Test login with researcher account
      await page.fill('input[type="email"], input[name="email"]', CONFIG.testAccounts.researcher.email);
      await page.fill('input[type="password"], input[name="password"]', CONFIG.testAccounts.researcher.password);
      await page.click('button[type="submit"], button:has-text("Sign"), button:has-text("Login")');
      
      // Wait for redirect or success indicator
      try {
        await page.waitForURL('**/dashboard', { timeout: 10000 });
      } catch {
        // If no redirect, check for dashboard elements
        await page.waitForSelector('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard")', { timeout: 5000 });
      }
      
      this.results.addTest('Authentication', 'passed', {
        duration: Date.now() - testStart,
        details: 'User successfully logged in'
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Authentication', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testApiHealth() {
    const testStart = Date.now();
    try {
      const response = await fetch(`${CONFIG.apiUrl}/api/health`);
      
      if (!response.ok) {
        throw new Error(`API health check failed with status: ${response.status}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: 'API responded but without JSON' };
      }
      
      this.results.addTest('API Health', 'passed', {
        duration: Date.now() - testStart,
        details: `API health check passed: ${data.message || 'OK'}`
      });
    } catch (error) {
      this.results.addTest('API Health', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }
}

// Main Test Runner
class TestRunner {
  constructor() {
    this.results = new TestResults();
  }

  async run(testType = 'quick') {
    const timeout = CONFIG.timeouts[testType] || CONFIG.timeouts.quick;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
    );

    try {
      await Promise.race([this.executeTests(testType), timeoutPromise]);
    } catch (error) {
      this.results.addTest('Test Runner', 'failed', { error: error.message });
    } finally {
      await this.generateReports(testType);
    }
  }

  async executeTests(testType) {
    this.results.results.testType = testType;
    
    const browser = await chromium.launch({ headless: true });
    
    try {
      const quickTests = new QuickSmokeTests(browser, this.results);
      await quickTests.run();
    } finally {
      await browser.close();
    }
  }

  async generateReports(testType) {
    const finalResults = this.results.finalize();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Generate JSON report
    const jsonPath = await this.results.saveReport(`${testType}-test-results-${timestamp}.json`);
    
    // Console summary
    console.log('\n' + '='.repeat(60));
    console.log(`📋 TEST RESULTS SUMMARY - ${testType.toUpperCase()}`);
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${finalResults.summary.passed}`);
    console.log(`❌ Failed: ${finalResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${finalResults.summary.warnings}`);
    console.log(`📊 Total: ${finalResults.summary.total}`);
    console.log(`⏱️  Duration: ${Math.round(finalResults.summary.duration / 1000)}s`);
    console.log(`📈 Pass Rate: ${Math.round((finalResults.summary.passed / finalResults.summary.total) * 100)}%`);
    console.log('='.repeat(60));
    console.log(`📄 Report: ${jsonPath}`);
    console.log('='.repeat(60));
    
    // Display failed tests
    if (finalResults.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      finalResults.tests.filter(t => t.status === 'failed').forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
    }
    
    console.log('\n');
    
    return finalResults.summary.failed === 0;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'quick';
  
  if (!['quick', 'daily', 'weekly'].includes(testType)) {
    console.error('❌ Invalid test type. Available options: quick, daily, weekly');
    process.exit(1);
  }
  
  console.log(`🚀 Starting ResearchHub ${testType} tests...`);
  console.log(`📍 Base URL: ${CONFIG.baseUrl}`);
  console.log(`🔌 API URL: ${CONFIG.apiUrl}`);
  console.log(`⏰ Timeout: ${Math.round(CONFIG.timeouts[testType] / 1000)}s\n`);
  
  const runner = new TestRunner();
  const success = await runner.run(testType);
  
  process.exit(success ? 0 : 1);
}

// Export for use as module
module.exports = { TestRunner, CONFIG };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
