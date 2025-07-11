#!/usr/bin/env node

/**
 * 🎯 99% Completeness Validator - Ensure Perfect Implementation Quality
 * 
 * This script provides comprehensive validation to ensure every implementation
 * meets the 99% completeness requirement before deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompletenessValidator {
    constructor() {
        this.projectRoot = process.cwd();
        this.completenessThreshold = 99;
        this.validationRules = this.loadValidationRules();
    }

    loadValidationRules() {
        return {
            codeQuality: {
                weight: 25,
                rules: [
                    { name: 'noTodos', pattern: /TODO|FIXME|XXX/gi, penalty: 10 },
                    { name: 'noConsoleDebug', pattern: /console\.log\(['"]debug/gi, penalty: 5 },
                    { name: 'noEmptyFunctions', pattern: /function.*?\{\s*\}/gi, penalty: 15 },
                    { name: 'properNaming', pattern: /[a-z][A-Z]/g, bonus: 5 }
                ]
            },
            typeScript: {
                weight: 20,
                rules: [
                    { name: 'interfaces', pattern: /interface\s+\w+/gi, bonus: 10 },
                    { name: 'types', pattern: /type\s+\w+\s*=/gi, bonus: 10 },
                    { name: 'typedParams', pattern: /:\s*(string|number|boolean)/gi, bonus: 5 },
                    { name: 'anyType', pattern: /:\s*any/gi, penalty: 20 }
                ]
            },
            testing: {
                weight: 20,
                rules: [
                    { name: 'testFiles', pattern: /\.test\.|\.spec\./gi, bonus: 15 },
                    { name: 'describes', pattern: /describe\(/gi, bonus: 10 },
                    { name: 'expects', pattern: /expect\(/gi, bonus: 5 }
                ]
            },
            documentation: {
                weight: 15,
                rules: [
                    { name: 'jsdoc', pattern: /\/\*\*[\s\S]*?\*\//g, bonus: 10 },
                    { name: 'paramDocs', pattern: /@param/gi, bonus: 5 },
                    { name: 'returnDocs', pattern: /@returns?/gi, bonus: 5 },
                    { name: 'readme', pattern: /README\.md/gi, bonus: 15 }
                ]
            },
            errorHandling: {
                weight: 10,
                rules: [
                    { name: 'tryCatch', pattern: /try\s*{[\s\S]*?catch/gi, bonus: 15 },
                    { name: 'errorBoundary', pattern: /ErrorBoundary/gi, bonus: 10 },
                    { name: 'catchHandlers', pattern: /\.catch\(/gi, bonus: 5 }
                ]
            },
            accessibility: {
                weight: 10,
                rules: [
                    { name: 'ariaLabels', pattern: /aria-\w+/gi, bonus: 10 },
                    { name: 'semanticHtml', pattern: /<(header|nav|main|section|article|aside|footer)/gi, bonus: 10 },
                    { name: 'altText', pattern: /alt=/gi, bonus: 5 },
                    { name: 'roles', pattern: /role=/gi, bonus: 5 }
                ]
            }
        };
    }

    /**
     * 🎯 Main Validation Entry Point
     */
    async validateImplementation(implementationPath) {
        console.log(`🎯 Validating implementation: ${implementationPath}`);
        console.log('=' .repeat(60));

        const results = {
            overallScore: 0,
            categoryScores: {},
            detailedResults: {},
            missingAreas: [],
            recommendations: [],
            passesThreshold: false
        };

        // Load implementation files
        const implementationData = await this.loadImplementationData(implementationPath);
        
        if (!implementationData) {
            console.log('❌ Could not load implementation data');
            return results;
        }

        // Validate each category
        for (const [category, config] of Object.entries(this.validationRules)) {
            const categoryResult = await this.validateCategory(category, config, implementationData);
            results.categoryScores[category] = categoryResult.score;
            results.detailedResults[category] = categoryResult;

            if (categoryResult.score < 80) {
                results.missingAreas.push(category);
            }
        }

        // Calculate overall score
        results.overallScore = this.calculateOverallScore(results.categoryScores);
        results.passesThreshold = results.overallScore >= this.completenessThreshold;
        results.recommendations = this.generateRecommendations(results);

        // Display results
        this.displayResults(results);

        return results;
    }

    /**
     * 📊 Category Validation
     */
    async validateCategory(category, config, implementationData) {
        console.log(`📊 Validating ${category}...`);

        const result = {
            category,
            score: 75, // Base score
            weight: config.weight,
            appliedRules: [],
            issues: [],
            suggestions: []
        };

        const allContent = this.combineImplementationContent(implementationData);

        for (const rule of config.rules) {
            const ruleResult = this.applyRule(rule, allContent, implementationData);
            result.appliedRules.push(ruleResult);

            if (ruleResult.bonus) {
                result.score += ruleResult.bonus;
            }
            if (ruleResult.penalty) {
                result.score -= ruleResult.penalty;
                result.issues.push(ruleResult.issue);
            }
        }

        // Ensure score bounds
        result.score = Math.max(0, Math.min(100, result.score));

        // Generate category-specific suggestions
        result.suggestions = this.generateCategorySuggestions(category, result);

        const status = result.score >= 90 ? '✅' : result.score >= 70 ? '⚠️' : '❌';
        console.log(`   ${status} ${category}: ${result.score.toFixed(1)}%`);

        return result;
    }

    /**
     * 🔍 Rule Application
     */
    applyRule(rule, content, implementationData) {
        const matches = content.match(rule.pattern) || [];
        const matchCount = matches.length;

        const ruleResult = {
            name: rule.name,
            matchCount,
            bonus: 0,
            penalty: 0,
            issue: null
        };

        if (rule.bonus && matchCount > 0) {
            ruleResult.bonus = Math.min(rule.bonus * Math.ceil(matchCount / 2), rule.bonus * 3);
        }

        if (rule.penalty && matchCount > 0) {
            ruleResult.penalty = rule.penalty * matchCount;
            ruleResult.issue = `Found ${matchCount} instances of ${rule.name}`;
        }

        return ruleResult;
    }

    /**
     * 🎯 Score Calculation
     */
    calculateOverallScore(categoryScores) {
        let totalWeightedScore = 0;
        let totalWeight = 0;

        Object.entries(categoryScores).forEach(([category, score]) => {
            const weight = this.validationRules[category].weight;
            totalWeightedScore += score * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    }

    /**
     * 📝 Recommendations Generation
     */
    generateRecommendations(results) {
        const recommendations = [];

        // Overall recommendations
        if (results.overallScore < this.completenessThreshold) {
            recommendations.push({
                priority: 'high',
                category: 'overall',
                message: `Implementation is ${(this.completenessThreshold - results.overallScore).toFixed(1)}% below the required threshold`,
                action: 'Focus on the lowest scoring categories first'
            });
        }

        // Category-specific recommendations
        Object.entries(results.categoryScores).forEach(([category, score]) => {
            if (score < 80) {
                const issues = results.detailedResults[category].issues;
                recommendations.push({
                    priority: score < 60 ? 'high' : 'medium',
                    category,
                    message: `${category} needs improvement (${score.toFixed(1)}%)`,
                    action: this.getCategoryImprovementAction(category),
                    issues
                });
            }
        });

        return recommendations;
    }

    getCategoryImprovementAction(category) {
        const actions = {
            codeQuality: 'Remove TODO comments, fix empty functions, improve naming conventions',
            typeScript: 'Add interfaces, type parameters, remove any types',
            testing: 'Add test files with proper describe/expect blocks',
            documentation: 'Add JSDoc comments, parameter documentation, README',
            errorHandling: 'Add try-catch blocks, error boundaries, catch handlers',
            accessibility: 'Add ARIA labels, semantic HTML, alt text, roles'
        };

        return actions[category] || 'Review category requirements and implement missing features';
    }

    generateCategorySuggestions(category, result) {
        const suggestions = [];

        switch (category) {
            case 'codeQuality':
                if (result.score < 80) {
                    suggestions.push('Remove all TODO/FIXME comments');
                    suggestions.push('Implement all empty functions');
                    suggestions.push('Use consistent naming conventions');
                }
                break;
            case 'typeScript':
                if (result.score < 80) {
                    suggestions.push('Add TypeScript interfaces for all props');
                    suggestions.push('Type all function parameters');
                    suggestions.push('Replace any types with specific types');
                }
                break;
            case 'testing':
                if (result.score < 80) {
                    suggestions.push('Create test files for all components');
                    suggestions.push('Add comprehensive test cases');
                    suggestions.push('Ensure good test coverage');
                }
                break;
            case 'documentation':
                if (result.score < 80) {
                    suggestions.push('Add JSDoc comments to all functions');
                    suggestions.push('Document all parameters and return values');
                    suggestions.push('Update README with usage examples');
                }
                break;
            case 'errorHandling':
                if (result.score < 80) {
                    suggestions.push('Add try-catch blocks for async operations');
                    suggestions.push('Implement error boundaries for components');
                    suggestions.push('Add proper error handling for API calls');
                }
                break;
            case 'accessibility':
                if (result.score < 80) {
                    suggestions.push('Add ARIA labels and descriptions');
                    suggestions.push('Use semantic HTML elements');
                    suggestions.push('Ensure keyboard navigation support');
                }
                break;
        }

        return suggestions;
    }

    /**
     * 📊 Results Display
     */
    displayResults(results) {
        console.log('\n📊 VALIDATION RESULTS');
        console.log('=' .repeat(60));

        // Overall score
        const overallStatus = results.passesThreshold ? '✅ PASS' : '❌ FAIL';
        console.log(`🎯 Overall Score: ${results.overallScore.toFixed(1)}% ${overallStatus}`);
        console.log(`📈 Threshold: ${this.completenessThreshold}%`);

        // Category breakdown
        console.log('\n📋 Category Breakdown:');
        Object.entries(results.categoryScores).forEach(([category, score]) => {
            const status = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
            const weight = this.validationRules[category].weight;
            console.log(`   ${status} ${category}: ${score.toFixed(1)}% (weight: ${weight}%)`);
        });

        // Issues
        if (results.missingAreas.length > 0) {
            console.log('\n⚠️  Areas Needing Improvement:');
            results.missingAreas.forEach(area => {
                const score = results.categoryScores[area];
                console.log(`   - ${area} (${score.toFixed(1)}%)`);
            });
        }

        // Recommendations
        if (results.recommendations.length > 0) {
            console.log('\n🔧 Recommendations:');
            results.recommendations.forEach((rec, index) => {
                const priority = rec.priority === 'high' ? '🔴' : '🟡';
                console.log(`   ${priority} ${rec.category}: ${rec.message}`);
                console.log(`      Action: ${rec.action}`);
            });
        }

        console.log('\n' + '=' .repeat(60));
    }

    /**
     * 📁 Data Loading
     */
    async loadImplementationData(implementationPath) {
        try {
            const fullPath = path.resolve(this.projectRoot, implementationPath);
            
            if (!fs.existsSync(fullPath)) {
                console.log(`❌ Path does not exist: ${fullPath}`);
                return null;
            }

            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                return await this.loadDirectoryData(fullPath);
            } else {
                return await this.loadFileData(fullPath);
            }
        } catch (error) {
            console.error(`❌ Error loading implementation data:`, error.message);
            return null;
        }
    }

    async loadDirectoryData(dirPath) {
        const data = {
            type: 'directory',
            path: dirPath,
            files: [],
            content: ''
        };

        const files = fs.readdirSync(dirPath, { recursive: true });
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile() && this.isValidFile(filePath)) {
                const fileData = await this.loadFileData(filePath);
                if (fileData) {
                    data.files.push(fileData);
                    data.content += fileData.content + '\n';
                }
            }
        }

        return data;
    }

    async loadFileData(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            return {
                type: 'file',
                path: filePath,
                name: path.basename(filePath),
                extension: path.extname(filePath),
                content,
                size: content.length
            };
        } catch (error) {
            console.error(`❌ Error reading file ${filePath}:`, error.message);
            return null;
        }
    }

    isValidFile(filePath) {
        const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.md', '.json'];
        const ext = path.extname(filePath);
        return validExtensions.includes(ext);
    }

    combineImplementationContent(implementationData) {
        if (implementationData.type === 'file') {
            return implementationData.content;
        } else if (implementationData.type === 'directory') {
            return implementationData.content;
        }
        return '';
    }

    /**
     * 🔧 Auto-Fix Suggestions
     */
    async generateAutoFixPlan(results) {
        const plan = {
            fixableIssues: [],
            manualIssues: [],
            estimatedEffort: 'medium'
        };

        results.recommendations.forEach(rec => {
            if (this.isAutoFixable(rec.category)) {
                plan.fixableIssues.push({
                    category: rec.category,
                    action: rec.action,
                    priority: rec.priority,
                    fix: this.getAutoFix(rec.category)
                });
            } else {
                plan.manualIssues.push(rec);
            }
        });

        return plan;
    }

    isAutoFixable(category) {
        const autoFixableCategories = ['codeQuality', 'documentation', 'typeScript'];
        return autoFixableCategories.includes(category);
    }

    getAutoFix(category) {
        const fixes = {
            codeQuality: {
                action: 'Remove TODO comments and add basic implementations',
                commands: ['remove-todos', 'fix-empty-functions']
            },
            documentation: {
                action: 'Add basic JSDoc comments',
                commands: ['add-jsdoc', 'update-readme']
            },
            typeScript: {
                action: 'Add basic TypeScript interfaces',
                commands: ['add-interfaces', 'type-parameters']
            }
        };

        return fixes[category] || null;
    }

    /**
     * 🎯 Command Interface
     */
    async run() {
        const command = process.argv[2] || 'help';
        const target = process.argv[3] || '.';
        
        console.log(`🎯 99% Completeness Validator - ${command.toUpperCase()}`);
        console.log(`📅 ${new Date().toISOString()}`);
        console.log('=' .repeat(70));
        
        try {
            switch (command) {
                case 'validate':
                    await this.validateImplementation(target);
                    break;
                    
                case 'quick':
                    console.log('🚀 Quick validation mode...');
                    await this.validateImplementation(target);
                    break;
                    
                case 'detailed':
                    console.log('🔍 Detailed validation mode...');
                    const results = await this.validateImplementation(target);
                    const plan = await this.generateAutoFixPlan(results);
                    console.log('\n🔧 Auto-Fix Plan:', plan);
                    break;
                    
                case 'help':
                default:
                    this.showHelp();
                    break;
            }
            
        } catch (error) {
            console.error('❌ Validation error:', error.message);
            process.exit(1);
        }
    }

    showHelp() {
        console.log(`
🎯 99% Completeness Validator - Help

Usage: node scripts/development/completeness-validator.js [command] [target]

Commands:
  validate [path]     - Validate implementation completeness
  quick [path]        - Quick validation check
  detailed [path]     - Detailed validation with auto-fix plan
  help               - Show this help message

Examples:
  node scripts/development/completeness-validator.js validate src/components/StudyBuilder
  node scripts/development/completeness-validator.js quick src/pages/Dashboard.tsx
  node scripts/development/completeness-validator.js detailed .

Validation Categories (weights):
  📝 Code Quality (25%)     - TODOs, naming, completeness
  🔤 TypeScript (20%)       - Interfaces, types, safety
  🧪 Testing (20%)          - Test files, coverage
  📚 Documentation (15%)    - JSDoc, README, comments
  ⚠️  Error Handling (10%)  - Try-catch, boundaries
  ♿ Accessibility (10%)    - ARIA, semantic HTML

Scoring:
  ✅ 90-100%: Excellent
  ⚠️  70-89%:  Good
  ❌ <70%:    Needs Improvement

Threshold: ${this.completenessThreshold}% required for deployment
        `);
    }
}

// Run the validator
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new CompletenessValidator();
    validator.run().catch(console.error);
}

export { CompletenessValidator };
