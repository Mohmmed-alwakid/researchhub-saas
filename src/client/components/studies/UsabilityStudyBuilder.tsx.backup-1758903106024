import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

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

export const UsabilityStudyBuilder: React.FC<UsabilityStudyBuilderProps> = ({
  onComplete,
  onCancel,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<UsabilityStudyFormData>({
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

  // Dynamic steps based on session type
  const allSteps = [
    { number: 1, title: 'Study Overview', description: 'Name, description, device requirements' },
    { number: 2, title: 'Session Setup', description: 'Scheduling, Zoom details, and participant instructions' },
    { number: 3, title: 'Characteristics & Screening', description: 'Target audience and screening questions' },
    { number: 4, title: 'Study Blocks', description: 'Tasks and interactions for participants' }
  ];

  // Only include session step if it's a moderated session
  const steps = sessionType === 'moderated' 
    ? allSteps 
    : allSteps.filter(step => step.number !== 2).map((step, index) => ({
        ...step,
        number: index + 1
      }));

  const maxSteps = steps.length;

  const handleNext = () => {
    // Skip step 2 for unmoderated sessions
    let nextStep = currentStep + 1;
    if (sessionType === 'unmoderated' && currentStep === 1) {
      nextStep = 3; // Skip directly to step 3 (Characteristics)
    }
    
    if (currentStep < maxSteps) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    // Handle previous step for unmoderated sessions
    let prevStep = currentStep - 1;
    if (sessionType === 'unmoderated' && currentStep === 3) {
      prevStep = 1; // Skip back to step 1 (Overview)
    }
    
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const onSubmit = (data: UsabilityStudyFormData) => {
    onComplete(data);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
      {/* Step Navigation */}
      <div className="border-b border-gray-200 px-6 py-4">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.number} className={`${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center">
                  <button
                    onClick={() => handleStepClick(step.number)}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
                      ${currentStep === step.number
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : completedSteps.includes(step.number)
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                      }
                    `}
                  >
                    {completedSteps.includes(step.number) && currentStep !== step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="flex-1 ml-4 mr-4">
                    <div className={`h-0.5 ${completedSteps.includes(step.number) ? 'bg-green-600' : 'bg-gray-300'}`} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Step 1: Study Overview */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Overview</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Study Title *
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., E-commerce Website Usability Test"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe what participants will be doing and what you hope to learn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Device Requirements
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Desktop', 'Mobile', 'Tablet', 'Any Device'].map((device) => (
                      <label key={device} className="flex items-center">
                        <input
                          type="checkbox"
                          value={device}
                          {...register('deviceRequirements')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{device}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Session */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Type</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How will this study be conducted?
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start">
                      <input
                        {...register('sessionType')}
                        type="radio"
                        value="unmoderated"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-1"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">Unmoderated</div>
                        <div className="text-sm text-gray-500">Participants complete the study independently</div>
                      </div>
                    </label>
                    <label className="flex items-start">
                      <input
                        {...register('sessionType')}
                        type="radio"
                        value="moderated"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-1"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">Moderated Session</div>
                        <div className="text-sm text-gray-500">Live sessions with participants via video call</div>
                      </div>
                    </label>
                  </div>
                </div>

                {sessionType === 'moderated' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-6 space-y-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-4">Session Configuration</h3>
                    
                    {/* Duration and Timezone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900">
                          Session Duration (minutes) *
                        </label>
                        <input
                          {...register('schedulingDetails.duration', { required: 'Duration is required for moderated sessions' })}
                          type="number"
                          min="15"
                          max="180"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900">
                          Timezone *
                        </label>
                        <select
                          {...register('schedulingDetails.timezone', { required: 'Timezone is required for moderated sessions' })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select timezone</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Central European Time</option>
                        </select>
                      </div>
                    </div>

                    {/* Available Dates */}
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Available Dates
                      </label>
                      <input
                        {...register('schedulingDetails.dates')}
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Dec 15-20, 2025 or specific dates"
                      />
                      <p className="text-xs text-blue-700 mt-1">Specify date ranges or specific dates when sessions can be scheduled</p>
                    </div>

                    {/* Available Times */}
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Available Time Slots
                      </label>
                      <input
                        {...register('schedulingDetails.times')}
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 9:00 AM - 5:00 PM, or specific time slots"
                      />
                      <p className="text-xs text-blue-700 mt-1">Specify time ranges or specific slots when sessions can be conducted</p>
                    </div>

                    {/* Zoom Configuration */}
                    <div className="border-t border-blue-200 pt-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-3">Video Conference Setup</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-blue-900">
                            Zoom Meeting ID (Optional)
                          </label>
                          <input
                            {...register('schedulingDetails.zoomDetails.meetingId')}
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="123 456 7890"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-900">
                            Meeting Password (Optional)
                          </label>
                          <input
                            {...register('schedulingDetails.zoomDetails.password')}
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter meeting password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-900">
                            Join URL (Optional)
                          </label>
                          <input
                            {...register('schedulingDetails.zoomDetails.joinUrl')}
                            type="url"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://zoom.us/j/123456789"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Instructions for Participants */}
                    <div className="border-t border-blue-200 pt-4">
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Instructions for Confirmed Participants (Optional)
                      </label>
                      <textarea
                        {...register('schedulingDetails.instructionsForParticipants')}
                        rows={4}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Please ensure you have a quiet environment, good internet connection, and test your camera/microphone before the session..."
                      />
                      <p className="text-xs text-blue-700 mt-1">These instructions will be sent to participants when their session is confirmed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Characteristics & Screening */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Target Audience & Screening</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target Country
                    </label>
                    <select
                      {...register('targetCountry', { required: 'Country is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                    </select>
                    {errors.targetCountry && <p className="mt-1 text-sm text-red-600">{errors.targetCountry.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target City (Optional)
                    </label>
                    <input
                      {...register('targetCity')}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., New York, London"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Professional Characteristics
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Tech Professional', 'Designer', 'Marketing', 'Healthcare', 'Education', 'Finance', 'Retail', 'Other'].map((prof) => (
                      <label key={prof} className="flex items-center">
                        <input
                          type="checkbox"
                          value={prof}
                          {...register('professionalCharacteristics')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{prof}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Participant Requirements
                  </label>
                  <textarea
                    {...register('participantRequirements')}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Must have online shopping experience, Age 25-45, etc."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Screening Questions
                    </label>
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                      onClick={() => {
                        const current = getValues('screeningQuestions') || [];
                        setValue('screeningQuestions', [...current, {
                          question: '',
                          type: 'multiple_choice',
                          options: [''],
                          required: true
                        }]);
                      }}
                    >
                      + Add Question
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Add questions to screen participants before they join your study
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Study Blocks */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Blocks</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Complete Setup to Add Blocks
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You'll be able to add and configure study blocks (tasks, questions, etc.) after completing the initial setup.
                        This step will integrate with the existing block builder system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}
          </div>
          
          <div>
            {currentStep < maxSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Create Study
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
