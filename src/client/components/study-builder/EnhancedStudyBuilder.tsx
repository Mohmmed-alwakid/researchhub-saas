import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// TypeScript interfaces
interface StudyType {
  id: string;
  name: string;
  description: string;
  icon: string;
  min_tasks: number;
  max_tasks: number;
  recommended_duration: number;
  features: string[];
  recording_recommended: boolean;
  isValid?: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  estimated_duration: number;
  complexity_level: 'easy' | 'medium' | 'hard';
  estimatedDuration?: number;
  complexityLevel?: 'easy' | 'medium' | 'hard';
}

interface StudyTask {
  id: string;
  templateId: string;
  name: string;
  description: string;
  customInstructions: string;
  estimatedDuration: number;
  complexityLevel: 'easy' | 'medium' | 'hard';
  settings: Record<string, any>;
  validationRules: Record<string, any>;
  isRequired: boolean;
  order: number;
}

interface StudySettings {
  maxParticipants: number;
  estimatedDuration: number;
  compensation: number;
  recordScreen: boolean;
  recordAudio: boolean;
  recordWebcam: boolean;
  collectHeatmap: boolean;
  trackClicks: boolean;
  trackScrolling: boolean;
}

interface StudyData {
  title: string;
  description: string;
  type: string;
  tasks: StudyTask[];
  settings: StudySettings;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Sortable Task Item Component
interface SortableTaskItemProps {
  task: StudyTask;
  onEdit: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  validation: ValidationResult | null;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  onEdit,
  onRemove,
  validation
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isTaskValid = validation?.isValid !== false;
  const taskErrors = validation?.errors || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 border rounded-lg bg-white shadow-sm cursor-move hover:shadow-md transition-shadow ${
        !isTaskValid ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📋</span>
            <h4 className="font-medium text-gray-900">{task.name}</h4>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {task.estimatedDuration}min
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              task.complexityLevel === 'easy' ? 'bg-green-100 text-green-700' :
              task.complexityLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {task.complexityLevel}
            </span>
            {task.isRequired && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          {task.customInstructions && (
            <p className="text-xs text-gray-500 italic">{task.customInstructions}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(task.id)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={() => onRemove(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Remove task"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {taskErrors.length > 0 && (
        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm">
          {taskErrors.map((error: string, index: number) => (
            <div key={index} className="text-red-700">• {error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Enhanced Study Builder Component
const EnhancedStudyBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedStudyType, setSelectedStudyType] = useState<StudyType | null>(null);
  const [studyTypes, setStudyTypes] = useState<StudyType[]>([]);
  const [compatibleTasks, setCompatibleTasks] = useState<TaskTemplate[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  const [studyData, setStudyData] = useState<StudyData>({
    title: '',
    description: '',
    type: '',
    tasks: [],
    settings: {
      maxParticipants: 10,
      estimatedDuration: 30,
      compensation: 25,
      recordScreen: false,
      recordAudio: false,
      recordWebcam: false,
      collectHeatmap: false,
      trackClicks: false,
      trackScrolling: false
    }
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load study types on component mount
  useEffect(() => {
    loadStudyTypes();
  }, []);

  // Load compatible tasks when study type changes
  useEffect(() => {
    if (selectedStudyType) {
      loadCompatibleTasks();
    }
  }, [selectedStudyType]);

  // Validate study configuration when it changes
  useEffect(() => {
    if (selectedStudyType && studyData.tasks.length > 0) {
      validateStudyConfiguration();
    }
  }, [selectedStudyType, studyData.tasks]);

  const loadStudyTypes = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-study-builder?action=getStudyTypes');
      const result = await response.json();
      if (result.success) {
        setStudyTypes(result.studyTypes);
      }
    } catch (error) {
      console.error('Failed to load study types:', error);
    }
  };

  const loadCompatibleTasks = async (): Promise<void> => {
    if (!selectedStudyType) return;
    
    try {
      const response = await fetch(
        `/api/enhanced-study-builder?action=getCompatibleTasks&studyType=${selectedStudyType.id}&currentTasks=${encodeURIComponent(JSON.stringify(studyData.tasks))}`
      );
      const result = await response.json();
      if (result.success) {
        setCompatibleTasks(result.compatibleTasks);
      }
    } catch (error) {
      console.error('Failed to load compatible tasks:', error);
    }
  };

  const validateStudyConfiguration = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-study-builder?action=validateStudyConfiguration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyType: selectedStudyType?.id,
          tasks: studyData.tasks
        })
      });
      const result = await response.json();
      if (result.success) {
        setValidation(result.validation);
      }
    } catch (error) {
      console.error('Failed to validate study:', error);
    }
  };

  const handleStudyTypeChange = (typeId: string): void => {
    const studyType = studyTypes.find((t: StudyType) => t.id === typeId);
    setSelectedStudyType(studyType || null);
    setStudyData(prev => ({
      ...prev,
      type: typeId,
      settings: {
        ...prev.settings,
        recordScreen: studyType?.recording_recommended || false,
        recordAudio: studyType?.recording_recommended || false,
        recordWebcam: studyType?.recording_recommended || false
      }
    }));
  };

  const addTaskFromTemplate = (taskTemplate: TaskTemplate): void => {
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      templateId: taskTemplate.id,
      name: taskTemplate.name,
      description: taskTemplate.description,
      customInstructions: '',
      estimatedDuration: taskTemplate.estimated_duration || taskTemplate.estimatedDuration || 5,
      complexityLevel: taskTemplate.complexity_level || taskTemplate.complexityLevel || 'medium',
      settings: {},
      validationRules: {},
      isRequired: false,
      order: studyData.tasks.length
    };

    setStudyData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const removeTask = (taskId: string): void => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks
        .filter((task: StudyTask) => task.id !== taskId)
        .map((task: StudyTask, index: number) => ({ ...task, order: index }))
    }));
  };

