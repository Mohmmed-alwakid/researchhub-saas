/**
 * ResearchHub Study Blocks Registry - Simplified Version
 * Vibe-Coder-MCP Implementation - Task 1.5
 * 
 * Centralized registry for managing study block types with validation
 */

// Core block type definitions
export const BLOCK_TYPES = {
  WELCOME_SCREEN: 'welcome-screen',
  OPEN_QUESTION: 'open-question',
  OPINION_SCALE: 'opinion-scale',
  SIMPLE_INPUT: 'simple-input',
  MULTIPLE_CHOICE: 'multiple-choice',
  CONTEXT_SCREEN: 'context-screen',
  YES_NO: 'yes-no',
  FIVE_SECOND_TEST: '5-second-test',
  CARD_SORT: 'card-sort',
  TREE_TEST: 'tree-test',
  THANK_YOU: 'thank-you',
  IMAGE_UPLOAD: 'image-upload',
  FILE_UPLOAD: 'file-upload'
} as const;

export type BlockType = typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES];

// Block metadata interface
export interface BlockMetadata {
  displayName: string;
  description: string;
  category: 'input' | 'display' | 'interaction' | 'media' | 'completion';
  icon: string;
  estimatedDuration: number; // in seconds
  complexity: 'simple' | 'moderate' | 'complex';
  requiresInteraction: boolean;
  supportedFeatures: string[];
  defaultSettings: Record<string, unknown>;
}

// Registry of all block types with their metadata
export const BLOCK_REGISTRY: Record<BlockType, BlockMetadata> = {
  [BLOCK_TYPES.WELCOME_SCREEN]: {
    displayName: 'Welcome Screen',
    description: 'Study introduction and participant onboarding',
    category: 'display',
    icon: '👋',
    estimatedDuration: 30,
    complexity: 'simple',
    requiresInteraction: false,
    supportedFeatures: ['custom-styling', 'rich-text', 'images'],
    defaultSettings: {
      title: 'Welcome to our study',
      message: 'Thank you for participating in our research study.',
      showContinueButton: true,
      buttonText: 'Get Started'
    }
  },

  [BLOCK_TYPES.OPEN_QUESTION]: {
    displayName: 'Open Question',
    description: 'Qualitative data collection with AI follow-up capabilities',
    category: 'input',
    icon: '💭',
    estimatedDuration: 120,
    complexity: 'moderate',
    requiresInteraction: true,
    supportedFeatures: ['ai-followup', 'text-analysis', 'character-limits'],
    defaultSettings: {
      question: 'Please share your thoughts...',
      placeholder: 'Type your response here...',
      required: true,
      minLength: 10,
      maxLength: 1000,
      enableAiFollowup: false
    }
  },

  [BLOCK_TYPES.OPINION_SCALE]: {
    displayName: 'Opinion Scale',
    description: 'Quantitative ratings using numerical, star, or emotion scales',
    category: 'input',
    icon: '⭐',
    estimatedDuration: 15,
    complexity: 'simple',
    requiresInteraction: true,
    supportedFeatures: ['custom-scales', 'emotions', 'stars', 'numbers'],
    defaultSettings: {
      question: 'How would you rate this?',
      scaleType: 'stars',
      minValue: 1,
      maxValue: 5,
      required: true,
      showLabels: true,
      minLabel: 'Poor',
      maxLabel: 'Excellent'
    }
  },

  [BLOCK_TYPES.SIMPLE_INPUT]: {
    displayName: 'Simple Input',
    description: 'Structured data collection (text, number, date, email)',
    category: 'input',
    icon: '📝',
    estimatedDuration: 30,
    complexity: 'simple',
    requiresInteraction: true,
    supportedFeatures: ['validation', 'multiple-formats', 'auto-completion'],
    defaultSettings: {
      question: 'Please provide your input',
      inputType: 'text',
      placeholder: '',
      required: true,
      validation: null
    }
  },

  [BLOCK_TYPES.MULTIPLE_CHOICE]: {
    displayName: 'Multiple Choice',
    description: 'Single or multiple selection with custom options',
    category: 'input',
    icon: '☑️',
    estimatedDuration: 20,
    complexity: 'simple',
    requiresInteraction: true,
    supportedFeatures: ['single-select', 'multi-select', 'custom-options', 'randomization'],
    defaultSettings: {
      question: 'Please select an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      allowMultiple: false,
      required: true,
      randomizeOptions: false
    }
  },

  [BLOCK_TYPES.CONTEXT_SCREEN]: {
    displayName: 'Context Screen',
    description: 'Instructions and transitional information',
    category: 'display',
    icon: '📋',
    estimatedDuration: 45,
    complexity: 'simple',
    requiresInteraction: false,
    supportedFeatures: ['rich-text', 'images', 'videos', 'styling'],
    defaultSettings: {
      title: 'Instructions',
      content: 'Please read the following information carefully.',
      showContinueButton: true,
      buttonText: 'Continue'
    }
  },

  [BLOCK_TYPES.YES_NO]: {
    displayName: 'Yes/No Question',
    description: 'Binary decisions with icon/emotion displays',
    category: 'input',
    icon: '❓',
    estimatedDuration: 10,
    complexity: 'simple',
    requiresInteraction: true,
    supportedFeatures: ['custom-labels', 'icons', 'styling'],
    defaultSettings: {
      question: 'Do you agree?',
      yesLabel: 'Yes',
      noLabel: 'No',
      required: true,
      showIcons: true
    }
  },

  [BLOCK_TYPES.FIVE_SECOND_TEST]: {
    displayName: '5-Second Test',
    description: 'First impression and memory testing',
    category: 'interaction',
    icon: '⏱️',
    estimatedDuration: 45,
    complexity: 'complex',
    requiresInteraction: true,
    supportedFeatures: ['timer', 'image-display', 'recall-questions', 'analytics'],
    defaultSettings: {
      instruction: 'Look at the following image for 5 seconds',
      imageUrl: '',
      displayDuration: 5000,
      followUpQuestion: 'What do you remember about what you saw?',
      enableRecall: true
    }
  },

  [BLOCK_TYPES.CARD_SORT]: {
    displayName: 'Card Sort',
    description: 'Information architecture and categorization testing',
    category: 'interaction',
    icon: '🗂️',
    estimatedDuration: 300,
    complexity: 'complex',
    requiresInteraction: true,
    supportedFeatures: ['drag-drop', 'categories', 'analytics', 'timing'],
    defaultSettings: {
      instruction: 'Sort these items into categories that make sense to you',
      items: [],
      categories: [],
      allowNewCategories: true,
      maxCategories: 10
    }
  },

  [BLOCK_TYPES.TREE_TEST]: {
    displayName: 'Tree Test',
    description: 'Navigation and findability evaluation',
    category: 'interaction',
    icon: '🌳',
    estimatedDuration: 180,
    complexity: 'complex',
    requiresInteraction: true,
    supportedFeatures: ['tree-navigation', 'task-based', 'analytics', 'success-metrics'],
    defaultSettings: {
      instruction: 'Find the following item in the navigation structure',
      task: 'Where would you look for...?',
      tree: {},
      allowBacktracking: true,
      showPath: false
    }
  },

  [BLOCK_TYPES.THANK_YOU]: {
    displayName: 'Thank You',
    description: 'Study completion and appreciation message',
    category: 'completion',
    icon: '🙏',
    estimatedDuration: 15,
    complexity: 'simple',
    requiresInteraction: false,
    supportedFeatures: ['custom-message', 'next-steps', 'contact-info'],
    defaultSettings: {
      title: 'Thank You!',
      message: 'Thank you for participating in our study.',
      showNextSteps: false,
      nextSteps: '',
      showContactInfo: false,
      contactInfo: ''
    }
  },

  [BLOCK_TYPES.IMAGE_UPLOAD]: {
    displayName: 'Image Upload',
    description: 'Visual content collection from participants',
    category: 'media',
    icon: '📷',
    estimatedDuration: 60,
    complexity: 'moderate',
    requiresInteraction: true,
    supportedFeatures: ['multiple-formats', 'file-validation', 'preview', 'compression'],
    defaultSettings: {
      instruction: 'Please upload an image',
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
      maxFileSize: 5242880, // 5MB
      required: true,
      allowMultiple: false,
      maxFiles: 1
    }
  },

  [BLOCK_TYPES.FILE_UPLOAD]: {
    displayName: 'File Upload',
    description: 'Document and file collection from participants',
    category: 'media',
    icon: '📄',
    estimatedDuration: 90,
    complexity: 'moderate',
    requiresInteraction: true,
    supportedFeatures: ['multiple-formats', 'file-validation', 'virus-scanning', 'metadata'],
    defaultSettings: {
      instruction: 'Please upload a file',
      allowedFormats: ['pdf', 'doc', 'docx', 'txt'],
      maxFileSize: 10485760, // 10MB
      required: true,
      allowMultiple: false,
      maxFiles: 1
    }
  }
};

