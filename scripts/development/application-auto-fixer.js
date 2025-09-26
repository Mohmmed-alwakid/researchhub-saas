/**
 * 🔧 Application Auto-Fix System
 * Automatically fixes common issues identified by health scanner
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class ApplicationAutoFixer {
  constructor() {
    this.fixesApplied = [];
    this.backupDir = path.join(projectRoot, '.fix-backups', new Date().toISOString().split('T')[0]);
  }

  async applyAllFixes() {
    console.log('🔧 ResearchHub Application Auto-Fix');
    console.log('====================================\n');

    try {
      // Create backup directory
      await this.createBackupDir();
      
      // Apply critical fixes
      await this.fixConsoleSuppressions();
      await this.fixAPIErrorHandling();
      await this.fixMissingStatusCodes();
      
      // Apply performance fixes
      await this.removeUnusedFiles();
      await this.optimizeLargeFiles();
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Auto-fix failed:', error.message);
    }
  }

  async createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async backupFile(filePath) {
    const relativePath = path.relative(projectRoot, filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    
    // Create backup directory structure
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    
    // Copy original file
    fs.copyFileSync(filePath, backupPath);
  }

  async fixConsoleSuppressions() {
    console.log('🔇 Fixing Console Suppressions...');
    
    const mainTsxPath = path.join(projectRoot, 'src/main.tsx');
    if (!fs.existsSync(mainTsxPath)) return;

    await this.backupFile(mainTsxPath);
    
    let content = fs.readFileSync(mainTsxPath, 'utf8');
    const originalContent = content;

    // Remove excessive console suppressions but keep essential ones
    const lines = content.split('\n');
    const filteredLines = [];
    let inConsoleBlock = false;
    let removedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Keep essential Permission-Policy suppression
      if (line.includes('Permission-Policy') || line.includes('browsing-topics')) {
        filteredLines.push(line);
        continue;
      }
      
      // Remove other console suppressions
      if (line.includes('console.error =') || line.includes('console.warn =') || line.includes('console.log =')) {
        // Skip this line and find the end of the suppression block
        let j = i;
        while (j < lines.length && !lines[j].includes(';')) {
          j++;
        }
        if (j < lines.length) {
          j++; // Skip the semicolon line too
        }
        i = j - 1; // Set i to the last skipped line
        removedCount++;
        continue;
      }
      
      filteredLines.push(line);
    }

    if (removedCount > 0) {
      content = filteredLines.join('\n');
      
      // Add proper error handling instead
      const errorHandlingCode = `
// Minimal error suppression for browser-specific warnings
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Only suppress known browser permission warnings
  if (message.includes('Permission-Policy') || 
      message.includes('browsing-topics')) {
    return;
  }
  
  // Show all other errors for debugging
  originalError.apply(console, args);
};`;

      // Insert the new error handling before StrictMode
      if (content.includes('StrictMode')) {
        content = content.replace(
          /(<StrictMode>)/,
          `${errorHandlingCode}\n\n$1`
        );
      } else {
        // Add StrictMode if missing
        content = content.replace(
          /(<App \/>)/,
          `${errorHandlingCode}\n\n<StrictMode>\n  $1\n</StrictMode>`
        );
      }

      fs.writeFileSync(mainTsxPath, content);
      
      this.fixesApplied.push({
        type: 'console-suppressions',
        file: 'src/main.tsx',
        description: `Removed ${removedCount} excessive console suppressions`,
        backup: path.relative(projectRoot, path.join(this.backupDir, 'src/main.tsx'))
      });
    }
  }

  async fixAPIErrorHandling() {
    console.log('🛡️  Adding API Error Handling...');
    
    const apiDir = path.join(projectRoot, 'api');
    if (!fs.existsSync(apiDir)) return;

    const apiFiles = this.getAllFiles(apiDir, ['.js']);
    let fixedCount = 0;

    for (const file of apiFiles) {
      // Skip archive and test files
      if (file.includes('archive') || file.includes('test')) {
        continue;
      }

      try {
        await this.backupFile(file);
        
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;

        // Check if file exports a handler and lacks try-catch
        if (content.includes('export default') && !content.includes('try {')) {
          
          // Find the main function
          const functionMatch = content.match(/export default (?:async )?function\s+(\w+)?\s*\([^)]*\)\s*\{/);
          if (functionMatch) {
            const functionStart = functionMatch.index + functionMatch[0].length;
            
            // Find the end of the function
            let braceCount = 1;
            let functionEnd = functionStart;
            
            for (let i = functionStart; i < content.length && braceCount > 0; i++) {
              if (content[i] === '{') braceCount++;
              else if (content[i] === '}') braceCount--;
              functionEnd = i;
            }
            
            // Extract function body
            const functionBody = content.substring(functionStart, functionEnd);
            
            // Wrap in try-catch
            const wrappedBody = `
  try {${functionBody}
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }`;

            // Replace the function body
            content = content.substring(0, functionStart) + 
                     wrappedBody + 
                     content.substring(functionEnd);

            fs.writeFileSync(file, content);
            fixedCount++;
            
            this.fixesApplied.push({
              type: 'api-error-handling',
              file: path.relative(projectRoot, file),
              description: 'Added try-catch error handling',
              backup: path.relative(projectRoot, path.join(this.backupDir, path.relative(projectRoot, file)))
            });
          }
        }

      } catch (err) {
        console.log(`   ⚠️  Could not fix ${path.relative(projectRoot, file)}: ${err.message}`);
      }
    }

    console.log(`   ✅ Fixed ${fixedCount} API files`);
  }

  async fixMissingStatusCodes() {
    console.log('📡 Adding Missing Status Codes...');
    
    const apiDir = path.join(projectRoot, 'api');
    if (!fs.existsSync(apiDir)) return;

    const apiFiles = this.getAllFiles(apiDir, ['.js']);
    let fixedCount = 0;

    for (const file of apiFiles) {
      // Skip archive and test files
      if (file.includes('archive') || file.includes('test')) {
        continue;
      }

      try {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;

        // Find return statements with res.json but no status
        const returnMatches = [...content.matchAll(/return\s+res\.json\(/g)];
        
        if (returnMatches.length > 0) {
          // Check if any don't have status
          const needsStatusFix = returnMatches.some(match => {
            const beforeMatch = content.substring(Math.max(0, match.index - 100), match.index);
            return !beforeMatch.includes('res.status(');
          });

          if (needsStatusFix) {
            await this.backupFile(file);
            
            // Replace res.json with res.status(200).json for success cases
            content = content.replace(
              /return\s+res\.json\(\s*\{\s*success:\s*true/g,
              'return res.status(200).json({ success: true'
            );

            // Replace generic res.json with status
            content = content.replace(
              /return\s+res\.json\(\s*\{(?!\s*success:\s*false)/g,
              'return res.status(200).json({'
            );

            fs.writeFileSync(file, content);
            fixedCount++;
            
            this.fixesApplied.push({
              type: 'status-codes',
              file: path.relative(projectRoot, file),
              description: 'Added HTTP status codes to responses',
              backup: path.relative(projectRoot, path.join(this.backupDir, path.relative(projectRoot, file)))
            });
          }
        }

      } catch (err) {
        console.log(`   ⚠️  Could not fix ${path.relative(projectRoot, file)}: ${err.message}`);
      }
    }

    console.log(`   ✅ Fixed ${fixedCount} API files`);
  }

  async removeUnusedFiles() {
    console.log('🗑️  Removing Unused Files...');
    
    const srcDir = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return;

    const allFiles = this.getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
    const suspiciousFiles = allFiles.filter(file => {
      const basename = path.basename(file).toLowerCase();
      return (basename.includes('test') || 
              basename.includes('demo') || 
              basename.includes('example') ||
              basename.includes('temp') ||
              basename.includes('backup') ||
              basename.includes('old')) &&
              !file.includes('testing') &&
              !file.includes('__tests__') &&
              !file.includes('node_modules');
    });

    let removedCount = 0;
    let removedSize = 0;

    for (const file of suspiciousFiles) {
      try {
        const stats = fs.statSync(file);
        
        // Create backup before removing
        await this.backupFile(file);
        
        // Remove the file
        fs.unlinkSync(file);
        
        removedCount++;
        removedSize += stats.size;
        
        this.fixesApplied.push({
          type: 'unused-file-removal',
          file: path.relative(projectRoot, file),
          description: `Removed unused file (${Math.round(stats.size/1024)}KB)`,
          backup: path.relative(projectRoot, path.join(this.backupDir, path.relative(projectRoot, file)))
        });
        
      } catch (err) {
        console.log(`   ⚠️  Could not remove ${path.relative(projectRoot, file)}: ${err.message}`);
      }
    }

    if (removedCount > 0) {
      console.log(`   ✅ Removed ${removedCount} unused files (${Math.round(removedSize/1024)}KB)`);
    } else {
      console.log(`   ✅ No obviously unused files found`);
    }
  }

  async optimizeLargeFiles() {
    console.log('📏 Analyzing Large Files...');
    
    const srcDir = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return;

    const allFiles = this.getAllFiles(srcDir, ['.tsx', '.ts']);
    const largeFiles = [];

    for (const file of allFiles) {
      try {
        const stats = fs.statSync(file);
        if (stats.size > 30000) { // Files larger than 30KB
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n').length;
          
          largeFiles.push({
            file,
            size: stats.size,
            lines,
            needsOptimization: this.analyzeFileComplexity(content)
          });
        }
      } catch (err) {
        // Skip unreadable files
      }
    }

    if (largeFiles.length > 0) {
      console.log(`   📊 Found ${largeFiles.length} large files:`);
      
      largeFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .forEach(file => {
          const relativePath = path.relative(projectRoot, file.file);
          console.log(`      ${relativePath} - ${Math.round(file.size/1024)}KB (${file.lines} lines)`);
          
          if (file.needsOptimization) {
            console.log(`        💡 Consider: ${file.needsOptimization}`);
          }
        });

      // Generate optimization suggestions
      this.fixesApplied.push({
        type: 'optimization-suggestions',
        description: `Analyzed ${largeFiles.length} large files`,
        suggestions: largeFiles.slice(0, 5).map(file => ({
          file: path.relative(projectRoot, file.file),
          size: Math.round(file.size/1024) + 'KB',
          recommendation: file.needsOptimization || 'Consider splitting into smaller components'
        }))
      });
    }
  }

  analyzeFileComplexity(content) {
    // Simple heuristics for optimization suggestions
    const componentCount = (content.match(/export\s+(?:const|function)\s+\w+/g) || []).length;
    const importCount = (content.match(/^import/gm) || []).length;
    const hookCount = (content.match(/use[A-Z]\w+/g) || []).length;
    
    if (componentCount > 5) {
      return 'Multiple components in one file - consider splitting';
    }
    
    if (importCount > 20) {
      return 'Many imports - consider using barrel exports or dynamic imports';
    }
    
    if (hookCount > 10) {
      return 'Complex component with many hooks - consider custom hooks or context';
    }
    
    if (content.includes('useState') && content.match(/useState/g).length > 8) {
      return 'Many state variables - consider useReducer or state management library';
    }
    
    return null;
  }

  getAllFiles(dirPath, extensions) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        try {
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...this.getAllFiles(fullPath, extensions));
          } else if (extensions.some(ext => fullPath.endsWith(ext))) {
            files.push(fullPath);
          }
        } catch (err) {
          // Skip files we can't access
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
    
    return files;
  }

  displayResults() {
    console.log('\n🎉 AUTO-FIX RESULTS');
    console.log('===================');
    
    if (this.fixesApplied.length === 0) {
      console.log('✅ No fixes needed - your application is healthy!');
    } else {
      console.log(`🔧 Applied ${this.fixesApplied.length} fixes:\n`);
      
      // Group fixes by type
      const fixTypes = {};
      this.fixesApplied.forEach(fix => {
        if (!fixTypes[fix.type]) {
          fixTypes[fix.type] = [];
        }
        fixTypes[fix.type].push(fix);
      });

      Object.entries(fixTypes).forEach(([type, fixes]) => {
        console.log(`📋 ${type.toUpperCase().replace('-', ' ')}`);
        console.log(''.padEnd(40, '-'));
        
        fixes.forEach(fix => {
          console.log(`✅ ${fix.file || 'Multiple files'}`);
          console.log(`   ${fix.description}`);
          if (fix.backup) {
            console.log(`   🔄 Backup: ${fix.backup}`);
          }
          if (fix.suggestions) {
            fix.suggestions.forEach(suggestion => {
              console.log(`   💡 ${suggestion.file} (${suggestion.size}): ${suggestion.recommendation}`);
            });
          }
          console.log('');
        });
      });

      console.log('📁 BACKUP LOCATION');
      console.log('------------------');
      console.log(`All original files backed up to: ${path.relative(projectRoot, this.backupDir)}`);
      console.log('');

      console.log('🚀 NEXT STEPS');
      console.log('-------------');
      console.log('1. Test your application: npm run dev:fullstack');
      console.log('2. Run tests: npm run test:quick');
      console.log('3. If issues occur, restore from backup');
      console.log('4. Run health scan again: node scripts/development/quick-health-scanner.js');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ApplicationAutoFixer();
  fixer.applyAllFixes().catch(console.error);
}

export default ApplicationAutoFixer;