/**
 * Server-Sent Events (SSE) Real-time Notification System for ResearchHub
 * Provides real-time updates for job progress, study events, and user notifications
 * Based on Vibe-Coder-MCP architectural patterns
 */

export type NotificationChannel = 
  | 'job-progress'
  | 'job-completed'
  | 'study-updates'
  | 'user-notifications'
  | 'system-alerts'
  | 'collaboration'
  | 'analytics';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationData {
  id: string;
  channel: NotificationChannel;
  type: string;
  priority: NotificationPriority;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  userId?: string;
  studyId?: string;
  timestamp: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  channels: NotificationChannel[];
  filters?: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface SSEConfig {
  heartbeatInterval: number; // milliseconds
  maxConnections: number;
  connectionTimeout: number; // milliseconds
  retryInterval: number; // milliseconds for client retry
  enableCompression: boolean;
  enableCORS: boolean;
  bufferSize: number; // max notifications to buffer per connection
}

export interface SSEConnection {
  id: string;
  userId: string;
  channels: Set<NotificationChannel>;
  response: Response | null;
  controller: ReadableStreamDefaultController<string> | null;
  lastHeartbeat: Date;
  buffer: NotificationData[];
  filters?: Record<string, unknown>;
}

/**
 * Real-time Notification Manager using Server-Sent Events
 */
export class NotificationManager {
  private connections: Map<string, SSEConnection> = new Map();
  private subscriptions: Map<string, NotificationSubscription> = new Map();
  private config: SSEConfig;
  private heartbeatTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<SSEConfig> = {}) {
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      maxConnections: 1000,
      connectionTimeout: 300000, // 5 minutes
      retryInterval: 5000, // 5 seconds
      enableCompression: false,
      enableCORS: true,
      bufferSize: 50,
      ...config
    };

    this.initialize();
  }

  private initialize(): void {
    // Start heartbeat timer
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);

    // Start cleanup timer
    this.cleanupTimer = setInterval(() => {
      this.cleanupConnections();
    }, this.config.heartbeatInterval);
  }

  /**
   * Create SSE endpoint for real-time notifications
   */
  public createSSEEndpoint() {
    return async (request: Request): Promise<Response> => {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const channels = url.searchParams.get('channels')?.split(',') as NotificationChannel[] || ['user-notifications'];

      if (!userId) {
        return new Response('Missing userId parameter', { status: 400 });
      }

      // Check connection limit
      const userConnections = Array.from(this.connections.values())
        .filter(conn => conn.userId === userId);
      
      if (userConnections.length >= 5) { // Max 5 connections per user
        return new Response('Too many connections', { status: 429 });
      }

      if (this.connections.size >= this.config.maxConnections) {
        return new Response('Server at capacity', { status: 503 });
      }

      // Create SSE stream
      const stream = new ReadableStream<string>({
        start: (controller) => {
          const connectionId = this.createConnection(userId, channels, controller);
          
          // Send initial connection event
          this.sendToConnection(connectionId, {
            id: `conn_${Date.now()}`,
            channel: 'system-alerts',
            type: 'connection-established',
            priority: 'normal',
            title: 'Connected',
            message: 'Real-time notifications active',
            timestamp: new Date()
          });

          // Send buffered notifications
          this.sendBufferedNotifications(connectionId);
        },
        cancel: () => {
          // Connection closed by client
          this.removeConnectionByUserId(userId);
        }
      });

      const headers: Record<string, string> = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      };

      if (this.config.enableCORS) {
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Headers'] = 'Cache-Control';
        headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
      }

      return new Response(stream, { headers });
    };
  }

  /**
   * Send notification to specific users or channels
   */
  public async sendNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>): Promise<void> {
    const fullNotification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      ...notification
    };

    // Store notification for offline users
    await this.storeNotification(fullNotification);

    // Send to active connections
    this.broadcastNotification(fullNotification);
  }

  /**
   * Send job progress notification
   */
  public async sendJobProgress(
    jobId: string,
    userId: string,
    progress: number,
    status: string,
    message?: string
  ): Promise<void> {
    await this.sendNotification({
      channel: 'job-progress',
      type: 'job-progress-update',
      priority: 'normal',
      title: 'Job Progress',
      message: message || `Job ${status} - ${progress}%`,
      data: {
        jobId,
        progress,
        status
      },
      userId
    });
  }

  /**
   * Send job completion notification
   */
  public async sendJobCompletion(
    jobId: string,
    userId: string,
    success: boolean,
    result?: unknown
  ): Promise<void> {
    await this.sendNotification({
      channel: 'job-completed',
      type: 'job-completed',
      priority: success ? 'normal' : 'high',
      title: success ? 'Job Completed' : 'Job Failed',
      message: success ? 'Your job has completed successfully' : 'Your job encountered an error',
      data: {
        jobId,
        success,
        result
      },
      userId
    });
  }

  /**
   * Send study update notification
   */
  public async sendStudyUpdate(
    studyId: string,
    userId: string,
    updateType: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await this.sendNotification({
      channel: 'study-updates',
      type: updateType,
      priority: 'normal',
      title: 'Study Update',
      message: `Study ${updateType}`,
      data,
      userId,
      studyId
    });
  }

  /**
   * Send system alert to all users
   */
  public async sendSystemAlert(
    title: string,
    message: string,
    priority: NotificationPriority = 'normal'
  ): Promise<void> {
    await this.sendNotification({
      channel: 'system-alerts',
      type: 'system-alert',
      priority,
      title,
      message
    });
  }

  /**
   * Get user's notification subscription
   */
  public getUserSubscription(userId: string): NotificationSubscription | null {
    return this.subscriptions.get(userId) || null;
  }

  /**
   * Subscribe user to notification channels
   */
  public subscribeUser(
    userId: string,
    channels: NotificationChannel[],
    filters?: Record<string, unknown>
  ): string {
    const subscriptionId = `sub_${userId}_${Date.now()}`;
    
    const subscription: NotificationSubscription = {
      id: subscriptionId,
      userId,
      channels,
      filters,
      active: true,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.subscriptions.set(userId, subscription);
    return subscriptionId;
  }

  /**
   * Update user subscription
   */
  public updateSubscription(
    userId: string,
    updates: Partial<Pick<NotificationSubscription, 'channels' | 'filters' | 'active'>>
  ): boolean {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return false;

    Object.assign(subscription, updates, { lastActivity: new Date() });
    return true;
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats() {
    const connections = Array.from(this.connections.values());
    const userCount = new Set(connections.map(conn => conn.userId)).size;
    const channelStats: Record<NotificationChannel, number> = {} as Record<NotificationChannel, number>;

    connections.forEach(conn => {
      conn.channels.forEach(channel => {
        channelStats[channel] = (channelStats[channel] || 0) + 1;
      });
    });

    return {
      totalConnections: connections.length,
      uniqueUsers: userCount,
      maxConnections: this.config.maxConnections,
      utilizationPercentage: (connections.length / this.config.maxConnections) * 100,
      channelStats,
      avgBufferSize: connections.length > 0 
        ? connections.reduce((sum, conn) => sum + conn.buffer.length, 0) / connections.length 
        : 0
    };
  }

  private createConnection(
    userId: string,
    channels: NotificationChannel[],
    controller: ReadableStreamDefaultController<string>
  ): string {
    const connectionId = `conn_${userId}_${Date.now()}`;
    
    const connection: SSEConnection = {
      id: connectionId,
      userId,
      channels: new Set(channels),
      response: null,
      controller,
      lastHeartbeat: new Date(),
      buffer: [],
      filters: this.getUserSubscription(userId)?.filters
    };

    this.connections.set(connectionId, connection);
    
    // Auto-subscribe user if not already subscribed
    if (!this.subscriptions.has(userId)) {
      this.subscribeUser(userId, channels);
    }

    return connectionId;
  }

  private broadcastNotification(notification: NotificationData): void {
    const targetConnections = Array.from(this.connections.values()).filter(conn => {
      // Check if connection is interested in this channel
      if (!conn.channels.has(notification.channel)) return false;
      
      // Check if notification is for specific user
      if (notification.userId && conn.userId !== notification.userId) return false;
      
      // Check filters
      if (conn.filters && !this.matchesFilters(notification, conn.filters)) return false;
      
      return true;
    });

    targetConnections.forEach(conn => {
      this.sendToConnection(conn.id, notification);
    });
  }

  private sendToConnection(connectionId: string, notification: NotificationData): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.controller) return;

    try {
      const eventData = this.formatSSEMessage(notification);
      connection.controller.enqueue(eventData);
      connection.lastHeartbeat = new Date();
    } catch (error) {
      console.error(`Failed to send notification to connection ${connectionId}:`, error);
      this.removeConnection(connectionId);
    }
  }

  private formatSSEMessage(notification: NotificationData): string {
    const lines = [
      `id: ${notification.id}`,
      `event: ${notification.type}`,
      `data: ${JSON.stringify({
        id: notification.id,
        channel: notification.channel,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: notification.timestamp.toISOString(),
        userId: notification.userId,
        studyId: notification.studyId
      })}`,
      '', // Empty line to end the event
      ''
    ];

    return lines.join('\n');
  }

  private sendHeartbeat(): void {
    const heartbeatNotification: NotificationData = {
      id: `heartbeat_${Date.now()}`,
      channel: 'system-alerts',
      type: 'heartbeat',
      priority: 'low',
      title: 'Heartbeat',
      timestamp: new Date()
    };

    this.connections.forEach((_, connectionId) => {
      this.sendToConnection(connectionId, heartbeatNotification);
    });
  }

  private cleanupConnections(): void {
    const now = new Date();
    const timeout = this.config.connectionTimeout;

    for (const [connectionId, connection] of this.connections.entries()) {
      const timeSinceLastHeartbeat = now.getTime() - connection.lastHeartbeat.getTime();
      
      if (timeSinceLastHeartbeat > timeout) {
        this.removeConnection(connectionId);
      }
    }
  }

  private removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection?.controller) {
      try {
        connection.controller.close();
      } catch {
        // Connection already closed
      }
    }
    this.connections.delete(connectionId);
  }

  private removeConnectionByUserId(userId: string): void {
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.userId === userId) {
        this.removeConnection(connectionId);
      }
    }
  }

  private sendBufferedNotifications(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Send any buffered notifications for this user
    const buffered = connection.buffer.splice(0);
    buffered.forEach(notification => {
      this.sendToConnection(connectionId, notification);
    });
  }

  private async storeNotification(notification: NotificationData): Promise<void> {
    // In a real implementation, this would store to database
    // For now, we'll add to connection buffers
    for (const connection of this.connections.values()) {
      if (this.shouldReceiveNotification(connection, notification)) {
        if (connection.buffer.length >= this.config.bufferSize) {
          connection.buffer.shift(); // Remove oldest
        }
        connection.buffer.push(notification);
      }
    }
  }

  private shouldReceiveNotification(connection: SSEConnection, notification: NotificationData): boolean {
    // Check channel
    if (!connection.channels.has(notification.channel)) return false;
    
    // Check user targeting
    if (notification.userId && connection.userId !== notification.userId) return false;
    
    // Check filters
    if (connection.filters && !this.matchesFilters(notification, connection.filters)) return false;
    
    return true;
  }

  private matchesFilters(notification: NotificationData, filters: Record<string, unknown>): boolean {
    // Simple filter matching - can be extended
    for (const [key, value] of Object.entries(filters)) {
      if (notification.data?.[key] !== value) return false;
    }
    return true;
  }

  /**
   * Shutdown the notification manager
   */
  public shutdown(): void {
    // Clear timers
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);

    // Close all connections
    for (const connectionId of this.connections.keys()) {
      this.removeConnection(connectionId);
    }

    this.connections.clear();
    this.subscriptions.clear();
  }
}

// Global notification manager instance
export const globalNotificationManager = new NotificationManager();

// Convenience functions
export const sendNotification = (notification: Omit<NotificationData, 'id' | 'timestamp'>) =>
  globalNotificationManager.sendNotification(notification);

export const sendJobProgress = (jobId: string, userId: string, progress: number, status: string, message?: string) =>
  globalNotificationManager.sendJobProgress(jobId, userId, progress, status, message);

export const sendJobCompletion = (jobId: string, userId: string, success: boolean, result?: unknown) =>
  globalNotificationManager.sendJobCompletion(jobId, userId, success, result);

export const sendStudyUpdate = (studyId: string, userId: string, updateType: string, data?: Record<string, unknown>) =>
  globalNotificationManager.sendStudyUpdate(studyId, userId, updateType, data);

export const sendSystemAlert = (title: string, message: string, priority?: NotificationPriority) =>
  globalNotificationManager.sendSystemAlert(title, message, priority);

export const subscribeUser = (userId: string, channels: NotificationChannel[], filters?: Record<string, unknown>) =>
  globalNotificationManager.subscribeUser(userId, channels, filters);

export const getConnectionStats = () => globalNotificationManager.getConnectionStats();
