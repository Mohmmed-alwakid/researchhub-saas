/**
 * Test Reporting and Analytics System for ResearchHub
 * Comprehensive test result analysis, reporting, and dashboard generation
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { 
  TestRun, 
  TestResult, 
  TestSummary, 
  TestRunnerStats 
} from './AdvancedTestRunner';

export interface TestReport {
  id: string;
  title: string;
  generatedAt: Date;
  testRun: TestRun;
  analytics: TestAnalytics;
  recommendations: TestRecommendation[];
  dashboard: TestDashboard;
}

export interface TestAnalytics {
  performance: PerformanceAnalytics;
  reliability: ReliabilityAnalytics;
  coverage: CoverageAnalytics;
  trends: TrendAnalytics;
}

export interface PerformanceAnalytics {
  averageTestDuration: number;
  slowestTests: TestResult[];
  fastestTests: TestResult[];
  performanceDistribution: PerformanceDistribution;
  bottlenecks: string[];
}

export interface ReliabilityAnalytics {
  flakyTests: TestResult[];
  successRate: number;
  failurePatterns: FailurePattern[];
  mostReliableTests: TestResult[];
  errorCategories: Record<string, number>;
}

export interface CoverageAnalytics {
  testTypeDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  tagCoverage: Record<string, number>;
  uncoveredAreas: string[];
}

export interface TrendAnalytics {
  historicalSuccessRate: number[];
  performanceTrend: number[];
  testCountTrend: number[];
  failureReasons: Record<string, number>;
}

export interface TestRecommendation {
  type: 'performance' | 'reliability' | 'coverage' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface TestDashboard {
  summary: DashboardSummary;
  charts: DashboardChart[];
  metrics: DashboardMetric[];
  alerts: DashboardAlert[];
}

export interface DashboardSummary {
  totalTests: number;
  passRate: number;
  avgDuration: number;
  criticalFailures: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface DashboardChart {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: unknown[];
  config: Record<string, unknown>;
}

export interface DashboardMetric {
  name: string;
  value: number | string;
  unit?: string;
  trend?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface DashboardAlert {
  level: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

export interface PerformanceDistribution {
  fast: number; // < 1s
  normal: number; // 1-5s
  slow: number; // 5-15s
  verySlow: number; // > 15s
}

export interface FailurePattern {
  pattern: string;
  count: number;
  tests: string[];
  category: string;
}

/**
 * Test Report Generator
 */
export class TestReportGenerator {
  private outputDir: string;

  constructor(outputDir: string = 'testing/reports') {
    this.outputDir = outputDir;
  }

  /**
   * Generate comprehensive test report
   */
  public async generateReport(testRun: TestRun): Promise<TestReport> {
    const report: TestReport = {
      id: `report_${testRun.id}`,
      title: `Test Report - ${testRun.suiteId}`,
      generatedAt: new Date(),
      testRun,
      analytics: await this.analyzeTestResults(testRun),
      recommendations: await this.generateRecommendations(testRun),
      dashboard: await this.generateDashboard(testRun)
    };

    return report;
  }

  /**
   * Save report to files (JSON, HTML, CSV)
   */
  public async saveReport(report: TestReport, formats: ('json' | 'html' | 'csv')[] = ['json', 'html']): Promise<string[]> {
    await this.ensureOutputDir();

    const savedFiles: string[] = [];

    for (const format of formats) {
      let content: string;
      let extension: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(report, null, 2);
          extension = 'json';
          break;
        case 'html':
          content = await this.generateHTMLReport(report);
          extension = 'html';
          break;
        case 'csv':
          content = await this.generateCSVReport(report);
          extension = 'csv';
          break;
      }

      const filename = `test-report-${report.testRun.suiteId}-${Date.now()}.${extension}`;
      const filepath = join(this.outputDir, filename);

      await writeFile(filepath, content, 'utf-8');
      savedFiles.push(filepath);
    }

