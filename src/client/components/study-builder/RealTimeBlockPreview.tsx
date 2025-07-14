import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Eye, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { StudyBuilderBlock } from './types';

interface RealTimeBlockPreviewProps {
  blocks: StudyBuilderBlock[];
  currentEditingBlock?: StudyBuilderBlock;
  onBlockUpdate?: (blockId: string, changes: Partial<StudyBuilderBlock>) => void;
  className?: string;
}

interface PreviewState {
  currentBlockIndex: number;
  isPlaying: boolean;
  speed: number;
  showSettings: boolean;
}

export const RealTimeBlockPreview: React.FC<RealTimeBlockPreviewProps> = ({
  blocks,
  currentEditingBlock,
  onBlockUpdate,
  className = ''
}) => {
  const [previewState, setPreviewState] = useState<PreviewState>({
    currentBlockIndex: 0,
    isPlaying: false,
    speed: 1,
    showSettings: false
  });

  const [previewMode, setPreviewMode] = useState<'participant' | 'researcher'>('participant');

  // Auto-sync with currently editing block
  useEffect(() => {
    if (currentEditingBlock && blocks.length > 0) {
      const editingIndex = blocks.findIndex(block => block.id === currentEditingBlock.id);
      if (editingIndex !== -1 && editingIndex !== previewState.currentBlockIndex) {
        setPreviewState(prev => ({
          ...prev,
          currentBlockIndex: editingIndex,
          isPlaying: false
        }));
      }
    }
  }, [currentEditingBlock, blocks, previewState.currentBlockIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (!previewState.isPlaying || blocks.length === 0) return;

    const interval = setInterval(() => {
      setPreviewState(prev => {
        const nextIndex = (prev.currentBlockIndex + 1) % blocks.length;
        return {
          ...prev,
          currentBlockIndex: nextIndex
        };
      });
    }, 3000 / previewState.speed);

    return () => clearInterval(interval);
  }, [previewState.isPlaying, previewState.speed, blocks.length]);

  const currentBlock = useMemo(() => {
    return blocks[previewState.currentBlockIndex] || null;
  }, [blocks, previewState.currentBlockIndex]);

  const handlePlayPause = () => {
    setPreviewState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const handleReset = () => {
    setPreviewState(prev => ({
      ...prev,
      currentBlockIndex: 0,
      isPlaying: false
    }));
  };

  const handleBlockNavigation = (index: number) => {
    setPreviewState(prev => ({
      ...prev,
      currentBlockIndex: index,
      isPlaying: false
    }));
  };

  const renderBlockPreview = (block: StudyBuilderBlock) => {
    if (!block) return null;

    const getSettingAsString = (key: string, defaultValue: string = ''): string => {
      const value = block.settings?.[key];
      return typeof value === 'string' ? value : defaultValue;
    };

    const getSettingAsNumber = (key: string, defaultValue: number = 0): number => {
      const value = block.settings?.[key];
      return typeof value === 'number' ? value : defaultValue;
    };

    const getSettingAsArray = (key: string, defaultValue: string[] = []): string[] => {
      const value = block.settings?.[key];
      return Array.isArray(value) ? value : defaultValue;
    };

    switch (block.type) {
      case 'welcome_screen':
        return (
          <div className="text-center space-y-6 p-8">
            <h2 className="text-3xl font-bold text-gray-900">{block.title}</h2>
            {block.description && (
              <p className="text-lg text-gray-600">{block.description}</p>
            )}
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-blue-800">{getSettingAsString('message', 'Welcome to our study!')}</p>
            </div>
            <Button className="px-8 py-3">
              {getSettingAsString('buttonText', 'Get Started')}
            </Button>
          </div>
        );

      case 'feedback_collection':
        return (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
            {block.description && (
              <p className="text-gray-600">{block.description}</p>
            )}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-700">
                {getSettingAsString('question', 'Please share your thoughts:')}
              </label>
              <textarea
                placeholder={getSettingAsString('placeholder', 'Type your response here...')}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled
              />
              <div className="text-sm text-gray-500">
                {getSettingAsNumber('minLength') > 0 && `Minimum ${getSettingAsNumber('minLength')} characters`}
              </div>
            </div>
            <Button>Continue</Button>
          </div>
        );

      case 'comparison_test':
        return (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
            {block.description && (
              <p className="text-gray-600">{block.description}</p>
            )}
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-700">
                {getSettingAsString('question', 'Please select an option:')}
              </p>
              <div className="space-y-3">
                {getSettingAsArray('options', ['Option 1', 'Option 2', 'Option 3']).map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="preview-option"
                      className="w-4 h-4 text-blue-600"
                      disabled
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button>Continue</Button>
          </div>
        );

      case 'rating_scale':
        return (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
            {block.description && (
              <p className="text-gray-600">{block.description}</p>
            )}
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-700">
                {getSettingAsString('question', 'How would you rate this?')}
              </p>
              <div className="flex justify-center space-x-2">
                {Array.from({ length: getSettingAsNumber('maxValue', 5) }, (_, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 border-2 border-gray-300 rounded-full hover:border-blue-500 transition-colors"
                    disabled
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{getSettingAsString('minLabel', 'Poor')}</span>
                <span>{getSettingAsString('maxLabel', 'Excellent')}</span>
              </div>
            </div>
            <Button>Continue</Button>
          </div>
        );

      case 'task_instruction':
        return (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
            {block.description && (
              <p className="text-gray-600">{block.description}</p>
            )}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">Task Instructions</h3>
              <p className="text-yellow-800">{getSettingAsString('instructions', 'Complete the following task...')}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">What to do:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {getSettingAsArray('steps', ['Navigate to the page', 'Complete the action', 'Submit your response']).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
            <Button>Start Task</Button>
          </div>
        );

      case 'website_navigation':
        return (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
            {block.description && (
              <p className="text-gray-600">{block.description}</p>
            )}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Navigation Task</h3>
              <p className="text-blue-800">{getSettingAsString('url', 'https://example.com')}</p>
            </div>
            <Button>Open Website</Button>
          </div>
        );

      case 'completion_check':
        return (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
            {block.description && (
              <p className="text-gray-600">{block.description}</p>
            )}
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-700">
                {getSettingAsString('question', 'Were you able to complete the task?')}
              </p>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="completion" className="w-4 h-4 text-green-600" disabled />
                  <span className="text-gray-700">Yes, completed successfully</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="completion" className="w-4 h-4 text-red-600" disabled />
                  <span className="text-gray-700">No, unable to complete</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="completion" className="w-4 h-4 text-yellow-600" disabled />
                  <span className="text-gray-700">Partially completed</span>
                </label>
              </div>
            </div>
            <Button>Continue</Button>
          </div>
        );

      case 'thank_you_screen':
        return (
          <div className="text-center space-y-6 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{block.title || 'Thank You!'}</h2>
            {block.description && (
              <p className="text-lg text-gray-600">{block.description}</p>
            )}
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-green-800">
                {getSettingAsString('message', 'Your participation helps us improve our product. Thank you for your time!')}
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              {getSettingAsString('buttonText', 'Complete Study')}
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
            <div className="bg-gray-50 p-8 rounded-lg">
              <p className="text-gray-600">Preview for {block.type} block</p>
              <p className="text-sm text-gray-500 mt-2">
                Block ID: {block.id}
              </p>
            </div>
          </div>
        );
    }
  };

  if (blocks.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-8 text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Block Preview</h3>
          <p className="text-gray-500">Add blocks to see a live preview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      {/* Preview Controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Block {previewState.currentBlockIndex + 1} of {blocks.length}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  previewMode === 'participant' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setPreviewMode('participant')}
              >
                Participant View
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  previewMode === 'researcher' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setPreviewMode('researcher')}
              >
                Researcher View
              </button>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="p-2"
              >
                {previewState.isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="p-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
                className="p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Block Navigation */}
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto">
          {blocks.map((block, index) => (
            <button
              key={block.id}
              onClick={() => handleBlockNavigation(index)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === previewState.currentBlockIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}. {block.type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Speed Control */}
        {previewState.showSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Preview Speed:</label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">0.5x</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={previewState.speed}
                  onChange={(e) => setPreviewState(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">3x</span>
              </div>
              <span className="text-sm text-gray-700">{previewState.speed}x</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Preview Content */}
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlock?.id || 'empty'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px] bg-white"
          >
            {currentBlock && renderBlockPreview(currentBlock)}
          </motion.div>
        </AnimatePresence>

        {/* Preview Info for Researcher Mode */}
        {previewMode === 'researcher' && currentBlock && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Block Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-600">{currentBlock.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Order:</span>
                <span className="ml-2 text-gray-600">{currentBlock.order}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Settings:</span>
                <span className="ml-2 text-gray-600">{Object.keys(currentBlock.settings || {}).length} properties</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeBlockPreview;
