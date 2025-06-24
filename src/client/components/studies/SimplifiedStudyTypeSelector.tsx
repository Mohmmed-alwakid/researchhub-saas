import React from 'react';
// import { STUDY_TYPES } from '../../../shared/types/index';
import { Card, CardContent, CardHeader } from '../ui/Card';

// Temporary local definition to fix import issue
const STUDY_TYPES = {
  'unmoderated': {
    id: 'unmoderated',
    name: 'Unmoderated Study',
    description: 'Set up surveys and usability tests for prototypes, websites, and apps.',
    icon: 'Users',
    recommended: true,
    features: ['Screen recording', 'Click tracking', 'Automated analysis', 'Scalable testing']
  },
  'moderated': {
    id: 'moderated', 
    name: 'Moderated Session',
    description: 'Schedule and run interviews, then turn insights into actionable data.',
    icon: 'Video',
    recommended: false,
    features: ['Live interaction', 'Real-time probing', 'Deep insights', 'Flexible discussion']
  }
} as const;

interface SimplifiedStudyTypeSelectorProps {
  selectedType: string | null;
  onSelectType: (typeId: string) => void;
}

const SimplifiedStudyTypeSelector: React.FC<SimplifiedStudyTypeSelectorProps> = ({
  selectedType,
  onSelectType
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What type of study are you conducting?
        </h2>
        <p className="text-gray-600">
          Choose the research method that best fits your goals
        </p>
      </div>      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {Object.values(STUDY_TYPES).map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onSelectType(type.id)}
          >            <CardHeader className="text-center pb-3">
              <div className="text-4xl mb-3">
                {type.icon === 'Users' ? '👥' : type.icon === 'Video' ? '📹' : '📋'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {type.name}
              </h3>
              {type.recommended && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mt-2">
                  Recommended
                </span>
              )}
            </CardHeader>
            
            <CardContent className="text-center pt-0">
              <p className="text-gray-600 text-sm mb-4">
                {type.description}
              </p>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Features:</span>
                </div>
                <ul className="space-y-1">
                  {type.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-gray-600">• {feature}</li>
                  ))}
                </ul>
              </div>
              
              {selectedType === type.id && (
                <div className="mt-4 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm font-medium">Selected</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimplifiedStudyTypeSelector;
