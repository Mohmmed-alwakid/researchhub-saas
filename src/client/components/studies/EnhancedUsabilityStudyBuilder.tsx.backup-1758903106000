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
  Blocks
} from 'lucide-react';

interface UsabilityStudyFormData {
  // Step 1: Study Overview
  title: string;
  description: string;
  deviceRequirements: string[];
  
  // Step 2: Session (for Moderated Session only)
  sessionType: 'moderated' | 'unmoderated';
  schedulingDetails?: {
    duration: number;
    timezone: string;
    dates: string[];
    times: string[];
    zoomDetails?: {
      meetingId?: string;
      password?: string;
      joinUrl?: string;
    };
    instructionsForParticipants?: string;
  };
  
  // Step 3: Characteristics & Screen Survey
  targetCountry: string;
  targetCity?: string;
  professionalCharacteristics: string[];
  participantRequirements: string[];
  screeningQuestions: Array<{
    question: string;
    type: 'multiple_choice' | 'yes_no' | 'text';
    options?: string[];
    required: boolean;
  }>;
  
  // Step 4: Study Blocks (will integrate with existing block system)
  blocks: Record<string, unknown>[];
}

interface UsabilityStudyBuilderProps {
  onComplete: (data: UsabilityStudyFormData) => void;
  onCancel: () => void;
  initialData?: Partial<UsabilityStudyFormData>;
}

// Enhanced step configuration with icons and estimated times
const STEP_CONFIG: Record<number, {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  description: string;
  estimatedTime: string;
  color: string;
}> = {
  1: { 
    icon: FileText, 
    title: 'Study Overview', 
    description: 'Name, description, device requirements',
    estimatedTime: '2-3 min',
    color: 'blue'
  },
  2: { 
    icon: Settings, 
    title: 'Session Setup', 
    description: 'Scheduling, Zoom details, and participant instructions',
    estimatedTime: '3-5 min',
    color: 'purple'
  },
  3: { 
    icon: Users, 
    title: 'Characteristics & Screening', 
    description: 'Target audience and screening questions',
    estimatedTime: '4-6 min',
    color: 'green'
  },
  4: { 
    icon: Blocks, 
    title: 'Study Blocks', 
    description: 'Tasks and interactions for participants',
    estimatedTime: '5-10 min',
    color: 'orange'
  }
};

