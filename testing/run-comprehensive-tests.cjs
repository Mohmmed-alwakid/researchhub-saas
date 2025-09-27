/**
 * COMPREHENSIVE TEST EXECUTION SCRIPT
 * Runs the complete Playwright test suite for ResearchHub
 * 
 * This script executes all the tests we've created:
 * 1. Delete study validation (fixes the 404 bug)
 * 2. Admin dashboard comprehensive testing 
 * 3. Multi-role workflow testing
 * 4. Generates detailed test reports
 * 
 * Usage:
 * npm run test:comprehensive
 * node testing/run-comprehensive-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  headless: process.env.HEADLESS !== 'false',
  workers: 2,
  timeout: 180000, // 3 minutes per test
  retries: 1,
  browsers: ['chromium'] // Can extend to ['chromium', 'firefox', 'webkit']
};

// Test suite definitions
const TEST_SUITES = [
  {
    name: 'Delete Study Validation',
    file: 'testing/playwright/delete-study-validation.spec.js',
    priority: 'P0 - Critical Bug Fix',
    description: 'Validates the delete study 404 fix is working correctly'
  },
  {
    name: 'Admin Dashboard Comprehensive',
    file: 'testing/playwright/admin-dashboard-comprehensive.spec.js', 
    priority: 'P1 - Missing Coverage',
    description: 'Complete admin functionality testing (previously missing)'
  },
  {
    name: 'Multi-Role Workflow',
    file: 'testing/playwright/comprehensive-multi-role-test.spec.js',
    priority: 'P0 - Platform Validation', 
    description: 'End-to-end testing of researcher → participant → admin workflows'
  }
];

async function main() {
  console.log('🚀 STARTING COMPREHENSIVE RESEARCHHUB TESTING');
  console.log('================================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Headless mode: ${TEST_CONFIG.headless}`);
  console.log(`Workers: ${TEST_CONFIG.workers}`);
  console.log(`Timeout: ${TEST_CONFIG.timeout / 1000}s per test`);
  console.log('================================================\n');

  const testResults = [];
  const startTime = Date.now();

  // Create reports directory
  const reportsDir = 'testing/reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Run each test suite
  for (const suite of TEST_SUITES) {
    console.log(`\n📋 RUNNING: ${suite.name}`);
    console.log(`Priority: ${suite.priority}`);
    console.log(`Description: ${suite.description}`);
    console.log('─'.repeat(60));

    const suiteStartTime = Date.now();
    let result = null;

    try {
      // Check if test file exists
      if (!fs.existsSync(suite.file)) {
        throw new Error(`Test file not found: ${suite.file}`);
      }

      // Run the test with Playwright
      const command = `npx playwright test "${suite.file}" --reporter=html`;
      
      console.log(`Executing: ${command}`);
      
      const output = execSync(command, {
        encoding: 'utf-8',
        cwd: process.cwd(),
        timeout: TEST_CONFIG.timeout * 2 // Give extra time for setup
      });

      result = {
        suite: suite.name,
        status: 'PASSED',
        duration: Date.now() - suiteStartTime,
        output: output,
        error: null
      };

      console.log(`✅ ${suite.name}: PASSED (${result.duration}ms)`);

    } catch (error) {
      result = {
        suite: suite.name,
        status: 'FAILED',
        duration: Date.now() - suiteStartTime,
        output: error.stdout || '',
        error: error.message
      };

      console.log(`❌ ${suite.name}: FAILED`);
      console.log(`Error: ${error.message}`);
      
      // Take screenshot of error if possible
      try {
        const errorScreenshotDir = 'testing/screenshots/errors';
        if (!fs.existsSync(errorScreenshotDir)) {
          fs.mkdirSync(errorScreenshotDir, { recursive: true });
        }
      } catch (screenshotError) {
        console.log('Warning: Could not create error screenshot directory');
      }
    }

    testResults.push(result);
  }

  // Generate comprehensive test report
  const totalDuration = Date.now() - startTime;
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;

  console.log('\n🏆 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('================================================');
  console.log(`Total Test Suites: ${testResults.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / testResults.length) * 100).toFixed(1)}%`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log('================================================');

  // Detailed results
  console.log('\n📊 DETAILED TEST RESULTS:');
  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.suite}`);
    console.log(`   Status: ${result.status} ${result.status === 'PASSED' ? '✅' : '❌'}`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Generate JSON report
  const jsonReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    configuration: TEST_CONFIG,
    summary: {
      totalSuites: testResults.length,
      passed: passed,
      failed: failed,
      successRate: (passed / testResults.length) * 100,
      totalDuration: totalDuration
    },
    results: testResults
  };

  const reportPath = `${reportsDir}/comprehensive-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
  console.log(`\n📄 JSON Report saved: ${reportPath}`);

  // Generate HTML summary report
  generateHTMLReport(jsonReport, `${reportsDir}/comprehensive-test-report.html`);
  console.log(`📄 HTML Report saved: ${reportsDir}/comprehensive-test-report.html`);

  // Exit with appropriate code
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Check the reports for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TESTS PASSED! ResearchHub platform is fully validated.');
    process.exit(0);
  }
}

function generateHTMLReport(report, filePath) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>ResearchHub Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .metric { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #1e40af; }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 8px; }
        .passed { background: #dcfce7; border-left: 4px solid #16a34a; }
        .failed { background: #fee2e2; border-left: 4px solid #dc2626; }
        .status { font-weight: bold; }
        .timestamp { color: #6b7280; font-size: 0.9em; }
        .description { color: #4b5563; margin: 5px 0; }
        .duration { color: #7c3aed; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 ResearchHub Comprehensive Test Report</h1>
        <p class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        <p>Environment: ${report.environment}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.summary.totalSuites}</div>
            <div>Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value" style="color: #16a34a">${report.summary.passed}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value" style="color: #dc2626">${report.summary.failed}</div>
            <div>Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.successRate.toFixed(1)}%</div>
            <div>Success Rate</div>
        </div>
    </div>

    <h2>📋 Test Results</h2>
    ${report.results.map(result => `
        <div class="test-result ${result.status.toLowerCase()}">
            <h3>${result.suite}</h3>
            <div class="status">Status: ${result.status} ${result.status === 'PASSED' ? '✅' : '❌'}</div>
            <div class="duration">Duration: ${(result.duration / 1000).toFixed(1)}s</div>
            ${result.error ? `<div style="color: #dc2626; margin-top: 10px;"><strong>Error:</strong> ${result.error}</div>` : ''}
        </div>
    `).join('')}

    <div style="margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
        <h3>🎯 Test Coverage Summary</h3>
        <ul>
            <li><strong>Delete Study Validation:</strong> Ensures the 404 bug fix is working correctly</li>
            <li><strong>Admin Dashboard Testing:</strong> Validates previously missing admin functionality</li>
            <li><strong>Multi-Role Workflow:</strong> End-to-end testing of all user roles working together</li>
        </ul>
        <p><strong>Total Coverage:</strong> Complete platform validation from researcher → participant → admin workflows</p>
    </div>
</body>
</html>
  `;

  fs.writeFileSync(filePath, html);
}

// Add command line argument parsing
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
ResearchHub Comprehensive Test Runner

Usage:
  node testing/run-comprehensive-tests.js [options]

Options:
  --headless=false     Run tests in headed mode (default: headless)
  --workers=N          Number of parallel workers (default: 2)
  --help, -h           Show this help message

Examples:
  node testing/run-comprehensive-tests.js
  node testing/run-comprehensive-tests.js --headless=false
  HEADLESS=false node testing/run-comprehensive-tests.js
    `);
    process.exit(0);
  }

  // Parse options
  args.forEach(arg => {
    if (arg.startsWith('--headless=')) {
      TEST_CONFIG.headless = arg.split('=')[1] === 'true';
    }
    if (arg.startsWith('--workers=')) {
      TEST_CONFIG.workers = parseInt(arg.split('=')[1]);
    }
  });

  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { main, TEST_SUITES, TEST_CONFIG };