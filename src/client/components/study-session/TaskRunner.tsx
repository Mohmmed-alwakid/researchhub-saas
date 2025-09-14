import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Play, Pause, Square, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ISession, ITaskCompletion } from '../../../shared/types';
import { useRecording } from '../../hooks/useRecording.ts';
import { NavigationTask } from './task-types/NavigationTask.tsx';
import { SurveyTask } from './task-types/SurveyTask.tsx';
import { PrototypeTask } from './task-types/PrototypeTask.tsx';
import { InterviewTask } from './task-types/InterviewTask.tsx';
import { CardSortingTask } from './task-types/CardSortingTask.tsx';
import { WelcomeBlockTask } from './task-types/WelcomeBlockTask.tsx';
import { ContextScreenTask } from './task-types/ContextScreenTask.tsx';

interface TaskRunnerProps {
  study: any;
  session: ISession;
  participant: any;
  onComplete: () => void;
  onExit: () => void;
}

interface TaskResponse {
  taskId: string;
  responses: Record<string, any>;
  duration: number;
  success: boolean;
  interactions: any[];
  startedAt: Date;
  completedAt: Date;
}

export const TaskRunner: React.FC<TaskRunnerProps> = ({
  study,
  session,
  onComplete,
  onExit
}) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResponses, setTaskResponses] = useState<TaskResponse[]>([]);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [sessionStartTime] = useState(new Date());
  const [taskCompletions, setTaskCompletions] = useState<ITaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    pauseRecording
  } = useRecording(session._id);

  const tasks = study.tasks || [];
  const currentTask = tasks[currentTaskIndex];
  const isLastTask = currentTaskIndex === tasks.length - 1;
  const totalTasks = tasks.length;

  // Initialize task tracking
  useEffect(() => {
    if (tasks.length > 0) {
      setTaskStartTime(new Date());
      // Start recording if enabled for this study
      if (study.settings?.recordScreen) {
        startRecording();
      }
    }
  }, [startRecording, study.settings?.recordScreen, tasks.length]);

  // Save task progress to backend
  const saveTaskProgress = useCallback(async (taskResponse: TaskResponse, taskCompletion: ITaskCompletion) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sessions/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sessionId: session._id,
          taskResponse,
          taskCompletion,
          currentTaskIndex: currentTaskIndex + 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving task progress:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [session._id, currentTaskIndex]);

  // Complete the entire session
  const completeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Stop recording
      if (isRecording) {
        await stopRecording();
      }

      const sessionDuration = (new Date().getTime() - sessionStartTime.getTime()) / 1000;

      const response = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sessionId: session._id,
          taskResponses,
          taskCompletions,
          duration: sessionDuration,
          completedAt: new Date()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      toast.success('Study completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete study. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isRecording, stopRecording, sessionStartTime, session._id, taskResponses, taskCompletions, onComplete]);

  // Track task completion
  const completeCurrentTask = useCallback(async (responses: Record<string, any>) => {
    if (!currentTask || !taskStartTime) return;

    const completedAt = new Date();
    const duration = (completedAt.getTime() - taskStartTime.getTime()) / 1000;

    const taskResponse: TaskResponse = {
      taskId: currentTask._id,
      responses,
      duration,
      success: true,
      interactions: [], // Removed unused interaction tracking
      startedAt: taskStartTime,
      completedAt
    };

    const taskCompletion: ITaskCompletion = {
      taskId: currentTask._id,
      status: 'completed',
      startedAt: taskStartTime,
      completedAt,
      duration,
      success: true
    };

    setTaskResponses(prev => [...prev, taskResponse]);
    setTaskCompletions(prev => [...prev, taskCompletion]);

    // Save progress to backend
    await saveTaskProgress(taskResponse, taskCompletion);

    if (isLastTask) {
      await completeSession();
    } else {
      moveToNextTask();
    }
  }, [currentTask, taskStartTime, isLastTask, completeSession, saveTaskProgress]);

  const moveToNextTask = () => {
    setCurrentTaskIndex(prev => prev + 1);
    setTaskStartTime(new Date());
    toast.success('Task completed! Moving to next task...');
  };

  const handleExit = async () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      // Save current progress
      if (taskStartTime) {
        const partialResponse: TaskResponse = {
          taskId: currentTask._id,
          responses: {},
          duration: (new Date().getTime() - taskStartTime.getTime()) / 1000,
          success: false,
          interactions: [],
          startedAt: taskStartTime,
          completedAt: new Date()
        };
        await saveTaskProgress(partialResponse, {
          taskId: currentTask._id,
          status: 'failed',
          startedAt: taskStartTime,
          completedAt: new Date()
        });
      }
      
      if (isRecording) {
        await stopRecording();
      }
      
      onExit();
    }
  };
  const renderCurrentTask = () => {
    if (!currentTask) return null;

    const taskProps = {
      task: currentTask,
      study,
      session,
      onComplete: completeCurrentTask,
      isRecording
    };

    // Handle both legacy task types and new block types
    const taskType = currentTask.type;
    
    switch (taskType) {
      // Legacy task types (maintain backward compatibility)
      case 'navigation':
        return <NavigationTask {...taskProps} />;
      case 'questionnaire':
        return <SurveyTask {...taskProps} />;
      case 'prototype-test':
        return <PrototypeTask {...taskProps} />;
      case 'interview':
        return <InterviewTask {...taskProps} />;
      case 'card-sorting':
        return <CardSortingTask {...taskProps} />;
      
      // New block types - mapped to appropriate task components
      case 'welcome':
        return <WelcomeBlockTask {...taskProps} />;
      case 'open_question':
        return <SurveyTask {...taskProps} taskVariant="open_question" />;
      case 'opinion_scale':
        return <SurveyTask {...taskProps} taskVariant="opinion_scale" />;
      case 'simple_input':
        return <SurveyTask {...taskProps} taskVariant="simple_input" />;
      case 'multiple_choice':
        return <SurveyTask {...taskProps} taskVariant="multiple_choice" />;
      case 'context_screen':
        return <ContextScreenTask {...taskProps} />;
      case 'yes_no':
        return <SurveyTask {...taskProps} taskVariant="yes_no" />;
      case 'five_second_test':
        return <PrototypeTask {...taskProps} taskVariant="five_second_test" />;
      case 'card_sort':
        return <CardSortingTask {...taskProps} />;
      case 'tree_test':
        return <NavigationTask {...taskProps} taskVariant="tree_test" />;
      
      default:
        return <SurveyTask {...taskProps} />; // Fallback
    }
  };

  if (!currentTask) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Tasks Available</h2>
          <p className="text-gray-600 mb-4">This study doesn't have any tasks configured.</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Exit Study
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Study Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{study.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>Task {currentTaskIndex + 1} of {totalTasks}</span>
                <span>•</span>
                <span>{Math.round((currentTaskIndex / totalTasks) * 100)}% Complete</span>
              </div>
            </div>
            
            {/* Recording Controls */}
            {study.settings?.recordScreen && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">
                    {isRecording ? 'Recording' : 'Stopped'}
                  </span>
                  {isRecording && recordingDuration && (
                    <span className="text-sm text-gray-600">
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      title="Start Recording"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={pauseRecording}
                        className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        title="Pause Recording"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={stopRecording}
                        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        title="Stop Recording"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleExit}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              disabled={isLoading}
            >
              Exit Study
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTaskIndex / totalTasks) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Task Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{currentTask.title}</h2>
              <p className="text-gray-600 mb-4">{currentTask.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {currentTask.timeLimit && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Time limit: {Math.floor(currentTask.timeLimit / 60)} minutes</span>
                  </div>
                )}
                {currentTask.isRequired && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Required</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Criteria */}
          {currentTask.successCriteria && currentTask.successCriteria.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Success Criteria:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                {currentTask.successCriteria.map((criteria: string, index: number) => (
                  <li key={index}>{criteria}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Task Interface */}
        <div className="bg-white rounded-lg shadow-sm border">
          {renderCurrentTask()}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-900">Saving progress...</p>
          </div>
        </div>
      )}
    </div>
  );
};
