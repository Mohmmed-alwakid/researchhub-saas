import React from 'react';
import { BlockType } from '../../../../shared/types';

interface VisualBlockSelectorProps {
  onBlockSelect: (blockType: BlockType) => void;
  selectedBlockType?: BlockType;
  className?: string;
}

interface BlockCategory {
  name: string;
  icon: string;
  blocks: {
    type: BlockType;
    name: string;
    description: string;
    icon: string;
  }[];
}

const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    name: 'Introduction',
    icon: '🏁',
    blocks: [
      {
        type: 'welcome',
        name: 'Welcome Screen',
        description: 'Greet participants and introduce your study',
        icon: '👋'
      },
      {
        type: 'context_screen',
        name: 'Instructions',
        description: 'Provide context and instructions',
        icon: '📋'
      }
    ]
  },
  {
    name: 'Questions',
    icon: '❓',
    blocks: [
      {
        type: 'open_question',
        name: 'Open Question',
        description: 'Ask detailed, qualitative questions',
        icon: '💬'
      },
      {
        type: 'multiple_choice',
        name: 'Multiple Choice',
        description: 'Single or multiple selection options',
        icon: '☑️'
      },
      {
        type: 'opinion_scale',
        name: 'Rating Scale',
        description: 'Numerical or star ratings',
        icon: '⭐'
      },
      {
        type: 'yes_no',
        name: 'Yes/No',
        description: 'Simple binary questions',
        icon: '👍'
      },
      {
        type: 'simple_input',
        name: 'Text Input',
        description: 'Short text, numbers, or dates',
        icon: '✏️'
      }
    ]
  },
  {
    name: 'Media & Files',
    icon: '📎',
    blocks: [
      {
        type: 'image_upload',
        name: 'Image Upload',
        description: 'Collect photos and images',
        icon: '🖼️'
      },
      {
        type: 'file_upload',
        name: 'File Upload',
        description: 'Collect documents and files',
        icon: '📄'
      }
    ]
  },
  {
    name: 'Usability Testing',
    icon: '🔬',
    blocks: [
      {
        type: 'five_second_test',
        name: '5-Second Test',
        description: 'First impressions and memory testing',
        icon: '⏱️'
      },
      {
        type: 'card_sort',
        name: 'Card Sort',
        description: 'Information architecture testing',
        icon: '🗂️'
      },
      {
        type: 'tree_test',
        name: 'Tree Test',
        description: 'Navigation and findability',
        icon: '🌳'
      },
      {
        type: 'prototype_test',
        name: 'Prototype Test',
        description: 'Test prototypes and mockups',
        icon: '🎨'
      },
      {
        type: 'live_website_test',
        name: 'Live Website',
        description: 'Test real websites and apps',
        icon: '🌐'
      }
    ]
  },
  {
    name: 'Completion',
    icon: '🎯',
    blocks: [
      {
        type: 'thank_you',
        name: 'Thank You',
        description: 'End the study and thank participants',
        icon: '✅'
      }
    ]
  }
];

export const VisualBlockSelector: React.FC<VisualBlockSelectorProps> = ({
  onBlockSelect,
  selectedBlockType,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Block</h3>
        <p className="text-sm text-gray-600">Choose a block type to add to your study</p>
      </div>

      {BLOCK_CATEGORIES.map((category) => (
        <div key={category.name} className="space-y-3">
          <h4 className="flex items-center text-sm font-medium text-gray-700">
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.blocks.map((block) => (
              <button
                key={block.type}
                onClick={() => onBlockSelect(block.type)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md group ${
                  selectedBlockType === block.type
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`text-2xl transition-transform group-hover:scale-110 ${
                    selectedBlockType === block.type ? 'scale-110' : ''
                  }`}>
                    {block.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className={`font-medium text-sm mb-1 ${
                      selectedBlockType === block.type ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {block.name}
                    </h5>
                    <p className={`text-xs leading-tight ${
                      selectedBlockType === block.type ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {block.description}
                    </p>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {selectedBlockType === block.type && (
                  <div className="mt-3 flex items-center text-blue-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          More block types coming soon! Need something specific? 
          <a href="#" className="text-blue-600 hover:underline ml-1">Let us know</a>
        </p>
      </div>
    </div>
  );
};

export default VisualBlockSelector;
