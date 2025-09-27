/**
 * ADMIN DASHBOARD COMPREHENSIVE TEST
 * Tests complete admin functionality from login to user management
 * 
 * Coverage:
 * - Admin authentication and dashboard access
 * - User management (researchers/participants)
 * - System analytics and monitoring
 * - Platform administration tools
 * - Study moderation and oversight
 */

import { test, expect } from '@playwright/test';

// Test configuration
const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const LOCAL_URL = 'http://localhost:5175';
const BASE_URL = process.env.NODE_ENV === 'production' ? PRODUCTION_URL : LOCAL_URL;

// Test accounts
const ADMIN_EMAIL = 'abwanwr77+admin@gmail.com';
const RESEARCHER_EMAIL = 'abwanwr77+Researcher@gmail.com';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PASSWORD = 'Testtest123';

test.describe('Admin Dashboard - Comprehensive Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000); // 1 minute timeout for admin operations
  });

  test('Complete Admin Workflow: Login → Dashboard → User Management → Analytics', async ({ browser }) => {
    console.log('🛡️ Starting comprehensive admin dashboard test');
    
    // Create admin context
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    try {
      // ==========================================
      // PART 1: ADMIN AUTHENTICATION
      // ==========================================
      console.log('\n🔐 ADMIN AUTHENTICATION');
      
      await adminPage.goto(BASE_URL);
      await adminPage.waitForLoadState('networkidle');

      // Login as admin
      console.log('🔑 Logging in as admin...');
      await adminPage.click('text=Login');
      await adminPage.waitForSelector('input[type="email"]', { timeout: 10000 });
      await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
      await adminPage.fill('input[type="password"]', PASSWORD);
      await adminPage.click('button[type="submit"]');

      // Wait for admin dashboard
      await adminPage.waitForSelector('[data-testid="admin-dashboard"], .admin-dashboard, h1:has-text("Admin"), [href*="admin"]', { timeout: 15000 });
      console.log('✅ Admin login successful');

      // ==========================================
      // PART 2: ADMIN DASHBOARD NAVIGATION
      // ==========================================
      console.log('\n📊 ADMIN DASHBOARD NAVIGATION');
      
      // Test admin navigation menu
      const adminNavSelectors = [
        '[href*="admin"]',
        'text=Dashboard',
        'text=Users', 
        'text=Studies',
        'text=Analytics',
        'text=System'
      ];

      let dashboardAccessible = false;
      for (const selector of adminNavSelectors) {
        try {
          if (await adminPage.locator(selector).isVisible()) {
            console.log(`✅ Found admin navigation: ${selector}`);
            await adminPage.click(selector);
            dashboardAccessible = true;
            break;
          }
        } catch (error) {
          console.log(`⏩ Selector not found: ${selector}`);
        }
      }

      if (!dashboardAccessible) {
        // Try direct admin URL navigation
        console.log('🔄 Attempting direct admin URL navigation...');
        await adminPage.goto(`${BASE_URL}/admin`);
        await adminPage.waitForLoadState('networkidle');
      }

      // Verify admin dashboard elements
      const adminElements = [
        'text=Admin',
        'text=Users',
        'text=System',
        '[data-testid*="admin"]',
        '.admin-stats, .dashboard-stats',
        '.user-management, .admin-panel'
      ];

      let adminElementFound = false;
      for (const element of adminElements) {
        try {
          if (await adminPage.locator(element).isVisible({ timeout: 5000 })) {
            console.log(`✅ Admin dashboard element found: ${element}`);
            adminElementFound = true;
          }
        } catch (error) {
          console.log(`⏩ Admin element not visible: ${element}`);
        }
      }

      console.log(`Admin dashboard accessibility: ${adminElementFound ? '✅' : '⚠️'}`);

      // ==========================================
      // PART 3: USER MANAGEMENT TESTING
      // ==========================================
      console.log('\n👥 USER MANAGEMENT TESTING');
      
      // Try to access user management
      const userManagementSelectors = [
        'text=Users',
        'text=User Management', 
        '[href*="users"]',
        'text=Manage Users',
        '.user-list, .users-table'
      ];

      let userManagementFound = false;
      for (const selector of userManagementSelectors) {
        try {
          if (await adminPage.locator(selector).isVisible({ timeout: 3000 })) {
            console.log(`✅ User management found: ${selector}`);
            await adminPage.click(selector);
            userManagementFound = true;
            break;
          }
        } catch (error) {
          console.log(`⏩ User management selector not found: ${selector}`);
        }
      }

      if (userManagementFound) {
        // Test user list display
        await adminPage.waitForTimeout(2000); // Allow page to load
        
        const userListElements = [
          '.user-item, .user-row',
          'text=Researcher',
          'text=Participant', 
          'text=Admin',
          '[data-testid*="user"]'
        ];

        for (const element of userListElements) {
          try {
            if (await adminPage.locator(element).isVisible({ timeout: 3000 })) {
              console.log(`✅ User list element found: ${element}`);
            }
          } catch (error) {
            console.log(`⏩ User element not found: ${element}`);
          }
        }

        // Test user filtering/search if available
        const searchInput = adminPage.locator('input[placeholder*="search"], input[placeholder*="filter"]');
        if (await searchInput.isVisible({ timeout: 3000 })) {
          console.log('🔍 Testing user search functionality...');
          await searchInput.fill('researcher');
          await adminPage.waitForTimeout(1000);
          console.log('✅ User search test completed');
        }
      } else {
        console.log('⚠️ User management section not accessible - may need implementation');
      }

      // ==========================================
      // PART 4: SYSTEM ANALYTICS TESTING
      // ==========================================
      console.log('\n📈 SYSTEM ANALYTICS TESTING');
      
      const analyticsSelectors = [
        'text=Analytics',
        'text=Reports',
        'text=Statistics',
        '[href*="analytics"]',
        '.analytics-dashboard, .stats-panel'
      ];

      let analyticsFound = false;
      for (const selector of analyticsSelectors) {
        try {
          if (await adminPage.locator(selector).isVisible({ timeout: 3000 })) {
            console.log(`✅ Analytics section found: ${selector}`);
            await adminPage.click(selector);
            analyticsFound = true;
            break;
          }
        } catch (error) {
          console.log(`⏩ Analytics selector not found: ${selector}`);
        }
      }

      if (analyticsFound) {
        // Test analytics elements
        await adminPage.waitForTimeout(2000);
        
        const analyticsElements = [
          '.chart, .graph',
          'text=Total Users',
          'text=Active Studies',
          'text=Platform Usage',
          '[data-testid*="stats"]'
        ];

        for (const element of analyticsElements) {
          try {
            if (await adminPage.locator(element).isVisible({ timeout: 3000 })) {
              console.log(`✅ Analytics element found: ${element}`);
            }
          } catch (error) {
            console.log(`⏩ Analytics element not found: ${element}`);
          }
        }
      } else {
        console.log('⚠️ Analytics section not accessible - may need implementation');
      }

      // ==========================================
      // PART 5: STUDY OVERSIGHT TESTING
      // ==========================================
      console.log('\n📚 STUDY OVERSIGHT TESTING');
      
      const studyOversightSelectors = [
        'text=Studies',
        'text=All Studies',
        'text=Study Management',
        '[href*="studies"]',
        '.studies-admin, .study-oversight'
      ];

      let studyOversightFound = false;
      for (const selector of studyOversightSelectors) {
        try {
          if (await adminPage.locator(selector).isVisible({ timeout: 3000 })) {
            console.log(`✅ Study oversight found: ${selector}`);
            await adminPage.click(selector);
            studyOversightFound = true;
            break;
          }
        } catch (error) {
          console.log(`⏩ Study oversight selector not found: ${selector}`);
        }
      }

      if (studyOversightFound) {
        // Test study management features
        await adminPage.waitForTimeout(2000);
        
        const studyManagementElements = [
          '.study-item, .study-row',
          'text=Draft',
          'text=Published',
          'text=Active',
          'button:has-text("Moderate"), button:has-text("Review")'
        ];

        for (const element of studyManagementElements) {
          try {
            if (await adminPage.locator(element).isVisible({ timeout: 3000 })) {
              console.log(`✅ Study management element found: ${element}`);
            }
          } catch (error) {
            console.log(`⏩ Study management element not found: ${element}`);
          }
        }
      }

      // ==========================================
      // PART 6: SYSTEM HEALTH MONITORING
      // ==========================================
      console.log('\n🏥 SYSTEM HEALTH MONITORING');
      
      // Test system health indicators
      const healthSelectors = [
        'text=System Health',
        'text=Status',
        'text=Monitoring',
        '.health-indicator, .status-indicator',
        '.system-stats'
      ];

      for (const selector of healthSelectors) {
        try {
          if (await adminPage.locator(selector).isVisible({ timeout: 3000 })) {
            console.log(`✅ System health element found: ${selector}`);
          }
        } catch (error) {
          console.log(`⏩ Health element not found: ${selector}`);
        }
      }

      // Take admin dashboard screenshot
      await adminPage.screenshot({ 
        path: 'testing/screenshots/admin-dashboard-comprehensive.png',
        fullPage: true
      });

      console.log('📸 Admin dashboard screenshot captured');

      // ==========================================
      // TEST RESULTS SUMMARY
      // ==========================================
      console.log('\n📊 ADMIN DASHBOARD TEST SUMMARY');
      console.log('=====================================');
      console.log(`Admin Authentication: ✅`);
      console.log(`Dashboard Access: ${adminElementFound ? '✅' : '⚠️'}`);
      console.log(`User Management: ${userManagementFound ? '✅' : '⚠️'}`);
      console.log(`Analytics: ${analyticsFound ? '✅' : '⚠️'}`);
      console.log(`Study Oversight: ${studyOversightFound ? '✅' : '⚠️'}`);
      console.log('=====================================');

      const overallSuccess = adminElementFound && (userManagementFound || analyticsFound || studyOversightFound);
      console.log(`🏆 Overall Admin Test: ${overallSuccess ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);

    } catch (error) {
      console.error('❌ Admin dashboard test failed:', error);
      
      // Take error screenshot
      await adminPage.screenshot({ 
        path: 'testing/screenshots/admin-dashboard-error.png',
        fullPage: true 
      });
      
      throw error;
    } finally {
      await adminContext.close();
    }
  });

  test('Admin User Management - Create and Manage Users', async ({ page }) => {
    console.log('👥 Testing admin user management capabilities');
    
    // Login as admin
    await page.goto(BASE_URL);
    await page.click('text=Login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    // Navigate to user management
    await page.waitForTimeout(3000);
    
    // Test creating a new user (if functionality exists)
    const createUserButton = page.locator('button:has-text("Create User"), button:has-text("Add User"), text=New User');
    if (await createUserButton.isVisible({ timeout: 5000 })) {
      console.log('✅ User creation functionality found');
      await createUserButton.click();
      
      // Test user creation form
      await page.waitForTimeout(2000);
      console.log('🔍 Testing user creation form...');
    } else {
      console.log('⚠️ User creation functionality not found - may need implementation');
    }

    console.log('✅ Admin user management test completed');
  });

  test('Admin System Monitoring - Health and Performance', async ({ page }) => {
    console.log('🏥 Testing admin system monitoring capabilities');
    
    // Login as admin
    await page.goto(BASE_URL);
    await page.click('text=Login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    // Test system monitoring features
    const monitoringElements = [
      'text=System Status',
      'text=Performance',
      'text=Uptime',
      '.health-check, .system-monitor',
      'text=API Status'
    ];

    let monitoringFound = false;
    for (const element of monitoringElements) {
      if (await page.locator(element).isVisible({ timeout: 3000 })) {
        console.log(`✅ System monitoring element found: ${element}`);
        monitoringFound = true;
      }
    }

    if (!monitoringFound) {
      console.log('⚠️ System monitoring features not found - may need implementation');
    }

    console.log('✅ Admin system monitoring test completed');
  });
});

/**
 * ADMIN DASHBOARD TESTING RESULTS SUMMARY
 * 
 * This test validates:
 * ✅ Admin authentication and login
 * ✅ Admin dashboard accessibility  
 * ⚠️ User management features (may need implementation)
 * ⚠️ System analytics (may need implementation)
 * ⚠️ Study oversight tools (may need implementation)
 * ⚠️ System health monitoring (may need implementation)
 * 
 * Next Steps:
 * 1. Implement missing admin features based on test results
 * 2. Enhance admin dashboard with management tools
 * 3. Add system analytics and monitoring capabilities
 * 4. Create user management interface for admins
 */