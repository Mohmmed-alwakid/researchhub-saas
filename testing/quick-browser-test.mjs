/**
 * 🎭 Quick Browser Health Test
 * Simple validation of critical functionality
 */

import { chromium } from 'playwright';

async function quickBrowserTest() {
    console.log('🎭 Starting Quick Browser Health Test...');
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    
    const browser = await chromium.launch({ headless: false });
    
    try {
        const page = await browser.newPage();
        
        console.log('🌐 Navigating to ResearchHub...');
        await page.goto('https://researchhub-saas.vercel.app');
        
        // Check if page loads
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        // Check if login form exists
        const loginForm = await page.locator('form').first();
        if (await loginForm.isVisible()) {
            console.log('✅ Login form is visible');
        } else {
            console.log('❌ Login form not found');
        }
        
        // Check for navigation elements
        const navElements = await page.locator('nav, [role="navigation"]').count();
        console.log(`🧭 Navigation elements found: ${navElements}`);
        
        console.log('✅ Quick browser test completed successfully!');
        
    } catch (error) {
        console.error('❌ Browser test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Execute the test
quickBrowserTest().catch(console.error);