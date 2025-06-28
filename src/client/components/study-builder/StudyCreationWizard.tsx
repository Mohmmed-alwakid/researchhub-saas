import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { StudyTypeStep } from './steps/StudyTypeStep';
import { EnhancedTemplateSelectionStep } from './steps/EnhancedTemplateSelectionStep';
import { StudySetupStep } from './steps/StudySetupStep';
import { BlockConfigurationStep } from './steps/BlockConfigurationStep';
import { ReviewStep } from './steps/ReviewStep';
import { LaunchStep } from './steps/LaunchStep';
import { StudyFormData } from './types';

interface StudyCreationWizardProps {
  onComplete?: (studyData: StudyFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<StudyFormData>;
  onStepChange?: (step: number) => void;
  allowSkipSteps?: boolean;
  enableKeyboardShortcuts?: boolean;
  autoSaveInterval?: number;
}

const STEPS = [
  'type',
  'template', 
  'setup',
  'blocks',
  'review',
  'launch'
] as const;

const STEP_TITLES = {
  type: 'Study Type',
  template: 'Template',
  setup: 'Study Details',
  blocks: 'Build Study',
  review: 'Review',
  launch: 'Launch'
};

export const StudyCreationWizard: React.FC<StudyCreationWizardProps> = ({
  onComplete,
  onCancel,
  initialData,
  onStepChange,
  allowSkipSteps = false,
  enableKeyboardShortcuts = true,
  autoSaveInterval = 1000
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<StudyFormData>({
    title: '',
    description: '',
    type: 'usability_test',
    target_participants: 15,
    blocks: [],
    ...initialData
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [stepValidationStates, setStepValidationStates] = useState<Record<number, boolean>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Enhanced auto-save with debouncing and status tracking
  useEffect(() => {
    const draftKey = 'study-creation-draft';
    let timeoutId: NodeJS.Timeout;

    const saveDraft = async () => {
      setAutoSaveStatus('saving');
      try {
        const draft = {
          currentStep,
          formData,
          completedSteps,
          validationErrors,
          timestamp: Date.now()
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Clear saved status after 2 seconds
        setTimeout(() => setAutoSaveStatus(null), 2000);
      } catch (error) {
        console.error('Failed to save draft:', error);
        setAutoSaveStatus('error');
      }
    };

    // Debounced auto-save
    if (hasUnsavedChanges) {
      timeoutId = setTimeout(saveDraft, autoSaveInterval);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStep, formData, completedSteps, validationErrors, hasUnsavedChanges, autoSaveInterval]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = 'study-creation-draft';
    const saved = localStorage.getItem(draftKey);
    if (saved && !initialData) {
      try {
        const draft = JSON.parse(saved);
        // Only restore if less than 24 hours old
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          setFormData(draft.formData);
          setCurrentStep(draft.currentStep);
          setCompletedSteps(draft.completedSteps);
        }
      } catch (error) {
        console.warn('Failed to restore draft:', error);
      }
    }
  }, [initialData]);

  // Enhanced validation with real-time feedback
  const validateCurrentStep = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    switch (STEPS[currentStep]) {
      case 'type':
        if (!formData.type) {
          errors.type = 'Please select a study type to continue';
        }
        break;
      case 'setup':
        if (!formData.title?.trim()) {
          errors.title = 'Study title is required';
        } else if (formData.title.length < 3) {
          errors.title = 'Study title must be at least 3 characters long';
        } else if (formData.title.length > 100) {
          errors.title = 'Study title must be less than 100 characters';
        }
        
        if (!formData.description?.trim()) {
          errors.description = 'Study description is required';
        } else if (formData.description.length < 10) {
          errors.description = 'Study description must be at least 10 characters long';
        }
        
        if (!formData.target_participants || formData.target_participants < 1) {
          errors.target_participants = 'At least 1 participant is required';
        } else if (formData.target_participants > 1000) {
          errors.target_participants = 'Maximum 1000 participants allowed';
        }
        break;
      case 'blocks':
        if (!formData.blocks || formData.blocks.length === 0) {
          errors.blocks = 'At least one block is required to create a study';
        } else if (formData.blocks.length > 50) {
          errors.blocks = 'Maximum 50 blocks allowed per study';
        }
        break;
      case 'review':
        // Final validation before launch
        if (!formData.title?.trim() || !formData.description?.trim() || !formData.blocks?.length) {
          errors.review = 'Please complete all required fields before launching';
        }
        break;
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    
    // Update step validation state
    setStepValidationStates(prev => ({
      ...prev,
      [currentStep]: isValid
    }));
    
    return isValid;
  }, [currentStep, formData]);

  const updateFormData = useCallback((updates: Partial<StudyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  }, []);

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep() && !allowSkipSteps) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      const nextStep = currentStep + 1;
      if (nextStep < STEPS.length) {
        setCurrentStep(nextStep);
        onStepChange?.(nextStep);
      } else if (onComplete) {
        // Clear draft when completing
        localStorage.removeItem('study-creation-draft');
        await onComplete(formData);
      }
    } catch (error) {
      console.error('Error proceeding to next step:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, completedSteps, formData, onComplete, onStepChange, validateCurrentStep, allowSkipSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  const handleStepClick = useCallback((stepIndex: number) => {
    if (allowSkipSteps || completedSteps.includes(stepIndex) || stepIndex <= Math.max(...completedSteps, -1) + 1) {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    }
  }, [allowSkipSteps, completedSteps, onStepChange]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem('study-creation-draft');
    setFormData({
      title: '',
      description: '',
      type: 'usability_test',
      target_participants: 15,
      blocks: []
    });
    setCurrentStep(0);
    setCompletedSteps([]);
    setValidationErrors({});
    setStepValidationStates({});
    setHasUnsavedChanges(false);
    setAutoSaveStatus(null);
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save draft
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        setHasUnsavedChanges(true); // Trigger auto-save
      }
      
      // Ctrl/Cmd + Enter to proceed to next step
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (validateCurrentStep()) {
          handleNext();
        }
      }
      
