/**
 * React Development Hooks and Utilities for ResearchHub
 * Provides debugging hooks and component inspection tools
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { globalDevTools } from './DevToolsManager.js';

export interface ComponentDebugOptions {
  trackProps?: boolean;
  trackState?: boolean;
  trackRenderTime?: boolean;
  logToConsole?: boolean;
  includeCallStack?: boolean;
}

/**
 * Hook for debugging component renders and performance
 */
export function useComponentDebug(
  componentName: string, 
  options: ComponentDebugOptions = {}
) {
  const {
    trackProps = true,
    trackState = false,
    trackRenderTime = true,
    logToConsole = false,
    includeCallStack = false
  } = options;

  const renderCount = useRef(0);
  const lastProps = useRef<Record<string, unknown> | null>(null);
  const lastState = useRef<Record<string, unknown> | null>(null);
  const renderStartTime = useRef<number>(0);

  // Start render timing
  if (trackRenderTime) {
    renderStartTime.current = performance.now();
  }

  useEffect(() => {
    renderCount.current++;
    
    if (trackRenderTime) {
      const renderTime = performance.now() - renderStartTime.current;
      globalDevTools.trackComponentRender(componentName, renderTime);
      
      if (logToConsole) {
        console.log(`🔍 ${componentName} render #${renderCount.current} (${renderTime.toFixed(2)}ms)`);
      }
    }
  });

  const logProps = useCallback((props: Record<string, unknown>) => {
    if (!trackProps) return;
    
    const propsChanged = JSON.stringify(props) !== JSON.stringify(lastProps.current);
    lastProps.current = props;
    
    if (logToConsole && propsChanged) {
      console.group(`📝 ${componentName} props changed`);
      console.log('New props:', props);
      if (includeCallStack) {
        console.trace('Call stack');
      }
      console.groupEnd();
    }
  }, [componentName, trackProps, logToConsole, includeCallStack]);

  const logState = useCallback((state: Record<string, unknown>) => {
    if (!trackState) return;
    
    const stateChanged = JSON.stringify(state) !== JSON.stringify(lastState.current);
    lastState.current = state;
    
    if (logToConsole && stateChanged) {
      console.group(`🎛️ ${componentName} state changed`);
      console.log('New state:', state);
      if (includeCallStack) {
        console.trace('Call stack');
      }
      console.groupEnd();
    }
  }, [componentName, trackState, logToConsole, includeCallStack]);

  return {
    renderCount: renderCount.current,
    logProps,
    logState,
    debug: {
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: trackRenderTime ? performance.now() - renderStartTime.current : 0
    }
  };
}

/**
 * Hook for monitoring API calls with automatic logging
 */
export function useApiDebug() {
  const logApiCall = useCallback((
    method: string,
    url: string,
    options?: {
      status?: number;
      duration?: number;
      error?: string;
      requestData?: unknown;
      responseData?: unknown;
    }
  ) => {
    globalDevTools.logApiCall(
      method,
      url,
      options?.status,
      options?.duration,
      undefined,
      undefined,
      options?.error
    );

    if (options?.error) {
      console.error(`🌐 API Error: ${method} ${url}`, {
        status: options.status,
        duration: options.duration,
        error: options.error,
        requestData: options.requestData
      });
    }
  }, []);

  const measureApiCall = useCallback(async function<T>(
    method: string,
    url: string,
    apiFunction: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiFunction();
      const duration = performance.now() - startTime;
      
      logApiCall(method, url, {
        status: 200,
        duration,
        responseData: result
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logApiCall(method, url, {
        status: error instanceof Error && 'status' in error ? (error as { status: number }).status : 500,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }, [logApiCall]);

  return {
    logApiCall,
    measureApiCall
  };
}

/**
 * Hook for performance monitoring with automatic timing
 */
export function usePerformanceDebug() {
  const timers = useRef<Map<string, string>>(new Map());

  const startTimer = useCallback((name: string, metadata?: Record<string, unknown>) => {
    const timerId = globalDevTools.startPerformanceTimer(name, 'custom', metadata);
    timers.current.set(name, timerId);
    return timerId;
  }, []);

  const endTimer = useCallback((name: string) => {
    const timerId = timers.current.get(name);
    if (timerId) {
      const result = globalDevTools.endPerformanceTimer(timerId);
      timers.current.delete(name);
      return result;
    }
    return null;
  }, []);

  const measureOperation = useCallback(function<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, unknown>
  ): T {
    startTimer(name, metadata);
    try {
      const result = operation();
      endTimer(name);
      return result;
    } catch (error) {
      endTimer(name);
      throw error;
    }
  }, [startTimer, endTimer]);

  const measureAsyncOperation = useCallback(async function<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    startTimer(name, metadata);
    try {
      const result = await operation();
      endTimer(name);
      return result;
    } catch (error) {
      endTimer(name);
      throw error;
    }
  }, [startTimer, endTimer]);

  return {
    startTimer,
    endTimer,
    measureOperation,
    measureAsyncOperation
  };
}

/**
 * Hook for debugging state changes and side effects
 */
export function useStateDebug<T>(
  value: T,
  name: string,
  options: { logChanges?: boolean; logToConsole?: boolean } = {}
) {
  const { logChanges = true, logToConsole = false } = options;
  const previousValue = useRef<T>(value);
  const changeCount = useRef(0);

  const hasChanged = useMemo(() => {
    const changed = JSON.stringify(value) !== JSON.stringify(previousValue.current);
    if (changed && logChanges) {
      changeCount.current++;
      
      if (logToConsole) {
        console.group(`🔄 State change: ${name} #${changeCount.current}`);
        console.log('Previous:', previousValue.current);
        console.log('Current:', value);
        console.groupEnd();
      }
      
      previousValue.current = value;
    }
    return changed;
  }, [value, name, logChanges, logToConsole]);

  return {
    hasChanged,
    changeCount: changeCount.current,
    previousValue: previousValue.current,
    currentValue: value
  };
}

/**
 * HOC for automatic component debugging
 */
export function withComponentDebug<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options?: ComponentDebugOptions
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'UnknownComponent';
    const debugInfo = useComponentDebug(name, options);
    
    // Log props if enabled
    useEffect(() => {
      debugInfo.logProps(props);
    }, [props, debugInfo]);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withComponentDebug(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for debugging effect dependencies
 */
export function useEffectDebug(
  dependencies: React.DependencyList,
  effectName: string,
  logToConsole = false
) {
  const previousDeps = useRef<React.DependencyList>([]);
  const runCount = useRef(0);

  const changedDeps = useMemo(() => {
    const changed: number[] = [];
    
    dependencies.forEach((dep, index) => {
      if (dep !== previousDeps.current[index]) {
        changed.push(index);
      }
    });

    if (changed.length > 0) {
      runCount.current++;
      
      if (logToConsole) {
        console.group(`⚡ Effect: ${effectName} #${runCount.current}`);
        console.log('Changed dependencies:', changed.map(i => ({
          index: i,
          previous: previousDeps.current[i],
          current: dependencies[i]
        })));
        console.groupEnd();
      }
    }

    previousDeps.current = [...dependencies];
    return changed;
  }, [dependencies, effectName, logToConsole]);

  return {
    changedDeps,
    runCount: runCount.current,
    allDeps: dependencies,
    previousDeps: previousDeps.current
  };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryDebug(componentName: string) {
  const memoryUsage = useRef<number>(0);

  useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      memoryUsage.current = memory.usedJSHeapSize;
      
      console.log(`💾 ${componentName} memory usage:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }, [componentName]);

  return {
    memoryUsage: memoryUsage.current
  };
}
