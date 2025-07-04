#!/usr/bin/env node

/**
 * Team Validator Runner - Runs all framework validators
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validators = [
    'ui-ux-auditor.js',
    'accessibility-validator.cjs',
    'mobile-optimization-auditor.cjs',
    'performance-optimizer.cjs'
];

class ValidatorRunner {
    async runAllValidators() {
        console.log("🔍 Running Framework Validators for Team Quality Assurance\n");
        
        const results = [];
        
        for (const validator of validators) {
            console.log(`Running ${validator}...`);
            const result = await this.runValidator(validator);
            results.push({ validator, ...result });
        }
        
        this.generateReport(results);
    }
    
    runValidator(validator) {
        return new Promise((resolve) => {
            const validatorPath = path.join(__dirname, validator);
            const process = spawn('node', [validatorPath], { stdio: 'pipe' });
            
            let output = '';
            let errors = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            process.stderr.on('data', (data) => {
                errors += data.toString();
            });
            
            process.on('close', (code) => {
                resolve({
                    success: code === 0,
                    output,
                    errors,
                    exitCode: code
                });
            });
        });
    }
    
    generateReport(results) {
        console.log("\n📊 FRAMEWORK VALIDATION REPORT");
        console.log("================================================");
        
        const passed = results.filter(r => r.success).length;
        const total = results.length;
        
        results.forEach(result => {
            const icon = result.success ? '✅' : '❌';
            console.log(`${icon} ${result.validator}: ${result.success ? 'PASSED' : 'FAILED'}`);
        });
        
        console.log(`\n📈 Overall: ${passed}/${total} validators passed`);
        
        if (passed === total) {
            console.log("🎉 All quality gates passed! Ready for production.");
        } else {
            console.log("⚠️  Some quality gates failed. Review issues before deployment.");
            process.exit(1);
        }
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new ValidatorRunner();
    runner.runAllValidators().catch(console.error);
}

export default ValidatorRunner;
