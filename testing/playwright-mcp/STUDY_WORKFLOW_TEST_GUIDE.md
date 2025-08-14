# 🎭 ResearchHub Study Workflow Test Guide

## 📋 Overview

This comprehensive test suite validates the complete study lifecycle in ResearchHub, including normal workflows and edge cases. The tests use Playwright MCP for automated browser testing and cover scenarios from study creation to completion.

## 🎯 What Gets Tested

### **Main Workflow (Happy Path)**
```
1. Researcher Login → Dashboard Access
2. Study Creation → Block Configuration → Screening Questions
3. Study Publishing → Live Status
4. Participant Login → Study Discovery → Application
5. Researcher Review → Participant Acceptance
6. Study Execution → Block Completion → Data Collection
7. Results Verification → Response Analysis
```

### **Edge Cases & Error Scenarios**

#### **1. Participant Limit Exceeded**
- **Test**: What happens when multiple participants apply for a study with max 1 participant?
- **Expected Behavior**:
  - Study shows as "Full" after limit reached
  - Additional applications go to waitlist OR are rejected
  - Researcher gets warning when trying to accept beyond limit
  - Clear messaging to participants about study capacity

#### **2. Study Timeout & Notification Handling**
- **Test**: Participant starts study but doesn't complete on time
- **Expected Behavior**:
  - System tracks incomplete sessions
  - Timeout warnings displayed to participant
  - Reminder notifications sent before deadline
  - Researcher notified of incomplete studies
  - Study marked as "timed out" after deadline

#### **3. Session Management & Resume**
- **Test**: Participant exits mid-study and returns later
- **Expected Behavior**:
  - Session data preserved across browser sessions
  - Resume from exact block where stopped
  - Previous responses maintained
  - Progress indicator shows correct position

#### **4. Network Interruption Recovery**
- **Test**: Network goes offline during study completion
- **Expected Behavior**:
  - Offline indicator appears
  - Responses queued locally (no data loss)
  - Automatic sync when connection restored
  - Graceful degradation of functionality

#### **5. Concurrent Session Prevention**
- **Test**: Participant opens same study in multiple browser tabs
- **Expected Behavior**:
  - System detects existing session
  - Warning about study already in progress
  - Redirects to existing session OR prevents duplicate
  - Data integrity maintained

#### **6. Data Validation & Quality**
- **Test**: Various invalid input scenarios
- **Expected Behavior**:
  - Required field validation
  - Long text response handling
  - HTML/script injection prevention
  - File upload restrictions (size, type)
  - Input sanitization

#### **7. Invalid State Transitions**
- **Test**: Attempt invalid study modifications
- **Expected Behavior**:
  - Prevent editing critical settings after publication
  - Block deletion of studies with active participants
  - Maintain data integrity during state changes

## 🚀 How to Run Tests

### **Prerequisites**
```bash
# 1. Start local development environment
npm run dev:fullstack

# 2. Verify test accounts exist:
# - abwanwr77+researcher@gmail.com / Testtest123
# - abwanwr77+participant@gmail.com / Testtest123

# 3. Ensure Playwright is installed
npx playwright install
```

### **Quick Start (Windows)**
```bash
# Run the interactive test menu
.\run-study-workflow-tests.bat

# Options:
# 1. Quick Test (Main workflow only) - 5-10 minutes
# 2. Complete Test Suite (All scenarios) - 20-30 minutes  
# 3. Performance Test Only - 2-3 minutes
# 4. Edge Cases Only - 15-20 minutes
# 5. Custom Test (Interactive) - Variable
```

### **Direct Commands**
```bash
# Main workflow test only
npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Main Workflow" --headed

# All edge cases
npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Edge Case" --headed

# Performance validation
npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Performance" --headed

# Complete suite with reporting
node testing/playwright-mcp/run-comprehensive-tests.js
```

### **Test Options**
```bash
# Run with browser visible (for debugging)
--headed

# Run in headless mode (faster)
--headed=false

# Specific browser
--project=chromium|firefox|webkit

# Generate HTML report
--reporter=html

# Retry failed tests
--retries=2

# Timeout per test
--timeout=300000
```

## 📊 Test Results & Reporting

### **Console Output**
Tests provide real-time console output showing:
- ✅ Successful steps with checkmarks
- ❌ Failed steps with error details
- ⚠️ Warnings and edge case handling
- 📊 Performance metrics and timing

### **Generated Reports**
```
testing/reports/workflow-test-[timestamp]/
├── report.html          # Interactive HTML report
├── report.json          # Machine-readable results
├── summary.txt          # Human-readable summary
└── screenshots/         # Screenshots of failures
```

### **HTML Report Features**
- 📈 Visual test summary with pass/fail counts
- 🔍 Detailed test results with timing
- 📸 Screenshots for failed tests
- 🎯 Recommendations for fixing issues
- 📊 Performance metrics and trends

