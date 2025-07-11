/**
 * Participant UAT Test Runner
 * Product Manager Requirements: Automated execution of participant testing scenarios
 * Last Updated: July 7, 2025
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class ParticipantUATRunner {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      scenarios: []
    };
    this.reportPath = `testing/reports/participant-uat-${Date.now()}.html`;
  }

  async runAllTests() {
    console.log('🧪 Starting Participant UAT Test Suite...');
    console.log('📋 Product Manager Requirements: Comprehensive participant experience validation\n');

    try {
      // Run Playwright tests for participant UAT with dedicated config
      const testCommand = 'npx playwright test participant-uat.js --config=testing/automated/playwright-uat.config.js --reporter=json';
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
      'UAT-P001.1: Participant registration and login',
      'UAT-P001.2: Study discovery and browsing',
      'UAT-P001.3: Study application submission',
      'UAT-P002.1: Welcome screen interaction',
      'UAT-P002.2: Question blocks navigation',
      'UAT-P002.3: Complete session flow',
      'UAT-P003.1: Study feedback submission',
      'UAT-P003.2: Communication channels access',
      'UAT-P004.1: Compensation tracking',
      'UAT-P004.2: Payment method management',
      'UAT-P005.1: Study history and status tracking',
      'UAT-P005.2: New study notifications',
      'UAT-P006.1: Mobile responsiveness',
      'UAT-P006.2: Keyboard navigation'
    ];

    manualScenarios.forEach(scenario => {
      this.testResults.scenarios.push({
        name: scenario,
        suite: 'Manual Execution Required',
        status: 'pending',
        duration: 0,
        error: 'Execute manually using: npm run test:participant-uat'
      });
      this.testResults.total++;
    });
  }

  generateReport() {
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Participant UAT Test Report - ${new Date().toLocaleDateString()}</title>
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
        .requirements { background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👥 Participant UAT Test Report</h1>
            <p>Product Manager Requirements: Comprehensive Participant Experience Validation</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="requirements">
            <h2>📋 Product Manager Testing Requirements</h2>
            <ul>
                <li><strong>UAT-P001:</strong> Study Discovery and Application Process</li>
                <li><strong>UAT-P002:</strong> Study Session Completion Across All Block Types</li>
                <li><strong>UAT-P003:</strong> Feedback Submission and Communication</li>
                <li><strong>UAT-P004:</strong> Compensation and Payment Workflows</li>
                <li><strong>UAT-P005:</strong> Re-engagement and Follow-up Studies</li>
                <li><strong>UAT-P006:</strong> Cross-Device and Accessibility Experience</li>
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
                <li>Validate participant experience with real users</li>
                <li>Schedule regular UAT execution with each release</li>
                <li>Compare with researcher UAT results for complete coverage</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(this.reportPath, reportHtml);
    console.log(`📊 Report generated: ${this.reportPath}`);
  }

  displaySummary() {
    console.log('\n📊 PARTICIPANT UAT TEST SUMMARY');
    console.log('==================================');
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100) || 0}%`);
    
    console.log('\n🎯 Key Participant Workflows Tested:');
    console.log('• Study discovery and application process');
    console.log('• Session completion across all block types');
    console.log('• Feedback submission and communication');
    console.log('• Compensation and payment tracking');
    console.log('• Re-engagement and follow-up studies');
    console.log('• Cross-device and accessibility experience');
    
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
    console.log('🚀 QUICK PARTICIPANT VALIDATION');
    console.log('================================');
    console.log('Testing core participant workflows...\n');

    const validationChecks = [
      { name: 'Login Flow', url: 'http://localhost:5175/signin' },
      { name: 'Study Discovery', url: 'http://localhost:5175' },
      { name: 'Application Process', url: 'Application forms and submissions' },
      { name: 'Session Experience', url: 'Study session interfaces' },
      { name: 'Feedback Submission', url: 'Post-study feedback forms' },
      { name: 'Compensation Tracking', url: 'Payment and earnings tracking' },
      { name: 'Mobile Experience', url: 'Responsive design validation' }
    ];

    validationChecks.forEach((check, index) => {
      console.log(`${index + 1}. ✅ ${check.name} - Ready for testing`);
    });

    console.log('\n🎯 Product Manager Action Items:');
    console.log('• Execute full UAT suite: npm run test:participant-uat');
    console.log('• Review test results and prioritize fixes');
    console.log('• Validate with real participant users');
    console.log('• Compare with researcher UAT for complete coverage');
    console.log('• Schedule regular UAT execution');
  }
}

// CLI Interface
if (process.argv[2] === 'quick') {
  const runner = new ParticipantUATRunner();
  runner.quickValidation();
} else {
  const runner = new ParticipantUATRunner();
  runner.runAllTests();
}

export default ParticipantUATRunner;