import React, { useState } from 'react';
import { X, Save, Clock, Settings } from 'lucide-react';

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
  estimated_duration: number;
  order_index: number;
  settings?: Record<string, unknown>;
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

  const updateTask = (field: keyof StudyBuilderTask, value: any) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        [field]: value
      });
    }
  };

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
          </div>

          {/* Task Description */}
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

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline-block mr-1" />
              Estimated Duration (minutes) *
            </label>
            <input
              type="number"
              value={editedTask.estimated_duration}
              onChange={(e) => updateTask('estimated_duration', parseInt(e.target.value) || 0)}
              min="1"
              max="60"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter duration in minutes"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended: 3-15 minutes per task to maintain participant engagement
            </p>
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
