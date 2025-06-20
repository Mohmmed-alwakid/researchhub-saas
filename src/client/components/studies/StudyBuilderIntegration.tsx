import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';

// Local interfaces to avoid import issues
interface StudyBuilderTask {
  id: string;
  template_id: string;
  name: string;
  description: string;
  estimated_duration: number;
  order_index: number;
  settings?: Record<string, unknown>;
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  estimatedDuration: number;
  complexity?: number;
}

interface StudyType {
  id: string;
  name: string;
  description: string;
  icon?: string;
  maxTasks: number;
  recordingRecommended: boolean;
  features: string[];
}

interface StudyBuilderIntegrationProps {
  onTasksChange: (tasks: StudyBuilderTask[]) => void;
  studyType: string;
  initialTasks?: StudyBuilderTask[];
}

export const StudyBuilderIntegration: React.FC<StudyBuilderIntegrationProps> = ({
  onTasksChange,
  studyType,
  initialTasks = []
}) => {
  const [studyTypes, setStudyTypes] = useState<StudyType[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [currentTasks, setCurrentTasks] = useState<StudyBuilderTask[]>(initialTasks);
  const [showTaskLibrary, setShowTaskLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token');

  // Load study types on mount
  const loadStudyTypes = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;      const response = await fetch('/api/study-builder?action=getStudyTypes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setStudyTypes(result.data);
      }
    } catch (err) {
      console.error('Error loading study types:', err);
    }
  }, []);

  // Load task templates when study type changes
  const loadTaskTemplates = useCallback(async (studyTypeId: string) => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) return;      const response = await fetch(`/api/study-builder?action=getTaskTemplates&studyType=${studyTypeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setTaskTemplates(result.data);
      } else {
        setError(result.error || 'Failed to load task templates');
      }
    } catch (err) {
      console.error('Error loading task templates:', err);
      setError('Failed to load task templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudyTypes();
  }, [loadStudyTypes]);
  useEffect(() => {
    if (studyType) {
      loadTaskTemplates(studyType);
    }
  }, [studyType, loadTaskTemplates]);

  // Update parent when tasks change
  useEffect(() => {
    onTasksChange(currentTasks);
  }, [currentTasks, onTasksChange]);
  const addTask = (template: TaskTemplate) => {
    const newTask: StudyBuilderTask = {
      id: `temp-${Date.now()}`, // Temporary ID for new tasks
      template_id: template.id,
      name: template.name,
      description: template.description,
      estimated_duration: template.estimatedDuration,
      order_index: currentTasks.length,
      settings: {}
    };

    setCurrentTasks(prev => [...prev, newTask]);
    setShowTaskLibrary(false);
  };

  const removeTask = (taskId: string) => {
    setCurrentTasks(prev => 
      prev.filter(task => task.id !== taskId)
        .map((task, index) => ({ ...task, order_index: index }))
    );
  };

  const moveTask = (fromIndex: number, toIndex: number) => {
    const newTasks = [...currentTasks];
    const [movedTask] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, movedTask);
    
    // Update order indices
    const reorderedTasks = newTasks.map((task, index) => ({
      ...task,
      order_index: index
    }));
    
    setCurrentTasks(reorderedTasks);
  };

  const currentStudyType = studyTypes.find(type => type.id === studyType);

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <Button 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Study Type Info */}
      {currentStudyType && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentStudyType.icon}</span>
            <div>
              <h3 className="font-medium text-blue-900">{currentStudyType.name}</h3>
              <p className="text-sm text-blue-700">{currentStudyType.description}</p>
              <p className="text-xs text-blue-600 mt-1">
                Max tasks: {currentStudyType.maxTasks} | Recording: {currentStudyType.recordingRecommended ? 'Recommended' : 'Optional'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tasks Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Study Tasks</h3>
            <p className="text-sm text-gray-600">
              {currentTasks.length} of {currentStudyType?.maxTasks || 0} tasks added
            </p>
          </div>
          <Button
            onClick={() => setShowTaskLibrary(true)}
            disabled={isLoading || !studyType}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>

        {/* Task List */}
        {currentTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <p>No tasks added yet.</p>
            <p className="text-sm">Click "Add Task" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.name}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>Duration: {task.estimated_duration} min</span>
                    <span>Template: {task.template_id}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {/* TODO: Implement edit */}}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeTask(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Task Library Modal */}
      {showTaskLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Task Library</h2>
              <Button
                variant="outline"
                onClick={() => setShowTaskLibrary(false)}
              >
                Close
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading task templates...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
                    onClick={() => addTask(template)}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Category: {template.subcategory || template.category}</span>
                      <span>{template.estimatedDuration} min</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {taskTemplates.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <p>No task templates available for this study type.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyBuilderIntegration;
