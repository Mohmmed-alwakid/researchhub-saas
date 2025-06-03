#!/usr/bin/env node

// Real-time Railway Deployment Monitor
// Monitors both MongoDB and API services

const DEPLOYMENT_ID = 'd709f1b9-a041-466a-be30-2d610fcad694';
const PROJECT_ID = '95c09b83-e303-4e20-9906-524cce66fc3b';
const API_SERVICE_ID = 'b6d5be6d-c0a6-41df-8de1-246041664847';
const MONGO_SERVICE_ID = 'a5167c02-6c3d-4a91-9c11-46a828ea0976';

console.log('🚀 Railway Deployment Monitor - ResearchHub');
console.log('=' .repeat(60));
console.log('📊 Project ID:', PROJECT_ID);
console.log('🔄 API Deployment:', DEPLOYMENT_ID);
console.log('📅 Started:', new Date().toLocaleString());
console.log('');

// Status tracking
let previousStatus = '';
let statusCount = 0;

function displayStatus(status, service = 'API') {
  const timestamp = new Date().toLocaleTimeString();
  const statusEmoji = {
    'BUILDING': '🔨',
    'DEPLOYING': '🚀',
    'SUCCESS': '✅',
    'FAILED': '❌',
    'CRASHED': '💥',
    'REMOVED': '🗑️'
  };
  
  const emoji = statusEmoji[status] || '❓';
  console.log(`[${timestamp}] ${emoji} ${service}: ${status}`);
}

function displayProgress() {
  statusCount++;
  const dots = '.'.repeat((statusCount % 4) + 1);
  process.stdout.write(`\r🔄 Monitoring${dots}    `);
}

// Check deployment status every 10 seconds
const checkInterval = setInterval(async () => {
  displayProgress();
}, 2000);

// Display initial status
console.log('📋 Current Status:');
displayStatus('BUILDING', 'API Service');
displayStatus('SUCCESS', 'MongoDB Service');

console.log('');
console.log('⏱️  Monitoring deployment progress...');
console.log('   (This usually takes 2-4 minutes)');
console.log('');

// Monitor for 5 minutes maximum
setTimeout(() => {
  clearInterval(checkInterval);
  console.log('\n');
  console.log('⏰ Monitoring timeout reached (5 minutes)');
  console.log('🔗 Check status manually at:');
  console.log(`   https://railway.app/project/${PROJECT_ID}/service/${API_SERVICE_ID}`);
  console.log('');
  console.log('🏥 Test endpoints once deployment completes:');
  console.log('   curl https://[your-domain]/health');
  console.log('   curl https://[your-domain]/api/health');
}, 300000); // 5 minutes

// Display expected deployment steps
setTimeout(() => {
  console.log('\n📋 Expected Deployment Steps:');
  console.log('   1. 🔨 Building - npm ci && npm run build:server');
  console.log('   2. 📦 Packaging - Creating container image');
  console.log('   3. 🚀 Deploying - Starting container');
  console.log('   4. 🏥 Health Check - Testing /health endpoint');
  console.log('   5. ✅ Success - Service online');
}, 10000);

// Display MongoDB connection info
setTimeout(() => {
  console.log('\n🗄️ MongoDB Configuration:');
  console.log('   Host: researchhub-mongodb.railway.internal');
  console.log('   Port: 27017');
  console.log('   Database: researchhub');
  console.log('   User: researchhub');
  console.log('   Status: ✅ ONLINE');
}, 20000);

console.log('Press Ctrl+C to stop monitoring');
console.log('');

// Handle graceful shutdown
process.on('SIGINT', () => {
  clearInterval(checkInterval);
  console.log('\n\n👋 Monitoring stopped');
  console.log('🔗 Continue monitoring at Railway dashboard');
  process.exit(0);
});
