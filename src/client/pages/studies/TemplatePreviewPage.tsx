import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, Play, FileText } from 'lucide-react';
import type { StudyTemplate } from '../../../shared/types/index';

const TemplatePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const template = location.state?.template as StudyTemplate;

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Template not found</p>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleUseTemplate = () => {
    navigate('/app/studies/create', { 
      state: { 
        template,
        studyType: template.metadata.studyTypes[0] || 'usability'
      } 
    });
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Preview template:', template.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock block data for preview (since template.blocks might be empty)
  const getPreviewBlocks = () => {
    if (template.id === 'content-1') {
      return [
        {
          type: 'five_second_test',
          name: '5-Second Test',
          description: 'What action was the webpage asking you to take?'
        },
        {
          type: 'open_question',
          name: 'Open Question',
          description: 'What else do you remember from the webpage?'
        }
      ];
    }
    
    // Default blocks for other templates
    return [
      {
        type: 'welcome',
        name: 'Welcome Screen',
        description: 'Welcome participants to your study'
      },
      {
        type: 'open_question',
        name: 'Open Question',
        description: 'Collect detailed feedback from participants'
      },
      {
        type: 'opinion_scale',
        name: 'Rating Scale',
        description: 'Rate your experience on a scale'
      }
    ];
  };

  const previewBlocks = getPreviewBlocks();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Template Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Template Category */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600">{template.category}</p>
                    <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                  </div>
                </div>

                {/* Template Meta */}
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(template.metadata.difficulty)}`}>
                    {template.metadata.difficulty}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{template.metadata.estimatedDuration} min</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{template.metadata.participantCount} participants</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 mr-1" />
                    <span>{template.usage.rating} ({template.usage.usageCount} uses)</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-base leading-relaxed">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {template.metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h2>
            <div className="space-y-4">
              {previewBlocks.map((block, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{block.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{block.description}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Block {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreview}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                <Play className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handleUseTemplate}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Use this template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewPage;
