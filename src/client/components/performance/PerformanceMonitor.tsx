import React, { useEffect } from 'react';
import { usePerformanceSession } from '../../../shared/performance';

interface PerformanceMonitorProps {
  showMetrics?: boolean;
  enabled?: boolean;
}

/**
 * Performance Monitor Component
 * Lightweight React wrapper for performance monitoring
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  showMetrics = false,
  enabled = process.env.NODE_ENV === 'development'
}) => {
  const { startSession, isActive } = usePerformanceSession('app');

  useEffect(() => {
    if (!enabled) return;

    // Start performance monitoring session
    if (!isActive) {
      startSession({ 
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
      });
    }

    // Monitor performance metrics
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isActive) {
        startSession({ 
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString()
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startSession, isActive]);

  // This component doesn't render anything visible unless showMetrics is true
  if (!enabled || !showMetrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
      <div>Performance Monitor: {isActive ? 'Active' : 'Inactive'}</div>
      <div>Environment: {process.env.NODE_ENV}</div>
    </div>
  );
};

export default PerformanceMonitor;
