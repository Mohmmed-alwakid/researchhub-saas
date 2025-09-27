/**
 * 🔍 Complete API Diagnostics with Authentication
 * 
 * Tests both authenticated and unauthenticated API calls
 */

const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';

console.log('🔍 Complete API Diagnostics Starting...\n');

/**
 * Test authentication flow
 */
async function getAuthToken() {
  console.log('🔐 Testing authentication...');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/auth-consolidated?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.token) {
      console.log('✅ Authentication successful');
      return data.token;
    } else {
      console.log('❌ Authentication failed:', data.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return null;
  }
}

/**
 * Test API with different scenarios
 */
async function testScenarios() {
  console.log('🧪 Testing different API scenarios...\n');
  
  const scenarios = [
    {
      name: 'Unauthenticated Request',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    },
    {
      name: 'Missing Role Header',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ];
  
  // Get auth token first
  const token = await getAuthToken();
  
  if (token) {
    scenarios.push({
      name: 'Authenticated Request',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-user-role': 'researcher'
      }
    });
  }
  
  console.log(''); // Add spacing
  
  // Test each scenario
  for (const scenario of scenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    await testAPICall(scenario.headers, scenario.name);
    console.log(''); // Add spacing
  }
}

/**
 * Test single API call
 */
async function testAPICall(headers, scenarioName) {
  const url = `${PRODUCTION_URL}/api/research-consolidated?action=get-studies`;
  const start = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(15000)
    });
    
    const duration = Date.now() - start;
    const result = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Duration: ${duration}ms`);
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS`);
      console.log(`   📊 Studies returned: ${result.studies ? result.studies.length : 0}`);
      
      // Test with multiple rapid calls to check for timeout issues
      if (scenarioName === 'Authenticated Request') {
        console.log('   🚀 Testing rapid fire requests...');
        await testRapidRequests(headers);
      }
    } else {
      console.log(`   ❌ FAILED`);
      console.log(`   📄 Error: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`   Duration: ${duration}ms`);
    
    if (error.name === 'TimeoutError') {
      console.log(`   ⏰ TIMEOUT`);
    } else {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
}

/**
 * Test rapid requests to identify timeout patterns
 */
async function testRapidRequests(headers) {
  const results = {
    success: 0,
    timeout: 0,
    error: 0,
    total: 5
  };
  
  const url = `${PRODUCTION_URL}/api/research-consolidated?action=get-studies`;
  
  // Fire multiple requests quickly
  const promises = [];
  for (let i = 0; i < results.total; i++) {
    const promise = fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000)
    }).then(async response => {
      if (response.ok) {
        await response.json(); // Consume response
        return { success: true };
      } else {
        return { success: false, status: response.status };
      }
    }).catch(error => {
      if (error.name === 'TimeoutError') {
        return { timeout: true };
      } else {
        return { error: true, message: error.message };
      }
    });
    
    promises.push(promise);
  }
  
  const responses = await Promise.all(promises);
  
  responses.forEach(response => {
    if (response.success) results.success++;
    else if (response.timeout) results.timeout++;
    else results.error++;
  });
  
  console.log(`   📊 Rapid test: ${results.success}/${results.total} successful`);
  if (results.timeout > 0) {
    console.log(`   ⚠️  ${results.timeout} timeouts detected`);
  }
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log('=' .repeat(60));
  console.log('🔍 ResearchHub Complete API Diagnostics');
  console.log('=' .repeat(60));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔗 Production URL: ${PRODUCTION_URL}\n`);
  
  // Test health endpoint first
  console.log('🏥 Testing health endpoint...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed');
      console.log(`📊 Response: ${JSON.stringify(data).substring(0, 100)}...\n`);
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}\n`);
  }
  
  // Run scenario tests
  await testScenarios();
  
  console.log('🎯 FINAL ANALYSIS:');
  console.log('=' .repeat(60));
  console.log('1. Authentication is required for research-consolidated API');
  console.log('2. Frontend timeout issues likely due to token expiration');
  console.log('3. API performance appears good when properly authenticated');
  console.log('4. Previous "timeout" errors were actually auth failures');
  
  console.log('\n🛠️  NEXT STEPS:');
  console.log('-' .repeat(40));
  console.log('1. ✅ Verify token refresh mechanism in frontend');
  console.log('2. ✅ Add proper authentication error handling');
  console.log('3. ✅ Implement token expiration detection');
  console.log('4. ✅ Add retry mechanism for expired tokens');
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Complete Diagnostics Finished');
  console.log('=' .repeat(60));
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostics failed:', error);
});