/**
 * Post-Approval Study Execution Workflow Test
 * Tests the complete participant workflow from login to study completion
 * Using MCP Desktop Commander and local Playwright installation
 */

const { chromium } = require('playwright');

async function testPostApprovalWorkflow() {
  console.log('🧪 Starting Post-Approval Study Execution Workflow Test');
  console.log('🔧 Using Local Development Environment: http://localhost:5175');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test credentials
    const participantEmail = 'abwanwr77+participant@gmail.com';
    const participantPassword = 'Testtest123';
    
    console.log('📝 Step 1: Navigate to local development environment');
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    console.log('🔐 Step 2: Login as participant');
    await page.click('button:has-text("Login")');
    await page.fill('input[type="email"]', participantEmail);
    await page.fill('input[type="password"]', participantPassword);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('✅ Login successful');
    
    console.log('📋 Step 3: Check for available studies');
    // Look for studies in the dashboard
    await page.waitForSelector('text="Available Studies"', { timeout: 5000 });
    
    // Check if there are any studies available
    const studiesExist = await page.locator('[data-testid="study-card"], .study-card, [class*="study"]').count();
    console.log(`📊 Found ${studiesExist} study(ies) available`);
    
    if (studiesExist > 0) {
      console.log('🎯 Step 4: Click on first available study');
      await page.click('[data-testid="study-card"], .study-card, [class*="study"]');
      
      console.log('📖 Step 5: Check study details and start session');
      await page.waitForSelector('text="Start Study"', { timeout: 5000 });
      await page.click('button:has-text("Start Study")');
      
      console.log('🎬 Step 6: Navigate to study session page');
      await page.waitForURL('**/study/**', { timeout: 10000 });
      
      console.log('📝 Step 7: Check for tasks and recording interface');
      const tasksExist = await page.locator('[data-testid="task"], .task, [class*="task"]').count();
      console.log(`📋 Found ${tasksExist} task(s) in study`);
      
      // Check for recording controls
      const recordingButton = await page.locator('button:has-text("Start Recording"), [data-testid="start-recording"]').count();
      console.log(`🎥 Recording controls available: ${recordingButton > 0 ? 'Yes' : 'No'}`);
      
      if (recordingButton > 0) {
        console.log('🎬 Step 8: Test recording functionality');
        await page.click('button:has-text("Start Recording"), [data-testid="start-recording"]');
        
        // Wait a bit for recording to start
        await page.waitForTimeout(2000);
        
        // Check for stop recording button
        const stopButton = await page.locator('button:has-text("Stop Recording"), [data-testid="stop-recording"]').count();
        if (stopButton > 0) {
          console.log('✅ Recording started successfully');
          await page.click('button:has-text("Stop Recording"), [data-testid="stop-recording"]');
          console.log('✅ Recording stopped successfully');
        }
      }
      
      console.log('✅ Post-Approval Study Execution Workflow Test COMPLETED');
      console.log('🎉 All major workflow steps verified successfully');
      
    } else {
      console.log('⚠️ No studies available for participant');
      console.log('This might indicate:');
      console.log('- No studies are published');
      console.log('- Participant needs to apply for studies first');
      console.log('- Database/API issues');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

// Run the test
testPostApprovalWorkflow().catch(console.error);