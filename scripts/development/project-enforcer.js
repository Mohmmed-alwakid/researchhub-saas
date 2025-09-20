/**
 * Project Structure Enforcement System
 * Prevents violations of our development rules
 * Automatically organizes files and enforces standards
 */

import fs from 'fs';
import path from 'path';

class ProjectEnforcer {
    constructor() {
        this.rootDir = process.cwd();
        this.rules = {
            maxRootFiles: 20,
            allowedRootFiles: [
                'package.json', 'package-lock.json', 'README.md',
                'vercel.json', 'tailwind.config.js', 'vite.config.ts',
                'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
                'tsconfig.server.json', 'eslint.config.js', 'postcss.config.js',
                'index.html', 'nodemon.json', 'playwright.config.js',
                '.gitignore', '.vercelignore', 'render.yaml'
            ],
            forbiddenRootPatterns: [
                /^test-.*\.html$/,
                /^.*\.mjs$/,
                /^.*\.bat$/,
                /.*monitor.*\.json$/,
                /^PRODUCTION_ISSUES_.*\.md$/,
                /^NEXT_STEPS_.*\.md$/,
                /^PHASE\d+_.*\.md$/,
                /^TESTING_.*\.md$/,
                /^COMPREHENSIVE_.*\.md$/,
                /^CORE_.*\.md$/,
                /^DEVELOPMENT_.*\.md$/,
                /^ENHANCED_.*\.md$/,
                /^CRITICAL_.*\.md$/,
                /^DATABASE_.*\.md$/,
                /^RESEARCHHUB_.*\.md$/
            ],
            autoMoveRules: [
                { pattern: /^test-.*\.html$/, target: 'testing/manual/' },
                { pattern: /.*\.bat$/, target: 'scripts/automation/' },
                { pattern: /.*\.mjs$/, target: 'scripts/' },
                { pattern: /.*monitor.*\.json$/, target: 'testing/data/' },
                { pattern: /^PRODUCTION_ISSUES_.*\.md$/, target: 'archive/status-reports/' },
                { pattern: /^NEXT_STEPS_.*\.md$/, target: 'docs/reports/2025/september/' },
                { pattern: /^PHASE\d+_.*\.md$/, target: 'docs/reports/2025/september/' },
                { pattern: /^TESTING_.*\.md$/, target: 'testing/reports/' },
                { pattern: /^COMPREHENSIVE_.*\.md$/, target: 'docs/reports/2025/september/' },
                { pattern: /^CORE_.*\.md$/, target: 'testing/reports/' },
                { pattern: /^DEVELOPMENT_.*\.md$/, target: 'docs/development-workflow/' },
                { pattern: /^ENHANCED_.*\.md$/, target: 'docs/reports/2025/september/' },
                { pattern: /^CRITICAL_.*\.md$/, target: 'archive/status-reports/' },
                { pattern: /^DATABASE_.*\.md$/, target: 'docs/technical/' },
                { pattern: /^RESEARCHHUB_.*\.md$/, target: 'docs/reports/2025/september/' }
            ]
        };
    }

    /**
     * Check for rule violations and auto-fix them
     */
    enforceRules() {
        console.log('🛡️ Enforcing Project Structure Rules...');
        
        const violations = this.detectViolations();
        
        if (violations.length === 0) {
            console.log('✅ No violations detected!');
            return;
        }

        console.log(`⚠️ Found ${violations.length} violations:`);
        violations.forEach(v => console.log(`   - ${v.type}: ${v.description}`));
        
        this.autoFixViolations(violations);
    }

    /**
     * Detect current rule violations
     */
    detectViolations() {
        const violations = [];
        const rootFiles = fs.readdirSync(this.rootDir).filter(file => {
            const stat = fs.statSync(path.join(this.rootDir, file));
            return stat.isFile();
        });

        // Check root file count
        if (rootFiles.length > this.rules.maxRootFiles) {
            violations.push({
                type: 'ROOT_FILE_LIMIT',
                description: `${rootFiles.length} files in root (limit: ${this.rules.maxRootFiles})`,
                files: rootFiles.filter(f => !this.rules.allowedRootFiles.includes(f))
            });
        }

        // Check forbidden patterns
        for (const file of rootFiles) {
            for (const pattern of this.rules.forbiddenRootPatterns) {
                if (pattern.test(file)) {
                    violations.push({
                        type: 'FORBIDDEN_ROOT_FILE',
                        description: `File "${file}" matches forbidden pattern`,
                        file: file,
                        pattern: pattern
                    });
                    break;
                }
            }
        }

        return violations;
    }

