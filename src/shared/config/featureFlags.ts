// Feature flags for controlling access to incomplete features
export interface FeatureFlags {
  // Analytics features
  ENABLE_ADVANCED_ANALYTICS: boolean;
  ENABLE_HEATMAP_ANALYTICS: boolean;
  ENABLE_SESSION_REPLAY: boolean;
  ENABLE_REAL_TIME_ANALYTICS: boolean;
  
  // Payment features
  ENABLE_PAYMENT_FEATURES: boolean;
  ENABLE_SUBSCRIPTION_MANAGEMENT: boolean;
  ENABLE_BILLING_ANALYTICS: boolean;
  
  // Recording features
  ENABLE_SCREEN_RECORDING: boolean;
  ENABLE_VIDEO_PROCESSING: boolean;
  
  // Admin features
  ENABLE_ADVANCED_ADMIN_SETTINGS: boolean;
  ENABLE_SYSTEM_ANALYTICS: boolean;
  ENABLE_ROLE_PERMISSION_MANAGER: boolean;
  
  // Real-time features
  ENABLE_REAL_TIME_FEATURES: boolean;
  ENABLE_LIVE_MONITORING: boolean;
}

// Default feature flags - set incomplete features to false
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Analytics features - mostly mock data, disable for production
  ENABLE_ADVANCED_ANALYTICS: false,
  ENABLE_HEATMAP_ANALYTICS: false,
  ENABLE_SESSION_REPLAY: false,
  ENABLE_REAL_TIME_ANALYTICS: false,
    // Payment features - UI mockups only, disable for production
  ENABLE_PAYMENT_FEATURES: true, // Enable for admin testing
  ENABLE_SUBSCRIPTION_MANAGEMENT: true, // Enable for admin testing
  ENABLE_BILLING_ANALYTICS: true, // Enable for admin testing
  
  // Recording features - basic infrastructure only, disable advanced features
  ENABLE_SCREEN_RECORDING: false,
  ENABLE_VIDEO_PROCESSING: false,
  
  // Admin features - partial implementation, disable incomplete parts
  ENABLE_ADVANCED_ADMIN_SETTINGS: false,
  ENABLE_SYSTEM_ANALYTICS: false,
  ENABLE_ROLE_PERMISSION_MANAGER: false,
  
  // Real-time features - incomplete implementation
  ENABLE_REAL_TIME_FEATURES: false,
  ENABLE_LIVE_MONITORING: false,
};

// Environment-based feature flags
export const getFeatureFlags = (): FeatureFlags => {
  const env = import.meta.env.MODE || 'development';
    // In development, allow enabling features via environment variables
  if (env === 'development') {
    return {
      ENABLE_ADVANCED_ANALYTICS: import.meta.env.VITE_ENABLE_ADVANCED_ANALYTICS === 'true',
      ENABLE_HEATMAP_ANALYTICS: import.meta.env.VITE_ENABLE_HEATMAP_ANALYTICS === 'true',
      ENABLE_SESSION_REPLAY: import.meta.env.VITE_ENABLE_SESSION_REPLAY === 'true',
      ENABLE_REAL_TIME_ANALYTICS: import.meta.env.VITE_ENABLE_REAL_TIME_ANALYTICS === 'true',
      
      ENABLE_PAYMENT_FEATURES: import.meta.env.VITE_ENABLE_PAYMENT_FEATURES === 'true' || true, // Enable by default for admin testing
      ENABLE_SUBSCRIPTION_MANAGEMENT: import.meta.env.VITE_ENABLE_SUBSCRIPTION_MANAGEMENT === 'true' || true, // Enable by default for admin testing
      ENABLE_BILLING_ANALYTICS: import.meta.env.VITE_ENABLE_BILLING_ANALYTICS === 'true' || true, // Enable by default for admin testing
      
      ENABLE_SCREEN_RECORDING: import.meta.env.VITE_ENABLE_SCREEN_RECORDING === 'true',
      ENABLE_VIDEO_PROCESSING: import.meta.env.VITE_ENABLE_VIDEO_PROCESSING === 'true',
      
      ENABLE_ADVANCED_ADMIN_SETTINGS: import.meta.env.VITE_ENABLE_ADVANCED_ADMIN_SETTINGS === 'true',
      ENABLE_SYSTEM_ANALYTICS: import.meta.env.VITE_ENABLE_SYSTEM_ANALYTICS === 'true',
      ENABLE_ROLE_PERMISSION_MANAGER: import.meta.env.VITE_ENABLE_ROLE_PERMISSION_MANAGER === 'true',
      
      ENABLE_REAL_TIME_FEATURES: import.meta.env.VITE_ENABLE_REAL_TIME_FEATURES === 'true',
      ENABLE_LIVE_MONITORING: import.meta.env.VITE_ENABLE_LIVE_MONITORING === 'true',
    };
  }
  
  // In production, use conservative defaults (most features disabled)
  return DEFAULT_FEATURE_FLAGS;
};

// Hook for React components
export const useFeatureFlags = () => {
  return getFeatureFlags();
};
