/**
 * Unit Testing Framework for ResearchHub
 * Part of the Vibe-Coder-MCP implementation - Phase 3
 * 
 * Provides comprehensive unit testing capabilities with:
 * - Test suite management
 * - Assertions and matchers
 * - Mocking and stubbing
 * - Coverage reporting
 * - Integration with existing test infrastructure
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Test result types
 */
export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: Error;
  assertions: number;
}

export interface TestSuiteResult {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  coverage?: CoverageReport;
}

export interface CoverageReport {
  statements: { covered: number; total: number; percentage: number };
  branches: { covered: number; total: number; percentage: number };
  functions: { covered: number; total: number; percentage: number };
  lines: { covered: number; total: number; percentage: number };
}

/**
 * Test configuration
 */
export interface UnitTestConfig {
  testDir: string;
  outputDir: string;
  timeout: number;
  parallel: boolean;
  coverage: boolean;
  verbose: boolean;
  bail: boolean;
  reporter: 'console' | 'html' | 'json';
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: UnitTestConfig = {
  testDir: 'src',
  outputDir: 'testing/reports/unit',
  timeout: 10000,
  parallel: true,
  coverage: true,
  verbose: true,
  bail: false,
  reporter: 'console'
};

/**
 * Test assertion utilities
 */
export class Assert {
  static passed = 0;
  static failed = 0;

  static reset() {
    this.passed = 0;
    this.failed = 0;
  }

  static getCount() {
    return { passed: this.passed, failed: this.failed, total: this.passed + this.failed };
  }

