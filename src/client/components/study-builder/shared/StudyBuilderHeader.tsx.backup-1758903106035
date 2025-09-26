import React from 'react';

interface StudyBuilderHeaderProps {
  studyTitle?: string;
  currentStep: number;
  totalSteps?: number;
  studyType?: 'usability' | 'interview';
  onPreview?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onStepClick?: (stepIndex: number) => void;
  showPreview?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLoading?: boolean;
  completedSteps?: number[];
}

const USABILITY_STEPS = [
  { id: 1, title: 'Study Type', shortTitle: 'Type' },
  { id: 2, title: 'Study Details', shortTitle: 'Details' },
  { id: 3, title: 'Usability Config', shortTitle: 'Config' },
  { id: 4, title: 'Build Study', shortTitle: 'Build' },
  { id: 5, title: 'Review', shortTitle: 'Review' },
  { id: 6, title: 'Launch', shortTitle: 'Launch' }
];

const INTERVIEW_STEPS = [
  { id: 1, title: 'Study Type', shortTitle: 'Type' },
  { id: 2, title: 'Study Details', shortTitle: 'Details' },
  { id: 3, title: 'Session Config', shortTitle: 'Session' },
  { id: 4, title: 'Review', shortTitle: 'Review' },
  { id: 5, title: 'Launch', shortTitle: 'Launch' }
];

export const StudyBuilderHeader: React.FC<StudyBuilderHeaderProps> = ({
  studyTitle,
  currentStep,
  totalSteps,
  studyType = 'usability',
  onPreview,
  onPrevious,
  onNext,
  onStepClick,
  showPreview = true,
  canGoNext = true,
  canGoPrevious = true,
  isLoading = false,
  completedSteps = []
}) => {
  // Get the appropriate steps based on study type
  const CURRENT_STEPS = studyType === 'interview' ? INTERVIEW_STEPS : USABILITY_STEPS;
  const effectiveTotalSteps = totalSteps || CURRENT_STEPS.length;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-full mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left - Study Name */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 truncate max-w-xs lg:max-w-md">
              {studyTitle || 'Untitled Study'}
            </h1>
          </div>

          {/* Center - Clickable Navigation Steps with Arrows */}
          <div className="hidden md:flex items-center space-x-2">
            {CURRENT_STEPS.slice(0, effectiveTotalSteps).map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id - 1);
              const isClickable = isCompleted || step.id <= currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => onStepClick && isClickable ? onStepClick(step.id - 1) : undefined}
                    disabled={!isClickable}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : isCompleted
                        ? 'text-green-600 hover:bg-green-50 cursor-pointer'
                        : isClickable
                        ? 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title={isClickable ? `Go to ${step.title}` : step.title}
                  >
                    {step.shortTitle}
                  </button>
                  
                  {/* Arrow between steps */}
                  {index < CURRENT_STEPS.slice(0, effectiveTotalSteps).length - 1 && (
                    <svg 
                      className="w-4 h-4 text-gray-300" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-3">
            {showPreview && onPreview && (
              <button
                onClick={onPreview}
                className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span>Preview</span>
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              {onPrevious && (
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={!canGoPrevious || isLoading}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
              )}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{currentStep === effectiveTotalSteps ? 'Launch' : 'Continue'}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
