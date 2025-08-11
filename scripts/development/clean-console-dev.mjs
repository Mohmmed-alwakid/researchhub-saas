#!/usr/bin/env node

/**
 * Clean Console Development Script
 * Runs development server with minimal console output
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

class CleanConsoleDev {
  constructor() {
    this.projectRoot = process.cwd();
    this.envPath = join(this.projectRoot, '.env');
  }

  /**
   * Temporarily set debug mode to false for clean console
   */
  setCleanMode() {
    console.log('🧹 Setting clean console mode...');
    
    try {
      let envContent = readFileSync(this.envPath, 'utf8');
      
      // Ensure debug mode is off
      if (envContent.includes('VITE_DEBUG_MODE=')) {
        envContent = envContent.replace(/VITE_DEBUG_MODE=.*/g, 'VITE_DEBUG_MODE=false');
      } else {
        envContent += '\nVITE_DEBUG_MODE=false';
      }
      
      // Ensure console logs are disabled
      if (envContent.includes('VITE_ENABLE_CONSOLE_LOGS=')) {
        envContent = envContent.replace(/VITE_ENABLE_CONSOLE_LOGS=.*/g, 'VITE_ENABLE_CONSOLE_LOGS=false');
      } else {
        envContent += '\nVITE_ENABLE_CONSOLE_LOGS=false';
      }
      
      writeFileSync(this.envPath, envContent);
      console.log('✅ Clean console mode enabled');
    } catch (error) {
      console.log('⚠️  Could not update .env file:', error.message);
    }
  }

  /**
   * Start development server with clean console
   */
  startCleanDev() {
    console.log('🚀 Starting development server with clean console...');
    console.log('📝 Console logs are suppressed for cleaner development experience');
    console.log('💡 To enable debug logs, set VITE_DEBUG_MODE=true in .env');
    console.log('');
    
    try {
      // Start the full development stack
      execSync('npm run dev:fullstack', { 
        stdio: 'inherit',
        cwd: this.projectRoot
      });
    } catch (error) {
      console.error('❌ Failed to start development server:', error.message);
      process.exit(1);
    }
  }

  /**
   * Main execution
   */
  run() {
    console.log('🎯 Clean Console Development Mode');
    console.log('==================================');
    
    this.setCleanMode();
    this.startCleanDev();
  }
}

// Run the script
const cleanDev = new CleanConsoleDev();
cleanDev.run();
