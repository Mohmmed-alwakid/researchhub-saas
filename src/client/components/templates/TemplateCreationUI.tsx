import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  Trash2,
  Edit3,
  Copy,
  CheckCircle,
  Clock,
  Users,
  Target,
  Lightbulb,
  X,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

interface TemplateBlock {
  id: string;
  type: string;
  title: string;
  description: string;
  settings: Record<string, unknown>;
  isRequired: boolean;
  estimatedDuration: number;
}

interface TemplateData {
  id?: string;
  title: string;
  description: string;
  category: string;
  purpose: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  recommendedParticipants: { min: number; max: number };
  tags: string[];
  blocks: TemplateBlock[];
  metadata: {
    author: string;
    version: string;
    isPublic: boolean;
  };
}

interface TemplateCreationUIProps {
  initialTemplate?: TemplateData;
  onSave: (template: TemplateData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  blockSuggestions: string[];
}

// API helper functions
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://researchhub-staging.vercel.app' 
  : 'http://localhost:3003';

async function fetchTemplateCategories(): Promise<TemplateCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/templates?action=categories`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Failed to fetch categories:', result.error);
      return getDefaultCategories();
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return getDefaultCategories();
  }
}

async function saveTemplate(template: TemplateData, token?: string): Promise<{ success: boolean; data?: TemplateData; error?: string }> {
  try {
    const url = template.id 
      ? `${API_BASE_URL}/api/templates/${template.id}`
      : `${API_BASE_URL}/api/templates`;
    
    const method = template.id ? 'PUT' : 'POST';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(template)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving template:', error);
    return {
      success: false,
      error: 'Failed to save template'
    };
  }
}

// Fallback categories if API fails
function getDefaultCategories(): TemplateCategory[] {
  return [
    { id: 'usability-testing', name: 'Usability Testing', description: 'Test user interactions and workflows', icon: '🖱️', blockSuggestions: ['welcome_screen', 'context_screen', '5_second_test', 'open_question', 'thank_you'] },
    { id: 'content-testing', name: 'Content Testing', description: 'Evaluate content effectiveness and comprehension', icon: '📝', blockSuggestions: ['welcome_screen', 'context_screen', 'multiple_choice', 'opinion_scale', 'thank_you'] },
    { id: 'user-interviews', name: 'User Interviews', description: 'Conduct structured user interviews', icon: '🎤', blockSuggestions: ['welcome_screen', 'open_question', 'simple_input', 'thank_you'] },
    { id: 'concept-testing', name: 'Concept Testing', description: 'Test new ideas and concepts', icon: '💡', blockSuggestions: ['welcome_screen', 'context_screen', 'opinion_scale', 'yes_no', 'thank_you'] },
    { id: 'card-sorting', name: 'Card Sorting', description: 'Information architecture and categorization', icon: '🃏', blockSuggestions: ['welcome_screen', 'context_screen', 'card_sort', 'open_question', 'thank_you'] },
    { id: 'survey-research', name: 'Survey Research', description: 'Structured data collection and analysis', icon: '📊', blockSuggestions: ['welcome_screen', 'multiple_choice', 'opinion_scale', 'simple_input', 'thank_you'] },
    { id: 'first-impression', name: 'First Impression', description: 'Capture immediate reactions and impressions', icon: '⚡', blockSuggestions: ['welcome_screen', '5_second_test', 'open_question', 'opinion_scale', 'thank_you'] },
    { id: 'a-b-testing', name: 'A/B Testing', description: 'Compare different design variations', icon: '🔄', blockSuggestions: ['welcome_screen', 'context_screen', 'opinion_scale', 'multiple_choice', 'thank_you'] },
    { id: 'other', name: 'Other', description: 'Custom research studies', icon: '🎯', blockSuggestions: ['welcome_screen', 'open_question', 'thank_you'] }
  ];
}

const AVAILABLE_BLOCK_TYPES = [
  {
    type: 'welcome',
    name: 'Welcome Screen',
    icon: '👋',
    description: 'Introduce participants to your study',
    defaultDuration: 2,
    category: 'introduction'
  },
  {
    type: 'context_screen',
    name: 'Instructions',
    icon: '📋',
    description: 'Provide context and guidance',
    defaultDuration: 3,
    category: 'guidance'
  },
  {
    type: 'open_question',
    name: 'Open Question',
    icon: '💬',
    description: 'Collect qualitative feedback',
    defaultDuration: 5,
    category: 'feedback'
  },
  {
    type: 'multiple_choice',
    name: 'Multiple Choice',
    icon: '☑️',
    description: 'Quick selection questions',
    defaultDuration: 2,
    category: 'feedback'
  },
  {
    type: 'opinion_scale',
    name: 'Rating Scale',
    icon: '⭐',
    description: 'Numerical or star ratings',
    defaultDuration: 2,
    category: 'feedback'
  },
  {
    type: 'simple_input',
    name: 'Text Input',
    icon: '✏️',
    description: 'Collect structured responses',
    defaultDuration: 3,
    category: 'feedback'
  },
  {
    type: 'yes_no',
    name: 'Yes/No Question',
    icon: '✅',
    description: 'Binary decision questions',
    defaultDuration: 1,
    category: 'feedback'
  },
  {
    type: '5_second_test',
    name: '5-Second Test',
    icon: '⚡',
    description: 'First impression testing',
    defaultDuration: 1,
    category: 'testing'
  },
  {
    type: 'card_sort',
    name: 'Card Sort',
    icon: '🃏',
    description: 'Information architecture testing',
    defaultDuration: 15,
    category: 'testing'
  },
  {
    type: 'image_upload',
    name: 'Image Upload',
    icon: '🖼️',
    description: 'Collect visual content',
    defaultDuration: 3,
    category: 'upload'
  },
  {
    type: 'file_upload',
    name: 'File Upload',
    icon: '📎',
    description: 'Collect documents and files',
    defaultDuration: 3,
    category: 'upload'
  },
  {
    type: 'thank_you',
    name: 'Thank You',
    icon: '🎉',
    description: 'Study completion message',
    defaultDuration: 1,
    category: 'conclusion'
  }
];



export const TemplateCreationUI: React.FC<TemplateCreationUIProps> = ({
  initialTemplate,
  onSave,
  onCancel,
  mode
}) => {
  // Get authentication context
  const { user, token, isAuthenticated } = useAuthStore();

  const [template, setTemplate] = useState<TemplateData>({
    title: '',
    description: '',
    category: 'usability-testing',
    purpose: '',
    difficulty: 'beginner',
    estimatedDuration: 0,
    recommendedParticipants: { min: 5, max: 15 },
    tags: [],
    blocks: [],
    metadata: {
      author: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User',
      version: '1.0.0',
      isPublic: false
    },
    ...initialTemplate
  });

type ActiveTab = 'details' | 'blocks' | 'preview';
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');
  const [selectedBlock, setSelectedBlock] = useState<TemplateBlock | null>(null);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: []
  });

  // Categories state and API integration
  const [categories, setCategories] = useState<TemplateCategory[]>(getDefaultCategories());
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [templateStats, setTemplateStats] = useState({
    totalBlocks: 0,
    estimatedDuration: 0,
    blockTypes: [] as string[],
    completionPercentage: 0
  });

  // Load categories from API on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const apiCategories = await fetchTemplateCategories();
        setCategories(apiCategories);
        toast.success('Template categories loaded successfully');
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Using default categories (API unavailable)');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Auto-calculate template statistics
  useEffect(() => {
    const totalBlocks = template.blocks.length;
    const totalDuration = template.blocks.reduce((sum, block) => sum + block.estimatedDuration, 0);
    const blockTypes = [...new Set(template.blocks.map(block => block.type))];
    
    // Calculate completion percentage based on required fields
    let completedFields = 0;
    const totalRequiredFields = 6; // title, description, purpose, category, blocks, metadata
    
    if (template.title.trim()) completedFields++;
    if (template.description.trim()) completedFields++;
    if (template.purpose.trim()) completedFields++;
    if (template.category) completedFields++;
    if (template.blocks.length > 0) completedFields++;
    if (template.tags.length > 0) completedFields++;
    
    const completionPercentage = Math.round((completedFields / totalRequiredFields) * 100);

    setTemplateStats({
      totalBlocks,
      estimatedDuration: totalDuration,
      blockTypes,
      completionPercentage
    });

    // Update template duration
    setTemplate(prev => ({
      ...prev,
      estimatedDuration: totalDuration
    }));
  }, [template.title, template.description, template.purpose, template.category, template.blocks, template.tags]);

  // Validation
  useEffect(() => {
    const errors: string[] = [];
    
    if (!template.title.trim()) errors.push('Template title is required');
    if (!template.description.trim()) errors.push('Template description is required');
    if (!template.purpose.trim()) errors.push('Template purpose is required');
    if (template.blocks.length === 0) errors.push('At least one block is required');
    if (template.blocks.length > 0 && !template.blocks.some(b => b.type === 'thank_you')) {
      errors.push('Template should include a Thank You block');
    }

    setValidation({
      isValid: errors.length === 0,
      errors
    });
  }, [template]);

  const handleAddBlock = (blockType: typeof AVAILABLE_BLOCK_TYPES[0]) => {
    const newBlock: TemplateBlock = {
      id: `block_${Date.now()}`,
      type: blockType.type,
      title: blockType.name,
      description: blockType.description,
      settings: getDefaultSettings(blockType.type),
      isRequired: blockType.type === 'welcome' || blockType.type === 'thank_you',
      estimatedDuration: blockType.defaultDuration
    };

    setTemplate(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));

    // Open block editor for customization
    setSelectedBlock(newBlock);
    setShowBlockEditor(true);
  };

  const handleMoveBlock = (fromIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (newIndex < 0 || newIndex >= template.blocks.length) return;

    const blocks = Array.from(template.blocks);
    const [movedBlock] = blocks.splice(fromIndex, 1);
    blocks.splice(newIndex, 0, movedBlock);

    setTemplate(prev => ({
      ...prev,
      blocks
    }));
  };

  const handleRemoveBlock = (blockId: string) => {
    setTemplate(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
  };

  const handleDuplicateBlock = (block: TemplateBlock) => {
    const duplicatedBlock: TemplateBlock = {
      ...block,
      id: `block_${Date.now()}`,
      title: `${block.title} (Copy)`
    };

    const blockIndex = template.blocks.findIndex(b => b.id === block.id);
    const newBlocks = [...template.blocks];
    newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);

    setTemplate(prev => ({
      ...prev,
      blocks: newBlocks
    }));
  };

  const handleSaveTemplate = async () => {
    if (!validation.isValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    // Check authentication for API operations
    if (!isAuthenticated || !token) {
      toast.error('Please log in to save templates');
      return;
    }

    // Check user role
    if (user?.role !== 'researcher' && user?.role !== 'admin') {
      toast.error('Only researchers and admins can create templates');
      return;
    }

    try {
      setSaving(true);
      
      // Try saving to API with authentication
      const apiResult = await saveTemplate(template, token);
      if (apiResult.success) {
        toast.success(`Template ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        
        // Also call the parent onSave if provided
        await onSave(apiResult.data || template);
      } else {
        // Show API error or fallback to parent onSave
        if (apiResult.error) {
          toast.error(`API Error: ${apiResult.error}`);
        }
        
        // Fallback to parent onSave for development
        await onSave(template);
        toast.success(`Template ${mode === 'create' ? 'created' : 'updated'} locally!`);
      }
    } catch (error) {
      toast.error(`Failed to ${mode} template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getDefaultSettings = (blockType: string) => {
    switch (blockType) {
      case 'welcome':
        return {
          message: 'Welcome to our study! Thank you for participating.',
          showLogo: true
        };
      case 'open_question':
        return {
          question: 'What are your thoughts about this experience?',
          placeholder: 'Please share your feedback...',
          required: true,
          maxLength: 500
        };
      case 'multiple_choice':
        return {
          question: 'Please select your preference:',
          options: ['Option 1', 'Option 2', 'Option 3'],
          allowMultiple: false,
          required: true
        };
      case 'opinion_scale':
        return {
          question: 'How would you rate this experience?',
          scaleType: 'numerical',
          minValue: 1,
          maxValue: 5,
          minLabel: 'Poor',
          maxLabel: 'Excellent'
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Create New Template' : 'Edit Template'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Build a reusable study template with custom blocks and settings
                </p>
              </div>
              
              {/* Template Statistics */}
              <div className="flex items-center space-x-6 ml-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>{templateStats.totalBlocks} blocks</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{templateStats.estimatedDuration} min</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${templateStats.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span>{templateStats.completionPercentage}% complete</span>
                  </div>
                </div>

                {loadingCategories && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading categories...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isAuthenticated && (
              <div className="flex items-center text-amber-600 text-sm">
                <Info className="w-4 h-4 mr-1" />
                Please log in to save templates
              </div>
            )}
            {isAuthenticated && user?.role && !['researcher', 'admin'].includes(user.role) && (
              <div className="flex items-center text-amber-600 text-sm">
                <Info className="w-4 h-4 mr-1" />
                Only researchers and admins can create templates
              </div>
            )}
            {!validation.isValid && (
              <div className="flex items-center text-red-600 text-sm">
                <Info className="w-4 h-4 mr-1" />
                {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
              </div>
            )}
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate} 
              disabled={!validation.isValid || saving || !isAuthenticated || (user?.role && !['researcher', 'admin'].includes(user.role) ? true : false)}
              className="min-w-[120px]"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create Template' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'details' as const, label: 'Template Details', icon: Settings },
            { id: 'blocks' as const, label: 'Study Blocks', icon: Plus },
            { id: 'preview' as const, label: 'Preview', icon: Eye }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'details' && (
            <TemplateDetailsTab 
              template={template} 
              onUpdate={setTemplate}
              validation={validation}
              categories={categories}
            />
          )}
          
          {activeTab === 'blocks' && (
            <TemplateBlocksTab 
              template={template}
              availableBlocks={AVAILABLE_BLOCK_TYPES}
              onAddBlock={handleAddBlock}
              onRemoveBlock={handleRemoveBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onMoveBlock={handleMoveBlock}
              onEditBlock={(block) => {
                setSelectedBlock(block);
                setShowBlockEditor(true);
              }}
            />
          )}
          
          {activeTab === 'preview' && (
            <TemplatePreviewTab template={template} categories={categories} />
          )}
        </div>

        {/* Block Editor Modal */}
        {showBlockEditor && selectedBlock && (
          <BlockEditorModal
            block={selectedBlock}
            onSave={(updatedBlock) => {
              setTemplate(prev => ({
                ...prev,
                blocks: prev.blocks.map(b => 
                  b.id === updatedBlock.id ? updatedBlock : b
                )
              }));
              setShowBlockEditor(false);
              setSelectedBlock(null);
            }}
            onCancel={() => {
              setShowBlockEditor(false);
              setSelectedBlock(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Template Details Tab Component
interface TemplateDetailsTabProps {
  template: TemplateData;
  onUpdate: (template: TemplateData) => void;
  validation: { isValid: boolean; errors: string[] };
  categories: TemplateCategory[];
}

const TemplateDetailsTab: React.FC<TemplateDetailsTabProps> = ({ 
  template, 
  onUpdate,
  validation,
  categories
}) => {
  const handleTagAdd = (tag: string) => {
    if (tag && !template.tags.includes(tag)) {
      onUpdate({
        ...template,
        tags: [...template.tags, tag]
      });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onUpdate({
      ...template,
      tags: template.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Validation Errors */}
        {!validation.isValid && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Please fix the following issues:
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Title *
              </label>
              <input
                type="text"
                value={template.title}
                onChange={(e) => onUpdate({ ...template, title: e.target.value })}
                placeholder="e.g., E-commerce Checkout Flow Test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={template.description}
                onChange={(e) => onUpdate({ ...template, description: e.target.value })}
                placeholder="Describe what this template is designed to test and what insights it provides"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Purpose *
              </label>
              <textarea
                value={template.purpose}
                onChange={(e) => onUpdate({ ...template, purpose: e.target.value })}
                placeholder="What specific research questions will this template help answer?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={template.category}
                  onChange={(e) => onUpdate({ ...template, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category: TemplateCategory) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={template.difficulty}
                  onChange={(e) => onUpdate({ 
                    ...template, 
                    difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Study Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommended Participants
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={template.recommendedParticipants.min}
                      onChange={(e) => onUpdate({ 
                        ...template, 
                        recommendedParticipants: {
                          ...template.recommendedParticipants,
                          min: Number(e.target.value)
                        }
                      })}
                      placeholder="Min"
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <span className="flex items-center text-gray-500">to</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={template.recommendedParticipants.max}
                      onChange={(e) => onUpdate({ 
                        ...template, 
                        recommendedParticipants: {
                          ...template.recommendedParticipants,
                          max: Number(e.target.value)
                        }
                      })}
                      placeholder="Max"
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {template.estimatedDuration} minutes (calculated from blocks)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags and Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Tags and Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <TagInput 
                tags={template.tags}
                onAdd={handleTagAdd}
                onRemove={handleTagRemove}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={template.metadata.isPublic}
                onChange={(e) => onUpdate({
                  ...template,
                  metadata: {
                    ...template.metadata,
                    isPublic: e.target.checked
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                Make this template public (other researchers can use it)
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Template Blocks Tab Component
interface TemplateBlocksTabProps {
  template: TemplateData;
  availableBlocks: typeof AVAILABLE_BLOCK_TYPES;
  onAddBlock: (blockType: typeof AVAILABLE_BLOCK_TYPES[0]) => void;
  onRemoveBlock: (blockId: string) => void;
  onDuplicateBlock: (block: TemplateBlock) => void;
  onEditBlock: (block: TemplateBlock) => void;
  onMoveBlock?: (fromIndex: number, direction: 'up' | 'down') => void;
}

const TemplateBlocksTab: React.FC<TemplateBlocksTabProps> = ({
  template,
  availableBlocks,
  onAddBlock,
  onRemoveBlock,
  onDuplicateBlock,
  onMoveBlock,
  onEditBlock
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', label: 'All Blocks' },
    { id: 'introduction', label: 'Introduction' },
    { id: 'guidance', label: 'Guidance' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'testing', label: 'Testing' },
    { id: 'upload', label: 'Upload' },
    { id: 'conclusion', label: 'Conclusion' }
  ];

  const filteredBlocks = activeCategory === 'all' 
    ? availableBlocks 
    : availableBlocks.filter(block => block.category === activeCategory);

  return (
    <div className="flex h-full">
      {/* Block Library Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Block Library</h3>
          
          {/* Category Filter */}
          <div className="space-y-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredBlocks.map(block => (
              <Card 
                key={block.type}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onAddBlock(block)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{block.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {block.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {block.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {block.defaultDuration} min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Template Builder */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Study Flow</h3>
              <p className="text-sm text-gray-500 mt-1">
                {template.blocks.length} blocks • ~{template.estimatedDuration} minutes
              </p>
            </div>
            
            {template.blocks.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {template.recommendedParticipants.min}-{template.recommendedParticipants.max} participants
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {template.blocks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Template</h3>
                <p className="text-gray-500 mb-4">
                  Add blocks from the library to create your study flow
                </p>
                <Button variant="outline" onClick={() => onAddBlock(availableBlocks[0])}>
                  Add Your First Block
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {template.blocks.map((block, index) => (
                <TemplateBlockCard
                  key={block.id}
                  block={block}
                  index={index}
                  totalBlocks={template.blocks.length}
                  onEdit={() => onEditBlock(block)}
                  onDuplicate={() => onDuplicateBlock(block)}
                  onRemove={() => onRemoveBlock(block.id)}
                  onMoveUp={onMoveBlock ? () => onMoveBlock(index, 'up') : undefined}
                  onMoveDown={onMoveBlock ? () => onMoveBlock(index, 'down') : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Template Block Card Component
interface TemplateBlockCardProps {
  block: TemplateBlock;
  index: number;
  totalBlocks: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const TemplateBlockCard: React.FC<TemplateBlockCardProps> = ({
  block,
  index,
  totalBlocks,
  onEdit,
  onDuplicate,
  onRemove,
  onMoveUp,
  onMoveDown
}) => {
    const blockType = AVAILABLE_BLOCK_TYPES.find(bt => bt.type === block.type);
    
    return (
      <motion.div
        className="bg-white border rounded-lg p-4 transition-all hover:shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start space-x-4">
          {/* Move Buttons */}
          <div className="flex flex-col space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 h-6 w-6"
              title="Move Up"
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={index === totalBlocks - 1}
              className="p-1 h-6 w-6"
              title="Move Down"
            >
              ↓
            </Button>
          </div>

          {/* Block Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-lg">{blockType?.icon}</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {index + 1}. {block.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {block.description}
                </p>
              </div>
              
              {block.isRequired && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  Required
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {block.estimatedDuration} min
              </div>
              <div className="flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {blockType?.category}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-1 h-auto"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="p-1 h-auto"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="p-1 h-auto text-red-600 hover:text-red-700"
              disabled={block.isRequired}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
};

// Template Preview Tab Component
interface TemplatePreviewTabProps {
  template: TemplateData;
  categories: TemplateCategory[];
}

const TemplatePreviewTab: React.FC<TemplatePreviewTabProps> = ({ template, categories }) => {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{template.title || 'Untitled Template'}</CardTitle>
                <p className="text-gray-600 mt-2">{template.description}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {template.difficulty}
              </span>
            </div>
          </CardHeader>
          
          <CardContent>
            {template.purpose && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Research Purpose</h3>
                <p className="text-gray-700">{template.purpose}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Duration</div>
                  <div className="text-sm text-gray-600">~{template.estimatedDuration} minutes</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Participants</div>
                  <div className="text-sm text-gray-600">
                    {template.recommendedParticipants.min}-{template.recommendedParticipants.max} users
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Category</div>
                  <div className="text-sm text-gray-600">
                    {categories.find((c: TemplateCategory) => c.id === template.category)?.name}
                  </div>
                </div>
              </div>
            </div>

            {template.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Flow Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Study Flow Preview</CardTitle>
            <p className="text-gray-600">
              This is how participants will experience your study
            </p>
          </CardHeader>
          
          <CardContent>
            {template.blocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Add blocks to see the study flow preview</p>
              </div>
            ) : (
              <div className="space-y-4">
                {template.blocks.map((block, index) => {
                  const blockType = AVAILABLE_BLOCK_TYPES.find(bt => bt.type === block.type);
                  return (
                    <div key={block.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      
                      <span className="text-xl">{blockType?.icon}</span>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{block.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{block.description}</p>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {block.estimatedDuration} min
                      </div>
                      
                      {block.isRequired && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Tag Input Component
interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span 
            key={tag}
            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a tag and press Enter"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

// Block Editor Modal Component
interface BlockEditorModalProps {
  block: TemplateBlock;
  onSave: (block: TemplateBlock) => void;
  onCancel: () => void;
}

const BlockEditorModal: React.FC<BlockEditorModalProps> = ({ block, onSave, onCancel }) => {
  const [editedBlock, setEditedBlock] = useState<TemplateBlock>({ ...block });

  const handleSave = () => {
    onSave(editedBlock);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Edit Block: {editedBlock.title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block Title
            </label>
            <input
              type="text"
              value={editedBlock.title}
              onChange={(e) => setEditedBlock(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editedBlock.description}
              onChange={(e) => setEditedBlock(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={editedBlock.estimatedDuration}
                onChange={(e) => setEditedBlock(prev => ({ 
                  ...prev, 
                  estimatedDuration: Number(e.target.value) 
                }))}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={editedBlock.isRequired}
                onChange={(e) => setEditedBlock(prev => ({ 
                  ...prev, 
                  isRequired: e.target.checked 
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                Required block
              </label>
            </div>
          </div>

          {/* Block-specific settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Block Settings</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                Block-specific configuration options will be implemented based on block type.
              </p>
              {/* TODO: Implement block-specific settings based on block.type */}
            </div>
          </div>
        </CardContent>
        
        <div className="flex-shrink-0 p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TemplateCreationUI;
