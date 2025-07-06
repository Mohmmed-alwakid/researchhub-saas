#!/usr/bin/env node

/**
 * ResearchHub Complete Setup Automation
 * Vibe-Coder-MCP Implementation - Task 1.3
 * 
 * Master setup script that runs all setup automation scripts in sequence
 */

import { setupEnvironment } from './setup-environment.js';
import { setupDatabase } from './setup-database.js';
import { setupDevelopmentTools } from './setup-development-tools.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runSetupStep(stepName, setupFunction, required = true) {
  log(`\n🚀 Starting: ${stepName}`, 'cyan');
  log('=' .repeat(60), 'blue');
  
  try {
    await setupFunction();
    log(`\n✅ Completed: ${stepName}`, 'green');
    return { success: true, step: stepName };
  } catch (error) {
    log(`\n❌ Failed: ${stepName}`, 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (required) {
      log(`\n⚠️  ${stepName} is required for proper setup`, 'yellow');
      return { success: false, step: stepName, error: error.message, required: true };
    } else {
      log(`\n⚠️  ${stepName} failed but is not critical`, 'yellow');
      return { success: false, step: stepName, error: error.message, required: false };
    }
  }
}

function generateCompleteReport(results) {
  log('\n📊 Generating complete setup report...', 'cyan');
  
  const report = {
    timestamp: new Date().toISOString(),
    setupVersion: '1.0.0',
    totalSteps: results.length,
    successfulSteps: results.filter(r => r.success).length,
    failedSteps: results.filter(r => !r.success).length,
    criticalFailures: results.filter(r => !r.success && r.required).length,
    steps: results,
    summary: {
      overallSuccess: results.filter(r => !r.success && r.required).length === 0,
      readyForDevelopment: false
    }
  };
  
  // Determine if ready for development
  report.summary.readyForDevelopment = report.criticalFailures === 0;
  
  const reportPath = path.join(PROJECT_ROOT, 'docs', 'complete-setup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`✅ Complete setup report saved to docs/complete-setup-report.json`, 'green');
  
  return report;
}

function displayFinalSummary(report) {
  log('\n🎯 RESEARCHHUB SETUP SUMMARY', 'bright');
  log('=' .repeat(60), 'magenta');
  
  const { successfulSteps, failedSteps, criticalFailures, readyForDevelopment } = report.summary;
  
  log(`📊 Steps Completed: ${successfulSteps}/${report.totalSteps}`, 'cyan');
  
  if (criticalFailures === 0) {
    log('✅ All critical setup steps completed successfully!', 'green');
  } else {
    log(`❌ ${criticalFailures} critical setup step(s) failed`, 'red');
  }
  
  if (failedSteps > 0 && criticalFailures === 0) {
    log(`⚠️  ${failedSteps} non-critical step(s) had issues`, 'yellow');
  }
  
  log(`\n🎯 Ready for Development: ${readyForDevelopment ? 'YES' : 'NO'}`, 
    readyForDevelopment ? 'green' : 'red');
  
  if (readyForDevelopment) {
    log('\n🚀 NEXT STEPS:', 'bright');
    log('1. Start development environment:', 'cyan');
    log('   npm run dev:fullstack', 'blue');
    log('\n2. Open your browser:', 'cyan');
    log('   http://localhost:5175', 'blue');
    log('\n3. Check development status:', 'cyan');
    log('   npm run dev:status', 'blue');
    
    log('\n📚 Documentation:', 'cyan');
    log('• Quick Start: docs/QUICK_START_DAY_1.md', 'blue');
    log('• Implementation Plan: docs/VIBE_CODER_IMPLEMENTATION_PLAN.md', 'blue');
    log('• Setup Reports: docs/*-report.json', 'blue');
  } else {
    log('\n🔧 TO FIX ISSUES:', 'bright');
    
    for (const result of report.steps) {
      if (!result.success && result.required) {
        log(`❌ Fix: ${result.step}`, 'red');
        log(`   Error: ${result.error}`, 'yellow');
      }
    }
    
    log('\n📋 Common Solutions:', 'cyan');
    log('• Update .env file with your Supabase credentials', 'blue');
    log('• Ensure Node.js 18+ is installed', 'blue');
    log('• Run: npm install', 'blue');
    log('• Check network connectivity to Supabase', 'blue');
  }
  
  log('\n📊 Detailed reports saved in docs/ directory', 'cyan');
}

async function main() {
  log('🌟 RESEARCHHUB COMPLETE SETUP AUTOMATION', 'bright');
  log('Vibe-Coder-MCP Implementation - Task 1.3', 'cyan');
  log('=' .repeat(60), 'magenta');
  
  const setupSteps = [
    {
      name: 'Environment Setup',
      function: setupEnvironment,
      required: true
    },
    {
      name: 'Database Setup',
      function: setupDatabase,
      required: true
    },
    {
      name: 'Development Tools Setup',
      function: setupDevelopmentTools,
      required: false
    }
  ];
  
  const results = [];
  
  for (const step of setupSteps) {
    const result = await runSetupStep(step.name, step.function, step.required);
    results.push(result);
    
    // If a required step fails, show option to continue or abort
    if (!result.success && result.required) {
      log(`\n⚠️  Critical step "${step.name}" failed.`, 'yellow');
      log('This may cause issues with subsequent steps.', 'yellow');
      log('You may want to fix this issue and run setup again.', 'blue');
      log('\nContinuing with remaining steps...', 'cyan');
    }
  }
  
  // Generate complete report
  const report = generateCompleteReport(results);
  
  // Display final summary
  displayFinalSummary(report);
  
  // Exit with appropriate code
  const exitCode = report.summary.readyForDevelopment ? 0 : 1;
  process.exit(exitCode);
}

if (import.meta.url === `file://${__filename}`) {
  main().catch(error => {
    log(`❌ Setup automation failed: ${error.message}`, 'red');
    log('\n🔧 Please check the error above and try again', 'yellow');
    process.exit(1);
  });
}

export { main as setupComplete };
