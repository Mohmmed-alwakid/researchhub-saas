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
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const stepClass = sizeClasses[size];

  return (
    <div className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
      <div className="flex flex-col items-center">
        <div
          className={`${stepClass} rounded-full flex items-center justify-center font-medium transition-all duration-200 ${
            isCompleted || isActive
              ? 'bg-primary-600 text-white shadow-soft'
              : 'bg-neutral-200 text-neutral-600'
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
          <span className={`mt-2 text-xs font-medium text-center ${
            isActive ? 'text-primary-600' : 'text-neutral-600'
          }`}>
            {label}
          </span>
        )}
      </div>
      {!isLast && (
        <div
          className={`flex-1 h-1 mx-4 transition-all duration-300 ${
            isCompleted ? 'bg-primary-600' : 'bg-neutral-200'
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
      className={`w-full ${className}`}
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
