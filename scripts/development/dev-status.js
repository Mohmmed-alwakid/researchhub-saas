#!/usr/bin/env node

/**
 * ResearchHub Development Status Checker
 * Quick status check for the development environment
 */

import { execSync } from 'child_process';
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' }).trim();
    return result.length > 0;
  } catch {
    return false;
  }
}

async function checkSupabaseConnection() {
  try {
    // Simple environment check for now
    const envPath = path.join(PROJECT_ROOT, '.env');
    if (!fs.existsSync(envPath)) {
      return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    return envContent.includes('SUPABASE_URL') && envContent.includes('SUPABASE_ANON_KEY');
  } catch {
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(PROJECT_ROOT, filePath));
}

async function main() {
  log('🔍 ResearchHub Development Status', 'bright');
  log('=' .repeat(40), 'blue');
  
  // Check servers
  const frontendRunning = checkPort(5175);
  const backendRunning = checkPort(3003);
  
  log(`${frontendRunning ? '✅' : '❌'} Frontend server (port 5175): ${frontendRunning ? 'Running' : 'Not running'}`, 
    frontendRunning ? 'green' : 'red');
  log(`${backendRunning ? '✅' : '❌'} Backend server (port 3003): ${backendRunning ? 'Running' : 'Not running'}`, 
    backendRunning ? 'green' : 'red');
  
  // Check environment
  const envExists = checkFileExists('.env');
  log(`${envExists ? '✅' : '❌'} Environment file (.env): ${envExists ? 'Found' : 'Missing'}`, 
    envExists ? 'green' : 'red');
  
  // Check Supabase configuration
  log('\n🔗 Checking Supabase configuration...', 'cyan');
  const supabaseOk = await checkSupabaseConnection();
  log(`${supabaseOk ? '✅' : '❌'} Supabase configuration: ${supabaseOk ? 'Configured' : 'Missing'}`, 
    supabaseOk ? 'green' : 'red');
  
  // Check key files
  log('\n📁 Checking key files...', 'cyan');
  const keyFiles = [
    'package.json',
    'src/client/main.tsx',
    'api/health.js',
    'tsconfig.json'
  ];
  
  for (const file of keyFiles) {
    const exists = checkFileExists(file);
    log(`${exists ? '✅' : '❌'} ${file}`, exists ? 'green' : 'red');
  }
  
  // Overall status
  log('\n🎯 Overall Status', 'cyan');
  const allGood = frontendRunning && backendRunning && envExists && supabaseOk;
  
  if (allGood) {
    log('✅ Development environment is fully operational!', 'green');
    log('\n🌐 Access your application:', 'cyan');
    log('Frontend: http://localhost:5175', 'blue');
    log('Backend API: http://localhost:3003', 'blue');
  } else {
    log('⚠️  Development environment needs attention', 'yellow');
    
    log('\n🔧 To start the development environment:', 'cyan');
    log('npm run dev:fullstack', 'blue');
    
    if (!envExists) {
      log('\n📋 To set up environment:', 'cyan');
      log('1. Copy .env.example to .env', 'blue');
      log('2. Add your Supabase credentials', 'blue');
    }
    
    if (!supabaseOk) {
      log('\n🗄️  Database connection issues:', 'cyan');
      log('1. Check your .env file has correct Supabase URL and keys', 'blue');
      log('2. Verify your Supabase project is active', 'blue');
    }
  }
  
  log('\n📚 Quick commands:', 'cyan');
  log('npm run dev:fullstack    # Start full development environment', 'blue');
  log('npm run setup:complete   # Run complete setup automation', 'blue');
  log('npm run vibe:status      # Check Vibe-Coder implementation progress', 'blue');
  log('npm run config:test      # Test configuration system', 'blue');
}

if (import.meta.url === `file://${__filename}`) {
  main().catch(error => {
    log(`❌ Status check failed: ${error.message}`, 'red');
  });
}
