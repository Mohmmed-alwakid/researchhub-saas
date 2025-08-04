#!/usr/bin/env node
/**
 * Quick Component Usage Analysis
 * Fast component cleanup identification
 */

import fs from 'fs/promises';
import path from 'path';

async function quickComponentAnalysis() {
  console.log('🔍 Quick Component Analysis Starting...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const findings = [];
  
  try {
    // Get all TypeScript/React files
    const allFiles = await getAllFiles(srcDir);
    const componentFiles = allFiles.filter(file => 
      (file.endsWith('.tsx') || file.endsWith('.ts')) && 
      !file.includes('.test.') && 
      !file.includes('.spec.') &&
      file.includes('/components/')
    );

    console.log(`📊 Found ${componentFiles.length} component files to analyze`);
    console.log(`📂 Analyzing ${allFiles.length} total source files\n`);

    // Quick sample analysis of first 10 components
    const sampleComponents = componentFiles.slice(0, 10);
    
    for (const componentFile of sampleComponents) {
      const componentName = path.basename(componentFile).replace(/\.(tsx?|jsx?)$/, '');
      const usageCount = await quickUsageCheck(componentName, allFiles);
      
      findings.push({
        name: componentName,
        file: path.relative(process.cwd(), componentFile),
        usages: usageCount,
        status: usageCount === 0 ? '🔴 Unused' : usageCount === 1 ? '🟡 Low Usage' : '🟢 Used'
      });
    }

    // Display results
    console.log('📋 SAMPLE ANALYSIS RESULTS (First 10 Components):');
    console.log('=' .repeat(60));
    
    findings.forEach(finding => {
      console.log(`${finding.status} ${finding.name}`);
      console.log(`   📁 ${finding.file}`);
      console.log(`   🔢 Usage count: ${finding.usages}\n`);
    });

    const unusedCount = findings.filter(f => f.usages === 0).length;
    const lowUsageCount = findings.filter(f => f.usages === 1).length;
    
    console.log('🎯 QUICK ANALYSIS SUMMARY:');
    console.log(`   • ${unusedCount} completely unused components (in sample)`);
    console.log(`   • ${lowUsageCount} low-usage components (in sample)`);
    console.log(`   • ${componentFiles.length} total components found`);
    console.log(`   • Estimated unused: ${Math.floor((unusedCount / sampleComponents.length) * componentFiles.length)}`);
    
    console.log('\n🚀 To run full cleanup:');
    console.log('   npm run cleanup:components:remove');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

async function quickUsageCheck(componentName, allFiles) {
  let usageCount = 0;
  const searchPattern = new RegExp(`\\b${componentName}\\b`, 'gi');
  
  // Check only key files for speed
  const keyFiles = allFiles.filter(file => 
    file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')
  ).slice(0, 100); // Limit for speed

  for (const file of keyFiles) {
    try {
      const content = await fs.readFile(file, 'utf8');
      const matches = content.match(searchPattern);
      if (matches) {
        usageCount += matches.length;
      }
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
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip unreadable directories
  }

  return files;
}

// Run analysis
quickComponentAnalysis().catch(console.error);
