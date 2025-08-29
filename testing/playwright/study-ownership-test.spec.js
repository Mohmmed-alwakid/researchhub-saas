/**
 * Study Ownership and Filtering Test
 * Tests the issue where:
 * 1. User creates a study but can't find it in studies page
 * 2. User sees studies they didn't create
 */

import { test, expect } from '@playwright/test';

// Test configuration - use production site to match user's issue
const BASE_URL = 'https://researchhub-saas.vercel.app';
const RESEARCHER_EMAIL = 'abwanwr77+researcher@gmail.com';
const PASSWORD = 'Testtest123';

test.describe('Study Ownership and Filtering Issues', () => {
  test('Researcher should see only their own studies after creating one', async ({ page }) => {
    console.log('🚀 Testing study ownership and filtering on production site');

    try {
      // Navigate to login page
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Login as researcher
      console.log('🔐 Logging in as researcher...');
      await page.click('text=Login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', RESEARCHER_EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for successful login
      await page.waitForSelector('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard")', { timeout: 15000 });
      console.log('✅ Researcher login successful');

      // Navigate to studies page to see current state
      console.log('📋 Checking current studies page...');
      await page.goto(`${BASE_URL}/app/studies`);
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot of current studies
      await page.screenshot({ path: 'testing/screenshots/studies-before-creation.png' });
      
      // Count current studies
      const studiesBefore = await page.locator('[data-testid="study-card"], .study-item, .study-card').count();
      console.log(`📊 Studies visible before creation: ${studiesBefore}`);
      
      // Get titles of current studies for comparison
      const studyTitlesBefore = await page.locator('[data-testid="study-title"], .study-title, h3').allTextContents();
      console.log('📝 Current study titles:', studyTitlesBefore);

      // Create a new study
      console.log('➕ Creating a new study...');
      await page.click('text=Create New Study', { timeout: 10000 });
      
      // Wait for study creation modal/page
      await page.waitForSelector('input[name="title"], input[placeholder*="title"]', { timeout: 10000 });
      
      const uniqueTitle = `Test Study ${Date.now()}`;
      await page.fill('input[name="title"], input[placeholder*="title"]', uniqueTitle);
      await page.fill('textarea[name="description"], textarea[placeholder*="description"]', 'This is a test study to verify ownership filtering.');
      
      // Submit the study creation form
      await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
      
      // Wait for study to be created (might redirect to builder or back to list)
      await page.waitForTimeout(3000);
      console.log(`✅ Study created with title: ${uniqueTitle}`);

      // Navigate back to studies page to verify it appears
      console.log('🔍 Checking if new study appears in studies list...');
      await page.goto(`${BASE_URL}/app/studies`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Give time for data to load
      
      // Take screenshot after creation
      await page.screenshot({ path: 'testing/screenshots/studies-after-creation.png' });
      
      // Count studies after creation
      const studiesAfter = await page.locator('[data-testid="study-card"], .study-item, .study-card').count();
      console.log(`📊 Studies visible after creation: ${studiesAfter}`);
      
      // Get titles after creation
      const studyTitlesAfter = await page.locator('[data-testid="study-title"], .study-title, h3').allTextContents();
      console.log('📝 Study titles after creation:', studyTitlesAfter);
      
      // Check if the new study is in the list
      const newStudyVisible = studyTitlesAfter.some(title => title.includes(uniqueTitle));
      console.log(`🎯 New study "${uniqueTitle}" visible: ${newStudyVisible}`);
      
      // Analyze unexpected studies
      const unexpectedStudies = studyTitlesAfter.filter(title => 
        title !== uniqueTitle && 
        !title.includes('E-commerce') && 
        !title.includes('Demo')
      );
      console.log('⚠️ Unexpected studies (not created by this researcher):', unexpectedStudies);
      
      // Test API directly to see what's being returned
      console.log('🔗 Testing API directly...');
      const apiResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/research-consolidated?action=get-studies');
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      console.log('📡 API Response:', JSON.stringify(apiResponse, null, 2));
      
      // Generate detailed report
      const report = {
        testTimestamp: new Date().toISOString(),
        researcherEmail: RESEARCHER_EMAIL,
        createdStudyTitle: uniqueTitle,
        studiesCountBefore: studiesBefore,
        studiesCountAfter: studiesAfter,
        studyTitlesBefore,
        studyTitlesAfter,
        newStudyVisible,
        unexpectedStudies,
        apiResponse
      };
      
      console.log('📊 DETAILED TEST REPORT:');
      console.log(JSON.stringify(report, null, 2));
      
      // Assertions
      if (!newStudyVisible) {
        throw new Error(`❌ ISSUE CONFIRMED: Created study "${uniqueTitle}" is not visible in studies list`);
      }
      
      if (unexpectedStudies.length > 0) {
        console.log(`⚠️ WARNING: Found ${unexpectedStudies.length} unexpected studies that may belong to other users`);
      }
      
      console.log('✅ Test completed successfully');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await page.screenshot({ path: 'testing/screenshots/test-failure.png' });
      throw error;
    }
  });
});
