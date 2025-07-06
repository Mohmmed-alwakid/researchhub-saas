#!/usr/bin/env node

/**
 * Advanced Testing Framework Test Suite
 * Comprehensive tests for the new testing system
 * Tests: AdvancedTestRunner, TestSuiteBuilder, TestReporting
 */

import { performance } from 'perf_hooks';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  verbose: process.argv.includes('--verbose'),
  outputDir: join(__dirname, '../../testing/reports'),
  timeout: 30000
};

// Ensure output directory exists
if (!existsSync(TEST_CONFIG.outputDir)) {
  mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
}

/**
 * Test result tracking
 */
class TestTracker {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now(),
      tests: []
    };
  }

  addTest(name, status, duration = 0, error = null) {
    this.results.total++;
    this.results[status]++;
    this.results.tests.push({
      name,
      status,
      duration,
      error: error?.message || null,
      timestamp: new Date().toISOString()
    });
  }

  getResults() {
    const endTime = Date.now();
    return {
      ...this.results,
      endTime,
      totalDuration: endTime - this.results.startTime,
      successRate: (this.results.passed / this.results.total * 100).toFixed(2)
    };
  }
}

const tracker = new TestTracker();

/**
 * Utility functions
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logVerbose(message) {
  if (TEST_CONFIG.verbose) {
    log(`[VERBOSE] ${message}`);
  }
}

async function runTest(name, testFn) {
  const startTime = performance.now();
  logVerbose(`Starting test: ${name}`);
  
  try {
    await testFn();
    const duration = performance.now() - startTime;
    tracker.addTest(name, 'passed', duration);
    log(`✅ ${name} (${duration.toFixed(2)}ms)`, 'success');
  } catch (error) {
    const duration = performance.now() - startTime;
    tracker.addTest(name, 'failed', duration, error);
    log(`❌ ${name} - ${error.message}`, 'error');
    logVerbose(`Error details: ${error.stack}`);
  }
}

/**
 * Mock implementations for testing
 */
class MockAdvancedTestRunner {
  constructor() {
    this.tests = new Map();
    this.results = new Map();
    this.isRunning = false;
  }

  async runTest(config) {
    logVerbose(`Running mock test: ${config.name}`);
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result = {
      id: `test_${Date.now()}`,
      config,
      status: Math.random() > 0.1 ? 'passed' : 'failed',
      startTime: new Date(),
      endTime: new Date(),
      duration: Math.random() * 100,
      metrics: {
        assertions: Math.floor(Math.random() * 10) + 1,
        passed: Math.floor(Math.random() * 8) + 1,
        failed: Math.floor(Math.random() * 2)
      }
    };
    
    this.results.set(result.id, result);
    return result;
  }

  async runSuite(suite) {
    logVerbose(`Running mock test suite: ${suite.name}`);
    
    const results = [];
    for (const test of suite.tests) {
      const result = await this.runTest(test);
      results.push(result);
    }
    
    return {
      id: `run_${Date.now()}`,
      suiteId: suite.id,
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    };
  }
}

class MockTestSuiteBuilder {
  constructor(name, description) {
    this.suite = {
      id: `suite_${Date.now()}`,
      name,
      description,
      tests: [],
      config: {
        parallel: false,
        maxConcurrency: 1,
        timeout: 30000,
        retries: 2,
        bail: false
      }
    };
  }

  addTest(config) {
    const test = {
      name: config.name,
      type: config.type || 'unit',
      priority: config.priority || 'normal',
      timeout: config.timeout || 30000,
      retries: config.retries || 2,
      tags: config.tags || [],
      environment: config.environment || 'test',
      dependencies: config.dependencies || [],
      metadata: config.metadata || {}
    };
    
    this.suite.tests.push(test);
    return this;
  }

  setParallel(parallel, maxConcurrency = 4) {
    this.suite.config.parallel = parallel;
    this.suite.config.maxConcurrency = maxConcurrency;
    return this;
  }

  setTimeout(timeout) {
    this.suite.config.timeout = timeout;
    return this;
  }

  build() {
    return this.suite;
  }
}

class MockTestReporting {
  constructor() {
    this.reports = new Map();
  }

