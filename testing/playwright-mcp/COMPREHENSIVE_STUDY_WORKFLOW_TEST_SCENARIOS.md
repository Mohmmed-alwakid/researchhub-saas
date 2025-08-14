# 🎭 COMPREHENSIVE STUDY WORKFLOW TEST SCENARIOS
## Complete Playwright MCP Test Suite for ResearchHub

**Created**: August 14, 2025  
**Purpose**: Detailed test scenarios for complete study lifecycle with edge cases  
**Technology**: Playwright MCP for automated testing  
**Test Accounts**: abwanwr77+researcher@gmail.com / abwanwr77+participant@gmail.com / Testtest123

---

## 🎯 TEST SCENARIO OVERVIEW

### **Primary Workflow Test**
**Scenario**: Complete study lifecycle from creation to completion
**Actors**: Researcher, Participant, System
**Duration**: ~15-20 minutes automated test
**Validation Points**: 50+ checkpoints across entire workflow

### **Edge Cases & Error Scenarios**
**Purpose**: Test system behavior under abnormal conditions
**Focus**: Participant limits, timeouts, notifications, data integrity
**Coverage**: 25+ edge cases and error conditions

---

## 📋 MAIN WORKFLOW TEST SCENARIO

### **Phase 1: Study Creation (Researcher)**
```javascript
test('Complete Study Lifecycle - Main Workflow', async ({ browser }) => {
  // Setup: Two browser contexts for researcher and participant
  const researcherContext = await browser.newContext();
  const participantContext = await browser.newContext();
  
  const researcherPage = await researcherContext.newPage();
  const participantPage = await participantContext.newPage();

  // STEP 1: Researcher Login
  await researcherPage.goto('http://localhost:5175');
  await researcherPage.click('text=Login');
  await researcherPage.fill('[name="email"]', 'abwanwr77+researcher@gmail.com');
  await researcherPage.fill('[name="password"]', 'Testtest123');
  await researcherPage.click('button[type="submit"]');
  
  // Verify researcher dashboard access
  await expect(researcherPage).toHaveURL(/.*\/app\/dashboard/);
  await expect(researcherPage.locator('h1')).toContainText('Dashboard');

  // STEP 2: Navigate to Study Creation
  await researcherPage.click('text=Studies');
  await researcherPage.click('text=Create Study');
  
  // STEP 3: Configure Study Settings
  const studyTitle = `E2E Test Study ${Date.now()}`;
  await researcherPage.fill('[name="title"]', studyTitle);
  await researcherPage.fill('[name="description"]', 'Comprehensive test study for workflow validation');
  
  // Configure participant limits
  await researcherPage.fill('[name="maxParticipants"]', '1'); // KEY: Only 1 participant allowed
  await researcherPage.fill('[name="estimatedDuration"]', '10'); // 10 minutes
  await researcherPage.selectOption('[name="studyType"]', 'unmoderated');
  
  // STEP 4: Add Study Blocks
  await researcherPage.click('text=Add Block');
  
  // Add Welcome Block
  await researcherPage.click('text=Welcome Screen');
  await researcherPage.fill('[name="welcomeTitle"]', 'Welcome to Test Study');
  await researcherPage.fill('[name="welcomeMessage"]', 'Thank you for participating');
  await researcherPage.click('text=Save Block');
  
  // Add Open Question Block
  await researcherPage.click('text=Add Block');
  await researcherPage.click('text=Open Question');
  await researcherPage.fill('[name="questionText"]', 'What are your thoughts on this product?');
  await researcherPage.check('[name="required"]');
  await researcherPage.click('text=Save Block');
  
  // Add Opinion Scale Block
  await researcherPage.click('text=Add Block');
  await researcherPage.click('text=Opinion Scale');
  await researcherPage.fill('[name="scaleQuestion"]', 'Rate your satisfaction level');
  await researcherPage.selectOption('[name="scaleType"]', 'stars');
  await researcherPage.fill('[name="minValue"]', '1');
  await researcherPage.fill('[name="maxValue"]', '5');
  await researcherPage.click('text=Save Block');
  
  // STEP 5: Add Screening Questions
  await researcherPage.click('text=Screening Questions');
  await researcherPage.click('text=Add Screening Question');
  await researcherPage.fill('[name="screeningQuestion"]', 'Are you over 18 years old?');
  await researcherPage.selectOption('[name="questionType"]', 'yes_no');
  await researcherPage.selectOption('[name="correctAnswer"]', 'yes');
  await researcherPage.click('text=Save Screening Question');
  
  // STEP 6: Publish Study
  await researcherPage.click('text=Review & Publish');
  await expect(researcherPage.locator('.study-summary')).toBeVisible();
  await researcherPage.click('text=Publish Study');
  
  // Verify study is published
  await expect(researcherPage.locator('.success-message')).toContainText('Study published successfully');
  
  // Capture study ID for later use
  const studyUrl = researcherPage.url();
  const studyId = studyUrl.match(/\/studies\/([a-f0-9-]+)/)?.[1];
  expect(studyId).toBeTruthy();
```

