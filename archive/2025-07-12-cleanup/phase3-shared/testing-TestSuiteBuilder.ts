/**
 * Test Suite Builders and Utilities for ResearchHub
 * Pre-configured test suites for common ResearchHub workflows
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { 
  TestSuite, 
  TestConfig, 
  TestType
} from './AdvancedTestRunner';

/**
 * Builder class for creating test suites
 */
export class TestSuiteBuilder {
  private suite: Partial<TestSuite>;

  constructor(name: string, description: string) {
    this.suite = {
      id: `suite_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      name,
      description,
      tests: [],
      hooks: {},
      config: {
        parallel: false,
        maxConcurrency: 1,
        timeout: 30000,
        retries: 2,
        bail: false
      }
    };
  }

  /**
   * Add a test to the suite
   */
  public addTest(config: Partial<TestConfig> & { name: string }): TestSuiteBuilder {
    const test: TestConfig = {
      type: 'unit',
      priority: 'normal',
      timeout: 30000,
      retries: 2,
      tags: [],
      environment: 'test',
      dependencies: [],
      metadata: {},
      ...config
    };

    this.suite.tests!.push(test);
    return this;
  }

  /**
   * Configure suite settings
   */
  public configure(config: Partial<TestSuite['config']>): TestSuiteBuilder {
    this.suite.config = { ...this.suite.config!, ...config };
    return this;
  }

  /**
   * Add hooks to the suite
   */
  public addHooks(hooks: TestSuite['hooks']): TestSuiteBuilder {
    this.suite.hooks = { ...this.suite.hooks, ...hooks };
    return this;
  }

  /**
   * Build the test suite
   */
  public build(): TestSuite {
    if (!this.suite.tests || this.suite.tests.length === 0) {
      throw new Error('Test suite must have at least one test');
    }

    return this.suite as TestSuite;
  }
}

/**
 * Pre-configured test suites for ResearchHub
 */
export class ResearchHubTestSuites {
  /**
   * Create a study workflow test suite
   */
  static createStudyWorkflowSuite(): TestSuite {
    return new TestSuiteBuilder(
      'Study Workflow Tests',
      'Comprehensive testing of study creation, management, and execution workflows'
    )
      .addTest({
        name: 'Study Creation - Basic Flow',
        type: 'e2e',
        priority: 'critical',
        tags: ['study', 'creation', 'workflow'],
        metadata: {
          description: 'Test basic study creation from template',
          expectedDuration: 15000
        }
      })
      .addTest({
        name: 'Study Creation - Custom Blocks',
        type: 'e2e',
        priority: 'high',
        tags: ['study', 'blocks', 'customization'],
        metadata: {
          description: 'Test study creation with custom block configuration'
        }
      })
      .addTest({
        name: 'Study Builder - Block Management',
        type: 'integration',
        priority: 'high',
        tags: ['study-builder', 'blocks'],
        metadata: {
          description: 'Test adding, removing, and reordering study blocks'
        }
      })
      .addTest({
        name: 'Study Publication',
        type: 'e2e',
        priority: 'critical',
        tags: ['study', 'publication'],
        metadata: {
          description: 'Test study publication and participant access'
        }
      })
      .addTest({
        name: 'Study Results Collection',
        type: 'e2e',
        priority: 'high',
        tags: ['study', 'results', 'data'],
        metadata: {
          description: 'Test participant response collection and data integrity'
        }
      })
      .configure({
        parallel: false,
        maxConcurrency: 1,
        timeout: 60000,
        retries: 1,
        bail: true
      })
      .addHooks({
        beforeAll: async () => {
          // Set up test data, authenticate test users
          console.log('Setting up study workflow test environment...');
        },
        afterAll: async () => {
          // Clean up test data
          console.log('Cleaning up study workflow test data...');
        }
      })
      .build();
  }

  /**
   * Create a user authentication test suite
   */
  static createAuthenticationSuite(): TestSuite {
    return new TestSuiteBuilder(
      'Authentication Tests',
      'User authentication, authorization, and role management tests'
    )
      .addTest({
        name: 'User Registration',
        type: 'api',
        priority: 'critical',
        tags: ['auth', 'registration'],
        metadata: {
          description: 'Test user registration with email verification'
        }
      })
      .addTest({
        name: 'User Login',
        type: 'api',
        priority: 'critical',
        tags: ['auth', 'login'],
        metadata: {
          description: 'Test user login with valid credentials'
        }
      })
      .addTest({
        name: 'Password Reset',
        type: 'api',
        priority: 'high',
        tags: ['auth', 'password'],
        metadata: {
          description: 'Test password reset functionality'
        }
      })
      .addTest({
        name: 'Role-Based Access Control',
        type: 'integration',
        priority: 'critical',
        tags: ['auth', 'rbac', 'permissions'],
        metadata: {
          description: 'Test role-based access to different features'
        }
      })
      .addTest({
        name: 'Token Refresh',
        type: 'api',
        priority: 'high',
        tags: ['auth', 'tokens'],
        metadata: {
          description: 'Test automatic token refresh functionality'
        }
      })
      .configure({
        parallel: true,
        maxConcurrency: 3,
        timeout: 15000,
        retries: 2,
        bail: false
      })
      .build();
  }

  /**
   * Create a performance test suite
   */
  static createPerformanceSuite(): TestSuite {
    return new TestSuiteBuilder(
      'Performance Tests',
      'Performance, load, and stress testing for ResearchHub'
    )
      .addTest({
        name: 'Homepage Load Performance',
        type: 'performance',
        priority: 'high',
        tags: ['performance', 'load', 'homepage'],
        timeout: 30000,
        metadata: {
          description: 'Test homepage load time and performance metrics',
          thresholds: {
            loadTime: 3000,
            firstContentfulPaint: 1500,
            largestContentfulPaint: 2500
          }
        }
      })
      .addTest({
        name: 'Study Builder Performance',
        type: 'performance',
        priority: 'high',
        tags: ['performance', 'study-builder'],
        metadata: {
          description: 'Test study builder performance with large number of blocks'
        }
      })
      .addTest({
        name: 'API Response Times',
        type: 'performance',
        priority: 'normal',
        tags: ['performance', 'api'],
        metadata: {
          description: 'Test API endpoint response times under normal load'
        }
      })
      .addTest({
        name: 'Database Query Performance',
        type: 'performance',
        priority: 'normal',
        tags: ['performance', 'database'],
        metadata: {
          description: 'Test database query performance for complex operations'
        }
      })
      .addTest({
        name: 'Concurrent User Load Test',
        type: 'load',
        priority: 'normal',
        tags: ['load', 'concurrent'],
        timeout: 120000,
        metadata: {
          description: 'Test system performance with multiple concurrent users',
          userCount: 50,
          duration: 60000
        }
      })
      .configure({
        parallel: false,
        maxConcurrency: 1,
        timeout: 60000,
        retries: 1,
        bail: false
      })
      .build();
  }

  /**
   * Create an accessibility test suite
   */
  static createAccessibilitySuite(): TestSuite {
    return new TestSuiteBuilder(
      'Accessibility Tests',
      'WCAG 2.1 AA compliance and accessibility testing'
    )
      .addTest({
        name: 'Homepage Accessibility',
        type: 'accessibility',
        priority: 'high',
        tags: ['a11y', 'homepage', 'wcag'],
        metadata: {
          description: 'Test homepage for WCAG 2.1 AA compliance',
          standard: 'WCAG21AA'
        }
      })
      .addTest({
        name: 'Study Builder Accessibility',
        type: 'accessibility',
        priority: 'high',
        tags: ['a11y', 'study-builder', 'wcag'],
        metadata: {
          description: 'Test study builder accessibility and keyboard navigation'
        }
      })
      .addTest({
        name: 'Form Accessibility',
        type: 'accessibility',
        priority: 'critical',
        tags: ['a11y', 'forms', 'screen-reader'],
        metadata: {
          description: 'Test form accessibility and screen reader compatibility'
        }
      })
      .addTest({
        name: 'Color Contrast Compliance',
        type: 'accessibility',
        priority: 'normal',
        tags: ['a11y', 'contrast', 'visual'],
        metadata: {
          description: 'Test color contrast ratios meet WCAG standards'
        }
      })
      .addTest({
        name: 'Keyboard Navigation',
        type: 'accessibility',
        priority: 'high',
        tags: ['a11y', 'keyboard', 'navigation'],
        metadata: {
          description: 'Test complete keyboard navigation functionality'
        }
      })
      .configure({
        parallel: true,
        maxConcurrency: 2,
        timeout: 45000,
        retries: 1,
        bail: false
      })
      .build();
  }

  /**
   * Create an API test suite
   */
  static createAPISuite(): TestSuite {
    return new TestSuiteBuilder(
      'API Tests',
      'Comprehensive API endpoint testing and validation'
    )
      .addTest({
        name: 'Studies API - CRUD Operations',
        type: 'api',
        priority: 'critical',
        tags: ['api', 'studies', 'crud'],
        metadata: {
          description: 'Test complete CRUD operations for studies API'
        }
      })
      .addTest({
        name: 'Users API - Profile Management',
        type: 'api',
        priority: 'high',
        tags: ['api', 'users', 'profiles'],
        metadata: {
          description: 'Test user profile management endpoints'
        }
      })
      .addTest({
        name: 'Applications API - Workflow',
        type: 'api',
        priority: 'high',
        tags: ['api', 'applications', 'workflow'],
        metadata: {
          description: 'Test study application submission and approval workflow'
        }
      })
      .addTest({
        name: 'Notifications API - Real-time',
        type: 'api',
        priority: 'normal',
        tags: ['api', 'notifications', 'sse'],
        metadata: {
          description: 'Test real-time notification API endpoints'
        }
      })
      .addTest({
        name: 'Jobs API - Background Processing',
        type: 'api',
        priority: 'normal',
        tags: ['api', 'jobs', 'background'],
        metadata: {
          description: 'Test background job management API'
        }
      })
      .addTest({
        name: 'Error Handling - Invalid Requests',
        type: 'api',
        priority: 'normal',
        tags: ['api', 'errors', 'validation'],
        metadata: {
          description: 'Test API error handling and validation responses'
        }
      })
      .configure({
        parallel: true,
        maxConcurrency: 4,
        timeout: 20000,
        retries: 2,
        bail: false
      })
      .build();
  }

  /**
   * Create a visual regression test suite
   */
  static createVisualRegressionSuite(): TestSuite {
    return new TestSuiteBuilder(
      'Visual Regression Tests',
      'Visual testing to catch UI regressions and design inconsistencies'
    )
      .addTest({
        name: 'Homepage Visual Consistency',
        type: 'visual',
        priority: 'normal',
        tags: ['visual', 'homepage', 'ui'],
        metadata: {
          description: 'Test homepage visual consistency across browsers'
        }
      })
      .addTest({
        name: 'Study Builder Interface',
        type: 'visual',
        priority: 'high',
        tags: ['visual', 'study-builder', 'interface'],
        metadata: {
          description: 'Test study builder visual consistency and layout'
        }
      })
      .addTest({
        name: 'Mobile Responsive Design',
        type: 'visual',
        priority: 'high',
        tags: ['visual', 'mobile', 'responsive'],
        metadata: {
          description: 'Test responsive design on various mobile devices'
        }
      })
      .addTest({
        name: 'Dark Mode Compatibility',
        type: 'visual',
        priority: 'normal',
        tags: ['visual', 'dark-mode', 'theme'],
        metadata: {
          description: 'Test dark mode visual consistency'
        }
      })
      .configure({
        parallel: true,
        maxConcurrency: 2,
        timeout: 30000,
        retries: 1,
        bail: false
      })
      .build();
  }

  /**
   * Create a smoke test suite for quick validation
   */
  static createSmokeSuite(): TestSuite {
    return new TestSuiteBuilder(
      'Smoke Tests',
      'Quick smoke tests for basic functionality validation'
    )
      .addTest({
        name: 'Application Startup',
        type: 'smoke',
        priority: 'critical',
        tags: ['smoke', 'startup'],
        timeout: 10000,
        metadata: {
          description: 'Test application starts and loads correctly'
        }
      })
      .addTest({
        name: 'Database Connection',
        type: 'smoke',
        priority: 'critical',
        tags: ['smoke', 'database'],
        metadata: {
          description: 'Test database connectivity and basic queries'
        }
      })
      .addTest({
        name: 'Authentication Service',
        type: 'smoke',
        priority: 'critical',
        tags: ['smoke', 'auth'],
        metadata: {
          description: 'Test authentication service is working'
        }
      })
      .addTest({
        name: 'Core API Endpoints',
        type: 'smoke',
        priority: 'critical',
        tags: ['smoke', 'api'],
        metadata: {
          description: 'Test core API endpoints are responsive'
        }
      })
      .addTest({
        name: 'Job System Health',
        type: 'smoke',
        priority: 'high',
        tags: ['smoke', 'jobs'],
        metadata: {
          description: 'Test background job system is operational'
        }
      })
      .addTest({
        name: 'Notification System Health',
        type: 'smoke',
        priority: 'normal',
        tags: ['smoke', 'notifications'],
        metadata: {
          description: 'Test real-time notification system is working'
        }
      })
      .configure({
        parallel: true,
        maxConcurrency: 3,
        timeout: 15000,
        retries: 1,
        bail: true
      })
      .build();
  }

  /**
   * Get all pre-configured test suites
   */
  static getAllSuites(): TestSuite[] {
    return [
      this.createSmokeSuite(),
      this.createAuthenticationSuite(),
      this.createStudyWorkflowSuite(),
      this.createAPISuite(),
      this.createPerformanceSuite(),
      this.createAccessibilitySuite(),
      this.createVisualRegressionSuite()
    ];
  }
}

/**
 * Test utilities for common operations
 */
export class TestUtils {
  /**
   * Create a test configuration with common defaults
   */
  static createTestConfig(
    name: string,
    type: TestType = 'unit',
    overrides: Partial<TestConfig> = {}
  ): TestConfig {
    return {
      name,
      type,
      priority: 'normal',
      timeout: 30000,
      retries: 2,
      tags: [],
      environment: 'test',
      dependencies: [],
      metadata: {},
      ...overrides
    };
  }

  /**
   * Create test configurations for common ResearchHub scenarios
   */
  static createResearchHubTestConfigs(): Record<string, TestConfig> {
    return {
      studyCreation: this.createTestConfig('Study Creation Flow', 'e2e', {
        priority: 'critical',
        tags: ['study', 'creation', 'workflow'],
        timeout: 60000
      }),
      
      userRegistration: this.createTestConfig('User Registration', 'api', {
        priority: 'critical',
        tags: ['auth', 'registration'],
        timeout: 15000
      }),
      
      blockLibrary: this.createTestConfig('Block Library Management', 'integration', {
        priority: 'high',
        tags: ['blocks', 'library'],
        timeout: 30000
      }),
      
      dataExport: this.createTestConfig('Study Data Export', 'e2e', {
        priority: 'high',
        tags: ['data', 'export', 'results'],
        timeout: 45000
      }),
      
      collaboration: this.createTestConfig('Team Collaboration', 'e2e', {
        priority: 'normal',
        tags: ['collaboration', 'team'],
        timeout: 60000
      }),
      
      notifications: this.createTestConfig('Real-time Notifications', 'integration', {
        priority: 'normal',
        tags: ['notifications', 'real-time'],
        timeout: 20000
      }),
      
      jobProcessing: this.createTestConfig('Background Job Processing', 'integration', {
        priority: 'high',
        tags: ['jobs', 'background'],
        timeout: 30000
      })
    };
  }

  /**
   * Filter tests by tags
   */
  static filterTestsByTags(tests: TestConfig[], tags: string[]): TestConfig[] {
    return tests.filter(test => 
      tags.some(tag => test.tags.includes(tag))
    );
  }

  /**
   * Group tests by type
   */
  static groupTestsByType(tests: TestConfig[]): Record<TestType, TestConfig[]> {
    const groups: Partial<Record<TestType, TestConfig[]>> = {};
    
    tests.forEach(test => {
      if (!groups[test.type]) {
        groups[test.type] = [];
      }
      groups[test.type]!.push(test);
    });
    
    return groups as Record<TestType, TestConfig[]>;
  }

  /**
   * Calculate estimated test duration
   */
  static calculateEstimatedDuration(tests: TestConfig[]): number {
    return tests.reduce((total, test) => total + test.timeout, 0);
  }

  /**
   * Validate test configuration
   */
  static validateTestConfig(config: TestConfig): string[] {
    const errors: string[] = [];
    
    if (!config.name || config.name.trim().length === 0) {
      errors.push('Test name is required');
    }
    
    if (config.timeout <= 0) {
      errors.push('Test timeout must be positive');
    }
    
    if (config.retries < 0) {
      errors.push('Test retries cannot be negative');
    }
    
    if (!config.environment || config.environment.trim().length === 0) {
      errors.push('Test environment is required');
    }
    
    return errors;
  }
}

// Export default test suite collection
export const defaultTestSuites = ResearchHubTestSuites.getAllSuites();
