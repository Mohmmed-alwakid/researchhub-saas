import React, { useState, useMemo } from 'react';
import { X, Clock, Users, Star, Eye, Plus, Search, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Enhanced block templates with better descriptions and icons
const enhancedBlockTemplates: BlockTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Screen',
    description: 'Create a warm introduction that sets expectations and motivates participants',
    category: 'Essential',
    blockType: 'welcome',
    defaultSettings: { 
      title: 'Welcome to our study', 
      message: 'Thank you for participating!', 
      useCustomMessage: false,
      showEstimatedTime: true
    },
    metadata: {
      category: 'Essential',
      complexity: 'beginner',
      estimatedDuration: 1,
      tags: ['introduction', 'welcome', 'onboarding'],
      version: '1.0',
      lastModified: new Date(),
      icon: '👋',
      color: '#10B981'
    },
    usage: { 
      usageCount: 920, 
      popularity: 4.8, 
      rating: 4.8, 
      studyTypes: ['usability', 'survey', 'interview'],
      description: 'Sets the tone for your study and increases completion rates'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['title', 'message', 'useCustomMessage', 'showEstimatedTime'] 
    }
  },
  {
    id: 'five_second_test',
    name: '5-Second Test',
    description: 'Capture first impressions and test immediate understanding of designs',
    category: 'Usability',
    blockType: 'five_second_test',
    defaultSettings: { 
      imageUrl: '', 
      displayTime: 5, 
      questions: ['What is this page about?', 'What stands out to you most?'] 
    },
    metadata: {
      category: 'Usability',
      complexity: 'beginner',
      estimatedDuration: 3,
      tags: ['first impression', 'quick test', 'visual'],
      version: '1.0',
      lastModified: new Date(),
      icon: '⚡',
      color: '#F59E0B'
    },
    usage: { 
      usageCount: 650, 
      popularity: 4.6, 
      rating: 4.6, 
      studyTypes: ['usability', 'design validation'],
      description: 'Perfect for testing homepage clarity and visual hierarchy'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['imageUrl', 'displayTime', 'questions'] 
    }
  },
  {
    id: 'open_question',
    name: 'Open Question',
    description: 'Gather detailed qualitative insights with AI-powered analysis',
    category: 'Research',
    blockType: 'open_question',
    defaultSettings: { 
      question: 'Tell us about your experience...', 
      maxLength: 500, 
      aiAnalysis: true,
      followUpEnabled: true
    },
    metadata: {
      category: 'Research',
      complexity: 'beginner',
      estimatedDuration: 5,
      tags: ['qualitative', 'insights', 'ai analysis'],
      version: '1.0',
      lastModified: new Date(),
      icon: '💭',
      color: '#8B5CF6'
    },
    usage: { 
      usageCount: 850, 
      popularity: 4.7, 
      rating: 4.7, 
      studyTypes: ['survey', 'interview', 'feedback'],
      description: 'AI automatically identifies themes and sentiment in responses'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['question', 'maxLength', 'aiAnalysis', 'followUpEnabled'] 
    }
  },
  {
    id: 'opinion_scale',
    name: 'Opinion Scale',
    description: 'Measure satisfaction, difficulty, or agreement with customizable scales',
    category: 'Survey',
    blockType: 'opinion_scale',
    defaultSettings: { 
      question: 'How would you rate this experience?',
      scaleType: 'stars',
      min: 1, 
      max: 5, 
      labels: ['Poor', 'Excellent'],
      showNumbers: true
    },
    metadata: {
      category: 'Survey',
      complexity: 'beginner',
      estimatedDuration: 2,
      tags: ['rating', 'scale', 'quantitative'],
      version: '1.0',
      lastModified: new Date(),
      icon: '⭐',
      color: '#EF4444'
    },
    usage: { 
      usageCount: 720, 
      popularity: 4.6, 
      rating: 4.6, 
      studyTypes: ['survey', 'usability', 'satisfaction'],
      description: 'Get quantifiable feedback with beautiful visual scales'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['question', 'scaleType', 'min', 'max', 'labels', 'showNumbers'] 
    }
  },
  {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Ask structured questions with predefined answer options',
    category: 'Survey',
    blockType: 'multiple_choice',
    defaultSettings: { 
      question: 'Which option best describes...?',
      allowMultiple: false, 
      options: ['Option 1', 'Option 2', 'Option 3'],
      randomizeOptions: false,
      otherOption: false
    },
    metadata: {
      category: 'Survey',
      complexity: 'beginner',
      estimatedDuration: 3,
      tags: ['choice', 'structured', 'options'],
      version: '1.0',
      lastModified: new Date(),
      icon: '☑️',
      color: '#06B6D4'
    },
    usage: { 
      usageCount: 680, 
      popularity: 4.5, 
      rating: 4.5, 
      studyTypes: ['survey', 'research', 'screening'],
      description: 'Collect structured data with single or multiple selection'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['question', 'allowMultiple', 'options', 'randomizeOptions', 'otherOption'] 
    }
  },
  {
    id: 'simple_input',
    name: 'Simple Input',
    description: 'Collect specific information like names, emails, or short responses',
    category: 'Survey',
    blockType: 'simple_input',
    defaultSettings: { 
      question: 'Please provide...',
      inputType: 'text', 
      required: true,
      placeholder: 'Enter your response...',
      validation: true
    },
    metadata: {
      category: 'Survey',
      complexity: 'beginner',
      estimatedDuration: 2,
      tags: ['input', 'data collection', 'form'],
      version: '1.0',
      lastModified: new Date(),
      icon: '📝',
      color: '#84CC16'
    },
    usage: { 
      usageCount: 650, 
      popularity: 4.4, 
      rating: 4.4, 
      studyTypes: ['survey', 'contact', 'demographics'],
      description: 'Supports text, email, number, and date inputs with validation'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['question', 'inputType', 'required', 'placeholder', 'validation'] 
    }
  },
  {
    id: 'card_sort',
    name: 'Card Sort',
    description: 'Understand how users categorize and organize information',
    category: 'Advanced',
    blockType: 'card_sort',
    defaultSettings: { 
      cards: [], 
      categories: [], 
      sortType: 'open',
      instructions: 'Organize these items into groups that make sense to you'
    },
    metadata: {
      category: 'Advanced',
      complexity: 'intermediate',
      estimatedDuration: 15,
      tags: ['information architecture', 'categorization', 'ux research'],
      version: '1.0',
      lastModified: new Date(),
      icon: '🗂️',
      color: '#7C3AED'
    },
    usage: { 
      usageCount: 380, 
      popularity: 4.3, 
      rating: 4.3, 
      studyTypes: ['information architecture', 'navigation'],
      description: 'Optimize your site structure based on user mental models'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['cards', 'categories', 'sortType', 'instructions'] 
    }
  },
  {
    id: 'tree_test',
    name: 'Tree Test',
    description: 'Test the findability of topics in your website structure',
    category: 'Advanced',
    blockType: 'tree_test',
    defaultSettings: { 
      tree: {}, 
      tasks: [],
      showFullPath: false,
      allowBacktracking: true
    },
    metadata: {
      category: 'Advanced',
      complexity: 'intermediate',
      estimatedDuration: 12,
      tags: ['navigation', 'findability', 'ia testing'],
      version: '1.0',
      lastModified: new Date(),
      icon: '🌳',
      color: '#059669'
    },
    usage: { 
      usageCount: 420, 
      popularity: 4.4, 
      rating: 4.4, 
      studyTypes: ['navigation testing', 'ia validation'],
      description: 'Validate your navigation structure without visual design distractions'
    },
    customization: { 
      allowCustomization: true, 
      customizableFields: ['tree', 'tasks', 'showFullPath', 'allowBacktracking'] 
    }
  }
];

