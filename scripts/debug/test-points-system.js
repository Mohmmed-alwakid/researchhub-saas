#!/usr/bin/env node

/**
 * Points System Testing and Validation Script
 * 
 * This script tests the enhanced points system implementation
 * and validates all improvements are working correctly.
 * 
 * Usage: node test-points-system.js
 * 
 * Requirements:
 * - Node.js 16+
 * - Access to ResearchHub database
 * - Admin and regular user test accounts
 * 
 * Test Coverage:
 * - API endpoint functionality
 * - Database operations
 * - Security policies
 * - Performance benchmarks
 * - Error handling
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3003/api'; // Local development
const TEST_ACCOUNTS = {
  admin: {
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123',
    expectedRole: 'admin'
  },
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123',
    expectedRole: 'researcher'
  },
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123',
    expectedRole: 'participant'
  }
};

// Test Results Storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  summary: {}
};

// Helper Functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    log(`PASS: ${message}`, 'success');
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    log(`FAIL: ${message}`, 'error');
  }
}

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (options.body) {
    defaultOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

async function authenticateUser(email, password) {
  const response = await makeRequest('/auth?action=login', {
    method: 'POST',
    body: { email, password }
  });
  
  if (response.status === 200 && response.data.success) {
    return response.data.token;
  }
  
  throw new Error(`Authentication failed for ${email}: ${response.data.error}`);
}

// Test Functions
async function testAuthentication() {
  log('Testing authentication system...');
  
  try {
    // Test admin authentication
    const adminToken = await authenticateUser(TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);
    assert(adminToken, 'Admin authentication successful');
    
    // Test researcher authentication
    const researcherToken = await authenticateUser(TEST_ACCOUNTS.researcher.email, TEST_ACCOUNTS.researcher.password);
    assert(researcherToken, 'Researcher authentication successful');
    
    return { adminToken, researcherToken };
  } catch (error) {
    assert(false, `Authentication failed: ${error.message}`);
    return null;
  }
}

async function testPointsBalance(token, userType) {
  log(`Testing points balance for ${userType}...`);
  
  const response = await makeRequest('/points?action=balance', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  assert(response.status === 200, `Balance endpoint returns 200 for ${userType}`);
  assert(response.data.success, `Balance endpoint returns success for ${userType}`);
  
  if (response.data.success) {
    const balance = response.data.balance;
    assert(typeof balance.currentBalance === 'number', `Current balance is a number for ${userType}`);
    assert(typeof balance.totalEarned === 'number', `Total earned is a number for ${userType}`);
    assert(typeof balance.totalSpent === 'number', `Total spent is a number for ${userType}`);
    assert(balance.userId, `User ID is present for ${userType}`);
  }
  
  return response.data.balance;
}

async function testCostCalculation(token, userType) {
  log(`Testing cost calculation for ${userType}...`);
  
  const testCases = [
    { blocks: 3, participants: 5, expectedCost: 10 }, // Only base cost
    { blocks: 8, participants: 15, expectedCost: 21 }, // Base + blocks + participants
    { blocks: 10, participants: 25, expectedCost: 35 }  // Maximum test case
  ];
  
  for (const testCase of testCases) {
    const response = await makeRequest('/points?action=calculate-cost', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { blockCount: testCase.blocks, participantCount: testCase.participants }
    });
    
    assert(response.status === 200, `Cost calculation returns 200 for ${userType}`);
    assert(response.data.success, `Cost calculation returns success for ${userType}`);
    
    if (response.data.success) {
      const cost = response.data.cost;
      assert(cost.totalCost === testCase.expectedCost, 
        `Cost calculation correct for ${testCase.blocks} blocks, ${testCase.participants} participants`);
    }
  }
}

async function testTransactionHistory(token, userType) {
  log(`Testing transaction history for ${userType}...`);
  
  const response = await makeRequest('/points?action=history', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  assert(response.status === 200, `Transaction history returns 200 for ${userType}`);
  assert(response.data.success, `Transaction history returns success for ${userType}`);
  
  if (response.data.success) {
    assert(Array.isArray(response.data.transactions), `Transaction history is an array for ${userType}`);
    assert(response.data.pagination, `Pagination info is present for ${userType}`);
  }
}

async function testUsageStats(token, userType) {
  log(`Testing usage statistics for ${userType}...`);
  
  const response = await makeRequest('/points?action=stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  assert(response.status === 200, `Usage stats returns 200 for ${userType}`);
  assert(response.data.success, `Usage stats returns success for ${userType}`);
  
  if (response.data.success) {
    const stats = response.data.stats;
    assert(typeof stats.studiesCreated === 'number', `Studies created is a number for ${userType}`);
    assert(typeof stats.pointsSpent === 'number', `Points spent is a number for ${userType}`);
    assert(typeof stats.pointsEarned === 'number', `Points earned is a number for ${userType}`);
    assert(typeof stats.averageCostPerStudy === 'number', `Average cost is a number for ${userType}`);
  }
}

async function testAdminOperations(adminToken) {
  log('Testing admin operations...');
  
  // Test admin balances
  const balancesResponse = await makeRequest('/points?action=admin-balances', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  assert(balancesResponse.status === 200, 'Admin balances returns 200');
  assert(balancesResponse.data.success, 'Admin balances returns success');
  
  if (balancesResponse.data.success) {
    assert(Array.isArray(balancesResponse.data.balances), 'Admin balances is an array');
  }
  
  // Test admin transactions
  const transactionsResponse = await makeRequest('/points?action=admin-transactions', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  assert(transactionsResponse.status === 200, 'Admin transactions returns 200');
  assert(transactionsResponse.data.success, 'Admin transactions returns success');
  
  if (transactionsResponse.data.success) {
    assert(Array.isArray(transactionsResponse.data.transactions), 'Admin transactions is an array');
  }
  
  // Test point assignment
  const assignResponse = await makeRequest('/points?action=assign', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      userEmail: TEST_ACCOUNTS.researcher.email,
      amount: 50,
      reason: 'Test point assignment',
      expiresInDays: 30
    }
  });
  
  assert(assignResponse.status === 200, 'Point assignment returns 200');
  assert(assignResponse.data.success, 'Point assignment returns success');
}

async function testSecurityPolicies(researcherToken) {
  log('Testing security policies...');
  
  // Test that regular users cannot access admin endpoints
  const adminBalancesResponse = await makeRequest('/points?action=admin-balances', {
    headers: { Authorization: `Bearer ${researcherToken}` }
  });
  
  assert(adminBalancesResponse.status === 403, 'Regular user cannot access admin balances');
  
  const adminTransactionsResponse = await makeRequest('/points?action=admin-transactions', {
    headers: { Authorization: `Bearer ${researcherToken}` }
  });
  
  assert(adminTransactionsResponse.status === 403, 'Regular user cannot access admin transactions');
  
  const assignResponse = await makeRequest('/points?action=assign', {
    method: 'POST',
    headers: { Authorization: `Bearer ${researcherToken}` },
    body: {
      userEmail: TEST_ACCOUNTS.researcher.email,
      amount: 50,
      reason: 'Unauthorized assignment attempt'
    }
  });
  
  assert(assignResponse.status === 403, 'Regular user cannot assign points');
}

async function testErrorHandling() {
  log('Testing error handling...');
  
  // Test unauthenticated requests
  const noAuthResponse = await makeRequest('/points?action=balance');
  assert(noAuthResponse.status === 401, 'Unauthenticated request returns 401');
  
  // Test invalid action
  const invalidActionResponse = await makeRequest('/points?action=invalid', {
    headers: { Authorization: 'Bearer invalid-token' }
  });
  assert(invalidActionResponse.status === 401 || invalidActionResponse.status === 400, 
    'Invalid action/token returns appropriate error');
}

async function runPerformanceTests(token) {
  log('Running performance tests...');
  
  const startTime = Date.now();
  const promises = [];
  
  // Run 10 concurrent balance requests
  for (let i = 0; i < 10; i++) {
    promises.push(makeRequest('/points?action=balance', {
      headers: { Authorization: `Bearer ${token}` }
    }));
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  const successfulRequests = results.filter(r => r.status === 200).length;
  const avgResponseTime = (endTime - startTime) / results.length;
  
  assert(successfulRequests === 10, 'All concurrent requests successful');
  assert(avgResponseTime < 1000, 'Average response time under 1 second');
  
  log(`Performance: ${successfulRequests}/10 successful, ${avgResponseTime}ms avg response time`);
}

async function generateReport() {
  log('Generating test report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: `${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`
    },
    errors: testResults.errors,
    recommendations: []
  };
  
  // Add recommendations based on test results
  if (testResults.failed > 0) {
    report.recommendations.push('Review failed tests and fix issues before deployment');
  }
  
  if (testResults.passed === 0) {
    report.recommendations.push('No tests passed - check API connectivity and authentication');
  }
  
  if (testResults.errors.length > 5) {
    report.recommendations.push('Multiple errors detected - perform comprehensive system review');
  }
  
  // Save report to file
  const reportPath = path.join(__dirname, 'points-system-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`Test report saved to: ${reportPath}`);
  return report;
}

// Main Test Runner
async function runTests() {
  log('🚀 Starting Points System Test Suite');
  log('=====================================');
  
  try {
    // Authentication tests
    const tokens = await testAuthentication();
    if (!tokens) {
      log('Authentication failed - aborting tests', 'error');
      return;
    }
    
    const { adminToken, researcherToken } = tokens;
    
    // Core functionality tests
    await testPointsBalance(adminToken, 'admin');
    await testPointsBalance(researcherToken, 'researcher');
    
    await testCostCalculation(adminToken, 'admin');
    await testCostCalculation(researcherToken, 'researcher');
    
    await testTransactionHistory(adminToken, 'admin');
    await testTransactionHistory(researcherToken, 'researcher');
    
    await testUsageStats(adminToken, 'admin');
    await testUsageStats(researcherToken, 'researcher');
    
    // Admin-specific tests
    await testAdminOperations(adminToken);
    
    // Security tests
    await testSecurityPolicies(researcherToken);
    
    // Error handling tests
    await testErrorHandling();
    
    // Performance tests
    await runPerformanceTests(researcherToken);
    
    // Generate final report
    const report = await generateReport();
    
    log('=====================================');
    log('🎯 Test Suite Complete');
    log(`📊 Results: ${report.summary.passed} passed, ${report.summary.failed} failed`);
    log(`📈 Success Rate: ${report.summary.successRate}`);
    
    if (report.summary.failed === 0) {
      log('🎉 All tests passed! Points system is ready for deployment.', 'success');
    } else {
      log('⚠️  Some tests failed. Review the report and fix issues.', 'error');
    }
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
    testResults.errors.push(`Test suite exception: ${error.message}`);
  }
}

// Check if running as main module
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testResults,
  TEST_ACCOUNTS
};