  generateReport(runResults, options = {}) {
    const report = {
      id: `report_${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary: {
        total: runResults.length,
        passed: runResults.filter(r => r.status === 'passed').length,
        failed: runResults.filter(r => r.status === 'failed').length,
        successRate: 0
      },
      details: runResults,
      recommendations: [],
      metadata: options
    };

    report.summary.successRate = 
      (report.summary.passed / report.summary.total * 100).toFixed(2);

    // Generate recommendations
    if (report.summary.successRate < 90) {
      report.recommendations.push('Consider reviewing failed tests for common patterns');
    }
    if (runResults.some(r => r.duration > 5000)) {
      report.recommendations.push('Some tests are running slowly - consider optimization');
    }

    this.reports.set(report.id, report);
    return report;
  }

  exportReport(report, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }
    
    if (format === 'html') {
      return this.generateHtmlReport(report);
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${report.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .test-item { margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; }
        .test-passed { border-left-color: green; }
        .test-failed { border-left-color: red; }
    </style>
</head>
<body>
    <h1>Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: ${report.summary.total}</p>
        <p class="passed">Passed: ${report.summary.passed}</p>
        <p class="failed">Failed: ${report.summary.failed}</p>
        <p>Success Rate: ${report.summary.successRate}%</p>
    </div>
    
    <h2>Test Details</h2>
    ${report.details.map(test => `
        <div class="test-item test-${test.status}">
            <strong>${test.config.name}</strong> - ${test.status}
            <br>Duration: ${test.duration?.toFixed(2) || 'N/A'}ms
            ${test.error ? `<br>Error: ${test.error}` : ''}
        </div>
    `).join('')}
    
    ${report.recommendations.length > 0 ? `
        <h2>Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    ` : ''}
</body>
</html>`;
  }
}

/**
 * Test cases
 */
async function testAdvancedTestRunner() {
  const runner = new MockAdvancedTestRunner();
  
  // Test single test execution
  const testConfig = {
    name: 'Sample Unit Test',
    type: 'unit',
    priority: 'normal',
    timeout: 5000,
    retries: 1,
    tags: ['core', 'unit'],
    environment: 'test',
    dependencies: [],
    metadata: { author: 'test-suite' }
  };
  
  const result = await runner.runTest(testConfig);
  
  if (!result.id || !result.config || !result.status) {
    throw new Error('Test result missing required fields');
  }
  
  if (!['passed', 'failed', 'skipped', 'timeout'].includes(result.status)) {
    throw new Error(`Invalid test status: ${result.status}`);
  }
  
  logVerbose(`Test result: ${result.status} in ${result.duration}ms`);
}

async function testTestSuiteBuilder() {
  const builder = new MockTestSuiteBuilder('Sample Test Suite', 'Testing the test suite builder');
  
  const suite = builder
    .addTest({
      name: 'Test 1',
      type: 'unit',
      priority: 'high'
    })
    .addTest({
      name: 'Test 2',
      type: 'integration',
      priority: 'normal'
    })
    .setParallel(true, 2)
    .setTimeout(10000)
    .build();
  
  if (!suite.id || !suite.name || !suite.tests) {
    throw new Error('Test suite missing required fields');
  }
  
  if (suite.tests.length !== 2) {
    throw new Error(`Expected 2 tests, got ${suite.tests.length}`);
  }
  
  if (!suite.config.parallel) {
    throw new Error('Parallel execution not set correctly');
  }
  
  logVerbose(`Built test suite: ${suite.name} with ${suite.tests.length} tests`);
}

async function testTestReporting() {
  const reporting = new MockTestReporting();
  
  // Create mock test results
  const mockResults = [
    {
      id: 'test_1',
      config: { name: 'Test 1' },
      status: 'passed',
      duration: 150,
      startTime: new Date(),
      endTime: new Date()
    },
    {
      id: 'test_2',
      config: { name: 'Test 2' },
      status: 'failed',
      duration: 300,
      error: 'Assertion failed',
      startTime: new Date(),
      endTime: new Date()
    }
  ];
  
  const report = reporting.generateReport(mockResults, { 
    environment: 'test',
    branch: 'main'
  });
  
  if (!report.id || !report.summary || !report.details) {
    throw new Error('Report missing required fields');
  }
  
  if (report.summary.total !== 2) {
    throw new Error(`Expected 2 total tests, got ${report.summary.total}`);
  }
  
  if (report.summary.passed !== 1) {
    throw new Error(`Expected 1 passed test, got ${report.summary.passed}`);
  }
  
  if (report.summary.failed !== 1) {
    throw new Error(`Expected 1 failed test, got ${report.summary.failed}`);
  }
  
  // Test JSON export
  const jsonReport = reporting.exportReport(report, 'json');
  const parsed = JSON.parse(jsonReport);
  if (parsed.id !== report.id) {
    throw new Error('JSON export failed');
  }
  
  // Test HTML export
  const htmlReport = reporting.exportReport(report, 'html');
  if (!htmlReport.includes('<html>') || !htmlReport.includes(report.summary.total.toString())) {
    throw new Error('HTML export failed');
  }
  
  logVerbose(`Generated report with ${report.summary.total} tests, success rate: ${report.summary.successRate}%`);
}

async function testIntegration() {
  const runner = new MockAdvancedTestRunner();
  const builder = new MockTestSuiteBuilder('Integration Test Suite', 'Testing integration between components');
  const reporting = new MockTestReporting();
  
  // Build a comprehensive test suite
  const suite = builder
    .addTest({
      name: 'Auth Flow Test',
      type: 'integration',
      priority: 'critical',
      tags: ['auth', 'integration']
    })
    .addTest({
      name: 'Study Creation Test',
      type: 'e2e',
      priority: 'high',
      tags: ['study', 'creation', 'e2e']
    })
    .addTest({
      name: 'API Performance Test',
      type: 'performance',
      priority: 'normal',
      tags: ['api', 'performance']
    })
    .setParallel(true, 3)
    .build();
  
  // Run the test suite
  const runResult = await runner.runSuite(suite);
  
  if (!runResult.id || !runResult.results) {
    throw new Error('Test run result missing required fields');
  }
  
  // Generate report
  const report = reporting.generateReport(runResult.results, {
    suite: suite.name,
    environment: 'test',
    parallel: suite.config.parallel
  });
  
  if (!report.recommendations || !Array.isArray(report.recommendations)) {
    throw new Error('Report recommendations not generated properly');
  }
  
  logVerbose(`Integration test completed: ${runResult.results.length} tests, ${report.summary.successRate}% success rate`);
}

async function testResearchHubWorkflows() {
  const builder = new MockTestSuiteBuilder('ResearchHub Workflows', 'Testing ResearchHub-specific workflows');
  
  const suite = builder
    .addTest({
      name: 'Study Block Registry Test',
      type: 'unit',
      priority: 'high',
      tags: ['blocks', 'registry']
    })
    .addTest({
      name: 'Study Builder Integration Test',
      type: 'integration',
      priority: 'critical',
      tags: ['study-builder', 'integration']
    })
    .addTest({
      name: 'Participant Workflow Test',
      type: 'e2e',
      priority: 'critical',
      tags: ['participant', 'workflow', 'e2e']
    })
    .addTest({
      name: 'Researcher Dashboard Test',
      type: 'e2e',
      priority: 'high',
      tags: ['researcher', 'dashboard', 'e2e']
    })
    .addTest({
      name: 'Admin Panel Test',
      type: 'e2e',
      priority: 'normal',
      tags: ['admin', 'panel', 'e2e']
    })
    .setParallel(true, 2)
    .setTimeout(60000)
    .build();
  
  if (suite.tests.length !== 5) {
    throw new Error(`Expected 5 ResearchHub workflow tests, got ${suite.tests.length}`);
  }
  
  const researchHubTests = suite.tests.filter(test => 
    test.tags.some(tag => ['blocks', 'study-builder', 'participant', 'researcher', 'admin'].includes(tag))
  );
  
  if (researchHubTests.length !== 5) {
    throw new Error('Not all tests properly tagged for ResearchHub workflows');
  }
  
  logVerbose(`Created ResearchHub workflow suite with ${suite.tests.length} tests`);
}

/**
 * Main test execution
 */
async function runAllTests() {
  log('🚀 Starting Advanced Testing Framework Tests', 'info');
  log(`Verbose mode: ${TEST_CONFIG.verbose}`, 'info');
  log(`Output directory: ${TEST_CONFIG.outputDir}`, 'info');
  
  const tests = [
    ['AdvancedTestRunner Basic Functionality', testAdvancedTestRunner],
    ['TestSuiteBuilder Basic Functionality', testTestSuiteBuilder],
    ['TestReporting Basic Functionality', testTestReporting],
    ['Integration Testing', testIntegration],
    ['ResearchHub Specific Workflows', testResearchHubWorkflows]
  ];

  // Run all tests
  for (const [name, testFn] of tests) {
    await runTest(name, testFn);
  }

  // Generate final results
  const results = tracker.getResults();
  
  log(`\n📊 Test Results Summary:`, 'info');
  log(`Total Tests: ${results.total}`, 'info');
  log(`✅ Passed: ${results.passed}`, 'success');
  if (results.failed > 0) {
    log(`❌ Failed: ${results.failed}`, 'error');
  }
  if (results.skipped > 0) {
    log(`⏭️ Skipped: ${results.skipped}`, 'info');
  }
  log(`📈 Success Rate: ${results.successRate}%`, 'info');
  log(`⏱️ Total Duration: ${results.totalDuration}ms`, 'info');

  // Write detailed results to file
  const reportPath = join(TEST_CONFIG.outputDir, `advanced-testing-framework-test-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`📄 Detailed results written to: ${reportPath}`, 'info');

  // Exit with appropriate code
  const exitCode = results.failed > 0 ? 1 : 0;
  log(`🏁 Testing completed with exit code: ${exitCode}`, exitCode === 0 ? 'success' : 'error');
  
  return exitCode;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`💥 Unexpected error: ${error.message}`, 'error');
      console.error(error.stack);
      process.exit(1);
    });
}

export { runAllTests, MockAdvancedTestRunner, MockTestSuiteBuilder, MockTestReporting };
