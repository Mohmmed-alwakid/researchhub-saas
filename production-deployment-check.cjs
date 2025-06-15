#!/usr/bin/env node

/**
 * Production Deployment Status Check
 * Tests both Vercel frontend and Railway backend integration
 */

const https = require('https');

console.log('🔍 ResearchHub Production Deployment Status Check');
console.log('================================================');

// Test configuration
const config = {
  frontend: {
    url: 'https://researchhub-saas.vercel.app',
    name: 'Vercel Frontend'
  },
  backend: {
    baseUrl: 'https://researchhub-saas-production.railway.app',
    apiUrl: 'https://researchhub-saas-production.railway.app/api',
    name: 'Railway Backend'
  }
};

function testEndpoint(url, description = '') {
  return new Promise((resolve) => {
    console.log(`\n🌐 Testing: ${description || url}`);
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let responseBody = data;
        try {
          const jsonData = JSON.parse(data);
          responseBody = JSON.stringify(jsonData, null, 2);
        } catch (e) {
          // Not JSON, keep as text
          if (data.length > 200) {
            responseBody = data.substring(0, 200) + '...';
          }
        }
        
        console.log(`   Response: ${responseBody}`);
        
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({
        url,
        status: 0,
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      console.log(`   ⏰ Timeout after 10 seconds`);
      req.destroy();
      resolve({
        url,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function runTests() {
  console.log('\n📋 Testing Frontend (Vercel)');
  console.log('============================');
  
  const frontendResult = await testEndpoint(
    config.frontend.url,
    `${config.frontend.name} - Landing Page`
  );
  
  console.log('\n📋 Testing Backend (Railway)');
  console.log('============================');
  
  const backendTests = [
    {
      url: config.backend.baseUrl,
      name: 'Base URL'
    },
    {
      url: `${config.backend.baseUrl}/health`,
      name: 'Health Check'
    },
    {
      url: `${config.backend.apiUrl}/health`,
      name: 'API Health Check'
    },
    {
      url: `${config.backend.apiUrl}/auth/check`,
      name: 'Auth Check Endpoint'
    }
  ];
  
  const backendResults = [];
  for (const test of backendTests) {
    const result = await testEndpoint(test.url, `${config.backend.name} - ${test.name}`);
    backendResults.push(result);
  }
  
  console.log('\n📊 Summary Report');
  console.log('================');
  
  console.log(`\n🖥️  Frontend Status:`);
  console.log(`   ${frontendResult.success ? '✅' : '❌'} ${config.frontend.name}: ${frontendResult.success ? 'OPERATIONAL' : 'FAILED'}`);
  if (!frontendResult.success) {
    console.log(`      Error: ${frontendResult.error || 'HTTP ' + frontendResult.status}`);
  }
  
  console.log(`\n🔧 Backend Status:`);
  const workingEndpoints = backendResults.filter(r => r.success).length;
  const totalEndpoints = backendResults.length;
  
  backendResults.forEach((result, index) => {
    const test = backendTests[index];
    console.log(`   ${result.success ? '✅' : '❌'} ${test.name}: ${result.success ? 'WORKING' : 'FAILED'}`);
    if (!result.success) {
      console.log(`      Error: ${result.error || 'HTTP ' + result.status}`);
    }
  });
  
  console.log(`\n📈 Overall Status:`);
  console.log(`   Frontend: ${frontendResult.success ? '✅ DEPLOYED' : '❌ FAILED'}`);
  console.log(`   Backend:  ${workingEndpoints > 0 ? '🟡 PARTIAL' : '❌ FAILED'} (${workingEndpoints}/${totalEndpoints} endpoints)`);
  
  if (frontendResult.success && workingEndpoints > 0) {
    console.log('\n🎉 DEPLOYMENT STATUS: PARTIALLY OPERATIONAL');
    console.log('   ✅ Frontend is deployed and accessible');
    console.log('   🟡 Backend is deployed but API endpoints need investigation');
    console.log('\n🔧 Next Steps:');
    console.log('   1. Check Railway deployment logs');
    console.log('   2. Verify API route mounting');
    console.log('   3. Test API integration from frontend');
  } else {
    console.log('\n❌ DEPLOYMENT STATUS: NEEDS ATTENTION');
    console.log('   Issues detected that require resolution');
  }
  
  console.log('\n' + '='.repeat(50));
}

// Run the tests
runTests().catch(console.error);
