#!/usr/bin/env node

/**
 * ResearchHub Environment Setup Automation
 * Vibe-Coder-MCP Implementation - Task 1.3
 * 
 * Automates the complete development environment setup
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n📋 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit', cwd: PROJECT_ROOT });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(path.join(PROJECT_ROOT, filePath));
  log(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'Found' : 'Missing'}`, exists ? 'green' : 'red');
  return exists;
}

function createEnvFile() {
  log('\n🔧 Setting up environment files...', 'cyan');
  
  const envExample = path.join(PROJECT_ROOT, '.env.example');
  const envFile = path.join(PROJECT_ROOT, '.env');
  
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    log('✅ Created .env from .env.example', 'green');
    log('⚠️  Please update .env with your actual values', 'yellow');
  } else if (fs.existsSync(envFile)) {
    log('✅ .env file already exists', 'green');
  } else {
    log('❌ No .env.example found to copy from', 'red');
  }
}

function validateNodeVersion() {
  log('\n🔍 Validating Node.js version...', 'cyan');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion >= 18) {
    log(`✅ Node.js ${nodeVersion} is compatible`, 'green');
    return true;
  } else {
    log(`❌ Node.js ${nodeVersion} is too old. Please upgrade to Node.js 18+`, 'red');
    return false;
  }
}

function checkDependencies() {
  log('\n📦 Checking dependencies...', 'cyan');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
  const nodeModules = path.join(PROJECT_ROOT, 'node_modules');
  
  if (!fs.existsSync(nodeModules)) {
    log('❌ node_modules not found. Running npm install...', 'yellow');
    return execCommand('npm install', 'Installing dependencies');
  } else {
    log('✅ node_modules found', 'green');
    return true;
  }
}

function validateTypeScript() {
  log('\n🔧 Validating TypeScript configuration...', 'cyan');
  
  return execCommand('npx tsc --noEmit', 'TypeScript validation');
}

function setupGitHooks() {
  log('\n🪝 Setting up Git hooks...', 'cyan');
  
  const hooksDir = path.join(PROJECT_ROOT, '.git', 'hooks');
  const preCommitHook = path.join(hooksDir, 'pre-commit');
  
  if (!fs.existsSync(preCommitHook)) {
    const hookContent = `#!/bin/sh
# Pre-commit hook for ResearchHub
# Run TypeScript validation before commit

echo "🔍 Running pre-commit checks..."

# TypeScript validation
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript validation failed"
  exit 1
fi

echo "✅ Pre-commit checks passed"
`;
    
    fs.writeFileSync(preCommitHook, hookContent);
    fs.chmodSync(preCommitHook, '755');
    log('✅ Git pre-commit hook installed', 'green');
  } else {
    log('✅ Git pre-commit hook already exists', 'green');
  }
}

function generateSetupReport() {
  log('\n📊 Generating setup report...', 'cyan');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    projectRoot: PROJECT_ROOT,
    checks: {
      nodeVersion: validateNodeVersion(),
      packageJson: checkFile('package.json', 'package.json'),
      envExample: checkFile('.env.example', '.env.example'),
      envFile: checkFile('.env', '.env file'),
      nodeModules: checkFile('node_modules', 'node_modules'),
      srcDirectory: checkFile('src', 'src directory'),
      apiDirectory: checkFile('api', 'api directory'),
      docsDirectory: checkFile('docs', 'docs directory'),
      scriptsDirectory: checkFile('scripts', 'scripts directory'),
      testingDirectory: checkFile('testing', 'testing directory')
    }
  };
  
  const reportPath = path.join(PROJECT_ROOT, 'docs', 'setup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`✅ Setup report saved to docs/setup-report.json`, 'green');
  
  return report;
}

async function main() {
  log('🚀 ResearchHub Environment Setup Automation', 'bright');
  log('=' .repeat(50), 'blue');
  
  // Validate Node.js version
  if (!validateNodeVersion()) {
    process.exit(1);
  }
  
  // Create environment file
  createEnvFile();
  
  // Check and install dependencies
  if (!checkDependencies()) {
    log('❌ Dependency installation failed', 'red');
    process.exit(1);
  }
  
  // Validate TypeScript
  if (!validateTypeScript()) {
    log('⚠️  TypeScript validation failed, but continuing...', 'yellow');
  }
  
  // Setup Git hooks
  setupGitHooks();
  
  // Generate setup report
  const report = generateSetupReport();
  
  // Final summary
  log('\n🎉 Environment Setup Complete!', 'bright');
  log('=' .repeat(50), 'blue');
  
  const passedChecks = Object.values(report.checks).filter(Boolean).length;
  const totalChecks = Object.keys(report.checks).length;
  
  log(`✅ Passed: ${passedChecks}/${totalChecks} checks`, 'green');
  
  if (passedChecks === totalChecks) {
    log('🎯 All checks passed! Your environment is ready.', 'green');
  } else {
    log('⚠️  Some checks failed. Please review the output above.', 'yellow');
  }
  
  log('\n📋 Next steps:', 'cyan');
  log('1. Update .env with your actual values', 'blue');
  log('2. Run: npm run dev:fullstack', 'blue');
  log('3. Open: http://localhost:5175', 'blue');
  
  log('\n📊 Setup report saved to docs/setup-report.json', 'cyan');
}

if (import.meta.url === `file://${__filename}`) {
  main().catch(error => {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { main as setupEnvironment };
