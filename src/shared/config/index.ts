/**
 * Configuration Module Index
 * Centralized exports for all configuration-related functionality
 */

// Main configuration exports
export {
  AppConfiguration,
  DatabaseConfig,
  ApiConfig,
  FeatureFlags,
  Environment,
  ConfigManager,
  ConfigurationError,
  appConfig,
  initializeConfig,
} from './AppConfig';

// Environment configuration
export {
  getCurrentEnvironment,
  environmentDefaults,
  getEnvironmentDefaults,
  isEnvironment,
  validateEnvironment,
} from './environment';

// Feature flags (maintain backward compatibility)
export type { FeatureFlags as LegacyFeatureFlags } from './featureFlags';

// Supabase configuration (maintain backward compatibility)
export { supabaseConfig, type SupabaseConfig } from './supabase';

// Re-export default configuration instance for convenience
export { default } from './AppConfig';
