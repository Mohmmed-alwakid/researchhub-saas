/**
 * Advanced Testing Framework - Main Index
 * Centralized exports for ResearchHub testing system
 * Based on Vibe-Coder-MCP architectural patterns
 */

// Core Testing Classes
export { AdvancedTestRunner } from './AdvancedTestRunner';
export { TestSuiteBuilder, ResearchHubTestSuites } from './TestSuiteBuilder';
export { TestReportGenerator } from './TestReporting';

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
