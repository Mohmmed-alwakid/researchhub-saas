import React, { useState, useEffect } from 'react';
import { StepProps, StudyTemplate } from '../types';

const SAMPLE_TEMPLATES: StudyTemplate[] = [
  {
    id: 'usability-basic',
    name: 'Basic Usability Test',
    description: 'Test user interactions with your product or prototype',
    category: 'usability_test',
    usage_count: 1247,
    estimated_duration: 15,
    blocks: [
      {
        id: '1',
        type: 'welcome_screen',
        order: 0,
        title: 'Welcome',
        description: 'Welcome to our usability study',
        settings: {
          title: 'Welcome to our usability study',
          message: 'Thank you for participating. We\'ll be testing how easy our product is to use.',
          showContinueButton: true
        }
      },
      {
        id: '2',
        type: 'context_screen',
        order: 1,
        title: 'Instructions',
        description: 'Study instructions',
        settings: {
          title: 'Instructions',
          content: 'Please think aloud as you complete the tasks. There are no wrong answers.',
          showContinueButton: true
        }
      },
      {
        id: '3',
        type: 'open_question',
        order: 2,
        title: 'First Impressions',
        description: 'Initial thoughts',
        settings: {
          question: 'What are your first impressions of this interface?',
          placeholder: 'Please share your initial thoughts...',
          required: true
        }
      },
      {
        id: '4',
        type: 'opinion_scale',
        order: 3,
        title: 'Ease of Use',
        description: 'Rate ease of use',
        settings: {
          question: 'How easy was this task to complete?',
          scaleType: 'numeric',
          minValue: 1,
          maxValue: 10,
          minLabel: 'Very Difficult',
          maxLabel: 'Very Easy',
          required: true
        }
      }
    ]
  },
  {
    id: 'interview-user',
    name: 'User Interview',
    description: 'Conduct structured interviews to gather insights',
    category: 'interview',
    usage_count: 892,
    estimated_duration: 30,
    blocks: [
      {
        id: '1',
        type: 'welcome_screen',
        order: 0,
        title: 'Welcome',
        description: 'Welcome to our interview',
        settings: {
          title: 'Welcome to our user interview',
          message: 'Thank you for sharing your time with us today.',
          showContinueButton: true
        }
      },
      {
        id: '2',
        type: 'simple_input',
        order: 1,
        title: 'Background',
        description: 'Tell us about yourself',
        settings: {
          question: 'What is your role or profession?',
          inputType: 'text',
          placeholder: 'e.g., Product Manager, Developer, Designer',
          required: true
        }
      },
      {
        id: '3',
        type: 'open_question',
        order: 2,
        title: 'Experience',
        description: 'Share your experience',
        settings: {
          question: 'Tell us about your experience with similar products',
          placeholder: 'Please describe your background and experience...',
          required: true
        }
      }
    ]
  },
  {
    id: 'survey-feedback',
    name: 'Product Feedback Survey',
    description: 'Collect quantitative feedback about your product',
    category: 'survey',
    usage_count: 1456,
    estimated_duration: 10,
    blocks: [
      {
        id: '1',
        type: 'welcome_screen',
        order: 0,
        title: 'Welcome',
        description: 'Welcome to our survey',
        settings: {
          title: 'Product Feedback Survey',
          message: 'Help us improve by sharing your feedback.',
          showContinueButton: true
        }
      },
      {
        id: '2',
        type: 'opinion_scale',
        order: 1,
        title: 'Satisfaction',
        description: 'Rate your satisfaction',
        settings: {
          question: 'How satisfied are you with our product?',
          scaleType: 'numeric',
          minValue: 1,
          maxValue: 10,
          minLabel: 'Not Satisfied',
          maxLabel: 'Very Satisfied',
          required: true
        }
      },
      {
        id: '3',
        type: 'multiple_choice',
        order: 2,
        title: 'Features',
        description: 'Which features do you use most?',
        settings: {
          question: 'Which features do you use most often?',
          options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
          allowMultiple: true,
          required: true
        }
      }
    ]
  }
];

export const EnhancedTemplateSelectionStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onPrevious
}) => {
  const [templates, setTemplates] = useState<StudyTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StudyTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Filter templates based on study type
    const filteredTemplates = SAMPLE_TEMPLATES.filter(
      template => template.category === formData.type
    );
    setTemplates(filteredTemplates);
  }, [formData.type]);

  const handleTemplateSelect = (template: StudyTemplate) => {
    setSelectedTemplate(template);
    onUpdateFormData({ 
      template_id: template.id,
      blocks: [...template.blocks]
    });
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    onUpdateFormData({ 
      template_id: undefined,
      blocks: []
    });
  };

  const handleNext = () => {
    onNext();
  };

  const handlePreview = (template: StudyTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const PreviewModal = () => {
    if (!selectedTemplate || !showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Usage</div>
                  <div className="text-gray-600">{selectedTemplate.usage_count?.toLocaleString()} studies</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Duration</div>
                  <div className="text-gray-600">~{selectedTemplate.estimated_duration} minutes</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Study Flow ({selectedTemplate.blocks.length} blocks)</h4>
                <div className="space-y-2">
                  {selectedTemplate.blocks.map((block, index) => (
                    <div key={block.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{block.title}</div>
                        <div className="text-sm text-gray-600 truncate">{block.description}</div>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {block.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                handleTemplateSelect(selectedTemplate);
                setShowPreview(false);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Choose a template or start from scratch
        </h2>
        <p className="text-lg text-gray-600">
          Templates provide a proven structure for your {formData.type?.replace(/_/g, ' ')} study
        </p>
      </div>

      {/* Skip Template Option */}
      <div className="mb-8">
        <div 
          className={`
            p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
            hover:shadow-lg transform hover:-translate-y-1
            ${!selectedTemplate 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
          onClick={handleSkipTemplate}
        >
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🚀</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Start from scratch
              </h3>
              <p className="text-gray-600">
                Build your study from the ground up with complete control over every block
              </p>
            </div>
            {!selectedTemplate && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`
                  p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                  hover:shadow-lg transform hover:-translate-y-1
                  ${selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                  {selectedTemplate?.id === template.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{template.usage_count?.toLocaleString()} uses</span>
                  <span>~{template.estimated_duration} min</span>
                  <span>{template.blocks.length} blocks</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(template);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Preview template →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Step 3 of 6
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Continue
          </button>
        </div>
      </div>

      <PreviewModal />
    </div>
  );
};
