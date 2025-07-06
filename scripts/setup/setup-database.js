#!/usr/bin/env node

/**
 * ResearchHub Database Setup Automation
 * Vibe-Coder-MCP Implementation - Task 1.3
 * 
 * Automates database setup and validation
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

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

// Required tables for ResearchHub
const REQUIRED_TABLES = [
  'users',
  'profiles',
  'studies',
  'study_blocks',
  'study_sessions',
  'applications',
  'collaboration_invites',
  'collaboration_comments',
  'payment_requests',
  'notifications'
];

// Required RLS policies
const REQUIRED_POLICIES = [
  { table: 'profiles', policy: 'Users can view own profile' },
  { table: 'studies', policy: 'Researchers can manage their studies' },
  { table: 'applications', policy: 'Participants can manage their applications' },
  { table: 'study_sessions', policy: 'Session access control' }
];

async function validateEnvironment() {
  log('\n🔍 Validating environment variables...', 'cyan');
  
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, 'red');
    log('📋 Please update your .env file with the required values', 'yellow');
    return false;
  }
  
  log('✅ All required environment variables found', 'green');
  return true;
}

async function createSupabaseClient() {
  if (!await validateEnvironment()) {
    throw new Error('Environment validation failed');
  }
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  log('\n🔗 Connecting to Supabase...', 'cyan');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected for new setups
      throw error;
    }
    
    log('✅ Successfully connected to Supabase', 'green');
    return supabase;
  } catch (error) {
    log(`❌ Failed to connect to Supabase: ${error.message}`, 'red');
    throw error;
  }
}

async function checkTableExists(supabase, tableName) {
  try {
    const { error } = await supabase.from(tableName).select('*').limit(1);
    
    if (error && error.code === 'PGRST116') {
      return false; // Table doesn't exist
    }
    
    return !error; // Table exists if no error or different error
  } catch (error) {
    return false;
  }
}

async function validateDatabase(supabase) {
  log('\n🗄️  Validating database structure...', 'cyan');
  
  const tableStatus = {};
  
  for (const tableName of REQUIRED_TABLES) {
    const exists = await checkTableExists(supabase, tableName);
    tableStatus[tableName] = exists;
    
    log(`${exists ? '✅' : '❌'} Table: ${tableName}`, exists ? 'green' : 'red');
  }
  
  const existingTables = Object.values(tableStatus).filter(Boolean).length;
  const totalTables = REQUIRED_TABLES.length;
  
  log(`\n📊 Database Status: ${existingTables}/${totalTables} tables found`, 
    existingTables === totalTables ? 'green' : 'yellow');
  
  return { tableStatus, existingTables, totalTables };
}

async function checkRLSPolicies(supabase) {
  log('\n🔐 Checking RLS policies...', 'cyan');
  
  try {
    // This query checks for RLS policies in PostgreSQL
    const { data, error } = await supabase.rpc('check_rls_enabled');
    
    if (error) {
      log('ℹ️  Unable to check RLS policies automatically', 'yellow');
      log('📋 Please verify RLS policies are enabled in Supabase dashboard', 'blue');
      return false;
    }
    
    log('✅ RLS policies check completed', 'green');
    return true;
  } catch (error) {
    log('ℹ️  RLS policy check not available', 'yellow');
    return false;
  }
}

async function createMissingTables(supabase, tableStatus) {
  log('\n🛠️  Creating missing tables...', 'cyan');
  
  const missingTables = Object.entries(tableStatus)
    .filter(([_, exists]) => !exists)
    .map(([tableName]) => tableName);
  
  if (missingTables.length === 0) {
    log('✅ All required tables exist', 'green');
    return true;
  }
  
  log(`📋 Missing tables: ${missingTables.join(', ')}`, 'yellow');
  log('⚠️  Please run database migrations or check Supabase dashboard', 'yellow');
  log('📚 See docs/DATABASE_SETUP_GUIDE.md for detailed instructions', 'blue');
  
  return false;
}

async function testDatabaseOperations(supabase) {
  log('\n🧪 Testing database operations...', 'cyan');
  
  const tests = [
    {
      name: 'Test profiles read',
      test: async () => {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        return !error || error.code === 'PGRST116';
      }
    },
    {
      name: 'Test studies read',
      test: async () => {
        const { error } = await supabase.from('studies').select('id').limit(1);
        return !error || error.code === 'PGRST116';
      }
    },
    {
      name: 'Test applications read',
      test: async () => {
        const { error } = await supabase.from('applications').select('id').limit(1);
        return !error || error.code === 'PGRST116';
      }
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      log(`${result ? '✅' : '❌'} ${test.name}`, result ? 'green' : 'red');
      if (result) passedTests++;
    } catch (error) {
      log(`❌ ${test.name}: ${error.message}`, 'red');
    }
  }
  
  log(`\n📊 Database Tests: ${passedTests}/${tests.length} passed`, 
    passedTests === tests.length ? 'green' : 'yellow');
  
  return passedTests === tests.length;
}

async function generateDatabaseReport(supabase, validationResults) {
  log('\n📊 Generating database setup report...', 'cyan');
  
  const report = {
    timestamp: new Date().toISOString(),
    supabaseUrl: process.env.SUPABASE_URL,
    validation: validationResults,
    recommendations: []
  };
  
  // Add recommendations based on results
  if (validationResults.existingTables < validationResults.totalTables) {
    report.recommendations.push('Run database migrations to create missing tables');
    report.recommendations.push('Check Supabase dashboard for table structure');
  }
  
  if (validationResults.existingTables === 0) {
    report.recommendations.push('This appears to be a fresh Supabase project');
    report.recommendations.push('Follow the database setup guide in docs/DATABASE_SETUP_GUIDE.md');
  }
  
  const reportPath = path.join(PROJECT_ROOT, 'docs', 'database-setup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`✅ Database report saved to docs/database-setup-report.json`, 'green');
  
  return report;
}

async function main() {
  log('🗄️  ResearchHub Database Setup Automation', 'bright');
  log('=' .repeat(50), 'blue');
  
  try {
    // Create Supabase client
    const supabase = await createSupabaseClient();
    
    // Validate database structure
    const validationResults = await validateDatabase(supabase);
    
    // Check RLS policies
    await checkRLSPolicies(supabase);
    
    // Create missing tables (or show instructions)
    await createMissingTables(supabase, validationResults.tableStatus);
    
    // Test database operations
    await testDatabaseOperations(supabase);
    
    // Generate report
    const report = await generateDatabaseReport(supabase, validationResults);
    
    // Final summary
    log('\n🎉 Database Setup Check Complete!', 'bright');
    log('=' .repeat(50), 'blue');
    
    if (validationResults.existingTables === validationResults.totalTables) {
      log('🎯 Database is fully configured and ready!', 'green');
    } else {
      log('⚠️  Database setup is incomplete. Please follow the recommendations.', 'yellow');
      log('📚 See docs/DATABASE_SETUP_GUIDE.md for detailed instructions', 'blue');
    }
    
    log('\n📊 Database report saved to docs/database-setup-report.json', 'cyan');
    
  } catch (error) {
    log(`❌ Database setup failed: ${error.message}`, 'red');
    
    if (error.message.includes('Environment validation failed')) {
      log('\n📋 To fix this:', 'yellow');
      log('1. Copy .env.example to .env', 'blue');
      log('2. Add your Supabase URL and keys to .env', 'blue');
      log('3. Get your keys from: https://supabase.com/dashboard', 'blue');
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${__filename}`) {
  main();
}

export { main as setupDatabase };
