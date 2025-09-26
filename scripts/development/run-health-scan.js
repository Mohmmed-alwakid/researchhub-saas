// Simple test to run health scanner
import QuickHealthScanner from './quick-health-scanner.js';

console.log('Starting health scan...');

try {
  const scanner = new QuickHealthScanner();
  await scanner.scanApplication();
  console.log('Health scan completed successfully');
} catch (error) {
  console.error('Health scan failed:', error.message);
  console.error('Stack:', error.stack);
}