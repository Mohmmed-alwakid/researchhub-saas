/**
 * Mobile-Optimized Study Creation Flow
 * Comprehensive improvements from UI/UX, Product Manager, Product Design, and Fullstack perspectives
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Users,
  Settings,
  FileText,
  Blocks,
  Menu,
  X,
  Info,
  ArrowRight,
  Star,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';

// Enhanced interface with better type safety and comprehensive fields
interface StudyCreationFormData {
  // Step 1: Study Overview
  title: string;
  description: string;
  studyType: 'usability' | 'interview' | 'survey' | 'card_sort' | 'tree_test';
  deviceRequirements: string[];
  estimatedDuration: number;
  
  // Step 2: Session (for Moderated Session only)
  sessionType: 'moderated' | 'unmoderated';
  schedulingDetails?: {
    duration: number;
    timezone: string;
    availableDates: string[];
    availableTimes: string[];
    maxParticipants: number;
    zoomDetails?: {
      autoGenerate: boolean;
      customMeetingId?: string;
      customPassword?: string;
      customJoinUrl?: string;
    };
    participantInstructions?: string;
    reminderSettings: {
      email24h: boolean;
      email1h: boolean;
      sms30min: boolean;
    };
  };
  
  // Step 3: Participants & Screening
  targetAudience: {
    countries: string[];
    cities?: string[];
    ageRange: {
      min: number;
      max: number;
    };
    languages: string[];
    professions: string[];
    experience: string[];
    deviceOwnership: string[];
  };
  recruitmentSettings: {
    maxParticipants: number;
    compensation: {
      type: 'monetary' | 'gift_card' | 'none';
      amount?: number;
      currency?: string;
      description?: string;
    };
    approvalProcess: 'automatic' | 'manual';
    diversityRequirements?: {
      gender: boolean;
      age: boolean;
      ethnicity: boolean;
      experience: boolean;
    };
  };
  screeningQuestions: Array<{
    id: string;
    question: string;
    type: 'multiple_choice' | 'yes_no' | 'text' | 'scale' | 'multi_select';
    options?: string[];
    required: boolean;
    weight: number; // For scoring
    correctAnswer?: string | string[]; // For qualification
  }>;
  
  // Step 4: Study Blocks (Enhanced)
  studyBlocks: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    settings: Record<string, unknown>;
    order: number;
    isRequired: boolean;
    estimatedTime: number;
    dependencies?: string[]; // For conditional logic
  }>;
  
  // Additional metadata
  metadata: {
    industry: string;
    researchGoals: string[];
    successMetrics: string[];
    stakeholders: string[];
    timeline: {
      recruitmentDeadline: string;
      studyStartDate: string;
      studyEndDate: string;
      resultsDeadline: string;
    };
  };
}

interface MobileOptimizedStudyBuilderProps {
  onComplete: (data: StudyCreationFormData) => void;
  onCancel: () => void;
  initialData?: Partial<StudyCreationFormData>;
  isTemplate?: boolean;
  templateName?: string;
}

// Enhanced step configuration with better mobile optimization
const STEP_CONFIG: Record<number, {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  shortTitle: string; // For mobile
  description: string;
  mobileDescription: string; // Shorter for mobile
  estimatedTime: string;
  color: string;
  tips: string[];
  commonMistakes: string[];
}> = {
  1: { 
    icon: FileText, 
    title: 'Study Overview & Goals', 
    shortTitle: 'Overview',
    description: 'Define your study goals, target outcome, and basic requirements',
    mobileDescription: 'Study goals and requirements',
    estimatedTime: '3-5 min',
    color: 'blue',
    tips: [
      'Be specific about what you want to learn',
      'Clear titles help with participant recruitment',
      'Set realistic time estimates'
    ],
    commonMistakes: [
      'Vague study objectives',
      'Unrealistic time estimates',
      'Too many device requirements'
    ]
  },
  2: { 
    icon: Settings, 
    title: 'Session Configuration', 
    shortTitle: 'Session',
    description: 'Set up scheduling, meeting details, and participant communication',
    mobileDescription: 'Scheduling and meeting setup',
    estimatedTime: '4-6 min',
    color: 'purple',
    tips: [
      'Offer multiple time slots for flexibility',
      'Include clear instructions for participants',
      'Set up automatic reminders'
    ],
    commonMistakes: [
      'Too few available time slots',
      'Missing technical requirements',
      'Unclear participant instructions'
    ]
  },
  3: { 
    icon: Users, 
    title: 'Participant Targeting & Screening', 
    shortTitle: 'Participants',
    description: 'Define your ideal participants and create screening questions',
    mobileDescription: 'Target audience and screening',
    estimatedTime: '5-8 min',
    color: 'green',
    tips: [
      'Be specific about your target audience',
      'Use screening questions to ensure quality',
      'Consider diversity and inclusion'
    ],
    commonMistakes: [
      'Too broad target audience',
      'Inadequate screening questions',
      'Unrealistic compensation expectations'
    ]
  },
  4: { 
    icon: Blocks, 
    title: 'Study Tasks & Interactions', 
    shortTitle: 'Tasks',
    description: 'Design the tasks and interactions participants will complete',
    mobileDescription: 'Study tasks and interactions',
    estimatedTime: '6-10 min',
    color: 'orange',
    tips: [
      'Start with simple tasks, then increase complexity',
      'Each task should have a clear objective',
      'Consider the participant\'s cognitive load'
    ],
    commonMistakes: [
      'Too many tasks in one session',
      'Unclear task instructions',
      'Missing success criteria'
    ]
  }
};

// Smart template recommendations based on user inputs
const getTemplateRecommendations = (formData: Partial<StudyCreationFormData>) => {
  const recommendations = [];
  
  if (formData.studyType === 'usability') {
    recommendations.push({
      title: 'E-commerce Usability Test',
      description: 'Perfect for testing shopping workflows',
      confidence: 0.9,
      reason: 'Based on your usability study selection'
    });
  }
  
  if (formData.targetAudience?.professions?.includes('Tech Professional')) {
    recommendations.push({
      title: 'SaaS Product Testing',
      description: 'Optimized for technical audiences',
      confidence: 0.8,
      reason: 'Based on your target audience'
    });
  }
  
  return recommendations;
};

export const MobileOptimizedStudyBuilder: React.FC<MobileOptimizedStudyBuilderProps> = ({
  onComplete,
  onCancel,
  initialData,
  isTemplate = false,
  templateName
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    trigger,
    formState: { errors, isValid },
    setValue,
    getValues
  } = useForm<StudyCreationFormData>({
    mode: 'onChange',
    defaultValues: {
      sessionType: 'unmoderated',
      studyType: 'usability',
      deviceRequirements: [],
      estimatedDuration: 30,
      targetAudience: {
        countries: [],
        ageRange: { min: 18, max: 65 },
        languages: ['English'],
        professions: [],
        experience: [],
        deviceOwnership: []
      },
      recruitmentSettings: {
        maxParticipants: 10,
        compensation: { type: 'none' },
        approvalProcess: 'automatic'
      },
      screeningQuestions: [],
      studyBlocks: [],
      metadata: {
        industry: '',
        researchGoals: [],
        successMetrics: [],
        stakeholders: [],
        timeline: {
          recruitmentDeadline: '',
          studyStartDate: '',
          studyEndDate: '',
          resultsDeadline: ''
        }
      },
      ...initialData
    }
  });

  const sessionType = watch('sessionType');
  const studyType = watch('studyType');
  const formData = watch();

  // Dynamic steps based on session type
  const getActiveSteps = useCallback(() => {
    const baseSteps = [1, 3, 4]; // Always include overview, participants, and tasks
    if (sessionType === 'moderated') {
      return [1, 2, 3, 4]; // Include session setup for moderated
    }
    return baseSteps;
  }, [sessionType]);

  const activeSteps = getActiveSteps();
  const maxSteps = activeSteps.length;
  const currentStepIndex = activeSteps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / maxSteps) * 100;

  // Enhanced auto-save with error handling
  useEffect(() => {
    if (!isDirty) return;
    
    const saveTimer = setTimeout(() => {
      setAutoSaveStatus('saving');
      
      // Simulate auto-save with proper error handling
      const saveData = async () => {
        try {
          // In real implementation, this would call an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          setAutoSaveStatus('saved');
          setIsDirty(false);
          
          // Reset to idle after 2 seconds
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } catch (error) {
          setAutoSaveStatus('error');
          console.error('Auto-save failed:', error);
        }
      };
      
      saveData();
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData, isDirty]);

  // Form change handler
  useEffect(() => {
    setIsDirty(true);
  }, [formData]);

  // Enhanced step validation with better error messages
  const validateCurrentStep = async () => {
    const stepValidations: Record<number, {
      fields: (keyof StudyCreationFormData)[];
      customValidation?: () => Promise<string[]>;
    }> = {
      1: { 
        fields: ['title', 'studyType', 'estimatedDuration'],
        customValidation: async () => {
          const errors: string[] = [];
          const title = getValues('title');
          const duration = getValues('estimatedDuration');
          
          if (!title || title.length < 5) {
            errors.push('Title must be at least 5 characters long');
          }
          
          if (!duration || duration < 5 || duration > 120) {
            errors.push('Duration must be between 5 and 120 minutes');
          }
          
          return errors;
        }
      },
      2: { 
        fields: sessionType === 'moderated' ? ['schedulingDetails'] : [],
        customValidation: async () => {
          const errors: string[] = [];
          
          if (sessionType === 'moderated') {
            const scheduling = getValues('schedulingDetails');
            if (!scheduling?.availableDates?.length) {
              errors.push('Please select at least one available date');
            }
            if (!scheduling?.availableTimes?.length) {
              errors.push('Please select at least one available time');
            }
          }
          
          return errors;
        }
      },
      3: { 
        fields: ['targetAudience', 'recruitmentSettings'],
        customValidation: async () => {
          const errors: string[] = [];
          const audience = getValues('targetAudience');
          const recruitment = getValues('recruitmentSettings');
          
          if (!audience?.countries?.length) {
            errors.push('Please select at least one target country');
          }
          
          if (!recruitment?.maxParticipants || recruitment.maxParticipants < 1) {
            errors.push('Please specify the number of participants');
          }
          
          return errors;
        }
      },
      4: { 
        fields: ['studyBlocks'],
        customValidation: async () => {
          const errors: string[] = [];
          const blocks = getValues('studyBlocks');
          
          if (!blocks?.length) {
            errors.push('Please add at least one study task');
          }
          
          return errors;
        }
      }
    };

    const validation = stepValidations[currentStep];
    if (!validation) return true;

    // Validate form fields
    const fieldsToValidate = validation.fields;
    const isFieldsValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate);
    
    // Run custom validation
    let customErrors: string[] = [];
    if (validation.customValidation) {
      customErrors = await validation.customValidation();
    }
    
    // Update validation errors state
    if (customErrors.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [`step_${currentStep}`]: customErrors.join(', ')
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`step_${currentStep}`];
        return newErrors;
      });
    }
    
    const isValid = isFieldsValid && customErrors.length === 0;
    
    if (isValid) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
    }
    
    return isValid;
  };

  const handleNext = async () => {
    setIsLoading(true);
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      const currentIndex = activeSteps.indexOf(currentStep);
      if (currentIndex < activeSteps.length - 1) {
        setCurrentStep(activeSteps[currentIndex + 1]);
      }
    }
    
    setIsLoading(false);
  };

  const handlePrevious = () => {
    const currentIndex = activeSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(activeSteps[currentIndex - 1]);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (activeSteps.includes(stepNumber) && !isLoading) {
      setCurrentStep(stepNumber);
    }
  };

  const onSubmit = async (data: StudyCreationFormData) => {
    setIsLoading(true);
    try {
      // Enhanced data processing
      const processedData = {
        ...data,
        metadata: {
          ...data.metadata,
          createdAt: new Date().toISOString(),
          createdFrom: 'enhanced_mobile_builder',
          templateUsed: isTemplate ? templateName : undefined,
          deviceInfo: {
            isMobile,
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`
          }
        }
      };
      
      await onComplete(processedData);
    } catch (error) {
      console.error('Failed to create study:', error);
      setAutoSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile-optimized components
  const MobileStepIndicator = () => (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex items-center space-x-2 text-gray-600"
      >
        <Menu className="w-5 h-5" />
        <span className="text-sm font-medium">
          Step {currentStepIndex + 1} of {maxSteps}
        </span>
      </button>
      
      {/* Progress bar for mobile */}
      <div className="flex-1 mx-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <AutoSaveIndicator />
    </div>
  );

  const DesktopStepNavigation = () => (
    <nav aria-label="Study creation progress" className="overflow-x-auto">
      <ol className="flex items-center space-x-2 min-w-max">
        {activeSteps.map((stepNumber, stepIdx) => {
          const config = STEP_CONFIG[stepNumber];
          const Icon = config.icon;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = currentStep === stepNumber;
          
          return (
            <li key={stepNumber} className="flex items-center">
              <button
                onClick={() => handleStepClick(stepNumber)}
                disabled={isLoading}
                className={`
                  group flex items-center space-x-3 px-3 py-2 rounded-lg border-2 transition-all duration-200
                  ${isCurrent
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : isCompleted
                    ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className={`
                  flex items-center justify-center w-6 h-6 rounded-full
                  ${isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600 group-hover:bg-gray-400'
                  }
                `}>
                  {isCompleted && !isCurrent ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                </div>
                
                <div className="text-left">
                  <div className="font-medium text-sm">{config.shortTitle}</div>
                  <div className="text-xs opacity-75 flex items-center space-x-1">
                    <Clock className="w-2 h-2" />
                    <span>{config.estimatedTime}</span>
                  </div>
                </div>
              </button>
              
              {stepIdx < activeSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const AutoSaveIndicator = () => (
    <div className="flex items-center space-x-2 text-xs">
      {autoSaveStatus === 'saving' && (
        <>
          <div className="w-2 h-2 border border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-blue-600">Saving</span>
        </>
      )}
      {autoSaveStatus === 'saved' && (
        <>
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {autoSaveStatus === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span className="text-red-600">Error</span>
        </>
      )}
    </div>
  );

  // Mobile slide-out menu
  const MobileStepMenu = () => (
    <div className={`
      fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out
      ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Study Creation Progress</h3>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {activeSteps.map((stepNumber) => {
            const config = STEP_CONFIG[stepNumber];
            const Icon = config.icon;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = currentStep === stepNumber;
            
            return (
              <button
                key={stepNumber}
                onClick={() => {
                  handleStepClick(stepNumber);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all
                  ${isCurrent
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : isCompleted
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-500'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }
                `}>
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{config.title}</div>
                  <div className="text-xs opacity-75">{config.mobileDescription}</div>
                  <div className="text-xs opacity-75 flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{config.estimatedTime}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile step indicator */}
      {isMobile && <MobileStepIndicator />}
      
      {/* Mobile step menu */}
      {isMobile && <MobileStepMenu />}
      
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isTemplate ? `Create Study from ${templateName}` : 'Create New Study'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {STEP_CONFIG[currentStep]?.description || 'Set up your research study step by step'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Tips</span>
                </button>
                <AutoSaveIndicator />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Desktop Step Navigation */}
            <DesktopStepNavigation />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6">
          {/* Tips Panel */}
          {showTips && !isMobile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-6">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">
                    Tips for {STEP_CONFIG[currentStep]?.title}
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {STEP_CONFIG[currentStep]?.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors[`step_${currentStep}`] && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900 mb-1">Please fix the following issues:</h3>
                  <p className="text-sm text-red-800">{validationErrors[`step_${currentStep}`]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Study Overview Step */}
          {currentStep === 1 && (
            <div className="space-y-6 py-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {STEP_CONFIG[1].title}
                </h2>
                <p className="text-blue-700 text-sm">
                  {isMobile ? STEP_CONFIG[1].mobileDescription : STEP_CONFIG[1].description}
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Study Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Title *
                  </label>
                  <input
                    {...register('title', { 
                      required: 'Title is required',
                      minLength: { value: 5, message: 'Title must be at least 5 characters' }
                    })}
                    type="text"
                    className={`
                      block w-full border rounded-lg shadow-sm px-3 py-3 transition-colors
                      ${errors.title 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                    placeholder="e.g., E-commerce Checkout Flow Usability Test"
                    aria-describedby={errors.title ? 'title-error' : 'title-hint'}
                  />
                  {errors.title ? (
                    <p id="title-error" className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  ) : (
                    <p id="title-hint" className="mt-1 text-sm text-gray-500">
                      Choose a clear, descriptive title that participants will see
                    </p>
                  )}
                </div>

                {/* Study Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Study Type *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { value: 'usability', label: 'Usability Test', icon: '🖥️', description: 'Test how users interact with your product' },
                      { value: 'interview', label: 'User Interview', icon: '🎤', description: 'Conduct qualitative research sessions' },
                      { value: 'survey', label: 'Survey', icon: '📋', description: 'Collect quantitative feedback' },
                      { value: 'card_sort', label: 'Card Sort', icon: '🗂️', description: 'Understand information architecture' },
                      { value: 'tree_test', label: 'Tree Test', icon: '🌳', description: 'Test navigation and findability' }
                    ].map((type) => (
                      <label key={type.value} className="relative">
                        <input
                          {...register('studyType', { required: 'Please select a study type' })}
                          type="radio"
                          value={type.value}
                          className="sr-only peer"
                        />
                        <div className="p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{type.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">{type.label}</div>
                              <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.studyType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.studyType.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={isMobile ? 3 : 4}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-3"
                    placeholder="Describe what participants will be doing and what you hope to learn. This helps participants understand the purpose of your study."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    A clear description helps with participant recruitment and understanding.
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      {...register('estimatedDuration', { 
                        required: 'Duration is required',
                        min: { value: 5, message: 'Minimum duration is 5 minutes' },
                        max: { value: 120, message: 'Maximum duration is 120 minutes' }
                      })}
                      type="number"
                      min="5"
                      max="120"
                      className={`
                        block w-32 border rounded-lg shadow-sm px-3 py-2 transition-colors
                        ${errors.estimatedDuration 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                        }
                      `}
                      placeholder="30"
                    />
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Keep it under 60 minutes for better completion rates</span>
                    </div>
                  </div>
                  {errors.estimatedDuration && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.estimatedDuration.message}
                    </p>
                  )}
                </div>

                {/* Device Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Device Requirements
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'desktop', label: 'Desktop', icon: '🖥️' },
                      { value: 'mobile', label: 'Mobile', icon: '📱' },
                      { value: 'tablet', label: 'Tablet', icon: '📱' },
                      { value: 'any', label: 'Any Device', icon: '💻' }
                    ].map((device) => (
                      <label key={device.value} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          {...register('deviceRequirements')}
                          type="checkbox"
                          value={device.value}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 flex items-center space-x-2">
                          <span>{device.icon}</span>
                          <span>{device.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Configuration Step */}
          {currentStep === 2 && sessionType === 'moderated' && (
            <div className="space-y-6 py-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h2 className="text-lg sm:text-xl font-semibold text-purple-900 mb-2 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  {STEP_CONFIG[2].title}
                </h2>
                <p className="text-purple-700 text-sm">
                  {isMobile ? STEP_CONFIG[2].mobileDescription : STEP_CONFIG[2].description}
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Session Configuration</h3>
                <p className="text-gray-600 mb-4">
                  This section will include comprehensive scheduling and meeting setup options.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Multiple time slot selection</p>
                  <p>• Automatic Zoom meeting generation</p>
                  <p>• Participant reminder system</p>
                  <p>• Custom instructions and requirements</p>
                </div>
              </div>
            </div>
          )}

          {/* Participants & Screening Step */}
          {currentStep === 3 && (
            <div className="space-y-6 py-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg sm:text-xl font-semibold text-green-900 mb-2 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {STEP_CONFIG[3].title}
                </h2>
                <p className="text-green-700 text-sm">
                  {isMobile ? STEP_CONFIG[3].mobileDescription : STEP_CONFIG[3].description}
                </p>
              </div>

              <div className="space-y-8">
                {/* Target Audience */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Target Audience
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Countries */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Countries *
                      </label>
                      <div className="space-y-2">
                        {[
                          'United States', 'United Kingdom', 'Canada', 'Australia', 
                          'Germany', 'France', 'Netherlands', 'Sweden'
                        ].map((country) => (
                          <label key={country} className="flex items-center">
                            <input
                              {...register('targetAudience.countries', { 
                                required: 'Please select at least one country'
                              })}
                              type="checkbox"
                              value={country}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{country}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Age Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Range
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          {...register('targetAudience.ageRange.min')}
                          type="number"
                          min="18"
                          max="100"
                          className="block w-20 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                          placeholder="18"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          {...register('targetAudience.ageRange.max')}
                          type="number"
                          min="18"
                          max="100"
                          className="block w-20 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                          placeholder="65"
                        />
                        <span className="text-sm text-gray-500">years old</span>
                      </div>
                    </div>
                  </div>

                  {/* Professions */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Professional Background
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[
                        'Tech Professional', 'Designer', 'Marketing', 'Healthcare',
                        'Education', 'Finance', 'Retail', 'Legal', 'Real Estate',
                        'Student', 'Retired', 'Other'
                      ].map((profession) => (
                        <label key={profession} className="flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            {...register('targetAudience.professions')}
                            type="checkbox"
                            value={profession}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{profession}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recruitment Settings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Recruitment Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Max Participants */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Participants *
                      </label>
                      <input
                        {...register('recruitmentSettings.maxParticipants', { 
                          required: 'Number of participants is required',
                          min: { value: 1, message: 'At least 1 participant required' },
                          max: { value: 100, message: 'Maximum 100 participants allowed' }
                        })}
                        type="number"
                        min="1"
                        max="100"
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                        placeholder="10"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        For usability tests, 5-10 participants usually provide good insights
                      </p>
                    </div>

                    {/* Compensation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compensation
                      </label>
                      <select
                        {...register('recruitmentSettings.compensation.type')}
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                      >
                        <option value="none">No compensation</option>
                        <option value="monetary">Monetary reward</option>
                        <option value="gift_card">Gift card</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Tasks Step */}
          {currentStep === 4 && (
            <div className="space-y-6 py-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h2 className="text-lg sm:text-xl font-semibold text-orange-900 mb-2 flex items-center">
                  <Blocks className="w-5 h-5 mr-2" />
                  {STEP_CONFIG[4].title}
                </h2>
                <p className="text-orange-700 text-sm">
                  {isMobile ? STEP_CONFIG[4].mobileDescription : STEP_CONFIG[4].description}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 text-center">
                <div className="max-w-md mx-auto">
                  <Zap className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-orange-900 mb-2">
                    Smart Task Builder
                  </h3>
                  <p className="text-orange-700 mb-4">
                    Based on your selections, we'll automatically create optimized study tasks. 
                    You can customize them in the next step.
                  </p>
                  <div className="text-sm text-orange-600 space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Welcome screen with study introduction</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Task-specific interactions based on study type</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Follow-up questions for insights</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Thank you screen with next steps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Navigation Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center py-6 border-t border-gray-200 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!isMobile && (
                <span className="text-sm text-gray-500">
                  Step {currentStepIndex + 1} of {maxSteps}
                </span>
              )}
              
              {currentStepIndex < maxSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Create Study
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
