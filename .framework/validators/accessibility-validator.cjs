/**
 * Accessibility Validation and Testing Tool
 * Automated accessibility checks and testing guidelines
 */

const { readFile, writeFile } = require('fs/promises');
const { join } = require('path');

class AccessibilityValidator {
    constructor() {
        this.issues = [];
        this.recommendations = [];
        this.testResults = {
            aria: { passed: 0, failed: 0, issues: [] },
            colorContrast: { passed: 0, failed: 0, issues: [] },
            keyboard: { passed: 0, failed: 0, issues: [] },
            semantics: { passed: 0, failed: 0, issues: [] }
        };
    }

    /**
     * Validate ARIA attributes in React components
     */
    async validateARIA(componentCode) {
        const ariaChecks = [
            {
                pattern: /<button[^>]*>/g,
                requirement: 'aria-label|aria-labelledby',
                message: 'Buttons should have accessible labels'
            },
            {
                pattern: /<input[^>]*>/g,
                requirement: 'aria-label|aria-labelledby|aria-describedby',
                message: 'Input fields should have accessible labels'
            },
            {
                pattern: /<div[^>]*role=["\'](button|link)["\'][^>]*>/g,
                requirement: 'aria-label|aria-labelledby',
                message: 'Interactive elements need accessible labels'
            },
            {
                pattern: /<img[^>]*>/g,
                requirement: 'alt=',
                message: 'Images should have alt text'
            }
        ];

        for (const check of ariaChecks) {
            const matches = componentCode.match(check.pattern) || [];
            for (const match of matches) {
                if (!new RegExp(check.requirement).test(match)) {
                    this.testResults.aria.failed++;
                    this.testResults.aria.issues.push({
                        element: match,
                        issue: check.message,
                        severity: 'error'
                    });
                } else {
                    this.testResults.aria.passed++;
                }
            }
        }
    }

    /**
     * Check color contrast standards
     */
    async validateColorContrast(cssCode) {
        // Common color combinations to check
        const colorPatterns = [
            { bg: '#ffffff', fg: '#000000', ratio: 21 }, // Perfect contrast
            { bg: '#f8f9fa', fg: '#6c757d', ratio: 4.5 }, // Bootstrap secondary
            { bg: '#007bff', fg: '#ffffff', ratio: 4.5 }, // Bootstrap primary
            { bg: '#28a745', fg: '#ffffff', ratio: 4.5 }, // Bootstrap success
            { bg: '#dc3545', fg: '#ffffff', ratio: 4.5 }  // Bootstrap danger
        ];

        // Simple contrast ratio calculation (simplified)
        const checkContrast = (bg, fg) => {
            // This is a simplified check - in real implementation,
            // you'd use a proper color contrast library
            const bgLuminance = this.getLuminance(bg);
            const fgLuminance = this.getLuminance(fg);
            return (Math.max(bgLuminance, fgLuminance) + 0.05) / 
                   (Math.min(bgLuminance, fgLuminance) + 0.05);
        };

        for (const color of colorPatterns) {
            const ratio = checkContrast(color.bg, color.fg);
            if (ratio >= 4.5) {
                this.testResults.colorContrast.passed++;
            } else {
                this.testResults.colorContrast.failed++;
                this.testResults.colorContrast.issues.push({
                    background: color.bg,
                    foreground: color.fg,
                    ratio: ratio.toFixed(2),
                    required: '4.5',
                    severity: 'warning'
                });
            }
        }
    }

    /**
     * Simple luminance calculation
     */
    getLuminance(hex) {
        // Convert hex to RGB
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >>  8) & 0xff;
        const b = (rgb >>  0) & 0xff;
        
        // Simplified luminance calculation
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    /**
     * Validate keyboard navigation patterns
     */
    async validateKeyboardNavigation(componentCode) {
        const keyboardChecks = [
            {
                pattern: /tabIndex\s*=\s*{?-1}?/g,
                message: 'Elements with tabIndex -1 should be focusable programmatically'
            },
            {
                pattern: /onKeyDown|onKeyUp|onKeyPress/g,
                message: 'Keyboard event handlers found - ensure Enter/Space support'
            },
            {
                pattern: /<button[^>]*disabled/g,
                message: 'Disabled buttons should not be focusable'
            }
        ];

        for (const check of keyboardChecks) {
            const matches = componentCode.match(check.pattern) || [];
            if (matches.length > 0) {
                this.testResults.keyboard.passed += matches.length;
                this.recommendations.push({
                    type: 'keyboard',
                    message: check.message,
                    count: matches.length
                });
            }
        }
    }

    /**
     * Validate semantic HTML usage
     */
    async validateSemantics(componentCode) {
        const semanticChecks = [
            {
                pattern: /<h[1-6][^>]*>/g,
                good: true,
                message: 'Proper heading structure found'
            },
            {
                pattern: /<div[^>]*role=["\'](button|link)["\'][^>]*>/g,
                good: false,
                message: 'Use semantic buttons/links instead of divs with roles'
            },
            {
                pattern: /<main[^>]*>/g,
                good: true,
                message: 'Semantic main element found'
            },
            {
                pattern: /<nav[^>]*>/g,
                good: true,
                message: 'Semantic navigation found'
            }
        ];

        for (const check of semanticChecks) {
            const matches = componentCode.match(check.pattern) || [];
            if (matches.length > 0) {
                if (check.good) {
                    this.testResults.semantics.passed += matches.length;
                } else {
                    this.testResults.semantics.failed += matches.length;
                    this.testResults.semantics.issues.push({
                        pattern: check.pattern.toString(),
                        message: check.message,
                        count: matches.length,
                        severity: 'warning'
                    });
                }
            }
        }
    }

    /**
     * Generate screen reader testing guidelines
     */
    generateScreenReaderTestingGuide() {
        return {
            testingSteps: [
                {
                    step: 1,
                    title: "Enable Screen Reader",
                    instructions: [
                        "Windows: Enable Narrator (Windows + Ctrl + Enter)",
                        "Mac: Enable VoiceOver (Cmd + F5)",
                        "Test with NVDA (free) or JAWS (commercial)"
                    ]
                },
                {
                    step: 2,
                    title: "Navigation Testing",
                    instructions: [
                        "Tab through all interactive elements",
                        "Use arrow keys to navigate content",
                        "Test heading navigation (H key in NVDA/JAWS)",
                        "Test landmark navigation (D key for main, N for nav)"
                    ]
                },
                {
                    step: 3,
                    title: "Content Testing",
                    instructions: [
                        "Verify all content is announced",
                        "Check form labels are read correctly",
                        "Test error messages are announced",
                        "Verify button purposes are clear"
                    ]
                },
                {
                    step: 4,
                    title: "Interaction Testing",
                    instructions: [
                        "Test all buttons with Enter/Space",
                        "Verify focus indicators are visible",
                        "Test modal/dialog announcements",
                        "Check dynamic content updates are announced"
                    ]
                }
            ],
            commonIssues: [
                "Missing or inadequate alt text",
                "Unlabeled form controls",
                "Poor focus management",
                "Missing landmark roles",
                "Inadequate error messaging",
                "Dynamic content not announced"
            ],
            testingChecklist: [
                "All interactive elements are keyboard accessible",
                "Focus indicators are clearly visible",
                "Screen reader announces all content appropriately",
                "Form validation errors are announced",
                "Modal dialogs trap focus correctly",
                "Skip links work properly",
                "Heading structure is logical",
                "Images have appropriate alt text"
            ]
        };
    }

    /**
     * Run complete accessibility audit
     */
    async auditAccessibility(componentPaths) {
        console.log('🔍 Starting Accessibility Audit...\n');

        for (const path of componentPaths) {
            try {
                const content = await readFile(path, 'utf-8');
                console.log(`Auditing: ${path}`);
                
                await this.validateARIA(content);
                await this.validateKeyboardNavigation(content);
                await this.validateSemantics(content);
                
                // For CSS files
                if (path.endsWith('.css') || path.includes('tailwind')) {
                    await this.validateColorContrast(content);
                }
            } catch (error) {
                console.error(`Error auditing ${path}:`, error.message);
            }
        }

        return this.generateReport();
    }

    /**
     * Generate comprehensive accessibility report
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
            screenReaderGuide: this.generateScreenReaderTestingGuide(),
            nextSteps: this.generateNextSteps(score)
        };
    }

    /**
     * Generate next steps based on audit results
     */
    generateNextSteps(score) {
        if (score >= 90) {
            return [
                "Conduct manual screen reader testing",
                "Test with real users with disabilities",
                "Document accessibility features",
                "Set up automated accessibility CI checks"
            ];
        } else if (score >= 70) {
            return [
                "Fix remaining ARIA issues",
                "Improve color contrast where needed",
                "Enhance keyboard navigation",
                "Add missing semantic elements"
            ];
        } else {
            return [
                "Address critical accessibility issues first",
                "Implement basic ARIA labels",
                "Fix color contrast problems",
                "Add keyboard event handlers",
                "Use semantic HTML elements"
            ];
        }
    }
}

// Main execution
async function runAccessibilityAudit() {
    const validator = new AccessibilityValidator();
    
    const componentPaths = [
        'src/client/components/ui/AccessibleComponents-Fixed.tsx',
        'src/client/components/ui/ConsolidatedComponents.tsx',
        'src/client/hooks/accessibility.ts',
        'src/index.css'
    ];

    try {
        const report = await validator.auditAccessibility(componentPaths);
        
        // Save report
        await writeFile(
            'accessibility-audit-report.json',
            JSON.stringify(report, null, 2)
        );

        // Console output
        console.log('\n📊 ACCESSIBILITY AUDIT RESULTS');
        console.log('================================');
        console.log(`Overall Score: ${report.summary.score}%`);
        console.log(`Tests Passed: ${report.summary.passed}/${report.summary.totalTests}`);
        console.log(`Tests Failed: ${report.summary.failed}`);
        
        if (report.summary.failed > 0) {
            console.log('\n❌ Issues Found:');
            Object.entries(report.results).forEach(([category, result]) => {
                if (result.issues && result.issues.length > 0) {
                    console.log(`\n${category.toUpperCase()}:`);
                    result.issues.forEach(issue => {
                        console.log(`  - ${issue.message || issue.issue}`);
                    });
                }
            });
        }

        console.log('\n📋 Next Steps:');
        report.nextSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step}`);
        });

        console.log('\n✅ Report saved to: accessibility-audit-report.json');
        
        return report;
    } catch (error) {
        console.error('Audit failed:', error);
        return null;
    }
}

// Export for use in other scripts
module.exports = { AccessibilityValidator, runAccessibilityAudit };

// Run if called directly
if (require.main === module) {
    runAccessibilityAudit();
}
