import React from 'react';
import { io, Socket } from 'socket.io-client';


// WebSocket Message Types
export interface WebSocketMessage {
  id: string;
  type: string;
  timestamp: string;
  senderId: string;
  sessionId: string;
  data: MessageData;
}

export interface MessageData {
  blockId?: string;
  blockIndex?: number;
  value?: string | number | boolean;
  responseData?: ResponseValue;
  interventionData?: InterventionData;
  metadata?: Record<string, unknown>;
  studyId?: string;
  participantId?: string;
  pauseTime?: string;
  resumeTime?: string;
  completionTime?: string;
  researcherId?: string;
  guidance?: string;
  intervention?: InterventionData;
  response?: ResponseValue;
  startObservingTime?: string;
  stopObservingTime?: string;
  timestamp?: string;
  startTime?: string;
  userAgent?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface ResponseValue {
  text?: string;
  rating?: number;
  selection?: string[];
  file?: File;
  timestamp: string;
}

export interface InteractionData {
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'input' | 'keypress';
  element: string;
  timestamp: string;
  coordinates?: { x: number; y: number };
  value?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown; // Make compatible with MessageData
}

export interface ConnectionInfo {
  id: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  url: string;
  lastConnected?: string;
  totalConnections: number;
  reconnectAttempts: number;
}

export interface InterventionData {
  type: 'guidance' | 'hint' | 'redirect' | 'pause';
  message: string;
  priority: 'low' | 'medium' | 'high';
  autoClose?: boolean;
  duration?: number;
}

export interface CollaborationEvent extends WebSocketMessage {
  type: 'participant_joined' | 'participant_left' | 'block_changed' | 'response_updated' | 'annotation_added' | 'note_added';
}

export interface RealTimeAnalyticsEvent extends WebSocketMessage {
  type: 'interaction_tracked' | 'behavior_detected' | 'attention_changed' | 'engagement_updated';
}

export interface StudySessionEvent extends WebSocketMessage {
  type: 'session_started' | 'session_paused' | 'session_resumed' | 'session_completed' | 'session_abandoned';
}

export interface ResearcherObservationEvent extends WebSocketMessage {
  type: 'researcher_watching' | 'researcher_stopped_watching' | 'live_guidance' | 'intervention_triggered';
}

// WebSocket Event Handlers
export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onCollaborationEvent?: (event: CollaborationEvent) => void;
  onAnalyticsEvent?: (RealTimeAnalyticsEvent: RealTimeAnalyticsEvent) => void;
  onSessionEvent?: (event: StudySessionEvent) => void;
  onObservationEvent?: (event: ResearcherObservationEvent) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

// WebSocket Client Configuration
export interface WebSocketConfig {
  url: string;
  options?: {
    autoConnect?: boolean;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    transports?: string[];
  };
  authentication?: {
    token?: string;
    userId?: string;
    role?: 'participant' | 'researcher' | 'admin';
  };
}

// Real-time Collaboration Manager
export class RealTimeCollaborationManager {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private handlers: WebSocketEventHandlers;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnected = false;
  private messageQueue: WebSocketMessage[] = [];
  
  constructor(config: WebSocketConfig, handlers: WebSocketEventHandlers = {}) {
    this.config = config;
    this.handlers = handlers;
  }
  
  // Connection Management
  async connect(): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        return true;
      }
      
      this.socket = io(this.config.url, {
        autoConnect: this.config.options?.autoConnect ?? true,
        timeout: this.config.options?.timeout ?? 20000,
        transports: this.config.options?.transports ?? ['websocket', 'polling'],
        auth: this.config.authentication
      });
      
      this.setupEventListeners();
      
      return new Promise((resolve) => {
        this.socket!.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.flushMessageQueue();
          this.handlers.onConnect?.();
          resolve(true);
        });
        
