/**
 * API 404 Fix Verification Test
 * 
 * Purpose: Verify that API endpoint path corrections resolve 404 errors
 * in participant study discovery functionality
 * 
 * Test Strategy:
 * 1. Start local development server
 * 2. Navigate to participant study discovery page
 * 3. Monitor console for 404 errors
 * 4. Verify studies can be loaded successfully
 * 5. Test study application functionality
 */

import { test, expect } from '@playwright/test';

test.describe('API 404 Fix Verification', () => {
  let developmentServer;
  
  test.beforeAll(async () => {
    // Import and start the development server
    try {
      const { startDevelopmentServer } = await import('../../scripts/development/local-full-dev.js');
      developmentServer = await startDevelopmentServer();
      console.log('Development server started for testing');
      
      // Wait for server to be fully ready
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Failed to start development server:', error);
      throw error;
    }
  });

  test.afterAll(async () => {
    if (developmentServer && developmentServer.close) {
      await developmentServer.close();
      console.log('Development server stopped');
    }
  });

  test('should resolve API 404 errors in study discovery', async ({ page }) => {
    const consoleErrors = [];
    const networkErrors = [];
    
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Monitor network failures
    page.on('response', response => {
      if (response.status() === 404) {
        networkErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // Navigate to participant login
    await page.goto('http://localhost:5175/login');
    
    // Login as participant
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to participant dashboard
    await page.waitForURL('**/participant/**', { timeout: 10000 });
    
    // Navigate to study discovery
    await page.goto('http://localhost:5175/participant/studies');
    
    // Wait for studies to load
    await page.waitForTimeout(3000);
    
    // Check for 404 errors specifically related to /api/research endpoints
    const apiResearch404Errors = networkErrors.filter(error => 
      error.url.includes('/api/research') && 
      error.status === 404
    );
    
    // Verify no 404 errors for research endpoints
    expect(apiResearch404Errors).toHaveLength(0);
    
    // Check that studies page loads content
    const studiesContainer = page.locator('[data-testid="studies-container"], .studies-grid, .study-card').first();
    await expect(studiesContainer).toBeVisible({ timeout: 10000 });
    
    // Log results
    console.log('Console errors found:', consoleErrors.length);
    console.log('404 Network errors found:', networkErrors.length);
    console.log('API Research 404 errors:', apiResearch404Errors.length);
    
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors.slice(0, 5)); // Show first 5
    }
    
    if (networkErrors.length > 0) {
      console.log('Network errors:', networkErrors.slice(0, 5)); // Show first 5
    }
  });

  test('should successfully load studies using correct API endpoints', async ({ page }) => {
    // Navigate to participant login
    await page.goto('http://localhost:5175/login');
    
    // Login as participant
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/participant/**', { timeout: 10000 });
    
    // Navigate to studies
    await page.goto('http://localhost:5175/participant/studies');
    
    // Test direct API call to verify endpoint works
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3003/api/research-consolidated?action=get-studies&page=1&limit=12', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        return {
          status: response.status,
          ok: response.ok,
          data: await response.json()
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    // Verify API responds successfully
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.ok).toBe(true);
    
    console.log('API Response Status:', apiResponse.status);
    console.log('API Response Success:', apiResponse.ok);
    
    // Wait for studies to load in UI
    await page.waitForTimeout(3000);
    
    // Check for any study cards or empty state
    const hasStudies = await page.locator('.study-card').count() > 0;
    const hasEmptyState = await page.locator('[data-testid="no-studies"], .no-studies, .empty-state').isVisible();
    
    // Either studies should load or empty state should show (both are valid)
    expect(hasStudies || hasEmptyState).toBe(true);
    
    console.log('Studies found:', hasStudies);
    console.log('Empty state shown:', hasEmptyState);
  });

  test('should handle study application without 404 errors', async ({ page }) => {
    // Navigate to participant login
    await page.goto('http://localhost:5175/login');
    
    // Login as participant
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/participant/**', { timeout: 10000 });
    
    // Navigate to studies
    await page.goto('http://localhost:5175/participant/studies');
    
    // Wait for page load
    await page.waitForTimeout(3000);
    
    // Test applications API endpoint directly
    const applicationsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3003/api/research-consolidated?action=get-applications', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        return {
          status: response.status,
          ok: response.ok,
          data: await response.json()
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    // Verify applications endpoint works
    expect(applicationsResponse.status).toBe(200);
    expect(applicationsResponse.ok).toBe(true);
    
    console.log('Applications API Status:', applicationsResponse.status);
    console.log('Applications API Success:', applicationsResponse.ok);
  });
});
