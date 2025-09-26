#!/usr/bin/env node

/**
 * 🎯 Development Dashboard - Comprehensive Development Status
 * 
 * Provides real-time overview of:
 * - Project health and status
 * - Recent development activity  
 * - Quick development actions
 * - Performance metrics
 * - Environment validation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class DevelopmentDashboard {
    constructor() {
        this.projectRoot = process.cwd();
        this.startTime = Date.now();
    }

    /**
     * 📊 Main Dashboard Display
     */
    async showDashboard() {
        console.clear();
        console.log('🚀 ResearchHub Development Dashboard');
        console.log('='.repeat(50));
        console.log();

        await Promise.all([
            this.showProjectHealth(),
            this.showDevelopmentEnvironment(),
            this.showRecentActivity(),
            this.showQuickActions()
        ]);

        console.log();
        console.log('⏱️  Dashboard loaded in', Date.now() - this.startTime, 'ms');
    }

    /**
     * 💚 Project Health Overview
     */
    async showProjectHealth() {
        console.log('💚 PROJECT HEALTH');
        console.log('-'.repeat(20));

        try {
            // Check package.json
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            console.log(`✅ Project: ${packageJson.name} v${packageJson.version}`);

            // Check critical files
            const criticalFiles = [
                'src/main.tsx',
                'api/health.js',
                'scripts/development/local-full-dev.js',
                'testing/comprehensive-testing-strategy/automated-regression-suite.cjs'
            ];

            let healthScore = 0;
            for (const file of criticalFiles) {
                if (fs.existsSync(file)) {
                    healthScore += 25;
                    console.log(`✅ ${file}`);
                } else {
                    console.log(`❌ ${file} - MISSING`);
                }
            }

            console.log(`🎯 Health Score: ${healthScore}%`);

            // Check dependencies
            try {
                execSync('npm ls --depth=0', { stdio: 'pipe' });
                console.log('✅ Dependencies: OK');
            } catch {
                console.log('⚠️  Dependencies: Issues detected');
            }

        } catch (error) {
            console.log('❌ Health Check Failed:', error.message);
        }

        console.log();
    }

    /**
     * 🌍 Development Environment Status
     */
    async showDevelopmentEnvironment() {
        console.log('🌍 DEVELOPMENT ENVIRONMENT');
        console.log('-'.repeat(30));

        try {
            // Node version
            const nodeVersion = process.version;
            console.log(`✅ Node.js: ${nodeVersion}`);

            // NPM version
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            console.log(`✅ NPM: v${npmVersion}`);

            // Git status
            try {
                const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
                const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
                
                console.log(`✅ Git Branch: ${gitBranch}`);
                console.log(`📝 Changes: ${gitStatus ? gitStatus.split('\n').length : 0} files`);
            } catch {
                console.log('⚠️  Git: Not a git repository');
            }

            // Environment files
            const envFiles = ['.env', '.env.local', '.env.production.local'];
            envFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    console.log(`✅ ${file}`);
                } else {
                    console.log(`⚠️  ${file} - Not found`);
                }
            });

        } catch (error) {
            console.log('❌ Environment Check Failed:', error.message);
        }

        console.log();
    }

    /**
     * 📈 Recent Development Activity
     */
    async showRecentActivity() {
        console.log('📈 RECENT ACTIVITY');
        console.log('-'.repeat(20));

        try {
            // Recent commits
            const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' }).trim();
            if (recentCommits) {
                console.log('📝 Recent Commits:');
                recentCommits.split('\n').slice(0, 3).forEach(commit => {
                    console.log(`   ${commit}`);
                });
            }

            // Modified files today
            const today = new Date().toISOString().split('T')[0];
            try {
                const todayChanges = execSync(`git log --since="${today}" --name-only --pretty=format: | sort -u`, 
                    { encoding: 'utf8' }).trim();
                if (todayChanges) {
                    const changedFiles = todayChanges.split('\n').filter(f => f.trim()).slice(0, 5);
                    console.log('🔧 Today\'s Changes:');
                    changedFiles.forEach(file => {
                        console.log(`   ${file}`);
                    });
                }
            } catch {
                console.log('📅 No changes today');
            }

        } catch (error) {
            console.log('📊 Activity tracking unavailable');
        }

        console.log();
    }

    /**
     * ⚡ Quick Development Actions
     */
    async showQuickActions() {
        console.log('⚡ QUICK ACTIONS');
        console.log('-'.repeat(20));

        const actions = [
            { key: '1', command: 'npm run dev:fullstack', desc: 'Start full development environment' },
            { key: '2', command: 'npm run test:quick', desc: 'Run quick tests (2min)' },
            { key: '3', command: 'npm run cleanup', desc: 'Organize project structure' },
            { key: '4', command: 'npm run dev:smart', desc: 'Smart development startup' },
            { key: '5', command: 'npm run dev:health', desc: 'Full health check' },
            { key: '6', command: 'git status', desc: 'Check git status' }
        ];

        actions.forEach(action => {
            console.log(`${action.key}. ${action.desc}`);
            console.log(`   → ${action.command}`);
        });

        console.log();
        console.log('💡 Usage: npm run dev:dashboard');
        console.log('💡 For interactive mode: npm run dev:dashboard -- --interactive');
    }

    /**
     * 🔍 Performance Metrics
     */
    async showPerformanceMetrics() {
        console.log('🔍 PERFORMANCE METRICS');
        console.log('-'.repeat(25));

        try {
            // Bundle size (if dist exists)
            if (fs.existsSync('dist')) {
                const distStats = this.getDirectorySize('dist');
                console.log(`📦 Bundle Size: ${(distStats / 1024 / 1024).toFixed(2)} MB`);
            }

            // Node modules size
            if (fs.existsSync('node_modules')) {
                const nodeModulesStats = this.getDirectorySize('node_modules');
                console.log(`📚 Dependencies: ${(nodeModulesStats / 1024 / 1024).toFixed(0)} MB`);
            }

            // Project file count
            const fileCount = this.countFiles('src');
            console.log(`📄 Source Files: ${fileCount}`);

        } catch (error) {
            console.log('📊 Performance metrics unavailable');
        }

        console.log();
    }

    /**
     * 📁 Utility: Get directory size
     */
    getDirectorySize(dirPath) {
        let totalSize = 0;
        
        function calculateSize(currentPath) {
            try {
                const stats = fs.statSync(currentPath);
                if (stats.isFile()) {
                    totalSize += stats.size;
                } else if (stats.isDirectory()) {
                    const files = fs.readdirSync(currentPath);
                    files.forEach(file => {
                        calculateSize(path.join(currentPath, file));
                    });
                }
            } catch (error) {
                // Skip inaccessible files/directories
            }
        }

        calculateSize(dirPath);
        return totalSize;
    }

    /**
     * 📊 Utility: Count files in directory
     */
    countFiles(dirPath) {
        let fileCount = 0;
        
        function countInDirectory(currentPath) {
            try {
                const items = fs.readdirSync(currentPath);
                items.forEach(item => {
                    const itemPath = path.join(currentPath, item);
                    const stats = fs.statSync(itemPath);
                    if (stats.isFile()) {
                        fileCount++;
                    } else if (stats.isDirectory()) {
                        countInDirectory(itemPath);
                    }
                });
            } catch (error) {
                // Skip inaccessible directories
            }
        }

        if (fs.existsSync(dirPath)) {
            countInDirectory(dirPath);
        }
        return fileCount;
    }
}

// Run dashboard
const dashboard = new DevelopmentDashboard();
dashboard.showDashboard().catch(console.error);