## 🛠️ Test Configuration

### **Environment Settings** (`comprehensive-study-workflow.spec.js`)
```javascript
const CONFIG = {
  baseUrl: 'http://localhost:5175',
  timeouts: {
    navigation: 10000,  // Page navigation timeout
    action: 5000,       // User action timeout  
    assertion: 3000     // Assertion timeout
  }
};
```

### **Test Accounts** (Required)
```javascript
researcher: {
  email: 'abwanwr77+researcher@gmail.com',
  password: 'Testtest123'
},
participant: {
  email: 'abwanwr77+participant@gmail.com', 
  password: 'Testtest123'
}
```

## 🎯 Specific Edge Case Scenarios

### **Scenario 1: Researcher accepts 2 participants when study limit is 1**
```
1. Study configured with maxParticipants = 1
2. Participant A applies → Gets accepted
3. Participant B applies → Should be waitlisted/rejected
4. Researcher tries to accept Participant B → System prevents or warns
5. Study status shows "Full" to new applicants
```

### **Scenario 2: Participant doesn't complete study on time**
```
1. Study has completion deadline (e.g., 24 hours)
2. Participant starts study, completes some blocks
3. Time passes beyond deadline
4. System sends reminder notifications
5. Study marked as incomplete/timed out
6. Researcher notified of non-completion
```

### **Scenario 3: Network interruption during study**
```
1. Participant starts study normally
2. Completes some blocks with responses
3. Network connection lost mid-study
4. Participant tries to continue → Offline mode
5. Responses saved locally
6. Network restored → Data synced automatically
```

## 🔧 Debugging & Troubleshooting

### **Common Issues**

#### **Test Fails: "Could not find login button"**
```bash
# Solution: Check if local server is running
npm run dev:fullstack

# Verify UI is accessible
curl http://localhost:5175
```

#### **Test Fails: "Navigation timeout"**
```bash
# Solution: Increase timeout or check network
# Edit CONFIG.timeouts.navigation in test file
```

#### **Test Fails: "Study creation failed"**
```bash
# Solution: Check API endpoints
curl http://localhost:3003/api/health

# Verify database connection
# Check Supabase status
```

### **Debug Mode**
```bash
# Run with browser visible and slow motion
npx playwright test --headed --slowMo=1000

# Generate trace for debugging
npx playwright test --trace=on

# View trace
npx playwright show-trace trace.zip
```

### **Screenshot Analysis**
Failed tests automatically capture screenshots:
```
testing/screenshots/
├── main-workflow-researcher-error-[timestamp].png
├── main-workflow-participant-error-[timestamp].png
└── edge-case-[scenario]-error-[timestamp].png
```

## 📈 Performance Expectations

### **Timing Benchmarks**
- **Page Load**: < 3 seconds
- **API Response**: < 1 second  
- **Study Creation**: < 30 seconds
- **Study Completion**: < 10 minutes
- **Complete Workflow**: < 15 minutes

### **Success Criteria**
- **Main Workflow**: 100% success required
- **Edge Cases**: 80%+ success acceptable
- **Performance**: All metrics within benchmarks
- **Data Integrity**: No data loss in any scenario

## 🎯 Next Steps After Testing

### **If All Tests Pass (100% Success)**
```
✅ System ready for production deployment
✅ All workflows function correctly
✅ Edge cases handled gracefully
✅ Performance meets requirements
```

### **If Tests Fail**
```
1. Review failed test details in HTML report
2. Check screenshots for visual issues
3. Fix identified problems in code
4. Re-run specific failed tests
5. Validate fixes don't break other functionality
```

### **Continuous Testing**
```bash
# Add to CI/CD pipeline
npm run test:workflow:quick    # Before each deployment
npm run test:workflow:full     # Weekly comprehensive check
npm run test:workflow:perf     # Performance monitoring
```

## 🔄 Test Maintenance

### **Updating Tests**
- Modify test scenarios in `comprehensive-study-workflow.spec.js`
- Update helper functions for UI changes
- Add new edge cases as they're discovered
- Keep test accounts and data current

### **Adding New Scenarios**
```javascript
test('New Edge Case: Custom Scenario', async ({ browser }) => {
  // Test implementation
  // Follow existing patterns and helper functions
  // Add proper error handling and cleanup
});
```

## 📞 Support

For test issues or questions:
1. Check console output for specific error messages
2. Review generated HTML report for detailed analysis
3. Examine screenshots for visual debugging
4. Verify environment setup and prerequisites
5. Ensure test accounts have correct permissions

---

**This test suite ensures ResearchHub's study workflow is robust, reliable, and handles all edge cases gracefully while maintaining excellent user experience for both researchers and participants.**
