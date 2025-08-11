#!/usr/bin/env node

/**
 * Quick Test Runner for Development Changes
 * Runs essential tests after making changes
 */

import { execSync } from 'child_process';

console.log('🧪 Quick Test Runner for Development Changes');
console.log('==========================================');

const tests = [
  {
    name: 'API Health Check',
    command: 'curl -s http://localhost:3003/api/health',
    description: 'Verify server is responding'
  },
  {
    name: 'Dashboard Analytics',
    command: 'curl -s http://localhost:3003/api/research-consolidated?action=dashboard-analytics',
    description: 'Test dashboard API endpoint'
  },
  {
    name: 'Studies Data',
    command: 'curl -s http://localhost:3003/api/research-consolidated?action=get-studies',
    description: 'Test studies API endpoint'
  },
  {
    name: 'Studies Proxy',
    command: 'curl -s http://localhost:3003/api/studies',
    description: 'Test studies proxy routing'
  }
];

async function runTest(test) {
  console.log(`\n🔍 Testing: ${test.name}`);
  console.log(`📋 ${test.description}`);
  
  try {
    const result = execSync(test.command, { 
      encoding: 'utf8',
      timeout: 5000 
    });
    
    try {
      const parsed = JSON.parse(result);
      if (parsed.success) {
        console.log(`✅ ${test.name} - SUCCESS`);
        console.log(`📊 Data: ${JSON.stringify(parsed.data || parsed, null, 2).substring(0, 200)}...`);
      } else {
        console.log(`⚠️ ${test.name} - API returned success: false`);
        console.log(`❌ Error: ${parsed.error || 'Unknown error'}`);
      }
    } catch (parseError) {
      if (result.includes('200') || result.includes('success')) {
        console.log(`✅ ${test.name} - SUCCESS (non-JSON response)`);
      } else {
        console.log(`❌ ${test.name} - FAILED`);
        console.log(`📄 Response: ${result.substring(0, 200)}...`);
      }
    }
  } catch (error) {
    console.log(`💥 ${test.name} - CONNECTION ERROR`);
    console.log(`❌ ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n🚀 Running quick tests for your changes...\n');
  
  for (const test of tests) {
    await runTest(test);
  }
  
  console.log('\n🎯 Quick Test Summary:');
  console.log('======================');
  console.log('✅ If all tests show SUCCESS, your changes are working!');
  console.log('❌ If any tests fail, check the API endpoint or server logs');
  console.log('\n💡 Next Steps:');
  console.log('• Test in browser: http://localhost:5175');
  console.log('• Check console: Should be clean with your automation');
  console.log('• Make more changes: They will auto-reload!');
}

runAllTests();
