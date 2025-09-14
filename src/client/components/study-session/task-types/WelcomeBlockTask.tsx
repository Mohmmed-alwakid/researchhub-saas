import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

interface WelcomeBlockTaskProps {
  task: {
    _id: string;
    title: string;
    description: string;
    configuration?: {
      message?: string;
      image?: string;
      showContinueButton?: boolean;
      autoAdvance?: boolean;
      autoAdvanceDelay?: number;
      instructions?: string;
    };
  };
  study: { title: string; settings?: Record<string, unknown> };
  session: { _id: string };
  onComplete: (metadata: Record<string, unknown>) => void;
  isRecording: boolean;
}

export const WelcomeBlockTask: React.FC<WelcomeBlockTaskProps> = ({
  task,
  study,
  onComplete,
  isRecording
}) => {
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const configuration = task.configuration || {};
  const message = configuration.message || task.description;
  const showContinueButton = configuration.showContinueButton !== false;
  const autoAdvance = configuration.autoAdvance || false;
  const autoAdvanceDelay = configuration.autoAdvanceDelay || 5;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleContinue = useCallback(() => {
    const completionData = {
      timeSpent,
      startedAt: startTime,
      completedAt: new Date(),
      interactionType: 'welcome_screen',
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    onComplete(completionData);
  }, [timeSpent, startTime, onComplete]);

  // Auto-advance logic
  useEffect(() => {
    if (autoAdvance && hasStarted) {
      const timer = setTimeout(() => {
        handleContinue();
      }, autoAdvanceDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoAdvance, autoAdvanceDelay, hasStarted, handleContinue]);

  // Mark as started when component mounts
  useEffect(() => {
    setHasStarted(true);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600 mt-1">Welcome to the study</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            {isRecording && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Recording</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Welcome Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* Optional Image */}
          {configuration.image && (
            <div className="mb-6">
              <img
                src={configuration.image}
                alt="Welcome"
                className="max-w-full h-auto rounded-lg mx-auto"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}

          {/* Welcome Message */}
          <div className="mb-8">
            <div className="text-lg text-gray-700 mb-4 leading-relaxed">
              {message}
            </div>
            
            {/* Additional Instructions */}
            {configuration.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800">{configuration.instructions}</p>
              </div>
            )}
          </div>

          {/* Study Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Information</h3>            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Study Type:</span>
                <span className="font-medium capitalize">{(study.settings?.type as string) || 'Research Study'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated Duration:</span>
                <span className="font-medium">{(study.settings?.duration as number) || 'N/A'} minutes</span>
              </div>              {Boolean(study.settings?.recordScreen) && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Screen Recording:</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
              )}              {Boolean(study.settings?.compensation) && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Compensation:</span>
                  <span className="font-medium text-green-600">${(study.settings?.compensation as number) || 0}</span>
                </div>
              )}
            </div>
          </div>

          {/* Auto-advance indicator */}
          {autoAdvance && (
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  This screen will automatically advance in {autoAdvanceDelay} seconds
                </p>
              </div>
            </div>
          )}

          {/* Continue Button */}
          {showContinueButton && (
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <span>Continue to Study</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
