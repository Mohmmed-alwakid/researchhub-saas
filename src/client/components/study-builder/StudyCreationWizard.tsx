import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import
          console.log(`Study initialized from template: ${templateData.name}`);
import { StudyBuilderHeader } from './shared/StudyBuilderHeader';
import { StudyFormData } from './types';

import { StudySetupStep } from './steps/StudySetupStep';

import { StudyTypeStep } from './steps/StudyTypeStep';

// PHASE 4D: LAZY LOAD HEAVY STUDY BUILDER COMPONENTS - September 14, 2025
// Convert heavy step components to lazy loading for better performance
const LazyBlockConfigurationStep = lazy(() => import('./steps/BlockConfigurationStep').then(module => ({ default: module.BlockConfigurationStep })));
const LazyReviewStep = lazy(() => import('./steps/ReviewStep').then(module => ({ default: module.ReviewStep })));
const LazyInterviewSessionConfigStep = lazy(() => import('./steps/InterviewSessionConfig').then(module => ({ default: module.InterviewSessionConfigStep })));
const LazyUsabilityStudyConfigStep = lazy(() => import('./steps/UsabilityStudyConfig').then(module => ({ default: module.UsabilityStudyConfigStep })));

interface StudyCreationWizardProps {
  onComplete?: (studyData: StudyFormData) => void;
  initialData?: Partial<StudyFormData>;
  onStepChange?: (step: number) => void;
  allowSkipSteps?: boolean;
  enableKeyboardShortcuts?: boolean;
  isEditMode?: boolean;
  studyId?: string;
}

// Steps specific to usability studies
const USABILITY_STEPS = ['type', 'setup', 'usability_config', 'blocks', 'review'] as const;

// Steps specific to interview studies  
const INTERVIEW_STEPS = ['type', 'setup', 'session_config', 'review'] as const;