    /**
     * Automatically fix detected violations
     */
    autoFixViolations(violations) {
        console.log('🔧 Auto-fixing violations...');
        
        for (const violation of violations) {
            if (violation.type === 'FORBIDDEN_ROOT_FILE') {
                this.moveFileToCorrectLocation(violation.file);
            }
            
            if (violation.type === 'ROOT_FILE_LIMIT' && violation.files) {
                for (const file of violation.files) {
                    this.moveFileToCorrectLocation(file);
                }
            }
        }
    }

    /**
     * Move file to correct location based on rules
     */
    moveFileToCorrectLocation(filename) {
        for (const rule of this.rules.autoMoveRules) {
            if (rule.pattern.test(filename)) {
                const sourcePath = path.join(this.rootDir, filename);
                const targetDir = path.join(this.rootDir, rule.target);
                const targetPath = path.join(targetDir, filename);
                
                // Ensure target directory exists
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                
                // Move file
                try {
                    fs.renameSync(sourcePath, targetPath);
                    console.log(`📁 Moved: ${filename} → ${rule.target}`);
                    return true;
                } catch (error) {
                    console.log(`❌ Failed to move ${filename}: ${error.message}`);
                    return false;
                }
            }
        }
        
        // Default fallback: move to archive
        const sourcePath = path.join(this.rootDir, filename);
        const targetDir = path.join(this.rootDir, 'archive/misc/');
        const targetPath = path.join(targetDir, filename);
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        try {
            fs.renameSync(sourcePath, targetPath);
            console.log(`📁 Moved: ${filename} → archive/misc/`);
            return true;
        } catch (error) {
            console.log(`❌ Failed to move ${filename}: ${error.message}`);
            return false;
        }
    }

    /**
     * Generate project structure report
     */
    generateReport() {
        const rootFiles = fs.readdirSync(this.rootDir).filter(file => {
            const stat = fs.statSync(path.join(this.rootDir, file));
            return stat.isFile();
        });

        const report = {
            timestamp: new Date().toISOString(),
            rootFileCount: rootFiles.length,
            limit: this.rules.maxRootFiles,
            compliance: rootFiles.length <= this.rules.maxRootFiles,
            violations: this.detectViolations(),
            rootFiles: rootFiles
        };

        console.log('\n📊 Project Structure Report:');
        console.log(`   Files in root: ${report.rootFileCount}/${report.limit}`);
        console.log(`   Compliance: ${report.compliance ? '✅' : '❌'}`);
        console.log(`   Violations: ${report.violations.length}`);

        return report;
    }

    /**
     * Watch for file system changes and auto-enforce rules
     */
    startWatching() {
        console.log('👁️ Starting file system watch...');
        
        const watcher = fs.watch(this.rootDir, { recursive: false }, (eventType, filename) => {
            if (filename && eventType === 'rename') {
                // Check if a new file was added
                const filePath = path.join(this.rootDir, filename);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    console.log(`🔍 New file detected: ${filename}`);
                    
                    // Check if it violates rules
                    const violations = this.detectViolations();
                    if (violations.some(v => v.file === filename || (v.files && v.files.includes(filename)))) {
                        console.log(`⚠️ Rule violation detected for: ${filename}`);
                        setTimeout(() => this.moveFileToCorrectLocation(filename), 1000);
                    }
                }
            }
        });

        return watcher;
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const enforcer = new ProjectEnforcer();
    
    const command = process.argv[2] || 'enforce';
    
    switch (command) {
        case 'enforce':
            enforcer.enforceRules();
            break;
        case 'report':
            enforcer.generateReport();
            break;
        case 'watch':
            enforcer.startWatching();
            console.log('Press Ctrl+C to stop watching...');
            break;
        default:
            console.log('Usage: node project-enforcer.js [enforce|report|watch]');
    }
}

export default ProjectEnforcer;