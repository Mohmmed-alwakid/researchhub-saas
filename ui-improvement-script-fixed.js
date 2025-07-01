#!/usr/bin/env node

/**
 * UI/UX Improvement Script - Component Consolidation
 * 
 * This script identifies and helps consolidate design system components
 * to improve UI consistency across the Afkar (ResearchHub) platform.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const SRC_DIR = './src';
const REPORTS_DIR = './ui-improvement-reports';

// Create reports directory if it doesn't exist
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Audit Design System Component Usage
 */
function auditDesignSystemUsage() {
  console.log('🔍 Auditing Design System Component Usage...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    legacyDesignSystemImports: [],
    enhancedDesignSystemImports: [],
    manualButtonStyling: [],
    manualCardStyling: [],
    inconsistentColorUsage: [],
    recommendations: []
  };

  // Find all TypeScript/TSX files
  const files = glob.sync(`${SRC_DIR}/**/*.{ts,tsx}`, { 
    ignore: ['**/*.d.ts', '**/node_modules/**'] 
  });

  console.log(`📄 Scanning ${files.length} files...\n`);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative('.', file);

    // Check for legacy design system imports
    if (content.includes('from \'../components/DesignSystem\'') || 
        content.includes('from \'./DesignSystem\'') ||
        content.includes('from \'../../components/DesignSystem\'')) {
      report.legacyDesignSystemImports.push({
        file: relativePath,
        line: content.split('\n').findIndex(line => 
          line.includes('from \'') && line.includes('DesignSystem\'')) + 1
      });
    }

    // Check for enhanced design system imports
    if (content.includes('from \'../ui/EnhancedDesignSystem\'') || 
        content.includes('from \'./ui/EnhancedDesignSystem\'') ||
        content.includes('from \'../../ui/EnhancedDesignSystem\'')) {
      report.enhancedDesignSystemImports.push({
        file: relativePath,
        line: content.split('\n').findIndex(line => 
          line.includes('EnhancedDesignSystem')) + 1
      });
    }

    // Check for manual button styling
    if (content.includes('className="') && content.includes('bg-') && 
        (content.includes('button') || content.includes('btn'))) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('className="') && line.includes('bg-') && 
            (line.includes('button') || line.includes('btn'))) {
          report.manualButtonStyling.push({
            file: relativePath,
            line: index + 1,
            code: line.trim()
          });
        }
      });
    }

    // Check for manual card styling
    if (content.includes('className="') && content.includes('bg-white') && 
        (content.includes('shadow') || content.includes('border'))) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('className="') && line.includes('bg-white') && 
            (line.includes('shadow') || line.includes('border'))) {
          report.manualCardStyling.push({
            file: relativePath,
            line: index + 1,
            code: line.trim()
          });
        }
      });
    }

    // Check for inconsistent color usage
    const colorClasses = content.match(/bg-\w+-\d+|text-\w+-\d+|border-\w+-\d+/g);
    if (colorClasses) {
      colorClasses.forEach(colorClass => {
        if (!colorClass.includes('blue-') && !colorClass.includes('gray-') && 
            !colorClass.includes('green-') && !colorClass.includes('red-')) {
          report.inconsistentColorUsage.push({
            file: relativePath,
            class: colorClass
          });
        }
      });
    }
  });

  // Generate recommendations
  if (report.legacyDesignSystemImports.length > 0) {
    report.recommendations.push('Migrate legacy DesignSystem imports to EnhancedDesignSystem');
  }
  if (report.manualButtonStyling.length > 0) {
    report.recommendations.push('Replace manual button styling with standardized Button component');
  }
  if (report.manualCardStyling.length > 0) {
    report.recommendations.push('Replace manual card styling with standardized Card component');
  }
  if (report.inconsistentColorUsage.length > 0) {
    report.recommendations.push('Standardize color usage to design system palette');
  }

  // Write report
  const reportPath = path.join(REPORTS_DIR, 'design-system-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Console output
  console.log('📊 Audit Results:');
  console.log(`   Legacy DesignSystem imports: ${report.legacyDesignSystemImports.length}`);
  console.log(`   Enhanced DesignSystem imports: ${report.enhancedDesignSystemImports.length}`);
  console.log(`   Manual button styling instances: ${report.manualButtonStyling.length}`);
  console.log(`   Manual card styling instances: ${report.manualCardStyling.length}`);
  console.log(`   Inconsistent color usage: ${report.inconsistentColorUsage.length}`);
  console.log(`\n📄 Report saved to: ${reportPath}\n`);

  return report;
}