export const StudyCreationWizard: React.FC<StudyCreationWizardProps> = ({
  onComplete,
  initialData,
  onStepChange,
  allowSkipSteps = false,
  enableKeyboardShortcuts = true,
  isEditMode = false,
  studyId // For future use in API calls during editing
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<StudyFormData>({
    title: '',
    description: '',
    type: 'usability',
    target_participants: 15,
    blocks: [],
    ...initialData
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [stepValidationStates, setStepValidationStates] = useState<Record<number, boolean>>({});

  // Get current steps based on study type - memoized to prevent infinite re-renders
  const STEPS = useMemo(() => {
    switch (formData.type) {
      case 'usability':
        return USABILITY_STEPS;
      case 'interview':
        return INTERVIEW_STEPS;
      default:
        return USABILITY_STEPS; // Default to usability flow
    }
  }, [formData.type]);

  // Load draft on mount and check for template selection
  useEffect(() => {
    // If editing existing study, load the data and go to review step
    if (isEditMode && initialData) {
      console.log(`✅ Edit mode: Loading study data${studyId ? ` for study ID: ${studyId}` : ''}`);
      console.log('📋 Initial data received:', initialData);
      
      // Merge initial data with existing form data, prioritizing initial data
      setFormData(prev => {
        const merged = { ...prev, ...initialData };
        console.log('🔄 Form data after merge:', merged);
        return merged;
      });
      
      // For edit mode, go to the review step (second to last) so user can make final changes
      const reviewStepIndex = STEPS.length - 2; // Review step is typically second to last
      setCurrentStep(reviewStepIndex);
      
      // Mark all previous steps as completed
      const completedStepsArray = Array.from({ length: reviewStepIndex }, (_, i) => i);
      setCompletedSteps(completedStepsArray);
      
      console.log(`🎯 Edit mode: Set to review step ${reviewStepIndex}, completed steps:`, completedStepsArray);
      return; // Skip template and draft loading for edit mode
    }

    const draftKey = 'study-creation-draft';
    const saved = localStorage.getItem(draftKey);
    
    // Check if launched from a template
    const selectedTemplate = sessionStorage.getItem('selectedTemplate');
    if (selectedTemplate && !initialData) {
      try {
        const templateData = JSON.parse(selectedTemplate);
        console.log('Loading template data:', templateData);
        
        // Pre-populate form with template data
        setFormData(prev => ({
          ...prev,
          title: `${templateData.name} - Copy`,
          description: templateData.description,
          blocks: templateData.blocks || []
        }));
        
        // Skip to setup step since template is already selected
        setCurrentStep(2); // setup step
        setCompletedSteps([0, 1]); // type and template steps completed
        
        // Clear the template from session storage
        sessionStorage.removeItem('selectedTemplate');
        
        // Show success message
        setTimeout(() => {
          // Note: toast should be available from context/        }, 500);
        
        return; // Skip draft loading if template was used
      } catch (error) {
        console.warn('Failed to load template data:', error);
      }
    }
    
    // Load draft if no template and no initial data
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
  }, [initialData, isEditMode, STEPS.length, studyId]);

  // Enhanced validation with real-time feedback - only call when you need to update state
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
        
      case 'usability_config':
        // Usability studies validation
        break;
        
      case 'session_config':
        // Interview session validation
        if (!formData.interview_session_config) {
          errors.session_config = 'Session configuration is required for interview studies';
        } else {
          const sessionConfig = formData.interview_session_config;
          if (!sessionConfig.duration_minutes || sessionConfig.duration_minutes < 15) {
            errors.session_config = 'Session duration must be at least 15 minutes';
          }
          if (!sessionConfig.interview_script?.questions?.length) {
            errors.session_config = 'At least one interview question is required';
          }
        }
        break;
        
      case 'blocks':
        // Only validate blocks for usability studies
        if (formData.type === 'usability') {
          console.log('🔍 Validating blocks step');
          console.log('📊 Total blocks:', (formData.blocks || []).length);
          console.log('📋 All blocks:', formData.blocks);
          
          // Check for blocks that are not welcome or thank you screens
          const contentBlocks = (formData.blocks || []).filter(
            block => block.type !== 'welcome_screen' && block.type !== 'thank_you_screen'
          );
          
          console.log('📝 Content blocks:', contentBlocks.length);
          console.log('📝 Content blocks list:', contentBlocks);
          
          if (contentBlocks.length === 0) {
            console.log('❌ Validation failed: No content blocks');
            errors.blocks = 'At least one content block is required to create a usability study';
          } else if ((formData.blocks || []).length > 50) {
            console.log('❌ Validation failed: Too many blocks');
            errors.blocks = 'Maximum 50 blocks allowed per study';
          } else {
            console.log('✅ Blocks validation passed');
          }
        }
        break;
        
      case 'review':
        // Final validation before launch
        if (!formData.title?.trim() || !formData.description?.trim()) {
          errors.review = 'Please complete all required fields before launching';
        }
        
        if (formData.type === 'usability' && !formData.blocks?.length) {
          errors.review = 'At least one block is required for usability studies';
        }
        
        if (formData.type === 'interview' && !formData.interview_session_config?.interview_script?.questions?.length) {
          errors.review = 'At least one interview question is required for interview studies';
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
  }, [currentStep, formData, STEPS]);

  // Trigger validation when form data changes
  useEffect(() => {
    validateCurrentStep();
  }, [validateCurrentStep]);

  const updateFormData = useCallback((updates: Partial<StudyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  }, []);

  const handleNext = useCallback(async () => {
    // Validate current step before proceeding
    const isValid = validateCurrentStep();
    if (!isValid && !allowSkipSteps) {
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
  }, [currentStep, completedSteps, formData, onComplete, onStepChange, allowSkipSteps, STEPS, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  // Add step navigation handler for clickable steps
  const handleStepClick = useCallback((stepIndex: number) => {
    // Only allow navigation to completed steps or current step
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    }
  }, [currentStep, completedSteps, onStepChange]);

  // Add publish handler
  const handlePublish = useCallback(async () => {
    const isValid = validateCurrentStep();
    if (!isValid) return;
    
    setIsLoading(true);
    try {
      await onComplete?.(formData);
    } catch (error) {
      console.error('Failed to publish study:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onComplete, validateCurrentStep]);

  // Add validation check for next button  
  const canProceedToNext = useMemo(() => {
    const isValid = stepValidationStates[currentStep] ?? false;
    return isValid || allowSkipSteps;
  }, [allowSkipSteps, stepValidationStates, currentStep]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to proceed to next step
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        const isValid = stepValidationStates[currentStep] ?? false;
        if (isValid) {
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
  }, [enableKeyboardShortcuts, handleNext, handlePrevious, currentStep, stepValidationStates]);

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
      case 'setup':
        return <StudySetupStep {...stepProps} />;
      case 'usability_config':
        return (
          <Suspense fallback={<div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading study configuration...</span>
          </div>}>
            <LazyUsabilityStudyConfigStep {...stepProps} />
          </Suspense>
        );
      case 'session_config':
        return (
          <Suspense fallback={<div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading session configuration...</span>
          </div>}>
            <LazyInterviewSessionConfigStep {...stepProps} />
          </Suspense>
        );
      case 'blocks':
        return (
          <Suspense fallback={<div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading block configuration...</span>
          </div>}>
            <LazyBlockConfigurationStep {...stepProps} />
          </Suspense>
        );
      case 'review':
        return (
          <Suspense fallback={<div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading review...</span>
          </div>}>
            <LazyReviewStep {...stepProps} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  // Reset step progression when study type changes
  useEffect(() => {
    // If we're past the type selection step and the type changes, 
    // we need to reset the step progression to avoid issues
    if (currentStep > 0) {
      const currentStepName = STEPS[currentStep];
      
      // Check if current step exists in new flow
      const newStepIndex = STEPS.findIndex(step => step === currentStepName);
      
      if (newStepIndex === -1) {
        // Current step doesn't exist in new flow, go to setup step
        setCurrentStep(1); // setup step
        setCompletedSteps([0]); // only type step completed
      }
    }
  }, [formData.type, currentStep, STEPS]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudyBuilderHeader 
        studyTitle={formData.title || (isEditMode ? 'Edit Study' : 'Create New Study')}
        currentStep={currentStep + 1}
        totalSteps={STEPS.length}
        studyType={formData.type}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        onPrevious={currentStep > 0 ? handlePrevious : undefined}
        onNext={currentStep < STEPS.length - 1 ? handleNext : 
               currentStep === STEPS.length - 1 ? handlePublish : undefined}
        canGoNext={canProceedToNext}
        canGoPrevious={currentStep > 0}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <div className="flex-1 px-6 py-8">
        <div className="transition-all duration-300 ease-in-out">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};