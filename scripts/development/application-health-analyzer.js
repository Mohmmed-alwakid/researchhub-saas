/**
 * 🔍 ResearchHub Application Health Analyzer
 * 
 * Comprehensive analysis tool for detecting:
 * - Application errors and console warnings
 * - Broken navigation links and routes
 * - Unused components and dead code
 * - Performance bottlenecks
 * - Bundle size issues
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const projectRoot = path.resolve(__dirname, '../..');

class ApplicationHealthAnalyzer {
  constructor() {
    this.results = {
      errors: [],
      brokenLinks: [],
      unusedCode: [],
      performance: [],
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        fixableIssues: 0
      }
    };
  }

  async runCompleteAnalysis() {
    console.log('🔍 ResearchHub Application Health Analysis');
    console.log('==========================================\n');

    try {
      // Phase 1: Error Detection
      await this.analyzeApplicationErrors();
      
      // Phase 2: Route and Navigation Analysis  
      await this.analyzeBrokenLinks();
      
      // Phase 3: Unused Code Detection
      await this.analyzeUnusedCode();
      
      // Phase 4: Performance Analysis
      await this.analyzePerformance();
      
      // Generate comprehensive report
      await this.generateHealthReport();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }

  async analyzeApplicationErrors() {
    console.log('🚨 Analyzing Application Errors...');
    
    const errors = {
      consoleErrors: await this.findConsoleErrors(),
      apiErrors: await this.findAPIErrors(),
      routingErrors: await this.findRoutingErrors(),
      importErrors: await this.findImportErrors()
    };

    this.results.errors = errors;
    
    const totalErrors = Object.values(errors).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`   📊 Found ${totalErrors} application errors`);
    
    return errors;
  }

  async findConsoleErrors() {
    const errors = [];
    const sourceFiles = await this.getAllSourceFiles();
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find console.error suppressions (indicates hidden errors)
        const consoleSuppressions = [...content.matchAll(/console\.(error|warn|log)\s*=.*?;/g)];
        if (consoleSuppressions.length > 0) {
          errors.push({
            type: 'console-suppression',
            file: path.relative(projectRoot, file),
            count: consoleSuppressions.length,
            severity: 'high',
            message: 'Console errors being suppressed - may hide real issues',
            lines: consoleSuppressions.map(match => this.getLineNumber(content, match.index))
          });
        }

        // Find try-catch blocks with empty catch (swallowing errors)
        const emptyCatches = [...content.matchAll(/catch\s*\([^)]*\)\s*\{\s*\}/g)];
        if (emptyCatches.length > 0) {
          errors.push({
            type: 'empty-catch',
            file: path.relative(projectRoot, file),
            count: emptyCatches.length,
            severity: 'medium',
            message: 'Empty catch blocks - errors may be ignored silently'
          });
        }

        // Find TODO comments indicating incomplete error handling
        const todoErrors = [...content.matchAll(/\/\/.*TODO.*error|\/\/.*FIXME.*error/gi)];
        if (todoErrors.length > 0) {
          errors.push({
            type: 'incomplete-error-handling',
            file: path.relative(projectRoot, file),
            count: todoErrors.length,
            severity: 'low',
            message: 'Incomplete error handling marked with TODO/FIXME'
          });
        }

      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return errors;
  }

  async findAPIErrors() {
    const errors = [];
    const apiFiles = await this.getAPIFiles();
    
    for (const file of apiFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find missing error handling in API endpoints
        const functionExports = [...content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/g)];
        for (const match of functionExports) {
          const functionName = match[1];
          const functionContent = this.extractFunction(content, match.index);
          
          // Check if function has proper error handling
          if (!functionContent.includes('try') && !functionContent.includes('catch')) {
            errors.push({
              type: 'missing-error-handling',
              file: path.relative(projectRoot, file),
              function: functionName,
              severity: 'high',
              message: `API function ${functionName} lacks error handling`
            });
          }

          // Check for missing status codes
          if (!functionContent.includes('res.status(')) {
            errors.push({
              type: 'missing-status-codes',
              file: path.relative(projectRoot, file),
              function: functionName,
              severity: 'medium',
              message: `API function ${functionName} doesn't set proper status codes`
            });
          }
        }

      } catch (err) {
        console.log(`   ⚠️  Could not analyze ${file}: ${err.message}`);
      }
    }
    
    return errors;
  }

  async findRoutingErrors() {
    const errors = [];
    
    try {
      // Find React Router configuration
      const routerFiles = await this.findFiles(['**/*Router*.tsx', '**/*Route*.tsx', '**/App.tsx']);
      
      for (const file of routerFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find Route definitions
        const routes = [...content.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<(\w+)[^}]*\}\s*\/>/g)];
        
        for (const route of routes) {
          const routePath = route[1];
          const componentName = route[2];
          
          // Check if component exists
          const componentExists = await this.checkComponentExists(componentName);
          if (!componentExists) {
            errors.push({
              type: 'missing-route-component',
              file: path.relative(projectRoot, file),
              route: routePath,
              component: componentName,
              severity: 'high',
              message: `Route ${routePath} references missing component ${componentName}`
            });
          }
        }
        
        // Find Navigate redirects
        const navigates = [...content.matchAll(/<Navigate\s+to="([^"]+)"/g)];
        for (const navigate of navigates) {
          errors.push({
            type: 'redirect-route',
            file: path.relative(projectRoot, file),
            redirect: navigate[1],
            severity: 'low',
            message: `Found redirect to ${navigate[1]} - verify target exists`
          });
        }
      }
      
    } catch (err) {
      console.log(`   ⚠️  Router analysis failed: ${err.message}`);
    }
    
    return errors;
  }

  async findImportErrors() {
    const errors = [];
    const sourceFiles = await this.getAllSourceFiles();
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find import statements
        const imports = [...content.matchAll(/import\s+(?:{[^}]+}|[^,\s]+)\s+from\s+['"]([^'"]+)['"]/g)];
        
        for (const importMatch of imports) {
          const importPath = importMatch[1];
          
          // Skip node_modules imports
          if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
            continue;
          }
          
          // Resolve the import path
          const resolvedPath = this.resolveImportPath(file, importPath);
          if (resolvedPath && !fs.existsSync(resolvedPath)) {
            errors.push({
              type: 'broken-import',
              file: path.relative(projectRoot, file),
              import: importPath,
              resolved: resolvedPath,
              severity: 'high',
              message: `Broken import: ${importPath}`
            });
          }
        }
        
      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return errors;
  }

  async analyzeBrokenLinks() {
    console.log('🔗 Analyzing Navigation Links...');
    
    const brokenLinks = {
      internalLinks: await this.findBrokenInternalLinks(),
      routerLinks: await this.findBrokenRouterLinks(),
      apiEndpoints: await this.findBrokenAPIEndpoints()
    };

    this.results.brokenLinks = brokenLinks;
    
    const totalLinks = Object.values(brokenLinks).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`   📊 Found ${totalLinks} broken links`);
    
    return brokenLinks;
  }

  async findBrokenInternalLinks() {
    const brokenLinks = [];
    const sourceFiles = await this.getAllSourceFiles();
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find navigate() calls
        const navigateCalls = [...content.matchAll(/navigate\(\s*['"]([^'"]+)['"]/g)];
        for (const call of navigateCalls) {
          brokenLinks.push({
            type: 'navigate-call',
            file: path.relative(projectRoot, file),
            link: call[1],
            severity: 'medium',
            message: `Navigation call to ${call[1]} - verify route exists`,
            fixable: false
          });
        }

        // Find Link components
        const linkComponents = [...content.matchAll(/<Link\s+to="([^"]+)"/g)];
        for (const link of linkComponents) {
          brokenLinks.push({
            type: 'link-component',
            file: path.relative(projectRoot, file),
            link: link[1],
            severity: 'medium',
            message: `Link component to ${link[1]} - verify route exists`,
            fixable: false
          });
        }

      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return brokenLinks;
  }

  async findBrokenRouterLinks() {
    const brokenLinks = [];
    
    // This would require runtime analysis - for now, placeholder
    // TODO: Implement dynamic route checking
    
    return brokenLinks;
  }

  async findBrokenAPIEndpoints() {
    const brokenEndpoints = [];
    const sourceFiles = await this.getAllSourceFiles();
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find fetch calls to API endpoints
        const fetchCalls = [...content.matchAll(/fetch\(\s*['"`]([^'"`]+)['"`]/g)];
        for (const call of fetchCalls) {
          const endpoint = call[1];
          if (endpoint.includes('/api/')) {
            brokenEndpoints.push({
              type: 'api-fetch',
              file: path.relative(projectRoot, file),
              endpoint: endpoint,
              severity: 'medium',
              message: `API call to ${endpoint} - verify endpoint exists`,
              fixable: false
            });
          }
        }

        // Find axios calls
        const axiosCalls = [...content.matchAll(/axios\.(get|post|put|delete)\(\s*['"`]([^'"`]+)['"`]/g)];
        for (const call of axiosCalls) {
          const endpoint = call[2];
          if (endpoint.includes('/api/')) {
            brokenEndpoints.push({
              type: 'axios-call',
              file: path.relative(projectRoot, file),
              endpoint: endpoint,
              method: call[1].toUpperCase(),
              severity: 'medium',
              message: `${call[1].toUpperCase()} call to ${endpoint} - verify endpoint exists`,
              fixable: false
            });
          }
        }

      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return brokenEndpoints;
  }

  async analyzeUnusedCode() {
    console.log('🧹 Analyzing Unused Code...');
    
    const unusedCode = {
      components: await this.findUnusedComponents(),
      pages: await this.findUnusedPages(),
      utilities: await this.findUnusedUtilities(),
      assets: await this.findUnusedAssets()
    };

    this.results.unusedCode = unusedCode;
    
    const totalUnused = Object.values(unusedCode).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`   📊 Found ${totalUnused} unused code items`);
    
    return unusedCode;
  }

  async findUnusedComponents() {
    const unusedComponents = [];
    const componentFiles = await this.getComponentFiles();
    
    for (const file of componentFiles) {
      const componentName = path.basename(file, path.extname(file));
      const isUsed = await this.isComponentUsed(componentName);
      
      if (!isUsed) {
        const fileStats = fs.statSync(file);
        unusedComponents.push({
          type: 'unused-component',
          file: path.relative(projectRoot, file),
          component: componentName,
          size: fileStats.size,
          severity: 'low',
          message: `Component ${componentName} appears to be unused`,
          fixable: true,
          confidence: await this.getUnusedConfidence(file)
        });
      }
    }
    
    return unusedComponents.sort((a, b) => b.confidence - a.confidence);
  }

  async findUnusedPages() {
    const unusedPages = [];
    // Look for page components that aren't referenced in routing
    
    try {
      const pageFiles = await this.findFiles(['**/pages/**/*.tsx', '**/views/**/*.tsx']);
      const routerContent = await this.getAllRouterContent();
      
      for (const file of pageFiles) {
        const pageName = path.basename(file, path.extname(file));
        
        // Check if page is referenced in any router
        const isReferenced = routerContent.some(content => 
          content.includes(pageName) || content.includes(path.basename(file))
        );
        
        if (!isReferenced) {
          const fileStats = fs.statSync(file);
          unusedPages.push({
            type: 'unused-page',
            file: path.relative(projectRoot, file),
            page: pageName,
            size: fileStats.size,
            severity: 'medium',
            message: `Page ${pageName} not referenced in routing`,
            fixable: true
          });
        }
      }
    } catch (err) {
      console.log(`   ⚠️  Page analysis failed: ${err.message}`);
    }
    
    return unusedPages;
  }

  async findUnusedUtilities() {
    const unusedUtilities = [];
    const utilityFiles = await this.findFiles(['**/utils/**/*.ts', '**/utilities/**/*.ts', '**/helpers/**/*.ts']);
    
    for (const file of utilityFiles) {
      const isUsed = await this.isFileImported(file);
      
      if (!isUsed) {
        const fileStats = fs.statSync(file);
        unusedUtilities.push({
          type: 'unused-utility',
          file: path.relative(projectRoot, file),
          size: fileStats.size,
          severity: 'low',
          message: `Utility file appears to be unused`,
          fixable: true
        });
      }
    }
    
    return unusedUtilities;
  }

  async findUnusedAssets() {
    const unusedAssets = [];
    
    try {
      const assetFiles = await this.findFiles(['**/public/**/*', '**/assets/**/*']);
      const sourceFiles = await this.getAllSourceFiles();
      
      // Read all source content to check for asset references
      let allSourceContent = '';
      for (const file of sourceFiles.slice(0, 100)) { // Limit to first 100 files for performance
        try {
          allSourceContent += fs.readFileSync(file, 'utf8') + '\n';
        } catch (err) {
          // Skip unreadable files
        }
      }
      
      for (const asset of assetFiles) {
        if (fs.statSync(asset).isDirectory()) continue;
        
        const assetName = path.basename(asset);
        const relativePath = path.relative(projectRoot, asset);
        
        // Check if asset is referenced in source code
        const isReferenced = allSourceContent.includes(assetName) || 
                           allSourceContent.includes(relativePath);
        
        if (!isReferenced) {
          const fileStats = fs.statSync(asset);
          unusedAssets.push({
            type: 'unused-asset',
            file: relativePath,
            size: fileStats.size,
            severity: 'low',
            message: `Asset ${assetName} appears to be unused`,
            fixable: true
          });
        }
      }
    } catch (err) {
      console.log(`   ⚠️  Asset analysis failed: ${err.message}`);
    }
    
    return unusedAssets;
  }

  async analyzePerformance() {
    console.log('⚡ Analyzing Performance Issues...');
    
    const performance = {
      bundleSize: await this.analyzeBundleSize(),
      dependencies: await this.analyzeUnusedDependencies(),
      imports: await this.analyzeImportEfficiency(),
      codeComplexity: await this.analyzeCodeComplexity()
    };

    this.results.performance = performance;
    
    const totalIssues = Object.values(performance).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`   📊 Found ${totalIssues} performance issues`);
    
    return performance;
  }

  async analyzeBundleSize() {
    const bundleIssues = [];
    
    try {
      // Check for large components that should be code-split
      const componentFiles = await this.getComponentFiles();
      
      for (const file of componentFiles) {
        const stats = fs.statSync(file);
        if (stats.size > 50000) { // Files larger than 50KB
          bundleIssues.push({
            type: 'large-component',
            file: path.relative(projectRoot, file),
            size: stats.size,
            severity: 'medium',
            message: `Large component (${Math.round(stats.size/1024)}KB) should consider code splitting`,
            fixable: true
          });
        }
      }
      
      // Check for potential bundle bloat patterns
      const sourceFiles = await this.getAllSourceFiles();
      for (const file of sourceFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Find imports that bring in entire libraries
          const heavyImports = [...content.matchAll(/import\s+\*\s+as\s+\w+\s+from\s+['"]([^'"]+)['"]/g)];
          for (const importMatch of heavyImports) {
            bundleIssues.push({
              type: 'heavy-import',
              file: path.relative(projectRoot, file),
              import: importMatch[1],
              severity: 'low',
              message: `Importing entire library ${importMatch[1]} - consider named imports`,
              fixable: true
            });
          }
        } catch (err) {
          // Skip unreadable files
        }
      }
      
    } catch (err) {
      console.log(`   ⚠️  Bundle analysis failed: ${err.message}`);
    }
    
    return bundleIssues;
  }

  async analyzeUnusedDependencies() {
    const unusedDeps = [];
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const sourceFiles = await this.getAllSourceFiles();
      let allImports = new Set();
      
      // Collect all imports from source files
      for (const file of sourceFiles.slice(0, 50)) { // Limit for performance
        try {
          const content = fs.readFileSync(file, 'utf8');
          const imports = [...content.matchAll(/import\s+[^'"]*['"]([^'"]+)['"]/g)];
          imports.forEach(match => {
            const importPath = match[1];
            if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
              const packageName = importPath.split('/')[0];
              allImports.add(packageName);
            }
          });
        } catch (err) {
          // Skip unreadable files
        }
      }
      
      // Check which dependencies aren't imported
      for (const [depName, version] of Object.entries(dependencies)) {
        if (!allImports.has(depName)) {
          unusedDeps.push({
            type: 'unused-dependency',
            dependency: depName,
            version: version,
            severity: 'low',
            message: `Dependency ${depName} appears to be unused`,
            fixable: true
          });
        }
      }
      
    } catch (err) {
      console.log(`   ⚠️  Dependency analysis failed: ${err.message}`);
    }
    
    return unusedDeps;
  }

  async analyzeImportEfficiency() {
    const importIssues = [];
    const sourceFiles = await this.getAllSourceFiles();
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Find duplicate imports from the same source
        const imports = [...content.matchAll(/import\s+.*from\s+['"]([^'"]+)['"]/g)];
        const importSources = {};
        
        imports.forEach(match => {
          const source = match[1];
          if (!importSources[source]) {
            importSources[source] = 0;
          }
          importSources[source]++;
        });
        
        Object.entries(importSources).forEach(([source, count]) => {
          if (count > 1) {
            importIssues.push({
              type: 'duplicate-imports',
              file: path.relative(projectRoot, file),
              source: source,
              count: count,
              severity: 'low',
              message: `${count} separate imports from ${source} - consider consolidating`,
              fixable: true
            });
          }
        });
        
      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return importIssues;
  }

  async analyzeCodeComplexity() {
    const complexityIssues = [];
    const sourceFiles = await this.getAllSourceFiles();
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        // Simple complexity heuristics
        if (lines.length > 500) {
          complexityIssues.push({
            type: 'large-file',
            file: path.relative(projectRoot, file),
            lines: lines.length,
            severity: 'medium',
            message: `Large file (${lines.length} lines) should consider refactoring`,
            fixable: true
          });
        }
        
        // Count deeply nested structures
        let maxNesting = 0;
        let currentNesting = 0;
        
        for (const line of lines) {
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          currentNesting += openBraces - closeBraces;
          maxNesting = Math.max(maxNesting, currentNesting);
        }
        
        if (maxNesting > 6) {
          complexityIssues.push({
            type: 'deep-nesting',
            file: path.relative(projectRoot, file),
            nesting: maxNesting,
            severity: 'medium',
            message: `Deep nesting (${maxNesting} levels) - consider refactoring`,
            fixable: true
          });
        }
        
      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return complexityIssues;
  }

  async generateHealthReport() {
    console.log('\n📊 Generating Health Report...');
    
    // Calculate summary statistics
    const allIssues = [
      ...this.results.errors.consoleErrors,
      ...this.results.errors.apiErrors,
      ...this.results.errors.routingErrors,
      ...this.results.errors.importErrors,
      ...this.results.brokenLinks.internalLinks,
      ...this.results.brokenLinks.routerLinks,
      ...this.results.brokenLinks.apiEndpoints,
      ...this.results.unusedCode.components,
      ...this.results.unusedCode.pages,
      ...this.results.unusedCode.utilities,
      ...this.results.unusedCode.assets,
      ...this.results.performance.bundleSize,
      ...this.results.performance.dependencies,
      ...this.results.performance.imports,
      ...this.results.performance.codeComplexity
    ];

    this.results.summary = {
      totalIssues: allIssues.length,
      criticalIssues: allIssues.filter(issue => issue.severity === 'high').length,
      fixableIssues: allIssues.filter(issue => issue.fixable).length,
      unusedCodeSize: this.results.unusedCode.components.reduce((sum, comp) => sum + (comp.size || 0), 0) +
                      this.results.unusedCode.pages.reduce((sum, page) => sum + (page.size || 0), 0) +
                      this.results.unusedCode.utilities.reduce((sum, util) => sum + (util.size || 0), 0) +
                      this.results.unusedCode.assets.reduce((sum, asset) => sum + (asset.size || 0), 0)
    };

    // Save detailed report
    const reportPath = path.join(projectRoot, 'application-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Display summary
    this.displaySummary();
    
    console.log(`\n💾 Detailed report saved: ${path.relative(projectRoot, reportPath)}`);
    console.log(`⏱️  Analysis completed in ${Date.now() - this.startTime}ms`);
  }

  displaySummary() {
    console.log('\n📈 APPLICATION HEALTH SUMMARY');
    console.log('================================');
    console.log(`🔍 Total Issues Found: ${this.results.summary.totalIssues}`);
    console.log(`🚨 Critical Issues: ${this.results.summary.criticalIssues}`);
    console.log(`🔧 Auto-fixable Issues: ${this.results.summary.fixableIssues}`);
    console.log(`📦 Unused Code Size: ${Math.round(this.results.summary.unusedCodeSize / 1024)}KB`);
    
    console.log('\n🔍 ISSUE BREAKDOWN');
    console.log('-------------------');
    console.log(`❌ Application Errors: ${Object.values(this.results.errors).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log(`🔗 Broken Links: ${Object.values(this.results.brokenLinks).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log(`🗑️  Unused Code Items: ${Object.values(this.results.unusedCode).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log(`⚡ Performance Issues: ${Object.values(this.results.performance).reduce((sum, arr) => sum + arr.length, 0)}`);

    if (this.results.summary.criticalIssues > 0) {
      console.log('\n🚨 TOP CRITICAL ISSUES');
      console.log('----------------------');
      const criticalIssues = this.getAllIssues().filter(issue => issue.severity === 'high').slice(0, 5);
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type} in ${issue.file || issue.component || issue.dependency}`);
        console.log(`   ${issue.message}`);
      });
    }

    console.log('\n💡 RECOMMENDED ACTIONS');
    console.log('----------------------');
    if (this.results.summary.fixableIssues > 0) {
      console.log(`🔧 Run automated fixes for ${this.results.summary.fixableIssues} issues`);
    }
    if (this.results.summary.unusedCodeSize > 50000) {
      console.log(`🗑️  Remove ${Math.round(this.results.summary.unusedCodeSize / 1024)}KB of unused code`);
    }
    if (this.results.summary.criticalIssues > 0) {
      console.log(`🚨 Address ${this.results.summary.criticalIssues} critical issues first`);
    }
  }

  getAllIssues() {
    return [
      ...this.results.errors.consoleErrors,
      ...this.results.errors.apiErrors,
      ...this.results.errors.routingErrors,
      ...this.results.errors.importErrors,
      ...this.results.brokenLinks.internalLinks,
      ...this.results.brokenLinks.routerLinks,
      ...this.results.brokenLinks.apiEndpoints,
      ...this.results.unusedCode.components,
      ...this.results.unusedCode.pages,
      ...this.results.unusedCode.utilities,
      ...this.results.unusedCode.assets,
      ...this.results.performance.bundleSize,
      ...this.results.performance.dependencies,
      ...this.results.performance.imports,
      ...this.results.performance.codeComplexity
    ];
  }

  // Helper methods
  async getAllSourceFiles() {
    return await this.findFiles(['src/**/*.{ts,tsx,js,jsx}']);
  }

  async getComponentFiles() {
    return await this.findFiles(['src/**/components/**/*.{ts,tsx}', 'src/**/*Component.{ts,tsx}']);
  }

  async getAPIFiles() {
    return await this.findFiles(['api/**/*.js', 'src/api/**/*.{ts,js}']);
  }

  async findFiles(patterns) {
    const glob = require('glob');
    const files = [];
    
    for (const pattern of patterns) {
      try {
        const matches = await new Promise((resolve, reject) => {
          glob(pattern, { cwd: projectRoot }, (err, matches) => {
            if (err) reject(err);
            else resolve(matches);
          });
        });
        files.push(...matches.map(file => path.join(projectRoot, file)));
      } catch (err) {
        // Skip failed patterns
        console.log(`   ⚠️  Pattern ${pattern} failed: ${err.message}`);
      }
    }
    
    return [...new Set(files)]; // Remove duplicates
  }

  async isComponentUsed(componentName) {
    const sourceFiles = await this.getAllSourceFiles();
    
    for (const file of sourceFiles.slice(0, 50)) { // Limit for performance
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(componentName)) {
          return true;
        }
      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return false;
  }

  async isFileImported(targetFile) {
    const sourceFiles = await this.getAllSourceFiles();
    const targetBasename = path.basename(targetFile, path.extname(targetFile));
    
    for (const file of sourceFiles) {
      if (file === targetFile) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(path.dirname(file), targetFile);
        
        if (content.includes(targetBasename) || content.includes(relativePath)) {
          return true;
        }
      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return false;
  }

  async getUnusedConfidence(file) {
    // Simple confidence scoring based on file characteristics
    let confidence = 0.7; // Base confidence
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Lower confidence if file has exports (might be used externally)
      if (content.includes('export')) {
        confidence -= 0.2;
      }
      
      // Higher confidence if it's in a deep directory (likely specific/unused)
      const depth = file.split(path.sep).length;
      if (depth > 6) {
        confidence += 0.1;
      }
      
      // Lower confidence if it's a common name
      const commonNames = ['index', 'utils', 'helpers', 'common'];
      const basename = path.basename(file, path.extname(file)).toLowerCase();
      if (commonNames.some(name => basename.includes(name))) {
        confidence -= 0.3;
      }
      
    } catch (err) {
      // If we can't read it, it's probably safe to remove
      confidence = 0.9;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  async getAllRouterContent() {
    const routerFiles = await this.findFiles(['**/*Router*.{tsx,ts}', '**/*Route*.{tsx,ts}', '**/App.{tsx,ts}']);
    const contents = [];
    
    for (const file of routerFiles) {
      try {
        contents.push(fs.readFileSync(file, 'utf8'));
      } catch (err) {
        // Skip unreadable files
      }
    }
    
    return contents;
  }

  async checkComponentExists(componentName) {
    const componentFiles = await this.getComponentFiles();
    return componentFiles.some(file => 
      path.basename(file, path.extname(file)) === componentName
    );
  }

  resolveImportPath(fromFile, importPath) {
    try {
      // Handle different import path formats
      if (importPath.startsWith('@/')) {
        // Alias import - assume @ maps to src
        return path.join(projectRoot, 'src', importPath.substring(2));
      } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Relative import
        let resolvedPath = path.resolve(path.dirname(fromFile), importPath);
        
        // Try common extensions
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
        for (const ext of extensions) {
          if (fs.existsSync(resolvedPath + ext)) {
            return resolvedPath + ext;
          }
        }
        
        // Try index files
        for (const ext of extensions) {
          const indexPath = path.join(resolvedPath, 'index' + ext);
          if (fs.existsSync(indexPath)) {
            return indexPath;
          }
        }
        
        return resolvedPath;
      }
    } catch (err) {
      return null;
    }
    
    return null;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  extractFunction(content, startIndex) {
    // Simple function extraction - find matching braces
    let braceCount = 0;
    let inFunction = false;
    let functionContent = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      functionContent += char;
      
      if (char === '{') {
        inFunction = true;
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
          break;
        }
      }
    }
    
    return functionContent;
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new ApplicationHealthAnalyzer();
  analyzer.startTime = Date.now();
  analyzer.runCompleteAnalysis().catch(console.error);
}

module.exports = ApplicationHealthAnalyzer;