/**
 * Generate Component Usage Statistics
 */
function generateComponentStats() {
  console.log('📈 Generating Component Usage Statistics...\n');

  const files = glob.sync(`${SRC_DIR}/**/*.{ts,tsx}`, { 
    ignore: ['**/*.d.ts', '**/node_modules/**'] 
  });

  const stats = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    componentImports: {},
    tailwindClasses: {},
    mostUsedComponents: [],
    mostUsedClasses: []
  };

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Count component imports
    const importMatches = content.match(/import\s+{([^}]+)}\s+from\s+['"](\.\.?\/.*)['"]/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const components = match.match(/{\s*([^}]+)\s*}/)?.[1]
          .split(',')
          .map(c => c.trim())
          .filter(c => c && c[0] === c[0].toUpperCase());
        
        if (components) {
          components.forEach(component => {
            stats.componentImports[component] = (stats.componentImports[component] || 0) + 1;
          });
        }
      });
    }

    // Count Tailwind classes
    const classMatches = content.match(/className="([^"]+)"/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const classes = match.match(/"([^"]+)"/)?.[1]
          .split(' ')
          .filter(cls => cls.trim());
        
        if (classes) {
          classes.forEach(cls => {
            stats.tailwindClasses[cls] = (stats.tailwindClasses[cls] || 0) + 1;
          });
        }
      });
    }
  });

  // Sort and prepare top lists
  stats.mostUsedComponents = Object.entries(stats.componentImports)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);

  stats.mostUsedClasses = Object.entries(stats.tailwindClasses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 30);

  // Write report
  const reportPath = path.join(REPORTS_DIR, 'component-usage-stats.json');
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));

  // Console output
  console.log('📊 Usage Statistics:');
  console.log(`   Total files analyzed: ${stats.totalFiles}`);
  console.log(`   Unique components imported: ${Object.keys(stats.componentImports).length}`);
  console.log(`   Unique Tailwind classes used: ${Object.keys(stats.tailwindClasses).length}`);
  
  console.log('\n🏆 Top 10 Most Used Components:');
  stats.mostUsedComponents.slice(0, 10).forEach(([component, count]) => {
    console.log(`   ${component}: ${count} imports`);
  });

  console.log('\n🎨 Top 10 Most Used Tailwind Classes:');
  stats.mostUsedClasses.slice(0, 10).forEach(([cls, count]) => {
    console.log(`   ${cls}: ${count} uses`);
  });

  console.log(`\n📄 Report saved to: ${reportPath}\n`);

  return stats;
}

// Main execution
function main() {
  console.log('🚀 UI/UX Improvement Script\n');
  console.log('This script will audit and improve UI component consistency.\n');

  const args = process.argv.slice(2);
  
  try {
    if (args.includes('--audit')) {
      auditDesignSystemUsage();
    } else if (args.includes('--stats')) {
      generateComponentStats();
    } else if (args.includes('--all')) {
      auditDesignSystemUsage();
      generateComponentStats();
    } else {
      console.log('Usage:');
      console.log('  node ui-improvement-script-fixed.js --audit    # Audit component usage');
      console.log('  node ui-improvement-script-fixed.js --stats    # Generate usage statistics');
      console.log('  node ui-improvement-script-fixed.js --all      # Run all operations');
      console.log('');
      console.log('Running audit by default...\n');
      auditDesignSystemUsage();
    }
    
    console.log('✅ Script completed successfully!');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}
