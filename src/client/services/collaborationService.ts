/**
 * Collaboration Service
 * Client-side service for real-time collaboration features
 */

import type { 
  CollaborationActivity,
  UserCursor
} from '../../shared/types';

interface CollaborationSession {
  id: string;
  entityType: string;
  entityId: string;
  workspaceId: string;
  joinedAt: Date;
  lastSeen: Date;
  status: 'active' | 'away' | 'inactive';
  cursorPosition?: UserCursor;
  currentElement?: string;
}

interface EditOperation {
  id: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  entityType: string;
  entityId: string;
  elementId: string;
  data: Record<string, unknown>;
  timestamp: Date;
  userId: string;
}

interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

type EventCallback = (data?: unknown) => void;

class CollaborationService {
  private baseUrl: string;
  private authToken: string | null = null;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3003');
  }

  /**
   * Initialize the collaboration service with authentication
   */
  async initialize(authToken: string): Promise<void> {
    this.authToken = authToken;
    await this.connectWebSocket();
  }

  /**
   * Connect to WebSocket for real-time features
   */
  private async connectWebSocket(): Promise<void> {
    if (!this.authToken) {
      throw new Error('Authentication token required');
    }

    try {
      const wsUrl = this.baseUrl.replace(/^http/, 'ws') + `:8080?token=${this.authToken}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'connection_established':
        this.emit('connection_established', message);
        break;
      case 'user_joined_room':
        this.emit('user_joined', message);
        break;
      case 'user_left_room':
        this.emit('user_left', message);
        break;
      case 'cursor_update':
        this.emit('cursor_update', message);
        break;
      case 'presence_update':
        this.emit('presence_update', message);
        break;
      case 'edit_operation':
        this.emit('edit_operation', message);
        break;
      case 'comment_update':
        this.emit('comment_update', message);
        break;
      case 'approval_update':
        this.emit('approval_update', message);
        break;
      case 'activity_update':
        this.emit('activity_update', message);
        break;
      case 'room_state':
        this.emit('room_state', message);
        break;
      case 'pong':
        // Heartbeat response
        break;
      case 'error':
        console.error('WebSocket error:', message.error);
        this.emit('error', message);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Join a collaboration session
   */
  async joinSession(entityType: string, entityId: string, workspaceId: string): Promise<CollaborationSession> {
    const response = await this.apiCall('/api/collaboration?action=join_session', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, workspaceId })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to join session');
    }

    // Join WebSocket room
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'join_room',
        roomId: `${entityType}:${entityId}`
      });
    }

    return response.data as CollaborationSession;
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(entityType: string, entityId: string): Promise<void> {
    await this.apiCall('/api/collaboration?action=leave_session', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId })
    });

    // Leave WebSocket room
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'leave_room',
        roomId: `${entityType}:${entityId}`
      });
    }
  }

  /**
   * Update user presence
   */
  async updatePresence(
    entityType: string, 
    entityId: string, 
    cursorPosition?: UserCursor, 
    currentElement?: string,
    status: 'active' | 'away' | 'inactive' = 'active'
  ): Promise<void> {
    await this.apiCall('/api/collaboration?action=update_presence', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, cursorPosition, currentElement, status })
    });

    // Update via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'presence_update',
        roomId: `${entityType}:${entityId}`,
        status,
        currentElement
      });
    }
  }

  /**
   * Send cursor position update
   */
  updateCursor(entityType: string, entityId: string, cursor: UserCursor): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'cursor_update',
        roomId: `${entityType}:${entityId}`,
        cursor
      });
    }
  }

  /**
   * Broadcast an edit operation
   */
  async broadcastEdit(operation: Omit<EditOperation, 'id' | 'userId' | 'timestamp'>): Promise<void> {
    await this.apiCall('/api/collaboration?action=broadcast_edit', {
      method: 'POST',
      body: JSON.stringify({
        entityType: operation.entityType,
        entityId: operation.entityId,
        operation: operation.type,
        elementId: operation.elementId,
        data: operation.data
      })
    });

    // Broadcast via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'edit_operation',
        roomId: `${operation.entityType}:${operation.entityId}`,
        operation: {
          ...operation,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get active collaboration sessions
   */
  async getActiveSessions(entityType: string, entityId: string): Promise<CollaborationSession[]> {
    const response = await this.apiCall(
      `/api/collaboration?action=get_active_sessions&entityType=${entityType}&entityId=${entityId}`
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to get active sessions');
    }

    return response.data as CollaborationSession[];
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(
    workspaceId?: string,
    entityType?: string,
    entityId?: string,
    limit = 50,
    offset = 0
  ): Promise<CollaborationActivity[]> {
    const params = new URLSearchParams({
      action: 'get_activity_feed',
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (workspaceId) params.append('workspaceId', workspaceId);
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);

    const response = await this.apiCall(`/api/collaboration?${params}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get activity feed');
    }

    return response.data as CollaborationActivity[];
  }

  /**
   * Log an activity
   */
  async logActivity(
    activityType: string,
    entityType: string,
    entityId: string,
    workspaceId?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    await this.apiCall('/api/collaboration?action=log_activity', {
      method: 'POST',
      body: JSON.stringify({
        activityType,
        entityType,
        entityId,
        workspaceId,
        metadata
      })
    });

    // Broadcast activity via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'activity_update',
        roomId: workspaceId ? `workspace:${workspaceId}` : `${entityType}:${entityId}`,
        activity: {
          type: activityType,
          entityType,
          entityId,
          metadata,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Event listener management
   */
  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * WebSocket utilities
   */
  private sendWebSocketMessage(message: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendWebSocketMessage({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connectWebSocket().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
    }
  }

  /**
   * API call utility
   */
  private async apiCall(url: string, options: RequestInit = {}): Promise<ApiResponse> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    };

    const response = await fetch(this.baseUrl + url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    return response.json();
  }

  /**
   * Cleanup and disconnect
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.eventListeners.clear();
    this.authToken = null;
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
export default CollaborationService;
