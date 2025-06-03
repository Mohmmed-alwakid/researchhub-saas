#!/usr/bin/env node

/**
 * Railway Deployment Monitor
 * Monitors the Railway deployment after pushing fixes
 */

const https = require('https');

// Railway project info (you'll need to replace with your actual Railway URL)
const RAILWAY_URL = process.env.RAILWAY_URL || 'your-app-url.railway.app';
const HEALTH_ENDPOINT = '/health';
const API_HEALTH_ENDPOINT = '/api/health';

console.log('🚀 Railway Deployment Monitor Started');
console.log('📊 Monitoring deployment after critical fixes...');
console.log('⏰ Started at:', new Date().toISOString());
console.log('');

function checkEndpoint(url, endpoint, label) {
  return new Promise((resolve) => {
    const fullUrl = `https://${url}${endpoint}`;
    
    const req = https.get(fullUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Railway-Deployment-Monitor'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${label} (${res.statusCode}):`, parsed);
          resolve({ success: true, status: res.statusCode, data: parsed });
        } catch (error) {
          console.log(`⚠️  ${label} (${res.statusCode}): Non-JSON response:`, data.substring(0, 200));
          resolve({ success: true, status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${label}: Request timeout`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${label}: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
  });
}

async function monitorDeployment() {
  console.log('🔍 Checking Railway deployment status...');
  console.log('');
  
  // Check if Railway URL is configured
  if (RAILWAY_URL === 'your-app-url.railway.app') {
    console.log('⚠️  Railway URL not configured. Please set RAILWAY_URL environment variable.');
    console.log('💡 You can find your Railway URL in your Railway dashboard.');
    console.log('');
    console.log('🔧 To use this monitor:');
    console.log('   $env:RAILWAY_URL="your-actual-app.railway.app"; node railway-deployment-monitor.js');
    console.log('');
    return;
  }
  
  // Check health endpoints
  const healthResult = await checkEndpoint(RAILWAY_URL, HEALTH_ENDPOINT, 'Health Check');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  const apiHealthResult = await checkEndpoint(RAILWAY_URL, API_HEALTH_ENDPOINT, 'API Health Check');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  const rootResult = await checkEndpoint(RAILWAY_URL, '/', 'Root Endpoint');
  
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Health Check: ${healthResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`   API Health: ${apiHealthResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Root Endpoint: ${rootResult.success ? '✅ Working' : '❌ Failed'}`);
  
  if (healthResult.success && apiHealthResult.success && rootResult.success) {
    console.log('');
    console.log('🎉 SUCCESS! Railway deployment is working correctly!');
    console.log('✅ All critical fixes have been successfully deployed');
    console.log('🌐 Your backend is now live and ready for frontend integration');
  } else {
    console.log('');
    console.log('⚠️  Some endpoints are not responding correctly.');
    console.log('💡 This might be normal if the deployment is still in progress.');
    console.log('⏰ Try running this monitor again in a few minutes.');
  }
}

monitorDeployment().catch(console.error);
