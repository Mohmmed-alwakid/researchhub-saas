import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Eye, 
  MousePointer, 
  Clock, 
  BarChart3,
  Target,
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';

// Real-time Analytics Types
export interface InteractionEvent {
  id: string;
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'key_press' | 'mouse_move';
  timestamp: number;
  element: string;
  coordinates?: { x: number; y: number };
  value?: string;
  duration?: number;
  metadata: Record<string, any>;
}

export interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  count: number;
}

export interface AnalyticsMetrics {
  totalInteractions: number;
  averageTimePerBlock: number;
  completionRate: number;
  engagementScore: number;
  attentionSpan: number;
  errorRate: number;
  scrollDepth: number;
  clickAccuracy: number;
}

export interface ParticipantBehavior {
  sessionId: string;
  participantId: string;
  startTime: number;
  events: InteractionEvent[];
  metrics: AnalyticsMetrics;
  heatmaps: Record<string, HeatmapData[]>;
  patterns: BehaviorPattern[];
}

export interface BehaviorPattern {
  type: 'rapid_clicking' | 'excessive_scrolling' | 'long_pause' | 'confusion' | 'focused';
  confidence: number;
  timestamp: number;
  description: string;
  suggestions: string[];
}

// Real-time Analytics Tracker Class
export class RealTimeAnalytics {
  private events: InteractionEvent[] = [];
  private startTime: number = Date.now();
  private observers: MutationObserver[] = [];
  private isTracking: boolean = false;
  private sessionId: string;
  private participantId: string;
  private onUpdate?: (data: ParticipantBehavior) => void;

  constructor(sessionId: string, participantId: string, onUpdate?: (data: ParticipantBehavior) => void) {
    this.sessionId = sessionId;
    this.participantId = participantId;
    this.onUpdate = onUpdate;
  }

  // Start tracking interactions
  startTracking() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.startTime = Date.now();
    this.events = [];

    // Track mouse movements
    document.addEventListener('mousemove', this.handleMouseMove);
    
    // Track clicks
    document.addEventListener('click', this.handleClick);
    
    // Track scrolling
    document.addEventListener('scroll', this.handleScroll);
    
    // Track keyboard events
    document.addEventListener('keydown', this.handleKeyPress);
    
    // Track focus events
    document.addEventListener('focusin', this.handleFocus);
    document.addEventListener('focusout', this.handleBlur);
    
    // Track hover events
    document.addEventListener('mouseenter', this.handleMouseEnter, true);
    document.addEventListener('mouseleave', this.handleMouseLeave, true);

