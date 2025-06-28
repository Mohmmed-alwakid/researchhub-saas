import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';

export interface StudyFormData {
  title: string;
  description?: string;
  type: string;
  settings: {
    maxParticipants: number;
    duration: number;
    compensation: number;
    recordScreen: boolean;
    recordAudio: boolean;
    recordWebcam: boolean;
    collectHeatmaps: boolean;
    trackClicks: boolean;
    trackScrolls: boolean;
  };
}

interface StudyMetadataFormProps {
  register: UseFormRegister<StudyFormData>;
  errors: FieldErrors<StudyFormData>;
  watch: UseFormWatch<StudyFormData>;
  isSubmitting: boolean;
}

export const StudyMetadataForm: React.FC<StudyMetadataFormProps> = ({
  register,
  errors,
  watch,
  isSubmitting
}) => {

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Information</h3>
      
      {/* Title Field */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Study Title *
        </label>
        <input
          id="title"
          type="text"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your study title"
          {...register('title', { required: 'Study title is required' })}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your study"
          {...register('description')}
          disabled={isSubmitting}
        />
      </div>

      {/* Study Settings */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Study Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Max Participants */}
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants
            </label>
            <input
              id="maxParticipants"
              type="number"
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('settings.maxParticipants', { 
                required: true,
                min: 1,
                max: 100,
                valueAsNumber: true
              })}
              disabled={isSubmitting}
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('settings.duration', { 
                required: true,
                min: 1,
                max: 120,
                valueAsNumber: true
              })}
              disabled={isSubmitting}
            />
          </div>

          {/* Compensation */}
          <div>
            <label htmlFor="compensation" className="block text-sm font-medium text-gray-700 mb-2">
              Compensation ($)
            </label>
            <input
              id="compensation"
              type="number"
              min="0"
              max="500"
              step="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('settings.compensation', { 
                required: true,
                min: 0,
                max: 500,
                valueAsNumber: true
              })}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Recording Options */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Recording Options</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('settings.recordScreen')}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">Screen Recording</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('settings.recordAudio')}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">Audio Recording</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('settings.recordWebcam')}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">Webcam Recording</span>
            </label>
          </div>
        </div>

        {/* Analytics Options */}
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-3">Analytics & Tracking</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('settings.collectHeatmaps')}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">Heatmaps</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('settings.trackClicks')}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">Click Tracking</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('settings.trackScrolls')}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">Scroll Tracking</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
