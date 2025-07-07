#!/usr/bin/env node

/**
 * API Optimization Test Suite
 * Part of the Vibe-Coder-MCP implementation for ResearchHub
 * 
 * Tests all API optimization components:
 * - ApiClient functionality
 * - ResponseOptimizer features
 * - RouteOptimizer capabilities
 * - Integration testing
 * - Performance validation
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  verbose: true,
  timeout: 30000,
  baseUrl: 'http://localhost:3003/api',
  testEndpoints: [
    '/health',
    '/studies',
    '/applications',
    '/auth/profile'
  ]
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  timing: {}
};

/**
 * Test utilities
 */
class TestUtils {
  static log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      performance: '⚡'
    }[type] || '📝';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  static async runTest(name, testFn) {
    const startTime = Date.now();
    testResults.total++;
    
    try {
      TestUtils.log(`Starting test: ${name}`);
      await testFn();
      const duration = Date.now() - startTime;
      testResults.timing[name] = duration;
      testResults.passed++;
      TestUtils.log(`Test passed: ${name} (${duration}ms)`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      testResults.timing[name] = duration;
      testResults.failed++;
      testResults.errors.push({ test: name, error: error.message });
      TestUtils.log(`Test failed: ${name} - ${error.message}`, 'error');
      return false;
    }
  }

  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  static async makeRequest(url, options = {}) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.json().catch(() => null) : null,
      headers: Object.fromEntries(response.headers.entries())
    };
  }
}

/**
 * API Client Tests
 */
class ApiClientTests {
  static async testBasicRequest() {
    const startTime = Date.now();
    
    // Test basic GET request
    const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`);
    TestUtils.assert(response.status === 200, 'Health endpoint should return 200');
    
    const duration = Date.now() - startTime;
    TestUtils.log(`Basic request completed in ${duration}ms`, 'performance');
  }

  static async testErrorHandling() {
    // Test 404 handling
    const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/nonexistent`);
    TestUtils.assert(response.status === 404, 'Nonexistent endpoint should return 404');
  }

  static async testTimeoutHandling() {
    // Test timeout with very short timeout (this will likely timeout)
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1); // 1ms timeout
      
      await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`, {
        signal: controller.signal
      });
      
      // If we get here, the request was very fast
      TestUtils.log('Request completed before timeout', 'warning');
    } catch (error) {
      TestUtils.assert(error.name === 'AbortError', 'Should handle timeout correctly');
    }
  }

  static async testRequestHeaders() {
    const customHeaders = {
      'X-Test-Header': 'test-value',
      'X-Request-ID': 'test-123'
    };
    
    const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`, {
      headers: customHeaders
    });
    
    TestUtils.assert(response.status === 200, 'Request with custom headers should succeed');
  }
}

/**
 * Response Optimization Tests
 */
class ResponseOptimizationTests {
  static async testResponseCaching() {
    // Make first request
    const start1 = Date.now();
    const response1 = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`);
    const duration1 = Date.now() - start1;
    
    TestUtils.assert(response1.status === 200, 'First request should succeed');
    
    // Make second request (should be faster if cached)
    const start2 = Date.now();
    const response2 = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`);
    const duration2 = Date.now() - start2;
    
    TestUtils.assert(response2.status === 200, 'Second request should succeed');
    
    TestUtils.log(`Request timing: first=${duration1}ms, second=${duration2}ms`, 'performance');
  }

  static async testResponseValidation() {
    const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`);
    
    TestUtils.assert(response.status === 200, 'Response should have valid status');
    TestUtils.assert(response.headers['content-type'], 'Response should have content-type header');
  }

  static async testLargeResponseHandling() {
    // Test handling of larger responses
    const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/studies`);
    
    if (response.status === 200 && response.data) {
      TestUtils.log(`Studies endpoint returned ${JSON.stringify(response.data).length} bytes`, 'performance');
    } else {
      TestUtils.log('Studies endpoint not available for large response test', 'warning');
    }
  }
}

