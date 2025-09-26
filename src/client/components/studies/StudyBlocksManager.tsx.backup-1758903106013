import React, { useCallback } from 'react';
import { BlockType, BlockTemplate } from '../../../shared/types';
import { createDefaultBlock } from '../../utils/blockUtils';
import { BlockLibraryModal } from './BlockLibraryModal';
import { DragDropBlockList } from './DragDropBlockList';
import { BlockEditModal } from './BlockEditModal';

export interface StudyBuilderBlock {
  id: string;
  template_id: string;
  name: string;
  description: string;
  estimated_duration: number;
  order_index: number;
  type: BlockType;
  settings: Record<string, unknown>;
}

interface StudyBlocksManagerProps {
  studyBlocks: StudyBuilderBlock[];
  setStudyBlocks: React.Dispatch<React.SetStateAction<StudyBuilderBlock[]>>;
  showBlockLibrary: boolean;
  setShowBlockLibrary: React.Dispatch<React.SetStateAction<boolean>>;
  showBlockEditModal: boolean;
  setShowBlockEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  blockToEdit: { index: number; block: StudyBuilderBlock } | null;
  setBlockToEdit: React.Dispatch<React.SetStateAction<{ index: number; block: StudyBuilderBlock } | null>>;
  isSubmitting: boolean;
  studyType?: string;
}

export const StudyBlocksManager: React.FC<StudyBlocksManagerProps> = ({
  studyBlocks,
  setStudyBlocks,
  showBlockLibrary,
  setShowBlockLibrary,
  showBlockEditModal,
  setShowBlockEditModal,
  blockToEdit,
  setBlockToEdit,
  isSubmitting,
  studyType = 'usability'
}) => {
  // Block manipulation handlers
  const handleAddBlock = useCallback((blockType: BlockType) => {
    const newBlock: StudyBuilderBlock = {
      ...createDefaultBlock(blockType, studyBlocks.length),
      template_id: blockType,
    };
    
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
  }, [studyBlocks.length, setStudyBlocks]);

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
  }, [studyBlocks, setBlockToEdit, setShowBlockEditModal]);

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
  }, [blockToEdit, studyBlocks, setStudyBlocks, setShowBlockEditModal, setBlockToEdit]);

  const handleDeleteBlock = useCallback((index: number) => {
    const newBlocks = studyBlocks.filter((_, i) => i !== index);
    const reorderedBlocks = newBlocks.map((block, i) => ({
      ...block,
      order_index: i
    }));
    setStudyBlocks(reorderedBlocks);
  }, [studyBlocks, setStudyBlocks]);

  // Convert StudyBuilderBlock to the expected Block interface for DragDropBlockList
  const convertToBlockInterface = (blocks: StudyBuilderBlock[]) => {
    return blocks.map(block => ({
      id: block.id,
      templateId: block.template_id,
      name: block.name,
      description: block.description,
      estimatedDuration: block.estimated_duration,
      settings: block.settings,
      order: block.order_index,
      isRequired: true,
      type: block.type
    }));
  };

  // Handlers for DragDropBlockList that work with the Block interface
  const handleEditBlockInterface = useCallback((block: {
    id: string;
    templateId: string;
    name: string;
    description: string;
    estimatedDuration: number;
    settings: Record<string, unknown>;
    order: number;
    isRequired: boolean;
    type: BlockType;
  }) => {
    const index = studyBlocks.findIndex(b => b.id === block.id);
    if (index !== -1) {
      handleEditBlock(index);
    }
  }, [studyBlocks, handleEditBlock]);

  const handleDeleteBlockInterface = useCallback((blockId: string) => {
    const index = studyBlocks.findIndex(b => b.id === blockId);
    if (index !== -1) {
      handleDeleteBlock(index);
    }
  }, [studyBlocks, handleDeleteBlock]);

  const handleDuplicateBlock = useCallback((block: {
    id: string;
    templateId: string;
    name: string;
    description: string;
    estimatedDuration: number;
    settings: Record<string, unknown>;
    order: number;
    isRequired: boolean;
    type: BlockType;
  }) => {
    const newBlock: StudyBuilderBlock = {
      id: `${block.id}_copy_${Date.now()}`,
      template_id: block.templateId,
      name: `${block.name} (Copy)`,
      description: block.description,
      estimated_duration: block.estimatedDuration,
      order_index: studyBlocks.length,
      type: block.type,
      settings: { ...block.settings }
    };
    setStudyBlocks(prev => [...prev, newBlock]);
  }, [studyBlocks.length, setStudyBlocks]);

  const handleReorderBlocksInterface = useCallback((newBlocks: {
    id: string;
    templateId: string;
    name: string;
    description: string;
    estimatedDuration: number;
    settings: Record<string, unknown>;
    order: number;
    isRequired: boolean;
    type: BlockType;
  }[]) => {
    const convertedBlocks: StudyBuilderBlock[] = newBlocks.map((block, index) => ({
      id: block.id,
      template_id: block.templateId,
      name: block.name,
      description: block.description,
      estimated_duration: block.estimatedDuration,
      order_index: index,
      type: block.type,
      settings: block.settings
    }));
    setStudyBlocks(convertedBlocks);
  }, [setStudyBlocks]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Study Blocks</h3>
        <button
          type="button"
          onClick={() => setShowBlockLibrary(true)}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Block
        </button>
      </div>

      <DragDropBlockList
        blocks={convertToBlockInterface(studyBlocks)}
        onEditBlock={handleEditBlockInterface}
        onDeleteBlock={handleDeleteBlockInterface}
        onReorderBlocks={handleReorderBlocksInterface}
        onDuplicateBlock={handleDuplicateBlock}
        studyType={studyType}
      />

      {/* Block Library Modal */}
      {showBlockLibrary && (
        <BlockLibraryModal
          isOpen={showBlockLibrary}
          onClose={() => setShowBlockLibrary(false)}
          onAddBlock={handleAddBlockFromTemplate}
          studyType={studyType}
          currentBlocks={convertToBlockInterface(studyBlocks)}
        />
      )}

      {/* Block Edit Modal */}
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
            settings: blockToEdit.block.settings,
            order: blockToEdit.index,
            isRequired: true,
            type: blockToEdit.block.type
          }}
          onSave={handleUpdateBlock}
        />
      )}
    </div>
  );
};
