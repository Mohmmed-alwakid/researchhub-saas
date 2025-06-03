#!/usr/bin/env node

/**
 * Railway Deployment Diagnostic Script
 * This script helps identify deployment issues on Railway
 */

const https = require('https');
const http = require('http');

console.log('🔍 Railway Deployment Diagnostic Tool');
console.log('====================================');

// Test URLs
const urls = [
  'https://afakar-production.up.railway.app/',
  'https://afakar-production.up.railway.app/health',
  'https://afakar-production.up.railway.app/api/health'
];

function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`\n🌐 Testing: ${url}`);
    
    const req = protocol.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Body: ${data}`);
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   Error: ${error.message}`);
      resolve({
        url,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   Timeout: Request timed out after 10 seconds`);
      req.destroy();
      resolve({
        url,
        error: 'Timeout'
      });
    });
  });
}

async function runDiagnostics() {
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const url of urls) {
    const result = await testUrl(url);
    results.push(result);
  }
  
  console.log('\n📊 Summary:');
  console.log('===========');
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.url}: ${result.error}`);
    } else {
      console.log(`✅ ${result.url}: ${result.status}`);
    }
  });
  
  console.log('\n🔧 Recommendations:');
  console.log('==================');
  
  const hasErrors = results.some(r => r.error || (r.status && r.status !== 200));
  
  if (hasErrors) {
    console.log('❌ Deployment issues detected. Check:');
    console.log('   1. Railway build logs');
    console.log('   2. Environment variables');
    console.log('   3. Start command in railway.toml');
    console.log('   4. Port binding (should be 0.0.0.0)');
    console.log('   5. Node.js version compatibility');
  } else {
    console.log('✅ All endpoints responding correctly!');
  }
}

runDiagnostics().catch(console.error);
