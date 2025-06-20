// Test admin authentication and API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3003';

async function testAdminAuth() {
  console.log('🔐 Testing Admin Authentication Flow...\n');

  try {
    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abwanwr77+admin@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginResponse.status, loginData);

    if (!loginData.success || !loginData.user || !loginData.token) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful! Token received:', token.substring(0, 20) + '...');
    console.log('✅ User role:', loginData.user.role);

    // Step 2: Test admin analytics endpoint
    console.log('\nStep 2: Testing admin user-behavior endpoint...');
    const analyticsResponse = await fetch(`${BASE_URL}/api/admin/user-behavior?timeframe=30d`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const analyticsData = await analyticsResponse.json();
    console.log('Analytics Response:', analyticsResponse.status, analyticsData);

    // Step 3: Test admin system-performance endpoint
    console.log('\nStep 3: Testing admin system-performance endpoint...');
    const performanceResponse = await fetch(`${BASE_URL}/api/admin/system-performance?timeframe=24h`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const performanceData = await performanceResponse.json();
    console.log('Performance Response:', performanceResponse.status, performanceData);

    // Step 4: Test admin financial endpoint
    console.log('\nStep 4: Testing admin financial endpoint...');
    const financialResponse = await fetch(`${BASE_URL}/api/admin/financial?timeframe=30d`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const financialData = await financialResponse.json();
    console.log('Financial Response:', financialResponse.status, financialData);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminAuth();
