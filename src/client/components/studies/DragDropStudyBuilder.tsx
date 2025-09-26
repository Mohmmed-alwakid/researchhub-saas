import React, { useState, useCallback } from 'react';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Clock, 
  Target, 
  MessageSquare,
  MousePointer,
  Navigation,
  HelpCircle,
  Palette,
  Zap
} from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';

import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { TaskConfigurationModal } from './TaskConfigurationModal';

export interface TaskTemplate {
  id: string;
  type: 'navigation' | 'interaction' | 'feedback' | 'questionnaire' | 'prototype' | 'heatmap';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  estimatedTime: number;
  configuration: Record<string, unknown>;
}

export interface SuccessCriteria {
  description: string;
  type: 'completion' | 'time' | 'accuracy' | 'custom';
  value?: string;
}

export interface StudyTask extends TaskTemplate {
  order: number;
  isRequired: boolean;
  successCriteria?: (string | SuccessCriteria)[];
  timeLimit?: number;
}

// Task Templates
const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'navigation-1',
    type: 'navigation',
    title: 'Website Navigation',
    description: 'Navigate to a specific page or section',
    icon: Navigation,
    color: 'bg-blue-500',
    estimatedTime: 3,
    configuration: {
      startUrl: '',
      targetUrl: '',
      allowBackButton: true,
      trackClicks: true
    }
  },
  {
    id: 'interaction-1',
    type: 'interaction',
    title: 'Button Click Test',
    description: 'Find and click specific elements',
    icon: MousePointer,
    color: 'bg-green-500',
    estimatedTime: 2,
    configuration: {
      targetElement: '',
      clickTracking: true,
      hoverTracking: true
    }
  },
  {
    id: 'feedback-1',
    type: 'feedback',
    title: 'User Feedback',
    description: 'Collect subjective feedback from users',
    icon: MessageSquare,
    color: 'bg-purple-500',
    estimatedTime: 5,
    configuration: {
      questions: [],
      allowSkip: false,
      responseType: 'text'
    }
  },
  {
    id: 'questionnaire-1',
    type: 'questionnaire',
    title: 'Survey Questions',
    description: 'Structured questionnaire with multiple choice',
    icon: HelpCircle,
    color: 'bg-orange-500',
    estimatedTime: 4,
    configuration: {
      questions: [],
      randomizeOrder: false,
      multipleChoice: true
    }
  },
  {
    id: 'prototype-1',
    type: 'prototype',
    title: 'Prototype Testing',
    description: 'Test interactive prototypes and mockups',
    icon: Palette,
    color: 'bg-pink-500',
    estimatedTime: 8,
    configuration: {
      prototypeUrl: '',
      prototypeType: 'figma',
      allowZoom: true
    }
  },
  {
    id: 'heatmap-1',
    type: 'heatmap',
    title: 'Heatmap Analysis',
    description: 'Track mouse movements and clicks',
    icon: Zap,
    color: 'bg-red-500',
    estimatedTime: 6,
    configuration: {
      trackMouse: true,
      trackScroll: true,
      trackClicks: true,
      duration: 300
    }
  }
];

// Sortable Task Item Component
interface SortableTaskItemProps {
  task: StudyTask;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleRequired: (taskId: string) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleRequired 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = task.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 border-gray-200 p-4 mb-3 transition-all duration-200 hover:border-gray-300 hover:shadow-md ${
        isDragging ? 'shadow-lg z-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 mr-3 text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Task Icon */}
          <div className={`w-10 h-10 rounded-lg ${task.color} flex items-center justify-center mr-4`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Task Details */}
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <h3 className="font-semibold text-gray-900 mr-2">{task.title}</h3>
              {task.isRequired && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Required
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span className="mr-4">~{task.estimatedTime} min</span>
              <Target className="w-3 h-3 mr-1" />
              <span className="capitalize">{task.type}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onToggleRequired(task.id)}
            className={`p-2 rounded-lg transition-colors ${
              task.isRequired 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={task.isRequired ? 'Make optional' : 'Make required'}
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(task.id)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Task Template Picker Component
interface TaskTemplatePickerProps {
  onSelectTemplate: (template: TaskTemplate) => void;
  onClose: () => void;
}

const TaskTemplatePicker: React.FC<TaskTemplatePickerProps> = ({ onSelectTemplate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
              <p className="text-gray-600 mt-1">Choose a task template to customize for your study</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TASK_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  variant="interactive"
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>~{template.estimatedTime} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Drag-and-Drop Study Builder Component
interface DragDropStudyBuilderProps {
  onTasksChange: (tasks: StudyTask[]) => void;
  initialTasks?: StudyTask[];
}

export const DragDropStudyBuilder: React.FC<DragDropStudyBuilderProps> = ({ 
  onTasksChange, 
  initialTasks = [] 
}) => {
  const [tasks, setTasks] = useState<StudyTask[]>(initialTasks);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTaskForConfig, setSelectedTaskForConfig] = useState<StudyTask | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order property
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index
        }));
        
        onTasksChange(updatedItems);
        return updatedItems;
      });
    }
  }, [onTasksChange]);

  const handleSelectTemplate = useCallback((template: TaskTemplate) => {
    const newTask: StudyTask = {
      ...template,
      id: `${template.type}-${Date.now()}`,
      order: tasks.length,
      isRequired: false,
      successCriteria: []
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
    setShowTemplatePicker(false);
    
    toast.success(`${template.title} task added successfully!`);
  }, [tasks, onTasksChange]);

  const handleDeleteTask = useCallback((taskId: string) => {
    const updatedTasks = tasks
      .filter(task => task.id !== taskId)
      .map((task, index) => ({ ...task, order: index }));
    
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
    toast.success('Task deleted successfully');
  }, [tasks, onTasksChange]);

  const handleToggleRequired = useCallback((taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, isRequired: !task.isRequired } : task
    );
    
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
  }, [tasks, onTasksChange]);  const handleEditTask = useCallback((taskId: string) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setSelectedTaskForConfig(taskToEdit);
      setIsConfigModalOpen(true);
    }
  }, [tasks]);

  const handleSaveTaskConfiguration = useCallback((updatedTask: StudyTask) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
    setIsConfigModalOpen(false);
    setSelectedTaskForConfig(null);
  }, [tasks, onTasksChange]);

  const handleCloseConfigModal = useCallback(() => {
    setIsConfigModalOpen(false);
    setSelectedTaskForConfig(null);
  }, []);

  const totalEstimatedTime = tasks.reduce((total, task) => total + task.estimatedTime, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-blue-800">Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalEstimatedTime}</div>
            <div className="text-sm text-indigo-800">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter(t => t.isRequired).length}
            </div>
            <div className="text-sm text-purple-800">Required</div>
          </div>
        </div>
        
        <Button
          onClick={() => setShowTemplatePicker(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Eye className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks added yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your study by adding tasks for participants to complete
            </p>
            <Button
              onClick={() => setShowTemplatePicker(true)}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext 
            items={tasks.map(task => task.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {tasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onToggleRequired={handleToggleRequired}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TaskTemplatePicker
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Task Configuration Modal */}
      <TaskConfigurationModal
        isOpen={isConfigModalOpen}
        task={selectedTaskForConfig}
        onSave={handleSaveTaskConfiguration}
        onClose={handleCloseConfigModal}
      />
    </div>
  );
};

export default DragDropStudyBuilder;
