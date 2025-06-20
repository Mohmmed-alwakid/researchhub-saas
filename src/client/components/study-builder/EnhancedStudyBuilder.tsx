import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Enhanced Study Builder Component with full task management
const EnhancedStudyBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudyType, setSelectedStudyType] = useState(null);
  const [studyTypes, setStudyTypes] = useState([]);
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [compatibleTasks, setCompatibleTasks] = useState([]);
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [studyData, setStudyData] = useState({
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

  // Load study types on component mount
  useEffect(() => {
    loadStudyTypes();
  }, []);

  // Load compatible tasks when study type or current tasks change
  useEffect(() => {
    if (selectedStudyType) {
      loadCompatibleTasks();
    }
  }, [selectedStudyType, studyData.tasks]);

  // Validate study configuration when it changes
  useEffect(() => {
    if (selectedStudyType && studyData.tasks.length > 0) {
      validateStudyConfiguration();
    }
  }, [selectedStudyType, studyData.tasks]);

  const loadStudyTypes = async () => {
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

  const loadCompatibleTasks = async () => {
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

  const validateStudyConfiguration = async () => {
    try {
      const response = await fetch('/api/enhanced-study-builder?action=validateStudyConfiguration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyType: selectedStudyType.id,
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

  const handleStudyTypeChange = (typeId) => {
    const studyType = studyTypes.find(t => t.id === typeId);
    setSelectedStudyType(studyType);
    setStudyData(prev => ({
      ...prev,
      type: typeId,
      tasks: [], // Clear tasks when changing study type
      settings: {
        ...prev.settings,
        recordScreen: studyType?.recording_recommended || false
      }
    }));
  };

  const addTask = (taskTemplate) => {
    const newTask = {
      id: Date.now().toString(),
      templateId: taskTemplate.id,
      name: taskTemplate.name,
      description: taskTemplate.description,
      customInstructions: '',
      estimatedDuration: taskTemplate.estimated_duration,
      complexityLevel: taskTemplate.complexity_level,
      settings: { ...taskTemplate.default_settings },
      validationRules: {},
      isRequired: true,
      order: studyData.tasks.length
    };
    
    setStudyData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const removeTask = (taskId) => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
        .map((task, index) => ({ ...task, order: index }))
    }));
  };

  const duplicateTask = (taskId) => {
    const originalTask = studyData.tasks.find(task => task.id === taskId);
    if (originalTask) {
      const duplicatedTask = {
        ...originalTask,
        id: Date.now().toString(),
        name: `${originalTask.name} (Copy)`,
        order: originalTask.order + 1
      };
      
      setStudyData(prev => ({
        ...prev,
        tasks: [
          ...prev.tasks.slice(0, originalTask.order + 1),
          duplicatedTask,
          ...prev.tasks.slice(originalTask.order + 1)
        ].map((task, index) => ({ ...task, order: index }))
      }));
    }
  };

  const updateTask = (taskId, updates) => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const tasks = Array.from(studyData.tasks);
    const [reorderedTask] = tasks.splice(result.source.index, 1);
    tasks.splice(result.destination.index, 0, reorderedTask);

    setStudyData(prev => ({
      ...prev,
      tasks: tasks.map((task, index) => ({ ...task, order: index }))
    }));
  };

  const calculateTotalDuration = () => {
    return studyData.tasks.reduce((total, task) => total + task.estimatedDuration, 0);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return selectedStudyType;
      case 2: return studyData.title && studyData.description;
      case 3: return studyData.tasks.length >= (selectedStudyType?.min_tasks || 1);
      case 4: return validation?.isValid;
      default: return true;
    }
  };

  const createStudy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/enhanced-study-builder?action=createStudyWithTasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          study: studyData,
          tasks: studyData.tasks
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Study created successfully!');
        // Reset form or redirect
        setCurrentStep(1);
        setStudyData({
          title: '', description: '', type: '', tasks: [],
          settings: { maxParticipants: 10, estimatedDuration: 30, compensation: 25 }
        });
      } else {
        alert('Failed to create study: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating study:', error);
      alert('Failed to create study');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Study Builder</h1>
        
        {/* Progress Steps */}
        <div className="flex items-center space-x-4 mb-6">
          {[
            { step: 1, title: 'Study Type', icon: '📋' },
            { step: 2, title: 'Basic Info', icon: '📝' },
            { step: 3, title: 'Tasks', icon: '🎯' },
            { step: 4, title: 'Settings', icon: '⚙️' },
            { step: 5, title: 'Review', icon: '👀' }
          ].map(({ step, title, icon }) => (
            <div
              key={step}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentStep === step
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : currentStep > step
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="font-medium">{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Study Type Selection */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Choose Your Study Type</h2>
          <p className="text-gray-600 mb-6">Select the type of research study you want to conduct</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyTypes.map((type) => (
              <div
                key={type.id}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                  selectedStudyType?.id === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleStudyTypeChange(type.id)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {type.max_tasks} max tasks
                    </span>
                    {type.recording_recommended && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        Recording recommended
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedStudyType && (
            <div className="mt-8 pt-6 border-t">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {selectedStudyType.icon} {selectedStudyType.name} Selected
                </h4>
                <p className="text-blue-700 text-sm">{selectedStudyType.description}</p>
                <div className="mt-2 text-xs text-blue-600">
                  • {selectedStudyType.min_tasks}-{selectedStudyType.max_tasks} tasks allowed
                  • Estimated duration: ~{selectedStudyType.recommended_duration} minutes
                  {selectedStudyType.features?.length > 0 && (
                    <span> • Features: {selectedStudyType.features.join(', ')}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue with {selectedStudyType.name}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Basic Information */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Study Information</h2>
          <p className="text-gray-600 mb-6">Provide basic details about your study</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Title *
              </label>
              <input
                type="text"
                value={studyData.title}
                onChange={(e) => setStudyData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your study"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedStudyType?.icon}</span>
                <div>
                  <h4 className="font-medium text-blue-900">{selectedStudyType?.name}</h4>
                  <p className="text-sm text-blue-700">{selectedStudyType?.description}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToNextStep()}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue to Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Task Management */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Study Tasks</h2>
                <p className="text-gray-600">
                  Add tasks for participants to complete. 
                  {selectedStudyType && (
                    <span> Maximum {selectedStudyType.max_tasks} tasks for {selectedStudyType.name}.</span>
                  )}
                </p>
              </div>
              
              {/* Task Summary */}
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="text-gray-600">Current Tasks: <span className="font-semibold">{studyData.tasks.length}</span></div>
                <div className="text-gray-600">Total Duration: <span className="font-semibold">{calculateTotalDuration()} min</span></div>
                {validation && (
                  <div className={`mt-2 ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.isValid ? '✅ Valid' : '❌ Invalid'}
                  </div>
                )}
              </div>
            </div>

            {/* Current Tasks */}
            {studyData.tasks.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">Current Tasks ({studyData.tasks.length})</h3>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="tasks">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {studyData.tasks
                          .sort((a, b) => a.order - b.order)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 border rounded-lg bg-white ${
                                    snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center cursor-grab"
                                      >
                                        <span className="text-xs font-medium">{index + 1}</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                                        <p className="text-sm text-gray-600">{task.description}</p>
                                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                          <span>~{task.estimatedDuration} min</span>
                                          <span>Complexity: {task.complexityLevel}/5</span>
                                          {task.isRequired && <span className="text-blue-600">Required</span>}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => setEditingTask(task)}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => duplicateTask(task.id)}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                      >
                                        Duplicate
                                      </button>
                                      <button
                                        onClick={() => removeTask(task.id)}
                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}

            {/* Available Tasks */}
            {compatibleTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Available Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compatibleTasks.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{template.icon}</span>
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>~{template.estimated_duration} min</span>
                            <span>Complexity: {template.complexity_level}/5</span>
                            <span className="capitalize">{template.category}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => addTask(template)}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {compatibleTasks.length === 0 && studyData.tasks.length >= (selectedStudyType?.max_tasks || 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>Maximum number of tasks reached ({selectedStudyType?.max_tasks})</p>
              </div>
            )}

            {/* Validation Messages */}
            {validation && (
              <div className="mt-6">
                {validation.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validation.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validation.suggestions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Suggestions:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {validation.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                disabled={!canProceedToNextStep()}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue to Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Settings */}
      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Study Settings</h2>
          <p className="text-gray-600 mb-6">Configure recording and participant settings</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recording Settings */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Recording Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.recordScreen}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, recordScreen: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Record Screen</span>
                  {selectedStudyType?.recording_recommended && (
                    <span className="text-sm text-blue-600">(Recommended)</span>
                  )}
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.recordAudio}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, recordAudio: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Record Audio</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={studyData.settings.collectHeatmap}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, collectHeatmap: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Collect Heatmap Data</span>
                </label>
              </div>
            </div>

            {/* Participant Settings */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Participant Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Participants
                  </label>
                  <input
                    type="number"
                    value={studyData.settings.maxParticipants}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, maxParticipants: parseInt(e.target.value) }
                    }))}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
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
                      settings: { ...prev.settings, compensation: parseInt(e.target.value) }
                    }))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {currentStep === 5 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Review & Create Study</h2>
          <p className="text-gray-600 mb-6">Review your study configuration before creating</p>
          
          <div className="space-y-6">
            {/* Study Overview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Study Overview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Title:</span> {studyData.title}</div>
                <div><span className="font-medium">Type:</span> {selectedStudyType?.name}</div>
                <div><span className="font-medium">Tasks:</span> {studyData.tasks.length}</div>
                <div><span className="font-medium">Duration:</span> {calculateTotalDuration()} minutes</div>
                <div><span className="font-medium">Participants:</span> {studyData.settings.maxParticipants}</div>
                <div><span className="font-medium">Compensation:</span> ${studyData.settings.compensation}</div>
              </div>
            </div>

            {/* Task Summary */}
            <div>
              <h3 className="font-semibold mb-3">Tasks ({studyData.tasks.length})</h3>
              <div className="space-y-2">
                {studyData.tasks
                  .sort((a, b) => a.order - b.order)
                  .map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium">{task.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{task.estimatedDuration} min</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Validation Status */}
            {validation && (
              <div className={`p-4 rounded-lg ${validation.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`font-medium ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {validation.isValid ? '✅ Study configuration is valid' : '❌ Study configuration has issues'}
                </div>
                {!validation.isValid && validation.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-700">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={createStudy}
                disabled={!validation?.isValid || isLoading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Study...' : 'Create Study'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Editing Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={(updatedTask) => {
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
const TaskEditModal = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState({ ...task });

  const handleSave = () => {
    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Edit Task: {task.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name
              </label>
              <input
                type="text"
                value={editedTask.name}
                onChange={(e) => setEditedTask(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                placeholder="Add any specific instructions for this task..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setEditedTask(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complexity Level (1-5)
                </label>
                <select
                  value={editedTask.complexityLevel}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, complexityLevel: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>
                      {level} - {['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'][level - 1]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editedTask.isRequired}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Required Task</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudyBuilder;
