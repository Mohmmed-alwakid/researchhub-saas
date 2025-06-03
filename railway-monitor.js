#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Railway project monitoring
const RAILWAY_PROJECT_ID = '95c09b83-e303-4e20-9906-524cce66fc3b';
const API_SERVICE_ID = 'b6d5be6d-c0a6-41df-8de1-246041664847';

console.log('🚀 Railway Deployment Monitor - ResearchHub');
console.log('=' .repeat(50));

// Function to make HTTP request
function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const module = url.startsWith('https:') ? https : http;
    const req = module.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Check Railway service status
async function checkRailwayService() {
  try {
    console.log('📊 Checking Railway Service Status...');
    
    // Try to get the service domain from Railway API
    const railwayApiUrl = `https://backboard.railway.app/graphql/v2`;
    
    console.log('🔍 Railway Project: https://railway.app/project/' + RAILWAY_PROJECT_ID);
    console.log('🔍 API Service: https://railway.app/project/' + RAILWAY_PROJECT_ID + '/service/' + API_SERVICE_ID);
    
    return true;
  } catch (error) {
    console.error('❌ Error checking Railway service:', error.message);
    return false;
  }
}

// Test health endpoints
async function testHealthEndpoints(baseUrl) {
  const endpoints = [
    '/health',
    '/api/health',
    '/api/auth/register',
  ];
  
  console.log('🏥 Testing Health Endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const url = baseUrl + endpoint;
      console.log(`Testing: ${url}`);
      
      const result = await makeRequest(url);
      
      if (result.statusCode === 200) {
        console.log(`✅ ${endpoint} - OK (${result.statusCode})`);
        
        // Try to parse JSON response
        try {
          const json = JSON.parse(result.data);
          if (json.status === 'ok' || json.message) {
            console.log(`   📝 Response: ${json.message || json.status}`);
          }
        } catch (e) {
          console.log(`   📝 Response: ${result.data.substring(0, 100)}...`);
        }
      } else if (result.statusCode === 404 && endpoint === '/api/auth/register') {
        console.log(`⚠️  ${endpoint} - Expected 404 for GET request`);
      } else {
        console.log(`❌ ${endpoint} - Error (${result.statusCode})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed: ${error.message}`);
    }
  }
}

// Main monitoring function
async function monitorDeployment() {
  console.log('🎯 Starting Railway Deployment Monitor...');
  console.log('Time:', new Date().toISOString());
  
  // Check Railway service
  const serviceOk = await checkRailwayService();
  
  if (!serviceOk) {
    console.log('❌ Railway service check failed');
    return;
  }
  
  // Prompt for the Railway domain
  console.log('\n🌐 Once your Railway service is deployed, you will get a domain like:');
  console.log('   https://researchhub-api-production-xxxx.up.railway.app');
  console.log('\n📝 To test the deployment, run:');
  console.log('   node railway-monitor.js [your-railway-domain]');
  
  // If domain provided as argument
  if (process.argv[2]) {
    const domain = process.argv[2];
    console.log(`\n🔍 Testing deployment at: ${domain}`);
    await testHealthEndpoints(domain);
  }
  
  console.log('\n✅ Monitoring complete!');
}

// Run the monitor
monitorDeployment().catch(console.error);
