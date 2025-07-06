console.log('🔍 ResearchHub Development Status');
console.log('=' .repeat(40));

try {
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  
  // Check if dev servers are running
  let frontendRunning = false;
  let backendRunning = false;
  
  try {
    const netstat = execSync('netstat -ano', { encoding: 'utf8' });
    frontendRunning = netstat.includes(':5175');
    backendRunning = netstat.includes(':3003');
  } catch (e) {
    // netstat failed, assume not running
  }
  
  console.log(`${frontendRunning ? '✅' : '❌'} Frontend server (port 5175): ${frontendRunning ? 'Running' : 'Not running'}`);
  console.log(`${backendRunning ? '✅' : '❌'} Backend server (port 3003): ${backendRunning ? 'Running' : 'Not running'}`);
  
  // Check environment file
  const envExists = fs.existsSync('.env');
  console.log(`${envExists ? '✅' : '❌'} Environment file (.env): ${envExists ? 'Found' : 'Missing'}`);
  
  console.log('\n📚 Quick commands:');
  console.log('npm run dev:fullstack    # Start full development environment');
  console.log('npm run setup:complete   # Run complete setup automation');
  console.log('npm run vibe:status      # Check Vibe-Coder implementation progress');
  
} catch (error) {
  console.log('❌ Status check failed:', error.message);
}
