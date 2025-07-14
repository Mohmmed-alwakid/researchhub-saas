import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  ArrowLeft, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Home,
  User,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';

// Mobile-specific interfaces
export interface MobileViewport {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isFullscreen: boolean;
  devicePixelRatio: number;
}

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'pan';
  startPosition: { x: number; y: number };
  endPosition?: { x: number; y: number };
  duration: number;
  force?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface MobileStudySession {
  studyId: string;
  currentBlockIndex: number;
  totalBlocks: number;
  startTime: string;
  touchGestures: TouchGesture[];
  deviceInfo: {
    userAgent: string;
    screenSize: string;
    orientation: string;
    connectionType: string;
    batteryLevel?: number;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    highContrast: boolean;
    reduceMotion: boolean;
    voiceOver: boolean;
  };
}

// Mobile Detection Utility
class MobileDetection {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  static isTablet(): boolean {
    return /iPad|Android(?=.*\bMobile\b)(?=.*\b(?:Tablet|Tab)\b)/i.test(navigator.userAgent);
  }
  
  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
  
  static isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }
  
  static supportsTouch(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  static getDeviceInfo() {
    return {
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid(),
      supportsTouch: this.supportsTouch(),
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
      pixelRatio: window.devicePixelRatio,
      orientation: screen.orientation?.type || 'unknown'
    };
  }
}

// Touch Gesture Handler
class TouchGestureHandler {
  private gestures: TouchGesture[] = [];
  private currentTouch: Touch | null = null;
  private touchStartTime: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  
  constructor(private onGesture: (gesture: TouchGesture) => void) {}
  
  handleTouchStart = (event: TouchEvent) => {
    this.currentTouch = event.touches[0];
    this.touchStartTime = Date.now();
    
    // Set up long press detection
    this.longPressTimer = setTimeout(() => {
      if (this.currentTouch) {
        this.onGesture({
          type: 'long-press',
          startPosition: { x: this.currentTouch.clientX, y: this.currentTouch.clientY },
          duration: Date.now() - this.touchStartTime
        });
      }
    }, 500);
  };
  
  handleTouchMove = (event: TouchEvent) => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  };
  
  handleTouchEnd = (event: TouchEvent) => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    if (!this.currentTouch) return;
    
    const touch = event.changedTouches[0];
    const duration = Date.now() - this.touchStartTime;
    const deltaX = touch.clientX - this.currentTouch.clientX;
    const deltaY = touch.clientY - this.currentTouch.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Determine gesture type
    if (duration < 300 && distance < 10) {
      this.onGesture({
        type: 'tap',
        startPosition: { x: this.currentTouch.clientX, y: this.currentTouch.clientY },
        endPosition: { x: touch.clientX, y: touch.clientY },
        duration
      });
    } else if (distance > 50) {
      // Determine swipe direction
      const direction = Math.abs(deltaX) > Math.abs(deltaY) 
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up');
      
      this.onGesture({
        type: 'swipe',
        startPosition: { x: this.currentTouch.clientX, y: this.currentTouch.clientY },
        endPosition: { x: touch.clientX, y: touch.clientY },
        duration,
        direction
      });
    }
    
    this.currentTouch = null;
  };
  
  getGestures(): TouchGesture[] {
    return [...this.gestures];
  }
  
  clearGestures() {
    this.gestures = [];
  }
}

// Mobile Navigation Component
export const MobileNavigation: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}> = ({ isOpen, onToggle, onNavigate, currentPath }) => {
  const navigationItems = [
    { path: '/participant', label: 'Dashboard', icon: Home },
    { path: '/participant/studies', label: 'My Studies', icon: User },
    { path: '/participant/settings', label: 'Settings', icon: Settings },
    { path: '/logout', label: 'Sign Out', icon: LogOut }
  ];
  
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onToggle} />
      )}
      
      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-0 left-0 z-40 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 pt-16">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    onToggle();
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPath === item.path 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

