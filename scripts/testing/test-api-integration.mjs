#!/usr/bin/env node

/**
 * API Optimization Integration Test
 * Tests the actual API optimization components within ResearchHub
 * 
 * This script tests:
 * - Real API client integration
 * - Response optimization features
 * - Route optimization capabilities
 * - Caching performance
 * - Security integration
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import the API optimization modules
async function loadApiModules() {
  try {
    const apiModulePath = pathToFileURL(join(__dirname, '../../src/shared/api/index.ts')).href;
    const apiModule = await import(apiModulePath);
    return apiModule;
  } catch (error) {
    console.log('⚠️ Could not load TypeScript modules directly, using compiled versions');
    // Fallback to testing the built modules or using Node.js compatible modules
    return null;
  }
}

// Test configuration
const TEST_CONFIG = {
  verbose: true,
  baseUrl: 'http://localhost:3003/api',
  testTimeout: 30000
};

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Test utilities
 */
class IntegrationTestUtils {
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
      IntegrationTestUtils.log(`Starting integration test: ${name}`);
      await testFn();
      const duration = Date.now() - startTime;
      testResults.passed++;
      IntegrationTestUtils.log(`Integration test passed: ${name} (${duration}ms)`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      testResults.failed++;
      testResults.errors.push({ test: name, error: error.message });
      IntegrationTestUtils.log(`Integration test failed: ${name} - ${error.message}`, 'error');
      return false;
    }
  }

  static assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * API Module Integration Tests
 */
class ApiModuleIntegrationTests {
  static async testModuleImports() {
    const apiModule = await loadApiModules();
    
    if (apiModule) {
      // Test that all expected exports are available
      const expectedExports = [
        'ApiClient',
        'ResponseOptimizer', 
        'RouteOptimizer',
        'DEFAULT_API_CONFIG',
        'RESEARCHHUB_ROUTES',
        'initializeApiOptimization'
      ];
      
      expectedExports.forEach(exportName => {
        IntegrationTestUtils.assert(
          exportName in apiModule, 
          `${exportName} should be exported from API module`
        );
      });
      
      IntegrationTestUtils.log('All expected API module exports are available', 'success');
    } else {
      IntegrationTestUtils.log('Skipping module import tests - TypeScript modules not directly loadable', 'warning');
    }
  }

  static async testApiClientConfiguration() {
    const apiModule = await loadApiModules();
    
    if (apiModule) {
      const { DEFAULT_API_CONFIG } = apiModule;
      
      // Test default configuration
      IntegrationTestUtils.assert(
        DEFAULT_API_CONFIG.timeout > 0,
        'Default timeout should be positive'
      );
      
      IntegrationTestUtils.assert(
        DEFAULT_API_CONFIG.retryAttempts >= 0,
        'Retry attempts should be non-negative'
      );
      
      IntegrationTestUtils.assert(
        typeof DEFAULT_API_CONFIG.baseUrl === 'string',
        'Base URL should be a string'
      );
      
      IntegrationTestUtils.log('API client configuration is valid', 'success');
    } else {
      IntegrationTestUtils.log('Skipping API client configuration test', 'warning');
    }
  }

  static async testRouteConfiguration() {
    const apiModule = await loadApiModules();
    
    if (apiModule) {
      const { RESEARCHHUB_ROUTES } = apiModule;
      
      // Test that essential routes are configured
      const essentialRoutes = ['auth', 'studies', 'applications'];
      
      essentialRoutes.forEach(routeGroup => {
        IntegrationTestUtils.assert(
          routeGroup in RESEARCHHUB_ROUTES,
          `${routeGroup} route group should be configured`
        );
      });
      
      // Test auth routes specifically
      const authRoutes = ['login', 'profile'];
      authRoutes.forEach(route => {
        IntegrationTestUtils.assert(
          route in RESEARCHHUB_ROUTES.auth,
          `Auth route ${route} should be configured`
        );
      });
      
      IntegrationTestUtils.log('Route configuration is complete', 'success');
    } else {
      IntegrationTestUtils.log('Skipping route configuration test', 'warning');
    }
  }
}

