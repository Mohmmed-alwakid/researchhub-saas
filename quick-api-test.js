/**
 * Quick API Test - Test participant applications endpoint
 */

const BASE_URL = 'http://localhost:3003';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PARTICIPANT_PASSWORD = 'Testtest123';

async function quickAPITest() {
  console.log('🚀 Quick API Test...');
  
  try {
    // Login
    console.log('🔐 Login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: PARTICIPANT_EMAIL,
        password: PARTICIPANT_PASSWORD
      })
    });
    
    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.error}`);
    }
    
    const authToken = loginResult.token;
    console.log('✅ Login successful');
    
    // Test participant applications endpoint
    console.log('📋 Testing participant applications endpoint...');
    const urls = [
      `${BASE_URL}/api/participant-applications`,
      `${BASE_URL}/api/participant-applications/my-applications`,
      `${BASE_URL}/api/participant-applications/studies/public`
    ];
    
    for (const url of urls) {
      console.log(`\n🔍 Testing: ${url}`);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const result = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`Success: ${result.success ? '✅' : '❌'}`);
      if (!result.success) {
        console.log(`Error: ${result.error}`);
      } else {
        console.log(`Data keys: ${Object.keys(result.data || {})}`);
      }
    }
    
    // Test study sessions endpoint
    console.log('\n🔬 Testing study sessions endpoint...');
    const studyId = 'baf92029-e512-4265-a01a-297a5a00f5b4'; // Known study ID
    
    const sessionResponse = await fetch(`${BASE_URL}/api/study-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ studyId })
    });
    
    const sessionResult = await sessionResponse.json();
    console.log(`Session API Status: ${sessionResponse.status}`);
    console.log(`Session API Success: ${sessionResult.success ? '✅' : '❌'}`);
    if (!sessionResult.success) {
      console.log(`Session API Error: ${sessionResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

quickAPITest();
