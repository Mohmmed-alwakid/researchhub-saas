import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Eye,
  Settings,
  Users,
  Play
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import toast from 'react-hot-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().min(1, 'Task description is required'),
  type: z.enum(['navigation', 'interaction', 'feedback', 'questionnaire']),
  order: z.number(),
  settings: z.record(z.any()).optional()
});

const studySchema = z.object({
  title: z.string().min(1, 'Study title is required'),
  description: z.string().min(1, 'Study description is required'),
  type: z.enum(['usability', 'interview', 'survey', 'prototype']),
  tasks: z.array(taskSchema),
  settings: z.object({
    maxParticipants: z.number().min(1, 'At least 1 participant required').max(1000),
    duration: z.number().min(5, 'Minimum 5 minutes').max(240, 'Maximum 4 hours'),
    compensation: z.number().min(0),
    recordScreen: z.boolean(),
    recordAudio: z.boolean(),
    collectHeatmaps: z.boolean()
  })
});

type StudyFormData = z.infer<typeof studySchema>;

const StudyBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { createStudy } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'usability',
      tasks: [{
        title: '',
        description: '',
        type: 'navigation',
        order: 0,
        settings: {}
      }],
      settings: {
        maxParticipants: 10,
        duration: 30,
        compensation: 25,
        recordScreen: true,
        recordAudio: false,
        collectHeatmaps: true
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks'
  });

  const watchedType = watch('type');
  const watchedTasks = watch('tasks');

  const steps = [
    { id: 0, title: 'Basic Info', icon: Settings },
    { id: 1, title: 'Tasks', icon: Play },
    { id: 2, title: 'Settings', icon: Users },
    { id: 3, title: 'Review', icon: Eye }
  ];

  const addTask = () => {
    append({
      title: '',
      description: '',
      type: 'navigation',
      order: fields.length,
      settings: {}
    });
  };

  const removeTask = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Update order of remaining tasks
      fields.forEach((_, i) => {
        if (i > index) {
          setValue(`tasks.${i - 1}.order`, i - 1);
        }
      });
    }  };

  // const _moveTask = (fromIndex: number, toIndex: number) => {
  //   move(fromIndex, toIndex);
  //   // Update order after moving
  //   const tasks = watchedTasks;
  //   tasks.forEach((_, i) => {
  //     setValue(`tasks.${i}.order`, i);
  //   });
  // };

  const onSubmit = async (data: StudyFormData) => {
    setIsSubmitting(true);
    try {
      await createStudy({
        ...data,
        status: 'draft'
      });
      
      toast.success('Study created successfully!');
      navigate('/studies');
    } catch (error) {
      console.error('Failed to create study:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Title *
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="Enter a descriptive title for your study"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe what participants will be doing and what you hope to learn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'usability', label: 'Usability Test', desc: 'Test how users interact with your product', icon: '🖥️' },
                  { value: 'interview', label: 'User Interview', desc: 'Conduct structured interviews with users', icon: '🎤' },
                  { value: 'survey', label: 'Survey', desc: 'Collect quantitative feedback from users', icon: '📋' },
                  { value: 'prototype', label: 'Prototype Test', desc: 'Test early versions of your design', icon: '🎨' }
                ].map((type) => (
                  <label key={type.value} className="relative">
                    <input
                      {...register('type')}
                      type="radio"
                      value={type.value}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watchedType === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{type.icon}</span>
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{type.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Study Tasks</h3>
                <p className="text-gray-600">Define what participants will do during the study</p>
              </div>
              <button
                type="button"
                onClick={addTask}
                className="inline-flex items-center px-3 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <GripVertical className="w-4 h-4 text-gray-400 mr-2 cursor-move" />
                      <span className="font-medium text-gray-900">Task {index + 1}</span>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title *
                      </label>
                      <input
                        {...register(`tasks.${index}.title`)}
                        type="text"
                        placeholder="e.g., Find and add a product to cart"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.tasks?.[index]?.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.tasks[index]?.title?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Type
                      </label>
                      <select
                        {...register(`tasks.${index}.type`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="navigation">Navigation</option>
                        <option value="interaction">Interaction</option>
                        <option value="feedback">Feedback</option>
                        <option value="questionnaire">Questionnaire</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Description *
                    </label>
                    <textarea
                      {...register(`tasks.${index}.description`)}
                      rows={3}
                      placeholder="Provide detailed instructions for this task"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.tasks?.[index]?.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.tasks[index]?.description?.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Study Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Participants *
                  </label>
                  <input
                    {...register('settings.maxParticipants', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.settings?.maxParticipants && (
                    <p className="mt-1 text-sm text-red-600">{errors.settings.maxParticipants.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Duration (minutes) *
                  </label>
                  <input
                    {...register('settings.duration', { valueAsNumber: true })}
                    type="number"
                    min="5"
                    max="240"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.settings?.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.settings.duration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compensation ($)
                  </label>
                  <input
                    {...register('settings.compensation', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Recording Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      {...register('settings.recordScreen')}
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Record screen during sessions</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      {...register('settings.recordAudio')}
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Record audio during sessions</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      {...register('settings.collectHeatmaps')}
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Collect heatmap data</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Study</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Title:</dt>
                      <dd className="font-medium">{watch('title') || 'Untitled Study'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Type:</dt>
                      <dd className="font-medium capitalize">{watch('type')}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Description:</dt>
                      <dd className="font-medium">{watch('description') || 'No description'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Settings</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Participants:</dt>
                      <dd className="font-medium">{watch('settings.maxParticipants')}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Duration:</dt>
                      <dd className="font-medium">{watch('settings.duration')} minutes</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Compensation:</dt>
                      <dd className="font-medium">${watch('settings.compensation')}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Tasks ({watchedTasks.length})</h4>
                <div className="space-y-2">
                  {watchedTasks.map((task, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{task.title || `Task ${index + 1}`}</span>
                        <span className="text-xs text-gray-500 capitalize">{task.type}</span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/studies')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Create New Study</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/studies')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Creating...' : 'Create Study'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Creating...' : 'Create Study'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudyBuilderPage;
