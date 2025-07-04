// Comprehensive E2E Test Suite
// Tests complete user workflows from start to finish

import { test, expect } from '@playwright/test';
import { testingConfig } from '../config/testing.config.js';

class ComprehensiveE2ETestSuite {
  constructor() {
    this.config = testingConfig;
    this.baseUrl = this.config.environments.local.baseUrl;
  }

  // Helper method to login as specific user
  async loginAs(page, role) {
    const account = this.config.testAccounts[role];
    await page.goto(`${this.baseUrl}/login`);
    await page.fill('[data-testid="email"]', account.email);
    await page.fill('[data-testid="password"]', account.password);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('**/dashboard');
    return account;
  }

  // Helper method to create test study
  async createTestStudy(page, studyData) {
    await page.click('[data-testid="create-study-button"]');
    await page.fill('[data-testid="study-title"]', studyData.title);
    await page.fill('[data-testid="study-description"]', studyData.description);
    await page.selectOption('[data-testid="study-type"]', studyData.type);
    
    // Add blocks to study
    for (const block of studyData.blocks) {
      await page.click('[data-testid="add-block-button"]');
      await page.selectOption('[data-testid="block-type"]', block.type);
      await page.fill('[data-testid="block-title"]', block.title);
      await page.click('[data-testid="save-block"]');
    }
    
    await page.click('[data-testid="publish-study"]');
    await page.waitForSelector('[data-testid="study-published-message"]');
    
    return studyData;
  }

  // Helper method to apply to study as participant
  async applyToStudy(page, studyId) {
    await page.goto(`${this.baseUrl}/studies/${studyId}`);
    await page.click('[data-testid="apply-to-study"]');
    await page.fill('[data-testid="application-motivation"]', 'I am interested in participating in this study');
    await page.click('[data-testid="submit-application"]');
    await page.waitForSelector('[data-testid="application-submitted-message"]');
  }

  // Helper method to approve application as researcher
  async approveApplication(page, applicationId) {
    await page.goto(`${this.baseUrl}/applications/${applicationId}`);
    await page.click('[data-testid="approve-application"]');
    await page.waitForSelector('[data-testid="application-approved-message"]');
  }
}

