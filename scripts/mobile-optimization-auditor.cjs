/**
 * Mobile Optimization Auditor
 * Systematic mobile UX analysis and optimization tool
 */

const { readFile, writeFile } = require('fs/promises');
const { join } = require('path');

class MobileOptimizationAuditor {
    constructor() {
        this.issues = [];
        this.recommendations = [];
        this.testResults = {
            touchTargets: { passed: 0, failed: 0, issues: [] },
            responsive: { passed: 0, failed: 0, issues: [] },
            performance: { passed: 0, failed: 0, issues: [] },
            usability: { passed: 0, failed: 0, issues: [] }
        };
    }

    /**
     * Analyze touch target sizes
     */
    async analyzeTouchTargets(cssContent, componentContent) {
        const touchTargetRules = [
            {
                pattern: /button|\.btn|\.button/gi,
                minSize: 44,
                element: 'buttons',
                critical: true
            },
            {
                pattern: /input|\.input|\.form-control/gi,
                minSize: 44,
                element: 'input fields',
                critical: true
            },
            {
                pattern: /\.link|a\s*{|\.nav-link/gi,
                minSize: 44,
                element: 'links',
                critical: false
            },
            {
                pattern: /\.icon|\.fa-|\.material-icons/gi,
                minSize: 44,
                element: 'icons',
                critical: false
            }
        ];

        // Analyze CSS for size definitions
        for (const rule of touchTargetRules) {
            const matches = cssContent.match(rule.pattern) || [];
            
            // Check for explicit height/width definitions
            const sizePattern = new RegExp(`(${rule.pattern.source}).*?{[^}]*(?:height|width|min-height|min-width):\\s*(\\d+)px`, 'gis');
            const sizeMatches = cssContent.match(sizePattern) || [];
            
            sizeMatches.forEach(match => {
                const sizeMatch = match.match(/(\d+)px/);
                if (sizeMatch) {
                    const size = parseInt(sizeMatch[1]);
                    if (size >= rule.minSize) {
                        this.testResults.touchTargets.passed++;
                    } else {
                        this.testResults.touchTargets.failed++;
                        this.testResults.touchTargets.issues.push({
                            element: rule.element,
                            currentSize: size,
                            requiredSize: rule.minSize,
                            severity: rule.critical ? 'error' : 'warning',
                            recommendation: `Increase ${rule.element} size to at least ${rule.minSize}px`
                        });
                    }
                }
            });

            // If no explicit sizes found, flag for manual review
            if (matches.length > 0 && sizeMatches.length === 0) {
                this.testResults.touchTargets.issues.push({
                    element: rule.element,
                    currentSize: 'unknown',
                    requiredSize: rule.minSize,
                    severity: 'warning',
                    recommendation: `Define explicit touch target size for ${rule.element} (minimum ${rule.minSize}px)`
                });
            }
        }
    }

    /**
     * Analyze responsive design implementation
     */
    async analyzeResponsiveDesign(cssContent) {
        const responsiveChecks = [
            {
                pattern: /@media.*screen.*max-width.*768px/gi,
                name: 'Mobile breakpoint',
                required: true
            },
            {
                pattern: /@media.*screen.*max-width.*480px/gi,
                name: 'Small mobile breakpoint',
                required: false
            },
            {
                pattern: /@media.*screen.*min-width.*769px.*max-width.*1024px/gi,
                name: 'Tablet breakpoint',
                required: true
            },
            {
                pattern: /viewport/gi,
                name: 'Viewport meta tag',
                required: true
            },
            {
                pattern: /flex|grid|display:\s*flex|display:\s*grid/gi,
                name: 'Modern layout methods',
                required: false
            }
        ];

        for (const check of responsiveChecks) {
            const matches = cssContent.match(check.pattern) || [];
            if (matches.length > 0) {
                this.testResults.responsive.passed++;
                if (check.name === 'Modern layout methods') {
                    this.recommendations.push({
                        type: 'responsive',
                        message: `Good use of modern layout methods found (${matches.length} instances)`,
                        impact: 'positive'
                    });
                }
            } else if (check.required) {
                this.testResults.responsive.failed++;
                this.testResults.responsive.issues.push({
                    check: check.name,
                    severity: 'error',
                    recommendation: `Implement ${check.name} for proper mobile support`
                });
            }
        }

        // Check for fixed widths that might break mobile
        const fixedWidthPattern = /width:\s*(\d+)px(?!\s*;?\s*max-width)/gi;
        const fixedWidths = cssContent.match(fixedWidthPattern) || [];
        
        fixedWidths.forEach(match => {
            const width = parseInt(match.match(/(\d+)px/)[1]);
            if (width > 320) { // Larger than smallest mobile screen
                this.testResults.responsive.issues.push({
                    issue: `Fixed width ${width}px may break on mobile`,
                    severity: 'warning',
                    recommendation: 'Use max-width or responsive units instead'
                });
            }
        });
    }

    /**
     * Analyze mobile performance factors
     */
    async analyzePerformance(componentContent) {
        const performanceChecks = [
            {
                pattern: /import.*from.*['"].*\.(png|jpg|jpeg|gif|svg)['"]/gi,
                issue: 'Large image imports',
                recommendation: 'Use optimized images and lazy loading'
            },
            {
                pattern: /useState|useEffect/gi,
                positive: true,
                message: 'React hooks usage'
            },
            {
                pattern: /useMemo|useCallback/gi,
                positive: true,
                message: 'Performance optimization hooks found'
            },
            {
                pattern: /\.map\(/gi,
                issue: 'Array mapping without keys',
                recommendation: 'Ensure all mapped elements have unique keys'
            },
            {
                pattern: /inline-block|float:/gi,
                issue: 'Legacy layout methods',
                recommendation: 'Consider migrating to Flexbox or Grid'
            }
        ];

        for (const check of performanceChecks) {
            const matches = componentContent.match(check.pattern) || [];
            if (matches.length > 0) {
                if (check.positive) {
                    this.testResults.performance.passed++;
                    this.recommendations.push({
                        type: 'performance',
                        message: `${check.message}: ${matches.length} instances`,
                        impact: 'positive'
                    });
                } else {
                    this.testResults.performance.failed++;
                    this.testResults.performance.issues.push({
                        issue: `${check.issue}: ${matches.length} instances`,
                        severity: 'warning',
                        recommendation: check.recommendation
                    });
                }
            }
        }
    }

    /**
     * Analyze mobile usability patterns
     */
    async analyzeMobileUsability(componentContent) {
        const usabilityChecks = [
            {
                pattern: /onTouchStart|onTouchEnd|onTouchMove/gi,
                positive: true,
                message: 'Touch event handling'
            },
            {
                pattern: /onClick.*onTouchStart/gi,
                positive: true,
                message: 'Dual input support (mouse + touch)'
            },
            {
                pattern: /modal|dialog|popup/gi,
                issue: 'Modal/dialog usage',
                recommendation: 'Ensure modals work well on mobile screens'
            },
            {
                pattern: /scroll|overflow/gi,
                issue: 'Scroll containers',
                recommendation: 'Test scroll behavior on touch devices'
            },
            {
                pattern: /position:\s*fixed|position:\s*sticky/gi,
                issue: 'Fixed/sticky positioning',
                recommendation: 'Test positioning on mobile viewports'
            }
        ];

        for (const check of usabilityChecks) {
            const matches = componentContent.match(check.pattern) || [];
            if (matches.length > 0) {
                if (check.positive) {
                    this.testResults.usability.passed++;
                    this.recommendations.push({
                        type: 'usability',
                        message: `${check.message}: ${matches.length} instances`,
                        impact: 'positive'
                    });
                } else {
                    this.testResults.usability.issues.push({
                        issue: `${check.issue}: ${matches.length} instances`,
                        severity: 'info',
                        recommendation: check.recommendation
                    });
                }
            }
        }
    }

    /**
     * Generate mobile testing guidelines
     */
    generateMobileTestingGuide() {
        return {
            deviceTesting: [
                {
                    category: "Essential Devices",
                    devices: [
                        "iPhone 12/13/14 (375x812)",
                        "iPhone SE (320x568)", 
                        "Samsung Galaxy S21 (360x800)",
                        "iPad (768x1024)",
                        "iPad Pro (1024x1366)"
                    ]
                },
                {
                    category: "Browser Testing",
                    browsers: [
                        "Mobile Safari (iOS)",
                        "Chrome Mobile (Android)",
                        "Samsung Internet",
                        "Firefox Mobile"
                    ]
                }
            ],
            testingSteps: [
                {
                    step: 1,
                    title: "Touch Target Testing",
                    actions: [
                        "Tap all buttons with thumb",
                        "Test form input accuracy", 
                        "Verify link tap zones",
                        "Check icon button accessibility"
                    ]
                },
                {
                    step: 2,
                    title: "Layout Testing",
                    actions: [
                        "Rotate device (portrait/landscape)",
                        "Test content reflow",
                        "Verify no horizontal scrolling",
                        "Check text readability"
                    ]
                },
                {
                    step: 3,
                    title: "Performance Testing",
                    actions: [
                        "Test on slower network (3G)",
                        "Monitor memory usage",
                        "Check scroll performance",
                        "Validate image loading"
                    ]
                },
                {
                    step: 4,
                    title: "Interaction Testing",
                    actions: [
                        "Test gestures (swipe, pinch)",
                        "Verify keyboard behavior",
                        "Test modal interactions",
                        "Check form completion flow"
                    ]
                }
            ],
            automatedTesting: [
                "Responsive design testing with Playwright",
                "Performance testing with Lighthouse",
                "Cross-browser compatibility checks",
                "Touch target size validation"
            ]
        };
    }

    /**
     * Generate mobile optimization recommendations
     */
    generateOptimizationPlan() {
        const totalIssues = Object.values(this.testResults).reduce(
            (sum, category) => sum + category.failed + (category.issues?.length || 0), 0
        );

        return {
            priority: totalIssues > 10 ? 'HIGH' : totalIssues > 5 ? 'MEDIUM' : 'LOW',
            quickWins: [
                "Increase button sizes to 44px minimum",
                "Add viewport meta tag if missing",
                "Implement basic responsive breakpoints",
                "Optimize touch target spacing"
            ],
            mediumTermImprovements: [
                "Implement comprehensive responsive design",
                "Add touch gesture support",
                "Optimize images for mobile",
                "Improve modal/dialog mobile experience"
            ],
            longTermGoals: [
                "Progressive Web App features",
                "Offline functionality",
                "Advanced touch interactions",
                "Mobile-specific performance optimizations"
            ]
        };
    }

    /**
     * Run complete mobile optimization audit
     */
    async auditMobileOptimization(filePaths) {
        console.log('📱 Starting Mobile Optimization Audit...\n');

        let cssContent = '';
        let componentContent = '';

        for (const path of filePaths) {
            try {
                const content = await readFile(path, 'utf-8');
                console.log(`Auditing: ${path}`);
                
                if (path.endsWith('.css') || path.includes('tailwind')) {
                    cssContent += content + '\n';
                } else {
                    componentContent += content + '\n';
                }
            } catch (error) {
                console.error(`Error auditing ${path}:`, error.message);
            }
        }

        // Run all analyses
        await this.analyzeTouchTargets(cssContent, componentContent);
        await this.analyzeResponsiveDesign(cssContent);
        await this.analyzePerformance(componentContent);
        await this.analyzeMobileUsability(componentContent);

        return this.generateReport();
    }

    /**
     * Generate comprehensive mobile optimization report
     */
    generateReport() {
        const totalTests = Object.values(this.testResults).reduce(
            (sum, category) => sum + category.passed + category.failed, 0
        );
        const totalPassed = Object.values(this.testResults).reduce(
            (sum, category) => sum + category.passed, 0
        );
        const totalFailed = Object.values(this.testResults).reduce(
            (sum, category) => sum + category.failed, 0
        );

        const score = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

        return {
            summary: {
                score,
                totalTests,
                passed: totalPassed,
                failed: totalFailed,
                timestamp: new Date().toISOString()
            },
            results: this.testResults,
            recommendations: this.recommendations,
            testingGuide: this.generateMobileTestingGuide(),
            optimizationPlan: this.generateOptimizationPlan()
        };
    }
}

// Main execution
async function runMobileOptimizationAudit() {
    const auditor = new MobileOptimizationAuditor();
    
    const filePaths = [
        'src/client/components/ui/ConsolidatedComponents.tsx',
        'src/client/components/ui/AccessibleComponents-Fixed.tsx',
        'src/index.css',
        'tailwind.config.js'
    ];

    try {
        const report = await auditor.auditMobileOptimization(filePaths);
        
        // Save report
        await writeFile(
            'mobile-optimization-audit-report.json',
            JSON.stringify(report, null, 2)
        );

        // Console output
        console.log('\n📊 MOBILE OPTIMIZATION AUDIT RESULTS');
        console.log('=====================================');
        console.log(`Overall Score: ${report.summary.score}%`);
        console.log(`Tests Passed: ${report.summary.passed}/${report.summary.totalTests}`);
        console.log(`Tests Failed: ${report.summary.failed}`);
        
        if (report.summary.failed > 0) {
            console.log('\n❌ Issues Found:');
            Object.entries(report.results).forEach(([category, result]) => {
                if (result.issues && result.issues.length > 0) {
                    console.log(`\n${category.toUpperCase()}:`);
                    result.issues.forEach(issue => {
                        console.log(`  - ${issue.recommendation || issue.issue}`);
                    });
                }
            });
        }

        console.log('\n🚀 Quick Wins:');
        report.optimizationPlan.quickWins.forEach((win, index) => {
            console.log(`  ${index + 1}. ${win}`);
        });

        console.log('\n✅ Report saved to: mobile-optimization-audit-report.json');
        
        return report;
    } catch (error) {
        console.error('Mobile audit failed:', error);
        return null;
    }
}

// Export for use in other scripts
module.exports = { MobileOptimizationAuditor, runMobileOptimizationAudit };

// Run if called directly
if (require.main === module) {
    runMobileOptimizationAudit();
}
