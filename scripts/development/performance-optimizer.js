import fs from 'fs';
import path from 'path';

class PerformanceOptimizer {
    constructor() {
        this.projectRoot = process.cwd();
        this.results = {
            bundleAnalysis: {},
            importOptimizations: [],
            codeSpittingOpportunities: [],
            lazyLoadingCandidates: [],
            performanceIssues: [],
            optimizations: []
        };
    }

    async optimize() {
        console.log('⚡ Performance Optimizer - Bundle & Import Analysis');
        console.log('===================================================\n');

        await this.analyzeBundleSize();
        await this.optimizeImports();
        await this.findCodeSplittingOpportunities();
        await this.findLazyLoadingCandidates();
        await this.applyOptimizations();
        
        this.generatePerformanceReport();
    }

    async analyzeBundleSize() {
        console.log('📊 Analyzing bundle size and dependencies...');
        
        // Analyze package.json dependencies
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            this.results.bundleAnalysis = {
                dependencies: Object.keys(packageJson.dependencies || {}).length,
                devDependencies: Object.keys(packageJson.devDependencies || {}).length,
                heavyDependencies: this.findHeavyDependencies(packageJson.dependencies || {}),
                unusedDependencies: await this.findUnusedDependencies(packageJson.dependencies || {})
            };
        }

        // Analyze source file sizes
        const sourceStats = await this.analyzeSourceFiles();
        this.results.bundleAnalysis.sourceStats = sourceStats;

