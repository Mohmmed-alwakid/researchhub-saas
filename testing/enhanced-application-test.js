#!/usr/bin/env node

// Enhanced Application Testing - Tests actual ResearchHub workflows
// This test validates real user scenarios and application functionality

import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { URL } from 'url';

class EnhancedApplicationTest {
  constructor() {
    this.baseUrl = 'http://localhost:3003';
    this.frontendUrl = 'http://localhost:5175';
    this.reportDir = path.join(process.cwd(), 'testing', 'reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.testAccounts = {
      admin: { email: 'abwanwr77+admin@gmail.com', password: 'Testtest123' },
      researcher: { email: 'abwanwr77+Researcher@gmail.com', password: 'Testtest123' },
      participant: { email: 'abwanwr77+participant@gmail.com', password: 'Testtest123' }
    };
    this.results = {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0 },
      tests: []
    };
  }

  // HTTP request helper
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = httpModule.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000);

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
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

  // Test authentication flow
  async testAuthenticationFlow() {
    const startTime = Date.now();
    
    try {
      // Test researcher login
      const response = await this.makeRequest(`${this.baseUrl}/api/auth?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.testAccounts.researcher)
      });

      const duration = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        if (data.success && data.user) {
          this.addTestResult('Researcher Authentication', 'PASS', 
            `User: ${data.user.email}, Role: ${data.user.role}`, duration);
          return data.token;
        } else {
          this.addTestResult('Researcher Authentication', 'FAIL', 
            'Invalid response structure', duration);
          return null;
        }
      } else {
        this.addTestResult('Researcher Authentication', 'FAIL', 
          `HTTP ${response.statusCode}`, duration);
        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addTestResult('Researcher Authentication', 'FAIL', error.message, duration);
      return null;
    }
  }

  // Test study creation API
  async testStudyCreation(token) {
    const startTime = Date.now();
    
    try {
      const studyData = {
        title: 'Test Study - ' + Date.now(),
        description: 'Automated test study',
        type: 'user_interview',
        status: 'draft',
        blocks: [
          { type: 'welcome', title: 'Welcome', order: 0 },
          { type: 'open_question', title: 'Test Question', order: 1 },
          { type: 'thank_you', title: 'Thank You', order: 2 }
        ]
      };

      const response = await this.makeRequest(`${this.baseUrl}/api/studies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studyData)
      });

      const duration = Date.now() - startTime;
      
      if (response.statusCode === 201) {
        const data = JSON.parse(response.body);
        if (data.success && data.study) {
          this.addTestResult('Study Creation', 'PASS', 
            `Study ID: ${data.study.id}`, duration);
          return data.study.id;
        } else {
          this.addTestResult('Study Creation', 'FAIL', 
            'Invalid response structure', duration);
          return null;
        }
      } else {
        this.addTestResult('Study Creation', 'FAIL', 
          `HTTP ${response.statusCode}`, duration);
        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addTestResult('Study Creation', 'FAIL', error.message, duration);
      return null;
    }
  }

  // Test admin analytics
  async testAdminAnalytics(token) {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/admin/analytics?action=overview`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const duration = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        if (data.success && data.analytics) {
          this.addTestResult('Admin Analytics', 'PASS', 
            `Users: ${data.analytics.totalUsers}, Studies: ${data.analytics.totalStudies}`, duration);
          return true;
        } else {
          this.addTestResult('Admin Analytics', 'FAIL', 
            'Invalid response structure', duration);
          return false;
        }
      } else {
        this.addTestResult('Admin Analytics', 'FAIL', 
          `HTTP ${response.statusCode}`, duration);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addTestResult('Admin Analytics', 'FAIL', error.message, duration);
      return false;
    }
  }

  // Test database performance
  async testDatabasePerformance() {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/db-check?performance=true`);
      const duration = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        if (data.success && data.performance) {
          const performanceScore = duration < 500 ? 'EXCELLENT' : 
                                 duration < 1000 ? 'GOOD' : 
                                 duration < 2000 ? 'FAIR' : 'POOR';
          this.addTestResult('Database Performance', 'PASS', 
            `${performanceScore} (${duration}ms)`, duration);
          return true;
        }
      }
      
      this.addTestResult('Database Performance', 'FAIL', 
        `Slow response: ${duration}ms`, duration);
      return false;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addTestResult('Database Performance', 'FAIL', error.message, duration);
      return false;
    }
  }

  // Run all enhanced tests
  async runEnhancedTests() {
    console.log('🧪 Running Enhanced ResearchHub Application Tests...');
    console.log('📊 Testing Framework: AI-Powered Comprehensive Testing');
    console.log('⏰ Started:', new Date().toLocaleString());
    console.log('');

    const overallStartTime = Date.now();

    // Run authentication flow
    const token = await this.testAuthenticationFlow();
    
    if (token) {
      // Run authenticated tests
      await this.testStudyCreation(token);
      await this.testAdminAnalytics(token);
    }

    // Run performance tests
    await this.testDatabasePerformance();

    const overallDuration = Date.now() - overallStartTime;
    this.results.summary.duration = overallDuration;

    // Generate report
    this.generateReport();

    // Print summary
    console.log('');
    console.log('📋 ENHANCED TEST SUMMARY');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`📊 Total: ${this.results.summary.total}`);
    console.log(`⏱️  Duration: ${overallDuration}ms`);
    console.log(`📁 Report: testing/reports/enhanced-test-${this.timestamp}.json`);
    
    if (this.results.summary.failed === 0) {
      console.log('');
      console.log('🎉 ALL ENHANCED TESTS PASSED! Application is working correctly.');
    } else {
      console.log('');
      console.log('⚠️  Some tests failed. Check the detailed report for more information.');
    }

    return this.results;
  }

  // Generate test report
  generateReport() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
    
    const reportPath = path.join(this.reportDir, `enhanced-test-${this.timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EnhancedApplicationTest();
  tester.runEnhancedTests().then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Enhanced test failed:', error);
    process.exit(1);
  });
}

export default EnhancedApplicationTest;