        this.socket!.on('connect_error', (error) => {
          this.handlers.onError?.(error);
          resolve(false);
        });
      });
      
    } catch (error) {
      this.handlers.onError?.(error as Error);
      return false;
    }
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  // Event Listeners Setup
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.handlers.onDisconnect?.(reason);
      
      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, (this.config.options?.retryDelay ?? 1000) * this.reconnectAttempts);
      }
    });
    
    this.socket.on('error', (error) => {
      this.handlers.onError?.(error);
    });
    
    // Collaboration Events
    this.socket.on('collaboration_event', (event: CollaborationEvent) => {
      this.handlers.onCollaborationEvent?.(event);
    });
    
    // Analytics Events
    this.socket.on('analytics_event', (event: RealTimeAnalyticsEvent) => {
      this.handlers.onAnalyticsEvent?.(event);
    });
    
    // Session Events
    this.socket.on('session_event', (event: StudySessionEvent) => {
      this.handlers.onSessionEvent?.(event);
    });
    
    // Observation Events
    this.socket.on('observation_event', (event: ResearcherObservationEvent) => {
      this.handlers.onObservationEvent?.(event);
    });
    
    // Generic Message Handler
    this.socket.on('message', (message: WebSocketMessage) => {
      this.handlers.onMessage?.(message);
    });
  }
  
  // Message Sending
  sendMessage(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date().toISOString()
    };
    
    if (this.isConnected && this.socket) {
      this.socket.emit('message', fullMessage);
    } else {
      this.messageQueue.push(fullMessage);
    }
  }
  
  // Specific Event Emitters
  emitCollaborationEvent(event: Omit<CollaborationEvent, 'id' | 'timestamp'>): void {
    this.sendMessage({ ...event, type: event.type });
  }
  
  emitAnalyticsEvent(event: Omit<RealTimeAnalyticsEvent, 'id' | 'timestamp'>): void {
    this.sendMessage({ ...event, type: event.type });
  }
  
  emitSessionEvent(event: Omit<StudySessionEvent, 'id' | 'timestamp'>): void {
    this.sendMessage({ ...event, type: event.type });
  }
  
  emitObservationEvent(event: Omit<ResearcherObservationEvent, 'id' | 'timestamp'>): void {
    this.sendMessage({ ...event, type: event.type });
  }
  
  // Room Management
  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }
  
  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }
  
  // Utility Methods
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.socket) {
        this.socket.emit('message', message);
      }
    }
  }
  
  // Status Methods
  isConnectedStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
  
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Study Session WebSocket Manager
export class StudySessionWebSocket extends RealTimeCollaborationManager {
  private studyId: string;
  private participantId: string;
  private researcherId?: string;
  
  constructor(
    studyId: string, 
    participantId: string, 
    config: WebSocketConfig,
    handlers: WebSocketEventHandlers = {}
  ) {
    super(config, handlers);
    this.studyId = studyId;
    this.participantId = participantId;
  }
  
