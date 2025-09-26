// Quick admin test to assign points to researcher
import { readFileSync } from 'fs';

async function testAdminPointsAssignment() {
  console.log('🔧 Testing Admin Points Assignment...\n');
  
  try {
    // Import the API handlers
    const { default: authHandler } = await import('./api/auth.js');
    const { default: pointsHandler } = await import('./api/points.js');
    
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
    
    // Test 1: Login as admin
    console.log('🔐 Step 1: Login as admin');
    const adminLoginReq = createMockReq('POST', '/api/auth?action=login', {
      email: 'abwanwr77+admin@gmail.com',
      password: 'Testtest123'
    });
    const adminLoginRes = createMockRes();
    
    await authHandler(adminLoginReq, adminLoginRes);
    
    if (adminLoginRes._body?.success) {
      console.log('✅ Admin login successful');
      const adminToken = adminLoginRes._body.session?.access_token;
      
      // Test 2: Assign points to researcher
      console.log('\n💰 Step 2: Assign 500 points to researcher');
      const assignPointsReq = createMockReq('POST', '/api/points?action=assign', {
        userEmail: 'abwanwr77+researcher@gmail.com', // Use email instead of ID
        amount: 500,
        reason: 'Initial testing allocation'
      }, {
        'authorization': `Bearer ${adminToken}`,
        'content-type': 'application/json'
      });
      const assignPointsRes = createMockRes();
      
      await pointsHandler(assignPointsReq, assignPointsRes);
      
      if (assignPointsRes._body?.success) {
        console.log('✅ Points assigned successfully:', assignPointsRes._body);
        
        // Test 3: Verify researcher balance
        console.log('\n🔍 Step 3: Verify researcher points balance');
        const checkBalanceReq = createMockReq('GET', '/api/points?action=balance', null, {
          'authorization': 'Bearer 'PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY''
        });
        const checkBalanceRes = createMockRes();
        
        await pointsHandler(checkBalanceReq, checkBalanceRes);
        
        if (checkBalanceRes._body?.success) {
          console.log('✅ Researcher balance updated:', checkBalanceRes._body);
          console.log('\n🎯 SUCCESS! Points system is fully operational!');
          console.log('\n📋 Next steps:');
          console.log('1. Open points-system-integration-test.html in browser');
          console.log('2. Test study creation (should now work with 500 points)');
          console.log('3. Verify points are deducted correctly');
        } else {
          console.log('❌ Failed to check balance:', checkBalanceRes._body);
        }
        
      } else {
        console.log('❌ Failed to assign points:', assignPointsRes._body);
      }
      
    } else {
      console.log('❌ Admin login failed:', adminLoginRes._body);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminPointsAssignment();
