#!/usr/bin/env node

/**
 * 🔍 API Timeout Diagnostics Script
 * 
 * This script tests the research-consolidated API directly to identify
 * the root cause of the timeout issues identified in live testing.
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const LOCAL_URL = 'http://localhost:3003';
const TEST_RESEARCHER_EMAIL = 'abwanwr77+Researcher@gmail.com';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 API Timeout Diagnostics Starting...\n');

/**
 * Test Supabase connection directly
 */
async function testSupabaseConnection() {
  console.log('🗄️  Testing Supabase Connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const start = Date.now();
    const { data, error } = await supabase.from('studies').select('count').limit(1);
    const duration = Date.now() - start;
    
    if (error) {
      console.log('❌ Supabase Connection Error:', error.message);
      return false;
    }
    
    console.log(`✅ Supabase Connection Success (${duration}ms)`);
    return true;
  } catch (error) {
    console.log('❌ Supabase Connection Failed:', error.message);
    return false;
  }
}

/**
 * Test API endpoint directly
 */
async function testAPIEndpoint(baseUrl, endpoint, token = null) {
  console.log(`🔌 Testing ${baseUrl}/api/${endpoint}...`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-role': 'researcher'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const start = Date.now();
    const response = await fetch(`${baseUrl}/api/${endpoint}`, {
      method: 'GET',
      headers,
      timeout: 15000 // 15 second timeout
    });
    const duration = Date.now() - start;
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ API Success (${duration}ms) - Status: ${response.status}`);
      console.log(`📊 Response: ${JSON.stringify(result).substring(0, 100)}...`);
      return { success: true, duration, status: response.status };
    } else {
      console.log(`❌ API Error (${duration}ms) - Status: ${response.status}`);
      console.log(`📄 Error: ${JSON.stringify(result).substring(0, 200)}`);
      return { success: false, duration, status: response.status, error: result };
    }
  } catch (error) {
    console.log(`❌ API Request Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Get authentication token for testing
 */
async function getAuthToken() {
  console.log('🔐 Getting authentication token...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Sign in as test researcher
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_RESEARCHER_EMAIL,
      password: 'Testtest123'
    });
    
    if (error) {
      console.log('❌ Authentication failed:', error.message);
      return null;
    }
    
    console.log('✅ Authentication successful');
    return data.session.access_token;
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return null;
  }
}

/**
 * Run multiple tests to identify patterns
 */
async function runLoadTest(baseUrl, endpoint, token, iterations = 10) {
  console.log(`🚀 Running load test: ${iterations} iterations...`);
  
  const results = {
    successful: 0,
    failed: 0,
    timeouts: 0,
    durations: []
  };
  
  for (let i = 1; i <= iterations; i++) {
    process.stdout.write(`Test ${i}/${iterations}... `);
    
    const result = await testAPIEndpoint(baseUrl, endpoint, token);
    
    if (result.success) {
      results.successful++;
      results.durations.push(result.duration);
      console.log(`✅ (${result.duration}ms)`);
    } else {
      results.failed++;
      if (result.error && result.error.includes('timeout')) {
        results.timeouts++;
        console.log(`⏰ TIMEOUT`);
      } else {
        console.log(`❌ ERROR`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Calculate statistics
  const avgDuration = results.durations.length > 0 
    ? Math.round(results.durations.reduce((a, b) => a + b, 0) / results.durations.length)
    : 0;
    
  const successRate = Math.round((results.successful / iterations) * 100);
  
  console.log('\n📊 Load Test Results:');
  console.log(`   Success Rate: ${successRate}% (${results.successful}/${iterations})`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   Timeouts: ${results.timeouts}`);
  console.log(`   Average Duration: ${avgDuration}ms`);
  
  return results;
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log('=' .repeat(60));
  console.log('🔍 ResearchHub API Timeout Diagnostics');
  console.log('=' .repeat(60));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔗 Production URL: ${PRODUCTION_URL}`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);
  
  // Step 1: Test Supabase connection
  console.log('STEP 1: Supabase Connection Test');
  console.log('-' .repeat(40));
  const supabaseOk = await testSupabaseConnection();
  console.log('');
  
  if (!supabaseOk) {
    console.log('❌ Cannot proceed - Supabase connection failed');
    return;
  }
  
  // Step 2: Get authentication token
  console.log('STEP 2: Authentication');
  console.log('-' .repeat(40));
  const token = await getAuthToken();
  console.log('');
  
  if (!token) {
    console.log('⚠️  Proceeding without authentication token');
  }
  
  // Step 3: Test production API endpoints
  console.log('STEP 3: Production API Tests');
  console.log('-' .repeat(40));
  
  const endpoints = [
    'health',
    'research-consolidated?action=get-studies'
  ];
  
  for (const endpoint of endpoints) {
    await testAPIEndpoint(PRODUCTION_URL, endpoint, token);
  }
  console.log('');
  
  // Step 4: Load testing the problematic endpoint
  console.log('STEP 4: Load Test - Research API');
  console.log('-' .repeat(40));
  const loadResults = await runLoadTest(
    PRODUCTION_URL, 
    'research-consolidated?action=get-studies', 
    token, 
    15
  );
  
  // Step 5: Recommendations
  console.log('\nSTEP 5: Recommendations');
  console.log('-' .repeat(40));
  
  if (loadResults.timeouts > 0) {
    console.log('🔥 CRITICAL: Timeout issues detected');
    console.log('   Recommendations:');
    console.log('   1. Check Vercel function memory limits');
    console.log('   2. Optimize database queries in research-consolidated.js');
    console.log('   3. Consider upgrading to Vercel Pro for better performance');
    console.log('   4. Implement circuit breaker pattern');
  }
  
  if (loadResults.successful / 15 < 0.8) {
    console.log('⚠️  WARNING: Success rate below 80%');
    console.log('   Platform may not be ready for production');
  } else if (loadResults.successful / 15 > 0.9) {
    console.log('✅ SUCCESS: High success rate - platform performing well');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Diagnostics Complete');
  console.log('=' .repeat(60));
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostics failed:', error);
  process.exit(1);
});