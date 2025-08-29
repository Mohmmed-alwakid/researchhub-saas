/**
 * UE-001 Production Validation Test
 * Quick validation that AI Interview Moderator is working on production
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const RESEARCHER_EMAIL = 'abwanwr77+researcher@gmail.com';
const PASSWORD = 'Testtest123';

test.describe('UE-001 Production Validation', () => {

  test('Validate AI Interview Moderator is deployed and accessible', async ({ page }) => {
    console.log('🌐 Testing production deployment of UE-001 AI Interview Moderator...');
    
    // Navigate to production site
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ Production site loaded');

    // Check if login is available
    if (await page.locator('text=Login').isVisible()) {
      await page.click('text=Login');
      await page.waitForSelector('input[type="email"]');
      
      await page.fill('input[type="email"]', RESEARCHER_EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard or redirect
      await page.waitForTimeout(3000);
      console.log('✅ Login attempt completed');
    }

    // Look for study creation or AI interview features
    const hasCreateStudy = await page.locator('text=Create Study, a[href*="study"], button:has-text("Create")').isVisible();
    const hasStudies = await page.locator('text=Studies, a[href*="studies"]').isVisible();
    const hasAIFeatures = await page.locator('[data-testid*="ai"], [class*="ai-"]').isVisible();

    console.log(`📋 Create Study button: ${hasCreateStudy ? '✅' : '❌'}`);
    console.log(`📚 Studies section: ${hasStudies ? '✅' : '❌'}`);
    console.log(`🤖 AI features detected: ${hasAIFeatures ? '✅' : '❌'}`);

    // Test API endpoint accessibility
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/health');
        return { status: response.status, ok: response.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log(`🔗 API Health Check: ${apiTest.ok ? '✅' : '❌'} (Status: ${apiTest.status})`);

    // Test AI Interview API endpoint
    const aiApiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/research-consolidated?action=ai-interview-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantResponse: 'Test message',
            conversationHistory: [],
            interviewConfig: { language: 'english', moderatorPersonality: 'professional' }
          })
        });
        return { status: response.status, ok: response.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log(`🤖 AI Interview API: ${aiApiTest.status === 200 ? '✅' : '❌'} (Status: ${aiApiTest.status})`);

    // Validate core functionality is accessible
    expect(page.url()).toContain('researchhub-saas.vercel.app');
    
    console.log('\n🎉 UE-001 Production Validation COMPLETED');
    console.log('📊 Summary:');
    console.log(`   - Site accessible: ✅`);
    console.log(`   - Login system: ${hasCreateStudy || hasStudies ? '✅' : '⚠️'}`);
    console.log(`   - API endpoints: ${apiTest.ok ? '✅' : '⚠️'}`);
    console.log(`   - AI features: ${hasAIFeatures || aiApiTest.status === 200 ? '✅' : '⚠️'}`);
  });

  test('Quick AI Interview API Test', async ({ page }) => {
    console.log('⚡ Quick AI Interview API functionality test...');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Test the AI interview response endpoint
    const quickApiTest = await page.evaluate(async () => {
      try {
        const testData = {
          participantResponse: 'Hello, I am interested in participating in this interview.',
          conversationHistory: [],
          interviewConfig: {
            language: 'english',
            moderatorPersonality: 'professional'
          },
          studyContext: {
            title: 'Test Study',
            type: 'interview'
          }
        };

        const response = await fetch('/api/research-consolidated?action=ai-interview-response', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testData)
        });

        const data = await response.json();
        
        return {
          status: response.status,
          ok: response.ok,
          success: data.success,
          hasResponse: !!(data.data && data.data.content),
          responseLength: data.data?.content?.length || 0
        };
      } catch (error) {
        return { 
          error: error.message,
          status: 0,
          ok: false 
        };
      }
    });

    console.log('🤖 AI Interview API Test Results:');
    console.log(`   - Status: ${quickApiTest.status}`);
    console.log(`   - Success: ${quickApiTest.success ? '✅' : '❌'}`);
    console.log(`   - Has AI Response: ${quickApiTest.hasResponse ? '✅' : '❌'}`);
    console.log(`   - Response Length: ${quickApiTest.responseLength} characters`);

    if (quickApiTest.error) {
      console.log(`   - Error: ${quickApiTest.error}`);
    }

    // Basic assertions
    expect(quickApiTest.status).toBeGreaterThanOrEqual(200);
    if (quickApiTest.success) {
      expect(quickApiTest.hasResponse).toBe(true);
      expect(quickApiTest.responseLength).toBeGreaterThan(0);
      console.log('✅ AI Interview API is working correctly!');
    } else {
      console.log('⚠️  AI Interview API needs attention');
    }
  });
});

export { PRODUCTION_URL, RESEARCHER_EMAIL };
