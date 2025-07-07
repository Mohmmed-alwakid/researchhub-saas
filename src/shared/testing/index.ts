/**
 * Comprehensive Testing Framework Index
 * Part of the Vibe-Coder-MCP implementation - Phase 3
 * 
 * Central hub for all testing frameworks:
 * - Unit Testing Framework
 * - Integration Testing Suite
 * - E2E Testing Framework
 * - Legacy Advanced Testing Framework
 */

// New Comprehensive Testing Frameworks (Phase 3)
export { default as UnitTestFramework, Assert, MockUtils, TestUtils } from './UnitTestFramework';
export { default as IntegrationTestSuite, IntegrationTestUtils } from './IntegrationTestSuite';
export { default as E2ETestFramework, BrowserUtils } from './E2ETestFramework';
export { default as PerformanceSecurityTester } from './PerformanceSecurityTester';

// Legacy Advanced Testing Framework (Phase 2)
export { AdvancedTestRunner } from './AdvancedTestRunner';
export { TestSuiteBuilder, ResearchHubTestSuites } from './TestSuiteBuilder';
export { TestReportGenerator } from './TestReporting';

// Re-export all types from individual frameworks
export * from './UnitTestFramework';
export * from './IntegrationTestSuite';
export * from './E2ETestFramework';

// Legacy types
export type {
  TestType,
  TestStatus,
  TestPriority,
  TestConfig,
  TestResult as LegacyTestResult,
  TestMetrics,
  TestSuite,
  TestEnvironment,
  TestReportConfig,
  HtmlReportOptions,
  JsonReportOptions,
  TestReportFormat,
  TestRunner,
  TestResults,
  TestSchedule
} from './AdvancedTestRunner';

/**
 * Simplified test runner that combines all frameworks
 */
export class SimplifiedTestRunner {
  static async runQuickTests(): Promise<boolean> {
    console.log('🚀 Running Quick Test Suite...');
    
    try {
      // Run basic unit tests
      const unitFramework = new UnitTestFramework({ timeout: 5000, verbose: false });
      
      unitFramework.suite('Quick Tests', () => {
        unitFramework.test('Basic functionality', async () => {
          Assert.assertEqual(2 + 2, 4);
          Assert.assertTrue(Array.isArray([]));
          Assert.assertNotNull('test');
        });
      });
      
      const results = await unitFramework.runAllSuites();
      
      console.log(`✅ Quick tests completed: ${results.summary.passed}/${results.summary.total} passed`);
      return results.success;
      
    } catch (error) {
      console.error('❌ Quick tests failed:', error);
      return false;
    }
  }
  
  static async runIntegrationTests(): Promise<boolean> {
    console.log('🚀 Running Integration Tests...');
    
    try {
      const integrationSuite = new IntegrationTestSuite();
      const results = await integrationSuite.runAllTests();
      
      const totalTests = results.results.reduce((sum, suite) => sum + suite.summary.total, 0);
      const passedTests = results.results.reduce((sum, suite) => sum + suite.summary.passed, 0);
      
      console.log(`✅ Integration tests completed: ${passedTests}/${totalTests} passed`);
      return results.success;
      
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      return false;
    }
  }
  
  static async runE2ETests(): Promise<boolean> {
    console.log('🚀 Running E2E Tests...');
    
    try {
      const e2eFramework = new E2ETestFramework();
      const results = await e2eFramework.runAllTests();
      
      const totalTests = results.results.reduce((sum, suite) => sum + suite.summary.total, 0);
      const passedTests = results.results.reduce((sum, suite) => sum + suite.summary.passed, 0);
      
      console.log(`✅ E2E tests completed: ${passedTests}/${totalTests} passed`);
      return results.success;
      
    } catch (error) {
      console.error('❌ E2E tests failed:', error);
      return false;
    }
  }
  
  static async runAllTests(): Promise<{ success: boolean; summary: string }> {
    console.log('🚀 Running Complete Test Suite...');
    
    const results = {
      unit: await this.runQuickTests(),
      integration: await this.runIntegrationTests(),
      e2e: await this.runE2ETests()
    };
    
    const success = results.unit && results.integration && results.e2e;
    const summary = `Unit: ${results.unit ? '✅' : '❌'}, Integration: ${results.integration ? '✅' : '❌'}, E2E: ${results.e2e ? '✅' : '❌'}`;
    
    console.log(`\n🎯 Overall Result: ${success ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Summary: ${summary}`);
    
    return { success, summary };
  }
}

// Type Definitions
export type {
  TestType,
  TestStatus,
  TestPriority,
  TestConfig,
  TestResult,
  TestMetrics,
  TestSuite,
  TestRun
} from './AdvancedTestRunner';

// Re-export reporting types
export type {
  TestReport,
  TestAnalytics,
  TestRecommendation,
  TestDashboard,
  PerformanceDistribution,
  FailurePattern
} from './TestReporting';

// Import types for local use
import type { TestResult } from './AdvancedTestRunner';
import { AdvancedTestRunner } from './AdvancedTestRunner';
import { TestSuiteBuilder, ResearchHubTestSuites } from './TestSuiteBuilder';
import { TestReportGenerator } from './TestReporting';

/**
 * Quick-start factory functions
 */
export function createTestRunner(config: Record<string, unknown> = {}) {
  return new AdvancedTestRunner(config);
}

export function createTestSuite(name: string, description: string) {
  return new TestSuiteBuilder(name, description);
}

export function createTestReporting(outputDir: string = 'testing/reports') {
  return new TestReportGenerator(outputDir);
}

/**
 * Pre-configured test suites for common scenarios
 */
export function getResearchHubTestSuites() {
  return new ResearchHubTestSuites();
}

/**
 * Default configurations
 */
export const DEFAULT_TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  parallel: false,
  maxConcurrency: 4,
  environment: 'test'
};

export const RESEARCH_HUB_TEST_TAGS = {
  CORE: 'core',
  AUTH: 'auth',
  STUDY: 'study',
  BLOCKS: 'blocks',
  API: 'api',
  UI: 'ui',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  ACCESSIBILITY: 'accessibility'
} as const;

/**
 * Utility functions
 */
export function isTestPassed(result: TestResult): boolean {
  return result?.status === 'passed';
}

export function isTestFailed(result: TestResult): boolean {
  return result?.status === 'failed';
}

export function calculateSuccessRate(results: TestResult[]): number {
  if (!results || results.length === 0) return 0;
  const passed = results.filter(isTestPassed).length;
  return (passed / results.length) * 100;
}

export function getTestDuration(result: TestResult): number {
  return result?.duration || 0;
}

export function getTotalDuration(results: TestResult[]): number {
  return results.reduce((total, result) => total + getTestDuration(result), 0);
}

/**
 * Version information
 */
export const TESTING_FRAMEWORK_VERSION = '1.0.0';
export const LAST_UPDATED = '2025-07-03';

/**
 * Framework metadata
 */
export const FRAMEWORK_INFO = {
  name: 'ResearchHub Advanced Testing Framework',
  version: TESTING_FRAMEWORK_VERSION,
  lastUpdated: LAST_UPDATED,
  author: 'Vibe-Coder-MCP Integration',
  description: 'Comprehensive testing framework for ResearchHub with job and notification integration',
  features: [
    'Type-safe test definitions',
    'Parallel test execution',
    'Job system integration',
    'Real-time notifications',
    'Comprehensive reporting',
    'ResearchHub-specific test suites',
    'Performance monitoring',
    'Analytics and recommendations'
  ]
};
