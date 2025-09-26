import { 
  globalNotificationManager, 
  NotificationManager, 
  type NotificationChannel 
} from './NotificationManager';
import { 
  NotificationClient, 
  createNotificationHook 
} from './NotificationClient';


/**
 * Real-time Notifications System for ResearchHub
 * Server-Sent Events (SSE) implementation for real-time updates
 * Based on Vibe-Coder-MCP architectural patterns
 */

// Server-side exports
export {
  NotificationManager,
  globalNotificationManager,
  sendNotification,
  sendJobProgress,
  sendJobCompletion,
  sendStudyUpdate,
  sendSystemAlert,
  subscribeUser,
  getConnectionStats
} from './NotificationManager';

// Client-side exports
export {
  NotificationClient,
  createNotificationHook
} from './NotificationClient';

// Type exports
export type {
  NotificationChannel,
  NotificationPriority,
  NotificationData,
  NotificationSubscription,
  SSEConfig,
  SSEConnection
} from './NotificationManager';

export type {
  NotificationClientConfig,
  NotificationHandler,
  ConnectionState
} from './NotificationClient';

// Import for internal use
// Integration utilities
export class NotificationIntegration {
  /**
   * Create an Express/Vercel API endpoint for SSE notifications
   */
  static createAPIEndpoint(notificationManager = globalNotificationManager) {
    return notificationManager.createSSEEndpoint();
  }

  /**
   * Integrate with job system for automatic progress notifications
   */
  static integrateWithJobSystem(jobManager: { 
    on: (event: string, callback: (...args: unknown[]) => void) => void 
  }, notificationManager = globalNotificationManager) {
    // Hook into job events to send notifications
    jobManager.on('job-started', (...args: unknown[]) => {
      const job = args[0] as { id: string; userId: string };
      notificationManager.sendJobProgress(
        job.id,
        job.userId,
        0,
        'started',
        'Job has been started'
      );
    });

    jobManager.on('job-progress', (...args: unknown[]) => {
      const job = args[0] as { id: string; userId: string };
      const progress = args[1] as number;
      notificationManager.sendJobProgress(
        job.id,
        job.userId,
        progress,
        'running',
        `Job is ${progress}% complete`
      );
    });

    jobManager.on('job-completed', (...args: unknown[]) => {
      const job = args[0] as { id: string; userId: string };
      const result = args[1];
      notificationManager.sendJobCompletion(
        job.id,
        job.userId,
        true,
        result
      );
    });

    jobManager.on('job-failed', (...args: unknown[]) => {
      const job = args[0] as { id: string; userId: string };
      const error = args[1] as { message: string };
      notificationManager.sendJobCompletion(
        job.id,
        job.userId,
        false,
        { error: error.message }
      );
    });
  }

  /**
   * Create React integration hook factory
   */
  static createReactIntegration(baseUrl: string) {
    return function useNotifications(userId: string, channels: NotificationChannel[] = ['user-notifications']) {
      return createNotificationHook({
        baseUrl,
        userId,
        channels,
        autoReconnect: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
        enablePersistence: true,
        maxStoredNotifications: 100
      });
    };
  }

  /**
   * Create development/testing utilities
   */
  static createTestUtils(notificationManager = globalNotificationManager) {
    return {
      sendTestNotification: async (userId: string, channel: NotificationChannel = 'user-notifications') => {
        await notificationManager.sendNotification({
          channel,
          type: 'test-notification',
          priority: 'normal',
          title: 'Test Notification',
          message: 'This is a test notification',
          userId,
          data: { timestamp: Date.now() }
        });
      },

      simulateJobProgress: async (jobId: string, userId: string) => {
        for (let progress = 0; progress <= 100; progress += 20) {
          await notificationManager.sendJobProgress(
            jobId,
            userId,
            progress,
            progress < 100 ? 'running' : 'completed',
            `Processing step ${Math.floor(progress / 20) + 1}`
          );
          
          if (progress < 100) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        await notificationManager.sendJobCompletion(
          jobId,
          userId,
          true,
          { message: 'Job completed successfully' }
        );
      },

      getStats: () => notificationManager.getConnectionStats(),
      
      sendSystemMaintenance: (message: string) => {
        notificationManager.sendSystemAlert(
          'System Maintenance',
          message,
          'high'
        );
      }
    };
  }
}

// Convenience exports for common use cases
export const NotificationUtils = NotificationIntegration;

// Default export for simple usage
export default {
  NotificationManager,
  NotificationClient,
  NotificationIntegration,
  globalNotificationManager
};