### **Phase 2: Participant Application**
```javascript
  // STEP 7: Participant Login
  await participantPage.goto('http://localhost:5175');
  await participantPage.click('text=Login');
  await participantPage.fill('[name="email"]', 'abwanwr77+participant@gmail.com');
  await participantPage.fill('[name="password"]', 'Testtest123');
  await participantPage.click('button[type="submit"]');
  
  // Verify participant dashboard
  await expect(participantPage).toHaveURL(/.*\/app\/dashboard/);
  
  // STEP 8: Browse Available Studies
  await participantPage.click('text=Browse Studies');
  
  // Find and view the created study
  await participantPage.click(`text=${studyTitle}`);
  await expect(participantPage.locator('.study-details')).toBeVisible();
  
  // STEP 9: Apply for Study
  await participantPage.click('text=Apply for Study');
  
  // Complete screening questions
  await participantPage.click('text=Yes'); // Answer to "Are you over 18?"
  await participantPage.click('text=Submit Application');
  
  // Verify application submitted
  await expect(participantPage.locator('.application-success')).toContainText('Application submitted');
```

### **Phase 3: Researcher Review & Acceptance**
```javascript
  // STEP 10: Researcher Reviews Applications
  await researcherPage.goto(`http://localhost:5175/app/studies/${studyId}/applications`);
  
  // Verify application appears
  await expect(researcherPage.locator('.application-card')).toBeVisible();
  await expect(researcherPage.locator('.applicant-email')).toContainText('abwanwr77+participant@gmail.com');
  
  // STEP 11: Accept Participant
  await researcherPage.click('text=Accept');
  await expect(researcherPage.locator('.acceptance-success')).toContainText('Participant accepted');
  
  // Verify participant count updates
  await expect(researcherPage.locator('.participant-count')).toContainText('1/1 participants');
```

### **Phase 4: Study Execution**
```javascript
  // STEP 12: Participant Receives Notification
  await participantPage.goto('http://localhost:5175/app/dashboard');
  await expect(participantPage.locator('.notification')).toContainText('You have been accepted');
  
  // STEP 13: Start Study
  await participantPage.click('text=Start Study');
  await expect(participantPage.locator('.study-session')).toBeVisible();
  
  // STEP 14: Complete Welcome Block
  await expect(participantPage.locator('h2')).toContainText('Welcome to Test Study');
  await participantPage.click('text=Continue');
  
  // STEP 15: Complete Open Question Block
  await expect(participantPage.locator('.question-text')).toContainText('What are your thoughts');
  await participantPage.fill('textarea', 'This is a comprehensive test response with detailed feedback about the product experience.');
  await participantPage.click('text=Continue');
  
  // STEP 16: Complete Opinion Scale Block
  await expect(participantPage.locator('.scale-question')).toContainText('Rate your satisfaction');
  await participantPage.click('.star-rating .star:nth-child(4)'); // 4 stars
  await participantPage.click('text=Continue');
  
  // STEP 17: Complete Study
  await expect(participantPage.locator('.completion-message')).toContainText('Thank you for completing');
  await participantPage.click('text=Finish Study');
  
  // Verify study completion
  await expect(participantPage.locator('.completion-success')).toContainText('Study completed successfully');
