import { BlockType } from '../../shared/types';

/**
 * Utility functions for managing study blocks
 */

/**
 * Get display name for a block type
 */
export const getBlockDisplayName = (blockType: BlockType): string => {
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
    'thank_you': 'Thank You!',
    'image_upload': 'Image Upload',
    'file_upload': 'File Upload'
  };
  return displayNames[blockType] || blockType;
};

/**
 * Get default description for a block type
 */
export const getDefaultBlockDescription = (blockType: BlockType): string => {
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
    'thank_you': 'Thank you message and study completion',
    'image_upload': 'Allow participants to upload images',
    'file_upload': 'Allow participants to upload files and documents'
  };
  return descriptions[blockType] || 'Custom block';
};

/**
 * Get default settings for a block type
 */
export const getDefaultBlockSettings = (blockType: BlockType): Record<string, unknown> => {
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
    },
    'image_upload': {
      instructions: 'Please upload an image',
      maxFiles: 1,
      maxSizeBytes: 5242880, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      required: true
    },
    'file_upload': {
      instructions: 'Please upload a file',
      maxFiles: 1,
      maxSizeBytes: 10485760, // 10MB
      allowedFormats: ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx'],
      required: true
    }
  };
  return defaultSettings[blockType] || {};
};

/**
 * Check if a block type should always be included at the end of a study
 */
export const isAlwaysIncludedBlock = (blockType: BlockType): boolean => {
  return blockType === 'thank_you';
};

/**
 * Generate a unique block ID
 */
export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a default block with the specified type
 */
export const createDefaultBlock = (blockType: BlockType, orderIndex: number = 0) => {
  return {
    id: generateBlockId(),
    template_id: `template_${blockType}_${Date.now()}`,
    name: getBlockDisplayName(blockType),
    description: getDefaultBlockDescription(blockType),
    estimated_duration: 2, // Default 2 minutes
    order_index: orderIndex,
    type: blockType,
    settings: getDefaultBlockSettings(blockType)
  };
};

/**
 * Validate block configuration
 */
export const validateBlock = (block: {
  name?: string;
  type?: BlockType;
  settings?: Record<string, unknown>;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!block.name?.trim()) {
    errors.push('Block name is required');
  }

  if (!block.type) {
    errors.push('Block type is required');
  }

  // Type-specific validation
  switch (block.type) {
    case 'multiple_choice': {
      const options = block.settings?.options as unknown[];
      if (!Array.isArray(options) || options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
      break;
    }
    case 'opinion_scale': {
      const min = block.settings?.min as number;
      const max = block.settings?.max as number;
      if (!min || !max || max <= min) {
        errors.push('Opinion scale must have valid min and max values');
      }
      break;
    }
    case 'five_second_test': {
      const duration = block.settings?.duration as number;
      if (!duration || duration < 1) {
        errors.push('Five second test must have a duration of at least 1 second');
      }
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
