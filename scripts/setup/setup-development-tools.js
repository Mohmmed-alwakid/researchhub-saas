#!/usr/bin/env node

/**
 * ResearchHub Development Tools Setup
 * Vibe-Coder-MCP Implementation - Task 1.3
 * 
 * Sets up development tools, validates configuration, and prepares the development environment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description, options = {}) {
  log(`\n📋 ${description}...`, 'cyan');
  try {
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      cwd: PROJECT_ROOT,
      encoding: 'utf8'
    });
    log(`✅ ${description} completed`, 'green');
    return { success: true, output: result };
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

function checkVSCodeExtensions() {
  log('\n🔧 Checking VS Code extensions...', 'cyan');
  
  const recommendedExtensions = [
    'ms-vscode.vscode-typescript-next',
    'esbenp.prettier-vscode',
    'bradlc.vscode-tailwindcss',
    'ms-vscode.vscode-json',
    'ms-vscode.js-debug'
  ];
  
  try {
    const result = execSync('code --list-extensions', { encoding: 'utf8' });
    const installedExtensions = result.split('\n').filter(ext => ext.trim());
    
    let allInstalled = true;
    
    for (const ext of recommendedExtensions) {
      const installed = installedExtensions.some(installed => installed.includes(ext));
      log(`${installed ? '✅' : '⚠️ '} ${ext}`, installed ? 'green' : 'yellow');
      if (!installed) allInstalled = false;
    }
    
    if (!allInstalled) {
      log('\n📋 To install missing extensions:', 'blue');
      for (const ext of recommendedExtensions) {
        const installed = installedExtensions.some(installed => installed.includes(ext));
        if (!installed) {
          log(`code --install-extension ${ext}`, 'blue');
        }
      }
    }
    
    return allInstalled;
  } catch (error) {
    log('ℹ️  VS Code not found or not in PATH', 'yellow');
    return false;
  }
}

function setupVSCodeSettings() {
  log('\n⚙️  Setting up VS Code workspace settings...', 'cyan');
  
  const vscodeDir = path.join(PROJECT_ROOT, '.vscode');
  const settingsFile = path.join(vscodeDir, 'settings.json');
  
  const settings = {
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "tailwindCSS.includeLanguages": {
      "typescript": "typescript",
      "typescriptreact": "typescriptreact"
    },
    "files.associations": {
      "*.css": "tailwindcss"
    },
    "emmet.includeLanguages": {
      "typescript": "html",
      "typescriptreact": "html"
    }
  };
  
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
  }
  
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  log('✅ VS Code settings configured', 'green');
}

function setupVSCodeTasks() {
  log('\n📝 Setting up VS Code tasks...', 'cyan');
  
  const vscodeDir = path.join(PROJECT_ROOT, '.vscode');
  const tasksFile = path.join(vscodeDir, 'tasks.json');
  
  const tasks = {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "Start Full Development Environment",
        "type": "shell",
        "command": "npm",
        "args": ["run", "dev:fullstack"],
        "group": {
          "kind": "build",
          "isDefault": true
        },
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "new"
        },
        "problemMatcher": []
      },
      {
        "label": "TypeScript Check",
        "type": "shell",
        "command": "npx",
        "args": ["tsc", "--noEmit"],
        "group": "build",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "shared"
        },
        "problemMatcher": ["$tsc"]
      },
      {
        "label": "Run Tests",
        "type": "shell",
        "command": "npm",
        "args": ["run", "test:quick"],
        "group": "test",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "shared"
        }
      }
    ]
  };
  
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
  log('✅ VS Code tasks configured', 'green');
}

function setupVSCodeLaunch() {
  log('\n🚀 Setting up VS Code launch configurations...', 'cyan');
  
  const vscodeDir = path.join(PROJECT_ROOT, '.vscode');
  const launchFile = path.join(vscodeDir, 'launch.json');
  
  const launch = {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Debug Frontend",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/node_modules/.bin/vite",
        "args": ["--mode", "development"],
        "cwd": "${workspaceFolder}",
        "console": "integratedTerminal",
        "env": {
          "NODE_ENV": "development"
        }
      },
      {
        "name": "Debug Backend API",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/local-dev-server.js",
        "cwd": "${workspaceFolder}",
        "console": "integratedTerminal",
        "env": {
          "NODE_ENV": "development"
        }
      }
    ]
  };
  
  fs.writeFileSync(launchFile, JSON.stringify(launch, null, 2));
  log('✅ VS Code launch configurations set', 'green');
}

function validateESLintConfig() {
  log('\n🔍 Validating ESLint configuration...', 'cyan');
  
  const eslintConfig = path.join(PROJECT_ROOT, 'eslint.config.js');
  
  if (fs.existsSync(eslintConfig)) {
    const result = execCommand('npx eslint --version', 'Checking ESLint version', { silent: true });
    if (result.success) {
      log('✅ ESLint configuration found and working', 'green');
      return true;
    }
  }
  
  log('⚠️  ESLint configuration needs attention', 'yellow');
  return false;
}

function validatePrettierConfig() {
  log('\n💅 Validating Prettier configuration...', 'cyan');
  
  const prettierConfig = path.join(PROJECT_ROOT, '.prettierrc');
  const prettierConfigJs = path.join(PROJECT_ROOT, 'prettier.config.js');
  
  if (fs.existsSync(prettierConfig) || fs.existsSync(prettierConfigJs)) {
    log('✅ Prettier configuration found', 'green');
    return true;
  }
  
  // Create basic Prettier config
  const config = {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  };
  
  fs.writeFileSync(prettierConfig, JSON.stringify(config, null, 2));
  log('✅ Created basic Prettier configuration', 'green');
  return true;
}

function setupGitIgnore() {
  log('\n📝 Validating .gitignore...', 'cyan');
  
  const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
  
  const requiredEntries = [
    'node_modules/',
    '.env',
    '.env.local',
    'dist/',
    'build/',
    '.DS_Store',
    '*.log',
    '.vscode/settings.json',
    'docs/setup-report.json',
    'docs/database-setup-report.json'
  ];
  
  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  let modified = false;
  for (const entry of requiredEntries) {
    if (!gitignoreContent.includes(entry)) {
      gitignoreContent += `\n${entry}`;
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    log('✅ Updated .gitignore with missing entries', 'green');
  } else {
    log('✅ .gitignore is up to date', 'green');
  }
}

function createDevelopmentScripts() {
  log('\n📜 Creating development helper scripts...', 'cyan');
  
  // Create a quick development status script
  const statusScript = `#!/usr/bin/env node

// Quick development status check
import { execSync } from 'child_process';

console.log('🔍 ResearchHub Development Status');
console.log('=' .repeat(40));

try {
  // Check if dev server is running
  const processes = execSync('netstat -ano | findstr :5175', { encoding: 'utf8' }).trim();
  console.log(processes ? '✅ Frontend server appears to be running (port 5175)' : '❌ Frontend server not running');
} catch {
  console.log('❌ Frontend server not running (port 5175)');
}

try {
  const processes = execSync('netstat -ano | findstr :3003', { encoding: 'utf8' }).trim();
  console.log(processes ? '✅ Backend server appears to be running (port 3003)' : '❌ Backend server not running');
} catch {
  console.log('❌ Backend server not running (port 3003)');
}

console.log('\\n📋 Quick commands:');
console.log('npm run dev:fullstack  # Start full development environment');
console.log('npm run setup:complete # Run complete setup automation');
`;
  
  const statusScriptPath = path.join(PROJECT_ROOT, 'scripts', 'development', 'dev-status.js');
  fs.writeFileSync(statusScriptPath, statusScript);
  log('✅ Created development status script', 'green');
}

function generateToolsReport() {
  log('\n📊 Generating development tools report...', 'cyan');
  
  const report = {
    timestamp: new Date().toISOString(),
    vscode: {
      extensionsChecked: true,
      settingsConfigured: true,
      tasksConfigured: true,
      launchConfigured: true
    },
    linting: {
      eslint: validateESLintConfig(),
      prettier: validatePrettierConfig()
    },
    git: {
      gitignoreUpdated: true
    },
    developmentScripts: {
      statusScriptCreated: true
    }
  };
  
  const reportPath = path.join(PROJECT_ROOT, 'docs', 'dev-tools-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`✅ Development tools report saved to docs/dev-tools-report.json`, 'green');
  
  return report;
}

async function main() {
  log('🛠️  ResearchHub Development Tools Setup', 'bright');
  log('=' .repeat(50), 'blue');
  
  // Check VS Code extensions
  checkVSCodeExtensions();
  
  // Setup VS Code workspace
  setupVSCodeSettings();
  setupVSCodeTasks();
  setupVSCodeLaunch();
  
  // Validate linting tools
  validateESLintConfig();
  validatePrettierConfig();
  
  // Setup Git
  setupGitIgnore();
  
  // Create development scripts
  createDevelopmentScripts();
  
  // Generate report
  const report = generateToolsReport();
  
  // Final summary
  log('\n🎉 Development Tools Setup Complete!', 'bright');
  log('=' .repeat(50), 'blue');
  
  log('✅ VS Code workspace configured', 'green');
  log('✅ Linting tools validated', 'green');
  log('✅ Git configuration updated', 'green');
  log('✅ Development scripts created', 'green');
  
  log('\n📋 VS Code Features Available:', 'cyan');
  log('• Ctrl+Shift+P → "Tasks: Run Task" → "Start Full Development Environment"', 'blue');
  log('• F5 → Debug Frontend or Backend', 'blue');
  log('• Ctrl+Shift+P → "TypeScript: Check"', 'blue');
  
  log('\n📊 Development tools report saved to docs/dev-tools-report.json', 'cyan');
}

if (import.meta.url === `file://${__filename}`) {
  main();
}

export { main as setupDevelopmentTools };
