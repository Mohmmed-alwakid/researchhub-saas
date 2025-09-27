/**
 * Day 3 Real Development Test - Block Validation Component
 * This component demonstrates prompt effectiveness for actual ResearchHub development
 * Expected: Copilot should understand StudyBuilderBlock patterns and suggest ResearchHub conventions
 */

import React, { useState } from 'react';

// Test 1: Block Type Recognition
// Expected: Copilot should suggest all 13 block types from our prompts
type BlockType = 
  | 'welcome'
  | 'open_question' 
  | 'opinion_scale'
  | 'simple_input'
  | 'multiple_choice'
  | 'context_screen'
  | 'yes_no'
  | '5_second_test'
  | 'card_sort'
  | 'tree_test'
  | 'thank_you'
  | 'image_upload'
  | 'file_upload';

// Test 2: StudyBuilderBlock Interface
// Expected: Copilot should understand the complete interface structure
interface StudyBuilderBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description: string;
  settings: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Test 3: Block Validation Logic
// Expected: Copilot should suggest proper validation patterns
interface BlockValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface BlockValidatorProps {
  blocks: StudyBuilderBlock[];
  onValidationComplete: (result: BlockValidationResult) => void;
}

export const BlockValidator: React.FC<BlockValidatorProps> = ({ 
  blocks, 
  onValidationComplete 
}) => {
  const [validationResults, setValidationResults] = useState<BlockValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Test 4: Block Validation Function
  // Expected: Copilot should suggest ResearchHub-specific validation rules
  const validateBlocks = async (blocks: StudyBuilderBlock[]): Promise<BlockValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required welcome block
    if (!blocks.some(block => block.type === 'welcome')) {
      errors.push('Study must start with a welcome block');
    }

    // Check for required thank you block
    if (!blocks.some(block => block.type === 'thank_you')) {
      errors.push('Study must end with a thank you block');
    }

    // Validate block order
    const thankYouBlock = blocks.find(block => block.type === 'thank_you');
    if (thankYouBlock && thankYouBlock.order !== blocks.length - 1) {
      warnings.push('Thank you block should be the last block in the study');
    }

    // Check for empty blocks
    blocks.forEach((block, index) => {
      if (!block.title.trim()) {
        errors.push(`Block ${index + 1} (${block.type}) is missing a title`);
      }
      if (!block.description.trim()) {
        warnings.push(`Block ${index + 1} (${block.type}) is missing a description`);
      }
    });

    // Validate block-specific settings
    blocks.forEach((block, index) => {
      switch (block.type) {
        case 'multiple_choice':
          if (!block.settings.options || !Array.isArray(block.settings.options)) {
            errors.push(`Multiple choice block ${index + 1} must have options array`);
          }
          break;
        case 'opinion_scale':
          if (!block.settings.scaleType || !block.settings.minValue || !block.settings.maxValue) {
            errors.push(`Opinion scale block ${index + 1} must have scale configuration`);
          }
          break;
        case '5_second_test':
          if (!block.settings.imageUrl) {
            errors.push(`5-second test block ${index + 1} must have an image URL`);
          }
          break;
        // Expected: Copilot should suggest validation for other block types
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Test 5: Handle Validation
  // Expected: Copilot should suggest proper async handling and error management
  const handleValidation = async () => {
    setIsValidating(true);
    
    try {
      const result = await validateBlocks(blocks);
      setValidationResults(result);
      onValidationComplete(result);
    } catch (error) {
      const errorResult: BlockValidationResult = {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
      setValidationResults(errorResult);
      onValidationComplete(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  // Test 6: Block Creation Helper
  // Expected: Copilot should suggest UUID generation and default settings
  const createDefaultBlock = (type: BlockType, order: number): StudyBuilderBlock => {
    return {
      id: crypto.randomUUID(),
      type,
      order,
      title: getDefaultBlockTitle(type),
      description: getDefaultBlockDescription(type),
      settings: getDefaultBlockSettings(type),
      created_at: new Date().toISOString()
    };
  };

  // Test 7: Default Block Configuration
  // Expected: Copilot should understand ResearchHub block patterns
  const getDefaultBlockTitle = (type: BlockType): string => {
    const titleMap: Record<BlockType, string> = {
      welcome: 'Welcome to Our Study',
      open_question: 'Share Your Thoughts',
      opinion_scale: 'Rate Your Experience',
      simple_input: 'Provide Information',
      multiple_choice: 'Select Your Answer',
      context_screen: 'Study Instructions',
      yes_no: 'Yes or No Question',
      '5_second_test': 'First Impression Test',
      card_sort: 'Organize Items',
      tree_test: 'Find Information',
      thank_you: 'Thank You!',
      image_upload: 'Upload Image',
      file_upload: 'Upload File'
    };
    return titleMap[type];
  };

  const getDefaultBlockDescription = (type: BlockType): string => {
    return `This is a ${type.replace('_', ' ')} block for collecting user feedback and data.`;
  };

  const getDefaultBlockSettings = (type: BlockType): Record<string, unknown> => {
    const baseSettings = {
      required: true,
      allowSkip: false
    };

    switch (type) {
      case 'multiple_choice':
        return { ...baseSettings, options: [], allowMultiple: false };
      case 'opinion_scale':
        return { ...baseSettings, scaleType: 'numeric', minValue: 1, maxValue: 10 };
      case '5_second_test':
        return { ...baseSettings, duration: 5, showTimer: true };
      case 'open_question':
        return { ...baseSettings, maxLength: 1000, allowRichText: false };
      default:
        return baseSettings;
    }
  };

  // Test 8: Thank You Block Logic
  // Expected: Copilot should understand automatic appending pattern
  const ensureThankYouBlock = (blocks: StudyBuilderBlock[]): StudyBuilderBlock[] => {
    const hasThankYou = blocks.some(block => block.type === 'thank_you');
    
    if (!hasThankYou) {
      const thankYouBlock = createDefaultBlock('thank_you', blocks.length);
      return [...blocks, thankYouBlock];
    }
    
    return blocks;
  };

  // Test 9: Component Render
  // Expected: Copilot should suggest proper JSX patterns and ResearchHub styling
  return (
    <div className="block-validator bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Study Block Validation</h2>
        <button
          onClick={handleValidation}
          disabled={isValidating || blocks.length === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isValidating 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isValidating ? 'Validating...' : 'Validate Blocks'}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Study Overview
        </h3>
        <p className="text-gray-600">
          {blocks.length} blocks total ({blocks.filter(b => b.type === 'welcome').length} welcome, {blocks.filter(b => b.type === 'thank_you').length} thank you)
        </p>
      </div>

      {validationResults && (
        <div className="validation-results space-y-4">
          <div className={`p-4 rounded-lg ${
            validationResults.isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h4 className={`font-semibold ${
              validationResults.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {validationResults.isValid ? '✅ Validation Passed' : '❌ Validation Failed'}
            </h4>
          </div>

          {validationResults.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-semibold text-red-800 mb-2">Errors:</h5>
              <ul className="list-disc list-inside space-y-1">
                {validationResults.errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResults.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 mb-2">Warnings:</h5>
              <ul className="list-disc list-inside space-y-1">
                {validationResults.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <h4 className="font-semibold text-gray-700 mb-2">Block Breakdown:</h4>
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div key={block.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <span className="text-sm">
                {index + 1}. {block.title} ({block.type})
              </span>
              <span className="text-xs text-gray-500">
                Order: {block.order}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Test 10: Export Types
// Expected: Copilot should understand proper TypeScript exports
export type { StudyBuilderBlock, BlockType, BlockValidationResult };

// Test 11: Development Notes
// Expected: Copilot should understand ResearchHub development patterns
/*
Development Testing Notes:
1. This component tests prompt understanding of StudyBuilderBlock interface
2. Validates 13 block types recognition 
3. Tests ResearchHub-specific validation rules
4. Demonstrates proper TypeScript patterns
5. Uses ResearchHub styling conventions (Tailwind CSS)
6. Implements proper error handling
7. Follows React best practices
8. Tests thank you block logic understanding
9. Validates UUID generation patterns
10. Demonstrates component composition patterns

Expected Copilot Behaviors:
- Should suggest all 13 block types when typing BlockType
- Should understand StudyBuilderBlock interface properties
- Should suggest crypto.randomUUID() for ID generation
- Should enforce thank you block requirement
- Should suggest proper validation patterns
- Should understand ResearchHub styling patterns
- Should suggest proper TypeScript types and interfaces
*/