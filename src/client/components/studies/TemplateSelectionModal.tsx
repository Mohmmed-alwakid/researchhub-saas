import React, { useState, useEffect } from 'react';
import { X, Search, Clock, Users, Star, ArrowRight } from 'lucide-react';
import type { StudyTemplate } from '../../../shared/types/index';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyType: 'usability' | 'survey' | 'interview';
  onSelectTemplate: (template: StudyTemplate) => void;
  onStartFromScratch: () => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  studyType,
  onSelectTemplate,
  onStartFromScratch
}) => {
  const [templates, setTemplates] = useState<StudyTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<StudyTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  // Mock template data based on study type
  const getTemplatesForType = (type: 'usability' | 'survey' | 'interview'): StudyTemplate[] => {
    const baseTemplates = {
      usability: [
        {
          id: 'usability-1',
          name: 'Website Navigation Test',
          description: 'Test how easily users can navigate through your website and find key information',
          category: 'Usability Testing',
          subcategory: 'Navigation',
          blocks: [],
          metadata: {
            estimatedDuration: 15,
            participantCount: 10,
            difficulty: 'intermediate' as const,
            studyTypes: ['usability'],
            tags: ['navigation', 'website', 'findability'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 234,
            popularity: 0.8,
            rating: 4.5
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        },
        {
          id: 'usability-2',
          name: 'Mobile App Onboarding',
          description: 'Evaluate how new users experience your mobile app\'s onboarding flow',
          category: 'Usability Testing',
          subcategory: 'Mobile',
          blocks: [],
          metadata: {
            estimatedDuration: 20,
            participantCount: 15,
            difficulty: 'advanced' as const,
            studyTypes: ['usability'],
            tags: ['mobile', 'onboarding', 'app'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 189,
            popularity: 0.7,
            rating: 4.3
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        },
        {
          id: 'usability-3',
          name: 'E-commerce Checkout Flow',
          description: 'Test the usability of your checkout process to reduce cart abandonment',
          category: 'Usability Testing',
          subcategory: 'E-commerce',
          blocks: [],
          metadata: {
            estimatedDuration: 12,
            participantCount: 20,
            difficulty: 'intermediate' as const,
            studyTypes: ['usability'],
            tags: ['ecommerce', 'checkout', 'conversion'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 456,
            popularity: 0.9,
            rating: 4.7
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        },
        {
          id: 'wireframe-1',
          name: 'Wireframe Concept Testing',
          description: 'Get feedback on early-stage wireframes and design concepts',
          category: 'Wireframe Testing',
          subcategory: 'Concept',
          blocks: [],
          metadata: {
            estimatedDuration: 8,
            participantCount: 12,
            difficulty: 'beginner' as const,
            studyTypes: ['usability'],
            tags: ['wireframe', 'concept', 'early-stage'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 145,
            popularity: 0.6,
            rating: 4.2
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        },
        {
          id: 'content-1',
          name: 'Test CTA placement',
          description: 'Are your call-to-actions optimized across your product and website? With this CTA placement template, you can gather valuable feedback to help you map out the most effective positioning for your audience to take action.',
          category: 'Content Testing',
          subcategory: 'CTA',
          blocks: [],
          metadata: {
            estimatedDuration: 10,
            participantCount: 15,
            difficulty: 'intermediate' as const,
            studyTypes: ['usability'],
            tags: ['cta', 'content', 'conversion'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 287,
            popularity: 0.8,
            rating: 4.4
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        }
      ],
      survey: [
        {
          id: 'survey-1',
          name: 'Product Satisfaction Survey',
          description: 'Measure customer satisfaction with your product or service',
          category: 'Satisfaction Survey',
          subcategory: 'Product',
          blocks: [],
          metadata: {
            estimatedDuration: 5,
            participantCount: 50,
            difficulty: 'beginner' as const,
            studyTypes: ['survey'],
            tags: ['satisfaction', 'feedback', 'nps'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 532,
            popularity: 0.9,
            rating: 4.6
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        },
        {
          id: 'survey-2',
          name: 'Feature Feedback Collection',
          description: 'Gather detailed feedback on new features before and after launch',
          category: 'Feedback Survey',
          subcategory: 'Features',
          blocks: [],
          metadata: {
            estimatedDuration: 8,
            participantCount: 30,
            difficulty: 'intermediate' as const,
            studyTypes: ['survey'],
            tags: ['features', 'feedback', 'launch'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 298,
            popularity: 0.7,
            rating: 4.4
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        },
        {
          id: 'survey-3',
          name: 'Brand Perception Study',
          description: 'Understand how your target audience perceives your brand',
          category: 'Concept Validation',
          subcategory: 'Brand',
          blocks: [],
          metadata: {
            estimatedDuration: 12,
            participantCount: 100,
            difficulty: 'advanced' as const,
            studyTypes: ['survey'],
            tags: ['brand', 'perception', 'market-research'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 187,
            popularity: 0.6,
            rating: 4.3
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        },
        {
          id: 'survey-4',
          name: 'Copy Testing Survey',
          description: 'Test different versions of copy to see what resonates with your audience',
          category: 'Copy Testing',
          subcategory: 'Messaging',
          blocks: [],
          metadata: {
            estimatedDuration: 7,
            participantCount: 40,
            difficulty: 'intermediate' as const,
            studyTypes: ['survey'],
            tags: ['copy', 'messaging', 'ab-test'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 234,
            popularity: 0.7,
            rating: 4.5
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        }
      ],
      interview: [
        {
          id: 'interview-1',
          name: 'User Needs Discovery',
          description: 'Conduct in-depth interviews to discover user needs and pain points',
          category: 'User Research',
          subcategory: 'Discovery',
          blocks: [],
          metadata: {
            estimatedDuration: 45,
            participantCount: 8,
            difficulty: 'advanced' as const,
            studyTypes: ['interview'],
            tags: ['discovery', 'needs', 'pain-points'],
            author: 'AfkarM',
            version: '1.0',
            lastModified: new Date()
          },
          usage: {
            usageCount: 156,
            popularity: 0.8,
            rating: 4.8
          },
          customization: {
            allowCustomization: true,
            customizableBlocks: [],
            requiredBlocks: []
          }
        }
      ]
    };

    return baseTemplates[type] || [];
  };

  const getCategories = (templates: StudyTemplate[]) => {
    const categoryCount = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const templateData = getTemplatesForType(studyType);
        setTemplates(templateData);
        setFilteredTemplates(templateData);
        setLoading(false);
      }, 300);
    }
  }, [isOpen, studyType]);

  useEffect(() => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.metadata.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const categories = getCategories(templates);
  const totalTemplates = templates.length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudyTypeTitle = (type: string) => {
    switch (type) {
      case 'usability': return 'Usability Testing Templates';
      case 'survey': return 'Survey Research Templates';
      case 'interview': return 'User Interview Templates';
      default: return 'Study Templates';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {getStudyTypeTitle(studyType)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a template to get started quickly, or start from scratch
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-6">
            {/* Start from Scratch Button */}
            <button
              onClick={onStartFromScratch}
              className="w-full mb-6 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Start from Scratch
            </button>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>All templates</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {totalTemplates}
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                      selectedCategory === category.name
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading templates...</div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No templates found</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
                          {template.name}
                        </h3>                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.metadata.difficulty)}`}>
                            {template.metadata.difficulty}
                          </span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{template.metadata.estimatedDuration}m</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            <span>{template.usage.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{template.usage.usageCount} uses</span>
                      </div>
                      <div className="flex items-center text-indigo-600 group-hover:text-indigo-700 text-sm font-medium">
                        <span>Preview</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
