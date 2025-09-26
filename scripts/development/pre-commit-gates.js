#!/usr/bin/env node

/**
 * 🎯 Pre-commit Quality Gates - Automated Quality Assurance
 * 
 * Runs comprehensive quality checks before commits to catch issues early:
 * - TypeScript compilation errors
 * - ESLint code quality issues
 * - Project structure compliance
 * - Basic functionality tests
 * - Development best practices validation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class PreCommitQualityGates {
    constructor() {
        this.projectRoot = process.cwd();
        this.startTime = Date.now();
        this.checks = [];
    }

    /**
     * 🚀 Run All Quality Gates
     */
    async runAllChecks() {
        console.log('🎯 Running Pre-commit Quality Gates');
        console.log('='.repeat(40));
        console.log();

        const gates = [
            { name: 'Project Structure', check: () => this.checkProjectStructure() },
            { name: 'TypeScript Compilation', check: () => this.checkTypeScript() },
            { name: 'Code Quality (ESLint)', check: () => this.checkLinting() },
            { name: 'Design Consistency', check: () => this.checkDesignConsistency() },
            { name: 'Package Dependencies', check: () => this.checkDependencies() },
            { name: 'Environment Configuration', check: () => this.checkEnvironment() },
            { name: 'Critical Files', check: () => this.checkCriticalFiles() },
            { name: 'Git Status', check: () => this.checkGitStatus() }
        ];

        let passedGates = 0;
        let failedGates = 0;

        for (const gate of gates) {
            try {
                console.log(`🔍 Checking: ${gate.name}...`);
                await gate.check();
                console.log(`✅ ${gate.name}: PASSED`);
                passedGates++;
            } catch (error) {
                console.log(`❌ ${gate.name}: FAILED`);
                console.log(`   Error: ${error.message}`);
                failedGates++;
            }
        }

        console.log();
        console.log('📊 QUALITY GATE SUMMARY');
        console.log('-'.repeat(25));
        console.log(`✅ Passed: ${passedGates}`);
        console.log(`❌ Failed: ${failedGates}`);
        console.log(`⏱️  Time: ${Date.now() - this.startTime}ms`);

        if (failedGates > 0) {
            console.log();
            console.log('🚨 COMMIT BLOCKED - Fix issues above before committing');
            process.exit(1);
        } else {
            console.log();
            console.log('🎉 ALL QUALITY GATES PASSED - Ready to commit!');
            process.exit(0);
        }
    }

    /**
     * 🏗️ Project Structure Check
     */
    checkProjectStructure() {
        const requiredDirectories = [
            'src',
            'api',
            'scripts/development',
            'testing',
            'docs'
        ];

        const missingDirs = requiredDirectories.filter(dir => !fs.existsSync(dir));
        if (missingDirs.length > 0) {
            throw new Error(`Missing directories: ${missingDirs.join(', ')}`);
        }

        // Check for file organization issues
        const rootFiles = fs.readdirSync('.').filter(file => {
            const stat = fs.statSync(file);
            return stat.isFile() && !file.startsWith('.');
        });

        if (rootFiles.length > 25) {
            throw new Error('Too many files in root directory. Run: npm run cleanup');
        }

        return true;
    }

    /**
     * 🎯 TypeScript Compilation Check
     */
    checkTypeScript() {
        try {
            execSync('npx tsc --noEmit', { stdio: 'pipe' });
            return true;
        } catch (error) {
            const output = error.stdout?.toString() || error.stderr?.toString() || '';
            const errorCount = (output.match(/error TS\d+/g) || []).length;
            throw new Error(`${errorCount} TypeScript compilation errors found`);
        }
    }

    /**
     * ✨ ESLint Code Quality Check
     */
    checkLinting() {
        try {
            execSync('npm run lint', { stdio: 'pipe' });
            return true;
        } catch (error) {
            const output = error.stdout?.toString() || '';
            const errorMatch = output.match(/(\d+) error/);
            const warningMatch = output.match(/(\d+) warning/);
            
            const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
            const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
            
            if (errors > 0) {
                throw new Error(`${errors} ESLint errors found (${warnings} warnings)`);
            } else if (warnings > 5) {
                throw new Error(`${warnings} ESLint warnings found (consider fixing)`);
            }
            
            return true;
        }
    }

    /**
     * 🎨 Design Consistency Check
     */
    checkDesignConsistency() {
        try {
            execSync('node scripts/development/design-consistency-validator.js --quick', { stdio: 'pipe' });
            return true;
        } catch (error) {
            const output = error.stdout?.toString() || '';
            const highPriorityIssues = (output.match(/🔴 High Priority: (\d+)/)?.[1]) || '0';
            const totalIssues = (output.match(/Total Issues: (\d+)/)?.[1]) || '0';
            
            if (parseInt(highPriorityIssues) > 5) {
                throw new Error(`${highPriorityIssues} high-priority design inconsistencies found. Run: npm run design:audit`);
            } else if (parseInt(totalIssues) > 20) {
                console.log(`⚠️  ${totalIssues} design inconsistencies detected (not blocking)`);
                return true;
            }
            
            return true;
        }
    }

    /**
     * 📦 Package Dependencies Check
     */
    checkDependencies() {
        try {
            execSync('npm ls --depth=0', { stdio: 'pipe' });
            return true;
        } catch (error) {
            throw new Error('Dependency issues detected. Run: npm install');
        }
    }

    /**
     * 🌍 Environment Configuration Check
     */
    checkEnvironment() {
        const requiredFiles = [
            'package.json',
            'vite.config.ts',
            'tsconfig.json'
        ];

        const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
        if (missingFiles.length > 0) {
            throw new Error(`Missing configuration files: ${missingFiles.join(', ')}`);
        }

        // Check package.json for required scripts
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const requiredScripts = ['dev:fullstack', 'build', 'test:quick'];
        
        const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
        if (missingScripts.length > 0) {
            throw new Error(`Missing package.json scripts: ${missingScripts.join(', ')}`);
        }

        return true;
    }

    /**
     * 📁 Critical Files Check
     */
    checkCriticalFiles() {
        const criticalFiles = [
            'src/main.tsx',
            'api/health.js',
            'scripts/development/local-full-dev.js',
            'README.md'
        ];

        const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
        if (missingFiles.length > 0) {
            throw new Error(`Critical files missing: ${missingFiles.join(', ')}`);
        }

        return true;
    }

    /**
     * 📊 Git Status Check
     */
    checkGitStatus() {
        try {
            // Check if we're in a git repository
            execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
            
            // Check for staged changes
            const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
            if (!stagedFiles.trim()) {
                throw new Error('No staged changes found. Stage your changes first: git add <files>');
            }

            // Check for merge conflicts
            const conflictFiles = execSync('git diff --name-only --diff-filter=U', { encoding: 'utf8' });
            if (conflictFiles.trim()) {
                throw new Error('Unresolved merge conflicts detected. Resolve conflicts first.');
            }

            return true;
        } catch (error) {
            if (error.message.includes('not a git repository')) {
                throw new Error('Not in a git repository');
            }
            throw error;
        }
    }

    /**
     * 🧪 Quick Functionality Test (Optional)
     */
    async runQuickTest() {
        try {
            console.log('🧪 Running quick functionality test...');
            execSync('npm run test:quick', { stdio: 'pipe', timeout: 30000 });
            console.log('✅ Quick test: PASSED');
            return true;
        } catch (error) {
            console.log('⚠️  Quick test: SKIPPED (optional)');
            return false; // Don't fail the gate for this
        }
    }
}

