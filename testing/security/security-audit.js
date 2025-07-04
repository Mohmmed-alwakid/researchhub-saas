// Security Testing Suite - Automated security vulnerability testing
// Tests for common security issues and vulnerabilities

import fs from 'fs';
import path from 'path';
import { testingConfig } from '../config/testing.config.js';

class SecurityTestSuite {
  constructor() {
    this.config = testingConfig;
    this.reportDir = path.join(process.cwd(), 'testing', 'reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.baseUrl = this.config.environments.local.baseUrl;
  }

  // Ensure report directory exists
  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  // Test for SQL injection vulnerabilities
  async testSQLInjection() {
    console.log('🔍 Testing for SQL injection vulnerabilities...');
    
    const testCases = [
      { name: 'Login SQL Injection', endpoint: '/api/auth', payload: { email: "admin'--", password: "anything" } },
      { name: 'Search SQL Injection', endpoint: '/api/studies', payload: { search: "'; DROP TABLE users; --" } },
      { name: 'Profile SQL Injection', endpoint: '/api/profile', payload: { name: "test' OR '1'='1" } }
    ];

    const results = [];
    
    for (const testCase of testCases) {
      try {
        const response = await fetch(`${this.baseUrl}${testCase.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase.payload)
        });

        const result = {
          name: testCase.name,
          endpoint: testCase.endpoint,
          payload: testCase.payload,
          status: response.status,
          passed: response.status === 400 || response.status === 422, // Should reject malicious input
          response: await response.text()
        };

        results.push(result);
        console.log(`${result.passed ? '✅' : '❌'} ${testCase.name}: ${result.passed ? 'SAFE' : 'VULNERABLE'}`);
      } catch (error) {
        results.push({
          name: testCase.name,
          endpoint: testCase.endpoint,
          payload: testCase.payload,
          error: error.message,
          passed: false
        });
        console.log(`❌ ${testCase.name}: ERROR - ${error.message}`);
      }
    }

    return results;
  }

  // Test for XSS vulnerabilities
  async testXSS() {
    console.log('🔍 Testing for XSS vulnerabilities...');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>'
    ];

    const testCases = [
      { name: 'Study Title XSS', endpoint: '/api/studies', field: 'title' },
      { name: 'Profile Name XSS', endpoint: '/api/profile', field: 'name' },
      { name: 'Comment XSS', endpoint: '/api/comments', field: 'content' }
    ];

    const results = [];
    
    for (const testCase of testCases) {
      for (const payload of xssPayloads) {
        try {
          const requestBody = { [testCase.field]: payload };
          const response = await fetch(`${this.baseUrl}${testCase.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          const responseText = await response.text();
          const containsUnescapedPayload = responseText.includes(payload) && !responseText.includes('&lt;script&gt;');
          
          const result = {
            name: `${testCase.name} - ${payload.substring(0, 20)}...`,
            endpoint: testCase.endpoint,
            payload: payload,
            status: response.status,
            passed: !containsUnescapedPayload, // Should escape or reject XSS attempts
            containsUnescapedPayload
          };

          results.push(result);
          console.log(`${result.passed ? '✅' : '❌'} ${result.name}: ${result.passed ? 'SAFE' : 'VULNERABLE'}`);
        } catch (error) {
          results.push({
            name: `${testCase.name} - ${payload.substring(0, 20)}...`,
            endpoint: testCase.endpoint,
            payload: payload,
            error: error.message,
            passed: false
          });
        }
      }
    }

    return results;
  }

  // Test authentication security
  async testAuthSecurity() {
    console.log('🔍 Testing authentication security...');
    
    const results = [];
    
    // Test 1: Weak password acceptance
    try {
      const response = await fetch(`${this.baseUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: '123' })
      });

      results.push({
        name: 'Weak Password Rejection',
        passed: response.status === 400 || response.status === 422,
        details: 'Should reject weak passwords'
      });
    } catch (error) {
      results.push({
        name: 'Weak Password Rejection',
        passed: false,
        error: error.message
      });
    }

    // Test 2: JWT token validation
    try {
      const response = await fetch(`${this.baseUrl}/api/studies`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      results.push({
        name: 'JWT Token Validation',
        passed: response.status === 401,
        details: 'Should reject invalid JWT tokens'
      });
    } catch (error) {
      results.push({
        name: 'JWT Token Validation',
        passed: false,
        error: error.message
      });
    }

    // Test 3: Rate limiting (attempt multiple requests)
    try {
      const promises = Array.from({ length: 10 }, () => 
        fetch(`${this.baseUrl}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
        })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);

      results.push({
        name: 'Rate Limiting',
        passed: rateLimited,
        details: 'Should implement rate limiting for failed login attempts'
      });
    } catch (error) {
      results.push({
        name: 'Rate Limiting',
        passed: false,
        error: error.message
      });
    }

    return results;
  }

