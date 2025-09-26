import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { X, Save, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyData: {
    title: string;
    description: string;
    type: string;
    blocks: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      settings: Record<string, unknown>;
    }>;
  };
  onSave?: (templateId: string) => void;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://researchhub-staging.vercel.app' 
  : 'http://localhost:3003';

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  isOpen,
  onClose,
  studyData,
  onSave
}) => {
  const { user, token } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [templateData, setTemplateData] = useState({
    title: `${studyData.title} Template`,
    description: `Template based on ${studyData.title}`,
    category: 'usability-testing',
    purpose: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    estimatedDuration: Math.max(5, (studyData.blocks?.length || 0) * 2),
    recommendedParticipants: { min: 5, max: 15 },
    tags: ['user-testing', 'research'],
    isPublic: false
  });

  const categories = [
    { value: 'usability-testing', label: 'Usability Testing' },
    { value: 'content-testing', label: 'Content Testing' },
    { value: 'user-interviews', label: 'User Interviews' },
    { value: 'concept-testing', label: 'Concept Testing' },
    { value: 'card-sorting', label: 'Card Sorting' },
    { value: 'survey-research', label: 'Survey Research' },
    { value: 'accessibility-testing', label: 'Accessibility Testing' },
    { value: 'navigation-testing', label: 'Navigation Testing' }
  ];

  const handleSave = async () => {
    if (!token) {
      toast.error('Please log in to save templates');
      return;
    }

    if (!templateData.title.trim()) {
      toast.error('Please enter a template title');
      return;
    }

    if (!templateData.description.trim()) {
      toast.error('Please enter a template description');
      return;
    }

    setSaving(true);

    try {
      const templatePayload = {
        title: templateData.title.trim(),
        description: templateData.description.trim(),
        category: templateData.category,
        purpose: templateData.purpose.trim() || `Template for ${templateData.category.replace('-', ' ')} studies`,
        difficulty: templateData.difficulty,
        estimatedDuration: templateData.estimatedDuration,
        recommendedParticipants: templateData.recommendedParticipants,
        tags: templateData.tags,
        blocks: studyData.blocks.map((block, index) => ({
          id: `block-${index + 1}`,
          type: block.type,
          title: block.title,
          description: block.description,
          settings: block.settings || {},
          isRequired: true,
          estimatedDuration: 2
        })),
        metadata: {
          author: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User',
          version: '1.0.0',
          isPublic: templateData.isPublic
        }
      };

      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(templatePayload)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Template saved successfully!');
        onSave?.(result.data.id);
        onClose();
      } else {
        toast.error(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Save as Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Title
              </label>
              <input
                type="text"
                value={templateData.title}
                onChange={(e) => setTemplateData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter template title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Description
              </label>
              <textarea
                value={templateData.description}
                onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this template is for and when to use it"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={templateData.category}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={templateData.difficulty}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose (Optional)
              </label>
              <input
                type="text"
                value={templateData.purpose}
                onChange={(e) => setTemplateData(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What research goal does this template serve?"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={templateData.estimatedDuration}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Participants
                </label>
                <input
                  type="number"
                  value={templateData.recommendedParticipants.min}
                  onChange={(e) => setTemplateData(prev => ({ 
                    ...prev, 
                    recommendedParticipants: { 
                      ...prev.recommendedParticipants, 
                      min: parseInt(e.target.value) || 1 
                    } 
                  }))}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={templateData.recommendedParticipants.max}
                  onChange={(e) => setTemplateData(prev => ({ 
                    ...prev, 
                    recommendedParticipants: { 
                      ...prev.recommendedParticipants, 
                      max: parseInt(e.target.value) || 15 
                    } 
                  }))}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={templateData.isPublic}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this template public (visible to other researchers)
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Template Preview</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Blocks:</strong> {studyData.blocks?.length || 0} blocks</div>
              <div><strong>Estimated Duration:</strong> {templateData.estimatedDuration} minutes</div>
              <div><strong>Participants:</strong> {templateData.recommendedParticipants.min}-{templateData.recommendedParticipants.max} people</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
