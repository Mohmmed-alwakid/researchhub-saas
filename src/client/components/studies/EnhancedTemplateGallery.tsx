import React, { useState, useMemo } from 'react';
import { 
  Search,
  Clock,
  Users,
  Star,
  Eye,
  ChevronRight,
  X,
  Sparkles,
  Target,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  getTemplatesByCategory,
  TEMPLATE_CATEGORIES
} from '../../../shared/templates/enhanced-templates';
import type { 
  EnhancedStudyTemplate, 
  TemplateCategory
} from '../../../shared/types/index';

interface EnhancedTemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: EnhancedStudyTemplate) => void;
  studyType?: string;
  onStartFromScratch?: () => void;
}

interface TemplatePreviewModalProps {
  template: EnhancedStudyTemplate;
  onClose: () => void;
  onSelectTemplate: (template: EnhancedStudyTemplate) => void;
  variables: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onSelectTemplate,
  variables,
  onVariableChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'customize'>('overview');
  
  // Create a simplified preview without actual replacement for now
  const previewTemplate = template;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">What you'll learn</h4>
        <ul className="space-y-2">
          {template.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-3">
              <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
        <ul className="space-y-2">
          {template.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">When to use this template</h4>
            <p className="text-blue-800 text-sm">{template.whenToUse}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">Duration</span>
          </div>
          <span className="text-gray-700">{template.estimatedTime}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">Participants</span>
          </div>
          <span className="text-gray-700">{template.recommendedParticipants}</span>
        </div>
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Study Flow Preview</h4>
        <p className="text-gray-600 text-sm mb-4">
          Here's how your study will flow with the current variable settings:
        </p>
        
        <div className="space-y-3">
          {previewTemplate.blocks.slice(0, 3).map((block, index) => (
            <div key={block.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{block.title}</span>
              </div>
              {block.description && (
                <p className="text-gray-600 text-sm ml-9">{block.description}</p>
              )}
            </div>
          ))}
          
          {previewTemplate.blocks.length > 3 && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
              <span className="text-gray-500 text-sm">
                +{previewTemplate.blocks.length - 3} more blocks in your study
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCustomizeTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Customize Variables</h4>
        <p className="text-gray-600 text-sm mb-4">
          Personalize this template by filling in the variables below:
        </p>
          <div className="space-y-4">
          {template.variables?.map((variable) => (
            <div key={variable.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {variable.label}
                {variable.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={variable.type || 'text'}
                value={variables[variable.key] || ''}
                onChange={(e) => onVariableChange(variable.key, e.target.value)}
                placeholder={variable.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-gray-600 mt-1">{template.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'preview', label: 'Preview', icon: Sparkles },
              { id: 'customize', label: 'Customize', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'preview' && renderPreviewTab()}
          {activeTab === 'customize' && renderCustomizeTab()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {template.metadata.estimatedDuration} min study • {template.metadata.tags.join(', ')}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSelectTemplate(previewTemplate)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedTemplateGallery: React.FC<EnhancedTemplateGalleryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  studyType,
  onStartFromScratch
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('usability-testing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedStudyTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Get templates for the selected category
  const templates = useMemo(() => {
    return getTemplatesByCategory(selectedCategory);
  }, [selectedCategory]);

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.metadata.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [templates, searchQuery]);

  // Initialize variables when template is selected
  const handleTemplateSelect = (template: EnhancedStudyTemplate) => {
    setSelectedTemplate(template);
      // Initialize variables with default values
    const initialVariables: Record<string, string> = {};
    template.variables?.forEach(variable => {
      initialVariables[variable.key] = variable.defaultValue;
    });
    setVariables(initialVariables);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleUseTemplate = (template: EnhancedStudyTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  if (!isOpen) return null;

  // Show template preview modal
  if (selectedTemplate) {
    return (
      <TemplatePreviewModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onSelectTemplate={handleUseTemplate}
        variables={variables}
        onVariableChange={handleVariableChange}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
              <p className="text-gray-600 mt-1">
                {studyType 
                  ? `Templates for ${studyType} studies - Start with a pre-built template to save time and follow best practices`
                  : 'Start with a pre-built study template to save time and follow best practices'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedCategory === category.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or category selection</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-blue-300"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {template.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {template.recommendedParticipants}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {template.usage.rating}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.metadata.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.metadata.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{template.metadata.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Can't find what you're looking for? You can also start from scratch.
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              {onStartFromScratch && (
                <Button
                  variant="secondary"
                  onClick={onStartFromScratch}
                >
                  Start from Scratch
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTemplateGallery;