const categoryColors = {
  'Essential': '#10B981',
  'Survey': '#06B6D4', 
  'Usability': '#F59E0B',
  'Research': '#8B5CF6',
  'Advanced': '#EF4444'
};

const complexityBadgeColors = {
  'beginner': 'bg-green-100 text-green-800',
  'intermediate': 'bg-yellow-100 text-yellow-800',
  'advanced': 'bg-red-100 text-red-800'
};

export const ImprovedBlockLibraryModal: React.FC<BlockLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddBlock,
  studyType,
  currentBlocks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBlock, setSelectedBlock] = useState<BlockTemplate | null>(null);

  const categories = ['All', 'Essential', 'Survey', 'Usability', 'Research', 'Advanced'];

  const filteredBlocks = useMemo(() => {
    return enhancedBlockTemplates.filter(block => {
      const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           block.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           block.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || block.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleAddBlock = (template: BlockTemplate) => {
    onAddBlock(template);
    onClose();
  };

  const BlockPreviewModal = ({ block, onClose: closePreview }: { block: BlockTemplate; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={closePreview}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${block.metadata?.color}20` }}
              >
                {block.metadata?.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{block.name}</h3>
                <p className="text-gray-600">{block.description}</p>
              </div>
            </div>
            <button
              onClick={closePreview}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{block.usage?.usageCount?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Times Used</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-gray-900">{block.usage?.rating}</span>
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{block.metadata?.estimatedDuration}m</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>

          {/* Why Use This Block */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Why use this block?</h4>
            <p className="text-gray-700">{block.usage?.description}</p>
          </div>

          {/* Best For */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Best for:</h4>
            <div className="flex flex-wrap gap-2">
              {block.usage?.studyTypes?.map((type, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Customizable Fields */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">You can customize:</h4>
            <div className="flex flex-wrap gap-2">
              {block.customization?.customizableFields?.map((field, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={closePreview}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAddBlock(block)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Study</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Block Library</h2>
                <p className="text-gray-600">Choose blocks to add to your study</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredBlocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredBlocks.map((block) => (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                      viewMode === 'list' ? 'flex items-center space-x-4' : ''
                    }`}
                  >
                    <div className={`flex items-start ${viewMode === 'list' ? 'space-x-4 flex-1' : 'space-x-3 mb-4'}`}>
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: `${block.metadata?.color}20` }}
                      >
                        {block.metadata?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{block.name}</h3>
                          <span 
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              complexityBadgeColors[block.metadata?.complexity || 'beginner']
                            }`}
                          >
                            {block.metadata?.complexity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{block.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{block.metadata?.estimatedDuration}m</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{block.usage?.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{block.usage?.usageCount?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`flex ${viewMode === 'list' ? 'space-x-2' : 'justify-between mt-4'}`}>
                      <button
                        onClick={() => setSelectedBlock(block)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleAddBlock(block)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Block Preview Modal */}
      <AnimatePresence>
        {selectedBlock && (
          <BlockPreviewModal
            block={selectedBlock}
            onClose={() => setSelectedBlock(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
