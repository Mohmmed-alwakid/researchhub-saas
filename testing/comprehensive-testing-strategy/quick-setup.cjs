#!/usr/bin/env node

/**
 * QUICK TESTING SETUP
 * 
 * Simplified CommonJS version for immediate setup
 * Sets up the basic testing infrastructure
 */

const fs = require('fs').promises;
const path = require('path');

async function quickSetup() {
  console.log('🚀 Setting up ResearchHub Testing Infrastructure...');
  
  try {
    // Create test directories
    const testDirs = [
      'testing/comprehensive-testing-strategy/reports',
      'testing/comprehensive-testing-strategy/performance-data',
      'testing/comprehensive-testing-strategy/test-data',
      'testing/comprehensive-testing-strategy/screenshots'
    ];
    
    for (const dir of testDirs) {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
    
    // Create test configuration
    const testConfig = {
      testEnvironment: 'local',
      baseUrl: 'http://localhost:5175',
      apiUrl: 'http://localhost:3003',
      timeout: 30000,
      retries: 2,
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
    console.log('✅ Created test configuration');
    
    // Create a simple test runner
    const simpleTestRunner = `#!/usr/bin/env node

/**
 * SIMPLE TEST RUNNER
 * Quick testing commands for development
 */

console.log('🧪 ResearchHub Testing Commands');
console.log('================================');
console.log('');
console.log('Available Tests:');
console.log('npm run test:quick     - Quick smoke tests (2-3 minutes)');
console.log('npm run test:daily     - Daily regression tests (15-20 minutes)');
console.log('npm run test:weekly    - Weekly comprehensive tests (30-45 minutes)');
console.log('');
console.log('Performance Monitoring:');
console.log('npm run perf:audit     - Performance audit');
console.log('npm run perf:monitor   - Start performance monitoring');
console.log('');
console.log('Test Data:');
console.log('npm run test:data:generate - Generate test data');
console.log('npm run test:status    - Show testing status');
console.log('');
console.log('For detailed help: node testing/comprehensive-testing-strategy/testing-integration.js commands');
`;

    await fs.writeFile(
      'testing/comprehensive-testing-strategy/simple-test-runner.cjs',
      simpleTestRunner
    );
    console.log('✅ Created simple test runner');
    
    // Update package.json with basic testing scripts
    try {
      const packageJsonPath = 'package.json';
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      // Add essential testing scripts
      const essentialScripts = {
        "test:quick": "node testing/comprehensive-testing-strategy/automated-regression-suite.cjs quick",
        "test:daily": "node testing/comprehensive-testing-strategy/automated-regression-suite.cjs daily",
        "test:weekly": "node testing/comprehensive-testing-strategy/automated-regression-suite.cjs weekly",
        "perf:audit": "node testing/comprehensive-testing-strategy/performance-monitor.cjs audit",
        "perf:monitor": "node testing/comprehensive-testing-strategy/performance-monitor.cjs monitor",
        "test:data:generate": "node testing/comprehensive-testing-strategy/test-data-generator.cjs generate",
        "test:status": "node testing/comprehensive-testing-strategy/testing-status-dashboard.js",
        "test:help": "node testing/comprehensive-testing-strategy/simple-test-runner.cjs"
      };
      
      packageJson.scripts = {
        ...packageJson.scripts,
        ...essentialScripts
      };
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log('✅ Updated package.json with testing scripts');
    } catch (error) {
      console.log('⚠️  Could not update package.json automatically');
    }
    
    console.log('');
    console.log('🎉 Testing infrastructure setup complete!');
    console.log('');
    console.log('Quick Start:');
    console.log('1. Run "npm run test:quick" for fast smoke tests');
    console.log('2. Run "npm run test:data:generate" to create test data');
    console.log('3. Run "npm run test:status" to see current status');
    console.log('4. Run "npm run test:help" for all available commands');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error setting up testing infrastructure:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  quickSetup();
}

module.exports = { quickSetup };
