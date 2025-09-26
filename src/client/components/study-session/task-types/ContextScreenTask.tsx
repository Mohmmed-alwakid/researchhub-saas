import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ArrowRight, Info } from 'lucide-react';


interface ContextScreenTaskProps {
  task: {
    _id: string;
    title: string;
    description: string;
    configuration?: {
      message?: string;
      image?: string;
      instructions?: string;
      showContinueButton?: boolean;
      autoAdvance?: boolean;
      autoAdvanceDelay?: number;
      backgroundColor?: string;
      textColor?: string;
    };
  };
  study: { title: string; settings?: Record<string, unknown> };
  session: { _id: string };
  onComplete: (metadata: Record<string, unknown>) => void;
  isRecording: boolean;
}

export const ContextScreenTask: React.FC<ContextScreenTaskProps> = ({
  task,
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
  const autoAdvanceDelay = configuration.autoAdvanceDelay || 3;
  const backgroundColor = configuration.backgroundColor || '#ffffff';
  const textColor = configuration.textColor || '#1f2937';

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
      interactionType: 'context_screen',
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
            <p className="text-gray-600 mt-1">Context information</p>
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

      {/* Context Screen Content */}
      <div 
        className="border border-gray-200 rounded-lg p-8 min-h-96"
        style={{ 
          backgroundColor, 
          color: textColor 
        }}
      >
        <div className="text-center max-w-3xl mx-auto">
          {/* Optional Image */}
          {configuration.image && (
            <div className="mb-6">
              <img
                src={configuration.image}
                alt="Context"
                className="max-w-full h-auto rounded-lg mx-auto"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          {/* Main Message */}
          <div className="mb-8">
            <div className="text-xl leading-relaxed mb-6">
              {message}
            </div>
            
            {/* Additional Instructions */}
            {configuration.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-800 text-left">
                    {configuration.instructions}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auto-advance indicator */}
          {autoAdvance && (
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  Continuing automatically in {autoAdvanceDelay} seconds...
                </p>
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: hasStarted ? '100%' : '0%',
                      transitionDuration: `${autoAdvanceDelay}s`
                    }}
                  />
                </div>
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
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
