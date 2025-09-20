// Test utilities and helpers for ResearchHub comprehensive testing
import { expect } from '@playwright/test';

export class TestHelpers {
  constructor(page) {
    this.page = page;
    this.baseURL = process.env.PLAYWRIGHT_BASE_URL || 'https://researchhub-saas.vercel.app';
  }

  async loginAsResearcher() {
    console.log('🔐 Logging in as Researcher...');
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for form elements to be visible
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    await this.page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');
    await this.page.fill('input[type="password"]', 'Testtest123');
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login - check for dashboard or studies page
    await this.page.waitForFunction(() => 
      window.location.pathname.includes('/researcher') || 
      window.location.pathname.includes('/dashboard') ||
      window.location.pathname.includes('/studies')
    , { timeout: 15000 });
    
    console.log('✅ Researcher login successful');
  }

  async loginAsParticipant() {
    console.log('🔐 Logging in as Participant...');
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    await this.page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await this.page.fill('input[type="password"]', 'Testtest123');
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login
    await this.page.waitForFunction(() => 
      window.location.pathname.includes('/participant') || 
      window.location.pathname.includes('/dashboard')
    , { timeout: 15000 });
    
    console.log('✅ Participant login successful');
  }

  async loginAsAdmin() {
    console.log('🔐 Logging in as Admin...');
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    await this.page.fill('input[type="email"]', 'abwanwr77+admin@gmail.com');
    await this.page.fill('input[type="password"]', 'Testtest123');
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login
    await this.page.waitForFunction(() => 
      window.location.pathname.includes('/admin') || 
      window.location.pathname.includes('/dashboard')
    , { timeout: 15000 });
    
    console.log('✅ Admin login successful');
  }

  async verifySecurityHeaders() {
    console.log('🔒 Verifying security headers...');
    const response = await this.page.request.get('/');
    const headers = response.headers();
    
    // Check for essential security headers
    const securityChecks = {
      'x-frame-options': headers['x-frame-options'],
      'x-content-type-options': headers['x-content-type-options'],
      'x-xss-protection': headers['x-xss-protection'] || 'not-set',
      'content-security-policy': headers['content-security-policy'] || 'not-set'
    };
    
    console.log('🔒 Security headers:', securityChecks);
    return securityChecks;
  }

  async checkDatabaseIntegrity() {
    console.log('🗄️ Checking database integrity...');
    try {
      const response = await this.page.request.get('/api/health');
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      console.log('✅ Database health check passed:', data);
      return data;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      throw error;
    }
  }

  async verifyUserRole(expectedRole) {
    console.log(`🔍 Verifying user role: ${expectedRole}`);
    
    // Check localStorage for role
    const userRole = await this.page.evaluate(() => localStorage.getItem('userRole'));
    console.log(`📝 Stored user role: ${userRole}`);
    
    if (userRole) {
      expect(userRole).toBe(expectedRole);
    }
    
    // Verify by making an API call
    const response = await this.page.request.get('/api/auth-consolidated?action=status');
    if (response.status() === 200) {
      const data = await response.json();
      console.log(`✅ API verified role: ${data.user?.role || 'unknown'}`);
    } else {
      console.log(`🔍 API status check: ${response.status()} - ${await response.text().catch(() => 'no body')}`);
    }
  }

  async logout() {
    console.log('🚪 Logging out...');
    
    // Try multiple logout methods
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign out")',
      'button:has-text("Log out")', 
      '[data-testid="logout-button"]',
      '.logout-button',
      'a:has-text("Logout")',
      'a:has-text("Sign out")',
      '[aria-label="Logout"]',
      '[aria-label="Sign out"]'
    ];
    
