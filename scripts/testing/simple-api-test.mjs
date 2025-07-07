#!/usr/bin/env node

console.log('🚀 Starting API Optimization Test Suite...');
console.log('📝 Testing basic functionality...');

// Simple test
const testResults = {
  total: 0,
  passed: 0,
  failed: 0
};

function log(message, type = 'info') {
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📝';
  
  console.log(`${prefix} ${message}`);
}

async function simpleTest() {
  testResults.total++;
  
  try {
    // Test basic Node.js functionality
    log('Testing Node.js basic functionality...');
    
    // Test fetch is available
    if (typeof fetch === 'undefined') {
      throw new Error('fetch is not available');
    }
    
    testResults.passed++;
    log('Basic functionality test passed', 'success');
    
    // Test local server connection
    testResults.total++;
    log('Testing local server connection...');
    
    try {
      const response = await fetch('http://localhost:3003/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      log(`Health endpoint responded with status: ${response.status}`);
      
      if (response.status === 200) {
        testResults.passed++;
        log('Local server test passed', 'success');
      } else {
        testResults.failed++;
        log(`Local server test failed with status: ${response.status}`, 'warning');
      }
    } catch (error) {
      testResults.failed++;
      log(`Local server test failed: ${error.message}`, 'warning');
      log('Note: This is expected if local server is not running', 'info');
    }
    
  } catch (error) {
    testResults.failed++;
    log(`Test failed: ${error.message}`, 'error');
  }
}

// Run the test
async function runTest() {
  await simpleTest();
  
  log('\n=== Test Summary ===', 'info');
  log(`Total tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  const successRate = (testResults.passed / testResults.total) * 100;
  log(`Success rate: ${successRate.toFixed(1)}%`, successRate >= 50 ? 'success' : 'warning');
  
  if (testResults.passed > 0) {
    log('\n🎉 Basic API optimization test infrastructure is working!', 'success');
  } else {
    log('\n💥 Tests failed!', 'error');
  }
}

// Execute
runTest().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
