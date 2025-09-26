import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  Square, 
  Play, 
  Download,
  Monitor,
  Mic,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Volume2
} from 'lucide-react';


// Advanced Block Types with Screen Recording, Audio, and Video capabilities
export interface AdvancedBlockConfig {
  screenRecording?: {
    enabled: boolean;
    quality: 'low' | 'medium' | 'high';
    includeAudio: boolean;
    maxDuration: number; // minutes
    autoStart: boolean;
  };
  audioRecording?: {
    enabled: boolean;
    quality: 'standard' | 'high';
    maxDuration: number;
    noiseReduction: boolean;
    transcription: boolean;
  };
  videoRecording?: {
    enabled: boolean;
    camera: boolean;
    microphone: boolean;
    quality: 'low' | 'medium' | 'high';
    maxDuration: number;
  };
  conditionalLogic?: {
    conditions: BlockCondition[];
    dynamicContent: boolean;
    aiGenerated: boolean;
  };
  analytics?: {
    trackInteractions: boolean;
    heatmaps: boolean;
    timeTracking: boolean;
    behaviorAnalysis: boolean;
  };
}

export interface BlockCondition {
  type: 'response_based' | 'time_based' | 'performance_based';
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string | number | boolean | string[] | number[];
  action: 'show' | 'hide' | 'redirect' | 'modify';
  targetBlockId?: string;
}

export interface MediaRecording {
  id: string;
  type: 'screen' | 'audio' | 'video';
  blob: Blob;
  duration: number;
  timestamp: number;
  quality: string;
  metadata: {
    resolution?: string;
    sampleRate?: number;
    bitrate?: number;
    codec?: string;
  };
}

