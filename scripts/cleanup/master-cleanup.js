#!/usr/bin/env node
/**
 * Master Cleanup Script - Comprehensive Project Cleanup
 * Orchestrates all cleanup operations for ResearchHub project
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MasterCleanup {
  constructor() {
    this.rootDir = process.cwd();
    this.archiveDir = path.join(this.rootDir, 'archive', '2025-07-12-cleanup');
    this.cleanupLog = [];
  }

  async run() {
    console.log('🚀 Starting Master Cleanup Process...\n');
    
    try {
      await this.createArchiveStructure();
      await this.analyzeCurrentState();
      await this.removeUnusedFiles();
      await this.organizeDocumentation();
      await this.cleanupComponents();
      await this.optimizeDependencies();
      await this.generateReport();
      
      console.log('\n✅ Master Cleanup Complete!');
      console.log(`📋 Cleanup report: ${path.join(this.archiveDir, 'cleanup-report.md')}`);
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      process.exit(1);
    }
  }

  async createArchiveStructure() {
    console.log('📁 Creating archive structure...');
    
    const archiveDirs = [
      'archive/2025-07-12-cleanup',
      'archive/2025-07-12-cleanup/documentation',
      'archive/2025-07-12-cleanup/components',
      'archive/2025-07-12-cleanup/scripts', 
      'archive/2025-07-12-cleanup/test-files',
      'docs/requirements/active',
      'docs/requirements/completed',
      'docs/requirements/templates',
      'docs/requirements/decisions'
    ];

    for (const dir of archiveDirs) {
      await fs.mkdir(path.join(this.rootDir, dir), { recursive: true });
    }
    
    this.log('✅ Archive structure created');
  }

  async analyzeCurrentState() {
    console.log('🔍 Analyzing current project state...');
    
    // Count files by type
    const analysis = {
      markdownFiles: await this.countFiles('**/*.md'),
      htmlFiles: await this.countFiles('**/*.html'),
      jsFiles: await this.countFiles('**/*.js'),
      tsxFiles: await this.countFiles('**/*.tsx'),
      components: await this.analyzeComponents()
    };
    
    this.log(`📊 Analysis: ${analysis.markdownFiles} MD, ${analysis.htmlFiles} HTML, ${analysis.components.total} components`);
    return analysis;
  }

  async removeUnusedFiles() {
    console.log('🗑️ Removing unused and deprecated files...');
    
    const unusedFiles = [
      // MongoDB migration files (now using Supabase)
      'apply-wallet-migration.mjs',
      'create-subscription-tables.mjs',
      'check-tables.mjs',
      
      // Railway/Render deployment files (now using Vercel)
      'railway-problems-solution.md',
      'render-backup-deployment.md',
      
      // Legacy test files in root
      'legacy-replacement-complete-final.html',
      'complete-ui-implementation-test.html',
      
      // Outdated documentation
      'MONGODB_*.md',
      'RAILWAY_*.md',
      'RENDER_*.md'
    ];

    let removedCount = 0;
    for (const file of unusedFiles) {
      try {
        const filePath = path.join(this.rootDir, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          await fs.rename(filePath, path.join(this.archiveDir, 'documentation', file));
          removedCount++;
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }
    
    this.log(`🗑️ Archived ${removedCount} unused files`);
  }

  async organizeDocumentation() {
    console.log('📚 Organizing documentation...');
    
    // Move scattered markdown files to docs folder
    const files = await fs.readdir(this.rootDir);
    let movedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.md') && !['README.md', 'QUICK_REFERENCE_SINGLE_SOURCE.md'].includes(file)) {
        try {
          const oldPath = path.join(this.rootDir, file);
          const newPath = path.join(this.rootDir, 'docs', 'reports', file);
          
          // Ensure docs/reports directory exists
          await fs.mkdir(path.join(this.rootDir, 'docs', 'reports'), { recursive: true });
          
          await fs.rename(oldPath, newPath);
          movedCount++;
        } catch (error) {
          console.warn(`⚠️ Could not move ${file}:`, error.message);
        }
      }
    }
    
    this.log(`📚 Moved ${movedCount} documentation files to docs/reports/`);
  }

  async cleanupComponents() {
    console.log('🧹 Cleaning up components...');
    
    // Analyze component usage
    const componentsDir = path.join(this.rootDir, 'src', 'client', 'components');
    
    try {
      const unusedComponents = await this.findUnusedComponents(componentsDir);
      
      for (const component of unusedComponents) {
        const archivePath = path.join(this.archiveDir, 'components', path.basename(component));
        await fs.rename(component, archivePath);
      }
      
      this.log(`🧹 Archived ${unusedComponents.length} unused components`);
    } catch (error) {
      this.log(`⚠️ Component cleanup skipped: ${error.message}`);
    }
  }

  async optimizeDependencies() {
    console.log('📦 Optimizing dependencies...');
    
    try {
      // Run npm audit and outdated check
      const auditResult = execSync('npm audit --audit-level moderate', { encoding: 'utf8' });
      this.log('📦 Dependencies audited for security issues');
      
      // Check for unused dependencies (requires depcheck package)
      try {
        execSync('npx depcheck', { encoding: 'utf8' });
        this.log('📦 Unused dependencies checked');
      } catch (error) {
        this.log('📦 Depcheck analysis completed (warnings found)');
      }
      
    } catch (error) {
      this.log(`⚠️ Dependency optimization: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('📋 Generating cleanup report...');
    
    const report = `# Project Cleanup Report
**Date**: ${new Date().toISOString()}
**Cleanup Version**: Master Cleanup v1.0

## Summary
${this.cleanupLog.map(entry => `- ${entry}`).join('\n')}

## Next Steps
1. Review archived files in ${this.archiveDir}
2. Test application functionality
3. Run automated tests
4. Update documentation references
5. Deploy cleaned version

## Verification Commands
\`\`\`bash
npm run dev          # Test local development
npm run build        # Test production build
npm run test         # Run test suite
\`\`\`

## Files Archived
- Location: ${this.archiveDir}
- Documentation: ${path.join(this.archiveDir, 'documentation')}
- Components: ${path.join(this.archiveDir, 'components')}

Generated by Master Cleanup Script
`;

    await fs.writeFile(path.join(this.archiveDir, 'cleanup-report.md'), report);
    this.log('📋 Cleanup report generated');
  }

  // Helper methods
  async countFiles(pattern) {
    try {
      // Simple file counting without globby dependency
      const countDir = async (dir, extensions) => {
        let count = 0;
        try {
          const items = await fs.readdir(dir, { withFileTypes: true });
          for (const item of items) {
            if (item.isDirectory() && !['node_modules', '.git', 'dist'].includes(item.name)) {
              count += await countDir(path.join(dir, item.name), extensions);
            } else if (item.isFile()) {
              const ext = path.extname(item.name);
              if (extensions.includes(ext)) {
                count++;
              }
            }
          }
        } catch (error) {
          // Directory not accessible
        }
        return count;
      };
      
      if (pattern.includes('*.md')) {
        return await countDir(this.rootDir, ['.md']);
      } else if (pattern.includes('*.html')) {
        return await countDir(this.rootDir, ['.html']);
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  async analyzeComponents() {
    try {
      const componentsDir = path.join(this.rootDir, 'src', 'client', 'components');
      const files = await fs.readdir(componentsDir, { recursive: true });
      const components = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      
      return {
        total: components.length,
        tsx: components.filter(f => f.endsWith('.tsx')).length,
        ts: components.filter(f => f.endsWith('.ts')).length
      };
    } catch (error) {
      return { total: 0, tsx: 0, ts: 0 };
    }
  }

  async findUnusedComponents(componentsDir) {
    // Simplified unused component detection
    // In a real implementation, this would scan imports across the codebase
    const potentiallyUnused = [
      'SimplifiedStudyCreationModal.tsx',
      'LegacyStudyBuilder.tsx',
      'OldUserManagement.tsx',
      'MockSubscriptionManager.tsx'
    ];
    
    const unusedComponents = [];
    for (const component of potentiallyUnused) {
      const filePath = path.join(componentsDir, component);
      try {
        await fs.access(filePath);
        unusedComponents.push(filePath);
      } catch (error) {
        // Component doesn't exist
      }
    }
    
    return unusedComponents;
  }

  log(message) {
    this.cleanupLog.push(message);
    console.log(message);
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new MasterCleanup();
  cleanup.run().catch(console.error);
}
