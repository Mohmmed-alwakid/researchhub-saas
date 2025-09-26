import React from 'react';
import { StepProps } from '../types';


interface StudyTypeOption {
  id: 'usability' | 'interview';
  title: string;
  description: string;
  detailedDescription: string;
  icon: string;
  features: string[];
  dataCollection: string[];
  duration: string;
  recommended: string[];
}

const STUDY_TYPE_OPTIONS: StudyTypeOption[] = [
  {
    id: 'usability',
    title: 'Usability Study',
    description: 'Test how users interact with your website, app, or prototype',
    detailedDescription: 'Block-based usability testing that guides participants through specific tasks while collecting screen recordings, click data, and feedback.',
    icon: '🖱️',
    features: [
      'Task-based testing',
      'Screen recording', 
      'Click tracking',
      'Time measurement',
      'User feedback collection',
      'SUS scoring'
    ],
    dataCollection: [
      'Screen recordings',
      'Click tracking data',
      'Time-on-task metrics',
      'Task completion rates',
      'User satisfaction ratings',
      'Error logs and issues'
    ],
    duration: '15-45 minutes',
    recommended: [
      'Testing website usability',
      'App interaction flows',
      'Prototype validation',
      'Interface improvements',
      'Navigation testing'
    ]
  },
  {
    id: 'interview',
    title: 'Interview Session',
    description: 'Conduct live interviews to gather deep insights about user needs',
    detailedDescription: 'Live session configuration for one-on-one interviews with participants via audio or video calls.',
    icon: '🎙️',
    features: [
      'Live video/audio sessions',
      'Interview script guides',
      'Session recording',
      'Real-time notes',
      'Automated scheduling',
      'Consent management'
    ],
    dataCollection: [
      'Audio/video recordings',
      'Interview transcripts',
      'Researcher notes',
      'Session insights',
      'Participant quotes',
      'Follow-up tasks'
    ],
    duration: '30-90 minutes',
    recommended: [
      'User needs research',
      'Feature discovery',
      'Pain point analysis',
      'Behavioral insights',
      'Product feedback'
    ]
  }
];

export const StudyTypeStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData
}) => {
  const handleTypeSelect = (type: 'usability' | 'interview') => {
    onUpdateFormData({ 
      type: type
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Research Method
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the type of study that best matches your research goals. Each method has different flows and data collection approaches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {STUDY_TYPE_OPTIONS.map((option) => (
          <div
            key={option.id}
            onClick={() => handleTypeSelect(option.id)}
            className={`
              relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300
              hover:shadow-xl transform hover:-translate-y-2
              ${formData.type === option.id
                ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{option.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {option.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {option.description}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {option.detailedDescription}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  ⚡ Key Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {option.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  📊 Data Collected
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {option.dataCollection.slice(0, 3).map((data, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      {data}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div>
                  <span className="text-xs font-medium text-gray-500">DURATION</span>
                  <div className="text-sm font-semibold text-gray-900">{option.duration}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-500">RECOMMENDED FOR</span>
                  <div className="text-sm font-semibold text-gray-900">{option.recommended[0]}</div>
                </div>
              </div>
            </div>

            {formData.type === option.id && (
              <div className="absolute top-6 right-6">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