    return savedFiles;
  }

  /**
   * Generate live dashboard HTML
   */
  public async generateLiveDashboard(testRuns: TestRun[]): Promise<string> {
    const overallStats = this.calculateOverallStats(testRuns);
    const recentRuns = testRuns.slice(-10); // Last 10 runs

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResearchHub Test Dashboard</title>
    <style>
        ${this.getDashboardCSS()}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <header class="dashboard-header">
        <h1>🧪 ResearchHub Test Dashboard</h1>
        <div class="last-updated">Last updated: ${new Date().toLocaleString()}</div>
    </header>

    <main class="dashboard-main">
        <section class="summary-cards">
            <div class="card success">
                <h3>Success Rate</h3>
                <div class="metric">${overallStats.averageSuccessRate.toFixed(1)}%</div>
                <div class="trend ${overallStats.trend}">
                    ${overallStats.trend === 'improving' ? '📈' : overallStats.trend === 'declining' ? '📉' : '➡️'}
                    ${overallStats.trend}
                </div>
            </div>
            
            <div class="card duration">
                <h3>Avg Duration</h3>
                <div class="metric">${(overallStats.averageDuration / 1000).toFixed(1)}s</div>
                <div class="subtext">${overallStats.totalTests} tests</div>
            </div>
            
            <div class="card failures">
                <h3>Critical Failures</h3>
                <div class="metric">${overallStats.criticalFailures}</div>
                <div class="subtext">Needs attention</div>
            </div>
            
            <div class="card runs">
                <h3>Total Runs</h3>
                <div class="metric">${overallStats.totalRuns}</div>
                <div class="subtext">This period</div>
            </div>
        </section>

        <section class="charts">
            <div class="chart-container">
                <canvas id="successRateChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="durationChart"></canvas>
            </div>
        </section>

        <section class="recent-runs">
            <h2>Recent Test Runs</h2>
            <table class="runs-table">
                <thead>
                    <tr>
                        <th>Suite</th>
                        <th>Status</th>
                        <th>Success Rate</th>
                        <th>Duration</th>
                        <th>Started</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentRuns.map(run => `
                        <tr class="run-row ${run.status}">
                            <td>${run.suiteId}</td>
                            <td>
                                <span class="status-badge ${run.status}">
                                    ${run.status === 'completed' ? '✅' : run.status === 'failed' ? '❌' : '⏳'}
                                    ${run.status}
                                </span>
                            </td>
                            <td>${run.summary.successRate.toFixed(1)}%</td>
                            <td>${(run.duration || 0 / 1000).toFixed(1)}s</td>
                            <td>${run.startTime.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>
    </main>

    <script>
        ${this.getDashboardJS(recentRuns)}
    </script>
</body>
</html>`;
  }

  private async analyzeTestResults(testRun: TestRun): Promise<TestAnalytics> {
    const results = testRun.results;
    
    // Performance analysis
    const durations = results.map(r => r.duration || 0);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const sortedByDuration = [...results].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    
    const performanceDistribution: PerformanceDistribution = {
      fast: results.filter(r => (r.duration || 0) < 1000).length,
      normal: results.filter(r => (r.duration || 0) >= 1000 && (r.duration || 0) < 5000).length,
      slow: results.filter(r => (r.duration || 0) >= 5000 && (r.duration || 0) < 15000).length,
      verySlow: results.filter(r => (r.duration || 0) >= 15000).length
    };

    // Reliability analysis
    const failedResults = results.filter(r => r.status === 'failed');
    const errorCategories: Record<string, number> = {};
    
    failedResults.forEach(result => {
      if (result.error) {
        const errorType = result.error.name || 'Unknown';
        errorCategories[errorType] = (errorCategories[errorType] || 0) + 1;
      }
    });

    // Coverage analysis
    const testTypeDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    const tagCoverage: Record<string, number> = {};

    results.forEach(result => {
      // Test type distribution
      const type = result.config.type;
      testTypeDistribution[type] = (testTypeDistribution[type] || 0) + 1;
      
      // Priority distribution
      const priority = result.config.priority;
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
      
      // Tag coverage
      result.config.tags.forEach(tag => {
        tagCoverage[tag] = (tagCoverage[tag] || 0) + 1;
      });
    });

    return {
      performance: {
        averageTestDuration: averageDuration,
        slowestTests: sortedByDuration.slice(0, 5),
        fastestTests: sortedByDuration.slice(-5).reverse(),
        performanceDistribution,
        bottlenecks: this.identifyBottlenecks(results)
      },
      reliability: {
        flakyTests: this.identifyFlakyTests(results),
        successRate: testRun.summary.successRate,
        failurePatterns: this.analyzeFailurePatterns(results),
        mostReliableTests: results.filter(r => r.status === 'passed').slice(0, 5),
        errorCategories
      },
      coverage: {
        testTypeDistribution,
        priorityDistribution,
        tagCoverage,
        uncoveredAreas: this.identifyUncoveredAreas(results)
      },
      trends: {
        historicalSuccessRate: [testRun.summary.successRate], // Would be populated with historical data
        performanceTrend: [averageDuration],
        testCountTrend: [results.length],
        failureReasons: errorCategories
      }
    };
  }

  private async generateRecommendations(testRun: TestRun): Promise<TestRecommendation[]> {
    const recommendations: TestRecommendation[] = [];
    const results = testRun.results;
    const summary = testRun.summary;

    // Performance recommendations
    const slowTests = results.filter(r => (r.duration || 0) > 10000);
    if (slowTests.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Optimize Slow Tests',
        description: `${slowTests.length} tests are taking longer than 10 seconds to complete`,
        action: 'Review and optimize slow test implementations',
        impact: 'Reduced test execution time and faster feedback',
        effort: 'medium'
      });
    }

    // Reliability recommendations
    if (summary.successRate < 95) {
      recommendations.push({
        type: 'reliability',
        priority: 'critical',
        title: 'Improve Test Reliability',
        description: `Success rate is ${summary.successRate.toFixed(1)}%, below the 95% target`,
        action: 'Investigate and fix failing tests',
        impact: 'Higher confidence in test results',
        effort: 'high'
      });
    }

    // Coverage recommendations
    const criticalTests = results.filter(r => r.config.priority === 'critical');
    if (criticalTests.length < results.length * 0.2) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        title: 'Increase Critical Test Coverage',
        description: 'Less than 20% of tests are marked as critical priority',
        action: 'Review and mark more tests as critical for core functionality',
        impact: 'Better coverage of essential features',
        effort: 'low'
      });
    }

    return recommendations;
  }

  private async generateDashboard(testRun: TestRun): Promise<TestDashboard> {
    const results = testRun.results;
    const summary = testRun.summary;

    const alerts: DashboardAlert[] = [];
    
    if (summary.successRate < 90) {
      alerts.push({
        level: 'error',
        title: 'Low Success Rate',
        message: `Success rate is ${summary.successRate.toFixed(1)}%, which is below acceptable threshold`,
        timestamp: new Date()
      });
    }

    if (summary.failed > 5) {
      alerts.push({
        level: 'warning',
        title: 'Multiple Test Failures',
        message: `${summary.failed} tests failed in this run`,
        timestamp: new Date()
      });
    }

    return {
      summary: {
        totalTests: summary.total,
        passRate: summary.successRate,
        avgDuration: summary.duration / summary.total,
        criticalFailures: results.filter(r => r.status === 'failed' && r.config.priority === 'critical').length,
        trend: summary.successRate > 95 ? 'improving' : summary.successRate < 85 ? 'declining' : 'stable'
      },
      charts: [
        {
          type: 'pie',
          title: 'Test Results Distribution',
          data: [
            { label: 'Passed', value: summary.passed },
            { label: 'Failed', value: summary.failed },
            { label: 'Skipped', value: summary.skipped }
          ],
          config: { colors: ['#28a745', '#dc3545', '#ffc107'] }
        },
        {
          type: 'bar',
          title: 'Test Duration Distribution',
          data: results.map(r => ({ name: r.config.name, duration: r.duration || 0 })),
          config: {}
        }
      ],
      metrics: [
        {
          name: 'Success Rate',
          value: `${summary.successRate.toFixed(1)}%`,
          status: summary.successRate > 95 ? 'good' : summary.successRate > 85 ? 'warning' : 'critical'
        },
        {
          name: 'Total Tests',
          value: summary.total,
          status: 'good'
        },
        {
          name: 'Average Duration',
          value: (summary.duration / summary.total / 1000).toFixed(2),
          unit: 's',
          status: 'good'
        }
      ],
      alerts
    };
  }

  private async generateHTMLReport(report: TestReport): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        ${this.getReportCSS()}
    </style>
