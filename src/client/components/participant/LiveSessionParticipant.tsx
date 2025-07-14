import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Eye, 
  Video,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

// Real-time Execution Types
export interface LiveSession {
  id: string;
  studyId: string;
  participantId: string;
  researcherId?: string;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'abandoned';
  startTime: string;
  endTime?: string;
  currentBlockIndex: number;
  totalBlocks: number;
  isLive: boolean;
  hasObserver: boolean;
  recordingEnabled: boolean;
}

export interface LiveObservation {
  id: string;
  sessionId: string;
  researcherId: string;
  type: 'note' | 'intervention' | 'guidance' | 'flag';
  content: string;
  timestamp: string;
  blockIndex?: number;
  urgent: boolean;
}

export interface LiveMetrics {
  sessionId: string;
  participantEngagement: number;
  averageResponseTime: number;
  completionRate: number;
  currentBlockDuration: number;
  totalSessionDuration: number;
  interactionCount: number;
  pauseCount: number;
  qualityScore: number;
}

export interface LiveIntervention {
  id: string;
  type: 'guidance' | 'clarification' | 'technical_help' | 'encouragement';
  trigger: 'manual' | 'automated' | 'ai_suggested';
  content: string;
  displayType: 'modal' | 'banner' | 'sidebar' | 'audio';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  autoHide?: number; // seconds
}

// Live Session Manager
export class LiveSessionManager {
  private session: LiveSession | null = null;
  private metrics: LiveMetrics | null = null;
  private observations: LiveObservation[] = [];
  private websocketManager: any; // WebSocket connection
  private eventListeners: Map<string, Function[]> = new Map();
  private metricsUpdateInterval: NodeJS.Timeout | null = null;
  
  constructor(websocketManager: any) {
    this.websocketManager = websocketManager;
  }
  