```

### **Phase 5: Results Verification**
```javascript
  // STEP 18: Researcher Views Results
  await researcherPage.goto(`http://localhost:5175/app/studies/${studyId}/results`);
  
  // Verify response data
  await expect(researcherPage.locator('.response-count')).toContainText('1 response');
  await expect(researcherPage.locator('.completion-rate')).toContainText('100%');
  
  // Verify individual responses
  await researcherPage.click('text=View Details');
  await expect(researcherPage.locator('.response-text')).toContainText('comprehensive test response');
  await expect(researcherPage.locator('.rating-value')).toContainText('4');
  
  console.log('✅ Complete workflow test passed successfully');
});
```

---

## 🚨 EDGE CASE TEST SCENARIOS

### **Scenario 1: Participant Limit Exceeded**
```javascript
test('Edge Case: Multiple Participants Apply When Limit is 1', async ({ browser }) => {
  // Setup: Create study with 1 participant limit
  // Apply with participant 1 -> Accept
  // Apply with participant 2 -> Should be rejected or waitlisted
  
  const researcherContext = await browser.newContext();
  const participant1Context = await browser.newContext();
  const participant2Context = await browser.newContext();
  
  // STEP 1: Create study with maxParticipants = 1
  // ... (study creation code)
  
  // STEP 2: Participant 1 applies and gets accepted
  // ... (application code)
  
  // STEP 3: Researcher accepts participant 1
  // ... (acceptance code)
  
  // STEP 4: Participant 2 tries to apply
  const participant2Email = 'testuser2@example.com'; // Create temp account
  // ... (application attempt)
  
  // EXPECTED BEHAVIOR:
  // - Study should show as "Full" or "Not accepting applications"
  // - OR participant 2 should be added to waitlist
  // - Researcher should see warning when trying to accept beyond limit
  
  await expect(participant2Page.locator('.study-full-message')).toBeVisible();
  // OR
  await expect(participant2Page.locator('.waitlist-message')).toContainText('added to waitlist');
  
  // STEP 5: If researcher tries to accept beyond limit
  await researcherPage.click('text=Accept'); // Second participant
  await expect(researcherPage.locator('.error-message')).toContainText('participant limit exceeded');
});
```

### **Scenario 2: Study Timeout & Notifications**
```javascript
test('Edge Case: Participant Study Timeout and Notifications', async ({ browser }) => {
  // Test what happens when participant doesn't complete study on time
  
  // STEP 1: Create study with short deadline (e.g., 24 hours)
  await researcherPage.fill('[name="completionDeadline"]', '1'); // 1 day
  await researcherPage.check('[name="enableTimeoutNotifications"]');
  
  // STEP 2: Participant starts but doesn't complete
  await participantPage.click('text=Start Study');
  // Navigate through some blocks but don't complete
  
  // STEP 3: Simulate time passing (mock system time)
  // This would require either:
  // - Database manipulation to set timestamps
  // - System time mocking
  // - Wait for actual timeout (not practical for testing)
  
  // Mock approach - update database directly
  await page.evaluate(() => {
    // Simulate timeout condition in database
    fetch('/api/test-helpers/simulate-timeout', {
      method: 'POST',
      body: JSON.stringify({ sessionId: 'current-session-id' })
    });
  });
  
  // STEP 4: Check notification system
  // - Participant should receive reminder notifications
  // - Researcher should be notified of incomplete studies
  // - Study should be marked as "timed out"
  
  await expect(participantPage.locator('.timeout-notification')).toContainText('study expires soon');
  await expect(researcherPage.locator('.incomplete-study-alert')).toBeVisible();
});
```

### **Scenario 3: Mid-Study Exit and Resume**
```javascript
test('Edge Case: Participant Exits Mid-Study and Resumes', async ({ browser }) => {
  // Test study session persistence and resume functionality
  
  // STEP 1: Start study and complete some blocks
  await participantPage.click('text=Start Study');
  await participantPage.fill('textarea', 'Partial response');
  await participantPage.click('text=Continue');
  
  // STEP 2: Simulate browser crash/close
  await participantPage.close();
  
  // STEP 3: Reopen and login again
  const newParticipantPage = await participantContext.newPage();
  await newParticipantPage.goto('http://localhost:5175');
  // ... login process
  
  // STEP 4: Navigate to study - should resume from where left off
  await newParticipantPage.click('text=Continue Study');
  
  // EXPECTED BEHAVIOR:
  // - Should resume from exact block where stopped
  // - Previous responses should be preserved
  // - Progress indicator should show correct position
  
  await expect(newParticipantPage.locator('.resume-message')).toContainText('Resume from where you left off');
  await expect(newParticipantPage.locator('.progress-bar')).toHaveAttribute('data-progress', '50%');
});
```

### **Scenario 4: Network Interruption During Study**
```javascript
test('Edge Case: Network Interruption During Study Completion', async ({ browser }) => {
  // Test offline/online behavior and data persistence
  
  // STEP 1: Start study normally
  await participantPage.click('text=Start Study');
  
  // STEP 2: Simulate network interruption
  await participantPage.context().setOffline(true);
  
  // STEP 3: Try to submit response while offline
  await participantPage.fill('textarea', 'Response while offline');
  await participantPage.click('text=Continue');
  
  // EXPECTED BEHAVIOR:
  // - Should show offline indicator
  // - Response should be queued locally
  // - Should not lose data
  
  await expect(participantPage.locator('.offline-indicator')).toBeVisible();
  await expect(participantPage.locator('.data-queued-message')).toContainText('saved locally');
  
  // STEP 4: Restore network
  await participantPage.context().setOffline(false);
  
  // STEP 5: Continue study - should sync queued data
  await expect(participantPage.locator('.sync-success')).toContainText('data synchronized');
});
```

### **Scenario 5: Concurrent Study Sessions**
```javascript
test('Edge Case: Participant Opens Multiple Study Sessions', async ({ browser }) => {
  // Test behavior when participant opens same study in multiple tabs
  
  // STEP 1: Start study in first tab
  const tab1 = await participantContext.newPage();
  await tab1.goto('http://localhost:5175/app/studies/study-id/start');
  await tab1.fill('textarea', 'Response from tab 1');
  
  // STEP 2: Open same study in second tab
  const tab2 = await participantContext.newPage();
  await tab2.goto('http://localhost:5175/app/studies/study-id/start');
  
  // EXPECTED BEHAVIOR:
  // - Should detect existing session
  // - Should either redirect to existing session or show warning
  // - Should prevent data conflicts
  
  await expect(tab2.locator('.existing-session-warning')).toContainText('study already in progress');
  // OR
  await expect(tab2).toHaveURL(/.*\/continue-session/);
});
```

### **Scenario 6: Invalid Study State Transitions**
```javascript
test('Edge Case: Invalid Study State Transitions', async ({ browser }) => {
  // Test protection against invalid state changes
  
  // STEP 1: Create and publish study
  // ... (normal creation flow)
  
  // STEP 2: Try to modify published study inappropriately
  await researcherPage.goto(`/app/studies/${studyId}/edit`);
  
  // Should prevent editing of critical settings after publication
  await expect(researcherPage.locator('[name="maxParticipants"]')).toBeDisabled();
  await expect(researcherPage.locator('.edit-warning')).toContainText('cannot modify after participants accepted');
  
  // STEP 3: Try to delete study with active participants
  await researcherPage.click('text=Delete Study');
  await expect(researcherPage.locator('.delete-prevention')).toContainText('cannot delete with active participants');
});
```

### **Scenario 7: Data Validation and Quality Checks**
```javascript
test('Edge Case: Data Validation and Quality Assurance', async ({ browser }) => {
  // Test various data validation scenarios
  
  // STEP 1: Submit responses with edge case data
  
  // Empty required fields
  await participantPage.click('text=Continue'); // Without filling required field
  await expect(participantPage.locator('.validation-error')).toContainText('field is required');
  
  // Extremely long text responses
  const longText = 'a'.repeat(10000); // 10k characters
  await participantPage.fill('textarea', longText);
  await participantPage.click('text=Continue');
  await expect(participantPage.locator('.length-warning')).toContainText('response is very long');
  
  // Special characters and HTML injection attempts
  await participantPage.fill('textarea', '<script>alert("xss")</script>');
  await participantPage.click('text=Continue');
  // Should be sanitized - no alert should fire
  
  // File upload edge cases
  await participantPage.setInputFiles('[type="file"]', 'path/to/large-file.pdf'); // >10MB
  await expect(participantPage.locator('.file-size-error')).toContainText('file too large');
  
  await participantPage.setInputFiles('[type="file"]', 'path/to/malicious.exe');
  await expect(participantPage.locator('.file-type-error')).toContainText('file type not allowed');
});
```

---

## 🔄 NOTIFICATION & COMMUNICATION SCENARIOS

### **Scenario 8: Notification System Testing**
```javascript
test('Notification System - All Communication Types', async ({ browser }) => {
  // Test complete notification pipeline
  
  // STEP 1: Application notifications
  // - Participant applies -> Researcher gets notification
  // - Researcher accepts -> Participant gets notification
  // - Study starts -> Both get confirmation
  
  // STEP 2: Reminder notifications
  // - Study deadline approaching -> Participant reminder
  // - Incomplete study -> Researcher alert
  // - Study expires -> Both notified
  
  // STEP 3: Status change notifications
  // - Study paused -> Participants notified
  // - Study cancelled -> All stakeholders notified
  // - Results available -> Researcher notified
  
  // Verify notification delivery methods:
  await expect(page.locator('.in-app-notification')).toBeVisible();
  
  // Check email notifications (would require email testing service)
  // await expect(emailClient.getLatestEmail()).toContainText('study notification');
  
  // Verify notification preferences are respected
  await page.click('text=Notification Settings');
  await page.uncheck('[name="emailNotifications"]');
  // Trigger notification -> Should only appear in-app, not email
});
```

### **Scenario 9: Real-time Updates and WebSocket Testing**
```javascript
test('Real-time Updates - WebSocket Communication', async ({ browser }) => {
  // Test real-time features like live participant count updates
  
  // STEP 1: Monitor participant count in real-time
  await researcherPage.goto(`/app/studies/${studyId}/monitor`);
  const initialCount = await researcherPage.locator('.participant-count').textContent();
  
  // STEP 2: New participant applies in different browser
  // Should see count update immediately without refresh
  await participant2Page.click('text=Apply for Study');
  
  await expect(researcherPage.locator('.participant-count')).not.toContainText(initialCount);
  
  // STEP 3: Test live study progress updates
  await participantPage.click('text=Start Study');
  // Researcher should see live progress updates
  await expect(researcherPage.locator('.live-progress')).toContainText('in progress');
});
```

---

## 📊 PERFORMANCE & STRESS TESTING

### **Scenario 10: High Load and Performance Testing**
```javascript
test('Performance - Multiple Concurrent Participants', async ({ browser }) => {
  // Simulate multiple participants taking study simultaneously
  
  const participants = [];
  for (let i = 0; i < 10; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    participants.push(page);
  }
  
  // All participants start study at same time
  await Promise.all(participants.map(async (page, index) => {
    await page.goto(`/app/studies/${studyId}/start`);
    await page.fill('textarea', `Response from participant ${index}`);
    await page.click('text=Continue');
  }));
  
  // Verify system handles concurrent load
  await expect(researcherPage.locator('.response-count')).toContainText('10 responses');
  
  // Check response times are acceptable
  const performanceMetrics = await page.evaluate(() => performance.getEntriesByType('navigation')[0]);
  expect(performanceMetrics.loadEventEnd - performanceMetrics.loadEventStart).toBeLessThan(3000); // 3 seconds
});
```

---

## 🎯 AUTOMATED TEST EXECUTION

### **Complete Test Suite Runner**
```javascript
// File: testing/playwright-mcp/comprehensive-workflow-suite.spec.js

