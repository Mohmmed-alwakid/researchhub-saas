import React from 'react';
import { StepProps, StudyTemplate } from '../types';
import SimplifiedTemplateSelection from '../../templates/SimplifiedTemplateSelection';

// Template interface adapter to match existing StudyTemplate type
interface TemplateAdapter {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedDuration: number;
  blockCount: number;
  participantCount: string;
  category: string;
  blocks: string[];
  insights: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  usageCount: number;
  successRate: number;
}

// Convert simplified template to existing StudyTemplate format
const adaptTemplate = (template: TemplateAdapter): StudyTemplate => {
  const blockTemplates = template.blocks.map((blockName, index) => ({
    id: `${template.id}-block-${index}`,
    type: getBlockTypeFromName(blockName) as string,
    order: index,
    title: blockName,
    description: `${blockName} for ${template.title}`,
    settings: getDefaultSettingsForBlock(getBlockTypeFromName(blockName))
  }));

  return {
    id: template.id,
    name: template.title,
    description: template.description,
    category: template.category.toLowerCase().replace(' ', '_'),
    usage_count: template.usageCount,
    estimated_duration: template.estimatedDuration,
    blocks: blockTemplates as StudyTemplate['blocks']
  };
};

// Map block names to block types
const getBlockTypeFromName = (blockName: string): string => {
  const mapping: Record<string, string> = {
    'Welcome Screen': 'welcome_screen',
    'Task Instructions': 'context_screen',
    'Website Task': 'context_screen',
    'Feedback Questions': 'open_question',
    'Thank You': 'thank_you',
    'Feature Rating': 'opinion_scale',
    'Open Feedback': 'open_question',
    'Introduction': 'welcome_screen',
    'Background Questions': 'simple_input',
    'Deep Dive Discussion': 'open_question',
    'Wrap Up': 'thank_you',
    'Concept Presentation': 'context_screen',
    'Understanding Check': 'multiple_choice',
    'Preference Rating': 'opinion_scale',
    'Instructions & Practice': 'context_screen',
    'Card Sorting Task': 'card_sort',
    'Version A Evaluation': 'context_screen',
    'Version B Evaluation': 'context_screen',
    'Preference Selection': 'multiple_choice',
    'Reasoning': 'open_question',
    '5-Second Exposure': 'five_second_test',
    'Recall & Impression Questions': 'open_question',
    'Journey Start': 'context_screen',
    'Touchpoint 1': 'context_screen',
    'Touchpoint 2': 'context_screen',
    'Touchpoint 3': 'context_screen',
    'Journey End': 'context_screen',
    'Overall Reflection': 'open_question'
  };
  
  return mapping[blockName] || 'context_screen';
};

// Get default settings for block types
const getDefaultSettingsForBlock = (blockType: string): Record<string, any> => {
  const defaults: Record<string, Record<string, any>> = {
    welcome_screen: {
      title: 'Welcome',
      message: 'Welcome to our study',
      showContinueButton: true
    },
    context_screen: {
      title: 'Instructions',
      content: 'Please follow the instructions carefully',
      showContinueButton: true
    },
    open_question: {
      question: 'Please share your thoughts',
      placeholder: 'Type your response here...',
      required: true
    },
    opinion_scale: {
      question: 'Please rate your experience',
      scaleType: 'numeric',
      minValue: 1,
      maxValue: 5,
      required: true
    },
    multiple_choice: {
      question: 'Please select an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      allowMultiple: false,
      required: true
    },
    simple_input: {
      question: 'Please provide your answer',
      inputType: 'text',
      required: true
    },
    thank_you: {
      title: 'Thank You',
      message: 'Thank you for participating in our study',
      showNextSteps: true
    },
    card_sort: {
      title: 'Card Sorting',
      instructions: 'Organize these items into groups that make sense to you',
      items: ['Item 1', 'Item 2', 'Item 3'],
      allowCustomGroups: true
    },
    five_second_test: {
      title: '5-Second Test',
      instructions: 'Look at this page for 5 seconds',
      imageUrl: '',
      duration: 5
    }
  };
  
  return defaults[blockType] || {};
};

export const EnhancedTemplateSelectionStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onPrevious
}) => {
  const handleTemplateSelect = (template: StudyTemplate) => {
    onUpdateFormData({ 
      template_id: template.id,
      blocks: [...template.blocks]
    });
  };

  const handleNext = () => {
    onNext();
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

      {/* Simplified Template Selection */}
      <SimplifiedTemplateSelection
        onSelectTemplate={(template: TemplateAdapter) => {
          const adaptedTemplate = adaptTemplate(template);
          handleTemplateSelect(adaptedTemplate);
        }}
        onStartFromScratch={() => {
          onUpdateFormData({ 
            template_id: undefined,
            blocks: []
          });
        }}
      />

      <div className="flex justify-between items-center mt-8">
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
    </div>
  );
};
