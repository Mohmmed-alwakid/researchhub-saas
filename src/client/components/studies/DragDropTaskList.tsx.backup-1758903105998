import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Clock } from 'lucide-react';
import SortableTaskItem from './SortableTaskItem.tsx';

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

interface DragDropTaskListProps {
  tasks: Task[];
  onReorderTasks: (tasks: Task[]) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  studyType: string;
}

export const DragDropTaskList: React.FC<DragDropTaskListProps> = ({
  tasks,
  onReorderTasks,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  studyType
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      
      // Update order property
      const updatedTasks = reorderedTasks.map((task, index) => ({
        ...task,
        order: index + 1
      }));

      onReorderTasks(updatedTasks);
    }
  };

  const getTotalDuration = () => {
    return tasks.reduce((total, task) => total + task.estimatedDuration, 0);
  };

  if (tasks.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks added yet</h3>
        <p className="text-gray-600 mb-4">
          Add tasks from the library to build your {studyType.replace('_', ' ')} study
        </p>
        <div className="text-sm text-gray-500">
          💡 Tip: Use the "Add Task" button to browse available task templates
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Study Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-700">
              <span className="font-medium">{tasks.length}</span> tasks
            </div>
            <div className="text-sm text-blue-700 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{getTotalDuration()}</span> minutes total
            </div>
            <div className="text-sm text-blue-700">
              <span className="font-medium">{tasks.filter(t => t.isRequired).length}</span> required
            </div>
          </div>
          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            Drag to reorder
          </div>
        </div>
      </div>

      {/* Drag and Drop Task List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                index={index}
                onEditTask={onEditTask}
                onDuplicateTask={onDuplicateTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>  );
};

export default DragDropTaskList;