    // Send updates every 5 seconds
    setInterval(() => {
      if (this.isTracking) {
        this.sendUpdate();
      }
    }, 5000);
  }

  // Stop tracking
  stopTracking() {
    this.isTracking = false;
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('keydown', this.handleKeyPress);
    document.removeEventListener('focusin', this.handleFocus);
    document.removeEventListener('focusout', this.handleBlur);
    document.removeEventListener('mouseenter', this.handleMouseEnter, true);
    document.removeEventListener('mouseleave', this.handleMouseLeave, true);

    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Send final update
    this.sendUpdate();
  }

  // Event handlers
  private handleMouseMove = (event: MouseEvent) => {
    // Throttle mouse move events
    if (this.events.length > 0) {
      const lastEvent = this.events[this.events.length - 1];
      if (lastEvent.type === 'mouse_move' && Date.now() - lastEvent.timestamp < 100) {
        return;
      }
    }

    this.addEvent({
      type: 'mouse_move',
      element: this.getElementPath(event.target as Element),
      coordinates: { x: event.clientX, y: event.clientY },
      metadata: {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        scroll: { x: window.scrollX, y: window.scrollY }
      }
    });
  };

  private handleClick = (event: MouseEvent) => {
    this.addEvent({
      type: 'click',
      element: this.getElementPath(event.target as Element),
      coordinates: { x: event.clientX, y: event.clientY },
      metadata: {
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey
      }
    });
  };

  private handleScroll = (event: Event) => {
    this.addEvent({
      type: 'scroll',
      element: this.getElementPath(event.target as Element),
      metadata: {
        scrollTop: window.scrollY,
        scrollLeft: window.scrollX,
        documentHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight
      }
    });
  };

  private handleKeyPress = (event: KeyboardEvent) => {
    this.addEvent({
      type: 'key_press',
      element: this.getElementPath(event.target as Element),
      value: event.key,
      metadata: {
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey
      }
    });
  };

  private handleFocus = (event: FocusEvent) => {
    this.addEvent({
      type: 'focus',
      element: this.getElementPath(event.target as Element),
      metadata: {
        inputType: (event.target as HTMLInputElement)?.type || null
      }
    });
  };

  private handleBlur = (event: FocusEvent) => {
    const focusEvents = this.events.filter(e => 
      e.type === 'focus' && e.element === this.getElementPath(event.target as Element)
    );
    
    if (focusEvents.length > 0) {
      const lastFocus = focusEvents[focusEvents.length - 1];
      const duration = Date.now() - lastFocus.timestamp;
      
      this.addEvent({
        type: 'focus',
        element: this.getElementPath(event.target as Element),
        duration,
        metadata: {
          focusDuration: duration,
          value: (event.target as HTMLInputElement)?.value || null
        }
      });
    }
  };

  private handleMouseEnter = (event: MouseEvent) => {
    this.addEvent({
      type: 'hover',
      element: this.getElementPath(event.target as Element),
      metadata: {
        enter: true
      }
    });
  };

  private handleMouseLeave = (event: MouseEvent) => {
    const hoverEvents = this.events.filter(e => 
      e.type === 'hover' && e.element === this.getElementPath(event.target as Element)
    );
    
    if (hoverEvents.length > 0) {
      const lastHover = hoverEvents[hoverEvents.length - 1];
      const duration = Date.now() - lastHover.timestamp;
      
      this.addEvent({
        type: 'hover',
        element: this.getElementPath(event.target as Element),
        duration,
        metadata: {
          enter: false,
          hoverDuration: duration
        }
      });
    }
  };

  // Add event to tracking
  private addEvent(eventData: Partial<InteractionEvent>) {
    const event: InteractionEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      metadata: {},
      ...eventData
    } as InteractionEvent;

    this.events.push(event);

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  // Get element path for identification
  private getElementPath(element: Element | null): string {
    if (!element) return 'unknown';
    
    const path: string[] = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = current.className.split(' ').filter(Boolean);
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`;
        }
      }
      
      // Add nth-child if needed for uniqueness
      const siblings = Array.from(current.parentElement?.children || []);
      const index = siblings.indexOf(current);
      if (siblings.length > 1) {
        selector += `:nth-child(${index + 1})`;
      }
      
      path.unshift(selector);
      const parent = current.parentElement;
      if (!parent || parent === document.documentElement) {
        break;
      }
      current = parent;
    }
    
    return path.join(' > ');
  }

  // Calculate analytics metrics
  private calculateMetrics(): AnalyticsMetrics {
    const totalTime = Date.now() - this.startTime;
    
    return {
      totalInteractions: this.events.length,
      averageTimePerBlock: totalTime / Math.max(1, this.getBlockCount()),
      completionRate: this.calculateCompletionRate(),
      engagementScore: this.calculateEngagementScore(),
      attentionSpan: this.calculateAttentionSpan(),
      errorRate: this.calculateErrorRate(),
      scrollDepth: this.calculateScrollDepth(),
      clickAccuracy: this.calculateClickAccuracy()
    };
  }

  // Generate heatmap data
  private generateHeatmaps(): Record<string, HeatmapData[]> {
    const heatmaps: Record<string, HeatmapData[]> = {
      clicks: [],
      hovers: [],
      scrolls: []
    };

    // Click heatmap
    const clicks = this.events.filter(e => e.type === 'click' && e.coordinates);
    heatmaps.clicks = this.aggregateCoordinates(clicks);

    // Hover heatmap
    const hovers = this.events.filter(e => e.type === 'hover' && e.coordinates);
    heatmaps.hovers = this.aggregateCoordinates(hovers);

    return heatmaps;
  }

  // Detect behavior patterns
  private detectPatterns(): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Rapid clicking pattern
    const recentClicks = this.events
      .filter(e => e.type === 'click' && Date.now() - e.timestamp < 10000)
      .length;
    
    if (recentClicks > 10) {
      patterns.push({
        type: 'rapid_clicking',
        confidence: Math.min(recentClicks / 20, 1),
        timestamp: Date.now(),
        description: 'User is clicking rapidly, possibly frustrated',
        suggestions: ['Simplify interface', 'Add loading indicators', 'Improve feedback']
      });
    }

    // Long pause pattern
    const lastEvent = this.events[this.events.length - 1];
    if (lastEvent && Date.now() - lastEvent.timestamp > 30000) {
      patterns.push({
        type: 'long_pause',
        confidence: 0.8,
        timestamp: Date.now(),
        description: 'User has been inactive for a while',
        suggestions: ['Check if user needs help', 'Provide hints', 'Simplify current task']
      });
    }

    return patterns;
  }

  // Helper methods
  private getBlockCount(): number {
    // Count unique block interactions
    const blockElements = this.events
      .map(e => e.element)
      .filter(el => el.includes('block') || el.includes('question') || el.includes('task'));
    
    return new Set(blockElements).size || 1;
  }

  private calculateCompletionRate(): number {
    // Mock calculation - would be based on actual study progress
    return Math.random() * 0.3 + 0.7; // 70-100%
  }

  private calculateEngagementScore(): number {
    const totalTime = Date.now() - this.startTime;
    const interactionRate = this.events.length / (totalTime / 1000);
    return Math.min(interactionRate * 10, 100);
  }

  private calculateAttentionSpan(): number {
    const focusEvents = this.events.filter(e => e.type === 'focus' && e.duration);
    if (focusEvents.length === 0) return 0;
    
    const avgFocus = focusEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / focusEvents.length;
    return avgFocus / 1000; // Convert to seconds
  }

  private calculateErrorRate(): number {
    // Mock calculation - would track actual errors
    return Math.random() * 0.1; // 0-10%
  }

  private calculateScrollDepth(): number {
    const scrollEvents = this.events.filter(e => e.type === 'scroll');
    if (scrollEvents.length === 0) return 0;
    
    const maxScroll = Math.max(...scrollEvents.map(e => e.metadata.scrollTop || 0));
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    return docHeight > 0 ? (maxScroll / docHeight) * 100 : 100;
  }

  private calculateClickAccuracy(): number {
    // Mock calculation - would measure clicks on intended vs unintended elements
    return Math.random() * 0.2 + 0.8; // 80-100%
  }

  private aggregateCoordinates(events: InteractionEvent[]): HeatmapData[] {
    const grid: Record<string, { count: number; intensity: number }> = {};
    const gridSize = 20; // 20px grid
    
    events.forEach(event => {
      if (!event.coordinates) return;
      
      const gridX = Math.floor(event.coordinates.x / gridSize) * gridSize;
      const gridY = Math.floor(event.coordinates.y / gridSize) * gridSize;
      const key = `${gridX},${gridY}`;
      
      if (!grid[key]) {
        grid[key] = { count: 0, intensity: 0 };
      }
      
      grid[key].count++;
      grid[key].intensity += 1;
    });
    
    return Object.entries(grid).map(([key, data]) => {
      const [x, y] = key.split(',').map(Number);
      return {
        x,
        y,
        count: data.count,
        intensity: Math.min(data.intensity / 10, 1) // Normalize intensity
      };
    });
  }

  // Send update to callback
  private sendUpdate() {
    if (!this.onUpdate) return;
    
    const behavior: ParticipantBehavior = {
      sessionId: this.sessionId,
      participantId: this.participantId,
      startTime: this.startTime,
      events: [...this.events],
      metrics: this.calculateMetrics(),
      heatmaps: this.generateHeatmaps(),
      patterns: this.detectPatterns()
    };
    
    this.onUpdate(behavior);
  }

  // Get current data
  getCurrentData(): ParticipantBehavior {
    return {
      sessionId: this.sessionId,
      participantId: this.participantId,
      startTime: this.startTime,
      events: [...this.events],
      metrics: this.calculateMetrics(),
      heatmaps: this.generateHeatmaps(),
      patterns: this.detectPatterns()
    };
  }
}

// Real-time Analytics Dashboard Component
export const RealTimeAnalyticsDashboard: React.FC<{
  sessionId: string;
  participantId: string;
  isLive?: boolean;
}> = ({ sessionId, participantId, isLive: _isLive = false }) => {
  const [analytics, setAnalytics] = useState<RealTimeAnalytics | null>(null);
  const [data, setData] = useState<ParticipantBehavior | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'heatmap' | 'timeline' | 'patterns'>('overview');

  // Initialize analytics
  useEffect(() => {
    const analyticsInstance = new RealTimeAnalytics(
      sessionId,
      participantId,
      (behaviorData) => {
        setData(behaviorData);
      }
    );
    
    setAnalytics(analyticsInstance);
    
    return () => {
      analyticsInstance.stopTracking();
    };
  }, [sessionId, participantId]);

  // Start/stop tracking
  const toggleTracking = useCallback(() => {
    if (!analytics) return;
    
    if (isTracking) {
      analytics.stopTracking();
      setIsTracking(false);
    } else {
      analytics.startTracking();
      setIsTracking(true);
    }
  }, [analytics, isTracking]);

  // Export data
  const exportData = useCallback(() => {
    if (!data) return;
    
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      sessionDuration: Date.now() - data.startTime
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${sessionId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, sessionId]);

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Loading</h3>
        <p className="text-gray-600">Initializing real-time analytics tracking...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Real-time Analytics</h2>
            <p className="text-gray-600">Session: {sessionId}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-900">
                {isTracking ? 'Tracking' : 'Stopped'}
              </span>
            </div>
            
            <button
              onClick={toggleTracking}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isTracking 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
            
            <button
              onClick={exportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-gray-900">{data.metrics.totalInteractions}</p>
            </div>
            <MousePointer className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Score</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(data.metrics.engagementScore)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attention Span</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(data.metrics.attentionSpan)}s</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(data.metrics.completionRate * 100)}%</p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'heatmap', name: 'Heatmaps', icon: Target },
              { id: 'timeline', name: 'Timeline', icon: Clock },
              { id: 'patterns', name: 'Patterns', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`${
                    selectedView === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {selectedView === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Interaction Breakdown</h3>
                  <div className="space-y-3">
                    {['click', 'scroll', 'hover', 'key_press', 'focus'].map(type => {
                      const count = data.events.filter(e => e.type === type).length;
                      const percentage = (count / data.events.length) * 100;
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Scroll Depth</span>
                      <span className="text-sm font-medium">{Math.round(data.metrics.scrollDepth)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Click Accuracy</span>
                      <span className="text-sm font-medium">{Math.round(data.metrics.clickAccuracy * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-medium">{Math.round(data.metrics.errorRate * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time per Block</span>
                      <span className="text-sm font-medium">{Math.round(data.metrics.averageTimePerBlock / 1000)}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'patterns' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Detected Behavior Patterns</h3>
              {data.patterns.length > 0 ? (
                <div className="space-y-4">
                  {data.patterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">
                          {pattern.type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          Confidence: {Math.round(pattern.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                          {pattern.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No behavior patterns detected yet.</p>
              )}
            </div>
          )}

          {selectedView === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity Timeline</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {data.events.slice(-50).reverse().map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <span className="text-xs font-mono text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {event.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-600 truncate flex-1">
                      {event.element}
                    </span>
                    {event.coordinates && (
                      <span className="text-xs text-gray-500">
                        ({event.coordinates.x}, {event.coordinates.y})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'heatmap' && (
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Heatmap Visualization</h3>
              <p className="text-gray-600">
                Heatmap visualization would be rendered here showing click and hover patterns.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Click data points: {data.heatmaps.clicks?.length || 0} • 
                Hover data points: {data.heatmaps.hovers?.length || 0}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalyticsDashboard;
