#!/usr/bin/env node

/**
 * API Contract Monitor Script
 * 
 * This script can be run to check if the studies API is returning
 * the correct format. Can be added to CI/CD pipeline or cron jobs.
 */

import https from 'https';

const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const TEST_ENDPOINT = '/api/research-consolidated?action=get-studies';

// Test account credentials for automated testing
const TEST_CREDENTIALS = {
  email: 'abwanwr77+researcher@gmail.com',
  password: 'Testtest123'
};

async function checkAPIContract() {
  console.log('🔍 Starting API Contract Monitor...');
  console.log(`📍 Testing: ${PRODUCTION_URL}${TEST_ENDPOINT}`);
  
  try {
    // Step 1: Login to get token
    console.log('🔐 Authenticating with test account...');
    const token = await getAuthToken();
    
    // Step 2: Test the studies API
    console.log('📡 Testing studies API endpoint...');
    const response = await testStudiesAPI(token);
    
    // Step 3: Validate response format
    console.log('✅ Validating response format...');
    const validation = validateResponse(response);
    
    if (validation.isValid) {
      console.log('🎉 SUCCESS: API contract validation passed!');
      console.log(`📊 Found ${validation.studiesCount} studies with correct format`);
      process.exit(0);
    } else {
      console.error('❌ FAILURE: API contract validation failed!');
      console.error('🐛 This will cause the studies page to show empty state bug!');
      console.error('📋 Issues found:', validation.issues);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error('🚨 API contract monitoring failed!');
    process.exit(1);
  }
}

async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password
    });
    
    const options = {
      hostname: 'researchhub-saas.vercel.app',
      path: '/api/auth-consolidated?action=login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.success && result.session && result.session.access_token) {
            resolve(result.session.access_token);
          } else if (result.success && result.data && result.data.token) {
            resolve(result.data.token);
          } else {
            reject(new Error('Authentication failed: No token found in response'));
          }
        } catch (e) {
          reject(new Error('Failed to parse auth response: ' + e.message));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testStudiesAPI(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'researchhub-saas.vercel.app',
      path: TEST_ENDPOINT,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse API response: ' + e.message));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function validateResponse(response) {
  const issues = [];
  
  // Check basic structure
  if (!response || typeof response !== 'object') {
    issues.push('Response is not an object');
  }
  
  if (response.success !== true) {
    issues.push('Response does not have success: true');
  }
  
  // Check for correct format
  if (!Array.isArray(response.studies)) {
    issues.push('Response does not have studies array');
  }
  
  if (!response.pagination || typeof response.pagination !== 'object') {
    issues.push('Response does not have pagination object');
  }
  
  // Check for legacy format (causes bug)
  if ('data' in response) {
    issues.push('CRITICAL: Response has legacy "data" field - this will cause empty state bug!');
  }
  
  if ('count' in response) {
    issues.push('CRITICAL: Response has legacy "count" field - this will cause empty state bug!');
  }
  
  // Check pagination fields
  if (response.pagination) {
    const requiredFields = ['currentPage', 'totalPages', 'totalStudies', 'hasNext', 'hasPrev'];
    for (const field of requiredFields) {
      if (!(field in response.pagination)) {
        issues.push(`Pagination missing required field: ${field}`);
      }
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    studiesCount: response.studies ? response.studies.length : 0,
    responseKeys: Object.keys(response || {}),
    hasLegacyFormat: 'data' in response || 'count' in response
  };
}

// Run the monitor
checkAPIContract();

export { checkAPIContract, validateResponse };