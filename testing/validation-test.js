#!/usr/bin/env node

// Simple Validation Test - Tests basic functionality without Chrome dependency
// This test validates the core framework and server connectivity

import fs from 'fs';
import path from 'path';
import http from 'http';

class ValidationTest {
  constructor() {
    this.baseUrl = 'http://localhost:3003';
    this.frontendUrl = 'http://localhost:5175';
    this.reportDir = path.join(process.cwd(), 'testing', 'reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.results = {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0 },
      tests: []
    };
  }

  // Ensure report directory exists
  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  // Add test result
  addTestResult(name, status, details = null, duration = 0) {
    this.results.tests.push({
      name,
      status,
      details,
      duration,
      timestamp: new Date().toISOString()
    });
    
    this.results.summary.total++;
    if (status === 'PASS') {
      this.results.summary.passed++;
      console.log(`✅ ${name} - ${duration}ms`);
    } else {
      this.results.summary.failed++;
      console.log(`❌ ${name} - ${details}`);
    }
  }

  // Test server health endpoint
  async testServerHealth() {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const req = http.get(`${this.baseUrl}/api/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode === 200 && jsonData.success) {
              this.addTestResult('Server Health Check', 'PASS', `Status: ${jsonData.status}`, duration);
              resolve(true);
            } else {
              this.addTestResult('Server Health Check', 'FAIL', `Status: ${res.statusCode}`, duration);
              resolve(false);
            }
          } catch (error) {
            this.addTestResult('Server Health Check', 'FAIL', 'Invalid JSON response', duration);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        this.addTestResult('Server Health Check', 'FAIL', error.message, duration);
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        const duration = Date.now() - startTime;
        this.addTestResult('Server Health Check', 'FAIL', 'Request timeout', duration);
        resolve(false);
      });
    });
  }

  // Test database connectivity
  async testDatabaseConnection() {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const req = http.get(`${this.baseUrl}/api/db-check`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode === 200 && jsonData.success) {
              this.addTestResult('Database Connection', 'PASS', `Connected to: ${jsonData.database || 'Supabase'}`, duration);
              resolve(true);
            } else {
              this.addTestResult('Database Connection', 'FAIL', `Status: ${res.statusCode}`, duration);
              resolve(false);
            }
          } catch (error) {
            this.addTestResult('Database Connection', 'FAIL', 'Invalid JSON response', duration);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        this.addTestResult('Database Connection', 'FAIL', error.message, duration);
        resolve(false);
      });
      
      req.setTimeout(5000);
    });
  }

  // Test authentication endpoint
  async testAuthEndpoint() {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const postData = JSON.stringify({ email: 'test@test.com', password: 'invalid' });
      
      const options = {
        hostname: 'localhost',
        port: 3003,
        path: '/api/auth?action=login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          // We expect this to fail with 401, which means the endpoint is working
          if (res.statusCode === 401 || res.statusCode === 400) {
            this.addTestResult('Auth Endpoint Responsive', 'PASS', `Endpoint responding correctly`, duration);
            resolve(true);
          } else {
            this.addTestResult('Auth Endpoint Responsive', 'FAIL', `Unexpected status: ${res.statusCode}`, duration);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        this.addTestResult('Auth Endpoint Responsive', 'FAIL', error.message, duration);
        resolve(false);
      });

      req.setTimeout(5000);
      req.write(postData);
      req.end();
    });
  }

  // Test frontend accessibility (basic)
  async testFrontendAccess() {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const req = http.get('http://localhost:5175', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          if (res.statusCode === 200) {
            this.addTestResult('Frontend Accessible', 'PASS', `Status: ${res.statusCode}`, duration);
            resolve(true);
          } else {
            this.addTestResult('Frontend Accessible', 'FAIL', `Status: ${res.statusCode}`, duration);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        this.addTestResult('Frontend Accessible', 'FAIL', error.message, duration);
        resolve(false);
      });

      req.setTimeout(5000);
      req.end();
    });
  }

  // Test API response times
  async testApiPerformance() {
    const endpoints = [
      '/api/health',
      '/api/db-check'
    ];

    let totalDuration = 0;
    let passedTests = 0;

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const result = await new Promise((resolve) => {
        const req = http.get(`http://localhost:3003${endpoint}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const duration = Date.now() - startTime;
            totalDuration += duration;

            if (duration < 1000) { // Less than 1 second
              this.addTestResult(`API Performance ${endpoint}`, 'PASS', `Response time: ${duration}ms`, duration);
              resolve(true);
            } else {
              this.addTestResult(`API Performance ${endpoint}`, 'FAIL', `Slow response: ${duration}ms`, duration);
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          const duration = Date.now() - startTime;
          this.addTestResult(`API Performance ${endpoint}`, 'FAIL', error.message, duration);
          resolve(false);
        });

        req.setTimeout(5000);
        req.end();
      });

      if (result) passedTests++;
    }

    const avgDuration = Math.round(totalDuration / endpoints.length);
    if (passedTests === endpoints.length) {
      this.addTestResult('Overall API Performance', 'PASS', `Average: ${avgDuration}ms`, avgDuration);
    } else {
      this.addTestResult('Overall API Performance', 'FAIL', `${passedTests}/${endpoints.length} endpoints fast enough`, avgDuration);
    }
  }

  // Run all validation tests
  async runValidationTests() {
    console.log('🧪 Running ResearchHub Validation Tests...');
    console.log('📊 Testing Framework: AI-Powered Automated Testing');
    console.log('⏰ Started:', new Date().toLocaleString());
    console.log('');

    const overallStartTime = Date.now();

    // Run all tests
    await this.testServerHealth();
    await this.testDatabaseConnection();
    await this.testAuthEndpoint();
    await this.testFrontendAccess();
    await this.testApiPerformance();

    const overallDuration = Date.now() - overallStartTime;
    this.results.summary.duration = overallDuration;

    // Generate report
    this.generateReport();

    // Print summary
    console.log('');
    console.log('📋 TEST SUMMARY');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`📊 Total: ${this.results.summary.total}`);
    console.log(`⏱️  Duration: ${overallDuration}ms`);
    console.log(`📁 Report: testing/reports/validation-report-${this.timestamp}.json`);
    
    if (this.results.summary.failed === 0) {
      console.log('');
      console.log('🎉 ALL TESTS PASSED! Framework is working correctly.');
    } else {
      console.log('');
      console.log('⚠️  Some tests failed. Check the detailed report for more information.');
    }

    return this.results;
  }

  // Generate JSON report
  generateReport() {
    this.ensureReportDir();
    
    const reportPath = path.join(this.reportDir, `validation-report-${this.timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Also generate a simple HTML report
    const htmlReport = this.generateHTMLReport();
    const htmlReportPath = path.join(this.reportDir, `validation-report-${this.timestamp}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);
  }

  // Generate HTML report
  generateHTMLReport() {
    const passRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>ResearchHub Validation Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .test-item { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #ddd; }
        .pass { background: #d4edda; border-left-color: #28a745; }
        .fail { background: #f8d7da; border-left-color: #dc3545; }
        .status { font-weight: bold; }
        .timestamp { color: #666; font-size: 0.9em; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 1.2em; font-weight: bold; color: #007acc; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 ResearchHub Validation Test Report</h1>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="metric">
                <div class="metric-value">${this.results.summary.passed}</div>
                <div>Tests Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.summary.failed}</div>
                <div>Tests Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${passRate}%</div>
                <div>Pass Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.summary.duration}ms</div>
                <div>Total Duration</div>
            </div>
        </div>

        <h2>📋 Detailed Results</h2>
        ${this.results.tests.map(test => `
            <div class="test-item ${test.status.toLowerCase()}">
                <div class="status">${test.status === 'PASS' ? '✅' : '❌'} ${test.name}</div>
                <div>${test.details || 'No additional details'}</div>
                <div class="timestamp">Duration: ${test.duration}ms | ${new Date(test.timestamp).toLocaleString()}</div>
            </div>
        `).join('')}

        <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Generated by ResearchHub AI-Powered Testing Framework</p>
            <p>Timestamp: ${this.results.timestamp}</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ValidationTest();
  validator.runValidationTests().then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Validation test failed:', error);
    process.exit(1);
  });
}

export default ValidationTest;