export const EnhancedUsabilityStudyBuilder: React.FC<UsabilityStudyBuilderProps> = ({
  onComplete,
  onCancel,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    trigger,
    formState: { errors, isValid } 
  } = useForm<UsabilityStudyFormData>({
    mode: 'onChange',
    defaultValues: {
      sessionType: 'unmoderated',
      deviceRequirements: [],
      professionalCharacteristics: [],
      participantRequirements: [],
      screeningQuestions: [],
      blocks: [],
      ...initialData
    }
  });

  const sessionType = watch('sessionType');
  const formData = watch();

  // Dynamic steps based on session type
  const getActiveSteps = useCallback(() => {
    const baseSteps = [1, 3, 4]; // Always include overview, characteristics, and blocks
    if (sessionType === 'moderated') {
      return [1, 2, 3, 4]; // Include session setup for moderated
    }
    return baseSteps;
  }, [sessionType]);

  const activeSteps = getActiveSteps();
  const maxSteps = activeSteps.length;
  const currentStepIndex = activeSteps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / maxSteps) * 100;

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (autoSaveStatus === 'idle' && Object.keys(formData).length > 0) {
        setAutoSaveStatus('saving');
        // Simulate auto-save
        setTimeout(() => {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }, 1000);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData, autoSaveStatus]);

  // Step validation
  const validateCurrentStep = async () => {
    const stepValidations: Record<number, (keyof UsabilityStudyFormData)[]> = {
      1: ['title'],
      2: sessionType === 'moderated' ? ['schedulingDetails'] : [],
      3: ['targetCountry'],
      4: []
    };

    const fieldsToValidate = stepValidations[currentStep] || [];
    const isStepValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
    }
    
    return isStepValid;
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
    if (activeSteps.includes(stepNumber)) {
      setCurrentStep(stepNumber);
    }
  };

  const onSubmit = async (data: UsabilityStudyFormData) => {
    setIsLoading(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error('Failed to create study:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save indicator component
  const AutoSaveIndicator = () => (
    <div className="flex items-center space-x-2 text-sm">
      {autoSaveStatus === 'saving' && (
        <>
          <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-blue-600">Saving...</span>
        </>
      )}
      {autoSaveStatus === 'saved' && (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {autoSaveStatus === 'error' && (
        <>
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-600">Save failed</span>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm">
      {/* Enhanced Header with Progress */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Study</h1>
            <p className="text-gray-600">Set up your research study step by step</p>
          </div>
          <AutoSaveIndicator />
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Enhanced Step Navigation */}
        <nav aria-label="Study creation progress" className="overflow-x-auto">
          <ol className="flex items-center space-x-4 min-w-max">
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
                      group flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-200
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
                      flex items-center justify-center w-8 h-8 rounded-full
                      ${isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600 group-hover:bg-gray-400'
                      }
                    `}>
                      {isCompleted && !isCurrent ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="text-left hidden sm:block">
                      <div className="font-medium text-sm">{config.title}</div>
                      <div className="text-xs opacity-75 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{config.estimatedTime}</span>
                      </div>
                    </div>
                  </button>
                  
                  {stepIdx < activeSteps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mx-2 flex-shrink-0" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Step Content with Enhanced Styling */}
        <div className="min-h-[400px]">
          {/* Step 1: Study Overview */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-blue-900 mb-2 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Study Overview
                </h2>
                <p className="text-blue-700 text-sm">
                  Provide basic information about your study that participants will see.
                </p>
              </div>
              
              <div className="space-y-6">
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
                      block w-full border rounded-md shadow-sm px-3 py-2 transition-colors
                      ${errors.title 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                    placeholder="e.g., E-commerce Website Usability Test"
                    aria-describedby={errors.title ? 'title-error' : undefined}
                  />
                  {errors.title && (
                    <p id="title-error" className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                    placeholder="Describe what participants will be doing and what you hope to learn..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Help participants understand what they'll be doing in your study.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Device Requirements
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Desktop', 'Mobile', 'Tablet', 'Any Device'].map((device) => (
                      <label key={device} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          {...register('deviceRequirements')}
                          type="checkbox"
                          value={device}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">{device}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Session Step for Moderated Studies */}
          {currentStep === 2 && sessionType === 'moderated' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-purple-900 mb-2 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Session Setup
                </h2>
                <p className="text-purple-700 text-sm">
                  Configure scheduling and meeting details for your moderated session.
                </p>
              </div>
              
              {/* Session setup form fields would go here */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Session setup form coming soon...</p>
              </div>
            </div>
          )}

          {/* Enhanced Characteristics & Screening Step */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-green-900 mb-2 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Target Audience & Screening
                </h2>
                <p className="text-green-700 text-sm">
                  Define who can participate in your study and set up screening questions.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Country *
                    </label>
                    <select
                      {...register('targetCountry', { required: 'Country is required' })}
                      className={`
                        block w-full border rounded-md shadow-sm px-3 py-2 transition-colors
                        ${errors.targetCountry 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                        }
                      `}
                    >
                      <option value="">Select country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                    </select>
                    {errors.targetCountry && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.targetCountry.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target City (Optional)
                    </label>
                    <input
                      {...register('targetCity')}
                      type="text"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                      placeholder="e.g., San Francisco"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Professional Characteristics
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'Tech Professional', 'Designer', 'Marketing', 'Healthcare',
                      'Education', 'Finance', 'Retail', 'Other'
                    ].map((profession) => (
                      <label key={profession} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          {...register('professionalCharacteristics')}
                          type="checkbox"
                          value={profession}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{profession}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Participant Requirements
                  </label>
                  <textarea
                    {...register('participantRequirements')}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                    placeholder="e.g., Must have experience with online shopping, Must own a smartphone..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Screening Questions
                    </label>
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      + Add Question
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm">
                      Add questions to screen participants before they join your study
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Blocks Step */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-orange-900 mb-2 flex items-center">
                  <Blocks className="w-5 h-5 mr-2" />
                  Study Blocks
                </h2>
                <p className="text-orange-700 text-sm">
                  Configure the tasks and interactions participants will complete.
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Blocks className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Study blocks will be automatically configured based on your selections.</p>
                <p className="text-sm text-gray-500">
                  You'll be able to customize blocks in the next step after creating your study.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {maxSteps}
            </span>
            
            {currentStepIndex < maxSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
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
  );
};
