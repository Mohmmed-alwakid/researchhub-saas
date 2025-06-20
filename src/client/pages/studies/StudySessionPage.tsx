import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Mic, Video, User, Clock, Target } from 'lucide-react';
import { ScreenRecorder } from '../../components/recording/ScreenRecorder';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import toast from 'react-hot-toast';

interface Study {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  settings: {
    maxParticipants: number;
    duration: number;
    compensation: number;
    recordScreen: boolean;
    recordAudio: boolean;
    collectHeatmaps: boolean;
  };
  tasks: any[];
}

interface StudySession {
  id: string;
  studyId: string;
  participantId: string;
  status: 'pending' | 'active' | 'completed' | 'paused';
  startedAt?: string;
  completedAt?: string;
  recordingEnabled: boolean;
}

const StudySessionPage: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<Study | null>(null);
  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    loadStudy();
  }, [studyId]);

  const loadStudy = async () => {
    try {
      setLoading(true);
      
      // Fetch study details
      const response = await fetch(`/api/studies/${studyId}`);
      if (!response.ok) {
        throw new Error('Failed to load study');
      }
      
      const data = await response.json();
      if (data.success) {
        setStudy(data.study);
      } else {
        throw new Error(data.error || 'Failed to load study');
      }
    } catch (error) {
      console.error('Error loading study:', error);
      toast.error('Failed to load study');
      navigate('/studies');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      // Create a new session
      const response = await fetch('/api/recordings?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}` // Basic auth for demo
        },
        body: JSON.stringify({
          studyId,
          participantEmail: 'demo-participant@example.com', // Demo participant
          recordingEnabled: study?.settings.recordScreen || false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      if (data.success) {
        setSession(data.session);
        setSessionStarted(true);
        toast.success('Study session started!');
      } else {
        throw new Error(data.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const completeSession = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/recordings?action=complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Study session completed!');
        navigate('/studies');
      } else {
        throw new Error(data.error || 'Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  const nextTask = () => {
    if (study && currentTaskIndex < study.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      completeSession();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study...</p>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Study Not Found</h2>
            <p className="text-gray-600 mb-4">The requested study could not be found.</p>
            <Button onClick={() => navigate('/studies')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Studies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/studies')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{study.title}</h1>
                <p className="text-sm text-gray-500">User Research Session</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {study.settings.recordScreen && (
                <div className="flex items-center text-sm text-gray-600">
                  <Monitor className="w-4 h-4 mr-1" />
                  Screen Recording
                </div>
              )}
              {study.settings.recordAudio && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mic className="w-4 h-4 mr-1" />
                  Audio Recording
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {study.settings.duration} min
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {!sessionStarted ? (
              /* Study Introduction */
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Welcome to the Study</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Study Description</h3>
                    <p className="text-gray-600">{study.description}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">What to Expect</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>This study will take approximately {study.settings.duration} minutes</li>
                      {study.settings.recordScreen && <li>Your screen will be recorded during the session</li>}
                      {study.settings.recordAudio && <li>Audio will be recorded during the session</li>}
                      <li>You can pause or stop the session at any time</li>
                      <li>All data will be kept confidential and used for research purposes only</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Compensation</h3>
                    <p className="text-gray-600">
                      You will receive <span className="font-semibold text-green-600">${study.settings.compensation}</span> for completing this study.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={startSession} className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      Start Study Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Active Session */
              <div className="space-y-6">
                {/* Current Task */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Task {currentTaskIndex + 1} of {study.tasks.length || 1}
                      </h2>
                      <div className="text-sm text-gray-500">
                        Session: {session?.id.slice(-8)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {study.tasks.length > 0 ? (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          {study.tasks[currentTaskIndex]?.title || `Task ${currentTaskIndex + 1}`}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {study.tasks[currentTaskIndex]?.description || 'Please complete the assigned task.'}
                        </p>
                        <Button onClick={nextTask}>
                          {currentTaskIndex < study.tasks.length - 1 ? 'Next Task' : 'Complete Study'}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">General Study Task</h3>
                        <p className="text-gray-600 mb-4">
                          Please interact with the system as instructed by the researcher.
                        </p>
                        <Button onClick={completeSession}>
                          Complete Study
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Screen Recording Component */}
                {study.settings.recordScreen && session && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Screen Recording</h3>
                    </CardHeader>
                    <CardContent>
                      <ScreenRecorder
                        sessionId={session.id}
                        onRecordingStart={() => toast.success('Recording started')}
                        onRecordingStop={() => toast.success('Recording stopped')}
                        onError={(error) => toast.error(`Recording error: ${error}`)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Study Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <User className="w-4 h-4 mr-2" />
                    Study Type
                  </div>
                  <p className="font-medium capitalize">{study.type}</p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </div>
                  <p className="font-medium">{study.settings.duration} minutes</p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Target className="w-4 h-4 mr-2" />
                    Status
                  </div>
                  <p className="font-medium capitalize">{sessionStarted ? 'Active' : 'Ready to Start'}</p>
                </div>

                {sessionStarted && session && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Monitor className="w-4 h-4 mr-2" />
                      Session ID
                    </div>
                    <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {session.id}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Recording Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Screen Recording:</span>
                      <span className={study.settings.recordScreen ? 'text-green-600' : 'text-gray-400'}>
                        {study.settings.recordScreen ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio Recording:</span>
                      <span className={study.settings.recordAudio ? 'text-green-600' : 'text-gray-400'}>
                        {study.settings.recordAudio ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heatmaps:</span>
                      <span className={study.settings.collectHeatmaps ? 'text-green-600' : 'text-gray-400'}>
                        {study.settings.collectHeatmaps ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySessionPage;
