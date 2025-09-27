/**
 * 🔍 Simple API Timeout Diagnostics
 * 
 * Tests the research-consolidated API using built-in fetch
 */

// Configuration
const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const TEST_ITERATIONS = 10;

console.log('🔍 Simple API Timeout Diagnostics Starting...\n');

/**
 * Test API endpoint
 */
async function testAPI(url, iteration) {
  const start = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    const duration = Date.now() - start;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Test ${iteration}: SUCCESS (${duration}ms) - Status: ${response.status}`);
      return { success: true, duration };
    } else {
      console.log(`❌ Test ${iteration}: FAILED (${duration}ms) - Status: ${response.status}`);
      return { success: false, duration };
    }
  } catch (error) {
    const duration = Date.now() - start;
    if (error.name === 'TimeoutError') {
      console.log(`⏰ Test ${iteration}: TIMEOUT (${duration}ms)`);
      return { success: false, duration, timeout: true };
    } else {
      console.log(`❌ Test ${iteration}: ERROR (${duration}ms) - ${error.message}`);
      return { success: false, duration, error: error.message };
    }
  }
}

/**
 * Run diagnostic tests
 */
async function runDiagnostics() {
  console.log('=' .repeat(60));
  console.log('🔍 ResearchHub API Timeout Diagnostics');
  console.log('=' .repeat(60));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔗 Testing: ${PRODUCTION_URL}/api/research-consolidated?action=get-studies`);
  console.log(`🔄 Iterations: ${TEST_ITERATIONS}\n`);
  
  const results = {
    successful: 0,
    failed: 0,
    timeouts: 0,
    durations: []
  };
  
  const apiUrl = `${PRODUCTION_URL}/api/research-consolidated?action=get-studies`;
  
  // Run tests
  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    const result = await testAPI(apiUrl, i);
    
    if (result.success) {
      results.successful++;
      results.durations.push(result.duration);
    } else {
      results.failed++;
      if (result.timeout) {
        results.timeouts++;
      }
    }
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Calculate statistics
  const avgDuration = results.durations.length > 0 
    ? Math.round(results.durations.reduce((a, b) => a + b, 0) / results.durations.length)
    : 0;
    
  const successRate = Math.round((results.successful / TEST_ITERATIONS) * 100);
  
  console.log('\n📊 DIAGNOSTIC RESULTS:');
  console.log('=' .repeat(60));
  console.log(`✅ Success Rate: ${successRate}% (${results.successful}/${TEST_ITERATIONS})`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏰ Timeouts: ${results.timeouts}`);
  console.log(`📈 Average Duration: ${avgDuration}ms`);
  console.log(`📊 Min/Max: ${Math.min(...results.durations)}ms / ${Math.max(...results.durations)}ms`);
  
  console.log('\n🎯 ANALYSIS:');
  console.log('-' .repeat(40));
  
  if (results.timeouts > 0) {
    console.log('🔥 CRITICAL: Timeout issues detected');
    console.log(`   ${results.timeouts} out of ${TEST_ITERATIONS} requests timed out`);
    console.log('   This confirms infrastructure-level issues');
  }
  
  if (successRate < 80) {
    console.log('⚠️  WARNING: Success rate below 80% - Production not ready');
  } else if (successRate >= 95) {
    console.log('✅ EXCELLENT: High success rate - API performing well');
  } else {
    console.log('✅ GOOD: Acceptable success rate');
  }
  
  if (avgDuration > 5000) {
    console.log('🐌 WARNING: Average response time > 5 seconds');
  } else if (avgDuration < 2000) {
    console.log('⚡ EXCELLENT: Fast average response time');
  }
  
  console.log('\n🛠️  RECOMMENDATIONS:');
  console.log('-' .repeat(40));
  
  if (results.timeouts > 2) {
    console.log('1. 🔧 Check Vercel function configuration and limits');
    console.log('2. 🗄️  Optimize Supabase database queries');
    console.log('3. 💰 Consider upgrading to Vercel Pro plan');
    console.log('4. 🔄 Implement API circuit breaker pattern');
  }
  
  if (successRate < 90) {
    console.log('5. 🚫 Add comprehensive error boundaries');
    console.log('6. ⏱️  Implement graceful timeout handling');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Diagnostics Complete');
  console.log('=' .repeat(60));
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostics failed:', error);
});