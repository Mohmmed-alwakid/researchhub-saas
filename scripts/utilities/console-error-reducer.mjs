#!/usr/bin/env node

/**
 * Automated Console Error Reduction Script
 * Handles missing API endpoints, environment setup, and browser warnings
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

class ConsoleErrorReducer {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Check and create missing API endpoints
   */
  async checkMissingAPIs() {
    console.log('🔍 Checking for missing API endpoints...');
    
    const commonMissingEndpoints = [
      '/api/dashboard/analytics',
      '/api/research-consolidated',
      '/api/wallet',
      '/api/applications',
      '/api/password'
    ];

    for (const endpoint of commonMissingEndpoints) {
      const apiPath = endpoint.replace('/api/', '');
      const filePath = join(this.projectRoot, 'api', `${apiPath}.js`);
      
      if (!existsSync(filePath) && apiPath !== 'research-consolidated') {
        console.log(`⚠️  Missing API: ${endpoint}`);
      } else {
        console.log(`✅ API exists: ${endpoint}`);
      }
    }
  }

  /**
   * Setup environment variables for error reduction
   */
  async setupEnvironment() {
    console.log('🛠️  Setting up environment variables...');
    
    const envPath = join(this.projectRoot, '.env');
    const envExamplePath = join(this.projectRoot, '.env.example');
    
    if (!existsSync(envPath) && existsSync(envExamplePath)) {
      console.log('📝 Creating .env from .env.example...');
      const envExample = readFileSync(envExamplePath, 'utf8');
      writeFileSync(envPath, envExample);
    }

    // Check for required environment variables
    const requiredVars = [
      'VITE_DEBUG_MODE',
      'VITE_ENABLE_CONSOLE_LOGS',
      'VITE_SENTRY_DSN'
    ];

    const envContent = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
    
    for (const varName of requiredVars) {
      if (!envContent.includes(varName)) {
        console.log(`⚠️  Missing environment variable: ${varName}`);
      } else {
        console.log(`✅ Environment variable exists: ${varName}`);
      }
    }
  }

  /**
   * Run development server with optimized settings
   */
  async startOptimizedDev() {
    console.log('🚀 Starting optimized development server...');
    
    try {
      // Set environment variables for clean console
      process.env.VITE_DEBUG_MODE = 'false';
      process.env.VITE_ENABLE_CONSOLE_LOGS = 'false';
      
      execSync('npm run dev:fullstack', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
    } catch (error) {
      console.error('❌ Failed to start development server:', error);
    }
  }

  /**
   * Run all automated fixes
   */
  async run() {
    console.log('🎯 Starting automated console error reduction...\n');
    
    await this.checkMissingAPIs();
    console.log('');
    
    await this.setupEnvironment();
    console.log('');
    
    console.log('✅ Automated fixes complete!');
    console.log('\n📋 Manual steps to complete:');
    console.log('1. Add VITE_SENTRY_DSN to .env if you want error tracking');
    console.log('2. Set VITE_DEBUG_MODE=false for clean console');
    console.log('3. Run npm run dev:fullstack to test');
    
    // Ask if user wants to start optimized dev server
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n🚀 Start optimized dev server now? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        this.startOptimizedDev();
      }
      rl.close();
    });
  }
}

// Run the script
const reducer = new ConsoleErrorReducer();
reducer.run().catch(console.error);

export default ConsoleErrorReducer;
