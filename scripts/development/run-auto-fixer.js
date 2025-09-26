// Run the auto-fixer
import ApplicationAutoFixer from './application-auto-fixer.js';

console.log('Starting application auto-fix...');

try {
  const fixer = new ApplicationAutoFixer();
  await fixer.applyAllFixes();
  console.log('Auto-fix completed successfully');
} catch (error) {
  console.error('Auto-fix failed:', error.message);
  console.error('Stack:', error.stack);
}