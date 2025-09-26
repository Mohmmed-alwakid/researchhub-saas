import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Users, ArrowRight, Plus, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import EnhancedTemplateGallery from './EnhancedTemplateGallery';
import { QuickStudyCreationFlow } from './QuickStudyCreationFlow';
import { CompleteStudyBuilder } from './CompleteStudyBuilder';
import { 
  getTemplatesByCategory
} from '../../../shared/templates/enhanced-templates';
import type { 
  EnhancedStudyTemplate
} from '../../../shared/types/index';

interface EnhancedStudyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromTemplate: (template: EnhancedStudyTemplate) => void;
  onCreateFromScratch: () => void;
  onStudyCreated?: (studyId: string) => void;
}

type ResearchGoal = 'understand_users' | 'test_usability' | 'validate_concepts' | 'measure_satisfaction';
type ModalView = 'main' | 'templates' | 'quick-flow' | 'complete-builder';

interface GoalBasedCategory {
  goal: ResearchGoal;
  title: string;
  description: string;
  icon: React.ReactNode;
  templates: EnhancedStudyTemplate[];
  color: string;
}

export const EnhancedStudyCreationModal: React.FC<EnhancedStudyCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateFromTemplate,
  onCreateFromScratch,
  onStudyCreated
}) => {
  const [currentView, setCurrentView] = useState<ModalView>('main');
  const [selectedGoal, setSelectedGoal] = useState<ResearchGoal | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedStudyTemplate | null>(null);
  const [featuredTemplates, setFeaturedTemplates] = useState<EnhancedStudyTemplate[]>([]);

  // Load featured templates on mount
  useEffect(() => {
    if (isOpen) {
      // Get templates from available categories
      const usabilityTemplates = getTemplatesByCategory('usability-testing');
      const feedbackTemplates = getTemplatesByCategory('feedback-survey');
      
      // Combine and limit to 6 templates
      const featured = [...usabilityTemplates, ...feedbackTemplates].slice(0, 6);
      setFeaturedTemplates(featured);
    }
  }, [isOpen]);

  // Create goal-based categories for template organization
  const goalBasedCategories: GoalBasedCategory[] = [
    {
      goal: 'understand_users',
      title: 'Understand Users',
      description: 'Learn about user behaviors, needs, and pain points',
      icon: <Users className="h-6 w-6" />,
      color: 'blue',
      templates: getTemplatesByCategory('user-interviews')
    },
    {
      goal: 'test_usability',
      title: 'Test Usability',
      description: 'Evaluate interface design and user experience',
      icon: <Eye className="h-6 w-6" />,
      color: 'green',
      templates: getTemplatesByCategory('usability-testing')
    },
    {
      goal: 'validate_concepts',
      title: 'Validate Ideas',
      description: 'Test concepts, features, and product ideas',
      icon: <Sparkles className="h-6 w-6" />,
      color: 'purple',
      templates: getTemplatesByCategory('concept-validation')
    },
    {
      goal: 'measure_satisfaction',
      title: 'Measure Success',
      description: 'Track satisfaction, performance, and outcomes',
      icon: <Star className="h-6 w-6" />,
      color: 'orange',
      templates: getTemplatesByCategory('feedback-survey')
    }
  ];

  const handleGoalSelect = (goal: ResearchGoal) => {
    setSelectedGoal(goal);
    setCurrentView('templates');
  };

  const handleTemplateSelect = (template: EnhancedStudyTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('complete-builder');
  };

  // Updated handler for complete study creation
  const handleCreateFromTemplateComplete = (template: EnhancedStudyTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('complete-builder');
  };

  const handleCreateFromScratchComplete = () => {
    setSelectedTemplate(null);
    setCurrentView('complete-builder');
  };

  const handleQuickFlowComplete = (studyId?: string) => {
    if (studyId && onStudyCreated) {
      onStudyCreated(studyId);
    } else {
      // Fallback to full study builder
      if (selectedTemplate) {
        onCreateFromTemplate(selectedTemplate);
      } else {
        onCreateFromScratch();
      }
    }
    onClose();
  };

  const handleBackFromQuickFlow = () => {
    setSelectedTemplate(null);
    setCurrentView('templates');
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900',
      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900',
      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Study</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a template to get started quickly, or build from scratch
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {currentView === 'main' && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">              <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={handleCreateFromScratchComplete}>
                <CardContent className="p-6 text-center">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start from Scratch</h3>
                  <p className="text-sm text-gray-600">
                    Build a custom study with full control over every detail
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => setCurrentView('templates')}>
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Use a Template</h3>
                  <p className="text-sm text-blue-700">
                    Start with proven templates and customize as needed
                  </p>
                </CardContent>
              </Card>
              </div>

              {/* Research Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's your research goal?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalBasedCategories.map((category) => (
                    <Card
                      key={category.goal}
                      className={`border-2 cursor-pointer transition-all ${getColorClasses(category.color)}`}
                      onClick={() => handleGoalSelect(category.goal)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">{category.title}</h4>
                            <p className="text-xs opacity-75 leading-relaxed">{category.description}</p>
                            <div className="flex items-center mt-2 text-xs opacity-75">
                              <span>{category.templates.length} templates</span>
                              <ArrowRight className="h-3 w-3 ml-auto" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Featured Templates */}
              {featuredTemplates.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Popular Templates</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView('templates')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View all templates
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="border hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm text-gray-900 leading-tight">
                              {template.name}
                            </h4>
                            <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {template.metadata?.estimatedDuration || 15}m
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                5+
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleCreateFromTemplateComplete(template)}
                              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              Quick Create
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTemplateSelect(template)}
                              className="flex-1 text-xs"
                            >
                              Customize
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('main')}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                  Back to overview
                </Button>
              </div>
              <EnhancedTemplateGallery
                isOpen={true}
                onClose={() => setCurrentView('main')}
                onSelectTemplate={handleTemplateSelect}
                studyType={selectedGoal || undefined}
                onStartFromScratch={handleCreateFromScratchComplete}
                onQuickCreate={handleCreateFromTemplateComplete}
              />
            </div>
          )}

          {currentView === 'quick-flow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackFromQuickFlow}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                  Back to templates
                </Button>
              </div>
              <QuickStudyCreationFlow
                isOpen={true}
                onClose={handleBackFromQuickFlow}
                onComplete={handleQuickFlowComplete}
                selectedTemplate={selectedTemplate || undefined}
              />
            </div>
          )}

          {currentView === 'complete-builder' && (
            <CompleteStudyBuilder
              isOpen={true}
              onClose={() => setCurrentView('main')}
              onStudyCreated={onStudyCreated || (() => {})}
              selectedTemplate={selectedTemplate || undefined}
              mode={selectedTemplate ? 'template' : 'scratch'}
            />
          )}
        </div>
      </div>
    </div>
  );
};
