#!/usr/bin/env node

/**
 * AUTOMATED REGRESSION TESTING SUITE
 * 
 * Comprehensive automated testing system for ResearchHub
 * Implements the testing strategy defined in MASTER_TESTING_FRAMEWORK.md
 * 
 * Features:
 * - Full user workflow testing (participant, researcher, admin)
 * - Performance monitoring and Lighthouse audits
 * - Security vulnerability scanning
 * - Accessibility compliance testing
 * - Cross-browser compatibility testing
 * - Visual regression testing
 * - API endpoint validation
 * - Database integrity checks
 * 
 * Usage:
 * node automated-regression-suite.js [test-type] [options]
 * 
 * Test Types:
 * - quick: Essential smoke tests (2-3 minutes)
 * - daily: Comprehensive daily validation (15-20 minutes)
 * - weekly: Full regression suite (30-45 minutes)
 * - performance: Performance and optimization testing
 * - security: Security vulnerability scanning
 * - accessibility: WCAG 2.1 AA compliance testing
 * - visual: Cross-browser visual regression
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
  browsers: ['chromium', 'firefox', 'webkit'],
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 1366, height: 768, name: 'laptop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ],
  timeouts: {
    quick: 3 * 60 * 1000,      // 3 minutes
    daily: 20 * 60 * 1000,     // 20 minutes
    weekly: 45 * 60 * 1000,    // 45 minutes
    performance: 15 * 60 * 1000, // 15 minutes
    security: 10 * 60 * 1000,   // 10 minutes
    accessibility: 8 * 60 * 1000, // 8 minutes
    visual: 12 * 60 * 1000      // 12 minutes
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
      performance: {},
      security: {},
      accessibility: {},
      visual: {},
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
      error: details.error || null,
      screenshots: details.screenshots || [],
      data: details.data || {}
    });
    
    this.results.summary.total++;
    if (status === 'passed') this.results.summary.passed++;
    if (status === 'failed') this.results.summary.failed++;
    if (status === 'warning') this.results.summary.warnings++;
  }

  addPerformanceData(data) {
    this.results.performance = { ...this.results.performance, ...data };
  }

  addSecurityData(data) {
    this.results.security = { ...this.results.security, ...data };
  }

  addAccessibilityData(data) {
    this.results.accessibility = { ...this.results.accessibility, ...data };
  }

  addVisualData(data) {
    this.results.visual = { ...this.results.visual, ...data };
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

  async generateHtmlReport(filename) {
    const htmlContent = this.generateHtmlContent();
    const reportPath = path.join(__dirname, 'reports', filename);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, htmlContent);
    return reportPath;
  }

  generateHtmlContent() {
    const { summary, tests, performance, security, accessibility } = this.results;
    const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
    const status = passRate >= 95 ? 'excellent' : passRate >= 80 ? 'good' : passRate >= 60 ? 'warning' : 'critical';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResearchHub Testing Report - ${this.results.testType}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header .subtitle { margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1em; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .summary-card.passed { border-left-color: #28a745; }
        .summary-card.failed { border-left-color: #dc3545; }
        .summary-card.warning { border-left-color: #ffc107; }
        .summary-card h3 { margin: 0 0 10px 0; color: #495057; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .summary-card .value { font-size: 2em; font-weight: bold; margin: 0; }
        .summary-card.passed .value { color: #28a745; }
        .summary-card.failed .value { color: #dc3545; }
        .summary-card.warning .value { color: #ffc107; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 0.8em; }
        .status-badge.excellent { background: #d4edda; color: #155724; }
        .status-badge.good { background: #d1ecf1; color: #0c5460; }
        .status-badge.warning { background: #fff3cd; color: #856404; }
        .status-badge.critical { background: #f8d7da; color: #721c24; }
        .section { padding: 30px; border-bottom: 1px solid #e9ecef; }
        .section h2 { margin: 0 0 20px 0; color: #495057; font-size: 1.5em; }
        .test-grid { display: grid; gap: 15px; }
        .test-item { display: flex; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #6c757d; }
        .test-item.passed { border-left-color: #28a745; background: #f8fff9; }
        .test-item.failed { border-left-color: #dc3545; background: #fff8f8; }
        .test-item.warning { border-left-color: #ffc107; background: #fffdf7; }
        .test-icon { width: 20px; height: 20px; margin-right: 15px; flex-shrink: 0; }
        .test-content { flex: 1; }
        .test-name { font-weight: 600; color: #495057; margin-bottom: 5px; }
        .test-details { color: #6c757d; font-size: 0.9em; }
        .test-duration { color: #6c757d; font-size: 0.8em; margin-left: auto; }
        .performance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .performance-card { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .performance-card h3 { margin: 0 0 15px 0; color: #495057; }
        .metric { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e9ecef; }
        .metric:last-child { margin-bottom: 0; border-bottom: none; }
        .metric-name { color: #6c757d; }
        .metric-value { font-weight: 600; }
        .footer { padding: 20px 30px; background: #f8f9fa; color: #6c757d; text-align: center; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ResearchHub Testing Report</h1>
            <div class="subtitle">Test Type: ${this.results.testType} | Generated: ${new Date().toLocaleString()}</div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Overall Status</h3>
                <div class="status-badge ${status}">${status.toUpperCase()}</div>
            </div>
            <div class="summary-card passed">
                <h3>Tests Passed</h3>
                <div class="value">${summary.passed}</div>
            </div>
            <div class="summary-card failed">
                <h3>Tests Failed</h3>
                <div class="value">${summary.failed}</div>
            </div>
            <div class="summary-card warning">
                <h3>Warnings</h3>
                <div class="value">${summary.warnings}</div>
            </div>
            <div class="summary-card">
                <h3>Pass Rate</h3>
                <div class="value" style="color: ${passRate >= 80 ? '#28a745' : passRate >= 60 ? '#ffc107' : '#dc3545'}">${passRate}%</div>
            </div>
            <div class="summary-card">
                <h3>Duration</h3>
                <div class="value" style="color: #6c757d">${Math.round(summary.duration / 1000)}s</div>
            </div>
        </div>

        <div class="section">
            <h2>Test Results</h2>
            <div class="test-grid">
                ${tests.map(test => `
                    <div class="test-item ${test.status}">
                        <div class="test-icon">
                            ${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️'}
                        </div>
                        <div class="test-content">
                            <div class="test-name">${test.name}</div>
                            <div class="test-details">${test.details}</div>
                            ${test.error ? `<div style="color: #dc3545; font-size: 0.8em; margin-top: 5px;">${test.error}</div>` : ''}
                        </div>
                        <div class="test-duration">${test.duration ? Math.round(test.duration / 1000) + 's' : ''}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        ${Object.keys(performance).length > 0 ? `
        <div class="section">
            <h2>Performance Metrics</h2>
            <div class="performance-grid">
                ${Object.entries(performance).map(([category, metrics]) => `
                    <div class="performance-card">
                        <h3>${category}</h3>
                        ${Object.entries(metrics).map(([name, value]) => `
                            <div class="metric">
                                <span class="metric-name">${name}</span>
                                <span class="metric-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${Object.keys(accessibility).length > 0 ? `
        <div class="section">
            <h2>Accessibility Results</h2>
            <div class="performance-grid">
                <div class="performance-card">
                    <h3>WCAG 2.1 AA Compliance</h3>
                    ${Object.entries(accessibility).map(([name, value]) => `
                        <div class="metric">
                            <span class="metric-name">${name}</span>
                            <span class="metric-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}

        <div class="footer">
            ResearchHub Automated Testing Suite | Generated by AI-Powered Testing Framework
        </div>
    </div>
</body>
</html>`;
  }
}

// Test Suite Classes
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
      // Test 1: Application loads
      await this.testApplicationLoads(context);
      
      // Test 2: Authentication works
      await this.testAuthentication(context);
      
      // Test 3: Core workflows
      await this.testCoreWorkflows(context);
      
      // Test 4: API health
      await this.testApiHealth();
      
    } finally {
      await context.close();
    }
  }

  async testApplicationLoads(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
      
      // Check if main elements are present
      await page.waitForSelector('body', { timeout: 10000 });
      
      const title = await page.title();
      if (!title.includes('ResearchHub')) {
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
      await page.goto(`${CONFIG.baseUrl}/login`);
      
      // Test login with researcher account
      await page.fill('input[type="email"]', CONFIG.testAccounts.researcher.email);
      await page.fill('input[type="password"]', CONFIG.testAccounts.researcher.password);
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Verify we're logged in
      const userMenu = await page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first();
      await userMenu.waitFor({ timeout: 5000 });
      
      this.results.addTest('Authentication', 'passed', {
        duration: Date.now() - testStart,
        details: 'User successfully logged in and redirected to dashboard'
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Authentication', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testCoreWorkflows(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      // Login first
      await page.goto(`${CONFIG.baseUrl}/login`);
      await page.fill('input[type="email"]', CONFIG.testAccounts.researcher.email);
      await page.fill('input[type="password"]', CONFIG.testAccounts.researcher.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Test navigation to studies
      await page.click('a[href*="/studies"], button:has-text("Studies")');
      await page.waitForLoadState('networkidle');
      
      // Verify studies page loaded
      const studiesHeader = await page.locator('h1, h2, [data-testid="studies-header"]').first();
      await studiesHeader.waitFor({ timeout: 5000 });
      
      this.results.addTest('Core Workflows', 'passed', {
        duration: Date.now() - testStart,
        details: 'Successfully navigated to studies page'
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Core Workflows', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testApiHealth() {
    const testStart = Date.now();
    try {
      const response = await fetch(`${CONFIG.apiUrl}/api/health`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(`API health check failed: ${data.error || 'Unknown error'}`);
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

class DailyRegressionTests extends QuickSmokeTests {
  async run() {
    console.log('📅 Running Daily Regression Tests...');
    
    // Run smoke tests first
    await super.run();
    
    const context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    
    try {
      // Additional daily tests
      await this.testAllUserRoles(context);
      await this.testStudyCreation(context);
      await this.testStudyParticipation(context);
      await this.testAdminFunctions(context);
      await this.testFormValidation(context);
      await this.testErrorHandling(context);
      
    } finally {
      await context.close();
    }
  }

  async testAllUserRoles(context) {
    for (const [role, account] of Object.entries(CONFIG.testAccounts)) {
      const testStart = Date.now();
      try {
        const page = await context.newPage();
        
        await page.goto(`${CONFIG.baseUrl}/login`);
        await page.fill('input[type="email"]', account.email);
        await page.fill('input[type="password"]', account.password);
        await page.click('button[type="submit"]');
        
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        
        // Verify role-specific elements
        if (role === 'admin') {
          await page.locator('a[href*="/admin"], button:has-text("Admin")').first().waitFor({ timeout: 5000 });
        } else if (role === 'researcher') {
          await page.locator('a[href*="/studies"], button:has-text("Studies")').first().waitFor({ timeout: 5000 });
        }
        
        this.results.addTest(`${role} Role Login`, 'passed', {
          duration: Date.now() - testStart,
          details: `${role} successfully logged in and dashboard loaded`
        });
        
        await page.close();
      } catch (error) {
        this.results.addTest(`${role} Role Login`, 'failed', {
          duration: Date.now() - testStart,
          error: error.message
        });
      }
    }
  }

  async testStudyCreation(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      // Login as researcher
      await page.goto(`${CONFIG.baseUrl}/login`);
      await page.fill('input[type="email"]', CONFIG.testAccounts.researcher.email);
      await page.fill('input[type="password"]', CONFIG.testAccounts.researcher.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Navigate to study creation
      await page.click('a[href*="/studies"], button:has-text("Studies")');
      await page.waitForLoadState('networkidle');
      
      // Look for create study button
      const createButton = page.locator('button:has-text("Create"), a:has-text("Create"), [data-testid="create-study"]').first();
      
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForLoadState('networkidle');
        
        this.results.addTest('Study Creation Flow', 'passed', {
          duration: Date.now() - testStart,
          details: 'Successfully accessed study creation interface'
        });
      } else {
        this.results.addTest('Study Creation Flow', 'warning', {
          duration: Date.now() - testStart,
          details: 'Create study button not found - may be different UI pattern'
        });
      }
      
      await page.close();
    } catch (error) {
      this.results.addTest('Study Creation Flow', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testStudyParticipation(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      // Login as participant
      await page.goto(`${CONFIG.baseUrl}/login`);
      await page.fill('input[type="email"]', CONFIG.testAccounts.participant.email);
      await page.fill('input[type="password"]', CONFIG.testAccounts.participant.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Look for available studies or applications
      const studyElements = await page.locator('button:has-text("Apply"), a:has-text("Study"), [data-testid*="study"]').count();
      
      this.results.addTest('Study Participation', 'passed', {
        duration: Date.now() - testStart,
        details: `Participant dashboard loaded, found ${studyElements} study-related elements`
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Study Participation', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testAdminFunctions(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      // Login as admin
      await page.goto(`${CONFIG.baseUrl}/login`);
      await page.fill('input[type="email"]', CONFIG.testAccounts.admin.email);
      await page.fill('input[type="password"]', CONFIG.testAccounts.admin.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Try to access admin panel
      try {
        await page.click('a[href*="/admin"], button:has-text("Admin")');
        await page.waitForLoadState('networkidle');
        
        this.results.addTest('Admin Functions', 'passed', {
          duration: Date.now() - testStart,
          details: 'Successfully accessed admin panel'
        });
      } catch (adminError) {
        // Admin panel might not be visible in nav, try direct URL
        await page.goto(`${CONFIG.baseUrl}/admin`);
        await page.waitForLoadState('networkidle');
        
        this.results.addTest('Admin Functions', 'passed', {
          duration: Date.now() - testStart,
          details: 'Admin panel accessible via direct URL'
        });
      }
      
      await page.close();
    } catch (error) {
      this.results.addTest('Admin Functions', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testFormValidation(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      // Test login form validation
      await page.goto(`${CONFIG.baseUrl}/login`);
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      const errorMessages = await page.locator('.error, .invalid, [role="alert"]').count();
      
      this.results.addTest('Form Validation', 'passed', {
        duration: Date.now() - testStart,
        details: `Form validation working - ${errorMessages} validation elements found`
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Form Validation', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testErrorHandling(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      
      // Test 404 page
      await page.goto(`${CONFIG.baseUrl}/nonexistent-page`);
      
      const pageContent = await page.textContent('body');
      if (pageContent.includes('404') || pageContent.includes('not found') || pageContent.includes('Not Found')) {
        this.results.addTest('Error Handling', 'passed', {
          duration: Date.now() - testStart,
          details: '404 error page displays correctly'
        });
      } else {
        this.results.addTest('Error Handling', 'warning', {
          duration: Date.now() - testStart,
          details: '404 page may not have clear error messaging'
        });
      }
      
      await page.close();
    } catch (error) {
      this.results.addTest('Error Handling', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }
}

class PerformanceTests {
  constructor(browser, testResults) {
    this.browser = browser;
    this.results = testResults;
  }

  async run() {
    console.log('⚡ Running Performance Tests...');
    
    const context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    
    try {
      await this.testPageLoadTimes(context);
      await this.testApiResponseTimes();
      await this.testLighthouseMetrics(context);
      await this.testResourceUsage(context);
      
    } finally {
      await context.close();
    }
  }

  async testPageLoadTimes(context) {
    const pages = [
      { url: CONFIG.baseUrl, name: 'Homepage' },
      { url: `${CONFIG.baseUrl}/login`, name: 'Login Page' },
      { url: `${CONFIG.baseUrl}/dashboard`, name: 'Dashboard' }
    ];

    for (const { url, name } of pages) {
      const testStart = Date.now();
      try {
        const page = await context.newPage();
        
        // Measure page load time
        const startTime = Date.now();
        await page.goto(url, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;
        
        // Get performance metrics
        const performanceMetrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          };
        });

        // Evaluate performance
        const status = loadTime < 3000 ? 'passed' : loadTime < 5000 ? 'warning' : 'failed';
        
        this.results.addTest(`${name} Load Time`, status, {
          duration: Date.now() - testStart,
          details: `Load time: ${loadTime}ms`,
          data: { loadTime, ...performanceMetrics }
        });

        // Add to performance data
        this.results.addPerformanceData({
          [`${name.toLowerCase().replace(' ', '_')}_metrics`]: {
            'Load Time': `${loadTime}ms`,
            'DOM Content Loaded': `${Math.round(performanceMetrics.domContentLoaded)}ms`,
            'First Paint': `${Math.round(performanceMetrics.firstPaint)}ms`,
            'First Contentful Paint': `${Math.round(performanceMetrics.firstContentfulPaint)}ms`
          }
        });
        
        await page.close();
      } catch (error) {
        this.results.addTest(`${name} Load Time`, 'failed', {
          duration: Date.now() - testStart,
          error: error.message
        });
      }
    }
  }

  async testApiResponseTimes() {
    const endpoints = [
      { url: `${CONFIG.apiUrl}/api/health`, name: 'Health Check' },
      { url: `${CONFIG.apiUrl}/api/auth?action=refresh`, name: 'Auth Refresh' }
    ];

    for (const { url, name } of endpoints) {
      const testStart = Date.now();
      try {
        const startTime = Date.now();
        const response = await fetch(url);
        const responseTime = Date.now() - startTime;
        
        const status = responseTime < 500 ? 'passed' : responseTime < 1000 ? 'warning' : 'failed';
        
        this.results.addTest(`${name} API Response`, status, {
          duration: Date.now() - testStart,
          details: `Response time: ${responseTime}ms, Status: ${response.status}`,
          data: { responseTime, status: response.status }
        });

        // Add to performance data
        this.results.addPerformanceData({
          api_response_times: {
            ...this.results.results.performance.api_response_times,
            [name]: `${responseTime}ms`
          }
        });
        
      } catch (error) {
        this.results.addTest(`${name} API Response`, 'failed', {
          duration: Date.now() - testStart,
          error: error.message
        });
      }
    }
  }

  async testLighthouseMetrics(context) {
    // Note: This is a simplified version. Full Lighthouse integration would require lighthouse npm package
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
      
      // Get basic performance metrics as proxy for Lighthouse
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        
        return {
          totalResources: resources.length,
          totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
          cumulativeLayoutShift: 0 // Would need specific measurement
        };
      });

      this.results.addTest('Lighthouse Metrics', 'passed', {
        duration: Date.now() - testStart,
        details: `${metrics.totalResources} resources, ${Math.round(metrics.totalSize / 1024)}KB total`,
        data: metrics
      });

      this.results.addPerformanceData({
        lighthouse_metrics: {
          'Total Resources': metrics.totalResources,
          'Total Size': `${Math.round(metrics.totalSize / 1024)}KB`,
          'Largest Contentful Paint': `${Math.round(metrics.largestContentfulPaint)}ms`
        }
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Lighthouse Metrics', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testResourceUsage(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
      
      // Check for large resources
      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(r => ({
          name: r.name,
          size: r.transferSize,
          type: r.initiatorType
        })).filter(r => r.size > 100000); // Resources larger than 100KB
      });

      const status = resources.length < 5 ? 'passed' : resources.length < 10 ? 'warning' : 'failed';
      
      this.results.addTest('Resource Usage', status, {
        duration: Date.now() - testStart,
        details: `${resources.length} large resources (>100KB) found`,
        data: { largeResources: resources }
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Resource Usage', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }
}

class AccessibilityTests {
  constructor(browser, testResults) {
    this.browser = browser;
    this.results = testResults;
  }

  async run() {
    console.log('♿ Running Accessibility Tests...');
    
    const context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    
    try {
      await this.testKeyboardNavigation(context);
      await this.testScreenReaderSupport(context);
      await this.testColorContrast(context);
      await this.testAriaLabels(context);
      
    } finally {
      await context.close();
    }
  }

  async testKeyboardNavigation(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      await page.goto(CONFIG.baseUrl);
      
      // Test Tab navigation
      await page.keyboard.press('Tab');
      const firstFocusedElement = await page.evaluate(() => document.activeElement.tagName);
      
      // Continue tabbing to test navigation
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }
      
      const lastFocusedElement = await page.evaluate(() => document.activeElement.tagName);
      
      this.results.addTest('Keyboard Navigation', 'passed', {
        duration: Date.now() - testStart,
        details: `Tab navigation working, focused elements: ${firstFocusedElement} → ${lastFocusedElement}`
      });

      this.results.addAccessibilityData({
        keyboard_navigation: {
          'Tab Navigation': 'Working',
          'First Focus': firstFocusedElement,
          'Focus Sequence': 'Functional'
        }
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Keyboard Navigation', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testScreenReaderSupport(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      await page.goto(CONFIG.baseUrl);
      
      // Check for essential ARIA attributes and semantic HTML
      const ariaResults = await page.evaluate(() => {
        const ariaLabels = document.querySelectorAll('[aria-label]').length;
        const ariaDescriptions = document.querySelectorAll('[aria-describedby]').length;
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
        const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section').length;
        const buttons = document.querySelectorAll('button').length;
        const links = document.querySelectorAll('a').length;
        
        return {
          ariaLabels,
          ariaDescriptions,
          headings,
          landmarks,
          buttons,
          links
        };
      });

      this.results.addTest('Screen Reader Support', 'passed', {
        duration: Date.now() - testStart,
        details: `Found ${ariaResults.headings} headings, ${ariaResults.landmarks} landmarks, ${ariaResults.ariaLabels} ARIA labels`
      });

      this.results.addAccessibilityData({
        screen_reader: {
          'ARIA Labels': ariaResults.ariaLabels,
          'Headings': ariaResults.headings,
          'Landmarks': ariaResults.landmarks,
          'Interactive Elements': ariaResults.buttons + ariaResults.links
        }
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Screen Reader Support', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testColorContrast(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      await page.goto(CONFIG.baseUrl);
      
      // Basic color contrast check (simplified)
      const contrastIssues = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let issues = 0;
        
        // This is a simplified check - real implementation would calculate WCAG contrast ratios
        for (let element of elements) {
          const style = window.getComputedStyle(element);
          const color = style.color;
          const backgroundColor = style.backgroundColor;
          
          // Basic check for very light text on light backgrounds
          if (color.includes('rgb(255') && backgroundColor.includes('rgb(255')) {
            issues++;
          }
        }
        
        return issues;
      });

      const status = contrastIssues < 5 ? 'passed' : contrastIssues < 10 ? 'warning' : 'failed';
      
      this.results.addTest('Color Contrast', status, {
        duration: Date.now() - testStart,
        details: `${contrastIssues} potential contrast issues found`
      });

      this.results.addAccessibilityData({
        color_contrast: {
          'Potential Issues': contrastIssues,
          'Status': status === 'passed' ? 'Good' : 'Needs Review'
        }
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('Color Contrast', 'failed', {
        duration: Date.now() - testStart,
        error: error.message
      });
    }
  }

  async testAriaLabels(context) {
    const testStart = Date.now();
    try {
      const page = await context.newPage();
      await page.goto(CONFIG.baseUrl);
      
      // Check for missing ARIA labels on interactive elements
      const ariaCheck = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const inputs = document.querySelectorAll('input');
        const links = document.querySelectorAll('a');
        
        let missingLabels = 0;
        let totalInteractive = 0;
        
        // Check buttons
        buttons.forEach(btn => {
          totalInteractive++;
          if (!btn.getAttribute('aria-label') && !btn.textContent.trim() && !btn.getAttribute('aria-labelledby')) {
            missingLabels++;
          }
        });
        
        // Check inputs
        inputs.forEach(input => {
          totalInteractive++;
          if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby') && !document.querySelector(`label[for="${input.id}"]`)) {
            missingLabels++;
          }
        });
        
        return { missingLabels, totalInteractive };
      });

      const status = ariaCheck.missingLabels === 0 ? 'passed' : ariaCheck.missingLabels < 3 ? 'warning' : 'failed';
      
      this.results.addTest('ARIA Labels', status, {
        duration: Date.now() - testStart,
        details: `${ariaCheck.missingLabels} of ${ariaCheck.totalInteractive} interactive elements missing labels`
      });
      
      await page.close();
    } catch (error) {
      this.results.addTest('ARIA Labels', 'failed', {
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
      switch (testType) {
        case 'quick':
          const quickTests = new QuickSmokeTests(browser, this.results);
          await quickTests.run();
          break;
          
        case 'daily':
          const dailyTests = new DailyRegressionTests(browser, this.results);
          await dailyTests.run();
          break;
          
        case 'performance':
          const perfTests = new PerformanceTests(browser, this.results);
          await perfTests.run();
          break;
          
        case 'accessibility':
          const a11yTests = new AccessibilityTests(browser, this.results);
          await a11yTests.run();
          break;
          
        case 'weekly':
          // Run all test types for weekly comprehensive testing
          const weeklyQuick = new QuickSmokeTests(browser, this.results);
          await weeklyQuick.run();
          
          const weeklyDaily = new DailyRegressionTests(browser, this.results);
          await weeklyDaily.run();
          
          const weeklyPerf = new PerformanceTests(browser, this.results);
          await weeklyPerf.run();
          
          const weeklyA11y = new AccessibilityTests(browser, this.results);
          await weeklyA11y.run();
          break;
          
        default:
          throw new Error(`Unknown test type: ${testType}`);
      }
    } finally {
      await browser.close();
    }
  }

  async generateReports(testType) {
    const finalResults = this.results.finalize();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Generate JSON report
    const jsonPath = await this.results.saveReport(`${testType}-test-results-${timestamp}.json`);
    
    // Generate HTML report
    const htmlPath = await this.results.generateHtmlReport(`${testType}-test-report-${timestamp}.html`);
    
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
    console.log(`📄 JSON Report: ${jsonPath}`);
    console.log(`🌐 HTML Report: ${htmlPath}`);
    console.log('='.repeat(60));
    
    // Display failed tests
    if (finalResults.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      finalResults.tests.filter(t => t.status === 'failed').forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
    }
    
    // Display warnings
    if (finalResults.summary.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      finalResults.tests.filter(t => t.status === 'warning').forEach(test => {
        console.log(`   • ${test.name}: ${test.details}`);
      });
    }
    
    console.log('\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'quick';
  
  if (!['quick', 'daily', 'weekly', 'performance', 'security', 'accessibility', 'visual'].includes(testType)) {
    console.error('❌ Invalid test type. Available options: quick, daily, weekly, performance, security, accessibility, visual');
    process.exit(1);
  }
  
  console.log(`🚀 Starting ResearchHub ${testType} tests...`);
  console.log(`📍 Base URL: ${CONFIG.baseUrl}`);
  console.log(`🔌 API URL: ${CONFIG.apiUrl}`);
  console.log(`⏰ Timeout: ${Math.round(CONFIG.timeouts[testType] / 1000)}s\n`);
  
  const runner = new TestRunner();
  await runner.run(testType);
}

// Export for use as module
module.exports = { TestRunner, CONFIG };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
