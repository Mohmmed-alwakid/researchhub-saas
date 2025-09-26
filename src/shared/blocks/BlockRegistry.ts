import { z } from 'zod';
import {
  BLOCK_TYPES,
  type BlockType,
  type BlockSettings,
  type BlockMetadata,
  type StudyBlock,
  type ValidationResult,
  type BlockComplexityStats,
  type WelcomeScreenSettings,
  type OpenQuestionSettings,
  type OpinionScaleSettings,
  type SimpleInputSettings,
  type MultipleChoiceSettings,
  type ContextScreenSettings,
  type YesNoSettings,
  type FiveSecondTestSettings,
  type CardSortSettings,
  type TreeTestSettings,
  type ThankYouSettings,
  type ImageUploadSettings,
  type FileUploadSettings
} from './BlockTypes.js';


/**
 * ResearchHub Study Blocks Registry
 * Vibe-Coder-MCP Implementation - Task 1.5
 * 
 * Centralized registry for managing study block types, metadata, and validation
 */

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
    },
    validationSchema: z.object({
      title: z.string().min(1).max(200),
      message: z.string().min(1).max(2000),
      showContinueButton: z.boolean().default(true),
      buttonText: z.string().max(50).optional()
    }),
    examples: [
      {
        name: 'Basic Welcome',
        description: 'Simple welcome message with continue button',
        settings: {
          title: 'Welcome!',
          message: 'We appreciate your participation.',
          showContinueButton: true
        }
      }
    ]
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
    },
    validationSchema: z.object({
      question: z.string().min(1).max(500),
      placeholder: z.string().max(200).optional(),
      required: z.boolean().default(true),
      minLength: z.number().min(0).max(10000).optional(),
      maxLength: z.number().min(1).max(10000).optional(),
      enableAiFollowup: z.boolean().default(false)
    }),
    examples: [
      {
        name: 'User Feedback',
        description: 'Collect detailed user feedback',
        settings: {
          question: 'What did you think of this experience?',
          minLength: 20,
          maxLength: 500,
          enableAiFollowup: true
        }
      }
    ]
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
    },
    validationSchema: z.object({
      question: z.string().min(1).max(500),
      scaleType: z.enum(['stars', 'numbers', 'emotions']),
      minValue: z.number().min(0).max(10),
      maxValue: z.number().min(1).max(10),
      required: z.boolean().default(true),
      showLabels: z.boolean().default(true),
      minLabel: z.string().max(50).optional(),
      maxLabel: z.string().max(50).optional()
    }),
    examples: [
      {
        name: 'Satisfaction Rating',
        description: '5-star satisfaction scale',
        settings: {
          question: 'How satisfied are you?',
          scaleType: 'stars',
          minValue: 1,
          maxValue: 5,
          minLabel: 'Very Dissatisfied',
          maxLabel: 'Very Satisfied'
        }
      }
    ]
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
    },
    validationSchema: z.object({
      question: z.string().min(1).max(500),
      inputType: z.enum(['text', 'number', 'email', 'date', 'url', 'tel']),
      placeholder: z.string().max(200).optional(),
      required: z.boolean().default(true),
      validation: z.string().optional() // regex pattern
    }),
    examples: [
      {
        name: 'Email Collection',
        description: 'Collect participant email addresses',
        settings: {
          question: 'What is your email address?',
          inputType: 'email',
          placeholder: 'you@example.com',
          required: true
        }
      }
    ]
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
    },
    validationSchema: z.object({
      question: z.string().min(1).max(500),
      options: z.array(z.string().min(1).max(200)).min(2).max(20),
      allowMultiple: z.boolean().default(false),
      required: z.boolean().default(true),
      randomizeOptions: z.boolean().default(false)
    }),
    examples: [
      {
        name: 'Platform Preference',
        description: 'Single platform selection',
        settings: {
          question: 'Which platform do you use most?',
          options: ['iOS', 'Android', 'Web', 'Desktop'],
          allowMultiple: false
        }
      }
    ]
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
    },
    validationSchema: z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1).max(5000),
      showContinueButton: z.boolean().default(true),
      buttonText: z.string().max(50).optional()
    }),
    examples: [
      {
        name: 'Task Instructions',
        description: 'Detailed task instructions for participants',
        settings: {
          title: 'Task Instructions',
          content: 'In the next section, you will be asked to...',
          buttonText: 'I Understand'
        }
      }
    ]
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
    },
    validationSchema: z.object({
      question: z.string().min(1).max(500),
      yesLabel: z.string().max(50).default('Yes'),
      noLabel: z.string().max(50).default('No'),
      required: z.boolean().default(true),
      showIcons: z.boolean().default(true)
    }),
    examples: [
      {
        name: 'Agreement Check',
        description: 'Simple agreement verification',
        settings: {
          question: 'Do you understand the instructions?',
          yesLabel: 'I understand',
          noLabel: 'Please explain again'
        }
      }
    ]
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
    },
    validationSchema: z.object({
      instruction: z.string().min(1).max(500),
      imageUrl: z.string().url(),
      displayDuration: z.number().min(1000).max(30000),
      followUpQuestion: z.string().min(1).max(500).optional(),
      enableRecall: z.boolean().default(true)
    }),
    examples: [
      {
        name: 'Website First Impression',
        description: 'Test first impressions of website design',
        settings: {
          instruction: 'Look at this website design for 5 seconds',
          displayDuration: 5000,
          followUpQuestion: 'What was your first impression?'
        }
      }
    ]
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
    },
    validationSchema: z.object({
      instruction: z.string().min(1).max(500),
      items: z.array(z.string().min(1).max(200)).min(3).max(50),
      categories: z.array(z.string().min(1).max(100)).max(20),
      allowNewCategories: z.boolean().default(true),
      maxCategories: z.number().min(1).max(20).default(10)
    }),
    examples: [
      {
        name: 'Website Navigation',
        description: 'Sort website features into logical categories',
        settings: {
          instruction: 'Group these website features into categories',
          items: ['Search', 'Profile', 'Settings', 'Help'],
          allowNewCategories: true
        }
      }
    ]
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
    },
    validationSchema: z.object({
      instruction: z.string().min(1).max(500),
      task: z.string().min(1).max(500),
      tree: z.record(z.any()),
      allowBacktracking: z.boolean().default(true),
      showPath: z.boolean().default(false)
    }),
    examples: [
      {
        name: 'Information Findability',
        description: 'Test if users can find specific information',
        settings: {
          instruction: 'Find where you would look for account settings',
          task: 'Where would you go to change your password?',
          allowBacktracking: true
        }
      }
    ]
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
    },
    validationSchema: z.object({
      title: z.string().min(1).max(200),
      message: z.string().min(1).max(2000),
      showNextSteps: z.boolean().default(false),
      nextSteps: z.string().max(1000).optional(),
      showContactInfo: z.boolean().default(false),
      contactInfo: z.string().max(500).optional()
    }),
    examples: [
      {
        name: 'Study Completion',
        description: 'Standard study completion message',
        settings: {
          title: 'Study Complete!',
          message: 'Your responses have been recorded. Thank you for your time.',
          showContactInfo: true
        }
      }
    ]
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
    },
    validationSchema: z.object({
      instruction: z.string().min(1).max(500),
      allowedFormats: z.array(z.string()).default(['jpg', 'jpeg', 'png']),
      maxFileSize: z.number().min(1024).max(52428800), // 1KB to 50MB
      required: z.boolean().default(true),
      allowMultiple: z.boolean().default(false),
      maxFiles: z.number().min(1).max(10).default(1)
    }),
    examples: [
      {
        name: 'Screenshot Collection',
        description: 'Collect screenshots from participants',
        settings: {
          instruction: 'Please upload a screenshot of your screen',
          allowedFormats: ['png', 'jpg'],
          maxFileSize: 10485760 // 10MB
        }
      }
    ]
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
    },
    validationSchema: z.object({
      instruction: z.string().min(1).max(500),
      allowedFormats: z.array(z.string()).default(['pdf', 'doc', 'docx']),
      maxFileSize: z.number().min(1024).max(104857600), // 1KB to 100MB
      required: z.boolean().default(true),
      allowMultiple: z.boolean().default(false),
      maxFiles: z.number().min(1).max(10).default(1)
    }),
    examples: [
      {
        name: 'Document Submission',
        description: 'Collect documents from participants',
        settings: {
          instruction: 'Please upload your resume or CV',
          allowedFormats: ['pdf', 'doc', 'docx'],
          maxFileSize: 5242880 // 5MB
        }
      }
    ]
  }
};

