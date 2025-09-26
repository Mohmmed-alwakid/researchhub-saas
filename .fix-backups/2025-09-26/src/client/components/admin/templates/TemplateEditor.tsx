import React, { useState, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2, Save } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';

interface TemplateBlock {
  id: string;
  type: string;
  title: string;
  description: string;
  settings: Record<string, unknown>;
  order: number;
}

interface Template {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'active' | 'draft' | 'archived';
  estimatedDuration: number;
  blocks: TemplateBlock[];
}

interface TemplateEditorProps {
  template?: Template | null;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

// Available block types for templates
const BLOCK_TYPES = [
  { type: 'welcome', title: 'Welcome Screen', description: 'Introduce your study to participants' },
  { type: 'open_question', title: 'Open Question', description: 'Collect qualitative feedback' },
  { type: 'opinion_scale', title: 'Opinion Scale', description: 'Rating scale questions' },
  { type: 'simple_input', title: 'Simple Input', description: 'Text, number, or date input' },
  { type: 'multiple_choice', title: 'Multiple Choice', description: 'Single or multiple selection' },
  { type: 'context_screen', title: 'Context Screen', description: 'Instructions or information' },
  { type: 'yes_no', title: 'Yes/No', description: 'Binary choice questions' },
  { type: 'five_second_test', title: '5-Second Test', description: 'First impression testing' },
  { type: 'card_sort', title: 'Card Sort', description: 'Information architecture testing' },
  { type: 'tree_test', title: 'Tree Test', description: 'Navigation findability testing' },
  { type: 'image_upload', title: 'Image Upload', description: 'Collect visual content' },
  { type: 'file_upload', title: 'File Upload', description: 'Collect documents and files' },
  { type: 'thank_you', title: 'Thank You', description: 'Study completion message' }
];

const CATEGORIES = [
  'User Experience',
  'Product Research',
  'Concept Testing',
  'Qualitative Research',
  'Market Research',
  'Accessibility Testing'
];

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Template>({
    title: '',
    description: '',
    category: 'User Experience',
    difficulty: 'Beginner',
    status: 'draft',
    estimatedDuration: 10,
    blocks: []
  });

  const [showBlockSelector, setShowBlockSelector] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        blocks: template.blocks || []
      });
    }
  }, [template]);

  const handleInputChange = (field: keyof Template, value: string | number | Template['difficulty'] | Template['status']) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBlock = (blockType: string) => {
    const blockInfo = BLOCK_TYPES.find(b => b.type === blockType);
    if (!blockInfo) return;

    const newBlock: TemplateBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      title: blockInfo.title,
      description: blockInfo.description,
      settings: {},
      order: formData.blocks.length
    };

    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));

    setShowBlockSelector(false);
  };

  const removeBlock = (blockId: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId).map((block, index) => ({
        ...block,
        order: index
      }))
    }));
  };

  // Note: moveBlock function ready for future drag-and-drop implementation
  // const moveBlock = (fromIndex: number, toIndex: number) => {
  //   const blocks = [...formData.blocks];
  //   const [movedBlock] = blocks.splice(fromIndex, 1);
  //   blocks.splice(toIndex, 0, movedBlock);
  //   
  //   // Update order numbers
  //   const reorderedBlocks = blocks.map((block, index) => ({
  //     ...block,
  //     order: index
  //   }));

  //   setFormData(prev => ({
  //     ...prev,
  //     blocks: reorderedBlocks
  //   }));
  // };

  const updateBlockTitle = (blockId: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, title } : block
      )
    }));
  };

  const validateForm = () => {
    return formData.title.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.blocks.length > 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields and add at least one block.');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>{template ? 'Edit Template' : 'Create New Template'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter template title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value as Template['difficulty'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="120"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe what this template is used for and what researchers will accomplish with it"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as Template['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Template Blocks */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Template Blocks</h3>
              <Button onClick={() => setShowBlockSelector(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Block
              </Button>
            </div>

            {/* Blocks List */}
            <div className="space-y-3">
              {formData.blocks.map((block) => (
                <Card key={block.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                            className="font-medium text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none w-full"
                          />
                          <p className="text-sm text-gray-600">{block.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {block.type.replace('_', ' ')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlock(block.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formData.blocks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No blocks added yet. Click "Add Block" to start building your template.</p>
                </div>
              )}
            </div>
          </div>

          {/* Block Selector Modal */}
          {showBlockSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Add Block to Template</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowBlockSelector(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {BLOCK_TYPES.map((blockType) => (
                      <Card
                        key={blockType.type}
                        className="cursor-pointer hover:shadow-md transition-shadow border"
                        onClick={() => addBlock(blockType.type)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{blockType.title}</h4>
                          <p className="text-sm text-gray-600">{blockType.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        <div className="flex-shrink-0 border-t p-6">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!validateForm()}>
              <Save className="w-4 h-4 mr-2" />
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TemplateEditor;
