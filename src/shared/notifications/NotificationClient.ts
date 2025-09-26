import { NotificationData, NotificationChannel, NotificationPriority } from './NotificationManager';


/**
 * Client-side Real-time Notification System for ResearchHub
 * Handles SSE connections and notification management in the browser
 */

export interface NotificationClientConfig {
  baseUrl: string;
  userId: string;
  channels: NotificationChannel[];
  autoReconnect: boolean;
  reconnectInterval: number; // milliseconds
  maxReconnectAttempts: number;
  enablePersistence: boolean;
  maxStoredNotifications: number;
}

export interface NotificationHandler {
  channel?: NotificationChannel;
  type?: string;
  handler: (notification: NotificationData) => void | Promise<void>;
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string;
}

/**
 * Client-side notification manager for real-time updates
 */
export class NotificationClient {
  private config: NotificationClientConfig;
  private eventSource?: EventSource;
  private handlers: NotificationHandler[] = [];
  private state: ConnectionState = { status: 'disconnected', reconnectAttempts: 0 };
  private reconnectTimer?: NodeJS.Timeout;
  private storedNotifications: NotificationData[] = [];

  constructor(config: NotificationClientConfig) {
    this.config = config;
    this.loadStoredNotifications();
  }

  /**
   * Connect to the SSE notification stream
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.eventSource?.readyState === EventSource.OPEN) {
        resolve();
        return;
      }

      this.state.status = 'connecting';
      this.emitStateChange();

      const params = new URLSearchParams({
        userId: this.config.userId,
        channels: this.config.channels.join(',')
      });

      const url = `${this.config.baseUrl}/notifications/sse?${params}`;
      this.eventSource = new EventSource(url);

      const onOpen = () => {
        this.state = {
          status: 'connected',
          lastConnected: new Date(),
          reconnectAttempts: 0
        };
        this.emitStateChange();
        this.clearReconnectTimer();
        resolve();
      };

      const onError = () => {
        this.state.status = 'error';
        this.state.error = 'Connection failed';
        this.emitStateChange();

        if (this.config.autoReconnect && 
            this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          reject(new Error('Failed to connect to notification stream'));
        }
      };

      const onMessage = (event: MessageEvent) => {
        try {
          const notification: NotificationData = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      this.eventSource.addEventListener('open', onOpen);
      this.eventSource.addEventListener('error', onError);
      this.eventSource.addEventListener('message', onMessage);

      // Add specific event listeners for different notification types
      this.addEventListeners();
    });
  }

  /**
   * Disconnect from the notification stream
   */
  public disconnect(): void {
    this.clearReconnectTimer();
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }

