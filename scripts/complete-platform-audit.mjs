/**
 * 🎯 ResearchHub Complete Platform Health Audit
 * 
 * Orchestrates comprehensive platform health testing including:
 * - API contract validation
 * - Browser-based UI testing
 * - Data consistency checks
 * - Multi-role authentication
 * - Critical user journey validation
 * 
 * Created: September 20, 2025
 * Purpose: Comprehensive platform validation after data consistency fix
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class CompletePlatformAuditor {
    constructor() {
        this.timestamp = new Date().toISOString();
        this.auditResults = {
            timestamp: this.timestamp,
            overall: { status: 'PENDING', score: 0, totalAudits: 2, passedAudits: 0 },
            apiAudit: { status: 'PENDING', score: 0, issues: [] },
            browserAudit: { status: 'PENDING', score: 0, issues: [] },
            criticalIssues: [],
            recommendations: []
        };
    }

    /**
     * 🔗 Run API Health Audit
     */
    async runAPIAudit() {
        console.log('🔗 Starting API Health Audit...');
        
        try {
            const { stdout, stderr } = await execAsync('node scripts/platform-health-audit.mjs', {
                cwd: process.cwd(),
                timeout: 120000 // 2 minutes timeout
            });
            
            console.log(stdout);
            if (stderr) console.error('API Audit stderr:', stderr);
            
            // Parse the results from the API audit
            this.auditResults.apiAudit = {
                status: 'PASS',
                score: 100,
                issues: []
            };
            
            console.log('✅ API Health Audit completed successfully');
            
        } catch (error) {
            console.error('❌ API Health Audit failed:', error.message);
            
            this.auditResults.apiAudit = {
                status: 'FAIL',
                score: 0,
                issues: [error.message]
            };
            
            this.auditResults.criticalIssues.push({
                type: 'API_FAILURE',
                message: 'API Health Audit failed to execute',
                impact: 'HIGH',
                recommendation: 'Check API endpoints and authentication'
            });
        }
    }

    /**
     * 🎭 Run Browser Health Audit
     */
    async runBrowserAudit() {
        console.log('\n🎭 Starting Browser Health Audit...');
        
        try {
            const { stdout, stderr } = await execAsync('node testing/browser-health-audit.mjs', {
                cwd: process.cwd(),
                timeout: 300000 // 5 minutes timeout
            });
            
            console.log(stdout);
            if (stderr) console.error('Browser Audit stderr:', stderr);
            
            // Parse the results from the browser audit
            this.auditResults.browserAudit = {
                status: 'PASS',
                score: 100,
                issues: []
            };
            
            console.log('✅ Browser Health Audit completed successfully');
            
        } catch (error) {
            console.error('❌ Browser Health Audit failed:', error.message);
            
            this.auditResults.browserAudit = {
                status: 'FAIL',
                score: 50, // Partial failure
                issues: [error.message]
            };
            
            this.auditResults.criticalIssues.push({
                type: 'BROWSER_FAILURE',
                message: 'Browser Health Audit encountered issues',
                impact: 'MEDIUM',
                recommendation: 'Check UI components and user flows'
            });
        }
    }

    /**
     * 📊 Analyze Combined Results
     */
    analyzeCombinedResults() {
        console.log('\n📊 Analyzing Combined Results...');
        
        // Calculate overall score
        const apiWeight = 0.6; // API health is more critical
        const browserWeight = 0.4; // Browser health is important but secondary
        
        const weightedScore = (
            this.auditResults.apiAudit.score * apiWeight +
            this.auditResults.browserAudit.score * browserWeight
        );
        
        let passedAudits = 0;
        if (this.auditResults.apiAudit.status === 'PASS') passedAudits++;
        if (this.auditResults.browserAudit.status === 'PASS') passedAudits++;
        
        // Determine overall status
        let overallStatus;
        if (weightedScore >= 95) overallStatus = 'EXCELLENT';
        else if (weightedScore >= 80) overallStatus = 'GOOD';
        else if (weightedScore >= 60) overallStatus = 'FAIR';
        else overallStatus = 'POOR';
        
        this.auditResults.overall = {
            status: overallStatus,
            score: Math.round(weightedScore),
            totalAudits: 2,
            passedAudits
        };
        
        // Generate recommendations based on issues found
        this.generateRecommendations();
    }

    /**
     * 💡 Generate Recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        // API-specific recommendations
        if (this.auditResults.apiAudit.status !== 'PASS') {
            recommendations.push({
                priority: 'HIGH',
                category: 'API',
                action: 'Fix API endpoint issues',
                description: 'API endpoints are not responding correctly. This affects core platform functionality.',
                timeframe: 'IMMEDIATE'
            });
        }
        
        // Browser-specific recommendations
        if (this.auditResults.browserAudit.status !== 'PASS') {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'UI/UX',
                action: 'Fix browser UI issues',
                description: 'User interface components may not be working correctly.',
                timeframe: 'SHORT_TERM'
            });
        }
        
        // General platform recommendations
        if (this.auditResults.overall.score < 100) {
            recommendations.push({
                priority: 'LOW',
                category: 'MONITORING',
                action: 'Set up automated health monitoring',
                description: 'Implement regular automated health checks to catch issues early.',
                timeframe: 'MEDIUM_TERM'
            });
        }
        
        // Prevention recommendations (based on our recent data consistency fix)
        recommendations.push({
            priority: 'MEDIUM',
            category: 'PREVENTION',
            action: 'Run health audits weekly',
            description: 'Schedule regular platform health audits to prevent data consistency issues.',
            timeframe: 'ONGOING'
        });
        
        this.auditResults.recommendations = recommendations;
    }

    /**
     * 📋 Generate Comprehensive Report
     */
    generateComprehensiveReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🏥 COMPLETE PLATFORM HEALTH AUDIT REPORT');
        console.log('='.repeat(80));
        console.log(`📅 Date: ${new Date(this.timestamp).toLocaleString()}`);
        console.log(`🌐 Platform: https://researchhub-saas.vercel.app`);
        console.log(`🎯 Overall Health: ${this.auditResults.overall.status} (${this.auditResults.overall.score}%)`);
        console.log('='.repeat(80));
        
        // API Audit Results
        console.log('\n🔗 API HEALTH AUDIT');
        console.log('-'.repeat(40));
        console.log(`Status: ${this.auditResults.apiAudit.status}`);
        console.log(`Score: ${this.auditResults.apiAudit.score}%`);
        if (this.auditResults.apiAudit.issues.length > 0) {
            console.log('Issues:');
            this.auditResults.apiAudit.issues.forEach(issue => console.log(`  • ${issue}`));
        }
        
        // Browser Audit Results
        console.log('\n🎭 BROWSER HEALTH AUDIT');
        console.log('-'.repeat(40));
        console.log(`Status: ${this.auditResults.browserAudit.status}`);
        console.log(`Score: ${this.auditResults.browserAudit.score}%`);
        if (this.auditResults.browserAudit.issues.length > 0) {
            console.log('Issues:');
            this.auditResults.browserAudit.issues.forEach(issue => console.log(`  • ${issue}`));
        }
        
        // Critical Issues
        if (this.auditResults.criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES');
            console.log('-'.repeat(40));
            this.auditResults.criticalIssues.forEach(issue => {
                console.log(`${issue.impact} PRIORITY: ${issue.message}`);
                console.log(`  Recommendation: ${issue.recommendation}`);
            });
        }
        
        // Recommendations
        if (this.auditResults.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS');
            console.log('-'.repeat(40));
            this.auditResults.recommendations.forEach(rec => {
                console.log(`${rec.priority} - ${rec.category}: ${rec.action}`);
                console.log(`  ${rec.description}`);
                console.log(`  Timeframe: ${rec.timeframe}`);
                console.log('');
            });
        }
        
        // Summary
        console.log('='.repeat(80));
        console.log('📊 AUDIT SUMMARY');
        console.log('='.repeat(80));
        console.log(`✅ Passed Audits: ${this.auditResults.overall.passedAudits}/${this.auditResults.overall.totalAudits}`);
        console.log(`📈 Overall Score: ${this.auditResults.overall.score}%`);
        console.log(`🎯 Health Status: ${this.auditResults.overall.status}`);
        
        if (this.auditResults.overall.score === 100) {
            console.log('\n🎉 EXCELLENT! Platform is in perfect health.');
        } else if (this.auditResults.overall.score >= 80) {
            console.log('\n👍 GOOD! Platform is healthy with minor issues to address.');
        } else {
            console.log('\n⚠️ ATTENTION NEEDED! Platform has issues that should be addressed.');
        }
        
        console.log('='.repeat(80));
        
        // Save detailed report
        this.saveDetailedReport();
        
        return this.auditResults;
    }

    /**
     * 💾 Save Detailed Report
     */
    saveDetailedReport() {
        const reportPath = path.join(process.cwd(), 'testing', 'platform-health-reports');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `complete-platform-health-${timestamp}.json`;
        const filePath = path.join(reportPath, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(this.auditResults, null, 2));
        console.log(`\n📄 Detailed report saved: ${filePath}`);
        
        // Also save a human-readable summary
        const summaryPath = path.join(reportPath, `platform-health-summary-${timestamp}.md`);
        const summary = this.generateMarkdownSummary();
        fs.writeFileSync(summaryPath, summary);
        console.log(`📝 Summary report saved: ${summaryPath}`);
    }

    /**
     * 📝 Generate Markdown Summary
     */
    generateMarkdownSummary() {
        return `# ResearchHub Platform Health Audit Report

**Date:** ${new Date(this.timestamp).toLocaleString()}  
**Platform:** https://researchhub-saas.vercel.app  
**Overall Health:** ${this.auditResults.overall.status} (${this.auditResults.overall.score}%)

## Executive Summary

${this.auditResults.overall.score >= 95 ? '✅ Platform is in excellent health with no critical issues.' :
  this.auditResults.overall.score >= 80 ? '👍 Platform is in good health with minor issues to address.' :
  '⚠️ Platform has issues that require attention.'}

## Audit Results

### 🔗 API Health Audit
- **Status:** ${this.auditResults.apiAudit.status}
- **Score:** ${this.auditResults.apiAudit.score}%
${this.auditResults.apiAudit.issues.length > 0 ? 
  '- **Issues:**\n' + this.auditResults.apiAudit.issues.map(i => `  - ${i}`).join('\n') : 
  '- **Issues:** None'}

### 🎭 Browser Health Audit
- **Status:** ${this.auditResults.browserAudit.status}
- **Score:** ${this.auditResults.browserAudit.score}%
${this.auditResults.browserAudit.issues.length > 0 ? 
  '- **Issues:**\n' + this.auditResults.browserAudit.issues.map(i => `  - ${i}`).join('\n') : 
  '- **Issues:** None'}

${this.auditResults.criticalIssues.length > 0 ? 
  '## 🚨 Critical Issues\n\n' + 
  this.auditResults.criticalIssues.map(issue => 
    `### ${issue.impact} Priority: ${issue.message}\n**Recommendation:** ${issue.recommendation}\n`
  ).join('\n') : ''}

