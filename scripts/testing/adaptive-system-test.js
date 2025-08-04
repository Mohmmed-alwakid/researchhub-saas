#!/usr/bin/env node

/**
 * Adaptive Testing System Validation
 * Tests all components of the adaptive testing framework
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AdaptiveSystemValidator {
  constructor() {
    this.results = {
      components: {},
      integration: {},
      overall: 'pending'
    };
  }

  async validateSystem() {
    console.log('🧪 Validating Adaptive Testing System...\n');

    try {
      // Test 1: Component Validation
      await this.validateComponents();
      
      // Test 2: Integration Testing
      await this.validateIntegration();
      
      // Test 3: Overall Assessment
      this.assessOverallHealth();
      
      // Generate Report
      this.generateValidationReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      this.results.overall = 'failed';
    }
  }

  async validateComponents() {
    console.log('📦 Validating Individual Components...');
    
    const components = [
      {
        name: 'Change Detector',
        path: join(__dirname, 'change-detector.js'),
        test: () => this.testChangeDetector()
      },
      {
        name: 'Test Generator',
        path: join(__dirname, 'adaptive-test-generator.js'),
        test: () => this.testAdaptiveGenerator()
      },
      {
        name: 'Coverage Analyzer',
        path: join(__dirname, 'coverage-analyzer.js'),
        test: () => this.testCoverageAnalyzer()
      },
      {
        name: 'Main Automation',
        path: join(__dirname, '../../testing/testing-automation.js'),
        test: () => this.testMainAutomation()
      }
    ];

    for (const component of components) {
      try {
        // Check file exists
        if (!existsSync(component.path)) {
          throw new Error(`File not found: ${component.path}`);
        }

        // Test component functionality
        await component.test();
        
        this.results.components[component.name] = {
          status: 'passed',
          message: 'Component validated successfully'
        };
        
        console.log(`  ✅ ${component.name}: Validated`);
        
      } catch (error) {
        this.results.components[component.name] = {
          status: 'failed',
          message: error.message
        };
        console.log(`  ❌ ${component.name}: ${error.message}`);
      }
    }
  }

  async testChangeDetector() {
    const { ChangeDetectionSystem } = await import('./change-detector.js');
    const detector = new ChangeDetectionSystem();
    
    // Test basic instantiation and methods
    if (typeof detector.startMonitoring !== 'function') {
      throw new Error('Missing startMonitoring method');
    }
    
    if (typeof detector.analyzeChanges !== 'function') {
      throw new Error('Missing analyzeChanges method');
    }
    
    return true;
  }

  async testAdaptiveGenerator() {
    const { AdaptiveTestGenerator } = await import('./adaptive-test-generator.js');
    const generator = new AdaptiveTestGenerator();
    
    // Test basic instantiation and methods
    if (typeof generator.generateTestsForChanges !== 'function') {
      throw new Error('Missing generateTestsForChanges method');
    }
    
    return true;
  }

  async testCoverageAnalyzer() {
    const { CoverageAnalyzer } = await import('./coverage-analyzer.js');
    const analyzer = new CoverageAnalyzer();
    
    // Test basic instantiation and methods
    if (typeof analyzer.analyzeCoverage !== 'function') {
      throw new Error('Missing analyzeCoverage method');
    }
    
    return true;
  }

  async testMainAutomation() {
    const { AutomatedTestingFramework } = await import('../../testing/testing-automation.js');
    const framework = new AutomatedTestingFramework();
    
    // Test that adaptive methods are available
    if (typeof framework.runAdaptiveTests !== 'function') {
      throw new Error('Missing runAdaptiveTests method');
    }
    
    return true;
  }

  async validateIntegration() {
    console.log('\n🔗 Validating Component Integration...');
    
    try {
      // Test import chain
      const { ChangeDetectionSystem } = await import('./change-detector.js');
      const { AdaptiveTestGenerator } = await import('./adaptive-test-generator.js');
      const { CoverageAnalyzer } = await import('./coverage-analyzer.js');
      const { AutomatedTestingFramework } = await import('../../testing/testing-automation.js');
      
      // Test that components can work together
      const detector = new ChangeDetectionSystem();
      const generator = new AdaptiveTestGenerator();
      const analyzer = new CoverageAnalyzer();
      const framework = new AutomatedTestingFramework();
      
      this.results.integration.imports = {
        status: 'passed',
        message: 'All components import successfully'
      };
      
      console.log('  ✅ Component Imports: Success');
      
      // Test that adaptive properties are set
      if (framework.changeDetector && framework.adaptiveGenerator && framework.coverageAnalyzer) {
        this.results.integration.properties = {
          status: 'passed',
          message: 'Adaptive components properly integrated'
        };
        console.log('  ✅ Property Integration: Success');
      } else {
        const missing = [];
        if (!framework.changeDetector) missing.push('changeDetector');
        if (!framework.adaptiveGenerator) missing.push('adaptiveGenerator');
        if (!framework.coverageAnalyzer) missing.push('coverageAnalyzer');
        throw new Error(`Missing adaptive components in main framework: ${missing.join(', ')}`);
      }
      
    } catch (error) {
      this.results.integration.error = {
        status: 'failed',
        message: error.message
      };
      console.log(`  ❌ Integration Test: ${error.message}`);
    }
  }

  assessOverallHealth() {
    console.log('\n📊 Assessing Overall System Health...');
    
    const componentResults = Object.values(this.results.components);
    const integrationResults = Object.values(this.results.integration);
    
    const componentsPassed = componentResults.filter(r => r.status === 'passed').length;
    const componentsTotal = componentResults.length;
    
    const integrationPassed = integrationResults.filter(r => r.status === 'passed').length;
    const integrationTotal = integrationResults.length;
    
    const componentScore = (componentsPassed / componentsTotal) * 100;
    const integrationScore = integrationTotal > 0 ? (integrationPassed / integrationTotal) * 100 : 100;
    
    const overallScore = (componentScore + integrationScore) / 2;
    
    if (overallScore >= 90) {
      this.results.overall = 'excellent';
    } else if (overallScore >= 75) {
      this.results.overall = 'good';
    } else if (overallScore >= 50) {
      this.results.overall = 'needs-improvement';
    } else {
      this.results.overall = 'critical';
    }
    
    this.results.scores = {
      components: componentScore,
      integration: integrationScore,
      overall: overallScore
    };
  }

  generateValidationReport() {
    console.log('\n📋 Adaptive Testing System Validation Report');
    console.log('='.repeat(50));
    
    const { scores } = this.results;
    
    console.log(`\n📊 Scores:`);
    console.log(`  Components: ${scores.components.toFixed(1)}%`);
    console.log(`  Integration: ${scores.integration.toFixed(1)}%`);
    console.log(`  Overall: ${scores.overall.toFixed(1)}%`);
    
    console.log(`\n🎯 System Status: ${this.getStatusEmoji()} ${this.results.overall.toUpperCase()}`);
    
    if (scores.overall >= 90) {
      console.log('\n✨ Excellent! Your adaptive testing system is ready for production use.');
      console.log('💡 Try running: npm run test:adaptive');
    } else if (scores.overall >= 75) {
      console.log('\n✅ Good! Your system is functional with minor areas for improvement.');
    } else {
      console.log('\n⚠️  Your system needs attention before it can be used reliably.');
    }
    
    console.log('\n🚀 Available Commands:');
    console.log('  npm run test:adaptive     - Run adaptive testing suite');
    console.log('  npm run test:generate     - Generate tests for changes');
    console.log('  npm run test:coverage     - Analyze test coverage');
    console.log('  npm run test:watch        - Watch for changes');
    console.log('  npm run test:optimize     - Optimize test suite');
  }

  getStatusEmoji() {
    switch (this.results.overall) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }
}

// Run validation if called directly
const currentFile = fileURLToPath(import.meta.url);
const calledFile = process.argv[1];

if (currentFile === calledFile || import.meta.url.includes('adaptive-system-test.js')) {
  const validator = new AdaptiveSystemValidator();
  validator.validateSystem().catch(console.error);
}

export { AdaptiveSystemValidator };
