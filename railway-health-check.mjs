// Railway Deployment Health Check
// Test script to verify Railway backend deployment status

const RAILWAY_URLS = [
  'https://researchhub-backend-production.up.railway.app',
  'https://researchhub-saas-production.up.railway.app',
  'https://web-production-4c53.up.railway.app',
  'https://researchhub-production.up.railway.app'
];

const ENDPOINTS = ['/health', '/api/health', '/'];

async function checkDeployment() {
  console.log('🔍 Checking Railway deployment status...\n');
  
  for (const baseUrl of RAILWAY_URLS) {
    console.log(`\n🌐 Testing: ${baseUrl}`);
    
    for (const endpoint of ENDPOINTS) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`   Checking: ${endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ResearchHub-Health-Check'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const text = await response.text();
          console.log(`   ✅ SUCCESS: ${response.status} - ${text.substring(0, 100)}...`);
          
          if (endpoint === '/health' || endpoint === '/api/health') {
            console.log(`\n🎉 FOUND LIVE DEPLOYMENT: ${baseUrl}`);
            console.log(`📋 Health endpoint working: ${url}`);
            return { success: true, url: baseUrl, endpoint: url };
          }
        } else {
          console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`   ⏰ Timeout: No response within 10 seconds`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
  }
  
  console.log('\n🔄 No live deployment found. This could mean:');
  console.log('   1. Deployment is still in progress');
  console.log('   2. Different Railway URL pattern');
  console.log('   3. Railway deployment failed');
  
  return { success: false };
}

// Run the check
checkDeployment().then(result => {
  if (result.success) {
    console.log(`\n✅ DEPLOYMENT CONFIRMED: ${result.url}`);
    console.log(`🌍 Backend is live and ready for frontend integration!`);
  } else {
    console.log(`\n⚠️  No live deployment detected. Check Railway dashboard for status.`);
  }
}).catch(error => {
  console.error('❌ Health check script failed:', error);
});
