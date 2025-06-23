import React, { useState } from 'react';
import { X, Save, Settings } from 'lucide-react';

interface TaskEditModalProps {
  isOpen: boolean;
  task: StudyBuilderTask | null;
  onClose: () => void;
  onSave: (updatedTask: StudyBuilderTask) => void;
}

interface StudyBuilderTask {
  id: string;
  template_id: string;
  name: string;
  description: string;
  estimated_duration?: number; // Make optional since we're removing from UI
  order_index: number;
  settings?: Record<string, unknown>;
  task_type?: string; // Add task type for specific configurations
}

interface SurveyQuestion {
  question: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  required: boolean;
  options?: string[];
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave
}) => {
  const [editedTask, setEditedTask] = useState<StudyBuilderTask | null>(task);

  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };
  const updateTask = (field: keyof StudyBuilderTask, value: unknown) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        [field]: value
      });
    }
  };

  const updateTaskSettings = (settingKey: string, value: unknown) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        settings: {
          ...editedTask.settings,
          [settingKey]: value
        }
      });
    }
  };

  // Get task type from template_id
  const getTaskType = () => {
    const taskType = editedTask?.task_type || editedTask?.template_id;
    if (taskType?.includes('survey') || taskType?.includes('questionnaire')) return 'survey';
    if (taskType?.includes('interview')) return 'interview';
    if (taskType?.includes('navigation') || taskType?.includes('website')) return 'navigation';
    if (taskType?.includes('click') || taskType?.includes('usability')) return 'click_tracking';
    return 'survey'; // default
  };

  const renderTaskSpecificSettings = () => {
    const taskType = getTaskType();
    
    switch (taskType) {
      case 'survey':
        return renderSurveySettings();
      case 'interview':
        return renderInterviewSettings();
      case 'navigation':
        return renderNavigationSettings();
      case 'click_tracking':
        return renderClickTrackingSettings();
      default:
        return null;
    }
  };
  const renderSurveySettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Questions
        </label>
        <div className="space-y-3">
          {(editedTask?.settings?.questions as SurveyQuestion[] || []).map((question: SurveyQuestion, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <input
                  type="text"
                  value={question.question || ''}
                  onChange={(e) => {
                    const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
                    questions[index] = { ...question, question: e.target.value };
                    updateTaskSettings('questions', questions);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter question"
                />
                <button
                  onClick={() => {
                    const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
                    questions.splice(index, 1);
                    updateTaskSettings('questions', questions);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Question Type</label>
                  <select
                    value={question.type || 'text'}
                    onChange={(e) => {
                      const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
                      questions[index] = { ...question, type: e.target.value as SurveyQuestion['type'] };
                      updateTaskSettings('questions', questions);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="text">Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="rating">Rating Scale</option>
                    <option value="boolean">Yes/No</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={question.required || false}
                      onChange={(e) => {
                        const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
                        questions[index] = { ...question, required: e.target.checked };
                        updateTaskSettings('questions', questions);
                      }}
                      className="mr-1"
                    />
                    Required
                  </label>
                </div>
              </div>

              {/* Multiple Choice Options */}
              {question.type === 'multiple_choice' && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-2">Answer Options (2-4 options)</label>
                  <div className="space-y-2">
                    {(question.options || ['', '']).map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
                            const options = [...(question.options || ['', ''])];
                            options[optionIndex] = e.target.value;
                            questions[index] = { ...question, options };
                            updateTaskSettings('questions', questions);
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        {(question.options || []).length > 2 && (
                          <button
                            onClick={() => {
                              const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
                              const options = [...(question.options || [])];
                              options.splice(optionIndex, 1);
                              questions[index] = { ...question, options };
                              updateTaskSettings('questions', questions);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {(question.options || []).length < 4 && (
                      <button
                        onClick={() => {
                          const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
                          const options = [...(question.options || ['', ''])];
                          options.push('');
                          questions[index] = { ...question, options };
                          updateTaskSettings('questions', questions);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button
            onClick={() => {
              const questions = [...(editedTask?.settings?.questions as SurveyQuestion[] || [])];
              questions.push({ question: '', type: 'text', required: false });
              updateTaskSettings('questions', questions);
            }}
            className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
          >
            + Add Question
          </button>
        </div>
      </div>
    </div>
  );

  const renderInterviewSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform
        </label>
        <select
          value={editedTask?.settings?.platform as string || 'zoom'}
          onChange={(e) => updateTaskSettings('platform', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
        >
          <option value="zoom">Zoom</option>
          <option value="google-meet">Google Meet</option>
          <option value="teams">Microsoft Teams</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions for Participant
        </label>
        <textarea
          value={editedTask?.settings?.instructions as string || ''}
          onChange={(e) => updateTaskSettings('instructions', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          placeholder="Instructions for the interview session"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedTask?.settings?.recordingEnabled as boolean || false}
              onChange={(e) => updateTaskSettings('recordingEnabled', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Enable Recording</span>
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedTask?.settings?.transcriptionEnabled as boolean || false}
              onChange={(e) => updateTaskSettings('transcriptionEnabled', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Enable Transcription</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNavigationSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target URL *
        </label>
        <input
          type="url"
          value={editedTask?.settings?.url as string || ''}
          onChange={(e) => updateTaskSettings('url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          placeholder="https://example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={editedTask?.settings?.instructions as string || ''}
          onChange={(e) => updateTaskSettings('instructions', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          placeholder="What should participants do on the website?"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Limit (minutes)
        </label>
        <input
          type="number"
          value={editedTask?.settings?.timeLimit as number || 10}
          onChange={(e) => updateTaskSettings('timeLimit', parseInt(e.target.value) || 10)}
          min="1"
          max="60"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );

  const renderClickTrackingSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target URL *
        </label>
        <input
          type="url"
          value={editedTask?.settings?.targetUrl as string || ''}
          onChange={(e) => updateTaskSettings('targetUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          placeholder="https://example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={editedTask?.settings?.instructions as string || ''}
          onChange={(e) => updateTaskSettings('instructions', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          placeholder="What should participants click or interact with?"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Clicks Required
          </label>
          <input
            type="number"
            value={editedTask?.settings?.minClicks as number || 5}
            onChange={(e) => updateTaskSettings('minClicks', parseInt(e.target.value) || 5)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            value={editedTask?.settings?.timeLimit as number || 10}
            onChange={(e) => updateTaskSettings('timeLimit', parseInt(e.target.value) || 10)}
            min="1"
            max="30"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Tracking Options</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedTask?.settings?.trackClicks as boolean ?? true}
              onChange={(e) => updateTaskSettings('trackClicks', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Track Clicks</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedTask?.settings?.trackHovers as boolean || false}
              onChange={(e) => updateTaskSettings('trackHovers', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Track Mouse Hovers</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedTask?.settings?.trackScrolling as boolean || false}
              onChange={(e) => updateTaskSettings('trackScrolling', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Track Scrolling</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
              <p className="text-sm text-gray-600">Customize task settings and details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              value={editedTask.name}
              onChange={(e) => updateTask('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter task name"
            />
          </div>          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description *
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) => updateTask('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe what participants will do"
            />
          </div>

          {/* Task-Specific Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Task Configuration
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {renderTaskSpecificSettings()}
            </div>
          </div>

          {/* Task Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Task Settings
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Required Task</span>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow Skip</span>
                  <input
                    type="checkbox"
                    checked={editedTask.settings?.allowSkip as boolean || false}
                    onChange={(e) => updateTask('settings', { 
                      ...editedTask.settings, 
                      allowSkip: e.target.checked 
                    })}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Time Limit</span>
                  <input
                    type="checkbox"
                    checked={editedTask.settings?.hasTimeLimit as boolean || false}
                    onChange={(e) => updateTask('settings', { 
                      ...editedTask.settings, 
                      hasTimeLimit: e.target.checked 
                    })}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Task Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">ℹ</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Task Template</h4>
                <p className="text-sm text-blue-700">
                  Based on template: <span className="font-medium">{editedTask.template_id}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Position in study: #{editedTask.order_index + 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
