import fs from 'fs';
import path from 'path';

console.log('📚 ResearchHub npm Scripts Reference');
console.log('=' .repeat(60));

try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = pkg.scripts;
  
  // Categorize scripts
  const categories = {
    'Development': [],
    'Setup & Configuration': [],
    'Testing': [],
    'Building & Deployment': [],
    'Vibe-Coder Implementation': [],
    'Utilities': []
  };
  
  for (const [script, command] of Object.entries(scripts)) {
    if (script.startsWith('dev')) {
      categories['Development'].push({ script, command });
    } else if (script.startsWith('setup') || script.startsWith('config')) {
      categories['Setup & Configuration'].push({ script, command });
    } else if (script.startsWith('test')) {
      categories['Testing'].push({ script, command });
    } else if (script.startsWith('build') || script.startsWith('deploy') || script === 'start') {
      categories['Building & Deployment'].push({ script, command });
    } else if (script.startsWith('vibe')) {
      categories['Vibe-Coder Implementation'].push({ script, command });
    } else {
      categories['Utilities'].push({ script, command });
    }
  }
  
  // Display categories
  for (const [categoryName, scripts] of Object.entries(categories)) {
    if (scripts.length > 0) {
      console.log(`\n📋 ${categoryName}:`);
      console.log('-'.repeat(30));
      
      for (const { script, command } of scripts) {
        console.log(`  npm run ${script}`);
      }
    }
  }
  
  console.log('\n💡 Quick Commands:');
  console.log('npm run dev:fullstack    # Start development environment');
  console.log('npm run setup:complete   # Run complete setup');
  console.log('npm run test:quick       # Run quick tests');
  console.log('npm run health-check     # Check overall system health');
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}
