/**
 * 🔍 ResearchHub Page Inspector
 * Take screenshot and analyze page structure
 */

import { chromium } from 'playwright';

async function inspectPage() {
    console.log('🔍 Inspecting ResearchHub page structure...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Navigating to ResearchHub...');
        await page.goto('https://researchhub-saas.vercel.app');
        await page.waitForLoadState('networkidle');
        
        // Take screenshot
        await page.screenshot({ path: 'testing/screenshots/homepage-inspection.png', fullPage: true });
        console.log('📸 Screenshot saved: testing/screenshots/homepage-inspection.png');
        
        // Get page title and URL
        const title = await page.title();
        const url = page.url();
        console.log(`📄 Title: ${title}`);
        console.log(`🔗 URL: ${url}`);
        
        // Look for all input elements
        const inputs = await page.locator('input').all();
        console.log(`📋 Found ${inputs.length} input elements:`);
        
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const type = await input.getAttribute('type').catch(() => 'unknown');
            const name = await input.getAttribute('name').catch(() => 'no-name');
            const placeholder = await input.getAttribute('placeholder').catch(() => 'no-placeholder');
            const isVisible = await input.isVisible().catch(() => false);
            
            console.log(`  ${i + 1}. Type: ${type}, Name: ${name}, Placeholder: ${placeholder}, Visible: ${isVisible}`);
        }
        
        // Look for buttons
        const buttons = await page.locator('button').all();
        console.log(`🔘 Found ${buttons.length} button elements:`);
        
        for (let i = 0; i < Math.min(buttons.length, 5); i++) {
            const button = buttons[i];
            const text = await button.textContent().catch(() => 'no-text');
            const type = await button.getAttribute('type').catch(() => 'no-type');
            const isVisible = await button.isVisible().catch(() => false);
            
            console.log(`  ${i + 1}. Text: "${text}", Type: ${type}, Visible: ${isVisible}`);
        }
        
        // Check for forms
        const forms = await page.locator('form').all();
        console.log(`📝 Found ${forms.length} form elements`);
        
        // Get page HTML structure
        console.log('\n🏗️ Page structure analysis:');
        const bodyText = await page.textContent('body');
        const hasLogin = bodyText.includes('login') || bodyText.includes('Login') || bodyText.includes('Sign in') || bodyText.includes('Sign In');
        const hasEmail = bodyText.includes('email') || bodyText.includes('Email');
        const hasPassword = bodyText.includes('password') || bodyText.includes('Password');
        
        console.log(`Login keywords: ${hasLogin ? '✅' : '❌'}`);
        console.log(`Email keywords: ${hasEmail ? '✅' : '❌'}`);
        console.log(`Password keywords: ${hasPassword ? '✅' : '❌'}`);
        
        // Wait for manual inspection
        console.log('\n⏰ Keeping browser open for 10 seconds for manual inspection...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Page inspection failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Execute the inspection
inspectPage().catch(console.error);