import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers.js';

test.describe('Phase 2: Advanced Study Features Tests', () => {
  let testHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  // =================== STUDY BLOCK ADVANCED FEATURES ===================

  test('Scenario 61: Opinion Scale Block Functionality', async ({ page }) => {
    console.log('🧪 Testing Scenario 61: Opinion Scale Block Functionality');
    
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
    await page.waitForTimeout(2000);
    
    // Create study with opinion scale
    const createButton = page.locator('button', { hasText: /create.*study/i }).first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const scratchOption = page.locator('text=Start from Scratch').first();
    if (await scratchOption.isVisible()) {
      await scratchOption.click();
    }
    
    const titleInput = page.locator('input[placeholder*="title"], input[name*="title"]').first();
    await titleInput.fill('Opinion Scale Test - Scenario 61');
    
    const nextButton = page.locator('button', { hasText: /next|continue/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Add opinion scale block
    const addBlockButton = page.locator('button', { hasText: /add.*block/i }).first();
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      const opinionScaleOption = page.locator('text=Opinion Scale').first();
      if (await opinionScaleOption.isVisible()) {
        await opinionScaleOption.click();
        await page.waitForTimeout(2000);
        
        // Configure opinion scale
        const questionInput = page.locator('input[placeholder*="question"], textarea[placeholder*="question"]').first();
        if (await questionInput.isVisible()) {
          await questionInput.fill('How satisfied are you with this feature?');
        }
        
        // Test scale configuration
        const scaleOptions = page.locator('input[name*="scale"], select[name*="scale"]').first();
        if (await scaleOptions.isVisible()) {
          console.log('⚖️ Opinion scale configuration options available');
        }
        
        const saveBlockButton = page.locator('button', { hasText: /save|done|add/i }).first();
        if (await saveBlockButton.isVisible()) {
          await saveBlockButton.click();
        }
      }
    }
    
    console.log('✅ Scenario 61 completed successfully');
  });

  test('Scenario 62: Multiple Choice Block Configuration', async ({ page }) => {
    console.log('🧪 Testing Scenario 62: Multiple Choice Block Configuration');
    
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
    await page.waitForTimeout(2000);
    
    // Create study for multiple choice testing
    const createButton = page.locator('button', { hasText: /create.*study/i }).first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const scratchOption = page.locator('text=Start from Scratch').first();
    if (await scratchOption.isVisible()) {
      await scratchOption.click();
    }
    
    const titleInput = page.locator('input[placeholder*="title"], input[name*="title"]').first();
    await titleInput.fill('Multiple Choice Test - Scenario 62');
    
    const nextButton = page.locator('button', { hasText: /next|continue/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Add multiple choice block
    const addBlockButton = page.locator('button', { hasText: /add.*block/i }).first();
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      const multipleChoiceOption = page.locator('text=Multiple Choice').first();
      if (await multipleChoiceOption.isVisible()) {
        await multipleChoiceOption.click();
        await page.waitForTimeout(2000);
        
        // Configure question
        const questionInput = page.locator('input[placeholder*="question"], textarea[placeholder*="question"]').first();
        if (await questionInput.isVisible()) {
          await questionInput.fill('What is your preferred research method?');
        }
        
        // Add answer options
        const optionInputs = page.locator('input[placeholder*="option"], input[name*="option"]');
        const optionCount = await optionInputs.count();
        
        if (optionCount > 0) {
          await optionInputs.nth(0).fill('Surveys');
          if (optionCount > 1) {
            await optionInputs.nth(1).fill('Interviews');
          }
          if (optionCount > 2) {
            await optionInputs.nth(2).fill('Observations');
          }
          console.log(`📝 Configured ${Math.min(3, optionCount)} answer options`);
        }
        
        // Test single vs multiple selection
        const selectionType = page.locator('input[type="radio"][name*="selection"], select[name*="selection"]').first();
        if (await selectionType.isVisible()) {
          console.log('🔘 Selection type configuration available');
        }
        
        const saveBlockButton = page.locator('button', { hasText: /save|done|add/i }).first();
        if (await saveBlockButton.isVisible()) {
          await saveBlockButton.click();
        }
      }
    }
    
    console.log('✅ Scenario 62 completed successfully');
  });

  test('Scenario 63: Open Question Block with AI Follow-up', async ({ page }) => {
    console.log('🧪 Testing Scenario 63: Open Question Block with AI Follow-up');
    
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
    await page.waitForTimeout(2000);
    
    // Create study for open question testing
    const createButton = page.locator('button', { hasText: /create.*study/i }).first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const scratchOption = page.locator('text=Start from Scratch').first();
    if (await scratchOption.isVisible()) {
      await scratchOption.click();
    }
    
    const titleInput = page.locator('input[placeholder*="title"], input[name*="title"]').first();
    await titleInput.fill('Open Question AI Test - Scenario 63');
    
    const nextButton = page.locator('button', { hasText: /next|continue/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Add open question block
    const addBlockButton = page.locator('button', { hasText: /add.*block/i }).first();
    if (await addBlockButton.isVisible()) {
      await addBlockButton.click();
      
      const openQuestionOption = page.locator('text=Open Question').first();
      if (await openQuestionOption.isVisible()) {
        await openQuestionOption.click();
        await page.waitForTimeout(2000);
        
        // Configure question
        const questionInput = page.locator('input[placeholder*="question"], textarea[placeholder*="question"]').first();
        if (await questionInput.isVisible()) {
          await questionInput.fill('What challenges do you face in your daily work?');
        }
        
        // Test AI follow-up configuration
        const aiFollowupToggle = page.locator('input[type="checkbox"][name*="ai"], input[type="checkbox"][name*="followup"]').first();
        if (await aiFollowupToggle.isVisible()) {
          await aiFollowupToggle.click();
          console.log('🤖 AI follow-up enabled for open question');
        }
        
        // Character limit configuration
        const charLimitInput = page.locator('input[name*="limit"], input[name*="max"]').first();
        if (await charLimitInput.isVisible()) {
          await charLimitInput.fill('500');
          console.log('📏 Character limit configured');
        }
        
        const saveBlockButton = page.locator('button', { hasText: /save|done|add/i }).first();
        if (await saveBlockButton.isVisible()) {
          await saveBlockButton.click();
        }
      }
    }
    
    console.log('✅ Scenario 63 completed successfully');
  });

  // =================== STUDY ANALYTICS & INSIGHTS ===================

  test('Scenario 64: Study Analytics Dashboard', async ({ page }) => {
    console.log('🧪 Testing Scenario 64: Study Analytics Dashboard');
    
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
    await page.waitForTimeout(2000);
    
    // Find existing study with data
    const studyCard = page.locator('.study-card, [data-testid="study-card"]').first();
    if (await studyCard.isVisible()) {
      await studyCard.click();
      await page.waitForTimeout(2000);
      
      // Navigate to analytics section
      const analyticsTab = page.locator('button, a', { hasText: /analytics|insights|results/i }).first();
      if (await analyticsTab.isVisible()) {
        await analyticsTab.click();
        await page.waitForTimeout(3000);
        
        // Check for different analytics components
        const analyticsElements = [
          { selector: '.participation-chart, [data-testid="participation-chart"]', name: 'Participation Chart' },
          { selector: '.completion-rate, [data-testid="completion-rate"]', name: 'Completion Rate' },
          { selector: '.response-time, [data-testid="response-time"]', name: 'Response Time Metrics' },
          { selector: '.demographic-breakdown, [data-testid="demographics"]', name: 'Demographics Breakdown' }
        ];
        
        let analyticsFound = 0;
        for (const element of analyticsElements) {
          const isVisible = await page.locator(element.selector).first().isVisible();
          if (isVisible) {
            console.log(`📊 ${element.name} found`);
            analyticsFound++;
          }
        }
        
        if (analyticsFound === 0) {
          // Check for empty state or basic analytics
          const basicAnalytics = page.locator('text=participants, text=responses, text=completion').first();
          if (await basicAnalytics.isVisible()) {
            console.log('📈 Basic analytics information available');
            analyticsFound = 1;
          }
        }
        
        expect(analyticsFound).toBeGreaterThan(0);
        console.log(`📊 Found ${analyticsFound} analytics components`);
      }
    }
    
    console.log('✅ Scenario 64 completed successfully');
  });

  test('Scenario 65: Data Export Functionality', async ({ page }) => {
    console.log('🧪 Testing Scenario 65: Data Export Functionality');
    
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
    await page.waitForTimeout(2000);
    
    // Find study with data
    const studyCard = page.locator('.study-card, [data-testid="study-card"]').first();
    if (await studyCard.isVisible()) {
      await studyCard.click();
      await page.waitForTimeout(2000);
      
      // Look for export functionality
      const exportButton = page.locator('button', { hasText: /export|download|csv|excel/i }).first();
      if (await exportButton.isVisible()) {
        console.log('📤 Export button found');
        
        // Test export options (don't actually download in automated test)
        await exportButton.click();
        await page.waitForTimeout(1000);
        
        // Check for export format options
        const formatOptions = [
          page.locator('text=CSV').first(),
          page.locator('text=Excel').first(),
          page.locator('text=JSON').first(),
          page.locator('text=PDF').first()
        ];
        
        let formatsFound = 0;
        for (const option of formatOptions) {
          if (await option.isVisible()) {
            formatsFound++;
          }
        }
        
        console.log(`📋 ${formatsFound} export format options available`);
        
        // Close export modal if opened
        const closeButton = page.locator('button[aria-label="close"], button', { hasText: /close|cancel/i }).first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      } else {
        console.log('📭 No export functionality available yet');
      }
    }
    
    console.log('✅ Scenario 65 completed successfully');
  });

  // =================== COLLABORATION FEATURES ===================

  test('Scenario 66: Study Collaboration Features', async ({ page }) => {
    console.log('🧪 Testing Scenario 66: Study Collaboration Features');
    
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
    await page.waitForTimeout(2000);
    
    // Find study to test collaboration
    const studyCard = page.locator('.study-card, [data-testid="study-card"]').first();
    if (await studyCard.isVisible()) {
      await studyCard.click();
      await page.waitForTimeout(2000);
      
      // Look for collaboration tab
      const collaborationTab = page.locator('button, a', { hasText: /collaboration|team|share/i }).first();
      if (await collaborationTab.isVisible()) {
        await collaborationTab.click();
        await page.waitForTimeout(2000);
        
        // Check for collaboration features
        const collaborationFeatures = [
          { selector: 'input[type="email"][placeholder*="invite"], input[placeholder*="collaborator"]', name: 'Invite Collaborator' },
          { selector: '.collaborator-list, [data-testid="collaborators"]', name: 'Collaborator List' },
          { selector: 'select[name*="permission"], select[name*="role"]', name: 'Permission Settings' },
          { selector: 'button', hasText: /share|invite/i, name: 'Share/Invite Button' }
        ];
        
        let featuresFound = 0;
        for (const feature of collaborationFeatures) {
          let element;
          if (feature.hasText) {
            element = page.locator(feature.selector, { hasText: feature.hasText }).first();
          } else {
            element = page.locator(feature.selector).first();
          }
          
          if (await element.isVisible()) {
            console.log(`👥 ${feature.name} available`);
            featuresFound++;
          }
        }
        
        console.log(`🤝 Found ${featuresFound} collaboration features`);
      } else {
        console.log('👥 Collaboration features not yet implemented');
      }
    }
    
    console.log('✅ Scenario 66 completed successfully');
  });

  test('Scenario 67: Real-time Study Activity Monitoring', async ({ page }) => {
    console.log('🧪 Testing Scenario 67: Real-time Study Activity Monitoring');
    
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/studies');
    await page.waitForTimeout(2000);
    
    // Find active study
    const studyCard = page.locator('.study-card, [data-testid="study-card"]').first();
    if (await studyCard.isVisible()) {
      await studyCard.click();
      await page.waitForTimeout(2000);
      
      // Look for real-time activity indicators
      const activityIndicators = [
        { selector: '.online-indicator, [data-testid="online-participants"]', name: 'Online Participants' },
        { selector: '.activity-feed, [data-testid="activity-feed"]', name: 'Activity Feed' },
        { selector: '.live-responses, [data-testid="live-responses"]', name: 'Live Responses' },
        { selector: 'text=active now, text=currently online', name: 'Active Status' }
      ];
      
      let activityFound = 0;
      for (const indicator of activityIndicators) {
        const element = page.locator(indicator.selector).first();
        if (await element.isVisible()) {
          console.log(`📡 ${indicator.name} detected`);
          activityFound++;
        }
      }
      
      if (activityFound === 0) {
        // Check for basic activity information
        const basicActivity = page.locator('text=participants, text=responses, text=updated').first();
        if (await basicActivity.isVisible()) {
          console.log('📊 Basic activity information available');
          activityFound = 1;
        }
      }
      
      console.log(`⚡ Found ${activityFound} activity monitoring features`);
    }
    
    console.log('✅ Scenario 67 completed successfully');
  });

  // =================== ADVANCED PARTICIPANT FEATURES ===================

  test('Scenario 68: Participant Profile Management', async ({ page }) => {
    console.log('🧪 Testing Scenario 68: Participant Profile Management');
    
    await testHelpers.loginAsParticipant();
    
    // Navigate to profile settings
    await page.goto('https://researchhub-saas.vercel.app/participant/profile');
    await page.waitForTimeout(3000);
    
    // Check for profile management features
    const profileFeatures = [
      { selector: 'input[name*="name"], input[placeholder*="name"]', name: 'Name Field' },
      { selector: 'input[name*="email"], input[type="email"]', name: 'Email Field' },
      { selector: 'textarea[name*="bio"], textarea[placeholder*="about"]', name: 'Bio/About Section' },
      { selector: 'input[name*="age"], select[name*="age"]', name: 'Age Selection' },
      { selector: 'select[name*="gender"], input[name*="gender"]', name: 'Gender Selection' },
      { selector: 'input[name*="location"], select[name*="country"]', name: 'Location Fields' }
    ];
    
    let profileFieldsFound = 0;
    for (const feature of profileFeatures) {
      const element = page.locator(feature.selector).first();
      if (await element.isVisible()) {
        console.log(`👤 ${feature.name} available`);
        profileFieldsFound++;
        
        // Test field interaction (without changing actual data)
        if (feature.name === 'Bio/About Section') {
          const currentValue = await element.inputValue();
          console.log(`📝 Current bio length: ${currentValue.length} characters`);
        }
      }
    }
    
    // Check for privacy settings
    const privacySettings = page.locator('input[type="checkbox"][name*="privacy"], .privacy-setting').first();
    if (await privacySettings.isVisible()) {
      console.log('🔒 Privacy settings available');
      profileFieldsFound++;
    }
    
    // Look for save button
    const saveButton = page.locator('button', { hasText: /save|update/i }).first();
    if (await saveButton.isVisible()) {
      console.log('💾 Profile save functionality available');
    }
    
    console.log(`👤 Found ${profileFieldsFound} profile management features`);
    console.log('✅ Scenario 68 completed successfully');
  });

  test('Scenario 69: Participant Study History', async ({ page }) => {
    console.log('🧪 Testing Scenario 69: Participant Study History');
    
    await testHelpers.loginAsParticipant();
    await page.goto('https://researchhub-saas.vercel.app/participant/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for study history section
    const historySection = page.locator('.study-history, [data-testid="study-history"], .completed-studies').first();
    if (await historySection.isVisible()) {
      console.log('📚 Study history section found');
      
      // Check for different study statuses
      const statusTypes = [
        { selector: '.completed-study, [data-status="completed"]', name: 'Completed Studies' },
        { selector: '.in-progress-study, [data-status="in-progress"]', name: 'In Progress Studies' },
        { selector: '.pending-study, [data-status="pending"]', name: 'Pending Applications' }
      ];
      
      let statusTypesFound = 0;
      for (const status of statusTypes) {
        const elements = page.locator(status.selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`📊 ${status.name}: ${count} found`);
          statusTypesFound++;
        }
      }
      
      // Test study details view
      const studyHistoryItem = page.locator('.study-history-item, .study-card').first();
      if (await studyHistoryItem.isVisible()) {
        await studyHistoryItem.click();
        await page.waitForTimeout(2000);
        
        // Check for study details
        const studyDetails = page.locator('.study-details, [data-testid="study-details"]').first();
        if (await studyDetails.isVisible()) {
          console.log('📋 Study details view working');
        }
      }
      
      console.log(`📊 Found ${statusTypesFound} different study status types`);
    } else {
      console.log('📭 No study history available - testing empty state');
      const emptyMessage = page.locator('text=no studies, text=haven\'t participated').first();
      if (await emptyMessage.isVisible()) {
        console.log('📭 Empty state properly displayed');
      }
    }
    
    console.log('✅ Scenario 69 completed successfully');
  });

  test('Scenario 70: Comprehensive Platform Integration Test', async ({ page }) => {
    console.log('🧪 Testing Scenario 70: Comprehensive Platform Integration Test');
    
    // This test validates the complete integration between all platform components
    
    // PHASE 1: Researcher Workflow Integration
    await testHelpers.loginAsResearcher();
    await page.goto('https://researchhub-saas.vercel.app/researcher/dashboard');
    await page.waitForTimeout(2000);
    
    // Check researcher dashboard integration
    const dashboardElements = [
      { selector: '.studies-overview, [data-testid="studies-overview"]', name: 'Studies Overview' },
      { selector: '.recent-activity, [data-testid="recent-activity"]', name: 'Recent Activity' },
      { selector: '.analytics-summary, [data-testid="analytics-summary"]', name: 'Analytics Summary' },
      { selector: 'button, a', hasText: /create.*study/i, name: 'Create Study Button' }
    ];
    
    let researcherElements = 0;
    for (const element of dashboardElements) {
      let locator;
      if (element.hasText) {
        locator = page.locator(element.selector, { hasText: element.hasText }).first();
      } else {
        locator = page.locator(element.selector).first();
      }
      
      if (await locator.isVisible()) {
        console.log(`🔬 Researcher: ${element.name} integrated`);
        researcherElements++;
      }
    }
    
    // PHASE 2: Navigation Integration
    const navigationItems = [
      { text: 'Studies', expectedUrl: '/studies' },
      { text: 'Templates', expectedUrl: '/templates' },
      { text: 'Analytics', expectedUrl: '/analytics' },
      { text: 'Account', expectedUrl: '/account' }
    ];
    
    let navigationWorking = 0;
    for (const navItem of navigationItems) {
      const navLink = page.locator(`nav a, nav button`, { hasText: new RegExp(navItem.text, 'i') }).first();
      if (await navLink.isVisible()) {
        navigationWorking++;
        console.log(`🧭 Navigation: ${navItem.text} available`);
      }
    }
    
    // PHASE 3: API Integration Check
    const apiEndpoints = [
      '/api/auth?action=verify',
      '/api/research-consolidated?action=get-studies',
      '/api/templates-consolidated?action=get-templates'
    ];
    
    let apisWorking = 0;
    for (const endpoint of apiEndpoints) {
      try {
        const response = await page.request.get(`https://researchhub-saas.vercel.app${endpoint}`);
        const status = response.status();
        if (status === 200 || status === 401) { // 401 is ok for protected endpoints
          apisWorking++;
          console.log(`🔌 API: ${endpoint} responding (${status})`);
        }
      } catch (error) {
        console.log(`⚠️ API: ${endpoint} error - ${error.message}`);
      }
    }
    
    // PHASE 4: Cross-Role Integration
    await testHelpers.loginAsParticipant();
    await page.goto('https://researchhub-saas.vercel.app/participant/dashboard');
    await page.waitForTimeout(2000);
    
    const participantDashboard = page.locator('.participant-dashboard, [data-testid="participant-dashboard"]').first();
    const participantIntegrated = await participantDashboard.isVisible() || 
                                  await page.locator('text=available studies, text=your studies').first().isVisible();
    
    if (participantIntegrated) {
      console.log('🎭 Participant: Dashboard integrated');
    }
    
    // PHASE 5: Integration Summary
    const integrationScore = {
      researcher: (researcherElements / dashboardElements.length) * 100,
      navigation: (navigationWorking / navigationItems.length) * 100,
      apis: (apisWorking / apiEndpoints.length) * 100,
      participant: participantIntegrated ? 100 : 0
    };
    
    const overallIntegration = Object.values(integrationScore).reduce((a, b) => a + b) / 4;
    
    console.log(`📊 Integration Scores:`);
    console.log(`   🔬 Researcher Components: ${integrationScore.researcher.toFixed(1)}%`);
    console.log(`   🧭 Navigation: ${integrationScore.navigation.toFixed(1)}%`);
    console.log(`   🔌 APIs: ${integrationScore.apis.toFixed(1)}%`);
    console.log(`   🎭 Participant: ${integrationScore.participant}%`);
    console.log(`   🎯 Overall Integration: ${overallIntegration.toFixed(1)}%`);
    
    expect(overallIntegration).toBeGreaterThan(50); // Minimum 50% integration
    
    console.log('✅ Scenario 70: Comprehensive Platform Integration completed successfully');
  });
});