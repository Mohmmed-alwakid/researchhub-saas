import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  Eye,
  ChevronRight,
  Layout,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Shuffle,
  Target,
  Zap,
  Map
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

// Template type definition
interface StudyTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedDuration: number;
  blockCount: number;
  participantCount: string;
  category: string;
  blocks: string[];
  insights: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  usageCount: number;
  successRate: number;
}

// Curated template definitions
const CURATED_TEMPLATES: StudyTemplate[] = [
  {
    id: 'usability-testing',
    title: 'Usability Testing',
    description: 'Comprehensive website usability evaluation with task-based testing',
    icon: <Layout className="w-6 h-6" />,
    estimatedDuration: 15,
    blockCount: 5,
    participantCount: '5-8',
    category: 'User Experience',
    blocks: ['Welcome Screen', 'Task Instructions', 'Website Task', 'Feedback Questions', 'Thank You'],
    insights: ['Navigation patterns', 'Usability pain points', 'Task completion rates', 'User satisfaction'],
    difficulty: 'Beginner',
    usageCount: 1247,
    successRate: 94
  },
  {
    id: 'product-feedback',
    title: 'Product Feedback',
    description: 'Gather targeted feedback on features and overall product satisfaction',
    icon: <MessageSquare className="w-6 h-6" />,
    estimatedDuration: 10,
    blockCount: 3,
    participantCount: '8-12',
    category: 'Product Research',
    blocks: ['Welcome Screen', 'Feature Rating', 'Open Feedback'],
    insights: ['Feature satisfaction', 'Improvement suggestions', 'User priorities', 'NPS scores'],
    difficulty: 'Beginner',
    usageCount: 892,
    successRate: 97
  },
  {
    id: 'user-interview',
    title: 'User Interview',
    description: 'Structured qualitative research with AI-powered follow-up questions',
    icon: <Users className="w-6 h-6" />,
    estimatedDuration: 20,
    blockCount: 4,
    participantCount: '3-5',
    category: 'Qualitative Research',
    blocks: ['Introduction', 'Background Questions', 'Deep Dive Discussion', 'Wrap Up'],
    insights: ['User motivations', 'Behavioral patterns', 'Pain point discovery', 'Unmet needs'],
    difficulty: 'Intermediate',
    usageCount: 654,
    successRate: 91
  },
  {
    id: 'concept-testing',
    title: 'Concept Testing',
    description: 'Validate early-stage ideas and concepts before development',
    icon: <Lightbulb className="w-6 h-6" />,
    estimatedDuration: 8,
    blockCount: 3,
    participantCount: '6-10',
    category: 'Concept Validation',
    blocks: ['Concept Presentation', 'Understanding Check', 'Preference Rating'],
    insights: ['Concept clarity', 'Market appeal', 'Purchase intent', 'Positioning feedback'],
    difficulty: 'Beginner',
    usageCount: 543,
    successRate: 89
  },
  {
    id: 'card-sorting',
    title: 'Card Sorting',
    description: 'Optimize information architecture based on user mental models',
    icon: <Shuffle className="w-6 h-6" />,
    estimatedDuration: 12,
    blockCount: 2,
    participantCount: '15-20',
    category: 'Information Architecture',
    blocks: ['Instructions & Practice', 'Card Sorting Task'],
    insights: ['Content groupings', 'Navigation structure', 'Category labels', 'User mental models'],
    difficulty: 'Intermediate',
    usageCount: 421,
    successRate: 88
  },
  {
    id: 'ab-testing',
    title: 'A/B Testing',
    description: 'Compare design alternatives with quantitative measurements',
    icon: <BarChart3 className="w-6 h-6" />,
    estimatedDuration: 18,
    blockCount: 4,
    participantCount: '20-40',
    category: 'Comparative Testing',
    blocks: ['Version A Evaluation', 'Version B Evaluation', 'Preference Selection', 'Reasoning'],
    insights: ['Design performance', 'User preferences', 'Conversion factors', 'Statistical significance'],
    difficulty: 'Advanced',
    usageCount: 389,
    successRate: 92
  },
  {
    id: 'first-impression',
    title: 'First Impression',
    description: 'Capture immediate reactions and 5-second test insights',
    icon: <Zap className="w-6 h-6" />,
    estimatedDuration: 5,
    blockCount: 2,
    participantCount: '10-15',
    category: 'Initial Testing',
    blocks: ['5-Second Exposure', 'Recall & Impression Questions'],
    insights: ['Visual hierarchy', 'Brand perception', 'Message clarity', 'Emotional response'],
    difficulty: 'Beginner',
    usageCount: 756,
    successRate: 95
  },
  {
    id: 'user-journey',
    title: 'User Journey',
    description: 'Map end-to-end user experience across multiple touchpoints',
    icon: <Map className="w-6 h-6" />,
    estimatedDuration: 25,
    blockCount: 6,
    participantCount: '5-8',
    category: 'Experience Mapping',
    blocks: ['Journey Start', 'Touchpoint 1', 'Touchpoint 2', 'Touchpoint 3', 'Journey End', 'Overall Reflection'],
    insights: ['Journey pain points', 'Emotional moments', 'Drop-off reasons', 'Optimization opportunities'],
    difficulty: 'Advanced',
    usageCount: 287,
    successRate: 86
  }
];