  const editTask = (taskId: string): void => {
    const task = studyData.tasks.find((t: StudyTask) => t.id === taskId);
    if (task) {
      setEditingTask(task);
    }
  };

  const updateTask = (taskId: string, updates: Partial<StudyTask>): void => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task: StudyTask) => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStudyData(prev => {
        const oldIndex = prev.tasks.findIndex((task: StudyTask) => task.id === active.id);
        const newIndex = prev.tasks.findIndex((task: StudyTask) => task.id === over.id);
        
        const newTasks = arrayMove(prev.tasks, oldIndex, newIndex);
        return {
          ...prev,
          tasks: newTasks.map((task: StudyTask, index: number) => ({ ...task, order: index }))
        };
      });
    }
  };

  // Calculate total estimated duration
  const totalDuration = studyData.tasks.reduce(
    (total: number, task: StudyTask) => total + task.estimatedDuration,
    0
  );

  // Check if study type allows more tasks
  const canAddMoreTasks = selectedStudyType ? 
    studyData.tasks.length < selectedStudyType.max_tasks : false;

  const isStudyValid = validation?.isValid && 
    studyData.tasks.length >= (selectedStudyType?.min_tasks || 1);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Study Builder</h1>
        <p className="text-gray-600">Create comprehensive user research studies with advanced task management</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Study Type Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Choose Study Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyTypes.map((studyType: StudyType) => (
              <div
                key={studyType.id}
                onClick={() => handleStudyTypeChange(studyType.id)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedStudyType?.id === studyType.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{studyType.icon}</span>
                  <h3 className="font-semibold text-gray-900">{studyType.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{studyType.description}</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>Tasks: {studyType.min_tasks}-{studyType.max_tasks}</div>
                  <div>Duration: ~{studyType.recommended_duration} minutes</div>
                  <div className="flex flex-wrap gap-1">
                    {studyType.features?.map((feature: string) => (
                      <span key={feature} className="px-2 py-1 bg-gray-100 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                {studyType.recording_recommended && (
                  <div className="mt-2 text-xs text-blue-600">
                    📹 Recording recommended
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedStudyType}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Continue to Tasks
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Task Selection and Management */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Select Tasks</h2>
            <div className="text-sm text-gray-600">
              {studyData.tasks.length} of {selectedStudyType?.max_tasks} tasks selected
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Tasks */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Available Task Templates</h3>
              {selectedStudyType && studyData.tasks.length >= selectedStudyType.max_tasks && (
                <div className="p-3 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                  Maximum {selectedStudyType.max_tasks} tasks reached for {selectedStudyType.name}
                </div>
              )}
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {compatibleTasks.map((template: TaskTemplate) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{template.icon}</span>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {template.estimated_duration || template.estimatedDuration}min
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            (template.complexity_level || template.complexityLevel) === 'easy' ? 'bg-green-100 text-green-700' :
                            (template.complexity_level || template.complexityLevel) === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {template.complexity_level || template.complexityLevel}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => addTaskFromTemplate(template)}
                        disabled={!canAddMoreTasks}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Tasks */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Selected Tasks</h3>
              {studyData.tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No tasks selected yet. Choose from available templates.
                </div>
              ) : (
                <div className="space-y-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={studyData.tasks.map((task: StudyTask) => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {studyData.tasks
                        .sort((a: StudyTask, b: StudyTask) => a.order - b.order)
                        .map((task: StudyTask) => (
                          <SortableTaskItem
                            key={task.id}
                            task={task}
                            onEdit={editTask}
                            onRemove={removeTask}
                            validation={validation}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Task Summary */}
              {studyData.tasks.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Task Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Total tasks: {studyData.tasks.length}</div>
                    <div>Estimated duration: {totalDuration} minutes</div>
                    <div className={`${
                      isStudyValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Status: {isStudyValid ? 'Valid configuration' : 'Invalid configuration'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Feedback */}
          {validation && !validation.isValid && validation.errors && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Configuration Issues</h4>
              {validation.errors.map((error: string, index: number) => (
                <div key={index} className="text-sm text-red-700">• {error}</div>
              ))}
            </div>
          )}

          {validation && validation.warnings && validation.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
              {validation.warnings.map((warning: string, index: number) => (
                <div key={index} className="text-sm text-yellow-700">• {warning}</div>
              ))}
            </div>
          )}

          {validation && validation.suggestions && validation.suggestions.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Suggestions</h4>
              {validation.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="text-sm text-blue-700">• {suggestion}</div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Study Type
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!isStudyValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Continue to Settings
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Study Configuration */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Study Configuration</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study Title
                </label>
                <input
                  type="text"
                  value={studyData.title}
                  onChange={(e) => setStudyData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter study title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={studyData.description}
                  onChange={(e) => setStudyData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the purpose and goals of your study"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Participants
                </label>
                <input
                  type="number"
                  value={studyData.settings.maxParticipants}
                  onChange={(e) => setStudyData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, maxParticipants: parseInt(e.target.value) || 0 }
                  }))}
                  min="1"
                  max="1000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  value={studyData.settings.estimatedDuration}
                  onChange={(e) => setStudyData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, estimatedDuration: parseInt(e.target.value) || 0 }
                  }))}
                  min="5"
                  max="120"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calculated from tasks: {totalDuration} minutes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compensation ($)
                </label>
                <input
                  type="number"
                  value={studyData.settings.compensation}
                  onChange={(e) => setStudyData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, compensation: parseFloat(e.target.value) || 0 }
                  }))}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Recording Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recording Options</h3>
              
              {selectedStudyType?.recording_recommended && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  📹 Recording is recommended for {selectedStudyType.name} studies
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.recordScreen}
                    onChange={(e) => setStudyData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, recordScreen: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Record Screen</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.recordAudio}
                    onChange={(e) => setStudyData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, recordAudio: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Record Audio</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.recordWebcam}
                    onChange={(e) => setStudyData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, recordWebcam: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Record Webcam</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.collectHeatmap}
                    onChange={(e) => setStudyData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, collectHeatmap: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Collect Heatmap Data</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.trackClicks}
                    onChange={(e) => setStudyData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, trackClicks: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Track Clicks</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.trackScrolling}
                    onChange={(e) => setStudyData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, trackScrolling: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Track Scrolling</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Tasks
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!studyData.title || !studyData.description}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Review & Create
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review and Create */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Review & Create Study</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Study Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Title:</strong> {studyData.title}</div>
                  <div><strong>Type:</strong> {selectedStudyType?.name}</div>
                  <div><strong>Tasks:</strong> {studyData.tasks.length}</div>
                  <div><strong>Estimated Duration:</strong> {totalDuration} minutes</div>
                  <div><strong>Max Participants:</strong> {studyData.settings.maxParticipants}</div>
                  <div><strong>Compensation:</strong> ${studyData.settings.compensation}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recording Options</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Screen Recording: {studyData.settings.recordScreen ? '✅ Yes' : '❌ No'}</div>
                  <div>Audio Recording: {studyData.settings.recordAudio ? '✅ Yes' : '❌ No'}</div>
                  <div>Webcam Recording: {studyData.settings.recordWebcam ? '✅ Yes' : '❌ No'}</div>
                  <div>Heatmap Tracking: {studyData.settings.collectHeatmap ? '✅ Yes' : '❌ No'}</div>
                  <div>Click Tracking: {studyData.settings.trackClicks ? '✅ Yes' : '❌ No'}</div>
                  <div>Scroll Tracking: {studyData.settings.trackScrolling ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Task Sequence ({studyData.tasks.length} tasks)
            </h3>
            <div className="space-y-3">
              {studyData.tasks
                .sort((a: StudyTask, b: StudyTask) => a.order - b.order)
                .map((task: StudyTask, index: number) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                    <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{task.name}</div>
                      <div className="text-sm text-gray-600">
                        {task.estimatedDuration} min • {task.complexityLevel}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      validation?.isValid !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {validation?.isValid !== false ? 'Valid' : 'Issues'}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Final validation */}
          {validation && !validation.isValid && validation.errors && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Please fix these issues before creating:</h4>
              {validation.errors.map((error: string, index: number) => (
                <div key={index} className="text-sm text-red-700">• {error}</div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Settings
            </button>
            <button
              onClick={() => {
                // Handle study creation
                console.log('Creating study:', studyData);
              }}
              disabled={!validation?.isValid}
              className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
            >
              Create Study
            </button>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={(updatedTask: StudyTask) => {
            updateTask(editingTask.id, updatedTask);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

// Task Edit Modal Component
interface TaskEditModalProps {
  task: StudyTask;
  onSave: (task: StudyTask) => void;
  onClose: () => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState<StudyTask>(task);

  const handleSave = (): void => {
    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              value={editedTask.name}
              onChange={(e) => setEditedTask(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Instructions
            </label>
            <textarea
              value={editedTask.customInstructions}
              onChange={(e) => setEditedTask(prev => ({ ...prev, customInstructions: e.target.value }))}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add specific instructions for this task"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={editedTask.estimatedDuration}
                onChange={(e) => setEditedTask(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                min="1"
                max="60"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complexity Level
              </label>
              <select
                value={editedTask.complexityLevel}
                onChange={(e) => setEditedTask(prev => ({ ...prev, complexityLevel: e.target.value as 'easy' | 'medium' | 'hard' }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editedTask.isRequired}
                onChange={(e) => setEditedTask(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Required Task</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudyBuilder;