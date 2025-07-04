#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Ensures all quality gates pass before deployment
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class PreDeploymentValidator {
    constructor() {
        this.validationResults = [];
    }

    async validateDeployment() {
        console.log("🎯 PRE-DEPLOYMENT VALIDATION");
        console.log("================================================\n");
        
        try {
            await this.checkTypeScript();
            await this.runFrameworkValidators();
            await this.checkCompletionStatus();
            await this.verifyBuildSuccess();
            
            const allPassed = this.validationResults.every(result => result.passed);
            
            if (allPassed) {
                console.log("\n🎉 ALL QUALITY GATES PASSED!");
                console.log("✅ Deployment approved by framework");
                console.log("🚀 Ready for production deployment");
                process.exit(0);
            } else {
                console.log("\n❌ QUALITY GATES FAILED!");
                console.log("🚫 Deployment blocked by framework");
                this.showFailures();
                process.exit(1);
            }
            
        } catch (error) {
            console.error("❌ Validation error:", error.message);
            process.exit(1);
        }
    }
    
    async checkTypeScript() {
        console.log("🔍 Checking TypeScript compilation...");
        
        try {
            await this.runCommand('npx', ['tsc', '--noEmit']);
            this.validationResults.push({
                name: 'TypeScript Compilation',
                passed: true,
                message: 'No TypeScript errors found'
            });
            console.log("  ✅ TypeScript compilation successful\n");
        } catch (error) {
            this.validationResults.push({
                name: 'TypeScript Compilation',
                passed: false,
                message: 'TypeScript errors found'
            });
            console.log("  ❌ TypeScript compilation failed\n");
        }
    }
    
    async runFrameworkValidators() {
        console.log("🔍 Running framework validators...");
        
        const validatorPath = '.framework/validators/run-all-validators.js';
        
        if (fs.existsSync(validatorPath)) {
            try {
                await this.runCommand('node', [validatorPath]);
                this.validationResults.push({
                    name: 'Framework Validators',
                    passed: true,
                    message: 'All validators passed'
                });
                console.log("  ✅ Framework validation successful\n");
            } catch (error) {
                this.validationResults.push({
                    name: 'Framework Validators',
                    passed: false,
                    message: 'Validator failures detected'
                });
                console.log("  ❌ Framework validation failed\n");
            }
        } else {
            this.validationResults.push({
                name: 'Framework Validators',
                passed: false,
                message: 'Validators not found'
            });
            console.log("  ❌ Framework validators not found\n");
        }
    }
    
    async checkCompletionStatus() {
        console.log("📊 Checking completion framework status...");
        
        if (fs.existsSync('completion-tracking.json')) {
            const data = JSON.parse(fs.readFileSync('completion-tracking.json', 'utf8'));
            const items = Object.values(data.items);
            const completed = items.filter(item => item.status === 'COMPLETED').length;
            const inProgress = items.filter(item => item.status === 'IN_PROGRESS').length;
            
            this.validationResults.push({
                name: 'Completion Tracking',
                passed: true,
                message: `${completed} completed, ${inProgress} in progress`
            });
            console.log(`  ✅ Completion tracking active: ${completed} completed\n`);
        } else {
            this.validationResults.push({
                name: 'Completion Tracking',
                passed: false,
                message: 'Tracking data not found'
            });
            console.log("  ❌ Completion tracking not found\n");
        }
    }
    
    async verifyBuildSuccess() {
        console.log("🏗️  Verifying build capability...");
        
        try {
            await this.runCommand('npm', ['run', 'build']);
            this.validationResults.push({
                name: 'Build Verification',
                passed: true,
                message: 'Build completed successfully'
            });
            console.log("  ✅ Build verification successful\n");
        } catch (error) {
            this.validationResults.push({
                name: 'Build Verification',
                passed: false,
                message: 'Build failed'
            });
            console.log("  ❌ Build verification failed\n");
        }
    }
    
    runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { stdio: 'pipe' });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with code ${code}`));
                }
            });
            
            process.on('error', reject);
        });
    }
    
    showFailures() {
        const failures = this.validationResults.filter(result => !result.passed);
        
        console.log("\n🚫 FAILED QUALITY GATES:");
        failures.forEach(failure => {
            console.log(`  ❌ ${failure.name}: ${failure.message}`);
        });
        
        console.log("\n💡 Fix these issues before attempting deployment.");
    }
}

// CLI usage
const validator = new PreDeploymentValidator();
validator.validateDeployment().catch(console.error);
