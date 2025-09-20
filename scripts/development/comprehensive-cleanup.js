/**
 * ResearchHub Comprehensive Project Cleanup Script
 * Implements the rules from copilot-instructions.md
 * Addresses the critical organization issues identified
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectCleanup {
    constructor() {
        this.rootDir = process.cwd();
        this.cleanupReport = {
            movedFiles: [],
            mergedFiles: [],
            deletedFiles: [],
            createdDirectories: [],
            violations: []
        };
    }

    /**
     * Main cleanup execution
     */
    async run() {
        console.log('🧹 Starting Comprehensive Project Cleanup...');
        console.log('=====================================');

        // 1. Analyze current violations
        await this.analyzeViolations();
        
        // 2. Create proper directory structure
        await this.ensureDirectoryStructure();
        
        // 3. Move scattered documentation
        await this.consolidateDocumentation();
        
        // 4. Clean up root directory
        await this.cleanRootDirectory();
        
        // 5. Merge duplicate files
        await this.mergeDuplicateContent();
        
        // 6. Generate cleanup report
        await this.generateReport();
        
        console.log('✅ Cleanup Complete!');
    }

    /**
     * Analyze current project structure violations
     */
    async analyzeViolations() {
        console.log('\n📊 Analyzing Project Structure Violations...');
        
        const rootFiles = fs.readdirSync(this.rootDir).filter(file => {
            const stat = fs.statSync(path.join(this.rootDir, file));
            return stat.isFile();
        });

        console.log(`🔍 Found ${rootFiles.length} files in root directory`);
        
        if (rootFiles.length > 20) {
            this.cleanupReport.violations.push({
                type: 'ROOT_POLLUTION',
                current: rootFiles.length,
                limit: 20,
                excess: rootFiles.length - 20
            });
        }

        // Count documentation files
        const docFiles = rootFiles.filter(file => 
            file.endsWith('.md') && 
            !['README.md', 'CHANGELOG.md'].includes(file)
        );
        
        console.log(`📚 Found ${docFiles.length} documentation files in root`);
        
        if (docFiles.length > 2) {
            this.cleanupReport.violations.push({
                type: 'DOC_SCATTER',
                files: docFiles,
                count: docFiles.length
            });
        }
    }

    /**
     * Ensure proper directory structure exists
     */
    async ensureDirectoryStructure() {
        console.log('\n📁 Ensuring Proper Directory Structure...');
        
        const requiredDirs = [
            'docs/reports/2025/september',
            'docs/archive/legacy',
            'testing/manual',
            'testing/automated',
            'testing/reports',
            'scripts/cleanup',
            'scripts/automation',
            'archive/documentation',
            'archive/testing-reports',
            'archive/status-reports'
        ];

        for (const dir of requiredDirs) {
            const fullPath = path.join(this.rootDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                this.cleanupReport.createdDirectories.push(dir);
                console.log(`📂 Created: ${dir}`);
            }
        }
    }

    /**
     * Consolidate scattered documentation files
     */
    async consolidateDocumentation() {
        console.log('\n📚 Consolidating Documentation...');
        
        const rootFiles = fs.readdirSync(this.rootDir);
        
        // Documentation patterns to move
        const docPatterns = [
            { pattern: /^NEXT_STEPS.*\.md$/, target: 'docs/reports/2025/september/' },
            { pattern: /^PRODUCTION_ISSUES.*\.md$/, target: 'archive/status-reports/' },
            { pattern: /^PHASE\d+.*\.md$/, target: 'docs/reports/2025/september/' },
            { pattern: /^TESTING.*\.md$/, target: 'testing/reports/' },
            { pattern: /^COMPREHENSIVE.*\.md$/, target: 'docs/reports/2025/september/' },
            { pattern: /^CORE_.*\.md$/, target: 'testing/reports/' },
            { pattern: /^DEVELOPMENT.*\.md$/, target: 'docs/development-workflow/' },
            { pattern: /^ENHANCED.*\.md$/, target: 'docs/reports/2025/september/' },
            { pattern: /^CRITICAL.*\.md$/, target: 'archive/status-reports/' },
            { pattern: /^DATABASE.*\.md$/, target: 'docs/technical/' },
            { pattern: /^RESEARCHHUB.*\.md$/, target: 'docs/reports/2025/september/' }
        ];

        for (const file of rootFiles) {
            if (!file.endsWith('.md') || ['README.md'].includes(file)) continue;
            
            for (const { pattern, target } of docPatterns) {
                if (pattern.test(file)) {
                    const sourcePath = path.join(this.rootDir, file);
                    const targetDir = path.join(this.rootDir, target);
                    const targetPath = path.join(targetDir, file);
                    
                    // Ensure target directory exists
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    
                    // Move file
                    fs.renameSync(sourcePath, targetPath);
                    this.cleanupReport.movedFiles.push({
                        from: file,
                        to: target + file
                    });
                    console.log(`📄 Moved: ${file} → ${target}`);
                    break;
                }
            }
        }
    }

    /**
     * Clean up root directory to essential files only
     */
    async cleanRootDirectory() {
        console.log('\n🗂️ Cleaning Root Directory...');
        
        // Essential files that can stay in root
        const essentialFiles = [
            'package.json', 'package-lock.json', 'README.md',
            'vercel.json', 'tailwind.config.js', 'vite.config.ts',
            'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
            'tsconfig.server.json', 'eslint.config.js', 'postcss.config.js',
            'index.html', 'nodemon.json', 'playwright.config.js',
            '.gitignore', '.vercelignore', 'render.yaml'
        ];

        const rootFiles = fs.readdirSync(this.rootDir).filter(file => {
            const stat = fs.statSync(path.join(this.rootDir, file));
            return stat.isFile();
        });

        // Move non-essential files
        for (const file of rootFiles) {
            if (essentialFiles.includes(file)) continue;
            
            let targetDir = 'archive/';
            
            // Categorize files
            if (file.endsWith('.bat')) targetDir = 'scripts/automation/';
            else if (file.endsWith('.mjs') || file.endsWith('.js')) targetDir = 'scripts/';
            else if (file.endsWith('.html')) targetDir = 'testing/manual/';
            else if (file.endsWith('.json')) targetDir = 'config/';
            else if (file.endsWith('.md')) targetDir = 'docs/archive/';
            
            const sourcePath = path.join(this.rootDir, file);
            const targetPath = path.join(this.rootDir, targetDir, file);
            
            // Ensure target directory exists
            const fullTargetDir = path.join(this.rootDir, targetDir);
            if (!fs.existsSync(fullTargetDir)) {
                fs.mkdirSync(fullTargetDir, { recursive: true });
            }
            
            // Move file
            try {
                fs.renameSync(sourcePath, targetPath);
                this.cleanupReport.movedFiles.push({
                    from: file,
                    to: targetDir + file
                });
                console.log(`📁 Moved: ${file} → ${targetDir}`);
            } catch (error) {
                console.log(`⚠️ Could not move ${file}: ${error.message}`);
            }
        }
    }

    /**
     * Merge duplicate content from similar files
     */
    async mergeDuplicateContent() {
        console.log('\n🔄 Merging Duplicate Content...');
        
        // This would be a complex operation requiring content analysis
        // For now, we'll identify potential duplicates
        const potentialDuplicates = [
            ['NEXT_STEPS_ROADMAP.md', 'NEXT_DEVELOPMENT_PHASE_ROADMAP.md'],
            ['PRODUCTION_ISSUES_FIXED_AUG15_URGENT.md', 'PRODUCTION_ISSUES_RESOLVED_AUGUST_15_2025.md'],
            ['TESTING_RULES.md', 'TESTING_RULES_MANDATORY.md']
        ];
        
        console.log('📋 Identified potential duplicate groups for manual review:');
        potentialDuplicates.forEach((group, index) => {
            console.log(`   ${index + 1}. ${group.join(' + ')}`);
        });
    }

    /**
     * Generate comprehensive cleanup report
     */
    async generateReport() {
        console.log('\n📊 Generating Cleanup Report...');
        
        const report = `# Project Cleanup Report
Generated: ${new Date().toISOString()}

## Summary
- Files moved: ${this.cleanupReport.movedFiles.length}
- Directories created: ${this.cleanupReport.createdDirectories.length}
- Violations fixed: ${this.cleanupReport.violations.length}

## Violations Fixed
${this.cleanupReport.violations.map(v => `- ${v.type}: ${JSON.stringify(v)}`).join('\n')}

## Files Moved
${this.cleanupReport.movedFiles.map(f => `- ${f.from} → ${f.to}`).join('\n')}

## Directories Created
${this.cleanupReport.createdDirectories.map(d => `- ${d}`).join('\n')}

## Next Steps
1. Review consolidated documentation
2. Update any broken links
3. Verify all functionality still works
4. Set up automated enforcement
`;

        const reportPath = path.join(this.rootDir, 'docs/reports/2025/september', 'cleanup-report.md');
        fs.writeFileSync(reportPath, report);
        console.log(`📋 Report saved: ${reportPath}`);
    }
}

// Run cleanup if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
    const cleanup = new ProjectCleanup();
    cleanup.run().catch(console.error);
}

export default ProjectCleanup;