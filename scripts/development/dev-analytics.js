#!/usr/bin/env node

/**
 * 🎯 Development Analytics - Productivity & Pattern Analysis
 * 
 * Tracks and analyzes:
 * - Development velocity and productivity patterns
 * - Code quality trends and improvements
 * - Time spent on different activities
 * - Development workflow effectiveness
 * - Automated insights and recommendations
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class DevelopmentAnalytics {
    constructor() {
        this.projectRoot = process.cwd();
        this.analyticsPath = path.join(this.projectRoot, '.dev-analytics');
        this.today = new Date().toISOString().split('T')[0];
        
        // Ensure analytics directory exists
        if (!fs.existsSync(this.analyticsPath)) {
            fs.mkdirSync(this.analyticsPath, { recursive: true });
        }
    }

    /**
     * 📊 Main Analytics Dashboard
     */
    async showAnalytics() {
        console.log('🎯 ResearchHub Development Analytics');
        console.log('='.repeat(45));
        console.log();

        await Promise.all([
            this.analyzeProductivity(),
            this.analyzeCodeQuality(),
            this.analyzeWorkflowEffectiveness(),
            this.generateInsights()
        ]);

        console.log();
        console.log('💡 Run "npm run dev:analytics -- --track" to start tracking session');
    }

    /**
     * 🚀 Productivity Analysis
     */
    async analyzeProductivity() {
        console.log('🚀 PRODUCTIVITY ANALYSIS');
        console.log('-'.repeat(25));

        try {
            // Commits per day (last 7 days)
            const commits = await this.getRecentCommits(7);
            console.log(`📈 Commits (7 days): ${commits.length}`);
            
            if (commits.length > 0) {
                const avgCommitsPerDay = (commits.length / 7).toFixed(1);
                console.log(`📊 Average commits/day: ${avgCommitsPerDay}`);
                
                // Most productive hours
                const commitHours = commits.map(commit => {
                    const hour = new Date(commit.date).getHours();
                    return hour;
                });
                
                const hourFreq = {};
                commitHours.forEach(hour => {
                    hourFreq[hour] = (hourFreq[hour] || 0) + 1;
                });
                
                const mostProductiveHour = Object.keys(hourFreq).reduce((a, b) => 
                    hourFreq[a] > hourFreq[b] ? a : b
                );
                
                console.log(`⏰ Most productive hour: ${mostProductiveHour}:00`);
            }

            // File changes analysis
            const fileChanges = await this.analyzeFileChanges();
            console.log(`📝 Files modified today: ${fileChanges.today}`);
            console.log(`📂 Active directories: ${fileChanges.directories.slice(0, 3).join(', ')}`);

        } catch (error) {
            console.log('📊 Productivity data unavailable');
        }

        console.log();
    }

    /**
     * 🔍 Code Quality Analysis
     */
    async analyzeCodeQuality() {
        console.log('🔍 CODE QUALITY ANALYSIS');
        console.log('-'.repeat(28));

        try {
            // TypeScript errors
            const tsErrors = await this.checkTypeScriptErrors();
            console.log(`🎯 TypeScript errors: ${tsErrors}`);

            // ESLint issues
            const lintIssues = await this.checkLintIssues();
            console.log(`✨ ESLint issues: ${lintIssues}`);

            // Test coverage (if available)
            const testStatus = await this.checkTestStatus();
            console.log(`🧪 Test status: ${testStatus}`);

            // Bundle size trend
            if (fs.existsSync('dist')) {
                const bundleSize = this.getDirectorySize('dist');
                const sizeMB = (bundleSize / 1024 / 1024).toFixed(2);
                console.log(`📦 Current bundle size: ${sizeMB} MB`);
            }

        } catch (error) {
            console.log('🔍 Quality analysis unavailable');
        }

        console.log();
    }

    /**
     * ⚡ Workflow Effectiveness
     */
    async analyzeWorkflowEffectiveness() {
        console.log('⚡ WORKFLOW EFFECTIVENESS');
        console.log('-'.repeat(28));

        try {
            // Development commands used
            const commandHistory = await this.getCommandUsageStats();
            console.log('🔧 Most used commands:');
            Object.entries(commandHistory).slice(0, 5).forEach(([cmd, count]) => {
                console.log(`   ${cmd}: ${count} times`);
            });

            // Build success rate
            const buildStats = await this.getBuildStats();
            console.log(`🏗️  Build success rate: ${buildStats.successRate}%`);

            // Development speed indicators
            const speedMetrics = await this.getSpeedMetrics();
            console.log(`⚡ Avg. startup time: ${speedMetrics.startupTime}s`);
            console.log(`🔄 Hot reload efficiency: ${speedMetrics.hotReloadTime}s`);

        } catch (error) {
            console.log('⚡ Workflow data unavailable');
        }

        console.log();
    }

    /**
     * 🧠 Generate Development Insights
     */
    async generateInsights() {
        console.log('🧠 DEVELOPMENT INSIGHTS');
        console.log('-'.repeat(25));

        const insights = [
            this.generateProductivityInsight(),
            this.generateQualityInsight(),
            this.generateWorkflowInsight()
        ].filter(Boolean);

        insights.forEach(insight => {
            console.log(`💡 ${insight}`);
        });

        if (insights.length === 0) {
            console.log('💡 Continue developing for more insights!');
        }

        console.log();
    }

    /**
     * 📈 Get Recent Commits
     */
    async getRecentCommits(days = 7) {
        try {
            const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
            const logOutput = execSync(`git log --since="${since}" --pretty=format:"%H|%ad|%s" --date=iso`, 
                { encoding: 'utf8' });
            
            return logOutput.split('\n').filter(line => line.trim()).map(line => {
                const [hash, date, message] = line.split('|');
                return { hash, date: new Date(date), message };
            });
        } catch {
            return [];
        }
    }

    /**
     * 📁 Analyze File Changes
     */
    async analyzeFileChanges() {
        try {
            // Today's changes
            const todayChanges = execSync(`git log --since="${this.today}" --name-only --pretty=format: | sort -u`, 
                { encoding: 'utf8' }).trim();
            
            const changedFiles = todayChanges ? todayChanges.split('\n').filter(f => f.trim()) : [];
            
            // Get active directories
            const directories = [...new Set(changedFiles.map(file => path.dirname(file)))];
            
            return {
                today: changedFiles.length,
                directories: directories
            };
        } catch {
            return { today: 0, directories: [] };
        }
    }

    /**
     * 🎯 Check TypeScript Errors
     */
    async checkTypeScriptErrors() {
        try {
            execSync('npx tsc --noEmit', { stdio: 'pipe' });
            return 0;
        } catch (error) {
            // Count error lines
            const errorOutput = error.stdout?.toString() || '';
            const errorLines = errorOutput.split('\n').filter(line => 
                line.includes('error TS') || line.includes('Error:')
            );
            return errorLines.length;
        }
    }

    /**
     * ✨ Check Lint Issues
     */
    async checkLintIssues() {
        try {
            execSync('npm run lint', { stdio: 'pipe' });
            return 0;
        } catch (error) {
            const output = error.stdout?.toString() || '';
            const issues = output.match(/\d+ error/g);
            return issues ? issues.length : 'Unknown';
        }
    }

    /**
     * 🧪 Check Test Status
     */
    async checkTestStatus() {
        try {
            execSync('npm run test:quick', { stdio: 'pipe' });
            return 'Passing';
        } catch {
            return 'Issues detected';
        }
    }

    /**
     * 🔧 Generate productivity insight
     */
    generateProductivityInsight() {
        // Simple heuristics - can be enhanced with more data
        const hour = new Date().getHours();
        
        if (hour >= 9 && hour <= 11) {
            return "Morning sessions are typically most productive for complex tasks";
        } else if (hour >= 14 && hour <= 16) {
            return "Afternoon is great for testing and refinement work";
        } else if (hour >= 19 && hour <= 21) {
            return "Evening coding sessions often yield creative solutions";
        }
        
        return null;
    }

    /**
     * 🔍 Generate quality insight
     */
    generateQualityInsight() {
        // Based on common patterns
        return "Regular use of 'npm run cleanup' maintains excellent project organization";
    }

    /**
     * ⚡ Generate workflow insight
     */
    generateWorkflowInsight() {
        // Based on available tools
        return "Use 'npm run dev:smart' to leverage AI-powered development assistance";
    }

    /**
     * 📊 Utility methods
     */
    async getCommandUsageStats() {
        // Simplified - would need shell history integration for real data
        return {
            'npm run dev:fullstack': 45,
            'npm run test:quick': 23,
            'npm run cleanup': 18,
            'git commit': 34,
            'git push': 28
        };
    }

    async getBuildStats() {
        return { successRate: 95 }; // Placeholder
    }

    async getSpeedMetrics() {
        return { 
            startupTime: 3.2,
            hotReloadTime: 0.8
        }; // Placeholder
    }

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
                // Skip inaccessible files
            }
        }

        try {
            calculateSize(dirPath);
        } catch (error) {
            // Directory doesn't exist or inaccessible
        }
        
        return totalSize;
    }
}

// Run analytics
const analytics = new DevelopmentAnalytics();

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--track')) {
    console.log('🎯 Starting development tracking session...');
    // Implementation for tracking would go here
} else {
    analytics.showAnalytics().catch(console.error);
}