import React from 'react';
import { X, Monitor, Mic } from 'lucide-react';
import { Card } from '../ui';

interface StudyCreationChoice {
  type: 'unmoderated' | 'moderated';
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

interface SimplifiedStudyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'unmoderated' | 'moderated') => void;
}

const STUDY_CHOICES: StudyCreationChoice[] = [
  {
    type: 'unmoderated',
    title: 'Unmoderated Study',
    description: 'Set up surveys and usability tests for prototypes, websites, and apps.',
    icon: <Monitor className="h-8 w-8 text-blue-600" />,
    features: [
      'Self-guided tasks and surveys',
      'Screen recording capability', 
      'Prototype and website testing',
      'Automated data collection'
    ]
  },
  {
    type: 'moderated',
    title: 'Moderated Interviews',
    description: 'Schedule and run interviews, then turn transcripts into insights.',
    icon: <Mic className="h-8 w-8 text-purple-600" />,
    features: [
      'Live video interviews',
      'Flexible scheduling system',
      'Auto transcription',
      'Insight analysis tools'
    ]
  }
];

export const SimplifiedStudyCreationModal: React.FC<SimplifiedStudyCreationModalProps> = ({
  isOpen,
  onClose,
  onSelectType
}) => {
  if (!isOpen) return null;

  const handleChoice = (type: 'unmoderated' | 'moderated') => {
    onSelectType(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Study</h2>
            <p className="text-gray-600 mt-1">Choose the type of research study you want to create</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-modal-button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {STUDY_CHOICES.map((choice) => (
              <Card
                key={choice.type}
                className="relative cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-gray-200 hover:border-blue-400 p-6"
                onClick={() => handleChoice(choice.type)}
                data-testid={`study-type-${choice.type}`}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gray-50 mb-4">
                  {choice.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {choice.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {choice.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {choice.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Indicator */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Get Started →
                    </span>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Not sure which to choose?</strong> Unmoderated studies are great for testing specific tasks and collecting structured feedback. 
              Moderated interviews are perfect for exploratory research and gathering deep insights through conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedStudyCreationModal;
