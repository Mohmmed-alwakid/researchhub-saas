import React, { useState } from 'react';
import { StepProps, StudyBuilderBlock, BlockType, BLOCK_LIBRARY, getBlockDisplayName, getDefaultBlockDescription, getDefaultBlockSettings } from '../types';
import { StudyPreviewModal } from '../StudyPreviewModal';
import { EnhancedBlockPreview } from '../enhanced/EnhancedBlockPreview';
import { EnhancedBlockEditor } from '../enhanced/EnhancedBlockEditor';

export const BlockConfigurationStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewBlockIndex, setPreviewBlockIndex] = useState(0);
  const [participantData, setParticipantData] = useState<Record<string, string | number | boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter blocks based on search and category
  const filteredBlocks = BLOCK_LIBRARY
    .filter(block => block.type !== 'thank_you_screen' && block.type !== 'welcome_screen')
    .filter(block => {
      const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           block.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             block.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });

  // Ensure there's always a welcome block at the beginning and a thank you block at the end
  const ensureRequiredBlocks = (blocks: StudyBuilderBlock[]): StudyBuilderBlock[] => {
    let updatedBlocks = [...blocks];
    
    // Ensure Welcome Screen at the beginning
    const hasWelcome = updatedBlocks.some(block => block.type === 'welcome_screen');
    if (!hasWelcome) {
      const newWelcomeBlock: StudyBuilderBlock = {
        id: `block_${Date.now()}_welcome`,
        type: 'welcome_screen',
        order: 0,
        title: 'Welcome',
        description: 'Welcome to our study!',
        settings: getDefaultBlockSettings('welcome_screen')
      };
      updatedBlocks = [newWelcomeBlock, ...updatedBlocks];
    }
    
    // Ensure Thank You block at the end
    const hasThankYou = updatedBlocks.some(block => block.type === 'thank_you_screen');
    if (!hasThankYou) {
      const newThankYouBlock: StudyBuilderBlock = {
        id: `block_${Date.now()}_thank_you`,
        type: 'thank_you_screen',
        order: updatedBlocks.length,
        title: 'Thank You',
        description: 'Thank you for participating!',
        settings: getDefaultBlockSettings('thank_you_screen')
      };
      updatedBlocks = [...updatedBlocks, newThankYouBlock];
    }
    
    // Reorder blocks to ensure correct order
    return updatedBlocks.map((block, index) => ({ ...block, order: index }));
  };

  const blocks = ensureRequiredBlocks(formData.blocks || []);

  // Participant preview navigation helpers
  const currentPreviewBlock = blocks[previewBlockIndex] || blocks[0];
  const isFirstBlock = previewBlockIndex === 0;
  const isLastBlock = previewBlockIndex >= blocks.length - 1;

  const goToNextPreviewBlock = () => {
    if (!isLastBlock) {
      setPreviewBlockIndex(prev => Math.min(prev + 1, blocks.length - 1));
    }
  };

  const goToPreviousPreviewBlock = () => {
    if (!isFirstBlock) {
      setPreviewBlockIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const updateParticipantData = (blockId: string, value: string | number | boolean) => {
    setParticipantData(prev => ({
      ...prev,
      [blockId]: value
    }));
  };

  const addBlock = (type: BlockType, insertAfterIndex?: number) => {
    console.log('🧩 Adding block:', type, 'at position:', insertAfterIndex);
    console.log('📊 Current blocks before:', blocks.length);
    
    let insertOrder: number;
    
    if (insertAfterIndex !== undefined) {
      // Insert after specific block
      insertOrder = insertAfterIndex + 1;
    } else {
      // Default: Find the thank you block to insert before it
      const thankYouIndex = blocks.findIndex(block => block.type === 'thank_you_screen');
      insertOrder = thankYouIndex >= 0 ? thankYouIndex : blocks.length;
    }

    const newBlock: StudyBuilderBlock = {
      id: `block_${Date.now()}`,
      type,
      order: insertOrder,
      title: getBlockDisplayName(type),
      description: getDefaultBlockDescription(type),
      settings: getDefaultBlockSettings(type)
    };

    console.log('✨ New block created:', newBlock);

    // Update orders for blocks after insertion point
    const updatedBlocks = blocks.map(block => 
      block.order >= insertOrder 
        ? { ...block, order: block.order + 1 }
        : block
    );

    const finalBlocks = [...updatedBlocks, newBlock].sort((a, b) => a.order - b.order);
    console.log('📋 Final blocks array:', finalBlocks);
    console.log('📊 Content blocks count:', finalBlocks.filter(b => b.type !== 'welcome_screen' && b.type !== 'thank_you_screen').length);
    
    onUpdateFormData({ blocks: finalBlocks });
    console.log('✅ Block added successfully');
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find(b => b.id === blockId);
    if (!blockToDuplicate || blockToDuplicate.type === 'welcome_screen' || blockToDuplicate.type === 'thank_you_screen') {
      return;
    }

    const duplicatedBlock: StudyBuilderBlock = {
      ...blockToDuplicate,
      id: `block_${Date.now()}`,
      title: `${blockToDuplicate.title} (Copy)`,
      order: blockToDuplicate.order + 1
    };

    // Update orders for blocks after the duplicated block
    const updatedBlocks = blocks.map(block => 
      block.order > blockToDuplicate.order 
        ? { ...block, order: block.order + 1 }
        : block
    );

    const finalBlocks = [...updatedBlocks, duplicatedBlock].sort((a, b) => a.order - b.order);
    onUpdateFormData({ blocks: finalBlocks });
  };

  const removeBlock = (blockId: string) => {
    const blockToRemove = blocks.find(b => b.id === blockId);
    if (blockToRemove?.type === 'thank_you_screen' || blockToRemove?.type === 'welcome_screen') {
      // Don't allow removing the welcome screen or thank you block
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
    
    if (!block || block.type === 'thank_you_screen' || block.type === 'welcome_screen') {
      // Don't move welcome screen or thank you block
      return; 
    }
    
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    // Don't move past welcome screen or thank you block
    const welcomeIndex = blocks.findIndex(b => b.type === 'welcome_screen');
    const thankYouIndex = blocks.findIndex(b => b.type === 'thank_you_screen');
    
    if (newIndex <= welcomeIndex || (thankYouIndex >= 0 && newIndex >= thankYouIndex)) return;
    
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

  const getBlockIcon = (type: BlockType) => {
    const block = BLOCK_LIBRARY.find(b => b.type === type);
    return block?.icon || '📋';
  };

  // Use EnhancedBlockEditor instead of the basic BlockEditor
  const BlockEditor = ({ block }: { block: StudyBuilderBlock }) => {
    return (
      <EnhancedBlockEditor 
        block={block} 
        onUpdate={updateBlock}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area - Maximized */}
      <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4 py-3">
        {/* Professional 3-Column Layout - Optimized proportions: 30% | 40% | 30% */}
        <div className="grid grid-cols-12 gap-2 h-full">
          
          {/* Left Sidebar - Block Library (30% ≈ 3.6 columns) */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sticky top-20 max-h-[calc(100vh-4rem)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Block Library</h2>
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {filteredBlocks.length} available
                </div>
              </div>

              {/* Enhanced Search Bar */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search blocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex space-x-1">
                  {['all', 'survey', 'usability', 'research'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Block List */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredBlocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">🔍</div>
                    <p className="text-xs font-medium">No blocks found</p>
                  </div>
                ) : (
                  filteredBlocks.map((blockType) => (
                    <div
                      key={blockType.type}
                      className="group relative"
                    >
                      <button
                        onClick={() => addBlock(blockType.type)}
                        className="w-full p-3 text-left border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all group bg-white"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('blockType', blockType.type);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-xl group-hover:scale-110 transition-transform">
                              {blockType.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-xs group-hover:text-blue-700 transition-colors">
                              {blockType.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {blockType.description}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Professional Quick Tip - REMOVED */}
            </div>
          </div>

          {/* Center - Study Flow Management (40% ≈ 4.8 columns) */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Study Flow</h2>
                  <p className="text-xs text-gray-500 mt-1">Configure your participant experience</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-lg">
                    {blocks.length} blocks
                  </div>
                </div>
              </div>

              {/* Professional Study Flow List */}
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-3xl mb-3">📋</div>
                  <p className="text-sm font-semibold mb-2">Build your study flow</p>
                  <p className="text-xs text-gray-400 mb-3">Add blocks from the library to create your participant experience</p>
                </div>
              ) : (
                <div 
                  className="space-y-2 min-h-32"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const blockType = e.dataTransfer.getData('blockType') as BlockType;
                    if (blockType) {
                      addBlock(blockType);
                    }
                  }}
                >
                  {blocks.map((block, index) => (
                    <div key={block.id} className="space-y-2">
                      {/* Insertion Point Above Block (except for welcome screen) */}
                      {index > 0 && block.type !== 'welcome_screen' && (
                        <div className="group relative py-2">
                          <div className="flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button
                                onClick={() => addBlock('feedback_collection', index - 1)}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
                                title="Add block here"
                              >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add Block Here
                              </button>
                            </div>
                          </div>
                          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent group-hover:via-blue-400 transition-colors"></div>
                        </div>
                      )}

                      {/* Block Card */}
                      <div
                        className={`group relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedBlockId === block.id
                            ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                        } ${
                          (block.type === 'welcome_screen' || block.type === 'thank_you_screen') 
                            ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' 
                            : ''
                        }`}
                        onClick={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="text-lg">{getBlockIcon(block.type)}</div>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-sm">
                                {block.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {getBlockDisplayName(block.type)}
                              </div>
                              {block.description && (
                                <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                                  {block.description}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {selectedBlockId === block.id && (
                                <div className="flex items-center space-x-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                  <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs font-medium">Editing</span>
                                </div>
                              )}
                            </div>
                          </div>

          {/* Professional Action Buttons */}
          <div className="flex items-center space-x-1">
            {block.type !== 'thank_you_screen' && block.type !== 'welcome_screen' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, 'up');
                  }}
                  disabled={index <= 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  title="Move up"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, 'down');
                  }}
                  disabled={index >= blocks.length - 2}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
                  title="Move down"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateBlock(block.id);
                  }}
                  className="p-1 text-gray-400 hover:text-green-600 rounded hover:bg-green-50 transition-colors"
                  title="Duplicate block"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(block.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Remove block"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </div>
                        </div>
                      </div>

                      {/* Inline Block Editor - Shows under selected block */}
                      {selectedBlockId === block.id && (
                        <div className="transition-all duration-300 ease-in-out">
                          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-md flex items-center justify-center">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">
                                    Edit {getBlockDisplayName(block.type)}
                                  </h3>
                                  <p className="text-xs text-gray-500">Configure block settings and content</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedBlockId(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                                title="Close editor"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Block Editor Content - Full Width */}
                            <div className="w-full">
                              <BlockEditor block={block} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Enhanced Drop Zone */}
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-blue-600 bg-blue-50 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Drag blocks from library or click + buttons above</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Interactive Participant Preview (30% ≈ 3.6 columns) */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sticky top-20 max-h-[calc(100vh-4rem)]">
                <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Live Preview</h3>
                </div>
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-2 py-1 text-blue-600 hover:text-blue-700 text-xs font-medium rounded hover:bg-blue-50 transition-colors"
                  title="Full preview"
                >
                  Full Preview
                </button>
              </div>

              {/* Interactive Participant Preview Area */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                {blocks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-2xl mb-2">👁️</div>
                    <p className="text-xs font-medium mb-1">Preview will appear here</p>
                    <p className="text-xs text-gray-400">Add blocks to see your study flow</p>
                  </div>
                ) : selectedBlockId ? (
                  <div className="h-80 overflow-y-auto">
                    {/* Enhanced Block Preview */}
                    {(() => {
                      const selectedBlock = blocks.find(b => b.id === selectedBlockId);
                      if (!selectedBlock) return null;
                      
                      return (
                        <div className="p-2">
                          <EnhancedBlockPreview 
                            block={selectedBlock}
                            participantData={participantData}
                            onParticipantDataChange={setParticipantData}
                            isInteractive={true}
                          />
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="h-80 overflow-hidden flex flex-col">
                    {/* Participant Experience Simulation */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900 text-sm">Participant View</h4>
                          <p className="text-xs text-blue-700">
                            Block {previewBlockIndex + 1} of {blocks.length}
                          </p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Interactive Preview
                        </div>
                      </div>
                    </div>

                    {/* Current Block Display */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {currentPreviewBlock && (
                        <div className="space-y-3">
                          {/* Block Title and Description */}
                          <div className="text-center">
                            <div className="text-2xl mb-2">{getBlockIcon(currentPreviewBlock.type)}</div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">
                              {currentPreviewBlock.title}
                            </h3>
                            {currentPreviewBlock.description && (
                              <p className="text-xs text-gray-600 mb-3">
                                {currentPreviewBlock.description}
                              </p>
                            )}
                          </div>

                          {/* Interactive Block Content */}
                          {currentPreviewBlock.type === 'feedback_collection' && (
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700">
                                {(currentPreviewBlock.settings as { question?: string }).question || 'Your feedback please:'}
                              </label>
                              <textarea 
                                className="w-full p-2 border border-gray-300 rounded text-xs resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={(currentPreviewBlock.settings as { placeholder?: string }).placeholder || 'Type your feedback here...'}
                                rows={2}
                                value={participantData[currentPreviewBlock.id] as string || ''}
                                onChange={(e) => updateParticipantData(currentPreviewBlock.id, e.target.value)}
                              />
                            </div>
                          )}

                          {currentPreviewBlock.type === 'rating_scale' && (
                            <div className="space-y-3">
                              <label className="block text-xs font-medium text-gray-700 text-center">
                                {(currentPreviewBlock.settings as { question?: string }).question || 'Please rate this:'}
                              </label>
                              <div className="flex items-center justify-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {(currentPreviewBlock.settings as { minValue?: number }).minValue || 1}
                                </span>
                                <div className="flex space-x-1">
                                  {Array.from({ length: Math.min(((currentPreviewBlock.settings as { maxValue?: number }).maxValue || 10) - ((currentPreviewBlock.settings as { minValue?: number }).minValue || 1) + 1, 5) }, (_, i) => {
                                    const value = ((currentPreviewBlock.settings as { minValue?: number }).minValue || 1) + i;
                                    const isSelected = participantData[currentPreviewBlock.id] === value;
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => updateParticipantData(currentPreviewBlock.id, value)}
                                        className={`w-7 h-7 rounded-full border-2 transition-all text-xs ${
                                          isSelected 
                                            ? 'bg-blue-500 border-blue-500 text-white' 
                                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                      >
                                        {value}
                                      </button>
                                    );
                                  })}
                                  {((currentPreviewBlock.settings as { maxValue?: number }).maxValue || 10) > 5 && (
                                    <span className="text-xs text-gray-400">...</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {(currentPreviewBlock.settings as { maxValue?: number }).maxValue || 10}
                                </span>
                              </div>
                            </div>
                          )}

                          {currentPreviewBlock.type === 'task_instruction' && (
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700">
                                {(currentPreviewBlock.settings as { question?: string }).question || 'Please provide your input:'}
                              </label>
                              <input 
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={(currentPreviewBlock.settings as { placeholder?: string }).placeholder || 'Your answer...'}
                                value={participantData[currentPreviewBlock.id] as string || ''}
                                onChange={(e) => updateParticipantData(currentPreviewBlock.id, e.target.value)}
                              />
                            </div>
                          )}

                          {(currentPreviewBlock.type === 'welcome_screen' || currentPreviewBlock.type === 'thank_you_screen') && (
                            <div className="text-center py-3">
                              <div className="text-3xl mb-3">
                                {currentPreviewBlock.type === 'welcome_screen' ? '👋' : '🙏'}
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                {currentPreviewBlock.title}
                              </h3>
                              <p className="text-xs text-gray-600">
                                {currentPreviewBlock.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation Controls */}
                    <div className="bg-gray-50 p-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={goToPreviousPreviewBlock}
                          disabled={isFirstBlock}
                          className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Previous</span>
                        </button>

                        <div className="flex space-x-1">
                          {blocks.map((_, index) => (
                            <div
                              key={index}
                              className={`w-1.5 h-1.5 rounded-full ${
                                index === previewBlockIndex ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={goToNextPreviewBlock}
                          disabled={isLastBlock}
                          className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span>{isLastBlock ? 'Complete' : 'Next'}</span>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Controls */}
              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                >
                  Open Full Preview →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Preview Modal */}
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
