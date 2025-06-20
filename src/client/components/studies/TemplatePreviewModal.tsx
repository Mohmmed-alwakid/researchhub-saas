import React, { useState } from 'react';
import { X, Play, Pause, RotateCcw, Eye, Settings, Clock, Users, Star, Tag } from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  icon: string;
  tags: string[];
  settings: Record<string, unknown>;
  previewContent?: string;
  usageCount: number;
  studyTypes: string[];
  instructions?: string;
  example?: {
    title: string;
    scenario: string;
    expectedActions: string[];
    successCriteria: string[];
  };
  configuration?: {
    timeLimit?: number;
    allowSkip?: boolean;
    recordScreen?: boolean;
    trackClicks?: boolean;
    trackScrolling?: boolean;
  };
}

interface TemplatePreviewModalProps {
  template: TaskTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onAddTemplate: (template: TaskTemplate) => void;
  isAlreadyAdded: boolean;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onAddTemplate,
  isAlreadyAdded
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'settings'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !template) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '⚡';
      case 'advanced': return '🔥';
      default: return '📝';
    }
  };

  const handlePlayPreview = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would trigger a preview simulation
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-4xl">{template.icon}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h2>
            <p className="text-gray-600 text-lg">{template.description}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(template.difficulty)}`}>
            {getDifficultyIcon(template.difficulty)} {template.difficulty}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{template.estimatedDuration}m</div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{template.usageCount}</div>
            <div className="text-sm text-gray-600">Uses</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1 fill-current" />
            <div className="text-lg font-semibold text-gray-900">{template.popularity}/5</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Tag className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{template.category}</div>
            <div className="text-sm text-gray-600">Category</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {template.instructions && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700">{template.instructions}</p>
          </div>
        </div>
      )}

      {/* Example */}
      {template.example && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Example</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Scenario</h4>
              <p className="text-gray-700">{template.example.scenario}</p>
            </div>
            
            {template.example.expectedActions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Expected Actions</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {template.example.expectedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {template.example.successCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Success Criteria</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {template.example.successCriteria.map((criteria, index) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Interactive Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPreview}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isPlaying 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setIsPlaying(false)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {template.previewContent ? (
          <div className="bg-white border rounded-lg p-6 text-left">
            <div className="text-sm text-gray-600 mb-2">Preview Content:</div>
            <div className="text-gray-900">{template.previewContent}</div>
            {isPlaying && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                🎬 Preview simulation is running...
              </div>
            )}
          </div>
        ) : (
          <div>
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Preview</h3>
            <p className="text-gray-600 mb-4">
              This task will provide an interactive preview when implemented
            </p>
            <div className="text-sm text-gray-500">
              Preview features: Screen recording, click tracking, task flow simulation
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Task Configuration</h3>
      
      {template.configuration ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Time Settings</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Time Limit: {template.configuration.timeLimit ? `${template.configuration.timeLimit} minutes` : 'No limit'}</div>
                <div>Allow Skip: {template.configuration.allowSkip ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Recording Settings</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Screen Recording: {template.configuration.recordScreen ? 'Enabled' : 'Disabled'}</div>
                <div>Click Tracking: {template.configuration.trackClicks ? 'Enabled' : 'Disabled'}</div>
                <div>Scroll Tracking: {template.configuration.trackScrolling ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Default Configuration</h3>
          <p className="text-gray-600">This task uses standard settings that can be customized after adding</p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Customization Tip</h4>
        <p className="text-yellow-700 text-sm">
          After adding this task to your study, you can customize all settings including timing, 
          recording options, and task-specific parameters.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{template.icon}</span>
              <h2 className="text-xl font-bold text-gray-900">Template Preview</h2>
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
              { id: 'overview', label: 'Overview' },
              { id: 'preview', label: 'Preview' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'preview' && renderPreviewTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Compatible with: {template.studyTypes.join(', ')}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onAddTemplate(template)}
                disabled={isAlreadyAdded}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isAlreadyAdded
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAlreadyAdded ? 'Already Added' : 'Add to Study'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
