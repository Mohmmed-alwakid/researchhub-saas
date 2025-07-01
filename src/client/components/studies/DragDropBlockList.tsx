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
import SortableBlockItem from './SortableBlockItem';
import type { BlockType } from '../../../shared/types/index';

interface Block {
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
}

interface DragDropBlockListProps {
  blocks: Block[];
  onReorderBlocks: (blocks: Block[]) => void;
  onEditBlock: (block: Block) => void;
  onDuplicateBlock: (block: Block) => void;
  onDeleteBlock: (blockId: string) => void;
  studyType: string;
}

export const DragDropBlockList: React.FC<DragDropBlockListProps> = ({
  blocks,
  onReorderBlocks,
  onEditBlock,
  onDuplicateBlock,
  onDeleteBlock,
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
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over?.id);

      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
      
      // Update order property
      const updatedBlocks = reorderedBlocks.map((block, index) => ({
        ...block,
        order: index + 1
      }));

      onReorderBlocks(updatedBlocks);
    }
  };

  const getTotalDuration = () => {
    return blocks.reduce((total, block) => total + block.estimatedDuration, 0);
  };

  const getBlockTypeIcon = (blockType: BlockType) => {
    const iconMap: Record<BlockType, string> = {
      welcome: '👋',
      open_question: '💭',
      opinion_scale: '⭐',
      simple_input: '📝',
      multiple_choice: '☑️',
      context_screen: '📄',
      yes_no: '✅',
      five_second_test: '⏱️',
      card_sort: '🗂️',
      tree_test: '🌳',
      screener: '🔍',
      prototype_test: '📱',
      live_website_test: '🌐',
      thank_you: '🙏',
      image_upload: '📸',
      file_upload: '📎'
    };
    return iconMap[blockType] || '📋';
  };

  if (blocks.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🧩</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks added yet</h3>
        <p className="text-gray-600 mb-4">
          Add blocks from the library to build your {studyType.replace('_', ' ')} study
        </p>
        <div className="text-sm text-gray-500">
          💡 Tip: Use the "Add Block" button to browse available block templates
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
            <div className="flex items-center text-blue-700">
              <span className="text-2xl mr-2">🧩</span>
              <span className="font-medium">{blocks.length} Block{blocks.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-blue-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-medium">{getTotalDuration()} minutes</span>
            </div>
          </div>
          <div className="text-sm text-blue-600">
            Study Type: {studyType.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <SortableBlockItem
                key={block.id}
                block={{
                  ...block,
                  icon: getBlockTypeIcon(block.type)
                }}
                index={index}
                onEdit={onEditBlock}
                onDuplicate={onDuplicateBlock}
                onDelete={onDeleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Helper Text */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        <p>💡 Drag and drop blocks to reorder them. Participants will see blocks in this sequence.</p>
      </div>
    </div>
  );
};
