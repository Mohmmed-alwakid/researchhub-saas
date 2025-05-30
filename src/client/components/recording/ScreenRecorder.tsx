import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  Mic, 
  Video, 
  Monitor,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface RecordingOptions {
  screen: boolean;
  audio: boolean;
  webcam: boolean;
  quality: 'low' | 'medium' | 'high';
}

interface ScreenRecorderProps {
  sessionId: string;
  onRecordingStart?: (recordingId: string) => void;
  onRecordingStop?: (recordingData: Blob) => void;
  onError?: (error: string) => void;
  options?: Partial<RecordingOptions>;
  autoStart?: boolean;
}

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  sessionId,
  onRecordingStart,
  onRecordingStop,
  onError,
  options = {},
  autoStart = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [recordingOptions, setRecordingOptions] = useState<RecordingOptions>({
    screen: true,
    audio: false,
    webcam: false,
    quality: 'medium',
    ...options
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIdRef = useRef<string | null>(null);

  // Quality settings
  const getRecordingConstraints = useCallback(() => {
    const qualitySettings = {
      low: { width: 1280, height: 720, frameRate: 15 },
      medium: { width: 1920, height: 1080, frameRate: 24 },
      high: { width: 1920, height: 1080, frameRate: 30 }
    };

    const quality = qualitySettings[recordingOptions.quality];

    return {
      video: recordingOptions.screen ? {
        mediaSource: 'screen',
        width: { ideal: quality.width },
        height: { ideal: quality.height },
        frameRate: { ideal: quality.frameRate }
      } : false,
      audio: recordingOptions.audio ? {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } : false
    };
  }, [recordingOptions]);

  // Initialize media streams
  const initializeStreams = useCallback(async (): Promise<MediaStream> => {
    const constraints = getRecordingConstraints();
    const streams: MediaStream[] = [];

    try {
      // Get screen recording
      if (recordingOptions.screen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: constraints.video as MediaTrackConstraints,
          audio: recordingOptions.audio
        });
        streams.push(screenStream);

        // Listen for screen share ending
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          handleStopRecording();
        });
      }

      // Get webcam stream
      if (recordingOptions.webcam) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: !recordingOptions.audio // Don't duplicate audio
        });
        streams.push(webcamStream);
      }

      // Get microphone only if not already captured
      if (recordingOptions.audio && !recordingOptions.screen) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: constraints.audio as MediaTrackConstraints
        });
        streams.push(audioStream);
      }

      // Combine streams
      const combinedStream = new MediaStream();
      streams.forEach(stream => {
        stream.getTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      });

      return combinedStream;
    } catch (error) {
      console.error('Error initializing media streams:', error);
      throw new Error(`Failed to initialize recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [recordingOptions, getRecordingConstraints]);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    try {
      setIsInitializing(true);
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen recording is not supported in this browser');
      }

      const stream = await initializeStreams();
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingStop?.(blob);
        
        // Clean up streams
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        onError?.('Recording failed');
        handleStopRecording();
      };

      // Generate recording ID and notify parent
      const recordingId = `rec_${sessionId}_${Date.now()}`;
      recordingIdRef.current = recordingId;
      onRecordingStart?.(recordingId);

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      const message = error instanceof Error ? error.message : 'Failed to start recording';
      onError?.(message);
      toast.error(message);
    } finally {
      setIsInitializing(false);
    }
  }, [sessionId, initializeStreams, onRecordingStart, onRecordingStop, onError]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.success('Recording stopped');
    }
  }, [isRecording]);

  // Pause/Resume recording
  const handlePauseResume = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording resumed');
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast.success('Recording paused');
    }
  }, [isRecording, isPaused]);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRecording) {
      handleStartRecording();
    }
  }, [autoStart, isRecording, handleStartRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Screen Recording</h3>
        <div className="flex items-center space-x-2">
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-sm font-mono text-gray-700">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recording Options */}
      {!isRecording && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recording Options</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                id="screen"
                type="checkbox"
                checked={recordingOptions.screen}
                onChange={(e) => setRecordingOptions(prev => ({ ...prev, screen: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="screen" className="ml-2 text-sm text-gray-700 flex items-center">
                <Monitor className="w-4 h-4 mr-1" />
                Screen
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="audio"
                type="checkbox"
                checked={recordingOptions.audio}
                onChange={(e) => setRecordingOptions(prev => ({ ...prev, audio: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="audio" className="ml-2 text-sm text-gray-700 flex items-center">
                <Mic className="w-4 h-4 mr-1" />
                Audio
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="webcam"
                type="checkbox"
                checked={recordingOptions.webcam}
                onChange={(e) => setRecordingOptions(prev => ({ ...prev, webcam: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="webcam" className="ml-2 text-sm text-gray-700 flex items-center">
                <Video className="w-4 h-4 mr-1" />
                Webcam
              </label>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="quality" className="text-sm text-gray-700 mr-2">Quality:</label>
              <select
                id="quality"
                value={recordingOptions.quality}
                onChange={(e) => setRecordingOptions(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' }))}
                className="text-sm border-gray-300 rounded"
              >
                <option value="low">Low (720p)</option>
                <option value="medium">Medium (1080p)</option>
                <option value="high">High (1080p 30fps)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={isInitializing || (!recordingOptions.screen && !recordingOptions.webcam)}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isInitializing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {isInitializing ? 'Initializing...' : 'Start Recording'}
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePauseResume}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {isPaused ? (
                <Play className="w-4 h-4 mr-2" />
              ) : (
                <Pause className="w-4 h-4 mr-2" />
              )}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            
            <button
              onClick={handleStopRecording}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {!recordingOptions.screen && !recordingOptions.webcam && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Please select at least one recording option (Screen or Webcam)
            </span>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm text-green-800">
              Recording in progress. Participant actions are being captured.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;
