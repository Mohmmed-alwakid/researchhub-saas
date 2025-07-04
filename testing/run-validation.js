#!/usr/bin/env node

// Simple runner for validation test
import ValidationTest from './validation-test.js';

console.log('🚀 Starting Validation Test Runner...');

const validator = new ValidationTest();

// Add timeout to prevent hanging
setTimeout(() => {
  console.error('❌ Test timeout after 30 seconds');
  process.exit(1);
}, 30000);

try {
  const results = await validator.runValidationTests();
  console.log('✅ Validation tests completed successfully!');
  process.exit(results.summary.failed > 0 ? 1 : 0);
} catch (error) {
  console.error('❌ Validation test failed:', error);
  process.exit(1);
}
