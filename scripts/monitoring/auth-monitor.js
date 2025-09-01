#!/usr/bin/env node

/**
 * Authentication Monitoring Script
 * Ensures authentication fixes remain working and catch regressions early
 * Run this script regularly to validate user flow integrity
 */

import https from 'https';
import fs from 'fs';

const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const TEST_USER_ID = '4c3d798b-2975-4ec4-b9e2-c6f128b8a066';
const TEST_EMAIL = 'mohmmed.wakid@gmail.com';

// Generate fallback token for testing
const generateTestToken = () => {
  return `fallback-token-${TEST_USER_ID}-researcher-${encodeURIComponent(TEST_EMAIL)}`;
};

// Make HTTP request helper
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

// Test authentication fixes
async function runAuthenticationTests() {
  console.log('🔍 Running Authentication Monitoring Tests...');
  console.log(`📍 Testing: ${PRODUCTION_URL}`);
  console.log(`🕒 Time: ${new Date().toISOString()}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    overall: 'PASS',
    issues: []
  };
  
  const token = generateTestToken();
  
  try {
    // Test 1: Create Study with Authentication
    console.log('\n1️⃣ Testing Study Creation with UUID Authentication...');
    const createResponse = await makeRequest(`${PRODUCTION_URL}/api/research-consolidated?action=create-study`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: `Monitor Test ${Date.now()}`,
        description: 'Automated monitoring test for authentication fixes',
        type: 'usability'
      })
    });
    
    const createTest = createResponse.status === 201 && createResponse.data.success;
    results.tests.create_study = {
      status: createTest ? 'PASS' : 'FAIL',
      details: {
        responseStatus: createResponse.status,
        hasSuccess: !!createResponse.data.success,
        hasValidUserId: createResponse.data.study?.researcher_id === TEST_USER_ID
      }
    };
    
    if (!createTest) {
      results.issues.push('Study creation failed - authentication may be broken');
      results.overall = 'FAIL';
    } else {
      console.log('✅ Study creation: PASS');
    }
    
    // Test 2: Load Studies for Researcher
    console.log('\n2️⃣ Testing Study Loading with Researcher Authentication...');
    const loadResponse = await makeRequest(`${PRODUCTION_URL}/api/research-consolidated?action=get-studies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const loadTest = loadResponse.status === 200 && loadResponse.data.studies && loadResponse.data.studies.length > 0;
    results.tests.load_studies = {
      status: loadTest ? 'PASS' : 'FAIL',
      details: {
        responseStatus: loadResponse.status,
        studiesFound: loadResponse.data.studies?.length || 0,
        hasFilteredResults: loadResponse.data.studies?.every(s => s.researcher_id === TEST_USER_ID)
      }
    };
    
    if (!loadTest) {
      results.issues.push('Study loading failed - researcher filtering may be broken');
      results.overall = 'FAIL';
    } else {
      console.log('✅ Study loading: PASS');
    }
    
    // Test 3: View Results with Authentication
    console.log('\n3️⃣ Testing Results Viewing with Authentication...');
    const studyId = createResponse.data.study?.id || loadResponse.data.studies?.[0]?.id;
    
    if (studyId) {
      const resultsResponse = await makeRequest(`${PRODUCTION_URL}/api/research-consolidated?action=get-study-results&id=${studyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const resultsTest = resultsResponse.status === 200 && resultsResponse.data.success;
      results.tests.view_results = {
        status: resultsTest ? 'PASS' : 'FAIL',
        details: {
          responseStatus: resultsResponse.status,
          hasSuccess: !!resultsResponse.data.success,
          hasAnalytics: !!resultsResponse.data.analytics
        }
      };
      
      if (!resultsTest) {
        results.issues.push('Results viewing failed - authentication may be broken');
        results.overall = 'FAIL';
      } else {
        console.log('✅ Results viewing: PASS');
      }
    } else {
      results.tests.view_results = {
        status: 'SKIP',
        details: { reason: 'No study ID available for testing' }
      };
    }
    
    // Test 4: UUID Parsing Validation
    console.log('\n4️⃣ Testing UUID Parsing Integrity...');
    const uuidTest = token.includes(TEST_USER_ID) && createResponse.data.study?.researcher_id === TEST_USER_ID;
    results.tests.uuid_parsing = {
      status: uuidTest ? 'PASS' : 'FAIL',
      details: {
        tokenContainsFullUuid: token.includes(TEST_USER_ID),
        studyHasCorrectUserId: createResponse.data.study?.researcher_id === TEST_USER_ID,
        expectedUserId: TEST_USER_ID,
        actualUserId: createResponse.data.study?.researcher_id
      }
    };
    
    if (!uuidTest) {
      results.issues.push('UUID parsing failed - fallback token parsing may be broken');
      results.overall = 'FAIL';
    } else {
      console.log('✅ UUID parsing: PASS');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    results.overall = 'ERROR';
    results.issues.push(`Test execution error: ${error.message}`);
  }
  
  // Generate Report
  console.log('\n📊 AUTHENTICATION MONITORING REPORT');
  console.log('=====================================');
  console.log(`Overall Status: ${results.overall === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Tests Run: ${Object.keys(results.tests).length}`);
  console.log(`Timestamp: ${results.timestamp}`);
  
  if (results.issues.length > 0) {
    console.log('\n🚨 ISSUES DETECTED:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log('\n📋 Test Details:');
  Object.entries(results.tests).forEach(([test, result]) => {
    console.log(`${test}: ${result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'} ${result.status}`);
  });
  
  // Save results to file
  const reportFile = `auth-monitor-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Report saved: ${reportFile}`);
  
  // Exit with appropriate code
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

// Run if called directly
runAuthenticationTests().catch(error => {
  console.error('❌ Monitoring script failed:', error);
  process.exit(1);
});

export { runAuthenticationTests };
