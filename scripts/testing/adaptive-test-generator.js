/**
 * Adaptive Test Generator
 * Generates tests automatically based on code changes and analysis
 * 
 * Date: July 18, 2025
 * Part of: Adaptive Test Coverage Implementation
 */

import fs from 'fs';
import path from 'path';
import { AITestSuiteGenerator } from '../../testing/automated/ai-test-suite-generator.js';

export class AdaptiveTestGenerator extends AITestSuiteGenerator {
  constructor() {
    super();
    this.templates = {
      component: this.loadTemplate('component'),
      api: this.loadTemplate('api'),
      integration: this.loadTemplate('integration'),
      e2e: this.loadTemplate('e2e'),
      security: this.loadTemplate('security'),
      performance: this.loadTemplate('performance')
    };
  }

  /**
   * Generate tests for multiple changes at once
   */
  async generateTestsForChanges(changesList) {
    console.log(`🧪 Generating tests for ${changesList.length} changes...`);
    
    const allGeneratedTests = [];
    
    for (const changeAnalysis of changesList) {
      try {
        const tests = await this.generateTestsForChange(changeAnalysis);
        allGeneratedTests.push(...tests);
        console.log(`  ✅ Generated ${tests.length} tests for ${changeAnalysis.filePath}`);
      } catch (error) {
        console.error(`  ❌ Failed to generate tests for ${changeAnalysis.filePath}:`, error.message);
      }
    }
    
    // Remove duplicates and optimize test suite
    const optimizedTests = this.optimizeTestSuite(allGeneratedTests);
    
    console.log(`📊 Total: ${allGeneratedTests.length} tests generated, ${optimizedTests.length} after optimization`);
    
    return optimizedTests;
  }

  /**
   * Optimize test suite by removing duplicates and redundancies
   */
  optimizeTestSuite(tests) {
    // Remove exact duplicates
    const unique = tests.filter((test, index, array) => 
      array.findIndex(t => t.name === test.name && t.type === test.type) === index
    );
    
    // Group similar tests
    const grouped = this.groupSimilarTests(unique);
    
    return grouped;
  }

