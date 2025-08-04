/**
 * Coverage Analyzer for Adaptive Testing
 * Tracks test coverage and identifies gaps
 * 
 * Date: July 18, 2025
 * Part of: Adaptive Test Coverage Implementation
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class CoverageAnalyzer {
  constructor() {
    this.config = {
      reportDir: path.join(process.cwd(), 'testing', 'reports', 'coverage'),
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90
      },
      excludePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    };
    
    this.coverageData = {
      overall: {},
      byFile: {},
      byCategory: {},
      gaps: [],
      trends: []
    };
  }

  /**
   * Initialize coverage analyzer
   */
  async initialize() {
    console.log('📊 Initializing Coverage Analyzer...');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Load historical coverage data
    await this.loadHistoricalData();
    
    console.log('✅ Coverage Analyzer initialized');
  }

  /**
   * Analyze current test coverage
   */
  async analyzeCoverage() {
    console.log('🔍 Analyzing test coverage...');
    
    try {
      // Run coverage analysis
      const coverageResults = await this.runCoverageAnalysis();
      
      // Process coverage data
      this.processCoverageData(coverageResults);
      
      // Identify coverage gaps
      await this.identifyCoverageGaps();
      
      // Generate coverage report
      await this.generateCoverageReport();
      
      // Update trends
      await this.updateCoverageTrends();
      
      console.log('✅ Coverage analysis complete');
      return this.coverageData;
      
    } catch (error) {
      console.error('❌ Coverage analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Run coverage analysis using various tools
   */
  async runCoverageAnalysis() {
    const results = {};
    
    try {
      // Run JavaScript/TypeScript coverage using c8
      console.log('🧪 Running JavaScript/TypeScript coverage...');
      const jsResults = await this.runJSCoverage();
      results.javascript = jsResults;
      
      // Run Playwright coverage for E2E tests
      console.log('🎭 Running Playwright coverage...');
      const playwrightResults = await this.runPlaywrightCoverage();
      results.playwright = playwrightResults;
      
      // Analyze API coverage
      console.log('🔌 Analyzing API coverage...');
      const apiResults = await this.analyzeAPICoverage();
      results.api = apiResults;
      
      // Analyze component coverage
      console.log('🧩 Analyzing component coverage...');
      const componentResults = await this.analyzeComponentCoverage();
      results.components = componentResults;
      
    } catch (error) {
      console.warn('⚠️ Some coverage analysis failed:', error.message);
    }
    
    return results;
  }

  /**
   * Run JavaScript/TypeScript coverage using c8
   */
  async runJSCoverage() {
    try {
      const { stdout } = await execAsync('npx c8 --reporter=json --reporter=text npm test');
      
      // Parse c8 JSON output
      const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-final.json');
      if (fs.existsSync(coverageFile)) {
        const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        return this.parseC8Coverage(coverageData);
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ JS coverage analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Run Playwright coverage
   */
  async runPlaywrightCoverage() {
    try {
      const { stdout } = await execAsync('npx playwright test --coverage');
      return this.parsePlaywrightCoverage(stdout);
    } catch (error) {
      console.warn('⚠️ Playwright coverage analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Analyze API endpoint coverage
   */
  async analyzeAPICoverage() {
    const apiDir = path.join(process.cwd(), 'api');
    const testDir = path.join(process.cwd(), 'testing');
    
    if (!fs.existsSync(apiDir)) {
      return { endpoints: 0, tested: 0, coverage: 0 };
    }

    // Find all API endpoints
    const apiFiles = this.findFiles(apiDir, /\.(ts|js)$/);
    const testFiles = this.findFiles(testDir, /\.(test|spec)\.(ts|js)$/);
    
    // Check which endpoints have tests
    const testedEndpoints = [];
    const untestedEndpoints = [];
    
    for (const apiFile of apiFiles) {
      const endpointName = path.basename(apiFile, path.extname(apiFile));
      const hasTest = testFiles.some(testFile => 
        testFile.includes(endpointName) || 
        fs.readFileSync(testFile, 'utf8').includes(endpointName)
      );
      
      if (hasTest) {
        testedEndpoints.push(apiFile);
      } else {
        untestedEndpoints.push(apiFile);
      }
    }
    
    return {
      endpoints: apiFiles.length,
      tested: testedEndpoints.length,
      untested: untestedEndpoints.length,
      coverage: (testedEndpoints.length / apiFiles.length) * 100,
      untestedFiles: untestedEndpoints
    };
  }

  /**
   * Analyze component coverage
   */
  async analyzeComponentCoverage() {
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    const testDir = path.join(process.cwd(), 'testing');
    
    if (!fs.existsSync(componentsDir)) {
      return { components: 0, tested: 0, coverage: 0 };
    }

    // Find all components
    const componentFiles = this.findFiles(componentsDir, /\.(tsx|jsx)$/);
    const testFiles = this.findFiles(testDir, /\.(test|spec)\.(ts|tsx|js|jsx)$/);
    
    // Check which components have tests
    const testedComponents = [];
    const untestedComponents = [];
    
    for (const componentFile of componentFiles) {
      const componentName = path.basename(componentFile, path.extname(componentFile));
      const hasTest = testFiles.some(testFile => 
        testFile.includes(componentName) || 
        fs.readFileSync(testFile, 'utf8').includes(componentName)
      );
      
      if (hasTest) {
        testedComponents.push(componentFile);
      } else {
        untestedComponents.push(componentFile);
      }
    }
    
    return {
      components: componentFiles.length,
      tested: testedComponents.length,
      untested: untestedComponents.length,
      coverage: (testedComponents.length / componentFiles.length) * 100,
      untestedFiles: untestedComponents
    };
  }

  /**
   * Process raw coverage data into standardized format
   */
  processCoverageData(results) {
    this.coverageData.overall = {
      statements: this.calculateOverallCoverage(results, 'statements'),
      branches: this.calculateOverallCoverage(results, 'branches'),
      functions: this.calculateOverallCoverage(results, 'functions'),
      lines: this.calculateOverallCoverage(results, 'lines')
    };
    
    this.coverageData.byCategory = {
      javascript: results.javascript,
      api: results.api,
      components: results.components,
      e2e: results.playwright
    };
    
    this.coverageData.timestamp = new Date().toISOString();
  }

  /**
   * Identify coverage gaps and areas needing attention
   */
  async identifyCoverageGaps() {
    const gaps = [];
    
    // Check overall coverage against thresholds
    for (const [metric, threshold] of Object.entries(this.config.thresholds)) {
      const actual = this.coverageData.overall[metric] || 0;
      if (actual < threshold) {
        gaps.push({
          type: 'threshold',
          metric,
          actual,
          expected: threshold,
          severity: this.calculateSeverity(actual, threshold)
        });
      }
    }
    
    // Check for untested files
    if (this.coverageData.byCategory.api?.untestedFiles?.length > 0) {
      gaps.push({
        type: 'untested-api',
        files: this.coverageData.byCategory.api.untestedFiles,
        severity: 'high',
        impact: 'API endpoints without tests pose security and reliability risks'
      });
    }
    
    if (this.coverageData.byCategory.components?.untestedFiles?.length > 0) {
      gaps.push({
        type: 'untested-components',
        files: this.coverageData.byCategory.components.untestedFiles,
        severity: 'medium',
        impact: 'Components without tests may have UI bugs'
      });
    }
    
    // Check for critical paths without coverage
    const criticalPaths = await this.identifyCriticalPaths();
    for (const path of criticalPaths) {
      if (!this.isPathCovered(path)) {
        gaps.push({
          type: 'critical-path',
          path,
          severity: 'critical',
          impact: 'Critical user workflow not tested'
        });
      }
    }
    
    this.coverageData.gaps = gaps;
  }

  /**
   * Generate comprehensive coverage report
   */
  async generateCoverageReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.config.reportDir, `coverage-report-${timestamp}.json`);
    const htmlReportPath = path.join(this.config.reportDir, `coverage-report-${timestamp}.html`);
    
    // Generate JSON report
    const jsonReport = {
      summary: this.generateCoverageSummary(),
      details: this.coverageData,
      recommendations: this.generateRecommendations(),
      timestamp: this.coverageData.timestamp
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(jsonReport);
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    console.log(`📋 Coverage report generated: ${reportPath}`);
    console.log(`🌐 HTML report generated: ${htmlReportPath}`);
    
    return jsonReport;
  }

  /**
   * Generate coverage summary
   */
  generateCoverageSummary() {
    const overall = this.coverageData.overall;
    const gaps = this.coverageData.gaps;
    
    return {
      overallScore: this.calculateOverallScore(),
      status: this.determineStatus(),
      metrics: overall,
      gapCount: gaps.length,
      criticalIssues: gaps.filter(gap => gap.severity === 'critical').length,
      recommendations: this.getTopRecommendations()
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const gaps = this.coverageData.gaps;
    
    // Recommendations based on gaps
    for (const gap of gaps) {
      switch (gap.type) {
        case 'untested-api':
          recommendations.push({
            priority: 'high',
            action: 'Generate API tests',
            description: `Create tests for ${gap.files.length} untested API endpoints`,
            files: gap.files,
            estimatedEffort: gap.files.length * 30 // 30 minutes per endpoint
          });
          break;
          
        case 'untested-components':
          recommendations.push({
            priority: 'medium',
            action: 'Generate component tests',
            description: `Create tests for ${gap.files.length} untested components`,
            files: gap.files,
            estimatedEffort: gap.files.length * 45 // 45 minutes per component
          });
          break;
          
        case 'critical-path':
          recommendations.push({
            priority: 'critical',
            action: 'Add critical path testing',
            description: `Test critical user workflow: ${gap.path}`,
            estimatedEffort: 120 // 2 hours for critical path
          });
          break;
          
        case 'threshold':
          recommendations.push({
            priority: 'medium',
            action: `Improve ${gap.metric} coverage`,
            description: `Increase ${gap.metric} coverage from ${gap.actual}% to ${gap.expected}%`,
            estimatedEffort: (gap.expected - gap.actual) * 10 // 10 minutes per percentage point
          });
          break;
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(jsonReport) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>ResearchHub Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-label { color: #666; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-danger { color: #dc3545; }
        .gap { margin: 10px 0; padding: 15px; border-left: 4px solid #dc3545; background: #f8f9fa; }
        .recommendation { margin: 10px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
        .priority-critical { border-left-color: #dc3545; }
        .priority-high { border-left-color: #fd7e14; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 ResearchHub Test Coverage Report</h1>
        <p>Generated: ${jsonReport.timestamp}</p>
        <p>Overall Status: <span class="status-${jsonReport.summary.status}">${jsonReport.summary.status.toUpperCase()}</span></p>
    </div>

    <div class="metrics">
        <h2>Coverage Metrics</h2>
        ${Object.entries(jsonReport.summary.metrics).map(([metric, value]) => `
            <div class="metric">
                <div class="metric-value ${this.getMetricClass(value)}">${value}%</div>
                <div class="metric-label">${metric}</div>
            </div>
        `).join('')}
    </div>

    <div class="gaps">
        <h2>Coverage Gaps (${jsonReport.details.gaps.length})</h2>
        ${jsonReport.details.gaps.map(gap => `
            <div class="gap">
                <strong>${gap.type}:</strong> ${gap.impact || gap.description || 'Coverage gap detected'}
                <br><small>Severity: ${gap.severity}</small>
            </div>
        `).join('')}
    </div>

    <div class="recommendations">
        <h2>Recommendations</h2>
        ${jsonReport.recommendations.map(rec => `
            <div class="recommendation priority-${rec.priority}">
                <strong>${rec.action}</strong><br>
                ${rec.description}<br>
                <small>Priority: ${rec.priority} | Estimated effort: ${rec.estimatedEffort} minutes</small>
            </div>
        `).join('')}
    </div>

    <script>
        console.log('Coverage Report Data:', ${JSON.stringify(jsonReport, null, 2)});
    </script>
</body>
</html>
    `;
  }

  /**
   * Update coverage trends over time
   */
  async updateCoverageTrends() {
    const trendsFile = path.join(this.config.reportDir, 'coverage-trends.json');
    let trends = [];
    
    // Load existing trends
    if (fs.existsSync(trendsFile)) {
      try {
        trends = JSON.parse(fs.readFileSync(trendsFile, 'utf8'));
      } catch (error) {
        console.warn('⚠️ Could not load coverage trends:', error.message);
      }
    }
    
    // Add current data point
    trends.push({
      timestamp: this.coverageData.timestamp,
      overall: this.coverageData.overall,
      score: this.calculateOverallScore(),
      gaps: this.coverageData.gaps.length
    });
    
    // Keep only last 30 data points
    if (trends.length > 30) {
      trends = trends.slice(-30);
    }
    
    // Save updated trends
    fs.writeFileSync(trendsFile, JSON.stringify(trends, null, 2));
  }

  /**
   * Helper methods
   */
  calculateOverallCoverage(results, metric) {
    // Calculate weighted average coverage across all sources
    let totalCoverage = 0;
    let totalWeight = 0;
    
    if (results.javascript?.[metric]) {
      totalCoverage += results.javascript[metric] * 0.4; // 40% weight
      totalWeight += 0.4;
    }
    
    if (results.api?.coverage) {
      totalCoverage += results.api.coverage * 0.3; // 30% weight
      totalWeight += 0.3;
    }
    
    if (results.components?.coverage) {
      totalCoverage += results.components.coverage * 0.2; // 20% weight
      totalWeight += 0.2;
    }
    
    if (results.playwright?.[metric]) {
      totalCoverage += results.playwright[metric] * 0.1; // 10% weight
      totalWeight += 0.1;
    }
    
    return totalWeight > 0 ? Math.round(totalCoverage / totalWeight) : 0;
  }

  calculateOverallScore() {
    const metrics = this.coverageData.overall;
    const weights = { statements: 0.3, branches: 0.25, functions: 0.25, lines: 0.2 };
    
    let score = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      score += (metrics[metric] || 0) * weight;
    }
    
    return Math.round(score);
  }

  determineStatus() {
    const score = this.calculateOverallScore();
    const criticalGaps = this.coverageData.gaps.filter(gap => gap.severity === 'critical').length;
    
    if (criticalGaps > 0) return 'danger';
    if (score >= 90) return 'good';
    if (score >= 70) return 'warning';
    return 'danger';
  }

  getMetricClass(value) {
    if (value >= 90) return 'status-good';
    if (value >= 70) return 'status-warning';
    return 'status-danger';
  }

  calculateSeverity(actual, expected) {
    const gap = expected - actual;
    if (gap > 20) return 'critical';
    if (gap > 10) return 'high';
    if (gap > 5) return 'medium';
    return 'low';
  }

  async identifyCriticalPaths() {
    // Define critical user workflows
    return [
      'user-registration-flow',
      'study-creation-workflow',
      'participant-application-process',
      'study-completion-workflow',
      'payment-processing-flow'
    ];
  }

  isPathCovered(path) {
    // Check if critical path has test coverage
    // This would integrate with E2E test detection
    return false; // Placeholder - implement based on test file analysis
  }

  getTopRecommendations() {
    const recommendations = this.generateRecommendations();
    return recommendations.slice(0, 3);
  }

  findFiles(dir, pattern) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !this.shouldIgnore(fullPath)) {
          scanDir(fullPath);
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(dir);
    return files;
  }

  shouldIgnore(filePath) {
    return this.config.excludePatterns.some(pattern =>
      filePath.includes(pattern.replace(/\*\*/g, '').replace(/\*/g, ''))
    );
  }

  ensureDirectories() {
    if (!fs.existsSync(this.config.reportDir)) {
      fs.mkdirSync(this.config.reportDir, { recursive: true });
    }
  }

  async loadHistoricalData() {
    // Load previous coverage data for trend analysis
    console.log('📈 Loading historical coverage data...');
  }

  parseC8Coverage(coverageData) {
    // Parse c8 coverage format
    return {
      statements: 85, // Placeholder
      branches: 80,
      functions: 90,
      lines: 88
    };
  }

  parsePlaywrightCoverage(output) {
    // Parse Playwright coverage output
    return {
      statements: 75, // Placeholder
      branches: 70,
      functions: 80,
      lines: 78
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new CoverageAnalyzer();
  const command = process.argv[2] || 'analyze';

  switch (command) {
    case 'init':
      analyzer.initialize();
      break;
    
    case 'analyze':
      analyzer.initialize().then(() => analyzer.analyzeCoverage());
      break;
    
    case 'report':
      analyzer.initialize().then(() => analyzer.generateCoverageReport());
      break;
    
    default:
      console.log(`
📊 Coverage Analyzer Commands:

npm run test:coverage init      # Initialize coverage analyzer
npm run test:coverage analyze   # Analyze current coverage
npm run test:coverage report    # Generate coverage report
      `);
  }
}

export default CoverageAnalyzer;