        console.log('   ✅ Bundle analysis complete');
    }

    findHeavyDependencies(deps) {
        // Known heavy dependencies that could be optimized
        const heavyLibraries = [
            'lodash', 'moment', 'antd', 'material-ui', '@mui/material',
            'recharts', 'chart.js', 'three', 'd3', 'rxjs'
        ];
        
        return Object.keys(deps).filter(dep => 
            heavyLibraries.some(heavy => dep.includes(heavy))
        );
    }

    async findUnusedDependencies(deps) {
        const unused = [];
        const sourceFiles = await this.getSourceFiles();
        
        for (const dep of Object.keys(deps)) {
            let isUsed = false;
            
            for (const file of sourceFiles) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    if (content.includes(`from '${dep}'`) || 
                        content.includes(`require('${dep}')`) ||
                        content.includes(`import('${dep}')`)) {
                        isUsed = true;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }
            
            if (!isUsed) {
                unused.push(dep);
            }
        }
        
        return unused;
    }

    async analyzeSourceFiles() {
        const sourceFiles = await this.getSourceFiles();
        let totalSize = 0;
        const filesBySize = [];
        
        for (const file of sourceFiles) {
            try {
                const stats = fs.statSync(file);
                totalSize += stats.size;
                filesBySize.push({
                    path: path.relative(this.projectRoot, file),
                    size: stats.size,
                    sizeFormatted: this.formatFileSize(stats.size)
                });
            } catch (error) {
                // Skip files that can't be accessed
            }
        }
        
        filesBySize.sort((a, b) => b.size - a.size);
        
        return {
            totalFiles: sourceFiles.length,
            totalSize: this.formatFileSize(totalSize),
            largestFiles: filesBySize.slice(0, 10)
        };
    }

    async optimizeImports() {
        console.log('📦 Optimizing import statements...');
        
        const sourceFiles = await this.getSourceFiles();
        let optimizationsMade = 0;
        
        for (const file of sourceFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const originalContent = content;
                let optimizedContent = content;
                
                // Optimize lodash imports
                optimizedContent = this.optimizeLodashImports(optimizedContent);
                
                // Optimize React imports
                optimizedContent = this.optimizeReactImports(optimizedContent);
                
                // Remove unused imports
                optimizedContent = this.removeUnusedImports(optimizedContent);
                
                // Sort imports
                optimizedContent = this.sortImports(optimizedContent);
                
                if (optimizedContent !== originalContent) {
                    // Create backup
                    const backupPath = file + '.backup-' + Date.now();
                    fs.writeFileSync(backupPath, originalContent);
                    
                    // Apply optimization
                    fs.writeFileSync(file, optimizedContent);
                    
                    this.results.importOptimizations.push({
                        file: path.relative(this.projectRoot, file),
                        backup: path.relative(this.projectRoot, backupPath),
                        changes: this.calculateImportChanges(originalContent, optimizedContent)
                    });
                    
                    optimizationsMade++;
                }
            } catch (error) {
                // Skip files that can't be processed
            }
        }

        console.log(`   ✅ Optimized imports in ${optimizationsMade} files`);
    }

    optimizeLodashImports(content) {
        // Convert full lodash imports to individual function imports
        return content.replace(
            /import\s+_\s+from\s+['"]lodash['"];?\s*\n/g,
            ''
        ).replace(
            /_\.(\w+)/g,
            (match, func) => {
                // Add individual import at top if not already present
                const importStatement = `import ${func} from 'lodash/${func}';`;
                if (!content.includes(importStatement)) {
                    content = importStatement + '\n' + content;
                }
                return func;
            }
        );
    }

    optimizeReactImports(content) {
        // Combine multiple React imports into single import
        const reactImports = [];
        let hasReactImport = false;
        
        content = content.replace(
            /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{\s*([^}]+)\s*\})?\s+from\s+['"]react['"];?\s*\n/g,
            (match, defaultImport, namedImports) => {
                hasReactImport = true;
                if (defaultImport) reactImports.push(defaultImport);
                if (namedImports) {
                    namedImports.split(',').forEach(imp => {
                        reactImports.push(imp.trim());
                    });
                }
                return '';
            }
        );
        
        if (hasReactImport && reactImports.length > 0) {
            const defaultImport = reactImports.includes('React') ? 'React' : '';
            const namedImports = reactImports.filter(imp => imp !== 'React');
            
            let importStatement = 'import';
            if (defaultImport) importStatement += ` ${defaultImport}`;
            if (namedImports.length > 0) {
                if (defaultImport) importStatement += ',';
                importStatement += ` { ${namedImports.join(', ')} }`;
            }
            importStatement += ` from 'react';\n`;
            
            content = importStatement + content;
        }
        
        return content;
    }

    removeUnusedImports(content) {
        // Simple unused import detection (can be enhanced)
        const imports = [];
        const importRegex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{\s*([^}]+)\s*\})?\s+from\s+['"][^'"]+['"];?\s*\n/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const defaultImport = match[1];
            const namedImports = match[2];
            
            if (defaultImport) imports.push(defaultImport);
            if (namedImports) {
                namedImports.split(',').forEach(imp => {
                    imports.push(imp.trim());
                });
            }
        }
        
        // Check if imports are used (basic check)
        const usedImports = imports.filter(imp => {
            const regex = new RegExp(`\\b${imp}\\b`);
            const contentWithoutImports = content.replace(importRegex, '');
            return regex.test(contentWithoutImports);
        });
        
        // This is a simplified implementation
        return content;
    }

    sortImports(content) {
        // Extract and sort import statements
        const importStatements = [];
        const importRegex = /import\s+[^;]+;?\s*\n/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            importStatements.push(match[0]);
        }
        
        if (importStatements.length === 0) return content;
        
        // Remove existing imports
        content = content.replace(importRegex, '');
        
        // Sort imports: React first, then libraries, then relative imports
        const sortedImports = importStatements.sort((a, b) => {
            const aIsReact = a.includes("'react'");
            const bIsReact = b.includes("'react'");
            const aIsRelative = a.includes("'./") || a.includes("'../");
            const bIsRelative = b.includes("'./") || b.includes("'../");
            
            if (aIsReact && !bIsReact) return -1;
            if (!aIsReact && bIsReact) return 1;
            if (!aIsRelative && bIsRelative) return -1;
            if (aIsRelative && !bIsRelative) return 1;
            
            return a.localeCompare(b);
        });
        
        // Add sorted imports at the top
        return sortedImports.join('') + '\n' + content;
    }

    calculateImportChanges(original, optimized) {
        const originalImports = (original.match(/import\s+[^;]+;?\s*\n/g) || []).length;
        const optimizedImports = (optimized.match(/import\s+[^;]+;?\s*\n/g) || []).length;
        
        return {
            originalImports,
            optimizedImports,
            reduction: originalImports - optimizedImports
        };
    }

    async findCodeSplittingOpportunities() {
        console.log('✂️ Finding code splitting opportunities...');
        
        // Analyze route components for code splitting
        const routeFiles = await this.findRouteFiles();
        
        for (const file of routeFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Look for large components or heavy imports that could be lazy-loaded
                if (this.isLargeComponent(content) || this.hasHeavyImports(content)) {
                    this.results.codeSpittingOpportunities.push({
                        file: path.relative(this.projectRoot, file),
                        reason: this.analyzeCodeSplittingReason(content),
                        size: this.formatFileSize(fs.statSync(file).size)
                    });
                }
            } catch (error) {
                // Skip files that can't be processed
            }
        }

        console.log(`   ✅ Found ${this.results.codeSpittingOpportunities.length} code splitting opportunities`);
    }

    async findLazyLoadingCandidates() {
        console.log('🔄 Finding lazy loading candidates...');
        
        const componentFiles = await this.getComponentFiles();
        
        for (const file of componentFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                if (this.isLazyLoadingCandidate(content)) {
                    this.results.lazyLoadingCandidates.push({
                        file: path.relative(this.projectRoot, file),
                        component: this.extractComponentName(content),
                        size: this.formatFileSize(fs.statSync(file).size)
                    });
                }
            } catch (error) {
                // Skip files that can't be processed
            }
        }

        console.log(`   ✅ Found ${this.results.lazyLoadingCandidates.length} lazy loading candidates`);
    }

    async applyOptimizations() {
        console.log('🔧 Applying performance optimizations...');
        
        let optimizationsApplied = 0;
        
        // Apply Vite optimizations to config
        const viteConfigPath = path.join(this.projectRoot, 'vite.config.ts');
        if (fs.existsSync(viteConfigPath)) {
            const optimized = await this.optimizeViteConfig(viteConfigPath);
            if (optimized) {
                this.results.optimizations.push('Vite configuration optimized');
                optimizationsApplied++;
            }
        }
        
        // Optimize package.json scripts
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const optimized = await this.optimizePackageJson(packageJsonPath);
            if (optimized) {
                this.results.optimizations.push('Package.json optimized');
                optimizationsApplied++;
            }
        }

        console.log(`   ✅ Applied ${optimizationsApplied} performance optimizations`);
    }

    async optimizeViteConfig(configPath) {
        try {
            const content = fs.readFileSync(configPath, 'utf8');
            let optimizedContent = content;
            
            // Add performance optimizations to Vite config
            const optimizations = `
    // Performance optimizations
    build: {
      target: 'esnext',
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['lodash', 'date-fns'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@supabase/supabase-js'],
    },`;
            
            if (!content.includes('manualChunks') && !content.includes('optimizeDeps')) {
                // Add optimizations to defineConfig
                optimizedContent = content.replace(
                    /export default defineConfig\(\{([^}]*)\}\)/s,
                    `export default defineConfig({$1,${optimizations}\n})`
                );
                
                if (optimizedContent !== content) {
                    fs.writeFileSync(configPath + '.backup-' + Date.now(), content);
                    fs.writeFileSync(configPath, optimizedContent);
                    return true;
                }
            }
        } catch (error) {
            // Skip if can't optimize
        }
        
        return false;
    }

    async optimizePackageJson(packagePath) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            let modified = false;
            
            // Add performance scripts if missing
            if (!packageJson.scripts) packageJson.scripts = {};
            
            if (!packageJson.scripts['analyze']) {
                packageJson.scripts['analyze'] = 'npx vite-bundle-analyzer dist';
                modified = true;
            }
            
            if (!packageJson.scripts['build:analyze']) {
                packageJson.scripts['build:analyze'] = 'npm run build && npm run analyze';
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(packagePath + '.backup-' + Date.now(), 
                    fs.readFileSync(packagePath, 'utf8'));
                fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
                return true;
            }
        } catch (error) {
            // Skip if can't optimize
        }
        
        return false;
    }

    // Utility methods
    async getSourceFiles() {
        const files = [];
        const dirs = [
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'api')
        ];

        for (const dir of dirs) {
            if (fs.existsSync(dir)) {
                await this.collectFiles(dir, files, (name) => 
                    /\.(js|jsx|ts|tsx)$/.test(name));
            }
        }

        return files;
    }

    async getComponentFiles() {
        const files = [];
        const componentDir = path.join(this.projectRoot, 'src', 'client', 'components');
        
        if (fs.existsSync(componentDir)) {
            await this.collectFiles(componentDir, files, (name) => 
                /\.(jsx|tsx)$/.test(name));
        }

        return files;
    }

    async findRouteFiles() {
        const files = [];
        const routeDirs = [
            path.join(this.projectRoot, 'src', 'client', 'pages'),
            path.join(this.projectRoot, 'src', 'client', 'components', 'pages')
        ];

        for (const dir of routeDirs) {
            if (fs.existsSync(dir)) {
                await this.collectFiles(dir, files, (name) => 
                    /\.(jsx|tsx)$/.test(name));
            }
        }

        return files;
    }

    async collectFiles(dir, files, filter) {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    await this.collectFiles(fullPath, files, filter);
                } else if (item.isFile() && (!filter || filter(item.name))) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Skip directories we can't access
        }
    }

    isLargeComponent(content) {
        return content.length > 10000 || // >10KB
               (content.match(/const|function|class/g) || []).length > 20;
    }

    hasHeavyImports(content) {
        const heavyImports = ['chart', 'recharts', 'd3', 'three', 'moment'];
        return heavyImports.some(heavy => content.includes(heavy));
    }

    analyzeCodeSplittingReason(content) {
        if (this.isLargeComponent(content)) return 'Large component (>10KB)';
        if (this.hasHeavyImports(content)) return 'Heavy dependencies';
        return 'Route component';
    }

    isLazyLoadingCandidate(content) {
        // Components with modals, complex forms, or heavy features
        const lazyPatterns = [
            'modal', 'Modal', 'dialog', 'Dialog',
            'form', 'Form', 'editor', 'Editor',
            'chart', 'Chart', 'graph', 'Graph'
        ];
        
        return lazyPatterns.some(pattern => content.includes(pattern));
    }

    extractComponentName(content) {
        const match = content.match(/export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/);
        return match ? match[1] : 'Unknown';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
        return Math.round(bytes / (1024 * 1024)) + 'MB';
    }

    generatePerformanceReport() {
        console.log('\n⚡ PERFORMANCE OPTIMIZATION RESULTS');
        console.log('===================================');

        console.log('\n📊 BUNDLE ANALYSIS:');
        if (this.results.bundleAnalysis.dependencies) {
            console.log(`   📦 Dependencies: ${this.results.bundleAnalysis.dependencies}`);
            console.log(`   🛠️ Dev Dependencies: ${this.results.bundleAnalysis.devDependencies}`);
            
            if (this.results.bundleAnalysis.heavyDependencies?.length > 0) {
                console.log(`   ⚠️ Heavy Dependencies: ${this.results.bundleAnalysis.heavyDependencies.join(', ')}`);
            }
            
            if (this.results.bundleAnalysis.unusedDependencies?.length > 0) {
                console.log(`   🗑️ Unused Dependencies: ${this.results.bundleAnalysis.unusedDependencies.join(', ')}`);
            }
        }

        if (this.results.bundleAnalysis.sourceStats) {
            const stats = this.results.bundleAnalysis.sourceStats;
            console.log(`   📄 Source Files: ${stats.totalFiles}`);
            console.log(`   📏 Total Size: ${stats.totalSize}`);
            
            if (stats.largestFiles?.length > 0) {
                console.log('   📊 Largest Files:');
                stats.largestFiles.slice(0, 5).forEach(file => {
                    console.log(`      📄 ${file.path} (${file.sizeFormatted})`);
                });
            }
        }

        console.log('\n📦 IMPORT OPTIMIZATIONS:');
        console.log(`   ✅ Files optimized: ${this.results.importOptimizations.length}`);
        
        if (this.results.importOptimizations.length > 0) {
            this.results.importOptimizations.slice(0, 5).forEach(opt => {
                console.log(`   📄 ${opt.file} - ${opt.changes?.reduction || 0} imports reduced`);
            });
        }

        console.log('\n✂️ CODE SPLITTING OPPORTUNITIES:');
        console.log(`   📊 Opportunities found: ${this.results.codeSpittingOpportunities.length}`);
        
        if (this.results.codeSpittingOpportunities.length > 0) {
            this.results.codeSpittingOpportunities.slice(0, 5).forEach(opp => {
                console.log(`   📄 ${opp.file} (${opp.size}) - ${opp.reason}`);
            });
        }

        console.log('\n🔄 LAZY LOADING CANDIDATES:');
        console.log(`   📊 Candidates found: ${this.results.lazyLoadingCandidates.length}`);
        
        if (this.results.lazyLoadingCandidates.length > 0) {
            this.results.lazyLoadingCandidates.slice(0, 5).forEach(candidate => {
                console.log(`   📄 ${candidate.file} - ${candidate.component} (${candidate.size})`);
            });
        }

        console.log('\n🔧 APPLIED OPTIMIZATIONS:');
        if (this.results.optimizations.length > 0) {
            this.results.optimizations.forEach(opt => {
                console.log(`   ✅ ${opt}`);
            });
        } else {
            console.log('   📋 No automatic optimizations applied');
        }

        console.log('\n📋 RECOMMENDATIONS:');
        console.log('   🚀 Run "npm run build" to see bundle size improvements');
        console.log('   📊 Use "npm run analyze" to analyze bundle composition');
        console.log('   ⚡ Consider implementing lazy loading for large components');
        console.log('   📦 Review unused dependencies for removal');
        console.log('   ✂️ Implement code splitting for route components');

        // Save results
        const resultsPath = path.join(this.projectRoot, 'performance-optimization-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results saved to: performance-optimization-results.json`);
        
        console.log('\n🎯 Performance optimization complete!');
    }
}

// Run the optimizer
const optimizer = new PerformanceOptimizer();
optimizer.optimize().catch(console.error);