import React, { useState } from 'react';
import { BlockType, StudyBuilderBlock } from '../../../../shared/types';
import { VisualBlockSelector } from './VisualBlockSelector';
import { EnhancedBlockPreview } from './EnhancedBlockPreview';

interface BlockBuilderTestProps {
  onClose?: () => void;
}

export const BlockBuilderTest: React.FC<BlockBuilderTestProps> = ({ onClose }) => {
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'participant'>('participant');
  const [testBlock, setTestBlock] = useState<StudyBuilderBlock | null>(null);

  const handleBlockSelect = (blockType: BlockType) => {
    setSelectedBlockType(blockType);
    
    // Create a test block for preview
    const newBlock: StudyBuilderBlock = {
      id: `test-${blockType}-${Date.now()}`,
      type: blockType,
      order: 1,
      title: getDefaultBlockTitle(blockType),
      description: getDefaultBlockDescription(blockType),
      settings: getDefaultBlockSettings(blockType)
    };
    
    setTestBlock(newBlock);
  };

  const getDefaultBlockTitle = (blockType: BlockType): string => {
    const titles: Record<BlockType, string> = {
      welcome: 'Welcome to Our Study',
      open_question: 'What are your thoughts?',
      opinion_scale: 'How would you rate this?',
      simple_input: 'Please provide your information',
      multiple_choice: 'Which option best describes you?',
      context_screen: 'Instructions',
      yes_no: 'Do you agree?',
      five_second_test: 'First Impressions',
      card_sort: 'Organize These Items',
      tree_test: 'Find the Information',
      screener: 'Qualification Questions',
      prototype_test: 'Test This Prototype',
      live_website_test: 'Explore This Website',
      thank_you: 'Thank You!',
      image_upload: 'Share an Image',
      file_upload: 'Upload Your File'
    };
    return titles[blockType] || 'New Block';
  };

  const getDefaultBlockDescription = (blockType: BlockType): string => {
    const descriptions: Record<BlockType, string> = {
      welcome: 'Thank you for participating in our research study. Your feedback will help us improve our product.',
      open_question: 'Please share your detailed thoughts and feedback in the text area below.',
      opinion_scale: 'Please rate your experience on the scale below.',
      simple_input: 'Please fill out the required information to continue.',
      multiple_choice: 'Select the option that best matches your preference.',
      context_screen: 'Please read the following instructions carefully before proceeding.',
      yes_no: 'Please select yes or no to indicate your preference.',
      five_second_test: 'You will see an image for 5 seconds. Please remember what you see.',
      card_sort: 'Drag and drop the cards into groups that make sense to you.',
      tree_test: 'Use the menu structure to find the information you are looking for.',
      screener: 'Please answer these questions to see if you qualify for this study.',
      prototype_test: 'Interact with this prototype and share your feedback.',
      live_website_test: 'Explore this website and complete the given task.',
      thank_you: 'We appreciate your participation. Your responses have been recorded.',
      image_upload: 'Please upload an image file from your device.',
      file_upload: 'Please select and upload a file from your computer.'
    };
    return descriptions[blockType] || 'This is a new block.';
  };

  const getDefaultBlockSettings = (blockType: BlockType): Record<string, unknown> => {
    const defaultSettings: Record<BlockType, Record<string, unknown>> = {
      welcome: { showProgressBar: true },
      open_question: { maxLength: 500, required: true },
      opinion_scale: { 
        scaleType: 'numerical', 
        range: { min: 1, max: 5 },
        leftLabel: 'Strongly Disagree',
        rightLabel: 'Strongly Agree'
      },
      simple_input: { type: 'text', required: true, placeholder: 'Enter your answer...' },
      multiple_choice: { 
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
        allowMultiple: false 
      },
      context_screen: { allowSkip: false },
      yes_no: { yesLabel: 'Yes', noLabel: 'No' },
      five_second_test: { duration: 5, showInstructions: true },
      card_sort: { categories: ['Group 1', 'Group 2', 'Group 3'] },
      tree_test: { showInstructions: true },
      screener: { passingCriteria: 'all' },
      prototype_test: { prototypeUrl: '', tasks: [] },
      live_website_test: { websiteUrl: '', tasks: [] },
      thank_you: { showSummary: true },
      image_upload: { allowedFormats: ['jpg', 'png', 'gif'], maxSize: '5MB' },
      file_upload: { allowedFormats: ['pdf', 'doc', 'docx'], maxSize: '10MB' }
    };
    return defaultSettings[blockType] || {};
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enhanced Block Builder Test</h2>
            <p className="text-sm text-gray-600 mt-1">Test the new visual block selector and preview system</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Block Selector */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <VisualBlockSelector
              onBlockSelect={handleBlockSelect}
              selectedBlockType={selectedBlockType || undefined}
            />
          </div>

          {/* Block Preview */}
          <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
            {testBlock ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Preview: {testBlock.type}</h3>
                  <p className="text-sm text-gray-600 mb-4">See how this block will appear to participants</p>
                  
                  <EnhancedBlockPreview
                    block={testBlock}
                    mode={previewMode}
                    onModeChange={setPreviewMode}
                    showModeToggle={true}
                  />
                </div>

                {/* Block Details */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Block Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-600">{testBlock.type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <span className="ml-2 text-gray-600">{testBlock.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <span className="ml-2 text-gray-600">{testBlock.description}</span>
                    </div>
                    {Object.keys(testBlock.settings).length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Settings:</span>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(testBlock.settings, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Block Type</h3>
                  <p className="text-gray-600">Choose a block from the left panel to see a live preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>New Features:</strong> Visual block selector, Real-time preview, Multiple view modes
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
              <button
                disabled={!testBlock}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  testBlock
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add to Study
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockBuilderTest;
