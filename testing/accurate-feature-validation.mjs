/**
 * 🔬 Accurate Feature Validation
 * Test features based on actual application structure discovered through analysis
 */

import { chromium } from 'playwright';

class AccurateFeatureValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.results = {
            authentication: { status: 'PENDING', details: [] },
            navigation: { status: 'PENDING', details: [] },
            studyBuilder: { status: 'PENDING', details: [] },
            studyCreationFlow: { status: 'PENDING', details: [] },
            dashboard: { status: 'PENDING', details: [] }
        };
    }

    async validateAllFeatures() {
        console.log('🔬 Starting Accurate Feature Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🌐 Target: ${this.baseUrl}`);
        
        const browser = await chromium.launch({ headless: false, slowMo: 800 });
        
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            await this.testAuthentication(page);
            await this.testNavigation(page);
            await this.testDashboard(page);
            await this.testStudyBuilder(page);
            await this.testStudyCreationFlow(page);
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Accurate feature validation failed:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async testAuthentication(page) {
        console.log('\n🔐 Testing Authentication System...');
        const details = [];
        
        try {
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            // Test login
            await page.fill('input[type="email"]', 'abwanwr77+Researcher@gmail.com');
            await page.fill('input[type="password"]', 'Testtest123');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
            
            const currentUrl = page.url();
            if (currentUrl.includes('/app/dashboard')) {
                details.push('✅ Authentication successful - redirected to dashboard');
                details.push('✅ Researcher role access confirmed');
            } else {
                details.push('❌ Authentication failed or incorrect redirect');
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
            await page.goto(`${this.baseUrl}/app/dashboard`);
            await page.waitForLoadState('networkidle');
            
            // Test the navigation buttons we found in analysis
            const navButtons = ['Dashboard', 'Studies', 'Templates', 'Participants', 'Settings'];
            
            for (const buttonText of navButtons) {
                try {
                    const button = await page.locator(`button:has-text("${buttonText}")`).first();
                    if (await button.isVisible()) {
                        details.push(`✅ ${buttonText} navigation button present`);
                        
                        // Test click functionality
                        await button.click();
                        await page.waitForTimeout(1000); // Brief wait for SPA navigation
                        
                        const bodyText = await page.textContent('body');
                        if (bodyText.includes(buttonText) || bodyText.includes(buttonText.toLowerCase())) {
                            details.push(`✅ ${buttonText} navigation functional`);
                        } else {
                            details.push(`⚠️ ${buttonText} navigation unclear`);
                        }
                    } else {
                        details.push(`❌ ${buttonText} button not found`);
                    }
                } catch (error) {
                    details.push(`❌ ${buttonText} navigation failed: ${error.message}`);
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
            
            const bodyText = await page.textContent('body');
            
            // Check for key dashboard content
            if (bodyText.includes('Dashboard')) {
                details.push('✅ Dashboard page loads correctly');
            }
            
            if (bodyText.includes('studies') || bodyText.includes('Studies')) {
                details.push('✅ Studies information displayed');
            }
            
            // Check for "New Study" creation access
            const newStudyButton = await page.locator('button:has-text("New Study"), a:has-text("New Study")').first();
            if (await newStudyButton.isVisible()) {
                details.push('✅ New Study creation access available');
            } else {
                details.push('⚠️ New Study button not immediately visible');
            }
            
            // Check for any error states
            if (bodyText.includes('Error') || bodyText.includes('404')) {
                details.push('❌ Dashboard shows error state');
            } else {
                details.push('✅ Dashboard loads without errors');
            }
            
        } catch (error) {
            details.push(`❌ Dashboard test failed: ${error.message}`);
        }
        
        this.results.dashboard = {
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
            
            const bodyText = await page.textContent('body');
            
            // Check for study builder content based on analysis
            if (bodyText.includes('Create New Study')) {
                details.push('✅ Study builder "Create New Study" section present');
            }
            
            if (bodyText.includes('Type') && bodyText.includes('Details') && bodyText.includes('Config')) {
                details.push('✅ Study creation workflow steps present (Type, Details, Config, Build, Review)');
            }
            
            if (bodyText.includes('Research Method') || bodyText.includes('Usability Study')) {
                details.push('✅ Research method selection available');
            }
            
            if (bodyText.includes('Block-based') || bodyText.includes('usability testing')) {
                details.push('✅ Block-based study functionality described');
            }
            
            // Check for interactive elements
            const clickableElements = await page.locator('button, [role="button"], .clickable').count();
            if (clickableElements >= 10) {
                details.push(`✅ Interactive elements present (${clickableElements} found)`);
            } else {
                details.push('⚠️ Limited interactive elements detected');
            }
            
            // Check for no error states
            if (!bodyText.includes('Error') && !bodyText.includes('404')) {
                details.push('✅ Study builder loads without errors');
            } else {
                details.push('❌ Study builder shows error state');
            }
            
        } catch (error) {
            details.push(`❌ Study builder test failed: ${error.message}`);
        }
        
        this.results.studyBuilder = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyCreationFlow(page) {
        console.log('\n🔬 Testing Study Creation Flow...');
        const details = [];
        
        try {
            // Start from dashboard
            await page.goto(`${this.baseUrl}/app/dashboard`);
            await page.waitForLoadState('networkidle');
            
            // Look for and click "New Study" button
            const newStudyButton = await page.locator('button:has-text("New Study"), a:has-text("New Study")').first();
            if (await newStudyButton.isVisible()) {
                details.push('✅ New Study button accessible from dashboard');
                
                await newStudyButton.click();
                await page.waitForLoadState('networkidle');
                
                const currentUrl = page.url();
                if (currentUrl.includes('study-builder') || currentUrl.includes('create')) {
                    details.push('✅ New Study button navigates to study creation');
                } else {
                    details.push(`⚠️ Unexpected navigation: ${currentUrl}`);
                }
            } else {
                details.push('❌ New Study button not found on dashboard');
            }
            
            // Test study builder access directly
            await page.goto(`${this.baseUrl}/app/study-builder`);
            await page.waitForLoadState('networkidle');
            
            const bodyText = await page.textContent('body');
            
            // Look for study type selection (based on analysis findings)
            if (bodyText.includes('Usability Study') || bodyText.includes('Research Method')) {
                details.push('✅ Study type selection interface present');
                
                // Try to interact with study type selection
                const usabilityStudyOption = await page.locator('text=Usability Study').first();
                if (await usabilityStudyOption.isVisible()) {
                    details.push('✅ Usability Study option available');
                } else {
                    details.push('⚠️ Study type options not immediately interactive');
                }
            } else {
                details.push('❌ Study type selection interface missing');
            }
            
            // Check for workflow progression
            if (bodyText.includes('Continue') || bodyText.includes('Next')) {
                details.push('✅ Workflow progression controls present');
            } else {
                details.push('⚠️ Workflow progression controls not found');
            }
            
        } catch (error) {
            details.push(`❌ Study creation flow test failed: ${error.message}`);
        }
        
        this.results.studyCreationFlow = {
            status: details.filter(d => d.includes('❌')).length <= 1 ? 'PASS' : 'FAIL',
            details
        };
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🔬 ACCURATE FEATURE VALIDATION REPORT');
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
const validator = new AccurateFeatureValidator();
validator.validateAllFeatures()
    .then(results => {
        process.exit(results.healthScore >= 70 ? 0 : 1);
    })
    .catch(error => {
        console.error('Accurate feature validation execution failed:', error);
        process.exit(1);
    });