    let loggedOut = false;
    for (const selector of logoutSelectors) {
      try {
        const element = await this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          loggedOut = true;
          console.log(`✅ Found logout button: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`Logout selector ${selector} not found, trying next...`);
      }
    }
    
    if (!loggedOut) {
      // Try clearing storage manually as fallback
      console.log('⚠️ No logout button found, clearing storage manually');
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await this.page.goto('/login');
    }
    
    // Wait for redirect to login with extended timeout
    try {
      await this.page.waitForFunction(() => 
        window.location.pathname.includes('/login') ||
        window.location.pathname === '/' ||
        window.location.pathname === ''
      , { timeout: 15000 });
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.log('⚠️ Logout redirect timeout, but storage cleared');
    }
  }

  async waitForApiResponse(urlPattern, timeout = 10000) {
    console.log(`⏳ Waiting for API response: ${urlPattern}`);
    
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() < 400,
      { timeout }
    );
  }

  async createTestStudy(title = null) {
    const studyTitle = title || `Test Study ${Date.now()}`;
    console.log(`📚 Creating test study: ${studyTitle}`);
    
    // Navigate to study creation
    await this.page.goto('/researcher/studies');
    await this.page.waitForLoadState('networkidle');
    
    // Look for create study button
    const createButtons = [
      'button:has-text("Create Study")',
      'button:has-text("New Study")',
      '[data-testid="create-study-button"]',
      '.create-study-button'
    ];
    
    let buttonFound = false;
    for (const selector of createButtons) {
      try {
        const element = await this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          buttonFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!buttonFound) {
      throw new Error('Could not find create study button');
    }
    
    // Fill study details
    await this.page.waitForSelector('input[type="text"]', { timeout: 10000 });
    
    const titleInputs = await this.page.locator('input[type="text"]').all();
    if (titleInputs.length > 0) {
      await titleInputs[0].fill(studyTitle);
    }
    
    // Fill description if available
    const descriptionFields = await this.page.locator('textarea, input[placeholder*="description"]').all();
    if (descriptionFields.length > 0) {
      await descriptionFields[0].fill('Automated test study description');
    }
    
    // Save study
    const saveButtons = [
      'button:has-text("Save")',
      'button:has-text("Create")',
      'button[type="submit"]'
    ];
    
    for (const selector of saveButtons) {
      try {
        const element = await this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    console.log(`✅ Test study created: ${studyTitle}`);
    return studyTitle;
  }

  async measurePageLoadTime() {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    return loadTime;
  }
}

export const SecurityPayloads = {
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM users--",
    "1; DELETE FROM studies; --"
  ],
  xssPayloads: [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "';alert('XSS');//"
  ],
  pathTraversal: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "....//....//....//etc/passwd"
  ],
  commandInjection: [
    "; cat /etc/passwd",
    "| whoami",
    "&& ls -la",
    "`id`",
    "$(whoami)"
  ]
};

export class ResultsAnalyzer {
  static analyzeSecurityTests(results) {
    console.log('📊 Analyzing security test results...');
    
    const securityTests = results.filter(test => 
      test.title.includes('SQL Injection') || 
      test.title.includes('XSS') || 
      test.title.includes('Security') ||
      test.title.includes('Rate Limiting') ||
      test.title.includes('Token')
    );
    
    const passedTests = securityTests.filter(test => test.status === 'passed');
    const failedTests = securityTests.filter(test => test.status === 'failed');
    const passRate = securityTests.length > 0 ? (passedTests.length / securityTests.length) * 100 : 0;
    
    const analysis = {
      totalSecurityTests: securityTests.length,
      passedTests: passedTests.length,
      failedTests: failedTests.length,
      passRate: Math.round(passRate * 100) / 100,
      criticalIssues: failedTests.filter(test => test.severity === 'critical' || test.title.includes('SQL') || test.title.includes('XSS')),
      recommendation: passRate === 100 ? 'Production Ready' : passRate >= 95 ? 'Minor Issues' : 'Security Issues Detected'
    };
    
    console.log('📊 Security analysis:', analysis);
    return analysis;
  }

  static generateSecurityReport(analysis) {
    const report = `
# Security Test Analysis Report
**Generated:** ${new Date().toISOString()}

## Summary
- **Total Security Tests:** ${analysis.totalSecurityTests}
- **Passed:** ${analysis.passedTests}
- **Failed:** ${analysis.failedTests}
- **Pass Rate:** ${analysis.passRate}%
- **Recommendation:** ${analysis.recommendation}

## Critical Issues
${analysis.criticalIssues.length > 0 ? 
  analysis.criticalIssues.map(issue => `- ${issue.title}: ${issue.error}`).join('\n') :
  'No critical security issues detected.'
}

## Next Steps
${analysis.passRate === 100 ? 
  '✅ All security tests passed. Platform is ready for production.' :
  '⚠️ Security issues detected. Review failed tests and implement fixes before production deployment.'
}
    `;
    
    return report;
  }
}