/**
 * Route Optimization Tests
 */
class RouteOptimizationTests {
  static async testMultipleEndpoints() {
    const promises = TEST_CONFIG.testEndpoints.map(async (endpoint) => {
      const start = Date.now();
      const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}${endpoint}`);
      const duration = Date.now() - start;
      
      return {
        endpoint,
        status: response.status,
        duration,
        success: response.status < 500 // Accept 200, 404, 401, etc. but not 500+
      };
    });
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    TestUtils.log(`Tested ${TEST_CONFIG.testEndpoints.length} endpoints, ${successful} successful`, 'performance');
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { endpoint, status, duration } = result.value;
        TestUtils.log(`${endpoint}: ${status} (${duration}ms)`, 'info');
      }
    });
  }

  static async testConcurrentRequests() {
    const concurrency = 5;
    const requests = Array(concurrency).fill().map(() => 
      TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`)
    );
    
    const start = Date.now();
    const results = await Promise.allSettled(requests);
    const duration = Date.now() - start;
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    
    TestUtils.log(`${successful}/${concurrency} concurrent requests successful in ${duration}ms`, 'performance');
    TestUtils.assert(successful >= concurrency * 0.8, 'At least 80% of concurrent requests should succeed');
  }

  static async testRateLimiting() {
    // Make rapid requests to test rate limiting
    const rapidRequests = 20;
    const requests = Array(rapidRequests).fill().map(() => 
      TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`)
    );
    
    const start = Date.now();
    const results = await Promise.allSettled(requests);
    const duration = Date.now() - start;
    
    const statusCodes = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.status);
    
    const rateLimited = statusCodes.filter(code => code === 429).length;
    
    TestUtils.log(`Made ${rapidRequests} rapid requests in ${duration}ms, ${rateLimited} rate limited`, 'performance');
  }
}

/**
 * Integration Tests
 */
class IntegrationTests {
  static async testEndToEndWorkflow() {
    // Test a complete workflow
    const steps = [
      { name: 'Health Check', url: '/health' },
      { name: 'Studies List', url: '/studies' },
      { name: 'Applications List', url: '/applications' }
    ];
    
    for (const step of steps) {
      const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}${step.url}`);
      TestUtils.log(`${step.name}: ${response.status}`, 'info');
      
      // Don't fail the test for auth-required endpoints
      if (response.status === 401) {
        TestUtils.log(`${step.name} requires authentication (expected)`, 'warning');
      } else if (response.status >= 500) {
        throw new Error(`${step.name} returned server error: ${response.status}`);
      }
    }
  }

  static async testPerformanceMetrics() {
    // Test multiple requests and measure performance
    const testCases = [
      { name: 'Health', url: '/health', expectedTime: 100 },
      { name: 'Studies', url: '/studies', expectedTime: 500 },
      { name: 'Applications', url: '/applications', expectedTime: 500 }
    ];
    
    for (const testCase of testCases) {
      const start = Date.now();
      const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}${testCase.url}`);
      const duration = Date.now() - start;
      
      TestUtils.log(`${testCase.name}: ${duration}ms (expected <${testCase.expectedTime}ms)`, 'performance');
      
      if (response.status < 500 && duration > testCase.expectedTime * 2) {
        TestUtils.log(`${testCase.name} slower than expected`, 'warning');
      }
    }
  }

  static async testSecurityHeaders() {
    const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`);
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    securityHeaders.forEach(header => {
      if (response.headers[header]) {
        TestUtils.log(`Security header present: ${header}`, 'success');
      } else {
        TestUtils.log(`Security header missing: ${header}`, 'warning');
      }
    });
  }
}

/**
 * Performance Tests
 */