// Registry utility functions
export class BlockRegistry {
  static getAllBlockTypes(): BlockType[] {
    return Object.keys(BLOCK_REGISTRY) as BlockType[];
  }

  static getBlockMetadata(blockType: BlockType): BlockMetadata | null {
    return BLOCK_REGISTRY[blockType] || null;
  }

  static getBlocksByCategory(category: BlockMetadata['category']): BlockType[] {
    return Object.entries(BLOCK_REGISTRY)
      .filter(([_, metadata]) => metadata.category === category)
      .map(([blockType]) => blockType as BlockType);
  }

  static validateBlockSettings(blockType: BlockType, settings: any): { valid: boolean; errors?: any } {
    const metadata = this.getBlockMetadata(blockType);
    if (!metadata) {
      return { valid: false, errors: 'Unknown block type' };
    }

    try {
      metadata.validationSchema.parse(settings);
      return { valid: true };
    } catch (error) {
      return { valid: false, errors: error };
    }
  }

  static getDefaultSettings(blockType: BlockType): Record<string, any> {
    const metadata = this.getBlockMetadata(blockType);
    return metadata ? { ...metadata.defaultSettings } : {};
  }

  static createBlock(blockType: BlockType, overrideSettings: Partial<any> = {}): any {
    const metadata = this.getBlockMetadata(blockType);
    if (!metadata) {
      throw new Error(`Unknown block type: ${blockType}`);
    }

    const settings = { ...metadata.defaultSettings, ...overrideSettings };
    const validation = this.validateBlockSettings(blockType, settings);
    
    if (!validation.valid) {
      throw new Error(`Invalid block settings: ${JSON.stringify(validation.errors)}`);
    }

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

  static getEstimatedDuration(blocks: Array<{ type: BlockType }>): number {
    return blocks.reduce((total, block) => {
      const metadata = this.getBlockMetadata(block.type);
      return total + (metadata?.estimatedDuration || 30);
    }, 0);
  }

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
}

export default BlockRegistry;
