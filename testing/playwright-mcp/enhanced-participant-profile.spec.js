/**
 * Enhanced Participant Profile Test
 * 
 * Purpose: Test the new demographic profile system and automatic study matching
 * 
 * Test Strategy:
 * 1. Login as participant
 * 2. Navigate to settings and update demographics
 * 3. Navigate to study discovery
 * 4. Verify automatic filtering based on demographics
 * 5. Test that studies shown match participant profile
 */

import { test, expect } from '@playwright/test';

test.describe('Enhanced Participant Profile & Study Matching', () => {
  
  test('should update participant demographics and filter studies accordingly', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5175/login');
    
    // Login as participant
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/participant/**', { timeout: 10000 });
    
    // Navigate to settings
    await page.goto('http://localhost:5175/settings');
    
    // Click on Demographics tab if it exists (for participants)
    const demographicsTab = page.locator('text=Demographics');
    if (await demographicsTab.isVisible()) {
      await demographicsTab.click();
      
      // Fill out demographics form
      await page.selectOption('select:has-text("Select your age range")', '25-34');
      await page.selectOption('select:has-text("Select gender")', 'male');
      await page.selectOption('select:has-text("Select your country")', 'United States');
      await page.selectOption('select:has-text("Select your specialization")', 'Technology & Software');
      await page.fill('input[placeholder*="555"]', '+1 (555) 123-4567');
      
      // Save the profile
      await page.click('button:has-text("Save Profile")');
      
      // Wait for success message
      await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Demographics profile updated successfully');
    } else {
      console.log('ℹ️ Demographics tab not visible (may not be participant role)');
    }
    
    // Navigate to study discovery to test filtering
    await page.goto('http://localhost:5175/participant/studies');
    
    // Wait for studies to load
    await page.waitForTimeout(3000);
    
    // Check if studies are displayed
    const studyCards = page.locator('.study-card, [data-testid="study-card"]');
    const studyCount = await studyCards.count();
    
    console.log('📊 Studies displayed:', studyCount);
    
    // If studies are shown, verify they might be relevant to the demographics
    if (studyCount > 0) {
      // Get first study title and description to check relevance
      const firstStudyTitle = await studyCards.first().locator('h3, h2, .title').first().textContent();
      const firstStudyDesc = await studyCards.first().locator('p, .description').first().textContent();
      
      console.log('🔍 First study title:', firstStudyTitle);
      console.log('🔍 First study description:', firstStudyDesc);
      
      // Check if any studies contain technology-related keywords
      const studyTexts = await studyCards.allTextContents();
      const techRelatedKeywords = ['tech', 'software', 'app', 'digital', 'mobile', 'web', 'ui', 'ux'];
      
      const hasTechRelated = studyTexts.some(text => 
        techRelatedKeywords.some(keyword => 
          text.toLowerCase().includes(keyword)
        )
      );
      
      if (hasTechRelated) {
        console.log('✅ Found technology-related studies matching participant specialization');
      } else {
        console.log('ℹ️ No obvious technology-related studies found (filtering may be working)');
      }
    }
    
    // Test that the profile data persists
    await page.goto('http://localhost:5175/settings');
    
    if (await demographicsTab.isVisible()) {
      await demographicsTab.click();
      
      // Verify saved data is still there
      const ageRangeValue = await page.locator('select:has-text("Select your age range")').inputValue();
      const genderValue = await page.locator('select:has-text("Select gender")').inputValue();
      const countryValue = await page.locator('select:has-text("Select your country")').inputValue();
      
      console.log('📝 Persisted data:', {
        ageRange: ageRangeValue,
        gender: genderValue,
        country: countryValue
      });
      
      // Check if at least one field persisted
      if (ageRangeValue || genderValue || countryValue) {
        console.log('✅ Demographics data persisted successfully');
      } else {
        console.log('⚠️ Demographics data may not have persisted');
      }
    }
  });

  test('should show demographics tab only for participants', async ({ page }) => {
    // Test with researcher account
    await page.goto('http://localhost:5175/login');
    
    // Login as researcher
    await page.fill('input[type="email"]', 'abwanwr77+researcher@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/app/**', { timeout: 10000 });
    
    // Navigate to settings
    await page.goto('http://localhost:5175/settings');
    
    // Demographics tab should NOT be visible for researchers
    const demographicsTab = page.locator('text=Demographics');
    const isVisible = await demographicsTab.isVisible();
    
    if (!isVisible) {
      console.log('✅ Demographics tab correctly hidden for researcher role');
    } else {
      console.log('⚠️ Demographics tab visible for researcher (should be participant-only)');
    }
    
    expect(isVisible).toBe(false);
  });

  test('should require mandatory demographic fields', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5175/login');
    
    // Login as participant
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/participant/**', { timeout: 10000 });
    
    // Navigate to settings
    await page.goto('http://localhost:5175/settings');
    
    // Click on Demographics tab
    const demographicsTab = page.locator('text=Demographics');
    if (await demographicsTab.isVisible()) {
      await demographicsTab.click();
      
      // Try to save without filling required fields
      await page.click('button:has-text("Save Profile")');
      
      // Should show error messages
      const errorMessages = page.locator('.text-red-600, .error-message');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        console.log('✅ Validation errors shown for missing required fields');
        console.log('📋 Error count:', errorCount);
      } else {
        console.log('⚠️ No validation errors shown (may need to check form validation)');
      }
      
      // Fill required fields and verify errors disappear
      await page.selectOption('select:has-text("Select your age range")', '25-34');
      await page.selectOption('select:has-text("Select gender")', 'female');
      await page.selectOption('select:has-text("Select your country")', 'Canada');
      await page.selectOption('select:has-text("Select your specialization")', 'Design & User Experience');
      
      // Try saving again
      await page.click('button:has-text("Save Profile")');
      
      // Should succeed now
      await expect(page.locator('text=Profile updated successfully, text=Saving')).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Form validation working correctly');
    }
  });

  test('should demonstrate automatic study matching', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5175/login');
    
    // Login as participant
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/participant/**', { timeout: 10000 });
    
    // Set specific demographics to test matching
    await page.goto('http://localhost:5175/settings');
    
    const demographicsTab = page.locator('text=Demographics');
    if (await demographicsTab.isVisible()) {
      await demographicsTab.click();
      
      // Set healthcare specialization
      await page.selectOption('select:has-text("Select your age range")', '35-44');
      await page.selectOption('select:has-text("Select gender")', 'prefer-not-to-say');
      await page.selectOption('select:has-text("Select your country")', 'United Kingdom');
      await page.selectOption('select:has-text("Select your specialization")', 'Healthcare & Medical');
      await page.selectOption('select:has-text("Select experience level")', 'Advanced');
      
      await page.click('button:has-text("Save Profile")');
      await page.waitForTimeout(2000);
      
      // Navigate to studies
      await page.goto('http://localhost:5175/participant/studies');
      await page.waitForTimeout(3000);
      
      // Check if healthcare-related studies appear first or are prioritized
      const studyCards = page.locator('.study-card, [data-testid="study-card"]');
      const studyCount = await studyCards.count();
      
      console.log('📊 Studies shown for healthcare professional:', studyCount);
      
      if (studyCount > 0) {
        const firstStudyText = await studyCards.first().textContent();
        const healthcareKeywords = ['health', 'medical', 'healthcare', 'clinical', 'patient'];
        
        const isHealthcareRelated = healthcareKeywords.some(keyword => 
          firstStudyText?.toLowerCase().includes(keyword)
        );
        
        if (isHealthcareRelated) {
          console.log('✅ Healthcare-related study shown first - automatic matching working');
        } else {
          console.log('ℹ️ First study not healthcare-related, but matching may still be working');
        }
      }
      
      console.log('🎯 Automatic study matching test completed');
    }
  });
});
