import React, { useEffect, useState } from 'react';
import { Activity, Clock, Zap, AlertCircle } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  cacheHits: number;
  apiCallCount: number;
  errorCount: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showMetrics?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  showMetrics = false 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHits: 0,
    apiCallCount: 0,
    errorCount: 0
  });

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();

    // Measure initial load time
    const loadObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart
          }));
        }
      });
    });

    loadObserver.observe({ entryTypes: ['navigation'] });

    // Measure render time
    const renderEndTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      renderTime: renderEndTime - startTime
    }));

    // Monitor memory usage if available
    if ('memory' in performance) {
      const memoryInfo = (performance as { memory?: { usedJSHeapSize: number } }).memory;
      if (memoryInfo) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    }

    // Monitor API calls
    const originalFetch = window.fetch;
    let apiCallCount = 0;
    let errorCount = 0;

    window.fetch = async (...args) => {
      apiCallCount++;
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          errorCount++;
        }
        setMetrics(prev => ({
          ...prev,
          apiCallCount,
          errorCount
        }));
        return response;
      } catch (error) {
        errorCount++;
        setMetrics(prev => ({
          ...prev,
          apiCallCount,
          errorCount
        }));
        throw error;
      }
    };

    // Cleanup
    return () => {
      loadObserver.disconnect();
      window.fetch = originalFetch;
    };
  }, [enabled]);

  if (!enabled || !showMetrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs z-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Performance</h4>
        <Activity className="h-4 w-4 text-blue-500" />
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            Load Time
          </span>
          <span className={`font-medium ${metrics.loadTime > 2000 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600">
            <Zap className="h-3 w-3 mr-1" />
            Render Time
          </span>
          <span className={`font-medium ${metrics.renderTime > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
            {metrics.renderTime.toFixed(1)}ms
          </span>
        </div>
        
        {metrics.memoryUsage && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Memory</span>
            <span className={`font-medium ${metrics.memoryUsage > 50 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.memoryUsage.toFixed(1)}MB
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">API Calls</span>
          <span className="font-medium text-blue-600">{metrics.apiCallCount}</span>
        </div>
        
        {metrics.errorCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Errors
            </span>
            <span className="font-medium text-red-600">{metrics.errorCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        
        if (renderTime > 100) {
          console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName]);
};

// Performance optimization utilities
export const withPerformanceMonitoring = <T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) => {
  const WrappedComponent = (props: T) => {
    usePerformanceMonitor(componentName || Component.displayName || Component.name);
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Performance metrics collection
export const trackUserInteraction = (action: string, duration?: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`User interaction: ${action}${duration ? ` (${duration.toFixed(2)}ms)` : ''}`);
  }
  
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Could integrate with Google Analytics, Mixpanel, etc.
    console.log('Analytics:', { action, duration });
  }
};

// Lazy loading utility
export const LazyComponent = React.lazy;

// Performance-optimized image component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}> = ({ src, alt, className, loading = 'lazy' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};
