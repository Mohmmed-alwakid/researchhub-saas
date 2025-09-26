import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AIInterviewModerator } from '../../components/ai-interview';
import type { AIInterviewSessionData } from '../../components/ai-interview';

interface Study {
  id: string;
  title: string;
  description: string;
  interview_session_config?: {
    type: 'live_interview';
    duration_minutes: number;
    recording: {
      enabled: boolean;
      audio: boolean;
      video: boolean;
    };
    interview_script: {
      introduction: string;
      questions: Array<{
        id: string;
        text: string;
        type: 'opening' | 'main' | 'follow_up' | 'closing';
      }>;
    };
  };
}

const AIInterviewSessionPage: React.FC = () => {
  const { studyId, sessionId } = useParams<{ studyId: string; sessionId: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Mock participant ID - in real implementation, get from auth
  const participantId = 'participant-demo-123';

  useEffect(() => {
    const loadStudy = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/research-consolidated?action=studies&id=${studyId}`);
        const data = await response.json();

        if (data.success && data.studies?.length > 0) {
          const studyData = data.studies[0];
          
          // Check if this is an AI interview study
          if (studyData.type === 'interview' && studyData.interview_session_config) {
            setStudy(studyData);
          } else {
            setError('This study is not configured for AI interviews');
          }
        } else {
          setError('Study not found or not accessible');
        }
      } catch (err) {
        console.error('Error loading study:', err);
        setError('Failed to load study information');
      } finally {
        setLoading(false);
      }
    };

    if (studyId) {
      loadStudy();
    }
  }, [studyId]);

  const handleSessionComplete = (sessionData: AIInterviewSessionData) => {
    console.log('Interview session completed:', sessionData);
    setSessionComplete(true);
    
    // Navigate to thank you page after a brief delay
    setTimeout(() => {
      navigate(`/participant/study/${studyId}/complete`);
    }, 3000);
  };

  const handleError = (errorMessage: string) => {
    console.error('Interview error:', errorMessage);
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading interview session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/participant/studies')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return to Studies
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Complete!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for participating in this AI-moderated interview. Your responses have been saved.
            </p>
            <p className="text-sm text-gray-500">Redirecting to completion page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!study || !study.interview_session_config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-yellow-500 text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-4">
              This study is not properly configured for AI interviews.
            </p>
            <button
              onClick={() => navigate('/participant/studies')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return to Studies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine language based on study configuration or default to English
  const language: 'arabic' | 'english' = 'english'; // Can be made dynamic based on participant preference
  const languageDisplay = language === 'arabic' ? 'العربية' : 'English';

  const interviewConfig = {
    language,
    voiceEnabled: study.interview_session_config.recording.audio,
    moderatorPersonality: 'professional' as const,
    questions: study.interview_session_config.interview_script.questions
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Study Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">{study.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{study.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>🤖 AI-Moderated Interview</span>
            <span>⏱️ ~{study.interview_session_config.duration_minutes} minutes</span>
            <span>🗣️ {languageDisplay}</span>
            {study.interview_session_config.recording.audio && (
              <span>🎤 Audio Enabled</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Interview Component - Takes remaining space */}
      <div style={{ height: 'calc(100vh - 88px)' }}>
        <AIInterviewModerator
          studyId={studyId!}
          participantId={participantId}
          sessionId={sessionId!}
          interviewConfig={interviewConfig}
          onSessionComplete={handleSessionComplete}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default AIInterviewSessionPage;
