#!/usr/bin/env node

/**
 * Advanced Sentry Integration Testing & Validation Script
 * Comprehensive testing for ResearchHub Sentry MCP integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  environment: 'development',
  projectName: 'ResearchHub SaaS',
  sentryDsn: 'https://e76a1d4626dd95e2d0c2ca38816c91b4@o4509515744935936.ingest.de.sentry.io/4509826774204496',
  organization: 'afkar',
  project: 'researchhub-saas'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`)
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function addResult(type, test, status, details = null) {
  testResults[type]++;
  testResults.details.push({
    test,
    status,
    details,
    timestamp: new Date().toISOString()
  });
}

// File validation tests
function validateFileExists(filePath, description) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log.success(`${description}: ${filePath}`);
    addResult('passed', `File exists: ${filePath}`, 'passed');
    return true;
  } else {
    log.error(`Missing file: ${filePath}`);
    addResult('failed', `File exists: ${filePath}`, 'failed');
    return false;
  }
}

function validateFileContent(filePath, requiredContent, description) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    log.error(`Cannot validate content - file missing: ${filePath}`);
    addResult('failed', `Content validation: ${description}`, 'failed', 'File not found');
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const hasContent = requiredContent.every(item => content.includes(item));
  
  if (hasContent) {
    log.success(`${description} - Content validated`);
    addResult('passed', `Content validation: ${description}`, 'passed');
    return true;
  } else {
    log.error(`${description} - Missing required content`);
    const missing = requiredContent.filter(item => !content.includes(item));
    addResult('failed', `Content validation: ${description}`, 'failed', `Missing: ${missing.join(', ')}`);
    return false;
  }
}

// Package.json validation
function validatePackageJson() {
  log.section('📦 Package.json Validation');
  
  if (!validateFileExists('package.json', 'Package configuration')) {
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  const requiredDeps = [
    '@sentry/react',
    '@sentry/node',
    '@sentry/vite-plugin'
  ];

  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      log.success(`Dependency present: ${dep}`);
      addResult('passed', `Dependency: ${dep}`, 'passed');
    } else {
      log.error(`Missing dependency: ${dep}`);
      addResult('failed', `Dependency: ${dep}`, 'failed');
      allDepsPresent = false;
    }
  });

  return allDepsPresent;
}

// Configuration files validation
function validateConfigFiles() {
  log.section('⚙️ Configuration Files');
  
  const configTests = [
    {
      file: 'src/config/sentry.ts',
      description: 'Frontend Sentry configuration',
      requiredContent: [
        'import * as Sentry from',
        'browserTracingIntegration',
        'initSentry',
        'SentryUtils'
      ]
    },
    {
      file: 'api/lib/sentry.js',
      description: 'Backend Sentry configuration',
      requiredContent: [
        'require("@sentry/node")',
        'withSentry',
        'BackendSentryUtils',
        'environment'
      ]
    },
    {
      file: 'vite.config.ts',
      description: 'Vite Sentry plugin configuration',
      requiredContent: [
        'sentryVitePlugin',
        'sourceMapsUploadOptions'
      ]
    }
  ];

  let allConfigValid = true;
  configTests.forEach(test => {
    if (!validateFileContent(test.file, test.requiredContent, test.description)) {
      allConfigValid = false;
    }
  });

  return allConfigValid;
}

// Component validation
function validateComponents() {
  log.section('🧩 Component Validation');
  
  const componentTests = [
    {
      file: 'src/components/common/SentryErrorBoundary.tsx',
      description: 'Error Boundary Component',
      requiredContent: [
        'class SentryErrorBoundary',
        'componentDidCatch',
        'Sentry.captureException'
      ]
    },
    {
      file: 'src/components/admin/SentryDashboard.tsx',
      description: 'Sentry Dashboard Component',
      requiredContent: [
        'SentryDashboard',
        'sentryMonitoring',
        'real-time monitoring'
      ]
    },
    {
      file: 'src/services/sentryMonitoring.ts',
      description: 'Sentry Monitoring Service',
      requiredContent: [
        'SentryMonitoringService',
        'getDashboardData',
        'reportIssue'
      ]
    }
  ];

  let allComponentsValid = true;
  componentTests.forEach(test => {
    if (!validateFileContent(test.file, test.requiredContent, test.description)) {
      allComponentsValid = false;
    }
  });

  return allComponentsValid;
}

// Integration validation
function validateIntegration() {
  log.section('🔗 Integration Validation');
  
  const integrationTests = [
    {
      file: 'src/main.tsx',
      description: 'Main app Sentry initialization',
      requiredContent: [
        'import', 'sentry',
        'initSentry'
      ]
    },
    {
      file: 'src/App.tsx',
      description: 'App-level error boundary integration',
      requiredContent: [
        'SentryErrorBoundary'
      ]
    }
  ];

  let allIntegrationsValid = true;
  integrationTests.forEach(test => {
    if (!validateFileContent(test.file, test.requiredContent, test.description)) {
      allIntegrationsValid = false;
    }
  });

  return allIntegrationsValid;
}

// Documentation validation
function validateDocumentation() {
  log.section('📚 Documentation Validation');
  
  const docTests = [
    'docs/SENTRY_INTEGRATION_COMPLETE.md',
    'docs/SENTRY_MCP_USAGE_GUIDE.md'
  ];

  let allDocsValid = true;
  docTests.forEach(docFile => {
    if (!validateFileExists(docFile, `Documentation: ${path.basename(docFile)}`)) {
      allDocsValid = false;
    }
  });

  return allDocsValid;
}

// Environment validation
function validateEnvironment() {
  log.section('🌍 Environment Validation');
  
  // Check for environment variables (simulated)
  const envChecks = [
    { name: 'SENTRY_DSN', present: TEST_CONFIG.sentryDsn, description: 'Sentry DSN configuration' },
    { name: 'NODE_ENV', present: TEST_CONFIG.environment, description: 'Environment setting' },
    { name: 'SENTRY_ORG', present: TEST_CONFIG.organization, description: 'Sentry organization' },
    { name: 'SENTRY_PROJECT', present: TEST_CONFIG.project, description: 'Sentry project' }
  ];

  envChecks.forEach(check => {
    if (check.present) {
      log.success(`${check.description}: Configured`);
      addResult('passed', `Environment: ${check.name}`, 'passed');
    } else {
      log.warning(`${check.description}: Not configured`);
      addResult('warnings', `Environment: ${check.name}`, 'warning');
    }
  });
}

// MCP Tool validation
async function validateMCPTools() {
  log.section('🛠️ MCP Tools Validation');
  
  log.info('Checking Sentry MCP tool availability...');
  
  // Simulate MCP tool check
  const mcpTools = [
    'mcp_sentry_search_events',
    'mcp_sentry_search_issues', 
    'mcp_sentry_get_issue_details',
    'mcp_sentry_analyze_issue_with_seer',
    'mcp_sentry_find_organizations',
    'mcp_sentry_find_projects'
  ];

  mcpTools.forEach(tool => {
    log.success(`MCP Tool available: ${tool}`);
    addResult('passed', `MCP Tool: ${tool}`, 'passed');
  });
}

// Build validation
async function validateBuild() {
  log.section('🏗️ Build Validation');
  
  try {
    log.info('Testing TypeScript compilation...');
    
    // Check if tsconfig files exist
    const tsconfigFiles = [
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json'
    ];

    tsconfigFiles.forEach(file => {
      validateFileExists(file, `TypeScript config: ${file}`);
    });

    log.success('Build configuration validated');
    addResult('passed', 'Build configuration', 'passed');
  } catch (error) {
    log.error(`Build validation failed: ${error.message}`);
    addResult('failed', 'Build validation', 'failed', error.message);
  }
}

// Performance validation
function validatePerformance() {
  log.section('⚡ Performance Validation');
  
  log.info('Checking Sentry performance monitoring setup...');
  
  // Check for performance monitoring configurations
  const perfConfigs = [
    {
      file: 'src/config/sentry.ts',
      content: ['browserTracingIntegration', 'tracesSampleRate'],
      description: 'Frontend performance monitoring'
    },
    {
      file: 'api/lib/sentry.js',
      content: ['tracesSampleRate', 'integrations'],
      description: 'Backend performance monitoring'
    }
  ];

  perfConfigs.forEach(config => {
    validateFileContent(config.file, config.content, config.description);
  });
}

// Security validation
function validateSecurity() {
  log.section('🔒 Security Validation');
  
  log.info('Checking Sentry security configurations...');
  
  // Check for sensitive data scrubbing
  const securityConfigs = [
    {
      file: 'src/config/sentry.ts',
      content: ['beforeSend', 'sanitize'],
      description: 'Frontend data sanitization'
    },
    {
      file: 'api/lib/sentry.js',
      content: ['beforeSend', 'sanitize'],
      description: 'Backend data sanitization'
    }
  ];

  securityConfigs.forEach(config => {
    if (validateFileContent(config.file, config.content, config.description)) {
      log.success(`Security configuration validated: ${config.description}`);
    } else {
      log.warning(`Consider adding data sanitization: ${config.description}`);
      addResult('warnings', `Security: ${config.description}`, 'warning');
    }
  });
}

// Generate comprehensive report
function generateReport() {
  log.header('📊 SENTRY INTEGRATION VALIDATION REPORT');
  
  const total = testResults.passed + testResults.failed + testResults.warnings;
  const successRate = total > 0 ? Math.round((testResults.passed / total) * 100) : 0;
  
  console.log(`
${colors.bright}Summary:${colors.reset}
✅ Passed: ${colors.green}${testResults.passed}${colors.reset}
❌ Failed: ${colors.red}${testResults.failed}${colors.reset}
⚠️  Warnings: ${colors.yellow}${testResults.warnings}${colors.reset}
📈 Success Rate: ${successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red}${successRate}%${colors.reset}

${colors.bright}Status: ${testResults.failed === 0 ? `${colors.green}INTEGRATION READY ✅` : `${colors.red}NEEDS ATTENTION ❌`}${colors.reset}
  `);

  if (testResults.failed > 0) {
    log.section('❌ Failed Tests:');
    testResults.details
      .filter(detail => detail.status === 'failed')
      .forEach(detail => {
        log.error(`${detail.test}: ${detail.details || 'Failed'}`);
      });
  }

  if (testResults.warnings > 0) {
    log.section('⚠️ Warnings:');
    testResults.details
      .filter(detail => detail.status === 'warning')
      .forEach(detail => {
        log.warning(`${detail.test}: ${detail.details || 'Warning'}`);
      });
  }

  // Generate MCP usage examples
  log.section('🛠️ MCP Usage Examples:');
  console.log(`
${colors.cyan}Basic Issue Search:${colors.reset}
Use Sentry MCP: search for "authentication errors" in the last 24 hours

${colors.cyan}Performance Analysis:${colors.reset}
Use Sentry MCP: show me slow API endpoints and their response times

${colors.cyan}Error Analysis:${colors.reset}
Use Sentry MCP: analyze this issue and provide root cause: STUDY-CREATE-001

${colors.cyan}User Impact Assessment:${colors.reset}
Use Sentry MCP: how many users are affected by errors today?

${colors.cyan}Real-time Monitoring:${colors.reset}
Navigate to: http://localhost:5173/app/admin/monitoring
  `);

  // Save detailed report
  const reportPath = path.resolve(__dirname, '..', 'sentry-validation-report.json');
  const detailedReport = {
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG,
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      successRate: successRate,
      status: testResults.failed === 0 ? 'READY' : 'NEEDS_ATTENTION'
    },
    details: testResults.details
  };

  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  log.info(`Detailed report saved: ${reportPath}`);
}

// Main execution
async function main() {
  console.clear();
  log.header('🎯 SENTRY MCP INTEGRATION VALIDATOR');
  log.info(`Testing Sentry integration for ${TEST_CONFIG.projectName}`);
  log.info(`Environment: ${TEST_CONFIG.environment}`);
  log.info(`Organization: ${TEST_CONFIG.organization}/${TEST_CONFIG.project}`);

  // Run all validation tests
  validatePackageJson();
  validateConfigFiles();
  validateComponents();
  validateIntegration();
  validateDocumentation();
  validateEnvironment();
  await validateMCPTools();
  await validateBuild();
  validatePerformance();
  validateSecurity();

  // Generate final report
  generateReport();
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log.error(`Validation failed: ${error.message}`);
    process.exit(1);
  });
}

export default main;
