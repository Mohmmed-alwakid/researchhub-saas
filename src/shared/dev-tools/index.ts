/**
 * Development Tools Index
 * Centralized exports for all development utilities
 */

export * from './DevToolsManager';
export * from './ReactDevHooks';  
export * from './ResearchHubDebugger';

// Default configuration for development tools
export const DEFAULT_DEV_TOOLS_CONFIG = {
  enableInProduction: false,
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,
  enableStateInspection: true,
  enableApiLogging: true,
  enableComponentDebugging: true,
  maxLogEntries: 1000,
  performanceThresholds: {
    slowApiCall: 1000,
    slowComponentRender: 16,
    largePayload: 1024 * 1024 // 1MB
  }
};
