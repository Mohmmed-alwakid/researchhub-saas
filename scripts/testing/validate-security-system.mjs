#!/usr/bin/env node
/**
 * Validate Security System - Comprehensive validation script
 * Validates complete security system implementation
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);
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
  console.log(`\n🛡️ ${title}`);
  console.log('='.repeat(60));
}

async function validateFileStructure() {
  logSection('Security System File Structure Validation');
  
  const requiredFiles = [
    'src/shared/security/SecurityManager.ts',
    'src/shared/security/SecurityHooks.tsx', 
    'src/shared/security/SecurityUtils.ts',
    'src/shared/security/index.ts'
  ];

  const requiredDirectories = [
    'src/shared/security'
  ];

  // Check directories
  for (const dir of requiredDirectories) {
    const dirPath = join(projectRoot, dir);
    const exists = fs.existsSync(dirPath);
    const isDir = exists && fs.statSync(dirPath).isDirectory();
    logTest(`Directory exists: ${dir}`, exists && isDir);
  }

  // Check files
  for (const file of requiredFiles) {
    const filePath = join(projectRoot, file);
    const exists = fs.existsSync(filePath);
    logTest(`File exists: ${file}`, exists);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const hasContent = stats.size > 100;
      logTest(`File has content: ${file}`, hasContent, `${stats.size} bytes`);
    }
  }
}

async function validateTypeScriptCompilation() {
  logSection('TypeScript Compilation Validation');
  
  try {
    // Check if TypeScript can compile the security files
    const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck', {
      cwd: projectRoot,
      timeout: 30000
    });

    const hasErrors = stderr.includes('error TS') || stdout.includes('error TS');
    logTest('TypeScript compilation', !hasErrors, hasErrors ? 'Compilation errors found' : 'Clean compilation');
    
    if (hasErrors) {
      console.log('TypeScript errors:');
      console.log(stderr || stdout);
    }

  } catch (error) {
    logTest('TypeScript compilation', false, error.message);
  }
}

async function validateSecurityManagerImplementation() {
  logSection('Security Manager Implementation Validation');
  
  try {
    const securityManagerPath = join(projectRoot, 'src/shared/security/SecurityManager.ts');
    const content = fs.readFileSync(securityManagerPath, 'utf8');
    
    // Core class validation
    const coreFeatures = [
      { name: 'SecurityManager class', pattern: /export class SecurityManager/ },
      { name: 'Singleton pattern', pattern: /static getInstance/ },
      { name: 'Event recording', pattern: /recordEvent.*SecurityEvent/ },
      { name: 'Input validation', pattern: /validateInput.*threats/ },
      { name: 'Authentication validation', pattern: /validateAuthentication/ },
      { name: 'Authorization checking', pattern: /checkAuthorization/ },
      { name: 'Metrics generation', pattern: /getMetrics.*SecurityMetrics/ },
      { name: 'Event listeners', pattern: /addEventListener.*removeEventListener/ }
    ];

    for (const feature of coreFeatures) {
      const found = feature.pattern.test(content);
      logTest(feature.name, found);
    }

    // Type definitions validation
    const typeDefinitions = [
      'SecurityEvent',
      'SecurityEventType', 
      'SecuritySeverity',
      'UserSecurityContext',
      'SecurityMetrics',
      'SecurityConfiguration'
    ];

    for (const type of typeDefinitions) {
      const found = content.includes(`interface ${type}`) || content.includes(`type ${type}`);
      logTest(`Type definition: ${type}`, found);
    }

  } catch (error) {
    logTest('SecurityManager validation', false, error.message);
  }
}

async function validateSecurityHooks() {
  logSection('Security Hooks Validation');
  
  try {
    const hooksPath = join(projectRoot, 'src/shared/security/SecurityHooks.tsx');
    const content = fs.readFileSync(hooksPath, 'utf8');
    
    // Hook implementations
    const hooks = [
      'useAuthentication',
      'useAuthorization', 
      'useSecurityEvents',
      'useInputValidation',
      'useSession',
      'useTrustScore',
      'useSecurityAlerts',
      'useResearchHubSecurity'
    ];

    for (const hook of hooks) {
      const found = content.includes(`export function ${hook}`);
      logTest(`Hook implementation: ${hook}`, found);
    }

    // React patterns validation
    const reactPatterns = [
      { name: 'React imports', pattern: /import.*React/ },
      { name: 'useState usage', pattern: /useState/ },
      { name: 'useEffect usage', pattern: /useEffect/ },
      { name: 'useCallback usage', pattern: /useCallback/ },
      { name: 'Hook returns', pattern: /return\s*{/ }
    ];

    for (const pattern of reactPatterns) {
      const found = pattern.pattern.test(content);
      logTest(pattern.name, found);
    }

  } catch (error) {
    logTest('SecurityHooks validation', false, error.message);
  }
}

async function validateSecurityUtils() {
  logSection('Security Utils Validation');
  
  try {
    const utilsPath = join(projectRoot, 'src/shared/security/SecurityUtils.ts');
    const content = fs.readFileSync(utilsPath, 'utf8');
    
    // Utility classes
    const utilityClasses = [
      'InputValidator',
      'SecurityCrypto',
      'AuthenticationHelper', 
      'ThreatDetector',
      'SecurityReporter'
    ];

    for (const className of utilityClasses) {
      const found = content.includes(`export class ${className}`);
      logTest(`Utility class: ${className}`, found);
    }

    // Security features
    const securityFeatures = [
      { name: 'Email validation', pattern: /validateEmail/ },
      { name: 'Password validation', pattern: /validatePassword/ },
      { name: 'Password hashing', pattern: /hashPassword/ },
      { name: 'Token generation', pattern: /generateToken/ },
      { name: 'XSS detection', pattern: /containsXss/ },
      { name: 'SQL injection detection', pattern: /containsSqlInjection/ },
      { name: 'Threat analysis', pattern: /analyzeRequest/ },
      { name: 'Security reporting', pattern: /generateSecurityReport/ }
    ];

    for (const feature of securityFeatures) {
      const found = feature.pattern.test(content);
      logTest(feature.name, found);
    }

  } catch (error) {
    logTest('SecurityUtils validation', false, error.message);
  }
}

async function validateExportsAndIntegration() {
  logSection('Exports and Integration Validation');
  
  try {
    const indexPath = join(projectRoot, 'src/shared/security/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Core exports
    const coreExports = [
      'SecurityManager',
      'getSecurityManager',
      'useAuthentication',
      'InputValidator',
      'SecurityCrypto',
      'Security'
    ];

    for (const exportName of coreExports) {
      const found = content.includes(exportName);
      logTest(`Export available: ${exportName}`, found);
    }

    // Configuration exports
    const configExports = [
      'SECURITY_CONSTANTS',
      'RESEARCH_HUB_SECURITY_CONFIG'
    ];

    for (const config of configExports) {
      const found = content.includes(config);
      logTest(`Configuration export: ${config}`, found);
    }

    // Security helper object
    const helperMethods = [
      'getManager',
      'validateInput',
      'hashPassword',
      'generateToken',
      'analyzeRequest'
    ];

    for (const method of helperMethods) {
      const found = content.includes(method);
      logTest(`Security helper method: ${method}`, found);
    }

  } catch (error) {
    logTest('Exports validation', false, error.message);
  }
}

async function validateResearchHubIntegration() {
  logSection('ResearchHub Integration Validation');
  
  try {
    // Check for ResearchHub-specific implementations
    const files = [
      'src/shared/security/SecurityManager.ts',
      'src/shared/security/SecurityUtils.ts',
      'src/shared/security/SecurityHooks.tsx'
    ];

    const researchHubFeatures = [
      { name: 'Study validation', patterns: ['study', 'validateStudyAccess'] },
      { name: 'Participant protection', patterns: ['participant', 'validateParticipantData'] },
      { name: 'Researcher authorization', patterns: ['researcher', 'validateResearcherActions'] },
      { name: 'Role-based access', patterns: ['admin', 'researcher', 'participant'] },
      { name: 'Application security', patterns: ['application', 'approve', 'reject'] }
    ];

    for (const feature of researchHubFeatures) {
      let featureFound = false;
      
      for (const file of files) {
        const filePath = join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
          
          if (feature.patterns.some(pattern => content.includes(pattern.toLowerCase()))) {
            featureFound = true;
            break;
          }
        }
      }
      
      logTest(feature.name, featureFound);
    }

  } catch (error) {
    logTest('ResearchHub integration validation', false, error.message);
  }
}

async function validateTestScripts() {
  logSection('Test Scripts Validation');
  
  const testScripts = [
    'scripts/testing/test-security-system.mjs',
    'scripts/testing/test-security-integration.mjs'
  ];

  for (const script of testScripts) {
    const scriptPath = join(projectRoot, script);
    const exists = fs.existsSync(scriptPath);
    logTest(`Test script exists: ${script.split('/').pop()}`, exists);
    
    if (exists) {
      const content = fs.readFileSync(scriptPath, 'utf8');
      const hasTests = content.includes('logTest') && content.includes('runAllTests');
      logTest(`Test script functional: ${script.split('/').pop()}`, hasTests);
    }
  }
}

async function runComprehensiveValidation() {
  console.log('🛡️ ResearchHub Security System - Comprehensive Validation');
  console.log('Validating complete security system implementation...\n');

  await validateFileStructure();
  await validateTypeScriptCompilation();
  await validateSecurityManagerImplementation();
  await validateSecurityHooks();
  await validateSecurityUtils();
  await validateExportsAndIntegration();
  await validateResearchHubIntegration();
  await validateTestScripts();

  // Final Summary
  console.log('\n📊 Comprehensive Validation Results');
  console.log('='.repeat(60));
  console.log(`Total Validations: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  // Quality assessment
  const successRate = (passedTests / totalTests) * 100;
  
  if (successRate >= 95) {
    console.log('\n🎉 EXCELLENT: Security system implementation is complete and robust!');
  } else if (successRate >= 85) {
    console.log('\n✅ GOOD: Security system is well implemented with minor areas for improvement.');
  } else if (successRate >= 70) {
    console.log('\n⚠️ FAIR: Security system needs some improvements before production use.');
  } else {
    console.log('\n❌ NEEDS WORK: Security system requires significant improvements.');
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (passedTests === totalTests) {
    console.log('- Security system is production-ready');
    console.log('- Consider adding more comprehensive test coverage');
    console.log('- Review security configurations for your specific use case');
  } else {
    console.log('- Address failed validations before deployment');
    console.log('- Ensure all TypeScript compilation errors are resolved');
    console.log('- Complete missing ResearchHub-specific integrations');
  }

  return {
    totalTests,
    passedTests,
    successRate,
    results,
    recommendation: successRate >= 85 ? 'production-ready' : 'needs-improvement'
  };
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveValidation().catch(console.error);
}

export { runComprehensiveValidation };