import { test, expect } from '@playwright/test';

test.describe('ResearchHub - Comprehensive Workflow Test Suite', () => {
  
  // Main workflow test
  test('Complete Study Lifecycle - Happy Path', async ({ browser }) => {
    // ... Main workflow implementation
  });
  
  // Edge case tests
  test('Edge Case: Participant Limit Exceeded', async ({ browser }) => {
    // ... Edge case implementation
  });
  
  test('Edge Case: Study Timeout Handling', async ({ browser }) => {
    // ... Timeout scenario implementation
  });
  
  test('Edge Case: Network Interruption Recovery', async ({ browser }) => {
    // ... Network testing implementation
  });
  
  // Performance tests
  test('Performance: Concurrent Participant Load', async ({ browser }) => {
    // ... Performance testing implementation
  });
  
  // Notification tests
  test('Notifications: Complete Communication Pipeline', async ({ browser }) => {
    // ... Notification testing implementation
  });
});
```

---

## 🚀 EXECUTION INSTRUCTIONS

### **Prerequisites**
```bash
# 1. Start local development environment
npm run dev:fullstack

# 2. Ensure test accounts exist and have correct roles
# - abwanwr77+researcher@gmail.com (researcher role)
# - abwanwr77+participant@gmail.com (participant role)

# 3. Reset test data (optional)
npm run test:data:reset
```

### **Run Tests**
```bash
# Run complete workflow test
npx playwright test comprehensive-workflow-suite.spec.js

# Run with browser visible (for debugging)
npx playwright test comprehensive-workflow-suite.spec.js --headed

# Run specific test scenario
npx playwright test -g "Edge Case: Participant Limit Exceeded"

# Generate test report
npx playwright test --reporter=html
```

### **Test Data Cleanup**
```bash
# Clean up test studies and data after testing
npm run test:cleanup
```

---

## 📋 VALIDATION CHECKLIST

### **✅ Main Workflow Validation**
- [ ] Study creation with all block types
- [ ] Screening questions functionality
- [ ] Participant application process
- [ ] Researcher review and acceptance
- [ ] Complete study execution
- [ ] Results collection and display
- [ ] Notification delivery at each step

### **✅ Edge Case Validation**
- [ ] Participant limit enforcement
- [ ] Study timeout handling
- [ ] Session resume functionality
- [ ] Network interruption recovery
- [ ] Concurrent session prevention
- [ ] Data validation and sanitization
- [ ] Invalid state transition prevention

### **✅ Quality Assurance**
- [ ] Response time < 3 seconds for all actions
- [ ] Data integrity maintained throughout
- [ ] Error messages are user-friendly
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

---

**This comprehensive test suite ensures ResearchHub's study workflow is robust, reliable, and handles all edge cases gracefully while maintaining excellent user experience for both researchers and participants.**
