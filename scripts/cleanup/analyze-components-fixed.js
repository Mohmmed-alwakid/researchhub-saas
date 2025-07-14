#!/usr/bin/env node

/**
 * Component Usage Analysis - Find Unused Components
 * Analyzes React components to identify unused code for removal
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root (two levels up from scripts/cleanup)
const projectRoot = path.resolve(__dirname, '..', '..');

console.log('🔍 Starting Component Usage Analysis...');
console.log(`📁 Project Root: ${projectRoot}`);

/**
 * Find all TypeScript/JSX files in src directory
 */
function findSourceFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!item.startsWith('.') && item !== 'node_modules') {
                files.push(...findSourceFiles(fullPath));
            }
        } else if (item.match(/\.(tsx?|jsx?)$/)) {
            files.push(fullPath);
        }
    }
    
    return files;
}

/**
 * Extract component names and exports from a file
 */
function extractComponentInfo(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const components = [];
        
        // Find exported components/functions
        const exportMatches = content.matchAll(
            /export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/g
        );
        for (const match of exportMatches) {
            components.push(match[1]);
        }
        
        // Find named exports
        const namedExportMatches = content.matchAll(
            /export\s*{\s*([^}]+)\s*}/g
        );
        for (const match of namedExportMatches) {
            const exports = match[1].split(',').map(e => e.trim().split(' as ')[0]);
            components.push(...exports);
        }
        
        return {
            file: filePath,
            components,
            content
        };
    } catch (error) {
        console.warn(`⚠️ Error reading ${filePath}:`, error.message);
        return { file: filePath, components: [], content: '' };
    }
}

/**
 * Check if a component is used in any file
 */
function isComponentUsed(componentName, allFiles, sourceFile) {
    let usageCount = 0;
    const usedIn = [];
    
    for (const fileInfo of allFiles) {
        if (fileInfo.file === sourceFile) continue; // Skip self-reference
        
        // Check for imports
        const importRegex = new RegExp(`import.*\\b${componentName}\\b`, 'g');
        if (importRegex.test(fileInfo.content)) {
            usageCount++;
            usedIn.push(fileInfo.file);
            continue;
        }
        
        // Check for usage in JSX
        const jsxRegex = new RegExp(`<${componentName}[\\s/>]`, 'g');
        if (jsxRegex.test(fileInfo.content)) {
            usageCount++;
            usedIn.push(fileInfo.file);
            continue;
        }
        
        // Check for direct function calls
        const callRegex = new RegExp(`\\b${componentName}\\s*\\(`, 'g');
        if (callRegex.test(fileInfo.content)) {
            usageCount++;
            usedIn.push(fileInfo.file);
        }
    }
    
    return { used: usageCount > 0, usageCount, usedIn };
}

/**
 * Identify legacy/outdated components based on naming patterns
 */
function identifyLegacyComponents(componentName, filePath) {
    const legacyPatterns = [
        /legacy/i,
        /old/i,
        /deprecated/i,
        /temp/i,
        /test/i,
        /backup/i,
        /copy/i,
        /v1/i,
        /original/i,
        /simple/i
    ];
    
    const isLegacy = legacyPatterns.some(pattern => 
        pattern.test(componentName) || pattern.test(filePath)
    );
    
    return isLegacy;
}

