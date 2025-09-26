import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { BlockType } from '../../../shared/types/index';


interface Block {
  id: string;
  templateId: string;
  name: string;
  description: string;
  estimatedDuration: number;
  settings: Record<string, unknown>;
  order: number;
  isRequired: boolean;
  category?: string;
  icon?: string;
  type: BlockType;
}

interface BlockEditModalProps {
  isOpen: boolean;
  block: Block | null;
  onClose: () => void;
  onSave: (block: Block) => void;
}

export const BlockEditModal: React.FC<BlockEditModalProps> = ({
  isOpen,
  block,
  onClose,
  onSave
}) => {
  const [editedBlock, setEditedBlock] = useState<Block | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (block) {
      setEditedBlock({ ...block });
      setErrors({});
    }
  }, [block]);

  const validateBlock = (blockData: Block): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!blockData.name.trim()) {
      newErrors.name = 'Block name is required';
    }

    if (!blockData.description.trim()) {
      newErrors.description = 'Block description is required';
    }

    if (blockData.estimatedDuration < 1) {
      newErrors.estimatedDuration = 'Duration must be at least 1 minute';
    }

    if (blockData.estimatedDuration > 180) {
      newErrors.estimatedDuration = 'Duration cannot exceed 180 minutes';
    }

    return newErrors;
  };

  const handleSave = () => {
    if (!editedBlock) return;

    const validationErrors = validateBlock(editedBlock);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(editedBlock);
    onClose();
  };

  const handleChange = (field: keyof Block, value: unknown) => {
    if (!editedBlock) return;

    setEditedBlock(prev => prev ? { ...prev, [field]: value } : null);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getBlockTypeLabel = (blockType: BlockType) => {    const labelMap: Record<BlockType, string> = {
      welcome: 'Welcome Screen',
      open_question: 'Open Question',
      opinion_scale: 'Opinion Scale',
      simple_input: 'Simple Input',
      multiple_choice: 'Multiple Choice',
      context_screen: 'Context Screen',
      yes_no: 'Yes/No Question',
      five_second_test: '5-Second Test',
      card_sort: 'Card Sorting',
      tree_test: 'Tree Testing',
      screener: 'Screener',
      prototype_test: 'Prototype Test',
      live_website_test: 'Live Website Test',
      thank_you: 'Thank You',
      image_upload: 'Image Upload',
      file_upload: 'File Upload'
    };
    
    return labelMap[blockType] || 'Unknown Block';
  };

  const getBlockTypeIcon = (blockType: BlockType) => {    const iconMap: Record<BlockType, string> = {
      welcome: '👋',
      open_question: '💭',
      opinion_scale: '⭐',
      simple_input: '📝',
      multiple_choice: '☑️',
      context_screen: '📄',
      yes_no: '✅',
      five_second_test: '⏱️',
      card_sort: '🗂️',
      tree_test: '🌳',
      screener: '🔍',
      prototype_test: '📱',
      live_website_test: '🌐',
      thank_you: '🙏',
      image_upload: '📸',
      file_upload: '📎'
    };
    return iconMap[blockType] || '📋';
  };
  const renderBlockSpecificSettings = () => {
    if (!editedBlock) return null;

    const updateSetting = (key: string, value: unknown) => {
      handleChange('settings', {
        ...editedBlock.settings,
        [key]: value
      });
    };

    const getSetting = (key: string, defaultValue: unknown = undefined): unknown => {
      return editedBlock.settings[key] ?? defaultValue;
    };

    switch (editedBlock.type) {
      case 'five_second_test':
        return (
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select an image to show to users for a limited time.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-2">📁</div>
                <p className="text-sm text-gray-600">
                  {getSetting('imageUrl') ? 
                    `blocks/${getSetting('imageUrl')}` : 
                    'Click to upload image or drag and drop'
                  }
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 text-sm text-gray-500"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // In a real app, you'd upload the file and get a URL
                      const fakeId = '5219c640-284b-4cd6-8c6c-8972524f7b3c';
                      updateSetting('imageUrl', fakeId);
                    }
                  }}
                />
              </div>
            </div>

            {/* Duration Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of seconds to show image
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateSetting('duration', Math.max(1, Number(getSetting('duration', 5)) - 1))}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Decrease
                </button>
                <span className="text-lg font-medium min-w-[2rem] text-center">
                  {Number(getSetting('duration', 5))}
                </span>
                <button
                  onClick={() => updateSetting('duration', Math.min(30, Number(getSetting('duration', 5)) + 1))}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Increment
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Add question blocks after this to collect first impressions
              </p>
            </div>

            {/* More Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">More options</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(getSetting('customizeInstructions', false))}
                    onChange={(e) => updateSetting('customizeInstructions', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Customize instructions</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'open_question':
        return (
          <div className="space-y-4">
            {/* Required Toggle */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(getSetting('required', false))}
                onChange={(e) => updateSetting('required', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Required</span>
            </label>

            {/* Question Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <textarea
                value={String(getSetting('question', 'What action was the webpage asking you to take?'))}
                onChange={(e) => updateSetting('question', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Type your question here"
              />
            </div>

            {/* More Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">More options</h4>
              <div className="space-y-3">
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Rephrase the title
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-sm block">
                  Add notes
                </button>
              </div>
            </div>

            {/* Image Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Show an image while asking this question
              </p>
              <input
                type="file"
                accept="image/*"
                className="text-sm text-gray-500"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateSetting('hasImage', true);
                    updateSetting('imageFile', file.name);
                  }
                }}
              />
            </div>
          </div>
        );

      case 'simple_input':
        return (
          <div className="space-y-4">
            {/* Required Toggle */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(getSetting('required', false))}
                onChange={(e) => updateSetting('required', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Required</span>
            </label>

            {/* Question Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <input
                type="text"
                value={String(getSetting('question', 'Type your question here'))}
                onChange={(e) => updateSetting('question', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your question here"
              />
            </div>

            {/* Input Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Text', 'Numerical', 'Date', 'Email'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateSetting('inputType', type.toLowerCase())}
                    className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                      String(getSetting('inputType', 'text')) === type.toLowerCase()
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* More Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">More options</h4>
              <div className="space-y-3">
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Rephrase the title
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-sm block">
                  Add notes
                </button>
              </div>
            </div>

            {/* Image Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Show an image while asking this question
              </p>
              <input
                type="file"
                accept="image/*"
                className="text-sm text-gray-500"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateSetting('hasImage', true);
                    updateSetting('imageFile', file.name);
                  }
                }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-600 mb-2">
              Settings for {getBlockTypeLabel(editedBlock.type)}
            </p>
            <div className="bg-white rounded border p-3">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(editedBlock.settings, null, 2)}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Custom interface for this block type will be available in a future update
            </p>
          </div>
        );
    }
  };

  if (!isOpen || !editedBlock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getBlockTypeIcon(editedBlock.type)}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit {getBlockTypeLabel(editedBlock.type)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure your block settings and content
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            {/* Block Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block Name *
              </label>
              <input
                type="text"
                value={editedBlock.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter block name..."
              />
              {errors.name && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Block Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={editedBlock.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what this block does..."
              />
              {errors.description && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </div>
              )}
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={editedBlock.estimatedDuration}
                onChange={(e) => handleChange('estimatedDuration', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedDuration ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.estimatedDuration && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.estimatedDuration}
                </div>
              )}
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Required Block
                </label>
                <p className="text-sm text-gray-500">
                  Participants must complete this block to continue
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedBlock.isRequired}
                  onChange={(e) => handleChange('isRequired', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>          {/* Block Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Block Settings</h3>
            {renderBlockSpecificSettings()}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
