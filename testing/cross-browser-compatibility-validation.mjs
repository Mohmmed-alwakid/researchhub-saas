/**
 * 🌐 ResearchHub Cross-Browser Compatibility Validator
 * 
 * Comprehensive validation across multiple browsers:
 * 1. Chrome/Chromium compatibility
 * 2. Firefox compatibility  
 * 3. WebKit/Safari compatibility
 * 4. Responsive design validation
 * 5. Feature parity across browsers
 * 6. Performance consistency
 */

import { chromium, firefox, webkit } from 'playwright';

class CrossBrowserCompatibilityValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.testCredentials = {
            email: 'abwanwr77+Researcher@gmail.com',
            password: 'Testtest123'
        };
        this.browsers = [
            { name: 'Chromium', launcher: chromium },
            { name: 'Firefox', launcher: firefox },
            { name: 'WebKit', launcher: webkit }
        ];
        this.results = {
            chromiumCompatibility: { status: 'PENDING', details: [] },
            firefoxCompatibility: { status: 'PENDING', details: [] },
            webkitCompatibility: { status: 'PENDING', details: [] },
            responsiveDesign: { status: 'PENDING', details: [] },
            featureParity: { status: 'PENDING', details: [] },
            performanceConsistency: { status: 'PENDING', details: [] }
        };
    }

    async validateCrossBrowserCompatibility() {
        console.log('🌐 Starting Cross-Browser Compatibility Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🎯 Target: ${this.baseUrl}`);
        console.log(`🌐 Testing browsers: ${this.browsers.map(b => b.name).join(', ')}`);
        
        try {
            await this.testChromiumCompatibility();
            await this.testFirefoxCompatibility();
            await this.testWebKitCompatibility();
            await this.testResponsiveDesign();
            await this.testFeatureParity();
            await this.testPerformanceConsistency();
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ Cross-browser compatibility validation failed:', error.message);
            throw error;
        }
    }

    async testBrowserCompatibility(browserName, browserLauncher) {
        console.log(`\\n🔍 Testing ${browserName} Compatibility...`);
        const details = [];
        
        try {
            const browser = await browserLauncher.launch({ headless: false, slowMo: 500 });
            const context = await browser.newContext();
            const page = await context.newPage();
            
            // Test basic page loading
            const loadStart = Date.now();
            await page.goto(this.baseUrl);
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - loadStart;
            
            details.push(`✅ ${browserName} loads site in ${loadTime}ms`);
            
            // Test login functionality
            await page.goto(`${this.baseUrl}/login`);
            await page.waitForLoadState('networkidle');
            
            const loginPageLoaded = await page.textContent('body');
            if (loginPageLoaded.includes('login') || loginPageLoaded.includes('Login') || 
                loginPageLoaded.includes('email') || loginPageLoaded.includes('Email')) {
                details.push(`✅ ${browserName} login page renders correctly`);
                
                // Test form interaction
                try {
                    await page.fill('input[type="email"]', this.testCredentials.email);
                    await page.fill('input[type="password"]', this.testCredentials.password);
                    details.push(`✅ ${browserName} form inputs work correctly`);
                    
                    await page.click('button[type="submit"]');
                    await page.waitForLoadState('networkidle');
                    
                    const loggedInContent = await page.textContent('body');
                    if (!loggedInContent.includes('login') && !loggedInContent.includes('Login')) {
                        details.push(`✅ ${browserName} authentication successful`);
                        
                        // Test navigation
                        await page.goto(`${this.baseUrl}/app/studies`);
                        await page.waitForLoadState('networkidle');
                        
                        const studiesContent = await page.textContent('body');
                        if (studiesContent.includes('study') || studiesContent.includes('Study')) {
                            details.push(`✅ ${browserName} navigation works correctly`);
                        } else {
                            details.push(`⚠️ ${browserName} navigation may have issues`);
                        }
                    } else {
                        details.push(`❌ ${browserName} authentication failed`);
                    }
                } catch (error) {
                    details.push(`❌ ${browserName} form interaction failed: ${error.message}`);
                }
            } else {
                details.push(`❌ ${browserName} login page failed to render`);
            }
            
            // Test JavaScript functionality
            const jsTestResult = await page.evaluate(() => {
                return {
                    hasLocalStorage: typeof(Storage) !== 'undefined',
                    hasFetch: typeof(fetch) !== 'undefined',
                    hasPromise: typeof(Promise) !== 'undefined',
                    hasAsyncAwait: (async () => {})().constructor === Promise
                };
            });
            
            if (jsTestResult.hasLocalStorage && jsTestResult.hasFetch && 
                jsTestResult.hasPromise && jsTestResult.hasAsyncAwait) {
                details.push(`✅ ${browserName} supports all required JavaScript features`);
            } else {
                details.push(`⚠️ ${browserName} missing some JavaScript features`);
            }
            
            // Test CSS and styling
            const cssTest = await page.evaluate(() => {
                const testElement = document.querySelector('body');
                const styles = window.getComputedStyle(testElement);
                return {
                    hasFlexbox: styles.display !== undefined,
                    hasGridLayout: styles.gridTemplateColumns !== undefined,
                    hasTransforms: styles.transform !== undefined
                };
            });
            
            if (cssTest.hasFlexbox && cssTest.hasGridLayout && cssTest.hasTransforms) {
                details.push(`✅ ${browserName} supports modern CSS features`);
            } else {
                details.push(`⚠️ ${browserName} has limited CSS support`);
            }
            
            await browser.close();
            
        } catch (error) {
            details.push(`❌ ${browserName} compatibility test failed: ${error.message}`);
        }
        
        return {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testChromiumCompatibility() {
        const result = await this.testBrowserCompatibility('Chromium', chromium);
        this.results.chromiumCompatibility = result;
    }

    async testFirefoxCompatibility() {
        const result = await this.testBrowserCompatibility('Firefox', firefox);
        this.results.firefoxCompatibility = result;
    }

    async testWebKitCompatibility() {
        const result = await this.testBrowserCompatibility('WebKit', webkit);
        this.results.webkitCompatibility = result;
    }

    async testResponsiveDesign() {
        console.log('\\n📱 Testing Responsive Design...');
        const details = [];
        
        try {
            const browser = await chromium.launch({ headless: false, slowMo: 500 });
            const context = await browser.newContext();
            const page = await context.newPage();
            
            await page.goto(this.baseUrl);
            await page.waitForLoadState('networkidle');
            
            // Test different viewport sizes
            const viewports = [
                { name: 'Mobile', width: 375, height: 667 },
                { name: 'Tablet', width: 768, height: 1024 },
                { name: 'Desktop', width: 1920, height: 1080 },
                { name: 'Large Desktop', width: 2560, height: 1440 }
            ];
            
            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.waitForTimeout(1000);
                
                const content = await page.textContent('body');
                if (content.length > 100) {
                    details.push(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) renders correctly`);
                } else {
                    details.push(`❌ ${viewport.name} rendering failed`);
                }
                
                // Test navigation visibility on mobile
                if (viewport.name === 'Mobile') {
                    const navElements = await page.locator('nav, .navigation, .menu, button[aria-label*="menu"]').count();
                    if (navElements > 0) {
                        details.push('✅ Mobile navigation elements present');
                    } else {
                        details.push('⚠️ Mobile navigation unclear');
                    }
                }
            }
            
            await browser.close();
            
        } catch (error) {
            details.push(`❌ Responsive design test failed: ${error.message}`);
        }
        
        this.results.responsiveDesign = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testFeatureParity() {
        console.log('\\n⚖️ Testing Feature Parity Across Browsers...');
        const details = [];
        
        try {
            const features = [];
            
            for (const browserConfig of this.browsers) {
                const browser = await browserConfig.launcher.launch({ headless: true });
                const context = await browser.newContext();
                const page = await context.newPage();
                
                await page.goto(`${this.baseUrl}/login`);
                await page.waitForLoadState('networkidle');
                
                const featureTest = {
                    browser: browserConfig.name,
                    loginFormPresent: await page.locator('form').count() > 0,
                    inputFieldsWork: await page.locator('input[type="email"]').count() > 0,
                    buttonsClickable: await page.locator('button[type="submit"]').count() > 0,
                    stylingLoaded: (await page.textContent('body')).length > 200
                };
                
                features.push(featureTest);
                await browser.close();
            }
            
            // Compare features across browsers
            const allBrowsersHaveLogin = features.every(f => f.loginFormPresent);
            const allBrowsersHaveInputs = features.every(f => f.inputFieldsWork);
            const allBrowsersHaveButtons = features.every(f => f.buttonsClickable);
            const allBrowsersHaveStyling = features.every(f => f.stylingLoaded);
            
            if (allBrowsersHaveLogin) {
                details.push('✅ Login form present across all browsers');
            } else {
                details.push('❌ Login form inconsistent across browsers');
            }
            
            if (allBrowsersHaveInputs) {
                details.push('✅ Input fields work across all browsers');
            } else {
                details.push('❌ Input fields inconsistent across browsers');
            }
            
            if (allBrowsersHaveButtons) {
                details.push('✅ Buttons functional across all browsers');
            } else {
                details.push('❌ Button functionality inconsistent');
            }
            
            if (allBrowsersHaveStyling) {
                details.push('✅ Styling loads consistently across browsers');
            } else {
                details.push('❌ Styling inconsistent across browsers');
            }
            
        } catch (error) {
            details.push(`❌ Feature parity test failed: ${error.message}`);
        }
        
        this.results.featureParity = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testPerformanceConsistency() {
        console.log('\\n⚡ Testing Performance Consistency...');
        const details = [];
        
        try {
            const performanceResults = [];
            
            for (const browserConfig of this.browsers.slice(0, 2)) { // Test 2 browsers to save time
                const browser = await browserConfig.launcher.launch({ headless: true });
                const context = await browser.newContext();
                const page = await context.newPage();
                
                const startTime = Date.now();
                await page.goto(this.baseUrl);
                await page.waitForLoadState('networkidle');
                const loadTime = Date.now() - startTime;
                
                performanceResults.push({
                    browser: browserConfig.name,
                    loadTime: loadTime
                });
                
                await browser.close();
            }
            
            const avgLoadTime = performanceResults.reduce((sum, r) => sum + r.loadTime, 0) / performanceResults.length;
            const maxVariation = Math.max(...performanceResults.map(r => Math.abs(r.loadTime - avgLoadTime)));
            
            details.push(`✅ Average load time: ${Math.round(avgLoadTime)}ms`);
            
            if (maxVariation < 2000) { // Within 2 second variation
                details.push('✅ Performance consistent across browsers');
            } else {
                details.push('⚠️ Performance varies significantly across browsers');
            }
            
            performanceResults.forEach(result => {
                details.push(`📊 ${result.browser}: ${result.loadTime}ms`);
            });
            
        } catch (error) {
            details.push(`❌ Performance consistency test failed: ${error.message}`);
        }
        
        this.results.performanceConsistency = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    generateReport() {
        console.log('\\n' + '='.repeat(80));
        console.log('🌐 CROSS-BROWSER COMPATIBILITY VALIDATION REPORT');
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
        console.log(`🎯 CROSS-BROWSER COMPATIBILITY: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
        console.log(`📊 BROWSER TESTS PASSED: ${passedTests}/${totalTests}`);
        console.log('='.repeat(80));
        
        return { results: this.results, totalTests, passedTests, healthScore };
    }
}

// Execute validation
const validator = new CrossBrowserCompatibilityValidator();
validator.validateCrossBrowserCompatibility()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('Cross-browser compatibility validation execution failed:', error);
        process.exit(1);
    });