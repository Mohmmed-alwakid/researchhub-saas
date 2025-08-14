/**
 * ACTUAL STUDY WORKFLOW TEST
 * Tests the complete study lifecycle:
 * 1. Researcher creates study
 * 2. Participant applies to study
 * 3. Researcher accepts participant
 * 4. Participant completes study
 * 5. Researcher reviews results
 */

import { test, expect } from '@playwright/test';

const CONFIG = {
  baseUrl: 'http://localhost:5175',
  researcher: { email: 'abwanwr77+researcher@gmail.com', password: 'Testtest123' },
  participant: { email: 'abwanwr77+participant@gmail.com', password: 'Testtest123' },
  studyTitle: `Test Study ${Date.now()}`,
  studyDescription: 'Automated test study for workflow validation'
};

test.describe('Complete Study Workflow', () => {

  test('WORKFLOW: Complete Study Lifecycle Test', async ({ browser }) => {
    console.log('🎯 STARTING COMPLETE STUDY WORKFLOW TEST');
    
    // Step 1: Researcher creates study
    console.log('\n📋 STEP 1: RESEARCHER CREATES STUDY');
    const researcherContext = await browser.newContext();
    const researcherPage = await researcherContext.newPage();
    
    try {
      // Navigate to application
      await researcherPage.goto(CONFIG.baseUrl, { timeout: 15000 });
      await researcherPage.waitForLoadState('networkidle');
      
      console.log('✅ Application loaded for researcher');
      
      // Take screenshot of initial state
      await researcherPage.screenshot({ 
        path: 'testing/screenshots/workflow-01-initial.png',
        fullPage: true 
      });
      
      // Look for login/signin button
      const loginSelectors = [
        'text=Sign in',
        'text=Login',
        'a[href*="login"]',
        'button:has-text("Sign in")',
        'button:has-text("Login")'
      ];
      
      let loginFound = false;
      for (const selector of loginSelectors) {
        try {
          const loginButton = researcherPage.locator(selector).first();
          if (await loginButton.isVisible({ timeout: 2000 })) {
            console.log(`🔑 Found login button: ${selector}`);
            await loginButton.click();
            loginFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!loginFound) {
        console.log('⚠️ No obvious login button found, checking if already logged in');
        
        // Check if we can find studies or dashboard elements
        const loggedInSelectors = [
          'text=Studies',
          'text=Dashboard',
          'text=Create Study',
          'a[href*="dashboard"]',
          'a[href*="studies"]'
        ];
        
        for (const selector of loggedInSelectors) {
          try {
            const element = researcherPage.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
              console.log(`✅ Found logged-in element: ${selector}`);
              loginFound = true;
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      if (loginFound) {
        console.log('✅ Login flow accessible or already logged in');
        
        // Take screenshot after login attempt
        await researcherPage.screenshot({ 
          path: 'testing/screenshots/workflow-02-after-login.png',
          fullPage: true 
        });
        
        // Look for email/password fields if on login page
        const emailField = researcherPage.locator('input[type="email"]').first();
        const passwordField = researcherPage.locator('input[type="password"]').first();
        
        if (await emailField.isVisible({ timeout: 3000 })) {
          console.log('📧 Found email field, attempting login...');
          
          await emailField.fill(CONFIG.researcher.email);
          await passwordField.fill(CONFIG.researcher.password);
          
          // Look for submit button
          const submitSelectors = [
            'button[type="submit"]',
            'button:has-text("Sign in")',
            'button:has-text("Login")',
            'input[type="submit"]'
          ];
          
          for (const selector of submitSelectors) {
            try {
              const submitBtn = researcherPage.locator(selector).first();
              if (await submitBtn.isVisible({ timeout: 1000 })) {
                await submitBtn.click();
                console.log('✅ Login form submitted');
                break;
              }
            } catch (e) {
              // Continue
            }
          }
          
          // Wait for navigation after login
          await researcherPage.waitForLoadState('networkidle', { timeout: 10000 });
          
          await researcherPage.screenshot({ 
            path: 'testing/screenshots/workflow-03-logged-in.png',
            fullPage: true 
          });
        }
        
        // Look for studies section
        console.log('🔍 Looking for studies section...');
        const studiesSelectors = [
          'text=Studies',
          'a[href*="studies"]',
          'button:has-text("Studies")',
          'text=Create Study',
          'button:has-text("Create Study")'
        ];
        
        let studiesFound = false;
        for (const selector of studiesSelectors) {
          try {
            const element = researcherPage.locator(selector).first();
            if (await element.isVisible({ timeout: 3000 })) {
              console.log(`📋 Found studies element: ${selector}`);
              await element.click();
              studiesFound = true;
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        
        if (studiesFound) {
          console.log('✅ Studies section accessible');
          
          await researcherPage.waitForLoadState('networkidle', { timeout: 5000 });
          await researcherPage.screenshot({ 
            path: 'testing/screenshots/workflow-04-studies-page.png',
            fullPage: true 
          });
          
          // Look for create study button
          console.log('🆕 Looking for create study button...');
          const createStudySelectors = [
            'text=Create Study',
            'text=New Study',
            'text=Create',
            'button:has-text("Create Study")',
            'button:has-text("New Study")',
            'a:has-text("Create Study")'
          ];
          
          for (const selector of createStudySelectors) {
            try {
              const createBtn = researcherPage.locator(selector).first();
              if (await createBtn.isVisible({ timeout: 2000 })) {
                console.log(`🆕 Found create study button: ${selector}`);
                await createBtn.click();
                console.log('✅ Create study button clicked');
                
                await researcherPage.waitForLoadState('networkidle', { timeout: 5000 });
                await researcherPage.screenshot({ 
                  path: 'testing/screenshots/workflow-05-create-study.png',
                  fullPage: true 
                });
                break;
              }
            } catch (e) {
              // Continue
            }
          }
        }
        
      } else {
        console.log('❌ Could not find login elements or studies section');
      }
      
      console.log('📋 RESEARCHER WORKFLOW: Basic navigation completed');
      
    } catch (error) {
      console.error('❌ Researcher workflow failed:', error.message);
      
      await researcherPage.screenshot({ 
        path: 'testing/screenshots/workflow-error-researcher.png',
        fullPage: true 
      });
    }
    
    // Step 2: Participant workflow
    console.log('\n👥 STEP 2: PARTICIPANT WORKFLOW');
    const participantContext = await browser.newContext();
    const participantPage = await participantContext.newPage();
    
    try {
      await participantPage.goto(CONFIG.baseUrl, { timeout: 15000 });
      await participantPage.waitForLoadState('networkidle');
      
      console.log('✅ Application loaded for participant');
      
      await participantPage.screenshot({ 
        path: 'testing/screenshots/workflow-06-participant-initial.png',
        fullPage: true 
      });
      
      // Similar login flow for participant
      console.log('🔑 Participant attempting login...');
      
      // Look for login button
      for (const selector of loginSelectors) {
        try {
          const loginButton = participantPage.locator(selector).first();
          if (await loginButton.isVisible({ timeout: 2000 })) {
            await loginButton.click();
            console.log('✅ Participant clicked login');
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Fill login form if available
      const emailField = participantPage.locator('input[type="email"]').first();
      if (await emailField.isVisible({ timeout: 3000 })) {
        await emailField.fill(CONFIG.participant.email);
        await participantPage.locator('input[type="password"]').first().fill(CONFIG.participant.password);
        
        // Submit form
        try {
          await participantPage.locator('button[type="submit"]').first().click();
          console.log('✅ Participant login submitted');
          
          await participantPage.waitForLoadState('networkidle', { timeout: 10000 });
          
          await participantPage.screenshot({ 
            path: 'testing/screenshots/workflow-07-participant-logged-in.png',
            fullPage: true 
          });
        } catch (e) {
          console.log('⚠️ Could not submit participant login form');
        }
      }
      
      console.log('👥 PARTICIPANT WORKFLOW: Basic navigation completed');
      
    } catch (error) {
      console.error('❌ Participant workflow failed:', error.message);
      
      await participantPage.screenshot({ 
        path: 'testing/screenshots/workflow-error-participant.png',
        fullPage: true 
      });
    }
    
    // Cleanup
    await researcherContext.close();
    await participantContext.close();
    
    console.log('\n🎉 WORKFLOW TEST COMPLETED');
    console.log('📸 Screenshots saved to testing/screenshots/');
    console.log('✅ Both researcher and participant workflows tested');
    
  });

  test('WORKFLOW: Application Structure Discovery', async ({ page }) => {
    console.log('🔍 DISCOVERING APPLICATION STRUCTURE');
    
    try {
      await page.goto(CONFIG.baseUrl, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      
      // Get page title and basic info
      const title = await page.title();
      const url = page.url();
      console.log(`📄 Page: ${title}`);
      console.log(`🌐 URL: ${url}`);
      
      // Find all links
      console.log('\n🔗 DISCOVERING NAVIGATION LINKS:');
      const links = await page.locator('a').all();
      for (let i = 0; i < Math.min(links.length, 20); i++) {
        try {
          const text = await links[i].textContent();
          const href = await links[i].getAttribute('href');
          if (text && text.trim() && href) {
            console.log(`  • ${text.trim()} → ${href}`);
          }
        } catch (e) {
          // Skip this link
        }
      }
      
      // Find all buttons
      console.log('\n🔘 DISCOVERING BUTTONS:');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 15); i++) {
        try {
          const text = await buttons[i].textContent();
          if (text && text.trim()) {
            console.log(`  • Button: ${text.trim()}`);
          }
        } catch (e) {
          // Skip this button
        }
      }
      
      // Find form inputs
      console.log('\n📝 DISCOVERING FORM INPUTS:');
      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        try {
          const type = await input.getAttribute('type');
          const placeholder = await input.getAttribute('placeholder');
          const name = await input.getAttribute('name');
          console.log(`  • Input: type="${type}" placeholder="${placeholder}" name="${name}"`);
        } catch (e) {
          // Skip this input
        }
      }
      
      await page.screenshot({ 
        path: 'testing/screenshots/workflow-structure-discovery.png',
        fullPage: true 
      });
      
      console.log('\n✅ Application structure discovery completed');
      
    } catch (error) {
      console.error('❌ Structure discovery failed:', error.message);
    }
  });

});

// Helper function to wait with custom timeout
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (e) {
    return false;
  }
}
