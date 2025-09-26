import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Eye, 
  BarChart3,
  Clock,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import TemplateEditor from './TemplateEditor';

// Types for template management
interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  blockCount: number;
  estimatedDuration: number;
  usageCount: number;
  successRate: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  blocks?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    settings: Record<string, unknown>;
    order: number;
  }>;
}

interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  totalUsage: number;
  averageSuccessRate: number;
}

const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<TemplateStats>({
    totalTemplates: 0,
    activeTemplates: 0,
    totalUsage: 0,
    averageSuccessRate: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/templates', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setTemplates(result.data.templates);
            setStats(result.data.stats);
          } else {
            console.error('Failed to load templates:', result.error);
            // Fall back to mock data
            loadMockData();
          }
        } else {
          console.error('API request failed:', response.status);
          // Fall back to mock data
          loadMockData();
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // Fall back to mock data
        loadMockData();
      }
    };

    const loadMockData = () => {
      const mockTemplates: Template[] = [
        {
          id: 'template-1',
          title: 'Usability Testing',
          description: 'Comprehensive website usability evaluation with task-based testing',
          category: 'User Experience',
          blockCount: 5,
          estimatedDuration: 15,
          usageCount: 1247,
          successRate: 94,
          difficulty: 'Beginner',
          status: 'active',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-06-15'),
          createdBy: 'Admin Team'
        },
        {
          id: 'template-2',
          title: 'Product Feedback',
          description: 'Gather targeted feedback on features and overall product satisfaction',
          category: 'Product Research',
          blockCount: 3,
          estimatedDuration: 10,
          usageCount: 892,
          successRate: 97,
          difficulty: 'Beginner',
          status: 'active',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-06-20'),
          createdBy: 'Admin Team'
        },
        {
          id: 'template-3',
          title: '5-Second Test',
          description: 'First impression testing for websites and designs',
          category: 'Concept Testing',
          blockCount: 4,
          estimatedDuration: 5,
          usageCount: 634,
          successRate: 91,
          difficulty: 'Intermediate',
          status: 'active',
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-06-25'),
          createdBy: 'UX Team'
        },
        {
          id: 'template-4',
          title: 'Interview Template',
          description: 'In-depth user interviews with follow-up questions',
          category: 'Qualitative Research',
          blockCount: 6,
          estimatedDuration: 30,
          usageCount: 423,
          successRate: 89,
          difficulty: 'Advanced',
          status: 'draft',
          createdAt: new Date('2024-04-05'),
          updatedAt: new Date('2024-06-28'),
          createdBy: 'Research Team'
        }
      ];

      setTemplates(mockTemplates);
      setStats({
        totalTemplates: mockTemplates.length,
        activeTemplates: mockTemplates.filter(t => t.status === 'active').length,
        totalUsage: mockTemplates.reduce((sum, t) => sum + t.usageCount, 0),
        averageSuccessRate: Math.round(mockTemplates.reduce((sum, t) => sum + t.successRate, 0) / mockTemplates.length)
      });
    };

    loadTemplates();
  }, []);

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTemplateAction = async (template: Template, action: string) => {
    switch (action) {
      case 'edit':
        setSelectedTemplate(template);
        setShowCreateModal(true);
        break;
      case 'duplicate':
        // Handle template duplication
        console.log('Duplicating template:', template.id);
        break;
      case 'delete':
        // Handle template deletion with confirmation
        if (window.confirm(`Are you sure you want to delete "${template.title}"? This action cannot be undone.`)) {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/templates?id=${template.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                setTemplates(prev => prev.filter(t => t.id !== template.id));
                setStats(prev => ({
                  ...prev,
                  totalTemplates: prev.totalTemplates - 1,
                  activeTemplates: template.status === 'active' ? prev.activeTemplates - 1 : prev.activeTemplates
                }));
              } else {
                alert('Failed to delete template: ' + result.error);
              }
            } else {
              alert('Failed to delete template');
            }
          } catch (error) {
            console.error('Error deleting template:', error);
            alert('Error deleting template. Please try again.');
          }
        }
        break;
      case 'analytics':
        // Navigate to template analytics
        console.log('Viewing analytics for:', template.id);
        break;
      case 'preview':
        // Open template preview
        console.log('Previewing template:', template.id);
        break;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-600">Create, edit, and manage study templates for researchers</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTemplates}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsage.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageSuccessRate}%</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="User Experience">User Experience</option>
              <option value="Product Research">Product Research</option>
              <option value="Concept Testing">Concept Testing</option>
              <option value="Qualitative Research">Qualitative Research</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                </div>
                <div className="relative">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      // Toggle dropdown menu
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {/* Dropdown menu would go here */}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 line-clamp-2">{template.description}</p>

              {/* Status and Difficulty Badges */}
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(template.status)}`}>
                  {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>

              {/* Template Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{template.estimatedDuration} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>{template.blockCount} blocks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{template.usageCount.toLocaleString()} uses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span>{template.successRate}% success</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateAction(template, 'preview')}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateAction(template, 'edit')}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateAction(template, 'analytics')}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                <Eye className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first template.'}
              </p>
              {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <TemplateEditor
          template={selectedTemplate ? {
            ...selectedTemplate,
            blocks: selectedTemplate.blocks || []
          } : null}
          onSave={async (editorTemplate) => {
            try {
              const token = localStorage.getItem('token');
              
              if (selectedTemplate) {
                // Update existing template
                const response = await fetch(`/api/admin/templates?id=${selectedTemplate.id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(editorTemplate)
                });

                if (response.ok) {
                  const result = await response.json();
                  if (result.success) {
                    setTemplates(prev => prev.map(t => 
                      t.id === selectedTemplate.id ? result.data : t
                    ));
                  } else {
                    alert('Failed to update template: ' + result.error);
                    return;
                  }
                } else {
                  alert('Failed to update template');
                  return;
                }
              } else {
                // Create new template
                const response = await fetch('/api/admin/templates', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(editorTemplate)
                });

                if (response.ok) {
                  const result = await response.json();
                  if (result.success) {
                    setTemplates(prev => [...prev, result.data]);
                    // Update stats
                    setStats(prev => ({
                      ...prev,
                      totalTemplates: prev.totalTemplates + 1,
                      activeTemplates: result.data.status === 'active' ? prev.activeTemplates + 1 : prev.activeTemplates
                    }));
                  } else {
                    alert('Failed to create template: ' + result.error);
                    return;
                  }
                } else {
                  alert('Failed to create template');
                  return;
                }
              }
              
              setShowCreateModal(false);
              setSelectedTemplate(null);
            } catch (error) {
              console.error('Error saving template:', error);
              alert('Error saving template. Please try again.');
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default TemplateManagement;