// Mobile Status Bar
export const MobileStatusBar: React.FC<{
  connectionStatus: 'online' | 'offline';
  batteryLevel?: number;
  signalStrength?: number;
}> = ({ connectionStatus, batteryLevel, signalStrength }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="md:hidden bg-gray-900 text-white px-4 py-1 flex justify-between items-center text-sm">
      <div className="flex items-center space-x-2">
        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Signal Strength */}
        {signalStrength !== undefined && (
          <div className="flex items-center">
            <Signal className="w-4 h-4" />
            <span className="ml-1">{signalStrength}%</span>
          </div>
        )}
        
        {/* Connection Status */}
        {connectionStatus === 'online' ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        
        {/* Battery Level */}
        {batteryLevel !== undefined && (
          <div className="flex items-center">
            <Battery className="w-4 h-4" />
            <span className="ml-1">{batteryLevel}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile Study Block Renderer
export const MobileStudyBlock: React.FC<{
  block: any;
  onResponse: (response: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentIndex: number;
  totalBlocks: number;
}> = ({
  block,
  onResponse,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  currentIndex,
  totalBlocks
}) => {
  const [response, setResponse] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle swipe gestures for navigation
  const gestureHandler = new TouchGestureHandler((gesture) => {
    if (gesture.type === 'swipe') {
      if (gesture.direction === 'left' && canGoNext) {
        onNext();
      } else if (gesture.direction === 'right' && canGoPrevious) {
        onPrevious();
      }
    }
  });
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('touchstart', gestureHandler.handleTouchStart);
    container.addEventListener('touchmove', gestureHandler.handleTouchMove);
    container.addEventListener('touchend', gestureHandler.handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', gestureHandler.handleTouchStart);
      container.removeEventListener('touchmove', gestureHandler.handleTouchMove);
      container.removeEventListener('touchend', gestureHandler.handleTouchEnd);
    };
  }, []);
  
  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };
  
  const getFontSizeClass = () => {
    const sizeMap = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      'extra-large': 'text-xl'
    };
    return sizeMap[fontSize];
  };
  
  const handleResponseChange = (newResponse: any) => {
    setResponse(newResponse);
    onResponse(newResponse);
  };
  
  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="text-sm font-medium">
              {currentIndex + 1} of {totalBlocks}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Font Size Controls */}
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalBlocks) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Block Content */}
      <div className={`p-4 ${getFontSizeClass()}`}>
        {block.type === 'welcome' && (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{block.title}</h1>
            <p className="text-gray-600 leading-relaxed">{block.description}</p>
            {block.image && (
              <img 
                src={block.image} 
                alt={block.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-sm"
              />
            )}
          </div>
        )}
        
        {block.type === 'open_question' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{block.title}</h2>
            <p className="text-gray-600">{block.description}</p>
            <textarea
              value={response || ''}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
        )}
        
        {block.type === 'multiple_choice' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{block.title}</h2>
            <p className="text-gray-600">{block.description}</p>
            <div className="space-y-3">
              {block.options?.map((option: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleResponseChange(option.value)}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    response === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {block.type === 'opinion_scale' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{block.title}</h2>
            <p className="text-gray-600">{block.description}</p>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{block.settings?.leftLabel || 'Strongly Disagree'}</span>
                <span>{block.settings?.rightLabel || 'Strongly Agree'}</span>
              </div>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleResponseChange(value)}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-colors ${
                      response === value
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {block.type === 'image_upload' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{block.title}</h2>
            <p className="text-gray-600">{block.description}</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleResponseChange(file);
                  }
                }}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <div className="text-4xl mb-2">📸</div>
                <span className="text-lg font-medium text-gray-900">Take Photo</span>
                <span className="text-sm text-gray-500">or upload from gallery</span>
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            Swipe to navigate
          </div>
          
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
      
      {/* Bottom Padding for Fixed Footer */}
      <div className="h-20" />
    </div>
  );
};

