// Run the navigation fixer
import NavigationFixer from './navigation-fixer.js';

console.log('Starting navigation fixer...');

try {
  const fixer = new NavigationFixer();
  await fixer.fixAllNavigationIssues();
  console.log('Navigation fix completed successfully');
} catch (error) {
  console.error('Navigation fix failed:', error.message);
  console.error('Stack:', error.stack);
}