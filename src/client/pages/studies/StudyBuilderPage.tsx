import React, { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  CheckCircle,
  Plus
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { convertTasksToAPI, convertTasksToLegacy } from '../../utils/taskConversion';
import toast from 'react-hot-toast';

// Import our new UI/UX components
import { StudyBuilderProgress } from '../../components/studies/StudyBuilderProgress';
import { TaskLibraryModal } from '../../components/studies/TaskLibraryModal';
import { DragDropTaskList } from '../../components/studies/DragDropTaskList';
import { TaskEditModal } from '../../components/studies/TaskEditModal';
import { ValidationFeedback } from '../../components/studies/ValidationFeedback';
import type { ITask } from '../../../shared/types/index';
import { 
  validateStudyTitle, 
  validateStudyDescription, 
  validateTasks, 
  validateStudyDuration,
  createValidationResult,
  type ValidationResult 
} from '../../utils/validation';

// Lazy load the study builder integration component
const StudyBuilderIntegration = lazy(() => 
  import('../../components/studies/StudyBuilderIntegration').then(module => ({
    default: module.default
  }))
);

// Loading spinner for the study builder
const StudyBuilderLoading = () => (
  <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600">Loading Study Builder...</p>
    </div>
  </div>
);

// Types for the study builder integration
interface StudyBuilderTask {
  id: string;
  template_id: string;
  name: string;
  description: string;
  estimated_duration?: number; // Make optional since we're removing from UI
  order_index: number;
  settings?: Record<string, unknown>;
}

const studySchema = z.object({
  title: z.string().min(1, 'Study title is required'),
  description: z.string().min(1, 'Study description is required'),
  type: z.enum(['usability_test', 'user_interview', 'survey']),
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

// Helper function to map ITask types to template IDs
const getTemplateIdFromTaskType = (taskType: ITask['type']): string => {
  const typeToTemplateMap: Record<ITask['type'], string> = {
    'navigation': 'website_navigation',
    'interaction': 'prototype_testing',
    'questionnaire': 'questionnaire',
    'prototype-test': 'prototype_testing'
  };  return typeToTemplateMap[taskType] || 'prototype_testing';
};

// Helper function to convert StudyBuilderTask to DragDropTaskList Task interface
const convertToTaskListFormat = (builderTasks: StudyBuilderTask[]) => {
  return builderTasks.map(task => ({
    id: task.id,
    templateId: task.template_id,
    name: task.name,
    description: task.description,
    estimatedDuration: task.estimated_duration || 5, // Default to 5 minutes
    settings: task.settings || {},
    order: task.order_index,
    isRequired: (task.settings?.isRequired as boolean) ?? true,
    category: task.settings?.category as string,
    icon: task.settings?.icon as string
  }));
};

// Helper function to convert DragDropTaskList Task back to StudyBuilderTask
const convertFromTaskListFormat = (tasks: Array<{
  id: string;
  templateId: string;
  name: string;
  description: string;
  estimatedDuration: number;
  settings: Record<string, unknown>;
  order: number;
  isRequired: boolean;
  category?: string;
  icon?: string;
}>): StudyBuilderTask[] => {
  return tasks.map(task => ({
    id: task.id,
    template_id: task.templateId,
    name: task.name,
    description: task.description,
    estimated_duration: task.estimatedDuration,
    order_index: task.order,
    settings: {
      ...task.settings,
      isRequired: task.isRequired,
      category: task.category,
      icon: task.icon
    }
  }));
};

const EnhancedStudyBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { createStudy, updateStudy } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [studyTasks, setStudyTasks] = useState<StudyBuilderTask[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudy, setEditingStudy] = useState<{title?: string; description?: string} | null>(null); // Store the study being edited
  
  // New state for enhanced UI components
  const [showTaskLibrary, setShowTaskLibrary] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<StudyBuilderTask | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [], 
    warnings: [], 
    suggestions: [] 
  });

  // Get template data from navigation state
  const templateData = location.state?.template;const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors }  } = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      title: templateData?.name || '',
      description: templateData?.description || '',
      type: templateData?.type === 'usability' ? 'usability_test' : 'usability_test',
      settings: {
        maxParticipants: templateData?.participantCount || 10,
        duration: templateData?.estimatedDuration || 30,
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
  const watchedSettings = watch('settings');
  // Load existing study data when editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setIsLoading(true);
        // Make direct API call to get study data
      const fetchStudyData = async () => {
        try {
          // Get token from Zustand auth storage (same as api.service.ts)
          let token = null;
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            try {
              const { state } = JSON.parse(authStorage);
              token = state?.token;
            } catch (error) {
              console.warn('Failed to parse auth storage:', error);
            }
          }
          
          const response = await fetch(`/api/studies/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch study data');
          }
          
          const data = await response.json();
          const existingStudy = data.study;
          
          // Map the study type back to the form format
          const studyType = existingStudy.type === 'usability' ? 'usability_test' :
                           existingStudy.type === 'interview' ? 'user_interview' : 'survey';          // Debug logging before reset
          console.log('🔍 DEBUG: About to reset form with existing study data:');
          console.log('  - Title:', existingStudy.title);
          console.log('  - Description:', existingStudy.description);
          console.log('  - Type:', studyType);
          console.log('  - Full existingStudy object:', existingStudy);
          
          const resetData = {
            title: existingStudy.title || '', // Ensure empty string instead of undefined
            description: existingStudy.description || '', // Ensure empty string instead of undefined
            type: studyType as 'usability_test' | 'user_interview' | 'survey',
            settings: {
              maxParticipants: existingStudy.settings?.maxParticipants || 10,
              duration: existingStudy.settings?.duration || 30,
              compensation: existingStudy.settings?.compensation || 25,
              recordScreen: (existingStudy.settings?.recordScreen as boolean) ?? true,
              recordAudio: (existingStudy.settings?.recordAudio as boolean) ?? false,
              recordWebcam: (existingStudy.settings?.recordWebcam as boolean) ?? false,
              collectHeatmaps: (existingStudy.settings?.collectHeatmaps as boolean) ?? true,
              trackClicks: (existingStudy.settings?.trackClicks as boolean) ?? true,
              trackScrolls: (existingStudy.settings?.trackScrolls as boolean) ?? true
            }
          };
            console.log('🔍 DEBUG: Reset data object:', resetData);
          
          // Store the editing study for backup reference
          setEditingStudy(existingStudy);
          
          // Reset form with existing data
          reset(resetData);
          
          // Debug: Check form values after reset with multiple timing checks
          setTimeout(() => {
            const currentValues = getValues();
            console.log('🔍 DEBUG: Form values after reset (100ms):', currentValues);
            
            // If values are still empty, try resetting again
            if (!currentValues.title && resetData.title) {
              console.log('⚠️ DEBUG: Values still empty, trying to reset again...');
              reset(resetData);
              
              // Check again after second reset
              setTimeout(() => {
                const secondCheck = getValues();
                console.log('🔍 DEBUG: Form values after second reset (200ms):', secondCheck);
              }, 100);
            }
          }, 100);// Convert existing tasks to StudyBuilderTask format
          if (existingStudy.tasks && existingStudy.tasks.length > 0) {
            const convertedTasks: StudyBuilderTask[] = existingStudy.tasks
              .filter((task: ITask): task is ITask => typeof task === 'object' && task !== null)
              .map((task: ITask, index: number) => ({
                id: task._id || `task_${index}`,
                template_id: getTemplateIdFromTaskType(task.type),
                name: task.title || 'Untitled Task',
                description: task.description || '',
                order_index: task.order || index + 1,
                settings: (task.configuration as unknown as Record<string, unknown>) || {}
              }));
            setStudyTasks(convertedTasks);
          }
          
          // Start on the tasks step for editing
          setCurrentStep(1);
        } catch (error) {
          console.error('Error loading study data:', error);
          toast.error('Failed to load study data');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchStudyData();
    }
  }, [id, reset, getValues]);

  // Initialize form with template data when available
  useEffect(() => {
    if (templateData && !id) {
      // Reset form with template data
      reset({
        title: templateData.name || '',
        description: templateData.description || '',
        type: templateData.type === 'usability' ? 'usability_test' : 'usability_test',
        settings: {
          maxParticipants: templateData.participantCount || 10,
          duration: templateData.estimatedDuration || 30,
          compensation: 25,
          recordScreen: true,
          recordAudio: false,
          recordWebcam: false,
          collectHeatmaps: true,
          trackClicks: true,
          trackScrolls: true
        }
      });      // Initialize tasks from template if available
      if (templateData.tasks && Array.isArray(templateData.tasks)) {        const initialTasks: StudyBuilderTask[] = templateData.tasks.map((task: ITask, index: number) => ({
          id: `task-${index + 1}`,
          template_id: getTemplateIdFromTaskType(task.type as ITask['type']),
          name: task.title,
          description: task.description,
          order_index: index,
          settings: {}
        }));
        setStudyTasks(initialTasks);
      }
    }
  }, [templateData, id, reset]);

  // Update validation when form data changes
  React.useEffect(() => {
    const titleErrors = validateStudyTitle(watchedTitle || '');
    const descriptionErrors = validateStudyDescription(watchedDescription || '');
    const taskErrors = validateTasks(studyTasks);
    const durationErrors = validateStudyDuration(watchedSettings?.duration || 0);

    const allErrors = [...titleErrors, ...descriptionErrors, ...taskErrors, ...durationErrors];
    const errors = allErrors.filter(e => e.type === 'error');
    const warnings = allErrors.filter(e => e.type === 'warning');
    const suggestions = allErrors.filter(e => e.type === 'info');

  setValidation(createValidationResult(errors, warnings, suggestions));
  }, [watchedTitle, watchedDescription, studyTasks, watchedSettings?.duration]);

  const steps = React.useMemo(() => [
    { id: 0, title: 'Basic Info', icon: Settings, description: 'Study details and type' },
    { id: 1, title: 'Study Flow', icon: Play, description: 'Design task sequence' },
    { id: 2, title: 'Settings', icon: Users, description: 'Recording and participant settings' },
    { id: 3, title: 'Review', icon: Eye, description: 'Final review and launch' }
  ], []);
  
  // Handle tasks change from the new study builder
  const handleTasksChange = useCallback((newTasks: StudyBuilderTask[]) => {
    setStudyTasks(newTasks);
  }, []);
  // New handlers for enhanced UI components
  const handleAddTaskFromLibrary = useCallback((template: { id: string; name: string; description: string; estimatedDuration?: number; settings?: Record<string, unknown> }) => {
    const newTask: StudyBuilderTask = {
      id: `task_${Date.now()}`,      template_id: template.id,
      name: template.name,
      description: template.description,
      order_index: studyTasks.length + 1,
      settings: template.settings || {}
    };
    setStudyTasks(prev => [...prev, newTask]);
    setShowTaskLibrary(false);
    toast.success(`Added "${template.name}" to your study`);
  }, [studyTasks]);

  const handleSaveTask = useCallback(async (updatedTask: StudyBuilderTask) => {
    // Update local state
    const updatedTasks = studyTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setStudyTasks(updatedTasks);
    
    // If we're editing an existing study, save to backend immediately
    if (isEditing && id) {      try {
        // Convert tasks to legacy ITask format for backend
        const tasksForAPI = convertTasksToLegacy(updatedTasks);
        
        // Get current form data to include in the update
        const currentData = getValues();
        const legacyType = currentData.type === 'usability_test' ? 'usability' : 
                          currentData.type === 'user_interview' ? 'interview' : 'survey';

        // Update study with the new tasks - passing as ITask[] format
        await updateStudy(id, {
          title: currentData.title,
          description: currentData.description,
          type: legacyType as 'survey' | 'usability' | 'interview' | 'card-sorting' | 'a-b-testing',
          tasks: tasksForAPI,
          settings: currentData.settings,
          status: 'draft'
        });
      }catch (error) {
        console.error('Failed to save task changes:', error);
        toast.error('Failed to save task changes. Please try again.');
        return;
      }
    }
    
    setShowTaskEditModal(false);
    setTaskToEdit(null);
    toast.success('Task updated successfully');
  }, [studyTasks, isEditing, id, updateStudy, getValues]);const handleReorderTasks = useCallback((reorderedTasks: StudyBuilderTask[]) => {
    setStudyTasks(reorderedTasks);
  }, []);const handleEditTask = useCallback((task: StudyBuilderTask) => {
    setTaskToEdit(task);
    setShowTaskEditModal(true);
  }, []);

  const handleDuplicateTask = useCallback((task: StudyBuilderTask) => {
    const duplicatedTask: StudyBuilderTask = {
      ...task,
      id: `task_${Date.now()}`,
      name: `${task.name} (Copy)`,
      order_index: studyTasks.length + 1
    };
    setStudyTasks(prev => [...prev, duplicatedTask]);
    toast.success(`Duplicated "${task.name}"`);
  }, [studyTasks]);  const handleDeleteTask = useCallback((taskId: string) => {
    setStudyTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success('Task removed from study');
  }, []);

  // Get available recording options based on study type
  const getRecordingOptions = useCallback(() => {
    const allOptions = [
      { key: 'recordScreen', label: 'Screen Recording', desc: 'Record participant screen activity', studyTypes: ['usability_test'] },
      { key: 'recordAudio', label: 'Audio Recording', desc: 'Record participant voice/think-aloud', studyTypes: ['usability_test', 'user_interview'] },
      { key: 'recordWebcam', label: 'Webcam Recording', desc: 'Record participant facial expressions', studyTypes: ['user_interview'] },
      { key: 'collectHeatmaps', label: 'Heatmap Data', desc: 'Track mouse movements and clicks', studyTypes: ['usability_test'] },
      { key: 'trackClicks', label: 'Click Tracking', desc: 'Log all click interactions', studyTypes: ['usability_test'] },
      { key: 'trackScrolls', label: 'Scroll Tracking', desc: 'Monitor scrolling behavior', studyTypes: ['usability_test'] }
    ];

    return allOptions.filter(option => 
      option.studyTypes.includes(watchedType) || 
      watchedType === 'survey' && ['recordAudio'].includes(option.key) // Surveys only allow audio recording
    );
  }, [watchedType]);  const onSubmit = async (data: StudyFormData) => {
    if (studyTasks.length === 0) {
      toast.error('Please add at least one task to your study');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        // For editing, we need to include tasks when updating the study        // Convert StudyBuilderTask[] to the format expected by the API
        const tasksForAPI = convertTasksToLegacy(studyTasks);
        
        // Convert study type to legacy format
        const legacyType = data.type === 'usability_test' ? 'usability' : 
                          data.type === 'user_interview' ? 'interview' : 'survey';

        // Update study with all data including tasks
        await updateStudy(id, {
          title: data.title,
          description: data.description,
          type: legacyType as 'survey' | 'usability' | 'interview' | 'card-sorting' | 'a-b-testing',
          tasks: tasksForAPI,
          settings: data.settings,
          status: 'draft'
        });
        toast.success('Study updated successfully!');
      } else {
        // Convert StudyBuilderTask[] to the format expected by the legacy API
        const tasksForAPI = convertTasksToAPI(studyTasks);
        
        // Convert study type to legacy format
        const legacyType = data.type === 'usability_test' ? 'usability' : 
                          data.type === 'user_interview' ? 'interview' : 'survey';

        // Create new study
        await createStudy({
          ...data,
          type: legacyType as 'survey' | 'usability' | 'interview' | 'prototype',
          tasks: tasksForAPI,
          status: 'draft'
        });
        toast.success('Study created successfully!');
      }

      navigate('/app/studies');
    } catch (error) {
      console.error('Failed to save study:', error);
      toast.error(isEditing ? 'Failed to update study. Please try again.' : 'Failed to create study. Please try again.');
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

            <div className="max-w-2xl mx-auto space-y-6">              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Title *
                </label>                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g., Mobile App Usability Study"
                  defaultValue={editingStudy?.title || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                )}
                {watchedTitle && (
                  <ValidationFeedback
                    validation={{
                      isValid: validateStudyTitle(watchedTitle || '').length === 0,
                      errors: validateStudyTitle(watchedTitle || '').filter(e => e.type === 'error'),
                      warnings: validateStudyTitle(watchedTitle || '').filter(e => e.type === 'warning'),
                      suggestions: validateStudyTitle(watchedTitle || '').filter(e => e.type === 'info')
                    }}
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Description *
                </label>                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe what participants will be doing and what you hope to learn..."
                  defaultValue={editingStudy?.description || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
                {watchedDescription && (
                  <ValidationFeedback
                    validation={{
                      isValid: validateStudyDescription(watchedDescription || '').length === 0,
                      errors: validateStudyDescription(watchedDescription || '').filter(e => e.type === 'error'),
                      warnings: validateStudyDescription(watchedDescription || '').filter(e => e.type === 'warning'),
                      suggestions: validateStudyDescription(watchedDescription || '').filter(e => e.type === 'info')
                    }}
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Study Type *
                </label>                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      value: 'usability_test', 
                      label: 'Usability Test', 
                      desc: 'Test how users interact with your product or website', 
                      icon: '🖥️',
                      color: 'bg-blue-50 border-blue-200 text-blue-700'
                    },
                    { 
                      value: 'user_interview', 
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
        );      case 1:
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

            {/* Enhanced Task Management */}
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Task List */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Study Tasks</h3>
                    <Button
                      onClick={() => setShowTaskLibrary(true)}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </div>                  <DragDropTaskList
                    tasks={convertToTaskListFormat(studyTasks)}
                    onReorderTasks={(reorderedTasks) => {
                      const updatedTasks = reorderedTasks.map((task, index) => ({
                        id: task.id,
                        template_id: task.templateId,
                        name: task.name,
                        description: task.description,
                        estimated_duration: task.estimatedDuration,
                        order_index: index + 1,
                        settings: task.settings
                      }));
                      handleReorderTasks(updatedTasks);
                    }}
                    onEditTask={(task) => {
                      const studyTask: StudyBuilderTask = {
                        id: task.id,
                        template_id: task.templateId,
                        name: task.name,
                        description: task.description,
                        estimated_duration: task.estimatedDuration,
                        order_index: task.order,
                        settings: task.settings
                      };
                      handleEditTask(studyTask);
                    }}
                    onDuplicateTask={(task) => {
                      const studyTask: StudyBuilderTask = {
                        id: task.id,
                        template_id: task.templateId,
                        name: task.name,
                        description: task.description,
                        estimated_duration: task.estimatedDuration,
                        order_index: task.order,
                        settings: task.settings
                      };
                      handleDuplicateTask(studyTask);
                    }}
                    onDeleteTask={handleDeleteTask}
                    studyType={watchedType}
                  />
                </div>

                {/* Sidebar with Progress and Validation */}
                <div className="lg:w-80">
                  <div className="space-y-6">
                    {/* Validation Feedback */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Study Validation</h4>
                      <ValidationFeedback 
                        validation={validation}
                        showSuccessMessage={true}
                      />
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Start with essential tasks first</li>
                        <li>• Keep tasks focused and specific</li>
                        <li>• Consider task duration for participants</li>
                        <li>• Test the flow yourself first</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>            {/* Task Library Modal */}
            <TaskLibraryModal
              isOpen={showTaskLibrary}
              onClose={() => setShowTaskLibrary(false)}
              onAddTask={handleAddTaskFromLibrary}
              studyType={watchedType}              currentTasks={studyTasks.map(task => ({
                id: task.id,
                templateId: task.template_id,
                name: task.name,
                description: task.description,
                estimatedDuration: task.estimated_duration || 5, // Default to 5 minutes
                settings: task.settings || {},
                order: task.order_index,
                isRequired: true
              }))}
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
                </Card>                {/* Recording Settings */}
                <Card variant="elevated">
                  <CardHeader title="Recording Options" subtitle={`Choose what data to collect for ${watchedType.replace('_', ' ')}`} />
                  <CardContent className="space-y-4">
                    {/* Study type specific info */}
                    {watchedType === 'survey' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          📋 <strong>Survey studies</strong> focus on collecting structured responses. Limited recording options are available to maintain participant privacy.
                        </p>
                      </div>
                    )}
                    {watchedType === 'user_interview' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          🎤 <strong>User interviews</strong> benefit from audio and video recording to capture detailed insights and non-verbal cues.
                        </p>
                      </div>
                    )}
                    {watchedType === 'usability_test' && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm text-purple-800">
                          🖥️ <strong>Usability tests</strong> require comprehensive tracking to understand user behavior and interaction patterns.
                        </p>
                      </div>
                    )}
                    
                    {getRecordingOptions().map(({ key, label, desc }) => (<div key={key} className="flex items-start space-x-3">
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
        const totalEstimatedTime = studyTasks.reduce((total, task) => total + (task.estimated_duration || 5), 0);
        
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
                      <div className="space-y-3">                        {studyTasks.map((task) => (
                          <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mr-3">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{task.name}</span>
                                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  Required
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              ~{task.estimated_duration} min
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
              </button>            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Study' : 'Create New Study'}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {Math.round(((currentStep + 1) / steps.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Enhanced Builder</span>
            </div>
          </div>
        </div>
      </div>      {/* Progress Steps */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <StudyBuilderProgress
            currentStep={currentStep.toString()}
            studyData={{
              title: watchedTitle,
              description: watchedDescription,
              type: watchedType,
              tasks: studyTasks,
              settings: watchedSettings
            }}
            onStepClick={(stepId) => {
              const stepIndex = parseInt(stepId);
              if (stepIndex <= currentStep + 1) {
                setCurrentStep(stepIndex);
              }
            }}
          />
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
                >                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isEditing ? 'Update Study' : 'Create Study'}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>        </form>
      </div>      {/* Task Library Modal */}
      <TaskLibraryModal
        isOpen={showTaskLibrary}
        onClose={() => setShowTaskLibrary(false)}
        onAddTask={handleAddTaskFromLibrary}
        studyType={watchedType}
        currentTasks={convertToTaskListFormat(studyTasks)}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={showTaskEditModal}
        task={taskToEdit}
        onClose={() => {
          setShowTaskEditModal(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default EnhancedStudyBuilderPage;
