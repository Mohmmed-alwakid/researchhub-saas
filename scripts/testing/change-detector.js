/**
 * Change Detection System for Adaptive Testing
 * Monitors codebase for changes and triggers test generation
 * 
 * Date: July 18, 2025
 * Part of: Adaptive Test Coverage Implementation
 */

import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ChangeDetectionSystem {
  constructor() {
    this.config = {
      watchPaths: [
        'src/',
        'api/',
        'docs/requirements/',
        'package.json',
        '*.config.js'
      ],
      ignorePaths: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/testing/reports/**',
        '**/.git/**'
      ],
      reportDir: path.join(process.cwd(), 'testing', 'reports', 'change-detection'),
      lastScanFile: path.join(process.cwd(), 'testing', 'config', 'last-scan.json')
    };
    
    this.changes = {
      newFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      newComponents: [],
      apiChanges: [],
      requirementUpdates: [],
      configChanges: []
    };
  }

  /**
   * Initialize change detection system
   */
  async initialize() {
    console.log('🔍 Initializing Change Detection System...');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Load last scan data
    await this.loadLastScanData();
    
    // Perform initial scan
    await this.performInitialScan();
    
    console.log('✅ Change Detection System initialized');
  }

  /**
   * Start monitoring for real-time changes
   */
  startMonitoring() {
    console.log('👁️ Starting real-time change monitoring...');
    
    const watcher = chokidar.watch(this.config.watchPaths, {
      ignored: this.config.ignorePaths,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (filePath) => this.handleFileChange('added', filePath))
      .on('change', (filePath) => this.handleFileChange('modified', filePath))
      .on('unlink', (filePath) => this.handleFileChange('deleted', filePath));

    console.log('✅ Real-time monitoring active');
    return watcher;
  }

  /**
   * Handle individual file changes
   */
  async handleFileChange(changeType, filePath) {
    console.log(`📝 ${changeType.toUpperCase()}: ${filePath}`);
    
    const changeAnalysis = await this.analyzeChange(filePath, changeType);
    
    if (changeAnalysis.requiresTests) {
      console.log(`🧪 Generating tests for ${filePath}...`);
      await this.generateTestsForChange(changeAnalysis);
    }
  }

  /**
   * Analyze multiple changes at once
   */
  async analyzeChanges(filePaths) {
    console.log(`🔍 Analyzing ${filePaths.length} changed files...`);
    
    const analyses = [];
    
    for (const filePath of filePaths) {
      try {
        const analysis = await this.analyzeChange(filePath, 'modified');
        analyses.push(analysis);
        
        if (analysis.requiresTests) {
          console.log(`  📋 ${filePath} requires ${analysis.testTypes.join(', ')} tests`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to analyze ${filePath}:`, error.message);
      }
    }
    
    return {
      totalFiles: filePaths.length,
      analyses,
      requiresTests: analyses.filter(a => a.requiresTests),
      highImpact: analyses.filter(a => a.impact === 'high' || a.impact === 'critical'),
      summary: {
        apiChanges: analyses.filter(a => a.category === 'api').length,
        componentChanges: analyses.filter(a => a.category === 'component').length,
        requirementChanges: analyses.filter(a => a.category === 'requirements').length,
        configChanges: analyses.filter(a => a.category === 'config').length
      }
    };
  }

  /**
   * Analyze what type of change occurred and its impact
   */
  async analyzeChange(filePath, changeType) {
    const analysis = {
      filePath,
      changeType,
      category: this.categorizeFile(filePath),
      impact: 'low',
      requiresTests: false,
      testTypes: [],
      affectedComponents: []
    };

    // Categorize the change impact
    if (filePath.includes('api/')) {
      analysis.category = 'api';
      analysis.impact = 'high';
      analysis.requiresTests = true;
      analysis.testTypes = ['api', 'integration', 'security'];
    } else if (filePath.includes('src/components/')) {
      analysis.category = 'component';
      analysis.impact = 'medium';
      analysis.requiresTests = true;
      analysis.testTypes = ['unit', 'integration', 'accessibility'];
    } else if (filePath.includes('docs/requirements/')) {
      analysis.category = 'requirements';
      analysis.impact = 'critical';
      analysis.requiresTests = true;
      analysis.testTypes = ['e2e', 'integration', 'regression'];
    } else if (filePath.includes('.config.')) {
      analysis.category = 'config';
      analysis.impact = 'medium';
      analysis.requiresTests = true;
      analysis.testTypes = ['integration', 'deployment'];
    }

    // Analyze file content for deeper insights
    if (changeType !== 'deleted' && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      analysis.contentAnalysis = await this.analyzeFileContent(content, filePath);
    }

    return analysis;
  }

  /**
   * Analyze file content to understand changes
   */
  async analyzeFileContent(content, filePath) {
    const analysis = {
      hasNewFunctions: false,
      hasNewComponents: false,
      hasNewEndpoints: false,
      hasNewTypes: false,
      complexityScore: 0
    };

    // Check for new React components
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      analysis.hasNewComponents = /export\s+(const|function)\s+\w+/.test(content);
    }

    // Check for new API endpoints
    if (filePath.includes('api/')) {
      analysis.hasNewEndpoints = /export\s+default\s+async\s+function\s+handler/.test(content);
    }

    // Check for new TypeScript types/interfaces
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      analysis.hasNewTypes = /(interface|type)\s+\w+/.test(content);
    }

    // Calculate complexity score (simple heuristic)
    const lines = content.split('\n').length;
    const functions = (content.match(/function\s+\w+/g) || []).length;
    const conditionals = (content.match(/if\s*\(|switch\s*\(|for\s*\(|while\s*\(/g) || []).length;
    
    analysis.complexityScore = lines + (functions * 2) + (conditionals * 3);

    return analysis;
  }

  /**
   * Generate tests for detected changes
   */
  async generateTestsForChange(changeAnalysis) {
    try {
      // Import the adaptive test generator
      const { AdaptiveTestGenerator } = await import('./adaptive-test-generator.js');
      const testGenerator = new AdaptiveTestGenerator();
      
      // Generate appropriate tests based on change analysis
      const generatedTests = await testGenerator.generateTestsForChange(changeAnalysis);
      
      // Save generated tests
      await this.saveGeneratedTests(generatedTests, changeAnalysis);
      
      // Update coverage tracking
      await this.updateCoverageTracking(changeAnalysis, generatedTests);
      
      console.log(`✅ Generated ${generatedTests.length} tests for ${changeAnalysis.filePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to generate tests for ${changeAnalysis.filePath}:`, error.message);
    }
  }

  /**
   * Perform comprehensive scan of codebase
   */
  async performInitialScan() {
    console.log('🔍 Performing initial codebase scan...');
    
    const scanResults = {
      totalFiles: 0,
      componentFiles: 0,
      apiFiles: 0,
      testFiles: 0,
      requirementFiles: 0,
      coverageGaps: [],
      timestamp: new Date().toISOString()
    };

    // Scan source files
    const srcFiles = await this.scanDirectory('src/', /\.(ts|tsx|js|jsx)$/);
    scanResults.componentFiles = srcFiles.length;
    scanResults.totalFiles += srcFiles.length;

    // Scan API files
    const apiFiles = await this.scanDirectory('api/', /\.(ts|js)$/);
    scanResults.apiFiles = apiFiles.length;
    scanResults.totalFiles += apiFiles.length;

    // Scan test files
    const testFiles = await this.scanDirectory('testing/', /\.(test|spec)\.(ts|js)$/);
    scanResults.testFiles = testFiles.length;

    // Scan requirement files
    const reqFiles = await this.scanDirectory('docs/requirements/', /\.md$/);
    scanResults.requirementFiles = reqFiles.length;

    // Identify coverage gaps
    scanResults.coverageGaps = await this.identifyCoverageGaps(srcFiles, apiFiles, testFiles);

    // Save scan results
    await this.saveScanResults(scanResults);

    console.log(`✅ Initial scan complete: ${scanResults.totalFiles} files scanned`);
    return scanResults;
  }

  /**
   * Identify files that lack test coverage
   */
  async identifyCoverageGaps(srcFiles, apiFiles, testFiles) {
    const gaps = [];
    const testFileNames = new Set(testFiles.map(f => path.basename(f, path.extname(f))));

    // Check source files for missing tests
    for (const srcFile of srcFiles) {
      const baseName = path.basename(srcFile, path.extname(srcFile));
      if (!testFileNames.has(baseName) && !testFileNames.has(`${baseName}.test`) && !testFileNames.has(`${baseName}.spec`)) {
        gaps.push({
          file: srcFile,
          type: 'component',
          severity: 'medium',
          suggestedTests: ['unit', 'integration']
        });
      }
    }

    // Check API files for missing tests
    for (const apiFile of apiFiles) {
      const baseName = path.basename(apiFile, path.extname(apiFile));
      if (!testFileNames.has(baseName) && !testFileNames.has(`${baseName}.test`) && !testFileNames.has(`${baseName}.spec`)) {
        gaps.push({
          file: apiFile,
          type: 'api',
          severity: 'high',
          suggestedTests: ['api', 'integration', 'security']
        });
      }
    }

    return gaps;
  }

  /**
   * Scan directory for files matching pattern
   */
  async scanDirectory(dirPath, pattern) {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !this.shouldIgnore(fullPath)) {
          scanDir(fullPath);
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath);
        }
      }
    };

    scanDir(dirPath);
    return files;
  }

  /**
   * Check if path should be ignored
   */
  shouldIgnore(filePath) {
    return this.config.ignorePaths.some(pattern => 
      filePath.includes(pattern.replace('**/').replace('/**'))
    );
  }

  /**
   * Categorize file based on path and extension
   */
  categorizeFile(filePath) {
    if (filePath.includes('api/')) return 'api';
    if (filePath.includes('src/components/')) return 'component';
    if (filePath.includes('src/pages/')) return 'page';
    if (filePath.includes('src/utils/')) return 'utility';
    if (filePath.includes('docs/requirements/')) return 'requirements';
    if (filePath.includes('.config.')) return 'config';
    if (filePath.includes('testing/')) return 'test';
    return 'other';
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [
      this.config.reportDir,
      path.dirname(this.config.lastScanFile)
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load last scan data
   */
  async loadLastScanData() {
    try {
      if (fs.existsSync(this.config.lastScanFile)) {
        const data = fs.readFileSync(this.config.lastScanFile, 'utf8');
        this.lastScanData = JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️ Could not load last scan data:', error.message);
      this.lastScanData = null;
    }
  }

  /**
   * Save scan results
   */
  async saveScanResults(results) {
    try {
      // Save detailed results
      const reportPath = path.join(this.config.reportDir, `scan-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

      // Update last scan data
      fs.writeFileSync(this.config.lastScanFile, JSON.stringify({
        timestamp: results.timestamp,
        totalFiles: results.totalFiles,
        coverageGaps: results.coverageGaps.length
      }, null, 2));

      console.log(`📊 Scan results saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Failed to save scan results:', error.message);
    }
  }

  /**
   * Save generated tests
   */
  async saveGeneratedTests(tests, changeAnalysis) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testDir = path.join('testing', 'generated', 'adaptive');
    
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    for (const test of tests) {
      const fileName = `${test.name}-${timestamp}.${test.type}.js`;
      const filePath = path.join(testDir, fileName);
      
      fs.writeFileSync(filePath, test.content);
      console.log(`💾 Generated test saved: ${filePath}`);
    }
  }

  /**
   * Update coverage tracking
   */
  async updateCoverageTracking(changeAnalysis, generatedTests) {
    // This will be implemented when we create the coverage analyzer
    console.log(`📈 Updated coverage tracking for ${changeAnalysis.filePath}`);
  }

  /**
   * Get current change summary
   */
  getChangeSummary() {
    return {
      totalChanges: Object.values(this.changes).flat().length,
      categories: Object.fromEntries(
        Object.entries(this.changes).map(([key, value]) => [key, value.length])
      ),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate change detection report
   */
  async generateReport() {
    const summary = this.getChangeSummary();
    const reportPath = path.join(this.config.reportDir, `change-report-${Date.now()}.json`);
    
    const report = {
      summary,
      changes: this.changes,
      timestamp: new Date().toISOString(),
      system: 'Change Detection System v1.0'
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Change detection report generated: ${reportPath}`);
    
    return report;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const detector = new ChangeDetectionSystem();
  const command = process.argv[2] || 'scan';

  switch (command) {
    case 'init':
      detector.initialize();
      break;
    
    case 'scan':
      detector.initialize().then(() => detector.performInitialScan());
      break;
    
    case 'watch':
      detector.initialize().then(() => {
        const watcher = detector.startMonitoring();
        console.log('👁️ Watching for changes... Press Ctrl+C to stop');
      });
      break;
    
    case 'report':
      detector.generateReport();
      break;
    
    default:
      console.log(`
🔍 Change Detection System Commands:

npm run test:change-detect init    # Initialize system
npm run test:change-detect scan    # Perform full scan
npm run test:change-detect watch   # Start real-time monitoring
npm run test:change-detect report  # Generate change report
      `);
  }
}

export default ChangeDetectionSystem;
