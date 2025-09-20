/**
 * 🎭 ResearchHub Browser Health Check
 * Simplified browser testing to validate key functionality
 */

import { chromium } from 'playwright';

async function browserHealthCheck() {
    console.log('🎭 Starting ResearchHub Browser Health Check...');
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    console.log(`🌐 Target: https://researchhub-saas.vercel.app`);
    
    const browser = await chromium.launch({ headless: true });
    let totalTests = 0;
    let passedTests = 0;
    
    try {
        const page = await browser.newPage();
        
        // Test 1: Page Loading
        console.log('\n📄 Test 1: Page Loading...');
        totalTests++;
        await page.goto('https://researchhub-saas.vercel.app');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        const title = await page.title();
        if (title.includes('Afkar') || title.includes('Research')) {
            console.log('✅ Page loads correctly with proper title');
            passedTests++;
        } else {
            console.log('❌ Page title unexpected:', title);
        }
        
        // Test 2: Login Form Presence
        console.log('\n🔐 Test 2: Login Form Validation...');
        totalTests++;
        try {
            const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
            const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
            
            if (await emailInput.isVisible() && await passwordInput.isVisible()) {
                console.log('✅ Login form elements are present and visible');
                passedTests++;
            } else {
                console.log('❌ Login form elements not visible');
            }
        } catch (error) {
            console.log('❌ Login form validation failed:', error.message);
        }
        
        // Test 3: Researcher Login
        console.log('\n👩‍🔬 Test 3: Researcher Authentication...');
        totalTests++;
        try {
            await page.fill('input[type="email"], input[name="email"]', 'abwanwr77+Researcher@gmail.com');
            await page.fill('input[type="password"], input[name="password"]', 'Testtest123');
            
            // Look for submit button
            const submitBtn = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
            await submitBtn.click();
            
            // Wait for navigation
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            
            // Check if redirected to app
            const currentUrl = page.url();
            if (currentUrl.includes('/app') || currentUrl.includes('dashboard')) {
                console.log('✅ Researcher login successful');
                passedTests++;
                
                // Test 4: Dashboard Elements
                console.log('\n📊 Test 4: Dashboard Elements...');
                totalTests++;
                
                // Check for dashboard content
                const hasStudiesText = await page.textContent('body').then(text => 
                    text.includes('studies') || text.includes('Studies') || 
                    text.includes('research') || text.includes('Research')
                );
                
                if (hasStudiesText) {
                    console.log('✅ Dashboard contains expected research content');
                    passedTests++;
                } else {
                    console.log('❌ Dashboard missing expected content');
                }
                
            } else {
                console.log('❌ Researcher login failed - no redirect to dashboard');
            }
            
        } catch (error) {
            console.log('❌ Researcher login test failed:', error.message);
        }
        
        // Test 5: Navigation Elements
        console.log('\n🧭 Test 5: Navigation Structure...');
        totalTests++;
        try {
            const navElements = await page.locator('nav, [role="navigation"], .sidebar, .navigation').count();
            const linkElements = await page.locator('a').count();
            
            if (navElements > 0 && linkElements > 3) {
                console.log(`✅ Navigation structure present (${navElements} nav sections, ${linkElements} links)`);
                passedTests++;
            } else {
                console.log('❌ Navigation structure insufficient');
            }
        } catch (error) {
            console.log('❌ Navigation test failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Browser health check failed:', error.message);
    } finally {
        await browser.close();
    }
    
    // Generate Report
    const healthScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎭 BROWSER HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    console.log(`🎯 OVERALL HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
    console.log(`📊 TESTS PASSED: ${passedTests}/${totalTests}`);
    console.log('='.repeat(60));
    
    return { totalTests, passedTests, healthScore };
}

// Execute the health check
browserHealthCheck()
    .then(results => {
        process.exit(results.healthScore >= 80 ? 0 : 1);
    })
    .catch(error => {
        console.error('Browser health check execution failed:', error);
        process.exit(1);
    });