import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepProps } from '../types';

export const LaunchStep: React.FC<StepProps> = ({
  formData,
  onPrevious
}) => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [studyId, setStudyId] = useState<string | null>(null);

  const handleLaunchStudy = async () => {
    setIsLaunching(true);
    
    try {
      // Get token from Zustand auth store
      const authStorage = localStorage.getItem('auth-storage');
      let token = null;
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          token = authData.state?.token;
        } catch (e) {
          console.warn('Failed to parse auth storage:', e);
        }
      }

      // Fallback to direct token storage
      if (!token) {
        token = localStorage.getItem('token');
      }

      console.log('Using token for launch:', token ? 'Token present' : 'No token found');

      // Transform StudyCreationWizard data to API format
      const apiData = {
        title: formData.title,
        description: formData.description,
        type: formData.type || 'usability_test',
        tasks: formData.blocks?.map((block, index) => ({
          id: block.id,
          order: index + 1,
          type: block.type,
          title: block.title,
          description: block.description,
          settings: block.settings
        })) || [],
        settings: {
          maxParticipants: formData.target_participants || 15,
          duration: formData.duration || 30,
          compensation: 25, // Default compensation
          recording: {
            screen: true, // Default to screen recording
            audio: formData.include_audio === true,
            webcam: false
          }
        }
      };

      console.log('Launching study with data:', apiData);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/studies', {
        method: 'POST',
        headers,
        body: JSON.stringify(apiData)
      });

      const result = await response.json();
      console.log('Launch response:', result);

      if (response.ok && result.success) {
        setStudyId(result.study?._id || result.study?.id || 'new-study-id');
        setIsLaunched(true);
      } else {
        throw new Error(result.error || result.message || 'Failed to launch study');
      }
    } catch (error) {
      console.error('Error launching study:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to launch study: ${errorMessage}. Please try again.`);
    } finally {
      setIsLaunching(false);
    }
  };

  if (isLaunched) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* Success Animation */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Study Launched Successfully!
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Your study "{formData.title}" is now live and ready for participants.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Study ID:</span>
                <span className="ml-2 text-gray-900 font-mono">{studyId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-green-600 font-medium">Active</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Blocks:</span>
                <span className="ml-2 text-gray-900">{formData.blocks?.length || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Target:</span>
                <span className="ml-2 text-gray-900">{formData.target_participants} participants</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/app/studies')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View All Studies
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.origin + `/participate/${studyId}`)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Copy Participant Link
              </button>
            </div>

            <div className="text-sm text-gray-500">
              <p>Share the participant link to start collecting responses.</p>
              <p>You can monitor progress and results from your studies dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Launch your study
        </h2>
        <p className="text-lg text-gray-600">
          Your study is ready to go live and start collecting responses
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-8.293l2-2a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L9 10.414l-1.293 1.293a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Launch
          </h3>
          <p className="text-gray-600">
            Once launched, participants can start taking your study immediately
          </p>
        </div>

        {/* Pre-launch Checklist */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Pre-launch Checklist</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-900">Study details configured</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-900">Study blocks added ({formData.blocks?.length || 0} blocks)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-900">Target participants set ({formData.target_participants} participants)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-900">Study reviewed and ready</span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-blue-900 mb-4">What happens after launch?</h4>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Your study will be immediately available to participants</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>You'll receive a unique link to share with participants</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Results will be collected in real-time and available in your dashboard</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>You can monitor progress and pause the study at any time</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isLaunching}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Step 6 of 6
          </div>
          <button
            type="button"
            onClick={handleLaunchStudy}
            disabled={isLaunching}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
              ${isLaunching
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isLaunching && (
              <svg className="animate-spin w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 6a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>{isLaunching ? 'Launching...' : '🚀 Launch Study'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
