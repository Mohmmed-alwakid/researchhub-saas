/**
 * Performance React Hooks
 * React hooks for performance monitoring and metrics collection
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getPerformanceMonitor, PerformanceMetric, MetricType, PerformanceSession, PerformanceAnalytics } from './PerformanceMonitor';

/**
 * Hook for tracking custom performance metrics
 */
export function usePerformanceMetric(metricName: string, metricType: MetricType = 'render_time') {
  const monitor = getPerformanceMonitor();
  const [currentMetric, setCurrentMetric] = useState<PerformanceMetric | null>(null);

  const recordMetric = useCallback((value: number, tags?: Record<string, string>) => {
    const metric = monitor.recordMetric(
      metricType, 
      metricName, 
      value, 
      'ms',
      tags || {},
      { component: 'react-hook', timestamp: new Date().toISOString() }
    );
    setCurrentMetric(metric);
    return metric;
  }, [monitor, metricName, metricType]);

  const startTimer = useCallback((timerId?: string) => {
    const id = timerId || `${metricName}-timer`;
    monitor.startTimer(id);
    return id;
  }, [monitor, metricName]);

  const endTimer = useCallback((timerId?: string, tags?: Record<string, string>) => {
    const id = timerId || `${metricName}-timer`;
    const metric = monitor.endTimer(
      id, 
      metricType, 
      tags || {},
      { component: 'react-hook' }
    );
    setCurrentMetric(metric);
    return metric;
  }, [monitor, metricName, metricType]);

  return {
    recordMetric,
    startTimer,
    endTimer,
    currentMetric
  };
}

/**
 * Hook for managing performance sessions
 */
export function usePerformanceSession(sessionName: string) {
  const monitor = getPerformanceMonitor();
  const [currentSession, setCurrentSession] = useState<PerformanceSession | null>(null);
  const sessionRef = useRef<string | null>(null);

  const startSession = useCallback((tags?: Record<string, string>) => {
    const session = monitor.startSession(
      sessionName, 
      tags || {},
      { 
        component: 'react-hook',
        startedAt: new Date().toISOString()
      }
    );
    sessionRef.current = session.id;
    setCurrentSession(session);
    return session;
  }, [monitor, sessionName]);

  const endSession = useCallback(() => {
    if (sessionRef.current) {
      const session = monitor.endSession(sessionRef.current);
      setCurrentSession(session);
      sessionRef.current = null;
      return session;
    }
    return null;
  }, [monitor]);

  const addMetricToSession = useCallback((metricType: MetricType, metricName: string, value: number) => {
    if (sessionRef.current) {
      return monitor.recordMetric(
        metricType, 
        metricName, 
        value, 
        'ms',
        { sessionId: sessionRef.current },
        { component: 'react-hook' }
      );
    }
    return null;
  }, [monitor]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        monitor.endSession(sessionRef.current);
      }
    };
  }, [monitor]);

  return {
    startSession,
    endSession,
    addMetricToSession,
    currentSession,
    isActive: sessionRef.current !== null
  };
}

/**
 * Hook for performance analytics and reporting
 */
export function usePerformanceAnalytics(period?: { start: Date; end: Date }) {
  const monitor = getPerformanceMonitor();
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = period?.start || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to last 24 hours
      const endDate = period?.end || new Date();
      const data = await monitor.getAnalytics(startDate, endDate);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load performance analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [monitor, period]);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analytics,
    loading,
    refreshAnalytics
  };
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitor(componentName: string, interval = 5000) {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const monitor = getPerformanceMonitor();

  useEffect(() => {
    // Check if performance.memory is available (Chrome)
    if (typeof performance !== 'undefined' && (performance as ExtendedPerformance).memory) {
      const checkMemory = () => {
        const memory = (performance as ExtendedPerformance).memory!;
        const memoryData: MemoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };

        setMemoryInfo(memoryData);

        // Record as performance metric
        monitor.recordMetric(
          'memory_usage', 
          `${componentName}-memory`, 
          memory.usedJSHeapSize / 1024 / 1024, 
          'MB',
          { component: componentName, type: 'js-heap' },
          { ...memoryData } as Record<string, unknown>
        );
      };

      checkMemory(); // Initial check
      const intervalId = setInterval(checkMemory, interval);

      return () => clearInterval(intervalId);
    }
  }, [componentName, interval, monitor]);

  return memoryInfo;
}

