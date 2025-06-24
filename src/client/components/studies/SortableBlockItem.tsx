import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, Edit2, Copy, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
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

interface SortableBlockItemProps {
  block: Block;
  index: number;
  onEdit: (block: Block) => void;
  onDuplicate: (block: Block) => void;
  onDelete: (blockId: string) => void;
}

export const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  index,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getBlockIcon = (block: Block) => {
    if (block.icon) return block.icon;
    
    // Default icons for block types
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
      tree_test: '🌳'
    };
    
    return iconMap[block.type] || '📋';
  };

  const getBlockTypeLabel = (blockType: BlockType) => {
    const labelMap: Record<BlockType, string> = {
      welcome: 'Welcome',
      open_question: 'Open Question',
      opinion_scale: 'Opinion Scale',
      simple_input: 'Simple Input',
      multiple_choice: 'Multiple Choice',
      context_screen: 'Context Screen',
      yes_no: 'Yes/No',
      five_second_test: '5-Second Test',
      card_sort: 'Card Sort',
      tree_test: 'Tree Test'
    };
    
    return labelMap[blockType] || 'Unknown Block';
  };

  const getRequiredColor = (isRequired: boolean) => {
    return isRequired 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getRequiredIcon = (isRequired: boolean) => {
    return isRequired ? CheckCircle : AlertCircle;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm
        ${isDragging ? 'opacity-50 shadow-lg border-blue-300' : 'hover:shadow-md'}
        transition-all duration-200
      `}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Block Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>

        {/* Block Icon */}
        <div className="text-2xl">
          {getBlockIcon(block)}
        </div>

        {/* Block Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-medium text-gray-900 truncate">
              {block.name}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {getBlockTypeLabel(block.type)}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-1">
            {block.description || 'No description provided'}
          </p>
        </div>

        {/* Block Metadata */}
        <div className="flex items-center gap-3">
          {/* Duration */}
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {block.estimatedDuration}m
          </div>

          {/* Required Status */}
          <div className={`flex items-center text-xs px-2 py-1 rounded-full border ${getRequiredColor(block.isRequired)}`}>
            {React.createElement(getRequiredIcon(block.isRequired), { className: 'w-3 h-3 mr-1' })}
            {block.isRequired ? 'Required' : 'Optional'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(block)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Block"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(block)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Duplicate Block"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Preview (if any) */}
      {Object.keys(block.settings).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Block settings configured ({Object.keys(block.settings).length} setting{Object.keys(block.settings).length !== 1 ? 's' : ''})
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableBlockItem;
