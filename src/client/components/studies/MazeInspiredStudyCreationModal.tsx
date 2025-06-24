import React, { useState } from 'react';
import { X } from 'lucide-react';
import SimplifiedStudyTypeSelector from './SimplifiedStudyTypeSelector';
import EnhancedTemplateGallery from './EnhancedTemplateGallery';
import type { StudyTemplate } from '../../../shared/types/index';

interface MazeInspiredStudyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StudyTemplate) => void;
  onStartFromScratch: (studyType: string) => void;
}

export const MazeInspiredStudyCreationModal: React.FC<MazeInspiredStudyCreationModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onStartFromScratch
}) => {
  const [currentStep, setCurrentStep] = useState<'type' | 'template'>('type');
  const [selectedStudyType, setSelectedStudyType] = useState<string>('');

  if (!isOpen) return null;

  const handleStudyTypeSelect = (studyType: string) => {
    setSelectedStudyType(studyType);
    setCurrentStep('template');
  };

  const handleBackToType = () => {
    setCurrentStep('type');
    setSelectedStudyType('');
  };

  const handleTemplateSelect = (template: StudyTemplate) => {
    onSelectTemplate(template);
    handleClose();
  };

  const handleStartFromScratch = () => {
    onStartFromScratch(selectedStudyType);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('type');
    setSelectedStudyType('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden"
        data-testid="maze-inspired-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {currentStep === 'template' && (
              <button
                onClick={handleBackToType}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="back-to-type-button"
              >
                ←
              </button>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentStep === 'type' ? 'Create New Study' : 'Choose Template'}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentStep === 'type' 
                  ? 'Select the type of research study you want to create'
                  : `Select a template for your ${selectedStudyType} study or start from scratch`
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-modal-button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(95vh-120px)]">
          {currentStep === 'type' ? (
            <div className="p-6" data-testid="study-type-step">
              <SimplifiedStudyTypeSelector 
                selectedType={selectedStudyType} 
                onSelectType={handleStudyTypeSelect} 
              />
            </div>
          ) : (
            <div className="p-6" data-testid="template-gallery-step">
              <EnhancedTemplateGallery
                isOpen={true}
                onClose={handleClose}
                onSelectTemplate={handleTemplateSelect}
                studyType={selectedStudyType}
                onStartFromScratch={handleStartFromScratch}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
