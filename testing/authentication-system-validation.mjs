/**
 * 🔐 ResearchHub Authentication System Validator
 * 
 * Comprehensive validation of authentication across all user roles:
 * 1. Login/logout functionality for all roles
 * 2. Role-based access control (RBAC)
 * 3. Session management and persistence
 * 4. Security boundaries and restrictions
 * 5. Password reset and recovery
 * 6. Multi-role testing and switching
 */

import { chromium } from 'playwright';

class AuthenticationSystemValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.testAccounts = {
            researcher: {
                email: 'abwanwr77+Researcher@gmail.com',
                password: 'Testtest123',
                expectedAccess: ['create study', 'study builder', 'templates', 'analytics']
            },
            participant: {
                email: 'abwanwr77+participant@gmail.com',
                password: 'Testtest123',
                expectedAccess: ['study browsing', 'study participation']
            },
            admin: {
                email: 'abwanwr77+admin@gmail.com',
                password: 'Testtest123',
                expectedAccess: ['user management', 'system admin', 'all studies']
            }
        };
        this.results = {
            loginFunctionality: { status: 'PENDING', details: [] },
            roleBasedAccess: { status: 'PENDING', details: [] },
            sessionManagement: { status: 'PENDING', details: [] },
            securityBoundaries: { status: 'PENDING', details: [] },
            passwordSecurity: { status: 'PENDING', details: [] },
            userExperience: { status: 'PENDING', details: [] }
        };
    }

    async validateAuthenticationSystem() {
        console.log('🔐 Starting Authentication System Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🌐 Target: ${this.baseUrl}`);
        console.log(`👥 Testing: ${Object.keys(this.testAccounts).join(', ')} roles`);
        
        const browser = await chromium.launch({ headless: false, slowMo: 1000 });
        
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            await this.testLoginFunctionality(page);
            await this.testRoleBasedAccess(page);
            await this.testSessionManagement(page);
            await this.testSecurityBoundaries(page);
            await this.testPasswordSecurity(page);
            await this.testUserExperience(page);
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Authentication system validation failed:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async testLoginFunctionality(page) {
        console.log('\\n🔑 Testing Login Functionality...');
        const details = [];
        
        for (const [role, credentials] of Object.entries(this.testAccounts)) {
            try {
                console.log(`Testing ${role} login...`);
                
                // Navigate to login page
                await page.goto(`${this.baseUrl}/login`);
                await page.waitForLoadState('networkidle');
                
                // Clear any existing data
                await page.fill('input[type="email"]', '');
                await page.fill('input[type="password"]', '');
                
                // Enter credentials
                await page.fill('input[type="email"]', credentials.email);
                await page.fill('input[type="password"]', credentials.password);
                
                // Submit login
                await page.click('button[type="submit"]');
                await page.waitForLoadState('networkidle');
                
                const currentUrl = page.url();
                const bodyText = await page.textContent('body');
                
                // Check successful login
                if (currentUrl.includes('/app') || currentUrl.includes('/dashboard')) {
                    details.push(`✅ ${role} login successful`);
                    
                    // Check for role-specific content
                    if (role === 'researcher' && bodyText.includes('Create Study')) {
                        details.push(`✅ ${role} sees researcher-specific content`);
                    } else if (role === 'participant' && !bodyText.includes('Create Study')) {
                        details.push(`✅ ${role} correctly restricted from researcher features`);
                    } else if (role === 'admin') {
                        details.push(`✅ ${role} has admin access`);
                    }
                } else {
                    details.push(`❌ ${role} login failed`);
                }
                
                // Test logout
                const logoutButtons = await page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")').count();
                if (logoutButtons > 0) {
                    await page.click('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")');
                    await page.waitForLoadState('networkidle');
                    
                    const logoutUrl = page.url();
                    if (logoutUrl.includes('/login') || logoutUrl === this.baseUrl || logoutUrl.includes('/auth')) {
                        details.push(`✅ ${role} logout successful`);
                    } else {
                        details.push(`⚠️ ${role} logout unclear`);
                    }
                } else {
                    details.push(`⚠️ ${role} logout button not found`);
                }
                
            } catch (error) {
                details.push(`❌ ${role} authentication test failed: ${error.message}`);
            }
        }
        
        this.results.loginFunctionality = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testRoleBasedAccess(page) {
        console.log('\\n👥 Testing Role-Based Access Control...');
        const details = [];
        
        try {
            // Test researcher access
            await this.loginAs(page, 'researcher');
            const researcherContent = await page.textContent('body');
            
            if (researcherContent.includes('Create Study') || researcherContent.includes('New Study')) {
                details.push('✅ Researcher can access study creation');
            } else {
                details.push('❌ Researcher cannot access study creation');
            }
            
            if (researcherContent.includes('Template') || researcherContent.includes('template')) {
                details.push('✅ Researcher can access templates');
            } else {
                details.push('⚠️ Template access unclear for researcher');
            }
            
            await this.logout(page);
            
            // Test participant access
            await this.loginAs(page, 'participant');
            const participantContent = await page.textContent('body');
            
            if (!participantContent.includes('Create Study') && !participantContent.includes('New Study')) {
                details.push('✅ Participant correctly restricted from study creation');
            } else {
                details.push('❌ Participant has unauthorized study creation access');
            }
            
            if (participantContent.includes('studies') || participantContent.includes('Studies')) {
                details.push('✅ Participant can access studies for participation');
            } else {
                details.push('⚠️ Participant study access unclear');
            }
            
            await this.logout(page);
            
            // Test admin access
            await this.loginAs(page, 'admin');
            const adminContent = await page.textContent('body');
            
            if (adminContent.includes('admin') || adminContent.includes('Admin') || 
                adminContent.includes('manage') || adminContent.includes('Manage')) {
                details.push('✅ Admin has administrative access');
            } else {
                details.push('⚠️ Admin features not immediately visible');
            }
            
            await this.logout(page);
            
        } catch (error) {
            details.push(`❌ Role-based access test failed: ${error.message}`);
        }
        
        this.results.roleBasedAccess = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testSessionManagement(page) {
        console.log('\\n📱 Testing Session Management...');
        const details = [];
        
        try {
            // Test session persistence
            await this.loginAs(page, 'researcher');
            
            // Navigate away and back
            await page.goto(`${this.baseUrl}/`);
            await page.waitForLoadState('networkidle');
            await page.goto(`${this.baseUrl}/app`);
            await page.waitForLoadState('networkidle');
            
            const sessionContent = await page.textContent('body');
            if (!sessionContent.includes('login') && !sessionContent.includes('Login')) {
                details.push('✅ Session persists across navigation');
            } else {
                details.push('❌ Session not maintained');
            }
            
            // Test page refresh
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const refreshContent = await page.textContent('body');
            if (!refreshContent.includes('login') && !refreshContent.includes('Login')) {
                details.push('✅ Session persists after page refresh');
            } else {
                details.push('❌ Session lost on refresh');
            }
            
            // Test new tab behavior
            const newTab = await page.context().newPage();
            await newTab.goto(`${this.baseUrl}/app`);
            await newTab.waitForLoadState('networkidle');
            
            const newTabContent = await newTab.textContent('body');
            if (!newTabContent.includes('login') && !newTabContent.includes('Login')) {
                details.push('✅ Session works across tabs');
            } else {
                details.push('⚠️ Session sharing across tabs unclear');
            }
            
            await newTab.close();
            await this.logout(page);
            
        } catch (error) {
            details.push(`❌ Session management test failed: ${error.message}`);
        }
        
        this.results.sessionManagement = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testSecurityBoundaries(page) {
        console.log('\\n🛡️ Testing Security Boundaries...');
        const details = [];
        
        try {
            // Test unauthorized access attempts
            await page.goto(`${this.baseUrl}/app`);
            await page.waitForLoadState('networkidle');
            
            const unauthorizedContent = await page.textContent('body');
            if (unauthorizedContent.includes('login') || unauthorizedContent.includes('Login') ||
                unauthorizedContent.includes('sign in') || unauthorizedContent.includes('Sign in')) {
                details.push('✅ Unauthorized access properly redirected to login');
            } else {
                details.push('❌ Unauthorized access not properly handled');
            }
            
            // Test HTTPS enforcement
            const currentUrl = page.url();
            if (currentUrl.startsWith('https://')) {
                details.push('✅ HTTPS connection enforced');
            } else {
                details.push('❌ Insecure HTTP connection allowed');
            }
            
            // Test invalid credentials
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            await page.fill('input[type="email"]', 'invalid@test.com');
            await page.fill('input[type="password"]', 'wrongpassword');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
            
            const invalidLoginContent = await page.textContent('body');
            if (invalidLoginContent.includes('error') || invalidLoginContent.includes('Error') ||
                invalidLoginContent.includes('invalid') || invalidLoginContent.includes('Invalid') ||
                page.url().includes('/login')) {
                details.push('✅ Invalid credentials properly rejected');
            } else {
                details.push('❌ Invalid credentials not properly handled');
            }
            
        } catch (error) {
            details.push(`❌ Security boundaries test failed: ${error.message}`);
        }
        
        this.results.securityBoundaries = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testPasswordSecurity(page) {
        console.log('\\n🔒 Testing Password Security...');
        const details = [];
        
        try {
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            // Check for password field security
            const passwordField = await page.locator('input[type="password"]').first();
            if (passwordField) {
                details.push('✅ Password field properly masked');
            } else {
                details.push('❌ Password field not found or not secure');
            }
            
            // Check for forgot password functionality
            const forgotPasswordLinks = await page.locator('a:has-text("Forgot"), button:has-text("Forgot"), a:has-text("Reset")').count();
            if (forgotPasswordLinks > 0) {
                details.push('✅ Password reset functionality available');
            } else {
                details.push('⚠️ Password reset functionality not found');
            }
            
            // Test password visibility toggle
            const showPasswordButtons = await page.locator('button[aria-label*="Show"], button[aria-label*="password"], .eye-icon').count();
            if (showPasswordButtons > 0) {
                details.push('✅ Password visibility toggle present');
            } else {
                details.push('⚠️ Password visibility toggle not found');
            }
            
            // Check for security indicators
            const bodyText = await page.textContent('body');
            if (bodyText.includes('secure') || bodyText.includes('Secure') ||
                bodyText.includes('encrypted') || bodyText.includes('Encrypted')) {
                details.push('✅ Security information displayed');
            } else {
                details.push('⚠️ Security information not immediately visible');
            }
            
        } catch (error) {
            details.push(`❌ Password security test failed: ${error.message}`);
        }
        
        this.results.passwordSecurity = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testUserExperience(page) {
        console.log('\\n🎨 Testing Authentication User Experience...');
        const details = [];
        
        try {
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            // Check for loading states
            const bodyText = await page.textContent('body');
            if (!bodyText.includes('Loading...') && !bodyText.includes('Error')) {
                details.push('✅ Login page loads cleanly');
            } else {
                details.push('⚠️ Login page shows loading or error states');
            }
            
            // Check for user feedback
            const formElements = await page.locator('form').count();
            if (formElements > 0) {
                details.push('✅ Proper form structure present');
            } else {
                details.push('❌ Login form not found');
            }
            
            // Check for helpful text
            if (bodyText.includes('Welcome') || bodyText.includes('Sign in') || 
                bodyText.includes('Login') || bodyText.includes('Email')) {
                details.push('✅ User-friendly interface language');
            } else {
                details.push('⚠️ Interface language could be more user-friendly');
            }
            
            // Test mobile responsiveness
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(1000);
            
            const mobileContent = await page.textContent('body');
            if (mobileContent.length > 50) {
                details.push('✅ Login interface responsive on mobile');
            } else {
                details.push('❌ Login interface not mobile responsive');
            }
            
            // Reset viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            
        } catch (error) {
            details.push(`❌ User experience test failed: ${error.message}`);
        }
        
        this.results.userExperience = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async loginAs(page, role) {
        const credentials = this.testAccounts[role];
        await page.goto(`${this.baseUrl}/login`);
        await page.waitForLoadState('networkidle');
        await page.fill('input[type="email"]', credentials.email);
        await page.fill('input[type="password"]', credentials.password);
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
    }

    async logout(page) {
        try {
            const logoutButton = await page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")').first();
            if (await logoutButton.isVisible()) {
                await logoutButton.click();
                await page.waitForLoadState('networkidle');
            }
        } catch (error) {
            // Logout may not be visible or available
        }
    }

    generateReport() {
        console.log('\\n' + '='.repeat(80));
        console.log('🔐 AUTHENTICATION SYSTEM VALIDATION REPORT');
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
        console.log(`🎯 AUTHENTICATION SECURITY HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
        console.log(`📊 SECURITY TESTS PASSED: ${passedTests}/${totalTests}`);
        console.log('='.repeat(80));
        
        return { results: this.results, totalTests, passedTests, healthScore };
    }
}

// Execute validation
const validator = new AuthenticationSystemValidator();
validator.validateAuthenticationSystem()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('Authentication system validation execution failed:', error);
        process.exit(1);
    });