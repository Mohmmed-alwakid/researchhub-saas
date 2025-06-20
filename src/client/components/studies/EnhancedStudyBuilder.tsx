import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Study type definitions - Only 3 core types
const STUDY_TYPES = [
  {
    id: 'usability_test',
    name: 'Usability Testing',
    description: 'Test user interactions with interfaces, prototypes, and information architecture',
    icon: '🖱️',
    maxTasks: 10,
    recordingRecommended: true,
    features: ['Screen Recording', 'Click Tracking', 'Heatmaps', 'Tree Testing', 'Card Sorting']
  },
  {
    id: 'user_interview',
    name: 'User Interview',
    description: 'Gather qualitative insights through guided conversation',
    icon: '🎙️',
    maxTasks: 5,
    recordingRecommended: true,
    features: ['Audio Recording', 'Note Taking', 'Conversation Guides', 'Video Optional']
  },
  {
    id: 'survey',
    name: 'Survey Research',
    description: 'Collect structured quantitative and qualitative data',
    icon: '📋',
    maxTasks: 8,
    recordingRecommended: false,
    features: ['Form Validation', 'Skip Logic', 'Randomization', 'Text Responses']
  }
];

interface Task {
  id: string;
  templateId: string;
  name: string;
  description: string;
  estimatedDuration: number;
  settings: Record<string, any>;
  order: number;
  isRequired: boolean;
}

interface StudyData {
  title: string;
  description: string;
  type: string;
  tasks: Task[];
  settings: {
    maxParticipants: number;
    compensation: number;
    recordScreen: boolean;
    recordAudio: boolean;
    recordWebcam: boolean;
  };
}

interface EnhancedStudyBuilderProps {
  studyId?: string | null;
  onSave?: (studyData: StudyData) => void;
  onCancel?: () => void;
  initialData?: Partial<StudyData>;
}

