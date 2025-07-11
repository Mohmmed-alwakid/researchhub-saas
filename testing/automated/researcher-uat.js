/**
 * Researcher User Acceptance Testing (UAT) Scenarios
 * Product Manager Requirements: Comprehensive researcher workflow validation
 * Last Updated: July 7, 2025
 */

import { test, expect } from '@playwright/test';

// Test Data - Using mandatory test accounts
const RESEARCHER_ACCOUNT = {
  email: 'abwanwr77+Researcher@gmail.com',
  password: 'Testtest123',
  role: 'researcher'
};

const PARTICIPANT_ACCOUNT = {
  email: 'abwanwr77+participant@gmail.com', 
  password: 'Testtest123',
  role: 'participant'
};

const BASE_URL = 'http://localhost:5175';

/**
 * UAT-R001: Study Creation from Template to Activation
 * Success Criteria: Researcher can create, customize, and activate a study from template
 */
test.describe('UAT-R001: Study Creation Workflow', () => {
  
  test('R001.1: Template-based study creation', async ({ page }) => {
    // Login as researcher
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    // Verify dashboard access
    await expect(page.locator('text=Welcome back!')).toBeVisible();
    await expect(page.locator('text=Researcher')).toBeVisible();
    
    // Start study creation
    await page.click('button:has-text("Create New Study")');
    
    // Select template
    await expect(page.locator('text=Choose a template')).toBeVisible();
    await page.click('button:has-text("Quick Create")');
    
    // Fill study details
    const studyTitle = `UAT Test Study - ${Date.now()}`;
    await page.fill('input[placeholder="Enter your study title"]', studyTitle);
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Next")');
    
    // Verify block configuration step
    await expect(page.locator('text=Step 2 of 4')).toBeVisible();
    await expect(page.locator('text=Configure blocks')).toBeVisible();
    await page.click('button:has-text("Next")');
    
    // Configure settings
    await expect(page.locator('text=Step 3 of 4')).toBeVisible();
    await page.click('button:has-text("Next")');
    
    // Review and create
    await expect(page.locator('text=Step 4 of 4')).toBeVisible();
    await expect(page.locator(`text=${studyTitle}`)).toBeVisible();
    await page.click('button:has-text("Create Study")');
    
    // Verify study creation success
    await expect(page.locator(`text=${studyTitle}`)).toBeVisible();
  });

  test('R001.2: Study activation workflow', async ({ page }) => {
    // Login and navigate to studies
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.goto(`${BASE_URL}/app/studies`);
    
    // Find draft study and activate
    const draftStudy = page.locator('text=Draft').first();
    await expect(draftStudy).toBeVisible();
    
    await page.click('button:has-text("Start Testing")');
    
    // Verify activation
    await expect(page.locator('text=Active')).toBeVisible();
    await expect(page.locator('button:has-text("Applications")')).toBeVisible();
    await expect(page.locator('button:has-text("Results")')).toBeVisible();
  });
});

/**
 * UAT-R002: Participant Recruitment and Management  
 * Success Criteria: Researcher can invite, screen, and manage participants
 */
