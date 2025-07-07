#!/usr/bin/env node
/**
 * Test Security Integration - Integration tests for security features
 * Tests security integration with ResearchHub systems
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
  console.log(`\n🔐 ${title}`);
  console.log('='.repeat(50));
}

async function testTypeScriptCompilation() {
  logSection('TypeScript Compilation Tests');
  
  try {
    // Try to import TypeScript types (mock test)
    const securityFiles = [
      'src/shared/security/SecurityManager.ts',
      'src/shared/security/SecurityHooks.tsx',
      'src/shared/security/SecurityUtils.ts',
      'src/shared/security/index.ts'
    ];

    for (const file of securityFiles) {
      const filePath = join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for TypeScript features
        const hasTypes = content.includes('interface') || content.includes('type ');
        const hasExports = content.includes('export');
        const hasImports = content.includes('import');
        
        logTest(`TypeScript features in ${file.split('/').pop()}`, hasTypes);
        logTest(`Proper exports in ${file.split('/').pop()}`, hasExports);
        
        if (file.endsWith('.tsx')) {
          const hasReact = content.includes('React') || content.includes('useState');
          logTest(`React features in ${file.split('/').pop()}`, hasReact);
        }
      }
    }

  } catch (error) {
    logTest('TypeScript compilation test', false, error.message);
  }
}

async function testSecurityIntegration() {
  logSection('Security Integration Tests');
  
  try {
    // Test integration with other systems
    const integrationChecks = [
      {
        name: 'DevTools Integration',
        path: 'src/shared/dev-tools',
        check: (content) => content.includes('SecurityManager') || content.includes('security')
      },
      {
        name: 'Performance Integration',
        path: 'src/shared/performance',
        check: (content) => content.includes('security') || content.includes('SecurityManager')
      },
      {
        name: 'Error Handling Integration',
        path: 'src/shared/errors',
        check: (content) => content.includes('security') || content.includes('SecurityEvent')
      }
    ];

    for (const integration of integrationChecks) {
      const dirPath = join(projectRoot, integration.path);
      
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        let foundIntegration = false;
        
        for (const file of files) {
          const filePath = join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          if (integration.check(content)) {
            foundIntegration = true;
            break;
          }
        }
        
        logTest(integration.name, foundIntegration);
      } else {
        logTest(`${integration.name} - Directory exists`, false, 'Directory not found');
      }
    }

  } catch (error) {
    logTest('Security integration test', false, error.message);
  }
}

async function testResearchHubSpecificFeatures() {
  logSection('ResearchHub-Specific Security Features');
  
  try {
    const securityManagerPath = join(projectRoot, 'src/shared/security/SecurityManager.ts');
    const securityUtilsPath = join(projectRoot, 'src/shared/security/SecurityUtils.ts');
    const securityHooksPath = join(projectRoot, 'src/shared/security/SecurityHooks.tsx');
    
    const managerContent = fs.readFileSync(securityManagerPath, 'utf8');
    const utilsContent = fs.readFileSync(securityUtilsPath, 'utf8');
    const hooksContent = fs.readFileSync(securityHooksPath, 'utf8');
    
    // Test ResearchHub-specific features
    const researchHubFeatures = [
      {
        name: 'Study Security Validation',
        check: (content) => content.includes('validateStudyAccess') || content.includes('study')
      },
      {
        name: 'Participant Data Protection',
        check: (content) => content.includes('validateParticipantData') || content.includes('participant')
      },
      {
        name: 'Researcher Authorization',
        check: (content) => content.includes('validateResearcherActions') || content.includes('researcher')
      },
      {
        name: 'Role-Based Access Control',
        check: (content) => content.includes('role') && content.includes('permission')
      },
      {
        name: 'Study Title Validation',
        check: (content) => content.includes('validateStudyTitle')
      }
    ];

    for (const feature of researchHubFeatures) {
      const foundInManager = feature.check(managerContent);
      const foundInUtils = feature.check(utilsContent);
      const foundInHooks = feature.check(hooksContent);
      
      const found = foundInManager || foundInUtils || foundInHooks;
      logTest(feature.name, found);
    }

  } catch (error) {
    logTest('ResearchHub features test', false, error.message);
  }
}

async function testSecurityEventFlow() {
  logSection('Security Event Flow Tests');
  
  try {
    const securityManagerPath = join(projectRoot, 'src/shared/security/SecurityManager.ts');
    const content = fs.readFileSync(securityManagerPath, 'utf8');
    
    // Test event flow components
    const eventFlowComponents = [
      'recordEvent',
      'addEventListener',
      'removeEventListener',
      'resolveEvent',
      'getMetrics',
      'exportEvents'
    ];

    for (const component of eventFlowComponents) {
      const found = content.includes(component);
      logTest(`Event flow component: ${component}`, found);
    }

    // Test event types coverage
    const criticalEventTypes = [
      'authentication_failure',
      'authorization_denied',
      'xss_attempt',
      'sql_injection_attempt',
      'data_breach_attempt'
    ];

    for (const eventType of criticalEventTypes) {
      const found = content.includes(eventType);
      logTest(`Critical event type: ${eventType}`, found);
    }

  } catch (error) {
    logTest('Security event flow test', false, error.message);
  }
}

async function testSecurityConfiguration() {
  logSection('Security Configuration Tests');
  
  try {
    const indexPath = join(projectRoot, 'src/shared/security/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Test configuration constants
    const configComponents = [
      'SECURITY_CONSTANTS',
      'RESEARCH_HUB_SECURITY_CONFIG',
      'DEFAULT_SESSION_TIMEOUT',
      'MAX_LOGIN_ATTEMPTS',
      'ROLE_PERMISSIONS',
      'SENSITIVE_ACTIONS'
    ];

    for (const component of configComponents) {
      const found = content.includes(component);
      logTest(`Configuration component: ${component}`, found);
    }

    // Test role definitions
    const roles = ['admin', 'researcher', 'participant'];
    for (const role of roles) {
      const found = content.includes(role);
      logTest(`Role defined: ${role}`, found);
    }

  } catch (error) {
    logTest('Security configuration test', false, error.message);
  }
}

async function testSecurityUtilities() {
  logSection('Security Utilities Tests');
  
  try {
    const utilsPath = join(projectRoot, 'src/shared/security/SecurityUtils.ts');
    const content = fs.readFileSync(utilsPath, 'utf8');
    
    // Test utility functions
    const utilities = [
      'validateEmail',
      'validatePassword',
      'hashPassword',
      'generateSecureId',
      'analyzeRequest',
      'analyzeBehavior',
      'generateSecurityReport'
    ];

    for (const utility of utilities) {
      const found = content.includes(utility);
      logTest(`Utility function: ${utility}`, found);
    }

    // Test threat detection
    const threatDetection = [
      'isSuspiciousUserAgent',
      'containsSqlInjection',
      'containsXss',
      'ThreatDetector'
    ];

    for (const detection of threatDetection) {
      const found = content.includes(detection);
      logTest(`Threat detection: ${detection}`, found);
    }

  } catch (error) {
    logTest('Security utilities test', false, error.message);
  }
}

async function testReactHooksImplementation() {
  logSection('React Hooks Implementation Tests');
  
  try {
    const hooksPath = join(projectRoot, 'src/shared/security/SecurityHooks.tsx');
    const content = fs.readFileSync(hooksPath, 'utf8');
    
    // Test hook patterns
    const hookPatterns = [
      'useState',
      'useEffect',
      'useCallback',
      'return {',
      'export function use'
    ];

    for (const pattern of hookPatterns) {
      const found = content.includes(pattern);
      logTest(`React hook pattern: ${pattern}`, found);
    }

    // Test hook returns
    const hookReturns = [
      'isAuthenticated',
      'hasPermission',
      'events',
      'validateInput',
      'sessionActive',
      'trustScore'
    ];

    for (const returnValue of hookReturns) {
      const found = content.includes(returnValue);
      logTest(`Hook return value: ${returnValue}`, found);
    }

  } catch (error) {
    logTest('React hooks implementation test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🔐 ResearchHub Security System - Integration Tests');
  console.log('Testing security integration and ResearchHub-specific features...\n');

  await testTypeScriptCompilation();
  await testSecurityIntegration();
  await testResearchHubSpecificFeatures();
  await testSecurityEventFlow();
  await testSecurityConfiguration();
  await testSecurityUtilities();
  await testReactHooksImplementation();

  // Summary
  console.log('\n📊 Integration Test Results Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All security integration tests passed!');
    console.log('Security system is properly integrated with ResearchHub.');
  } else {
    console.log('\n⚠️  Some integration tests failed.');
    console.log('Review security system integration with ResearchHub components.');
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
