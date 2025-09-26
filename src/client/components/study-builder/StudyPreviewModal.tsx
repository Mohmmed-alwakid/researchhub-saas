import React from 'react';
import { StudyBuilderBlock, getBlockDisplayName } from './types';


interface StudyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyTitle: string;
  studyDescription: string;
  blocks: StudyBuilderBlock[];
  onConfirm: () => void;
}

export const StudyPreviewModal: React.FC<StudyPreviewModalProps> = ({
  isOpen,
  onClose,
  studyTitle,
  studyDescription,
  blocks,
  onConfirm
}) => {
  if (!isOpen) return null;

  const getBlockIcon = (type: string) => {
    const icons: Record<string, string> = {
      welcome_screen: '👋',
      open_question: '💭',
      opinion_scale: '📊',
      simple_input: '📝',
      multiple_choice: '☑️',
      context_screen: 'ℹ️',
      yes_no: '✅',
      five_second_test: '⏱️',
      card_sort: '🗂️',
      tree_test: '🌳',
      thank_you: '🙏',
      image_upload: '🖼️',
      file_upload: '📎'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Preview Your Study
              </h2>
              <p className="text-gray-600">
                This is how participants will experience your study
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* Study Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {studyTitle}
              </h3>
              <p className="text-gray-700">
                {studyDescription}
              </p>
            </div>
          </div>

          {/* Study Flow */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Study Flow ({blocks.length} blocks)
            </h4>
            
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div key={block.id} className="relative">
                  {/* Connection Line */}
                  {index < blocks.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getBlockIcon(block.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          Step {index + 1}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {getBlockDisplayName(block.type)}
                        </span>
                      </div>
                      
                      <h5 className="font-medium text-gray-900 mb-1">
                        {block.title}
                      </h5>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {block.description}
                      </p>

                      {/* Block-specific preview */}
                      <div className="text-xs text-gray-500">
                        {block.type === 'open_question' && (
                          <div className="bg-white p-2 rounded border">
                            <div className="font-medium">
                              {(block.settings as { question?: string }).question || 'Question'}
                            </div>
                            <div className="text-gray-400 italic mt-1">
                              {(block.settings as { placeholder?: string }).placeholder || 'Participant response...'}
                            </div>
                          </div>
                        )}
                        
                        {block.type === 'opinion_scale' && (
                          <div className="bg-white p-2 rounded border">
                            <div className="font-medium mb-1">
                              {(block.settings as { question?: string }).question || 'Rating question'}
                            </div>
                            <div className="flex space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="w-6 h-6 bg-gray-200 rounded"></div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {block.type === 'multiple_choice' && (
                          <div className="bg-white p-2 rounded border">
                            <div className="font-medium mb-1">
                              {(block.settings as { question?: string }).question || 'Multiple choice question'}
                            </div>
                            <div className="space-y-1">
                              {((block.settings as { options?: string[] }).options || ['Option 1', 'Option 2']).slice(0, 3).map((option, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                  <div className="w-3 h-3 border border-gray-300 rounded"></div>
                                  <span className="text-gray-600">{option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(block.type === 'welcome_screen' || block.type === 'context_screen' || block.type === 'thank_you') && (
                          <div className="bg-white p-2 rounded border">
                            <div className="font-medium">
                              {(block.settings as { title?: string }).title || block.title}
                            </div>
                            <div className="text-gray-600 mt-1">
                              {(block.settings as { message?: string; content?: string }).message || 
                               (block.settings as { message?: string; content?: string }).content || 
                               'Content preview...'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {blocks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No blocks added yet. Add some blocks to see the study flow.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {blocks.length} blocks • Estimated duration: {Math.max(5, blocks.length * 2)} minutes
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Looks Good, Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
