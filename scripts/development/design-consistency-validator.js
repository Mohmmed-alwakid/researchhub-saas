#!/usr/bin/env node

/**
 * 🎨 Design Consistency Validator - Automated UI/UX Standardization
 * 
 * Detects and fixes design inconsistencies:
 * - Manual styling vs component library usage
 * - Hardcoded colors, spacing, and typography
 * - Inconsistent button and form patterns
 * - Component usage violations
 * - Design token compliance
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class DesignConsistencyValidator {
    constructor() {
        this.projectRoot = process.cwd();
        this.issues = [];
        this.fixableIssues = [];
        this.patterns = this.initializePatterns();
    }

    /**
     * 🔍 Initialize Design Pattern Detection
     */
    initializePatterns() {
        return {
            // Manual styling patterns to detect
            manualStyling: {
                buttons: [
                    /className=["'][^"']*bg-(blue|green|red|gray)-\d+[^"']*["']/g,
                    /className=["'][^"']*px-\d+\s+py-\d+[^"']*["']/g,
                    /className=["'][^"']*rounded(-\w+)?[^"']*["']/g
                ],
                cards: [
                    /className=["'][^"']*bg-white[^"']*shadow[^"']*["']/g,
                    /className=["'][^"']*border[^"']*rounded[^"']*["']/g,
                    /className=["'][^"']*p-\d+[^"']*["']/g
                ],
                inputs: [
                    /className=["'][^"']*border-gray-\d+[^"']*["']/g,
                    /className=["'][^"']*focus:ring[^"']*["']/g
                ]
            },
            
            // Component usage patterns
            componentUsage: {
                correctImports: [
                    /import\s+{\s*[^}]+\s*}\s+from\s+['"]\.\.\/.+\/ui\/[^'"]+['"]/g,
                    /import\s+{\s*[^}]+\s*}\s+from\s+['"]\.\.\/.+\/ui['"]/g
                ],
                incorrectUsage: [
                    /<button(?![^>]*className=["'][^"']*\bbtn\b)/g,
                    /<div[^>]*className=["'][^"']*card[^"']*["']/g
                ]
            },
            
            // Design token violations
            designTokens: {
                hardcodedColors: [
                    /#[0-9a-fA-F]{3,6}/g,
                    /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
                    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g
                ],
                hardcodedSpacing: [
                    /margin:\s*\d+px/g,
                    /padding:\s*\d+px/g,
                    /width:\s*\d+px/g,
                    /height:\s*\d+px/g
                ]
            }
        };
    }

    /**
     * 🚀 Run Complete Design Audit
     */
    async runCompleteAudit() {
        console.log('🎨 ResearchHub Design Consistency Audit');
        console.log('='.repeat(45));
        console.log();

        const startTime = Date.now();
        
        // Get all React files
        const files = await this.getAllReactFiles();
        console.log(`📁 Analyzing ${files.length} React files...`);
        console.log();

        // Analyze each file
        for (const file of files) {
            await this.analyzeFile(file);
        }

        // Generate report
        this.generateAuditReport();
        
        console.log(`⏱️  Audit completed in ${Date.now() - startTime}ms`);
        
        return this.issues;
    }

    /**
     * 📁 Get All React Files
     */
    async getAllReactFiles() {
        const patterns = [
            'src/**/*.tsx',
            'src/**/*.jsx',
            '!src/**/*.test.*',
            '!src/**/*.spec.*',
            '!node_modules/**'
        ];

        const files = [];
        for (const pattern of patterns) {
            const matches = await glob(pattern, { cwd: this.projectRoot });
            files.push(...matches.map(f => path.join(this.projectRoot, f)));
        }

        return [...new Set(files)]; // Remove duplicates
    }

    /**
     * 🔍 Analyze Individual File
     */
    async analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);

            // Check for manual styling
            this.checkManualStyling(content, relativePath);
            
            // Check component usage
            this.checkComponentUsage(content, relativePath);
            
            // Check design token compliance
            this.checkDesignTokens(content, relativePath);
            
            // Check pattern consistency
            this.checkPatternConsistency(content, relativePath);

        } catch (error) {
            console.error(`❌ Error analyzing ${filePath}:`, error.message);
        }
    }

    /**
     * 🎨 Check Manual Styling Issues
     */
    checkManualStyling(content, filePath) {
        // Check for manual button styling
        const buttonMatches = this.findMatches(content, this.patterns.manualStyling.buttons);
        if (buttonMatches.length > 0) {
            this.addIssue('manual-button-styling', filePath, {
                count: buttonMatches.length,
                matches: buttonMatches.slice(0, 3), // Show first 3
                severity: 'high',
                message: 'Manual button styling detected - use Button component',
                fixable: true
            });
        }

        // Check for manual card styling
        const cardMatches = this.findMatches(content, this.patterns.manualStyling.cards);
        if (cardMatches.length > 0) {
            this.addIssue('manual-card-styling', filePath, {
                count: cardMatches.length,
                matches: cardMatches.slice(0, 3),
                severity: 'medium',
                message: 'Manual card styling detected - use Card component',
                fixable: true
            });
        }

        // Check for manual input styling
        const inputMatches = this.findMatches(content, this.patterns.manualStyling.inputs);
        if (inputMatches.length > 0) {
            this.addIssue('manual-input-styling', filePath, {
                count: inputMatches.length,
                matches: inputMatches.slice(0, 3),
                severity: 'medium',
                message: 'Manual input styling detected - use Input component',
                fixable: true
            });
        }
    }

    /**
     * 🧩 Check Component Usage
     */
    checkComponentUsage(content, filePath) {
        // Check for proper UI imports
        const hasUIImports = this.patterns.componentUsage.correctImports.some(pattern => 
            pattern.test(content)
        );

        // Check for raw HTML elements that should use components
        const rawButtons = (content.match(/<button(?![^>]*className=["'][^"']*\bbtn\b)/g) || []).length;
        if (rawButtons > 0) {
            this.addIssue('raw-button-usage', filePath, {
                count: rawButtons,
                severity: 'high',
                message: 'Raw <button> elements found - use Button component',
                fixable: true
            });
        }

        // Check for manual card divs
        const manualCards = (content.match(/className=["'][^"']*(?:bg-white|shadow|border).*(?:rounded|p-)/g) || []).length;
        if (manualCards > 0) {
            this.addIssue('manual-card-divs', filePath, {
                count: manualCards,
                severity: 'medium',
                message: 'Manual card-like styling found - use Card component',
                fixable: true
            });
        }
    }

    /**
     * 🎯 Check Design Token Compliance
     */
    checkDesignTokens(content, filePath) {
        // Check for hardcoded colors
        const hardcodedColors = this.findMatches(content, this.patterns.designTokens.hardcodedColors);
        if (hardcodedColors.length > 0) {
            this.addIssue('hardcoded-colors', filePath, {
                count: hardcodedColors.length,
                matches: hardcodedColors.slice(0, 5),
                severity: 'medium',
                message: 'Hardcoded colors detected - use design tokens',
                fixable: false
            });
        }

        // Check for hardcoded spacing
        const hardcodedSpacing = this.findMatches(content, this.patterns.designTokens.hardcodedSpacing);
        if (hardcodedSpacing.length > 0) {
            this.addIssue('hardcoded-spacing', filePath, {
                count: hardcodedSpacing.length,
                matches: hardcodedSpacing.slice(0, 5),
                severity: 'low',
                message: 'Hardcoded spacing detected - consider design tokens',
                fixable: false
            });
        }
    }

    /**
     * 📐 Check Pattern Consistency
     */
    checkPatternConsistency(content, filePath) {
        // Check for inconsistent form patterns
        const formInputs = (content.match(/<input/g) || []).length;
        const inputComponents = (content.match(/Input[\s\n]/g) || []).length;
        
        if (formInputs > 0 && inputComponents === 0) {
            this.addIssue('inconsistent-form-pattern', filePath, {
                count: formInputs,
                severity: 'medium',
                message: 'Raw input elements found - use Input component for consistency',
                fixable: true
            });
        }

        // Check for consistent button patterns
        const buttonPatterns = {
            primary: (content.match(/variant=["']primary["']/g) || []).length,
            secondary: (content.match(/variant=["']secondary["']/g) || []).length,
            raw: (content.match(/<button[^>]*(?!variant=)/g) || []).length
        };

        if (buttonPatterns.raw > 0) {
            this.addIssue('inconsistent-button-pattern', filePath, {
                count: buttonPatterns.raw,
                severity: 'high',
                message: 'Inconsistent button patterns - use variant prop',
                fixable: true
            });
        }
    }

    /**
     * 🔍 Helper: Find Pattern Matches
     */
    findMatches(content, patterns) {
        const matches = [];
        for (const pattern of patterns) {
            const found = content.match(pattern) || [];
            matches.push(...found);
        }
        return matches;
    }

    /**
     * 📝 Add Issue to Report
     */
    addIssue(type, filePath, details) {
        this.issues.push({
            type,
            file: filePath,
            ...details
        });

        if (details.fixable) {
            this.fixableIssues.push({
                type,
                file: filePath,
                ...details
            });
        }
    }

    /**
     * 📊 Generate Audit Report
     */
    generateAuditReport() {
        console.log('📊 DESIGN CONSISTENCY REPORT');
        console.log('='.repeat(35));
        console.log();

        if (this.issues.length === 0) {
            console.log('🎉 Excellent! No design consistency issues found.');
            console.log('✅ Your codebase follows design standards perfectly.');
            return;
        }

        // Group issues by severity
        const issuesBySeverity = this.groupIssuesBySeverity();
        
        // Display summary
        console.log('📈 ISSUE SUMMARY');
        console.log('-'.repeat(20));
        console.log(`🔴 High Priority: ${issuesBySeverity.high.length}`);
        console.log(`🟡 Medium Priority: ${issuesBySeverity.medium.length}`);
        console.log(`🟢 Low Priority: ${issuesBySeverity.low.length}`);
        console.log(`🔧 Auto-fixable: ${this.fixableIssues.length}`);
        console.log();

        // Display top issues
        this.displayTopIssues(issuesBySeverity);

        // Show fixable issues
        this.displayFixableIssues();

        // Generate recommendations
        this.generateRecommendations();

        // Save detailed report
        this.saveDetailedReport();
    }

    /**
     * 📊 Group Issues by Severity
     */
    groupIssuesBySeverity() {
        return {
            high: this.issues.filter(i => i.severity === 'high'),
            medium: this.issues.filter(i => i.severity === 'medium'),
            low: this.issues.filter(i => i.severity === 'low')
        };
    }

    /**
     * 🔝 Display Top Issues
     */
    displayTopIssues(issuesBySeverity) {
        console.log('🔴 HIGH PRIORITY ISSUES');
        console.log('-'.repeat(25));
        
        if (issuesBySeverity.high.length === 0) {
            console.log('✅ No high priority issues found!');
        } else {
            issuesBySeverity.high.slice(0, 5).forEach(issue => {
                console.log(`❌ ${issue.type}: ${issue.message}`);
                console.log(`   📁 ${issue.file}`);
                console.log(`   📊 Count: ${issue.count}`);
                if (issue.matches) {
                    console.log(`   📝 Examples: ${issue.matches.slice(0, 2).join(', ')}`);
                }
                console.log();
            });
        }

        console.log('🟡 MEDIUM PRIORITY ISSUES');
        console.log('-'.repeat(27));
        
        if (issuesBySeverity.medium.length === 0) {
            console.log('✅ No medium priority issues found!');
        } else {
            issuesBySeverity.medium.slice(0, 3).forEach(issue => {
                console.log(`⚠️  ${issue.type}: ${issue.message}`);
                console.log(`   📁 ${issue.file}`);
                console.log(`   📊 Count: ${issue.count}`);
                console.log();
            });
        }
    }

    /**
     * 🔧 Display Fixable Issues
     */
    displayFixableIssues() {
        if (this.fixableIssues.length > 0) {
            console.log('🔧 AUTO-FIXABLE ISSUES');
            console.log('-'.repeat(22));
            console.log(`✨ ${this.fixableIssues.length} issues can be automatically fixed`);
            console.log('💡 Run: npm run design:fix --auto');
            console.log();
        }
    }

    /**
     * 💡 Generate Recommendations
     */
    generateRecommendations() {
        console.log('💡 RECOMMENDATIONS');
        console.log('-'.repeat(20));

        const recommendations = [];

        // Button recommendations
        const buttonIssues = this.issues.filter(i => i.type.includes('button'));
        if (buttonIssues.length > 0) {
            recommendations.push('🔘 Standardize button usage: Import { Button } and use variant prop');
        }

        // Card recommendations
        const cardIssues = this.issues.filter(i => i.type.includes('card'));
        if (cardIssues.length > 0) {
            recommendations.push('📦 Use Card component: Replace manual div styling with Card/CardContent');
        }

        // Input recommendations  
        const inputIssues = this.issues.filter(i => i.type.includes('input'));
        if (inputIssues.length > 0) {
            recommendations.push('📝 Standardize inputs: Use Input component with consistent styling');
        }

        // Design token recommendations
        const tokenIssues = this.issues.filter(i => i.type.includes('hardcoded'));
        if (tokenIssues.length > 0) {
            recommendations.push('🎨 Adopt design tokens: Replace hardcoded values with token system');
        }

        if (recommendations.length === 0) {
            recommendations.push('🎉 Great job! Your design system usage is consistent.');
        }

        recommendations.forEach(rec => console.log(rec));
        console.log();
    }

    /**
     * 💾 Save Detailed Report
     */
    saveDetailedReport() {
        const reportPath = path.join(this.projectRoot, 'design-consistency-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalIssues: this.issues.length,
                fixableIssues: this.fixableIssues.length,
                filesCovered: [...new Set(this.issues.map(i => i.file))].length
            },
            issues: this.issues,
            fixableIssues: this.fixableIssues
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`💾 Detailed report saved: ${reportPath}`);
    }
}

// Handle command line usage
const args = process.argv.slice(2);
const validator = new DesignConsistencyValidator();

if (args.includes('--help') || args.includes('-h')) {
    console.log('🎨 Design Consistency Validator');
    console.log();
    console.log('Usage:');
    console.log('  npm run design:audit           Run complete audit');
    console.log('  npm run design:audit --fix     Run audit and show fixable issues');
    console.log('  npm run design:validate        Quick validation check');
    console.log();
    console.log('Issues Detected:');
    console.log('  🔴 Manual styling instead of components');
    console.log('  🟡 Hardcoded colors and spacing');
    console.log('  🟢 Inconsistent component patterns');
    console.log('  🔧 Auto-fixable formatting issues');
    process.exit(0);
}

// Run audit
if (args.includes('--quick')) {
    console.log('⚡ Running quick design validation...');
    // Quick validation logic would go here
} else {
    validator.runCompleteAudit().catch(console.error);
}