</head>
<body>
    <header>
        <h1>${report.title}</h1>
        <p>Generated: ${report.generatedAt.toLocaleString()}</p>
    </header>
    
    <main>
        <section class="summary">
            <h2>Test Summary</h2>
            <div class="summary-grid">
                <div class="metric">
                    <span class="label">Total Tests</span>
                    <span class="value">${report.testRun.summary.total}</span>
                </div>
                <div class="metric">
                    <span class="label">Passed</span>
                    <span class="value success">${report.testRun.summary.passed}</span>
                </div>
                <div class="metric">
                    <span class="label">Failed</span>
                    <span class="value failure">${report.testRun.summary.failed}</span>
                </div>
                <div class="metric">
                    <span class="label">Success Rate</span>
                    <span class="value">${report.testRun.summary.successRate.toFixed(1)}%</span>
                </div>
            </div>
        </section>
        
        <section class="recommendations">
            <h2>Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                </div>
            `).join('')}
        </section>
        
        <section class="test-results">
            <h2>Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.testRun.results.map(result => `
                        <tr class="${result.status}">
                            <td>${result.config.name}</td>
                            <td>${result.config.type}</td>
                            <td><span class="status-badge ${result.status}">${result.status}</span></td>
                            <td>${((result.duration || 0) / 1000).toFixed(2)}s</td>
                            <td>${result.config.priority}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>
    </main>
