/**
 * 🔍 Study Builder Deep Analysis
 * Detailed investigation of the study builder interface
 */

import { chromium } from 'playwright';

async function analyzeStudyBuilder() {
    console.log('🔍 Analyzing Study Builder Interface...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 2000 });
    const page = await browser.newPage();
    
    try {
        // Login and navigate to study builder
        console.log('🔐 Logging in...');
        await page.goto('https://researchhub-saas.vercel.app/login');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');
        await page.fill('input[type="password"]', 'Testtest123');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('🏗️ Navigating to Study Builder...');
        await page.goto('https://researchhub-saas.vercel.app/app/study-builder');
        await page.waitForLoadState('networkidle');
        
        // Take full page screenshot
        await page.screenshot({ path: 'testing/screenshots/study-builder-full.png', fullPage: true });
        console.log('📸 Full page screenshot saved');
        
        // Analyze page structure
        console.log('\\n🏗️ Page Structure Analysis:');
        const pageTitle = await page.title();
        console.log(`Page Title: ${pageTitle}`);
        console.log(`Current URL: ${page.url()}`);
        
        // Get all form elements
        console.log('\\n📝 Form Elements Analysis:');
        const inputs = await page.locator('input').all();
        console.log(`Total inputs found: ${inputs.length}`);
        
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const type = await input.getAttribute('type').catch(() => 'unknown');
            const name = await input.getAttribute('name').catch(() => '');
            const placeholder = await input.getAttribute('placeholder').catch(() => '');
            const id = await input.getAttribute('id').catch(() => '');
            const isVisible = await input.isVisible().catch(() => false);
            
            if (isVisible) {
                console.log(`  Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}", id="${id}"`);
            }
        }
        
        // Get all textarea elements
        const textareas = await page.locator('textarea').all();
        console.log(`\\nTotal textareas found: ${textareas.length}`);
        
        for (let i = 0; i < textareas.length; i++) {
            const textarea = textareas[i];
            const name = await textarea.getAttribute('name').catch(() => '');
            const placeholder = await textarea.getAttribute('placeholder').catch(() => '');
            const id = await textarea.getAttribute('id').catch(() => '');
            const isVisible = await textarea.isVisible().catch(() => false);
            
            if (isVisible) {
                console.log(`  Textarea ${i + 1}: name="${name}", placeholder="${placeholder}", id="${id}"`);
            }
        }
        
        // Get all buttons
        console.log('\\n🔘 Button Elements Analysis:');
        const buttons = await page.locator('button').all();
        console.log(`Total buttons found: ${buttons.length}`);
        
        for (let i = 0; i < Math.min(buttons.length, 15); i++) {
            const button = buttons[i];
            const text = await button.textContent().catch(() => '');
            const type = await button.getAttribute('type').catch(() => '');
            const className = await button.getAttribute('class').catch(() => '');
            const isVisible = await button.isVisible().catch(() => false);
            
            if (isVisible && text.trim().length > 0) {
                console.log(`  Button ${i + 1}: "${text}", type="${type}", class="${className}"`);
            }
        }
        
        // Check for study builder specific elements
        console.log('\\n🔬 Study Builder Specific Elements:');
        
        // Look for React components or data attributes
        const reactElements = await page.locator('[data-testid], [data-component]').all();
        console.log(`React test elements found: ${reactElements.length}`);
        
        for (let i = 0; i < Math.min(reactElements.length, 10); i++) {
            const element = reactElements[i];
            const testId = await element.getAttribute('data-testid').catch(() => '');
            const component = await element.getAttribute('data-component').catch(() => '');
            const tagName = await element.evaluate(el => el.tagName);
            
            console.log(`  React ${i + 1}: ${tagName}, testid="${testId}", component="${component}"`);
        }
        
        // Look for any elements with "study", "block", "builder" in class names
        const studyElements = await page.locator('[class*="study"], [class*="block"], [class*="builder"]').all();
        console.log(`\\nStudy-related class elements found: ${studyElements.length}`);
        
        for (let i = 0; i < Math.min(studyElements.length, 10); i++) {
            const element = studyElements[i];
            const className = await element.getAttribute('class').catch(() => '');
            const tagName = await element.evaluate(el => el.tagName);
            const isVisible = await element.isVisible().catch(() => false);
            
            if (isVisible) {
                console.log(`  Study element ${i + 1}: ${tagName}, class="${className}"`);
            }
        }
        
        // Get page content preview
        console.log('\\n📄 Page Content Preview:');
        const bodyText = await page.textContent('body');
        console.log(`Content preview (first 500 chars): ${bodyText.substring(0, 500)}...`);
        
        // Check if this is a loading state or error page
        if (bodyText.includes('Loading') || bodyText.includes('Error') || bodyText.includes('404')) {
            console.log('⚠️ Page appears to be in loading or error state');
        }
        
        // Check for any error messages in console
        console.log('\\n🐛 Console Messages:');
        page.on('console', msg => console.log(`Console ${msg.type()}: ${msg.text()}`));
        
        // Wait for manual inspection
        console.log('\\n⏰ Keeping browser open for 15 seconds for manual inspection...');
        await page.waitForTimeout(15000);
        
    } catch (error) {
        console.error('❌ Study builder analysis failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Execute the analysis
analyzeStudyBuilder().catch(console.error);