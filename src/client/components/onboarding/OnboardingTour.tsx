import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  tourId,
  steps,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    // Check if user has completed this tour
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
    if (!completedTours.includes(tourId)) {
      setIsVisible(true);
    }
  }, [tourId]);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isVisible, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
    completedTours.push(tourId);
    localStorage.setItem('completedTours', JSON.stringify(completedTours));
    setIsVisible(false);
    onComplete?.();
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible || !targetPosition) return null;

  const currentStepData = steps[currentStep];
  const tooltipPosition = getTooltipPosition(currentStepData.position, targetPosition);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Highlight box */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          border: '3px solid #3b82f6',
          borderRadius: '8px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl max-w-md"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {currentStepData.title}
              </h3>
              <div className="flex items-center gap-1 mb-3">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-blue-600'
                        : index < currentStep
                        ? 'w-1.5 bg-blue-400'
                        : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={skipTour}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentStepData.content}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Finish
                    <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function getTooltipPosition(
  position: 'top' | 'bottom' | 'left' | 'right',
  targetPos: { top: number; left: number; width: number; height: number }
) {
  const offset = 20;
  
  switch (position) {
    case 'top':
      return {
        top: targetPos.top - 200 - offset,
        left: targetPos.left + targetPos.width / 2 - 200,
      };
    case 'bottom':
      return {
        top: targetPos.top + targetPos.height + offset,
        left: targetPos.left + targetPos.width / 2 - 200,
      };
    case 'left':
      return {
        top: targetPos.top + targetPos.height / 2 - 100,
        left: targetPos.left - 400 - offset,
      };
    case 'right':
      return {
        top: targetPos.top + targetPos.height / 2 - 100,
        left: targetPos.left + targetPos.width + offset,
      };
    default:
      return { top: targetPos.top, left: targetPos.left };
  }
}
