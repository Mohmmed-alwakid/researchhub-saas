/**
 * 🔬 ResearchHub Complete Feature Validation
 * Test all current features based on actual application structure
 */

import { chromium } from 'playwright';

class FeatureValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.results = {
            authentication: { status: 'PENDING', details: [] },
            studyCreation: { status: 'PENDING', details: [] },
            studyBuilder: { status: 'PENDING', details: [] },
            studyManagement: { status: 'PENDING', details: [] },
            templates: { status: 'PENDING', details: [] },
            navigation: { status: 'PENDING', details: [] },
            dashboard: { status: 'PENDING', details: [] }
        };
    }

    async validateAllFeatures() {
        console.log('🔬 Starting Complete Feature Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🌐 Target: ${this.baseUrl}`);
        
        const browser = await chromium.launch({ headless: false, slowMo: 1000 });
        
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            // Core feature tests
            await this.testAuthentication(page);
            await this.testNavigation(page);
            await this.testDashboard(page);
            await this.testStudyCreation(page);
            await this.testStudyBuilder(page);
            await this.testStudyManagement(page);
            await this.testTemplates(page);
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Feature validation failed:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async testAuthentication(page) {
        console.log('\n🔐 Testing Authentication System...');
        const details = [];
        
        try {
            // Test login flow
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            // Check login form
            const emailInput = await page.locator('input[type="email"]').first();
            const passwordInput = await page.locator('input[type="password"]').first();
            const submitButton = await page.locator('button[type="submit"]').first();
            
            if (await emailInput.isVisible() && await passwordInput.isVisible() && await submitButton.isVisible()) {
                details.push('✅ Login form elements present');
                
                // Perform login
                await emailInput.fill('abwanwr77+Researcher@gmail.com');
                await passwordInput.fill('Testtest123');
                await submitButton.click();
                await page.waitForLoadState('networkidle');
                
                // Check if redirected to dashboard
                const currentUrl = page.url();
                if (currentUrl.includes('/app/dashboard')) {
                    details.push('✅ Login successful, redirected to dashboard');
                    
                    // Check for user session indicators
                    const bodyText = await page.textContent('body');
                    if (bodyText.includes('Dashboard') || bodyText.includes('Welcome')) {
                        details.push('✅ User session established');
                    } else {
                        details.push('⚠️ User session indicators unclear');
                    }
                } else {
                    details.push('❌ Login did not redirect to dashboard');
                }
            } else {
                details.push('❌ Login form elements missing');
            }
            
        } catch (error) {
            details.push(`❌ Authentication test failed: ${error.message}`);
        }
        
        this.results.authentication = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testNavigation(page) {
        console.log('\n🧭 Testing Navigation System...');
        const details = [];
        
        try {
            // Ensure we're on dashboard
            await page.goto(`${this.baseUrl}/app/dashboard`);
            await page.waitForLoadState('networkidle');
            
            // Test main navigation buttons
            const navButtons = [
                { text: 'Dashboard', expected: '/app/dashboard' },
                { text: 'Studies', expected: '/app/studies' },
                { text: 'Templates', expected: '/app/templates' },
                { text: 'Participants', expected: '/app/participants' },
                { text: 'Settings', expected: '/app/settings' }
            ];
            
            for (const nav of navButtons) {
                try {
                    const button = await page.locator(`button:has-text("${nav.text}")`).first();
                    if (await button.isVisible()) {
                        await button.click();
                        await page.waitForLoadState('networkidle');
                        
                        const currentUrl = page.url();
                        if (currentUrl.includes(nav.expected) || currentUrl.includes(nav.text.toLowerCase())) {
                            details.push(`✅ ${nav.text} navigation working`);
                        } else {
                            details.push(`⚠️ ${nav.text} navigation unclear (${currentUrl})`);
                        }
                    } else {
                        details.push(`❌ ${nav.text} button not found`);
                    }
                } catch (error) {
                    details.push(`❌ ${nav.text} navigation failed: ${error.message}`);
                }
            }
            
        } catch (error) {
            details.push(`❌ Navigation test failed: ${error.message}`);
        }
        
        this.results.navigation = {
            status: details.filter(d => d.includes('❌')).length <= 1 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testDashboard(page) {
        console.log('\n📊 Testing Dashboard Functionality...');
        const details = [];
        
        try {
            await page.goto(`${this.baseUrl}/app/dashboard`);
            await page.waitForLoadState('networkidle');
            
            // Check for dashboard widgets/cards
            const widgets = await page.locator('.card, .widget, .stat, .metric').count();
            if (widgets > 0) {
                details.push(`✅ Dashboard widgets present (${widgets} found)`);
            } else {
                details.push('⚠️ No dashboard widgets detected');
            }
            
            // Check for studies count/display
            const bodyText = await page.textContent('body');
            if (bodyText.includes('studies') || bodyText.includes('Studies')) {
                details.push('✅ Studies information displayed');
            } else {
                details.push('❌ Studies information missing');
            }
            
            // Check for create study access
            const createButtons = await page.locator('button:has-text("New Study"), button:has-text("Create Study"), button:has-text("Create")').count();
            if (createButtons > 0) {
                details.push('✅ Study creation access available');
            } else {
                details.push('⚠️ Study creation access not immediately visible');
            }
            
        } catch (error) {
            details.push(`❌ Dashboard test failed: ${error.message}`);
        }
        
        this.results.dashboard = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyCreation(page) {
        console.log('\n🔬 Testing Study Creation Flow...');
        const details = [];
        
        try {
            // Navigate to study creation via dashboard
            await page.goto(`${this.baseUrl}/app/dashboard`);
            await page.waitForLoadState('networkidle');
            
            // Look for "New Study" button
            const newStudyButton = await page.locator('button:has-text("New Study")').first();
            if (await newStudyButton.isVisible()) {
                details.push('✅ New Study button found');
                
                await newStudyButton.click();
                await page.waitForLoadState('networkidle');
                
                const currentUrl = page.url();
                if (currentUrl.includes('/study-builder') || currentUrl.includes('/create')) {
                    details.push('✅ New Study button navigates to study builder');
                } else {
                    details.push(`⚠️ Unexpected navigation: ${currentUrl}`);
                }
            } else {
                details.push('❌ New Study button not found');
                
                // Try direct URL access
                await page.goto(`${this.baseUrl}/app/study-builder`);
                await page.waitForLoadState('networkidle');
                
                const bodyText = await page.textContent('body');
                if (bodyText.includes('study') || bodyText.includes('Study')) {
                    details.push('✅ Study builder accessible via direct URL');
                } else {
                    details.push('❌ Study builder not accessible');
                }
            }
            
        } catch (error) {
            details.push(`❌ Study creation test failed: ${error.message}`);
        }
        
        this.results.studyCreation = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyBuilder(page) {
        console.log('\n🏗️ Testing Study Builder Interface...');
        const details = [];
        
        try {
            await page.goto(`${this.baseUrl}/app/study-builder`);
            await page.waitForLoadState('networkidle');
            
            // Check for study builder elements
            const titleInputs = await page.locator('input[placeholder*="title"], input[name*="title"]').count();
            const descriptionInputs = await page.locator('textarea, input[placeholder*="description"]').count();
            const saveButtons = await page.locator('button:has-text("Save"), button:has-text("Publish"), button:has-text("Create")').count();
            
            if (titleInputs > 0) {
                details.push('✅ Study title input available');
            } else {
                details.push('❌ Study title input missing');
            }
            
            if (descriptionInputs > 0) {
                details.push('✅ Study description input available');
            } else {
                details.push('⚠️ Study description input not found');
            }
            
            if (saveButtons > 0) {
                details.push('✅ Save/publish buttons available');
            } else {
                details.push('❌ Save/publish buttons missing');
            }
            
            // Check for block functionality
            const blockElements = await page.locator('.block, [data-testid*="block"], .study-block').count();
            const addBlockButtons = await page.locator('button:has-text("Add"), button:has-text("Block")').count();
            
            if (blockElements > 0 || addBlockButtons > 0) {
                details.push('✅ Block functionality present');
            } else {
                details.push('⚠️ Block functionality not detected');
            }
            
        } catch (error) {
            details.push(`❌ Study builder test failed: ${error.message}`);
        }
        
        this.results.studyBuilder = {
            status: details.filter(d => d.includes('❌')).length <= 1 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyManagement(page) {
        console.log('\n📋 Testing Study Management...');
        const details = [];
        
        try {
            // Navigate to studies page
            await page.goto(`${this.baseUrl}/app/studies`);
            await page.waitForLoadState('networkidle');
            
            const bodyText = await page.textContent('body');
            
            // Check for studies list
            if (bodyText.includes('study') || bodyText.includes('Study')) {
                details.push('✅ Studies page content present');
            } else {
                details.push('❌ Studies page content missing');
            }
            
            // Check for study management actions
            const actionButtons = await page.locator('button, a').all();
            let hasManagementActions = false;
            
            for (const button of actionButtons.slice(0, 10)) {
                const text = await button.textContent().catch(() => '');
                if (text.includes('Edit') || text.includes('Delete') || text.includes('View') || 
                    text.includes('Archive') || text.includes('Duplicate')) {
                    hasManagementActions = true;
                    break;
                }
            }
            
            if (hasManagementActions) {
                details.push('✅ Study management actions available');
            } else {
                details.push('⚠️ Study management actions not immediately visible');
            }
            
        } catch (error) {
            details.push(`❌ Study management test failed: ${error.message}`);
        }
        
        this.results.studyManagement = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testTemplates(page) {
        console.log('\n📋 Testing Templates System...');
        const details = [];
        
        try {
            await page.goto(`${this.baseUrl}/app/templates`);
            await page.waitForLoadState('networkidle');
            
            const bodyText = await page.textContent('body');
            
            // Check for templates content
            if (bodyText.includes('template') || bodyText.includes('Template')) {
                details.push('✅ Templates page content present');
            } else {
                details.push('❌ Templates page content missing');
            }
            
            // Check for template cards/items
            const templateCards = await page.locator('.template, .card, [data-testid*="template"]').count();
            if (templateCards > 0) {
                details.push(`✅ Template cards found (${templateCards})`);
            } else {
                details.push('⚠️ No template cards detected');
            }
            
            // Check for template actions
            const useButtons = await page.locator('button:has-text("Use"), button:has-text("Select"), button:has-text("Choose")').count();
            if (useButtons > 0) {
                details.push('✅ Template selection actions available');
            } else {
                details.push('⚠️ Template selection actions not found');
            }
            
        } catch (error) {
            details.push(`❌ Templates test failed: ${error.message}`);
        }
        
        this.results.templates = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🔬 COMPLETE FEATURE VALIDATION REPORT');
        console.log('='.repeat(80));
        
        let totalTests = 0;
        let passedTests = 0;
        
        for (const [featureName, result] of Object.entries(this.results)) {
            totalTests++;
            if (result.status === 'PASS') {
                passedTests++;
                console.log(`\\n✅ ${featureName.toUpperCase()}: PASS`);
            } else {
                console.log(`\\n❌ ${featureName.toUpperCase()}: ${result.status}`);
            }
            
            result.details.forEach(detail => {
                console.log(`   ${detail}`);
            });
        }
        
        const healthScore = Math.round((passedTests / totalTests) * 100);
        
        console.log('\\n' + '='.repeat(80));
        console.log(`🎯 OVERALL FEATURE HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
        console.log(`📊 FEATURES PASSING: ${passedTests}/${totalTests}`);
        console.log('='.repeat(80));
        
        return { results: this.results, totalTests, passedTests, healthScore };
    }
}

// Execute validation
const validator = new FeatureValidator();
validator.validateAllFeatures()
    .then(results => {
        process.exit(results.healthScore >= 70 ? 0 : 1);
    })
    .catch(error => {
        console.error('Feature validation execution failed:', error);
        process.exit(1);
    });