#!/usr/bin/env node
/**
 * Accurate Component Usage Analysis
 * Analyzes actual ResearchHub component structure
 */

import fs from 'fs/promises';
import path from 'path';

async function accurateComponentAnalysis() {
  console.log('🔍 ResearchHub Component Analysis Starting...\n');
  
  const componentsDir = path.join(process.cwd(), 'src', 'client', 'components');
  const srcDir = path.join(process.cwd(), 'src');
  const findings = [];
  
  try {
    // Get all component files
    const allSrcFiles = await getAllFiles(srcDir);
    const componentFiles = await getAllFiles(componentsDir);
    
    const tsxComponents = componentFiles.filter(file => 
      file.endsWith('.tsx') && 
      !file.includes('.test.') && 
      !file.includes('.spec.')
    );

    console.log(`📊 Found ${tsxComponents.length} component files to analyze`);
    console.log(`📂 Scanning ${allSrcFiles.length} total source files for usage\n`);

    // Analyze first 15 components for speed
    const sampleComponents = tsxComponents.slice(0, 15);
    
    for (const componentFile of sampleComponents) {
      const componentName = path.basename(componentFile, '.tsx');
      const usageCount = await accurateUsageCheck(componentName, allSrcFiles);
      
      findings.push({
        name: componentName,
        file: path.relative(process.cwd(), componentFile),
        usages: usageCount,
        status: usageCount <= 1 ? '🔴 Unused/Low' : usageCount < 5 ? '🟡 Limited' : '🟢 Well Used',
        category: getComponentCategory(componentFile)
      });
    }

    // Sort by usage (lowest first)
    findings.sort((a, b) => a.usages - b.usages);

    // Display results
    console.log('📋 COMPONENT USAGE ANALYSIS (Sample):');
    console.log('=' .repeat(70));
    
    findings.forEach(finding => {
      console.log(`${finding.status} ${finding.name} (${finding.category})`);
      console.log(`   📁 ${finding.file}`);
      console.log(`   🔢 Found in ${finding.usages} files\n`);
    });

    // Summary
    const unused = findings.filter(f => f.usages <= 1).length;
    const limited = findings.filter(f => f.usages > 1 && f.usages < 5).length;
    const wellUsed = findings.filter(f => f.usages >= 5).length;
    
    console.log('🎯 USAGE ANALYSIS SUMMARY:');
    console.log(`   🔴 Unused/Low Usage: ${unused} components`);
    console.log(`   🟡 Limited Usage: ${limited} components`);
    console.log(`   🟢 Well Used: ${wellUsed} components`);
    console.log(`   📊 Total Analyzed: ${findings.length} (sample)`);
    console.log(`   📈 Total Components: ${tsxComponents.length}`);
    
    const estimatedUnused = Math.floor((unused / findings.length) * tsxComponents.length);
    console.log(`   🎯 Estimated Cleanup Potential: ~${estimatedUnused} components\n`);
    
    console.log('💡 CLEANUP RECOMMENDATIONS:');
    findings.filter(f => f.usages <= 1).forEach(f => {
      console.log(`   🗑️  Consider removing: ${f.name} (${f.usages} usages)`);
    });
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Review the unused components above');
    console.log('   2. Run: npm run cleanup:components:remove');
    console.log('   3. Test: npm run test:quick');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

function getComponentCategory(filePath) {
  if (filePath.includes('/ui/')) return 'UI';
  if (filePath.includes('/admin/')) return 'Admin';
  if (filePath.includes('/studies/')) return 'Studies';
  if (filePath.includes('/auth/')) return 'Auth';
  if (filePath.includes('/analytics/')) return 'Analytics';
  if (filePath.includes('/study-builder/')) return 'Builder';
  if (filePath.includes('/blocks/')) return 'Blocks';
  if (filePath.includes('/common/')) return 'Common';
  if (filePath.includes('/dashboard/')) return 'Dashboard';
  return 'Other';
}

async function accurateUsageCheck(componentName, allFiles) {
  let usageCount = 0;
  
  // Multiple search patterns for better accuracy
  const patterns = [
    new RegExp(`import.*\\b${componentName}\\b.*from`, 'gi'),
    new RegExp(`<${componentName}[\\s/>]`, 'gi'),
    new RegExp(`\\b${componentName}\\s*\\(`, 'gi'),
    new RegExp(`export.*\\b${componentName}\\b`, 'gi')
  ];

  for (const file of allFiles) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
    
    try {
      const content = await fs.readFile(file, 'utf8');
      
      let hasUsage = false;
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          hasUsage = true;
          break;
        }
      }
      
      if (hasUsage) usageCount++;
      
    } catch (error) {
      // Skip unreadable files
    }
  }

  return usageCount;
}

async function getAllFiles(dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...await getAllFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip unreadable directories
  }

  return files;
}

// Run analysis
accurateComponentAnalysis().catch(console.error);
