/**
 * 🎭 Complete ResearchHub User Journey Test
 * Test the full user flow from homepage to dashboard
 */

import { chromium } from 'playwright';

async function completeUserJourneyTest() {
    console.log('🎭 Starting Complete User Journey Test...');
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    console.log(`🌐 Target: https://researchhub-saas.vercel.app`);
    
    const browser = await chromium.launch({ headless: true });
    let totalTests = 0;
    let passedTests = 0;
    
    try {
        const page = await browser.newPage();
        
        // Test 1: Homepage Loading
        console.log('\n📄 Test 1: Homepage Loading...');
        totalTests++;
        await page.goto('https://researchhub-saas.vercel.app');
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        if (title.includes('Afkar') || title.includes('Research')) {
            console.log('✅ Homepage loads correctly');
            passedTests++;
        } else {
            console.log('❌ Homepage title unexpected:', title);
        }
        
        // Test 2: Get Started Button Navigation
        console.log('\n🚀 Test 2: Get Started Button Navigation...');
        totalTests++;
        try {
            const getStartedBtn = await page.locator('button:has-text("Get Started")').first();
            
            if (await getStartedBtn.isVisible()) {
                console.log('✅ Get Started button found');
                await getStartedBtn.click();
                await page.waitForLoadState('networkidle', { timeout: 10000 });
                
                // Check if we're now on a different page (login/auth page)
                const currentUrl = page.url();
                console.log(`🔗 Current URL after click: ${currentUrl}`);
                
                if (currentUrl !== 'https://researchhub-saas.vercel.app/') {
                    console.log('✅ Get Started button navigates to new page');
                    passedTests++;
                } else {
                    console.log('❌ Get Started button did not navigate away');
                }
            } else {
                console.log('❌ Get Started button not found');
            }
        } catch (error) {
            console.log('❌ Get Started navigation failed:', error.message);
        }
        
        // Test 3: Login Form on Auth Page
        console.log('\n🔐 Test 3: Login Form Detection...');
        totalTests++;
        try {
            // Look for login form elements on current page
            const emailInputs = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count();
            const passwordInputs = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').count();
            
            console.log(`📧 Email inputs found: ${emailInputs}`);
            console.log(`🔑 Password inputs found: ${passwordInputs}`);
            
            if (emailInputs > 0 && passwordInputs > 0) {
                console.log('✅ Login form elements detected');
                passedTests++;
            } else {
                console.log('❌ Login form elements missing');
                
                // Try to find alternative login flow
                const signInLinks = await page.locator('a:has-text("Sign In"), a:has-text("Login"), button:has-text("Sign In"), button:has-text("Login")').count();
                if (signInLinks > 0) {
                    console.log('🔄 Found alternative sign-in links, attempting to navigate...');
                    await page.locator('a:has-text("Sign In"), a:has-text("Login"), button:has-text("Sign In"), button:has-text("Login")').first().click();
                    await page.waitForLoadState('networkidle');
                    
                    // Check again for login form
                    const emailInputs2 = await page.locator('input[type="email"], input[name="email"]').count();
                    const passwordInputs2 = await page.locator('input[type="password"], input[name="password"]').count();
                    
                    if (emailInputs2 > 0 && passwordInputs2 > 0) {
                        console.log('✅ Login form found after navigation');
                        passedTests++;
                    }
                }
            }
        } catch (error) {
            console.log('❌ Login form detection failed:', error.message);
        }
        
        // Test 4: Researcher Authentication
        console.log('\n👩‍🔬 Test 4: Researcher Authentication...');
        totalTests++;
        try {
            // Try to login with researcher credentials
            const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
            const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
            
            if (await emailInput.isVisible() && await passwordInput.isVisible()) {
                await emailInput.fill('abwanwr77+Researcher@gmail.com');
                await passwordInput.fill('Testtest123');
                
                // Find and click submit button
                const submitBtn = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Submit")').first();
                await submitBtn.click();
                
                // Wait for authentication
                await page.waitForLoadState('networkidle', { timeout: 15000 });
                
                // Check if successfully authenticated
                const finalUrl = page.url();
                const isAuthenticated = finalUrl.includes('/app') || finalUrl.includes('/dashboard') || 
                                      await page.textContent('body').then(text => 
                                          text.includes('Dashboard') || text.includes('Studies') || 
                                          text.includes('Welcome') || text.includes('Researcher')
                                      );
                
                if (isAuthenticated) {
                    console.log('✅ Researcher authentication successful');
                    passedTests++;
                } else {
                    console.log('❌ Researcher authentication failed');
                    console.log(`🔗 Final URL: ${finalUrl}`);
                }
            } else {
                console.log('❌ Could not find login form elements');
            }
        } catch (error) {
            console.log('❌ Researcher authentication failed:', error.message);
        }
        
        // Test 5: Dashboard Functionality
        console.log('\n📊 Test 5: Dashboard Functionality...');
        totalTests++;
        try {
            // Check for dashboard elements
            const bodyText = await page.textContent('body');
            const hasStudies = bodyText.includes('studies') || bodyText.includes('Studies');
            const hasResearch = bodyText.includes('research') || bodyText.includes('Research');
            const hasNavigation = await page.locator('nav, .sidebar, [role="navigation"]').count() > 0;
            
            if (hasStudies || hasResearch || hasNavigation) {
                console.log('✅ Dashboard elements detected');
                passedTests++;
            } else {
                console.log('❌ Dashboard elements missing');
            }
        } catch (error) {
            console.log('❌ Dashboard functionality test failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ User journey test failed:', error.message);
    } finally {
        await browser.close();
    }
    
    // Generate Report
    const healthScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎭 COMPLETE USER JOURNEY TEST REPORT');
    console.log('='.repeat(60));
    console.log(`🎯 OVERALL HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
    console.log(`📊 TESTS PASSED: ${passedTests}/${totalTests}`);
    console.log('='.repeat(60));
    
    return { totalTests, passedTests, healthScore };
}

// Execute the test
completeUserJourneyTest()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('User journey test execution failed:', error);
        process.exit(1);
    });