  static assertTrue(condition: boolean, message?: string): void {
    if (condition) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || 'Assertion failed: expected true but got false');
    }
  }

  static assertFalse(condition: boolean, message?: string): void {
    if (!condition) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || 'Assertion failed: expected false but got true');
    }
  }

  static assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual === expected) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || `Assertion failed: expected ${expected} but got ${actual}`);
    }
  }

  static assertNotEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || `Assertion failed: expected not to equal ${expected}`);
    }
  }

  static assertDeepEqual(actual: unknown, expected: unknown, message?: string): void {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || `Deep equality assertion failed: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
    }
  }

  static assertThrows(fn: () => void, expectedError?: string | RegExp, message?: string): void {
    try {
      fn();
      this.failed++;
      throw new Error(message || 'Expected function to throw but it did not');
    } catch (error) {
      if (expectedError) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (typeof expectedError === 'string') {
          if (errorMessage.includes(expectedError)) {
            this.passed++;
          } else {
            this.failed++;
            throw new Error(message || `Expected error containing "${expectedError}" but got "${errorMessage}"`);
          }
        } else if (expectedError instanceof RegExp) {
          if (expectedError.test(errorMessage)) {
            this.passed++;
          } else {
            this.failed++;
            throw new Error(message || `Expected error matching ${expectedError} but got "${errorMessage}"`);
          }
        }
      } else {
        this.passed++;
      }
    }
  }

  static async assertThrowsAsync(fn: () => Promise<void>, expectedError?: string | RegExp, message?: string): Promise<void> {
    try {
      await fn();
      this.failed++;
      throw new Error(message || 'Expected async function to throw but it did not');
    } catch (error) {
      if (expectedError) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (typeof expectedError === 'string') {
          if (errorMessage.includes(expectedError)) {
            this.passed++;
          } else {
            this.failed++;
            throw new Error(message || `Expected error containing "${expectedError}" but got "${errorMessage}"`);
          }
        } else if (expectedError instanceof RegExp) {
          if (expectedError.test(errorMessage)) {
            this.passed++;
          } else {
            this.failed++;
            throw new Error(message || `Expected error matching ${expectedError} but got "${errorMessage}"`);
          }
        }
      } else {
        this.passed++;
      }
    }
  }

  static assertInstanceOf<T>(obj: unknown, constructor: new (...args: unknown[]) => T, message?: string): void {
    if (obj instanceof constructor) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || `Expected instance of ${constructor.name} but got ${typeof obj}`);
    }
  }

  static assertUndefined(value: unknown, message?: string): void {
    if (value === undefined) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || `Expected undefined but got ${value}`);
    }
  }

  static assertNotUndefined(value: unknown, message?: string): void {
    if (value !== undefined) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || 'Expected value to not be undefined');
    }
  }

  static assertNull(value: unknown, message?: string): void {
    if (value === null) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || `Expected null but got ${value}`);
    }
  }

  static assertNotNull(value: unknown, message?: string): void {
    if (value !== null) {
      this.passed++;
    } else {
      this.failed++;
      throw new Error(message || 'Expected value to not be null');
    }
  }
}

/**
 * Mock and stub utilities
 */
interface MockObject {
  __isMock: boolean;
  __mockName: string;
  __calls: unknown[][];
  __implementation?: (...args: unknown[]) => unknown;
  __returnValue?: unknown;
  __mockImplementation: (fn: (...args: unknown[]) => unknown) => MockObject;
  __mockReturnValue: (value: unknown) => MockObject;
}

interface StubFunction {
  (...args: unknown[]): unknown;
  __isStub: boolean;
  __stubName: string;
  __calls: unknown[][];
  __returnValue?: unknown;
}

export class MockUtils {
  private static mocks = new Map<string, MockObject>();
  private static stubs = new Map<string, StubFunction>();

  static createMock<T>(name: string, implementation?: Partial<T>): T {
    const mock: MockObject = {
      ...implementation as Record<string, unknown>,
      __isMock: true,
      __mockName: name,
      __calls: [],
      __mockImplementation: (fn: (...args: unknown[]) => unknown) => {
        mock.__implementation = fn;
        return mock;
      },
      __mockReturnValue: (value: unknown) => {
        mock.__returnValue = value;
        return mock;
      }
    };

    this.mocks.set(name, mock);
    return mock as T;
  }

  static createStub(name: string, returnValue?: unknown): StubFunction {
    const stub = function(...args: unknown[]) {
      stub.__calls.push(args);
      return stub.__returnValue || returnValue;
    } as StubFunction;

    stub.__isStub = true;
    stub.__stubName = name;
    stub.__calls = [];
    stub.__returnValue = returnValue;

    this.stubs.set(name, stub);
    return stub;
  }

  static getMock<T>(name: string): T | undefined {
    return this.mocks.get(name) as T | undefined;
  }

  static getStub(name: string): StubFunction | undefined {
    return this.stubs.get(name);
  }

  static resetMocks(): void {
    this.mocks.clear();
  }

  static resetStubs(): void {
    this.stubs.clear();
  }

  static resetAll(): void {
    this.resetMocks();
    this.resetStubs();
  }

  static verifyMockCalled(name: string, times?: number): void {
    const mock = this.mocks.get(name);
    if (!mock) {
      throw new Error(`Mock "${name}" not found`);
    }

    if (times !== undefined) {
      Assert.assertEqual(mock.__calls.length, times, `Expected mock "${name}" to be called ${times} times`);
    } else {
      Assert.assertTrue(mock.__calls.length > 0, `Expected mock "${name}" to be called at least once`);
    }
  }

  static verifyStubCalled(name: string, times?: number): void {
    const stub = this.stubs.get(name);
    if (!stub) {
      throw new Error(`Stub "${name}" not found`);
    }

    if (times !== undefined) {
      Assert.assertEqual(stub.__calls.length, times, `Expected stub "${name}" to be called ${times} times`);
    } else {
      Assert.assertTrue(stub.__calls.length > 0, `Expected stub "${name}" to be called at least once`);
    }
  }
}

/**
 * Test utilities
 */
export class TestUtils {
  static log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];

    console.log(`${prefix} ${message}`);
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateTestData<T>(template: T, overrides?: Partial<T>): T {
    return { ...template, ...overrides };
  }

  static async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  static async measurePerformance<T>(fn: () => T | Promise<T>, label?: string): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (label) {
      this.log(`${label}: ${duration.toFixed(2)}ms`, 'info');
    }

    return { result, duration };
  }
}

/**
 * Main Unit Test Framework
 */
export class UnitTestFramework {
  private config: UnitTestConfig;
  private suites: Map<string, TestSuiteResult> = new Map();
  private currentSuite: string | null = null;

  constructor(config: Partial<UnitTestConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a test suite
   */
  suite(name: string, tests: () => void): void {
    this.currentSuite = name;
    const suiteResult: TestSuiteResult = {
      name,
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    };

    this.suites.set(name, suiteResult);
    
    try {
      TestUtils.log(`\n=== Starting Suite: ${name} ===`, 'info');
      tests();
    } catch (error) {
      TestUtils.log(`Suite setup failed: ${error}`, 'error');
    }
  }

  /**
   * Run a single test
   */
  async test(name: string, testFn: () => void | Promise<void>): Promise<void> {
    if (!this.currentSuite) {
      throw new Error('Test must be run within a suite');
    }

    const suite = this.suites.get(this.currentSuite)!;
    const startTime = performance.now();
    
    // Reset assertion counters
    Assert.reset();
    
    const testResult: TestResult = {
      name,
      status: 'passed',
      duration: 0,
      assertions: 0
    };

    try {
      TestUtils.log(`Running: ${name}`, 'info');
      
      if (this.config.timeout) {
        await TestUtils.withTimeout(Promise.resolve(testFn()), this.config.timeout);
      } else {
        await testFn();
      }

      testResult.duration = performance.now() - startTime;
      testResult.assertions = Assert.getCount().total;
      testResult.status = 'passed';
      
      suite.passedTests++;
      TestUtils.log(`Passed: ${name} (${testResult.duration.toFixed(2)}ms, ${testResult.assertions} assertions)`, 'success');
      
    } catch (error) {
      testResult.duration = performance.now() - startTime;
      testResult.assertions = Assert.getCount().total;
      testResult.status = 'failed';
      testResult.error = error instanceof Error ? error : new Error(String(error));
      
      suite.failedTests++;
      TestUtils.log(`Failed: ${name} - ${testResult.error.message}`, 'error');
      
      if (this.config.bail) {
        throw error;
      }
    }

    suite.tests.push(testResult);
    suite.totalTests++;
    suite.totalDuration += testResult.duration;
  }

  /**
   * Skip a test
   */
  skip(name: string, reason?: string): void {
    if (!this.currentSuite) {
      throw new Error('Test must be run within a suite');
    }

    const suite = this.suites.get(this.currentSuite)!;
    
    const testResult: TestResult = {
      name,
      status: 'skipped',
      duration: 0,
      assertions: 0
    };

    suite.tests.push(testResult);
    suite.totalTests++;
    suite.skippedTests++;
    
    TestUtils.log(`Skipped: ${name}${reason ? ` (${reason})` : ''}`, 'warning');
  }

  /**
   * Run all test suites
   */
  async runAllSuites(): Promise<{ success: boolean; results: TestSuiteResult[] }> {
    TestUtils.log('🚀 Starting Unit Test Framework', 'info');
    
    const results: TestSuiteResult[] = [];
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalDuration = 0;

    for (const suite of this.suites.values()) {
      results.push(suite);
      totalTests += suite.totalTests;
      totalPassed += suite.passedTests;
      totalFailed += suite.failedTests;
      totalSkipped += suite.skippedTests;
      totalDuration += suite.totalDuration;
    }

    // Generate summary
    TestUtils.log('\n=== Unit Test Summary ===', 'info');
    TestUtils.log(`Total Tests: ${totalTests}`, 'info');
    TestUtils.log(`Passed: ${totalPassed}`, 'success');
    TestUtils.log(`Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'success');
    TestUtils.log(`Skipped: ${totalSkipped}`, totalSkipped > 0 ? 'warning' : 'info');
    TestUtils.log(`Total Duration: ${totalDuration.toFixed(2)}ms`, 'info');
    
    const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    TestUtils.log(`Success Rate: ${successRate.toFixed(1)}%`, successRate >= 90 ? 'success' : 'warning');

    // Generate reports
    if (this.config.reporter === 'html' || this.config.reporter === 'json') {
      await this.generateReports(results);
    }

    return {
      success: totalFailed === 0,
      results
    };
  }

  /**
   * Generate test reports
   */
  private async generateReports(results: TestSuiteResult[]): Promise<void> {
    try {
      // Ensure output directory exists
      const outputPath = this.config.outputDir;
      
      if (this.config.reporter === 'json') {
        const jsonReport = {
          timestamp: new Date().toISOString(),
          config: this.config,
          results,
          summary: {
            totalSuites: results.length,
            totalTests: results.reduce((sum, suite) => sum + suite.totalTests, 0),
            totalPassed: results.reduce((sum, suite) => sum + suite.passedTests, 0),
            totalFailed: results.reduce((sum, suite) => sum + suite.failedTests, 0),
            totalSkipped: results.reduce((sum, suite) => sum + suite.skippedTests, 0),
            totalDuration: results.reduce((sum, suite) => sum + suite.totalDuration, 0)
          }
        };

        const jsonPath = join(outputPath, 'unit-test-results.json');
        writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
        TestUtils.log(`JSON report generated: ${jsonPath}`, 'success');
      }

      if (this.config.reporter === 'html') {
        const htmlReport = this.generateHtmlReport(results);
        const htmlPath = join(outputPath, 'unit-test-results.html');
        writeFileSync(htmlPath, htmlReport);
        TestUtils.log(`HTML report generated: ${htmlPath}`, 'success');
      }

    } catch (error) {
      TestUtils.log(`Failed to generate reports: ${error}`, 'error');
    }
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(results: TestSuiteResult[]): string {
    const totalTests = results.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = results.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = results.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalSkipped = results.reduce((sum, suite) => sum + suite.skippedTests, 0);
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

    const suiteRows = results.map(suite => `
      <tr>
        <td>${suite.name}</td>
        <td>${suite.totalTests}</td>
        <td class="success">${suite.passedTests}</td>
        <td class="error">${suite.failedTests}</td>
        <td class="warning">${suite.skippedTests}</td>
        <td>${suite.totalDuration.toFixed(2)}ms</td>
        <td>${suite.totalTests > 0 ? ((suite.passedTests / suite.totalTests) * 100).toFixed(1) : '0'}%</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unit Test Results - ResearchHub</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:hover { background-color: #f5f5f5; }
        .timestamp { text-align: center; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Unit Test Results - ResearchHub</h1>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${totalPassed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value error">${totalFailed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value warning">${totalSkipped}</div>
                <div class="metric-label">Skipped</div>
            </div>
            <div class="metric">
                <div class="metric-value ${parseFloat(successRate) >= 90 ? 'success' : 'warning'}">${successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>

        <h2>Test Suites</h2>
        <table>
            <thead>
                <tr>
                    <th>Suite Name</th>
                    <th>Total</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Skipped</th>
                    <th>Duration</th>
                    <th>Success Rate</th>
                </tr>
            </thead>
            <tbody>
                ${suiteRows}
            </tbody>
        </table>

        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }
}

export default UnitTestFramework;
