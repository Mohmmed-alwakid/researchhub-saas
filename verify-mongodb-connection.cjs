#!/usr/bin/env node

/**
 * Railway MongoDB Connection Verifier
 * Specifically for researchhub-mongodb service
 */

const https = require('https');

console.log('🚂 Railway MongoDB Connection Verifier');
console.log('=====================================');
console.log('For researchhub-mongodb service');
console.log('');

const railwayUrl = process.argv[2];

if (!railwayUrl) {
  console.log('❌ Please provide your Railway URL');
  console.log('Usage: node verify-mongodb-connection.cjs https://your-app.railway.app');
  process.exit(1);
}

console.log(`🎯 Testing Railway app: ${railwayUrl}`);
console.log('');

// Test health endpoint
const healthUrl = `${railwayUrl.replace(/\/$/, '')}/api/health`;

console.log(`🔍 Testing health endpoint: ${healthUrl}`);

https.get(healthUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      
      console.log(`\n📊 API Response: ${res.statusCode === 200 ? '✅ OK' : '❌ ERROR'}`);
      
      if (health.status) {
        console.log(`🎯 Overall Status: ${health.status}`);
      }
      
      if (health.environment) {
        console.log(`🌍 Environment: ${health.environment}`);
      }
      
      if (health.uptime) {
        console.log(`⏱️  Uptime: ${Math.round(health.uptime)}s`);
      }
      
      // Check database connection specifically
      if (health.database) {
        console.log('\n🔌 DATABASE CONNECTION STATUS:');
        console.log(`   Status: ${health.database.status === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
        console.log(`   Connected: ${health.database.isConnected ? '✅ YES' : '❌ NO'}`);
        console.log(`   Ready State: ${health.database.readyState} ${health.database.readyState === 1 ? '(Connected)' : '(Disconnected)'}`);
        
        if (health.database.host) {
          console.log(`   Host: ${health.database.host}`);
        }
        
        if (health.database.name) {
          console.log(`   Database: ${health.database.name}`);
        }
        
        // Overall assessment
        const dbHealthy = health.database.status === 'healthy' && health.database.isConnected;
        
        console.log('\n🎯 ASSESSMENT:');
        if (dbHealthy) {
          console.log('✅ SUCCESS: MongoDB connection is working perfectly!');
          console.log('✅ Your researchhub-mongodb service is properly connected');
          console.log('✅ Ready for production use');
        } else {
          console.log('❌ ISSUE: MongoDB connection needs attention');
          console.log('💡 Check your MONGODB_URI environment variable');
          console.log('💡 Ensure it references researchhub-mongodb service correctly');
        }
        
      } else {
        console.log('\n⚠️  No database status in health response');
        console.log('💡 Health endpoint might not include database info');
      }
      
      // Additional API checks
      console.log('\n📋 NEXT STEPS:');
      if (res.statusCode === 200) {
        console.log('1. ✅ API is responding correctly');
        console.log('2. 🧪 Test user registration/login');
        console.log('3. 📊 Test study creation workflow');
        console.log('4. 🔗 Update frontend to use this Railway URL');
      } else {
        console.log('1. 🔧 Fix the issues shown above');
        console.log('2. 🔄 Redeploy your Railway service');
        console.log('3. 🧪 Test again with this script');
      }
      
    } catch (error) {
      console.log(`❌ Failed to parse response: ${error.message}`);
      console.log(`Raw response: ${data.substring(0, 200)}...`);
    }
  });
}).on('error', (err) => {
  console.log(`❌ Connection failed: ${err.message}`);
  console.log('');
  console.log('🔧 TROUBLESHOOTING:');
  console.log('1. Check if Railway URL is correct');
  console.log('2. Verify Railway deployment is active');
  console.log('3. Check Railway service logs for errors');
  console.log('4. Ensure API service is deployed and running');
});

console.log('⏳ Testing connection...');
