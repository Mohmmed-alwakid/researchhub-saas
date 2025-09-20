/**
 * 🎭 ResearchHub Platform Health Audit - Browser Testing
 * 
 * Comprehensive browser-based testing using Playwright to validate
 * critical user journeys and prevent UI/UX consistency issues.
 * 
 * Created: September 20, 2025
 * Purpose: Browser-level validation after fixing studies data consistency issue
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

class BrowserHealthAuditor {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.testAccounts = {
            researcher: {
                email: 'abwanwr77+Researcher@gmail.com',
                password: 'Testtest123',
                role: 'researcher'
            },
            participant: {
                email: 'abwanwr77+participant@gmail.com', 
                password: 'Testtest123',
                role: 'participant'
            },
            admin: {
                email: 'abwanwr77+admin@gmail.com',
                password: 'Testtest123',
                role: 'admin'
            }
        };
        this.auditResults = {
            timestamp: new Date().toISOString(),
            overall: { status: 'PENDING', score: 0, totalTests: 0, passedTests: 0 },
            loginFlows: { status: 'PENDING', issues: [] },
            dashboardUI: { status: 'PENDING', issues: [] },
            studyBuilder: { status: 'PENDING', issues: [] },
            dataConsistency: { status: 'PENDING', issues: [] },
            navigation: { status: 'PENDING', issues: [] }
        };
    }

    /**
     * 🔐 Test 1: Authentication Flows
     */
    async testLoginFlows(browser) {
        console.log('\n🔐 Testing Authentication Flows...');
        const issues = [];
        
        for (const [role, credentials] of Object.entries(this.testAccounts)) {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            try {
                // Navigate to login
                await page.goto(`${this.baseUrl}/auth/login`);
                await page.waitForLoadState('networkidle');
                
                // Fill login form
                await page.fill('input[type="email"]', credentials.email);
                await page.fill('input[type="password"]', credentials.password);
                
                // Submit login
                await page.click('button[type="submit"]');
                await page.waitForLoadState('networkidle');
                
                // Check for successful login (should redirect to dashboard)
                const currentUrl = page.url();
                if (currentUrl.includes('/app')) {
                    console.log(`✅ ${role} login successful`);
                } else {
                    issues.push(`${role} login failed - didn't redirect to dashboard`);
                }
                
                // Check role-specific elements
                const userRoleElement = await page.textContent('[data-testid="user-role"], .user-role, .role-indicator').catch(() => null);
                if (userRoleElement && userRoleElement.toLowerCase().includes(role)) {
                    console.log(`✅ ${role} role correctly displayed`);
                } else {
                    console.log(`⚠️ ${role} role indicator not found or incorrect`);
                }
                
            } catch (error) {
                issues.push(`${role} login test failed: ${error.message}`);
            } finally {
                await context.close();
            }
        }
        
        this.auditResults.loginFlows = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    /**
     * 📊 Test 2: Dashboard UI Consistency
     */
    async testDashboardUI(browser) {
        console.log('\n📊 Testing Dashboard UI Consistency...');
        const issues = [];
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // Login as researcher
            await this.loginAsRole(page, 'researcher');
            
            // Navigate to dashboard
            await page.goto(`${this.baseUrl}/app`);
            await page.waitForLoadState('networkidle');
            
            // Check for key dashboard elements
            const expectedElements = [
                { selector: '[data-testid="total-studies"], .total-studies, .studies-count', name: 'Studies count' },
                { selector: '[data-testid="total-participants"], .total-participants, .participants-count', name: 'Participants count' },
                { selector: '[data-testid="weekly-change"], .weekly-change, .change-indicator', name: 'Weekly change indicators' }
            ];
            
            for (const element of expectedElements) {
                try {
                    const found = await page.locator(element.selector).first().isVisible({ timeout: 5000 });
                    if (found) {
                        console.log(`✅ ${element.name} visible on dashboard`);
                    } else {
                        issues.push(`${element.name} not visible on dashboard`);
                    }
                } catch (error) {
                    issues.push(`${element.name} not found: ${error.message}`);
                }
            }
            
            // Check for empty state vs data consistency (the issue we fixed)
            const studiesText = await page.textContent('body');
            const hasEmptyState = studiesText.includes("You haven't created any studies yet");
            const hasStudiesData = studiesText.includes('studies') || studiesText.includes('Studies');
            
            if (hasEmptyState && hasStudiesData) {
                issues.push('Dashboard shows both empty state and studies data - consistency issue');
            } else {
                console.log('✅ Dashboard state consistency validated');
            }
            
        } catch (error) {
            issues.push(`Dashboard UI test failed: ${error.message}`);
        } finally {
            await context.close();
        }
        
        this.auditResults.dashboardUI = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    /**
     * 🔬 Test 3: Study Builder Functionality
     */
    async testStudyBuilder(browser) {
        console.log('\n🔬 Testing Study Builder Functionality...');
        const issues = [];
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // Login as researcher
            await this.loginAsRole(page, 'researcher');
            
            // Navigate to study creation
            await page.goto(`${this.baseUrl}/app/studies`);
            await page.waitForLoadState('networkidle');
            
            // Look for create study button/link
            try {
                await page.click('a[href*="create"], button:has-text("Create"), .create-study, [data-testid="create-study"]');
                await page.waitForLoadState('networkidle');
                console.log('✅ Study creation initiated successfully');
            } catch (error) {
                issues.push('Cannot find or click study creation button');
            }
            
            // Check if study builder loads
            const builderElements = [
                'Study Builder',
                'study-builder',
                'Block',
                'Template'
            ];
            
            const pageContent = await page.textContent('body');
            const builderLoaded = builderElements.some(element => 
                pageContent.toLowerCase().includes(element.toLowerCase())
            );
            
            if (builderLoaded) {
                console.log('✅ Study Builder loaded successfully');
            } else {
                issues.push('Study Builder did not load properly');
            }
            
        } catch (error) {
            issues.push(`Study Builder test failed: ${error.message}`);
        } finally {
            await context.close();
        }
        
        this.auditResults.studyBuilder = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    /**
     * 📈 Test 4: Data Consistency Validation
     */
    async testDataConsistency(browser) {
        console.log('\n📈 Testing Data Consistency...');
        const issues = [];
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // Login as researcher
            await this.loginAsRole(page, 'researcher');
            
            // Check dashboard studies count
            await page.goto(`${this.baseUrl}/app`);
            await page.waitForLoadState('networkidle');
            
            let dashboardCount = 0;
            try {
                const countText = await page.textContent('[data-testid="total-studies"], .total-studies, .studies-count').catch(() => '0');
                dashboardCount = parseInt(countText.match(/\d+/)?.[0] || '0');
                console.log(`📊 Dashboard shows: ${dashboardCount} studies`);
            } catch (error) {
                console.log('⚠️ Could not read dashboard studies count');
            }
            
            // Check studies page count
            await page.goto(`${this.baseUrl}/app/studies`);
            await page.waitForLoadState('networkidle');
            
            let studiesPageCount = 0;
            try {
                // Count study items on the page
                const studyElements = await page.locator('.study-item, [data-testid="study"], .study-card').count();
                studiesPageCount = studyElements;
                console.log(`📋 Studies page shows: ${studiesPageCount} studies`);
                
                // Check for empty state message
                const hasEmptyState = await page.locator(':has-text("haven\'t created any studies")').isVisible().catch(() => false);
                
                if (hasEmptyState && studyElements > 0) {
                    issues.push('Studies page shows empty state but also has study elements');
                } else if (hasEmptyState && dashboardCount > 0) {
                    issues.push(`Dashboard shows ${dashboardCount} studies but studies page shows empty state`);
                }
                
            } catch (error) {
                console.log('⚠️ Could not read studies page count');
            }
            
            // Validate consistency (allowing some tolerance for dynamic data)
            if (Math.abs(dashboardCount - studiesPageCount) > 1) {
                issues.push(`Data inconsistency: Dashboard shows ${dashboardCount} studies, Studies page shows ${studiesPageCount}`);
            } else {
                console.log('✅ Dashboard and Studies page data consistent');
            }
            
        } catch (error) {
            issues.push(`Data consistency test failed: ${error.message}`);
        } finally {
            await context.close();
        }
        
        this.auditResults.dataConsistency = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    /**
     * 🧭 Test 5: Navigation Flow
     */
    async testNavigation(browser) {
        console.log('\n🧭 Testing Navigation Flow...');
        const issues = [];
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // Login as researcher
            await this.loginAsRole(page, 'researcher');
            
            // Test key navigation paths
            const navigationTests = [
                { path: '/app', name: 'Dashboard' },
                { path: '/app/studies', name: 'Studies' },
                { path: '/app/templates', name: 'Templates' },
                { path: '/app/analytics', name: 'Analytics' },
                { path: '/app/account', name: 'Account' }
            ];
            
            for (const nav of navigationTests) {
                try {
                    await page.goto(`${this.baseUrl}${nav.path}`);
                    await page.waitForLoadState('networkidle', { timeout: 10000 });
                    
                    // Check if page loaded successfully (not 404 or error)
                    const title = await page.title();
                    const content = await page.textContent('body');
                    
                    if (content.includes('404') || content.includes('Not Found') || content.includes('Error')) {
                        issues.push(`${nav.name} page (${nav.path}) shows error or 404`);
                    } else {
                        console.log(`✅ ${nav.name} page loads successfully`);
                    }
                    
                } catch (error) {
                    issues.push(`${nav.name} navigation failed: ${error.message}`);
                }
            }
            
        } catch (error) {
            issues.push(`Navigation test failed: ${error.message}`);
        } finally {
            await context.close();
        }
        
        this.auditResults.navigation = {
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues
        };
    }

    /**
     * 🛠️ Utility Methods
     */
    async loginAsRole(page, role) {
        const credentials = this.testAccounts[role];
        
        await page.goto(`${this.baseUrl}/auth/login`);
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', credentials.email);
        await page.fill('input[type="password"]', credentials.password);
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
    }

    /**
     * 📋 Generate Report
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🎭 BROWSER HEALTH AUDIT REPORT');
        console.log('='.repeat(60));
        
        const totalTests = Object.keys(this.auditResults).length - 1; // Exclude 'overall'
        let passedTests = 0;
        
        for (const [testName, result] of Object.entries(this.auditResults)) {
            if (testName === 'overall') continue;
            
            if (result.status === 'PASS') {
                passedTests++;
                console.log(`✅ ${testName}: PASS`);
            } else {
                console.log(`❌ ${testName}: FAIL`);
                result.issues.forEach(issue => console.log(`   • ${issue}`));
            }
        }
        
        const score = Math.round((passedTests / totalTests) * 100);
        const overallStatus = score === 100 ? 'EXCELLENT' : score >= 80 ? 'GOOD' : score >= 60 ? 'FAIR' : 'POOR';
        
        this.auditResults.overall = {
            status: overallStatus,
            score,
            totalTests,
            passedTests
        };
        
        console.log('\n' + '='.repeat(60));
        console.log(`🎯 OVERALL BROWSER HEALTH: ${overallStatus} (${score}%)`);
        console.log(`📊 TESTS PASSED: ${passedTests}/${totalTests}`);
        console.log('='.repeat(60));
        
        this.saveDetailedReport();
        return this.auditResults;
    }

    saveDetailedReport() {
        const reportPath = path.join(process.cwd(), 'testing', 'platform-health-reports');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `browser-health-${timestamp}.json`;
        const filePath = path.join(reportPath, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(this.auditResults, null, 2));
        console.log(`\n📄 Detailed browser report saved: ${filePath}`);
    }

    /**
     * 🚀 Main Execution
     */
    async runFullBrowserAudit() {
        console.log('🎭 Starting Browser Health Audit...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🌐 Target: ${this.baseUrl}`);
        
        const browser = await chromium.launch({ headless: true });
        
        try {
            await this.testLoginFlows(browser);
            await this.testDashboardUI(browser);
            await this.testStudyBuilder(browser);
            await this.testDataConsistency(browser);
            await this.testNavigation(browser);
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Browser Health Audit failed:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }
}

// Execute if run as ES module
if (import.meta.url === `file://${process.argv[1]}`) {
    const auditor = new BrowserHealthAuditor();
    auditor.runFullBrowserAudit()
        .then(results => {
            process.exit(results.overall.score === 100 ? 0 : 1);
        })
        .catch(error => {
            console.error('Browser audit execution failed:', error);
            process.exit(1);
        });
}

export default BrowserHealthAuditor;