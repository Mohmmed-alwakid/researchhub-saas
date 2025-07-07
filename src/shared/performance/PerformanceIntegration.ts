/**
 * Performance Integration Utilities for ResearchHub
 * Integrates performance monitoring with existing systems
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { getPerformanceMonitor } from './PerformanceMonitor.js';
import { globalJobManager } from '../jobs/index.js';
import { globalNotificationManager } from '../notifications/index.js';
import { ErrorHandler } from '../errors/index.js';

/**
 * Performance middleware for Express.js API endpoints
 */
export function performanceMiddleware() {
  const monitor = getPerformanceMonitor();
  
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Start session for this request
    const session = monitor.startSession(`API Request: ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'] || 'unknown'
    });
    
    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      // Record API response time metric
      monitor.recordMetric(
        'api_call',
        `${req.method} ${req.path}`,
        duration,
        'ms',
        {
          method: req.method,
          path: req.path,
          status: res.statusCode.toString(),
          error: res.statusCode >= 400 ? 'true' : 'false'
        },
        {
          userAgent: req.headers['user-agent'],
          contentLength: res.get('content-length') || 0
        }
      );
      
      // End session
      monitor.endSession(session.id);
      
      originalEnd.apply(this, args);
    };
    
    next();
  };
}

/**
 * Performance decorator for database operations
 */
export function measureDatabaseOperation(operationType: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const monitor = getPerformanceMonitor();
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        monitor.recordMetric({
          type: 'database_query',
          name: `${operationType}: ${propertyName}`,
          value: duration,
          unit: 'ms',
          tags: {
            operation: operationType,
            method: propertyName,
            error: 'false'
          },
          metadata: {
            args: args.length,
            result: typeof result
          }
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        monitor.recordMetric({
          type: 'database_query',
          name: `${operationType}: ${propertyName}`,
          value: duration,
          unit: 'ms',
          tags: {
            operation: operationType,
            method: propertyName,
            error: 'true'
          },
          metadata: {
            args: args.length,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Performance wrapper for study operations
 */
export class StudyPerformanceWrapper {
  private monitor = getPerformanceMonitor();
  
  /**
   * Measure study creation performance
   */
  async measureStudyCreation<T>(
    studyData: any,
    operation: () => Promise<T>
  ): Promise<T> {
    const sessionId = this.monitor.startSession('Study Creation', {
      studyType: studyData.type,
      blockCount: studyData.blocks?.length || 0,
      hasTemplate: Boolean(studyData.templateId)
    });
    
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.monitor.recordMetric({
        type: 'study_creation',
        name: 'Study Creation',
        value: duration,
        unit: 'ms',
        tags: {
          studyType: studyData.type,
          blockCount: (studyData.blocks?.length || 0).toString(),
          hasTemplate: Boolean(studyData.templateId).toString(),
          error: 'false'
        },
        metadata: {
          studyData: studyData
        }
      });
      
      this.monitor.endSession(sessionId);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.monitor.recordMetric({
        type: 'study_creation',
        name: 'Study Creation',
        value: duration,
        unit: 'ms',
        tags: {
          studyType: studyData.type,
          blockCount: (studyData.blocks?.length || 0).toString(),
          hasTemplate: Boolean(studyData.templateId).toString(),
          error: 'true'
        },
        metadata: {
          studyData: studyData,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      this.monitor.endSession(sessionId);
      throw error;
    }
  }
  
  /**
   * Measure participant session performance
   */
  async measureParticipantSession<T>(
    sessionData: any,
    operation: () => Promise<T>
  ): Promise<T> {
    const sessionId = this.monitor.startSession('Participant Session', {
      studyId: sessionData.studyId,
      participantId: sessionData.participantId,
      deviceType: sessionData.deviceType || 'unknown'
    });
    
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.monitor.recordMetric({
        type: 'participant_session',
        name: 'Participant Session',
        value: duration,
        unit: 'ms',
        tags: {
          studyId: sessionData.studyId,
          deviceType: sessionData.deviceType || 'unknown',
          error: 'false'
        },
        metadata: {
          sessionData: sessionData
        }
      });
      
      this.monitor.endSession(sessionId);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.monitor.recordMetric({
        type: 'participant_session',
        name: 'Participant Session',
        value: duration,
        unit: 'ms',
        tags: {
          studyId: sessionData.studyId,
          deviceType: sessionData.deviceType || 'unknown',
          error: 'true'
        },
        metadata: {
          sessionData: sessionData,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      this.monitor.endSession(sessionId);
      throw error;
    }
  }
  
  /**
   * Measure block execution performance
   */
  async measureBlockExecution<T>(
    blockData: any,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.monitor.recordMetric({
        type: 'block_execution',
        name: `Block: ${blockData.type}`,
        value: duration,
        unit: 'ms',
        tags: {
          blockType: blockData.type,
          blockId: blockData.id,
          error: 'false'
        },
        metadata: {
          blockData: blockData
        }
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.monitor.recordMetric({
        type: 'block_execution',
        name: `Block: ${blockData.type}`,
        value: duration,
        unit: 'ms',
        tags: {
          blockType: blockData.type,
          blockId: blockData.id,
          error: 'true'
        },
        metadata: {
          blockData: blockData,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }
}

/**
 * Performance alerting integration
 */
export class PerformanceAlerting {
  private monitor = getPerformanceMonitor();
  private notificationManager = getNotificationManager();
  private jobManager = getJobManager();
  
  constructor() {
    // Listen to performance alerts
    this.monitor.on('alert', this.handleAlert.bind(this));
    this.monitor.on('bottleneck', this.handleBottleneck.bind(this));
  }
  
  /**
   * Handle performance alerts
   */
  private async handleAlert(alert: any): Promise<void> {
    try {
      // Send notification about performance alert
      await this.notificationManager.sendNotification({
        id: `perf_alert_${alert.id}`,
        type: 'performance_alert',
        title: `Performance Alert: ${alert.title}`,
        message: alert.description,
        priority: alert.severity === 'critical' ? 'high' : 'normal',
        data: {
          alert: alert,
          timestamp: new Date().toISOString()
        }
      });
      
      // Schedule background job for critical alerts
      if (alert.severity === 'critical') {
        await this.jobManager.createJob({
          type: 'performance_investigation',
          priority: 'high',
          data: {
            alert: alert,
            timestamp: new Date().toISOString()
          },
          metadata: {
            alertId: alert.id,
            severity: alert.severity
          }
        });
      }
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'PerformanceAlerting.handleAlert',
        alert: alert
      });
    }
  }
  
  /**
   * Handle performance bottlenecks
   */
  private async handleBottleneck(bottleneck: any): Promise<void> {
    try {
      // Send notification about bottleneck
      await this.notificationManager.sendNotification({
        id: `perf_bottleneck_${bottleneck.id}`,
        type: 'performance_bottleneck',
        title: `Performance Bottleneck: ${bottleneck.type}`,
        message: `${bottleneck.description} - ${bottleneck.suggestion}`,
        priority: 'normal',
        data: {
          bottleneck: bottleneck,
          timestamp: new Date().toISOString()
        }
      });
      
      // Schedule optimization job
      await this.jobManager.createJob({
        type: 'performance_optimization',
        priority: 'normal',
        data: {
          bottleneck: bottleneck,
          timestamp: new Date().toISOString()
        },
        metadata: {
          bottleneckType: bottleneck.type,
          metric: bottleneck.metric
        }
      });
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'PerformanceAlerting.handleBottleneck',
        bottleneck: bottleneck
      });
    }
  }
}

/**
 * Frontend performance utilities
 */
export class FrontendPerformanceUtils {
  private monitor = getPerformanceMonitor();
  
  /**
   * Measure page load performance
   */
  measurePageLoad(pageName: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Record page load time
        this.monitor.recordMetric({
          type: 'page_load',
          name: pageName,
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          tags: {
            page: pageName,
            type: 'full_load'
          },
          metadata: {
            navigation: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstPaint: navigation.responseEnd - navigation.fetchStart,
              domInteractive: navigation.domInteractive - navigation.fetchStart
            }
          }
        });
      }
    }
  }
  
  /**
   * Measure render performance
   */
  measureRender(componentName: string, renderTime: number): void {
    this.monitor.recordMetric({
      type: 'render_time',
      name: componentName,
      value: renderTime,
      unit: 'ms',
      tags: {
        component: componentName,
        type: 'render'
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
  
  /**
   * Measure bundle size
   */
  measureBundleSize(bundleName: string, size: number): void {
    this.monitor.recordMetric({
      type: 'bundle_size',
      name: bundleName,
      value: size,
      unit: 'kb',
      tags: {
        bundle: bundleName,
        type: 'size'
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Global instances
export const studyPerformanceWrapper = new StudyPerformanceWrapper();
export const performanceAlerting = new PerformanceAlerting();
export const frontendPerformanceUtils = new FrontendPerformanceUtils();
