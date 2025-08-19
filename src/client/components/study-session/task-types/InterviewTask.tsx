import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, Clock, Users, ExternalLink, AlertCircle, CheckCircle, PhoneOff } from 'lucide-react';

// Conditional Zoom SDK import to prevent React version conflicts
let ZoomMtgEmbedded: any = null;
try {
  // Dynamic import to prevent bundling issues in production
  if (typeof window !== 'undefined') {
    import('@zoom/meetingsdk/embedded').then(module => {
      ZoomMtgEmbedded = module.default;
    }).catch(err => {
      console.warn('Zoom SDK not available:', err);
    });
  }
} catch (error) {
  console.warn('Zoom SDK import failed:', error);
}

interface ZoomMeetingConfig {
  meetingNumber: string;
  password: string;
  sdkKey: string;
  signature: string;
  userName: string;
  userEmail: string;
  role: number; // 0 = participant, 1 = host
  leaveUrl: string;
}

interface InterviewTaskProps {
  task: {
    _id: string;
    title: string;
    description: string;
    configuration?: {
      platform?: 'zoom' | 'google-meet' | 'teams';
      duration?: number; // minutes
      recordingEnabled?: boolean;
      transcriptionEnabled?: boolean;
      interviewerInfo?: {
        name: string;
        email: string;
        role: string;
      };
      questions?: string[];
      instructions?: string;
      zoomConfig?: ZoomMeetingConfig;
    };
  };
  study: {
    title: string;
    settings?: {
      recordScreen?: boolean;
    };
  };
  session: {
    _id: string;
  };
  onComplete: (metadata: Record<string, unknown>) => void;
  isRecording: boolean;
}

type InterviewState = 
  | 'pre-interview'    // Setup and preparation
  | 'waiting-host'     // Waiting for interviewer to join
  | 'in-progress'      // Interview is active
  | 'technical-issue'  // Handling connection problems
  | 'post-interview'   // Feedback and completion
  | 'completed';       // Interview task finished

interface InterviewMetadata {
  platform: string;
  duration: number;
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  startTime: Date;
  endTime?: Date;
  meetingJoined: boolean;
  technicalIssues: string[];
  participantFeedback?: string;
}

