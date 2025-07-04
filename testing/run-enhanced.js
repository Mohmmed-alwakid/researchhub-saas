#!/usr/bin/env node

// Test Runner - Debug version
import EnhancedApplicationTest from './enhanced-application-test.js';

console.log('🚀 Starting Enhanced Test Runner...');

try {
  const tester = new EnhancedApplicationTest();
  const results = await tester.runEnhancedTests();
  console.log('✅ Enhanced tests completed!');
  console.log('Results:', JSON.stringify(results.summary, null, 2));
} catch (error) {
  console.error('❌ Enhanced test failed:', error);
  console.error('Stack:', error.stack);
}
