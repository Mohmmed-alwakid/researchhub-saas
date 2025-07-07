#!/usr/bin/env node

/**
 * Performance and Security Test Runner
 * Part of Vibe-Coder-MCP Implementation - Phase 3, Task 3.2
 * 
 * Runs comprehensive performance and security testing including:
 * - Lighthouse performance audits
 * - Security vulnerability scanning
 * - Accessibility testing
 * - Performance monitoring
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

// Set up environment
process.env.NODE_ENV = 'test';

async function runPerformanceSecurityTests() {
  console.log('🔍 PERFORMANCE & SECURITY TESTING SUITE');
  console.log('=' .repeat(60));
  
  let results = {
    lighthouse: false,
    security: false,
    accessibility: false,
    comprehensive: false
  };
  
  try {
    // Import the PerformanceSecurityTester
    const { default: PerformanceSecurityTester } = 
      await import('../../src/shared/testing/PerformanceSecurityTester.js');
    
    console.log('✅ Performance & Security testing framework loaded\n');
    
    // Initialize tester
    const tester = new PerformanceSecurityTester('testing/performance-security');
    
    // Phase 1: Lighthouse Performance Audit
    console.log('⚡ Phase 1: Lighthouse Performance Audit');
    console.log('-'.repeat(40));
    try {
      const performanceMetrics = await tester.runLighthouseAudit();
      
      console.log(`Performance Score: ${performanceMetrics.performance}/100`);
      console.log(`Accessibility Score: ${performanceMetrics.accessibility}/100`);
      console.log(`Best Practices Score: ${performanceMetrics.bestPractices}/100`);
      console.log(`SEO Score: ${performanceMetrics.seo}/100`);
      console.log(`First Contentful Paint: ${Math.round(performanceMetrics.firstContentfulPaint)}ms`);
      console.log(`Largest Contentful Paint: ${Math.round(performanceMetrics.largestContentfulPaint)}ms`);
      
      results.lighthouse = performanceMetrics.performance >= 80;
      console.log(`✅ Lighthouse audit: ${results.lighthouse ? 'PASSED' : 'NEEDS IMPROVEMENT'}\n`);
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error);
      results.lighthouse = false;
    }
    
    // Phase 2: Security Vulnerability Scan
    console.log('🔒 Phase 2: Security Vulnerability Scan');
    console.log('-'.repeat(40));
    try {
      const securityResults = await tester.runSecurityScan();
      
      console.log(`Total Vulnerabilities: ${securityResults.vulnerabilities}`);
      console.log(`High Risk: ${securityResults.highRisk}`);
      console.log(`Medium Risk: ${securityResults.mediumRisk}`);
      console.log(`Low Risk: ${securityResults.lowRisk}`);
      
      if (securityResults.details.length > 0) {
        console.log('\\nSecurity Issues Found:');
        securityResults.details.forEach((issue, index) => {
          console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}`);
          console.log(`     ${issue.description}`);
        });
      }
      
      results.security = securityResults.highRisk === 0;
      console.log(`✅ Security scan: ${results.security ? 'PASSED' : 'ISSUES FOUND'}\n`);
    } catch (error) {
      console.error('❌ Security scan failed:', error);
      results.security = false;
    }
    
    // Phase 3: Accessibility Testing
    console.log('♿ Phase 3: Accessibility Testing');
    console.log('-'.repeat(40));
    try {
      const accessibilityResults = await tester.runAccessibilityTest();
      
      console.log(`Accessibility Score: ${accessibilityResults.score}/100`);
      console.log(`Violations Found: ${accessibilityResults.violations}`);
      
      if (accessibilityResults.issues.length > 0) {
        console.log('\\nAccessibility Issues:');
        accessibilityResults.issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.rule}`);
          console.log(`     ${issue.description} (${issue.elements} elements)`);
        });
      }
      
      results.accessibility = accessibilityResults.score >= 95;
      console.log(`✅ Accessibility test: ${results.accessibility ? 'PASSED' : 'NEEDS IMPROVEMENT'}\n`);
    } catch (error) {
      console.error('❌ Accessibility test failed:', error);
      results.accessibility = false;
    }
    
    // Phase 4: Comprehensive Report Generation
    console.log('📊 Phase 4: Comprehensive Report Generation');
    console.log('-'.repeat(40));
    try {
      const comprehensiveReport = await tester.generateComprehensiveReport();
      
      console.log(`Overall Score: ${comprehensiveReport.summary.overallScore}/100`);
      console.log(`Critical Issues: ${comprehensiveReport.summary.criticalIssues}`);
      
      if (comprehensiveReport.summary.recommendations.length > 0) {
        console.log('\\nRecommendations:');
        comprehensiveReport.summary.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }
      
      results.comprehensive = comprehensiveReport.summary.overallScore >= 85;
      console.log(`✅ Comprehensive report: ${results.comprehensive ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}\n`);
    } catch (error) {
      console.error('❌ Comprehensive report generation failed:', error);
      results.comprehensive = false;
    }
    
    // Final Summary
    console.log('📊 PERFORMANCE & SECURITY SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Lighthouse Performance: ${results.lighthouse ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Security Scan:          ${results.security ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Accessibility Test:     ${results.accessibility ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Comprehensive Report:   ${results.comprehensive ? '✅ PASSED' : '❌ FAILED'}`);
    
    const overallSuccess = Object.values(results).every(result => result);
    console.log(`\\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (overallSuccess) {
      console.log('\\n🚀 Application meets performance and security standards!');
    } else {
      console.log('\\n⚠️ Application needs improvements in performance or security.');
      console.log('   Review the detailed results above for specific recommendations.');
    }
    
    return overallSuccess;
    
  } catch (error) {
    console.error('❌ Critical error in performance & security testing:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceSecurityTests()
    .then(success => {
      console.log(`\\n🏁 Performance & Security testing completed: ${success ? 'SUCCESS' : 'FAILURE'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export { runPerformanceSecurityTests };
