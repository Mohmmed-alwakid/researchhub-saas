import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Clock, Users, Star, ChevronRight, Eye, Plus } from 'lucide-react';


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
}

interface Task {
  id: string;
  templateId: string;
  name: string;
  description: string;
  estimatedDuration: number;
  settings: Record<string, unknown>;
  order: number;
  isRequired: boolean;
}

interface TaskLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (template: TaskTemplate) => void;
  studyType: string;
  currentTasks: Task[];
}

export const TaskLibraryModal: React.FC<TaskLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  studyType,
  currentTasks
}) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [loading, setLoading] = useState(false);  const fetchTaskTemplates = React.useCallback(async () => {
    setLoading(true);    try {
      const response = await fetch(`/api/study-builder?action=getTaskTemplates&studyType=${studyType}`);
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.taskTemplates || []);
      }
    } catch (error) {
      console.error('Failed to fetch task templates:', error);
    } finally {
      setLoading(false);
    }
  }, [studyType]);

  useEffect(() => {
    if (isOpen && studyType) {
      fetchTaskTemplates();
    }
  }, [isOpen, studyType, fetchTaskTemplates]);

  // Filter templates based on search and category
  useEffect(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort by popularity and relevance
    filtered.sort((a, b) => {
      if (a.popularity !== b.popularity) {
        return b.popularity - a.popularity;
      }
      return b.usageCount - a.usageCount;    });

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory]);

  const getCategories = () => {
    const categories = Array.from(new Set(templates.map(t => t.category)));
    return [{ id: 'all', name: 'All Categories', count: templates.length }]
      .concat(categories.map(cat => ({
        id: cat,
        name: cat,
        count: templates.filter(t => t.category === cat).length
      })));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isTaskAlreadyAdded = (templateId: string) => {
    return currentTasks.some(task => task.templateId === templateId);
  };

  const handleAddTask = (template: TaskTemplate) => {
    onAddTask(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex overflow-hidden">
        {/* Left Panel - Task List */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Task Library</h2>
                <p className="text-gray-600 mt-1">Choose tasks for your {studyType.replace('_', ' ')} study</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getCategories().map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isTaskAlreadyAdded(template.id) ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </span>
                        </div>
                      </div>
                      {isTaskAlreadyAdded(template.id) && (
                        <span className="text-green-600 text-sm font-medium">Added</span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {template.estimatedDuration}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {template.usageCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          {template.popularity}/5
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Task Preview */}
        {selectedTemplate && (
          <div className="w-96 border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedTemplate.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                    {selectedTemplate.difficulty}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{selectedTemplate.estimatedDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{selectedTemplate.usageCount} uses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{selectedTemplate.popularity}/5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span>{selectedTemplate.category}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
              {selectedTemplate.previewContent ? (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  {selectedTemplate.previewContent}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Preview not available</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => handleAddTask(selectedTemplate)}
                disabled={isTaskAlreadyAdded(selectedTemplate.id)}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isTaskAlreadyAdded(selectedTemplate.id)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus className="w-5 h-5" />
                {isTaskAlreadyAdded(selectedTemplate.id) ? 'Already Added' : 'Add Task'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLibraryModal;
