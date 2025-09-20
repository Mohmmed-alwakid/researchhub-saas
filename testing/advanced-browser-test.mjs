/**
 * 🎭 Advanced ResearchHub Browser Health Test
 * Test with SPA navigation and dynamic content detection
 */

import { chromium } from 'playwright';

async function advancedBrowserTest() {
    console.log('🎭 Starting Advanced Browser Health Test...');
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
        
        // Test 2: Try Direct Auth Page Access
        console.log('\n🔐 Test 2: Direct Auth Page Access...');
        totalTests++;
        try {
            // Try common auth routes
            const authRoutes = ['/auth', '/login', '/signin', '/app/login', '/auth/login'];
            let authPageFound = false;
            
            for (const route of authRoutes) {
                try {
                    console.log(`🔍 Trying route: ${route}`);
                    await page.goto(`https://researchhub-saas.vercel.app${route}`);
                    await page.waitForLoadState('networkidle', { timeout: 5000 });
                    
                    // Check for login form
                    const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count() > 0;
                    const hasPasswordInput = await page.locator('input[type="password"], input[name="password"]').count() > 0;
                    
                    if (hasEmailInput && hasPasswordInput) {
                        console.log(`✅ Auth page found at: ${route}`);
                        authPageFound = true;
                        passedTests++;
                        break;
                    }
                } catch (error) {
                    console.log(`❌ Route ${route} failed: ${error.message}`);
                }
            }
            
            if (!authPageFound) {
                console.log('❌ No auth page found at standard routes');
            }
        } catch (error) {
            console.log('❌ Auth page access failed:', error.message);
        }
        
        // Test 3: SPA Modal/Dynamic Login
        console.log('\n🎭 Test 3: SPA Modal/Dynamic Login Detection...');
        totalTests++;
        try {
            // Go back to homepage
            await page.goto('https://researchhub-saas.vercel.app');
            await page.waitForLoadState('networkidle');
            
            // Try all clickable elements that might trigger login
            const clickableElements = [
                'button:has-text("Get Started")',
                'button:has-text("Start Free Trial")',
                'a:has-text("Sign In")',
                'a:has-text("Login")',
                'button:has-text("Sign In")',
                'button:has-text("Login")',
                '[data-testid="login"]',
                '[data-testid="signin"]'
            ];
            
            let modalFound = false;
            
            for (const selector of clickableElements) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible()) {
                        console.log(`🔍 Clicking: ${selector}`);
                        await element.click();
                        
                        // Wait for any dynamic content
                        await page.waitForTimeout(2000);
                        
                        // Check if login form appeared (could be modal or new content)
                        const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count() > 0;
                        const hasPasswordInput = await page.locator('input[type="password"], input[name="password"]').count() > 0;
                        
                        if (hasEmailInput && hasPasswordInput) {
                            console.log(`✅ Login form appeared after clicking: ${selector}`);
                            modalFound = true;
                            passedTests++;
                            break;
                        }
                    }
                } catch (error) {
                    // Continue to next element
                }
            }
            
            if (!modalFound) {
                console.log('❌ No dynamic login form detected');
            }
        } catch (error) {
            console.log('❌ SPA login detection failed:', error.message);
        }
        
        // Test 4: API Authentication Test
        console.log('\n🔗 Test 4: API Authentication Test...');
        totalTests++;
        try {
            // Test if we can access the API directly
            const response = await page.evaluate(async () => {
                try {
                    const res = await fetch('/api/health');
                    return { status: res.status, ok: res.ok };
                } catch (error) {
                    return { error: error.message };
                }
            });
            
            if (response.ok || response.status === 200) {
                console.log('✅ API endpoint accessible');
                passedTests++;
            } else {
                console.log('❌ API endpoint not accessible:', response);
            }
        } catch (error) {
            console.log('❌ API test failed:', error.message);
        }
        
        // Test 5: Content Analysis
        console.log('\n📊 Test 5: Content and Structure Analysis...');
        totalTests++;
        try {
            await page.goto('https://researchhub-saas.vercel.app');
            await page.waitForLoadState('networkidle');
            
            const bodyText = await page.textContent('body');
            const hasResearchContent = bodyText.includes('research') || bodyText.includes('Research') || 
                                     bodyText.includes('study') || bodyText.includes('Study');
            const hasNavigation = await page.locator('nav, .nav, [role="navigation"]').count() > 0;
            const hasButtons = await page.locator('button').count() > 0;
            const hasLinks = await page.locator('a').count() > 0;
            
            const contentScore = [hasResearchContent, hasNavigation, hasButtons, hasLinks].filter(Boolean).length;
            
            if (contentScore >= 3) {
                console.log(`✅ Content structure good (${contentScore}/4 elements present)`);
                passedTests++;
            } else {
                console.log(`❌ Content structure insufficient (${contentScore}/4 elements)`);
            }
        } catch (error) {
            console.log('❌ Content analysis failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Advanced browser test failed:', error.message);
    } finally {
        await browser.close();
    }
    
    // Generate Report
    const healthScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎭 ADVANCED BROWSER HEALTH TEST REPORT');
    console.log('='.repeat(60));
    console.log(`🎯 OVERALL HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
    console.log(`📊 TESTS PASSED: ${passedTests}/${totalTests}`);
    console.log('='.repeat(60));
    
    return { totalTests, passedTests, healthScore };
}

// Execute the test
advancedBrowserTest()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('Advanced browser test execution failed:', error);
        process.exit(1);
    });