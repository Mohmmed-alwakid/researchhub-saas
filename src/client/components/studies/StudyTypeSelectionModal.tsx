import React from 'react';
import { X, Users, ClipboardList, MessageCircle } from 'lucide-react';

interface StudyTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'usability' | 'survey' | 'interview') => void;
}

export const StudyTypeSelectionModal: React.FC<StudyTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectType
}) => {
  if (!isOpen) return null;

  const studyTypes = [
    {
      id: 'usability' as const,
      name: 'Usability Testing',
      description: 'Test how users interact with your designs, prototypes, and websites',
      icon: Users,
      color: 'bg-blue-500',
      features: ['Screen recording', 'Click tracking', 'User feedback', 'Task completion']
    },
    {
      id: 'survey' as const,
      name: 'Survey Research',
      description: 'Collect structured feedback and opinions from your target audience',
      icon: ClipboardList,
      color: 'bg-green-500',
      features: ['Multiple choice', 'Rating scales', 'Open questions', 'Logic branching']
    },
    {
      id: 'interview' as const,
      name: 'User Interview',
      description: 'Conduct in-depth conversations to understand user needs and behaviors',
      icon: MessageCircle,
      color: 'bg-purple-500',
      features: ['Video calls', 'Screen sharing', 'Recording', 'Notes taking']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Choose Study Type</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select the type of research study you want to create
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Study Type Options */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  onClick={() => onSelectType(type.id)}
                  className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center mb-4">
                    <div className={`${type.color} p-2 rounded-lg text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3 group-hover:text-indigo-600">
                      {type.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    {type.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Key Features
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              You can change the study type later if needed
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
