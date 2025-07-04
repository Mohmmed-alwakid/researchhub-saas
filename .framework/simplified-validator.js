#!/usr/bin/env node

/**
 * Simplified Framework Validator for Team Usage
 * Tests core quality gates and completion framework status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class SimplifiedValidator {
    constructor() {
        this.results = [];
    }

    async runValidation() {
        console.log("🔍 Running Systematic Completion Framework Validation\n");
        
        try {
            await this.checkTypeScript();
            await this.checkCompletionTracking();
            await this.checkFrameworkFiles();
            await this.checkProjectStructure();
            
            this.generateReport();
            
        } catch (error) {
            console.error("❌ Validation failed:", error.message);
            process.exit(1);
        }
    }

    async checkTypeScript() {
        console.log("🔧 Checking TypeScript compilation...");
        
        try {
            await this.runCommand('npx', ['tsc', '--noEmit'], { cwd: rootDir });
            this.addResult('TypeScript Compilation', true, 'No compilation errors');
        } catch (error) {
            this.addResult('TypeScript Compilation', false, 'Compilation errors found');
        }
    }

    async checkCompletionTracking() {
        console.log("📊 Checking completion tracking system...");
        
        const trackingFile = path.join(rootDir, 'completion-tracking.json');
        
        if (fs.existsSync(trackingFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
                const items = Object.values(data.items);
                const completed = items.filter(item => item.status === 'COMPLETED').length;
                const total = items.length;
                
                this.addResult('Completion Tracking', true, `${completed}/${total} improvements completed`);
            } catch (error) {
                this.addResult('Completion Tracking', false, 'Invalid tracking data');
            }
        } else {
            this.addResult('Completion Tracking', false, 'Tracking file not found');
        }
    }

    async checkFrameworkFiles() {
        console.log("📁 Checking framework infrastructure...");
        
        const requiredFiles = [
            '.framework/team-configs/framework.json',
            '.framework/validators/run-all-validators.js',
            'docs/framework/TEAM_GUIDE.md',
            '.github/workflows/completion-framework.yml'
        ];
        
        let foundFiles = 0;
        
        requiredFiles.forEach(file => {
            const filePath = path.join(rootDir, file);
            if (fs.existsSync(filePath)) {
                foundFiles++;
            }
        });
        
        const allPresent = foundFiles === requiredFiles.length;
        this.addResult('Framework Infrastructure', allPresent, 
            `${foundFiles}/${requiredFiles.length} required files present`);
    }

    async checkProjectStructure() {
        console.log("🏗️  Checking project structure...");
        
        const requiredDirs = [
            'src/client',
            'scripts',
            '.framework',
            'docs/framework'
        ];
        
        let foundDirs = 0;
        
        requiredDirs.forEach(dir => {
            const dirPath = path.join(rootDir, dir);
            if (fs.existsSync(dirPath)) {
                foundDirs++;
            }
        });
        
        const allPresent = foundDirs === requiredDirs.length;
        this.addResult('Project Structure', allPresent, 
            `${foundDirs}/${requiredDirs.length} required directories present`);
    }

    addResult(name, passed, message) {
        this.results.push({ name, passed, message });
        const icon = passed ? '✅' : '❌';
        console.log(`  ${icon} ${name}: ${message}`);
    }

    generateReport() {
        console.log("\n📊 FRAMEWORK VALIDATION REPORT");
        console.log("================================================");
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        this.results.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
        });
        
        console.log(`\n📈 Overall: ${passed}/${total} validations passed`);
        
        if (passed === total) {
            console.log("🎉 All framework validations passed!");
            console.log("✅ Framework is properly configured and active");
            console.log("🚀 Quality gates are enforcing systematic completion");
            process.exit(0);
        } else {
            console.log("⚠️  Some framework validations failed");
            console.log("🔧 Review and fix issues before deployment");
            process.exit(1);
        }
    }

    runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { 
                ...options,
                stdio: 'pipe' 
            });
            
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
}

// CLI usage
const validator = new SimplifiedValidator();
validator.runValidation().catch(console.error);
