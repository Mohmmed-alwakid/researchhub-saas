import React, { useState } from 'react';
import { StepProps, UsabilityConfig } from '../types';
import { Globe, Monitor, Clock, CheckCircle, Settings } from 'lucide-react';

export const UsabilityStudyConfigStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onPrevious,
  isFirst
}) => {
  const [activeTab, setActiveTab] = useState<'website' | 'recording' | 'completion'>('website');

  const usabilityConfig = formData.usability_config || {
    website_url: '',
    recording_settings: {
      screen_recording: true,
      click_tracking: true,
      time_tracking: true,
      error_tracking: true
    },
    completion_criteria: {
      min_tasks_completed: 1,
      auto_submit: false
    }
  };

  const updateUsabilityConfig = (updates: Partial<UsabilityConfig>) => {
    onUpdateFormData({
      usability_config: {
        ...usabilityConfig,
        ...updates
      }
    });
  };

  const updateRecordingSettings = (settingUpdates: Partial<UsabilityConfig['recording_settings']>) => {
    updateUsabilityConfig({
      recording_settings: {
        ...usabilityConfig.recording_settings,
        ...settingUpdates
      }
    });
  };

  const updateCompletionCriteria = (criteriaUpdates: Partial<UsabilityConfig['completion_criteria']>) => {
    updateUsabilityConfig({
      completion_criteria: {
        ...usabilityConfig.completion_criteria,
        ...criteriaUpdates
      }
    });
  };

  const totalTasks = formData.blocks?.filter(block => 
    ['task_instruction', 'website_navigation'].includes(block.type)
  ).length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Configure Usability Study
        </h2>
        <p className="text-lg text-gray-600">
          Set up recording preferences and study completion criteria
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'website', label: 'Website Details', icon: Globe },
            { id: 'recording', label: 'Recording Settings', icon: Monitor },
            { id: 'completion', label: 'Completion Criteria', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Website Details Tab */}
      {activeTab === 'website' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website/App URL (Optional)
            </label>
            <input
              type="url"
              value={usabilityConfig.website_url}
              onChange={(e) => updateUsabilityConfig({ website_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              If provided, participants can be directed to start their testing from this URL
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Study Blocks Summary</h4>
            <div className="text-sm text-blue-800">
              <p>Your study currently has <strong>{formData.blocks?.length || 0} blocks</strong> configured:</p>
              <ul className="mt-2 space-y-1">
                <li>• Tasks to complete: <strong>{totalTasks}</strong></li>
                <li>• Welcome screens: <strong>{formData.blocks?.filter(b => b.type === 'welcome_screen').length || 0}</strong></li>
                <li>• Rating/feedback blocks: <strong>{formData.blocks?.filter(b => ['rating_scale', 'feedback_collection'].includes(b.type)).length || 0}</strong></li>
              </ul>
              {formData.blocks?.length === 0 && (
                <p className="text-amber-700 mt-2">⚠️ You'll need to add blocks in the next step to create a complete usability study.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recording Settings Tab */}
      {activeTab === 'recording' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Screen & Interaction Tracking
              </h3>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={usabilityConfig.recording_settings.screen_recording}
                  onChange={(e) => updateRecordingSettings({ screen_recording: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Screen Recording</span>
                  <p className="text-xs text-gray-500">Record participants' screens during the study</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={usabilityConfig.recording_settings.click_tracking}
                  onChange={(e) => updateRecordingSettings({ click_tracking: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Click Tracking</span>
                  <p className="text-xs text-gray-500">Track where participants click and tap</p>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Performance & Error Tracking
              </h3>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={usabilityConfig.recording_settings.time_tracking}
                  onChange={(e) => updateRecordingSettings({ time_tracking: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Time Tracking</span>
                  <p className="text-xs text-gray-500">Measure time spent on each task</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={usabilityConfig.recording_settings.error_tracking}
                  onChange={(e) => updateRecordingSettings({ error_tracking: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Error Tracking</span>
                  <p className="text-xs text-gray-500">Log errors and failed interactions</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              Data Collection Summary
            </h4>
            <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">What will be collected:</p>
                <ul className="space-y-1">
                  {usabilityConfig.recording_settings.screen_recording && (
                    <li className="flex items-center text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      Screen recordings
                    </li>
                  )}
                  {usabilityConfig.recording_settings.click_tracking && (
                    <li className="flex items-center text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      Click/tap locations
                    </li>
                  )}
                  {usabilityConfig.recording_settings.time_tracking && (
                    <li className="flex items-center text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      Task completion times
                    </li>
                  )}
                  {usabilityConfig.recording_settings.error_tracking && (
                    <li className="flex items-center text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      Error logs
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Additional data:</p>
                <ul className="space-y-1">
                  <li className="flex items-center text-blue-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    User feedback and ratings
                  </li>
                  <li className="flex items-center text-blue-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Task completion status
                  </li>
                  <li className="flex items-center text-blue-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Navigation paths
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Criteria Tab */}
      {activeTab === 'completion' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Tasks to Complete
            </label>
            <select
              value={usabilityConfig.completion_criteria.min_tasks_completed}
              onChange={(e) => updateCompletionCriteria({ min_tasks_completed: parseInt(e.target.value) })}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: Math.max(1, totalTasks) }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} of {totalTasks} tasks
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Participants must complete at least this many tasks before they can finish the study
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={usabilityConfig.completion_criteria.auto_submit}
                onChange={(e) => updateCompletionCriteria({ auto_submit: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Auto-submit when criteria met</span>
                <p className="text-xs text-gray-500">
                  Automatically complete the study when minimum tasks are finished
                </p>
              </div>
            </label>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Completion Summary</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Participants must complete at least <strong>{usabilityConfig.completion_criteria.min_tasks_completed}</strong> task(s)</li>
              <li>• Study will {usabilityConfig.completion_criteria.auto_submit ? 'automatically complete' : 'require manual completion'} when criteria are met</li>
              <li>• All selected tracking data will be collected throughout the study</li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <div>
          {!isFirst && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Usability Configuration Complete
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 rounded-lg font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
          >
            Continue to Block Builder
          </button>
        </div>
      </div>
    </div>
  );
};
