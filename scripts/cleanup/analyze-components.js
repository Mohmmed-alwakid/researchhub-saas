#!/usr/bin/env node
/**
 * Component Analysis and Cleanup Script
 * Identifies unused components and safely removes them
 */

const fs = require('fs').promises;
const path = require('path');

class ComponentAnalyzer {
  constructor() {
    this.rootDir = process.cwd();
    this.srcDir = path.join(this.rootDir, 'src');
    this.apiDir = path.join(this.rootDir, 'api');
    this.archiveDir = path.join(this.rootDir, 'archive', '2025-07-12-cleanup', 'components');
    this.analysisReport = [];
  }

  async analyze() {
    console.log('🔍 Analyzing component usage...\n');
    
    try {
      await this.createArchiveDir();
      const allComponents = await this.findAllComponents();
      const usageMap = await this.analyzeComponentUsage(allComponents);
      const unusedComponents = await this.identifyUnusedComponents(usageMap);
      await this.generateUsageReport(allComponents, usageMap, unusedComponents);
      
      console.log('\n✅ Component analysis complete!');
      console.log(`📋 Analysis report: ${path.join(this.archiveDir, 'component-analysis.md')}`);
      
      return {
        total: allComponents.length,
        unused: unusedComponents.length,
        unusedComponents
      };
      
    } catch (error) {
      console.error('❌ Component analysis failed:', error.message);
      throw error;
    }
  }

  async cleanup(removeUnused = false) {
    console.log('🧹 Starting component cleanup...\n');
    
    const analysis = await this.analyze();
    
    if (removeUnused && analysis.unusedComponents.length > 0) {
      console.log(`🗑️ Removing ${analysis.unusedComponents.length} unused components...`);
      
      for (const component of analysis.unusedComponents) {
        await this.archiveComponent(component);
      }
      
      console.log('✅ Unused components archived');
    }
    
    return analysis;
  }

  async createArchiveDir() {
    await fs.mkdir(this.archiveDir, { recursive: true });
  }

  async findAllComponents() {
    console.log('📂 Finding all components...');
    
    const components = [];
    
    try {
      // Find React components in src directory
      const srcComponents = await this.scanDirectory(this.srcDir, ['.tsx', '.ts', '.jsx', '.js']);
      components.push(...srcComponents);
      
      this.log(`Found ${srcComponents.length} components in src/`);
    } catch (error) {
      this.log(`⚠️ Could not scan src directory: ${error.message}`);
    }
    
    return components;
  }

