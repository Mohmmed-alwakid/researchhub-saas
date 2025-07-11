import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Settings, 
  Users, 
  Clock,
  Target,
  TrendingUp,
  Grid,
  List,
  Search,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { TemplateCreationUI } from './TemplateCreationUI';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usage: {
    timesUsed: number;
    timesCloned: number;
    avgRating: number;
    ratingCount: number;
  };
  blocks: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    settings: Record<string, unknown>;
  }>;
}

interface TemplateData {
  title: string;
  description: string;
  category: string;
  purpose: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  recommendedParticipants: { min: number; max: number };
  tags: string[];
  blocks: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    settings: Record<string, unknown>;
    isRequired: boolean;
    estimatedDuration: number;
  }>;
  metadata: {
    author: string;
    version: string;
    isPublic: boolean;
  };
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://researchhub-staging.vercel.app' 
  : 'http://localhost:3003';

export const TemplateManager: React.FC = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // UI state
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Convert Template to TemplateData for editing
  const convertTemplateToTemplateData = (template: Template): TemplateData => {
    return {
      title: template.name,
      description: template.description,
      category: template.category,
      purpose: 'Research purpose', // Default value
      difficulty: 'beginner' as const,
      estimatedDuration: 30, // Default value
      recommendedParticipants: { min: 5, max: 15 },
      tags: template.tags,
      blocks: template.blocks.map(block => ({
        ...block,
        isRequired: false,
        estimatedDuration: 5
      })),
      metadata: {
        author: template.createdBy,
        version: '1.0.0',
        isPublic: template.isPublic
      }
    };
  };

  // Fetch templates and categories
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        headers
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data || []);
      } else {
        console.error('Failed to fetch templates:', result.error);
        toast.error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Error loading templates');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates?action=categories`);
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [fetchTemplates, fetchCategories]);

  // Template operations
  const handleCreateTemplate = async (templateData: TemplateData) => {
    try {
      if (!token) {
        toast.error('Please log in to create templates');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(templateData)
      });

      const result = await response.json();
      
      if (result.success) {
        setTemplates(prev => [result.data, ...prev]);
        setShowCreateTemplate(false);
        toast.success('Template created successfully!');
      } else {
        toast.error(result.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Error creating template');
    }
  };

  const handleUpdateTemplate = async (templateData: TemplateData) => {
    try {
      if (!token || !editingTemplate) {
        toast.error('Please log in to update templates');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(templateData)
      });

      const result = await response.json();
      
      if (result.success) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? result.data : t));
        setEditingTemplate(null);
        toast.success('Template updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Error updating template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      if (!token) {
        toast.error('Please log in to delete templates');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        toast.success('Template deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Error deleting template');
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      if (!token) {
        toast.error('Please log in to duplicate templates');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setTemplates(prev => [result.data, ...prev]);
        toast.success('Template duplicated successfully!');
      } else {
        toast.error(result.error || 'Failed to duplicate template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Error duplicating template');
    }
  };

  const handleCreateStudyFromTemplate = (template: Template) => {
    try {
      // Convert template to Study Builder format
      const templateData = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        blocks: template.blocks.map((block, index) => ({
          id: `${template.id}-block-${index}`,
          type: block.type,
          order: index,
          title: block.title,
          description: block.description,
          settings: block.settings || {}
        }))
      };

      // Store template data for Study Builder
      sessionStorage.setItem('selectedTemplate', JSON.stringify(templateData));
      
      // Navigate to Study Builder with template pre-selected
      navigate('/app/study-builder?template=' + template.id);
      
      toast.success(`Creating study from "${template.name}" template`);
    } catch (error) {
      console.error('Error creating study from template:', error);
      toast.error('Error starting study creation');
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.tags || []).some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Settings className="w-16 h-16 mx-auto text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the Template Manager. Only researchers and admins can manage templates.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role check
  if (user?.role && !['researcher', 'admin'].includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Users className="w-16 h-16 mx-auto text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Only researchers and administrators can access the Template Manager.
              Your current role: <strong>{user.role}</strong>
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show Template Creation UI
  if (showCreateTemplate) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <TemplateCreationUI
          mode="create"
          onSave={handleCreateTemplate}
          onCancel={() => setShowCreateTemplate(false)}
        />
      </div>
    );
  }

  // Show Template Edit UI
  if (editingTemplate) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <TemplateCreationUI
          mode="edit"
          initialTemplate={convertTemplateToTemplateData(editingTemplate)}
          onSave={handleUpdateTemplate}
          onCancel={() => setEditingTemplate(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Manager</h1>
            <p className="text-gray-600 mt-1">
              Create, edit, and manage your study templates
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateTemplate(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{templates.length}</p>
                  <p className="text-sm text-gray-600">Total Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {templates.reduce((sum, t) => sum + (t.usage?.timesUsed || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Times Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Copy className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {templates.reduce((sum, t) => sum + (t.usage?.timesCloned || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Times Cloned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {templates.length > 0 
                      ? (templates.reduce((sum, t) => sum + (t.usage?.avgRating || 0), 0) / templates.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading templates...</p>
        </div>
      )}

      {/* Templates Grid/List */}
      {!loading && (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredTemplates.map(template => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={viewMode === 'grid' ? '' : 'w-full'}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {categories.find(c => c.id === template.category)?.name || template.category}
                        </span>
                        {template.isPublic && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCreateStudyFromTemplate(template)}
                        title="Create Study from Template"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Create Study
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                        title="Edit Template"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        title="Duplicate Template"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Template Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {template.usage?.timesUsed || 0} uses
                    </div>
                    <div className="flex items-center">
                      <Copy className="w-4 h-4 mr-1" />
                      {template.usage?.timesCloned || 0} clones
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {template.blocks?.length || 0} blocks
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {(template.usage?.avgRating || 0).toFixed(1)} rating
                    </div>
                  </div>

                  {/* Tags */}
                  {(template.tags || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Created date */}
                  <p className="text-xs text-gray-500 mt-3">
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No templates found' 
              : 'No templates yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first template to get started'
            }
          </p>
          <Button onClick={() => setShowCreateTemplate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
