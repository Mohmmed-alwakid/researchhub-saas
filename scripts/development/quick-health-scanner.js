/**
 * 🔍 Quick Application Health Scanner
 * Simple analysis tool for immediate issue detection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class QuickHealthScanner {
  constructor() {
    this.issues = [];
    this.startTime = Date.now();
  }

  async scanApplication() {
    console.log('🔍 ResearchHub Quick Health Scan');
    console.log('=================================\n');

    try {
      await this.scanForErrors();
      await this.scanForBrokenLinks();
      await this.scanForUnusedCode();
      
      this.displayResults();
    } catch (error) {
      console.error('❌ Scan failed:', error.message);
    }
  }

  async scanForErrors() {
    console.log('🚨 Scanning for Application Errors...');
    
    // Check main.tsx for excessive console suppression
    await this.checkMainTsx();
    
    // Check for common React errors
    await this.checkReactErrors();
    
    // Check API files for missing error handling
    await this.checkAPIErrors();
    
    console.log(`   ✅ Error scan complete`);
  }

  async checkMainTsx() {
    const mainPath = path.join(projectRoot, 'src/main.tsx');
    if (fs.existsSync(mainPath)) {
      const content = fs.readFileSync(mainPath, 'utf8');
      
      // Count console suppressions
      const suppressions = (content.match(/console\.(error|warn|log)\s*=/g) || []).length;
      if (suppressions > 2) {
        this.issues.push({
          type: 'excessive-console-suppression',
          file: 'src/main.tsx',
          count: suppressions,
          severity: 'high',
          message: `${suppressions} console suppressions may hide real errors`,
          fix: 'Remove excessive console.error suppressions to reveal actual issues'
        });
      }

      // Check for React.StrictMode
      if (!content.includes('StrictMode')) {
        this.issues.push({
          type: 'missing-strict-mode',
          file: 'src/main.tsx',
          severity: 'medium',
          message: 'React.StrictMode not enabled - may miss development warnings',
          fix: 'Wrap App component with React.StrictMode'
        });
      }
    }
  }

  async checkReactErrors() {
    const srcPath = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcPath)) return;

    const files = this.getAllFiles(srcPath, ['.tsx', '.jsx']);
    let errorCount = 0;

    for (const file of files.slice(0, 20)) { // Limit for performance
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for useEffect missing dependencies
        const useEffects = [...content.matchAll(/useEffect\([^,]*,\s*\[(.*?)\]/gs)];
        for (const effect of useEffects) {
          if (effect[1].trim() === '') {
            errorCount++;
          }
        }

        // Check for missing error boundaries around routes
        if (content.includes('<Routes>') && !content.includes('ErrorBoundary')) {
          this.issues.push({
            type: 'missing-error-boundary',
            file: path.relative(projectRoot, file),
            severity: 'medium',
            message: 'Routes without error boundary may crash entire app',
            fix: 'Wrap Routes with ErrorBoundary component'
          });
        }

      } catch (err) {
        // Skip unreadable files
      }
    }

    if (errorCount > 0) {
      this.issues.push({
        type: 'missing-useeffect-deps',
        count: errorCount,
        severity: 'low',
        message: `${errorCount} useEffect hooks with empty dependency arrays`,
        fix: 'Review useEffect dependencies for potential bugs'
      });
    }
  }

  async checkAPIErrors() {
    const apiPath = path.join(projectRoot, 'api');
    if (!fs.existsSync(apiPath)) return;

    const apiFiles = this.getAllFiles(apiPath, ['.js']);
    
    for (const file of apiFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for missing try-catch in handlers
        if (content.includes('export default') && !content.includes('try {')) {
          this.issues.push({
            type: 'missing-api-error-handling',
            file: path.relative(projectRoot, file),
            severity: 'high',
            message: 'API handler without error handling may cause 500 errors',
            fix: 'Add try-catch blocks around API logic'
          });
        }

        // Check for missing status codes
        if (!content.includes('res.status(')) {
          this.issues.push({
            type: 'missing-status-codes',
            file: path.relative(projectRoot, file),
            severity: 'medium',
            message: 'API responses without explicit status codes',
            fix: 'Add res.status() calls for proper HTTP responses'
          });
        }

      } catch (err) {
        // Skip unreadable files
      }
    }
  }

  async scanForBrokenLinks() {
    console.log('🔗 Scanning for Broken Links...');
    
    // Check for common navigation issues
    await this.checkNavigationLinks();
    
    // Check for missing routes
    await this.checkMissingRoutes();
    
    console.log(`   ✅ Link scan complete`);
  }

  async checkNavigationLinks() {
    const srcPath = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcPath)) return;

    const files = this.getAllFiles(srcPath, ['.tsx', '.jsx']);
    const suspiciousLinks = [];

    for (const file of files.slice(0, 30)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find navigate() calls
        const navigates = [...content.matchAll(/navigate\(['"`]([^'"`]+)['"`]/g)];
        navigates.forEach(match => {
          suspiciousLinks.push({
            file: path.relative(projectRoot, file),
            link: match[1],
            type: 'navigate'
          });
        });

        // Find Link components
        const links = [...content.matchAll(/<Link\s+to=['"`]([^'"`]+)['"`]/g)];
        links.forEach(match => {
          suspiciousLinks.push({
            file: path.relative(projectRoot, file),
            link: match[1],
            type: 'Link'
          });
        });

      } catch (err) {
        // Skip unreadable files
      }
    }

    // Report common problematic patterns
    const commonIssues = suspiciousLinks.filter(link => 
      link.link.includes('/admin') || 
      link.link.includes('/dashboard') ||
      link.link.includes('/templates')
    );

    if (commonIssues.length > 0) {
      this.issues.push({
        type: 'potentially-broken-links',
        count: commonIssues.length,
        examples: commonIssues.slice(0, 3),
        severity: 'medium',
        message: `Found ${commonIssues.length} navigation links that may be broken`,
        fix: 'Verify all navigation routes exist and are properly configured'
      });
    }
  }

  async checkMissingRoutes() {
    // Simple check for obvious route mismatches
    const appPath = path.join(projectRoot, 'src/App.tsx');
    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf8');
      
      // Check for redirect routes
      const redirects = [...content.matchAll(/<Navigate\s+to=['"`]([^'"`]+)['"`]/g)];
      if (redirects.length > 3) {
        this.issues.push({
          type: 'excessive-redirects',
          count: redirects.length,
          examples: redirects.slice(0, 3).map(r => r[1]),
          severity: 'medium',
          message: `${redirects.length} redirect routes may indicate routing issues`,
          fix: 'Review and consolidate routing structure'
        });
      }
    }
  }

  async scanForUnusedCode() {
    console.log('🧹 Scanning for Unused Code...');
    
    await this.findObviousUnusedFiles();
    await this.findLargeFiles();
    
    console.log(`   ✅ Unused code scan complete`);
  }

  async findObviousUnusedFiles() {
    const srcPath = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcPath)) return;

    // Look for files with "test", "demo", "example" in name that aren't in proper test directories
    const allFiles = this.getAllFiles(srcPath, ['.tsx', '.ts', '.jsx', '.js']);
    const suspiciousFiles = allFiles.filter(file => {
      const basename = path.basename(file).toLowerCase();
      return (basename.includes('test') || 
              basename.includes('demo') || 
              basename.includes('example') ||
              basename.includes('temp') ||
              basename.includes('backup')) &&
              !file.includes('testing') &&
              !file.includes('__tests__');
    });

    if (suspiciousFiles.length > 0) {
      const totalSize = suspiciousFiles.reduce((sum, file) => {
        try {
          return sum + fs.statSync(file).size;
        } catch {
          return sum;
        }
      }, 0);

      this.issues.push({
        type: 'suspicious-files',
        count: suspiciousFiles.length,
        size: Math.round(totalSize / 1024),
        examples: suspiciousFiles.slice(0, 3).map(f => path.relative(projectRoot, f)),
        severity: 'low',
        message: `${suspiciousFiles.length} files that might be unused (${Math.round(totalSize/1024)}KB)`,
        fix: 'Review and remove test/demo/temp files not in proper directories'
      });
    }
  }

  async findLargeFiles() {
    const srcPath = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcPath)) return;

    const allFiles = this.getAllFiles(srcPath, ['.tsx', '.ts', '.jsx', '.js']);
    const largeFiles = [];

    for (const file of allFiles) {
      try {
        const stats = fs.statSync(file);
        if (stats.size > 30000) { // Files larger than 30KB
          largeFiles.push({
            file: path.relative(projectRoot, file),
            size: Math.round(stats.size / 1024)
          });
        }
      } catch (err) {
        // Skip unreadable files
      }
    }

    if (largeFiles.length > 0) {
      largeFiles.sort((a, b) => b.size - a.size);
      
      this.issues.push({
        type: 'large-files',
        count: largeFiles.length,
        examples: largeFiles.slice(0, 5),
        severity: 'medium',
        message: `${largeFiles.length} large files that might benefit from splitting`,
        fix: 'Consider splitting large components or adding code splitting'
      });
    }
  }

  getAllFiles(dirPath, extensions) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          files.push(...this.getAllFiles(fullPath, extensions));
        } else if (extensions.some(ext => fullPath.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
    
    return files;
  }

  displayResults() {
    console.log('\n📊 HEALTH SCAN RESULTS');
    console.log('=======================');
    
    if (this.issues.length === 0) {
      console.log('✅ No major issues detected!');
      console.log('   Your application appears to be in good health.');
    } else {
      console.log(`🔍 Found ${this.issues.length} potential issues:\n`);
      
      // Group by severity
      const critical = this.issues.filter(i => i.severity === 'high');
      const important = this.issues.filter(i => i.severity === 'medium');
      const minor = this.issues.filter(i => i.severity === 'low');
      
      if (critical.length > 0) {
        console.log('🚨 CRITICAL ISSUES (Fix First)');
        console.log('-------------------------------');
        critical.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.type}`);
          console.log(`   📁 ${issue.file || 'Multiple files'}`);
          console.log(`   💬 ${issue.message}`);
          console.log(`   🔧 ${issue.fix}`);
          if (issue.examples) {
            console.log(`   📋 Examples: ${issue.examples.slice(0, 2).map(ex => ex.file || ex.link || ex).join(', ')}`);
          }
          console.log('');
        });
      }

      if (important.length > 0) {
        console.log('⚠️  IMPORTANT ISSUES');
        console.log('--------------------');
        important.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.message}`);
          console.log(`   🔧 ${issue.fix}`);
          console.log('');
        });
      }

      if (minor.length > 0) {
        console.log('💡 MINOR OPTIMIZATIONS');
        console.log('----------------------');
        minor.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.message}`);
          console.log(`   🔧 ${issue.fix}`);
          console.log('');
        });
      }

      // Quick fixes section
      console.log('🚀 QUICK FIXES');
      console.log('---------------');
      
      const fixableIssues = this.issues.filter(i => i.severity === 'high');
      if (fixableIssues.length > 0) {
        console.log('Run these commands to address critical issues:');
        console.log('');
        
        if (fixableIssues.some(i => i.type === 'excessive-console-suppression')) {
          console.log('# Remove excessive console suppressions:');
          console.log('# Edit src/main.tsx and remove unnecessary console.error = ... lines');
          console.log('');
        }
        
        if (fixableIssues.some(i => i.type === 'missing-api-error-handling')) {
          console.log('# Add error handling to API routes:');
          console.log('# Wrap API logic in try-catch blocks');
          console.log('');
        }
      }
      
      console.log('# Run comprehensive tests:');
      console.log('npm run test:quick');
      console.log('');
      
      console.log('# Clean up project structure:');
      console.log('npm run cleanup');
    }
    
    const elapsed = Date.now() - this.startTime;
    console.log(`\n⏱️  Scan completed in ${elapsed}ms`);
    
    // Save report
    this.saveReport();
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        critical: this.issues.filter(i => i.severity === 'high').length,
        important: this.issues.filter(i => i.severity === 'medium').length,
        minor: this.issues.filter(i => i.severity === 'low').length
      },
      issues: this.issues
    };

    const reportPath = path.join(projectRoot, 'quick-health-scan.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`💾 Detailed report saved: ${path.relative(projectRoot, reportPath)}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scanner = new QuickHealthScanner();
  scanner.scanApplication().catch(console.error);
}

export default QuickHealthScanner;