import React, { useState } from 'react';
import { StepProps } from '../types';

export const StudySetupStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onPrevious,
  isFirst,
  isLast
}) => {
  const [objectives, setObjectives] = useState<string[]>(formData.research_objectives || ['']);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    onUpdateFormData({ [field]: value });
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
    onUpdateFormData({ research_objectives: newObjectives.filter(obj => obj.trim() !== '') });
  };

  const addObjective = () => {
    setObjectives([...objectives, '']);
  };

  const removeObjective = (index: number) => {
    const newObjectives = objectives.filter((_, i) => i !== index);
    setObjectives(newObjectives);
    onUpdateFormData({ research_objectives: newObjectives.filter(obj => obj.trim() !== '') });
  };

  const handleNext = () => {
    if (formData.title?.trim()) {
      onNext();
    }
  };

  const isFormValid = formData.title?.trim() && formData.target_participants > 0;

  const showDurationField = formData.type === 'interview' || formData.type === 'usability_test';
  const showAudioField = formData.type === 'interview';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Set up your study details
        </h2>
        <p className="text-lg text-gray-600">
          Provide the basic information about your study
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        {/* Study Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Study Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a clear, descriptive title for your study"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Study Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the purpose and goals of your study"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        {/* Target Participants */}
        <div>
          <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
            Target Number of Participants *
          </label>
          <input
            type="number"
            id="participants"
            value={formData.target_participants || ''}
            onChange={(e) => handleInputChange('target_participants', parseInt(e.target.value) || 0)}
            placeholder="How many participants do you need?"
            min="1"
            max="1000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Duration (conditional) */}
        {showDurationField && (
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={formData.duration || ''}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
              placeholder="Expected time to complete"
              min="1"
              max="180"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        )}

        {/* Audio Recording (conditional) */}
        {showAudioField && (
          <div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeAudio"
                checked={formData.include_audio || false}
                onChange={(e) => handleInputChange('include_audio', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="includeAudio" className="text-sm font-medium text-gray-700">
                Include audio recording
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Record participant responses for deeper analysis (requires consent)
            </p>
          </div>
        )}

        {/* Research Objectives (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Research Objectives (optional)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            What specific questions do you want to answer? (You can add multiple objectives)
          </p>
          
          {objectives.map((objective, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                placeholder={`Research objective ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addObjective}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add another objective</span>
          </button>
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Participant Instructions (optional)
          </label>
          <textarea
            id="instructions"
            value={formData.instructions || ''}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Any specific instructions for participants"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>
      </div>

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
            Step 2 of 6
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isFormValid}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-200
              ${isFormValid
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