test.describe('Comprehensive E2E Test Suite', () => {
  const e2eSuite = new ComprehensiveE2ETestSuite();

  test('Complete Study Creation and Execution Workflow', async ({ page }) => {
    // Step 1: Login as researcher
    console.log('🔐 Logging in as researcher...');
    await e2eSuite.loginAs(page, 'researcher');
    
    // Step 2: Create a new study
    console.log('📝 Creating new study...');
    const studyData = {
      title: 'E2E Test Study - ' + Date.now(),
      description: 'Comprehensive test study for E2E testing',
      type: 'usability',
      blocks: [
        { type: 'welcome-screen', title: 'Welcome to our study' },
        { type: 'open-question', title: 'What is your first impression?' },
        { type: 'opinion-scale', title: 'Rate your experience' },
        { type: 'thank-you', title: 'Thank you for participating' }
      ]
    };
    
    const createdStudy = await e2eSuite.createTestStudy(page, studyData);
    
    // Step 3: Verify study appears in dashboard
    console.log('✅ Verifying study in dashboard...');
    await page.goto(`${e2eSuite.baseUrl}/dashboard`);
    await expect(page.locator(`text=${createdStudy.title}`)).toBeVisible();
    
    // Step 4: Get study ID for participant application
    const studyElement = page.locator(`text=${createdStudy.title}`).first();
    const studyId = await studyElement.getAttribute('data-study-id');
    
    // Step 5: Login as participant in new context
    console.log('👤 Switching to participant...');
    const participantContext = await page.context().browser().newContext();
    const participantPage = await participantContext.newPage();
    
    await e2eSuite.loginAs(participantPage, 'participant');
    
    // Step 6: Apply to study
    console.log('📋 Applying to study...');
    await e2eSuite.applyToStudy(participantPage, studyId);
    
    // Step 7: Switch back to researcher to approve
    console.log('✅ Approving application...');
    await page.goto(`${e2eSuite.baseUrl}/applications`);
    await page.click('[data-testid="pending-applications-tab"]');
    
    const applicationElement = page.locator('[data-testid="application-item"]').first();
    await applicationElement.click();
    await page.click('[data-testid="approve-application"]');
    await page.waitForSelector('[data-testid="application-approved-message"]');
    
    // Step 8: Participant completes study
    console.log('🎯 Completing study as participant...');
    await participantPage.goto(`${e2eSuite.baseUrl}/my-studies`);
    await participantPage.click(`[data-study-id="${studyId}"] [data-testid="start-study"]`);
    
    // Complete each block
    for (const block of studyData.blocks) {
      if (block.type === 'welcome-screen') {
        await participantPage.click('[data-testid="continue-button"]');
      } else if (block.type === 'open-question') {
        await participantPage.fill('[data-testid="open-question-input"]', 'This is my response to the open question');
        await participantPage.click('[data-testid="submit-response"]');
      } else if (block.type === 'opinion-scale') {
        await participantPage.click('[data-testid="rating-4"]');
        await participantPage.click('[data-testid="submit-response"]');
      } else if (block.type === 'thank-you') {
        await participantPage.click('[data-testid="finish-study"]');
      }
      
      await participantPage.waitForTimeout(1000);
    }
    
    // Step 9: Verify completion
    console.log('🎉 Verifying study completion...');
    await expect(participantPage.locator('[data-testid="study-completed-message"]')).toBeVisible();
    
    // Step 10: Researcher reviews results
    console.log('📊 Reviewing results as researcher...');
    await page.goto(`${e2eSuite.baseUrl}/studies/${studyId}/results`);
    await expect(page.locator('[data-testid="participant-responses"]')).toBeVisible();
    await expect(page.locator('text=This is my response to the open question')).toBeVisible();
    
    // Cleanup
    await participantContext.close();
  });

  test('Multi-User Collaboration Workflow', async ({ page }) => {
    // Test multiple researchers collaborating on a study
    console.log('👥 Testing multi-user collaboration...');
    
    // Login as first researcher
    await e2eSuite.loginAs(page, 'researcher');
    
    // Create collaborative study
    const studyData = {
      title: 'Collaborative Study - ' + Date.now(),
      description: 'Study for testing collaboration features',
      type: 'survey',
      blocks: [
        { type: 'welcome-screen', title: 'Welcome' },
        { type: 'multiple-choice', title: 'Choose your preference' }
      ]
    };
    
    await e2eSuite.createTestStudy(page, studyData);
    
    // Invite collaborator (would be implemented in real system)
    await page.click('[data-testid="study-settings"]');
    await page.click('[data-testid="invite-collaborator"]');
    await page.fill('[data-testid="collaborator-email"]', 'collaborator@example.com');
    await page.click('[data-testid="send-invitation"]');
    
    // Verify collaboration features
    await expect(page.locator('[data-testid="collaborator-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="collaboration-status"]')).toContainText('Active');
  });

  test('Error Handling and Recovery', async ({ page }) => {
    // Test system behavior under error conditions
    console.log('🚨 Testing error handling...');
    
    await e2eSuite.loginAs(page, 'researcher');
    
    // Test network failure simulation
    await page.route('**/api/studies', route => route.abort());
    await page.click('[data-testid="create-study-button"]');
    await page.fill('[data-testid="study-title"]', 'Test Study');
    await page.click('[data-testid="save-study"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to save study');
    
    // Test recovery
    await page.unroute('**/api/studies');
    await page.click('[data-testid="retry-button"]');
    await page.waitForSelector('[data-testid="study-saved-message"]');
  });

  test('Performance Under Load', async ({ page }) => {
    // Test system performance with multiple operations
    console.log('⚡ Testing performance under load...');
    
    await e2eSuite.loginAs(page, 'researcher');
    
    // Create multiple studies rapidly
    const studyPromises = [];
    for (let i = 0; i < 5; i++) {
      studyPromises.push(
        e2eSuite.createTestStudy(page, {
          title: `Load Test Study ${i}`,
          description: `Study ${i} for load testing`,
          type: 'usability',
          blocks: [
            { type: 'welcome-screen', title: 'Welcome' },
            { type: 'thank-you', title: 'Thank you' }
          ]
        })
      );
    }
    
    // Execute all study creations
    const startTime = Date.now();
    await Promise.all(studyPromises);
    const endTime = Date.now();
    
    // Verify performance is acceptable
    const totalTime = endTime - startTime;
    console.log(`Load test completed in ${totalTime}ms`);
    expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
    
    // Verify all studies were created
    await page.goto(`${e2eSuite.baseUrl}/dashboard`);
    for (let i = 0; i < 5; i++) {
      await expect(page.locator(`text=Load Test Study ${i}`)).toBeVisible();
    }
  });

  test('Data Consistency and Integrity', async ({ page }) => {
    // Test data consistency across operations
    console.log('🔍 Testing data consistency...');
    
    await e2eSuite.loginAs(page, 'researcher');
    
    // Create study with specific data
    const studyData = {
      title: 'Data Consistency Test',
      description: 'Testing data integrity',
      type: 'interview',
      blocks: [
        { type: 'welcome-screen', title: 'Welcome' },
        { type: 'open-question', title: 'Tell us about yourself' },
        { type: 'thank-you', title: 'Thank you' }
      ]
    };
    
    await e2eSuite.createTestStudy(page, studyData);
    
    // Verify data in different views
    await page.goto(`${e2eSuite.baseUrl}/dashboard`);
    await expect(page.locator(`text=${studyData.title}`)).toBeVisible();
    
    // Check study details page
    await page.click(`text=${studyData.title}`);
    await expect(page.locator('[data-testid="study-description"]')).toContainText(studyData.description);
    await expect(page.locator('[data-testid="study-type"]')).toContainText(studyData.type);
    
    // Verify blocks are correctly saved
    for (const block of studyData.blocks) {
      await expect(page.locator(`text=${block.title}`)).toBeVisible();
    }
    
    // Test data persistence after page refresh
    await page.reload();
    await expect(page.locator('[data-testid="study-description"]')).toContainText(studyData.description);
  });

  test('Cross-Browser Compatibility', async ({ browserName, page }) => {
    // Test key functionality across different browsers
    console.log(`🌐 Testing cross-browser compatibility on ${browserName}...`);
    
    await e2eSuite.loginAs(page, 'researcher');
    
    // Test basic functionality works in all browsers
    await page.click('[data-testid="create-study-button"]');
    await page.fill('[data-testid="study-title"]', `Cross-Browser Test - ${browserName}`);
    await page.fill('[data-testid="study-description"]', 'Testing cross-browser compatibility');
    await page.selectOption('[data-testid="study-type"]', 'usability');
    
    // Test browser-specific interactions
    if (browserName === 'webkit') {
      // Test Safari-specific behaviors
      await page.click('[data-testid="safari-specific-button"]', { force: true });
    } else if (browserName === 'firefox') {
      // Test Firefox-specific behaviors
      await page.click('[data-testid="firefox-specific-button"]', { force: true });
    }
    
    await page.click('[data-testid="save-study"]');
    await page.waitForSelector('[data-testid="study-saved-message"]');
    
    // Verify functionality works correctly
    await expect(page.locator('[data-testid="study-saved-message"]')).toBeVisible();
  });

  test('Mobile Responsiveness E2E', async ({ page }) => {
    // Test mobile user experience
    console.log('📱 Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await e2eSuite.loginAs(page, 'participant');
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test mobile study participation
    await page.click('[data-testid="available-studies-mobile"]');
    await expect(page.locator('[data-testid="studies-list"]')).toBeVisible();
    
    // Test mobile form interactions
    await page.click('[data-testid="study-item"]').first();
    await page.click('[data-testid="apply-to-study"]');
    
    // Mobile-specific touch interactions
    await page.tap('[data-testid="application-textarea"]');
    await page.fill('[data-testid="application-textarea"]', 'Mobile application test');
    await page.tap('[data-testid="submit-application"]');
    
    await expect(page.locator('[data-testid="application-submitted-message"]')).toBeVisible();
  });

  test('Security and Access Control', async ({ page }) => {
    // Test security features and access control
    console.log('🔒 Testing security and access control...');
    
    // Test unauthorized access
    await page.goto(`${e2eSuite.baseUrl}/admin`);
    await expect(page.locator('[data-testid="access-denied-message"]')).toBeVisible();
    
    // Login as participant and test researcher-only features
    await e2eSuite.loginAs(page, 'participant');
    await page.goto(`${e2eSuite.baseUrl}/create-study`);
    await expect(page.locator('[data-testid="access-denied-message"]')).toBeVisible();
    
    // Test proper access with correct role
    await e2eSuite.loginAs(page, 'researcher');
    await page.goto(`${e2eSuite.baseUrl}/create-study`);
    await expect(page.locator('[data-testid="create-study-form"]')).toBeVisible();
    
    // Test session security
    await page.evaluate(() => localStorage.removeItem('auth_token'));
    await page.reload();
    await expect(page).toHaveURL(/.*login/);
  });
});

export default ComprehensiveE2ETestSuite;