/**
 * Hook for monitoring component render performance
 */
export function useRenderPerformance(componentName: string, trackDetailedMetrics = false) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  const monitor = getPerformanceMonitor();
  const [renderMetrics, setRenderMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderDuration: 0
  });

  useEffect(() => {
    const renderStart = performance.now();
    const currentRenderCount = ++renderCount.current;

    // Record render start time
    if (trackDetailedMetrics) {
      monitor.startTimer(`${componentName}-render-${currentRenderCount}`);
    }

    return () => {
      const renderEnd = performance.now();
      const renderDuration = renderEnd - renderStart;
      lastRenderTime.current = renderDuration;

      // Record render metric
      monitor.recordMetric(
        'render_time', 
        `${componentName}-render`, 
        renderDuration, 
        'ms',
        { 
          component: componentName, 
          renderNumber: currentRenderCount.toString() 
        },
        { 
          renderStart,
          renderEnd,
          trackingDetailed: trackDetailedMetrics
        }
      );

      if (trackDetailedMetrics) {
        monitor.endTimer(
          `${componentName}-render-${currentRenderCount}`, 
          'render_time', 
          { component: componentName },
          { detailed: true }
        );
      }

      // Update metrics state
      setRenderMetrics(prev => ({
        renderCount: currentRenderCount,
        averageRenderTime: (prev.averageRenderTime * (currentRenderCount - 1) + renderDuration) / currentRenderCount,
        lastRenderDuration: renderDuration
      }));
    };
  });

  return renderMetrics;
}

/**
 * Hook for monitoring API call performance
 */
export function useApiPerformance() {
  const monitor = getPerformanceMonitor();
  const [apiMetrics, setApiMetrics] = useState({
    totalCalls: 0,
    averageResponseTime: 0,
    errors: 0,
    successRate: 0
  });

  const trackApiCall = useCallback(<T,>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method = 'GET'
  ): Promise<T> => {
    const callId = `api-${endpoint}-${Date.now()}`;
    monitor.startTimer(callId);

    return apiCall()
      .then((result) => {
        const metric = monitor.endTimer(
          callId, 
          'api_call', 
          { 
            endpoint, 
            method, 
            status: 'success' 
          },
          {
            timestamp: new Date().toISOString(),
            success: true
          }
        );

        // Update metrics
        setApiMetrics(prev => {
          const newTotal = prev.totalCalls + 1;
          const newAverage = (prev.averageResponseTime * prev.totalCalls + (metric?.value || 0)) / newTotal;
          return {
            totalCalls: newTotal,
            averageResponseTime: newAverage,
            errors: prev.errors,
            successRate: ((newTotal - prev.errors) / newTotal) * 100
          };
        });

        return result;
      })
      .catch((error) => {
        monitor.endTimer(
          callId, 
          'api_call', 
          { 
            endpoint, 
            method, 
            status: 'error' 
          },
          {
            timestamp: new Date().toISOString(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );

        // Update error metrics
        setApiMetrics(prev => {
          const newTotal = prev.totalCalls + 1;
          const newErrors = prev.errors + 1;
          return {
            ...prev,
            totalCalls: newTotal,
            errors: newErrors,
            successRate: ((newTotal - newErrors) / newTotal) * 100
          };
        });

        throw error;
      });
  }, [monitor]);

  return {
    trackApiCall,
    metrics: apiMetrics
  };
}