// Main Mobile Participant Experience
export const MobileParticipantExperience: React.FC<{
  studyId: string;
  participantId: string;
}> = ({ studyId, participantId }) => {
  const [session, setSession] = useState<MobileStudySession | null>(null);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [viewport, setViewport] = useState<MobileViewport>({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    isFullscreen: false,
    devicePixelRatio: window.devicePixelRatio
  });
  
  const gestureHandler = useRef(new TouchGestureHandler((gesture) => {
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        touchGestures: [...prev.touchGestures, gesture]
      } : null);
    }
  }));
  
  // Initialize mobile session
  useEffect(() => {
    const deviceInfo = MobileDetection.getDeviceInfo();
    
    const newSession: MobileStudySession = {
      studyId,
      currentBlockIndex: 0,
      totalBlocks: 5, // Mock data
      startTime: new Date().toISOString(),
      touchGestures: [],
      deviceInfo: {
        userAgent: deviceInfo.userAgent,
        screenSize: deviceInfo.screenSize,
        orientation: deviceInfo.orientation,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown'
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false,
        voiceOver: false
      }
    };
    
    setSession(newSession);
    
    // Mock blocks data
    setBlocks([
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Welcome to Our Study',
        description: 'Thank you for participating. This study will take about 10 minutes.',
        order: 0
      },
      {
        id: 'question1',
        type: 'open_question',
        title: 'Tell us about yourself',
        description: 'What brings you to our platform today?',
        order: 1
      },
      {
        id: 'choice1',
        type: 'multiple_choice',
        title: 'How often do you shop online?',
        description: 'Select the option that best describes your online shopping frequency.',
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Rarely', value: 'rarely' }
        ],
        order: 2
      },
      {
        id: 'rating1',
        type: 'opinion_scale',
        title: 'Rate your experience',
        description: 'How would you rate your overall satisfaction?',
        settings: {
          leftLabel: 'Very Dissatisfied',
          rightLabel: 'Very Satisfied'
        },
        order: 3
      },
      {
        id: 'thankyou',
        type: 'thank_you',
        title: 'Thank You!',
        description: 'Your responses have been recorded. We appreciate your participation.',
        order: 4
      }
    ]);
  }, [studyId]);
  
  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        isFullscreen: document.fullscreenElement !== null,
        devicePixelRatio: window.devicePixelRatio
      });
    };
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, []);
  
  const handleResponse = (response: any) => {
    setResponses(prev => ({
      ...prev,
      [currentBlock]: response
    }));
  };
  
  const handleNext = () => {
    if (currentBlock < blocks.length - 1) {
      setCurrentBlock(prev => prev + 1);
      setSession(prev => prev ? {
        ...prev,
        currentBlockIndex: currentBlock + 1
      } : null);
    }
  };
  
  const handlePrevious = () => {
    if (currentBlock > 0) {
      setCurrentBlock(prev => prev - 1);
      setSession(prev => prev ? {
        ...prev,
        currentBlockIndex: currentBlock - 1
      } : null);
    }
  };
  
  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path);
    // Implement navigation logic
  };
  
  if (!session || blocks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study...</p>
        </div>
      </div>
    );
  }
  
  const currentBlockData = blocks[currentBlock];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileStatusBar 
        connectionStatus="online"
        batteryLevel={85}
        signalStrength={90}
      />
      
      <MobileNavigation
        isOpen={isNavOpen}
        onToggle={() => setIsNavOpen(!isNavOpen)}
        onNavigate={handleNavigate}
        currentPath="/participant/study"
      />
      
      <MobileStudyBlock
        block={currentBlockData}
        onResponse={handleResponse}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={currentBlock < blocks.length - 1}
        canGoPrevious={currentBlock > 0}
        currentIndex={currentBlock}
        totalBlocks={blocks.length}
      />
    </div>
  );
};

export default MobileParticipantExperience;
