import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

interface ProgressStepProps {
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
  label?: string;
  size: 'sm' | 'md' | 'lg';
  showLabels: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({
  stepNumber,
  isActive,
  isCompleted,
  isLast,
  label,
  size,
  showLabels
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const stepClass = sizeClasses[size];

  return (
    <div className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
      <div className="flex flex-col items-center">
        <div
          className={`${stepClass} rounded-full flex items-center justify-center font-semibold transition-all duration-300 transform hover:scale-110 ${
            isCompleted || isActive
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 border-2 border-blue-300' 
              : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 shadow-md border-2 border-gray-200 hover:from-gray-200 hover:to-slate-200'
          }`}
          role="img"
          aria-label={`Step ${stepNumber}${isCompleted ? ' completed' : isActive ? ' current' : ' pending'}`}
        >
          {isCompleted ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            stepNumber
          )}
        </div>
        {showLabels && label && (
          <span className={`mt-2 text-xs font-semibold text-center transition-colors duration-200 ${
            isActive ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {label}
          </span>
        )}
      </div>
      {!isLast && (
        <div
          className={`flex-1 h-2 mx-4 rounded-full transition-all duration-500 ${
            isCompleted ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md' : 'bg-gradient-to-r from-gray-200 to-slate-200'
          }`}
          role="presentation"
        />
      )}
    </div>
  );
};

/**
 * ProgressBar - Accessible multi-step progress indicator
 * 
 * Features:
 * - WCAG compliant with proper ARIA labels
 * - Responsive design with multiple sizes
 * - Smooth transitions and animations
 * - Optional step labels
 * - Design token integration
 * 
 * @param currentStep - Current active step (1-based)
 * @param totalSteps - Total number of steps
 * @param steps - Optional array of step labels
 * @param size - Visual size variant
 * @param showLabels - Whether to display step labels
 * @param className - Additional CSS classes
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  steps = [],
  size = 'md',
  showLabels = false,
  className = ''
}) => {
  // Generate step numbers if no labels provided
  const stepLabels = steps.length > 0 ? steps : Array.from(
    { length: totalSteps }, 
    (_, i) => `Step ${i + 1}`
  );

  // Calculate progress percentage for screen readers
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div 
      className={`w-full p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 ${className}`}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      aria-valuetext={`Step ${currentStep} of ${totalSteps}: ${stepLabels[currentStep - 1]}`}
      aria-label={`Progress: ${progressPercentage}% complete`}
    >
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = stepNumber === totalSteps;
          const label = showLabels ? stepLabels[index] : undefined;

          return (
            <ProgressStep
              key={stepNumber}
              stepNumber={stepNumber}
              isActive={isActive}
              isCompleted={isCompleted}
              isLast={isLast}
              label={label}
              size={size}
              showLabels={showLabels}
            />
          );
        })}
      </div>
      
      {/* Screen reader only progress text */}
      <div className="sr-only">
        Progress: Step {currentStep} of {totalSteps} - {stepLabels[currentStep - 1]}
      </div>
    </div>
  );
};

export default ProgressBar;