// Registry utility functions
export class BlockRegistry {
  /**
   * Get all available block types
   */
  static getAllBlockTypes(): BlockType[] {
    return Object.keys(BLOCK_REGISTRY) as BlockType[];
  }

  /**
   * Get metadata for a specific block type
   */
  static getBlockMetadata(blockType: BlockType): BlockMetadata | null {
    return BLOCK_REGISTRY[blockType] || null;
  }

  /**
   * Get blocks by category
   */
  static getBlocksByCategory(category: BlockMetadata['category']): BlockType[] {
    return Object.entries(BLOCK_REGISTRY)
      .filter(([, metadata]) => metadata.category === category)
      .map(([blockType]) => blockType as BlockType);
  }

  /**
   * Get default settings for a block type
   */
  static getDefaultSettings(blockType: BlockType): Record<string, unknown> {
    const metadata = this.getBlockMetadata(blockType);
    return metadata ? { ...metadata.defaultSettings } : {};
  }

  /**
   * Create a new block with default settings
   */
  static createBlock(blockType: BlockType, overrideSettings: Record<string, unknown> = {}): Record<string, unknown> {
    const metadata = this.getBlockMetadata(blockType);
    if (!metadata) {
      throw new Error(`Unknown block type: ${blockType}`);
    }

    const settings = { ...metadata.defaultSettings, ...overrideSettings };

    return {
      id: crypto.randomUUID(),
      type: blockType,
      order: 0,
      title: metadata.displayName,
      description: metadata.description,
      settings,
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Calculate estimated duration for a set of blocks
   */
  static getEstimatedDuration(blocks: Array<{ type: BlockType }>): number {
    return blocks.reduce((total, block) => {
      const metadata = this.getBlockMetadata(block.type);
      return total + (metadata?.estimatedDuration || 30);
    }, 0);
  }

  /**
   * Get complexity statistics for a set of blocks
   */
  static getBlockComplexityStats(blocks: Array<{ type: BlockType }>): Record<string, number> {
    const stats = { simple: 0, moderate: 0, complex: 0 };
    
    blocks.forEach(block => {
      const metadata = this.getBlockMetadata(block.type);
      if (metadata) {
        stats[metadata.complexity]++;
      }
    });
    
    return stats;
  }

  /**
   * Get blocks that require user interaction
   */
  static getInteractiveBlocks(): BlockType[] {
    return Object.entries(BLOCK_REGISTRY)
      .filter(([, metadata]) => metadata.requiresInteraction)
      .map(([blockType]) => blockType as BlockType);
  }

  /**
   * Search blocks by feature
   */
  static getBlocksByFeature(feature: string): BlockType[] {
    return Object.entries(BLOCK_REGISTRY)
      .filter(([, metadata]) => metadata.supportedFeatures.includes(feature))
      .map(([blockType]) => blockType as BlockType);
  }

  /**
   * Get all supported features across all blocks
   */
  static getAllSupportedFeatures(): string[] {
    const features = new Set<string>();
    Object.values(BLOCK_REGISTRY).forEach(metadata => {
      metadata.supportedFeatures.forEach(feature => features.add(feature));
    });
    return Array.from(features).sort();
  }

  /**
   * Validate if a block type exists
   */
  static isValidBlockType(blockType: string): blockType is BlockType {
    return blockType in BLOCK_REGISTRY;
  }

  /**
   * Get registry statistics
   */
  static getRegistryStats() {
    const totalBlocks = this.getAllBlockTypes().length;
    const categories = {} as Record<string, number>;
    const complexities = {} as Record<string, number>;
    
    Object.values(BLOCK_REGISTRY).forEach(metadata => {
      categories[metadata.category] = (categories[metadata.category] || 0) + 1;
      complexities[metadata.complexity] = (complexities[metadata.complexity] || 0) + 1;
    });
    
    return {
      totalBlocks,
      categories,
      complexities,
      totalFeatures: this.getAllSupportedFeatures().length,
      interactiveBlocks: this.getInteractiveBlocks().length
    };
  }
}

export default BlockRegistry;
