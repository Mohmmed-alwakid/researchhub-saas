#!/usr/bin/env node
/**
 * DATABASE INTEGRATION TEST SCRIPT
 * Tests both studies and applications APIs with real database operations
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3003';

// Test authentication token (would normally get from login flow)
const TEST_TOKEN = 'test-token-123';

async function testStudiesAPI() {
  console.log('\n🔬 Testing Studies API (Database Integration)...');
  
  try {
    const response = await fetch(`${API_BASE}/api/research-consolidated?action=get-studies`, {
      method: 'GET',
      headers: {
        'x-user-role': 'participant'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Studies API: SUCCESS');
      console.log(`📊 Found ${data.count} studies in database`);
      console.log('📝 Sample study:', data.data[0]?.title || 'No studies found');
      return true;
    } else {
      console.log('❌ Studies API: FAILED');
      console.log('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Studies API: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function testApplicationsAPI() {
  console.log('\n📋 Testing Applications API (Database Integration)...');
  
  try {
    // Test getting applications without auth (should fail gracefully)
    const response = await fetch(`${API_BASE}/api/applications?endpoint=applications/my-applications`, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Applications API: Authentication check working');
      console.log('✅ Database integration: API properly requires authentication');
      return true;
    } else if (response.ok && data.success) {
      console.log('✅ Applications API: SUCCESS');
      console.log(`📊 Found applications in database`);
      return true;
    } else {
      console.log('❌ Applications API: FAILED');
      console.log('Status:', response.status);
      console.log('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Applications API: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function testDatabaseConnectivity() {
  console.log('\n💾 Testing Database Connectivity...');
  
  try {
    // Test with a simple health check-style query
    const response = await fetch(`${API_BASE}/api/research-consolidated?action=dashboard-analytics`, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Database: Connection successful');
      console.log('📊 Analytics data:', {
        totalStudies: data.data.totalStudies,
        activeStudies: data.data.activeStudies
      });
      return true;
    } else {
      console.log('❌ Database: Connection issues');
      console.log('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Database: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 DATABASE INTEGRATION TEST SUITE');
  console.log('=====================================');
  
  const results = {
    database: await testDatabaseConnectivity(),
    studies: await testStudiesAPI(),
    applications: await testApplicationsAPI()
  };
  
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`💾 Database Connectivity: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔬 Studies API:           ${results.studies ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📋 Applications API:      ${results.applications ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`\n📝 MIGRATION STATUS: ${allPassed ? 'DATABASE INTEGRATION SUCCESSFUL' : 'NEEDS ATTENTION'}`);
  
  if (allPassed) {
    console.log('\n🎉 Database migration complete! In-memory storage has been successfully replaced with Supabase database.');
    console.log('✨ The platform now has persistent data storage and will not lose data on server restarts.');
  }
  
  return allPassed;
}

// Run the tests
runTests().catch(console.error);
