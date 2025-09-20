/**
 * 🔬 ResearchHub Real Navigation Flow Test
 * Test the actual navigation paths used in the application
 */

import { chromium } from 'playwright';

async function testRealNavigationFlow() {
    console.log('🔬 Testing Real Navigation Flow...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 1500 });
    const page = await browser.newPage();
    
    try {
        // Step 1: Login
        console.log('\n🔐 Step 1: Authentication...');
        await page.goto('https://researchhub-saas.vercel.app/login');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');
        await page.fill('input[type="password"]', 'Testtest123');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log(`✅ Logged in, current URL: ${page.url()}`);
        
        // Step 2: Navigate to Studies
        console.log('\n📊 Step 2: Navigate to Studies...');
        
        try {
            const studiesButton = await page.locator('button:has-text("Studies")').first();
            if (await studiesButton.isVisible()) {
                await studiesButton.click();
                await page.waitForLoadState('networkidle');
                console.log(`✅ Clicked Studies button, current URL: ${page.url()}`);
            } else {
                console.log('❌ Studies button not found');
            }
        } catch (error) {
            console.log('❌ Studies navigation failed:', error.message);
        }
        
        // Step 3: Look for Create Study functionality on Studies page
        console.log('\n🔬 Step 3: Look for Create Study on Studies page...');
        
        await page.waitForTimeout(2000);
        
        // Take screenshot of studies page
        await page.screenshot({ path: 'testing/screenshots/studies-page.png', fullPage: true });
        
        // Look for create study buttons
        const createStudyButtons = [
            'button:has-text("Create Study")',
            'button:has-text("New Study")', 
            'button:has-text("Add Study")',
            'button:has-text("Create")',
            'button:has-text("+")',
            'a:has-text("Create Study")',
            '[data-testid="create-study"]'
        ];
        
        let createButtonFound = false;
        
        for (const selector of createStudyButtons) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible()) {
                    console.log(`✅ Found create study button: ${selector}`);
                    await element.click();
                    await page.waitForLoadState('networkidle');
                    console.log(`✅ Clicked create button, current URL: ${page.url()}`);
                    createButtonFound = true;
                    break;
                }
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!createButtonFound) {
            console.log('❌ No create study button found, analyzing page content...');
            
            // Get page content to understand what's available
            const bodyText = await page.textContent('body');
            console.log('📄 Page content keywords:');
            
            const keywords = ['create', 'Create', 'new', 'New', 'add', 'Add', 'study', 'Study'];
            keywords.forEach(keyword => {
                if (bodyText.includes(keyword)) {
                    console.log(`  ✅ Contains: "${keyword}"`);
                }
            });
            
            // Show all buttons on the page
            const allButtons = await page.locator('button').all();
            console.log(`\\n🔘 All buttons on page (${allButtons.length} total):`);
            
            for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
                const button = allButtons[i];
                const text = await button.textContent().catch(() => '');
                const isVisible = await button.isVisible().catch(() => false);
                
                if (isVisible && text.trim().length > 0) {
                    console.log(`  ${i + 1}. "${text}"`);
                }
            }
        }
        
        // Step 4: Test Templates page
        console.log('\n📋 Step 4: Test Templates page...');
        
        try {
            const templatesButton = await page.locator('button:has-text("Templates")').first();
            if (await templatesButton.isVisible()) {
                await templatesButton.click();
                await page.waitForLoadState('networkidle');
                console.log(`✅ Navigated to Templates, current URL: ${page.url()}`);
                
                // Take screenshot of templates page
                await page.screenshot({ path: 'testing/screenshots/templates-page.png', fullPage: true });
                
                // Look for templates
                const templateCards = await page.locator('.template, .card, [data-testid*="template"]').count();
                console.log(`📋 Found ${templateCards} template cards`);
                
                if (templateCards > 0) {
                    console.log('✅ Templates are available');
                } else {
                    console.log('❌ No templates found');
                }
            }
        } catch (error) {
            console.log('❌ Templates navigation failed:', error.message);
        }
        
        // Step 5: Direct URL testing
        console.log('\n🔗 Step 5: Direct URL testing...');
        
        const urlsToTest = [
            '/app/studies/create',
            '/app/study/create',
            '/app/builder',
            '/app/study-builder',
            '/app/create-study'
        ];
        
        for (const testUrl of urlsToTest) {
            try {
                console.log(`🔍 Testing URL: ${testUrl}`);
                await page.goto(`https://researchhub-saas.vercel.app${testUrl}`);
                await page.waitForLoadState('networkidle', { timeout: 5000 });
                
                const currentUrl = page.url();
                const bodyText = await page.textContent('body');
                
                if (bodyText.includes('study') || bodyText.includes('Study') || 
                    bodyText.includes('builder') || bodyText.includes('Builder')) {
                    console.log(`✅ ${testUrl} leads to study-related content`);
                    console.log(`   Current URL: ${currentUrl}`);
                } else {
                    console.log(`❌ ${testUrl} does not lead to study content`);
                }
            } catch (error) {
                console.log(`❌ ${testUrl} failed: ${error.message}`);
            }
        }
        
        console.log('\\n⏰ Keeping browser open for 10 seconds for manual inspection...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Navigation flow test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Execute the test
testRealNavigationFlow().catch(console.error);