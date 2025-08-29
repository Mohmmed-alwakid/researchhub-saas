#!/usr/bin/env node
/**
 * UE-001 AI Interview Moderator Test Runner
 * Executes comprehensive tests for the AI Interview feature
 */

const { execSync } = require('child_process');
const path = require('path');

// Test configuration
const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const TEST_FILE = path.join(__dirname, 'ue-001-ai-interview-moderator.spec.js');

console.log('🤖 UE-001 AI Interview Moderator Test Suite');
console.log('='.repeat(50));
console.log(`📡 Production URL: ${PRODUCTION_URL}`);
console.log(`📝 Test File: ${TEST_FILE}`);
console.log('='.repeat(50));

// Test execution commands
const testCommands = [
  {
    name: 'Complete AI Interview Workflow - English',
    command: `npx playwright test "${TEST_FILE}" --grep "Complete AI Interview Workflow - English" --headed --reporter=line`
  },
  {
    name: 'AI Interview with Arabic Language Support', 
    command: `npx playwright test "${TEST_FILE}" --grep "Arabic Language Support" --headed --reporter=line`
  },
  {
    name: 'Performance and Error Handling',
    command: `npx playwright test "${TEST_FILE}" --grep "Performance and Error Handling" --headed --reporter=line`
  }
];

async function runTests() {
  console.log('🚀 Starting UE-001 AI Interview Moderator Tests...\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testConfig of testCommands) {
    console.log(`\n🧪 Running: ${testConfig.name}`);
    console.log('-'.repeat(40));
    
    try {
      // Set production environment
      process.env.NODE_ENV = 'production';
      process.env.BASE_URL = PRODUCTION_URL;
      
      const output = execSync(testConfig.command, { 
        encoding: 'utf8',
        stdio: 'inherit',
        timeout: 300000 // 5 minutes timeout
      });
      
      console.log(`✅ PASSED: ${testConfig.name}`);
      passedTests++;
      
    } catch (error) {
      console.error(`❌ FAILED: ${testConfig.name}`);
      console.error(`Error: ${error.message}`);
      failedTests++;
    }
  }
  
  // Test results summary
  console.log('\n' + '='.repeat(50));
  console.log('🎯 UE-001 AI INTERVIEW MODERATOR TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed Tests: ${passedTests}`);
  console.log(`❌ Failed Tests: ${failedTests}`);
  console.log(`📊 Total Tests: ${passedTests + failedTests}`);
  console.log(`🎉 Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL UE-001 AI INTERVIEW TESTS PASSED!');
    console.log('🚀 AI Interview Moderator is production-ready!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the error logs above.');
  }
  
  return failedTests === 0;
}

// Quick validation test
async function quickValidation() {
  console.log('\n🔍 Quick Production Validation...');
  
  try {
    // Test if the production site is accessible
    const testCommand = `npx playwright test --grep "should load production site" --config=playwright.config.js`;
    execSync(testCommand, { encoding: 'utf8', stdio: 'inherit', timeout: 30000 });
    console.log('✅ Production site is accessible');
    return true;
  } catch (error) {
    console.error('❌ Production site validation failed');
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('🌐 Validating production site accessibility...');
    
    // Quick site check
    const siteAccessible = await quickValidation();
    if (!siteAccessible) {
      console.log('⚠️  Production site not accessible, skipping tests');
      return;
    }
    
    // Run comprehensive tests
    const success = await runTests();
    
    if (success) {
      console.log('\n🏆 UE-001 AI Interview Moderator testing completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Some tests failed. Check logs for details.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { runTests, quickValidation };
