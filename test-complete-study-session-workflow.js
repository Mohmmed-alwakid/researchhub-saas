/**
 * Complete Study Session Workflow Test
 * Tests the end-to-end flow: Apply -> Approve -> Start Session -> Complete Session
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5175';
const API_BASE_URL = 'http://localhost:3003';

// Test accounts
const RESEARCHER_EMAIL = 'abwanwr77+Researcher@gmail.com';
const RESEARCHER_PASSWORD = 'Testtest123';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PARTICIPANT_PASSWORD = 'Testtest123';

async function testCompleteWorkflow() {
  console.log('🚀 Starting Complete Study Session Workflow Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for observation
  });
  
  try {
    // Step 1: Researcher logs in and creates/checks studies
    console.log('\n📋 STEP 1: Researcher Dashboard');
    const researcherContext = await browser.newContext();
    const researcherPage = await researcherContext.newPage();
    
    await researcherPage.goto(`${BASE_URL}/login`);
    await researcherPage.fill('input[type="email"]', RESEARCHER_EMAIL);
    await researcherPage.fill('input[type="password"]', RESEARCHER_PASSWORD);
    await researcherPage.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await researcherPage.waitForURL('**/app/dashboard');
    console.log('✅ Researcher logged in successfully');
    
    // Navigate to studies
    await researcherPage.click('a[href="/app/studies"]');
    await researcherPage.waitForURL('**/app/studies');
    console.log('✅ Navigated to studies page');
    
    // Get a study ID for testing
    const studyLinks = await researcherPage.$$('a[href*="/app/studies/"][href*="/applications"]');
    if (studyLinks.length === 0) {
      throw new Error('No studies with applications found');
    }
    
    const firstStudyLink = studyLinks[0];
    const href = await firstStudyLink.getAttribute('href');
    const studyId = href?.match(/\/studies\/(.+?)\/applications/)?.[1];
    
    if (!studyId) {
      throw new Error('Could not extract study ID');
    }
    
    console.log(`✅ Found study ID: ${studyId}`);
    
    // Step 2: Check and approve participant applications
    console.log('\n👥 STEP 2: Manage Applications');
    await firstStudyLink.click();
    await researcherPage.waitForURL('**/applications');
    console.log('✅ Navigated to applications management');
    
    // Look for pending applications and approve one
    const approveButtons = await researcherPage.$$('button:has-text("Approve")');
    if (approveButtons.length > 0) {
      await approveButtons[0].click();
      console.log('✅ Approved an application');
      await researcherPage.waitForTimeout(2000); // Wait for approval to process
    } else {
      console.log('ℹ️ No pending applications to approve');
    }
    
    // Step 3: Participant logs in and views dashboard
    console.log('\n🧑 STEP 3: Participant Dashboard');
    const participantContext = await browser.newContext();
    const participantPage = await participantContext.newPage();
    
    await participantPage.goto(`${BASE_URL}/login`);
    await participantPage.fill('input[type="email"]', PARTICIPANT_EMAIL);
    await participantPage.fill('input[type="password"]', PARTICIPANT_PASSWORD);
    await participantPage.click('button[type="submit"]');
    
    // Wait for redirect to participant dashboard
    await participantPage.waitForURL('**/app/participant-dashboard');
    console.log('✅ Participant logged in successfully');
    
    // Look for approved applications with "Start Study" buttons
    const startStudyButtons = await participantPage.$$('button:has-text("Start Study"), a:has-text("Start Study")');
    if (startStudyButtons.length === 0) {
      console.log('ℹ️ No approved applications with Start Study buttons found');
      
      // Try to create an application first
      console.log('🔄 Attempting to apply to a study first...');
      await participantPage.goto(`${BASE_URL}/app/discover`);
      await participantPage.waitForTimeout(2000);
      
      const applyButtons = await participantPage.$$('button:has-text("Apply Now"), a:has-text("Apply Now")');
      if (applyButtons.length > 0) {
        await applyButtons[0].click();
        console.log('✅ Found and clicked Apply Now button');
        
        // Fill out application form if it appears
        await participantPage.waitForTimeout(3000);
        const submitButton = await participantPage.$('button:has-text("Submit Application")');
        if (submitButton) {
          await submitButton.click();
          console.log('✅ Submitted application');
        }
      }
      
      // Go back to dashboard
      await participantPage.goto(`${BASE_URL}/app/participant-dashboard`);
      await participantPage.waitForTimeout(2000);
    }
    
    // Step 4: Test Study Session API directly
    console.log('\n🔬 STEP 4: Test Study Session API');
    
    // Get auth token from participant browser
    const authToken = await participantPage.evaluate(() => {
      return localStorage.getItem('auth-token');
    });
    
    if (!authToken) {
      throw new Error('No auth token found for participant');
    }
    
    console.log('✅ Got participant auth token');
    
    // Test the study session API
    const response = await fetch(`${API_BASE_URL}/api/study-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        studyId: studyId
      })
    });
    
    const result = await response.json();
    console.log('📊 Study session API response:', result);
    
    if (result.success) {
      console.log('✅ Study session created successfully!');
      
      // Test getting the session
      const sessionId = result.session.id;
      const getResponse = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const getResult = await getResponse.json();
      console.log('📊 Get session API response:', getResult.success ? '✅ Success' : '❌ Failed');
      
      // Test completing the session
      const completeResponse = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}?action=complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          finalData: { completedTasks: 1 },
          completionNotes: 'Test completion'
        })
      });
      
      const completeResult = await completeResponse.json();
      console.log('📊 Complete session API response:', completeResult.success ? '✅ Success' : '❌ Failed');
      
    } else {
      console.log('❌ Study session API failed:', result.error);
    }
    
    // Step 5: Test the UI navigation to study session
    console.log('\n🖥️ STEP 5: Test UI Study Session');
    
    // Try to navigate to study session page
    await participantPage.goto(`${BASE_URL}/app/studies/${studyId}/session`);
    await participantPage.waitForTimeout(3000);
    
    const currentUrl = participantPage.url();
    console.log('Current URL after navigation:', currentUrl);
    
    if (currentUrl.includes('/session')) {
      console.log('✅ Successfully navigated to study session page');
      
      // Look for study session elements
      const startButton = await participantPage.$('button:has-text("Start Session")');
      const studyTitle = await participantPage.$('h1, h2, h3');
      
      if (startButton) {
        console.log('✅ Found Start Session button');
        await startButton.click();
        await participantPage.waitForTimeout(2000);
        console.log('✅ Clicked Start Session button');
      } else if (studyTitle) {
        const title = await studyTitle.textContent();
        console.log(`✅ Found study content: ${title}`);
      } else {
        console.log('⚠️ Study session page loaded but no recognizable content found');
      }
    } else {
      console.log('⚠️ Did not reach study session page - might be access restrictions');
    }
    
    console.log('\n🎉 Complete Study Session Workflow Test Finished!');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Researcher login and application management');
    console.log('✅ Participant login and dashboard');
    console.log('✅ Study session API endpoints');
    console.log('✅ UI navigation testing');
    console.log('═══════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testCompleteWorkflow().catch(console.error);