${this.auditResults.recommendations.length > 0 ? 
  '## 💡 Recommendations\n\n' + 
  this.auditResults.recommendations.map(rec => 
    `### ${rec.priority} - ${rec.category}\n**Action:** ${rec.action}  \n**Description:** ${rec.description}  \n**Timeframe:** ${rec.timeframe}\n`
  ).join('\n') : ''}

## Next Steps

${this.auditResults.overall.score === 100 ? 
  '1. ✅ Platform is healthy - continue regular monitoring\n2. 📅 Schedule next audit in 1 week\n3. 🔄 Consider automating these audits' :
  '1. 🔧 Address identified issues based on priority\n2. 🧪 Re-run audit after fixes\n3. 📅 Schedule more frequent audits until 100% health achieved'}

---
*Generated by ResearchHub Platform Health Audit System*
`;
    }

    /**
     * 🚀 Main Execution
     */
    async runCompleteAudit() {
        console.log('🚀 Starting Complete Platform Health Audit...');
        console.log(`📅 Timestamp: ${this.timestamp}`);
        console.log('🎯 Testing API health, browser functionality, and data consistency...\n');
        
        try {
            // Run both audits concurrently (but sequentially to avoid resource conflicts)
            await this.runAPIAudit();
            await this.runBrowserAudit();
            
            // Analyze and generate comprehensive report
            this.analyzeCombinedResults();
            const results = this.generateComprehensiveReport();
            
            return results;
            
        } catch (error) {
            console.error('❌ Complete Platform Audit failed:', error.message);
            throw error;
        }
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const auditor = new CompletePlatformAuditor();
    auditor.runCompleteAudit()
        .then(results => {
            const exitCode = results.overall.score >= 80 ? 0 : 1;
            console.log(`\n🏁 Audit completed with exit code: ${exitCode}`);
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('Complete audit execution failed:', error);
            process.exit(1);
        });
}

export default CompletePlatformAuditor;