  // Session Management
  async startLiveSession(
    studyId: string, 
    participantId: string, 
    researcherId?: string
  ): Promise<LiveSession> {
    const session: LiveSession = {
      id: `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studyId,
      participantId,
      researcherId,
      status: 'active',
      startTime: new Date().toISOString(),
      currentBlockIndex: 0,
      totalBlocks: 5, // Mock data
      isLive: true,
      hasObserver: !!researcherId,
      recordingEnabled: false
    };
    
    this.session = session;
    this.initializeMetrics(session.id);
    this.startMetricsTracking();
    
    // Notify via WebSocket
    this.websocketManager?.emitSessionEvent({
      type: 'session_started',
      senderId: participantId,
      sessionId: session.id,
      data: session
    });
    
    this.emit('session_started', session);
    return session;
  }
  
  pauseSession(): void {
    if (this.session) {
      this.session.status = 'paused';
      this.stopMetricsTracking();
      
      this.websocketManager?.emitSessionEvent({
        type: 'session_paused',
        senderId: this.session.participantId,
        sessionId: this.session.id,
        data: { pauseTime: new Date().toISOString() }
      });
      
      this.emit('session_paused', this.session);
    }
  }
  
  resumeSession(): void {
    if (this.session) {
      this.session.status = 'active';
      this.startMetricsTracking();
      
      this.websocketManager?.emitSessionEvent({
        type: 'session_resumed',
        senderId: this.session.participantId,
        sessionId: this.session.id,
        data: { resumeTime: new Date().toISOString() }
      });
      
      this.emit('session_resumed', this.session);
    }
  }
  
  completeSession(): void {
    if (this.session) {
      this.session.status = 'completed';
      this.session.endTime = new Date().toISOString();
      this.stopMetricsTracking();
      
      this.websocketManager?.emitSessionEvent({
        type: 'session_completed',
        senderId: this.session.participantId,
        sessionId: this.session.id,
        data: this.session
      });
      
      this.emit('session_completed', this.session);
    }
  }
  
  // Block Navigation
  navigateToBlock(blockIndex: number): void {
    if (this.session && blockIndex >= 0 && blockIndex < this.session.totalBlocks) {
      this.session.currentBlockIndex = blockIndex;
      
      this.websocketManager?.emitCollaborationEvent({
        type: 'block_changed',
        senderId: this.session.participantId,
        sessionId: this.session.id,
        data: { 
          blockIndex, 
          timestamp: new Date().toISOString() 
        }
      });
      
      this.emit('block_changed', { session: this.session, blockIndex });
    }
  }
  
  // Observations Management
  addObservation(observation: Omit<LiveObservation, 'id' | 'timestamp'>): LiveObservation {
    const fullObservation: LiveObservation = {
      ...observation,
      id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    this.observations.push(fullObservation);
    
    this.websocketManager?.emitObservationEvent({
      type: 'researcher_watching',
      senderId: observation.researcherId,
      sessionId: observation.sessionId,
      data: fullObservation
    });
    
    this.emit('observation_added', fullObservation);
    return fullObservation;
  }
  
  // Interventions
  triggerIntervention(intervention: LiveIntervention): void {
    if (this.session) {
      this.websocketManager?.emitObservationEvent({
        type: 'intervention_triggered',
        senderId: this.session.researcherId || 'system',
        sessionId: this.session.id,
        data: intervention
      });
      
      this.emit('intervention_triggered', intervention);
    }
  }
  
  // Metrics Tracking
  private initializeMetrics(sessionId: string): void {
    this.metrics = {
      sessionId,
      participantEngagement: 100,
      averageResponseTime: 0,
      completionRate: 0,
      currentBlockDuration: 0,
      totalSessionDuration: 0,
      interactionCount: 0,
      pauseCount: 0,
      qualityScore: 100
    };
  }
  
  private startMetricsTracking(): void {
    this.metricsUpdateInterval = setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }
  
  private stopMetricsTracking(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
    }
  }
  
  private updateMetrics(): void {
    if (!this.session || !this.metrics) return;
    
    const now = new Date();
    const startTime = new Date(this.session.startTime);
    this.metrics.totalSessionDuration = (now.getTime() - startTime.getTime()) / 1000;
    
    // Calculate completion rate
    this.metrics.completionRate = (this.session.currentBlockIndex / this.session.totalBlocks) * 100;
    
    // Simulate engagement calculation (would be based on real interactions)
    this.metrics.participantEngagement = Math.max(50, 100 - (this.metrics.totalSessionDuration / 60) * 2);
    
    this.emit('metrics_updated', this.metrics);
  }
  
  // Event Management
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
  
  // Getters
  getCurrentSession(): LiveSession | null {
    return this.session;
  }
  
  getCurrentMetrics(): LiveMetrics | null {
    return this.metrics;
  }
  
  getObservations(): LiveObservation[] {
    return [...this.observations];
  }
}

// Live Session Participant Component
export const LiveSessionParticipant: React.FC<{
  studyId: string;
  participantId: string;
  onSessionEnd: () => void;
}> = ({ studyId, participantId, onSessionEnd }) => {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [interventions, setInterventions] = useState<LiveIntervention[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const sessionManagerRef = useRef<LiveSessionManager | null>(null);
  
  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Mock WebSocket manager
        const mockWebSocketManager = {
          emitSessionEvent: (event: any) => console.log('Session event:', event),
          emitCollaborationEvent: (event: any) => console.log('Collaboration event:', event),
          emitObservationEvent: (event: any) => console.log('Observation event:', event)
        };
        
        sessionManagerRef.current = new LiveSessionManager(mockWebSocketManager);
        
        // Set up event listeners
        sessionManagerRef.current.on('session_started', setSession);
        sessionManagerRef.current.on('session_paused', setSession);
        sessionManagerRef.current.on('session_resumed', setSession);
        sessionManagerRef.current.on('session_completed', (completedSession: LiveSession) => {
          setSession(completedSession);
          onSessionEnd();
        });
        sessionManagerRef.current.on('metrics_updated', setMetrics);
        sessionManagerRef.current.on('intervention_triggered', (intervention: LiveIntervention) => {
          setInterventions(prev => [...prev, intervention]);
        });
        
        // Start the session
        await sessionManagerRef.current.startLiveSession(studyId, participantId);
        setConnectionStatus('connected');
        
      } catch (error) {
        console.error('Failed to initialize live session:', error);
        setConnectionStatus('disconnected');
      }
    };
    
    initializeSession();
    
    return () => {
      sessionManagerRef.current?.completeSession();
    };
  }, [studyId, participantId, onSessionEnd]);
  
  const handlePause = () => {
    sessionManagerRef.current?.pauseSession();
  };
  
  const handleResume = () => {
    sessionManagerRef.current?.resumeSession();
  };
  
  const handleComplete = () => {
    sessionManagerRef.current?.completeSession();
  };
  
  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    // Implement recording logic
  };
  
  const dismissIntervention = (interventionId: string) => {
    setInterventions(prev => prev.filter(i => i.id !== interventionId));
  };
  
  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Connecting to Live Session</h2>
          <p className="text-gray-600">Please wait while we set up your live research session...</p>
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Connection Failed</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the live session.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Session Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Live Session</span>
            </div>
            
            {session && (
              <div className="text-sm text-gray-600">
                Block {session.currentBlockIndex + 1} of {session.totalBlocks}
              </div>
            )}
            
            {metrics && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {Math.floor(metrics.totalSessionDuration / 60)}m {Math.floor(metrics.totalSessionDuration % 60)}s
                </div>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  {Math.round(metrics.participantEngagement)}% engagement
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Recording Controls */}
            <button
              onClick={handleRecordingToggle}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                isRecording
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </button>
            
            {/* Session Controls */}
            {session?.status === 'active' ? (
              <button
                onClick={handlePause}
                className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </button>
            ) : session?.status === 'paused' ? (
              <button
                onClick={handleResume}
                className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </button>
            ) : null}
            
            <button
              onClick={handleComplete}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {session && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((session.currentBlockIndex + 1) / session.totalBlocks) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Interventions Display */}
      {interventions.length > 0 && (
        <div className="fixed top-20 right-6 z-50 space-y-3">
          {interventions.map((intervention) => (
            <div
              key={intervention.id}
              className={`max-w-sm bg-white rounded-lg shadow-lg border-l-4 p-4 ${
                intervention.urgency === 'high' || intervention.urgency === 'critical'
                  ? 'border-red-500'
                  : intervention.urgency === 'medium'
                  ? 'border-yellow-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {intervention.type.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{intervention.content}</p>
                </div>
                <button
                  onClick={() => dismissIntervention(intervention.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Main Study Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* This would be the actual study blocks */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Study Block</h2>
            <p className="text-gray-600 mb-6">
              This is where the actual study content would be displayed. 
              The content adapts to real-time observations and interventions.
            </p>
            
            {/* Sample Block Content */}
            <div className="space-y-6">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your thoughts on this concept?
                </label>
                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your response here..."
                />
              </div>
              
              <div className="flex justify-between">
                <button className="px-6 py-3 text-gray-600 hover:text-gray-800">
                  Previous
                </button>
                <button 
                  onClick={() => sessionManagerRef.current?.navigateToBlock((session?.currentBlockIndex || 0) + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Observer Indicator */}
      {session?.hasObserver && (
        <div className="fixed bottom-6 right-6 bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center text-green-700">
            <Eye className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Researcher observing</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionParticipant;
