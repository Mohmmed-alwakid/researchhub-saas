import React, { useState } from 'react';
import { StepProps } from '../types';
import { StudyPreviewModal } from '../StudyPreviewModal';

export const ReviewStep: React.FC<StepProps> = ({
  formData,
  onNext,
  onPrevious
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Review your study
        </h2>
        <p className="text-lg text-gray-600">
          Check all details before launching your study
        </p>
      </div>

      <div className="space-y-6">
        {/* Study Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Study Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Title
              </label>
              <div className="text-gray-900 font-medium">
                {formData.title || 'Untitled Study'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Type
              </label>
              <div className="text-gray-900 capitalize">
                {formData.type?.replace(/_/g, ' ') || 'Not specified'}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="text-gray-900">
                {formData.description || 'No description provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Participants
              </label>
              <div className="text-gray-900">
                {formData.target_participants || 0} participants
              </div>
            </div>

            {formData.duration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration
                </label>
                <div className="text-gray-900">
                  {formatDuration(formData.duration)}
                </div>
              </div>
            )}

            {formData.include_audio && (
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900">Audio recording enabled</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Research Objectives */}
        {formData.research_objectives && formData.research_objectives.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Objectives</h3>
            <ul className="space-y-2">
              {formData.research_objectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-900">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {formData.instructions && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Participant Instructions</h3>
            <div className="text-gray-900 whitespace-pre-wrap">
              {formData.instructions}
            </div>
          </div>
        )}

        {/* Study Flow */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Study Flow ({formData.blocks?.length || 0} blocks)
            </h3>
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Preview Study Experience
            </button>
          </div>

          {formData.blocks && formData.blocks.length > 0 ? (
            <div className="space-y-3">
              {formData.blocks.map((block, index) => (
                <div key={block.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{block.title}</div>
                    <div className="text-sm text-gray-600">{block.description}</div>
                  </div>
                  <div className="text-xs text-gray-500 capitalize bg-white px-2 py-1 rounded">
                    {block.type.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No blocks configured</p>
            </div>
          )}
        </div>

        {/* Study Settings Summary */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Ready to Launch</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formData.blocks?.length || 0}
              </div>
              <div className="text-blue-700">Study Blocks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formData.target_participants || 0}
              </div>
              <div className="text-blue-700">Target Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(5, (formData.blocks?.length || 0) * 2)}
              </div>
              <div className="text-blue-700">Est. Minutes</div>
            </div>
          </div>
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
            Step 5 of 6
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Launch Study
          </button>
        </div>
      </div>

      <StudyPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        studyTitle={formData.title || 'Untitled Study'}
        studyDescription={formData.description || 'No description'}
        blocks={formData.blocks || []}
        onConfirm={() => setShowPreview(false)}
      />
    </div>
  );
};
