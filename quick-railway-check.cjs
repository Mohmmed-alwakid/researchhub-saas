#!/usr/bin/env node

/**
 * Quick Railway Health Check
 * Simple one-command check for Railway deployment
 */

const https = require('https');

const RAILWAY_URL = process.argv[2] || process.env.RAILWAY_URL;

if (!RAILWAY_URL) {
  console.log('❌ Please provide Railway URL as argument or set RAILWAY_URL environment variable');
  console.log('Usage: node quick-railway-check.cjs https://your-app.railway.app');
  process.exit(1);
}

console.log(`🚂 Quick Railway Check: ${RAILWAY_URL}`);
console.log('='.repeat(50));

const healthUrl = `${RAILWAY_URL.replace(/\/$/, '')}/api/health`;

https.get(healthUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      
      console.log(`\n📊 API Status: ${res.statusCode === 200 ? '✅ OK' : '❌ ERROR'}`);
      console.log(`🕐 Uptime: ${Math.round(health.uptime || 0)}s`);
      console.log(`🌍 Environment: ${health.environment || 'unknown'}`);
      
      if (health.database) {
        const dbStatus = health.database.status === 'healthy' && health.database.isConnected;
        console.log(`🔌 Database: ${dbStatus ? '✅ Connected' : '❌ Disconnected'}`);
        
        if (health.database.host) {
          console.log(`🏠 DB Host: ${health.database.host}`);
        }
        if (health.database.name) {
          console.log(`📂 DB Name: ${health.database.name}`);
        }
      } else {
        console.log('🔌 Database: ⚠️  Status unknown');
      }
      
      if (res.statusCode === 200 && health.database?.status === 'healthy') {
        console.log('\n🎉 Railway deployment is healthy!');
      } else {
        console.log('\n⚠️  Railway deployment has issues - check logs');
      }
      
    } catch (error) {
      console.log(`❌ Invalid health response: ${error.message}`);
      console.log(`Raw response: ${data.substring(0, 200)}...`);
    }
  });
}).on('error', (err) => {
  console.log(`❌ Connection failed: ${err.message}`);
  console.log('💡 Check if Railway URL is correct and deployment is running');
});

console.log(`\n🔍 Testing: ${healthUrl}`);
console.log('Please wait...');