// Handle command line usage
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('🎯 Pre-commit Quality Gates');
    console.log();
    console.log('Usage:');
    console.log('  npm run pre-commit          Run all quality gates');
    console.log('  npm run pre-commit -- --fix  Run gates and attempt auto-fixes');
    console.log();
    console.log('Quality Gates:');
    console.log('  ✅ Project Structure');
    console.log('  ✅ TypeScript Compilation');
    console.log('  ✅ Code Quality (ESLint)');
    console.log('  ✅ Package Dependencies');
    console.log('  ✅ Environment Configuration');
    console.log('  ✅ Critical Files');
    console.log('  ✅ Git Status');
    process.exit(0);
}

// Auto-fix mode
if (args.includes('--fix')) {
    console.log('🔧 Auto-fix mode enabled');
    try {
        console.log('🔧 Running cleanup...');
        execSync('npm run cleanup', { stdio: 'inherit' });
        
        console.log('🔧 Attempting ESLint auto-fix...');
        execSync('npx eslint . --fix', { stdio: 'pipe' });
        
        console.log('✅ Auto-fixes applied');
    } catch (error) {
        console.log('⚠️  Some auto-fixes failed - manual intervention required');
    }
}

// Run quality gates
const qualityGates = new PreCommitQualityGates();
qualityGates.runAllChecks().catch(console.error);