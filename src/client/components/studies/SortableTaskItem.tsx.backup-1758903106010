import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, Edit2, Copy, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface Task {
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
}

interface SortableTaskItemProps {
  task: Task;
  index: number;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  index,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
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
  };

  const getTaskIcon = (task: Task) => {
    if (task.icon) return task.icon;
    
    // Default icons based on task category or name
    if (task.name.toLowerCase().includes('navigation')) return '🧭';
    if (task.name.toLowerCase().includes('interview')) return '🎙️';
    if (task.name.toLowerCase().includes('survey')) return '📋';
    if (task.name.toLowerCase().includes('prototype')) return '🎨';
    if (task.name.toLowerCase().includes('tree')) return '🌳';
    if (task.name.toLowerCase().includes('card')) return '🃏';
    return '📝';
  };

  const getRequiredBadge = (task: Task) => {
    if (task.isRequired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
        <CheckCircle className="w-3 h-3" />
        Optional
      </span>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm transition-all ${
        isDragging
          ? 'shadow-lg border-blue-300 bg-blue-50 rotate-1 z-10'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={`mt-1 p-1 rounded cursor-grab active:cursor-grabbing ${
              isDragging ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Task Number */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isDragging 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {index + 1}
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getTaskIcon(task)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{task.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                </div>
              </div>
              {getRequiredBadge(task)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {task.estimatedDuration}m
                </span>
                {task.category && (
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {task.category}
                  </span>
                )}
              </div>              {/* Task Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicateTask(task)}
                  className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                  title="Duplicate task"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drop indicator */}
      {isDragging && (
        <div className="h-1 bg-blue-400 rounded-b-lg"></div>
      )}
    </div>
  );
};

export default SortableTaskItem;
