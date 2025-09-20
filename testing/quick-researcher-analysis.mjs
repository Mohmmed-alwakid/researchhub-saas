/**
 * 🔍 Quick Researcher Dashboard Analysis
 * 
 * Quick check to understand what researcher sees and has access to
 */

import { chromium } from 'playwright';

const baseUrl = 'https://researchhub-saas.vercel.app';
const researcherCredentials = {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123'
};

async function analyzeResearcherDashboard() {
    console.log('🔍 Analyzing Researcher Dashboard...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Login as researcher
        await page.goto(`${baseUrl}/login`);
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', researcherCredentials.email);
        await page.fill('input[type="password"]', researcherCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Logged in as researcher');
        console.log(`📍 Current URL: ${page.url()}`);
        
        // Take screenshot
        await page.screenshot({ path: 'testing/screenshots/researcher-dashboard.png', fullPage: true });
        console.log('📸 Screenshot saved: testing/screenshots/researcher-dashboard.png');
        
        // Analyze page content
        const bodyText = await page.textContent('body');
        console.log('\\n📝 Page Content Analysis:');
        console.log('- Contains "Create Study":', bodyText.includes('Create Study'));
        console.log('- Contains "New Study":', bodyText.includes('New Study'));
        console.log('- Contains "Study Builder":', bodyText.includes('Study Builder'));
        console.log('- Contains "Templates":', bodyText.includes('Templates'));
        console.log('- Contains "Studies":', bodyText.includes('Studies'));
        
        // Look for buttons and navigation
        const buttons = await page.locator('button').allTextContents();
        const links = await page.locator('a').allTextContents();
        
        console.log('\\n🔘 Available Buttons:', buttons.filter(b => b.trim()).slice(0, 10));
        console.log('🔗 Available Links:', links.filter(l => l.trim()).slice(0, 10));
        
        // Check specific URLs
        const testUrls = ['/app/studies', '/app/study-builder', '/app/templates'];
        for (const url of testUrls) {
            try {
                await page.goto(`${baseUrl}${url}`);
                await page.waitForLoadState('networkidle');
                const content = await page.textContent('body');
                console.log(`\\n📍 ${url}: ${content.includes('Create') || content.includes('New') ? '✅ Accessible' : '⚠️ Limited access'}`);
            } catch (error) {
                console.log(`\\n📍 ${url}: ❌ Not accessible`);
            }
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    } finally {
        await browser.close();
    }
}

analyzeResearcherDashboard();