async function analyzeComponents() {
    try {
        const srcDir = path.join(projectRoot, 'src');
        
        if (!fs.existsSync(srcDir)) {
            console.log('❌ No src directory found');
            return;
        }
        
        console.log('📂 Scanning source files...');
        const sourceFiles = findSourceFiles(srcDir);
        console.log(`📄 Found ${sourceFiles.length} source files`);
        
        // Extract component information
        const allFiles = sourceFiles.map(extractComponentInfo);
        
        // Analyze usage
        const unusedComponents = [];
        const legacyComponents = [];
        const allComponents = [];
        
        console.log('🔍 Analyzing component usage...');
        
        for (const fileInfo of allFiles) {
            for (const component of fileInfo.components) {
                const usage = isComponentUsed(component, allFiles, fileInfo.file);
                const isLegacy = identifyLegacyComponents(component, fileInfo.file);
                
                const componentInfo = {
                    name: component,
                    file: fileInfo.file,
                    used: usage.used,
                    usageCount: usage.usageCount,
                    usedIn: usage.usedIn,
                    isLegacy
                };
                
                allComponents.push(componentInfo);
                
                if (!usage.used) {
                    unusedComponents.push(componentInfo);
                }
                
                if (isLegacy) {
                    legacyComponents.push(componentInfo);
                }
            }
        }
        
        // Generate report
        console.log('\n📊 COMPONENT ANALYSIS REPORT');
        console.log('=' .repeat(50));
        
        console.log(`\n📈 Summary:`);
        console.log(`   Total Components: ${allComponents.length}`);
        console.log(`   Unused Components: ${unusedComponents.length}`);
        console.log(`   Legacy Components: ${legacyComponents.length}`);
        
        if (unusedComponents.length > 0) {
            console.log(`\n🗑️ UNUSED COMPONENTS (${unusedComponents.length}):`);
            unusedComponents.forEach(comp => {
                const relativePath = path.relative(projectRoot, comp.file);
                console.log(`   ❌ ${comp.name} in ${relativePath}`);
            });
        }
        
        if (legacyComponents.length > 0) {
            console.log(`\n⚠️ LEGACY COMPONENTS (${legacyComponents.length}):`);
            legacyComponents.forEach(comp => {
                const relativePath = path.relative(projectRoot, comp.file);
                const status = comp.used ? '🔗 Used' : '❌ Unused';
                console.log(`   📦 ${comp.name} in ${relativePath} - ${status}`);
            });
        }
        
        // Save detailed report
        const reportDir = path.join(projectRoot, 'docs', 'reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const reportPath = path.join(reportDir, 'component-usage-analysis.md');
        const reportContent = generateDetailedReport(allComponents, unusedComponents, legacyComponents);
        fs.writeFileSync(reportPath, reportContent);
        
        console.log(`\n📄 Detailed report saved to: docs/reports/component-usage-analysis.md`);
        
        // Immediate cleanup recommendations
        console.log(`\n🚀 IMMEDIATE CLEANUP RECOMMENDATIONS:`);
        
        const safeToRemove = unusedComponents.filter(comp => 
            !comp.file.includes('types') && 
            !comp.file.includes('utils') &&
            !comp.file.includes('constants')
        );
        
        if (safeToRemove.length > 0) {
            console.log(`   🎯 Safe to remove (${safeToRemove.length} files):`);
            safeToRemove.forEach(comp => {
                const relativePath = path.relative(projectRoot, comp.file);
                console.log(`      rm "${relativePath}"`);
            });
        }
        
        console.log(`\n✅ Component analysis complete!`);
        
    } catch (error) {
        console.error('❌ Error during analysis:', error);
    }
}

function generateDetailedReport(allComponents, unusedComponents, legacyComponents) {
    const timestamp = new Date().toISOString();
    
    return `# Component Usage Analysis Report

**Generated**: ${timestamp}
**Total Components Analyzed**: ${allComponents.length}

## Summary

- 📊 **Total Components**: ${allComponents.length}
- 🗑️ **Unused Components**: ${unusedComponents.length}
- ⚠️ **Legacy Components**: ${legacyComponents.length}
- 🎯 **Cleanup Potential**: ${unusedComponents.length + legacyComponents.filter(c => !c.used).length} files

## Unused Components

${unusedComponents.map(comp => {
    const relativePath = comp.file.replace(process.cwd(), '.');
    return `### ${comp.name}
- **File**: \`${relativePath}\`
- **Status**: Unused (safe to remove)
- **Legacy**: ${comp.isLegacy ? 'Yes' : 'No'}
`;
}).join('\n')}

## Legacy Components

${legacyComponents.map(comp => {
    const relativePath = comp.file.replace(process.cwd(), '.');
    return `### ${comp.name}
- **File**: \`${relativePath}\`
- **Used**: ${comp.used ? 'Yes' : 'No'}
- **Usage Count**: ${comp.usageCount}
- **Status**: ${comp.used ? 'Review for modernization' : 'Safe to remove'}
`;
}).join('\n')}

## Cleanup Commands

\`\`\`bash
# Remove unused component files (review before running)
${unusedComponents.map(comp => `rm "${comp.file.replace(process.cwd() + '/', '')}"`).join('\n')}
\`\`\`

## Next Steps

1. ✅ Review unused components listed above
2. ✅ Remove safe-to-delete files  
3. ✅ Modernize legacy components still in use
4. ✅ Update imports and references
5. ✅ Run tests to ensure no breakage

---
*Generated by ResearchHub Component Analyzer*
`;
}

// Run the analysis
analyzeComponents().catch(console.error);
