import React, { useState } from 'react';
import { CollaborativeStudyBuilderContainer } from '../collaboration/CollaborativeStudyBuilderContainer';
import { StudyBuilderBlock } from '../../../shared/types';
import { Button } from '../ui/Button';
import { Plus, Save, Loader2 } from 'lucide-react';

export const CollaborativeBlockDemo: React.FC = () => {
  const [demoBlocks, setDemoBlocks] = useState<StudyBuilderBlock[]>([
    {
      id: 'block-welcome-1',
      type: 'welcome',
      title: 'Welcome to Our Research Study',
      description: 'Thank you for participating! This study will help us understand user behavior patterns.',
      settings: {},
      order: 0
    },
    {
      id: 'block-question-1',
      type: 'open_question',
      title: 'Tell us about your experience',
      description: 'Please describe your thoughts and feelings about the product you just tested.',
      settings: {
        placeholder: 'Share your detailed thoughts here...',
        minLength: 50,
        maxLength: 500
      },
      order: 1
    },
    {
      id: 'block-choice-1',
      type: 'multiple_choice',
      title: 'How would you rate your overall experience?',
      description: 'Please select the option that best describes your experience.',
      settings: {
        options: [
          'Excellent - Exceeded my expectations',
          'Good - Met my expectations',
          'Fair - Below my expectations',
          'Poor - Much worse than expected'
        ],
        allowMultiple: false
      },
      order: 2
    },
    {
      id: 'block-scale-1',
      type: 'opinion_scale',
      title: 'Likelihood to Recommend',
      description: 'How likely are you to recommend this product to a friend or colleague?',
      settings: {
        min: 0,
        max: 10,
        minLabel: 'Not at all likely',
        maxLabel: 'Extremely likely',
        step: 1
      },
      order: 3
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleBlocksChange = (updatedBlocks: StudyBuilderBlock[]) => {
    setDemoBlocks(updatedBlocks);
  };

  const handleAddBlock = () => {
    const newBlock: StudyBuilderBlock = {
      id: `block-new-${Date.now()}`,
      type: 'open_question',
      title: 'New Question Block',
      description: 'Enter your question here...',
      settings: {},
      order: demoBlocks.length
    };
    
    setDemoBlocks(prev => [...prev, newBlock]);
  };

  const handleSaveStudy = async () => {
    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    alert('Study blocks saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CollaborativeStudyBuilderContainer
        studyId="demo-study-123"
        studyTitle="Enhanced Block System Demo"
        workspaceId="demo-workspace"
        studyBlocks={demoBlocks}
        onBlocksChange={handleBlocksChange}
        className="h-full"
      >
        {/* Main Study Builder Content */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Block System Demo</h1>
                <p className="text-gray-600 mt-1">
                  Experience collaborative block editing with real-time preview and team collaboration
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAddBlock}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Block
                </Button>
                <Button
                  onClick={handleSaveStudy}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Study
                </Button>
              </div>
            </div>

            {/* Study Blocks Overview */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Study Flow ({demoBlocks.length} blocks)</h2>
              
              {demoBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <h3 className="font-medium text-gray-900">{block.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md capitalize">
                          {block.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm ml-9">{block.description}</p>
                      
                      {/* Block settings preview */}
                      {Object.keys(block.settings || {}).length > 0 && (
                        <div className="ml-9 mt-2">
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer hover:text-gray-700">
                              View Settings
                            </summary>
                            <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(block.settings, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {demoBlocks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks yet</h3>
                  <p className="text-gray-600 mb-4">Start building your study by adding your first block.</p>
                  <Button onClick={handleAddBlock} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Block
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Demo Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Demo Features</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Collaboration Panel</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Click the "Team" button to open collaboration panel</li>
                  <li>• Switch to "Blocks" tab to see block preview</li>
                  <li>• Edit, Preview, and Participant views available</li>
                  <li>• Real-time activity feed for all changes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Enhanced Block System</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Click any block in the collaboration panel</li>
                  <li>• Switch between Edit/Preview/Participant modes</li>
                  <li>• See exactly how participants will experience blocks</li>
                  <li>• Real-time collaboration on block-level edits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CollaborativeStudyBuilderContainer>
    </div>
  );
};

export default CollaborativeBlockDemo;