export const EnhancedStudyBuilder: React.FC<EnhancedStudyBuilderProps> = ({ 
  studyId, 
  onSave, 
  onCancel,
  initialData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudyType, setSelectedStudyType] = useState<any>(null);
  const [studyData, setStudyData] = useState<StudyData>({
    title: '',
    description: '',
    type: '',
    tasks: [],
    settings: {
      maxParticipants: 10,
      compensation: 25,
      recordScreen: false,
      recordAudio: false,
      recordWebcam: false
    }
  });
  
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load task templates when study type changes
  useEffect(() => {
    if (selectedStudyType) {
      loadTaskTemplates(selectedStudyType.id);
    }
  }, [selectedStudyType]);

  // Validate study when tasks change
  useEffect(() => {
    if (studyData.type && studyData.tasks.length > 0) {
      validateStudy();
    }
  }, [studyData.tasks, studyData.type]);

  const loadTaskTemplates = async (studyType: string) => {
    try {
      const response = await fetch(`/api/study-builder?action=getTaskTemplates&studyType=${studyType}`);
      const data = await response.json();
      if (data.success) {
        setAvailableTasks(data.taskTemplates);
      }
    } catch (error) {
      console.error('Failed to load task templates:', error);
    }
  };

  const validateStudy = async () => {
    try {
      const response = await fetch('/api/study-builder?action=validateStudy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyType: studyData.type,
          tasks: studyData.tasks
        })
      });
      const data = await response.json();
      if (data.success) {
        setValidation(data.validation);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleStudyTypeChange = (typeId: string) => {
    const studyType = STUDY_TYPES.find(t => t.id === typeId);
    setSelectedStudyType(studyType);
    setStudyData(prev => ({
      ...prev,
      type: typeId,
      tasks: [], // Clear tasks when changing study type
      settings: {
        ...prev.settings,
        recordScreen: studyType?.recordingRecommended || false,
        recordAudio: studyType?.recordingRecommended || false
      }
    }));
  };

  const addTask = (taskTemplate: any) => {
    if (studyData.tasks.length >= (selectedStudyType?.maxTasks || 10)) {
      return; // Max tasks reached
    }
    
    const newTask: Task = {
      id: Date.now().toString(),
      templateId: taskTemplate.id,
      name: taskTemplate.name,
      description: taskTemplate.description,
      estimatedDuration: taskTemplate.estimatedDuration,
      settings: { ...taskTemplate.defaultSettings },
      order: studyData.tasks.length,
      isRequired: true
    };
    
    setStudyData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const removeTask = (taskId: string) => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(studyData.tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedTasks = items.map((task, index) => ({
      ...task,
      order: index
    }));

    setStudyData(prev => ({ ...prev, tasks: reorderedTasks }));
  };

  const calculateTotalDuration = () => {
    return studyData.tasks.reduce((total, task) => total + task.estimatedDuration, 0);
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1: return selectedStudyType !== null;
      case 2: return studyData.title && studyData.description;
      case 3: return studyData.tasks.length > 0 && (!validation || validation.isValid);
      case 4: return true;
      default: return false;
    }
  };

  const saveStudy = async () => {
    if (!validation?.isValid) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/study-builder?action=createStudyWithTasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          study: studyData,
          tasks: studyData.tasks
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Handle success - redirect or show success message
        console.log('Study created successfully:', data.study);
      } else {
        console.error('Failed to create study:', data.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with step indicator */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Study</h1>
        <div className="flex items-center justify-center space-x-4 text-sm">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className={`flex items-center ${step < 5 ? 'space-x-2' : ''}`}>
              <span className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${currentStep === step ? 'bg-blue-500 text-white' : 
                  currentStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {currentStep > step ? '✓' : step}
              </span>
              {step < 5 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-8 mt-2 text-xs text-gray-600">
          <span>Study Type</span>
          <span>Details</span>
          <span>Tasks</span>
          <span>Settings</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step 1: Study Type Selection */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Choose Your Study Type</h2>
          <p className="text-gray-600 mb-6">Select the type of research study you want to conduct</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STUDY_TYPES.map((type) => (
              <div
                key={type.id}
                className={`
                  p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${selectedStudyType?.id === type.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
                onClick={() => handleStudyTypeChange(type.id)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">Max {type.maxTasks} tasks</span>
                      {type.recordingRecommended && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Recording recommended</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <strong>Features:</strong> {type.features.slice(0, 2).join(', ')}
                      {type.features.length > 2 && ` +${type.features.length - 2} more`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedStudyType && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedStudyType.icon}</div>
                <div>
                  <h4 className="font-medium text-blue-900">{selectedStudyType.name}</h4>
                  <p className="text-sm text-blue-700">{selectedStudyType.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentStep(2)} 
                className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Continue with {selectedStudyType.name}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Study Details */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Study Information</h2>
          <p className="text-gray-600 mb-6">Provide basic details about your study</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Title *
              </label>
              <input
                type="text"
                value={studyData.title}
                onChange={(e) => setStudyData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your study"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Description *
              </label>
              <textarea
                value={studyData.description}
                onChange={(e) => setStudyData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what participants will be doing and the goals of your study"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedStudyType?.icon}</span>
                <div>
                  <span className="font-medium text-blue-900">{selectedStudyType?.name}</span>
                  <p className="text-sm text-blue-700">{selectedStudyType?.description}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button 
                onClick={() => setCurrentStep(3)}
                disabled={!canProceed(2)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Task Management */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Study Tasks ({studyData.tasks.length}/{selectedStudyType?.maxTasks})
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>🕒</span>
                  <span>{calculateTotalDuration()} min total</span>
                </div>
              </div>
              
              {studyData.tasks.length > 0 ? (
                <div className="space-y-3">
                  {studyData.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{task.name}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <span className="text-xs text-gray-500">~{task.estimatedDuration} min</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setEditingTask(task)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => removeTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks added yet. Choose from available tasks on the right.</p>
                </div>
              )}

              {/* Validation Results */}
              {validation && (
                <div className="mt-4 space-y-2">
                  {validation.errors.map((error: any, index: number) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                      ⚠️ {error.message}
                    </div>
                  ))}
                  {validation.warnings.map((warning: any, index: number) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                      ⚠️ {warning.message}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button 
                  onClick={() => setCurrentStep(4)}
                  disabled={!canProceed(3)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Settings
                </button>
              </div>
            </div>
          </div>

          {/* Available Tasks */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Available Tasks</h3>
              <p className="text-sm text-gray-600 mb-4">Add tasks to your study</p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all"
                    onClick={() => addTask(task)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{task.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">~{task.estimatedDuration} min</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {task.subcategory}
                          </span>
                        </div>
                      </div>
                      <button className="ml-2 p-1 text-blue-500 hover:text-blue-700">
                        ➕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Task: {editingTask.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Name</label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={editingTask.estimatedDuration}
                  onChange={(e) => setEditingTask({ 
                    ...editingTask, 
                    estimatedDuration: parseInt(e.target.value) || 5 
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    updateTask(editingTask.id, editingTask);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Settings */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Study Settings</h2>
          <p className="text-gray-600 mb-6">Configure study preferences and recording options</p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Participants
                </label>
                <input
                  type="number"
                  value={studyData.settings.maxParticipants}
                  onChange={(e) => setStudyData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, maxParticipants: parseInt(e.target.value) || 10 }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compensation ($)
                </label>
                <input
                  type="number"
                  value={studyData.settings.compensation}
                  onChange={(e) => setStudyData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, compensation: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {selectedStudyType?.recordingRecommended && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recording Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={studyData.settings.recordScreen}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, recordScreen: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Record screen activity</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={studyData.settings.recordAudio}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, recordAudio: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Record audio</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={studyData.settings.recordWebcam}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, recordWebcam: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Record webcam</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button 
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button 
                onClick={() => setCurrentStep(5)} 
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Review Study
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {currentStep === 5 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Review Your Study</h2>
          <p className="text-gray-600 mb-6">Review all details before creating your study</p>
          
          <div className="space-y-6">
            {/* Study Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Study Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {studyData.title}</div>
                  <div><strong>Type:</strong> {selectedStudyType?.name}</div>
                  <div><strong>Tasks:</strong> {studyData.tasks.length}</div>
                  <div><strong>Duration:</strong> ~{calculateTotalDuration()} minutes</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Settings</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Max Participants:</strong> {studyData.settings.maxParticipants}</div>
                  <div><strong>Compensation:</strong> ${studyData.settings.compensation}</div>
                  <div><strong>Recording:</strong> 
                    {studyData.settings.recordScreen || studyData.settings.recordAudio 
                      ? ' Enabled' : ' Disabled'}
                  </div>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Tasks</h3>
              <div className="space-y-2">
                {studyData.tasks.map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium">{task.name}</span>
                        <span className="text-sm text-gray-600 ml-2">({task.estimatedDuration} min)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Status */}
            {validation && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Validation Status</h3>
                {validation.isValid ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                    ✅ Study is valid and ready to be created!
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                    ⚠️ Please fix validation errors before proceeding.
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <button 
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button 
                onClick={saveStudy}
                disabled={!validation?.isValid || isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Study...' : '💾 Create Study'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedStudyBuilder;
