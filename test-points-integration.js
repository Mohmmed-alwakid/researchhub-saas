// Quick verification test for points system integration
// Tests the API endpoints directly without Express server issues

import { readFileSync } from 'fs';

// Test the points API handler directly
async function testPointsAPI() {
  console.log('🧪 Testing Points API Integration...\n');
  
  try {
    // Import the API handler
    const { default: pointsHandler } = await import('./api/points.js');
    const { default: authHandler } = await import('./api/auth.js');
    
    console.log('✅ API handlers imported successfully');
    
    // Mock request/response objects
    const createMockReq = (method, url, body = null, headers = {}) => {
      const urlObj = new URL(`http://localhost${url}`);
      return {
        method,
        url,
        headers,
        body,
        query: Object.fromEntries(urlObj.searchParams.entries()),
        get: (key) => headers[key.toLowerCase()]
      };
    };
    
    const createMockRes = () => {
      const res = {
        _status: 200,
        _headers: {},
        _body: null,
        status: function(code) { this._status = code; return this; },
        json: function(data) { this._body = data; return this; },
        setHeader: function(key, value) { this._headers[key] = value; return this; },
        end: function() { return this; }
      };
      return res;
    };
    
    // Test 1: Test login with researcher account
    console.log('\n🔐 Test 1: Login with researcher account');
    const loginReq = createMockReq('POST', '/api/auth?action=login', {
      email: 'abwanwr77+Researcher@gmail.com',
      password: 'Testtest123'
    });
    const loginRes = createMockRes();
    
    await authHandler(loginReq, loginRes);
    
    if (loginRes._body?.success) {
      console.log('✅ Login successful');
      const token = loginRes._body.session?.access_token || loginRes._body.data?.session?.access_token || loginRes._body.data?.access_token;
      
      if (!token) {
        console.log('❌ No token found in login response:', loginRes._body);
        return;
      }
      
      console.log('🔑 Token obtained:', token.substring(0, 20) + '...');
      
      // Test 2: Get points balance
      console.log('\n💰 Test 2: Get points balance');
      const balanceReq = createMockReq('GET', '/api/points?action=balance', null, {
        'authorization': `Bearer ${token}`
      });
      const balanceRes = createMockRes();
      
      await pointsHandler(balanceReq, balanceRes);
      
      if (balanceRes._body?.success) {
        console.log('✅ Points balance retrieved:', balanceRes._body);
      } else {
        console.log('❌ Points balance failed:', balanceRes._body);
      }
      
      // Test 3: Test study creation with points (import studies API)
      console.log('\n📚 Test 3: Study creation with points deduction');
      const { default: studiesHandler } = await import('./api/studies.js');
      
      const createStudyReq = createMockReq('POST', '/api/studies', {
        title: 'Points Test Study',
        description: 'Testing points deduction',
        type: 'usability',
        targetParticipants: 5,
        settings: { blocks: [] }
      }, {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      });
      const createStudyRes = createMockRes();
      
      await studiesHandler(createStudyReq, createStudyRes);
      
      if (createStudyRes._body?.success) {
        console.log('✅ Study created successfully');
        console.log('💰 Points deducted:', createStudyRes._body.pointsDeducted || 'Not specified');
      } else {
        console.log('❌ Study creation failed:', createStudyRes._body);
      }
      
    } else {
      console.log('❌ Login failed:', loginRes._body);
    }
    
    console.log('\n🎯 Points System Integration Test Complete!');
    console.log('\nIf you see success messages above, the points system is working correctly.');
    console.log('You can now test the full UI at: http://localhost:3000/points-system-integration-test.html');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testPointsAPI();
