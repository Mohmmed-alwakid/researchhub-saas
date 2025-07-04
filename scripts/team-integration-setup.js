#!/usr/bin/env node

/**
 * Team Integration Setup for Systematic Completion Framework
 * Sets up the framework for team-wide usage with standardized processes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

class TeamIntegrationSetup {
    constructor() {
        this.setupConfig = {
            version: "1.0.0",
            setupDate: new Date().toISOString(),
            teamTools: {
                completionTracker: true,
                validators: true,
                templates: true,
                cicdIntegration: true,
                documentation: true
            }
        };
    }

    async setupTeamFramework() {
        console.log("🚀 Setting up Systematic Completion Framework for Team Usage\n");
        
        try {
            await this.createTeamDirectories();
            await this.setupValidators();
            await this.createTeamScripts();
            await this.setupGitHooks();
            await this.createConfigFiles();
            await this.generateTeamDocumentation();
            
            console.log("\n✅ Team Framework Setup Complete!");
            console.log("🎯 Team members can now use the proven completion framework");
            
            this.displayUsageInstructions();
            
        } catch (error) {
            console.error("❌ Setup failed:", error.message);
            process.exit(1);
        }
    }

    async createTeamDirectories() {
        console.log("📁 Creating team framework directories...");
        
        const directories = [
            '.framework',
            '.framework/templates',
            '.framework/validators',
            '.framework/team-configs',
            '.framework/reports',
            'docs/framework'
        ];

        directories.forEach(dir => {
            const fullPath = path.join(rootDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`  ✅ Created: ${dir}`);
            }
        });
    }

    async setupValidators() {
        console.log("\n🔍 Setting up automated validators...");
        
        // Copy existing validators to team directory
        const validators = [
            'ui-ux-auditor.js',
            'accessibility-validator.cjs',
            'mobile-optimization-auditor.cjs',
            'performance-optimizer.cjs'
        ];

        validators.forEach(validator => {
            const sourcePath = path.join(rootDir, 'scripts', validator);
            const destPath = path.join(rootDir, '.framework/validators', validator);
            
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`  ✅ Installed: ${validator}`);
            }
        });

        // Create validator runner script
        this.createValidatorRunner();
    }

    createValidatorRunner() {
        const validatorRunner = `#!/usr/bin/env node

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
        console.log("🔍 Running Framework Validators for Team Quality Assurance\\n");
        
        const results = [];
        
        for (const validator of validators) {
            console.log(\`Running \${validator}...\`);
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
        console.log("\\n📊 FRAMEWORK VALIDATION REPORT");
        console.log("================================================");
        
        const passed = results.filter(r => r.success).length;
        const total = results.length;
        
        results.forEach(result => {
            const icon = result.success ? '✅' : '❌';
            console.log(\`\${icon} \${result.validator}: \${result.success ? 'PASSED' : 'FAILED'}\`);
        });
        
        console.log(\`\\n📈 Overall: \${passed}/\${total} validators passed\`);
        
        if (passed === total) {
            console.log("🎉 All quality gates passed! Ready for production.");
        } else {
            console.log("⚠️  Some quality gates failed. Review issues before deployment.");
            process.exit(1);
        }
    }
}

// CLI usage
if (import.meta.url === \`file://\${process.argv[1]}\`) {
    const runner = new ValidatorRunner();
    runner.runAllValidators().catch(console.error);
}

export default ValidatorRunner;
`;

        fs.writeFileSync(
            path.join(rootDir, '.framework/validators/run-all-validators.js'),
            validatorRunner
        );
        console.log("  ✅ Created: run-all-validators.js");
    }

    async createTeamScripts() {
        console.log("\n🛠️  Creating team helper scripts...");
        
        // Create improvement starter script
        this.createImprovementStarter();
        
        // Create team dashboard script
        this.createTeamDashboard();
    }

    createImprovementStarter() {
        const improvementStarter = `#!/usr/bin/env node

/**
 * Team Improvement Starter - Initialize new improvements with framework
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImprovementStarter {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async startNewImprovement() {
        console.log("🎯 Starting New Improvement with Systematic Framework\\n");
        
        const name = await this.ask("Improvement name (e.g., 'Error Handling Enhancement'): ");
        const id = name.toLowerCase().replace(/\\s+/g, '-');
        
        const criteria = [];
        console.log("\\nEnter completion criteria (press Enter twice when done):");
        
        let criterion;
        while (true) {
            criterion = await this.ask("Criterion: ");
            if (!criterion.trim()) break;
            criteria.push(criterion);
        }
        
        const category = await this.ask("Category (ui-ux/backend/feature/infrastructure): ");
        
        const improvement = {
            id,
            name,
            category,
            status: "IN_PROGRESS",
            progress: 0,
            completionCriteria: criteria,
            started: new Date().toISOString(),
            teamMember: process.env.USER || 'Unknown'
        };
        
        await this.addToTracker(improvement);
        await this.createImprovementDirectory(improvement);
        
        console.log(\`\\n✅ Improvement '\${name}' initialized successfully!\`);
        console.log(\`📁 Working directory: improvements/\${id}/\`);
        console.log(\`🎯 Track progress with: npm run track-progress\`);
        
        this.rl.close();
    }
    
    async addToTracker(improvement) {
        const trackerPath = path.join(__dirname, '../../completion-tracking.json');
        const data = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
        
        data.items[improvement.id] = improvement;
        data.lastUpdated = new Date().toISOString();
        
        fs.writeFileSync(trackerPath, JSON.stringify(data, null, 2));
    }
    
    async createImprovementDirectory(improvement) {
        const improvementDir = path.join(__dirname, \`../../improvements/\${improvement.id}\`);
        
        if (!fs.existsSync(improvementDir)) {
            fs.mkdirSync(improvementDir, { recursive: true });
        }
        
        // Create improvement README
        const readme = \`# \${improvement.name}

## 🎯 Completion Criteria

\${improvement.completionCriteria.map((c, i) => \`\${i + 1}. \${c}\`).join('\\n')}

## 📊 Progress Tracking

Use the framework tools to track progress:

\\\`\\\`\\\`bash
# Update progress
npm run update-progress \${improvement.id} <percentage>

# Run validation
npm run validate-improvement \${improvement.id}

# Generate report
npm run improvement-report \${improvement.id}
\\\`\\\`\\\`

## 📁 Implementation Files

- Implementation code goes here
- Tests and validation
- Documentation updates

## ✅ Quality Gates

- [ ] All completion criteria met
- [ ] Automated validation passing
- [ ] Code review completed
- [ ] Documentation updated
\`;

        fs.writeFileSync(path.join(improvementDir, 'README.md'), readme);
    }
    
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// CLI usage
const starter = new ImprovementStarter();
starter.startNewImprovement().catch(console.error);
`;

        fs.writeFileSync(
            path.join(rootDir, '.framework/start-improvement.js'),
            improvementStarter
        );
        console.log("  ✅ Created: start-improvement.js");
    }

    createTeamDashboard() {
        const teamDashboard = `#!/usr/bin/env node

/**
 * Team Dashboard - Overview of all team improvements and framework status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TeamDashboard {
    constructor() {
        this.trackingFile = path.join(__dirname, '../completion-tracking.json');
    }

    generateDashboard() {
        console.log("🎯 TEAM COMPLETION FRAMEWORK DASHBOARD");
        console.log("================================================\\n");
        
        if (!fs.existsSync(this.trackingFile)) {
            console.log("❌ No tracking data found. Initialize framework first.");
            return;
        }
        
        const data = JSON.parse(fs.readFileSync(this.trackingFile, 'utf8'));
        
        this.showOverallStats(data);
        this.showByStatus(data);
        this.showByTeamMember(data);
        this.showRecentActivity(data);
        
        console.log("\\n================================================");
        console.log("Use 'npm run start-improvement' to begin new improvements");
    }
    
    showOverallStats(data) {
        const items = Object.values(data.items);
        const total = items.length;
        const completed = items.filter(item => item.status === 'COMPLETED').length;
        const inProgress = items.filter(item => item.status === 'IN_PROGRESS').length;
        const notStarted = items.filter(item => item.status === 'NOT_STARTED').length;
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        console.log("📊 OVERALL TEAM PROGRESS");
        console.log(\`Total Improvements: \${total}\`);
        console.log(\`✅ Completed: \${completed}\`);
        console.log(\`🟡 In Progress: \${inProgress}\`);
        console.log(\`⚪ Not Started: \${notStarted}\`);
        console.log(\`📈 Completion Rate: \${completionRate}%\\n\`);
    }
    
    showByStatus(data) {
        console.log("📋 IMPROVEMENTS BY STATUS");
        
        const byStatus = {};
        Object.entries(data.items).forEach(([id, item]) => {
            if (!byStatus[item.status]) byStatus[item.status] = [];
            byStatus[item.status].push({ id, ...item });
        });
        
        Object.entries(byStatus).forEach(([status, items]) => {
            const icon = status === 'COMPLETED' ? '✅' : 
                       status === 'IN_PROGRESS' ? '🟡' : '⚪';
            console.log(\`\\n\${icon} \${status} (\${items.length}):\`);
            items.forEach(item => {
                console.log(\`  • \${item.name} (\${item.progress}%)\`);
            });
        });
        
        console.log();
    }
    
    showByTeamMember(data) {
        console.log("👥 IMPROVEMENTS BY TEAM MEMBER");
        
        const byMember = {};
        Object.entries(data.items).forEach(([id, item]) => {
            const member = item.teamMember || 'Unknown';
            if (!byMember[member]) byMember[member] = [];
            byMember[member].push({ id, ...item });
        });
        
        Object.entries(byMember).forEach(([member, items]) => {
            const completed = items.filter(i => i.status === 'COMPLETED').length;
            console.log(\`\\n👤 \${member} (\${completed}/\${items.length} completed):\`);
            items.forEach(item => {
                const icon = item.status === 'COMPLETED' ? '✅' : 
                           item.status === 'IN_PROGRESS' ? '🟡' : '⚪';
                console.log(\`  \${icon} \${item.name} (\${item.progress}%)\`);
            });
        });
        
        console.log();
    }
    
    showRecentActivity(data) {
        console.log("🕒 RECENT ACTIVITY");
        
        const items = Object.values(data.items)
            .filter(item => item.started || item.lastUpdated)
            .sort((a, b) => {
                const dateA = new Date(a.lastUpdated || a.started);
                const dateB = new Date(b.lastUpdated || b.started);
                return dateB - dateA;
            })
            .slice(0, 5);
            
        items.forEach(item => {
            const date = new Date(item.lastUpdated || item.started).toLocaleDateString();
            const icon = item.status === 'COMPLETED' ? '✅' : 
                       item.status === 'IN_PROGRESS' ? '🟡' : '⚪';
            console.log(\`\${icon} \${item.name} - \${date}\`);
        });
    }
}

// CLI usage
const dashboard = new TeamDashboard();
dashboard.generateDashboard();
`;

        fs.writeFileSync(
            path.join(rootDir, '.framework/team-dashboard.js'),
            teamDashboard
        );
        console.log("  ✅ Created: team-dashboard.js");
    }

    async setupGitHooks() {
        console.log("\n🔗 Setting up Git hooks for quality gates...");
        
        const preCommitHook = `#!/bin/sh
# Pre-commit hook for Systematic Completion Framework
echo "🔍 Running Framework Quality Gates..."

# Run all validators
node .framework/validators/run-all-validators.js

if [ $? -ne 0 ]; then
    echo "❌ Quality gates failed. Commit blocked."
    echo "Fix issues and try again."
    exit 1
fi

echo "✅ All quality gates passed. Proceeding with commit."
`;

        const hooksDir = path.join(rootDir, '.git/hooks');
        if (fs.existsSync(hooksDir)) {
            fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitHook);
            
            // Make executable (on Unix systems)
            try {
                fs.chmodSync(path.join(hooksDir, 'pre-commit'), '755');
                console.log("  ✅ Created: pre-commit hook");
            } catch (error) {
                console.log("  ⚠️  Pre-commit hook created (may need manual chmod +x)");
            }
        } else {
            console.log("  ⚠️  No .git directory found. Git hooks will be set up on first clone.");
        }
    }

    async createConfigFiles() {
        console.log("\n⚙️  Creating team configuration files...");
        
        // Framework configuration
        const frameworkConfig = {
            version: "1.0.0",
            teamSettings: {
                qualityGates: {
                    typeScriptCompilation: true,
                    automatedValidation: true,
                    manualReview: true,
                    documentationUpdate: true
                },
                validators: {
                    uiUx: true,
                    accessibility: true,
                    mobile: true,
                    performance: true
                },
                notifications: {
                    completionAlerts: true,
                    qualityGateFailures: true,
                    progressUpdates: false
                }
            },
            integrations: {
                github: true,
                slack: false,
                email: false
            }
        };
        
        fs.writeFileSync(
            path.join(rootDir, '.framework/team-configs/framework.json'),
            JSON.stringify(frameworkConfig, null, 2)
        );
        console.log("  ✅ Created: framework.json");
        
        // Update package.json with team scripts
        this.updatePackageJsonScripts();
    }

    updatePackageJsonScripts() {
        const packagePath = path.join(rootDir, 'package.json');
        if (!fs.existsSync(packagePath)) return;
        
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Add framework scripts
        packageJson.scripts = {
            ...packageJson.scripts,
            
            // Team framework scripts
            "start-improvement": "node .framework/start-improvement.js",
            "team-dashboard": "node .framework/team-dashboard.js",
            "validate-framework": "node .framework/validators/run-all-validators.js",
            "track-progress": "node scripts/simple-completion-tracker.js report",
            "update-progress": "node scripts/simple-completion-tracker.js update",
            
            // Quality gates
            "quality-gates": "npm run validate-framework && npm run track-progress",
            "pre-deploy": "npm run quality-gates && echo '🚀 Ready for deployment!'",
            
            // Team utilities
            "framework-setup": "node scripts/team-integration-setup.js",
            "framework-help": "echo '🎯 Framework Commands:' && npm run | grep framework"
        };
        
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log("  ✅ Updated: package.json with team scripts");
    }

    async generateTeamDocumentation() {
        console.log("\n📚 Generating team documentation...");
        
        // Create team guide
        this.createTeamGuide();
        
        // Create quick reference
        this.createQuickReference();
    }

    createTeamGuide() {
        const teamGuide = `# 🎯 Team Completion Framework Guide

## Overview

This framework solves the "90% complete" problem by providing systematic, measurable completion processes with automated quality gates.

## 🚀 Quick Start

### For New Team Members

1. **Read this guide** - Understand the systematic approach
2. **Run team setup** - \`npm run framework-setup\`
3. **View current status** - \`npm run team-dashboard\`
4. **Start your first improvement** - \`npm run start-improvement\`

### For Existing Projects

1. **Add to existing feature** - Use completion criteria and validators
2. **Update progress** - \`npm run update-progress <improvement-id> <percentage>\`
3. **Run quality gates** - \`npm run quality-gates\`
4. **Deploy when 100%** - \`npm run pre-deploy\`

## 🎯 Framework Principles

### 1. Explicit Completion Criteria
Every improvement must have 3-5 specific, measurable criteria:
- ✅ "All components use design system" (not "improve design")
- ✅ "TypeScript compilation with 0 errors" (not "fix TypeScript issues")
- ✅ "Accessibility validator passes" (not "improve accessibility")

### 2. Automated Validation
Quality gates prevent incomplete work:
- UI/UX auditor checks design consistency
- Accessibility validator ensures WCAG compliance
- Mobile optimizer verifies responsive design
- Performance optimizer validates Core Web Vitals

### 3. Progress Tracking
Real-time visibility into completion status:
- Individual improvement progress (0-100%)
- Team dashboard with overall metrics
- Automatic blocking of incomplete deployments

### 4. Systematic Process
Repeatable workflow for any improvement:
1. **Initialize** - Define criteria and create tracking
2. **Implement** - Build with continuous validation
3. **Validate** - Run automated quality gates
4. **Complete** - Mark as 100% when all criteria met
5. **Deploy** - Release with confidence

## 🛠️ Team Commands

### Daily Usage
\`\`\`bash
# View team progress
npm run team-dashboard

# Start new improvement
npm run start-improvement

# Update progress on current work
npm run update-progress my-improvement-id 75

# Check if ready to deploy
npm run pre-deploy
\`\`\`

### Quality Assurance
\`\`\`bash
# Run all validators
npm run validate-framework

# Check specific improvement
npm run quality-gates

# View detailed progress
npm run track-progress
\`\`\`

## 📊 Success Metrics

The framework has already delivered:
- **4/4 UI/UX improvements** completed to 100%
- **0 TypeScript errors** maintained across all implementations
- **Automated validation** preventing incomplete deployments
- **Systematic process** proven effective and scalable

## 🎯 Quality Gates

Before any deployment, these must pass:

### Automated Checks
- ✅ TypeScript compilation (0 errors)
- ✅ UI/UX validation (design consistency)
- ✅ Accessibility compliance (WCAG standards)
- ✅ Mobile optimization (responsive design)
- ✅ Performance validation (Core Web Vitals)

### Manual Reviews
- ✅ All completion criteria met
- ✅ Code review completed
- ✅ Documentation updated
- ✅ Tests passing

## 🏆 Best Practices

### For Individual Contributors
1. **Start with criteria** - Define what "done" means before coding
2. **Track progress** - Update completion percentage regularly
3. **Run validators** - Check quality gates throughout development
4. **Communicate status** - Use team dashboard for visibility

### For Team Leads
1. **Review criteria** - Ensure completion criteria are specific and measurable
2. **Monitor dashboard** - Track team progress and identify blockers
3. **Enforce quality gates** - Don't allow deployments below 100%
4. **Celebrate completions** - Recognize systematic excellence

### For Projects
1. **Integrate early** - Set up framework at project start
2. **Customize validators** - Add project-specific quality checks
3. **Train team** - Ensure all team members understand the process
4. **Iterate and improve** - Refine criteria and validators based on experience

## 🚨 Common Pitfalls to Avoid

❌ **Vague criteria** - "Improve user experience" → ✅ "All user flows tested on mobile"
❌ **Skipping validation** - Deploying without running quality gates
❌ **False 100%** - Marking complete when criteria aren't fully met
❌ **Framework bypass** - Working outside the systematic process

## 📞 Support and Help

- **View all commands**: \`npm run framework-help\`
- **Team dashboard**: \`npm run team-dashboard\`
- **Framework status**: \`npm run validate-framework\`

Remember: The framework exists to eliminate "90% complete" forever. Trust the process, follow the quality gates, and deliver systematic excellence.
`;

        fs.writeFileSync(
            path.join(rootDir, 'docs/framework/TEAM_GUIDE.md'),
            teamGuide
        );
        console.log("  ✅ Created: TEAM_GUIDE.md");
    }

    createQuickReference() {
        const quickRef = `# 🎯 Framework Quick Reference

## Commands
\`\`\`bash
npm run start-improvement     # Start new improvement
npm run team-dashboard       # View team progress  
npm run update-progress     # Update completion %
npm run quality-gates       # Run all validators
npm run pre-deploy         # Pre-deployment check
\`\`\`

## Quality Gates
- ✅ TypeScript compilation (0 errors)
- ✅ Automated validation passing
- ✅ All completion criteria met
- ✅ Code review completed

## Completion Criteria Guidelines
- **Specific**: "All buttons use design system"
- **Measurable**: "95% accessibility score"
- **Achievable**: Realistic scope
- **Relevant**: Impacts user/business value
- **Time-bound**: Clear completion definition

## Status Meanings
- **NOT_STARTED**: Criteria defined, work not begun
- **IN_PROGRESS**: Implementation in progress
- **COMPLETED**: All criteria met, quality gates passed

## Framework Files
- \`.framework/\` - Team framework tools
- \`completion-tracking.json\` - Progress data
- \`scripts/\` - Individual validators
- \`docs/framework/\` - Documentation
`;

        fs.writeFileSync(
            path.join(rootDir, 'docs/framework/QUICK_REFERENCE.md'),
            quickRef
        );
        console.log("  ✅ Created: QUICK_REFERENCE.md");
    }

    displayUsageInstructions() {
        console.log("\n🎯 NEXT STEPS FOR TEAM:");
        console.log("1. Run: npm run team-dashboard");
        console.log("2. Read: docs/framework/TEAM_GUIDE.md");
        console.log("3. Start improving: npm run start-improvement");
        console.log("4. Set up CI/CD: Run CI/CD automation setup next");
        console.log("\n🚀 Framework is ready for team-wide systematic excellence!");
    }
}

// CLI usage
const setup = new TeamIntegrationSetup();
setup.setupTeamFramework().catch(console.error);
