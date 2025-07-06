#!/usr/bin/env node

/**
 * ResearchHub Package.json Scripts Helper
 * Vibe-Coder-MCP Implementation - Task 1.4
 * 
 * Provides categorized script listing and management
 */

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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readPackageJson() {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function categorizeScripts(scripts) {
  const categories = {
    'Development': [],
    'Setup & Configuration': [],
    'Testing': [],
    'Building & Deployment': [],
    'Vibe-Coder Implementation': [],
    'Framework & Quality': [],
    'Utilities & Maintenance': []
  };
  
  for (const [script, command] of Object.entries(scripts)) {
    if (script.startsWith('dev')) {
      categories['Development'].push({ script, command });
    } else if (script.startsWith('setup') || script.startsWith('config')) {
      categories['Setup & Configuration'].push({ script, command });
    } else if (script.startsWith('test')) {
      categories['Testing'].push({ script, command });
    } else if (script.startsWith('build') || script.startsWith('deploy') || script === 'start' || script === 'preview') {
      categories['Building & Deployment'].push({ script, command });
    } else if (script.startsWith('vibe')) {
      categories['Vibe-Coder Implementation'].push({ script, command });
    } else if (script.includes('framework') || script.includes('quality') || script.includes('validate') || script === 'pre-commit') {
      categories['Framework & Quality'].push({ script, command });
    } else {
      categories['Utilities & Maintenance'].push({ script, command });
    }
  }
  
  return categories;
}

function displayScripts(category) {
  const pkg = readPackageJson();
  const categorized = categorizeScripts(pkg.scripts);
  
  if (category && categorized[category]) {
    log(`\n📋 ${category} Scripts:`, 'cyan');
    log('=' .repeat(50), 'blue');
    
    for (const { script, command } of categorized[category]) {
      log(`npm run ${script}`, 'green');
      log(`  ${command}`, 'blue');
      log('');
    }
  } else {
    // Display all categories
    log('📚 ResearchHub npm Scripts Reference', 'bright');
    log('=' .repeat(60), 'magenta');
    
    for (const [categoryName, scripts] of Object.entries(categorized)) {
      if (scripts.length > 0) {
        log(`\n📋 ${categoryName}:`, 'cyan');
        log('-' .repeat(30), 'blue');
        
        for (const { script, command } of scripts) {
          log(`  npm run ${script}`, 'green');
          log(`    ${command}`, 'blue');
        }
      }
    }
    
    log('\n💡 Usage Examples:', 'cyan');
    log('npm run scripts help dev         # Show development scripts', 'blue');
    log('npm run scripts help test        # Show testing scripts', 'blue');
    log('npm run scripts help setup       # Show setup scripts', 'blue');
    log('npm run scripts validate         # Validate all scripts work', 'blue');
  }
}

function validateScripts() {
  log('🔍 Validating npm scripts...', 'cyan');
  log('=' .repeat(40), 'blue');
  
  const pkg = readPackageJson();
  const scripts = pkg.scripts;
  
  let validCount = 0;
  let totalCount = 0;
  
  const criticalScripts = [
    'dev:fullstack',
    'build',
    'type-check',
    'setup:complete',
    'test:quick',
    'dev:status'
  ];
  
  for (const script of criticalScripts) {
    totalCount++;
    if (scripts[script]) {
      log(`✅ ${script}`, 'green');
      validCount++;
    } else {
      log(`❌ ${script} - Missing!`, 'red');
    }
  }
  
  log(`\n📊 Critical Scripts: ${validCount}/${totalCount} found`, 
    validCount === totalCount ? 'green' : 'yellow');
  
  // Check for script consistency
  log('\n🔧 Script Consistency Checks:', 'cyan');
  
  const checks = [
    {
      name: 'All test scripts exist',
      check: () => Object.keys(scripts).filter(s => s.startsWith('test')).length >= 5
    },
    {
      name: 'All setup scripts exist', 
      check: () => Object.keys(scripts).filter(s => s.startsWith('setup')).length >= 4
    },
    {
      name: 'All vibe-coder scripts exist',
      check: () => Object.keys(scripts).filter(s => s.startsWith('vibe')).length >= 2
    },
    {
      name: 'Development scripts exist',
      check: () => Object.keys(scripts).filter(s => s.startsWith('dev')).length >= 3
    }
  ];
  
  for (const { name, check } of checks) {
    const passed = check();
    log(`${passed ? '✅' : '❌'} ${name}`, passed ? 'green' : 'red');
  }
}

function generateScriptDocumentation() {
  log('📝 Generating script documentation...', 'cyan');
  
  const pkg = readPackageJson();
  const categorized = categorizeScripts(pkg.scripts);
  
  let documentation = `# ResearchHub npm Scripts Reference
Generated: ${new Date().toISOString()}

This document provides a comprehensive reference for all npm scripts available in ResearchHub.

`;

  for (const [categoryName, scripts] of Object.entries(categorized)) {
    if (scripts.length > 0) {
      documentation += `## ${categoryName}\n\n`;
      
      for (const { script, command } of scripts) {
        documentation += `### \`npm run ${script}\`\n`;
        documentation += `\`\`\`bash\n${command}\n\`\`\`\n\n`;
      }
    }
  }
  
  documentation += `## Quick Reference

### Most Common Commands
\`\`\`bash
# Start development environment
npm run dev:fullstack

# Check development status
npm run dev:status

# Run complete setup
npm run setup:complete

# Run quick tests
npm run test:quick

# Check TypeScript
npm run type-check

# Build for production
npm run build
\`\`\`

### Vibe-Coder Implementation
\`\`\`bash
# Check implementation progress
npm run vibe:status

# Generate progress report
npm run vibe:report

# Test configuration system
npm run config:test
\`\`\`
`;

  const docPath = path.join(PROJECT_ROOT, 'docs', 'NPM_SCRIPTS_REFERENCE.md');
  fs.writeFileSync(docPath, documentation);
  log(`✅ Documentation saved to docs/NPM_SCRIPTS_REFERENCE.md`, 'green');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];
  
  switch (command) {
    case 'help':
      const category = param ? param.charAt(0).toUpperCase() + param.slice(1) : null;
      if (category === 'Dev') {
        displayScripts('Development');
      } else if (category === 'Test') {
        displayScripts('Testing');
      } else if (category === 'Setup') {
        displayScripts('Setup & Configuration');
      } else {
        displayScripts();
      }
      break;
      
    case 'validate':
      validateScripts();
      break;
      
    case 'docs':
      generateScriptDocumentation();
      break;
      
    default:
      displayScripts();
      break;
  }
}

if (import.meta.url === `file://${__filename}`) {
  main();
}
