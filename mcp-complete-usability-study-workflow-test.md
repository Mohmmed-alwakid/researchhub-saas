# Complete Usability Study Workflow Test Plan 
## Using Playwright MCP for End-to-End Testing

**Date**: June 24, 2025  
**Purpose**: Test complete workflow from researcher study creation to participant completion  
**Study Type**: Usability Testing  
**Test Environment**: Local Development (`http://localhost:5175` & `http://localhost:3003`)

---

## 🎯 Test Objectives

### Primary Goal
Validate the complete end-to-end usability study workflow:
1. **Researcher creates usability study**
2. **Participant discovers and applies for study**
3. **Researcher reviews and approves application**
4. **Participant completes the usability study**

### Success Criteria
- ✅ Study creation workflow completes successfully
- ✅ Study appears in public discovery for participants
- ✅ Application submission and approval process works
- ✅ Participant can access and complete approved study
- ✅ All data is properly saved and accessible

---

## 👥 Test Accounts (MANDATORY - Use Only These)

```typescript
const TEST_ACCOUNTS = {
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123',
    role: 'researcher'
  },
  participant: {
    email: 'abwanwr77+participant@gmail.com', 
    password: 'Testtest123',
    role: 'participant'
  }
};
```

---

## 📋 User Stories & Test Scenarios

### User Story 1: Researcher Creates Usability Study
**As a** UX researcher  
**I want to** create a usability study to test our new e-commerce checkout flow  
**So that** I can identify usability issues and improve user experience  

**Acceptance Criteria:**
- ✅ I can login to ResearchHub as a researcher
- ✅ I can navigate to study creation page
- ✅ I can select "Usability Testing" as study type
- ✅ I can configure study details (title, description, duration, compensation)
- ✅ I can add usability tasks (navigation, prototype testing, user feedback)
- ✅ I can publish the study for participant recruitment
- ✅ Study appears in my studies dashboard

**Test Implementation:**
```typescript
// Playwright Test Steps
1. Navigate to http://localhost:5175
2. Click "Login" button
3. Enter researcher credentials
4. Navigate to "Create Study" or "/app/studies/new"
5. Select study type: "Usability Testing"
6. Fill study information:
   - Title: "E-commerce Checkout Flow Usability Study"
   - Description: "Test the new checkout process for usability issues"
   - Duration: 30 minutes
   - Compensation: $15
   - Max Participants: 5
7. Add usability tasks:
   - Website navigation task
   - Checkout completion task
   - User feedback collection
8. Configure recording settings (screen recording enabled)
9. Set study status to "Active" and "Public"
10. Save and publish study
11. Verify study appears in studies list
```

---

### User Story 2: Participant Discovers and Applies for Study
**As a** potential study participant  
**I want to** find and apply for usability studies that match my interests  
**So that** I can earn compensation while helping improve products  

**Acceptance Criteria:**
- ✅ I can login to ResearchHub as a participant
- ✅ I can browse available studies
- ✅ I can view detailed study information
- ✅ I can submit an application for the usability study
- ✅ I receive confirmation of my application
- ✅ Application appears in my "My Applications" dashboard

**Test Implementation:**
```typescript
// Playwright Test Steps
1. Logout from researcher account
2. Login as participant
3. Navigate to "Discover Studies" or "/app/discover"
4. Find "E-commerce Checkout Flow Usability Study"
5. Click on study to view details
6. Review study requirements:
   - Duration: 30 minutes
   - Compensation: $15
   - Tasks: Checkout flow testing
7. Click "Apply to Participate"
8. Fill application form (if screening questions exist)
9. Submit application
10. Verify confirmation message
11. Navigate to "My Applications"
12. Verify application appears with "Pending" status
```

---

### User Story 3: Researcher Reviews and Approves Application
**As a** researcher  
**I want to** review participant applications for my usability study  
**So that** I can select qualified participants who meet the study criteria  

**Acceptance Criteria:**
- ✅ I can view all applications for my study
- ✅ I can review participant information
- ✅ I can approve or reject applications with notes
- ✅ Participants are notified of approval status
- ✅ Approved participants can proceed to study execution

**Test Implementation:**
```typescript
// Playwright Test Steps
1. Logout from participant account
2. Login as researcher
3. Navigate to "My Studies" dashboard
4. Find "E-commerce Checkout Flow Usability Study"
5. Click on study to view details
6. Navigate to "Applications" or "Participants" tab
7. Review pending application from test participant
8. Check participant profile and application data
9. Click "Approve Application"
10. Add approval notes: "Participant meets all criteria"
11. Confirm approval
12. Verify application status changes to "Approved"
```

---

### User Story 4: Participant Completes Usability Study
**As an** approved participant  
**I want to** complete the usability study tasks  
**So that** I can provide valuable feedback and receive compensation  

**Acceptance Criteria:**
- ✅ I can access my approved study
- ✅ I can start the study session
- ✅ I can complete all usability tasks
- ✅ Screen recording captures my interactions (if enabled)
- ✅ I can submit feedback and complete the study
- ✅ Study shows as "Completed" in my dashboard

**Test Implementation:**
```typescript
// Playwright Test Steps
1. Logout from researcher account
2. Login as participant
3. Navigate to "My Applications"
4. Find approved "E-commerce Checkout Flow Usability Study"
5. Click "Start Study" or "Begin Participation"
6. Review study instructions and consent
7. Begin study session:
   - Task 1: Navigate to checkout page
   - Task 2: Complete purchase flow
   - Task 3: Provide feedback on experience
8. Complete each task following instructions
9. Submit post-study questionnaire
10. Confirm study completion
11. Verify study status shows "Completed"
12. Check that completion is recorded in researcher dashboard
```

