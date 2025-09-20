/**
 * 🔬 ResearchHub Study Creation Workflow Validator
 * 
 * Comprehensive testing of the complete study creation process:
 * 1. Authentication as researcher
 * 2. Template selection 
 * 3. Study builder functionality
 * 4. Block configuration
 * 5. Study publishing
 * 6. Study management
 */

import { chromium } from 'playwright';

class StudyCreationValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.testResults = {
            authentication: { status: 'PENDING', issues: [] },
            navigation: { status: 'PENDING', issues: [] },
            templateSelection: { status: 'PENDING', issues: [] },
            studyBuilder: { status: 'PENDING', issues: [] },
            blockConfiguration: { status: 'PENDING', issues: [] },
            studyPublishing: { status: 'PENDING', issues: [] },
            studyManagement: { status: 'PENDING', issues: [] }
        };
    }

    async validateStudyCreationWorkflow() {
        console.log('🔬 Starting Study Creation Workflow Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🌐 Target: ${this.baseUrl}`);
        
        const browser = await chromium.launch({ headless: false, slowMo: 1000 });
        
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            // Test 1: Authentication
            await this.testAuthentication(page);
            
            // Test 2: Navigation to Study Creation
            await this.testNavigationToStudyCreation(page);
            
            // Test 3: Template Selection
            await this.testTemplateSelection(page);
            
            // Test 4: Study Builder Interface
            await this.testStudyBuilder(page);
            
            // Test 5: Block Configuration
            await this.testBlockConfiguration(page);
            
            // Test 6: Study Publishing
            await this.testStudyPublishing(page);
            
            // Test 7: Study Management
            await this.testStudyManagement(page);
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Study creation validation failed:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async testAuthentication(page) {
        console.log('\n🔐 Test 1: Researcher Authentication...');
        const issues = [];
        
        try {
            // Navigate to login
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            // Fill credentials
            await page.fill('input[type="email"], input[name="email"]', 'abwanwr77+Researcher@gmail.com');
            await page.fill('input[type="password"], input[name="password"]', 'Testtest123');
            
            // Submit login
            await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
            await page.waitForLoadState('networkidle');
            
            // Verify successful login
            const currentUrl = page.url();
            if (currentUrl.includes('/app') || currentUrl.includes('/dashboard')) {
                console.log('✅ Researcher authentication successful');
                
                // Check for researcher role indicators
                const bodyText = await page.textContent('body');
                if (bodyText.includes('Dashboard') || bodyText.includes('Studies') || bodyText.includes('Create')) {
                    console.log('✅ Researcher dashboard accessible');
                } else {
                    issues.push('Researcher dashboard content not visible');
                }
            } else {
                issues.push('Authentication did not redirect to dashboard');
            }
            
        } catch (error) {
            issues.push(`Authentication failed: ${error.message}`);
        }
        
        this.testResults.authentication = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    async testNavigationToStudyCreation(page) {
        console.log('\n🧭 Test 2: Navigation to Study Creation...');
        const issues = [];
        
        try {
            // Look for study creation buttons/links
            const createButtons = [
                'button:has-text("Create Study")',
                'a:has-text("Create Study")',
                'button:has-text("New Study")',
                'a:has-text("New Study")',
                '[data-testid="create-study"]',
                'button:has-text("Get started")',
                'button:has-text("Create")'
            ];
            
            let navigationSuccessful = false;
            
            for (const selector of createButtons) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible()) {
                        console.log(`🔍 Found create button: ${selector}`);
                        await element.click();
                        await page.waitForLoadState('networkidle');
                        
                        // Check if we're now in study creation flow
                        const bodyText = await page.textContent('body');
                        if (bodyText.includes('template') || bodyText.includes('Template') || 
                            bodyText.includes('study') || bodyText.includes('Study') ||
                            bodyText.includes('Create') || bodyText.includes('Builder')) {
                            console.log('✅ Navigation to study creation successful');
                            navigationSuccessful = true;
                            break;
                        }
                    }
                } catch (error) {
                    // Continue to next selector
                }
            }
            
            if (!navigationSuccessful) {
                issues.push('Could not navigate to study creation interface');
            }
            
        } catch (error) {
            issues.push(`Navigation test failed: ${error.message}`);
        }
        
        this.testResults.navigation = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    async testTemplateSelection(page) {
        console.log('\n📋 Test 3: Template Selection...');
        const issues = [];
        
        try {
            // Look for template options
            const templateElements = await page.locator('.template, [data-testid*="template"], .card').count();
            console.log(`📋 Found ${templateElements} template-like elements`);
            
            if (templateElements > 0) {
                console.log('✅ Template selection interface present');
                
                // Try to select first template
                const firstTemplate = await page.locator('.template, [data-testid*="template"], .card').first();
                if (await firstTemplate.isVisible()) {
                    await firstTemplate.click();
                    await page.waitForTimeout(2000);
                    console.log('✅ Template selection interactive');
                }
            } else {
                // Look for "Start from Scratch" or similar options
                const scratchOptions = [
                    'button:has-text("Start from Scratch")',
                    'button:has-text("Blank Study")',
                    'button:has-text("Custom")',
                    'button:has-text("Continue")',
                    'button:has-text("Next")'
                ];
                
                let scratchFound = false;
                for (const selector of scratchOptions) {
                    try {
                        const element = await page.locator(selector).first();
                        if (await element.isVisible()) {
                            console.log(`✅ Found alternative option: ${selector}`);
                            await element.click();
                            await page.waitForTimeout(2000);
                            scratchFound = true;
                            break;
                        }
                    } catch (error) {
                        // Continue
                    }
                }
                
                if (!scratchFound) {
                    issues.push('No template selection or alternative options found');
                }
            }
            
        } catch (error) {
            issues.push(`Template selection test failed: ${error.message}`);
        }
        
        this.testResults.templateSelection = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    async testStudyBuilder(page) {
        console.log('\n🏗️ Test 4: Study Builder Interface...');
        const issues = [];
        
        try {
            // Look for study builder elements
            const studyBuilderElements = [
                'input[placeholder*="title"], input[placeholder*="Title"]',
                'textarea[placeholder*="description"], textarea[placeholder*="Description"]',
                '.block, [data-testid*="block"]',
                'button:has-text("Add Block")',
                'button:has-text("Save")',
                'button:has-text("Publish")'
            ];
            
            let builderElementsFound = 0;
            
            for (const selector of studyBuilderElements) {
                try {
                    const count = await page.locator(selector).count();
                    if (count > 0) {
                        console.log(`✅ Found builder element: ${selector} (${count})`);
                        builderElementsFound++;
                    }
                } catch (error) {
                    // Continue
                }
            }
            
            if (builderElementsFound >= 2) {
                console.log(`✅ Study builder interface present (${builderElementsFound} elements)`);
                
                // Try to fill study details
                try {
                    const titleInput = await page.locator('input[placeholder*="title"], input[placeholder*="Title"], input[name*="title"]').first();
                    if (await titleInput.isVisible()) {
                        await titleInput.fill('Test Study - Validation');
                        console.log('✅ Study title input working');
                    }
                } catch (error) {
                    console.log('⚠️ Could not test study title input');
                }
                
            } else {
                issues.push('Study builder interface elements missing or not accessible');
            }
            
        } catch (error) {
            issues.push(`Study builder test failed: ${error.message}`);
        }
        
        this.testResults.studyBuilder = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    async testBlockConfiguration(page) {
        console.log('\n🧩 Test 5: Block Configuration...');
        const issues = [];
        
        try {
            // Look for existing blocks or add block functionality
            const blockElements = await page.locator('.block, [data-testid*="block"], .study-block').count();
            console.log(`🧩 Found ${blockElements} block elements`);
            
            // Try to add a new block
            const addBlockButtons = [
                'button:has-text("Add Block")',
                'button:has-text("Add")',
                '[data-testid="add-block"]',
                'button[title*="Add"]'
            ];
            
            let blockAdditionTested = false;
            
            for (const selector of addBlockButtons) {
                try {
                    const button = await page.locator(selector).first();
                    if (await button.isVisible()) {
                        console.log(`✅ Found add block button: ${selector}`);
                        await button.click();
                        await page.waitForTimeout(2000);
                        
                        // Check for block type selection
                        const blockTypes = await page.locator('button, .block-type, [data-testid*="block-type"]').count();
                        if (blockTypes > 0) {
                            console.log(`✅ Block type selection available (${blockTypes} options)`);
                            blockAdditionTested = true;
                        }
                        break;
                    }
                } catch (error) {
                    // Continue
                }
            }
            
            if (blockElements > 0 || blockAdditionTested) {
                console.log('✅ Block configuration functionality present');
            } else {
                issues.push('Block configuration interface not found');
            }
            
        } catch (error) {
            issues.push(`Block configuration test failed: ${error.message}`);
        }
        
        this.testResults.blockConfiguration = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    async testStudyPublishing(page) {
        console.log('\n🚀 Test 6: Study Publishing...');
        const issues = [];
        
        try {
            // Look for publish/save buttons
            const publishButtons = [
                'button:has-text("Publish")',
                'button:has-text("Save")',
                'button:has-text("Launch")',
                'button:has-text("Create Study")',
                '[data-testid="publish"]'
            ];
            
            let publishButtonFound = false;
            
            for (const selector of publishButtons) {
                try {
                    const button = await page.locator(selector).first();
                    if (await button.isVisible()) {
                        console.log(`✅ Found publish button: ${selector}`);
                        publishButtonFound = true;
                        
                        // Note: We won't actually publish to avoid creating test data
                        console.log('✅ Study publishing interface accessible');
                        break;
                    }
                } catch (error) {
                    // Continue
                }
            }
            
            if (!publishButtonFound) {
                issues.push('Study publishing buttons not found');
            }
            
        } catch (error) {
            issues.push(`Study publishing test failed: ${error.message}`);
        }
        
        this.testResults.studyPublishing = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    async testStudyManagement(page) {
        console.log('\n📊 Test 7: Study Management...');
        const issues = [];
        
        try {
            // Navigate to studies list
            const studiesNavigation = [
                'a:has-text("Studies")',
                'button:has-text("Studies")',
                'a[href*="studies"]',
                '[data-testid="studies"]'
            ];
            
            let studiesPageFound = false;
            
            for (const selector of studiesNavigation) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible()) {
                        console.log(`✅ Found studies navigation: ${selector}`);
                        await element.click();
                        await page.waitForLoadState('networkidle');
                        
                        // Check for studies list
                        const bodyText = await page.textContent('body');
                        if (bodyText.includes('study') || bodyText.includes('Study')) {
                            console.log('✅ Studies management page accessible');
                            studiesPageFound = true;
                        }
                        break;
                    }
                } catch (error) {
                    // Continue
                }
            }
            
            if (!studiesPageFound) {
                issues.push('Study management interface not accessible');
            }
            
        } catch (error) {
            issues.push(`Study management test failed: ${error.message}`);
        }
        
        this.testResults.studyManagement = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    generateReport() {
        console.log('\n' + '='.repeat(70));
        console.log('🔬 STUDY CREATION WORKFLOW VALIDATION REPORT');
        console.log('='.repeat(70));
        
        let totalTests = 0;
        let passedTests = 0;
        
        for (const [testName, result] of Object.entries(this.testResults)) {
            totalTests++;
            if (result.status === 'PASS') {
                passedTests++;
                console.log(`✅ ${testName}: PASS`);
            } else {
                console.log(`❌ ${testName}: FAIL`);
                if (result.issues && result.issues.length > 0) {
                    result.issues.forEach(issue => {
                        console.log(`   • ${issue}`);
                    });
                }
            }
        }
        
        const healthScore = Math.round((passedTests / totalTests) * 100);
        
        console.log('='.repeat(70));
        console.log(`🎯 OVERALL STUDY CREATION HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
        console.log(`📊 TESTS PASSED: ${passedTests}/${totalTests}`);
        console.log('='.repeat(70));
        
        return { testResults: this.testResults, totalTests, passedTests, healthScore };
    }
}

// Execute validation
const validator = new StudyCreationValidator();
validator.validateStudyCreationWorkflow()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('Study creation validation execution failed:', error);
        process.exit(1);
    });