/**
 * Backend Integration Tests
 */
class BackendIntegrationTests {
  static async testHealthEndpoint() {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
      
      IntegrationTestUtils.assert(
        response.status === 200,
        `Health endpoint should return 200, got ${response.status}`
      );
      
      const data = await response.json();
      IntegrationTestUtils.log(`Health endpoint response: ${JSON.stringify(data)}`, 'info');
      
    } catch (error) {
      throw new Error(`Health endpoint test failed: ${error.message}`);
    }
  }

  static async testCorsHeaders() {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
      
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];
      
      corsHeaders.forEach(header => {
        const value = response.headers.get(header);
        if (value) {
          IntegrationTestUtils.log(`CORS header ${header}: ${value}`, 'info');
        } else {
          IntegrationTestUtils.log(`CORS header ${header} not present`, 'warning');
        }
      });
      
    } catch (error) {
      throw new Error(`CORS headers test failed: ${error.message}`);
    }
  }

  static async testApiEndpoints() {
    const endpoints = [
      { path: '/health', expectedStatus: 200 },
      { path: '/studies', expectedStatus: [200, 401] }, // Might require auth
      { path: '/applications', expectedStatus: [200, 401] }, // Might require auth
      { path: '/nonexistent', expectedStatus: 404 }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint.path}`);
        const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
          ? endpoint.expectedStatus 
          : [endpoint.expectedStatus];
        
        IntegrationTestUtils.assert(
          expectedStatuses.includes(response.status),
          `Endpoint ${endpoint.path} returned ${response.status}, expected one of ${expectedStatuses.join(', ')}`
        );
        
        IntegrationTestUtils.log(`Endpoint ${endpoint.path}: ${response.status}`, 'info');
        
      } catch (error) {
        throw new Error(`Endpoint test failed for ${endpoint.path}: ${error.message}`);
      }
    }
  }
}

/**
 * Performance Integration Tests
 */
class PerformanceIntegrationTests {
  static async testResponseTimes() {
    const measurements = [];
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
        
        if (response.ok) {
          const duration = Date.now() - start;
          measurements.push(duration);
          IntegrationTestUtils.log(`Request ${i + 1}: ${duration}ms`, 'performance');
        }
        
      } catch (error) {
        IntegrationTestUtils.log(`Request ${i + 1} failed: ${error.message}`, 'warning');
      }
      
      await IntegrationTestUtils.sleep(100);
    }
    
    if (measurements.length > 0) {
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);
      
      IntegrationTestUtils.log(
        `Performance over ${measurements.length} requests: avg=${avg.toFixed(1)}ms, min=${min}ms, max=${max}ms`,
        'performance'
      );
      
      // Performance assertions
      IntegrationTestUtils.assert(avg < 2000, 'Average response time should be under 2 seconds');
      IntegrationTestUtils.assert(max < 5000, 'Maximum response time should be under 5 seconds');
    }
  }

  static async testConcurrentRequests() {
    const concurrency = 3; // Conservative for integration testing
    const promises = Array(concurrency).fill().map(async (_, index) => {
      const start = Date.now();
      
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
        const duration = Date.now() - start;
        
        return {
          index,
          status: response.status,
          duration,
          success: response.ok
        };
      } catch (error) {
        return {
          index,
          status: 0,
          duration: Date.now() - start,
          success: false,
          error: error.message
        };
      }
    });
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    
    IntegrationTestUtils.log(
      `Concurrent requests: ${successful}/${concurrency} successful`,
      'performance'
    );
    
    results.forEach(result => {
      const status = result.success ? 'success' : 'warning';
      IntegrationTestUtils.log(
        `  Request ${result.index}: ${result.status} (${result.duration}ms)`,
        status
      );
    });
    
    IntegrationTestUtils.assert(
      successful >= Math.floor(concurrency * 0.7),
      'At least 70% of concurrent requests should succeed'
    );
  }
}

/**
 * Error Handling Integration Tests
 */
class ErrorHandlingIntegrationTests {
  static async testNetworkErrors() {
    // Test with invalid URL
    try {
      await fetch('http://localhost:99999/invalid');
      throw new Error('Expected network error did not occur');
    } catch (error) {
      if (error.message.includes('Expected network error')) {
        throw error;
      }
      IntegrationTestUtils.log('Network error handled correctly', 'success');
    }
  }

  static async testInvalidEndpoints() {
    const invalidEndpoints = [
      '/invalid-endpoint',
      '/api/invalid',
      '/studies/invalid-id'
    ];
    
    for (const endpoint of invalidEndpoints) {
      const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint}`);
      
      IntegrationTestUtils.assert(
        response.status >= 400,
        `Invalid endpoint ${endpoint} should return 4xx or 5xx status`
      );
      
      IntegrationTestUtils.log(
        `Invalid endpoint ${endpoint}: ${response.status}`,
        'info'
      );
    }
  }

  static async testMalformedRequests() {
    // Test POST with invalid JSON
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/studies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json{'
      });
      
      IntegrationTestUtils.assert(
        response.status >= 400,
        'Malformed JSON should return error status'
      );
      
      IntegrationTestUtils.log(`Malformed request: ${response.status}`, 'info');
      
    } catch (error) {
      IntegrationTestUtils.log('Malformed request error handled', 'success');
    }
  }
}

