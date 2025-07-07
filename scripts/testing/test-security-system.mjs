#!/usr/bin/env node
/**
 * Test Security System - Basic functionality tests
 * Tests core security features for ResearchHub
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

// Test results tracking
let totalTests = 0;
let passedTests = 0;
const results = [];

function logTest(name, passed, details = '') {
  totalTests++;
  if (passed) passedTests++;
  
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status} ${name}${details ? ` - ${details}` : ''}`;
  
  console.log(message);
  results.push({ name, passed, details, message });
}

function logSection(title) {
  console.log(`\n🔒 ${title}`);
  console.log('='.repeat(50));
}

async function testSecurityFiles() {
  logSection('Security File Structure Validation');
  
  const requiredFiles = [
    'src/shared/security/SecurityManager.ts',
    'src/shared/security/SecurityHooks.tsx',
    'src/shared/security/SecurityUtils.ts',
    'src/shared/security/index.ts'
  ];

  for (const file of requiredFiles) {
    const filePath = join(projectRoot, file);
    const exists = fs.existsSync(filePath);
    logTest(`File exists: ${file}`, exists);
    
    if (exists) {
      const content = fs.readFileSync(filePath, 'utf8');
      logTest(`File has content: ${file}`, content.length > 100, `${content.length} characters`);
    }
  }
}

async function testSecurityManagerStructure() {
  logSection('Security Manager Structure Tests');
  
  try {
    const securityManagerPath = join(projectRoot, 'src/shared/security/SecurityManager.ts');
    const content = fs.readFileSync(securityManagerPath, 'utf8');
    
    // Test for key classes and interfaces
    const requiredStructures = [
      'export interface SecurityEvent',
      'export class SecurityManager',
      'export function getSecurityManager',
      'recordEvent',
      'validateInput',
      'validateAuthentication',
      'checkAuthorization',
      'getMetrics'
    ];

    for (const structure of requiredStructures) {
      const found = content.includes(structure);
      logTest(`SecurityManager contains: ${structure}`, found);
    }

    // Test for ResearchHub-specific features
    const researchHubFeatures = [
      'study',
      'participant',
      'researcher',
      'admin',
      'applications'
    ];

    for (const feature of researchHubFeatures) {
      const found = content.toLowerCase().includes(feature);
      logTest(`ResearchHub feature referenced: ${feature}`, found);
    }

  } catch (error) {
    logTest('SecurityManager structure test', false, error.message);
  }
}

async function testSecurityHooksStructure() {
  logSection('Security Hooks Structure Tests');
  
  try {
    const hooksPath = join(projectRoot, 'src/shared/security/SecurityHooks.tsx');
    const content = fs.readFileSync(hooksPath, 'utf8');
    
    // Test for required hooks
    const requiredHooks = [
      'useAuthentication',
      'useAuthorization',
      'useSecurityEvents',
      'useInputValidation',
      'useSession',
      'useTrustScore',
      'useSecurityAlerts',
      'useResearchHubSecurity'
    ];

    for (const hook of requiredHooks) {
      const found = content.includes(`export function ${hook}`);
      logTest(`Hook implemented: ${hook}`, found);
    }

    // Test for React imports
    const reactImports = ['useState', 'useEffect', 'useCallback'];
    for (const reactImport of reactImports) {
      const found = content.includes(reactImport);
      logTest(`React hook used: ${reactImport}`, found);
    }

  } catch (error) {
    logTest('SecurityHooks structure test', false, error.message);
  }
}

async function testSecurityUtilsStructure() {
  logSection('Security Utils Structure Tests');
  
  try {
    const utilsPath = join(projectRoot, 'src/shared/security/SecurityUtils.ts');
    const content = fs.readFileSync(utilsPath, 'utf8');
    
    // Test for required utility classes
    const requiredClasses = [
      'export class InputValidator',
      'export class SecurityCrypto',
      'export class AuthenticationHelper',
      'export class ThreatDetector',
      'export class SecurityReporter'
    ];

    for (const className of requiredClasses) {
      const found = content.includes(className);
      logTest(`Utility class: ${className.split(' ').pop()}`, found);
    }

    // Test for crypto functionality
    const cryptoFeatures = [
      'hashPassword',
      'generateSecureId',
      'encrypt',
      'decrypt',
      'generateToken',
      'verifyToken'
    ];

    for (const feature of cryptoFeatures) {
      const found = content.includes(feature);
      logTest(`Crypto feature: ${feature}`, found);
    }

  } catch (error) {
    logTest('SecurityUtils structure test', false, error.message);
  }
}

async function testIndexExports() {
  logSection('Security Index Exports Tests');
  
  try {
    const indexPath = join(projectRoot, 'src/shared/security/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Test for main exports
    const requiredExports = [
      'SecurityManager',
      'getSecurityManager',
      'useAuthentication',
      'InputValidator',
      'SecurityCrypto',
      'Security'
    ];

    for (const exportName of requiredExports) {
      const found = content.includes(exportName);
      logTest(`Index exports: ${exportName}`, found);
    }

    // Test for constants
    const constants = [
      'SECURITY_CONSTANTS',
      'RESEARCH_HUB_SECURITY_CONFIG'
    ];

    for (const constant of constants) {
      const found = content.includes(constant);
      logTest(`Security constant: ${constant}`, found);
    }

  } catch (error) {
    logTest('Index exports test', false, error.message);
  }
}

async function testSecurityEventTypes() {
  logSection('Security Event Types Tests');
  
  try {
    const securityManagerPath = join(projectRoot, 'src/shared/security/SecurityManager.ts');
    const content = fs.readFileSync(securityManagerPath, 'utf8');
    
    // Test for security event types
    const eventTypes = [
      'authentication_failure',
      'authorization_denied',
      'suspicious_activity',
      'xss_attempt',
      'csrf_attempt',
      'sql_injection_attempt',
      'data_breach_attempt'
    ];

    for (const eventType of eventTypes) {
      const found = content.includes(eventType);
      logTest(`Event type: ${eventType}`, found);
    }

    // Test for severity levels
    const severities = ['low', 'medium', 'high', 'critical'];
    for (const severity of severities) {
      const found = content.includes(`'${severity}'`);
      logTest(`Severity level: ${severity}`, found);
    }

  } catch (error) {
    logTest('Security event types test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🔒 ResearchHub Security System - Basic Functionality Tests');
  console.log('Testing core security features and structure...\n');

  await testSecurityFiles();
  await testSecurityManagerStructure();
  await testSecurityHooksStructure();
  await testSecurityUtilsStructure();
  await testIndexExports();
  await testSecurityEventTypes();

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All security tests passed! Security system structure is complete.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the security system implementation.');
  }

  // Return results for external use
  return {
    totalTests,
    passedTests,
    successRate: (passedTests / totalTests) * 100,
    results
  };
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };
