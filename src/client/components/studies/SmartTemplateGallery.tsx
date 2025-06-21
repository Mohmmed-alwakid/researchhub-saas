import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Smartphone, 
  Globe, 
  MessageCircle, 
  LayoutGrid, 
  Search,
  Users,
  Clock,
  Target,
  ArrowRight,
  ArrowLeft,
  Eye,
  Sparkles,
  Plus,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

// Template data structure
export interface StudyTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'usability' | 'cardSort' | 'interview' | 'survey';
  purpose: string;
  description: string;
  learningOutcomes: string[];
  estimatedDuration: number;
  participantCount: { min: number; max: number; recommended: number };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  preBuiltTasks: Array<{
    name: string;
    description: string;
    type: string;
  }>;
  successCriteria: string[];
  popularityScore: number;
}

// Predefined study templates
const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: 'ecommerce-checkout',
    name: 'E-commerce Checkout Flow',
    icon: <ShoppingCart className="h-6 w-6" />,
    category: 'usability',
    purpose: 'Find friction in purchase process that causes cart abandonment',
    description: 'Test your checkout process to identify where users hesitate, get confused, or abandon their purchase.',
    learningOutcomes: [
      'Where users hesitate or get confused',
      'Which steps cause abandonment',
      'Payment and form usability issues',
      'Trust signals that matter most'
    ],
    estimatedDuration: 18,
    participantCount: { min: 8, max: 15, recommended: 12 },
    difficulty: 'beginner',
    tags: ['e-commerce', 'conversion', 'forms', 'payment'],
    preBuiltTasks: [
      { name: 'Browse products', description: 'Find a specific product category', type: 'navigation' },
      { name: 'Add to cart', description: 'Add desired item to shopping cart', type: 'interaction' },
      { name: 'Review cart', description: 'Review items and quantities', type: 'interaction' },
      { name: 'Complete checkout', description: 'Fill out forms and complete purchase', type: 'interaction' }
    ],
    successCriteria: [
      'Users complete checkout in under 5 minutes',
      'Less than 20% abandon during payment',
      'Users can find and fix cart errors easily'
    ],
    popularityScore: 95
  },
  {
    id: 'mobile-app-navigation',
    name: 'Mobile App Navigation',
    icon: <Smartphone className="h-6 w-6" />,
    category: 'usability',
    purpose: 'Test if users can find key features in your mobile app',
    description: 'Evaluate your mobile app\'s navigation and information architecture to ensure users can discover and use core features.',
    learningOutcomes: [
      'Navigation pain points and confusion',
      'Feature discovery challenges',
      'Menu structure effectiveness',
      'User mental model mismatches'
    ],
    estimatedDuration: 15,
    participantCount: { min: 6, max: 12, recommended: 10 },
    difficulty: 'beginner',
    tags: ['mobile', 'navigation', 'IA', 'discovery'],
    preBuiltTasks: [
      { name: 'First impression', description: 'Describe what you think this app does', type: 'questionnaire' },
      { name: 'Find settings', description: 'Locate and access app settings', type: 'navigation' },
      { name: 'Complete main task', description: 'Use the app\'s primary feature', type: 'interaction' },
      { name: 'Get help', description: 'Find help or support options', type: 'navigation' }
    ],
    successCriteria: [
      'Users find main features within 2 taps',
      '80% success rate for key tasks',
      'Users understand app purpose immediately'
    ],
    popularityScore: 88
  },
  {
    id: 'website-first-impression',
    name: 'Website First Impression',
    icon: <Globe className="h-6 w-6" />,
    category: 'usability',
    purpose: 'Understand initial user reactions and value proposition clarity',
    description: 'Test how quickly users understand what your website offers and whether it meets their expectations.',
    learningOutcomes: [
      'User expectations vs reality',
      'Clarity of value proposition',
      'Visual hierarchy effectiveness',
      'Trust and credibility factors'
    ],
    estimatedDuration: 12,
    participantCount: { min: 8, max: 15, recommended: 10 },
    difficulty: 'beginner',
    tags: ['website', 'messaging', 'branding', 'conversion'],
    preBuiltTasks: [
      { name: 'Homepage review', description: 'Spend 30 seconds looking at the homepage', type: 'observation' },
      { name: 'Describe purpose', description: 'Explain what you think this company does', type: 'questionnaire' },
      { name: 'Find key info', description: 'Locate pricing or contact information', type: 'navigation' },
      { name: 'Express intent', description: 'Would you sign up? Why or why not?', type: 'questionnaire' }
    ],
    successCriteria: [
      'Users understand company purpose in 30 seconds',
      '70% positive first impression',
      'Users can find key information quickly'
    ],
    popularityScore: 82
  },
  {
    id: 'website-navigation-cardSort',
    name: 'Website Menu Organization',
    icon: <LayoutGrid className="h-6 w-6" />,
    category: 'cardSort',
    purpose: 'Design intuitive navigation structure based on user mental models',
    description: 'Understand how users categorize and organize your website content to create intuitive navigation.',
    learningOutcomes: [
      'User mental models for content',
      'Optimal grouping preferences',
      'Navigation terminology that resonates',
      'Information architecture insights'
    ],
    estimatedDuration: 35,
    participantCount: { min: 15, max: 25, recommended: 20 },
    difficulty: 'intermediate',
    tags: ['IA', 'navigation', 'content', 'structure'],
    preBuiltTasks: [
      { name: 'Sort categories', description: 'Group related content items together', type: 'cardSort' },
      { name: 'Name groups', description: 'Create names for your content groups', type: 'cardSort' },
      { name: 'Prioritize sections', description: 'Rank sections by importance', type: 'cardSort' }
    ],
    successCriteria: [
      'Clear grouping patterns emerge',
      'Consistent terminology preferences',
      'Logical hierarchy structure'
    ],
    popularityScore: 76
  },
  {
    id: 'customer-discovery-interview',
    name: 'Customer Discovery Interview',
    icon: <MessageCircle className="h-6 w-6" />,
    category: 'interview',
    purpose: 'Validate problem-solution fit and understand user needs',
    description: 'Conduct structured interviews to understand user problems, needs, and validate your solution approach.',
    learningOutcomes: [
      'Real user problems and pain points',
      'Current solution alternatives',
      'Solution preferences and priorities',
      'Market demand validation'
    ],
    estimatedDuration: 45,
    participantCount: { min: 8, max: 15, recommended: 12 },
    difficulty: 'advanced',
    tags: ['validation', 'problems', 'solutions', 'market-fit'],
    preBuiltTasks: [
      { name: 'Problem exploration', description: 'Discuss current challenges and frustrations', type: 'interview' },
      { name: 'Current solutions', description: 'How do you solve this problem today?', type: 'interview' },
      { name: 'Solution validation', description: 'Would this approach help? How?', type: 'interview' },
      { name: 'Prioritization', description: 'What matters most in a solution?', type: 'interview' }
    ],
    successCriteria: [
      'Clear problem validation',
      'Solution-market fit indicators',
      'Feature priority insights'
    ],
    popularityScore: 71
  },
  {
    id: 'feature-feedback-session',
    name: 'Feature Feedback Session',
    icon: <Target className="h-6 w-6" />,
    category: 'interview',
    purpose: 'Get detailed feedback on specific features or prototypes',
    description: 'Gather targeted feedback on new features, prototypes, or design concepts from your users.',
    learningOutcomes: [
      'Feature usability and clarity',
      'User expectations vs design',
      'Improvement suggestions',
      'Feature value perception'
    ],
    estimatedDuration: 30,
    participantCount: { min: 6, max: 12, recommended: 8 },
    difficulty: 'intermediate',
    tags: ['feedback', 'features', 'prototypes', 'iteration'],
    preBuiltTasks: [
      { name: 'Feature walkthrough', description: 'Explore the new feature naturally', type: 'prototype-test' },
      { name: 'Task completion', description: 'Complete typical use cases', type: 'prototype-test' },
      { name: 'Feedback discussion', description: 'Share thoughts and suggestions', type: 'interview' },
      { name: 'Value assessment', description: 'Rate feature importance and usability', type: 'questionnaire' }
    ],
    successCriteria: [
      'Clear usability insights',
      'Actionable improvement suggestions',
      'Feature value validation'
    ],
    popularityScore: 68
  }
];

// Helper functions
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const CategoryBadge = ({ category }: { category: string }) => {
  const colors = {
    usability: 'bg-blue-100 text-blue-800',
    cardSort: 'bg-purple-100 text-purple-800',
    interview: 'bg-green-100 text-green-800',
    survey: 'bg-orange-100 text-orange-800'
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[category as keyof typeof colors]}`}>
      {category === 'cardSort' ? 'Card Sort' : category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

interface SmartTemplateGalleryProps {
  onTemplateSelect: (template: StudyTemplate) => void;
  onCreateFromScratch: () => void;
}

export const SmartTemplateGallery: React.FC<SmartTemplateGalleryProps> = ({
  onTemplateSelect,
  onCreateFromScratch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<StudyTemplate | null>(null);

  // Filter templates based on search and category
  const filteredTemplates = STUDY_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.popularityScore - a.popularityScore);
  const categories = [
    { value: 'all', label: 'All Templates', count: STUDY_TEMPLATES.length },
    { value: 'usability', label: 'Usability Testing', count: STUDY_TEMPLATES.filter(t => t.category === 'usability').length },
    { value: 'cardSort', label: 'Card Sorting', count: STUDY_TEMPLATES.filter(t => t.category === 'cardSort').length },
    { value: 'interview', label: 'User Interviews', count: STUDY_TEMPLATES.filter(t => t.category === 'interview').length },
    { value: 'survey', label: 'Surveys', count: STUDY_TEMPLATES.filter(t => t.category === 'survey').length }
  ];

  if (selectedTemplate) {
    return (
      <TemplatePreviewModal 
        template={selectedTemplate}
        onUseTemplate={() => onTemplateSelect(selectedTemplate)}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">What do you want to learn about your users?</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from proven study templates that show you exactly what insights you'll gain and how to get them.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates by purpose, name, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Popular Templates Section */}
      {searchTerm === '' && selectedCategory === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold text-gray-900">Most Popular Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.slice(0, 3).map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onPreview={() => setSelectedTemplate(template)}
                onUse={() => onTemplateSelect(template)}
                isPopular={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-4">
        {searchTerm !== '' || selectedCategory !== 'all' ? (
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </h2>
        ) : (
          <h2 className="text-xl font-semibold text-gray-900">All Templates</h2>
        )}
        
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or browse all categories
            </p>
            <Button variant="secondary" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
              Show All Templates
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchTerm === '' && selectedCategory === 'all' 
              ? filteredTemplates.slice(3) 
              : filteredTemplates
            ).map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onPreview={() => setSelectedTemplate(template)}
                onUse={() => onTemplateSelect(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create from Scratch Option */}
      <div className="border-t pt-6">
        <Card className="bg-gray-50 border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="text-center py-8">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start from Scratch</h3>
            <p className="text-gray-600 mb-4">
              Create a custom study with your own tasks and structure
            </p>
            <Button variant="secondary" onClick={onCreateFromScratch}>
              Create Custom Study
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: StudyTemplate;
  onPreview: () => void;
  onUse: () => void;
  isPopular?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview, onUse, isPopular = false }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      {isPopular && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Popular
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {template.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
              <CategoryBadge category={template.category} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{template.purpose}</p>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">You'll discover:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {template.learningOutcomes.slice(0, 2).map((outcome, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                {outcome}
              </li>
            ))}
            {template.learningOutcomes.length > 2 && (
              <li className="text-xs text-gray-500">
                +{template.learningOutcomes.length - 2} more insights
              </li>
            )}
          </ul>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{template.estimatedDuration} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{template.participantCount.recommended} users</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
            {template.difficulty}
          </span>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onPreview} className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" onClick={onUse} className="flex-1">
            Use Template
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Template Preview Modal Component
interface TemplatePreviewModalProps {
  template: StudyTemplate;
  onUseTemplate: () => void;
  onBack: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ template, onUseTemplate, onBack }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            {template.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-gray-600">{template.purpose}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Study Overview</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{template.description}</p>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">What you'll discover:</h3>
                <ul className="space-y-2">
                  {template.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Preview */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Pre-built Tasks</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.preBuiltTasks.map((task, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.name}</h4>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Success Criteria */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Success Criteria</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {template.successCriteria.map((criteria, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{criteria}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Study Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Study Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{template.estimatedDuration} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium">{template.participantCount.recommended} recommended</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Difficulty</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category</span>
                <CategoryBadge category={template.category} />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Related Topics</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button onClick={onUseTemplate} size="lg" className="w-full">
            Use This Template
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>      </div>
    </div>
  );
};
