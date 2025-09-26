/**
 * ResearchHub Study Blocks Type Definitions
 * Type-safe definitions for the block registry system
 */

import { z } from 'zod';

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

// Base settings types for each block
export interface WelcomeScreenSettings {
  title: string;
  message: string;
  showContinueButton: boolean;
  buttonText?: string;
}

export interface OpenQuestionSettings {
  question: string;
  placeholder?: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  enableAiFollowup: boolean;
}

export interface OpinionScaleSettings {
  question: string;
  scaleType: 'stars' | 'numbers' | 'emotions';
  minValue: number;
  maxValue: number;
  required: boolean;
  showLabels: boolean;
  minLabel?: string;
  maxLabel?: string;
}

export interface SimpleInputSettings {
  question: string;
  inputType: 'text' | 'number' | 'email' | 'date' | 'url' | 'tel';
  placeholder?: string;
  required: boolean;
  validation?: string;
}

export interface MultipleChoiceSettings {
  question: string;
  options: string[];
  allowMultiple: boolean;
  required: boolean;
  randomizeOptions: boolean;
}

export interface ContextScreenSettings {
  title: string;
  content: string;
  showContinueButton: boolean;
  buttonText?: string;
}

export interface YesNoSettings {
  question: string;
  yesLabel: string;
  noLabel: string;
  required: boolean;
  showIcons: boolean;
}

export interface FiveSecondTestSettings {
  instruction: string;
  imageUrl: string;
  displayDuration: number;
  followUpQuestion?: string;
  enableRecall: boolean;
}

export interface CardSortSettings {
  instruction: string;
  items: string[];
  categories: string[];
  allowNewCategories: boolean;
  maxCategories: number;
}

export interface TreeTestSettings {
  instruction: string;
  task: string;
  tree: Record<string, unknown>;
  allowBacktracking: boolean;
  showPath: boolean;
}

export interface ThankYouSettings {
  title: string;
  message: string;
  showNextSteps: boolean;
  nextSteps?: string;
  showContactInfo: boolean;
  contactInfo?: string;
}

export interface ImageUploadSettings {
  instruction: string;
  allowedFormats: string[];
  maxFileSize: number;
  required: boolean;
  allowMultiple: boolean;
  maxFiles: number;
}

export interface FileUploadSettings {
  instruction: string;
  allowedFormats: string[];
  maxFileSize: number;
  required: boolean;
  allowMultiple: boolean;
  maxFiles: number;
}

// Union type for all block settings
export type BlockSettings = 
  | WelcomeScreenSettings
  | OpenQuestionSettings
  | OpinionScaleSettings
  | SimpleInputSettings
  | MultipleChoiceSettings
  | ContextScreenSettings
  | YesNoSettings
  | FiveSecondTestSettings
  | CardSortSettings
  | TreeTestSettings
  | ThankYouSettings
  | ImageUploadSettings
  | FileUploadSettings;

// Block metadata interface
export interface BlockMetadata<T extends BlockSettings = BlockSettings> {
  displayName: string;
  description: string;
  category: 'input' | 'display' | 'interaction' | 'media' | 'completion';
  icon: string;
  estimatedDuration: number; // in seconds
  complexity: 'simple' | 'moderate' | 'complex';
  requiresInteraction: boolean;
  supportedFeatures: string[];
  defaultSettings: T;
  validationSchema: z.ZodSchema<T>;
  examples: Array<{
    name: string;
    description: string;
    settings: Partial<T>;
  }>;
}

// Base block schema
export const BaseBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string().optional(),
  settings: z.record(z.unknown()),
  metadata: z.object({
    created: z.string().datetime(),
    updated: z.string().datetime(),
    version: z.string().default('1.0.0')
  }).optional()
});

export interface StudyBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description?: string;
  settings: BlockSettings;
  metadata?: {
    created: string;
    updated: string;
    version: string;
  };
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors?: z.ZodError | string;
}

export type BlockExample<T extends BlockSettings = BlockSettings> = {
  name: string;
  description: string;
  settings: Partial<T>;
};

export type BlockComplexityStats = {
  simple: number;
  moderate: number;
  complex: number;
};
