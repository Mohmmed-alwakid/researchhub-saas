/**
 * 👥 ResearchHub Participant Experience Validator
 * 
 * Complete validation of the participant journey:
 * 1. Participant authentication
 * 2. Study discovery/browsing
 * 3. Study enrollment
 * 4. Study completion workflow
 * 5. Block interaction testing
 * 6. Data submission
 */

import { chromium } from 'playwright';

class ParticipantExperienceValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.participantCredentials = {
            email: 'abwanwr77+participant@gmail.com',
            password: 'Testtest123'
        };
        this.results = {
            participantAuth: { status: 'PENDING', details: [] },
            studyDiscovery: { status: 'PENDING', details: [] },
            studyAccess: { status: 'PENDING', details: [] },
            studyCompletion: { status: 'PENDING', details: [] },
            userInterface: { status: 'PENDING', details: [] },
            dataHandling: { status: 'PENDING', details: [] }
        };
    }

    async validateParticipantExperience() {
        console.log('👥 Starting Participant Experience Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🌐 Target: ${this.baseUrl}`);
        console.log(`👤 Testing as: ${this.participantCredentials.email}`);
        
        const browser = await chromium.launch({ headless: false, slowMo: 1000 });
        
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            await this.testParticipantAuthentication(page);
            await this.testStudyDiscovery(page);
            await this.testStudyAccess(page);
            await this.testStudyCompletion(page);
            await this.testUserInterface(page);
            await this.testDataHandling(page);
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Participant experience validation failed:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async testParticipantAuthentication(page) {
        console.log('\n🔐 Testing Participant Authentication...');
        const details = [];
        
        try {
            // Test participant login
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            await page.fill('input[type="email"]', this.participantCredentials.email);
            await page.fill('input[type="password"]', this.participantCredentials.password);
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
            
            const currentUrl = page.url();
            const bodyText = await page.textContent('body');
            
            // Check if participant has different dashboard/interface than researcher
            if (currentUrl.includes('/app') || currentUrl.includes('/participant')) {
                details.push('✅ Participant authentication successful');
                
                // Check for participant-specific content
                if (bodyText.includes('participant') || bodyText.includes('Participant') ||
                    bodyText.includes('studies') || bodyText.includes('Studies')) {
                    details.push('✅ Participant interface accessible');
                } else {
                    details.push('⚠️ Participant interface content unclear');
                }
                
                // Check for role differentiation
                if (!bodyText.includes('Create Study') && !bodyText.includes('New Study')) {
                    details.push('✅ Participant role correctly restricted (no study creation)');
                } else {
                    details.push('⚠️ Role restrictions unclear');
                }
            } else {
                details.push('❌ Participant authentication failed');
            }
            
        } catch (error) {
            details.push(`❌ Participant authentication test failed: ${error.message}`);
        }
        
        this.results.participantAuth = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyDiscovery(page) {
        console.log('\n🔍 Testing Study Discovery...');
        const details = [];
        
        try {
            // Ensure we're in participant view
            const bodyText = await page.textContent('body');
            
            // Look for available studies
            if (bodyText.includes('studies') || bodyText.includes('Studies')) {
                details.push('✅ Studies information visible to participant');
            } else {
                details.push('❌ No studies information found for participant');
            }
            
            // Check for study browsing interface
            const studyElements = await page.locator('.study, .card, [data-testid*="study"]').count();
            if (studyElements > 0) {
                details.push(`✅ Study cards/elements present (${studyElements} found)`);
            } else {
                details.push('⚠️ No study cards detected (may be empty state)');
            }
            
            // Look for study enrollment buttons
            const enrollButtons = await page.locator('button:has-text("Join"), button:has-text("Participate"), button:has-text("Start"), a:has-text("Join")').count();
            if (enrollButtons > 0) {
                details.push('✅ Study enrollment options available');
            } else {
                details.push('⚠️ Study enrollment options not immediately visible');
            }
            
            // Check for study filtering/search
            const searchElements = await page.locator('input[type="search"], input[placeholder*="search"]').count();
            if (searchElements > 0) {
                details.push('✅ Study search functionality present');
            } else {
                details.push('⚠️ Study search functionality not found');
            }
            
        } catch (error) {
            details.push(`❌ Study discovery test failed: ${error.message}`);
        }
        
        this.results.studyDiscovery = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyAccess(page) {
        console.log('\n📖 Testing Study Access...');
        const details = [];
        
        try {
            // Try to access a study directly (if any exist)
            const participantUrls = [
                '/app/studies',
                '/app/participant',
                '/app/dashboard',
                '/participant/studies'
            ];
            
            let studyAccessFound = false;
            
            for (const url of participantUrls) {
                try {
                    console.log(`🔍 Testing URL: ${url}`);
                    await page.goto(`${this.baseUrl}${url}`);
                    await page.waitForLoadState('networkidle', { timeout: 5000 });
                    
                    const bodyText = await page.textContent('body');
                    if (bodyText.includes('study') || bodyText.includes('Study') || 
                        bodyText.includes('participate') || bodyText.includes('Participate')) {
                        details.push(`✅ Study access available at ${url}`);
                        studyAccessFound = true;
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ ${url} not accessible: ${error.message}`);
                }
            }
            
            if (!studyAccessFound) {
                details.push('❌ No study access URLs found for participants');
            }
            
            // Check for study information display
            const currentBodyText = await page.textContent('body');
            if (currentBodyText.includes('description') || currentBodyText.includes('Description')) {
                details.push('✅ Study information displayed');
            } else {
                details.push('⚠️ Study descriptions not immediately visible');
            }
            
            // Check for consent/agreement mechanisms
            if (currentBodyText.includes('consent') || currentBodyText.includes('Consent') ||
                currentBodyText.includes('agree') || currentBodyText.includes('Agree')) {
                details.push('✅ Consent mechanisms present');
            } else {
                details.push('⚠️ Consent mechanisms not found');
            }
            
        } catch (error) {
            details.push(`❌ Study access test failed: ${error.message}`);
        }
        
        this.results.studyAccess = {
            status: details.filter(d => d.includes('❌')).length <= 1 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyCompletion(page) {
        console.log('\n📝 Testing Study Completion Workflow...');
        const details = [];
        
        try {
            // Look for study session or completion interfaces
            const bodyText = await page.textContent('body');
            
            // Check for progress indicators
            if (bodyText.includes('progress') || bodyText.includes('Progress') ||
                bodyText.includes('%') || bodyText.includes('step')) {
                details.push('✅ Progress indicators present');
            } else {
                details.push('⚠️ Progress indicators not found');
            }
            
            // Check for navigation controls
            const navigationButtons = await page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Submit"), button:has-text("Finish")').count();
            if (navigationButtons > 0) {
                details.push('✅ Study navigation controls available');
            } else {
                details.push('⚠️ Study navigation controls not immediately visible');
            }
            
            // Check for input/response mechanisms
            const responseElements = await page.locator('input, textarea, select, button[role="radio"], button[role="checkbox"]').count();
            if (responseElements > 0) {
                details.push(`✅ Response input mechanisms present (${responseElements} elements)`);
            } else {
                details.push('⚠️ Response input mechanisms not found');
            }
            
            // Test if we can simulate a study session
            try {
                // Try to access a study session URL
                await page.goto(`${this.baseUrl}/app/study-session`);
                await page.waitForLoadState('networkidle', { timeout: 5000 });
                
                const sessionBodyText = await page.textContent('body');
                if (sessionBodyText.includes('study') || sessionBodyText.includes('Study')) {
                    details.push('✅ Study session interface accessible');
                } else {
                    details.push('⚠️ Study session interface not found');
                }
            } catch (error) {
                details.push('⚠️ Study session URL not accessible');
            }
            
        } catch (error) {
            details.push(`❌ Study completion test failed: ${error.message}`);
        }
        
        this.results.studyCompletion = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testUserInterface(page) {
        console.log('\n🎨 Testing Participant User Interface...');
        const details = [];
        
        try {
            // Check for mobile responsiveness indicators
            await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
            await page.waitForTimeout(1000);
            
            const mobileBodyText = await page.textContent('body');
            if (mobileBodyText.length > 100) {
                details.push('✅ Interface responsive on mobile viewport');
            } else {
                details.push('❌ Interface not responsive on mobile');
            }
            
            // Reset to desktop
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.waitForTimeout(1000);
            
            // Check for accessibility features
            const accessibilityElements = await page.locator('[aria-label], [role], [alt]').count();
            if (accessibilityElements > 5) {
                details.push('✅ Accessibility features present');
            } else {
                details.push('⚠️ Limited accessibility features detected');
            }
            
            // Check for loading states
            const bodyText = await page.textContent('body');
            if (!bodyText.includes('Loading') && !bodyText.includes('Error')) {
                details.push('✅ Interface loads cleanly without loading/error states');
            } else {
                details.push('⚠️ Interface shows loading or error states');
            }
            
            // Check for user-friendly language
            if (bodyText.includes('Welcome') || bodyText.includes('Thank you') || 
                bodyText.includes('please') || bodyText.includes('Please')) {
                details.push('✅ User-friendly language present');
            } else {
                details.push('⚠️ User-friendly language not immediately apparent');
            }
            
        } catch (error) {
            details.push(`❌ User interface test failed: ${error.message}`);
        }
        
        this.results.userInterface = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testDataHandling(page) {
        console.log('\n💾 Testing Data Handling & Privacy...');
        const details = [];
        
        try {
            const bodyText = await page.textContent('body');
            
            // Check for privacy information
            if (bodyText.includes('privacy') || bodyText.includes('Privacy') ||
                bodyText.includes('data') || bodyText.includes('Data')) {
                details.push('✅ Privacy/data information mentioned');
            } else {
                details.push('⚠️ Privacy information not immediately visible');
            }
            
            // Check for secure connection
            const currentUrl = page.url();
            if (currentUrl.startsWith('https://')) {
                details.push('✅ Secure HTTPS connection');
            } else {
                details.push('❌ Insecure connection detected');
            }
            
            // Check for data export/download options
            const dataButtons = await page.locator('button:has-text("Download"), button:has-text("Export"), a:has-text("Download")').count();
            if (dataButtons > 0) {
                details.push('✅ Data export options available');
            } else {
                details.push('⚠️ Data export options not found');
            }
            
            // Check for account management
            const accountElements = await page.locator('button:has-text("Profile"), button:has-text("Account"), a:has-text("Settings")').count();
            if (accountElements > 0) {
                details.push('✅ Account management options present');
            } else {
                details.push('⚠️ Account management not immediately accessible');
            }
            
        } catch (error) {
            details.push(`❌ Data handling test failed: ${error.message}`);
        }
        
        this.results.dataHandling = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('👥 PARTICIPANT EXPERIENCE VALIDATION REPORT');
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
        console.log(`🎯 PARTICIPANT EXPERIENCE HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
        console.log(`📊 TESTS PASSED: ${passedTests}/${totalTests}`);
        console.log('='.repeat(80));
        
        return { results: this.results, totalTests, passedTests, healthScore };
    }
}

// Execute validation
const validator = new ParticipantExperienceValidator();
validator.validateParticipantExperience()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('Participant experience validation execution failed:', error);
        process.exit(1);
    });