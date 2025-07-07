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

console.log('Script starting...');
console.log('Node version:', process.version);
console.log('Current working directory:', process.cwd());

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
  console.log('Current directory:', process.cwd());
  console.log('SRC_DIR:', SRC_DIR);
  console.log('REPORTS_DIR:', REPORTS_DIR);
  
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
    if (content.includes('from \'./DesignSystem\'') || 
        content.includes('from \'../ui/DesignSystem\'') ||
        content.includes('from \'@/components/ui/DesignSystem\'')) {
      report.legacyDesignSystemImports.push(relativePath);
    }

    // Check for enhanced design system imports
    if (content.includes('from \'./EnhancedDesignSystem\'') || 
        content.includes('from \'../ui/EnhancedDesignSystem\'') ||
        content.includes('from \'@/components/ui/EnhancedDesignSystem\'')) {
      report.enhancedDesignSystemImports.push(relativePath);
    }

    // Check for manual button styling
    const buttonPatterns = [
      /className="[^"]*bg-blue-\d+[^"]*"/g,
      /className="[^"]*bg-primary-\d+[^"]*"/g,
      /<button[^>]*className="[^"]*px-\d+\s+py-\d+[^"]*"/g
    ];

    buttonPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        report.manualButtonStyling.push({
          file: relativePath,
          matches: matches.slice(0, 3) // Limit to first 3 matches
        });
      }
    });

    // Check for manual card styling
    const cardPatterns = [
      /className="[^"]*bg-white[^"]*rounded[^"]*shadow[^"]*"/g,
      /className="[^"]*border[^"]*rounded[^"]*p-\d+[^"]*"/g
    ];

    cardPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        report.manualCardStyling.push({
          file: relativePath,
          matches: matches.slice(0, 3)
        });
      }
    });

    // Check for inconsistent color usage
    const colorInconsistencies = [
      /text-gray-\d+/g,
      /bg-gray-\d+/g
    ];

    colorInconsistencies.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const neutralMatches = content.match(/text-neutral-\d+|bg-neutral-\d+/g);
        if (!neutralMatches || neutralMatches.length === 0) {
          report.inconsistentColorUsage.push({
            file: relativePath,
            grayClasses: matches.slice(0, 3),
            hasNeutralClasses: !!neutralMatches
          });
        }
      }
    });
  });

  // Generate recommendations
  generateRecommendations(report);

  // Save report
  const reportPath = path.join(REPORTS_DIR, 'component-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate human-readable report
  generateHumanReadableReport(report);

  console.log(`✅ Audit complete! Reports saved to ${REPORTS_DIR}`);
  return report;
}

/**
 * Generate recommendations based on audit results
 */
function generateRecommendations(report) {
  report.recommendations = [];

  if (report.legacyDesignSystemImports.length > 0) {
    report.recommendations.push({
      priority: 'HIGH',
      type: 'Design System Consolidation',
      description: `${report.legacyDesignSystemImports.length} files still import legacy DesignSystem`,
      action: 'Update imports to use EnhancedDesignSystem',
      effort: 'Low',
      impact: 'High'
    });
  }

  if (report.manualButtonStyling.length > 0) {
    report.recommendations.push({
      priority: 'MEDIUM',
      type: 'Button Standardization',
      description: `${report.manualButtonStyling.length} files use manual button styling`,
      action: 'Replace with enhanced Button component',
      effort: 'Medium',
      impact: 'Medium'
    });
  }

  if (report.manualCardStyling.length > 0) {
    report.recommendations.push({
      priority: 'MEDIUM',
      type: 'Card Standardization',
      description: `${report.manualCardStyling.length} files use manual card styling`,
      action: 'Replace with enhanced Card component',
      effort: 'Medium',
      impact: 'Medium'
    });
  }

  if (report.inconsistentColorUsage.length > 0) {
    report.recommendations.push({
      priority: 'LOW',
      type: 'Color Consistency',
      description: `${report.inconsistentColorUsage.length} files use gray-* instead of neutral-*`,
      action: 'Update to use semantic color tokens',
      effort: 'Low',
      impact: 'Low'
    });
  }
}

/**
 * Generate human-readable report
 */
function generateHumanReadableReport(report) {
  const reportContent = `# UI/UX Component Audit Report

Generated: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Legacy Design System Imports**: ${report.legacyDesignSystemImports.length} files
- **Enhanced Design System Imports**: ${report.enhancedDesignSystemImports.length} files
- **Manual Button Styling**: ${report.manualButtonStyling.length} files
- **Manual Card Styling**: ${report.manualCardStyling.length} files
- **Inconsistent Colors**: ${report.inconsistentColorUsage.length} files

## Recommendations

${report.recommendations.map(rec => `
### ${rec.priority} - ${rec.type}
- **Issue**: ${rec.description}
- **Action**: ${rec.action}
- **Effort**: ${rec.effort}
- **Impact**: ${rec.impact}
`).join('\n')}

## Detailed Findings

### Legacy Design System Imports
${report.legacyDesignSystemImports.map(file => `- ${file}`).join('\n')}

### Manual Button Styling
${report.manualButtonStyling.map(item => `
**${item.file}**
${item.matches.map(match => `- \`${match}\``).join('\n')}
`).join('\n')}

### Manual Card Styling
${report.manualCardStyling.map(item => `
**${item.file}**
${item.matches.map(match => `- \`${match}\``).join('\n')}
`).join('\n')}

### Color Inconsistencies
${report.inconsistentColorUsage.map(item => `
**${item.file}**
${item.grayClasses.map(cls => `- \`${cls}\``).join('\n')}
`).join('\n')}

## Next Steps

1. **Phase 1**: Update legacy design system imports
2. **Phase 2**: Replace manual button styling with Button component
3. **Phase 3**: Replace manual card styling with Card component
4. **Phase 4**: Update color classes for consistency

## Implementation Scripts

### Update Legacy Imports
\`\`\`bash
# Find and replace legacy imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from ".*DesignSystem"/from ".\/EnhancedDesignSystem"/g'
\`\`\`

### Update Color Classes
\`\`\`bash
# Replace gray with neutral
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-/text-neutral-/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gray-/bg-neutral-/g'
\`\`\`
`;

  const reportPath = path.join(REPORTS_DIR, 'component-audit-report.md');
  fs.writeFileSync(reportPath, reportContent);
}

/**
 * Fix common UI inconsistencies automatically
 */
function autoFixUIInconsistencies() {
  console.log('🔧 Auto-fixing UI inconsistencies...\n');

  const files = glob.sync(`${SRC_DIR}/**/*.{ts,tsx}`, { 
    ignore: ['**/*.d.ts', '**/node_modules/**'] 
  });

  let changesCount = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Fix 1: Replace gray- with neutral- for consistency
    const grayToNeutral = content.replace(/(\s|"|')text-gray-(\d+)/g, '$1text-neutral-$2');
    if (grayToNeutral !== content) {
      content = grayToNeutral;
      modified = true;
    }

    const bgGrayToNeutral = content.replace(/(\s|"|')bg-gray-(\d+)/g, '$1bg-neutral-$2');
    if (bgGrayToNeutral !== content) {
      content = bgGrayToNeutral;
      modified = true;
    }

    // Fix 2: Add transition classes to buttons if missing
    const buttonTransitions = content.replace(
      /<button([^>]*className="[^"]*(?!transition)[^"]*")([^>]*)>/g,
      '<button$1 transition-all duration-200$2>'
    );
    if (buttonTransitions !== content) {
      content = buttonTransitions;
      modified = true;
    }

    // Fix 3: Update basic shadow classes to enhanced shadows
    const shadowFixes = content.replace(/shadow-sm(?!\w)/g, 'shadow-soft');
    if (shadowFixes !== content) {
      content = shadowFixes;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content);
      changesCount++;
      console.log(`✅ Fixed: ${path.relative('.', file)}`);
    }
  });

  console.log(`\n🎉 Auto-fix complete! Modified ${changesCount} files`);
}

/**
 * Generate component usage statistics
 */
function generateComponentStats() {
  console.log('📊 Generating component usage statistics...\n');

  const files = glob.sync(`${SRC_DIR}/**/*.{ts,tsx}`, { 
    ignore: ['**/*.d.ts', '**/node_modules/**'] 
  });

  const stats = {
    totalFiles: files.length,
    componentUsage: {},
    tailwindClasses: {},
    mostUsedPatterns: []
  };

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Count component imports
    const componentImports = content.match(/import\s+{([^}]+)}\s+from\s+['"][^'"]*ui[^'"]*['"]/g);
    if (componentImports) {
      componentImports.forEach(imp => {
        const components = imp.match(/{([^}]+)}/)[1]
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0);
        
        components.forEach(comp => {
          stats.componentUsage[comp] = (stats.componentUsage[comp] || 0) + 1;
        });
      });
    }

    // Count Tailwind class usage
    const classMatches = content.match(/className="([^"]*)"/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const classes = match.match(/"([^"]*)"/)[1].split(/\s+/);
        classes.forEach(cls => {
          if (cls.length > 0) {
            stats.tailwindClasses[cls] = (stats.tailwindClasses[cls] || 0) + 1;
          }
        });
      });
    }
  });

  // Sort by usage
  stats.mostUsedComponents = Object.entries(stats.componentUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  stats.mostUsedClasses = Object.entries(stats.tailwindClasses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);

  // Save stats
  const statsPath = path.join(REPORTS_DIR, 'component-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  console.log('📊 Component Usage Top 10:');
  stats.mostUsedComponents.forEach(([comp, count]) => {
    console.log(`  ${comp}: ${count} uses`);
  });

  console.log('\n🎨 Most Used Tailwind Classes:');
  stats.mostUsedClasses.slice(0, 10).forEach(([cls, count]) => {
    console.log(`  ${cls}: ${count} uses`);
  });

  return stats;
}

// Main execution
async function main() {
  console.log('🚀 UI/UX Improvement Script\n');
  console.log('This script will audit and improve UI component consistency.\n');

  const args = process.argv.slice(2);
  
  if (args.includes('--audit')) {
    auditDesignSystemUsage();
  } else if (args.includes('--fix')) {
    autoFixUIInconsistencies();
  } else if (args.includes('--stats')) {
    generateComponentStats();
  } else if (args.includes('--all')) {
    auditDesignSystemUsage();
    generateComponentStats();
    autoFixUIInconsistencies();
  } else {
    console.log('Usage:');
    console.log('  node ui-improvement-script.js --audit    # Audit component usage');
    console.log('  node ui-improvement-script.js --fix      # Auto-fix common issues');
    console.log('  node ui-improvement-script.js --stats    # Generate usage statistics');
    console.log('  node ui-improvement-script.js --all      # Run all operations');
    console.log('');
    console.log('Running audit by default...\n');
    auditDesignSystemUsage();
  }
}

// Handle both direct execution and module import
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  auditDesignSystemUsage,
  autoFixUIInconsistencies,
  generateComponentStats
};
