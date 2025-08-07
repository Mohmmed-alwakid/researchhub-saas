#!/usr/bin/env node

import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Your preferred ports
const FRONTEND_PORT = 5175;
const API_PORT = 3003;

console.log('🚀 ResearchHub - Simple Force Start on Port 5175');
console.log('=================================================');

async function killProcessOnPort(port) {
  try {
    console.log(`🔍 Checking port ${port}...`);
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (stdout.trim()) {
      console.log(`⚠️  Port ${port} is in use, killing processes...`);
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && pid !== '0') {
          try {
            await execAsync(`taskkill /PID ${pid} /F`);
            console.log(`   ✅ Killed process ${pid}`);
          } catch (error) {
            console.log(`   ⚠️  Could not kill process ${pid} (may already be dead)`);
          }
        }
      }
    } else {
      console.log(`   ✅ Port ${port} is free`);
    }
  } catch (error) {
    console.log(`   ✅ Port ${port} is free (no processes found)`);
  }
}

async function startSimpleServer() {
  console.log('\n🔥 Force killing any conflicting processes...');
  
  // Kill processes on both ports
  await killProcessOnPort(FRONTEND_PORT);
  await killProcessOnPort(API_PORT);
  
  // Wait for ports to be released
  console.log('\n⏳ Waiting 3 seconds for ports to be released...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n🚀 Starting ResearchHub ONLY on dev:fullstack (no conflicts):');
  console.log(`   Frontend: http://localhost:${FRONTEND_PORT}`);
  console.log(`   API: http://localhost:${API_PORT}`);
  console.log('\n📝 This will ONLY start the working local-full-dev.js script...\n');
  
  // Start ONLY the working script
  const devProcess = spawn('node', ['scripts/development/local-full-dev.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    devProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  devProcess.on('error', (error) => {
    console.error('❌ Error starting development server:', error);
    process.exit(1);
  });
  
  devProcess.on('close', (code) => {
    console.log(`\n📋 Development server exited with code ${code}`);
    process.exit(code);
  });
}

// Run the script
startSimpleServer().catch(error => {
  console.error('❌ Error in startup script:', error);
  process.exit(1);
});
