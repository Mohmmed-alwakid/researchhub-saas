import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class OptimizationValidator {
    constructor() {
        this.projectRoot = process.cwd();
        this.testResults = {
            build: false,
            health: false,
            dependencies: false,
            navigation: false
        };
    }

    async validateOptimizations() {
        console.log('🧪 Validating Application Optimizations');
        console.log('=======================================\n');

        await this.testBuild();
        await this.testHealthScan();
        await this.validateDependencies();
        await this.testNavigation();
        
        this.generateValidationReport();
    }

    async testBuild() {
        console.log('🏗️ Testing application build...');
        
        try {
            await this.runCommand('npm', ['run', 'build']);
            this.testResults.build = true;
            console.log('   ✅ Build successful');
        } catch (error) {
            console.log('   ❌ Build failed:', error.message);
            this.testResults.build = false;
        }
    }

    async testHealthScan() {
        console.log('🔍 Running health scan...');
        
        try {
            await this.runCommand('node', ['scripts/development/quick-health-scanner.js']);
            this.testResults.health = true;
            console.log('   ✅ Health scan completed');
        } catch (error) {
            console.log('   ❌ Health scan failed:', error.message);
            this.testResults.health = false;
        }
    }

    async validateDependencies() {
        console.log('📦 Validating dependencies...');
        
        try {
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
            );
            
            const depCount = Object.keys(packageJson.dependencies || {}).length;
            const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
            
            console.log(`   📊 Dependencies: ${depCount}, DevDependencies: ${devDepCount}`);
            
            // Check if our new scripts are added
            const hasHealthScan = packageJson.scripts?.['health:scan'];
            const hasHealthFix = packageJson.scripts?.['health:fix'];
            const hasAnalyze = packageJson.scripts?.['analyze'];
            
            if (hasHealthScan && hasHealthFix && hasAnalyze) {
                this.testResults.dependencies = true;
                console.log('   ✅ Optimization scripts added successfully');
            } else {
                console.log('   ⚠️ Some optimization scripts missing');
                this.testResults.dependencies = false;
            }
        } catch (error) {
            console.log('   ❌ Dependency validation failed:', error.message);
            this.testResults.dependencies = false;
        }
    }

    async testNavigation() {
        console.log('🔗 Testing navigation fixes...');
        
        try {
            // Check if App.tsx has the admin route we added
            const appPath = path.join(this.projectRoot, 'src', 'App.tsx');
            if (fs.existsSync(appPath)) {
                const appContent = fs.readFileSync(appPath, 'utf8');
                const hasAdminRoute = appContent.includes('/app/admin');
                
                if (hasAdminRoute) {
                    this.testResults.navigation = true;
                    console.log('   ✅ Admin route found in App.tsx');
                } else {
                    console.log('   ⚠️ Admin route not found in App.tsx');
                    this.testResults.navigation = false;
                }
            } else {
                console.log('   ❌ App.tsx not found');
                this.testResults.navigation = false;
            }
        } catch (error) {
            console.log('   ❌ Navigation test failed:', error.message);
            this.testResults.navigation = false;
        }
    }

    runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd: this.projectRoot,
                stdio: 'pipe'
            });

            let output = '';
            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                output += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Command failed with code ${code}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    generateValidationReport() {
        console.log('\n📊 OPTIMIZATION VALIDATION RESULTS');
        console.log('===================================');

        const totalTests = Object.keys(this.testResults).length;
        const passedTests = Object.values(this.testResults).filter(Boolean).length;
        const successRate = Math.round((passedTests / totalTests) * 100);

        console.log(`\n🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
        
        console.log('\n📋 Test Results:');
        console.log(`   🏗️ Build Test: ${this.testResults.build ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   🔍 Health Scan: ${this.testResults.health ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   📦 Dependencies: ${this.testResults.dependencies ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   🔗 Navigation: ${this.testResults.navigation ? '✅ PASS' : '❌ FAIL'}`);

        if (successRate >= 75) {
            console.log('\n🎉 VALIDATION SUCCESSFUL!');
            console.log('Your optimizations are working correctly.');
        } else {
            console.log('\n⚠️ VALIDATION ISSUES DETECTED');
            console.log('Some optimizations may need review.');
        }

        console.log('\n📋 Available Commands:');
        console.log('   🔍 npm run health:scan - Run health analysis');
        console.log('   🔧 npm run health:fix - Apply automated fixes');
        console.log('   📊 npm run analyze - Analyze bundle (if dependencies installed)');
        console.log('   🚀 npm run dev:fullstack - Start development server');
        
        console.log('\n✨ Optimization validation complete!');
    }
}

// Run validation
const validator = new OptimizationValidator();
validator.validateOptimizations().catch(console.error);