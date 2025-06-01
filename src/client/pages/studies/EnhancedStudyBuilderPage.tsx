import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Eye,
  Settings,
  Users,
  Play,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { DragDropStudyBuilder, type StudyTask } from '../../components/studies/DragDropStudyBuilder';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const studySchema = z.object({
  title: z.string().min(1, 'Study title is required'),
  description: z.string().min(1, 'Study description is required'),
  type: z.enum(['usability', 'interview', 'survey', 'prototype']),
  settings: z.object({
    maxParticipants: z.number().min(1, 'At least 1 participant required').max(1000),
    duration: z.number().min(5, 'Minimum 5 minutes').max(240, 'Maximum 4 hours'),
    compensation: z.number().min(0),
    recordScreen: z.boolean(),
    recordAudio: z.boolean(),
    recordWebcam: z.boolean(),
    collectHeatmaps: z.boolean(),
    trackClicks: z.boolean(),
    trackScrolls: z.boolean()
  })
});

type StudyFormData = z.infer<typeof studySchema>;

const EnhancedStudyBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { createStudy } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'usability',
      settings: {
        maxParticipants: 10,
        duration: 30,
        compensation: 25,
        recordScreen: true,
        recordAudio: false,
        recordWebcam: false,
        collectHeatmaps: true,
        trackClicks: true,
        trackScrolls: true
      }
    }
  });

  const watchedType = watch('type');
  const watchedTitle = watch('title');
  const watchedDescription = watch('description');

  const steps = [
    { id: 0, title: 'Basic Info', icon: Settings, description: 'Study details and type' },
    { id: 1, title: 'Study Flow', icon: Play, description: 'Design task sequence' },
    { id: 2, title: 'Settings', icon: Users, description: 'Recording and participant settings' },
    { id: 3, title: 'Review', icon: Eye, description: 'Final review and launch' }
  ];

  const handleTasksChange = useCallback((tasks: StudyTask[]) => {
    setStudyTasks(tasks);
  }, []);

  const onSubmit = async (data: StudyFormData) => {
    if (studyTasks.length === 0) {
      toast.error('Please add at least one task to your study');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert StudyTask[] to the format expected by the API
      const tasksForAPI = studyTasks.map((task, index) => ({
        title: task.title,
        description: task.description,
        type: task.type as 'navigation' | 'interaction' | 'feedback' | 'questionnaire',
        order: index,
        configuration: task.configuration,
        isRequired: task.isRequired,
        successCriteria: task.successCriteria || [],
        timeLimit: task.timeLimit
      }));

      await createStudy({
        ...data,
        tasks: tasksForAPI,
        status: 'draft'
      });

      toast.success('Study created successfully!');
      navigate('/app/studies');
    } catch (error) {
      console.error('Failed to create study:', error);
      toast.error('Failed to create study. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0:
        return watchedTitle && watchedDescription && watchedType;
      case 1:
        return studyTasks.length > 0;
      case 2:
        return true;
      case 3:
        return true; // All validation for review step should already be complete
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tell us about your study
              </h2>
              <p className="text-gray-600">
                Start by providing basic information about your research study
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g., Mobile App Usability Study"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe what participants will be doing and what you hope to learn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Study Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      value: 'usability', 
                      label: 'Usability Test', 
                      desc: 'Test how users interact with your product or website', 
                      icon: '🖥️',
                      color: 'bg-blue-50 border-blue-200 text-blue-700'
                    },
                    { 
                      value: 'interview', 
                      label: 'User Interview', 
                      desc: 'Conduct structured interviews to gather insights', 
                      icon: '🎤',
                      color: 'bg-green-50 border-green-200 text-green-700'
                    },
                    { 
                      value: 'survey', 
                      label: 'Survey Research', 
                      desc: 'Collect quantitative feedback from participants', 
                      icon: '📋',
                      color: 'bg-purple-50 border-purple-200 text-purple-700'
                    },
                    { 
                      value: 'prototype', 
                      label: 'Prototype Test', 
                      desc: 'Test early versions of your design or concept', 
                      icon: '🎨',
                      color: 'bg-orange-50 border-orange-200 text-orange-700'
                    }
                  ].map((type) => (
                    <label key={type.value} className="relative cursor-pointer">
                      <input
                        {...register('type')}
                        type="radio"
                        value={type.value}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                        watchedType === type.value
                          ? `${type.color} border-current`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}>
                        <div className="flex items-start">
                          <span className="text-3xl mr-4">{type.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                            <p className="text-sm text-gray-600">{type.desc}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Design your study flow
              </h2>
              <p className="text-gray-600">
                Add and arrange tasks that participants will complete during the study
              </p>
            </div>

            <DragDropStudyBuilder
              onTasksChange={handleTasksChange}
              initialTasks={studyTasks}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configure study settings
              </h2>
              <p className="text-gray-600">
                Set up recording options and participant requirements
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Participant Settings */}
                <Card variant="elevated">
                  <CardHeader title="Participant Settings" subtitle="Configure participant requirements" />
                  <CardContent className="space-y-4">
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
                        Study Duration (minutes) *
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
                        Compensation (USD) *
                      </label>
                      <input
                        {...register('settings.compensation', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.settings?.compensation && (
                        <p className="mt-1 text-sm text-red-600">{errors.settings.compensation.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recording Settings */}
                <Card variant="elevated">
                  <CardHeader title="Recording Options" subtitle="Choose what data to collect" />
                  <CardContent className="space-y-4">
                    {[
                      { key: 'recordScreen', label: 'Screen Recording', desc: 'Record participant screen activity' },
                      { key: 'recordAudio', label: 'Audio Recording', desc: 'Record participant voice/think-aloud' },
                      { key: 'recordWebcam', label: 'Webcam Recording', desc: 'Record participant facial expressions' },
                      { key: 'collectHeatmaps', label: 'Heatmap Data', desc: 'Track mouse movements and clicks' },
                      { key: 'trackClicks', label: 'Click Tracking', desc: 'Log all click interactions' },
                      { key: 'trackScrolls', label: 'Scroll Tracking', desc: 'Monitor scrolling behavior' }
                    ].map(({ key, label, desc }) => (                      <div key={key} className="flex items-start space-x-3">
                        <input
                          {...register(`settings.${key}` as `settings.${keyof StudyFormData['settings']}`)}
                          type="checkbox"
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900">{label}</label>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3: {
        const formData = watch();
        const totalEstimatedTime = studyTasks.reduce((total, task) => total + task.estimatedTime, 0);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review your study
              </h2>
              <p className="text-gray-600">
                Everything looks good? Let's create your study!
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Study Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <Card variant="elevated">
                    <CardHeader title="Study Overview" />
                    <CardContent>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Title</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900">{formData.title || 'Untitled Study'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-gray-900">{formData.description || 'No description'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Type</dt>
                          <dd className="mt-1 text-gray-900 capitalize">{formData.type}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card variant="elevated">
                    <CardHeader title="Study Tasks" subtitle={`${studyTasks.length} tasks configured`} />
                    <CardContent>
                      <div className="space-y-3">
                        {studyTasks.map((task) => (
                          <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-lg ${task.color} flex items-center justify-center mr-3`}>
                              <task.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{task.title}</span>
                                {task.isRequired && (
                                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              ~{task.estimatedTime} min
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Study Stats */}
                <div className="space-y-6">
                  <Card variant="glass">
                    <CardHeader title="Study Statistics" />
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{formData.settings.maxParticipants}</div>
                          <div className="text-sm text-blue-800">Max Participants</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{totalEstimatedTime}</div>
                          <div className="text-sm text-green-800">Est. Duration (min)</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">${formData.settings.compensation}</div>
                          <div className="text-sm text-purple-800">Compensation</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardHeader title="Recording Settings" />
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { key: 'recordScreen', label: 'Screen Recording' },
                          { key: 'recordAudio', label: 'Audio Recording' },
                          { key: 'recordWebcam', label: 'Webcam Recording' },
                          { key: 'collectHeatmaps', label: 'Heatmap Data' },
                          { key: 'trackClicks', label: 'Click Tracking' },
                          { key: 'trackScrolls', label: 'Scroll Tracking' }
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{label}</span>
                            {formData.settings[key as keyof typeof formData.settings] ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/app/studies')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Study</h1>
                <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Enhanced Builder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex space-x-8" aria-label="Progress">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isClickable = index <= currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && setCurrentStep(index)}
                  disabled={!isClickable}
                  className={`flex items-center space-x-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600'
                      : isCompleted
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-400'
                  } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <div>{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200/50">
            <div>
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNextStep()}
                  className="flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !canProceedToNextStep()}
                  className="flex items-center space-x-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create Study</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedStudyBuilderPage;
