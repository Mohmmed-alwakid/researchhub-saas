#!/usr/bin/env node

/**
 * Railway Deployment Diagnostic Tool
 * Helps identify and fix Railway deployment issues
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔧 Railway Deployment Diagnostic Tool');
console.log('=====================================');

const RAILWAY_URL = 'https://researchhub-saas-production.railway.app';
const LOCAL_BUILD_PATH = './dist/server/server/index.js';

// Test configuration
const tests = [
  {
    name: 'Railway Service Health',
    url: `${RAILWAY_URL}/health`,
    expected: 'OK',
    critical: true
  },
  {
    name: 'Railway Root Endpoint',
    url: `${RAILWAY_URL}/`,
    expected: 'JSON response with API info',
    critical: true
  },
  {
    name: 'API Health Endpoint',
    url: `${RAILWAY_URL}/api/health`,
    expected: 'JSON with database status',
    critical: true
  },
  {
    name: 'API Base Route',
    url: `${RAILWAY_URL}/api`,
    expected: 'API information or routes',
    critical: false
  },
  {
    name: 'Auth Check Endpoint',
    url: `${RAILWAY_URL}/api/auth/check`,
    expected: 'JSON error (no token)',
    critical: false
  }
];

function testUrl(test) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    const req = https.get(test.url, { timeout: 10000 }, (res) => {
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Headers: ${JSON.stringify({
        'content-type': res.headers['content-type'],
        'content-length': res.headers['content-length']
      }, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let responseBody = data;
        let isJson = false;
        
        try {
          const jsonData = JSON.parse(data);
          responseBody = JSON.stringify(jsonData, null, 2);
          isJson = true;
        } catch (e) {
          if (data.length > 200) {
            responseBody = data.substring(0, 200) + '...';
          }
        }
        
        console.log(`   Response Type: ${isJson ? 'JSON' : 'Text'}`);
        console.log(`   Response: ${responseBody}`);
        
        const success = res.statusCode >= 200 && res.statusCode < 300;
        const result = {
          test: test.name,
          url: test.url,
          status: res.statusCode,
          success,
          isJson,
          data,
          critical: test.critical
        };
        
        if (test.critical && !success) {
          console.log(`   ❌ CRITICAL FAILURE: ${test.name}`);
        } else if (success) {
          console.log(`   ✅ SUCCESS: ${test.name}`);
        } else {
          console.log(`   ⚠️  WARNING: ${test.name} failed`);
        }
        
        resolve(result);
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({
        test: test.name,
        url: test.url,
        status: 0,
        success: false,
        error: error.message,
        critical: test.critical
      });
    });
    
    req.on('timeout', () => {
      console.log(`   ⏰ Timeout after 10 seconds`);
      req.destroy();
      resolve({
        test: test.name,
        url: test.url,
        status: 0,
        success: false,
        error: 'Timeout',
        critical: test.critical
      });
    });
  });
}

function checkLocalBuild() {
  console.log('\n🔍 Checking Local Build');
  console.log('========================');
  
  const buildExists = fs.existsSync(LOCAL_BUILD_PATH);
  console.log(`   Build file exists: ${buildExists ? '✅' : '❌'} ${LOCAL_BUILD_PATH}`);
  
  if (buildExists) {
    const stats = fs.statSync(LOCAL_BUILD_PATH);
    console.log(`   File size: ${stats.size} bytes`);
    console.log(`   Modified: ${stats.mtime.toISOString()}`);
  }
  
  const packageExists = fs.existsSync('./dist/server/package.json');
  console.log(`   Package.json exists: ${packageExists ? '✅' : '❌'} ./dist/server/package.json`);
  
  return buildExists && packageExists;
}

function checkEnvironmentFiles() {
  console.log('\n🔍 Checking Environment Configuration');
  console.log('====================================');
  
  const envFiles = [
    '.env',
    '.env.production',
    '.env.production.frontend'
  ];
  
  envFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${file}: ${exists ? '✅ exists' : '❌ missing'}`);
    
    if (exists && file.includes('production')) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const hasMongoUri = content.includes('MONGODB_URI');
        const hasJwtSecret = content.includes('JWT_SECRET');
        console.log(`      MongoDB URI: ${hasMongoUri ? '✅' : '❌'}`);
        console.log(`      JWT Secret: ${hasJwtSecret ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`      Error reading file: ${error.message}`);
      }
    }
  });
}

function generateDiagnosticReport(results) {
  console.log('\n📊 Diagnostic Report');
  console.log('===================');
  
  const criticalFailures = results.filter(r => r.critical && !r.success);
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  
  console.log(`\n📈 Test Results: ${passedTests}/${totalTests} passed`);
  
  if (criticalFailures.length > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND:');
    criticalFailures.forEach(failure => {
      console.log(`   • ${failure.test}: ${failure.error || 'HTTP ' + failure.status}`);
    });
  }
  
  console.log('\n🔧 RECOMMENDED ACTIONS:');
  
  if (criticalFailures.some(f => f.test === 'Railway Service Health')) {
    console.log('   1. ❌ Railway service is not responding - check Railway dashboard');
    console.log('      • Go to https://railway.app/dashboard');
    console.log('      • Check if service is running');
    console.log('      • Review deployment logs');
  }
  
  if (criticalFailures.some(f => f.test === 'API Health Endpoint')) {
    console.log('   2. ❌ API routes not working - deployment issue detected');
    console.log('      • Check Railway build logs for errors');
    console.log('      • Verify environment variables in Railway');
    console.log('      • Consider redeploying with: git commit --allow-empty -m "redeploy" && git push');
  }
  
  if (criticalFailures.some(f => f.test === 'Railway Root Endpoint')) {
    console.log('   3. ❌ Application not running - start command issue');
    console.log('      • Verify Railway start command: node dist/server/server/index.js');
    console.log('      • Check if build process completed successfully');
    console.log('      • Review server startup logs');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Open Railway dashboard: https://railway.app/dashboard');
  console.log('   2. Find your ResearchHub project');
  console.log('   3. Click on the backend service');
  console.log('   4. Check "Deployments" tab for build/runtime logs');
  console.log('   5. Verify "Variables" tab has all required environment variables');
  console.log('   6. If needed, trigger redeploy from dashboard');
  
  console.log('\n🆘 IF PROBLEMS PERSIST:');
  console.log('   • Share Railway deployment logs');
  console.log('   • Verify environment variables match local .env');
  console.log('   • Check Railway status: https://status.railway.app');
}

async function runDiagnostic() {
  // Check local build first
  const localBuildOk = checkLocalBuild();
  
  // Check environment configuration
  checkEnvironmentFiles();
  
  if (!localBuildOk) {
    console.log('\n❌ Local build issues detected. Run: npm run build:server');
    return;
  }
  
  // Test Railway endpoints
  console.log('\n🔍 Testing Railway Endpoints');
  console.log('============================');
  
  const results = [];
  for (const test of tests) {
    const result = await testUrl(test);
    results.push(result);
  }
  
  // Generate report
  generateDiagnosticReport(results);
  
  console.log('\n' + '='.repeat(50));
  console.log('Diagnostic completed. Review the recommendations above.');
}

// Run the diagnostic
runDiagnostic().catch(console.error);
