import React, { useState } from 'react';
import { HelpCircle, Monitor, Clock, CheckCircle, Settings, Plus, X } from 'lucide-react';

import { StepProps, UsabilityConfig, ScreeningQuestion } from '../types';

export const UsabilityStudyConfigStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData
}) => {
  const [activeTab, setActiveTab] = useState<'screening' | 'recording' | 'completion'>('screening');

  const usabilityConfig = formData.usability_config || {
    screening_questions: [] as ScreeningQuestion[],
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
            { id: 'screening', label: 'Screening Questions', icon: HelpCircle },
            { id: 'recording', label: 'Recording Settings', icon: Monitor },
            { id: 'completion', label: 'Completion Criteria', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'screening' | 'recording' | 'completion')}
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

      {/* Screening Questions Tab */}
      {activeTab === 'screening' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Participant Screening Questions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add multiple choice questions to screen participants before they can join your study
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newQuestion = {
                    id: Date.now().toString(),
                    question: '',
                    options: ['', ''],
                    required: true
                  };
                  const updatedQuestions = [...(usabilityConfig.screening_questions || []), newQuestion];
                  updateUsabilityConfig({ screening_questions: updatedQuestions });
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {(usabilityConfig.screening_questions?.length || 0) > 0 ? (
              <div className="space-y-4">
                {usabilityConfig.screening_questions!.map((question: ScreeningQuestion, questionIndex: number) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Question {questionIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuestions = (usabilityConfig.screening_questions || []).filter((_, i) => i !== questionIndex);
                          updateUsabilityConfig({ screening_questions: updatedQuestions });
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Question Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text *
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => {
                            const updatedQuestions = [...(usabilityConfig.screening_questions || [])];
                            updatedQuestions[questionIndex] = { ...question, question: e.target.value };
                            updateUsabilityConfig({ screening_questions: updatedQuestions });
                          }}
                          placeholder="Enter your screening question..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Options */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Answer Options</label>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = [...(usabilityConfig.screening_questions || [])];
                              updatedQuestions[questionIndex] = {
                                ...question,
                                options: [...question.options, '']
                              };
                              updateUsabilityConfig({ screening_questions: updatedQuestions });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const updatedQuestions = [...(usabilityConfig.screening_questions || [])];
                                  const updatedOptions = [...question.options];
                                  updatedOptions[optionIndex] = e.target.value;
                                  updatedQuestions[questionIndex] = { ...question, options: updatedOptions };
                                  updateUsabilityConfig({ screening_questions: updatedQuestions });
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedQuestions = [...(usabilityConfig.screening_questions || [])];
                                    const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
                                    updatedQuestions[questionIndex] = { ...question, options: updatedOptions };
                                    updateUsabilityConfig({ screening_questions: updatedQuestions });
                                  }}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Required Toggle */}
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => {
                              const updatedQuestions = [...(usabilityConfig.screening_questions || [])];
                              updatedQuestions[questionIndex] = { ...question, required: e.target.checked };
                              updateUsabilityConfig({ screening_questions: updatedQuestions });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Required question</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No screening questions yet</h4>
                <p className="text-gray-600 mb-4">
                  Add screening questions to filter participants before they can join your study
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const newQuestion = {
                      id: Date.now().toString(),
                      question: '',
                      options: ['', ''],
                      required: true
                    };
                    updateUsabilityConfig({ screening_questions: [newQuestion] });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Question</span>
                </button>
              </div>
            )}

            {(usabilityConfig.screening_questions?.length || 0) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Screening Summary</h4>
                <div className="text-sm text-blue-800">
                  <p>Your study has <strong>{usabilityConfig.screening_questions?.length || 0}</strong> screening question(s):</p>
                  <ul className="mt-2 space-y-1">
                    {usabilityConfig.screening_questions?.map((q: ScreeningQuestion, i: number) => (
                      <li key={q.id}>• Question {i + 1}: {q.options.length} options{q.required ? ' (required)' : ' (optional)'}</li>
                    ))}
                  </ul>
                  <p className="text-blue-700 mt-2">
                    ℹ️ Participants will need to answer these questions before accessing your study.
                  </p>
                </div>
              </div>
            )}
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
    </div>
  );
};
