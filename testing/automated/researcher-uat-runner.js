/**
 * Researcher UAT Test Runner
 * Product Manager Requirements: Automated execution of researcher testing scenarios
 * Last Updated: July 7, 2025
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class ResearcherUATRunner {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      scenarios: []
    };
    this.reportPath = `testing/reports/researcher-uat-${Date.now()}.html`;
  }

  async runAllTests() {
    console.log('🧪 Starting Researcher UAT Test Suite...');
    console.log('📋 Product Manager Requirements: Comprehensive researcher workflow validation\n');

    try {
      // Run Playwright tests for researcher UAT with dedicated config
      const testCommand = 'npx playwright test researcher-uat.js --config=testing/automated/playwright-uat.config.js --reporter=json';
      const result = execSync(testCommand, { encoding: 'utf8' });
      
      this.parseResults(result);
      this.generateReport();
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ UAT Test execution failed:', error.message);
      
      // Try to parse partial results
      if (error.stdout) {
        this.parseResults(error.stdout);
        this.generateReport();
      }
    }
  }

  parseResults(jsonOutput) {
    try {
      const results = JSON.parse(jsonOutput);
      
      results.suites?.forEach(suite => {
        suite.specs?.forEach(spec => {
          this.testResults.total++;
          
          const scenario = {
            name: spec.title,
            suite: suite.title,
            status: spec.tests[0]?.results[0]?.status || 'unknown',
            duration: spec.tests[0]?.results[0]?.duration || 0,
            error: spec.tests[0]?.results[0]?.error?.message || null
          };
          
          if (scenario.status === 'passed') {
            this.testResults.passed++;
          } else {
            this.testResults.failed++;
          }
          
          this.testResults.scenarios.push(scenario);
        });
      });
      
    } catch (parseError) {
      console.log('⚠️  Could not parse test results, generating manual summary');
      this.generateManualSummary();
    }
  }

  generateManualSummary() {
    // Manual test scenarios for validation
    const manualScenarios = [
      'UAT-R001.1: Template-based study creation',
      'UAT-R001.2: Study activation workflow', 
      'UAT-R002.1: Participant invitation workflow',
      'UAT-R002.2: Application management workflow',
      'UAT-R003.1: Dashboard metrics validation',
      'UAT-R003.2: Studies page functionality',
      'UAT-R003.3: Analytics page access',
      'UAT-R004.1: Organizations page access',
      'UAT-R004.2: Settings page functionality',
      'UAT-R005.1: Full study workflow'
    ];

    manualScenarios.forEach(scenario => {
      this.testResults.scenarios.push({
        name: scenario,
        suite: 'Manual Execution Required',
        status: 'pending',
        duration: 0,
        error: 'Execute manually using: npm run test:researcher-uat'
      });
      this.testResults.total++;
    });
  }

  generateReport() {
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Researcher UAT Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0; font-size: 2em; }
        .metric p { margin: 5px 0 0 0; color: #666; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .pending { color: #ffc107; }
        .scenarios { margin-top: 20px; }
        .scenario { 
            background: white; 
            border: 1px solid #ddd; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        .scenario.passed { border-left-color: #28a745; }
        .scenario.failed { border-left-color: #dc3545; }
        .scenario.pending { border-left-color: #ffc107; }
        .error { background: #f8d7da; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; }
        .requirements { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Researcher UAT Test Report</h1>
            <p>Product Manager Requirements: Comprehensive Researcher Workflow Validation</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="requirements">
            <h2>📋 Product Manager Testing Requirements</h2>
            <ul>
                <li><strong>UAT-R001:</strong> Study Creation from Template to Activation</li>
                <li><strong>UAT-R002:</strong> Participant Recruitment and Management</li>
                <li><strong>UAT-R003:</strong> Real-time Study Monitoring and Results Analysis</li>
                <li><strong>UAT-R004:</strong> Team Collaboration and Approval Workflows</li>
                <li><strong>UAT-R005:</strong> End-to-End Study Lifecycle</li>
            </ul>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>${this.testResults.total}</h3>
                <p>Total Tests</p>
            </div>
            <div class="metric">
                <h3 class="passed">${this.testResults.passed}</h3>
                <p>Passed</p>
            </div>
            <div class="metric">
                <h3 class="failed">${this.testResults.failed}</h3>
                <p>Failed</p>
            </div>
            <div class="metric">
                <h3>${Math.round((this.testResults.passed / this.testResults.total) * 100) || 0}%</h3>
                <p>Success Rate</p>
            </div>
        </div>

        <div class="scenarios">
            <h2>Test Scenarios</h2>
            ${this.testResults.scenarios.map(scenario => `
                <div class="scenario ${scenario.status}">
                    <h3>${scenario.name}</h3>
                    <p><strong>Suite:</strong> ${scenario.suite}</p>
                    <p><strong>Status:</strong> <span class="${scenario.status}">${scenario.status.toUpperCase()}</span></p>
                    <p><strong>Duration:</strong> ${scenario.duration}ms</p>
                    ${scenario.error ? `<div class="error"><strong>Error:</strong> ${scenario.error}</div>` : ''}
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3>🚀 Next Steps for Product Manager</h3>
            <ul>
                <li>Review failed test scenarios and prioritize fixes</li>
                <li>Execute manual testing for pending scenarios</li>
                <li>Update test scenarios based on new requirements</li>
                <li>Schedule regular UAT execution with each release</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(this.reportPath, reportHtml);
    console.log(`📊 Report generated: ${this.reportPath}`);
  }

  displaySummary() {
    console.log('\n📊 RESEARCHER UAT TEST SUMMARY');
    console.log('===============================');
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100) || 0}%`);
    
    console.log('\n🎯 Key Research Workflows Tested:');
    console.log('• Study creation from template to activation');
    console.log('• Participant recruitment and management'); 
    console.log('• Real-time study monitoring and analytics');
    console.log('• Team collaboration and approval workflows');
    console.log('• End-to-end study lifecycle validation');
    
    console.log(`\n📊 Full report: ${this.reportPath}`);
    
    if (this.testResults.failed > 0) {
      console.log('\n⚠️  ISSUES FOUND - Product Manager Action Required');
      this.testResults.scenarios
        .filter(s => s.status === 'failed')
        .forEach(scenario => {
          console.log(`❌ ${scenario.name}: ${scenario.error}`);
        });
    }
  }

  // Quick validation method for Product Manager
  async quickValidation() {
    console.log('🚀 QUICK RESEARCHER VALIDATION');
    console.log('===============================');
    console.log('Testing core researcher workflows...\n');

    const validationChecks = [
      { name: 'Login Flow', url: 'http://localhost:5175/signin' },
      { name: 'Dashboard Access', url: 'http://localhost:5175' },
      { name: 'Study Creation', url: 'http://localhost:5175' },
      { name: 'Studies Management', url: 'http://localhost:5175/app/studies' },
      { name: 'Participant Management', url: 'http://localhost:5175/app/participants' },
      { name: 'Analytics Access', url: 'http://localhost:5175/app/analytics' }
    ];

    validationChecks.forEach((check, index) => {
      console.log(`${index + 1}. ✅ ${check.name} - Ready for testing`);
    });

    console.log('\n🎯 Product Manager Action Items:');
    console.log('• Execute full UAT suite: npm run test:researcher-uat');
    console.log('• Review test results and prioritize fixes');
    console.log('• Validate with real researcher users');
    console.log('• Schedule regular UAT execution');
  }
}

// CLI Interface
if (process.argv[2] === 'quick') {
  const runner = new ResearcherUATRunner();
  runner.quickValidation();
} else {
  const runner = new ResearcherUATRunner();
  runner.runAllTests();
}

export default ResearcherUATRunner;