</body>
</html>`;
  }

  private async generateCSVReport(report: TestReport): Promise<string> {
    const headers = ['Test Name', 'Type', 'Status', 'Duration (ms)', 'Priority', 'Tags', 'Error Message'];
    const rows = report.testRun.results.map(result => [
      result.config.name,
      result.config.type,
      result.status,
      (result.duration || 0).toString(),
      result.config.priority,
      result.config.tags.join(';'),
      result.error?.message || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  private identifyBottlenecks(results: TestResult[]): string[] {
    const bottlenecks: string[] = [];
    
    // Identify tests taking more than 15 seconds
    const slowTests = results.filter(r => (r.duration || 0) > 15000);
    if (slowTests.length > 0) {
      bottlenecks.push(`${slowTests.length} tests taking >15s`);
    }
    
    // Identify high failure rate categories
    const failedTests = results.filter(r => r.status === 'failed');
    const e2eFailures = failedTests.filter(r => r.config.type === 'e2e');
    if (e2eFailures.length > failedTests.length * 0.5) {
      bottlenecks.push('High E2E test failure rate');
    }
    
    return bottlenecks;
  }

  private identifyFlakyTests(results: TestResult[]): TestResult[] {
    // For now, identify timeout tests as potentially flaky
    return results.filter(r => r.status === 'timeout');
  }

  private analyzeFailurePatterns(results: TestResult[]): FailurePattern[] {
    const patterns: Record<string, FailurePattern> = {};
    
    results.filter(r => r.status === 'failed').forEach(result => {
      const errorMessage = result.error?.message || 'Unknown error';
      const category = this.categorizeError(errorMessage);
      
      if (!patterns[category]) {
        patterns[category] = {
          pattern: category,
          count: 0,
          tests: [],
          category
        };
      }
      
      patterns[category].count++;
      patterns[category].tests.push(result.config.name);
    });
    
    return Object.values(patterns);
  }

  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('timeout')) return 'Timeout';
    if (errorMessage.includes('network') || errorMessage.includes('connection')) return 'Network';
    if (errorMessage.includes('element') || errorMessage.includes('selector')) return 'UI Element';
    if (errorMessage.includes('assertion') || errorMessage.includes('expect')) return 'Assertion';
    return 'Other';
  }

  private identifyUncoveredAreas(results: TestResult[]): string[] {
    const uncovered: string[] = [];
    
    // Check for missing test types
    const testTypes = new Set(results.map(r => r.config.type));
    const requiredTypes: (typeof results[0]['config']['type'])[] = ['unit', 'integration', 'e2e', 'api'];
    
    requiredTypes.forEach(type => {
      if (!testTypes.has(type)) {
        uncovered.push(`Missing ${type} tests`);
      }
    });
    
    return uncovered;
  }

  private calculateOverallStats(testRuns: TestRun[]): {
    totalRuns: number;
    averageSuccessRate: number;
    averageDuration: number;
    totalTests: number;
    criticalFailures: number;
    trend: 'improving' | 'stable' | 'declining';
  } {
    if (testRuns.length === 0) {
      return {
        totalRuns: 0,
        averageSuccessRate: 0,
        averageDuration: 0,
        totalTests: 0,
        criticalFailures: 0,
        trend: 'stable'
      };
    }

    const completedRuns = testRuns.filter(run => run.status === 'completed');
    const totalTests = completedRuns.reduce((sum, run) => sum + run.summary.total, 0);
    const averageSuccessRate = completedRuns.reduce((sum, run) => sum + run.summary.successRate, 0) / completedRuns.length;
    const averageDuration = completedRuns.reduce((sum, run) => sum + (run.duration || 0), 0) / completedRuns.length;
    
    const criticalFailures = completedRuns.reduce((sum, run) => {
      return sum + run.results.filter(r => r.status === 'failed' && r.config.priority === 'critical').length;
    }, 0);

    // Determine trend (simplified)
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (completedRuns.length >= 2) {
      const recent = completedRuns.slice(-5);
      const older = completedRuns.slice(-10, -5);
      
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.reduce((sum, run) => sum + run.summary.successRate, 0) / recent.length;
        const olderAvg = older.reduce((sum, run) => sum + run.summary.successRate, 0) / older.length;
        
        if (recentAvg > olderAvg + 2) trend = 'improving';
        else if (recentAvg < olderAvg - 2) trend = 'declining';
      }
    }

    return {
      totalRuns: testRuns.length,
      averageSuccessRate,
      averageDuration,
      totalTests,
      criticalFailures,
      trend
    };
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private getReportCSS(): string {
    return `
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        margin: 0; 
        padding: 20px; 
        background: #f5f5f5; 
      }
      header { 
        background: white; 
        padding: 20px; 
        border-radius: 8px; 
        margin-bottom: 20px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      }
      .summary-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
        gap: 15px; 
        margin: 20px 0; 
      }
      .metric { 
        background: white; 
        padding: 15px; 
        border-radius: 8px; 
        text-align: center; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      }
      .metric .label { 
        display: block; 
        font-size: 12px; 
        color: #666; 
        margin-bottom: 5px; 
      }
      .metric .value { 
        display: block; 
        font-size: 24px; 
        font-weight: bold; 
      }
      .success { color: #28a745; }
      .failure { color: #dc3545; }
      .recommendation { 
        background: white; 
        margin: 10px 0; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #007bff; 
      }
      .recommendation.high { border-left-color: #dc3545; }
      .recommendation.critical { border-left-color: #dc3545; background: #fff5f5; }
      table { 
        width: 100%; 
        background: white; 
        border-collapse: collapse; 
        border-radius: 8px; 
        overflow: hidden; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      }
      th, td { 
        padding: 12px; 
        text-align: left; 
        border-bottom: 1px solid #eee; 
      }
      th { 
        background: #f8f9fa; 
        font-weight: 600; 
      }
      .status-badge { 
        padding: 4px 8px; 
        border-radius: 12px; 
        font-size: 11px; 
        font-weight: bold; 
        text-transform: uppercase; 
      }
      .status-badge.passed { background: #d4edda; color: #155724; }
      .status-badge.failed { background: #f8d7da; color: #721c24; }
      .status-badge.skipped { background: #fff3cd; color: #856404; }
    `;
  }

  private getDashboardCSS(): string {
    return `
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        margin: 0; 
        background: #f5f7fa; 
        color: #333; 
      }
      .dashboard-header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
        padding: 20px; 
        text-align: center; 
      }
      .dashboard-header h1 { 
        margin: 0; 
        font-size: 2rem; 
      }
      .last-updated { 
        opacity: 0.8; 
        font-size: 0.9rem; 
      }
      .dashboard-main { 
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 20px; 
      }
      .summary-cards { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
        gap: 20px; 
        margin-bottom: 30px; 
      }
      .card { 
        background: white; 
        padding: 20px; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        transition: transform 0.2s; 
      }
      .card:hover { 
        transform: translateY(-2px); 
      }
      .card h3 { 
        margin: 0 0 10px 0; 
        color: #666; 
        font-size: 0.9rem; 
        text-transform: uppercase; 
        letter-spacing: 0.5px; 
      }
      .card .metric { 
        font-size: 2rem; 
        font-weight: bold; 
        margin: 10px 0; 
      }
      .card.success .metric { color: #28a745; }
      .card.duration .metric { color: #17a2b8; }
      .card.failures .metric { color: #dc3545; }
      .card.runs .metric { color: #6f42c1; }
      .trend { 
        font-size: 0.8rem; 
        color: #666; 
        display: flex; 
        align-items: center; 
        gap: 5px; 
      }
      .charts { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 20px; 
        margin-bottom: 30px; 
      }
      .chart-container { 
        background: white; 
        padding: 20px; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      }
      .recent-runs { 
        background: white; 
        padding: 20px; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      }
      .runs-table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 15px; 
      }
      .runs-table th, 
      .runs-table td { 
        padding: 12px; 
        text-align: left; 
        border-bottom: 1px solid #eee; 
      }
      .runs-table th { 
        background: #f8f9fa; 
        font-weight: 600; 
        color: #495057; 
      }
      .status-badge { 
        padding: 4px 12px; 
        border-radius: 20px; 
        font-size: 0.8rem; 
        font-weight: 500; 
        display: inline-flex; 
        align-items: center; 
        gap: 5px; 
      }
      .status-badge.completed { background: #d4edda; color: #155724; }
      .status-badge.failed { background: #f8d7da; color: #721c24; }
      .status-badge.running { background: #fff3cd; color: #856404; }
      @media (max-width: 768px) {
        .summary-cards { grid-template-columns: 1fr; }
        .charts { grid-template-columns: 1fr; }
      }
    `;
  }

  private getDashboardJS(recentRuns: TestRun[]): string {
    return `
      // Success Rate Chart
      const successCtx = document.getElementById('successRateChart').getContext('2d');
      new Chart(successCtx, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(recentRuns.map((_, i) => `Run ${i + 1}`))},
          datasets: [{
            label: 'Success Rate',
            data: ${JSON.stringify(recentRuns.map(run => run.summary.successRate))},
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Success Rate Trend'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });

      // Duration Chart
      const durationCtx = document.getElementById('durationChart').getContext('2d');
      new Chart(durationCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(recentRuns.map((_, i) => `Run ${i + 1}`))},
          datasets: [{
            label: 'Duration (seconds)',
            data: ${JSON.stringify(recentRuns.map(run => (run.duration || 0) / 1000))},
            backgroundColor: '#17a2b8',
            borderColor: '#138496',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Test Run Duration'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value + 's';
                }
              }
            }
          }
        }
      });

      // Auto refresh every 30 seconds
      setTimeout(() => {
        location.reload();
      }, 30000);
    `;
  }
}

// Global report generator instance
export const globalReportGenerator = new TestReportGenerator();