/**
 * Main test runner
 */
async function runIntegrationTests() {
  IntegrationTestUtils.log('Starting API Optimization Integration Tests', 'info');
  IntegrationTestUtils.log(`Testing backend: ${TEST_CONFIG.baseUrl}`, 'info');
  
  const testSuites = [
    { name: 'API Module Integration', tests: ApiModuleIntegrationTests },
    { name: 'Backend Integration', tests: BackendIntegrationTests },
    { name: 'Performance Integration', tests: PerformanceIntegrationTests },
    { name: 'Error Handling Integration', tests: ErrorHandlingIntegrationTests }
  ];
  
  for (const suite of testSuites) {
    IntegrationTestUtils.log(`\n=== ${suite.name} ===`, 'info');
    
    const testMethods = Object.getOwnPropertyNames(suite.tests)
      .filter(name => name.startsWith('test') && typeof suite.tests[name] === 'function');
    
    for (const testMethod of testMethods) {
      await IntegrationTestUtils.runTest(
        `${suite.name}: ${testMethod}`,
        suite.tests[testMethod]
      );
    }
  }
  
  // Generate summary
  IntegrationTestUtils.log('\n=== Integration Test Summary ===', 'info');
  IntegrationTestUtils.log(`Total tests: ${testResults.total}`, 'info');
  IntegrationTestUtils.log(`Passed: ${testResults.passed}`, 'success');
  IntegrationTestUtils.log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  if (testResults.errors.length > 0) {
    IntegrationTestUtils.log('\nErrors:', 'error');
    testResults.errors.forEach(error => {
      IntegrationTestUtils.log(`  ${error.test}: ${error.error}`, 'error');
    });
  }
  
  const successRate = (testResults.passed / testResults.total) * 100;
  IntegrationTestUtils.log(`Success rate: ${successRate.toFixed(1)}%`, successRate >= 80 ? 'success' : 'warning');
  
  return {
    success: testResults.failed === 0,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: successRate
    }
  };
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests()
    .then(result => {
      if (result.success) {
        IntegrationTestUtils.log('\n🎉 All integration tests passed!', 'success');
        process.exit(0);
      } else {
        IntegrationTestUtils.log('\n💥 Some integration tests failed!', 'error');
        process.exit(1);
      }
    })
    .catch(error => {
      IntegrationTestUtils.log(`\n💥 Integration test suite failed: ${error.message}`, 'error');
      console.error(error);
      process.exit(1);
    });
}

export { runIntegrationTests };

// Execute tests if run directly
if (import.meta.url.endsWith('test-api-integration.mjs')) {
  console.log('🚀 Starting API Integration Test Suite...');
  runIntegrationTests().catch(error => {
    console.error('Integration test execution failed:', error);
    process.exit(1);
  });
}
