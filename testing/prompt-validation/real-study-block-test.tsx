// Real ResearchHub development test - Study Block Creation
// This should trigger study-builder.md prompt and provide ResearchHub-specific suggestions
// Test: Creating a new opinion scale block component

import React, { useState } from 'react';

// ResearchHub StudyBuilderBlock interface (from actual codebase)
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

// Test 1: Copilot should understand StudyBuilderBlock interface
// Expected: Suggestions should include proper TypeScript types and ResearchHub patterns
interface OpinionScaleBlockProps {
  block: StudyBuilderBlock;
  onUpdate: (block: StudyBuilderBlock) => void;
  isPreview?: boolean;
}

// Test 2: Copilot should suggest opinion scale specific settings
// Expected: Should understand opinion scale configuration options
interface OpinionScaleSettings {
  scaleType: 'numerical' | 'stars' | 'emotions';
  min: number;
  max: number;
  step: number;
  labels: {
    min: string;
    max: string;
  };
  required: boolean;
}

// Test 3: React component following ResearchHub patterns
// Expected: Should suggest proper React patterns with accessibility and ResearchHub styling
export const OpinionScaleBlock: React.FC<OpinionScaleBlockProps> = ({
  block,
  onUpdate,
  isPreview = false
}) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  
  // Copilot should suggest proper settings extraction
  const settings = block.settings as OpinionScaleSettings;
  
  // Copilot should suggest proper value change handler
  const handleValueChange = (value: number) => {
    setSelectedValue(value);
    
    // Should suggest proper block update pattern
    onUpdate({
      ...block,
      settings: {
        ...settings,
        response: value,
        timestamp: new Date().toISOString()
      }
    });
  };
  
  // Copilot should suggest proper scale rendering logic
  const renderScale = () => {
    const { scaleType, min, max, step } = settings;
    
    switch (scaleType) {
      case 'numerical':
        // Should suggest numerical scale implementation
        return (
          <div className="flex items-center space-x-2">
            {/* Copilot should suggest scale button generation */}
            {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
              const value = min + (i * step);
              return (
                <button
                  key={value}
                  onClick={() => handleValueChange(value)}
                  className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200 font-medium
                    ${selectedValue === value 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }
                  `}
                  aria-label={`Rate ${value} out of ${max}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        );
        
      case 'stars':
        // Should suggest star rating implementation
        return (
          <div className="flex space-x-1">
            {/* Copilot should suggest star rating logic */}
          </div>
        );
        
      case 'emotions':
        // Should suggest emotion scale implementation
        return (
          <div className="flex space-x-4">
            {/* Copilot should suggest emotion icons */}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Copilot should suggest proper accessibility and responsive design
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      {/* Block header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {block.title}
        </h3>
        {block.description && (
          <p className="text-gray-600">
            {block.description}
          </p>
        )}
      </div>
      
      {/* Scale rendering */}
      <div className="mb-6">
        {renderScale()}
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{settings.labels.min}</span>
        <span>{settings.labels.max}</span>
      </div>
      
      {/* Preview mode indicator */}
      {isPreview && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            📋 Preview Mode - This is how participants will see this block
          </p>
        </div>
      )}
    </div>
  );
};

// Test 4: Block creation helper - should follow ResearchHub patterns
// Expected: Should suggest proper block creation with UUID, order, validation
export const createOpinionScaleBlock = (order: number = 0): StudyBuilderBlock => {
  return {
    id: crypto.randomUUID(),
    type: 'opinion_scale',
    order,
    title: 'Rate your experience',
    description: 'Please rate your overall experience using the scale below',
    settings: {
      scaleType: 'numerical',
      min: 1,
      max: 10,
      step: 1,
      labels: {
        min: 'Poor',
        max: 'Excellent'
      },
      required: true
    } as OpinionScaleSettings
  };
};

// Test 5: Block validation - should suggest ResearchHub validation patterns
// Expected: Should understand block validation requirements
export const validateOpinionScaleBlock = (block: StudyBuilderBlock): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const settings = block.settings as OpinionScaleSettings;
  
  // Copilot should suggest comprehensive validation logic
  if (!block.title?.trim()) {
    errors.push('Block title is required');
  }
  
  if (settings.min >= settings.max) {
    errors.push('Minimum value must be less than maximum value');
  }
  
  if (settings.step <= 0) {
    errors.push('Step value must be positive');
  }
  
  // Should suggest more validation rules based on ResearchHub requirements
  
  return {
    isValid: errors.length === 0,
    errors
  };
};