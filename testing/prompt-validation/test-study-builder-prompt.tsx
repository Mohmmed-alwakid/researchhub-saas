// Test file for Study Builder prompt validation
// This file should trigger study-builder.md prompt
// Expected: Copilot should understand StudyBuilderBlock interface and block patterns

import React, { useState } from 'react';

// ResearchHub types and interfaces
type BlockType = 
  | 'welcome' | 'open_question' | 'opinion_scale' | 'simple_input' 
  | 'multiple_choice' | 'context_screen' | 'yes_no' | '5_second_test' 
  | 'card_sort' | 'tree_test' | 'thank_you' | 'image_upload' | 'file_upload';

interface StudyBuilderBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description: string;
  settings: Record<string, unknown>;
}

// Utility function for generating UUIDs
const generateUUID = (): string => {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Test 1: StudyBuilderBlock interface usage
// Copilot should suggest proper block types and structure
interface TestStudyBlock {
  id: string;
  type: BlockType; // Copilot should suggest BlockType union here
  order: number;
  title: string;
  settings: Record<string, unknown>;
}

// Test 2: Block display name helper
// Copilot should understand the getBlockDisplayName pattern
const getTestBlockName = (blockType: BlockType): string => {
  // Copilot should suggest the display name mapping pattern
  const displayNames: Record<BlockType, string> = {
    welcome: 'Welcome Screen',
    open_question: 'Open Question',
    opinion_scale: 'Opinion Scale',
    simple_input: 'Simple Input',
    multiple_choice: 'Multiple Choice',
    context_screen: 'Context Screen',
    yes_no: 'Yes/No Question',
    '5_second_test': '5-Second Test',
    card_sort: 'Card Sorting',
    tree_test: 'Tree Test',
    thank_you: 'Thank You Screen',
    image_upload: 'Image Upload',
    file_upload: 'File Upload'
  };
  return displayNames[blockType] || blockType;
};

// Test 3: Study Builder component pattern
// Copilot should suggest proper React patterns for study creation
export const TestStudyBuilder: React.FC = () => {
  const [blocks, setBlocks] = useState<StudyBuilderBlock[]>([]);
  
  // Copilot should suggest block manipulation functions
  const addBlock = (blockType: BlockType): void => {
    // Should suggest proper block creation with UUID, order, etc.
    const newBlock: StudyBuilderBlock = {
      id: generateUUID(),
      type: blockType,
      order: blocks.length,
      title: getTestBlockName(blockType),
      description: '',
      settings: {}
    };
    setBlocks([...blocks, newBlock]);
  };
  
  const handleBlockReorder = (dragIndex: number, hoverIndex: number): void => {
    // Should suggest drag & drop reordering logic
    const draggedBlock = blocks[dragIndex];
    const reorderedBlocks = [...blocks];
    reorderedBlocks.splice(dragIndex, 1);
    reorderedBlocks.splice(hoverIndex, 0, draggedBlock);
    setBlocks(reorderedBlocks);
  };
  
  const ensureThankYouBlock = (currentBlocks: StudyBuilderBlock[]): StudyBuilderBlock[] => {
    // Should suggest automatic thank you block appending logic
    const hasThankYou = currentBlocks.some(block => block.type === 'thank_you');
    if (!hasThankYou) {
      const thankYouBlock: StudyBuilderBlock = {
        id: generateUUID(),
        type: 'thank_you',
        order: currentBlocks.length,
        title: 'Thank You',
        description: 'Thank you for participating in this study!',
        settings: {}
      };
      return [...currentBlocks, thankYouBlock];
    }
    return currentBlocks;
  };
  
  return (
    <div>
      {/* Copilot should suggest proper study builder UI patterns */}
    </div>
  );
};

// Test 4: Block-specific settings
// Copilot should understand different block types and their settings
const createOpinionScaleBlock = () => {
  return {
    id: generateUUID(),
    type: 'opinion_scale',
    settings: {
      // Copilot should suggest opinion scale specific settings
      
    }
  };
};

const create5SecondTestBlock = () => {
  return {
    id: generateUUID(),
    type: '5_second_test',
    settings: {
      // Copilot should suggest 5-second test specific settings
      
    }
  };
};