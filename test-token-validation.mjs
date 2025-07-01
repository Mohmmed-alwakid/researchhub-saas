// Test token validation in blocks API
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

async function testTokenValidation() {
  try {
    console.log('🔐 Testing Token Validation in Blocks API');
    console.log('==========================================');

    // 1. Login and get token
    console.log('\n1️⃣ LOGIN');
    const loginResponse = await fetch(`${baseUrl}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success || !loginData.session?.access_token) {
      throw new Error('Login failed or no token received');
    }
    
    const token = loginData.session.access_token;
    console.log('✅ Token received:', token.substring(0, 20) + '...');

    // 2. Test token with auth status endpoint
    console.log('\n2️⃣ VERIFY TOKEN WITH AUTH STATUS');
    const statusResponse = await fetch(`${baseUrl}/api/auth?action=status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statusData = await statusResponse.json();
    console.log('Auth status response:', JSON.stringify(statusData, null, 2));

    // 3. Test token directly with blocks API (no actual save, just auth test)
    console.log('\n3️⃣ TEST TOKEN WITH BLOCKS API');
    const blocksResponse = await fetch(`${baseUrl}/api/blocks?action=response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: 'test_session',
        blockId: 'test_block',
        response: { test: true }
      })
    });

    const blocksData = await blocksResponse.json();
    console.log('Blocks API response:', JSON.stringify(blocksData, null, 2));

    // 4. If token validation works, test with real session creation
    if (statusData.success) {
      console.log('\n4️⃣ CREATE REAL SESSION FOR TESTING');
      
      // First get the studies to see what's available
      const studiesResponse = await fetch(`${baseUrl}/api/studies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const studiesData = await studiesResponse.json();
      console.log('Studies available:', JSON.stringify(studiesData, null, 2));
    }

  } catch (error) {
    console.error('❌ Token validation test failed:', error.message);
  }
}

testTokenValidation();
