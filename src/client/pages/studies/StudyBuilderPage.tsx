import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppStore, TaskInput } from '../../stores/appStore';
import { 
  BlockType, 
  StudyTemplate,
  ITask,
  BlockTemplate
} from '../../../shared/types';

// Local interface for study builder blocks (simpler than the full StudyBlock union)
interface StudyBuilderBlock {
  id: string;
  template_id: string;
  name: string;
  description: string;
  estimated_duration: number;
  order_index: number;
  type: BlockType;
  settings: Record<string, unknown>;
}

interface StudyFormData {
  title: string;
  description?: string;
  type: string;
  settings: {
    maxParticipants: number;
    duration: number;
    compensation: number;
    recordScreen: boolean;
    recordAudio: boolean;
    recordWebcam: boolean;
    collectHeatmaps: boolean;
    trackClicks: boolean;
    trackScrolls: boolean;
  };
}

interface ValidationError {
  field: string;
  message: string;
}
import { 
  validateBlocks
} from '../../utils/validation';
import { BlockLibraryModal } from '../../components/studies/BlockLibraryModal';
import { DragDropBlockList } from '../../components/studies/DragDropBlockList';
import { BlockEditModal } from '../../components/studies/BlockEditModal';

// Helper functions for block management
const getBlockDisplayName = (blockType: BlockType): string => {
  const displayNames: Record<BlockType, string> = {
    'welcome': 'Welcome Screen',
    'open_question': 'Open Question',
    'opinion_scale': 'Opinion Scale',
    'simple_input': 'Simple Input',
    'multiple_choice': 'Multiple Choice',
    'context_screen': 'Context Screen',
    'yes_no': 'Yes/No Question',
    'five_second_test': '5-Second Test',
    'card_sort': 'Card Sort',
    'tree_test': 'Tree Test',
    'screener': 'Screener',
    'prototype_test': 'Prototype Test',
    'live_website_test': 'Live Website Test',
    'thank_you': 'Thank You!'
  };
  return displayNames[blockType] || blockType;
};

const getDefaultBlockDescription = (blockType: BlockType): string => {
  const descriptions: Record<BlockType, string> = {
    'welcome': 'Welcome participants to your study',
    'open_question': 'Ask in-depth questions with advanced AI analysis tools',
    'opinion_scale': 'Measure opinion with a rating scale',
    'simple_input': 'Ask basic questions to gather text, numerical, date, or email data',
    'multiple_choice': 'Ask a question with multiple answer choices',
    'context_screen': 'Provide instructions or context',
    'yes_no': "Ask a question with a 'yes' or 'no' answer",
    'five_second_test': 'Display image for a limited time to test user recall',
    'card_sort': 'See how users understand and group ideas',
    'tree_test': 'Test navigation and findability',
    'screener': 'Filter out participants with preliminary questions',
    'prototype_test': 'Create a usability task for your testers',
    'live_website_test': 'Capture user interactions on websites using code snippet',
    'thank_you': 'Thank you message and study completion'
  };
  return descriptions[blockType] || 'Custom block';
};

const getDefaultBlockSettings = (blockType: BlockType): Record<string, unknown> => {
  const defaultSettings: Record<BlockType, Record<string, unknown>> = {
    'welcome': { showContinueButton: true },
    'open_question': { maxLength: 500, required: true, aiAnalysis: true },
    'opinion_scale': { min: 1, max: 5, labels: ['Poor', 'Excellent'] },
    'simple_input': { inputType: 'text', required: true },
    'multiple_choice': { allowMultiple: false, options: [] },
    'context_screen': { showContinueButton: true },
    'yes_no': { required: true },
    'five_second_test': { duration: 5, showQuestion: true },
    'card_sort': { categories: [], cards: [] },
    'tree_test': { tree: {}, tasks: [] },
    'screener': { questions: [], passingCriteria: {}, required: true },
    'prototype_test': { prototypeUrl: '', tasks: [], recordInteractions: true },
    'live_website_test': { websiteUrl: '', codeSnippet: '', trackClicks: true, trackScrolls: true },
    'thank_you': { 
      message: 'Thank you for participating in our study. Your feedback is valuable to us.',
      showCompletionTime: true,
      redirectUrl: '',
      customMessage: '',
      allowModification: true
    }
  };
  return defaultSettings[blockType] || {};
};

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
          task.type === 'questionnaire' ? 'open_question' : 'welcome' as BlockType,
    settings: (task.configuration as unknown as Record<string, unknown>) || {}
  }));
};

const StudyBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { createStudy, updateStudy } = useAppStore();
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studyBlocks, setStudyBlocks] = useState<StudyBuilderBlock[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showBlockEditModal, setShowBlockEditModal] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState<{
    index: number;
    block: StudyBuilderBlock;
  } | null>(null);
  const [validation, setValidation] = useState<ValidationError[]>([]);

  // Get template data and study type from navigation state
  const templateData = location.state?.template as StudyTemplate | undefined;
  const studyType = location.state?.studyType as string | undefined;

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<StudyFormData>({
    mode: 'onChange',
    defaultValues: {
      title: templateData?.name || '',
      description: templateData?.description || '',
      type: 'usability_test',
      settings: {
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
    }
  });

  // Load study data if editing
  useEffect(() => {
    const loadStudyData = async () => {
      if (id) {
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
              reset({
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
              });

              // Convert tasks to blocks
              if (study.tasks && Array.isArray(study.tasks)) {
                const blocks = convertTasksToBlocks(study.tasks);
                setStudyBlocks(blocks);
              }
              setIsEditing(true);
            }
          }
        } catch (error) {
          console.error('Error loading study:', error);
        }
      }
    };

    loadStudyData();
  }, [id, reset]);

  // Initialize form with template data
  useEffect(() => {
    if (templateData && !id) {
      reset({
        title: templateData.name || '',
        description: templateData.description || '',
        type: studyType === 'usability' ? 'usability' : studyType === 'survey' ? 'survey' : 'usability',
        settings: {
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
      });
      
      // Convert template blocks to StudyBuilderBlocks
      if (templateData.blocks && Array.isArray(templateData.blocks)) {
        const convertedBlocks: StudyBuilderBlock[] = templateData.blocks.map((block, index) => ({
          id: block.id,
          template_id: block.type,
          name: `${getBlockDisplayName(block.type)} ${index + 1}`,
          description: getDefaultBlockDescription(block.type),
          estimated_duration: 2,
          order_index: index,
          type: block.type,
          settings: block.settings || getDefaultBlockSettings(block.type)
        }));
        
        // Add automatic "Thank you" block at the end
        const thankYouBlock: StudyBuilderBlock = {
          id: `block_${Date.now()}_thank_you`,
          template_id: 'thank_you',
          name: 'Thank You!',
          description: 'Thank you for participating in our study. Your feedback is valuable to us.',
          estimated_duration: 1,
          order_index: convertedBlocks.length,
          type: 'thank_you',
          settings: {
            message: 'Thank you for participating in our study. Your feedback is valuable to us.',
            showCompletionTime: true,
            redirectUrl: '',
            customMessage: ''
          }
        };
        
        setStudyBlocks([...convertedBlocks, thankYouBlock]);
      } else {
        // If no template blocks, just add the "Thank you" block
        const thankYouBlock: StudyBuilderBlock = {
          id: `block_${Date.now()}_thank_you`,
          template_id: 'thank_you',
          name: 'Thank You!',
          description: 'Thank you for participating in our study. Your feedback is valuable to us.',
          estimated_duration: 1,
          order_index: 0,
          type: 'thank_you',
          settings: {
            message: 'Thank you for participating in our study. Your feedback is valuable to us.',
            showCompletionTime: true,
            redirectUrl: '',
            customMessage: ''
          }
        };
        
        setStudyBlocks([thankYouBlock]);
      }
    }
  }, [templateData, studyType, id, reset]);

  // Initialize study with "Thank You" block for "Start from Scratch" option
  useEffect(() => {
    if (!templateData && !id && studyBlocks.length === 0) {
      // This means we're starting from scratch, add default "Thank you" block
      const thankYouBlock: StudyBuilderBlock = {
        id: `block_${Date.now()}_thank_you`,
        template_id: 'thank_you',
        name: 'Thank You!',
        description: 'Thank you for participating in our study. Your feedback is valuable to us.',
        estimated_duration: 1,
        order_index: 0,
        type: 'thank_you',
        settings: {
          message: 'Thank you for participating in our study. Your feedback is valuable to us.',
          showCompletionTime: true,
          redirectUrl: '',
          customMessage: '',
          allowModification: true
        }
      };
      
      setStudyBlocks([thankYouBlock]);
    }
  }, [templateData, id, studyBlocks.length]);

  // Create default block function
  const createDefaultBlock = useCallback((blockType: BlockType): StudyBuilderBlock => {
    return {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      template_id: blockType,
      name: getBlockDisplayName(blockType),
      description: getDefaultBlockDescription(blockType),
      estimated_duration: 2,
      order_index: studyBlocks.length,
      type: blockType,
      settings: getDefaultBlockSettings(blockType)
    };
  }, [studyBlocks.length]);

  // Block manipulation handlers
  const handleAddBlock = useCallback((blockType: BlockType) => {
    const newBlock: StudyBuilderBlock = createDefaultBlock(blockType);
    
    // If adding a "Thank you" block, replace the existing one
    if (blockType === 'thank_you') {
      setStudyBlocks(prev => {
        const nonThankYouBlocks = prev.filter(block => block.type !== 'thank_you');
        return [...nonThankYouBlocks, newBlock];
      });
    } else {
      // For other blocks, insert before the "Thank you" block if it exists
      setStudyBlocks(prev => {
        const thankYouIndex = prev.findIndex(block => block.type === 'thank_you');
        if (thankYouIndex === -1) {
          // No "Thank you" block, just add to end
          return [...prev, newBlock];
        } else {
          // Insert before the "Thank you" block
          const newBlocks = [...prev];
          newBlocks.splice(thankYouIndex, 0, { ...newBlock, order_index: thankYouIndex });
          // Update order indices for blocks after insertion
          return newBlocks.map((block, index) => ({ ...block, order_index: index }));
        }
      });
    }
  }, [createDefaultBlock]);

  // Handler to add block from template
  const handleAddBlockFromTemplate = useCallback((template: BlockTemplate) => {
    if (!template.blockType) {
      console.error('Template missing blockType:', template);
      return;
    }
    handleAddBlock(template.blockType);
  }, [handleAddBlock]);

  const handleEditBlock = useCallback((index: number) => {
    const block = studyBlocks[index];
    if (block) {
      setBlockToEdit({ index, block });
      setShowBlockEditModal(true);
    }
  }, [studyBlocks]);

  const handleUpdateBlock = useCallback((updatedBlock: {
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
    type: BlockType;
  }) => {
    if (blockToEdit) {
      const convertedBlock: StudyBuilderBlock = {
        id: updatedBlock.id,
        template_id: updatedBlock.templateId,
        name: updatedBlock.name,
        description: updatedBlock.description,
        estimated_duration: updatedBlock.estimatedDuration,
        order_index: blockToEdit.index,
        type: updatedBlock.type,
        settings: updatedBlock.settings
      };
      const newBlocks = [...studyBlocks];
      newBlocks[blockToEdit.index] = convertedBlock;
      setStudyBlocks(newBlocks);
      setShowBlockEditModal(false);
      setBlockToEdit(null);
    }
  }, [blockToEdit, studyBlocks]);

  const handleDeleteBlock = useCallback((index: number) => {
    const newBlocks = studyBlocks.filter((_, i) => i !== index);
    const reorderedBlocks = newBlocks.map((block, i) => ({
      ...block,
      order_index: i
    }));
    setStudyBlocks(reorderedBlocks);
  }, [studyBlocks]);

  const handleReorderBlocks = useCallback((reorderedBlocks: {
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
    type: BlockType;
  }[]) => {
    const convertedBlocks = reorderedBlocks.map((block) => ({
      id: block.id,
      template_id: block.templateId,
      name: block.name,
      description: block.description,
      estimated_duration: block.estimatedDuration,
      order_index: block.order,
      type: block.type,
      settings: block.settings
    }));
    setStudyBlocks(convertedBlocks);
  }, []);

  // Study submission
  const onSubmit = async (data: StudyFormData) => {
    try {
      setIsSubmitting(true);

      // Validate blocks
      const blockValidation = validateBlocks(studyBlocks);
      if (blockValidation.length > 0) {
        setValidation(blockValidation);
        return;
      }

      // Convert blocks to tasks for API compatibility
      const tasksData = convertBlocksToTaskInput(studyBlocks);

      if (isEditing && id) {
        const updateData = {
          ...data,
          description: data.description || '',
          // updateStudy expects IStudy format, which might handle tasks differently
          tasks: tasksData.map(task => task.title), // Convert to string array for IStudy
          type: data.type as 'usability' | 'survey' | 'interview' | 'card-sorting' | 'a-b-testing'
        };
        await updateStudy(id, updateData);
      } else {
        const createData = {
          ...data,
          description: data.description || '',
          tasks: tasksData,
          status: 'draft' as const,
          type: data.type === 'card-sorting' ? 'prototype' : 
                data.type === 'a-b-testing' ? 'prototype' : 
                (data.type as 'usability' | 'survey' | 'interview' | 'prototype')
        };
        await createStudy(createData);
      }

      navigate('/studies');
    } catch (error) {
      console.error('Error saving study:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert blocks to format expected by DragDropBlockList
  const convertToBlockListFormat = (blocks: StudyBuilderBlock[]) => {
    return blocks.map(block => ({
      id: block.id,
      templateId: block.template_id,
      name: block.name,
      description: block.description,
      estimatedDuration: block.estimated_duration,
      order: block.order_index,
      type: block.type,
      settings: block.settings,
      isRequired: false // Default value for compatibility
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEditing ? 'Edit Study' : 'Create New Study'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Set up your research study with custom blocks
              </p>
            </div>

            {/* Study Details */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Study Title *
                </label>
                <input
                  {...register('title', { required: 'Study title is required' })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter study title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your study..."
                />
              </div>
            </div>

            {/* Study Blocks Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Study Blocks</h2>
                <button
                  type="button"
                  onClick={() => setShowBlockLibrary(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Add Block
                </button>
              </div>

              {studyBlocks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No blocks added yet</p>
                  <button
                    type="button"
                    onClick={() => setShowBlockLibrary(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Add Your First Block
                  </button>
                </div>
              ) : (
                <DragDropBlockList
                  blocks={convertToBlockListFormat(studyBlocks)}
                  onReorderBlocks={handleReorderBlocks}
                  onEditBlock={(block) => {
                    const index = studyBlocks.findIndex(b => b.id === block.id);
                    if (index !== -1) handleEditBlock(index);
                  }}
                  onDuplicateBlock={(block) => {
                    // TODO: Implement duplicate functionality
                    console.log('Duplicate block:', block.id);
                  }}
                  onDeleteBlock={(blockId) => {
                    const index = studyBlocks.findIndex(b => b.id === blockId);
                    if (index !== -1) handleDeleteBlock(index);
                  }}
                  studyType="usability_test"
                />
              )}
            </div>

            {/* Validation Errors */}
            {validation.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validation.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/studies')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Study' : 'Create Study')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      {showBlockLibrary && (
        <BlockLibraryModal
          isOpen={showBlockLibrary}
          onClose={() => setShowBlockLibrary(false)}
          onAddBlock={handleAddBlockFromTemplate}
          studyType="usability_test"
          currentBlocks={[]}
        />
      )}

      {showBlockEditModal && blockToEdit && (
        <BlockEditModal
          isOpen={showBlockEditModal}
          onClose={() => {
            setShowBlockEditModal(false);
            setBlockToEdit(null);
          }}
          block={{
            id: blockToEdit.block.id,
            templateId: blockToEdit.block.template_id,
            name: blockToEdit.block.name,
            description: blockToEdit.block.description,
            estimatedDuration: blockToEdit.block.estimated_duration,
            order: blockToEdit.block.order_index,
            type: blockToEdit.block.type,
            settings: blockToEdit.block.settings,
            isRequired: false
          }}
          onSave={handleUpdateBlock}
        />
      )}
    </div>
  );
};

export default StudyBuilderPage;