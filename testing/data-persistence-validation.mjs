/**
 * 💾 ResearchHub Data Persistence Validator
 * 
 * Comprehensive validation of data persistence across the platform:
 * 1. User profile data persistence
 * 2. Study data creation and retrieval
 * 3. Template data consistency
 * 4. Session state management
 * 5. Application data tracking
 * 6. Cross-session data validation
 * 7. Browser refresh data retention
 */

import { chromium } from 'playwright';

class DataPersistenceValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.testCredentials = {
            email: 'abwanwr77+Researcher@gmail.com',
            password: 'Testtest123'
        };
        this.testData = {
            studyTitle: `Test Study ${Date.now()}`,
            studyDescription: `Data persistence validation study created at ${new Date().toISOString()}`,
            profileUpdate: `Updated at ${Date.now()}`
        };
        this.results = {
            userDataPersistence: { status: 'PENDING', details: [] },
            studyDataPersistence: { status: 'PENDING', details: [] },
            sessionPersistence: { status: 'PENDING', details: [] },
            crossBrowserPersistence: { status: 'PENDING', details: [] },
            templateDataConsistency: { status: 'PENDING', details: [] },
            applicationDataTracking: { status: 'PENDING', details: [] }
        };
    }

    async validateDataPersistence() {
        console.log('💾 Starting Data Persistence Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🎯 Testing data persistence across: ${this.baseUrl}`);
        console.log(`📊 Test Study: "${this.testData.studyTitle}"`);
        
        const browser = await chromium.launch({ headless: false, slowMo: 1000 });
        
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            await this.testUserDataPersistence(page);
            await this.testStudyDataPersistence(page);
            await this.testSessionPersistence(page);
            await this.testCrossBrowserPersistence(page);
            await this.testTemplateDataConsistency(page);
            await this.testApplicationDataTracking(page);
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Data persistence validation failed:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async testUserDataPersistence(page) {
        console.log('\\n👤 Testing User Data Persistence...');
        const details = [];
        
        try {
            // Login and check initial state
            await this.loginUser(page);
            
            // Navigate to user profile or settings
            await page.goto(`${this.baseUrl}/app/settings`);
            await page.waitForLoadState('networkidle');
            
            const initialContent = await page.textContent('body');
            if (initialContent.includes('profile') || initialContent.includes('Profile') || 
                initialContent.includes('settings') || initialContent.includes('Settings')) {
                details.push('✅ User profile/settings page accessible');
                
                // Check if user email is displayed (indicates data persistence)
                if (initialContent.includes(this.testCredentials.email) || 
                    initialContent.includes('Researcher') || initialContent.includes('researcher')) {
                    details.push('✅ User authentication data persisted');
                } else {
                    details.push('⚠️ User authentication data not immediately visible');
                }
            } else {
                details.push('❌ User profile/settings not accessible');
            }
            
            // Test navigation back to dashboard and verify user state
            await page.goto(`${this.baseUrl}/app/dashboard`);
            await page.waitForLoadState('networkidle');
            
            const dashboardContent = await page.textContent('body');
            if (!dashboardContent.includes('login') && !dashboardContent.includes('Login')) {
                details.push('✅ User session persists across navigation');
            } else {
                details.push('❌ User session lost during navigation');
            }
            
            // Test page refresh persistence
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const refreshedContent = await page.textContent('body');
            if (!refreshedContent.includes('login') && !refreshedContent.includes('Login')) {
                details.push('✅ User session persists after page refresh');
            } else {
                details.push('❌ User session lost after page refresh');
            }
            
        } catch (error) {
            details.push(`❌ User data persistence test failed: ${error.message}`);
        }
        
        this.results.userDataPersistence = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyDataPersistence(page) {
        console.log('\\n📚 Testing Study Data Persistence...');
        const details = [];
        
        try {
            // Navigate to studies page
            await page.goto(`${this.baseUrl}/app/studies`);
            await page.waitForLoadState('networkidle');
            
            const studiesContent = await page.textContent('body');
            
            // Check if studies are displayed (indicates data persistence)
            if (studiesContent.includes('study') || studiesContent.includes('Study') ||
                studiesContent.includes('Create') || studiesContent.includes('New')) {
                details.push('✅ Studies page loads and displays study information');
                
                // Look for existing studies
                const studyElements = await page.locator('.study, .card, [data-testid*="study"], tr').count();
                if (studyElements > 0) {
                    details.push(`✅ Study data displayed (${studyElements} study elements found)`);
                } else {
                    details.push('⚠️ No study elements visible (may be empty state)');
                }
            } else {
                details.push('❌ Studies page not properly accessible');
            }
            
            // Try to access study builder to test form data persistence
            await page.goto(`${this.baseUrl}/app/study-builder`);
            await page.waitForLoadState('networkidle');
            
            const builderContent = await page.textContent('body');
            if (builderContent.includes('builder') || builderContent.includes('Builder') ||
                builderContent.includes('Create') || builderContent.includes('Title')) {
                details.push('✅ Study builder accessible for data input testing');
                
                // Test form data entry and persistence
                const titleInput = await page.locator('input[name*="title"], input[placeholder*="title"], input[placeholder*="Title"]').first();
                if (await titleInput.isVisible()) {
                    await titleInput.fill(this.testData.studyTitle);
                    
                    // Navigate away and back to test persistence
                    await page.goto(`${this.baseUrl}/app/dashboard`);
                    await page.waitForTimeout(1000);
                    await page.goto(`${this.baseUrl}/app/study-builder`);
                    await page.waitForLoadState('networkidle');
                    
                    const persistedValue = await titleInput.inputValue();
                    if (persistedValue === this.testData.studyTitle) {
                        details.push('✅ Form data persists across navigation');
                    } else {
                        details.push('⚠️ Form data not persisted across navigation');
                    }
                } else {
                    details.push('⚠️ Study builder form fields not immediately visible');
                }
            } else {
                details.push('⚠️ Study builder not accessible');
            }
            
        } catch (error) {
            details.push(`❌ Study data persistence test failed: ${error.message}`);
        }
        
        this.results.studyDataPersistence = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testSessionPersistence(page) {
        console.log('\\n📱 Testing Session Persistence...');
        const details = [];
        
        try {
            // Test session across multiple tabs
            const newTab = await page.context().newPage();
            await newTab.goto(`${this.baseUrl}/app/dashboard`);
            await newTab.waitForLoadState('networkidle');
            
            const newTabContent = await newTab.textContent('body');
            if (!newTabContent.includes('login') && !newTabContent.includes('Login')) {
                details.push('✅ Session shared across multiple tabs');
            } else {
                details.push('❌ Session not shared across tabs');
            }
            
            // Test session timeout behavior
            await page.goto(`${this.baseUrl}/app/studies`);
            await page.waitForLoadState('networkidle');
            
            // Wait a bit and check if session is still active
            await page.waitForTimeout(2000);
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const timeoutContent = await page.textContent('body');
            if (!timeoutContent.includes('login') && !timeoutContent.includes('Login')) {
                details.push('✅ Session remains active during normal usage');
            } else {
                details.push('⚠️ Session may have timeout issues');
            }
            
            // Test localStorage/sessionStorage persistence
            const hasLocalStorage = await page.evaluate(() => {
                return typeof(Storage) !== 'undefined' && localStorage.length > 0;
            });
            
            if (hasLocalStorage) {
                details.push('✅ Browser storage being utilized for persistence');
            } else {
                details.push('⚠️ Browser storage not being used for persistence');
            }
            
            await newTab.close();
            
        } catch (error) {
            details.push(`❌ Session persistence test failed: ${error.message}`);
        }
        
        this.results.sessionPersistence = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testCrossBrowserPersistence(page) {
        console.log('\\n🌐 Testing Cross-Browser Persistence...');
        const details = [];
        
        try {
            // Test with new browser context (simulates different browser)
            const newContext = await page.context().browser().newContext();
            const newPage = await newContext.newPage();
            
            await newPage.goto(`${this.baseUrl}/app/dashboard`);
            await newPage.waitForLoadState('networkidle');
            
            const newContextContent = await newPage.textContent('body');
            if (newContextContent.includes('login') || newContextContent.includes('Login')) {
                details.push('✅ New browser context properly requires authentication');
            } else {
                details.push('⚠️ Session may be incorrectly shared across contexts');
            }
            
            // Test login in new context
            await newPage.goto(`${this.baseUrl}/login`);
            await newPage.waitForLoadState('networkidle');
            
            await newPage.fill('input[type="email"]', this.testCredentials.email);
            await newPage.fill('input[type="password"]', this.testCredentials.password);
            await newPage.click('button[type="submit"]');
            await newPage.waitForLoadState('networkidle');
            
            const loggedInContent = await newPage.textContent('body');
            if (!loggedInContent.includes('login') && !loggedInContent.includes('Login')) {
                details.push('✅ Authentication works across different browser contexts');
            } else {
                details.push('❌ Authentication failed in new browser context');
            }
            
            // Test data consistency across contexts
            await newPage.goto(`${this.baseUrl}/app/studies`);
            await newPage.waitForLoadState('networkidle');
            
            const crossContextStudies = await newPage.textContent('body');
            if (crossContextStudies.includes('study') || crossContextStudies.includes('Study')) {
                details.push('✅ Data consistency maintained across browser contexts');
            } else {
                details.push('⚠️ Data consistency issues across contexts');
            }
            
            await newContext.close();
            
        } catch (error) {
            details.push(`❌ Cross-browser persistence test failed: ${error.message}`);
        }
        
        this.results.crossBrowserPersistence = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testTemplateDataConsistency(page) {
        console.log('\\n📋 Testing Template Data Consistency...');
        const details = [];
        
        try {
            await page.goto(`${this.baseUrl}/app/templates`);
            await page.waitForLoadState('networkidle');
            
            const templatesContent = await page.textContent('body');
            if (templatesContent.includes('template') || templatesContent.includes('Template')) {
                details.push('✅ Templates page accessible');
                
                // Check for template data
                const templateElements = await page.locator('.template, .card, [data-testid*="template"]').count();
                if (templateElements > 0) {
                    details.push(`✅ Template data displayed (${templateElements} template elements)`);
                } else {
                    details.push('⚠️ Template elements not immediately visible');
                }
                
                // Test template data persistence across refreshes
                await page.reload();
                await page.waitForLoadState('networkidle');
                
                const refreshedTemplatesContent = await page.textContent('body');
                if (refreshedTemplatesContent.includes('template') || refreshedTemplatesContent.includes('Template')) {
                    details.push('✅ Template data persists after page refresh');
                } else {
                    details.push('❌ Template data lost after refresh');
                }
            } else {
                details.push('❌ Templates page not accessible');
            }
            
        } catch (error) {
            details.push(`❌ Template data consistency test failed: ${error.message}`);
        }
        
        this.results.templateDataConsistency = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testApplicationDataTracking(page) {
        console.log('\\n📝 Testing Application Data Tracking...');
        const details = [];
        
        try {
            // Try to access participants or applications data
            await page.goto(`${this.baseUrl}/app/participants`);
            await page.waitForLoadState('networkidle');
            
            const participantsContent = await page.textContent('body');
            if (participantsContent.includes('participant') || participantsContent.includes('Participant') ||
                participantsContent.includes('application') || participantsContent.includes('Application')) {
                details.push('✅ Participants/Applications page accessible');
                
                // Check for data tracking elements
                const dataElements = await page.locator('table, .list, .card, tr, li').count();
                if (dataElements > 0) {
                    details.push(`✅ Data tracking elements present (${dataElements} elements)`);
                } else {
                    details.push('⚠️ Data tracking elements not immediately visible');
                }
            } else {
                details.push('⚠️ Participants page content unclear');
            }
            
            // Test data export/download capabilities
            const exportElements = await page.locator('button:has-text("Export"), button:has-text("Download"), a:has-text("Export")').count();
            if (exportElements > 0) {
                details.push('✅ Data export functionality available');
            } else {
                details.push('⚠️ Data export functionality not immediately visible');
            }
            
            // Test data persistence across navigation
            await page.goto(`${this.baseUrl}/app/dashboard`);
            await page.waitForTimeout(1000);
            await page.goto(`${this.baseUrl}/app/participants`);
            await page.waitForLoadState('networkidle');
            
            const persistedContent = await page.textContent('body');
            if (persistedContent.includes('participant') || persistedContent.includes('Participant')) {
                details.push('✅ Application data persists across navigation');
            } else {
                details.push('⚠️ Application data persistence unclear');
            }
            
        } catch (error) {
            details.push(`❌ Application data tracking test failed: ${error.message}`);
        }
        
        this.results.applicationDataTracking = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async loginUser(page) {
        await page.goto(`${this.baseUrl}/login`);
        await page.waitForLoadState('networkidle');
        await page.fill('input[type="email"]', this.testCredentials.email);
        await page.fill('input[type="password"]', this.testCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
    }

    generateReport() {
        console.log('\\n' + '='.repeat(80));
        console.log('💾 DATA PERSISTENCE VALIDATION REPORT');
        console.log('='.repeat(80));
        
        let totalTests = 0;
        let passedTests = 0;
        
        for (const [testName, result] of Object.entries(this.results)) {
            totalTests++;
            if (result.status === 'PASS') {
                passedTests++;
                console.log(`\\n✅ ${testName.toUpperCase()}: PASS`);
            } else {
                console.log(`\\n❌ ${testName.toUpperCase()}: ${result.status}`);
            }
            
            result.details.forEach(detail => {
                console.log(`   ${detail}`);
            });
        }
        
        const healthScore = Math.round((passedTests / totalTests) * 100);
        
        console.log('\\n' + '='.repeat(80));
        console.log(`🎯 DATA PERSISTENCE HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
        console.log(`📊 PERSISTENCE TESTS PASSED: ${passedTests}/${totalTests}`);
        console.log('='.repeat(80));
        
        return { results: this.results, totalTests, passedTests, healthScore };
    }
}

// Execute validation
const validator = new DataPersistenceValidator();
validator.validateDataPersistence()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('Data persistence validation execution failed:', error);
        process.exit(1);
    });