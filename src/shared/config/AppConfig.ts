/**
 * Centralized Application Configuration
 * Following Vibe-Coder-MCP patterns for configuration management
 */

// Environment types for type safety
export type Environment = 'development' | 'production' | 'test';

// Database configuration interface
export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

// API configuration interface
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Feature flags interface
export interface FeatureFlags {
  enableCollaboration: boolean;
  enableAdvancedBlocks: boolean;
  enableAnalytics: boolean;
  enablePayments: boolean;
  enableFileUpload: boolean;
  enableVideoRecording: boolean;
  enableAIIntegration: boolean;
  enableTemplateMarketplace: boolean;
}

// Application configuration interface
export interface AppConfiguration {
  environment: Environment;
  version: string;
  buildDate: string;
  database: DatabaseConfig;
  api: ApiConfig;
  features: FeatureFlags;
  ui: {
    theme: string;
    defaultLanguage: string;
    enableDarkMode: boolean;
  };
  performance: {
    enableCaching: boolean;
    cacheTimeout: number;
    enableCompression: boolean;
  };
  security: {
    enableCSRF: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  monitoring: {
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableAnalytics: boolean;
  };
}

// Configuration validation errors
export class ConfigurationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Configuration Manager Class
 * Handles loading, validation, and access to application configuration
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfiguration | null = null;
  private validated = false;

  private constructor() {}

  /**
   * Get singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Initialize configuration from environment variables
   */
  public initialize(): AppConfiguration {
    if (this.config && this.validated) {
      return this.config;
    }

    this.config = this.loadConfiguration();
    this.validateConfiguration();
    this.validated = true;

    return this.config;
  }

  /**
   * Get the current configuration
   */
  public getConfig(): AppConfiguration {
    if (!this.config) {
      throw new ConfigurationError('Configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Get environment-specific configuration value
   */
  public get<T>(path: string): T {
    const config = this.getConfig();
    return this.getNestedValue(config as unknown as Record<string, unknown>, path) as T;
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.getConfig().environment === 'development';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.getConfig().environment === 'production';
  }

  /**
   * Check if a feature is enabled
   */
  public isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.getConfig().features[feature];
  }

  /**
   * Load configuration from environment variables and defaults
   */
  private loadConfiguration(): AppConfiguration {
    const env = (process.env.NODE_ENV as Environment) || 'development';
    
    return {
      environment: env,
      version: process.env.npm_package_version || '1.0.0',
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      
      database: {
        url: this.getRequiredEnv('SUPABASE_URL'),
        anonKey: this.getRequiredEnv('SUPABASE_ANON_KEY'),
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
        connectionTimeout: parseInt(process.env.DB_TIMEOUT || '30000'),
      },
      
      api: {
        baseUrl: process.env.API_BASE_URL || (env === 'production' ? '' : 'http://localhost:3003'),
        timeout: parseInt(process.env.API_TIMEOUT || '30000'),
        retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000'),
      },
      
      features: {
        enableCollaboration: this.getBooleanEnv('ENABLE_COLLABORATION', true),
        enableAdvancedBlocks: this.getBooleanEnv('ENABLE_ADVANCED_BLOCKS', true),
        enableAnalytics: this.getBooleanEnv('ENABLE_ANALYTICS', true),
        enablePayments: this.getBooleanEnv('ENABLE_PAYMENTS', true),
        enableFileUpload: this.getBooleanEnv('ENABLE_FILE_UPLOAD', true),
        enableVideoRecording: this.getBooleanEnv('ENABLE_VIDEO_RECORDING', false),
        enableAIIntegration: this.getBooleanEnv('ENABLE_AI_INTEGRATION', false),
        enableTemplateMarketplace: this.getBooleanEnv('ENABLE_TEMPLATE_MARKETPLACE', false),
      },
      
      ui: {
        theme: process.env.UI_THEME || 'light',
        defaultLanguage: process.env.UI_DEFAULT_LANGUAGE || 'en',
        enableDarkMode: this.getBooleanEnv('UI_ENABLE_DARK_MODE', true),
      },
      
      performance: {
        enableCaching: this.getBooleanEnv('ENABLE_CACHING', true),
        cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '300000'), // 5 minutes
        enableCompression: this.getBooleanEnv('ENABLE_COMPRESSION', true),
      },
      
      security: {
        enableCSRF: this.getBooleanEnv('ENABLE_CSRF', env === 'production'),
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400000'), // 24 hours
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      },
      
      monitoring: {
        enableErrorTracking: this.getBooleanEnv('ENABLE_ERROR_TRACKING', env === 'production'),
        enablePerformanceMonitoring: this.getBooleanEnv('ENABLE_PERFORMANCE_MONITORING', env === 'production'),
        enableAnalytics: this.getBooleanEnv('ENABLE_ANALYTICS_TRACKING', env === 'production'),
      },
    };
  }

  /**
   * Validate the loaded configuration
   */
  private validateConfiguration(): void {
    const config = this.config!;
    
    // Validate required fields
    if (!config.database.url) {
      throw new ConfigurationError('SUPABASE_URL is required', 'database.url');
    }
    
    if (!config.database.anonKey) {
      throw new ConfigurationError('SUPABASE_ANON_KEY is required', 'database.anonKey');
    }
    
    // Validate URL formats
    try {
      new URL(config.database.url);
    } catch {
      throw new ConfigurationError('SUPABASE_URL must be a valid URL', 'database.url');
    }
    
    // Validate numeric ranges
    if (config.database.maxConnections <= 0) {
      throw new ConfigurationError('Database max connections must be positive', 'database.maxConnections');
    }
    
    if (config.api.timeout <= 0) {
      throw new ConfigurationError('API timeout must be positive', 'api.timeout');
    }
    
    if (config.api.retryAttempts < 0) {
      throw new ConfigurationError('API retry attempts must be non-negative', 'api.retryAttempts');
    }
  }

  /**
   * Get required environment variable or throw error
   */
  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new ConfigurationError(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get boolean environment variable with default
   */
  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Get nested configuration value using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && current !== null && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      throw new ConfigurationError(`Configuration path '${path}' not found`);
    }, obj as unknown);
  }

  /**
   * Reload configuration (useful for testing)
   */
  public reload(): AppConfiguration {
    this.config = null;
    this.validated = false;
    return this.initialize();
  }

  /**
   * Get configuration as JSON (for debugging)
   */
  public toJSON(): object {
    const config = this.getConfig();
    // Remove sensitive information
    const sanitized = { ...config };
    if (sanitized.database.serviceRoleKey) {
      sanitized.database.serviceRoleKey = '***REDACTED***';
    }
    sanitized.database.anonKey = '***REDACTED***';
    return sanitized;
  }
}

// Create and export singleton instance
export const appConfig = ConfigManager.getInstance();

// Export default configuration for immediate use
export default appConfig;

// Helper function to initialize configuration on app startup
export function initializeConfig(): AppConfiguration {
  return appConfig.initialize();
}
