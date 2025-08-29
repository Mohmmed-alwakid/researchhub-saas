/**
 * Debug UE-001 AI Interview API
 * Test script to debug production API issues
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';

test('Debug AI Interview API Configuration', async ({ page }) => {
  console.log('🔍 Debugging UE-001 AI Interview API configuration...');
  
  await page.goto(PRODUCTION_URL);
  await page.waitForLoadState('networkidle');

  // Test with detailed error logging
  const debugTest = await page.evaluate(async () => {
    try {
      console.log('Testing AI Interview API endpoint...');
      
      const response = await fetch('/api/research-consolidated?action=ai-interview-response', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          participantResponse: 'Hello, test message',
          conversationHistory: [],
          interviewConfig: {
            language: 'english',
            moderatorPersonality: 'professional'
          }
        })
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { error: 'Invalid JSON response', rawResponse: responseText };
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        success: response.ok
      };
    } catch (error) {
      return { 
        error: error.message,
        stack: error.stack 
      };
    }
  });

  console.log('🔍 API Debug Results:');
  console.log('Status:', debugTest.status);
  console.log('Status Text:', debugTest.statusText);
  console.log('Headers:', JSON.stringify(debugTest.headers, null, 2));
  console.log('Response Data:', JSON.stringify(debugTest.data, null, 2));
  
  if (debugTest.error) {
    console.log('Error:', debugTest.error);
    console.log('Stack:', debugTest.stack);
  }

  // Test basic API health
  const healthTest = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.text();
      return { status: response.status, data };
    } catch (error) {
      return { error: error.message };
    }
  });

  console.log('🔍 Health Check:', healthTest);

  // Test if environment variables are available (from client perspective)
  const envTest = await page.evaluate(() => {
    // Note: Client-side can only see public env vars
    return {
      nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'undefined',
      vercelEnv: typeof process !== 'undefined' ? process.env.VERCEL_ENV : 'undefined'
    };
  });

  console.log('🔍 Environment:', envTest);

  // Create a basic test endpoint to check server-side environment
  const serverEnvTest = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/research-consolidated?action=dashboard-analytics');
      return { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText
      };
    } catch (error) {
      return { error: error.message };
    }
  });

  console.log('🔍 Server API Test:', serverEnvTest);

  console.log('\n📊 SUMMARY:');
  console.log(`- Production Site: ${debugTest.status ? '✅' : '❌'}`);
  console.log(`- AI Interview API: ${debugTest.status === 200 ? '✅' : '❌'} (${debugTest.status})`);
  console.log(`- Health Check: ${healthTest.status === 200 ? '✅' : '❌'}`);
  console.log(`- Server APIs: ${serverEnvTest.ok ? '✅' : '❌'}`);
  
  if (debugTest.data && debugTest.data.error) {
    console.log(`- Error Message: ${debugTest.data.error}`);
  }
});

test('Test Alternative API Endpoints', async ({ page }) => {
  console.log('🧪 Testing alternative API endpoints...');
  
  await page.goto(PRODUCTION_URL);
  await page.waitForLoadState('networkidle');

  // Test other research API endpoints
  const endpoints = [
    'get-studies',
    'dashboard-analytics',
    'ai-study-suggestions'
  ];

  for (const endpoint of endpoints) {
    const result = await page.evaluate(async (action) => {
      try {
        const response = await fetch(`/api/research-consolidated?action=${action}`, {
          method: action === 'ai-study-suggestions' ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: action === 'ai-study-suggestions' ? JSON.stringify({
            researchGoals: 'Test user experience',
            industry: 'Technology'
          }) : undefined
        });
        
        const data = await response.text();
        return { 
          action,
          status: response.status, 
          ok: response.ok,
          dataLength: data.length,
          sample: data.substring(0, 200)
        };
      } catch (error) {
        return { action, error: error.message };
      }
    }, endpoint);

    console.log(`📡 ${endpoint}:`, result);
  }

  console.log('\n✅ Alternative endpoint testing completed');
});
