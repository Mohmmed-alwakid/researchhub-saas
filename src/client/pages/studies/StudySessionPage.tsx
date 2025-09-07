import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Mic, Clock, Target } from 'lucide-react';
import { StudyBlockSession } from '../../components/blocks/StudyBlockSession';
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
  tasks: Record<string, string | number>[];
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
  const { id: studyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<Study | null>(null);
  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        setLoading(true);
        
        // Get token from auth storage
        let token = null;
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            token = state?.token;
          } catch (error) {
            console.warn('Failed to parse auth storage:', error);
          }
        }

        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Create or get the study session using the correct API endpoint
        console.log('🔍 Creating/getting study session for study:', studyId);
        const createSessionResponse = await fetch(`/api/study-sessions/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            study_id: studyId,
            participant_email: 'participant@test.com' // TODO: Get from user context
          })
        });

        if (!createSessionResponse.ok) {
          throw new Error('Failed to create study session');
        }

        const createSessionData = await createSessionResponse.json();
        if (!createSessionData.success) {
          throw new Error(createSessionData.error || 'Failed to create study session');
        }

        const sessionId = createSessionData.data.id;
        console.log('✅ Study session created/found:', sessionId);

        // For now, we'll use the session data directly since our API response includes everything
        // TODO: In a real implementation, you might fetch study details separately
        const mockStudy: Study = {
          _id: studyId || '',
          title: 'Test Study Session',
          description: 'Participate in our user testing session',
          type: 'usability',
          status: 'active',
          settings: {
            maxParticipants: 10,
            duration: 30,
            compensation: 25,
            recordScreen: false,
            recordAudio: false,
            collectHeatmaps: false
          },
          tasks: []
        };

        const mockSession: StudySession = {
          id: sessionId,
          studyId: studyId || '',
          participantId: createSessionData.data.participant_id,
          status: createSessionData.data.status === 'in_progress' ? 'active' : 'pending',
          startedAt: createSessionData.data.started_at,
          recordingEnabled: false
        };
        
        // Set both study and session data
        setStudy(mockStudy);
        setSession(mockSession);
      } catch (error) {
        console.error('Error loading study:', error);
        toast.error('Failed to load study');
        navigate('/studies');
      } finally {
        setLoading(false);
      }
    };

    if (studyId) {
      fetchStudy();
    }
  }, [studyId, navigate]);

  const startSession = () => {
    if (session) {
      setSessionStarted(true);
      toast.success('Study session started!');
    }
  };

  const handleStudyComplete = () => {
    toast.success('Study completed successfully!');
    setTimeout(() => {
      navigate('/app/participant-dashboard');
    }, 1500);
  };

  const handleStudyExit = () => {
    navigate('/studies');
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

  if (!study || !session) {
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

  // If session has started, show the block-by-block experience
  if (sessionStarted) {
    return (
      <StudyBlockSession
        sessionId={session.id}
        studyId={study._id}
        onComplete={handleStudyComplete}
        onExit={handleStudyExit}
      />
    );
  }

  // Show study introduction before starting
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Study Introduction */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Welcome to the Study</h2>
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
                <li>You will be guided through different sections step by step</li>
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">New Block-by-Block Experience</h4>
              <p className="text-blue-800 text-sm">
                This study uses our new guided experience where you'll work through different sections one at a time. 
                Each section is designed to collect specific feedback to help improve the product.
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={startSession} className="w-full text-lg py-3">
                <Target className="w-5 h-5 mr-2" />
                Start Study Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudySessionPage;
