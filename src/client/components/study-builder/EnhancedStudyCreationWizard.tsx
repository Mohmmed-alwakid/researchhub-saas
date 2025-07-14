/**
 * PHASE 3: ENHANCED STUDY CREATION WIZARD
 * Modern study creation interface with enhanced authentication integration
 * Requirements Source: docs/requirements/03-USER_EXPERIENCE_ENHANCEMENT.md
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEnhancedAuth, type User } from '../../hooks/useEnhancedAuth';

// Type definitions for study creation
interface StudyFormData {
  title: string;
  description: string;
  type: 'unmoderated' | 'moderated' | '';
  duration?: number;
  audioRequired?: boolean;
  researchObjectives?: string;
  targetAudience?: string;
  participantCriteria?: string;
  incentives?: string;
  privacySettings: 'public' | 'private' | 'organization';
  status: 'draft' | 'active' | 'paused' | 'completed';
}

interface StudyCreationStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isAccessible: boolean;
}

// Enhanced Study API client
class StudyAPIClient {
  private baseUrl: string;
  private authClient: { getToken: () => string | null };

  constructor(authClient: { getToken: () => string | null }, baseUrl = 'http://localhost:3003/api') {
    this.baseUrl = baseUrl;
    this.authClient = authClient;
  }

  private async makeRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }> {
    const token = this.authClient.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: data.data || data,
        error: data.error,
        message: data.message
      };
    } catch (error) {
      console.error('Study API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      };
    }
  }

  async createStudy(studyData: StudyFormData) {
    return await this.makeRequest('/studies', {
      method: 'POST',
      body: JSON.stringify(studyData),
    });
  }

  async updateStudy(studyId: string, studyData: Partial<StudyFormData>) {
    return await this.makeRequest(`/studies/${studyId}`, {
      method: 'PUT',
      body: JSON.stringify(studyData),
    });
  }

  async getStudyTemplates() {
    return await this.makeRequest('/templates-simple');
  }

  async validateStudyData(studyData: Partial<StudyFormData>) {
    return await this.makeRequest('/studies/validate', {
      method: 'POST',
      body: JSON.stringify(studyData),
    });
  }
}

// Enhanced Study Creation Wizard Component
interface EnhancedStudyCreationWizardProps {
  onClose: () => void;
  onStudyCreated?: (studyId: string) => void;
  initialData?: Partial<StudyFormData>;
}

export const EnhancedStudyCreationWizard: React.FC<EnhancedStudyCreationWizardProps> = ({
  onClose,
  onStudyCreated,
  initialData = {}
}) => {
  const { user, isAuthenticated, hasRole, authClient } = useEnhancedAuth();
  const [studyAPI] = useState(() => new StudyAPIClient(authClient));

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Form data state
  const [formData, setFormData] = useState<StudyFormData>({
    title: '',
    description: '',
    type: '',
    duration: undefined,
    audioRequired: false,
    researchObjectives: '',
    targetAudience: '',
    participantCriteria: '',
    incentives: '',
    privacySettings: 'organization',
    status: 'draft',
    ...initialData
  });

  // Step configuration
  const steps: StudyCreationStep[] = useMemo(() => [
    {
      id: 1,
      title: 'Study Type',
      description: 'Choose the type of research study',
      isComplete: !!formData.type,
      isAccessible: true
    },
    {
      id: 2,
      title: 'Basic Information',
      description: 'Title, description, and objectives',
      isComplete: !!(formData.title && formData.description),
      isAccessible: !!formData.type
    },
    {
      id: 3,
      title: 'Study Configuration',
      description: 'Duration, requirements, and settings',
      isComplete: true, // Optional fields, so always complete
      isAccessible: !!(formData.title && formData.description)
    },
    {
      id: 4,
      title: 'Participants',
      description: 'Target audience and criteria',
      isComplete: !!formData.targetAudience,
      isAccessible: !!(formData.title && formData.description)
    },
    {
      id: 5,
      title: 'Privacy & Publishing',
      description: 'Privacy settings and study status',
      isComplete: !!formData.privacySettings,
      isAccessible: !!formData.targetAudience
    },
    {
      id: 6,
      title: 'Review & Launch',
      description: 'Final review and study creation',
      isComplete: false,
      isAccessible: !!formData.privacySettings
    }
  ], [formData.type, formData.title, formData.description, formData.targetAudience, formData.privacySettings]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || !hasRole('researcher')) {
      setError('You must be logged in as a researcher to create studies');
    }
  }, [isAuthenticated, hasRole]);

  // Form validation
  const validateCurrentStep = useCallback(async () => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.type) {
          errors.type = 'Please select a study type';
        }
        break;
      
      case 2:
        if (!formData.title?.trim()) {
          errors.title = 'Study title is required';
        } else if (formData.title.length < 3) {
          errors.title = 'Title must be at least 3 characters';
        }
        
        if (!formData.description?.trim()) {
          errors.description = 'Study description is required';
        } else if (formData.description.length < 10) {
          errors.description = 'Description must be at least 10 characters';
        }
        break;
      
      case 3:
        if (formData.type === 'moderated' && !formData.duration) {
          errors.duration = 'Duration is required for moderated studies';
        }
        break;
      
      case 4:
        if (!formData.targetAudience?.trim()) {
          errors.targetAudience = 'Target audience is required';
        }
        break;
      
      case 5:
        if (!formData.privacySettings) {
          errors.privacySettings = 'Privacy setting is required';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formData]);

  // Navigation handlers
  const canGoNext = useCallback(() => {
    const step = steps[currentStep - 1];
    return step?.isAccessible && currentStep < steps.length;
  }, [currentStep, steps]);

  const canGoPrevious = useCallback(() => {
    return currentStep > 1;
  }, [currentStep]);

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && canGoNext()) {
      setCurrentStep(prev => prev + 1);
      setValidationErrors({});
    }
  }, [validateCurrentStep, canGoNext]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious()) {
      setCurrentStep(prev => prev - 1);
      setValidationErrors({});
    }
  }, [canGoPrevious]);

  const handleStepClick = useCallback(async (stepId: number) => {
    const targetStep = steps[stepId - 1];
    if (targetStep?.isAccessible) {
      // Validate current step before moving
      const isCurrentStepValid = await validateCurrentStep();
      if (isCurrentStepValid || stepId < currentStep) {
        setCurrentStep(stepId);
        setValidationErrors({});
      }
    }
  }, [steps, validateCurrentStep, currentStep]);

  // Form handlers
  const updateFormData = useCallback((updates: Partial<StudyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  // Study creation handler
  const handleCreateStudy = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Final validation
      const isValid = await validateCurrentStep();
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Create study
      const response = await studyAPI.createStudy(formData);
      
      if (response.success) {
        const studyId = (response.data as { id?: string })?.id || 'new-study';
        onStudyCreated?.(studyId);
        onClose();
      } else {
        setError(response.error || 'Failed to create study');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create study');
    } finally {
      setIsLoading(false);
    }
  }, [validateCurrentStep, studyAPI, formData, onStudyCreated, onClose]);

  // Render authentication check
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            You must be logged in as a researcher to create studies.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!hasRole('researcher')) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only researchers can create studies. Your current role: {user?.role}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Create New Study</h1>
              <p className="text-blue-100 mt-1">
                Logged in as: {user?.firstName} {user?.lastName} ({user?.role})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Step Progress */}
          <div className="mt-6">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  disabled={!step.isAccessible}
                  className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStep === step.id
                      ? 'bg-white text-blue-600'
                      : step.isAccessible
                      ? 'bg-blue-500 text-white hover:bg-blue-400'
                      : 'bg-blue-400 text-blue-200 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step.isComplete
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.isComplete ? '✓' : step.id}
                  </span>
                  <span className="hidden md:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-3">⚠️</div>
                <div className="text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="max-w-2xl">
            {currentStep === 1 && (
              <StepStudyType 
                formData={formData} 
                updateFormData={updateFormData}
                validationErrors={validationErrors}
              />
            )}
            
            {currentStep === 2 && (
              <StepBasicInfo 
                formData={formData} 
                updateFormData={updateFormData}
                validationErrors={validationErrors}
              />
            )}
            
            {currentStep === 3 && (
              <StepConfiguration 
                formData={formData} 
                updateFormData={updateFormData}
                validationErrors={validationErrors}
              />
            )}
            
            {currentStep === 4 && (
              <StepParticipants 
                formData={formData} 
                updateFormData={updateFormData}
                validationErrors={validationErrors}
              />
            )}
            
            {currentStep === 5 && (
              <StepPrivacySettings 
                formData={formData} 
                updateFormData={updateFormData}
                validationErrors={validationErrors}
              />
            )}
            
            {currentStep === 6 && (
              <StepReview 
                formData={formData}
                user={user}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious() || isLoading}
              className={`px-6 py-2 rounded-lg font-medium ${
                canGoPrevious() && !isLoading
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || isLoading}
                className={`px-6 py-2 rounded-lg font-medium ${
                  canGoNext() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreateStudy}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-medium ${
                  !isLoading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Creating...' : 'Create Study'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const StepStudyType: React.FC<{
  formData: StudyFormData;
  updateFormData: (updates: Partial<StudyFormData>) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, updateFormData, validationErrors }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Study Type</h2>
    <p className="text-gray-600 mb-6">
      Select the type of research study you want to create. This will determine the available options in the next steps.
    </p>

    <div className="space-y-4">
      <label className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
        formData.type === 'unmoderated' 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <input
          type="radio"
          name="studyType"
          value="unmoderated"
          checked={formData.type === 'unmoderated'}
          onChange={(e) => updateFormData({ type: e.target.value as 'unmoderated' })}
          className="sr-only"
        />
        <div className="flex items-start">
          <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
            formData.type === 'unmoderated'
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300'
          }`}>
            {formData.type === 'unmoderated' && (
              <div className="w-full h-full rounded-full bg-white scale-50"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Unmoderated Study</h3>
            <p className="text-sm text-gray-600 mt-1">
              Participants complete tasks independently without real-time guidance. 
              Great for usability testing, surveys, and first impressions.
            </p>
          </div>
        </div>
      </label>

      <label className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
        formData.type === 'moderated' 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <input
          type="radio"
          name="studyType"
          value="moderated"
          checked={formData.type === 'moderated'}
          onChange={(e) => updateFormData({ type: e.target.value as 'moderated' })}
          className="sr-only"
        />
        <div className="flex items-start">
          <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
            formData.type === 'moderated'
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300'
          }`}>
            {formData.type === 'moderated' && (
              <div className="w-full h-full rounded-full bg-white scale-50"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Moderated Interview</h3>
            <p className="text-sm text-gray-600 mt-1">
              Live sessions with participants where you can ask questions and guide the conversation. 
              Perfect for user interviews, feedback sessions, and in-depth research.
            </p>
          </div>
        </div>
      </label>
    </div>

    {validationErrors.type && (
      <p className="text-red-600 text-sm mt-2">{validationErrors.type}</p>
    )}
  </div>
);

const StepBasicInfo: React.FC<{
  formData: StudyFormData;
  updateFormData: (updates: Partial<StudyFormData>) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, updateFormData, validationErrors }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
    <p className="text-gray-600 mb-6">
      Provide the essential details about your study that participants will see.
    </p>

    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Study Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="e.g., Website Navigation Usability Test"
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {validationErrors.title && (
          <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Study Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe what participants will be doing and what you hope to learn..."
          rows={4}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {validationErrors.description && (
          <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-2">
          Research Objectives <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          id="objectives"
          value={formData.researchObjectives}
          onChange={(e) => updateFormData({ researchObjectives: e.target.value })}
          placeholder="What specific questions are you trying to answer with this study?"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

const StepConfiguration: React.FC<{
  formData: StudyFormData;
  updateFormData: (updates: Partial<StudyFormData>) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, updateFormData, validationErrors }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Configuration</h2>
    <p className="text-gray-600 mb-6">
      Configure the technical settings for your {formData.type} study.
    </p>

    <div className="space-y-6">
      {formData.type === 'moderated' && (
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Session Duration (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            value={formData.duration || ''}
            onChange={(e) => updateFormData({ duration: parseInt(e.target.value) || undefined })}
            placeholder="30"
            min="5"
            max="120"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.duration ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.duration && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.duration}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Recommended: 15-60 minutes</p>
        </div>
      )}

      {formData.type === 'moderated' && (
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.audioRequired}
              onChange={(e) => updateFormData({ audioRequired: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Require audio recording for this interview
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Audio helps capture nuanced feedback but may reduce participant willingness.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="incentives" className="block text-sm font-medium text-gray-700 mb-2">
          Participant Incentives <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="text"
          id="incentives"
          value={formData.incentives}
          onChange={(e) => updateFormData({ incentives: e.target.value })}
          placeholder="e.g., $25 gift card, Entry to win $100 prize"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          What will participants receive for their time? This helps with recruitment.
        </p>
      </div>
    </div>
  </div>
);

const StepParticipants: React.FC<{
  formData: StudyFormData;
  updateFormData: (updates: Partial<StudyFormData>) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, updateFormData, validationErrors }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Target Participants</h2>
    <p className="text-gray-600 mb-6">
      Define who should participate in your study to get the most relevant insights.
    </p>

    <div className="space-y-6">
      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience *
        </label>
        <textarea
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => updateFormData({ targetAudience: e.target.value })}
          placeholder="e.g., Adults 25-45 who have used mobile banking apps in the last 6 months"
          rows={3}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.targetAudience ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {validationErrors.targetAudience && (
          <p className="text-red-600 text-sm mt-1">{validationErrors.targetAudience}</p>
        )}
      </div>

      <div>
        <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-2">
          Participant Criteria <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          id="criteria"
          value={formData.participantCriteria}
          onChange={(e) => updateFormData({ participantCriteria: e.target.value })}
          placeholder="Specific requirements: device type, experience level, location, etc."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Any specific requirements or exclusions for participants.
        </p>
      </div>
    </div>
  </div>
);

const StepPrivacySettings: React.FC<{
  formData: StudyFormData;
  updateFormData: (updates: Partial<StudyFormData>) => void;
  validationErrors: Record<string, string>;
}> = ({ formData, updateFormData, validationErrors }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Publishing</h2>
    <p className="text-gray-600 mb-6">
      Control who can see your study and how it will be published.
    </p>

    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Study Visibility *</h3>
        <div className="space-y-3">
          {[
            {
              value: 'organization',
              label: 'Organization Only',
              description: 'Only members of your organization can see this study'
            },
            {
              value: 'private',
              label: 'Private',
              description: 'Only you and invited collaborators can see this study'
            },
            {
              value: 'public',
              label: 'Public',
              description: 'Anyone can discover and participate in this study'
            }
          ].map((option) => (
            <label
              key={option.value}
              className={`block border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                formData.privacySettings === option.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="privacySettings"
                value={option.value}
                checked={formData.privacySettings === option.value}
                onChange={(e) => updateFormData({ privacySettings: e.target.value as 'public' | 'private' | 'organization' })}
                className="sr-only"
              />
              <div className="flex items-start">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 mt-0.5 ${
                  formData.privacySettings === option.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {formData.privacySettings === option.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
        {validationErrors.privacySettings && (
          <p className="text-red-600 text-sm mt-2">{validationErrors.privacySettings}</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Initial Status</h3>
        <div className="space-y-3">
          {[
            {
              value: 'draft',
              label: 'Save as Draft',
              description: 'Study will be saved but not published yet'
            },
            {
              value: 'active',
              label: 'Publish Immediately',
              description: 'Study will be live and accepting participants'
            }
          ].map((option) => (
            <label
              key={option.value}
              className={`block border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                formData.status === option.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={formData.status === option.value}
                onChange={(e) => updateFormData({ status: e.target.value as 'draft' | 'active' })}
                className="sr-only"
              />
              <div className="flex items-start">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 mt-0.5 ${
                  formData.status === option.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {formData.status === option.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StepReview: React.FC<{
  formData: StudyFormData;
  user: User | null;
}> = ({ formData, user }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Launch</h2>
    <p className="text-gray-600 mb-6">
      Review your study details before creating it. You can always edit these settings later.
    </p>

    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Study Overview</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Title:</dt>
            <dd className="text-sm text-gray-900">{formData.title || 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Type:</dt>
            <dd className="text-sm text-gray-900 capitalize">{formData.type || 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Description:</dt>
            <dd className="text-sm text-gray-900">{formData.description || 'Not specified'}</dd>
          </div>
          {formData.researchObjectives && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Objectives:</dt>
              <dd className="text-sm text-gray-900">{formData.researchObjectives}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Configuration</h3>
        <dl className="space-y-2">
          {formData.duration && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Duration:</dt>
              <dd className="text-sm text-gray-900">{formData.duration} minutes</dd>
            </div>
          )}
          {formData.type === 'moderated' && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Audio Recording:</dt>
              <dd className="text-sm text-gray-900">{formData.audioRequired ? 'Required' : 'Optional'}</dd>
            </div>
          )}
          {formData.incentives && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Incentives:</dt>
              <dd className="text-sm text-gray-900">{formData.incentives}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Participants</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Target Audience:</dt>
            <dd className="text-sm text-gray-900">{formData.targetAudience || 'Not specified'}</dd>
          </div>
          {formData.participantCriteria && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Criteria:</dt>
              <dd className="text-sm text-gray-900">{formData.participantCriteria}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Privacy & Publishing</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Visibility:</dt>
            <dd className="text-sm text-gray-900 capitalize">{formData.privacySettings || 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Status:</dt>
            <dd className="text-sm text-gray-900 capitalize">{formData.status || 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Created by:</dt>
            <dd className="text-sm text-gray-900">{user?.firstName} {user?.lastName} ({user?.email})</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
);

export default EnhancedStudyCreationWizard;