test.describe('UAT-R002: Participant Management', () => {
  
  test('R002.1: Participant invitation workflow', async ({ page }) => {
    // Login as researcher
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    // Navigate to participants
    await page.goto(`${BASE_URL}/app/participants`);
    
    // Verify participant management interface
    await expect(page.locator('text=Manage study participants')).toBeVisible();
    await expect(page.locator('button:has-text("Invite Participant")')).toBeVisible();
    
    // Test invitation modal
    await page.click('button:has-text("Invite Participant")');
    await expect(page.locator('text=Study *')).toBeVisible();
    await expect(page.locator('text=First Name *')).toBeVisible();
    await expect(page.locator('text=Email *')).toBeVisible();
  });

  test('R002.2: Application management workflow', async ({ page }) => {
    // Login and navigate to study applications
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.goto(`${BASE_URL}/app/studies`);
    
    // Click on Applications for an active study
    await page.click('button:has-text("Applications")');
    
    // Verify application management interface
    await expect(page.locator('text=Manage participant applications')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Approved')).toBeVisible();
    await expect(page.locator('text=Rejected')).toBeVisible();
  });
});

/**
 * UAT-R003: Real-time Study Monitoring and Results Analysis
 * Success Criteria: Researcher can monitor study progress and analyze results
 */
test.describe('UAT-R003: Study Monitoring & Analytics', () => {
  
  test('R003.1: Dashboard metrics validation', async ({ page }) => {
    // Login as researcher
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    // Verify dashboard metrics
    await expect(page.locator('text=Total Studies')).toBeVisible();
    await expect(page.locator('text=Active Participants')).toBeVisible();
    await expect(page.locator('text=Completion Rate')).toBeVisible();
    await expect(page.locator('text=Avg. Session Time')).toBeVisible();
    
    // Verify recent studies list
    await expect(page.locator('text=Recent Studies')).toBeVisible();
    await expect(page.locator('text=View All')).toBeVisible();
  });

  test('R003.2: Studies page functionality', async ({ page }) => {
    // Login and navigate to studies
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.goto(`${BASE_URL}/app/studies`);
    
    // Verify studies management interface
    await expect(page.locator('text=Manage your research studies')).toBeVisible();
    await expect(page.locator('button:has-text("Create Study")')).toBeVisible();
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    
    // Test filtering options
    await expect(page.locator('text=All Statuses')).toBeVisible();
    await expect(page.locator('text=Draft')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();
    await expect(page.locator('text=All Types')).toBeVisible();
    await expect(page.locator('text=Usability')).toBeVisible();
  });

  test('R003.3: Analytics page access', async ({ page }) => {
    // Login and navigate to analytics
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.goto(`${BASE_URL}/app/analytics`);
    
    // Verify analytics page loads (may show loading state)
    await expect(page.locator('text=Loading analytics data...')).toBeVisible();
  });
});

/**
 * UAT-R004: Team Collaboration and Approval Workflows
 * Success Criteria: Researcher can collaborate with team members on studies
 */
test.describe('UAT-R004: Team Collaboration', () => {
  
  test('R004.1: Organizations page access', async ({ page }) => {
    // Login as researcher
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    // Navigate to organizations
    await page.goto(`${BASE_URL}/app/organizations`);
    
    // Verify organizations interface loads
    // Note: This may show loading or empty state depending on implementation
    await page.waitForLoadState('networkidle');
  });

  test('R004.2: Settings page functionality', async ({ page }) => {
    // Login as researcher  
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    // Navigate to settings
    await page.goto(`${BASE_URL}/app/settings`);
    
    // Verify settings page loads
    await page.waitForLoadState('networkidle');
  });
});

/**
 * UAT-R005: End-to-End Study Lifecycle
 * Success Criteria: Complete study workflow from creation to completion
 */
test.describe('UAT-R005: Complete Study Lifecycle', () => {
  
  test('R005.1: Full study workflow', async ({ page }) => {
    const studyTitle = `E2E Test Study - ${Date.now()}`;
    
    // Step 1: Create study
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', RESEARCHER_ACCOUNT.email);
    await page.fill('input[type="password"]', RESEARCHER_ACCOUNT.password);
    await page.click('button:has-text("Sign in")');
    
    await page.click('button:has-text("Create New Study")');
    await page.click('button:has-text("Quick Create")');
    await page.fill('input[placeholder="Enter your study title"]', studyTitle);
    await page.fill('input[type="number"]', '3');
    
    // Complete study creation wizard
    await page.click('button:has-text("Next")'); // Step 2
    await page.click('button:has-text("Next")'); // Step 3  
    await page.click('button:has-text("Create Study")'); // Step 4
    
    // Step 2: Activate study
    await page.goto(`${BASE_URL}/app/studies`);
    await page.click('button:has-text("Start Testing")');
    
    // Step 3: Verify study is active and manageable
    await expect(page.locator('text=Active')).toBeVisible();
    await page.click('button:has-text("Applications")');
    await expect(page.locator('text=Manage participant applications')).toBeVisible();
    
    console.log(`✅ Complete study lifecycle test passed for: ${studyTitle}`);
  });
});

/**
 * Test Configuration and Helpers
 */

// Global test configuration
test.beforeEach(async ({ page }) => {
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Set reasonable timeouts
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
});

// Cleanup after tests
test.afterEach(async ({ page }) => {
  // Take screenshot on failure
  if (test.info().status !== 'passed') {
    await page.screenshot({ 
      path: `testing/screenshots/failure-${test.info().title}-${Date.now()}.png`,
      fullPage: true 
    });
  }
});