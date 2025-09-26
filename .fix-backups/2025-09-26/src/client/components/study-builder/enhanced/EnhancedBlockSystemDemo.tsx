import React, { useState } from 'react';
import { StudyBuilderBlock, BlockType, getDefaultBlockSettings } from '../types';
import { EnhancedBlockEditor } from './EnhancedBlockEditor';
import { EnhancedBlockPreview } from './EnhancedBlockPreview';

const DEMO_BLOCKS: { type: BlockType; title: string; description: string }[] = [
  { type: 'task_instruction', title: 'Find Contact Information', description: 'Navigate to contact page' },
  { type: 'website_navigation', title: 'Navigation Task', description: 'Complete website navigation' },
  { type: 'rating_scale', title: 'Ease Rating', description: 'Rate task difficulty' },
  { type: 'feedback_collection', title: 'User Feedback', description: 'Collect participant thoughts' },
  { type: 'comparison_test', title: 'Design Comparison', description: 'Compare two design options' },
  { type: 'completion_check', title: 'Task Completion', description: 'Verify task completion' }
];

export const EnhancedBlockSystemDemo: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<StudyBuilderBlock>(() => ({
    id: 'demo-block-1',
    type: 'rating_scale',
    order: 0,
    title: 'How easy was this task?',
    description: 'Rate the difficulty of completing the navigation task',
    settings: {
      ...getDefaultBlockSettings('rating_scale'),
      question: 'How would you rate the ease of completing this task?',
      scaleType: 'numeric',
      minValue: 1,
      maxValue: 10,
      minLabel: 'Very Difficult',
      maxLabel: 'Very Easy'
    }
  }));

  const [participantData, setParticipantData] = useState<Record<string, string | number | boolean>>({});

  const updateBlock = (blockId: string, updates: Partial<StudyBuilderBlock>) => {
    if (blockId === selectedBlock.id) {
      setSelectedBlock(prev => ({ ...prev, ...updates }));
    }
  };

  const createNewBlock = (type: BlockType, title: string, description: string) => {
    const newBlock: StudyBuilderBlock = {
      id: `demo-block-${Date.now()}`,
      type,
      order: 0,
      title,
      description,
      settings: getDefaultBlockSettings(type)
    };
    setSelectedBlock(newBlock);
    setParticipantData({}); // Reset participant data when switching blocks
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Enhanced Block Configuration System
          </h1>
          <p className="text-lg text-gray-600">
            Professional block editing with real-time preview for all 8 block types
          </p>
        </div>

        {/* Block Type Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Block Type to Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_BLOCKS.map((demo) => (
              <button
                key={demo.type}
                onClick={() => createNewBlock(demo.type, demo.title, demo.description)}
                className={`p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedBlock.type === demo.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{demo.title}</div>
                <div className="text-sm text-gray-500 mt-1">{demo.type.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Enhanced Block Editor */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚙️</span>
                <h2 className="text-lg font-semibold text-gray-900">Block Configuration</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enhanced editing interface with block-specific fields
              </p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <EnhancedBlockEditor
                block={selectedBlock}
                onUpdate={updateBlock}
              />
            </div>
          </div>

          {/* Right: Enhanced Block Preview */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👁️</span>
                  <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Interactive:</span>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Exactly what participants will see and interact with
              </p>
            </div>
            <div className="p-6">
              <EnhancedBlockPreview
                block={selectedBlock}
                participantData={participantData}
                onParticipantDataChange={setParticipantData}
                isInteractive={true}
              />
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✨ Enhanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-900">Specialized UIs</h3>
              <p className="text-sm text-gray-600 mt-1">
                Custom configuration forms for each block type
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900">Real-time Preview</h3>
              <p className="text-sm text-gray-600 mt-1">
                See changes instantly as you edit
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900">Interactive Testing</h3>
              <p className="text-sm text-gray-600 mt-1">
                Test participant interactions before publishing
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-900">Responsive Design</h3>
              <p className="text-sm text-gray-600 mt-1">
                Optimized for all devices and screen sizes
              </p>
            </div>
          </div>
        </div>

        {/* Participant Data Debug (for demo purposes) */}
        {Object.keys(participantData).length > 0 && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Participant Response Data</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(participantData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
