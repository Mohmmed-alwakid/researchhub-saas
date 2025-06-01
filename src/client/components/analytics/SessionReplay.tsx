import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Download,
  Clock,
  Eye
} from 'lucide-react';

interface SessionEvent {
  id: string;
  timestamp: number;
  type: 'click' | 'scroll' | 'keypress' | 'navigation' | 'focus' | 'hover';
  x?: number;
  y?: number;
  element?: string;
  data?: Record<string, unknown>;
}

interface SessionReplayProps {
  sessionId: string;
  recordingUrl?: string;
  events: SessionEvent[];
  duration: number;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  showEvents?: boolean;
}

export const SessionReplay: React.FC<SessionReplayProps> = ({
  sessionId,
  recordingUrl,
  events,
  duration,
  autoPlay = false,
  showEvents = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentEvents, setCurrentEvents] = useState<SessionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update current events based on playback time
  useEffect(() => {
    const relevantEvents = events.filter(event => 
      event.timestamp <= currentTime * 1000 && 
      event.timestamp >= (currentTime - 2) * 1000 // Show events from last 2 seconds
    );
    setCurrentEvents(relevantEvents);
  }, [currentTime, events]);

  // Video event handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Playback controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipForward = () => {
    seek(currentTime + 10);
  };

  const skipBackward = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeVolume = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const downloadRecording = () => {
    if (recordingUrl) {
      const link = document.createElement('a');
      link.href = recordingUrl;
      link.download = `session-${sessionId}-recording.webm`;
      link.click();
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get event icon
  const getEventIcon = (type: string) => {
    const icons = {
      click: '🖱️',
      scroll: '📜',
      keypress: '⌨️',
      navigation: '🧭',
      focus: '🎯',
      hover: '👆'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  // Get event color
  const getEventColor = (type: string) => {
    const colors = {
      click: 'bg-red-100 text-red-800 border-red-200',
      scroll: 'bg-blue-100 text-blue-800 border-blue-200',
      keypress: 'bg-green-100 text-green-800 border-green-200',
      navigation: 'bg-purple-100 text-purple-800 border-purple-200',
      focus: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      hover: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Session Replay</h3>
            <p className="text-sm text-gray-500 mt-1">
              Session ID: {sessionId} • Duration: {formatTime(duration)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadRecording}
              disabled={!recordingUrl}
              className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Video Player */}
        <div className="lg:col-span-3">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {/* Video element */}
            <video
              ref={videoRef}
              src={recordingUrl}
              className="w-full h-auto"
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={handleTimeUpdate}
              onLoadStart={handleLoadStart}
              onCanPlay={handleCanPlay}
              autoPlay={autoPlay}
              style={{ maxHeight: '500px' }}
            />

            {/* Video overlay with current events */}
            {showEvents && currentEvents.length > 0 && (
              <div className="absolute top-4 left-4 space-y-2 max-w-xs">
                {currentEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`px-3 py-1 rounded-full text-xs border ${getEventColor(event.type)} flex items-center`}
                  >
                    <span className="mr-2">{getEventIcon(event.type)}</span>
                    {event.type} {event.element && `on ${event.element}`}
                  </div>
                ))}
              </div>
            )}

            {/* Player controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {/* Progress bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={skipBackward}
                    className="p-2 text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="p-2 bg-white text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={skipForward}
                    className="p-2 text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Volume control */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-1 text-white hover:bg-gray-800 rounded transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => changeVolume(Number(e.target.value))}
                      className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Playback speed */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => changePlaybackSpeed(Number(e.target.value))}
                    className="bg-gray-800 text-white text-sm border-gray-600 rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Timeline */}
        {showEvents && (
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Event Timeline
              </h4>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => seek(event.timestamp / 1000)}
                    className={`w-full text-left p-2 rounded border transition-colors hover:bg-white ${
                      Math.abs(currentTime * 1000 - event.timestamp) < 1000
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{getEventIcon(event.type)}</span>
                        <span className="text-sm font-medium capitalize">{event.type}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(event.timestamp / 1000)}
                      </span>
                    </div>
                    {event.element && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {event.element}
                      </div>
                    )}
                    {event.x !== undefined && event.y !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        Position: ({event.x}, {event.y})
                      </div>
                    )}
                  </button>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Statistics */}
      <div className="p-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Session Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{events.length}</div>
            <div className="text-sm text-gray-500">Total Events</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {events.filter(e => e.type === 'click').length}
            </div>
            <div className="text-sm text-gray-500">Clicks</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.type === 'scroll').length}
            </div>
            <div className="text-sm text-gray-500">Scrolls</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.type === 'keypress').length}
            </div>
            <div className="text-sm text-gray-500">Keystrokes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionReplay;
