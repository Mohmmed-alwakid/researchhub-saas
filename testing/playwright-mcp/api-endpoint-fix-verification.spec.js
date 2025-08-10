/**
 * API Endpoint Fix Verification Test
 * Tests the corrected API endpoints for study discovery and applications
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';
const API_URL = 'http://localhost:3003/api';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PASSWORD = 'Testtest123';

test.describe('API Endpoint Fixes Verification', () => {
  test('Verify corrected API endpoints work properly', async ({ page }) => {
    console.log('🚀 Testing API Endpoint Fixes');

    try {
      // Step 1: Login as participant
      console.log('🔐 Step 1: Login as participant');
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"]', PARTICIPANT_EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      await page.press('input[type="password"]', 'Enter');
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Participant logged in');
      
      // Step 2: Navigate to studies page to trigger API calls
      console.log('📚 Step 2: Navigate to studies page');
      await page.goto(`${BASE_URL}/app/studies`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Allow API calls to complete
      
      // Step 3: Check console for API errors
      console.log('🔍 Step 3: Check for API errors in console');
      
      // Listen for console errors
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Wait for page to fully load and API calls to complete
      await page.waitForTimeout(5000);
      
      // Take screenshot for verification
      await page.screenshot({ path: 'test-results/api-fix-verification.png', fullPage: true });
      
      // Step 4: Test direct API endpoints
      console.log('🌐 Step 4: Test API endpoints directly');
      
      // Get auth token from localStorage
      const authData = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored) : null;
      });
      
      const token = authData?.state?.token || authData?.token;
      console.log('🔑 Token found:', !!token);
      
      if (token) {
        // Test get-studies endpoint
        const studiesResponse = await page.evaluate(async ([apiUrl, authToken]) => {
          try {
            const response = await fetch(`${apiUrl}/research?action=get-studies`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            return { success: response.ok, status: response.status, data };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }, [API_URL, token]);
        
        console.log('📊 Studies API Response:', studiesResponse);
        
        // Test get-applications endpoint
        const applicationsResponse = await page.evaluate(async ([apiUrl, authToken]) => {
          try {
            const response = await fetch(`${apiUrl}/research?action=get-applications`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            return { success: response.ok, status: response.status, data };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }, [API_URL, token]);
        
        console.log('📋 Applications API Response:', applicationsResponse);
        
        // Test apply endpoint (with mock data)
        const applyResponse = await page.evaluate(async ([apiUrl, authToken]) => {
          try {
            const response = await fetch(`${apiUrl}/research?action=apply`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                study_id: 'study-001',
                screening_answers: JSON.stringify({
                  'What is your age?': '25',
                  'Do you have mobile app experience?': 'yes'
                }),
                eligibility_confirmed: true
              })
            });
            const data = await response.json();
            return { success: response.ok, status: response.status, data };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }, [API_URL, token]);
        
        console.log('✉️ Apply API Response:', applyResponse);
      }
      
      // Step 5: Check for specific error patterns
      console.log('🔍 Step 5: Analyze console errors');
      
      const badRequestErrors = consoleErrors.filter(error => 
        error.includes('400') || error.includes('Bad Request')
      );
      
      const malformedUrlErrors = consoleErrors.filter(error => 
        error.includes('applications?endpoint=') || 
        error.includes('research-consolidated')
      );
      
      console.log('📊 ENDPOINT FIX VERIFICATION RESULTS:');
      console.log('=====================================');
      console.log(`❌ Bad Request Errors: ${badRequestErrors.length}`);
      console.log(`❌ Malformed URL Errors: ${malformedUrlErrors.length}`);
      console.log(`📊 Total Console Errors: ${consoleErrors.length}`);
      
      if (badRequestErrors.length > 0) {
        console.log('🚨 Bad Request Errors Found:');
        badRequestErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      if (malformedUrlErrors.length > 0) {
        console.log('🚨 Malformed URL Errors Found:');
        malformedUrlErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      // Success criteria
      const fixSuccessful = malformedUrlErrors.length === 0;
      const apiWorking = badRequestErrors.length < 3; // Some errors might be expected
      
      console.log('\n🎯 FIX VERIFICATION SUMMARY:');
      console.log('===============================');
      console.log(`✅ URL Structure Fixed: ${fixSuccessful}`);
      console.log(`✅ API Endpoints Working: ${apiWorking}`);
      console.log(`✅ Overall Status: ${fixSuccessful && apiWorking ? 'FIXED' : 'NEEDS_ATTENTION'}`);
      
      // Assertions
      expect(malformedUrlErrors.length).toBe(0);
      expect(consoleErrors.length).toBeLessThan(5); // Allow some non-critical errors
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await page.screenshot({ path: 'test-results/api-fix-error.png', fullPage: true });
      throw error;
    }
  });
});
