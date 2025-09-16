import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, TaskInput } from '../stores/appStore';
import type { StudyInput } from '../stores/appStore';
import { StudyFormData } from '../components/studies/StudyMetadataForm';
import { StudyBuilderBlock } from '../components/studies/StudyBlocksManager';
import { ITask, Study } from '../../shared/types';

interface ValidationError {
  field: string;
  message: string;
}

// Convert blocks to tasks for API compatibility
const convertBlocksToTaskInput = (blocks: StudyBuilderBlock[]): TaskInput[] => {
  return blocks.map(block => ({
    title: block.name,
    description: block.description,
    type: block.type === 'welcome' ? 'prototype' : 
          block.type === 'open_question' ? 'questionnaire' :
          block.type === 'multiple_choice' ? 'interaction' : 'navigation',
    order: block.order_index,
    settings: block.settings
  }));
};

// Convert tasks to blocks
const convertTasksToBlocks = (tasks: ITask[]): StudyBuilderBlock[] => {
  return tasks.map((task, index) => ({
    id: task._id || `block_${index}`,
    template_id: task.type,
    name: task.title || 'Untitled Block',
    description: task.description || '',
    estimated_duration: 2,
    order_index: task.order || index,
    type: task.type === 'navigation' ? 'simple_input' : 
          task.type === 'interaction' ? 'multiple_choice' :
          task.type === 'questionnaire' ? 'open_question' : 'welcome',
    settings: (task.configuration as unknown as Record<string, unknown>) || {}
  }));
};

export const useStudyBuilder = (studyId?: string) => {
  const navigate = useNavigate();
  const { createStudy, updateStudy } = useAppStore();
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validation, setValidation] = useState<ValidationError[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdStudyId, setCreatedStudyId] = useState<string | null>(null);

  // Load study data if editing
  const loadStudyData = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/studies?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.study) {
          const study = data.study;
          
          // Return study data for form initialization
          const formData: StudyFormData = {
            title: study.title,
            description: study.description,
            type: study.type || 'usability_test',
            settings: study.settings || {
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
          };

          // Convert tasks to blocks
          const blocks = study.tasks && Array.isArray(study.tasks) 
            ? convertTasksToBlocks(study.tasks) 
            : [];
          
          setIsEditing(true);
          return { formData, blocks };
        }
      }
    } catch (error) {
      console.error('Error loading study:', error);
    }
    return null;
  }, []);

  // Submit study
  const submitStudy = useCallback(async (
    formData: StudyFormData, 
    blocks: StudyBuilderBlock[]
  ) => {
    setIsSubmitting(true);
    setValidation([]);

    try {
      // Validate form and blocks
      if (!formData.title?.trim()) {
        setValidation([{ field: 'title', message: 'Study title is required' }]);
        setIsSubmitting(false);
        return;
      }

      if (blocks.length === 0) {
        setValidation([{ field: 'blocks', message: 'At least one study block is required' }]);
        setIsSubmitting(false);
        return;
      }

      // Convert blocks to tasks
      const tasks = convertBlocksToTaskInput(blocks);

      const studyData: StudyInput = {
        title: formData.title,
        description: formData.description || '',
        type: formData.type as 'usability' | 'survey' | 'interview',
        status: 'draft' as const,
        tasks,
        settings: {
          maxParticipants: formData.settings.maxParticipants,
          duration: formData.settings.duration,
          compensation: formData.settings.compensation,
          recordScreen: formData.settings.recordScreen,
          recordAudio: formData.settings.recordAudio,
          collectHeatmaps: formData.settings.trackClicks || formData.settings.trackScrolls // Derive from tracking settings
        }
      };

      let result: Study | void;
      try {
        if (isEditing && studyId) {
          // For updates, we need to convert to Partial<Study> format
          const updateData: Partial<Study> = {
            title: formData.title,
            description: formData.description || '',
            type: formData.type as 'usability' | 'survey' | 'interview',
            status: 'draft' as const,
            settings: {
              maxParticipants: formData.settings.maxParticipants,
              duration: formData.settings.duration,
              compensation: formData.settings.compensation,
              recordScreen: formData.settings.recordScreen,
              recordAudio: formData.settings.recordAudio,
              recordWebcam: formData.settings.recordWebcam,
              trackClicks: formData.settings.trackClicks,
              trackScrolls: formData.settings.trackScrolls
            }
          };
          result = await updateStudy(studyId, updateData);
        } else {
          // For creation, use StudyInput format
          result = await createStudy(studyData);
        }

        // Handle success - navigate to studies page
        setShowSuccessMessage(true);
        setCreatedStudyId(result?._id || studyId || null);
        
        // Navigate after short delay for user feedback
        setTimeout(() => {
          navigate('/app/studies');
        }, 2000);
        
      } catch (apiError: unknown) {
        console.error('API Error:', apiError);
        const errorMessage = apiError && typeof apiError === 'object' && 'message' in apiError 
          ? (apiError as { message: string }).message 
          : 'Failed to save study';
        setValidation([{ 
          field: 'submit', 
          message: errorMessage 
        }]);
      }
    } catch (error) {
      console.error('Error submitting study:', error);
      setValidation([{ 
        field: 'submit', 
        message: 'An unexpected error occurred' 
      }]);
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditing, studyId, createStudy, updateStudy, navigate]);

  return {
    // State
    isSubmitting,
    isEditing,
    validation,
    showSuccessMessage,
    createdStudyId,
    
    // Actions
    loadStudyData,
    submitStudy,
    
    // Utils
    convertBlocksToTaskInput,
    convertTasksToBlocks
  };
};
