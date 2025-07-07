/**
 * Performance Module - Centralized exports
 * Comprehensive performance monitoring system for ResearchHub
 * Based on Vibe-Coder-MCP architectural patterns
 */

// Core performance monitoring
export {
  PerformanceMonitor,
  globalPerformanceMonitor,
  initializePerformanceMonitor,
  getPerformanceMonitor
} from './PerformanceMonitor';

// Types and interfaces
export type {
  MetricType,
  MetricSeverity,
  PerformanceMetric,
  PerformanceSession,
  PerformanceAlert,
  PerformanceAnalytics,
  PerformanceBottleneck,
  PerformanceRecommendation,
  PerformanceConfig
} from './PerformanceMonitor';

// React hooks (will be created)
export {
  usePerformanceMetric,
  usePerformanceSession,
  usePerformanceAnalytics,
  useMemoryMonitor,
  useRenderPerformance,
  useApiPerformance
} from './PerformanceHooks';

// Utilities and helpers
export {
  PerformanceUtils,
  MetricCollector,
  PerformanceReporter,
  PerformanceIntegration
} from './PerformanceUtils';

// Browser-specific performance tools
export {
  BrowserPerformanceMonitor,
  WebVitalsCollector,
  ResourceTimingAnalyzer
} from './BrowserPerformance';