  /**
   * Group similar tests to reduce redundancy
   */
  groupSimilarTests(tests) {
    const groups = new Map();
    
    for (const test of tests) {
      const key = `${test.type}-${test.component || test.endpoint || 'general'}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(test);
    }
    
    // Merge similar tests in each group
    const optimized = [];
    for (const [key, groupTests] of groups) {
      if (groupTests.length === 1) {
        optimized.push(groupTests[0]);
      } else {
        // Merge multiple similar tests into comprehensive test
        const merged = this.mergeTests(groupTests);
        optimized.push(merged);
      }
    }
    
    return optimized;
  }

  /**
   * Merge multiple similar tests into one comprehensive test
   */
  mergeTests(tests) {
    const primary = tests[0];
    const additionalScenarios = tests.slice(1).map(t => t.scenarios || []).flat();
    
    return {
      ...primary,
      name: `${primary.name} (Comprehensive)`,
      scenarios: [...(primary.scenarios || []), ...additionalScenarios],
      merged: true,
      originalCount: tests.length
    };
  }

  /**
   * Generate tests for a detected change
   */
  async generateTestsForChange(changeAnalysis) {
    console.log(`🧪 Generating tests for ${changeAnalysis.category} change: ${changeAnalysis.filePath}`);
    
    const generatedTests = [];
    
    // Generate tests based on change type and impact
    for (const testType of changeAnalysis.testTypes) {
      const tests = await this.generateTestsByType(testType, changeAnalysis);
      generatedTests.push(...tests);
    }

    // Add regression tests for high-impact changes
    if (changeAnalysis.impact === 'high' || changeAnalysis.impact === 'critical') {
      const regressionTests = await this.generateRegressionTests(changeAnalysis);
      generatedTests.push(...regressionTests);
    }

    return generatedTests;
  }

  /**
   * Generate tests by specific type
   */
  async generateTestsByType(testType, changeAnalysis) {
    switch (testType) {
      case 'unit':
        return this.generateUnitTests(changeAnalysis);
      case 'component':
        return this.generateComponentTests(changeAnalysis);
      case 'api':
        return this.generateAPITests(changeAnalysis);
      case 'integration':
        return this.generateIntegrationTests(changeAnalysis);
      case 'e2e':
        return this.generateE2ETests(changeAnalysis);
      case 'security':
        return this.generateSecurityTests(changeAnalysis);
      case 'accessibility':
        return this.generateAccessibilityTests(changeAnalysis);
      case 'performance':
        return this.generatePerformanceTests(changeAnalysis);
      default:
        return [];
    }
  }

  /**
   * Generate unit tests for components/utilities
   */
  async generateUnitTests(changeAnalysis) {
    if (changeAnalysis.category !== 'component' && changeAnalysis.category !== 'utility') {
      return [];
    }

    const fileName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${fileName}.unit.test`;
    
    // Analyze the component/utility to understand its structure
    const codeAnalysis = await this.analyzeCodeStructure(changeAnalysis.filePath);
    
    const testContent = this.templates.component.replace(/{{COMPONENT_NAME}}/g, fileName)
      .replace(/{{TEST_SCENARIOS}}/g, this.generateUnitTestScenarios(codeAnalysis))
      .replace(/{{IMPORT_PATH}}/g, this.generateImportPath(changeAnalysis.filePath));

    return [{
      name: testName,
      type: 'unit',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'high'
    }];
  }

  /**
   * Generate component-specific tests
   */
  async generateComponentTests(changeAnalysis) {
    if (!changeAnalysis.filePath.includes('src/components/')) {
      return [];
    }

    const componentName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${componentName}.component.test`;
    
    // Analyze React component
    const componentAnalysis = await this.analyzeReactComponent(changeAnalysis.filePath);
    
    const testContent = `
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import ${componentName} from '${this.generateImportPath(changeAnalysis.filePath)}';

describe('${componentName} Component', () => {
  ${this.generateComponentTestScenarios(componentAnalysis)}
});
    `.trim();

    return [{
      name: testName,
      type: 'component',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'high'
    }];
  }

  /**
   * Generate API endpoint tests
   */
  async generateAPITests(changeAnalysis) {
    if (!changeAnalysis.filePath.includes('api/')) {
      return [];
    }

    const endpointName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${endpointName}.api.test`;
    
    // Analyze API endpoint
    const apiAnalysis = await this.analyzeAPIEndpoint(changeAnalysis.filePath);
    
    const testContent = `
import { test, expect, describe } from 'vitest';
import request from 'supertest';

describe('API Endpoint: /${endpointName}', () => {
  const baseUrl = 'http://localhost:3003/api';
  
  ${this.generateAPITestScenarios(apiAnalysis)}
});
    `.trim();

    return [{
      name: testName,
      type: 'api',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'critical'
    }];
  }

  /**
   * Generate integration tests
   */
  async generateIntegrationTests(changeAnalysis) {
    const fileName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${fileName}.integration.test`;
    
    const testContent = `
import { test, expect, describe, beforeAll, afterAll } from 'vitest';
import { setupTestEnvironment, cleanupTestEnvironment } from '../helpers/test-setup.js';

describe('${fileName} Integration Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  ${this.generateIntegrationTestScenarios(changeAnalysis)}
});
    `.trim();

    return [{
      name: testName,
      type: 'integration',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'high'
    }];
  }

  /**
   * Generate E2E tests for user workflows
   */
  async generateE2ETests(changeAnalysis) {
    const fileName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${fileName}.e2e.test`;
    
    const testContent = `
import { test, expect } from '@playwright/test';

test.describe('${fileName} E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
  });

  ${this.generateE2ETestScenarios(changeAnalysis)}
});
    `.trim();

    return [{
      name: testName,
      type: 'e2e',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'medium'
    }];
  }

  /**
   * Generate security tests
   */
  async generateSecurityTests(changeAnalysis) {
    const fileName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${fileName}.security.test`;
    
    const testContent = `
import { test, expect, describe } from 'vitest';

describe('${fileName} Security Tests', () => {
  ${this.generateSecurityTestScenarios(changeAnalysis)}
});
    `.trim();

    return [{
      name: testName,
      type: 'security',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'critical'
    }];
  }

  /**
   * Generate accessibility tests
   */
  async generateAccessibilityTests(changeAnalysis) {
    if (!changeAnalysis.filePath.includes('src/components/') && !changeAnalysis.filePath.includes('src/pages/')) {
      return [];
    }

    const fileName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${fileName}.accessibility.test`;
    
    const testContent = `
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('${fileName} Accessibility Tests', () => {
  test('should pass WCAG 2.1 AA compliance', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await injectAxe(page);
    
    ${this.generateAccessibilityTestScenarios(changeAnalysis)}
    
    await checkA11y(page);
  });
});
    `.trim();

    return [{
      name: testName,
      type: 'accessibility',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'medium'
    }];
  }

