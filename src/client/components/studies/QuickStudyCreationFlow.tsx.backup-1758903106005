import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Loader2, AlertCircle, Settings, Users, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { EnhancedStudyTemplate } from '../../../shared/types/index';

interface QuickStudyCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (studyId?: string) => void;
  selectedTemplate?: EnhancedStudyTemplate;
}

interface QuickStudyFormData {
  title: string;
  description: string;
  targetParticipants: number;
  duration: number;
  compensation: number;
}

export const QuickStudyCreationFlow: React.FC<QuickStudyCreationFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  selectedTemplate
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuickStudyFormData>({
    title: '',
    description: '',
    targetParticipants: 10,
    duration: 15,
    compensation: 25
  });

  // Initialize form with template data when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        title: selectedTemplate.name || '',
        description: selectedTemplate.description || '',
        duration: selectedTemplate.metadata?.estimatedDuration || 15,
        targetParticipants: selectedTemplate.metadata?.participantCount || 10
      }));
    }
  }, [selectedTemplate]);

  if (!isOpen) return null;

  const handleFormChange = (field: keyof QuickStudyFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Study title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Study description is required');
      return false;
    }
    if (formData.targetParticipants < 1 || formData.targetParticipants > 100) {
      setError('Target participants must be between 1 and 100');
      return false;
    }
    if (formData.duration < 5 || formData.duration > 120) {
      setError('Duration must be between 5 and 120 minutes');
      return false;
    }
    return true;
  };

  const createStudy = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    setError(null);

    try {
      // Prepare study data based on template
      const studyData = {
        title: formData.title,
        description: formData.description,
        type: selectedTemplate?.category || 'usability',
        status: 'draft',
        settings: {
          maxParticipants: formData.targetParticipants,
          duration: formData.duration,
          compensation: formData.compensation,
          recordScreen: true,
          recordAudio: false,
          recordWebcam: false
        },
        tasks: selectedTemplate?.blocks?.map(block => ({
          id: block.id,
          title: block.settings?.title || block.settings?.question || `${block.type} block`,
          description: block.settings?.description || '',
          type: block.type,
          configuration: block.settings
        })) || []
      };

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(studyData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create study');
      }

      // Success! Get the created study ID
      const studyId = result.study?._id || result.study?.id;
      
      // Call onComplete with study ID
      onComplete(studyId);

    } catch (err: unknown) {
      console.error('Study creation error:', err);
      setError((err as Error).message || 'Failed to create study. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Study Creation</h3>
        <p className="text-sm text-gray-600">
          Create your study in 2 simple steps using the selected template
        </p>
      </div>

      {selectedTemplate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-blue-900">{selectedTemplate.name}</h4>
                <p className="text-sm text-blue-700 mt-1">{selectedTemplate.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedTemplate.metadata?.estimatedDuration || 15} min
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedTemplate.blocks?.length || 0} blocks
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Study Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a descriptive title for your study"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Study Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what participants will be doing in this study"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          onClick={() => setCurrentStep(2)}
          disabled={!formData.title.trim() || !formData.description.trim()}
          className="flex-1"
        >
          Next: Study Settings
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Settings</h3>
        <p className="text-sm text-gray-600">
          Configure the basic settings for your study
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="h-4 w-4 inline mr-1" />
            Target Participants
          </label>
          <input
            type="number"
            id="participants"
            value={formData.targetParticipants}
            onChange={(e) => handleFormChange('targetParticipants', parseInt(e.target.value) || 0)}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="h-4 w-4 inline mr-1" />
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={formData.duration}
            onChange={(e) => handleFormChange('duration', parseInt(e.target.value) || 0)}
            min="5"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="compensation" className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Compensation ($)
          </label>
          <input
            type="number"
            id="compensation"
            value={formData.compensation}
            onChange={(e) => handleFormChange('compensation', parseInt(e.target.value) || 0)}
            min="0"
            max="500"
            step="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Study Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Title:</strong> {formData.title}</p>
          <p><strong>Template:</strong> {selectedTemplate?.name || 'Custom'}</p>
          <p><strong>Participants:</strong> {formData.targetParticipants}</p>
          <p><strong>Duration:</strong> ~{formData.duration} minutes</p>
          <p><strong>Compensation:</strong> ${formData.compensation} per participant</p>
          {selectedTemplate && (
            <p><strong>Blocks:</strong> {selectedTemplate.blocks?.length || 0} study blocks</p>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          disabled={isCreating}
        >
          Back
        </Button>
        <Button
          onClick={createStudy}
          disabled={isCreating}
          className="flex-1"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Study...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Create Study
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <button
          onClick={() => onComplete()}
          className="text-sm text-blue-600 hover:text-blue-700"
          disabled={isCreating}
        >
          Or continue with full Study Builder for advanced options
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          1
        </div>
        <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          2
        </div>
      </div>

      {currentStep === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};
