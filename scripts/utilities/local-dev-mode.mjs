#!/usr/bin/env node

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

console.log('🚀 ResearchHub - LOCAL DEV MODE (Network Issues Fix)');
console.log('===================================================');

// Check if we can reach Supabase
let useLocalAuth = false;
try {
  console.log('🌐 Testing Supabase connectivity...');
  await execAsync('ping -n 1 wxpwxzdgdvinlbtnbgdf.supabase.co');
  console.log('✅ Supabase reachable - using cloud authentication');
} catch (error) {
  console.log('❌ Supabase unreachable - enabling LOCAL AUTH MODE');
  useLocalAuth = true;
}

// Create a temporary env flag for local auth mode
if (useLocalAuth) {
  const envContent = `USE_LOCAL_AUTH=true\nSKIP_SUPABASE=true\n`;
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local with LOCAL AUTH MODE enabled');
}

async function killProcessOnPort(port) {
  try {
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

async function startLocalDevMode() {
  console.log('\n🔥 Preparing local development environment...');
  
  // Kill processes on both ports
  await killProcessOnPort(5175);
  await killProcessOnPort(3003);
  
  // Wait for ports to be released
  console.log('\n⏳ Waiting 2 seconds for ports to be released...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n🚀 Starting ResearchHub in LOCAL DEV MODE:');
  console.log(`   Frontend: http://localhost:5175`);
  console.log(`   API: http://localhost:3003`);
  if (useLocalAuth) {
    console.log(`   Authentication: LOCAL MODE (test accounts work)`);
    console.log(`   📧 Test Login: abwanwr77+researcher@gmail.com / Testtest123`);
  } else {
    console.log(`   Authentication: Supabase Cloud`);
  }
  console.log('\n📝 Frontend will be ready in ~10 seconds, API in ~5 seconds...\n');
  
  // Start ONLY the working script
  const devProcess = spawn('node', ['scripts/development/local-full-dev.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env: {
      ...process.env,
      USE_LOCAL_AUTH: useLocalAuth ? 'true' : 'false',
      SKIP_SUPABASE: useLocalAuth ? 'true' : 'false'
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    devProcess.kill('SIGTERM');
    // Clean up temp files
    try {
      fs.unlinkSync('.env.local');
    } catch (e) {}
    process.exit(0);
  });
  
  devProcess.on('error', (error) => {
    console.error('❌ Error starting development server:', error);
    process.exit(1);
  });
  
  devProcess.on('close', (code) => {
    console.log(`\n📋 Development server exited with code ${code}`);
    // Clean up temp files
    try {
      fs.unlinkSync('.env.local');
    } catch (e) {}
    process.exit(code);
  });
}

// Run the script
startLocalDevMode().catch(error => {
  console.error('❌ Error in startup script:', error);
  process.exit(1);
});
