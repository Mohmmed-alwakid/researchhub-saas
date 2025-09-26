#!/usr/bin/env node

/**
 * 🎯 Development Productivity Tracker
 * 
 * Advanced productivity tracking system that:
 * - Monitors development sessions and time spent
 * - Tracks feature completion and velocity
 * - Analyzes code quality improvements
 * - Provides actionable productivity insights
 * - Generates weekly/monthly reports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class ProductivityTracker {
    constructor() {
        this.projectRoot = process.cwd();
        this.dataPath = path.join(this.projectRoot, '.productivity-data');
        this.today = new Date().toISOString().split('T')[0];
        
        // Ensure data directory exists
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }
    }

    /**
     * 🚀 Start Productivity Tracking Session
     */
    async startTrackingSession(activity = 'development') {
        const sessionId = `${Date.now()}_${activity}`;
        const session = {
            id: sessionId,
            activity,
            startTime: new Date().toISOString(),
            date: this.today,
            commands: [],
            filesModified: [],
            productivity: {
                commitsCount: 0,
                linesAdded: 0,
                linesRemoved: 0,
                testsRun: 0,
                buildSuccess: false
            }
        };

        // Save session
        this.saveSession(session);
        
        console.log('🎯 Productivity Tracking Started');
        console.log(`📊 Session ID: ${sessionId}`);
        console.log(`🔧 Activity: ${activity}`);
        console.log(`⏰ Start Time: ${new Date().toLocaleTimeString()}`);
        console.log();
        console.log('💡 Run "npm run productivity:stop" to end session');
        
        return sessionId;
    }

    /**
     * 🛑 Stop Tracking Session
     */
    async stopTrackingSession() {
        const activeSessions = this.getActiveSessions();
        
        if (activeSessions.length === 0) {
            console.log('⚠️  No active tracking sessions found');
            return;
        }

        // End the most recent session
        const session = activeSessions[activeSessions.length - 1];
        session.endTime = new Date().toISOString();
        session.duration = new Date(session.endTime) - new Date(session.startTime);
        
        // Gather final productivity metrics
        await this.collectProductivityData(session);
        
        // Save updated session
        this.saveSession(session);
        
        // Generate session summary
        this.generateSessionSummary(session);
    }

    /**
     * 📊 Generate Productivity Report
     */
    async generateReport(period = 'week') {
        console.log('📊 ResearchHub Development Productivity Report');
        console.log('='.repeat(50));
        console.log();

        const sessions = this.getSessionsForPeriod(period);
        
        if (sessions.length === 0) {
            console.log(`📅 No development sessions found for the last ${period}`);
            return;
        }

        // Calculate metrics
        const metrics = this.calculateProductivityMetrics(sessions);
        
        // Display report
        this.displayProductivityReport(metrics, period);
        
        // Save report
        this.saveProductivityReport(metrics, period);
    }

    /**
     * 🔍 Collect Productivity Data
     */
    async collectProductivityData(session) {
        try {
            // Git statistics
            const gitStats = this.getGitStatistics();
            session.productivity.commitsCount = gitStats.commits;
            session.productivity.linesAdded = gitStats.linesAdded;
            session.productivity.linesRemoved = gitStats.linesRemoved;
            
            // Files modified
            session.filesModified = this.getModifiedFiles();
            
            // Build success check
            session.productivity.buildSuccess = await this.checkBuildSuccess();
            
            // Test execution count
            session.productivity.testsRun = this.countTestExecutions();
            
        } catch (error) {
            console.log('📊 Some productivity data unavailable:', error.message);
        }
    }

    /**
     * 📈 Calculate Productivity Metrics
     */
    calculateProductivityMetrics(sessions) {
        const totalSessions = sessions.length;
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgSessionTime = totalTime / totalSessions;
        
        const totalCommits = sessions.reduce((sum, s) => sum + (s.productivity.commitsCount || 0), 0);
        const totalLinesAdded = sessions.reduce((sum, s) => sum + (s.productivity.linesAdded || 0), 0);
        const totalLinesRemoved = sessions.reduce((sum, s) => sum + (s.productivity.linesRemoved || 0), 0);
        
        const successfulBuilds = sessions.filter(s => s.productivity.buildSuccess).length;
        const buildSuccessRate = (successfulBuilds / totalSessions) * 100;
        
        // Productivity score (0-100)
        const productivityScore = this.calculateProductivityScore(sessions);
        
        return {
            sessions: {
                total: totalSessions,
                totalTime: totalTime,
                averageTime: avgSessionTime,
                averagePerDay: totalSessions / 7 // Assuming week
            },
            code: {
                commits: totalCommits,
                linesAdded: totalLinesAdded,
                linesRemoved: totalLinesRemoved,
                netLines: totalLinesAdded - totalLinesRemoved
            },
            quality: {
                buildSuccessRate: buildSuccessRate,
                commitsPerSession: totalCommits / totalSessions
            },
            score: productivityScore
        };
    }

    /**
     * 🎯 Calculate Productivity Score
     */
    calculateProductivityScore(sessions) {
        let score = 0;
        const weights = {
            consistency: 30,    // Regular development sessions
            velocity: 25,       // Lines of code and commits
            quality: 25,        // Build success rate
            efficiency: 20      // Time effectiveness
        };

        // Consistency score (regular sessions)
        const sessionDays = [...new Set(sessions.map(s => s.date))].length;
        const consistencyScore = Math.min((sessionDays / 7) * 100, 100);
        score += (consistencyScore * weights.consistency) / 100;

        // Velocity score (commits and code changes)
        const avgCommitsPerSession = sessions.reduce((sum, s) => sum + (s.productivity.commitsCount || 0), 0) / sessions.length;
        const velocityScore = Math.min(avgCommitsPerSession * 20, 100);
        score += (velocityScore * weights.velocity) / 100;

        // Quality score (build success rate)
        const successfulBuilds = sessions.filter(s => s.productivity.buildSuccess).length;
        const qualityScore = (successfulBuilds / sessions.length) * 100;
        score += (qualityScore * weights.quality) / 100;

        // Efficiency score (reasonable session times)
        const avgSessionTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
        const idealSessionTime = 2 * 60 * 60 * 1000; // 2 hours in ms
        const efficiencyScore = Math.max(100 - Math.abs(avgSessionTime - idealSessionTime) / idealSessionTime * 100, 0);
        score += (efficiencyScore * weights.efficiency) / 100;

        return Math.round(score);
    }

    /**
     * 📊 Display Productivity Report
     */
    displayProductivityReport(metrics, period) {
        console.log(`📈 PRODUCTIVITY METRICS (${period.toUpperCase()})`);
        console.log('-'.repeat(35));
        
        // Sessions
        console.log('📅 Development Sessions:');
        console.log(`   Total Sessions: ${metrics.sessions.total}`);
        console.log(`   Total Time: ${this.formatTime(metrics.sessions.totalTime)}`);
        console.log(`   Average Session: ${this.formatTime(metrics.sessions.averageTime)}`);
        console.log(`   Sessions/Day: ${metrics.sessions.averagePerDay.toFixed(1)}`);
        console.log();

        // Code Activity
        console.log('💻 Code Activity:');
        console.log(`   Commits: ${metrics.code.commits}`);
        console.log(`   Lines Added: ${metrics.code.linesAdded}`);
        console.log(`   Lines Removed: ${metrics.code.linesRemoved}`);
        console.log(`   Net Lines: ${metrics.code.netLines}`);
        console.log();

        // Quality Metrics
        console.log('🎯 Quality Metrics:');
        console.log(`   Build Success Rate: ${metrics.quality.buildSuccessRate.toFixed(1)}%`);
        console.log(`   Commits/Session: ${metrics.quality.commitsPerSession.toFixed(1)}`);
        console.log();

        // Overall Score
        console.log('🏆 PRODUCTIVITY SCORE');
        console.log('-'.repeat(25));
        console.log(`🎯 Score: ${metrics.score}/100`);
        
        if (metrics.score >= 80) {
            console.log('🌟 Excellent productivity! Keep up the great work!');
        } else if (metrics.score >= 60) {
            console.log('👍 Good productivity. Look for optimization opportunities.');
        } else {
            console.log('💪 Room for improvement. Consider workflow optimization.');
        }

        console.log();
    }

    /**
     * 🔧 Utility Methods
     */
    getGitStatistics() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const commits = execSync(`git rev-list --count --since="${today}" HEAD`, { encoding: 'utf8' }).trim();
            
            const diffStats = execSync(`git diff --shortstat --since="${today}"`, { encoding: 'utf8' }).trim();
            const linesMatch = diffStats.match(/(\d+) insertion.*?(\d+) deletion/);
            
            return {
                commits: parseInt(commits) || 0,
                linesAdded: linesMatch ? parseInt(linesMatch[1]) : 0,
                linesRemoved: linesMatch ? parseInt(linesMatch[2]) : 0
            };
        } catch (error) {
            return { commits: 0, linesAdded: 0, linesRemoved: 0 };
        }
    }

    getModifiedFiles() {
        try {
            const files = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
            return files ? files.split('\n') : [];
        } catch {
            return [];
        }
    }

    async checkBuildSuccess() {
        try {
            execSync('npm run build', { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }

    countTestExecutions() {
        // This would need to be enhanced with actual test execution tracking
        return 0;
    }

    getActiveSessions() {
        try {
            const sessionFiles = fs.readdirSync(this.dataPath)
                .filter(f => f.endsWith('.json'))
                .map(f => {
                    const data = JSON.parse(fs.readFileSync(path.join(this.dataPath, f), 'utf8'));
                    return data.sessions ? data.sessions : [data];
                })
                .flat()
                .filter(s => !s.endTime);
                
            return sessionFiles;
        } catch {
            return [];
        }
    }

    getSessionsForPeriod(period) {
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 1;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        try {
            const sessionFiles = fs.readdirSync(this.dataPath)
                .filter(f => f.endsWith('.json'))
                .map(f => {
                    const data = JSON.parse(fs.readFileSync(path.join(this.dataPath, f), 'utf8'));
                    return data.sessions ? data.sessions : [data];
                })
                .flat()
                .filter(s => s.endTime && new Date(s.startTime) > cutoff);
                
            return sessionFiles;
        } catch {
            return [];
        }
    }

    saveSession(session) {
        const filename = `session_${session.date}.json`;
        const filepath = path.join(this.dataPath, filename);
        
        let data = { sessions: [] };
        if (fs.existsSync(filepath)) {
            data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        }
        
        // Update or add session
        const existingIndex = data.sessions.findIndex(s => s.id === session.id);
        if (existingIndex >= 0) {
            data.sessions[existingIndex] = session;
        } else {
            data.sessions.push(session);
        }
        
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    }

    generateSessionSummary(session) {
        console.log('🎯 Session Summary');
        console.log('-'.repeat(20));
        console.log(`⏰ Duration: ${this.formatTime(session.duration)}`);
        console.log(`📝 Commits: ${session.productivity.commitsCount}`);
        console.log(`📄 Files Modified: ${session.filesModified.length}`);
        console.log(`🏗️  Build Success: ${session.productivity.buildSuccess ? '✅' : '❌'}`);
        console.log();
    }

    saveProductivityReport(metrics, period) {
        const reportPath = path.join(this.dataPath, `report_${period}_${this.today}.json`);
        fs.writeFileSync(reportPath, JSON.stringify({
            date: this.today,
            period,
            metrics
        }, null, 2));
        
        console.log(`💾 Report saved: ${reportPath}`);
    }

    formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
}

// Handle command line usage
const args = process.argv.slice(2);
const tracker = new ProductivityTracker();

if (args.includes('start')) {
    const activity = args[args.indexOf('start') + 1] || 'development';
    tracker.startTrackingSession(activity);
} else if (args.includes('stop')) {
    tracker.stopTrackingSession();
} else if (args.includes('report')) {
    const period = args[args.indexOf('report') + 1] || 'week';
    tracker.generateReport(period);
} else {
    console.log('🎯 ResearchHub Productivity Tracker');
    console.log();
    console.log('Usage:');
    console.log('  npm run productivity start [activity]  - Start tracking session');
    console.log('  npm run productivity stop              - Stop current session');
    console.log('  npm run productivity report [period]   - Generate report (week/month)');
    console.log();
    console.log('Examples:');
    console.log('  npm run productivity start "feature development"');
    console.log('  npm run productivity report week');
}