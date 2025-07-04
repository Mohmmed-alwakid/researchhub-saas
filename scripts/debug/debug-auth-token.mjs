/**
 * Debug authentication token and API flow
 */

const API_BASE = 'http://localhost:3003/api';

async function debugAuthentication() {
  console.log('🔍 DEBUGGING AUTHENTICATION FLOW');
  console.log('================================\n');

  try {
    // 1. LOGIN
    console.log('1️⃣ PARTICIPANT LOGIN');
    console.log('-------------------');
    
    const loginResponse = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response:', JSON.stringify(loginResult, null, 2));
    
    if (!loginResult.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginResult.session.access_token;
    console.log('✅ Token obtained:', token.substring(0, 50) + '...');

    // 2. TEST TOKEN VALIDATION
    console.log('\n2️⃣ TEST TOKEN VALIDATION');
    console.log('------------------------');
    
    const authTestResponse = await fetch(`${API_BASE}/auth?action=status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const authTestResult = await authTestResponse.json();
    console.log('Auth test status:', authTestResponse.status);
    console.log('Auth test result:', JSON.stringify(authTestResult, null, 2));

    // 3. TEST APPLICATIONS API WITH DETAILED LOGGING
    console.log('\n3️⃣ TEST APPLICATIONS API');
    console.log('------------------------');
    
    console.log('Making request to:', `${API_BASE}/applications?type=participant`);
    console.log('With headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.substring(0, 20)}...`
    });
    
    const appResponse = await fetch(`${API_BASE}/applications?type=participant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        studyId: 'test-study-id',
        responses: { test: 'data' },
        demographics: { test: 'demo' }
      })
    });

    console.log('Applications API status:', appResponse.status);
    const appText = await appResponse.text();
    console.log('Applications API response:', appText);

  } catch (error) {
    console.error('❌ Debug Error:', error);
  }
}

debugAuthentication();