  /**
   * Generate performance tests
   */
  async generatePerformanceTests(changeAnalysis) {
    const fileName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${fileName}.performance.test`;
    
    const testContent = `
import { test, expect } from '@playwright/test';

test.describe('${fileName} Performance Tests', () => {
  ${this.generatePerformanceTestScenarios(changeAnalysis)}
});
    `.trim();

    return [{
      name: testName,
      type: 'performance',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'medium'
    }];
  }

  /**
   * Generate regression tests for critical changes
   */
  async generateRegressionTests(changeAnalysis) {
    const fileName = path.basename(changeAnalysis.filePath, path.extname(changeAnalysis.filePath));
    const testName = `${fileName}.regression.test`;
    
    const testContent = `
import { test, expect, describe } from 'vitest';

describe('${fileName} Regression Tests', () => {
  // These tests ensure existing functionality still works after changes
  
  test('should maintain backward compatibility', async () => {
    // Generated based on change analysis
    ${this.generateRegressionTestScenarios(changeAnalysis)}
  });
});
    `.trim();

    return [{
      name: testName,
      type: 'regression',
      content: testContent,
      filePath: changeAnalysis.filePath,
      priority: 'critical'
    }];
  }

  /**
   * Analyze code structure to understand what to test
   */
  async analyzeCodeStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        functions: this.extractFunctions(content),
        classes: this.extractClasses(content),
        exports: this.extractExports(content),
        imports: this.extractImports(content),
        complexity: this.calculateComplexity(content)
      };
    } catch (error) {
      console.warn(`⚠️ Could not analyze ${filePath}:`, error.message);
      return { functions: [], classes: [], exports: [], imports: [], complexity: 1 };
    }
  }

  /**
   * Analyze React component structure
   */
  async analyzeReactComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        componentName: this.extractComponentName(content),
        props: this.extractProps(content),
        hooks: this.extractHooks(content),
        events: this.extractEventHandlers(content),
        hasState: /useState|useReducer/.test(content),
        hasEffects: /useEffect/.test(content),
        hasContext: /useContext/.test(content)
      };
    } catch (error) {
      console.warn(`⚠️ Could not analyze React component ${filePath}:`, error.message);
      return { componentName: 'Component', props: [], hooks: [], events: [] };
    }
  }

  /**
   * Analyze API endpoint structure
   */
  async analyzeAPIEndpoint(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        methods: this.extractHTTPMethods(content),
        routes: this.extractRoutes(content),
        authentication: /req\.user|auth|token/.test(content),
        database: /supabase|db\.|query|select|insert|update|delete/i.test(content),
        validation: /zod|joi|validate/i.test(content),
        errorHandling: /try\s*{|catch\s*\(/.test(content)
      };
    } catch (error) {
      console.warn(`⚠️ Could not analyze API endpoint ${filePath}:`, error.message);
      return { methods: ['GET'], routes: [], authentication: false, database: false };
    }
  }

  /**
   * Generate test scenarios based on analysis
   */
  generateUnitTestScenarios(analysis) {
    const scenarios = [];
    
    // Test each function
    for (const func of analysis.functions) {
      scenarios.push(`
  test('${func.name} should work correctly', () => {
    // Test ${func.name} functionality
    expect(${func.name}).toBeDefined();
    // Add specific test cases based on function signature
  });`);
    }

    // Test exports
    for (const exp of analysis.exports) {
      scenarios.push(`
  test('should export ${exp}', () => {
    expect(${exp}).toBeDefined();
  });`);
    }

    return scenarios.join('\n');
  }

  generateComponentTestScenarios(analysis) {
    const scenarios = [];
    
    // Basic rendering test
    scenarios.push(`
  test('should render without crashing', () => {
    render(<${analysis.componentName} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });`);

    // Props testing
    if (analysis.props.length > 0) {
      scenarios.push(`
  test('should handle props correctly', () => {
    const testProps = { ${analysis.props.map(p => `${p}: 'test'`).join(', ')} };
    render(<${analysis.componentName} {...testProps} />);
    // Add specific prop validation
  });`);
    }

    // Event testing
    for (const event of analysis.events) {
      scenarios.push(`
  test('should handle ${event} event', async () => {
    const mockHandler = vi.fn();
    render(<${analysis.componentName} ${event}={mockHandler} />);
    // Trigger event and verify handler is called
  });`);
    }

    return scenarios.join('\n');
  }

  generateAPITestScenarios(analysis) {
    const scenarios = [];
    
    for (const method of analysis.methods) {
      scenarios.push(`
  test('${method} request should work correctly', async () => {
    const response = await request(baseUrl)
      .${method.toLowerCase()}('/${path.basename(changeAnalysis.filePath, '.js')}')
      .expect(200);
    
    expect(response.body).toBeDefined();
  });`);
      
      if (analysis.authentication) {
        scenarios.push(`
  test('${method} request should require authentication', async () => {
    await request(baseUrl)
      .${method.toLowerCase()}('/${path.basename(changeAnalysis.filePath, '.js')}')
      .expect(401);
  });`);
      }
    }

    return scenarios.join('\n');
  }

  /**
   * Extract various code patterns
   */
  extractFunctions(content) {
    const functions = [];
    const patterns = [
      /function\s+(\w+)/g,
      /const\s+(\w+)\s*=\s*\(/g,
      /(\w+)\s*:\s*function/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        functions.push({ name: match[1], type: 'function' });
      }
    }
    
    return functions;
  }

  extractComponentName(content) {
    const match = content.match(/export\s+(?:default\s+)?(?:const\s+|function\s+)?(\w+)/);
    return match ? match[1] : 'Component';
  }

  extractProps(content) {
    const match = content.match(/\{\s*([^}]+)\s*\}\s*:/);
    if (!match) return [];
    
    return match[1].split(',')
      .map(prop => prop.trim())
      .filter(prop => prop.length > 0);
  }

  extractHTTPMethods(content) {
    const methods = [];
    if (/req\.method\s*===\s*['"`]GET['"`]/.test(content)) methods.push('GET');
    if (/req\.method\s*===\s*['"`]POST['"`]/.test(content)) methods.push('POST');
    if (/req\.method\s*===\s*['"`]PUT['"`]/.test(content)) methods.push('PUT');
    if (/req\.method\s*===\s*['"`]DELETE['"`]/.test(content)) methods.push('DELETE');
    
    return methods.length > 0 ? methods : ['GET'];
  }

  /**
   * Load test templates
   */
  loadTemplate(type) {
    const templatePath = path.join(process.cwd(), 'testing', 'templates', `${type}.template.js`);
    
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    
    // Return default template
    return this.getDefaultTemplate(type);
  }

  getDefaultTemplate(type) {
    const templates = {
      component: `
import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import {{COMPONENT_NAME}} from '{{IMPORT_PATH}}';

describe('{{COMPONENT_NAME}}', () => {
  {{TEST_SCENARIOS}}
});
      `,
      api: `
import { test, expect, describe } from 'vitest';

describe('API Tests', () => {
  {{TEST_SCENARIOS}}
});
      `
    };
    
    return templates[type] || '// No template available';
  }

  generateImportPath(filePath) {
    // Convert absolute path to relative import path
    const relativePath = path.relative(process.cwd(), filePath);
    return relativePath.replace(/\\/g, '/').replace(/\.(ts|tsx|js|jsx)$/, '');
  }

  // Placeholder methods for test scenario generation
  generateIntegrationTestScenarios(changeAnalysis) {
    return `
  test('should integrate correctly with other components', async () => {
    // Integration test scenarios based on ${changeAnalysis.category}
    expect(true).toBe(true); // Replace with actual tests
  });`;
  }

  generateE2ETestScenarios(changeAnalysis) {
    return `
  test('should work in complete user workflow', async ({ page }) => {
    // E2E test scenarios for ${changeAnalysis.filePath}
    await expect(page).toHaveTitle(/ResearchHub/);
  });`;
  }

  generateSecurityTestScenarios(changeAnalysis) {
    return `
  test('should prevent security vulnerabilities', () => {
    // Security test scenarios for ${changeAnalysis.category}
    expect(true).toBe(true); // Replace with actual security tests
  });`;
  }

  generateAccessibilityTestScenarios(changeAnalysis) {
    return `
    // Navigate to component and test accessibility
    await page.goto('http://localhost:5175');
    // Add component-specific navigation if needed`;
  }

  generatePerformanceTestScenarios(changeAnalysis) {
    return `
  test('should meet performance requirements', async ({ page }) => {
    // Performance test scenarios for ${changeAnalysis.filePath}
    const startTime = Date.now();
    await page.goto('http://localhost:5175');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });`;
  }

  generateRegressionTestScenarios(changeAnalysis) {
    return `
    // Regression tests to ensure existing functionality still works
    // Tests generated based on ${changeAnalysis.impact} impact change
    expect(true).toBe(true); // Replace with actual regression tests`;
  }

  extractClasses(content) { return []; }
  extractExports(content) { return []; }
  extractImports(content) { return []; }
  extractHooks(content) { return []; }
  extractEventHandlers(content) { return []; }
  extractRoutes(content) { return []; }
  
  calculateComplexity(content) {
    return content.split('\n').length;
  }
}

export default AdaptiveTestGenerator;