  // Test CSRF protection
  async testCSRF() {
    console.log('🔍 Testing CSRF protection...');
    
    const results = [];
    
    // Test cross-origin requests without proper headers
    try {
      const response = await fetch(`${this.baseUrl}/api/studies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': 'https://malicious-site.com'
        },
        body: JSON.stringify({ title: 'CSRF Test Study' })
      });

      results.push({
        name: 'CSRF Protection',
        passed: response.status === 403 || response.status === 401,
        details: 'Should reject cross-origin requests without proper CSRF protection'
      });
    } catch (error) {
      results.push({
        name: 'CSRF Protection',
        passed: false,
        error: error.message
      });
    }

    return results;
  }

  // Test file upload security
  async testFileUploadSecurity() {
    console.log('🔍 Testing file upload security...');
    
    const results = [];
    
    // Test malicious file upload
    const maliciousFiles = [
      { name: 'script.js', content: 'alert("XSS")', type: 'text/javascript' },
      { name: 'shell.php', content: '<?php system($_GET["cmd"]); ?>', type: 'application/x-php' },
      { name: 'huge.txt', content: 'x'.repeat(10000000), type: 'text/plain' } // 10MB file
    ];

    for (const file of maliciousFiles) {
      try {
        const formData = new FormData();
        formData.append('file', new Blob([file.content], { type: file.type }), file.name);

        const response = await fetch(`${this.baseUrl}/api/upload`, {
          method: 'POST',
          body: formData
        });

        results.push({
          name: `File Upload - ${file.name}`,
          passed: response.status === 400 || response.status === 413 || response.status === 415,
          details: `Should reject ${file.name} (${file.type})`
        });
      } catch (error) {
        results.push({
          name: `File Upload - ${file.name}`,
          passed: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Run all security tests
  async runSecurityTests() {
    console.log('🚀 Starting security test suite...');
    this.ensureReportDir();

    const allResults = {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        timestamp: new Date().toISOString()
      },
      tests: {
        sqlInjection: await this.testSQLInjection(),
        xss: await this.testXSS(),
        auth: await this.testAuthSecurity(),
        csrf: await this.testCSRF(),
        fileUpload: await this.testFileUploadSecurity()
      }
    };

    // Calculate summary
    Object.values(allResults.tests).forEach(testGroup => {
      testGroup.forEach(test => {
        allResults.summary.total++;
        if (test.passed) {
          allResults.summary.passed++;
        } else {
          allResults.summary.failed++;
        }
      });
    });

    await this.generateSecurityReport(allResults);
    
    console.log(`\n🛡️ Security Test Summary:`);
    console.log(`Total: ${allResults.summary.total}`);
    console.log(`Passed: ${allResults.summary.passed}`);
    console.log(`Failed: ${allResults.summary.failed}`);
    console.log(`Security Score: ${((allResults.summary.passed / allResults.summary.total) * 100).toFixed(1)}%`);
    
    return allResults;
  }

  // Generate security report
  async generateSecurityReport(results) {
    const reportPath = path.join(this.reportDir, `security-report-${this.timestamp}.html`);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Security Test Report - ${this.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-section { margin: 20px 0; }
        .test-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .test-result.passed { border-left: 5px solid #28a745; }
        .test-result.failed { border-left: 5px solid #dc3545; }
        .vulnerability { background: #f8d7da; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .safe { background: #d4edda; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .security-score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🛡️ Security Test Report</h1>
    <div class="timestamp">Generated: ${results.summary.timestamp}</div>
    
    <div class="summary">
        <h2>Security Summary</h2>
        <div class="security-score ${results.summary.passed === results.summary.total ? 'passed' : 'failed'}">
            ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%
        </div>
        <p><strong>Total Tests:</strong> ${results.summary.total}</p>
        <p><strong class="passed">Passed:</strong> ${results.summary.passed}</p>
        <p><strong class="failed">Failed:</strong> ${results.summary.failed}</p>
        <p><strong>Vulnerabilities Found:</strong> ${results.summary.failed}</p>
    </div>

    ${Object.entries(results.tests).map(([category, tests]) => `
        <div class="test-section">
            <h2>${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h2>
            ${tests.map(test => `
                <div class="test-result ${test.passed ? 'passed' : 'failed'}">
                    <h3>${test.name} ${test.passed ? '✅' : '❌'}</h3>
                    ${test.details ? `<p><strong>Details:</strong> ${test.details}</p>` : ''}
                    ${test.payload ? `<p><strong>Payload:</strong> <code>${test.payload}</code></p>` : ''}
                    ${test.error ? `<p><strong>Error:</strong> ${test.error}</p>` : ''}
                    ${test.passed ? 
                        '<div class="safe">✅ No vulnerability detected</div>' : 
                        '<div class="vulnerability">⚠️ Potential security vulnerability found</div>'
                    }
                </div>
            `).join('')}
        </div>
    `).join('')}

    <div class="recommendations">
        <h2>Security Recommendations</h2>
        <ul>
            ${results.summary.failed > 0 ? '<li>🚨 <strong>Critical:</strong> Address all failed security tests immediately</li>' : ''}
            <li>🔐 Implement proper input validation and sanitization</li>
            <li>🛡️ Use parameterized queries to prevent SQL injection</li>
            <li>🔒 Implement Content Security Policy (CSP) headers</li>
            <li>⚡ Add rate limiting for authentication endpoints</li>
            <li>🔑 Use strong password policies</li>
            <li>📝 Regular security audits and penetration testing</li>
        </ul>
    </div>
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`📊 Security report generated: ${reportPath}`);

    // Also save JSON report
    const jsonReportPath = path.join(this.reportDir, `security-report-${this.timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const securityTest = new SecurityTestSuite();
  securityTest.runSecurityTests().then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  });
}

export default SecurityTestSuite;
