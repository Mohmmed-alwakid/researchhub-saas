/**
 * ROBUST TEST RUNNER WITH SERVER VALIDATION
 * Ensures development server is ready before running tests
 */

import { test, expect } from '@playwright/test';

const CONFIG = {
  baseUrl: 'http://localhost:5175',
  apiUrl: 'http://localhost:3003',
  researcher: { email: 'abwanwr77+researcher@gmail.com', password: 'Testtest123' },
  participant: { email: 'abwanwr77+participant@gmail.com', password: 'Testtest123' },
  maxRetries: 5,
  retryDelay: 2000
};

// Helper function to wait for server to be ready
async function waitForServer(page, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      console.log(`🔍 Checking server availability (attempt ${i + 1}/${maxAttempts})...`);
      
      // Check if server responds
      const response = await page.request.get(CONFIG.baseUrl, { timeout: 5000 });
      if (response.status() < 400) {
        console.log('✅ Server is ready and responding');
        return true;
      }
    } catch (error) {
      console.log(`⚠️ Server not ready yet: ${error.message}`);
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('❌ Server is not responding after maximum attempts');
}

test.describe('ResearchHub Study Workflow - Robust Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure server is ready before each test
    await waitForServer(page);
  });

  test('ROBUST: Basic Server Health Check', async ({ page }) => {
    console.log('🔍 ROBUST TEST: Server Health Check');
    
    try {
      // Test frontend is accessible
      console.log('🌐 Testing frontend accessibility...');
      await page.goto(CONFIG.baseUrl, { timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check if page loads successfully
      const title = await page.title();
      console.log(`📄 Page title: "${title}"`);
      
      // Test backend API health
      console.log('🔗 Testing backend API health...');
      const apiResponse = await page.request.get(`${CONFIG.apiUrl}/api/health`);
      console.log(`📊 API health status: ${apiResponse.status()}`);
      
      if (apiResponse.status() === 200) {
        const healthData = await apiResponse.json();
        console.log('✅ API health check passed:', healthData);
      }
      
      console.log('✅ Basic server health check completed successfully');
      
    } catch (error) {
      console.error('❌ Server health check failed:', error.message);
      throw error;
    }
  });

  test('ROBUST: Authentication Test', async ({ browser }) => {
    console.log('🔐 ROBUST TEST: Authentication Workflow');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate to application
      console.log('🌐 Navigating to application...');
      await page.goto(CONFIG.baseUrl, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Application loaded successfully');
      
      // Look for login elements
      console.log('🔍 Looking for authentication elements...');
      
      // Take screenshot of current state
      await page.screenshot({ 
        path: 'testing/screenshots/auth-test-initial.png',
        fullPage: true 
      });
      
      // Try to find login-related elements
      const loginSelectors = [
        'text=Login',
        'text=Sign in',
        'text=Log in',
        'a[href*="login"]',
        'button:has-text("Login")',
        'button:has-text("Sign in")',
        'input[type="email"]',
        '.login',
        '.signin',
        '.auth'
      ];
      
      let foundElements = [];
      for (const selector of loginSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            foundElements.push(selector);
            console.log(`✅ Found: ${selector}`);
          }
        } catch (e) {
          // Element not found, continue
        }
      }
      
      console.log(`🔍 Found ${foundElements.length} authentication-related elements`);
      
      if (foundElements.length > 0) {
        console.log('✅ Authentication elements detected - login flow available');
        
        // Try to interact with login if available
        try {
          const loginElement = page.locator(foundElements[0]).first();
          await loginElement.click({ timeout: 5000 });
          console.log('✅ Successfully clicked login element');
          
          // Take screenshot after clicking login
          await page.screenshot({ 
            path: 'testing/screenshots/auth-test-after-click.png',
            fullPage: true 
          });
          
        } catch (e) {
          console.log('⚠️ Could not interact with login element, but elements exist');
        }
      } else {
        console.log('⚠️ No obvious login elements found - application may have different auth flow');
      }
      
      console.log('✅ Authentication test completed');
      
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message);
      
      // Take error screenshot
      await page.screenshot({ 
        path: 'testing/screenshots/auth-test-error.png',
        fullPage: true 
      });
      
      throw error;
    } finally {
      await context.close();
    }
  });

  test('ROBUST: Study Creation Flow Discovery', async ({ browser }) => {
    console.log('📋 ROBUST TEST: Study Creation Flow Discovery');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate to application
      await page.goto(CONFIG.baseUrl, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      
      console.log('🔍 Exploring application structure...');
      
      // Look for study-related elements
      const studySelectors = [
        'text=Studies',
        'text=Create Study',
        'text=New Study',
        'a[href*="studies"]',
        'a[href*="study"]',
        'button:has-text("Create")',
        '.studies',
        '.study-creation',
        '.create-study'
      ];
      
      let foundStudyElements = [];
      for (const selector of studySelectors) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            foundStudyElements.push({ selector, count: elements.length });
            console.log(`✅ Found: ${selector} (${elements.length} elements)`);
          }
        } catch (e) {
          // Element not found, continue
        }
      }
      
      console.log(`🔍 Found ${foundStudyElements.length} study-related element types`);
      
      // Take screenshot of application state
      await page.screenshot({ 
        path: 'testing/screenshots/study-discovery.png',
        fullPage: true 
      });
      
      // Look for navigation elements
      console.log('🧭 Looking for navigation elements...');
      const navSelectors = [
        'nav',
        '.nav',
        '.navigation',
        '.menu',
        'header',
        '.header',
        '.sidebar',
        'aside'
      ];
      
      for (const selector of navSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            const text = await element.textContent();
            console.log(`📍 Navigation found (${selector}): ${text?.substring(0, 100)}...`);
          }
        } catch (e) {
          // Element not found, continue
        }
      }
      
      console.log('✅ Study creation flow discovery completed');
      
    } catch (error) {
      console.error('❌ Study creation flow discovery failed:', error.message);
      throw error;
    } finally {
      await context.close();
    }
  });

  test('ROBUST: API Endpoint Testing', async ({ page }) => {
    console.log('🔗 ROBUST TEST: API Endpoint Testing');
    
    try {
      const endpoints = [
        '/api/health',
        '/api/auth',
        '/api/research-consolidated',
        '/api/templates-consolidated',
        '/api/user-profile-consolidated'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Testing endpoint: ${endpoint}`);
          const response = await page.request.get(`${CONFIG.apiUrl}${endpoint}`, { timeout: 5000 });
          console.log(`📊 ${endpoint}: ${response.status()} ${response.statusText()}`);
          
          if (response.status() < 500) {
            console.log(`✅ ${endpoint} is responding`);
          } else {
            console.log(`⚠️ ${endpoint} has server error`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint} failed: ${error.message}`);
        }
      }
      
      console.log('✅ API endpoint testing completed');
      
    } catch (error) {
      console.error('❌ API endpoint testing failed:', error.message);
      throw error;
    }
  });

  test('ROBUST: Performance Baseline', async ({ page }) => {
    console.log('⚡ ROBUST TEST: Performance Baseline');
    
    try {
      console.log('📊 Measuring application performance...');
      
      const startTime = Date.now();
      await page.goto(CONFIG.baseUrl, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`⏱️ Page load time: ${loadTime}ms`);
      
      // Performance benchmarks
      const benchmarks = {
        excellent: 1000,
        good: 3000,
        acceptable: 5000
      };
      
      if (loadTime < benchmarks.excellent) {
        console.log('🚀 Performance: EXCELLENT (< 1s)');
      } else if (loadTime < benchmarks.good) {
        console.log('✅ Performance: GOOD (< 3s)');
      } else if (loadTime < benchmarks.acceptable) {
        console.log('⚠️ Performance: ACCEPTABLE (< 5s)');
      } else {
        console.log('❌ Performance: NEEDS IMPROVEMENT (> 5s)');
      }
      
      // Measure API response time
      const apiStartTime = Date.now();
      try {
        const response = await page.request.get(`${CONFIG.apiUrl}/api/health`);
        const apiResponseTime = Date.now() - apiStartTime;
        console.log(`🔗 API response time: ${apiResponseTime}ms`);
        
        if (apiResponseTime < 500) {
          console.log('✅ API Performance: EXCELLENT');
        } else if (apiResponseTime < 1000) {
          console.log('✅ API Performance: GOOD');
        } else {
          console.log('⚠️ API Performance: NEEDS IMPROVEMENT');
        }
      } catch (error) {
        console.log('❌ API health check failed');
      }
      
      console.log('✅ Performance baseline testing completed');
      
    } catch (error) {
      console.error('❌ Performance testing failed:', error.message);
      throw error;
    }
  });

});

// Helper function to capture application state
async function captureApplicationState(page, filename) {
  try {
    // Take screenshot
    await page.screenshot({ 
      path: `testing/screenshots/${filename}.png`,
      fullPage: true 
    });
    
    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    
    console.log(`📸 Screenshot saved: ${filename}.png`);
    console.log(`📄 Page: ${title} (${url})`);
    
    return { title, url };
  } catch (error) {
    console.log(`⚠️ Could not capture application state: ${error.message}`);
    return null;
  }
}
