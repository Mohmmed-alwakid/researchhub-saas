import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';

interface ApiCallLog {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: number;
  requestData?: unknown;
  responseData?: unknown;
  error?: Error;
}

interface TimerLog {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

interface DebugHookOptions {
  logApiCalls?: boolean;
  logTimers?: boolean;
  maxLogs?: number;
}

export function useDevTools(options: DebugHookOptions = {}) {
  const {
    logApiCalls = true,
    logTimers = true,
    maxLogs = 100
  } = options;

  const apiLogs = useRef<ApiCallLog[]>([]);
  const timerLogs = useRef<TimerLog[]>([]);
  const activeTimers = useRef<Map<string, number>>(new Map());

  const logApiCall = useCallback((method: string, url: string, options: Partial<ApiCallLog>) => {
    if (!logApiCalls) return;

    const log: ApiCallLog = {
      method,
      url,
      status: options.status || 200,
      duration: options.duration || 0,
      timestamp: Date.now(),
      requestData: options.requestData,
      responseData: options.responseData,
      error: options.error
    };

    apiLogs.current.push(log);
    
    if (apiLogs.current.length > maxLogs) {
      apiLogs.current = apiLogs.current.slice(-maxLogs);
    }

    if (options.error) {
      console.error(`🌐 API Error: ${method} ${url}`, {
        status: options.status,
        duration: options.duration,
        error: options.error,
        requestData: options.requestData
      });
    }
  }, [logApiCalls, maxLogs]);

  const startTimer = useCallback((name: string, metadata?: Record<string, unknown>) => {
    if (!logTimers) return '';
    
    const startTime = performance.now();
    activeTimers.current.set(name, startTime);
    
    const log: TimerLog = {
      name,
      startTime,
      metadata
    };
    
    timerLogs.current.push(log);
    return name;
  }, [logTimers]);

  const endTimer = useCallback((name: string) => {
    if (!logTimers) return;
    
    const startTime = activeTimers.current.get(name);
    if (!startTime) return;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    activeTimers.current.delete(name);
    
    const logIndex = timerLogs.current.findIndex(log => log.name === name && !log.endTime);
    if (logIndex >= 0) {
      timerLogs.current[logIndex] = {
        ...timerLogs.current[logIndex],
        endTime,
        duration
      };
    }
    
    console.log(`⏱️ Timer: ${name} completed in ${duration.toFixed(2)}ms`);
  }, [logTimers]);

  return {
    logApiCall,
    startTimer,
    endTimer,
    apiLogs: apiLogs.current,
    timerLogs: timerLogs.current,
    clearLogs: () => {
      apiLogs.current = [];
      timerLogs.current = [];
      activeTimers.current.clear();
    }
  };
}

export function useStateDebug(
  value: unknown,
  name: string,
  options: { logChanges?: boolean; logToConsole?: boolean } = {}
) {
  const { logChanges = true, logToConsole = false } = options;
  const previousValue = useRef(value);
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
    }
    previousValue.current = value;
    return changed;
  }, [value, name, logChanges, logToConsole]);

  return {
    hasChanged,
    changeCount: changeCount.current,
    value
  };
}

export function useComponentMemory(componentName: string) {
  const memoryUsage = useRef<number>(0);

  useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage.current = memory.usedJSHeapSize;
      console.log(`💾 Memory usage for ${componentName}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }, [componentName]);

  return {
    memoryUsage: memoryUsage.current
  };
}