interface SimplifiedTemplateSelectionProps {
  onSelectTemplate: (template: StudyTemplate) => void;
  onStartFromScratch: () => void;
}

interface TemplatePreviewModalProps {
  template: StudyTemplate;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {template.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{template.title}</h2>
                <p className="text-gray-600">{template.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Study Flow Preview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Study Flow Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                <span className="font-medium">{template.blockCount} blocks</span>
                <span>•</span>
                <span>{template.estimatedDuration} minutes</span>
              </div>
              <div className="space-y-2">
                {template.blocks.map((block, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{block}</span>
                    {index < template.blocks.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights You'll Gain */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">📊 Insights You'll Gain</h3>
            <ul className="space-y-2">
              {template.insights.map((insight, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-700 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Duration</span>
              </div>
              <span className="text-blue-900">{template.estimatedDuration} minutes</span>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-700 mb-1">
                <Users className="w-4 h-4" />
                <span className="font-medium">Participants</span>
              </div>
              <span className="text-green-900">{template.participantCount} recommended</span>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-purple-700 mb-1">
                <Target className="w-4 h-4" />
                <span className="font-medium">Difficulty</span>
              </div>
              <span className="text-purple-900">{template.difficulty}</span>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-orange-700 mb-1">
                <Star className="w-4 h-4" />
                <span className="font-medium">Success Rate</span>
              </div>
              <span className="text-orange-900">{template.successRate}%</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <Button 
            onClick={onUseTemplate}
            className="flex-1"
          >
            Use This Template
          </Button>
          <Button 
            variant="outline"
            onClick={onClose}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Participant Experience</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const SimplifiedTemplateSelection: React.FC<SimplifiedTemplateSelectionProps> = ({
  onSelectTemplate,
  onStartFromScratch
}) => {
  const [previewTemplate, setPreviewTemplate] = useState<StudyTemplate | null>(null);

  const handleTemplateClick = (template: StudyTemplate) => {
    setPreviewTemplate(template);
  };

  const handleUseTemplate = () => {
    if (previewTemplate) {
      onSelectTemplate(previewTemplate);
      setPreviewTemplate(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template to Get Started</h2>
        <p className="text-gray-600">
          Select from our curated collection of proven research templates, or start from scratch
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {CURATED_TEMPLATES.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            onClick={() => handleTemplateClick(template)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {template.icon}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.usageCount} uses
                </Badge>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>{template.blockCount} blocks</span>
                  <span>{template.estimatedDuration} mins</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.successRate}% success rate</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateClick(template);
                  }}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Preview Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Start from Scratch Option */}
      <div className="text-center">
        <div className="inline-block p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Prefer to start from scratch?</h3>
          <p className="text-gray-600 mb-4">
            Build your study from the ground up with our flexible block library
          </p>
          <Button 
            variant="outline"
            onClick={onStartFromScratch}
            className="flex items-center space-x-2"
          >
            <Layout className="w-4 h-4" />
            <span>Start from Scratch</span>
          </Button>
        </div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate!}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
};

export default SimplifiedTemplateSelection;
