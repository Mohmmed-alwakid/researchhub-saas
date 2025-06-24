import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppStore } from '../../stores/appStore';
import { 
  StudyBuilderBlock, 
  BlockType, 
  StudyData, 
  ValidationResult,
  StudyTemplate
} from '../../../shared/types';
import { 
  validateBlocks,
  getBlockDisplayName,
  getDefaultBlockDescription,
  getDefaultBlockSettings
} from '../../utils/validation';
import { 
  convertTasksToBlocks,
  convertBlocksToTaskInput
} from '../../utils/taskConversion';
import BlockLibraryModal from '../../components/studies/BlockLibraryModal';
import DragDropBlockList from '../../components/studies/DragDropBlockList';
import BlockEditModal from '../../components/studies/BlockEditModal';

// Helper function to convert DragDropBlockList Block back to StudyBuilderBlock
const convertFromBlockListFormat = (blockListBlocks: any[]) => {
  return blockListBlocks.map(block => ({
    id: block.id,
    template_id: block.templateId,
    name: block.name,
    description: block.description,
    estimated_duration: block.estimatedDuration,
    order_index: block.order,
    type: block.type,
    settings: block.settings
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
  const [validation, setValidation] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [],
    warnings: [],
    suggestions: []
  });

  // Get template data from navigation state
  const templateData = location.state?.template as StudyTemplate | undefined;

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<StudyData>({
    mode: 'onChange',
    defaultValues: {
      title: templateData?.name || '',
      description: templateData?.description || '',
      settings: {
        recording_enabled: false,
        allow_anonymous: true,
        max_participants: null,
        estimated_duration: 10,
        auto_approve: true,
        require_audio: false,
        require_video: false,
        moderator_present: false
      }
    }
  });

  // Watch form values
  const watchedValues = watch();

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
                settings: study.settings || {
                  recording_enabled: false,
                  allow_anonymous: true,
                  max_participants: null,
                  estimated_duration: 10,
                  auto_approve: true,
                  require_audio: false,
                  require_video: false,
                  moderator_present: false
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
        settings: {
          recording_enabled: false,
          allow_anonymous: true,
          max_participants: templateData.participantCount || 10,
          estimated_duration: templateData.estimatedDuration || 30,
          auto_approve: true,
          require_audio: false,
          require_video: false,
          moderator_present: false
        }
      });

      if (templateData.blocks && Array.isArray(templateData.blocks)) {
        setStudyBlocks(templateData.blocks);
      }
    }
  }, [templateData, id, reset]);

  // Block manipulation handlers
  const handleAddBlock = useCallback((blockType: BlockType) => {
    const newBlock: StudyBuilderBlock = {
      id: crypto.randomUUID(),
      template_id: blockType,
      name: getBlockDisplayName(blockType),
      description: getDefaultBlockDescription(blockType),
      estimated_duration: 2,
      order_index: studyBlocks.length,
      type: blockType,
      settings: getDefaultBlockSettings(blockType)
    };

    setStudyBlocks(prev => [...prev, newBlock]);
    setShowBlockLibrary(false);
  }, [studyBlocks]);

  const handleEditBlock = useCallback((index: number) => {
    const block = studyBlocks[index];
    if (block) {
      setBlockToEdit({ index, block });
      setShowBlockEditModal(true);
    }
  }, [studyBlocks]);

  const handleUpdateBlock = useCallback((updatedBlock: StudyBuilderBlock) => {
    if (blockToEdit) {
      const newBlocks = [...studyBlocks];
      newBlocks[blockToEdit.index] = updatedBlock;
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

  const handleReorderBlocks = useCallback((reorderedBlocks: any[]) => {
    const convertedBlocks = convertFromBlockListFormat(reorderedBlocks);
    setStudyBlocks(convertedBlocks);
  }, []);

  // Study submission
  const onSubmit = async (data: StudyData) => {
    try {
      setIsSubmitting(true);

      // Validate blocks
      const blockValidation = validateBlocks(studyBlocks);
      if (!blockValidation.isValid) {
        setValidation(blockValidation);
        return;
      }

      // Convert blocks to tasks for API compatibility
      const tasksData = convertBlocksToTaskInput(studyBlocks);

      const studyData = {
        ...data,
        tasks: tasksData
      };

      if (isEditing && id) {
        await updateStudy(id, studyData);
      } else {
        await createStudy(studyData);
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
      settings: block.settings
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
                  onReorder={handleReorderBlocks}
                  onEdit={handleEditBlock}
                  onDelete={handleDeleteBlock}
                />
              )}
            </div>

            {/* Validation Errors */}
            {!validation.isValid && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
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
          onSelectBlock={handleAddBlock}
        />
      )}

      {showBlockEditModal && blockToEdit && (
        <BlockEditModal
          isOpen={showBlockEditModal}
          onClose={() => {
            setShowBlockEditModal(false);
            setBlockToEdit(null);
          }}
          block={blockToEdit.block}
          onSave={handleUpdateBlock}
        />
      )}
    </div>
  );
};

export default StudyBuilderPage;
