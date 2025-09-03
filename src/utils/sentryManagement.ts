/**
 * Sentry Management Utility
 * Quick commands to enable/disable Sentry monitoring
 */

// Quick disable Sentry (useful if ad blockers cause too much console noise)
function disableSentry() {
  localStorage.setItem('disableSentry', 'true');
  console.log('🔍 Sentry disabled. Refresh the page to take effect.');
  console.log('ℹ️  To re-enable: run enableSentry() in console');
}

// Re-enable Sentry
function enableSentry() {
  localStorage.removeItem('disableSentry');
  console.log('🔍 Sentry enabled. Refresh the page to take effect.');
}

// Check current Sentry status
function sentryStatus() {
  const isDisabled = localStorage.getItem('disableSentry') === 'true';
  console.log(`🔍 Sentry is currently: ${isDisabled ? 'DISABLED' : 'ENABLED'}`);
  
  if (isDisabled) {
    console.log('ℹ️  To enable: run enableSentry() in console');
  } else {
    console.log('ℹ️  To disable: run disableSentry() in console');
  }
}

// Make functions globally available in development
if (import.meta.env.NODE_ENV === 'development') {
  (globalThis as unknown as { 
    disableSentry: typeof disableSentry;
    enableSentry: typeof enableSentry;
    sentryStatus: typeof sentryStatus;
  }).disableSentry = disableSentry;
  (globalThis as unknown as { 
    disableSentry: typeof disableSentry;
    enableSentry: typeof enableSentry;
    sentryStatus: typeof sentryStatus;
  }).enableSentry = enableSentry;
  (globalThis as unknown as { 
    disableSentry: typeof disableSentry;
    enableSentry: typeof enableSentry;
    sentryStatus: typeof sentryStatus;
  }).sentryStatus = sentryStatus;
  
  console.log('🔧 Sentry management functions available:');
  console.log('   • disableSentry() - Disable error tracking');
  console.log('   • enableSentry() - Enable error tracking');
  console.log('   • sentryStatus() - Check current status');
}

export { disableSentry, enableSentry, sentryStatus };
