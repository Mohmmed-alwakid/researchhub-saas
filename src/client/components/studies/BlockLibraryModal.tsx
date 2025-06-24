import React, { useState } from 'react';
import { X, Clock, Users, Star, Eye, Plus } from 'lucide-react';
import type { BlockTemplate, BlockType } from '../../../shared/types/index';

interface Block {
  id: string;
  templateId: string;
  name: string;
  description: string;
  estimatedDuration: number;
  settings: Record<string, unknown>;
  order: number;
  isRequired: boolean;
  type: BlockType;
}

interface BlockLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (template: BlockTemplate) => void;
  studyType: string;
  currentBlocks: Block[];
}

export const BlockLibraryModal: React.FC<BlockLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddBlock,
  studyType,
  currentBlocks // Keep this parameter to match the interface
}) => {
  // Keep currentBlocks parameter for interface compatibility but don't use it yet
  void currentBlocks;
  // Define the predefined block types
  const predefinedBlocks: BlockTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Screen',
      description: 'Introduce your study and welcome participants',
      category: 'Survey',
      blockType: 'welcome',
      defaultSettings: { title: 'Welcome to our study', message: 'Thank you for participating!', useCustomMessage: false },
      metadata: {
        category: 'Survey',
        complexity: 'beginner',
        estimatedDuration: 1,
        tags: ['introduction', 'welcome', 'onboarding'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 920, popularity: 4.8, rating: 4.8, studyTypes: ['usability', 'survey', 'interview'] },
      customization: { allowCustomization: true, customizableFields: ['title', 'message', 'useCustomMessage'] }
    },
    {
      id: 'context_screen',
      name: 'Context Screen',
      description: 'Provide instructions and context between tasks',
      category: 'Survey',
      blockType: 'context_screen',
      defaultSettings: { title: 'Instructions', content: 'Please read the following instructions carefully.' },
      metadata: {
        category: 'Survey',
        complexity: 'beginner',
        estimatedDuration: 2,
        tags: ['instructions', 'context', 'guidance'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 760, popularity: 4.5, rating: 4.5, studyTypes: ['usability', 'survey', 'interview'] },
      customization: { allowCustomization: true, customizableFields: ['title', 'content'] }
    },
    {
      id: 'screener',
      name: 'Screener',
      description: 'Filter out participants with preliminary questions',
      category: 'Research',
      blockType: 'screener',
      defaultSettings: { questions: [], passingCriteria: {} },
      metadata: {
        category: 'Research',
        complexity: 'beginner',
        estimatedDuration: 3,
        tags: ['screening', 'filtering'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 450, popularity: 4.2, rating: 4.2, studyTypes: ['usability', 'survey'] },
      customization: { allowCustomization: true, customizableFields: ['questions', 'passingCriteria'] }
    },
    {
      id: 'prototype_test',
      name: 'Prototype Test',
      description: 'Create a usability task for your testers',
      category: 'Usability',
      blockType: 'prototype_test',
      defaultSettings: { prototypeUrl: '', tasks: [] },
      metadata: {
        category: 'Usability',
        complexity: 'intermediate',
        estimatedDuration: 8,
        tags: ['prototype', 'usability'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 320, popularity: 4.5, rating: 4.5, studyTypes: ['usability'] },
      customization: { allowCustomization: true, customizableFields: ['prototypeUrl', 'tasks'] }
    },
    {
      id: 'live_website_test',
      name: 'Live Website Test',
      description: 'Capture user interactions on websites using code snippet',
      category: 'Usability',
      blockType: 'live_website_test',
      defaultSettings: { websiteUrl: '', codeSnippet: '', trackClicks: true },
      metadata: {
        category: 'Usability',
        complexity: 'advanced',
        estimatedDuration: 10,
        tags: ['website', 'live', 'tracking'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 280, popularity: 4.3, rating: 4.3, studyTypes: ['usability'] },
      customization: { allowCustomization: true, customizableFields: ['websiteUrl', 'codeSnippet', 'trackClicks'] }
    },
    {
      id: 'open_question',
      name: 'Open Question',
      description: 'Ask in-depth questions with advanced AI analysis tools',
      category: 'Survey',
      blockType: 'open_question',
      defaultSettings: { maxLength: 500, aiAnalysis: true },
      metadata: {
        category: 'Survey',
        complexity: 'beginner',
        estimatedDuration: 5,
        tags: ['questions', 'text', 'ai'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 850, popularity: 4.7, rating: 4.7, studyTypes: ['survey', 'interview'] },
      customization: { allowCustomization: true, customizableFields: ['maxLength', 'aiAnalysis'] }
    },
    {
      id: 'simple_input',
      name: 'Simple Input',
      description: 'Ask basic questions to gather text, numerical, date, or email data',
      category: 'Survey',
      blockType: 'simple_input',
      defaultSettings: { inputType: 'text', required: true },
      metadata: {
        category: 'Survey',
        complexity: 'beginner',
        estimatedDuration: 2,
        tags: ['input', 'basic', 'data'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 650, popularity: 4.4, rating: 4.4, studyTypes: ['survey', 'interview'] },
      customization: { allowCustomization: true, customizableFields: ['inputType', 'required'] }
    },
    {
      id: 'opinion_scale',
      name: 'Opinion Scale',
      description: 'Measure opinion with a rating scale',
      category: 'Survey',
      blockType: 'opinion_scale',
      defaultSettings: { min: 1, max: 5, labels: ['Poor', 'Excellent'] },
      metadata: {
        category: 'Survey',
        complexity: 'beginner',
        estimatedDuration: 2,
        tags: ['rating', 'scale', 'opinion'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 720, popularity: 4.6, rating: 4.6, studyTypes: ['survey', 'usability'] },
      customization: { allowCustomization: true, customizableFields: ['min', 'max', 'labels'] }
    },
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      description: 'Ask a question with multiple answer choices',
      category: 'Survey',
      blockType: 'multiple_choice',
      defaultSettings: { allowMultiple: false, options: [] },
      metadata: {
        category: 'Survey',
        complexity: 'beginner',
        estimatedDuration: 3,
        tags: ['choice', 'options', 'selection'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 680, popularity: 4.5, rating: 4.5, studyTypes: ['survey', 'interview'] },
      customization: { allowCustomization: true, customizableFields: ['allowMultiple', 'options'] }
    },
    {
      id: 'yes_no',
      name: 'Yes/No',
      description: "Ask a question with a 'yes' or 'no' answer",
      category: 'Survey',
      blockType: 'yes_no',
      defaultSettings: { required: true },
      metadata: {
        category: 'Survey',
        complexity: 'beginner',
        estimatedDuration: 1,
        tags: ['binary', 'yes', 'no'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 520, popularity: 4.3, rating: 4.3, studyTypes: ['survey', 'interview'] },
      customization: { allowCustomization: true, customizableFields: ['required'] }
    },
    {
      id: 'card_sort',
      name: 'Card Sort',
      description: 'See how users understand and group ideas',
      category: 'Research',
      blockType: 'card_sort',
      defaultSettings: { categories: [], cards: [] },
      metadata: {
        category: 'Research',
        complexity: 'intermediate',
        estimatedDuration: 12,
        tags: ['sorting', 'categorization', 'grouping'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 340, popularity: 4.4, rating: 4.4, studyTypes: ['usability'] },
      customization: { allowCustomization: true, customizableFields: ['categories', 'cards'] }
    },
    {
      id: 'five_second_test',
      name: '5-Second Test',
      description: 'Display image for a limited time to test user recall',
      category: 'Usability',
      blockType: 'five_second_test',
      defaultSettings: { duration: 5, showQuestion: true },
      metadata: {
        category: 'Usability',
        complexity: 'intermediate',
        estimatedDuration: 5,
        tags: ['recall', 'memory', 'first-impression'],
        version: '1.0',
        lastModified: new Date()
      },      usage: { usageCount: 430, popularity: 4.1, rating: 4.1, studyTypes: ['usability'] },
      customization: { allowCustomization: true, customizableFields: ['duration', 'showQuestion'] }
    },
    {
      id: 'tree_test',
      name: 'Tree Test',
      description: 'Test navigation and findability in information architecture',
      category: 'Usability',
      blockType: 'tree_test',
      defaultSettings: { tree: [], tasks: [] },
      metadata: {
        category: 'Usability',
        complexity: 'intermediate',
        estimatedDuration: 8,
        tags: ['navigation', 'findability', 'information-architecture'],
        version: '1.0',
        lastModified: new Date()
      },
      usage: { usageCount: 280, popularity: 4.2, rating: 4.2, studyTypes: ['usability'] },
      customization: { allowCustomization: true, customizableFields: ['tree', 'tasks'] }
    }  ];

  const [filteredTemplates] = useState<BlockTemplate[]>(predefinedBlocks);
  const [selectedTemplate, setSelectedTemplate] = useState<BlockTemplate | null>(null);

  const getDifficultyColor = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };  const getBlockTypeIcon = (blockType: BlockType | undefined) => {
    if (!blockType) return '📋';
    
    const iconMap: Record<BlockType, string> = {
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
      thank_you: '🙏'
    };
    return iconMap[blockType] || '📋';
  };

  const handleAddBlock = (template: BlockTemplate) => {
    onAddBlock(template);
    onClose();
  };

  const handlePreview = (template: BlockTemplate) => {
    setSelectedTemplate(template);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Block Library</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add blocks to your study. Blocks are modular components that guide participants through your research.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto">            {/* Search - Removed per user request */}            {/* Categories - Removed per user request */}
          </div>          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Results Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {filteredTemplates.length} Block{filteredTemplates.length !== 1 ? 's' : ''} Available
                    </h3>
                    <div className="text-sm text-gray-500">
                      For {studyType.replace('_', ' ')} studies
                    </div>
                  </div>
                </div>

                {/* Results Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks found</h3>
                      <p className="text-gray-600">
                        Try adjusting your search or category filters
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getBlockTypeIcon(template.blockType || 'context_screen')}</span>
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>                                <div className="flex items-center space-x-2 mt-1">                            <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(template.metadata?.complexity || 'beginner')}`}>
                              {template.metadata?.complexity || 'beginner'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {template.metadata?.estimatedDuration || 5}m
                            </span>
                                </div>
                              </div>
                            </div>                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{(template.usage?.rating || 4.0).toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {template.description}
                          </p>                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(template.metadata?.tags || []).slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {(template.metadata?.tags?.length || 0) > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                +{(template.metadata?.tags?.length || 0) - 3}
                              </span>
                            )}
                          </div>                          {/* Usage Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {template.usage?.usageCount || 0} uses
                            </span>
                            <span>{template.blockType ? template.blockType.replace('_', ' ') : 'Unknown Type'}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePreview(template)}
                              className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </button>
                            <button
                              onClick={() => handleAddBlock(template)}
                              className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Block
                            </button>
                          </div>                        </div>
                      ))}
                    </div>
                  )}
                </div>
          </div>
        </div>

        {/* Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedTemplate.name} Preview
                  </h3>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                    <div>
                    <h4 className="font-medium text-gray-900 mb-2">Block Type</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                      {getBlockTypeIcon(selectedTemplate.blockType || 'context_screen')} {selectedTemplate.blockType ? selectedTemplate.blockType.replace('_', ' ') : 'Unknown Type'}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Settings</h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(selectedTemplate.defaultSettings, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleAddBlock(selectedTemplate);
                      setSelectedTemplate(null);
                    }}
                    className="px-4 py-2 text-sm text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Add This Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
