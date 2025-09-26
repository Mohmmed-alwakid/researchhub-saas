// Debug admin role issue
import { readFileSync } from 'fs';

async function debugAdminRole() {
  console.log('🐛 Debugging Admin Role Issue...\n');
  
  try {
    // Import the points handler
    const { default: pointsHandler } = await import('./api/points.js');
    
    // Mock request/response for admin token verification
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
    
    // Admin token from previous test
    const adminToken = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';
    
    // Test assignment with detailed logging
    console.log('🧪 Testing points assignment with admin token...');
    const assignReq = createMockReq('POST', '/api/points?action=assign', {
      targetUserId: '4c3d798b-2975-4ec4-b9e2-c6f128b8a066',
      amount: 100,
      reason: 'Debug test allocation'
    }, {
      'authorization': `Bearer ${adminToken}`,
      'content-type': 'application/json'
    });
    
    const assignRes = createMockRes();
    
    // Monkey patch console.log to capture debug output
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };
    
    await pointsHandler(assignReq, assignRes);
    
    // Restore console.log
    console.log = originalLog;
    
    console.log('\\n📋 Assignment result:', assignRes._body);
    console.log('📊 Status code:', assignRes._status);
    console.log('\\n🔍 Captured logs:', logs);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAdminRole();
