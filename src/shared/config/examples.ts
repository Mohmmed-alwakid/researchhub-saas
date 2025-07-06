/**
 * Configuration Usage Examples
 * Demonstrates how to use the new configuration system
 */

import { appConfig, initializeConfig } from './AppConfig';

// Example usage of the configuration system
export function configurationExamples() {
  console.log('🔧 Configuration System Examples');
  
  try {
    // Initialize configuration
    const config = initializeConfig();
    console.log('✅ Configuration initialized successfully');
    
    // Environment checks
    console.log(`📍 Environment: ${config.environment}`);
    console.log(`🔧 Development mode: ${appConfig.isDevelopment()}`);
    console.log(`🚀 Production mode: ${appConfig.isProduction()}`);
    
    // Feature flags
    console.log(`🎯 Collaboration enabled: ${appConfig.isFeatureEnabled('enableCollaboration')}`);
    console.log(`📊 Analytics enabled: ${appConfig.isFeatureEnabled('enableAnalytics')}`);
    console.log(`💰 Payments enabled: ${appConfig.isFeatureEnabled('enablePayments')}`);
    
    // Database configuration
    console.log(`🗄️ Database URL: ${config.database.url.substring(0, 30)}...`);
    console.log(`⚡ Max connections: ${config.database.maxConnections}`);
    
    // API configuration
    console.log(`🌐 API Base URL: ${config.api.baseUrl}`);
    console.log(`⏱️ API Timeout: ${config.api.timeout}ms`);
    
    // Using the get method
    const apiTimeout = appConfig.get<number>('api.timeout');
    console.log(`🔧 API timeout via get(): ${apiTimeout}ms`);
    
    // Configuration as JSON (sanitized)
    console.log('📋 Configuration summary:');
    console.log(JSON.stringify(appConfig.toJSON(), null, 2));
    
  } catch (error) {
    console.error('❌ Configuration error:', error);
  }
}

// Test configuration in different environments
export function testEnvironmentConfiguration() {
  console.log('\n🧪 Testing Environment Configuration');
  
  const originalEnv = process.env.NODE_ENV;
  
  try {
    // Test development configuration
    process.env.NODE_ENV = 'development';
    appConfig.reload();
    console.log('🛠️ Development config loaded');
    console.log(`  - API Base URL: ${appConfig.get<string>('api.baseUrl')}`);
    console.log(`  - CSRF enabled: ${appConfig.get<boolean>('security.enableCSRF')}`);
    
    // Test production configuration
    process.env.NODE_ENV = 'production';
    appConfig.reload();
    console.log('🚀 Production config loaded');
    console.log(`  - API Base URL: ${appConfig.get<string>('api.baseUrl')}`);
    console.log(`  - CSRF enabled: ${appConfig.get<boolean>('security.enableCSRF')}`);
    
  } finally {
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
    appConfig.reload();
  }
}

// Export for use in testing
export { appConfig, initializeConfig };
