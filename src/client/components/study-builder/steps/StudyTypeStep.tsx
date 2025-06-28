import React from 'react';
import { StepProps, StudyFormData } from '../types';

interface StudyTypeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  popular?: boolean;
}

const STUDY_TYPE_OPTIONS: StudyTypeOption[] = [
  {
    id: 'usability_test',
    title: 'Usability Test',
    description: 'Test how users interact with your product or prototype',
    icon: '🖱️',
    popular: true
  },
  {
    id: 'interview',
    title: 'User Interview', 
    description: 'Conduct structured interviews to gather deep insights',
    icon: '🎙️'
  },
  {
    id: 'survey',
    title: 'Survey',
    description: 'Collect quantitative data through questionnaires',
    icon: '📋',
    popular: true
  },
  {
    id: 'card_sort',
    title: 'Card Sort',
    description: 'Understand how users categorize information',
    icon: '🗂️'
  },
  {
    id: 'tree_test',
    title: 'Tree Test',
    description: 'Test navigation and information architecture',
    icon: '🌳'
  }
];

export const StudyTypeStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  isFirst,
  isLast
}) => {
  const handleTypeSelect = (type: string) => {
    onUpdateFormData({ 
      type: type as StudyFormData['type']
    });
  };

  const handleNext = () => {
    if (formData.type) {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          What type of study do you want to create?
        </h2>
        <p className="text-lg text-gray-600">
          Choose the research method that best fits your goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {STUDY_TYPE_OPTIONS.map((option) => (
          <div
            key={option.id}
            onClick={() => handleTypeSelect(option.id)}
            className={`
              relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
              hover:shadow-lg transform hover:-translate-y-1
              ${formData.type === option.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            {option.popular && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Popular
              </div>
            )}
            
            <div className="text-center">
              <div className="text-4xl mb-3">{option.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {option.description}
              </p>
            </div>

            {formData.type === option.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div>
          {!isFirst && (
            <button
              type="button"
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled
            >
              Previous
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Step 1 of 6
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!formData.type}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-200
              ${formData.type
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