    this.state = { status: 'disconnected', reconnectAttempts: 0 };
    this.emitStateChange();
  }

  /**
   * Register a notification handler
   */
  public onNotification(handler: NotificationHandler): () => void {
    this.handlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index !== -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  /**
   * Register handler for job progress notifications
   */
  public onJobProgress(callback: (data: { jobId: string; progress: number; status: string; message?: string }) => void): () => void {
    return this.onNotification({
      channel: 'job-progress',
      type: 'job-progress-update',
      handler: (notification) => {
        if (notification.data) {
          callback(notification.data as { jobId: string; progress: number; status: string; message?: string });
        }
      }
    });
  }

  /**
   * Register handler for job completion notifications
   */
  public onJobCompletion(callback: (data: { jobId: string; success: boolean; result?: unknown }) => void): () => void {
    return this.onNotification({
      channel: 'job-completed',
      type: 'job-completed',
      handler: (notification) => {
        if (notification.data) {
          callback(notification.data as { jobId: string; success: boolean; result?: unknown });
        }
      }
    });
  }

  /**
   * Register handler for study updates
   */
  public onStudyUpdate(callback: (data: { studyId: string; updateType: string; data?: Record<string, unknown> }) => void): () => void {
    return this.onNotification({
      channel: 'study-updates',
      handler: (notification) => {
        const data = {
          studyId: notification.studyId || '',
          updateType: notification.type,
          data: notification.data
        };
        callback(data);
      }
    });
  }

  /**
   * Register handler for system alerts
   */
  public onSystemAlert(callback: (data: { title: string; message: string; priority: NotificationPriority }) => void): () => void {
    return this.onNotification({
      channel: 'system-alerts',
      type: 'system-alert',
      handler: (notification) => {
        callback({
          title: notification.title,
          message: notification.message || '',
          priority: notification.priority
        });
      }
    });
  }

  /**
   * Get connection state
   */
  public getState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Get stored notifications
   */
  public getStoredNotifications(): NotificationData[] {
    return [...this.storedNotifications];
  }

  /**
   * Clear stored notifications
   */
  public clearStoredNotifications(): void {
    this.storedNotifications = [];
    this.saveStoredNotifications();
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): void {
    const notification = this.storedNotifications.find(n => n.id === notificationId);
    if (notification && notification.metadata) {
      notification.metadata.read = true;
      this.saveStoredNotifications();
    }
  }

  private handleNotification(notification: NotificationData): void {
    // Store notification if persistence is enabled
    if (this.config.enablePersistence && notification.type !== 'heartbeat') {
      this.storeNotification(notification);
    }

    // Call registered handlers
    this.handlers.forEach(handler => {
      const matchesChannel = !handler.channel || handler.channel === notification.channel;
      const matchesType = !handler.type || handler.type === notification.type;

      if (matchesChannel && matchesType) {
        try {
          handler.handler(notification);
        } catch (error) {
          console.error('Notification handler error:', error);
        }
      }
    });

    // Emit custom event for other parts of the application
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-received', {
        detail: notification
      }));
    }
  }

  private storeNotification(notification: NotificationData): void {
    this.storedNotifications.unshift(notification);
    
    // Limit stored notifications
    if (this.storedNotifications.length > this.config.maxStoredNotifications) {
      this.storedNotifications = this.storedNotifications.slice(0, this.config.maxStoredNotifications);
    }

    this.saveStoredNotifications();
  }

  private loadStoredNotifications(): void {
    if (!this.config.enablePersistence) return;

    try {
      const stored = localStorage.getItem(`notifications_${this.config.userId}`);
      if (stored) {
        const notifications = JSON.parse(stored);
        this.storedNotifications = notifications.map((n: NotificationData & { timestamp: string; expiresAt?: string }) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
        }));

        // Remove expired notifications
        const now = new Date();
        this.storedNotifications = this.storedNotifications.filter(n => 
          !n.expiresAt || n.expiresAt > now
        );
      }
    } catch (error) {
      console.error('Failed to load stored notifications:', error);
    }
  }

  private saveStoredNotifications(): void {
    if (!this.config.enablePersistence) return;

    try {
      localStorage.setItem(
        `notifications_${this.config.userId}`,
        JSON.stringify(this.storedNotifications)
      );
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private addEventListeners(): void {
    if (!this.eventSource) return;

    // Job progress events
    this.eventSource.addEventListener('job-progress-update', (event: MessageEvent) => {
      const notification = JSON.parse(event.data);
      this.handleNotification(notification);
    });

    // Job completion events
    this.eventSource.addEventListener('job-completed', (event: MessageEvent) => {
      const notification = JSON.parse(event.data);
      this.handleNotification(notification);
    });

    // Study update events
    this.eventSource.addEventListener('study-updated', (event: MessageEvent) => {
      const notification = JSON.parse(event.data);
      this.handleNotification(notification);
    });

    // System alert events
    this.eventSource.addEventListener('system-alert', (event: MessageEvent) => {
      const notification = JSON.parse(event.data);
      this.handleNotification(notification);
    });

    // Heartbeat events
    this.eventSource.addEventListener('heartbeat', () => {
      // Update last activity
      this.state.lastConnected = new Date();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.state.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.state.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      this.clearReconnectTimer();
      this.connect().catch(() => {
        // Reconnection failed, will be handled by error handler
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private emitStateChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-state-change', {
        detail: this.state
      }));
    }
  }
}

/**
 * React hook for notifications (if using React)
 * This is a simplified version - actual React implementation may vary
 */
export function createNotificationHook(config: NotificationClientConfig) {
  const client = new NotificationClient(config);
  
  return {
    client,
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
    getState: () => client.getState(),
    getNotifications: () => client.getStoredNotifications(),
    clearNotifications: () => client.clearStoredNotifications(),
    markAsRead: (id: string) => client.markAsRead(id),
    onJobProgress: (callback: Parameters<typeof client.onJobProgress>[0]) => client.onJobProgress(callback),
    onJobCompletion: (callback: Parameters<typeof client.onJobCompletion>[0]) => client.onJobCompletion(callback),
    onStudyUpdate: (callback: Parameters<typeof client.onStudyUpdate>[0]) => client.onStudyUpdate(callback),
    onSystemAlert: (callback: Parameters<typeof client.onSystemAlert>[0]) => client.onSystemAlert(callback)
  };
}
