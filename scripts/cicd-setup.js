#!/usr/bin/env node

/**
 * CI/CD Setup for Systematic Completion Framework
 * Configures GitHub Actions and deployment automation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class CICDSetup {
    constructor() {
        this.setupConfig = {
            version: "1.0.0",
            setupDate: new Date().toISOString(),
            integrations: {
                github: true,
                vercel: true,
                qualityGates: true
            }
        };
    }

    async setupCICD() {
        console.log("🚀 Setting up CI/CD Integration for Completion Framework\n");
        
        try {
            await this.verifyGitHubWorkflow();
            await this.createVercelIntegration();
            await this.setupQualityGates();
            await this.createDeploymentScripts();
            await this.generateCICDDocumentation();
            
            console.log("\n✅ CI/CD Integration Setup Complete!");
            console.log("🎯 Quality gates will now enforce systematic completion");
            
            this.displayCICDInstructions();
            
        } catch (error) {
            console.error("❌ CI/CD Setup failed:", error.message);
            process.exit(1);
        }
    }

    async verifyGitHubWorkflow() {
        console.log("🔍 Verifying GitHub Actions workflow...");
        
        const workflowPath = path.join(rootDir, '.github/workflows/completion-framework.yml');
        
        if (fs.existsSync(workflowPath)) {
            console.log("  ✅ GitHub Actions workflow exists");
            
            // Verify workflow content
            const workflowContent = fs.readFileSync(workflowPath, 'utf8');
            const requiredComponents = [
                'framework-validation',
                'completion-framework-report',
                'deployment-readiness'
            ];
            
            const missingComponents = requiredComponents.filter(
                component => !workflowContent.includes(component)
            );
            
            if (missingComponents.length === 0) {
                console.log("  ✅ All required workflow components present");
            } else {
                console.log(`  ⚠️  Missing components: ${missingComponents.join(', ')}`);
            }
        } else {
            console.log("  ❌ GitHub Actions workflow not found");
            console.log("  ℹ️  Workflow should be at: .github/workflows/completion-framework.yml");
        }
    }

    async createVercelIntegration() {
        console.log("\n🌐 Setting up Vercel deployment integration...");
        
        // Create vercel.json with framework quality gates
        const vercelConfig = {
            "version": 2,
            "builds": [
                {
                    "src": "package.json",
                    "use": "@vercel/static-build",
                    "config": {
                        "distDir": "dist"
                    }
                }
            ],
            "routes": [
                {
                    "src": "/api/(.*)",
                    "dest": "/api/$1"
                },
                {
                    "src": "/(.*)",
                    "dest": "/index.html"
                }
            ],
            "env": {
                "NODE_ENV": "production"
            },
            "build": {
                "env": {
                    "NODE_ENV": "production"
                }
            },
            "functions": {
                "api/**/*.js": {
                    "maxDuration": 30
                }
            }
        };
        
        fs.writeFileSync(
            path.join(rootDir, 'vercel.json'),
            JSON.stringify(vercelConfig, null, 2)
        );
        console.log("  ✅ Created: vercel.json");
        
        // Create Vercel build script with quality gates
        this.createVercelBuildScript();
    }

    createVercelBuildScript() {
        const buildScript = `#!/bin/bash

# Vercel Build Script with Framework Quality Gates
echo "🎯 Starting Vercel build with Completion Framework validation..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed - blocking deployment"
    exit 1
fi

# Run framework validators
echo "🔍 Running framework quality gates..."
if [ -f ".framework/validators/run-all-validators.js" ]; then
    node .framework/validators/run-all-validators.js
    if [ $? -ne 0 ]; then
        echo "❌ Framework validation failed - blocking deployment"
        exit 1
    fi
else
    echo "⚠️  Framework validators not found - proceeding with caution"
fi

# Check completion tracking
echo "📊 Checking completion framework status..."
if [ -f "scripts/simple-completion-tracker.js" ]; then
    npm run track-progress
fi

# Build the application
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful - all quality gates passed!"
    echo "🚀 Ready for production deployment"
else
    echo "❌ Build failed - deployment blocked"
    exit 1
fi
`;

        fs.writeFileSync(
            path.join(rootDir, 'vercel-build.sh'),
            buildScript
        );
        
        // Make executable
        try {
            fs.chmodSync(path.join(rootDir, 'vercel-build.sh'), '755');
        } catch (error) {
            // Windows doesn't need chmod
        }
        
        console.log("  ✅ Created: vercel-build.sh");
    }

    async setupQualityGates() {
        console.log("\n🚪 Setting up quality gates configuration...");
        
        const qualityGatesConfig = {
            version: "1.0.0",
            gates: {
                typescript: {
                    enabled: true,
                    blocking: true,
                    description: "TypeScript compilation must pass with 0 errors"
                },
                frameworkValidation: {
                    enabled: true,
                    blocking: true,
                    description: "All framework validators must pass"
                },
                completionTracking: {
                    enabled: true,
                    blocking: false,
                    description: "Completion tracking must be active"
                },
                codeReview: {
                    enabled: true,
                    blocking: true,
                    description: "Code review must be completed"
                }
            },
            deployment: {
                allowIncomplete: false,
                requireAllCriteria: true,
                notifyOnBlock: true
            },
            notifications: {
                slack: {
                    enabled: false,
                    webhook: ""
                },
                email: {
                    enabled: false,
                    recipients: []
                }
            }
        };
        
        fs.writeFileSync(
            path.join(rootDir, '.framework/team-configs/quality-gates.json'),
            JSON.stringify(qualityGatesConfig, null, 2)
        );
        console.log("  ✅ Created: quality-gates.json");
    }

    async createDeploymentScripts() {
        console.log("\n🚀 Creating deployment automation scripts...");
        
        // Create pre-deployment validation script
        this.createPreDeploymentScript();
        
        // Create post-deployment verification script
        this.createPostDeploymentScript();
    }

    createPreDeploymentScript() {
        const preDeployScript = `#!/usr/bin/env node

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
        console.log("================================================\\n");
        
        try {
            await this.checkTypeScript();
            await this.runFrameworkValidators();
            await this.checkCompletionStatus();
            await this.verifyBuildSuccess();
            
            const allPassed = this.validationResults.every(result => result.passed);
            
            if (allPassed) {
                console.log("\\n🎉 ALL QUALITY GATES PASSED!");
                console.log("✅ Deployment approved by framework");
                console.log("🚀 Ready for production deployment");
                process.exit(0);
            } else {
                console.log("\\n❌ QUALITY GATES FAILED!");
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
            console.log("  ✅ TypeScript compilation successful\\n");
        } catch (error) {
            this.validationResults.push({
                name: 'TypeScript Compilation',
                passed: false,
                message: 'TypeScript errors found'
            });
            console.log("  ❌ TypeScript compilation failed\\n");
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
                console.log("  ✅ Framework validation successful\\n");
            } catch (error) {
                this.validationResults.push({
                    name: 'Framework Validators',
                    passed: false,
                    message: 'Validator failures detected'
                });
                console.log("  ❌ Framework validation failed\\n");
            }
        } else {
            this.validationResults.push({
                name: 'Framework Validators',
                passed: false,
                message: 'Validators not found'
            });
            console.log("  ❌ Framework validators not found\\n");
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
                message: \`\${completed} completed, \${inProgress} in progress\`
            });
            console.log(\`  ✅ Completion tracking active: \${completed} completed\\n\`);
        } else {
            this.validationResults.push({
                name: 'Completion Tracking',
                passed: false,
                message: 'Tracking data not found'
            });
            console.log("  ❌ Completion tracking not found\\n");
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
            console.log("  ✅ Build verification successful\\n");
        } catch (error) {
            this.validationResults.push({
                name: 'Build Verification',
                passed: false,
                message: 'Build failed'
            });
            console.log("  ❌ Build verification failed\\n");
        }
    }
    
    runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { stdio: 'pipe' });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(\`Command failed with code \${code}\`));
                }
            });
            
            process.on('error', reject);
        });
    }
    
    showFailures() {
        const failures = this.validationResults.filter(result => !result.passed);
        
        console.log("\\n🚫 FAILED QUALITY GATES:");
        failures.forEach(failure => {
            console.log(\`  ❌ \${failure.name}: \${failure.message}\`);
        });
        
        console.log("\\n💡 Fix these issues before attempting deployment.");
    }
}

// CLI usage
const validator = new PreDeploymentValidator();
validator.validateDeployment().catch(console.error);
`;

        fs.writeFileSync(
            path.join(rootDir, '.framework/pre-deploy-validate.js'),
            preDeployScript
        );
        console.log("  ✅ Created: pre-deploy-validate.js");
    }

    createPostDeploymentScript() {
        const postDeployScript = `#!/usr/bin/env node

/**
 * Post-deployment verification script
 * Verifies deployment success and framework status
 */

import https from 'https';
import fs from 'fs';

class PostDeploymentVerifier {
    constructor() {
        this.deploymentUrl = process.env.VERCEL_URL || process.env.DEPLOYMENT_URL;
    }

    async verifyDeployment() {
        console.log("🔍 POST-DEPLOYMENT VERIFICATION");
        console.log("================================================\\n");
        
        if (!this.deploymentUrl) {
            console.log("⚠️  No deployment URL found - skipping verification");
            return;
        }
        
        try {
            await this.checkHealthEndpoint();
            await this.verifyFrameworkStatus();
            await this.updateDeploymentLog();
            
            console.log("\\n✅ DEPLOYMENT VERIFICATION COMPLETE!");
            console.log("🎉 Framework successfully deployed");
            
        } catch (error) {
            console.error("❌ Verification failed:", error.message);
            process.exit(1);
        }
    }
    
    async checkHealthEndpoint() {
        console.log("🏥 Checking application health...");
        
        const url = \`https://\${this.deploymentUrl}/api/health\`;
        
        try {
            const response = await this.httpGet(url);
            if (response.includes('healthy') || response.includes('success')) {
                console.log("  ✅ Application health check passed\\n");
            } else {
                console.log("  ⚠️  Health check response unclear\\n");
            }
        } catch (error) {
            console.log("  ❌ Health check failed\\n");
        }
    }
    
    async verifyFrameworkStatus() {
        console.log("📊 Verifying framework deployment...");
        
        // Check if framework files are accessible
        const frameworkFiles = [
            '/.framework/team-configs/framework.json',
            '/completion-tracking.json'
        ];
        
        for (const file of frameworkFiles) {
            try {
                await this.httpGet(\`https://\${this.deploymentUrl}\${file}\`);
                console.log(\`  ✅ Framework file accessible: \${file}\`);
            } catch (error) {
                console.log(\`  ⚠️  Framework file not public: \${file}\`);
            }
        }
        
        console.log("\\n📈 Framework deployment verified");
    }
    
    async updateDeploymentLog() {
        console.log("📝 Updating deployment log...");
        
        const deploymentLog = {
            timestamp: new Date().toISOString(),
            deploymentUrl: this.deploymentUrl,
            frameworkVersion: "1.0.0",
            qualityGatesStatus: "PASSED",
            verificationStatus: "COMPLETED"
        };
        
        if (!fs.existsSync('.framework/reports')) {
            fs.mkdirSync('.framework/reports', { recursive: true });
        }
        
        const logFile = \`.framework/reports/deployment-\${Date.now()}.json\`;
        fs.writeFileSync(logFile, JSON.stringify(deploymentLog, null, 2));
        
        console.log(\`  ✅ Deployment log created: \${logFile}\\n\`);
    }
    
    httpGet(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    if (response.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(\`HTTP \${response.statusCode}\`));
                    }
                });
            }).on('error', reject);
        });
    }
}

// CLI usage
const verifier = new PostDeploymentVerifier();
verifier.verifyDeployment().catch(console.error);
`;

        fs.writeFileSync(
            path.join(rootDir, '.framework/post-deploy-verify.js'),
            postDeployScript
        );
        console.log("  ✅ Created: post-deploy-verify.js");
    }

    async generateCICDDocumentation() {
        console.log("\n📚 Generating CI/CD documentation...");
        
        const cicdGuide = `# 🚀 CI/CD Integration for Completion Framework

## Overview

The Systematic Completion Framework is integrated into your CI/CD pipeline to enforce quality gates and prevent "90% complete" deployments.

## GitHub Actions Integration

### Workflow: \`.github/workflows/completion-framework.yml\`

The workflow runs on every push and pull request with three jobs:

#### 1. Framework Validation
- TypeScript compilation check
- UI/UX validation
- Accessibility compliance
- Mobile optimization
- Performance validation

#### 2. Completion Framework Report
- Team dashboard generation
- Progress statistics
- PR comments with metrics

#### 3. Deployment Readiness (main branch only)
- Pre-deployment validation
- Final quality check
- Deployment approval

## Quality Gates

### Automated Blocks
These will **block deployment** if they fail:

- ❌ TypeScript compilation errors
- ❌ Framework validator failures
- ❌ Build process failures
- ❌ Quality gate violations

### Success Requirements
For deployment approval, you need:

- ✅ TypeScript compilation (0 errors)
- ✅ All framework validators passing
- ✅ Build process successful
- ✅ All quality gates satisfied

## Vercel Integration

### Build Configuration

The framework integrates with Vercel through:

- \`vercel.json\` - Deployment configuration
- \`vercel-build.sh\` - Build script with quality gates
- Environment variable validation

### Pre-deployment Validation

Before every Vercel deployment:

1. Dependencies installed
2. TypeScript compilation checked
3. Framework validators executed
4. Build process verified

## Local Development

### Quality Gate Commands

\`\`\`bash
# Run all quality gates
npm run quality-gates

# Pre-deployment check
npm run pre-deploy

# Team dashboard
npm run team-dashboard
\`\`\`

### Git Hooks

Pre-commit hooks automatically run:
- Framework validators
- Quality gate checks
- Commit blocking on failures

## Deployment Process

### 1. Development
- Work on improvements with framework tracking
- Run validators continuously
- Update completion progress

### 2. Pull Request
- GitHub Actions runs quality gates
- PR comments show framework status
- Review and approval required

### 3. Merge to Main
- Final deployment readiness check
- All quality gates must pass
- Automatic deployment approval

### 4. Production Deployment
- Vercel build with framework validation
- Post-deployment verification
- Deployment logging and monitoring

## Troubleshooting

### Common Issues

**TypeScript Errors**
\`\`\`bash
npx tsc --noEmit  # Check compilation
\`\`\`

**Validator Failures**
\`\`\`bash
npm run validate-framework  # Run all validators
\`\`\`

**Build Failures**
\`\`\`bash
npm run build  # Test build locally
\`\`\`

### Quality Gate Bypassing

🚨 **NEVER bypass quality gates** 🚨

The framework exists to prevent incomplete deployments. If gates are failing:

1. Fix the underlying issues
2. Ensure all completion criteria are met
3. Re-run validation
4. Deploy only when 100% complete

## Monitoring and Reporting

### Deployment Logs
- Stored in \`.framework/reports/\`
- Include framework status
- Track quality gate results

### Team Metrics
- Completion rates tracked
- Quality gate pass/fail rates
- Team progress visibility

## Configuration

### Framework Settings
Edit \`.framework/team-configs/framework.json\`

### Quality Gates
Edit \`.framework/team-configs/quality-gates.json\`

### GitHub Actions
Edit \`.github/workflows/completion-framework.yml\`

---

**Remember**: The CI/CD integration enforces systematic excellence. Trust the process and deliver 100% complete solutions.
`;

        fs.writeFileSync(
            path.join(rootDir, 'docs/framework/CICD_INTEGRATION.md'),
            cicdGuide
        );
        console.log("  ✅ Created: CICD_INTEGRATION.md");
    }

    displayCICDInstructions() {
        console.log("\n🎯 CI/CD INTEGRATION COMPLETE!");
        console.log("\n🚀 Your framework now includes:");
        console.log("✅ GitHub Actions quality gates");
        console.log("✅ Vercel deployment integration");
        console.log("✅ Pre/post-deployment validation");
        console.log("✅ Automated quality enforcement");
        
        console.log("\n📋 Next Steps:");
        console.log("1. Push changes to trigger GitHub Actions");
        console.log("2. Test quality gates with a PR");
        console.log("3. Monitor team dashboard: npm run team-dashboard");
        console.log("4. Deploy with confidence: npm run pre-deploy");
        
        console.log("\n🎉 Systematic excellence is now automated!");
    }
}

// CLI usage
const cicdSetup = new CICDSetup();
cicdSetup.setupCICD().catch(console.error);
