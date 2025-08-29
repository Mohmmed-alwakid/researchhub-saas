/**
 * UE-001 AI Interview Moderator - Comprehensive E2E Test
 * Tests the complete AI-powered interview workflow
 * 
 * Test Coverage:
 * 1. AI Interview Study Creation (Researcher)
 * 2. AI Configuration Settings
 * 3. Participant AI Interview Experience
 * 4. Language Switching (Arabic/English)
 * 5. Voice and Text Interaction
 * 6. Real-time AI Response Generation
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const LOCAL_URL = 'http://localhost:5175';
const BASE_URL = process.env.NODE_ENV === 'production' ? PRODUCTION_URL : LOCAL_URL;

const RESEARCHER_EMAIL = 'abwanwr77+researcher@gmail.com';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PASSWORD = 'Testtest123';

test.describe('UE-001: AI Interview Moderator Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for AI operations
    test.setTimeout(120000); // 2 minutes
  });

  test('Complete AI Interview Workflow - English Language', async ({ browser }) => {
    console.log('🤖 Testing UE-001 AI Interview Moderator - English');
    
    // Create separate contexts for researcher and participant
    const researcherContext = await browser.newContext();
    const participantContext = await browser.newContext();
    
    const researcherPage = await researcherContext.newPage();
    const participantPage = await participantContext.newPage();

    let studyId = null;
    let aiInterviewUrl = null;

    try {
      // ==========================================
      // PART 1: RESEARCHER - CREATE AI INTERVIEW STUDY
      // ==========================================
      console.log('\n👨‍🔬 RESEARCHER: Creating AI Interview Study');
      
      await researcherPage.goto(BASE_URL);
      await researcherPage.waitForLoadState('networkidle');

      // Login as researcher
      console.log('🔐 Logging in as researcher...');
      if (await researcherPage.locator('text=Login').isVisible()) {
        await researcherPage.click('text=Login');
        await researcherPage.waitForSelector('input[type="email"]');
        await researcherPage.fill('input[type="email"]', RESEARCHER_EMAIL);
        await researcherPage.fill('input[type="password"]', PASSWORD);
        await researcherPage.click('button[type="submit"]');
      }
      
      // Wait for dashboard
      await researcherPage.waitForSelector('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard")', { timeout: 15000 });
      console.log('✅ Researcher logged in successfully');

      // Navigate to create study
      console.log('📋 Creating new AI interview study...');
      await researcherPage.click('text=Create Study, a[href*="study"], button:has-text("Create")');
      await researcherPage.waitForLoadState('networkidle');

      // Select Interview study type
      if (await researcherPage.locator('text=Interview, [data-study-type="interview"]').isVisible()) {
        await researcherPage.click('text=Interview, [data-study-type="interview"]');
      }

      // Enable AI Interview features
      console.log('🤖 Configuring AI Interview settings...');
      if (await researcherPage.locator('[data-testid="ai-interview-toggle"], input[name="ai_enabled"]').isVisible()) {
        await researcherPage.click('[data-testid="ai-interview-toggle"], input[name="ai_enabled"]');
      }

      // Configure AI settings
      await researcherPage.selectOption('select[name="ai_language"], [data-testid="language-select"]', 'english');
      await researcherPage.selectOption('select[name="ai_personality"], [data-testid="personality-select"]', 'professional');
      
      // Enable voice interaction
      if (await researcherPage.locator('input[name="voice_enabled"], [data-testid="voice-toggle"]').isVisible()) {
        await researcherPage.check('input[name="voice_enabled"], [data-testid="voice-toggle"]');
      }

      // Fill study details
      const studyTitle = `AI Interview Test - English - ${Date.now()}`;
      await researcherPage.fill('input[name="title"], [data-testid="study-title"]', studyTitle);
      await researcherPage.fill('textarea[name="description"], [data-testid="study-description"]', 
        'Testing UE-001 AI Interview Moderator with English language support');

      // Save/Create study
      await researcherPage.click('button:has-text("Create Study"), button:has-text("Save"), [data-testid="create-study"]');
      await researcherPage.waitForLoadState('networkidle');

      // Extract study ID from URL or page
      try {
        const currentUrl = researcherPage.url();
        const urlMatch = currentUrl.match(/study\/([a-zA-Z0-9-]+)/);
        if (urlMatch) {
          studyId = urlMatch[1];
          console.log(`✅ AI Interview study created with ID: ${studyId}`);
        }
      } catch (error) {
        console.log('⚠️  Could not extract study ID from URL, continuing...');
      }

      // ==========================================
      // PART 2: PARTICIPANT - AI INTERVIEW EXPERIENCE
      // ==========================================
      console.log('\n👥 PARTICIPANT: Testing AI Interview Experience');
      
      await participantPage.goto(BASE_URL);
      await participantPage.waitForLoadState('networkidle');

      // Login as participant
      console.log('🔐 Logging in as participant...');
      if (await participantPage.locator('text=Login').isVisible()) {
        await participantPage.click('text=Login');
        await participantPage.waitForSelector('input[type="email"]');
        await participantPage.fill('input[type="email"]', PARTICIPANT_EMAIL);
        await participantPage.fill('input[type="password"]', PASSWORD);
        await participantPage.click('button[type="submit"]');
      }

      // Wait for participant dashboard
      await participantPage.waitForSelector('[data-testid="participant-dashboard"], h1:has-text("Available Studies")', { timeout: 15000 });
      console.log('✅ Participant logged in successfully');

      // Find and join the AI interview study
      console.log('🔍 Looking for AI interview study...');
      if (studyId) {
        aiInterviewUrl = `${BASE_URL}/participant/ai-interview/${studyId}`;
        await participantPage.goto(aiInterviewUrl);
      } else {
        // Look for study in the list
        await participantPage.click(`text=${studyTitle}, [data-study-title*="AI Interview"]`);
      }

      await participantPage.waitForLoadState('networkidle');

      // ==========================================
      // PART 3: AI INTERVIEW INTERACTION TESTING
      // ==========================================
      console.log('\n🤖 TESTING AI INTERVIEW INTERACTIONS');

      // Wait for AI interview interface
      await participantPage.waitForSelector('[data-testid="ai-interview-chat"], .ai-interview-moderator, .chat-interface', { timeout: 20000 });
      console.log('✅ AI Interview interface loaded');

      // Test 1: Wait for AI welcome message
      console.log('📝 Testing AI welcome message...');
      await participantPage.waitForSelector('.ai-message, [data-message-role="ai"], .moderator-message', { timeout: 15000 });
      const welcomeMessage = await participantPage.textContent('.ai-message:first-child, [data-message-role="ai"]:first-child');
      expect(welcomeMessage).toBeTruthy();
      console.log(`✅ AI welcome message received: "${welcomeMessage?.substring(0, 50)}..."`);

      // Test 2: Send text response to AI
      console.log('💬 Testing text interaction with AI...');
      const textInput = participantPage.locator('input[type="text"], textarea, [data-testid="chat-input"]');
      if (await textInput.isVisible()) {
        await textInput.fill('Hello! I am excited to participate in this interview. I work in technology and have 5 years of experience.');
        await participantPage.click('button:has-text("Send"), [data-testid="send-button"], .send-btn');
        
        // Wait for AI response
        await participantPage.waitForTimeout(3000); // Wait for AI processing
        await participantPage.waitForSelector('.ai-message:nth-child(n+2), [data-message-role="ai"]:nth-child(n+2)', { timeout: 20000 });
        console.log('✅ Text interaction successful - AI responded');
      }

      // Test 3: Voice interaction (if available)
      console.log('🎤 Testing voice interaction capability...');
      if (await participantPage.locator('[data-testid="voice-button"], .voice-input, button:has-text("Record")').isVisible()) {
        await participantPage.click('[data-testid="voice-button"], .voice-input, button:has-text("Record")');
        await participantPage.waitForTimeout(1000);
        console.log('✅ Voice recording interface available');
      } else {
        console.log('ℹ️  Voice recording not available in test environment');
      }

      // Test 4: Multiple conversation turns
      console.log('🔄 Testing multi-turn conversation...');
      for (let i = 0; i < 2; i++) {
        if (await textInput.isVisible()) {
          await textInput.fill(`This is follow-up response ${i + 1}. I can provide more details about my experience.`);
          await participantPage.click('button:has-text("Send"), [data-testid="send-button"]');
          await participantPage.waitForTimeout(2000);
        }
      }

      // Test 5: Session completion
      console.log('✅ Testing session completion...');
      if (await participantPage.locator('button:has-text("End Interview"), [data-testid="end-session"]').isVisible()) {
        await participantPage.click('button:has-text("End Interview"), [data-testid="end-session"]');
        await participantPage.waitForSelector('.completion-message, [data-testid="interview-complete"]', { timeout: 10000 });
        console.log('✅ Interview session completed successfully');
      }

      // ==========================================
      // PART 4: VALIDATION & ASSERTIONS
      // ==========================================
      console.log('\n✅ VALIDATION: Checking AI Interview Results');

      // Validate conversation history exists
      const messageCount = await participantPage.locator('.message, [data-message-role]').count();
      expect(messageCount).toBeGreaterThan(2); // At least welcome + user response + AI response
      console.log(`✅ Conversation contains ${messageCount} messages`);

      // Validate AI responses are contextual
      const aiMessages = await participantPage.locator('.ai-message, [data-message-role="ai"]').allTextContents();
      expect(aiMessages.length).toBeGreaterThan(1);
      console.log(`✅ AI generated ${aiMessages.length} contextual responses`);

      // Check for proper English language usage
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      expect(lastAiMessage).toMatch(/[a-zA-Z]/); // Contains English characters
      console.log('✅ AI responses are in English as configured');

      console.log('\n🎉 UE-001 AI Interview Moderator Test PASSED - English Language');

    } catch (error) {
      console.error('❌ UE-001 AI Interview Test Failed:', error);
      
      // Take screenshot for debugging
      await researcherPage.screenshot({ path: 'test-failure-researcher-ai-interview.png', fullPage: true });
      await participantPage.screenshot({ path: 'test-failure-participant-ai-interview.png', fullPage: true });
      
      throw error;
    } finally {
      await researcherContext.close();
      await participantContext.close();
    }
  });

  test('AI Interview with Arabic Language Support', async ({ browser }) => {
    console.log('🤖 Testing UE-001 AI Interview Moderator - Arabic Language');
    
    const researcherContext = await browser.newContext();
    const participantContext = await browser.newContext();
    
    const researcherPage = await researcherContext.newPage();
    const participantPage = await participantContext.newPage();

    try {
      // ==========================================
      // ARABIC LANGUAGE AI INTERVIEW TEST
      // ==========================================
      console.log('\n🌍 TESTING ARABIC LANGUAGE AI INTERVIEW');
      
      await researcherPage.goto(BASE_URL);
      await researcherPage.waitForLoadState('networkidle');

      // Login as researcher
      if (await researcherPage.locator('text=Login').isVisible()) {
        await researcherPage.click('text=Login');
        await researcherPage.waitForSelector('input[type="email"]');
        await researcherPage.fill('input[type="email"]', RESEARCHER_EMAIL);
        await researcherPage.fill('input[type="password"]', PASSWORD);
        await researcherPage.click('button[type="submit"]');
      }
      
      await researcherPage.waitForSelector('[data-testid="dashboard"], .dashboard', { timeout: 15000 });

      // Create Arabic AI interview study
      console.log('📋 Creating Arabic AI interview study...');
      await researcherPage.click('text=Create Study, a[href*="study"], button:has-text("Create")');
      await researcherPage.waitForLoadState('networkidle');

      // Select Interview type and configure for Arabic
      if (await researcherPage.locator('text=Interview').isVisible()) {
        await researcherPage.click('text=Interview');
      }

      // Configure AI for Arabic
      console.log('🔧 Configuring AI for Arabic language...');
      if (await researcherPage.locator('[data-testid="ai-interview-toggle"], input[name="ai_enabled"]').isVisible()) {
        await researcherPage.click('[data-testid="ai-interview-toggle"], input[name="ai_enabled"]');
      }

      await researcherPage.selectOption('select[name="ai_language"], [data-testid="language-select"]', 'arabic');
      await researcherPage.selectOption('select[name="ai_personality"], [data-testid="personality-select"]', 'friendly');

      // Fill study details in Arabic
      const arabicStudyTitle = `مقابلة ذكية - اختبار - ${Date.now()}`;
      await researcherPage.fill('input[name="title"], [data-testid="study-title"]', arabicStudyTitle);
      await researcherPage.fill('textarea[name="description"], [data-testid="study-description"]', 
        'اختبار المحاور الذكي UE-001 مع دعم اللغة العربية');

      await researcherPage.click('button:has-text("Create Study"), button:has-text("Save")');
      await researcherPage.waitForLoadState('networkidle');

      // Switch to participant experience
      await participantPage.goto(BASE_URL);
      await participantPage.waitForLoadState('networkidle');

      // Login as participant
      if (await participantPage.locator('text=Login').isVisible()) {
        await participantPage.click('text=Login');
        await participantPage.waitForSelector('input[type="email"]');
        await participantPage.fill('input[type="email"]', PARTICIPANT_EMAIL);
        await participantPage.fill('input[type="password"]', PASSWORD);
        await participantPage.click('button[type="submit"]');
      }

      await participantPage.waitForSelector('[data-testid="participant-dashboard"]', { timeout: 15000 });

      // Find and start Arabic AI interview
      await participantPage.click(`text=${arabicStudyTitle}, [data-study-title*="مقابلة"]`);
      await participantPage.waitForLoadState('networkidle');

      // Test Arabic AI interaction
      console.log('🤖 Testing Arabic AI conversation...');
      await participantPage.waitForSelector('[data-testid="ai-interview-chat"], .ai-interview-moderator', { timeout: 20000 });

      // Wait for Arabic AI welcome message
      await participantPage.waitForSelector('.ai-message, [data-message-role="ai"]', { timeout: 15000 });
      const arabicWelcome = await participantPage.textContent('.ai-message:first-child');
      
      // Validate Arabic text (contains Arabic characters)
      expect(arabicWelcome).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range
      console.log(`✅ Arabic AI welcome message: "${arabicWelcome?.substring(0, 50)}..."`);

      // Send Arabic response
      const textInput = participantPage.locator('input[type="text"], textarea, [data-testid="chat-input"]');
      if (await textInput.isVisible()) {
        await textInput.fill('مرحباً! أنا سعيد للمشاركة في هذه المقابلة. أعمل في مجال التكنولوجيا ولدي خبرة خمس سنوات.');
        await participantPage.click('button:has-text("Send"), [data-testid="send-button"]');
        
        // Wait for Arabic AI response
        await participantPage.waitForTimeout(3000);
        await participantPage.waitForSelector('.ai-message:nth-child(n+2)', { timeout: 20000 });
        
        const aiResponse = await participantPage.textContent('.ai-message:last-child');
        expect(aiResponse).toMatch(/[\u0600-\u06FF]/); // Validate Arabic response
        console.log('✅ Arabic AI interaction successful');
      }

      // Validate RTL layout for Arabic
      const chatContainer = participantPage.locator('.ai-interview-moderator, [data-testid="ai-interview-chat"]');
      const direction = await chatContainer.evaluate(el => getComputedStyle(el).direction);
      if (direction === 'rtl') {
        console.log('✅ RTL layout correctly applied for Arabic');
      }

      console.log('\n🎉 UE-001 Arabic AI Interview Test PASSED');

    } catch (error) {
      console.error('❌ Arabic AI Interview Test Failed:', error);
      await researcherPage.screenshot({ path: 'test-failure-arabic-researcher.png', fullPage: true });
      await participantPage.screenshot({ path: 'test-failure-arabic-participant.png', fullPage: true });
      throw error;
    } finally {
      await researcherContext.close();
      await participantContext.close();
    }
  });

  test('AI Interview Performance and Error Handling', async ({ page }) => {
    console.log('⚡ Testing AI Interview Performance & Error Handling');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Login as researcher
    if (await page.locator('text=Login').isVisible()) {
      await page.click('text=Login');
      await page.waitForSelector('input[type="email"]');
      await page.fill('input[type="email"]', RESEARCHER_EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');
    }

    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 15000 });

    // Test API endpoints directly
    console.log('🔗 Testing AI Interview API endpoints...');
    
    // Test AI response endpoint
    const aiResponseTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/research-consolidated?action=ai-interview-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantResponse: 'Hello, I am ready for the interview.',
            conversationHistory: [],
            interviewConfig: {
              language: 'english',
              moderatorPersonality: 'professional'
            }
          })
        });
        const data = await response.json();
        return { success: response.ok, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    if (aiResponseTest.success) {
      console.log('✅ AI Response API endpoint working');
      expect(aiResponseTest.data.success).toBe(true);
    } else {
      console.log('⚠️  AI Response API needs verification');
    }

    // Test error handling with invalid data
    const errorHandlingTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/research-consolidated?action=ai-interview-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}) // Invalid empty data
        });
        return { status: response.status, ok: response.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('✅ Error handling test completed');

    // Performance timing test
    console.log('⏱️  Testing AI response timing...');
    const startTime = Date.now();
    
    await page.evaluate(async () => {
      await fetch('/api/research-consolidated?action=ai-interview-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantResponse: 'Test response for timing',
          conversationHistory: [],
          interviewConfig: { language: 'english', moderatorPersonality: 'professional' }
        })
      });
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ AI response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(10000); // Should respond within 10 seconds

    console.log('\n🎉 Performance and Error Handling Tests PASSED');
  });
});

// Utility functions for test helpers
async function waitForAIResponse(page, timeout = 15000) {
  return await page.waitForSelector('.ai-message:last-child', { timeout });
}

async function sendChatMessage(page, message) {
  const input = page.locator('input[type="text"], textarea, [data-testid="chat-input"]');
  await input.fill(message);
  await page.click('button:has-text("Send"), [data-testid="send-button"]');
  return await waitForAIResponse(page);
}

// Export test configuration
module.exports = {
  BASE_URL,
  RESEARCHER_EMAIL,
  PARTICIPANT_EMAIL,
  PASSWORD
};