export const InterviewTask: React.FC<InterviewTaskProps> = ({ 
  task,
  onComplete
}) => {
  const [state, setState] = useState<InterviewState>('pre-interview');
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(0);
  const [interviewMetadata, setInterviewMetadata] = useState<InterviewMetadata>({
    platform: task.configuration?.platform || 'zoom',
    duration: 0,
    recordingEnabled: task.configuration?.recordingEnabled || false,
    transcriptionEnabled: task.configuration?.transcriptionEnabled || false,
    startTime: new Date(),
    meetingJoined: false,
    technicalIssues: []
  });  // Zoom SDK specific state
  const [zoomClient, setZoomClient] = useState<unknown>(null);
  const [meetingConnected, setMeetingConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [feedback, setFeedback] = useState('');
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  const platform = task.configuration?.platform || 'zoom';
  const duration = task.configuration?.duration || 30;
  const interviewer = task.configuration?.interviewerInfo;
  const questions = task.configuration?.questions || [];
  const zoomConfig = task.configuration?.zoomConfig;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);
  // Initialize Zoom SDK on component mount
  useEffect(() => {
    const initializeZoomSDK = async () => {
      if (platform === 'zoom' && zoomConfig) {
        try {
          if (!zoomConfig) {
            throw new Error('Zoom configuration is required');
          }

          // Use embedded client for better integration
          const client = ZoomMtgEmbedded.createClient();
          
          // Initialize the client
          if (meetingContainerRef.current) {
            await client.init({
              zoomAppRoot: meetingContainerRef.current,
              language: 'en-US',
              patchJsMedia: true
            });

            setZoomClient(client);
            
            // Set up event listeners
            client.on('connection-change', (payload: unknown) => {
              console.log('Zoom connection status:', payload);
              const typedPayload = payload as { state: string };
              if (typedPayload.state === 'Connected') {
                setMeetingConnected(true);
                setState('in-progress');
                setInterviewMetadata(prev => ({
                  ...prev,
                  meetingJoined: true
                }));
              } else if (typedPayload.state === 'Disconnected') {
                setMeetingConnected(false);
                setState('technical-issue');
              }
            });

            client.on('recording-change', (payload: unknown) => {
              console.log('Recording status:', payload);
              const typedPayload = payload as { recording: boolean };
              setInterviewMetadata(prev => ({
                ...prev,
                recordingEnabled: typedPayload.recording
              }));
            });
          }

        } catch (error) {
          console.error('Failed to initialize Zoom SDK:', error);
          setInterviewMetadata(prev => ({
            ...prev,
            technicalIssues: [...prev.technicalIssues, `SDK initialization failed: ${error}`]
          }));
          setState('technical-issue');
        }
      }
    };

    initializeZoomSDK();
    
    return () => {
      // Cleanup Zoom SDK on unmount
      if (zoomClient) {
        try {
          (zoomClient as { leave: () => void }).leave();
        } catch (error) {
          console.error('Error leaving Zoom meeting:', error);
        }
      }    };
  }, [platform, zoomConfig, zoomClient]);

  const joinZoomMeeting = async () => {
    if (!zoomClient || !zoomConfig) return;

    try {
      setState('waiting-host');
      
      await (zoomClient as {
        join: (config: {
          sdkKey: string;
          signature: string;
          meetingNumber: string;
          password: string;
          userName: string;
          userEmail: string;
        }) => Promise<void>;
      }).join({
        sdkKey: zoomConfig.sdkKey,
        signature: zoomConfig.signature,
        meetingNumber: zoomConfig.meetingNumber,
        password: zoomConfig.password,
        userName: zoomConfig.userName,
        userEmail: zoomConfig.userEmail
      });

      console.log('Successfully joined Zoom meeting');
      
    } catch (error) {
      console.error('Failed to join Zoom meeting:', error);
      setInterviewMetadata(prev => ({
        ...prev,
        technicalIssues: [...prev.technicalIssues, `Failed to join meeting: ${error}`]
      }));
      setState('technical-issue');
    }
  };

  const leaveZoomMeeting = async () => {
    if (!zoomClient) return;

    try {
      await (zoomClient as { leave: () => Promise<void> }).leave();
      setMeetingConnected(false);
      setState('post-interview');
      
      setInterviewMetadata(prev => ({
        ...prev,
        endTime: new Date(),
        duration: timeSpent
      }));
      
    } catch (error) {
      console.error('Failed to leave Zoom meeting:', error);
    }
  };

  const toggleAudio = async () => {
    if (!zoomClient || !meetingConnected) return;

    try {
      if (audioEnabled) {
        await (zoomClient as { mute: () => Promise<void> }).mute();
      } else {
        await (zoomClient as { unmute: () => Promise<void> }).unmute();
      }
      setAudioEnabled(!audioEnabled);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  const toggleVideo = async () => {
    if (!zoomClient || !meetingConnected) return;

    try {
      if (videoEnabled) {
        await (zoomClient as { stopVideo: () => Promise<void> }).stopVideo();
      } else {
        await (zoomClient as { startVideo: () => Promise<void> }).startVideo();
      }
      setVideoEnabled(!videoEnabled);
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  const completeInterview = (feedback?: string) => {
    const finalMetadata = {
      ...interviewMetadata,
      endTime: new Date(),
      duration: timeSpent,
      participantFeedback: feedback
    };
    
    onComplete(finalMetadata);
    setState('completed');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlatformInfo = () => {
    switch (platform) {
      case 'zoom':
        return {
          name: 'Zoom',
          icon: '🔵',
          color: 'blue',
          description: 'You will join a Zoom meeting for this interview'
        };
      case 'google-meet':
        return {
          name: 'Google Meet',
          icon: '🟢',
          color: 'green',
          description: 'You will join a Google Meet for this interview'
        };
      case 'teams':
        return {
          name: 'Microsoft Teams',
          icon: '🟣',
          color: 'purple',
          description: 'You will join a Microsoft Teams meeting for this interview'
        };
      default:
        return {
          name: 'Video Call',
          icon: '📹',
          color: 'gray',
          description: 'You will join a video call for this interview'
        };
    }
  };

  const platformInfo = getPlatformInfo();

  // Handle starting interview (mock implementation for non-Zoom platforms)
  const startInterview = () => {
    if (platform === 'zoom' && zoomConfig) {
      joinZoomMeeting();
    } else {
      // Mock implementation for other platforms
      setState('waiting-host');
      setInterviewMetadata(prev => ({
        ...prev,
        meetingJoined: true
      }));

      // Simulate waiting for host, then starting interview
      setTimeout(() => {
        setState('in-progress');
      }, 3000);
    }
  };

  const endInterview = () => {
    if (platform === 'zoom' && zoomClient) {
      leaveZoomMeeting();
    } else {
      setState('post-interview');
      setInterviewMetadata(prev => ({
        ...prev,
        endTime: new Date(),
        duration: timeSpent
      }));
    }
  };

  const renderPreInterview = () => (
    <div className="space-y-6">
      {/* Platform Info */}
      <div className={`bg-${platformInfo.color}-50 border border-${platformInfo.color}-200 rounded-lg p-6`}>
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">{platformInfo.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Interview via {platformInfo.name}
            </h3>
            <p className="text-gray-600">{platformInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Interview Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span>Duration: Approximately {duration} minutes</span>
          </div>
          {interviewer && (
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-500" />
              <span>Interviewer: {interviewer.name} ({interviewer.role})</span>
            </div>
          )}
          {task.configuration?.recordingEnabled && (
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-red-500" />
              <span className="text-red-600">This interview will be recorded</span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {task.configuration?.instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
          <div className="text-blue-800 whitespace-pre-line">
            {task.configuration.instructions}
          </div>
        </div>
      )}

      {/* Questions Preview */}
      {questions.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Questions</h3>
          <ul className="space-y-2">
            {questions.slice(0, 3).map((question, index) => (
              <li key={index} className="text-gray-700">
                • {question}
              </li>
            ))}
            {questions.length > 3 && (
              <li className="text-gray-500 italic">
                ... and {questions.length - 3} more questions
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Technical Issues Warning */}
      {interviewMetadata.technicalIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-900">Technical Issues Detected</h3>
          </div>
          <ul className="space-y-1">
            {interviewMetadata.technicalIssues.map((issue, index) => (
              <li key={index} className="text-red-700 text-sm">• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Start Button */}
      <div className="flex justify-center">
        <button
          onClick={startInterview}
          disabled={interviewMetadata.technicalIssues.length > 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Join Interview</span>
        </button>
      </div>
    </div>
  );

  const renderWaitingHost = () => (
    <div className="text-center space-y-6">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Waiting for interviewer to join...
        </h3>
        <p className="text-gray-600">
          Please stay on this page. The interview will begin shortly.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600">Waiting time: {formatTime(timeSpent)}</span>
        </div>
      </div>
    </div>
  );

  const renderInProgress = () => (
    <div className="space-y-6">
      {/* Zoom Meeting Container */}
      {platform === 'zoom' && (
        <div className="bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <div 
            ref={meetingContainerRef}
            id="meetingSDKElement" 
            className="w-full h-full"
          >
            {/* Zoom Meeting SDK will render here */}
          </div>
        </div>
      )}

      {/* Non-Zoom Platform Display */}
      {platform !== 'zoom' && (
        <div className="bg-gray-900 rounded-lg p-8 text-center" style={{ height: '400px' }}>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <span className="text-6xl">{platformInfo.icon}</span>
            <h3 className="text-xl font-semibold text-white">
              Interview in progress via {platformInfo.name}
            </h3>
            <p className="text-gray-300">
              Please continue your interview in the {platformInfo.name} window
            </p>
          </div>
        </div>
      )}

      {/* Meeting Controls */}
      <div className="flex justify-center space-x-4">
        {platform === 'zoom' && meetingConnected && (
          <>
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${audioEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
              title={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${videoEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
              title={videoEnabled ? 'Stop Video' : 'Start Video'}
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-white" />}
            </button>
          </>
        )}
        
        <button
          onClick={endInterview}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
          <span>End Interview</span>
        </button>
      </div>

      {/* Interview Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-900">Interview Active</h4>
            <p className="text-green-700 text-sm">
              Duration: {formatTime(timeSpent)} / ~{duration} minutes
              {interviewMetadata.recordingEnabled && ' • Recording'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  const renderPostInterview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Interview Completed
        </h3>
        <p className="text-gray-600">
          Thank you for participating in the interview. Duration: {formatTime(timeSpent)}
        </p>
      </div>

      {/* Optional Feedback */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Feedback (Optional)
        </h4>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Please share any feedback about the interview experience..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Complete Button */}
      <div className="flex justify-center">
        <button
          onClick={() => completeInterview(feedback)}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Complete Task
        </button>
      </div>
    </div>
  );

  const renderTechnicalIssue = () => (
    <div className="space-y-6">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Technical Issue Detected
        </h3>
        <p className="text-gray-600">
          We're experiencing technical difficulties with the {platformInfo.name} connection.
        </p>
      </div>

      {/* Issue Details */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h4 className="font-semibold text-red-900 mb-3">Issues:</h4>
        <ul className="space-y-1">
          {interviewMetadata.technicalIssues.map((issue, index) => (
            <li key={index} className="text-red-700 text-sm">• {issue}</li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            setInterviewMetadata(prev => ({ ...prev, technicalIssues: [] }));
            setState('pre-interview');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => completeInterview('Technical issues prevented interview completion')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Skip Interview
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
        <p className="text-gray-600">{task.description}</p>
        
        {/* Progress Indicator */}
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <span>Time Elapsed: {formatTime(timeSpent)}</span>
          <span>•</span>
          <span>Platform: {platformInfo.name}</span>
          <span>•</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            state === 'completed' ? 'bg-green-100 text-green-800' :
            state === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            state === 'technical-issue' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {state.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Content based on state */}
      {state === 'pre-interview' && renderPreInterview()}
      {state === 'waiting-host' && renderWaitingHost()}
      {state === 'in-progress' && renderInProgress()}
      {state === 'post-interview' && renderPostInterview()}
      {state === 'technical-issue' && renderTechnicalIssue()}
      {state === 'completed' && (        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">Task Completed</h3>
        </div>
      )}
    </div>
  );
};
