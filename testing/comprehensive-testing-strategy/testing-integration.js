#!/usr/bin/env node

/**
 * TESTING INTEGRATION SCRIPTS
 * 
 * Easy-to-use NPM scripts for ResearchHub testing
 * Integrates all testing components with simple commands
 * 
 * This script sets up package.json scripts for the testing framework
 * and provides a unified interface for all testing operations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NPM Scripts Configuration
const TESTING_SCRIPTS = {
  // Quick Development Testing
  "test:quick": "node testing/comprehensive-testing-strategy/automated-regression-suite.js quick",
  "test:smoke": "node testing/comprehensive-testing-strategy/automated-regression-suite.js quick",
  
  // Daily Testing
  "test:daily": "node testing/comprehensive-testing-strategy/automated-regression-suite.js daily",
  "test:regression": "node testing/comprehensive-testing-strategy/automated-regression-suite.js daily",
  
  // Weekly Comprehensive Testing
  "test:weekly": "node testing/comprehensive-testing-strategy/automated-regression-suite.js weekly",
  "test:comprehensive": "node testing/comprehensive-testing-strategy/automated-regression-suite.js weekly",
  
  // Specific Test Types
  "test:performance": "node testing/comprehensive-testing-strategy/automated-regression-suite.js performance",
  "test:accessibility": "node testing/comprehensive-testing-strategy/automated-regression-suite.js accessibility",
  "test:a11y": "node testing/comprehensive-testing-strategy/automated-regression-suite.js accessibility",
  "test:security": "node testing/comprehensive-testing-strategy/automated-regression-suite.js security",
  "test:visual": "node testing/comprehensive-testing-strategy/automated-regression-suite.js visual",
  
  // Performance Monitoring
  "perf:monitor": "node testing/comprehensive-testing-strategy/performance-monitor.js monitor",
  "perf:audit": "node testing/comprehensive-testing-strategy/performance-monitor.js audit",
  "perf:trend": "node testing/comprehensive-testing-strategy/performance-monitor.js trend",
  "perf:budget": "node testing/comprehensive-testing-strategy/performance-monitor.js budget",
  "perf:optimize": "node testing/comprehensive-testing-strategy/performance-monitor.js optimize",
  
  // Pipeline Testing
  "pipeline:quick": "node testing/comprehensive-testing-strategy/test-automation-pipeline.js quick local",
  "pipeline:daily": "node testing/comprehensive-testing-strategy/test-automation-pipeline.js daily local",
  "pipeline:weekly": "node testing/comprehensive-testing-strategy/test-automation-pipeline.js weekly local",
  "pipeline:deployment": "node testing/comprehensive-testing-strategy/test-automation-pipeline.js deployment local",
  "pipeline:continuous": "node testing/comprehensive-testing-strategy/test-automation-pipeline.js continuous local",
  
  // Production Pipeline Testing
  "pipeline:prod:quick": "node testing/comprehensive-testing-strategy/test-automation-pipeline.js quick production",
  "pipeline:prod:deployment": "node testing/comprehensive-testing-strategy/test-automation-pipeline.js deployment production",
  
  // Test Data Management
  "test:data:generate": "node testing/comprehensive-testing-strategy/test-data-generator.js generate",
  "test:data:reset": "node testing/comprehensive-testing-strategy/test-data-generator.js reset",
  "test:data:validate": "node testing/comprehensive-testing-strategy/test-data-generator.js validate",
  
  // Reporting and Monitoring
  "test:status": "node testing/comprehensive-testing-strategy/testing-status-dashboard.js",
  "test:reports": "node testing/comprehensive-testing-strategy/report-generator.js",
  "test:dashboard": "node testing/comprehensive-testing-strategy/testing-dashboard-server.js",
  
  // Development Workflow Integration
  "dev:test": "npm run test:quick",
  "pre-commit": "npm run test:smoke",
  "pre-push": "npm run test:quick",
  "pre-deploy": "npm run pipeline:deployment",
  
  // Legacy compatibility (maintaining existing scripts)
  "test": "npm run test:quick",
  "test:e2e": "npm run test:comprehensive"
};

// Development Dependencies for Testing
const TESTING_DEPENDENCIES = {
  "playwright": "^1.40.0",
  "@playwright/test": "^1.40.0",
  "lighthouse": "^11.3.0",
  "axe-core": "^4.8.0",
  "jest": "^29.7.0",
  "@types/jest": "^29.5.0"
};

async function updatePackageJson() {
  try {
    // Read current package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    // Update scripts section
    packageJson.scripts = {
      ...packageJson.scripts,
      ...TESTING_SCRIPTS
    };

    // Update devDependencies if they don't exist
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }

    for (const [dep, version] of Object.entries(TESTING_DEPENDENCIES)) {
      if (!packageJson.devDependencies[dep] && !packageJson.dependencies?.[dep]) {
        packageJson.devDependencies[dep] = version;
      }
    }

    // Write updated package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log('✅ Package.json updated with testing scripts');
    console.log('📋 Added scripts:');
    Object.keys(TESTING_SCRIPTS).forEach(script => {
      console.log(`   • npm run ${script}`);
    });
    
    console.log('\n📦 Added dev dependencies:');
    Object.entries(TESTING_DEPENDENCIES).forEach(([dep, version]) => {
      if (!packageJson.devDependencies[dep] && !packageJson.dependencies?.[dep]) {
        console.log(`   • ${dep}@${version}`);
      }
    });

  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
    process.exit(1);
  }
}

// Testing Command Helper
function displayTestingCommands() {
  console.log('🧪 RESEARCHHUB TESTING COMMANDS');
  console.log('═'.repeat(80));
  
  console.log('\n🚀 QUICK DEVELOPMENT TESTING (2-3 minutes)');
  console.log('   npm run test:quick          # Fast smoke tests for development');
  console.log('   npm run test:smoke          # Alias for test:quick');
  console.log('   npm run dev:test            # Integrated with development workflow');
  
  console.log('\n📅 DAILY REGRESSION TESTING (15-20 minutes)');
  console.log('   npm run test:daily          # Comprehensive daily validation');
  console.log('   npm run test:regression     # Alias for test:daily');
  
  console.log('\n🔄 WEEKLY COMPREHENSIVE TESTING (30-45 minutes)');
  console.log('   npm run test:weekly         # Full regression suite');
  console.log('   npm run test:comprehensive  # Alias for test:weekly');
  
  console.log('\n⚡ PERFORMANCE TESTING');
  console.log('   npm run test:performance    # Performance regression tests');
  console.log('   npm run perf:audit          # One-time performance audit');
  console.log('   npm run perf:monitor        # Continuous performance monitoring');
  console.log('   npm run perf:trend          # Performance trend analysis');
  console.log('   npm run perf:budget         # Performance budget compliance');
  
  console.log('\n♿ ACCESSIBILITY TESTING');
  console.log('   npm run test:accessibility  # WCAG 2.1 AA compliance testing');
  console.log('   npm run test:a11y           # Alias for accessibility testing');
  
  console.log('\n🔒 SECURITY TESTING');
  console.log('   npm run test:security       # Security vulnerability scanning');
  
  console.log('\n🎨 VISUAL TESTING');
  console.log('   npm run test:visual         # Cross-browser visual regression');
  
  console.log('\n🔄 PIPELINE TESTING');
  console.log('   npm run pipeline:quick      # Quick pipeline validation');
  console.log('   npm run pipeline:daily      # Daily pipeline execution');
  console.log('   npm run pipeline:weekly     # Weekly comprehensive pipeline');
  console.log('   npm run pipeline:deployment # Pre-deployment validation');
  
  console.log('\n🌐 PRODUCTION TESTING');
  console.log('   npm run pipeline:prod:quick      # Quick production validation');
  console.log('   npm run pipeline:prod:deployment # Production deployment check');
  
  console.log('\n📊 MONITORING & REPORTING');
  console.log('   npm run test:status         # Current testing status');
  console.log('   npm run test:reports        # Generate test reports');
  console.log('   npm run test:dashboard      # Launch testing dashboard');
  
  console.log('\n📦 TEST DATA MANAGEMENT');
  console.log('   npm run test:data:generate  # Generate realistic test data');
  console.log('   npm run test:data:reset     # Reset test data to clean state');
  console.log('   npm run test:data:validate  # Validate test data integrity');
  
  console.log('\n🔄 DEVELOPMENT WORKFLOW INTEGRATION');
  console.log('   npm run pre-commit          # Run before git commit');
  console.log('   npm run pre-push            # Run before git push');
  console.log('   npm run pre-deploy          # Run before deployment');
  
  console.log('\n═'.repeat(80));
  console.log('💡 TIP: Start with "npm run test:quick" for fast feedback during development');
  console.log('🎯 GOAL: Maintain 95%+ pass rate and 85+ performance score');
  console.log('📈 BEST PRACTICE: Run daily tests every morning, weekly tests every Friday');
  console.log('═'.repeat(80));
}

// Test Environment Setup
async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');
  
  try {
    // Create necessary directories
    const dirs = [
      'testing/comprehensive-testing-strategy/reports',
      'testing/comprehensive-testing-strategy/performance-data',
      'testing/comprehensive-testing-strategy/test-data',
      'testing/comprehensive-testing-strategy/screenshots'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    // Create basic test configuration
    const testConfig = {
      testEnvironment: 'local',
      baseUrl: 'http://localhost:5175',
      apiUrl: 'http://localhost:3003',
      timeout: 30000,
      retries: 2,
      workers: 1,
      headless: true,
      screenshots: 'on-failure',
      video: 'retain-on-failure',
      testAccounts: {
        participant: {
          email: 'abwanwr77+participant@gmail.com',
          password: 'Testtest123'
        },
        researcher: {
          email: 'abwanwr77+Researcher@gmail.com',
          password: 'Testtest123'
        },
        admin: {
          email: 'abwanwr77+admin@gmail.com',
          password: 'Testtest123'
        }
      }
    };
    
    await fs.writeFile(
      'testing/comprehensive-testing-strategy/test-config.json',
      JSON.stringify(testConfig, null, 2)
    );
    
    console.log('✅ Test environment setup complete');
    console.log('📁 Created directories:');
    dirs.forEach(dir => console.log(`   • ${dir}`));
    console.log('⚙️  Created test configuration file');
    
  } catch (error) {
    console.error('❌ Error setting up test environment:', error.message);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'setup':
      await updatePackageJson();
      await setupTestEnvironment();
      break;
      
    case 'commands':
    case 'help':
      displayTestingCommands();
      break;
      
    case 'update-package':
      await updatePackageJson();
      break;
      
    case 'setup-env':
      await setupTestEnvironment();
      break;
      
    default:
      console.log('🧪 ResearchHub Testing Integration');
      console.log('');
      console.log('Available commands:');
      console.log('  setup           # Complete setup (package.json + environment)');
      console.log('  commands        # Display all available testing commands');
      console.log('  update-package  # Update package.json with testing scripts');
      console.log('  setup-env       # Set up test environment directories');
      console.log('  help            # Show testing commands');
      console.log('');
      console.log('Usage: node testing-integration.js [command]');
  }
}

// Export for use as module
export {
  TESTING_SCRIPTS,
  TESTING_DEPENDENCIES,
  updatePackageJson,
  setupTestEnvironment,
  displayTestingCommands
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
