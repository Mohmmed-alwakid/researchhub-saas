/**
 * 🔍 ResearchHub Dashboard Structure Inspector
 * Deep analysis of the researcher dashboard to understand navigation
 */

import { chromium } from 'playwright';

async function inspectDashboardStructure() {
    console.log('🔍 Inspecting ResearchHub Dashboard Structure...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 2000 });
    const page = await browser.newPage();
    
    try {
        // Login first
        console.log('🔐 Logging in as researcher...');
        await page.goto('https://researchhub-saas.vercel.app/login');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"], input[name="email"]', 'abwanwr77+Researcher@gmail.com');
        await page.fill('input[type="password"], input[name="password"]', 'Testtest123');
        await page.click('button[type="submit"], button:has-text("Sign In")');
        await page.waitForLoadState('networkidle');
        
        console.log(`🔗 Current URL after login: ${page.url()}`);
        
        // Take screenshot of dashboard
        await page.screenshot({ path: 'testing/screenshots/dashboard-analysis.png', fullPage: true });
        console.log('📸 Dashboard screenshot saved');
        
        // Analyze all clickable elements
        console.log('\n🖱️ All Clickable Elements Analysis:');
        const clickableElements = await page.locator('a, button, [role="button"], [onclick]').all();
        
        for (let i = 0; i < Math.min(clickableElements.length, 20); i++) {
            const element = clickableElements[i];
            const tagName = await element.evaluate(el => el.tagName);
            const text = await element.textContent().catch(() => '');
            const href = await element.getAttribute('href').catch(() => '');
            const className = await element.getAttribute('class').catch(() => '');
            const isVisible = await element.isVisible().catch(() => false);
            
            if (isVisible && (text.length > 0 || href.length > 0)) {
                console.log(`  ${i + 1}. ${tagName}: "${text}" | href: "${href}" | class: "${className}"`);
            }
        }
        
        // Look for navigation menu
        console.log('\n🧭 Navigation Structure Analysis:');
        const navElements = await page.locator('nav, .nav, .sidebar, .navigation, [role="navigation"]').all();
        
        for (let i = 0; i < navElements.length; i++) {
            const nav = navElements[i];
            const navText = await nav.textContent().catch(() => '');
            const navLinks = await nav.locator('a, button').count();
            
            console.log(`  Nav ${i + 1}: ${navLinks} links/buttons`);
            console.log(`  Content: ${navText.substring(0, 200)}...`);
        }
        
        // Look for main content area
        console.log('\n📄 Main Content Analysis:');
        const mainContent = await page.locator('main, .main, .content, [role="main"]').first();
        const mainText = await mainContent.textContent().catch(() => '');
        console.log(`Main content preview: ${mainText.substring(0, 300)}...`);
        
        // Search for study-related elements
        console.log('\n🔬 Study-Related Elements:');
        const studyKeywords = ['study', 'Study', 'create', 'Create', 'research', 'Research', 'template', 'Template'];
        
        for (const keyword of studyKeywords) {
            const elements = await page.locator(`text=${keyword}`).count();
            if (elements > 0) {
                console.log(`  "${keyword}": ${elements} occurrences`);
            }
        }
        
        // Check current page structure
        console.log('\n🏗️ Page Structure:');
        const pageTitle = await page.title();
        const bodyClasses = await page.getAttribute('body', 'class').catch(() => '');
        
        console.log(`  Title: ${pageTitle}`);
        console.log(`  Body classes: ${bodyClasses}`);
        
        // Wait for manual inspection
        console.log('\n⏰ Keeping browser open for 15 seconds for manual inspection...');
        await page.waitForTimeout(15000);
        
    } catch (error) {
        console.error('❌ Dashboard inspection failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Execute the inspection
inspectDashboardStructure().catch(console.error);