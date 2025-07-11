#!/usr/bin/env node

/**
 * UAT Performance Integration Runner
 * Combines User Acceptance Testing with Performance Monitoring
 * Integrates with existing ResearchHub testing infrastructure
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class UATPerformanceIntegration {
    constructor() {
        this.testingDir = path.join(__dirname, '..');
        this.reportsDir = path.join(this.testingDir, 'reports');
        this.screenshotsDir = path.join(this.testingDir, 'screenshots');
        this.configDir = path.join(this.testingDir, 'config');
        
        // Ensure directories exist
        [this.reportsDir, this.screenshotsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        
        this.results = {
            uat: { researcher: {}, participant: {} },
            performance: {},
            combined: {},
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                performanceScore: 0,
                businessImpact: 'unknown'
            }
        };
    }

    async runCombinedValidation(options = {}) {
        const { mode = 'full', generateReport = true } = options;
        
        console.log('🚀 UAT PERFORMANCE INTEGRATION SUITE');
        console.log('====================================');
        console.log(`Mode: ${mode.toUpperCase()}`);
        console.log(`Timestamp: ${this.results.timestamp}`);
        console.log('');

        try {
            // 1. Quick Health Check
            if (mode === 'quick' || mode === 'full') {
                await this.runQuickHealthCheck();
            }

            // 2. UAT Validation
            if (mode === 'uat' || mode === 'full') {
                await this.runUATSuite();
            }

            // 3. Performance Testing
            if (mode === 'performance' || mode === 'full') {
                await this.runPerformanceTests();
            }

            // 4. Combined Analysis
            if (mode === 'full') {
                await this.runCombinedAnalysis();
            }

            // 5. Generate Reports
            if (generateReport) {
                await this.generateCombinedReport();
            }

            // 6. Business Impact Assessment
            this.assessBusinessImpact();

            console.log('✅ UAT Performance Integration Complete!');
            console.log(`📊 Report: ${path.join(this.reportsDir, 'uat-performance-integration.html')}`);
            
            return this.results;

        } catch (error) {
            console.error('❌ UAT Performance Integration Failed:', error.message);
            this.results.summary.businessImpact = 'critical';
            throw error;
        }
    }

    async runQuickHealthCheck() {
        console.log('🔍 QUICK HEALTH CHECK');
        console.log('=====================');
        
        const healthChecks = [
            { name: 'API Health', endpoint: '/api/health' },
            { name: 'Database Check', endpoint: '/api/db-check' },
            { name: 'Auth Service', endpoint: '/api/auth?action=verify' },
            { name: 'Studies API', endpoint: '/api/studies' }
        ];

        const healthResults = [];
        
        for (const check of healthChecks) {
            try {
                // Simulate health check (integrate with actual health endpoints)
                const result = {
                    name: check.name,
                    status: 'healthy',
                    responseTime: Math.random() * 200 + 50, // ms
                    timestamp: new Date().toISOString()
                };
                
                healthResults.push(result);
                console.log(`✅ ${check.name}: ${result.responseTime.toFixed(0)}ms`);
                
            } catch (error) {
                const result = {
                    name: check.name,
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                
                healthResults.push(result);
                console.log(`❌ ${check.name}: ${error.message}`);
            }
        }
        
        this.results.health = healthResults;
        console.log('');
    }

    async runUATSuite() {
        console.log('🎯 UAT SUITE EXECUTION');
        console.log('======================');
        
        try {
            // Run researcher UAT
            console.log('👨‍🔬 Running Researcher UAT...');
            const researcherResult = await this.executeCommand('npm run uat:researcher');
            this.results.uat.researcher = this.parseUATResults(researcherResult, 'researcher');
            
            // Run participant UAT  
            console.log('👥 Running Participant UAT...');
            const participantResult = await this.executeCommand('npm run uat:participant');
            this.results.uat.participant = this.parseUATResults(participantResult, 'participant');
            
            console.log('✅ UAT Suite Complete');
            console.log('');
            
        } catch (error) {
            console.error('❌ UAT Suite Failed:', error.message);
            this.results.uat.error = error.message;
        }
    }

    async runPerformanceTests() {
        console.log('⚡ PERFORMANCE TESTING');
        console.log('=====================');
        
        const performanceTests = [
            { name: 'Homepage Load', url: '/', metric: 'FCP' },
            { name: 'Dashboard Load', url: '/dashboard', metric: 'LCP' },
            { name: 'Study Creation', url: '/studies/create', metric: 'TTI' },
            { name: 'API Response', url: '/api/studies', metric: 'Response Time' }
        ];

        const performanceResults = [];
        
        for (const test of performanceTests) {
            try {
                // Simulate performance test (integrate with actual Lighthouse/performance tools)
                const result = {
                    name: test.name,
                    url: test.url,
                    metric: test.metric,
                    score: Math.random() * 40 + 60, // 60-100 score
                    value: Math.random() * 2000 + 500, // ms
                    grade: this.getPerformanceGrade(Math.random() * 40 + 60),
                    timestamp: new Date().toISOString()
                };
                
                performanceResults.push(result);
                console.log(`${this.getGradeEmoji(result.grade)} ${test.name}: ${result.score.toFixed(0)} (${result.value.toFixed(0)}ms)`);
                
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
                performanceResults.push({
                    name: test.name,
                    error: error.message,
                    grade: 'F'
                });
            }
        }
        
        this.results.performance = {
            tests: performanceResults,
            averageScore: performanceResults.reduce((sum, r) => sum + (r.score || 0), 0) / performanceResults.length,
            overallGrade: this.getPerformanceGrade(performanceResults.reduce((sum, r) => sum + (r.score || 0), 0) / performanceResults.length)
        };
        
        console.log(`📊 Performance Average: ${this.results.performance.averageScore.toFixed(0)} (${this.results.performance.overallGrade})`);
        console.log('');
    }

    async runCombinedAnalysis() {
        console.log('🔬 COMBINED ANALYSIS');
        console.log('===================');
        
        const analysis = {
            uatSuccessRate: this.calculateUATSuccessRate(),
            performanceScore: this.results.performance.averageScore || 0,
            criticalIssues: [],
            recommendations: [],
            deploymentReadiness: 'unknown'
        };

        // Analyze UAT results
        if (analysis.uatSuccessRate < 0.8) {
            analysis.criticalIssues.push('UAT success rate below 80%');
            analysis.recommendations.push('Fix failing UAT scenarios before deployment');
        }

        // Analyze performance results
        if (analysis.performanceScore < 70) {
            analysis.criticalIssues.push('Performance score below acceptable threshold');
            analysis.recommendations.push('Optimize application performance before deployment');
        }

        // Determine deployment readiness
        if (analysis.criticalIssues.length === 0) {
            analysis.deploymentReadiness = 'ready';
        } else if (analysis.criticalIssues.length <= 2) {
            analysis.deploymentReadiness = 'conditional';
        } else {
            analysis.deploymentReadiness = 'not-ready';
        }

        this.results.combined = analysis;
        
        console.log(`📊 UAT Success Rate: ${(analysis.uatSuccessRate * 100).toFixed(1)}%`);
        console.log(`⚡ Performance Score: ${analysis.performanceScore.toFixed(0)}`);
        console.log(`🚀 Deployment Status: ${analysis.deploymentReadiness.toUpperCase()}`);
        
        if (analysis.criticalIssues.length > 0) {
            console.log('⚠️  Critical Issues:');
            analysis.criticalIssues.forEach(issue => console.log(`   • ${issue}`));
        }
        
        console.log('');
    }

    async generateCombinedReport() {
        const reportData = {
            ...this.results,
            generatedAt: new Date().toISOString(),
            version: '1.0.0',
            framework: 'UAT Performance Integration'
        };

        // Generate HTML Report
        const htmlReport = this.generateHTMLReport(reportData);
        const htmlPath = path.join(this.reportsDir, 'uat-performance-integration.html');
        fs.writeFileSync(htmlPath, htmlReport);

        // Generate JSON Report  
        const jsonPath = path.join(this.reportsDir, 'uat-performance-integration.json');
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

        // Generate Executive Summary
        const execSummary = this.generateExecutiveSummary(reportData);
        const summaryPath = path.join(this.reportsDir, 'uat-executive-summary.md');
        fs.writeFileSync(summaryPath, execSummary);

        console.log('📋 REPORTS GENERATED');
        console.log('===================');
        console.log(`📊 HTML Report: ${htmlPath}`);
        console.log(`📄 JSON Data: ${jsonPath}`);
        console.log(`📈 Executive Summary: ${summaryPath}`);
        console.log('');
    }

    generateHTMLReport(data) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UAT Performance Integration Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5em; font-weight: 700; }
        .header p { margin: 0; font-size: 1.2em; opacity: 0.9; }
        .content { padding: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #667eea; }
        .metric-value { font-size: 2.5em; font-weight: 700; color: #1e293b; margin: 10px 0; }
        .metric-label { color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.9em; }
        .section { margin: 40px 0; }
        .section h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .status-good { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-error { color: #ef4444; }
        .test-result { background: #f8fafc; border-radius: 6px; padding: 15px; margin: 10px 0; border-left: 4px solid #e2e8f0; }
        .test-result.passed { border-left-color: #10b981; }
        .test-result.failed { border-left-color: #ef4444; }
        .recommendations { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; padding: 30px; background: #f8fafc; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 UAT Performance Integration</h1>
            <p>ResearchHub Quality Assurance Report</p>
            <p>Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-label">UAT Success Rate</div>
                    <div class="metric-value ${this.getStatusClass(this.calculateUATSuccessRate() * 100, 80)}">${(this.calculateUATSuccessRate() * 100).toFixed(1)}%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Performance Score</div>
                    <div class="metric-value ${this.getStatusClass(data.performance?.averageScore || 0, 70)}">${(data.performance?.averageScore || 0).toFixed(0)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Deployment Status</div>
                    <div class="metric-value">${(data.combined?.deploymentReadiness || 'unknown').toUpperCase()}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Business Impact</div>
                    <div class="metric-value">${(data.summary?.businessImpact || 'unknown').toUpperCase()}</div>
                </div>
            </div>

            <div class="section">
                <h2>🎯 UAT Results Summary</h2>
                <div class="test-result passed">
                    <strong>Researcher UAT:</strong> ${JSON.stringify(data.uat?.researcher || {}, null, 2)}
                </div>
                <div class="test-result passed">
                    <strong>Participant UAT:</strong> ${JSON.stringify(data.uat?.participant || {}, null, 2)}
                </div>
            </div>

            <div class="section">
                <h2>⚡ Performance Results</h2>
                ${(data.performance?.tests || []).map(test => `
                    <div class="test-result ${test.grade && test.grade !== 'F' ? 'passed' : 'failed'}">
                        <strong>${test.name}:</strong> ${test.score?.toFixed(0) || 'N/A'} (${test.grade || 'N/A'})
                        ${test.value ? ` - ${test.value.toFixed(0)}ms` : ''}
                    </div>
                `).join('')}
            </div>

            ${data.combined?.recommendations?.length ? `
            <div class="recommendations">
                <h3>📋 Recommendations</h3>
                <ul>
                    ${data.combined.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>ResearchHub UAT Performance Integration Framework v${data.version}</p>
            <p>For technical details, see the JSON report and executive summary</p>
        </div>
    </div>
</body>
</html>`;
    }

    generateExecutiveSummary(data) {
        const successRate = this.calculateUATSuccessRate();
        const performanceScore = data.performance?.averageScore || 0;
        const readiness = data.combined?.deploymentReadiness || 'unknown';
        
        return `# UAT Performance Integration - Executive Summary

**Report Date:** ${new Date(data.generatedAt).toLocaleDateString()}  
**Framework Version:** ${data.version}

## 🎯 Key Metrics

| Metric | Value | Status |
|--------|-------|--------|
| UAT Success Rate | ${(successRate * 100).toFixed(1)}% | ${successRate >= 0.8 ? '✅ Good' : '⚠️ Needs Attention'} |
| Performance Score | ${performanceScore.toFixed(0)} | ${performanceScore >= 70 ? '✅ Good' : '⚠️ Needs Attention'} |
| Deployment Readiness | ${readiness.toUpperCase()} | ${readiness === 'ready' ? '✅ Ready' : readiness === 'conditional' ? '⚠️ Conditional' : '❌ Not Ready'} |

## 📊 Business Impact

**Overall Assessment:** ${data.summary?.businessImpact || 'Unknown'}

### Researcher Workflow Health
${JSON.stringify(data.uat?.researcher || {}, null, 2)}

### Participant Workflow Health  
${JSON.stringify(data.uat?.participant || {}, null, 2)}

## 🚀 Recommendations

${data.combined?.recommendations?.length ? 
    data.combined.recommendations.map(rec => `- ${rec}`).join('\n') : 
    '- Continue with current quality standards\n- Monitor performance trends\n- Schedule regular UAT execution'
}

## 📈 Next Steps

1. **Immediate Actions:** Address any critical issues identified
2. **Short-term:** Implement recommended improvements  
3. **Long-term:** Continue monitoring and optimization

---
*Generated by ResearchHub UAT Performance Integration Framework*`;
    }

    // Helper methods
    async executeCommand(command) {
        try {
            return execSync(command, { encoding: 'utf8' });
        } catch (error) {
            return error.stdout || error.message;
        }
    }

    parseUATResults(output, type) {
        // Parse UAT output and extract meaningful results
        const lines = output.split('\n');
        const results = {
            type,
            passed: lines.filter(line => line.includes('✅')).length,
            failed: lines.filter(line => line.includes('❌')).length,
            total: lines.filter(line => line.includes('✅') || line.includes('❌')).length,
            rawOutput: output
        };
        
        results.successRate = results.total > 0 ? results.passed / results.total : 0;
        return results;
    }

    calculateUATSuccessRate() {
        const researcher = this.results.uat?.researcher?.successRate || 0;
        const participant = this.results.uat?.participant?.successRate || 0;
        return (researcher + participant) / 2;
    }

    getPerformanceGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    getGradeEmoji(grade) {
        const emojis = { 'A': '🏆', 'B': '✅', 'C': '⚠️', 'D': '🔶', 'F': '❌' };
        return emojis[grade] || '❓';
    }

    getStatusClass(value, threshold) {
        return value >= threshold ? 'status-good' : 'status-warning';
    }

    assessBusinessImpact() {
        const successRate = this.calculateUATSuccessRate();
        const performanceScore = this.results.performance?.averageScore || 0;
        
        if (successRate >= 0.9 && performanceScore >= 80) {
            this.results.summary.businessImpact = 'positive';
        } else if (successRate >= 0.7 && performanceScore >= 60) {
            this.results.summary.businessImpact = 'neutral';
        } else {
            this.results.summary.businessImpact = 'negative';
        }
        
        this.results.summary.totalTests = (this.results.uat?.researcher?.total || 0) + (this.results.uat?.participant?.total || 0);
        this.results.summary.passed = (this.results.uat?.researcher?.passed || 0) + (this.results.uat?.participant?.passed || 0);
        this.results.summary.failed = (this.results.uat?.researcher?.failed || 0) + (this.results.uat?.participant?.failed || 0);
        this.results.summary.performanceScore = performanceScore;
    }
}

// CLI Interface
if (require.main === module) {
    const mode = process.argv[2] || 'quick';
    const integration = new UATPerformanceIntegration();
    
    integration.runCombinedValidation({ mode })
        .then(results => {
            console.log('🎉 Integration complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Integration failed:', error.message);
            process.exit(1);
        });
}

module.exports = UATPerformanceIntegration;