  // Study-specific methods
  async startSession(): Promise<void> {
    await this.connect();
    this.joinRoom(`study_${this.studyId}`);
    this.joinRoom(`participant_${this.participantId}`);
    
    this.emitSessionEvent({
      type: 'session_started',
      senderId: this.participantId,
      sessionId: this.studyId,
      data: {
        studyId: this.studyId,
        participantId: this.participantId,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`
      }
    });
  }
  
  pauseSession(): void {
    this.emitSessionEvent({
      type: 'session_paused',
      senderId: this.participantId,
      sessionId: this.studyId,
      data: {
        pauseTime: new Date().toISOString()
      }
    });
  }
  
  resumeSession(): void {
    this.emitSessionEvent({
      type: 'session_resumed',
      senderId: this.participantId,
      sessionId: this.studyId,
      data: {
        resumeTime: new Date().toISOString()
      }
    });
  }
  
  completeSession(): void {
    this.emitSessionEvent({
      type: 'session_completed',
      senderId: this.participantId,
      sessionId: this.studyId,
      data: {
        completionTime: new Date().toISOString()
      }
    });
  }
  
  updateBlockProgress(blockId: string, blockIndex: number, response?: ResponseValue): void {
    this.emitCollaborationEvent({
      type: 'block_changed',
      senderId: this.participantId,
      sessionId: this.studyId,
      data: {
        blockId,
        blockIndex,
        response,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  trackInteraction(interactionData: InteractionData): void {
    this.emitAnalyticsEvent({
      type: 'interaction_tracked',
      senderId: this.participantId,
      sessionId: this.studyId,
      data: interactionData
    });
  }
  
  enableResearcherObservation(researcherId: string): void {
    this.researcherId = researcherId;
    this.joinRoom(`researcher_${researcherId}`);
  }
  
  disableResearcherObservation(): void {
    if (this.researcherId) {
      this.leaveRoom(`researcher_${this.researcherId}`);
      this.researcherId = undefined;
    }
  }
}

// Researcher Observation WebSocket Manager
export class ResearcherObservationWebSocket extends RealTimeCollaborationManager {
  private researcherId: string;
  private observedSessions: Set<string> = new Set();
  
  constructor(
    researcherId: string,
    config: WebSocketConfig,
    handlers: WebSocketEventHandlers = {}
  ) {
    super(config, handlers);
    this.researcherId = researcherId;
  }
  
  async startObserving(): Promise<void> {
    await this.connect();
    this.joinRoom(`researcher_${this.researcherId}`);
  }
  
  observeSession(sessionId: string): void {
    this.joinRoom(`study_${sessionId}`);
    this.observedSessions.add(sessionId);
    
    this.emitObservationEvent({
      type: 'researcher_watching',
      senderId: this.researcherId,
      sessionId,
      data: {
        researcherId: this.researcherId,
        startObservingTime: new Date().toISOString()
      }
    });
  }
  
  stopObservingSession(sessionId: string): void {
    this.leaveRoom(`study_${sessionId}`);
    this.observedSessions.delete(sessionId);
    
    this.emitObservationEvent({
      type: 'researcher_stopped_watching',
      senderId: this.researcherId,
      sessionId,
      data: {
        researcherId: this.researcherId,
        stopObservingTime: new Date().toISOString()
      }
    });
  }
  
  sendLiveGuidance(sessionId: string, guidance: string): void {
    this.emitObservationEvent({
      type: 'live_guidance',
      senderId: this.researcherId,
      sessionId,
      data: {
        guidance,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  triggerIntervention(sessionId: string, intervention: InterventionData): void {
    this.emitObservationEvent({
      type: 'intervention_triggered',
      senderId: this.researcherId,
      sessionId,
      data: {
        intervention,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  getObservedSessions(): string[] {
    return Array.from(this.observedSessions);
  }
}

// WebSocket Connection Factory
export class WebSocketFactory {
  private static instance: WebSocketFactory;
  private connections: Map<string, RealTimeCollaborationManager> = new Map();
  
  static getInstance(): WebSocketFactory {
    if (!WebSocketFactory.instance) {
      WebSocketFactory.instance = new WebSocketFactory();
    }
    return WebSocketFactory.instance;
  }
  
  createStudySessionConnection(
    studyId: string,
    participantId: string,
    config: WebSocketConfig,
    handlers?: WebSocketEventHandlers
  ): StudySessionWebSocket {
    const connectionId = `study_${studyId}_${participantId}`;
    
    if (this.connections.has(connectionId)) {
      return this.connections.get(connectionId) as StudySessionWebSocket;
    }
    
    const connection = new StudySessionWebSocket(studyId, participantId, config, handlers);
    this.connections.set(connectionId, connection);
    
    return connection;
  }
  
  createResearcherObservationConnection(
    researcherId: string,
    config: WebSocketConfig,
    handlers?: WebSocketEventHandlers
  ): ResearcherObservationWebSocket {
    const connectionId = `researcher_${researcherId}`;
    
    if (this.connections.has(connectionId)) {
      return this.connections.get(connectionId) as ResearcherObservationWebSocket;
    }
    
    const connection = new ResearcherObservationWebSocket(researcherId, config, handlers);
    this.connections.set(connectionId, connection);
    
    return connection;
  }
  
  getConnection(connectionId: string): RealTimeCollaborationManager | undefined {
    return this.connections.get(connectionId);
  }
  
  closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.disconnect();
      this.connections.delete(connectionId);
    }
  }
  
  closeAllConnections(): void {
    this.connections.forEach((connection) => {
      connection.disconnect();
    });
    this.connections.clear();
  }
}

// React Hook for WebSocket Integration
export function useWebSocket(
  config: WebSocketConfig,
  handlers: WebSocketEventHandlers = {}
) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [connectionInfo, setConnectionInfo] = React.useState<ConnectionInfo | null>(null);
  const managerRef = React.useRef<RealTimeCollaborationManager | null>(null);
  
  React.useEffect(() => {
    const enhancedHandlers: WebSocketEventHandlers = {
      ...handlers,
      onConnect: () => {
        setIsConnected(true);
        setError(null);
        handlers.onConnect?.();
      },
      onDisconnect: (reason) => {
        setIsConnected(false);
        handlers.onDisconnect?.(reason);
      },
      onError: (err) => {
        setError(err);
        handlers.onError?.(err);
      }
    };
    
    managerRef.current = new RealTimeCollaborationManager(config, enhancedHandlers);
    
    const connectAndUpdateInfo = async () => {
      await managerRef.current?.connect();
      const info = managerRef.current?.getConnectionInfo();
      if (info) {
        setConnectionInfo({
          id: info.socketId || 'unknown',
          status: info.connected ? 'connected' : 'disconnected',
          url: config.url,
          lastConnected: new Date().toISOString(),
          totalConnections: 1,
          reconnectAttempts: info.reconnectAttempts
        });
      }
    };
    
    connectAndUpdateInfo();
    
    return () => {
      managerRef.current?.disconnect();
    };
  }, [config, handlers]);
  
  const sendMessage = React.useCallback((message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => {
    managerRef.current?.sendMessage(message);
  }, []);
  
  const joinRoom = React.useCallback((roomId: string) => {
    managerRef.current?.joinRoom(roomId);
  }, []);
  
  const leaveRoom = React.useCallback((roomId: string) => {
    managerRef.current?.leaveRoom(roomId);
  }, []);
  
  return {
    isConnected,
    error,
    connectionInfo,
    sendMessage,
    joinRoom,
    leaveRoom,
    manager: managerRef.current
  };
}

export default WebSocketFactory;