  async scanDirectory(dir, extensions, prefix = '') {
    const components = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.join(prefix, item.name);
        
        if (item.isDirectory()) {
          // Skip node_modules and other non-source directories
          if (['node_modules', '.git', 'dist', 'build'].includes(item.name)) {
            continue;
          }
          
          const subComponents = await this.scanDirectory(fullPath, extensions, relativePath);
          components.push(...subComponents);
        } else if (item.isFile()) {
          const ext = path.extname(item.name);
          if (extensions.includes(ext)) {
            components.push({
              name: item.name,
              path: fullPath,
              relativePath,
              directory: path.dirname(relativePath),
              extension: ext,
              isComponent: this.isReactComponent(item.name)
            });
          }
        }
      }
    } catch (error) {
      this.log(`⚠️ Error scanning ${dir}: ${error.message}`);
    }
    
    return components;
  }

  isReactComponent(filename) {
    // Component names typically start with uppercase or contain "Component"
    return /^[A-Z]/.test(filename) || 
           filename.includes('Component') || 
           filename.includes('Page') ||
           filename.includes('Modal') ||
           filename.includes('Dashboard');
  }

  async analyzeComponentUsage(components) {
    console.log('🔗 Analyzing component usage...');
    
    const usageMap = new Map();
    
    // Initialize usage map
    for (const component of components) {
      usageMap.set(component.path, {
        component,
        importedBy: [],
        imports: [],
        exports: []
      });
    }
    
    // Analyze imports and exports
    for (const component of components) {
      try {
        const content = await fs.readFile(component.path, 'utf8');
        
        // Find imports
        const imports = this.extractImports(content);
        const exports = this.extractExports(content);
        
        const usage = usageMap.get(component.path);
        usage.imports = imports;
        usage.exports = exports;
        
        // Find which files import this component
        for (const otherComponent of components) {
          if (otherComponent.path !== component.path) {
            try {
              const otherContent = await fs.readFile(otherComponent.path, 'utf8');
              
              // Check if this component is imported
              const componentName = path.basename(component.name, path.extname(component.name));
              const importRegex = new RegExp(`import.*\\b${componentName}\\b.*from.*['"\`]`, 'g');
              
              if (importRegex.test(otherContent)) {
                usage.importedBy.push(otherComponent.path);
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
        
      } catch (error) {
        this.log(`⚠️ Could not analyze ${component.path}: ${error.message}`);
      }
    }
    
    this.log(`Analyzed usage for ${components.length} components`);
    return usageMap;
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+(?:(?:\{[^}]+\}|\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractExports(content) {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Also check for default exports
    if (content.includes('export default')) {
      exports.push('default');
    }
    
    return exports;
  }

  async identifyUnusedComponents(usageMap) {
    console.log('🔍 Identifying unused components...');
    
    const unusedComponents = [];
    
    // Known unused components based on our cleanup
    const knownUnused = [
      'SimplifiedStudyCreationModal',
      'LegacyStudyBuilder', 
      'OldUserManagement',
      'MockSubscriptionManager',
      'DeprecatedStudyBlocks'
    ];
    
    for (const [filePath, usage] of usageMap) {
      const component = usage.component;
      const componentName = path.basename(component.name, path.extname(component.name));
      
      // Check if component is in known unused list
      if (knownUnused.some(unused => componentName.includes(unused))) {
        unusedComponents.push(component);
        continue;
      }
      
      // Check if component is not imported by any other file
      if (usage.importedBy.length === 0 && component.isComponent) {
        // Additional checks to avoid false positives
        const isEntryPoint = this.isEntryPoint(component);
        const isTestFile = component.name.includes('.test.') || component.name.includes('.spec.');
        
        if (!isEntryPoint && !isTestFile) {
          unusedComponents.push(component);
        }
      }
    }
    
    this.log(`Found ${unusedComponents.length} potentially unused components`);
    return unusedComponents;
  }

  isEntryPoint(component) {
    // Check if this is a main entry point that might not be imported
    const entryPoints = ['App.tsx', 'main.tsx', 'index.tsx', 'index.ts'];
    return entryPoints.includes(component.name) || 
           component.relativePath.includes('pages/') ||
           component.relativePath.includes('routes/');
  }

  async archiveComponent(component) {
    const archivePath = path.join(this.archiveDir, component.name);
    await fs.rename(component.path, archivePath);
    this.log(`📦 Archived: ${component.relativePath}`);
  }

  async generateUsageReport(allComponents, usageMap, unusedComponents) {
    console.log('📋 Generating usage report...');
    
    const report = `# Component Analysis Report
**Generated**: ${new Date().toISOString()}
**Total Components**: ${allComponents.length}
**Unused Components**: ${unusedComponents.length}

## Summary
- **Total Files Analyzed**: ${allComponents.length}
- **React Components**: ${allComponents.filter(c => c.isComponent).length}
- **Utility Files**: ${allComponents.filter(c => !c.isComponent).length}
- **Unused Components**: ${unusedComponents.length}
- **Usage Rate**: ${Math.round((1 - unusedComponents.length / allComponents.length) * 100)}%

## Unused Components
${unusedComponents.length === 0 ? 'No unused components found! 🎉' : 
  unusedComponents.map(c => `- \`${c.relativePath}\` - ${c.directory}`).join('\n')}

## Component Usage Statistics
${Array.from(usageMap.entries())
  .filter(([, usage]) => usage.component.isComponent)
  .sort((a, b) => b[1].importedBy.length - a[1].importedBy.length)
  .slice(0, 10)
  .map(([, usage]) => `- \`${usage.component.name}\` - Used by ${usage.importedBy.length} files`)
  .join('\n')}

## Directory Analysis
${this.generateDirectoryStats(allComponents)}

## Recommendations
${this.generateRecommendations(unusedComponents, usageMap)}

## Cleanup Log
${this.analysisReport.join('\n')}

Generated by Component Analyzer v1.0
`;

    await fs.writeFile(path.join(this.archiveDir, 'component-analysis.md'), report);
    this.log('📋 Usage report generated');
  }

  generateDirectoryStats(components) {
    const dirStats = {};
    
    for (const component of components) {
      const dir = component.directory || 'root';
      if (!dirStats[dir]) {
        dirStats[dir] = { total: 0, components: 0 };
      }
      dirStats[dir].total++;
      if (component.isComponent) {
        dirStats[dir].components++;
      }
    }
    
    return Object.entries(dirStats)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([dir, stats]) => `- \`${dir}/\` - ${stats.total} files (${stats.components} components)`)
      .join('\n');
  }

  generateRecommendations(unusedComponents, usageMap) {
    const recommendations = [];
    
    if (unusedComponents.length > 0) {
      recommendations.push(`🗑️ Consider removing ${unusedComponents.length} unused components`);
    }
    
    // Find components with many dependencies
    const heavyComponents = Array.from(usageMap.entries())
      .filter(([, usage]) => usage.imports.length > 10)
      .map(([, usage]) => usage.component.name);
      
    if (heavyComponents.length > 0) {
      recommendations.push(`🏗️ Consider refactoring components with many dependencies: ${heavyComponents.join(', ')}`);
    }
    
    // Find potential circular dependencies
    const circularRisks = Array.from(usageMap.entries())
      .filter(([, usage]) => usage.importedBy.length > 5)
      .map(([, usage]) => usage.component.name);
      
    if (circularRisks.length > 0) {
      recommendations.push(`🔄 Monitor for circular dependencies: ${circularRisks.join(', ')}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Component architecture looks healthy!');
    }
    
    return recommendations.join('\n');
  }

  log(message) {
    this.analysisReport.push(`- ${message}`);
    console.log(message);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const removeUnused = args.includes('--remove-unused');
  const analyzeOnly = args.includes('--analyze-only');
  
  const analyzer = new ComponentAnalyzer();
  
  if (analyzeOnly) {
    analyzer.analyze().catch(console.error);
  } else {
    analyzer.cleanup(removeUnused).catch(console.error);
  }
}

module.exports = ComponentAnalyzer;
