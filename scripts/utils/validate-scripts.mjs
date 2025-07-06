#!/usr/bin/env node

/**
 * ResearchHub Script Validation Tool
 * Validates that all npm scripts work correctly
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Validating npm scripts...');
console.log('=' .repeat(40));

try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = pkg.scripts;
  
  // Test critical scripts that should always work
  const criticalScripts = [
    'type-check',
    'config:test',
    'scripts:help',
    'vibe:status'
  ];
  
  let passedCount = 0;
  
  for (const script of criticalScripts) {
    try {
      console.log(`Testing: npm run ${script}`);
      const result = execSync(`npm run ${script}`, { 
        encoding: 'utf8', 
        timeout: 30000,
        stdio: 'pipe'
      });
      console.log(`✅ ${script} - OK`);
      passedCount++;
    } catch (error) {
      console.log(`❌ ${script} - Failed`);
    }
  }
  
  console.log(`\n📊 Validation Results: ${passedCount}/${criticalScripts.length} scripts working`);
  
  if (passedCount === criticalScripts.length) {
    console.log('🎉 All critical scripts are working!');
  } else {
    console.log('⚠️  Some scripts need attention');
  }
  
} catch (error) {
  console.log('❌ Validation failed:', error.message);
}
