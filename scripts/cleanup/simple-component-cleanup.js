#!/usr/bin/env node
/**
 * Simple Component Cleanup Script
 * Safely removes unused components based on analysis
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleComponentCleanup {
  constructor() {
    this.rootDir = process.cwd();
    this.srcDir = path.join(this.rootDir, 'src');
    this.componentsToRemove = [];
    this.archiveDir = path.join(this.rootDir, 'archive', 'unused-components-' + new Date().toISOString().slice(0, 10));
  }

  async findUnusedComponents() {
    console.log('🔍 Scanning for unused components...');
    
    const allFiles = await this.getAllFiles(this.srcDir);
    const componentFiles = allFiles.filter(file => 
      (file.endsWith('.tsx') || file.endsWith('.ts')) && 
      !file.includes('.test.') && 
      !file.includes('.spec.') &&
      file.includes('/components/')
    );

    const usageMap = new Map();

    // Check usage of each component
    for (const componentFile of componentFiles) {
      const componentName = path.basename(componentFile).replace(/\.(tsx?|jsx?)$/, '');
      const usageCount = await this.countUsages(componentName, allFiles);
      
      usageMap.set(componentFile, {
        name: componentName,
        usages: usageCount,
        file: componentFile
      });

      if (usageCount === 0) {
        this.componentsToRemove.push({
          name: componentName,
          file: componentFile,
          reason: 'No usage found'
        });
      }
    }

    console.log(`📊 Found ${this.componentsToRemove.length} unused components out of ${componentFiles.length} total`);
    return usageMap;
  }

  async countUsages(componentName, allFiles) {
    let usageCount = 0;
    
    for (const file of allFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Check for various import patterns
        const patterns = [
          new RegExp(`import\\s+.*\\b${componentName}\\b.*from`, 'g'),
          new RegExp(`import\\s*{[^}]*\\b${componentName}\\b[^}]*}`, 'g'),
          new RegExp(`<${componentName}[\\s/>]`, 'g'),
          new RegExp(`\\b${componentName}\\s*\\(`, 'g')
        ];

        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            usageCount += matches.length;
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return usageCount;
  }

  async getAllFiles(dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.getAllFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}`);
    }

    return files;
  }

  async archiveComponents() {
    if (this.componentsToRemove.length === 0) {
      console.log('✅ No unused components found to archive');
      return;
    }

    console.log(`📦 Archiving ${this.componentsToRemove.length} unused components...`);
    
    // Create archive directory
    await fs.mkdir(this.archiveDir, { recursive: true });

    let archivedCount = 0;
    
    for (const component of this.componentsToRemove) {
      try {
        const relativePath = path.relative(this.rootDir, component.file);
        const archivePath = path.join(this.archiveDir, relativePath);
        const archiveDir = path.dirname(archivePath);
        
        // Create archive subdirectory
        await fs.mkdir(archiveDir, { recursive: true });
        
        // Move file to archive
        await fs.copyFile(component.file, archivePath);
        await fs.unlink(component.file);
        
        archivedCount++;
        console.log(`✅ Archived: ${component.name} (${relativePath})`);
      } catch (error) {
        console.warn(`⚠️  Failed to archive ${component.name}: ${error.message}`);
      }
    }

    // Create cleanup report
    const report = {
      timestamp: new Date().toISOString(),
      totalScanned: await this.getAllFiles(this.srcDir).then(files => files.length),
      componentsRemoved: archivedCount,
      archiveLocation: this.archiveDir,
      components: this.componentsToRemove.map(c => ({
        name: c.name,
        file: path.relative(this.rootDir, c.file),
        reason: c.reason
      }))
    };

    await fs.writeFile(
      path.join(this.archiveDir, 'cleanup-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`\n🎉 Component cleanup complete!`);
    console.log(`📊 Removed: ${archivedCount} components`);
    console.log(`📁 Archive: ${this.archiveDir}`);
    console.log(`📋 Report: ${path.join(this.archiveDir, 'cleanup-report.json')}`);
  }

  async dryRun() {
    console.log('🔍 DRY RUN - Component Cleanup Analysis\n');
    
    const usageMap = await this.findUnusedComponents();
    
    if (this.componentsToRemove.length === 0) {
      console.log('✅ No unused components found!');
      return;
    }

    console.log('\n📋 Components that would be removed:');
    console.log('==========================================');
    
    this.componentsToRemove.forEach((component, index) => {
      const relativePath = path.relative(this.rootDir, component.file);
      console.log(`${index + 1}. ${component.name}`);
      console.log(`   📁 ${relativePath}`);
      console.log(`   💭 ${component.reason}\n`);
    });

    console.log(`\n🎯 Summary:`);
    console.log(`   • ${this.componentsToRemove.length} components would be removed`);
    console.log(`   • Components would be archived to preserve them`);
    console.log(`\nTo execute cleanup, run: npm run cleanup:components:remove`);
  }

  async fullCleanup() {
    console.log('🧹 Starting Component Cleanup...\n');
    
    await this.findUnusedComponents();
    
    if (this.componentsToRemove.length === 0) {
      console.log('✅ No cleanup needed - all components are in use!');
      return;
    }

    await this.archiveComponents();
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('--preview');
  
  const cleanup = new SimpleComponentCleanup();
  
  if (isDryRun) {
    cleanup.dryRun().catch(console.error);
  } else {
    cleanup.fullCleanup().catch(console.error);
  }
}

export default SimpleComponentCleanup;