---

## 🛠 Technical Implementation Plan

### Environment Setup
```bash
# Ensure local development environment is running
npm run dev:fullstack

# Verify both services are running:
# - Frontend: http://localhost:5175
# - Backend API: http://localhost:3003
```

### Playwright MCP Test Structure
```typescript
// Main test file: usability-study-complete-workflow.spec.ts

describe('Complete Usability Study Workflow', () => {
  let page: Page;
  let studyId: string;
  let applicationId: string;

  beforeAll(async () => {
    // Setup browser and page
  });

  test('1. Researcher creates usability study', async () => {
    // Implementation for User Story 1
  });

  test('2. Participant discovers and applies for study', async () => {
    // Implementation for User Story 2
  });

  test('3. Researcher reviews and approves application', async () => {
    // Implementation for User Story 3
  });

  test('4. Participant completes usability study', async () => {
    // Implementation for User Story 4
  });

  afterAll(async () => {
    // Cleanup
  });
});
```

### Data Flow Validation
```typescript
// Key data points to validate throughout workflow
interface WorkflowValidation {
  study: {
    id: string;
    title: string;
    type: 'usability_test';
    status: 'active';
    isPublic: true;
  };
  application: {
    id: string;
    studyId: string;
    participantId: string;
    status: 'pending' | 'approved' | 'completed';
  };
  session: {
    id: string;
    studyId: string;
    participantId: string;
    status: 'active' | 'completed';
    recordingData?: object;
  };
}
```

---

## 🧪 Testing Approach

### 1. Browser Automation (Playwright MCP)
- **Real user interactions**: Click, type, navigate
- **Screenshot capture**: Document each step
- **Element validation**: Verify UI elements exist and function
- **Network monitoring**: Validate API calls and responses

### 2. API Validation
- **Study creation**: POST /api/studies
- **Study discovery**: GET /api/participant-applications?endpoint=studies/public
- **Application submission**: POST /api/participant-applications?endpoint=studies/{id}/apply
- **Application review**: PATCH /api/researcher-applications?endpoint=applications/{id}/review
- **Session management**: POST /api/sessions/start/{studyId}

### 3. Data Persistence Verification
- **Database checks**: Validate data is correctly stored
- **State management**: Ensure proper state transitions
- **Security validation**: Verify RLS policies working

---

## 📊 Expected Results

### Study Creation Results
```json
{
  "study": {
    "_id": "generated-study-id",
    "title": "E-commerce Checkout Flow Usability Study",
    "type": "usability_test",
    "status": "active",
    "settings": {
      "maxParticipants": 5,
      "duration": 30,
      "compensation": 15,
      "recordScreen": true
    },
    "tasks": [
      "website_navigation",
      "checkout_completion", 
      "user_feedback"
    ]
  }
}
```

### Application Workflow Results
```json
{
  "application": {
    "id": "generated-application-id",
    "studyId": "study-id",
    "participantId": "participant-id",
    "status": "approved",
    "appliedAt": "2025-06-24T...",
    "reviewedAt": "2025-06-24T...",
    "notes": "Participant meets all criteria"
  }
}
```

### Session Completion Results
```json
{
  "session": {
    "id": "generated-session-id",
    "studyId": "study-id", 
    "participantId": "participant-id",
    "status": "completed",
    "completedAt": "2025-06-24T...",
    "taskResults": [
      {
        "taskId": "website_navigation",
        "completed": true,
        "duration": 300
      },
      {
        "taskId": "checkout_completion",
        "completed": true,
        "duration": 600
      }
    ]
  }
}
```

---

## 🚨 Error Scenarios to Test

### Authentication Failures
- Invalid credentials
- Token expiration
- Role permission errors

### Study Creation Failures
- Missing required fields
- Invalid study configuration
- Database connection issues

### Application Process Failures
- Duplicate applications
- Study not available
- Application submission errors

### Session Management Failures
- Study not accessible
- Recording setup failures
- Task completion errors

---

## 📈 Success Metrics

### Functional Metrics
- ✅ 100% test steps complete successfully
- ✅ All API endpoints respond correctly
- ✅ Data persists correctly in database
- ✅ User experience flows smoothly

### Performance Metrics
- ⏱️ Study creation completes in < 30 seconds
- ⏱️ Study discovery loads in < 5 seconds
- ⏱️ Application submission completes in < 10 seconds
- ⏱️ Study session starts in < 15 seconds

### Business Logic Metrics
- 📊 Study visibility controls work correctly
- 📊 Application approval workflow functions
- 📊 Participant can only access approved studies
- 📊 Data integrity maintained throughout workflow

---

## 🔧 Implementation Notes

### Prerequisites
1. **Local environment running**: `npm run dev:fullstack`
2. **Test accounts verified**: Ensure roles are correct
3. **Database clean state**: Clear any existing test data
4. **Playwright configured**: MCP tools available

### Test Execution Strategy
1. **Sequential execution**: Run tests in order (dependencies)
2. **Data cleanup**: Clean test data between runs
3. **Screenshot documentation**: Capture key steps
4. **Error logging**: Detailed logging for debugging

### Post-Test Validation
1. **Manual verification**: Spot-check key functionality
2. **Database inspection**: Verify data integrity
3. **Log analysis**: Review for any errors or warnings
4. **Performance review**: Check response times

---

This comprehensive test plan will validate the complete usability study workflow using realistic user scenarios and Playwright MCP automation. The test will ensure that ResearchHub can successfully handle the full participant research lifecycle from study creation to completion.
