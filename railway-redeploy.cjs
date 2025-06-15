#!/usr/bin/env node

/**
 * Quick Railway Redeploy Script
 * Triggers a Railway redeploy with fixed configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Railway Quick Redeploy Script');
console.log('================================');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ Success: ${description}`);
    if (output.trim()) {
      console.log(`   Output: ${output.trim()}`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${description}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function checkGitStatus() {
  console.log('\n🔍 Checking Git Status...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('📝 Uncommitted changes detected:');
      console.log(status);
      return false;
    } else {
      console.log('✅ Working directory clean');
      return true;
    }
  } catch (error) {
    console.log(`❌ Git status check failed: ${error.message}`);
    return false;
  }
}

function verifyBuild() {
  console.log('\n🔍 Verifying Local Build...');
  
  const requiredFiles = [
    './dist/server/server/index.js',
    './dist/server/package.json',
    './railway.toml'
  ];
  
  let allExist = true;
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

async function main() {
  // Step 1: Verify build
  if (!verifyBuild()) {
    console.log('\n❌ Build files missing. Running build first...');
    if (!runCommand('npm run build:server', 'Building server')) {
      console.log('\n💥 Build failed. Please fix build errors first.');
      process.exit(1);
    }
  }
  
  // Step 2: Check git status
  const gitClean = checkGitStatus();
  
  if (!gitClean) {
    console.log('\n📋 Staging changes for Railway redeploy...');
    runCommand('git add .', 'Staging all changes');
  }
  
  // Step 3: Commit and push to trigger redeploy
  console.log('\n🚀 Triggering Railway Redeploy...');
  
  const commitMessage = `fix: Railway deployment fixes - health check and environment

- Updated railway.toml health check path from /api/health to /health
- Fixed build configuration and environment setup
- Trigger redeploy to resolve API route accessibility issues

Deploy timestamp: ${new Date().toISOString()}`;

  if (runCommand(`git commit -m "${commitMessage}"`, 'Committing changes')) {
    if (runCommand('git push origin main', 'Pushing to GitHub (triggers Railway deploy)')) {
      console.log('\n🎉 REDEPLOY TRIGGERED SUCCESSFULLY!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Wait 2-3 minutes for Railway to build and deploy');
      console.log('   2. Monitor Railway dashboard: https://railway.app/dashboard');
      console.log('   3. Test endpoints after deployment completes');
      console.log('   4. Run: node railway-diagnostic-tool.cjs');
      
      console.log('\n🔗 Quick Test URLs:');
      console.log('   • Health: https://researchhub-saas-production.railway.app/health');
      console.log('   • Root: https://researchhub-saas-production.railway.app/');
      console.log('   • API: https://researchhub-saas-production.railway.app/api/health');
      
    } else {
      console.log('\n❌ Push failed. Check your GitHub credentials and try again.');
    }
  } else {
    console.log('\n❌ Commit failed. This might mean no changes to commit.');
    console.log('   You can manually trigger redeploy from Railway dashboard.');
  }
  
  console.log('\n' + '='.repeat(50));
}

main().catch(console.error);
