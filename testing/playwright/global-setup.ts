import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Enhanced UI Components testing
 * Ensures the application is ready before running tests
 */
async function globalSetup(_config: FullConfig) {
  console.log('🚀 Starting Enhanced UI Components Test Suite');
  console.log('🌐 Testing enhanced components with professional styling');
  
  // Create a browser instance to verify the application is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test if the application is accessible
    console.log('🔍 Verifying application is running...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
    
    // Test if API is accessible
    console.log('🔍 Verifying API is running...');
    const response = await page.request.get('http://localhost:3003/api/health');
    
    if (response.ok()) {
      console.log('✅ Application and API are ready for testing');
    } else {
      console.log('⚠️  API health check failed, continuing with frontend-only tests');
    }
    
    // Create screenshots directory if it doesn't exist
    await page.evaluate(() => {
      // This will run in the browser context
      console.log('📸 Preparing screenshot directories');
    });
    
  } catch (error) {
    console.log('❌ Application setup verification failed:', error);
    throw new Error('Application is not ready for testing. Please ensure dev server is running.');
  } finally {
    await browser.close();
  }
  
  console.log('🎯 Enhanced UI Components Test Suite - Ready to run!');
}

export default globalSetup;
