import fs from 'fs';
import path from 'path';

class AdvancedCleanupScanner {
    constructor() {
        this.projectRoot = process.cwd();
        this.results = {
            unusedComponents: [],
            unusedUtilities: [],
            duplicateFiles: [],
            emptyDirectories: [],
            unusedImports: [],
            largeFiles: [],
            oldFiles: []
        };
        this.scannedFiles = new Set();
        this.usedFiles = new Set();
    }

    async scanProject() {
        console.log('🔍 Advanced Cleanup Scanner - Comprehensive Analysis');
        console.log('====================================================\n');

        await this.findUsedFiles();
        await this.findUnusedComponents();
        await this.findDuplicateFiles();
        await this.findEmptyDirectories();
        await this.findLargeFiles();
        await this.findOldFiles();
        
        this.generateReport();
    }

    async findUsedFiles() {
        console.log('📂 Scanning for file usage patterns...');
        
        // Scan all source files for imports and references
        const sourceFiles = await this.getSourceFiles();
        
        for (const file of sourceFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Find import statements
            const importMatches = content.match(/(?:import.*from\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\))/g);
            if (importMatches) {
                for (const match of importMatches) {
                    const importPath = match.match(/['"`]([^'"`]+)['"`]/)?.[1];
                    if (importPath && !importPath.startsWith('.')) {
                        // Skip node_modules
                        continue;
                    }
                    if (importPath) {
                        const resolvedPath = this.resolveImportPath(file, importPath);
                        if (resolvedPath) {
                            this.usedFiles.add(resolvedPath);
                        }
                    }
                }
            }

            // Find dynamic imports and references
            const dynamicRefs = content.match(/['"`]\.\/[^'"`]+['"`]/g);
            if (dynamicRefs) {
                for (const ref of dynamicRefs) {
                    const refPath = ref.slice(1, -1); // Remove quotes
                    const resolvedPath = this.resolveImportPath(file, refPath);
                    if (resolvedPath) {
                        this.usedFiles.add(resolvedPath);
                    }
                }
            }
        }

        console.log(`   ✅ Found ${this.usedFiles.size} referenced files`);
    }

    async findUnusedComponents() {
        console.log('🧩 Scanning for unused components...');
        
        const componentDirs = [
            path.join(this.projectRoot, 'src', 'client', 'components'),
            path.join(this.projectRoot, 'src', 'client', 'pages'),
            path.join(this.projectRoot, 'src', 'client', 'layouts'),
            path.join(this.projectRoot, 'src', 'client', 'hooks'),
            path.join(this.projectRoot, 'src', 'client', 'utils'),
            path.join(this.projectRoot, 'src', 'shared')
        ];

        for (const dir of componentDirs) {
            if (fs.existsSync(dir)) {
                await this.scanDirectoryForUnused(dir);
            }
        }

        console.log(`   ⚠️ Found ${this.results.unusedComponents.length} potentially unused files`);
    }

    async scanDirectoryForUnused(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            
            if (file.isDirectory()) {
                await this.scanDirectoryForUnused(fullPath);
            } else if (file.isFile() && this.isSourceFile(file.name)) {
                const relativePath = path.relative(this.projectRoot, fullPath);
                
                if (!this.usedFiles.has(fullPath) && !this.isEssentialFile(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    this.results.unusedComponents.push({
                        path: relativePath,
                        size: this.formatFileSize(stats.size),
                        lastModified: stats.mtime.toISOString().split('T')[0]
                    });
                }
            }
        }
    }

    async findDuplicateFiles() {
        console.log('🔄 Scanning for duplicate files...');
        
        const fileHashes = new Map();
        const sourceFiles = await this.getSourceFiles();
        
        for (const file of sourceFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const hash = this.simpleHash(content);
                
                if (fileHashes.has(hash)) {
                    const duplicate = fileHashes.get(hash);
                    this.results.duplicateFiles.push({
                        original: path.relative(this.projectRoot, duplicate),
                        duplicate: path.relative(this.projectRoot, file),
                        size: this.formatFileSize(fs.statSync(file).size)
                    });
                } else {
                    fileHashes.set(hash, file);
                }
            } catch (error) {
                // Skip files that can't be read
            }
        }

        console.log(`   🔄 Found ${this.results.duplicateFiles.length} potential duplicates`);
    }

    async findEmptyDirectories() {
        console.log('📁 Scanning for empty directories...');
        
        await this.scanForEmptyDirectories(this.projectRoot);
        
        console.log(`   📁 Found ${this.results.emptyDirectories.length} empty directories`);
    }

    async scanForEmptyDirectories(dir) {
        if (this.shouldSkipDirectory(dir)) return;
        
        try {
            const files = fs.readdirSync(dir);
            
            if (files.length === 0) {
                this.results.emptyDirectories.push(path.relative(this.projectRoot, dir));
                return;
            }
            
            let hasFiles = false;
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isFile()) {
                    hasFiles = true;
                } else if (stat.isDirectory()) {
                    await this.scanForEmptyDirectories(fullPath);
                }
            }
            
            if (!hasFiles && files.every(file => {
                const fullPath = path.join(dir, file);
                return fs.statSync(fullPath).isDirectory();
            })) {
                // Check if all subdirectories are empty
                let allSubsEmpty = true;
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        const subFiles = fs.readdirSync(fullPath);
                        if (subFiles.length > 0) {
                            allSubsEmpty = false;
                            break;
                        }
                    }
                }
                
                if (allSubsEmpty) {
                    this.results.emptyDirectories.push(path.relative(this.projectRoot, dir));
                }
            }
        } catch (error) {
            // Skip directories we can't access
        }
    }

    async findLargeFiles() {
        console.log('📏 Scanning for large files...');
        
        const sourceFiles = await this.getAllFiles();
        const LARGE_FILE_THRESHOLD = 500 * 1024; // 500KB
        
        for (const file of sourceFiles) {
            try {
                const stats = fs.statSync(file);
                if (stats.size > LARGE_FILE_THRESHOLD && this.isOptimizableFile(file)) {
                    this.results.largeFiles.push({
                        path: path.relative(this.projectRoot, file),
                        size: this.formatFileSize(stats.size),
                        type: path.extname(file)
                    });
                }
            } catch (error) {
                // Skip files we can't access
            }
        }
        
        this.results.largeFiles.sort((a, b) => 
            this.parseFileSize(b.size) - this.parseFileSize(a.size)
        );

        console.log(`   📏 Found ${this.results.largeFiles.length} large files`);
    }

    async findOldFiles() {
        console.log('⏰ Scanning for old files...');
        
        const sourceFiles = await this.getSourceFiles();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        for (const file of sourceFiles) {
            try {
                const stats = fs.statSync(file);
                if (stats.mtime < sixMonthsAgo && !this.isEssentialFile(file)) {
                    this.results.oldFiles.push({
                        path: path.relative(this.projectRoot, file),
                        lastModified: stats.mtime.toISOString().split('T')[0],
                        size: this.formatFileSize(stats.size)
                    });
                }
            } catch (error) {
                // Skip files we can't access
            }
        }

        console.log(`   ⏰ Found ${this.results.oldFiles.length} old files`);
    }

    // Utility methods
    async getSourceFiles() {
        const files = [];
        const dirs = [
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'api'),
            path.join(this.projectRoot, 'scripts')
        ];

        for (const dir of dirs) {
            if (fs.existsSync(dir)) {
                await this.collectFiles(dir, files, this.isSourceFile.bind(this));
            }
        }

        return files;
    }

    async getAllFiles() {
        const files = [];
        const dirs = [
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'public'),
            path.join(this.projectRoot, 'api'),
            path.join(this.projectRoot, 'scripts'),
            path.join(this.projectRoot, 'docs')
        ];

        for (const dir of dirs) {
            if (fs.existsSync(dir)) {
                await this.collectFiles(dir, files);
            }
        }

        return files;
    }

    async collectFiles(dir, files, filter = null) {
        if (this.shouldSkipDirectory(dir)) return;
        
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    await this.collectFiles(fullPath, files, filter);
                } else if (item.isFile()) {
                    if (!filter || filter(item.name)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't access
        }
    }

    resolveImportPath(fromFile, importPath) {
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const dir = path.dirname(fromFile);
            let resolved = path.resolve(dir, importPath);
            
            // Try different extensions
            const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
            
            if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
                return resolved;
            }
            
            for (const ext of extensions) {
                const withExt = resolved + ext;
                if (fs.existsSync(withExt)) {
                    return withExt;
                }
            }
            
            // Try index files
            for (const ext of extensions) {
                const indexFile = path.join(resolved, 'index' + ext);
                if (fs.existsSync(indexFile)) {
                    return indexFile;
                }
            }
        }
        
        return null;
    }

    isSourceFile(filename) {
        return /\.(js|jsx|ts|tsx|vue|json)$/.test(filename);
    }

    isOptimizableFile(filepath) {
        return /\.(js|jsx|ts|tsx|css|json|md|txt)$/.test(filepath);
    }

    isEssentialFile(filepath) {
        const essentialPatterns = [
            /package\.json$/,
            /tsconfig\.json$/,
            /vite\.config/,
            /tailwind\.config/,
            /App\.(js|jsx|ts|tsx)$/,
            /main\.(js|jsx|ts|tsx)$/,
            /index\.(js|jsx|ts|tsx|html)$/,
            /\.env/
        ];
        
        return essentialPatterns.some(pattern => pattern.test(filepath));
    }

    shouldSkipDirectory(dir) {
        const skipPatterns = [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.vercel',
            'test-results',
            'playwright-report'
        ];
        
        return skipPatterns.some(pattern => dir.includes(pattern));
    }

    simpleHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
        return Math.round(bytes / (1024 * 1024)) + 'MB';
    }

    parseFileSize(sizeStr) {
        const match = sizeStr.match(/^(\d+(?:\.\d+)?)(B|KB|MB)$/);
        if (!match) return 0;
        
        const value = parseFloat(match[1]);
        const unit = match[2];
        
        switch (unit) {
            case 'B': return value;
            case 'KB': return value * 1024;
            case 'MB': return value * 1024 * 1024;
            default: return 0;
        }
    }

    generateReport() {
        console.log('\n🎯 ADVANCED CLEANUP ANALYSIS RESULTS');
        console.log('=====================================');

        console.log('\n📊 SUMMARY:');
        console.log(`   🧩 Potentially unused files: ${this.results.unusedComponents.length}`);
        console.log(`   🔄 Duplicate files: ${this.results.duplicateFiles.length}`);
        console.log(`   📁 Empty directories: ${this.results.emptyDirectories.length}`);
        console.log(`   📏 Large files (>500KB): ${this.results.largeFiles.length}`);
        console.log(`   ⏰ Old files (>6 months): ${this.results.oldFiles.length}`);

        if (this.results.unusedComponents.length > 0) {
            console.log('\n🧩 POTENTIALLY UNUSED FILES:');
            this.results.unusedComponents.slice(0, 10).forEach(file => {
                console.log(`   📄 ${file.path} (${file.size}) - Modified: ${file.lastModified}`);
            });
            if (this.results.unusedComponents.length > 10) {
                console.log(`   ... and ${this.results.unusedComponents.length - 10} more`);
            }
        }

        if (this.results.duplicateFiles.length > 0) {
            console.log('\n🔄 DUPLICATE FILES:');
            this.results.duplicateFiles.slice(0, 5).forEach(dup => {
                console.log(`   📄 ${dup.original} ↔️ ${dup.duplicate} (${dup.size})`);
            });
            if (this.results.duplicateFiles.length > 5) {
                console.log(`   ... and ${this.results.duplicateFiles.length - 5} more`);
            }
        }

        if (this.results.emptyDirectories.length > 0) {
            console.log('\n📁 EMPTY DIRECTORIES:');
            this.results.emptyDirectories.slice(0, 10).forEach(dir => {
                console.log(`   📁 ${dir}`);
            });
            if (this.results.emptyDirectories.length > 10) {
                console.log(`   ... and ${this.results.emptyDirectories.length - 10} more`);
            }
        }

        if (this.results.largeFiles.length > 0) {
            console.log('\n📏 LARGE FILES:');
            this.results.largeFiles.slice(0, 5).forEach(file => {
                console.log(`   📄 ${file.path} (${file.size}) - ${file.type}`);
            });
            if (this.results.largeFiles.length > 5) {
                console.log(`   ... and ${this.results.largeFiles.length - 5} more`);
            }
        }

        if (this.results.oldFiles.length > 0) {
            console.log('\n⏰ OLD FILES (>6 months):');
            this.results.oldFiles.slice(0, 5).forEach(file => {
                console.log(`   📄 ${file.path} (${file.size}) - ${file.lastModified}`);
            });
            if (this.results.oldFiles.length > 5) {
                console.log(`   ... and ${this.results.oldFiles.length - 5} more`);
            }
        }

        console.log('\n✨ RECOMMENDATIONS:');
        if (this.results.unusedComponents.length > 0) {
            console.log('   🔧 Review and remove unused components safely');
        }
        if (this.results.duplicateFiles.length > 0) {
            console.log('   🔧 Consolidate duplicate files');
        }
        if (this.results.emptyDirectories.length > 0) {
            console.log('   🔧 Remove empty directories');
        }
        if (this.results.largeFiles.length > 0) {
            console.log('   🔧 Consider optimizing large files');
        }
        if (this.results.oldFiles.length > 0) {
            console.log('   🔧 Review old files for relevance');
        }

        // Save results for potential cleanup script
        const resultsPath = path.join(this.projectRoot, 'advanced-cleanup-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results saved to: advanced-cleanup-results.json`);
        
        console.log('\n🎯 Analysis complete! Review the results before applying any cleanup.');
    }
}

// Run the scanner
const scanner = new AdvancedCleanupScanner();
scanner.scanProject().catch(console.error);