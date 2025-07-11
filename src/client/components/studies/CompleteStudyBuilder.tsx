import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { studiesService, type CreateStudyRequest } from '../../services/studies.service';
import type { 
  EnhancedStudyTemplate,
  StudyType 
} from '../../../shared/types/index';

interface CompleteStudyBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onStudyCreated: (studyId: string) => void;
  selectedTemplate?: EnhancedStudyTemplate;
  mode: 'template' | 'scratch';
}

type BuilderStep = 'setup' | 'blocks' | 'settings' | 'review';

interface StudySetup {
  title: string;
  description: string;
  type: string;
  targetParticipants: number;
  duration: number;
  compensation: number;
}

interface StudyBlock {
  id: string;
  type: string;
  title: string;
  description: string;
  order: number;
  settings: Record<string, unknown>;
}

export const CompleteStudyBuilder: React.FC<CompleteStudyBuilderProps> = ({
  isOpen,
  onClose,
  onStudyCreated,
  selectedTemplate,
  mode
}) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Study data state
  const [studySetup, setStudySetup] = useState<StudySetup>({
    title: selectedTemplate?.name || '',
    description: selectedTemplate?.description || '',
    type: selectedTemplate?.category || 'usability-testing',
    targetParticipants: 10,
    duration: 30,
    compensation: 0
  });

  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);

  // Initialize blocks from template
  useEffect(() => {
    if (selectedTemplate && isOpen) {
      const templateBlocks: StudyBlock[] = selectedTemplate.blocks?.map((block, index) => ({
        id: block.id,
        type: block.type,
        title: block.title,
        description: block.description || '',
        order: index + 1,
        settings: block.settings || {}
      })) || [];
      setStudyBlocks(templateBlocks);
    } else if (!selectedTemplate && isOpen) {
      // Default blocks for scratch creation
      setStudyBlocks([
        {
          id: 'welcome',
          type: 'welcome',
          title: 'Welcome',
          description: 'Welcome to our study',
          order: 1,
          settings: {}
        },
        {
          id: 'thank-you',
          type: 'thank_you',
          title: 'Thank You',
          description: 'Thank you for participating!',
          order: 2,
          settings: {}
        }
      ]);
    }
  }, [selectedTemplate, isOpen]);

  const steps = [
    { id: 'setup', title: 'Study Setup', description: 'Basic information' },
    { id: 'blocks', title: 'Study Flow', description: 'Configure blocks' },
    { id: 'settings', title: 'Settings', description: 'Advanced options' },
    { id: 'review', title: 'Review', description: 'Final review' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as BuilderStep);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as BuilderStep);
    }
  };

  const handleCreateStudy = async () => {
    try {
      setLoading(true);
      setError(null);

      const studyData: CreateStudyRequest = {
        title: studySetup.title,
        description: studySetup.description,
        type: 'usability' as StudyType,
        targetParticipants: studySetup.targetParticipants,
        duration: studySetup.duration,
        compensation: studySetup.compensation,
        requirements: [],
        tasks: [{
          title: 'Complete Study Tasks',
          description: 'Follow the study instructions and complete all tasks.',
          type: 'interaction',
          order: 1,
          isRequired: true,
          configuration: {
            instructions: 'Please complete all the study blocks as instructed.',
            questions: [],
            heatmapTracking: true,
            clickTracking: true,
            scrollTracking: true
          }
        }],
        settings: {
          recordScreen: false,
          recordAudio: false,
          recordWebcam: false,
          trackClicks: true,
          trackHovers: true,
          trackScrolls: true
        }
      };

      const result = await studiesService.createStudy(studyData);
      
      if (result.success) {
        onStudyCreated(result.study._id);
      } else {
        setError('Failed to create study');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Study creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {mode === 'template' ? 'Customize Your Study' : 'Study Information'}
              </h3>
              {selectedTemplate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-1">Based on: {selectedTemplate.name}</h4>
                  <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Title *
                </label>
                <input
                  type="text"
                  value={studySetup.title}
                  onChange={(e) => setStudySetup(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your study title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={studySetup.description}
                  onChange={(e) => setStudySetup(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what participants will do in this study"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Participants
                </label>
                <input
                  type="number"
                  value={studySetup.targetParticipants}
                  onChange={(e) => setStudySetup(prev => ({ ...prev, targetParticipants: parseInt(e.target.value) || 10 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>
        );

      case 'blocks':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Flow</h3>
              <p className="text-gray-600 text-sm mb-4">
                These blocks define what participants will experience in your study.
              </p>
            </div>

            <div className="space-y-3">
              {studyBlocks.map((block, index) => (
                <Card key={block.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{block.title}</h4>
                          <p className="text-sm text-gray-500">{block.description}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {block.type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTemplate && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  💡 These blocks were pre-configured based on your selected template. 
                  You can modify them after creating the study.
                </p>
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Settings</h3>
              <p className="text-gray-600 text-sm mb-4">
                Configure how your study will work.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Type
                </label>
                <select
                  value={studySetup.type}
                  onChange={(e) => setStudySetup(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="usability-testing">Usability Testing</option>
                  <option value="user-interviews">User Interviews</option>
                  <option value="feedback-survey">Feedback Survey</option>
                  <option value="concept-validation">Concept Validation</option>
                </select>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Study Status</h4>
                <p className="text-sm text-gray-600">
                  Your study will be created as a <strong>draft</strong>. You can activate it later when you're ready to collect responses.
                </p>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Study</h3>
              <p className="text-gray-600 text-sm mb-4">
                Review all details before creating your study.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <h4 className="font-medium text-gray-900">Study Information</h4>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Title</dt>
                      <dd className="text-sm font-medium text-gray-900">{studySetup.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-700">{studySetup.description || 'No description'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-700">{studySetup.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Target Participants</dt>
                      <dd className="text-sm text-gray-700">{studySetup.targetParticipants}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <h4 className="font-medium text-gray-900">Study Flow ({studyBlocks.length} blocks)</h4>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {studyBlocks.map((block, index) => (
                      <div key={block.id} className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="text-gray-700">{block.title}</span>
                        <span className="text-gray-400">({block.type})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'template' ? 'Create Study from Template' : 'Create New Study'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStepIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            onClick={currentStepIndex === 0 ? onClose : handlePrevious}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {currentStepIndex === 0 ? 'Cancel' : 'Previous'}
          </Button>
          
          <div className="flex items-center space-x-3">
            {currentStep === 'review' ? (
              <Button
                onClick={handleCreateStudy}
                disabled={loading || !studySetup.title.trim()}
                className="flex items-center bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Create Study
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentStep === 'setup' && !studySetup.title.trim()}
                className="flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
