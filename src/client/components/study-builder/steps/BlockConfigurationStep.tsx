import React, { useState } from 'react';
import { StepProps, StudyBuilderBlock, BlockType, BLOCK_LIBRARY, getBlockDisplayName, getDefaultBlockDescription, getDefaultBlockSettings } from '../types';
import { StudyPreviewModal } from '../StudyPreviewModal';
import { RealTimeBlockPreview } from '../RealTimeBlockPreview';

export const BlockConfigurationStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onPrevious
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Ensure there's always a thank you block at the end
  const ensureThankYouBlock = (blocks: StudyBuilderBlock[]): StudyBuilderBlock[] => {
    const hasThankYou = blocks.some(block => block.type === 'thank_you_screen');
    if (!hasThankYou) {
      const newThankYouBlock: StudyBuilderBlock = {
        id: `block_${Date.now()}`,
        type: 'thank_you_screen',
        order: blocks.length,
        title: 'Thank You',
        description: 'Thank you for participating!',
        settings: getDefaultBlockSettings('thank_you_screen')
      };
      return [...blocks, newThankYouBlock];
    }
    return blocks;
  };

  const blocks = ensureThankYouBlock(formData.blocks || []);

  const addBlock = (type: BlockType) => {
    // Find the thank you block to insert before it
    const thankYouIndex = blocks.findIndex(block => block.type === 'thank_you_screen');
    const insertOrder = thankYouIndex >= 0 ? thankYouIndex : blocks.length;

    const newBlock: StudyBuilderBlock = {
      id: `block_${Date.now()}`,
      type,
      order: insertOrder,
      title: getBlockDisplayName(type),
      description: getDefaultBlockDescription(type),
      settings: getDefaultBlockSettings(type)
    };

    // Update orders for blocks after insertion point
    const updatedBlocks = blocks.map(block => 
      block.order >= insertOrder 
        ? { ...block, order: block.order + 1 }
        : block
    );

    const finalBlocks = [...updatedBlocks, newBlock].sort((a, b) => a.order - b.order);
    onUpdateFormData({ blocks: finalBlocks });
  };

  const removeBlock = (blockId: string) => {
    const blockToRemove = blocks.find(b => b.id === blockId);
    if (blockToRemove?.type === 'thank_you_screen') {
      // Don't allow removing the thank you block
      return;
    }

    const updatedBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    
    onUpdateFormData({ blocks: updatedBlocks });
    setSelectedBlockId(null);
  };
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const block = blocks[blockIndex];
    
    if (!block || block.type === 'thank_you_screen') return; // Don't move thank you block
    
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    // Don't move past thank you block
    const thankYouIndex = blocks.findIndex(b => b.type === 'thank_you_screen');
    if (thankYouIndex >= 0 && newIndex >= thankYouIndex) return;
    
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];
    
    // Update orders
    const finalBlocks = newBlocks.map((block, index) => ({ ...block, order: index }));
    onUpdateFormData({ blocks: finalBlocks });
  };

  const updateBlock = (blockId: string, updates: Partial<StudyBuilderBlock>) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    onUpdateFormData({ blocks: updatedBlocks });
  };

  const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;

  const getBlockIcon = (type: BlockType) => {
    const block = BLOCK_LIBRARY.find(b => b.type === type);
    return block?.icon || '📋';
  };

  const BlockEditor = ({ block }: { block: StudyBuilderBlock }) => {
    const updateBlockField = (field: string, value: unknown) => {
      updateBlock(block.id, {
        ...block,
        [field]: value
      });
    };

    const updateBlockSetting = (setting: string, value: unknown) => {
      updateBlock(block.id, {
        settings: {
          ...block.settings,
          [setting]: value
        }
      });
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit {getBlockDisplayName(block.type)}
          </h3>
          <button
            onClick={() => setSelectedBlockId(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Block Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Block Title
            </label>
            <input
              type="text"
              value={block.title}
              onChange={(e) => updateBlockField('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Block Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={block.description}
              onChange={(e) => updateBlockField('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Block-specific settings */}
          {(block.type === 'feedback_collection' || block.type === 'task_instruction') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={(block.settings as { question?: string }).question || ''}
                  onChange={(e) => updateBlockSetting('question', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={(block.settings as { placeholder?: string }).placeholder || ''}
                  onChange={(e) => updateBlockSetting('placeholder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {block.type === 'rating_scale' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={(block.settings as { question?: string }).question || ''}
                  onChange={(e) => updateBlockSetting('question', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Value
                  </label>
                  <input
                    type="number"
                    value={(block.settings as { minValue?: number }).minValue || 1}
                    onChange={(e) => updateBlockSetting('minValue', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Value
                  </label>
                  <input
                    type="number"
                    value={(block.settings as { maxValue?: number }).maxValue || 10}
                    onChange={(e) => updateBlockSetting('maxValue', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          {block.type === 'comparison_test' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={(block.settings as { imageUrl?: string }).imageUrl || ''}
                  onChange={(e) => updateBlockSetting('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Question
                </label>
                <input
                  type="text"
                  value={(block.settings as { followUpQuestion?: string }).followUpQuestion || ''}
                  onChange={(e) => updateBlockSetting('followUpQuestion', e.target.value)}
                  placeholder="What do you remember seeing?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Required checkbox for applicable blocks */}
          {['open_question', 'simple_input', 'opinion_scale', 'multiple_choice', 'yes_no'].includes(block.type) && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`required-${block.id}`}
                checked={(block.settings as { required?: boolean }).required || false}
                onChange={(e) => updateBlockSetting('required', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`required-${block.id}`} className="text-sm font-medium text-gray-700">
                Required field
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Build your study
        </h2>
        <p className="text-lg text-gray-600">
          Add and configure blocks to create your study flow
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Block Library */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Block Library
            </h3>
            <div className="space-y-2">
              {BLOCK_LIBRARY.filter(block => block.type !== 'thank_you_screen').map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{blockType.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {blockType.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {blockType.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Study Builder */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Study Flow */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Study Flow ({blocks.length} blocks)
                </h3>
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Preview Study
                </button>
              </div>

              {blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No blocks added yet</p>
                  <p className="text-sm">Add blocks from the library to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-all
                        ${selectedBlockId === block.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getBlockIcon(block.type)}</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {block.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getBlockDisplayName(block.type)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {block.type !== 'thank_you_screen' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, 'up');
                                }}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, 'down');
                                }}
                                disabled={index >= blocks.length - 2}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBlock(block.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Layout: Block Editor + Real-time Preview */}
            {selectedBlock && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Block Editor */}
                <BlockEditor block={selectedBlock} />
                
                {/* Real-time Block Preview */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Live Preview
                  </h3>                <RealTimeBlockPreview
                    blocks={blocks}
                    currentEditingBlock={selectedBlock}
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Step 4 of 6
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Continue
          </button>
        </div>
      </div>

      <StudyPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        studyTitle={formData.title || 'Untitled Study'}
        studyDescription={formData.description || 'No description'}
        blocks={blocks}
        onConfirm={() => setShowPreview(false)}
      />
    </div>
  );
};