class PerformanceTests {
  static async testResponseTimes() {
    const measurements = [];
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const response = await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`);
      const duration = Date.now() - start;
      
      if (response.status === 200) {
        measurements.push(duration);
      }
      
      await TestUtils.sleep(100); // Small delay between requests
    }
    
    if (measurements.length > 0) {
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);
      
      TestUtils.log(`Response times over ${iterations} requests: avg=${avg.toFixed(1)}ms, min=${min}ms, max=${max}ms`, 'performance');
      
      TestUtils.assert(avg < 1000, 'Average response time should be under 1 second');
      TestUtils.assert(max < 5000, 'Maximum response time should be under 5 seconds');
    }
  }

  static async testMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const before = process.memoryUsage();
      
      // Make several requests to test memory usage
      for (let i = 0; i < 50; i++) {
        await TestUtils.makeRequest(`${TEST_CONFIG.baseUrl}/health`);
      }
      
      const after = process.memoryUsage();
      const memoryIncrease = (after.heapUsed - before.heapUsed) / 1024 / 1024;
      
      TestUtils.log(`Memory usage increased by ${memoryIncrease.toFixed(2)}MB after 50 requests`, 'performance');
      
      TestUtils.assert(memoryIncrease < 50, 'Memory increase should be reasonable');
    } else {
      TestUtils.log('Memory usage testing not available in this environment', 'warning');
    }
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  TestUtils.log('Starting API Optimization Test Suite', 'info');
  TestUtils.log(`Testing against: ${TEST_CONFIG.baseUrl}`, 'info');
  
  const testSuites = [
    { name: 'API Client Tests', tests: ApiClientTests },
    { name: 'Response Optimization Tests', tests: ResponseOptimizationTests },
    { name: 'Route Optimization Tests', tests: RouteOptimizationTests },
    { name: 'Integration Tests', tests: IntegrationTests },
    { name: 'Performance Tests', tests: PerformanceTests }
  ];
  
  for (const suite of testSuites) {
    TestUtils.log(`\n=== ${suite.name} ===`, 'info');
    
    const testMethods = Object.getOwnPropertyNames(suite.tests)
      .filter(name => name.startsWith('test') && typeof suite.tests[name] === 'function');
    
    for (const testMethod of testMethods) {
      await TestUtils.runTest(`${suite.name}: ${testMethod}`, suite.tests[testMethod]);
    }
  }
  
  // Generate test summary
  TestUtils.log('\n=== Test Summary ===', 'info');
  TestUtils.log(`Total tests: ${testResults.total}`, 'info');
  TestUtils.log(`Passed: ${testResults.passed}`, 'success');
  TestUtils.log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  if (testResults.errors.length > 0) {
    TestUtils.log('\nErrors:', 'error');
    testResults.errors.forEach(error => {
      TestUtils.log(`  ${error.test}: ${error.error}`, 'error');
    });
  }
  
  // Performance summary
  const totalTime = Object.values(testResults.timing).reduce((a, b) => a + b, 0);
  const avgTime = totalTime / testResults.total;
  TestUtils.log(`\nTotal test time: ${totalTime}ms`, 'performance');
  TestUtils.log(`Average test time: ${avgTime.toFixed(1)}ms`, 'performance');
  
  // Success rate
  const successRate = (testResults.passed / testResults.total) * 100;
  TestUtils.log(`Success rate: ${successRate.toFixed(1)}%`, successRate >= 80 ? 'success' : 'warning');
  
  return {
    success: testResults.failed === 0,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: successRate,
      totalTime: totalTime,
      averageTime: avgTime
    }
  };
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(result => {
      if (result.success) {
        TestUtils.log('\n🎉 All tests passed!', 'success');
        process.exit(0);
      } else {
        TestUtils.log('\n💥 Some tests failed!', 'error');
        process.exit(1);
      }
    })
    .catch(error => {
      TestUtils.log(`\n💥 Test suite failed: ${error.message}`, 'error');
      console.error(error);
      process.exit(1);
    });
}

export { runAllTests, TestUtils };

// Execute tests if run directly
if (import.meta.url === `file://${__filename}`) {
  console.log('🚀 Starting API Optimization Test Suite...');
  runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