      // Escape to go back
      if (event.key === 'Escape' && currentStep > 0) {
        event.preventDefault();
        handlePrevious();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, validateCurrentStep, handleNext, handlePrevious, currentStep]);

  // Progress calculation
  const progressPercentage = useMemo(() => {
    return Math.round(((currentStep + 1) / STEPS.length) * 100);
  }, [currentStep]);

  // Check if step can be navigated to
  const canNavigateToStep = useCallback((stepIndex: number) => {
    if (allowSkipSteps) return true;
    if (stepIndex <= currentStep) return true;
    if (completedSteps.includes(stepIndex - 1)) return true;
    return stepIndex === Math.max(...completedSteps, -1) + 1;
  }, [allowSkipSteps, currentStep, completedSteps]);

  const renderStepContent = () => {
    const isStepValid = stepValidationStates[currentStep] ?? false;
    
    const stepProps = {
      formData,
      onUpdateFormData: updateFormData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isFirst: currentStep === 0,
      isLast: currentStep === STEPS.length - 1,
      validationErrors,
      isLoading,
      onValidationChange: (isValid: boolean) => {
        setStepValidationStates(prev => ({
          ...prev,
          [currentStep]: isValid
        }));
      },
      canProceed: isStepValid || allowSkipSteps
    };

    switch (STEPS[currentStep]) {
      case 'type':
        return <StudyTypeStep {...stepProps} />;
      case 'template':
        return <EnhancedTemplateSelectionStep {...stepProps} />;
      case 'setup':
        return <StudySetupStep {...stepProps} />;
      case 'blocks':
        return <BlockConfigurationStep {...stepProps} />;
      case 'review':
        return <ReviewStep {...stepProps} />;
      case 'launch':
        return <LaunchStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                if (hasUnsavedChanges) {
                  const shouldLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                  if (!shouldLeave) return;
                }
                onCancel?.();
              }}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              ← Back to Studies
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Create New Study</h1>
            
            {/* Progress indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Auto-save status */}
            <div className="flex items-center space-x-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center space-x-1 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Saved</span>
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center space-x-1 text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Save failed</span>
                </div>
              )}
              {!autoSaveStatus && hasUnsavedChanges && (
                <span className="text-amber-600">Unsaved changes</span>
              )}
              {!autoSaveStatus && !hasUnsavedChanges && (
                <span className="text-gray-500">All changes saved</span>
              )}
            </div>
            
            <div className="h-4 w-px bg-gray-300" />
            
            <button
              onClick={clearDraft}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              title="Clear draft and start over"
            >
              Clear Draft
            </button>
            
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;
              const isClickable = canNavigateToStep(index);
              const isValid = stepValidationStates[index];
              const hasError = Object.keys(validationErrors).length > 0 && isCurrent;
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStepClick(index)}
                      disabled={!isClickable}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 relative
                        ${isCompleted 
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                          : isCurrent 
                            ? hasError
                              ? 'bg-red-600 text-white'
                              : isValid
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white'
                            : isClickable
                              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                        ${isClickable ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
                      `}
                      aria-label={`${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'} step: ${STEP_TITLES[step]}`}
                      title={`${STEP_TITLES[step]} ${isCompleted ? '(Completed)' : isCurrent ? '(Current)' : ''}`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : hasError ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                      
                      {/* Validation indicator */}
                      {isCurrent && isValid && !hasError && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                    
                    <div className="flex flex-col">
                      <span className={`
                        text-sm font-medium transition-colors
                        ${isCurrent 
                          ? hasError 
                            ? 'text-red-600' 
                            : 'text-blue-600' 
                          : isCompleted 
                            ? 'text-green-600' 
                            : isClickable 
                              ? 'text-gray-700' 
                              : 'text-gray-400'
                        }
                      `}>
                        {STEP_TITLES[step]}
                      </span>
                      {isCurrent && hasError && (
                        <span className="text-xs text-red-500 mt-0.5">
                          Please fix errors
                        </span>
                      )}
                      {isCurrent && isValid && (
                        <span className="text-xs text-green-500 mt-0.5">
                          Ready to proceed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className={`
                      w-12 h-0.5 mx-4 transition-colors duration-300
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Keyboard shortcuts hint */}
          {enableKeyboardShortcuts && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              <span className="hidden md:inline">
                Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> to proceed, 
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs mx-1">Esc</kbd> to go back, 
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd> to save
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-8">
        <div className="transition-all duration-300 ease-in-out">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};