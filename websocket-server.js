/**
 * WebSocket Service for Real-time Collaboration
 * Handles live presence, real-time editing, and instant notifications
 */

import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

class CollaborationWebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = null;
    this.clients = new Map(); // clientId -> { ws, user, rooms }
    this.rooms = new Map(); // roomId -> Set of clientIds
    this.userPresence = new Map(); // userId -> { status, lastSeen, currentRooms }
  }

  start() {
    this.wss = new WebSocket.Server({ 
      port: this.port,
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Clean up inactive connections every 30 seconds
    setInterval(this.cleanupConnections.bind(this), 30000);
    
    console.log(`WebSocket server started on port ${this.port}`);
  }

  async verifyClient(info) {
    try {
      const url = new URL(info.req.url, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('WebSocket: No token provided');
        return false;
      }

      // Try Supabase authentication first
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          console.log('WebSocket: Supabase auth successful for', user.email);
          return true;
        }
      } catch (supabaseError) {
        console.log('WebSocket: Supabase auth failed, trying local auth fallback');
      }

      // Local authentication fallback for mock tokens
      if (token.startsWith('eyJhbGciOiJub25lIi')) {
        console.log('WebSocket: Using local auth fallback for mock token');
        return this.validateMockToken(token);
      }

      console.log('WebSocket: Authentication failed for token:', token.substring(0, 20) + '...');
      return false;
    } catch (error) {
      console.error('WebSocket verification error:', error);
      return false;
    }
  }

  validateMockToken(token) {
    try {
      // Mock tokens have format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log('WebSocket: Mock token expired');
        return false;
      }
      
      console.log('WebSocket: Mock token valid for user:', payload.email);
      return true;
    } catch (error) {
      console.log('WebSocket: Mock token validation failed:', error.message);
      return false;
    }
  }

  async handleConnection(ws, req) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      const clientId = this.generateClientId();

      let user = null;

      // Try Supabase authentication first
      try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
        if (!error && supabaseUser) {
          user = supabaseUser;
          console.log('WebSocket: Connected with Supabase user:', user.email);
        }
      } catch (supabaseError) {
        console.log('WebSocket: Supabase connection failed, using local fallback');
      }

      // Local authentication fallback
      if (!user && token.startsWith('eyJhbGciOiJub25lIi')) {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        user = {
          id: payload.sub,
          email: payload.email,
          user_metadata: {
            role: payload.role,
            first_name: payload.role.charAt(0).toUpperCase() + payload.role.slice(1),
            last_name: 'User'
          }
        };
        console.log('WebSocket: Connected with local mock user:', user.email);
      }

      if (!user) {
        console.log('WebSocket: Authentication failed, closing connection');
        ws.close(1008, 'Authentication failed');
        return;
      }

      // Store client information
      this.clients.set(clientId, {
        ws,
        user,
        rooms: new Set(),
        lastSeen: new Date(),
        connected: true
      });

      // Update user presence
      this.updateUserPresence(user.id, 'online');

      // Setup message handlers
      ws.on('message', (data) => this.handleMessage(clientId, data));
      ws.on('close', () => this.handleDisconnection(clientId));
      ws.on('error', (error) => this.handleError(clientId, error));

      // Send connection confirmation
      this.sendToClient(clientId, {
        type: 'connection_established',
        clientId,
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        }
      });

      console.log(`Client ${clientId} connected for user ${user.email}`);
    } catch (error) {
      console.error('Connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  }

  handleMessage(clientId, data) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      const message = JSON.parse(data.toString());
      client.lastSeen = new Date();

      switch (message.type) {
        case 'join_room':
          this.handleJoinRoom(clientId, message);
          break;
        case 'leave_room':
          this.handleLeaveRoom(clientId, message);
          break;
        case 'cursor_update':
          this.handleCursorUpdate(clientId, message);
          break;
        case 'presence_update':
          this.handlePresenceUpdate(clientId, message);
          break;
        case 'edit_operation':
          this.handleEditOperation(clientId, message);
          break;
        case 'comment_update':
          this.handleCommentUpdate(clientId, message);
          break;
        case 'approval_update':
          this.handleApprovalUpdate(clientId, message);
          break;
        case 'activity_update':
          this.handleActivityUpdate(clientId, message);
          break;
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Message handling error:', error);
      this.sendError(clientId, 'Invalid message format');
    }
  }

  handleJoinRoom(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { roomId } = message;
    if (!roomId) {
      this.sendError(clientId, 'Room ID required');
      return;
    }

    // Add client to room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(clientId);
    client.rooms.add(roomId);

    // Notify other room members
    this.broadcastToRoom(roomId, {
      type: 'user_joined_room',
      roomId,
      user: {
        id: client.user.id,
        email: client.user.email,
        metadata: client.user.user_metadata
      },
      timestamp: new Date().toISOString()
    }, clientId);

    // Send current room state to new member
    this.sendRoomState(clientId, roomId);

    console.log(`Client ${clientId} joined room ${roomId}`);
  }

  handleLeaveRoom(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { roomId } = message;
    if (!roomId || !client.rooms.has(roomId)) return;

    // Remove client from room
    this.rooms.get(roomId)?.delete(clientId);
    client.rooms.delete(roomId);

    // Clean up empty rooms
    if (this.rooms.get(roomId)?.size === 0) {
      this.rooms.delete(roomId);
    }

    // Notify other room members
    this.broadcastToRoom(roomId, {
      type: 'user_left_room',
      roomId,
      user: {
        id: client.user.id,
        email: client.user.email
      },
      timestamp: new Date().toISOString()
    });

    console.log(`Client ${clientId} left room ${roomId}`);
  }

  handleCursorUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { roomId, cursor } = message;
    if (!roomId || !client.rooms.has(roomId)) return;

    // Broadcast cursor position to other room members
    this.broadcastToRoom(roomId, {
      type: 'cursor_update',
      roomId,
      user: {
        id: client.user.id,
        email: client.user.email,
        metadata: client.user.user_metadata
      },
      cursor,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  handlePresenceUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { status, currentElement, roomId } = message;
    
    // Update presence in database
    this.updateUserPresence(client.user.id, status, currentElement);

    // Broadcast to room if specified
    if (roomId && client.rooms.has(roomId)) {
      this.broadcastToRoom(roomId, {
        type: 'presence_update',
        roomId,
        user: {
          id: client.user.id,
          email: client.user.email,
          metadata: client.user.user_metadata
        },
        status,
        currentElement,
        timestamp: new Date().toISOString()
      }, clientId);
    }
  }

  handleEditOperation(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { roomId, operation } = message;
    if (!roomId || !client.rooms.has(roomId)) return;

    // Store operation in database for persistence
    this.storeEditOperation(client.user.id, operation);

    // Broadcast to other room members
    this.broadcastToRoom(roomId, {
      type: 'edit_operation',
      roomId,
      user: {
        id: client.user.id,
        email: client.user.email
      },
      operation,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  handleCommentUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { roomId, comment, action } = message;
    if (!roomId) return;

    // Broadcast comment update
    this.broadcastToRoom(roomId, {
      type: 'comment_update',
      roomId,
      user: {
        id: client.user.id,
        email: client.user.email,
        metadata: client.user.user_metadata
      },
      comment,
      action,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  handleApprovalUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { workspaceId, approval, action } = message;
    if (!workspaceId) return;

    // Broadcast to workspace room
    const workspaceRoomId = `workspace:${workspaceId}`;
    this.broadcastToRoom(workspaceRoomId, {
      type: 'approval_update',
      workspaceId,
      user: {
        id: client.user.id,
        email: client.user.email,
        metadata: client.user.user_metadata
      },
      approval,
      action,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  handleActivityUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { roomId, activity } = message;
    if (!roomId) return;

    // Broadcast activity update
    this.broadcastToRoom(roomId, {
      type: 'activity_update',
      roomId,
      activity: {
        ...activity,
        user: {
          id: client.user.id,
          email: client.user.email,
          metadata: client.user.user_metadata
        },
        timestamp: new Date().toISOString()
      }
    }, clientId);
  }

  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Update user presence
    this.updateUserPresence(client.user.id, 'offline');

    // Notify all rooms the user was in
    for (const roomId of client.rooms) {
      this.broadcastToRoom(roomId, {
        type: 'user_left_room',
        roomId,
        user: {
          id: client.user.id,
          email: client.user.email
        },
        timestamp: new Date().toISOString()
      });

      // Remove from room
      this.rooms.get(roomId)?.delete(clientId);
      
      // Clean up empty rooms
      if (this.rooms.get(roomId)?.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    // Remove client
    this.clients.delete(clientId);
    
    console.log(`Client ${clientId} disconnected`);
  }

  handleError(clientId, error) {
    console.error(`WebSocket error for client ${clientId}:`, error);
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  sendError(clientId, error) {
    this.sendToClient(clientId, {
      type: 'error',
      error,
      timestamp: new Date().toISOString()
    });
  }

  broadcastToRoom(roomId, message, excludeClientId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const clientId of room) {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message);
      }
    }
  }

  sendRoomState(clientId, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const roomMembers = [];
    for (const memberClientId of room) {
      const memberClient = this.clients.get(memberClientId);
      if (memberClient && memberClientId !== clientId) {
        roomMembers.push({
          id: memberClient.user.id,
          email: memberClient.user.email,
          metadata: memberClient.user.user_metadata,
          lastSeen: memberClient.lastSeen
        });
      }
    }

    this.sendToClient(clientId, {
      type: 'room_state',
      roomId,
      members: roomMembers,
      timestamp: new Date().toISOString()
    });
  }

  async updateUserPresence(userId, status, currentElement = null) {
    this.userPresence.set(userId, {
      status,
      lastSeen: new Date(),
      currentElement
    });

    // Update in database
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          status,
          last_seen: new Date().toISOString(),
          current_element: currentElement
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error updating user presence:', error);
    }
  }

  async storeEditOperation(userId, operation) {
    try {
      await supabase
        .from('collaboration_edits')
        .insert({
          user_id: userId,
          entity_type: operation.entityType,
          entity_id: operation.entityId,
          operation_type: operation.type,
          element_id: operation.elementId,
          operation_data: operation.data,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing edit operation:', error);
    }
  }

  cleanupConnections() {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [clientId, client] of this.clients) {
      if (now - client.lastSeen > timeout || client.ws.readyState !== WebSocket.OPEN) {
        console.log(`Cleaning up inactive client ${clientId}`);
        this.handleDisconnection(clientId);
      }
    }
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      console.log('WebSocket server stopped');
    }
  }
}

// Export for use in other modules
export default CollaborationWebSocketServer;

// Start server if run directly
const server = new CollaborationWebSocketServer(process.env.WS_PORT || 8080);
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  server.stop();
  process.exit(0);
});
