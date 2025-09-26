import React from 'react';
import { StudyBuilderBlock } from '../types';


interface EnhancedBlockEditorProps {
  block: StudyBuilderBlock;
  onUpdate: (blockId: string, updates: Partial<StudyBuilderBlock>) => void;
}

export const EnhancedBlockEditor: React.FC<EnhancedBlockEditorProps> = ({ block, onUpdate }) => {
  const updateBlockField = (field: string, value: unknown) => {
    onUpdate(block.id, {
      ...block,
      [field]: value
    });
  };

  const updateBlockSetting = (setting: string, value: unknown) => {
    onUpdate(block.id, {
      settings: {
        ...block.settings,
        [setting]: value
      }
    });
  };

  const renderBlockSpecificFields = () => {
    switch (block.type) {
      case 'task_instruction':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Instruction
              </label>
              <textarea
                value={(block.settings as { instruction?: string }).instruction || ''}
                onChange={(e) => updateBlockSetting('instruction', e.target.value)}
                placeholder="Please complete the following task..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Task
              </label>
              <input
                type="text"
                value={(block.settings as { task?: string }).task || ''}
                onChange={(e) => updateBlockSetting('task', e.target.value)}
                placeholder="Navigate to the homepage and find the contact information"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Success Criteria
              </label>
              <input
                type="text"
                value={(block.settings as { successCriteria?: string }).successCriteria || ''}
                onChange={(e) => updateBlockSetting('successCriteria', e.target.value)}
                placeholder="Successfully locate and view contact information"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes, 0 = no limit)
              </label>
              <input
                type="number"
                min="0"
                value={(block.settings as { timeLimit?: number }).timeLimit || 0}
                onChange={(e) => updateBlockSetting('timeLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'website_navigation':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting URL
              </label>
              <input
                type="url"
                value={(block.settings as { startUrl?: string }).startUrl || ''}
                onChange={(e) => updateBlockSetting('startUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target URL
              </label>
              <input
                type="url"
                value={(block.settings as { targetUrl?: string }).targetUrl || ''}
                onChange={(e) => updateBlockSetting('targetUrl', e.target.value)}
                placeholder="https://example.com/contact"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Navigation Instruction
              </label>
              <input
                type="text"
                value={(block.settings as { instruction?: string }).instruction || ''}
                onChange={(e) => updateBlockSetting('instruction', e.target.value)}
                placeholder="Navigate to the contact page"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`trackClicks-${block.id}`}
                  checked={(block.settings as { trackClicks?: boolean }).trackClicks || false}
                  onChange={(e) => updateBlockSetting('trackClicks', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`trackClicks-${block.id}`} className="text-sm font-medium text-gray-700">
                  Track Clicks
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`trackTime-${block.id}`}
                  checked={(block.settings as { trackTime?: boolean }).trackTime || false}
                  onChange={(e) => updateBlockSetting('trackTime', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`trackTime-${block.id}`} className="text-sm font-medium text-gray-700">
                  Track Time Spent
                </label>
              </div>
            </div>
          </>
        );

      case 'rating_scale':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating Question
              </label>
              <textarea
                value={(block.settings as { question?: string }).question || ''}
                onChange={(e) => updateBlockSetting('question', e.target.value)}
                placeholder="How would you rate the ease of completing this task?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scale Type
              </label>
              <select
                value={(block.settings as { scaleType?: string }).scaleType || 'numeric'}
                onChange={(e) => updateBlockSetting('scaleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="numeric">Numeric Scale</option>
                <option value="stars">Star Rating</option>
                <option value="thumbs">Thumbs Up/Down</option>
                <option value="sus">System Usability Scale</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  min="1"
                  value={(block.settings as { minValue?: number }).minValue || 1}
                  onChange={(e) => updateBlockSetting('minValue', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  min="2"
                  value={(block.settings as { maxValue?: number }).maxValue || 10}
                  onChange={(e) => updateBlockSetting('maxValue', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Label
                </label>
                <input
                  type="text"
                  value={(block.settings as { minLabel?: string }).minLabel || ''}
                  onChange={(e) => updateBlockSetting('minLabel', e.target.value)}
                  placeholder="Very Difficult"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Label
                </label>
                <input
                  type="text"
                  value={(block.settings as { maxLabel?: string }).maxLabel || ''}
                  onChange={(e) => updateBlockSetting('maxLabel', e.target.value)}
                  placeholder="Very Easy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 'feedback_collection':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Question
              </label>
              <textarea
                value={(block.settings as { question?: string }).question || ''}
                onChange={(e) => updateBlockSetting('question', e.target.value)}
                placeholder="Please share your thoughts about this task"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={(block.settings as { placeholder?: string }).placeholder || ''}
                onChange={(e) => updateBlockSetting('placeholder', e.target.value)}
                placeholder="Describe your experience, any difficulties you encountered..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Characters (0 = no limit)
              </label>
              <input
                type="number"
                min="0"
                value={(block.settings as { maxLength?: number }).maxLength || 1000}
                onChange={(e) => updateBlockSetting('maxLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'comparison_test':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comparison Question
              </label>
              <input
                type="text"
                value={(block.settings as { question?: string }).question || ''}
                onChange={(e) => updateBlockSetting('question', e.target.value)}
                placeholder="Which option do you prefer?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Option A</h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={(block.settings as { optionA?: { title?: string } }).optionA?.title || ''}
                    onChange={(e) => updateBlockSetting('optionA', { ...(block.settings as { optionA?: object }).optionA, title: e.target.value })}
                    placeholder="Option A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={(block.settings as { optionA?: { description?: string } }).optionA?.description || ''}
                    onChange={(e) => updateBlockSetting('optionA', { ...(block.settings as { optionA?: object }).optionA, description: e.target.value })}
                    placeholder="First option description"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={(block.settings as { optionA?: { imageUrl?: string } }).optionA?.imageUrl || ''}
                    onChange={(e) => updateBlockSetting('optionA', { ...(block.settings as { optionA?: object }).optionA, imageUrl: e.target.value })}
                    placeholder="https://example.com/image-a.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Option B</h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={(block.settings as { optionB?: { title?: string } }).optionB?.title || ''}
                    onChange={(e) => updateBlockSetting('optionB', { ...(block.settings as { optionB?: object }).optionB, title: e.target.value })}
                    placeholder="Option B"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={(block.settings as { optionB?: { description?: string } }).optionB?.description || ''}
                    onChange={(e) => updateBlockSetting('optionB', { ...(block.settings as { optionB?: object }).optionB, description: e.target.value })}
                    placeholder="Second option description"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={(block.settings as { optionB?: { imageUrl?: string } }).optionB?.imageUrl || ''}
                    onChange={(e) => updateBlockSetting('optionB', { ...(block.settings as { optionB?: object }).optionB, imageUrl: e.target.value })}
                    placeholder="https://example.com/image-b.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 'completion_check':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Question
              </label>
              <input
                type="text"
                value={(block.settings as { question?: string }).question || ''}
                onChange={(e) => updateBlockSetting('question', e.target.value)}
                placeholder="Were you able to successfully complete the task?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer Options (one per line)
              </label>
              <textarea
                value={(block.settings as { options?: string[] }).options?.join('\n') || 'Yes, completed successfully\nPartially completed\nCould not complete'}
                onChange={(e) => updateBlockSetting('options', e.target.value.split('\n').filter(option => option.trim()))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Question
              </label>
              <input
                type="text"
                value={(block.settings as { followUpQuestion?: string }).followUpQuestion || ''}
                onChange={(e) => updateBlockSetting('followUpQuestion', e.target.value)}
                placeholder="Please explain:"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'welcome_screen':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
              </label>
              <textarea
                value={(block.settings as { message?: string }).message || ''}
                onChange={(e) => updateBlockSetting('message', e.target.value)}
                placeholder="Welcome to our usability study! Please read the following instructions carefully..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Duration Estimate
              </label>
              <input
                type="text"
                value={(block.settings as { duration?: string }).duration || ''}
                onChange={(e) => updateBlockSetting('duration', e.target.value)}
                placeholder="10-15 minutes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'thank_you_screen':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thank You Message
              </label>
              <textarea
                value={(block.settings as { message?: string }).message || ''}
                onChange={(e) => updateBlockSetting('message', e.target.value)}
                placeholder="Thank you for your participation! Your feedback is valuable and will help us improve our product."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`showCode-${block.id}`}
                checked={(block.settings as { showCompletionCode?: boolean }).showCompletionCode || false}
                onChange={(e) => updateBlockSetting('showCompletionCode', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`showCode-${block.id}`} className="text-sm font-medium text-gray-700">
                Show completion code
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redirect URL (optional)
              </label>
              <input
                type="url"
                value={(block.settings as { redirectUrl?: string }).redirectUrl || ''}
                onChange={(e) => updateBlockSetting('redirectUrl', e.target.value)}
                placeholder="https://example.com/survey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Configuration options for this block type are coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Block Header with Icon */}
      <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
        <div className="text-2xl">
          {block.type === 'task_instruction' && '📝'}
          {block.type === 'website_navigation' && '🌐'}
          {block.type === 'rating_scale' && '⭐'}
          {block.type === 'feedback_collection' && '💬'}
          {block.type === 'comparison_test' && '⚖️'}
          {block.type === 'completion_check' && '✅'}
          {block.type === 'welcome_screen' && '👋'}
          {block.type === 'thank_you_screen' && '🙏'}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
          <p className="text-sm text-gray-600">{block.type.replace('_', ' ').toUpperCase()}</p>
        </div>
      </div>

      {/* Block Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Block Title
        </label>
        <input
          type="text"
          value={block.title}
          onChange={(e) => updateBlockField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a descriptive title for this block"
        />
      </div>

      {/* Block Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={block.description}
          onChange={(e) => updateBlockField('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description of what participants will do"
        />
      </div>

      {/* Block-specific Configuration */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <span>⚙️</span>
          <span>Block Settings</span>
        </h4>
        {renderBlockSpecificFields()}
      </div>

      {/* Required Field Toggle for applicable blocks */}
      {['rating_scale', 'feedback_collection', 'comparison_test', 'completion_check'].includes(block.type) && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${block.id}`}
              checked={(block.settings as { required?: boolean }).required || false}
              onChange={(e) => updateBlockSetting('required', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`required-${block.id}`} className="text-sm font-medium text-gray-700">
              Required field (participants must complete to continue)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