// Screen Recording Block Component
export const ScreenRecordingBlock: React.FC<{
  config: AdvancedBlockConfig['screenRecording'];
  onRecordingComplete: (recording: MediaRecording) => void;
  onNext: () => void;
}> = ({ config, onRecordingComplete, onNext }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Stop all tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording, mediaStream]);

  // Start recording
  const startRecording = useCallback((stream?: MediaStream) => {
    const activeStream = stream || mediaStream;
    if (!activeStream) return;

    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(activeStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        const recording: MediaRecording = {
          id: `recording_${Date.now()}`,
          type: 'screen',
          blob,
          duration: recordingTime,
          timestamp: Date.now(),
          quality: config?.quality || 'medium',
          metadata: {
            resolution: `${activeStream.getVideoTracks()[0].getSettings().width}x${activeStream.getVideoTracks()[0].getSettings().height}`,
            codec: 'vp8'
          }
        };

        onRecordingComplete(recording);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop at max duration
          if (config?.maxDuration && newTime >= config.maxDuration * 60) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start screen recording.');
    }
  }, [mediaStream, config, recordingTime, onRecordingComplete, stopRecording]);

  // Request screen recording permission
  const requestPermission = useCallback(async () => {
    try {
      const constraints = {
        video: {
          mediaSource: 'screen',
          width: { ideal: config?.quality === 'high' ? 1920 : config?.quality === 'medium' ? 1280 : 720 },
          height: { ideal: config?.quality === 'high' ? 1080 : config?.quality === 'medium' ? 720 : 480 },
          frameRate: { ideal: config?.quality === 'high' ? 30 : 24 }
        },
        audio: config?.includeAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } : false
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      setMediaStream(stream);
      setHasPermission(true);
      setError(null);

      // Auto-start if configured
      if (config?.autoStart) {
        startRecording(stream);
      }

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (isRecording) {
          stopRecording();
        }
      });

    } catch (err) {
      console.error('Screen recording permission denied:', err);
      setError('Screen recording permission is required to continue.');
      setHasPermission(false);
    }
  }, [config, isRecording, startRecording, stopRecording]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <Monitor className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Screen Recording Task</h2>
          <p className="text-gray-600">
            We'll record your screen activity during this task to understand how you interact with the interface.
          </p>
        </div>

        {/* Permission Status */}
        {hasPermission === null && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <Video className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Screen Recording Permission Required</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Click "Allow Screen Recording" to grant permission for this study task.
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Allow Screen Recording
            </button>
          </div>
        )}

        {/* Permission Denied */}
        {hasPermission === false && (
          <div className="bg-red-50 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900">Permission Required</h3>
                <p className="text-red-700 text-sm mt-1">
                  {error || 'Screen recording permission is needed to continue with this study.'}
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recording Controls */}
        {hasPermission && (
          <div className="space-y-6">
            {/* Recording Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="font-medium text-gray-900">
                    {isRecording ? 'Recording' : recordedBlob ? 'Recording Complete' : 'Ready to Record'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-mono">{formatTime(recordingTime)}</span>
                  </div>
                  
                  {config?.maxDuration && (
                    <span className="text-sm text-gray-500">
                      Max: {config.maxDuration} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recording Settings Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-3 text-center">
                <Monitor className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">Quality</p>
                <p className="text-xs text-gray-600 capitalize">{config?.quality || 'Medium'}</p>
              </div>
              
              <div className="bg-white border rounded-lg p-3 text-center">
                <Volume2 className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">Audio</p>
                <p className="text-xs text-gray-600">{config?.includeAudio ? 'Enabled' : 'Disabled'}</p>
              </div>
              
              <div className="bg-white border rounded-lg p-3 text-center">
                <Clock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">Duration</p>
                <p className="text-xs text-gray-600">{config?.maxDuration || 'No'} limit</p>
              </div>
              
              <div className="bg-white border rounded-lg p-3 text-center">
                <Settings className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">Auto Start</p>
                <p className="text-xs text-gray-600">{config?.autoStart ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                ← Back
              </button>

              <div className="flex space-x-4">
                {!isRecording && !recordedBlob && (
                  <button
                    onClick={() => startRecording()}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </button>
                )}

                {recordedBlob && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setRecordedBlob(null);
                        setRecordingTime(0);
                        chunksRef.current = [];
                      }}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Record Again
                    </button>
                    
                    <button
                      onClick={onNext}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview/Download */}
            {recordedBlob && (
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-green-900">Recording Complete</h3>
                      <p className="text-green-700 text-sm">
                        Duration: {formatTime(recordingTime)} • Size: {(recordedBlob.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const url = URL.createObjectURL(recordedBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `screen-recording-${Date.now()}.webm`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Audio Recording Block Component
export const AudioRecordingBlock: React.FC<{
  config: AdvancedBlockConfig['audioRecording'];
  onRecordingComplete: (recording: MediaRecording) => void;
  onNext: () => void;
}> = ({ config, onRecordingComplete, onNext }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  // Setup media recorder
  const setupRecorder = useCallback((stream: MediaStream) => {
    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        
        const recording: MediaRecording = {
          id: `audio_${Date.now()}`,
          type: 'audio',
          blob,
          duration: recordingTime,
          timestamp: Date.now(),
          quality: config?.quality || 'standard',
          metadata: {
            sampleRate: config?.quality === 'high' ? 48000 : 44100,
            codec: 'opus'
          }
        };

        onRecordingComplete(recording);
      };

      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error('Failed to setup recorder:', err);
      setError('Failed to setup audio recording.');
    }
  }, [config, recordingTime, onRecordingComplete]);

  // Monitor audio levels
  const startLevelMonitoring = useCallback(() => {
    const updateLevel = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255 * 100);
      }
      
      animationRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: config?.noiseReduction !== false,
          sampleRate: config?.quality === 'high' ? 48000 : 44100,
          channelCount: 2
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set up audio analysis for level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      setHasPermission(true);
      setError(null);
      
      // Start level monitoring
      startLevelMonitoring();
      
      // Set up recorder
      setupRecorder(stream);

    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('Microphone access is required for this task.');
      setHasPermission(false);
    }
  }, [config, setupRecorder, startLevelMonitoring]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    try {
      chunksRef.current = [];
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop at max duration
          if (config?.maxDuration && newTime >= config.maxDuration * 60) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start audio recording.');
    }
  }, [config, stopRecording]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <Mic className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Audio Recording Task</h2>
          <p className="text-gray-600">
            Please record your voice response to the questions provided.
          </p>
        </div>

        {/* Permission Status */}
        {hasPermission === null && (
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <Mic className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">Microphone Permission Required</h3>
                <p className="text-green-700 text-sm mt-1">
                  Click "Allow Microphone" to enable audio recording for this task.
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Allow Microphone
            </button>
          </div>
        )}

        {/* Permission Denied */}
        {hasPermission === false && (
          <div className="bg-red-50 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900">Permission Required</h3>
                <p className="text-red-700 text-sm mt-1">
                  {error || 'Microphone access is needed to continue with this study.'}
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recording Interface */}
        {hasPermission && (
          <div className="space-y-6">
            {/* Audio Level Meter */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-900">Audio Level</span>
                <span className="text-sm text-gray-600">
                  {isRecording ? 'Recording...' : 'Monitoring'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${
                    audioLevel > 70 ? 'bg-red-500' : 
                    audioLevel > 40 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(audioLevel, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {Math.round(audioLevel)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recording Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="font-medium text-gray-900">
                    {isRecording ? 'Recording' : recordedBlob ? 'Recording Complete' : 'Ready to Record'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                  </div>
                  
                  {config?.maxDuration && (
                    <span className="text-sm text-gray-500">
                      Max: {config.maxDuration} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                ← Back
              </button>

              <div className="flex space-x-4">
                {!isRecording && !recordedBlob && (
                  <button
                    onClick={startRecording}
                    className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center text-lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center text-lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </button>
                )}

                {recordedBlob && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setRecordedBlob(null);
                        setRecordingTime(0);
                        chunksRef.current = [];
                      }}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Record Again
                    </button>
                    
                    <button
                      onClick={onNext}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recording Complete */}
            {recordedBlob && (
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-green-900">Recording Complete</h3>
                      <p className="text-green-700 text-sm">
                        Duration: {formatTime(recordingTime)} • Size: {(recordedBlob.size / (1024 * 1024)).toFixed(1)} MB
                        {config?.transcription && <span> • Transcription will be generated</span>}
                      </p>
                    </div>
                  </div>
                  
                  <audio 
                    controls 
                    src={recordedBlob ? URL.createObjectURL(recordedBlob) : undefined}
                    className="w-64"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  ScreenRecordingBlock,
  AudioRecordingBlock
};
