import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Clock, Target, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { type StudyTask } from './DragDropStudyBuilder';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

// Base configuration schema
const successCriteriaSchema = z.object({
  description: z.string().min(1, 'Success criteria cannot be empty'),
  type: z.enum(['completion', 'time', 'accuracy', 'custom']),
  value: z.string().optional()
});

const taskConfigSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().min(1, 'Task description is required'),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute').max(120),
  timeLimit: z.number().optional(),
  isRequired: z.boolean(),
  successCriteria: z.array(successCriteriaSchema).optional(),
  // Dynamic configuration object
  targetUrl: z.string().optional(),
  waitForElement: z.string().optional(),
  clickElement: z.string().optional(),
  feedbackType: z.string().optional(),
  question: z.string().optional(),
  prototypeUrl: z.string().optional(),
  prototypeType: z.string().optional(),
  heatmapDuration: z.number().optional(),
  trackClicks: z.boolean().optional(),
  trackMouseMovement: z.boolean().optional(),
  trackScrolling: z.boolean().optional(),
});

type TaskConfigFormData = z.infer<typeof taskConfigSchema>;

interface TaskConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: StudyTask | null;
  onSave: (updatedTask: StudyTask) => void;
}

export const TaskConfigurationModal: React.FC<TaskConfigurationModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'criteria'>('basic');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TaskConfigFormData>({
    resolver: zodResolver(taskConfigSchema),
  });

  const { fields: successCriteriaFields, append: addSuccessCriteria, remove: removeSuccessCriteria } = useFieldArray({
    control,
    name: 'successCriteria',
  });  // Initialize form with task data
  useEffect(() => {
    if (task) {
      // Convert old string array format to new object format if needed
      const formattedSuccessCriteria = task.successCriteria?.map(criteria => {
        if (typeof criteria === 'string') {
          return {
            description: criteria,
            type: 'completion' as const,
            value: ''
          };
        }
        return criteria;
      }) || [];

      reset({
        title: task.title,
        description: task.description,
        estimatedTime: task.estimatedTime,
        timeLimit: task.timeLimit,
        isRequired: task.isRequired,
        successCriteria: formattedSuccessCriteria,
        // Flatten configuration for form
        targetUrl: task.configuration?.targetUrl as string,
        waitForElement: task.configuration?.waitForElement as string,
        clickElement: task.configuration?.clickElement as string,
        feedbackType: task.configuration?.feedbackType as string,
        question: task.configuration?.question as string,
        prototypeUrl: task.configuration?.prototypeUrl as string,
        prototypeType: task.configuration?.prototypeType as string,
        heatmapDuration: task.configuration?.heatmapDuration as number,
        trackClicks: task.configuration?.trackClicks as boolean,
        trackMouseMovement: task.configuration?.trackMouseMovement as boolean,
        trackScrolling: task.configuration?.trackScrolling as boolean,
      });
    }
  }, [task, reset]);
  const onSubmit = (data: TaskConfigFormData) => {
    if (!task) return;

    // Extract configuration fields from form data
    const { title, description, estimatedTime, timeLimit, isRequired, successCriteria, ...configFields } = data;

    const updatedTask: StudyTask = {
      ...task,
      title,
      description,
      estimatedTime,
      timeLimit,
      isRequired,
      successCriteria: successCriteria || [],
      configuration: {
        ...task.configuration,
        ...configFields,
      },
    };

    onSave(updatedTask);
    toast.success('Task configuration saved successfully');
    onClose();
  };

  const renderBasicConfiguration = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            {...register('title')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Time (minutes) *
          </label>
          <input
            {...register('estimatedTime', { valueAsNumber: true })}
            type="number"
            min="1"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.estimatedTime && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedTime.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Description *
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            {...register('isRequired')}
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Required task (participants must complete this)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Limit (optional, minutes)
        </label>
        <input
          {...register('timeLimit', { valueAsNumber: true })}
          type="number"
          min="1"
          max="60"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Leave empty for no time limit
        </p>
      </div>
    </div>
  );

  const renderAdvancedConfiguration = () => {
    if (!task) return null;

    switch (task.type) {
      case 'navigation':
        return (
          <div className="space-y-6">            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target URL *
              </label>
              <input
                {...register('targetUrl')}
                type="url"
                placeholder="https://example.com/page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wait for Element (CSS Selector)
              </label>
              <input
                {...register('waitForElement')}
                type="text"
                placeholder=".navigation-menu, #header"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Task will wait for this element to appear before starting
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Click Element (CSS Selector)
              </label>
              <input
                {...register('clickElement')}
                type="text"
                placeholder=".button, #submit-btn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Element that participants should click to complete the task
              </p>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-6">            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Type *
              </label>
              <select
                {...register('feedbackType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="rating">Rating Scale</option>
                <option value="text">Text Response</option>
                <option value="choice">Multiple Choice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <textarea
                {...register('question')}
                rows={2}
                placeholder="How would you rate the ease of completing this task?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        );

      case 'prototype':
        return (
          <div className="space-y-6">            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prototype URL *
              </label>
              <input
                {...register('prototypeUrl')}
                type="url"
                placeholder="https://www.figma.com/proto/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prototype Type *
              </label>
              <select
                {...register('prototypeType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="figma">Figma</option>
                <option value="sketch">Sketch</option>
                <option value="invision">InVision</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className="space-y-6">            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target URL *
              </label>
              <input
                {...register('targetUrl')}
                type="url"
                placeholder="https://example.com/page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heatmap Duration (seconds)
              </label>
              <input
                {...register('heatmapDuration', { valueAsNumber: true })}
                type="number"
                min="30"
                max="600"
                defaultValue={120}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  {...register('trackClicks')}
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Track Click Events</label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('trackMouseMovement')}
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Track Mouse Movement</label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('trackScrolling')}
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Track Scrolling Behavior</label>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No advanced configuration available for this task type.</p>
          </div>
        );
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${task.color} flex items-center justify-center`}>
              <task.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configure Task</h2>
              <p className="text-sm text-gray-500 capitalize">{task.type} Task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Settings', icon: Clock },
              { id: 'advanced', label: 'Advanced Config', icon: Target },
              { id: 'criteria', label: 'Success Criteria', icon: AlertTriangle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'basic' && renderBasicConfiguration()}
            {activeTab === 'advanced' && renderAdvancedConfiguration()}            {activeTab === 'criteria' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Success Criteria
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Define what constitutes successful completion of this task
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => addSuccessCriteria({
                        description: '',
                        type: 'completion',
                        value: ''
                      })}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Criteria</span>
                    </Button>
                  </div>

                  {successCriteriaFields.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No success criteria defined</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Add Criteria" to define success metrics</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {successCriteriaFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Criteria Type
                                </label>
                                <select
                                  {...register(`successCriteria.${index}.type` as const)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="completion">Task Completion</option>
                                  <option value="time">Time-based</option>
                                  <option value="accuracy">Accuracy</option>
                                  <option value="custom">Custom</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Target Value (optional)
                                </label>
                                <input
                                  {...register(`successCriteria.${index}.value` as const)}
                                  type="text"
                                  placeholder="e.g., 90%, 2 minutes, etc."
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                {...register(`successCriteria.${index}.description` as const)}
                                rows={2}
                                placeholder="Describe what success looks like for this criteria..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              {errors.successCriteria?.[index]?.description && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.successCriteria[index]?.description?.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSuccessCriteria(index)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {successCriteriaFields.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Success Criteria Tips:</p>
                          <ul className="mt-1 space-y-1 text-xs">
                            <li>• Be specific and measurable</li>
                            <li>• Consider both completion and quality metrics</li>
                            <li>• Include time-based criteria for urgent tasks</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
