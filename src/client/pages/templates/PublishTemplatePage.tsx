import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Plus,
  Minus,
  Eye,
  AlertTriangle,
  Loader2,
  Tag,
  Users,
  Clock,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface PublishTemplateForm {
  title: string;
  description: string;
  category_id: string;
  tags: string[];
  research_type: string;
  target_audience: string;
  estimated_duration: number;
  participant_count_estimate: number;
  blocks: TemplateBlock[];
  is_public: boolean;
}

interface TemplateBlock {
  id: string;
  type: string;
  title: string;
  description: string;
  settings: Record<string, unknown>;
  order: number;
}

const PublishTemplatePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  const [formData, setFormData] = useState<PublishTemplateForm>({
    title: '',
    description: '',
    category_id: '',
    tags: [],
    research_type: 'user_testing',
    target_audience: 'general',
    estimated_duration: 15,
    participant_count_estimate: 10,
    blocks: [],
    is_public: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/template-marketplace?action=categories');
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }

    if (formData.blocks.length === 0) {
      errors.blocks = 'At least one block is required';
    }

    if (formData.estimated_duration < 1) {
      errors.estimated_duration = 'Duration must be at least 1 minute';
    }

    if (formData.participant_count_estimate < 1) {
      errors.participant_count_estimate = 'Participant count must be at least 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('supabase-auth-token');
      const response = await fetch('/api/template-marketplace', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to publish template');
      }

      navigate(`/app/template-marketplace/${result.data.id}`);
    } catch (err) {
      console.error('Failed to publish template:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddBlock = () => {
    const newBlock: TemplateBlock = {
      id: `block_${Date.now()}`,
      type: 'welcome_screen',
      title: 'New Block',
      description: '',
      settings: {},
      order: formData.blocks.length
    };

    setFormData({
      ...formData,
      blocks: [...formData.blocks, newBlock]
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.filter(block => block.id !== blockId)
    });
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<TemplateBlock>) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  const blockTypes = [
    'welcome_screen',
    'open_question',
    'opinion_scale',
    'simple_input',
    'multiple_choice',
    'context_screen',
    'yes_no',
    'five_second_test',
    'card_sort',
    'tree_test',
    'thank_you',
    'image_upload',
    'file_upload'
  ];

  const researchTypes = [
    { value: 'user_testing', label: 'User Testing' },
    { value: 'usability_testing', label: 'Usability Testing' },
    { value: 'card_sorting', label: 'Card Sorting' },
    { value: 'tree_testing', label: 'Tree Testing' },
    { value: 'first_click_testing', label: 'First Click Testing' },
    { value: 'five_second_testing', label: 'Five Second Testing' },
    { value: 'preference_testing', label: 'Preference Testing' },
    { value: 'survey', label: 'Survey' },
    { value: 'interview', label: 'Interview' },
    { value: 'other', label: 'Other' }
  ];

  const targetAudiences = [
    { value: 'general', label: 'General Public' },
    { value: 'students', label: 'Students' },
    { value: 'professionals', label: 'Professionals' },
    { value: 'seniors', label: 'Seniors (55+)' },
    { value: 'millennials', label: 'Millennials' },
    { value: 'gen_z', label: 'Gen Z' },
    { value: 'parents', label: 'Parents' },
    { value: 'tech_savvy', label: 'Tech-Savvy Users' },
    { value: 'specific_industry', label: 'Specific Industry' }
  ];

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/app/template-marketplace')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Publish Template</h1>
            <p className="text-gray-600">Share your research template with the community</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => setPreview(!preview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Publish Template
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {preview ? (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Template Preview</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold">{formData.title || 'Untitled Template'}</h3>
              <p className="text-gray-600 mt-2">{formData.description || 'No description provided'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Duration: {formData.estimated_duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Participants: {formData.participant_count_estimate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Type: {researchTypes.find(t => t.value === formData.research_type)?.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Audience: {targetAudiences.find(a => a.value === formData.target_audience)?.label}</span>
              </div>
            </div>

            {formData.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Study Blocks ({formData.blocks.length})
              </h4>
              <div className="space-y-2">
                {formData.blocks.map((block, index) => (
                  <div key={block.id} className="flex items-center space-x-2 text-sm p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{block.type.replace('_', ' ').toUpperCase()}</span>
                    <span className="text-gray-600">- {block.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter a descriptive title for your template"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe what this template is for and how it should be used"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.category_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.category_id}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Research Details */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Research Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Type
                  </label>
                  <select
                    value={formData.research_type}
                    onChange={(e) => setFormData({ ...formData, research_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {researchTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {targetAudiences.map((audience) => (
                      <option key={audience.value} value={audience.value}>
                        {audience.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.estimated_duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.estimated_duration && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.estimated_duration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Participant Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.participant_count_estimate}
                    onChange={(e) => setFormData({ ...formData, participant_count_estimate: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.participant_count_estimate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.participant_count_estimate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.participant_count_estimate}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Blocks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Study Blocks</h2>
                <Button onClick={handleAddBlock}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formErrors.blocks && (
                <p className="text-red-500 text-sm mb-4">{formErrors.blocks}</p>
              )}
              {formData.blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No blocks added yet. Add your first block to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.blocks.map((block, index) => (
                    <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">Block {index + 1}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRemoveBlock(block.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Block Type
                          </label>
                          <select
                            value={block.type}
                            onChange={(e) => handleUpdateBlock(block.id, { type: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            {blockTypes.map((type) => (
                              <option key={type} value={type}>
                                {type.replace('_', ' ').toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Block Title
                          </label>
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter block title"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={block.description}
                          onChange={(e) => handleUpdateBlock(block.id, { description: e.target.value })}
                          rows={2}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Describe what this block does"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Publishing Options</h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                  Make this template publicly available in the marketplace
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Public templates can be discovered and used by other researchers. You can change this setting later.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PublishTemplatePage;
