import React from 'react';
import { StudyBuilderBlock } from '../types';

interface EnhancedBlockPreviewProps {
  block: StudyBuilderBlock;
  participantData?: Record<string, string | number | boolean>;
  onParticipantDataChange?: (data: Record<string, string | number | boolean>) => void;
  isInteractive?: boolean;
}

export const EnhancedBlockPreview: React.FC<EnhancedBlockPreviewProps> = ({ 
  block, 
  participantData = {},
  onParticipantDataChange,
  isInteractive = false 
}) => {
  const updateParticipantData = (key: string, value: string | number | boolean) => {
    if (onParticipantDataChange) {
      onParticipantDataChange({
        ...participantData,
        [key]: value
      });
    }
  };

  const renderBlockPreview = () => {
    switch (block.type) {
      case 'welcome_screen':
        return (
          <div className="text-center py-8 bg-gradient-to-b from-blue-50 to-white">
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{block.title}</h1>
            <div className="max-w-md mx-auto space-y-4 text-left">
              {(block.settings as { message?: string }).message && (
                <p className="text-gray-700 leading-relaxed">
                  {(block.settings as { message?: string }).message}
                </p>
              )}
              {(block.settings as { duration?: string }).duration && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>⏱️</span>
                  <span>Estimated time: {(block.settings as { duration?: string }).duration}</span>
                </div>
              )}
            </div>
            <button 
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled={!isInteractive}
            >
              Start Study
            </button>
          </div>
        );

      case 'task_instruction':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 text-lg">📝</span>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">{block.title}</h3>
                  {(block.settings as { instruction?: string }).instruction && (
                    <p className="text-blue-800 mt-1">
                      {(block.settings as { instruction?: string }).instruction}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {(block.settings as { task?: string }).task && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Your Task:</h4>
                <p className="text-gray-700">{(block.settings as { task?: string }).task}</p>
              </div>
            )}

            {(block.settings as { successCriteria?: string }).successCriteria && (
              <div className="text-sm text-gray-600">
                <strong>Success criteria:</strong> {(block.settings as { successCriteria?: string }).successCriteria}
              </div>
            )}

            {(block.settings as { timeLimit?: number }).timeLimit && (block.settings as { timeLimit?: number }).timeLimit! > 0 && (
              <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                <span>⏰</span>
                <span>Time limit: {(block.settings as { timeLimit?: number }).timeLimit} minutes</span>
              </div>
            )}

            <button 
              className="w-full bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 transition-colors"
              disabled={!isInteractive}
            >
              I'm Ready to Start
            </button>
          </div>
        );

      case 'website_navigation':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <span>🌐</span>
              <span>{block.title}</span>
            </div>
            
            {(block.settings as { instruction?: string }).instruction && (
              <p className="text-gray-700">{(block.settings as { instruction?: string }).instruction}</p>
            )}

            <div className="bg-gray-100 border rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>🔗</span>
                <span>Starting URL:</span>
              </div>
              <div className="font-mono text-sm text-blue-600 bg-white p-2 rounded border">
                {(block.settings as { startUrl?: string }).startUrl || 'https://example.com'}
              </div>
            </div>

            {(block.settings as { targetUrl?: string }).targetUrl && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Target:</span> Navigate to {(block.settings as { targetUrl?: string }).targetUrl}
              </div>
            )}

            <div className="flex space-x-2 text-xs text-gray-500">
              {(block.settings as { trackClicks?: boolean }).trackClicks && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">👆 Click tracking enabled</span>
              )}
              {(block.settings as { trackTime?: boolean }).trackTime && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">⏱️ Time tracking enabled</span>
              )}
            </div>
          </div>
        );

      case 'rating_scale': {
        const scaleType = (block.settings as { scaleType?: string }).scaleType || 'numeric';
        const minValue = (block.settings as { minValue?: number }).minValue || 1;
        const maxValue = (block.settings as { maxValue?: number }).maxValue || 10;
        const minLabel = (block.settings as { minLabel?: string }).minLabel;
        const maxLabel = (block.settings as { maxLabel?: string }).maxLabel;

        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⭐</span>
              <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
            </div>

            {(block.settings as { question?: string }).question && (
              <p className="text-gray-700">{(block.settings as { question?: string }).question}</p>
            )}

            <div className="space-y-2">
              {scaleType === 'numeric' && (
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i).map(value => (
                      <button
                        key={value}
                        className={`w-10 h-10 rounded-lg border-2 font-semibold transition-colors ${
                          participantData[block.id] === value
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                        onClick={() => isInteractive && updateParticipantData(block.id, value)}
                        disabled={!isInteractive}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {scaleType === 'stars' && (
                <div className="flex space-x-1">
                  {Array.from({ length: maxValue }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`text-2xl ${
                        participantData[block.id] && (participantData[block.id] as number) >= i + 1
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      onClick={() => isInteractive && updateParticipantData(block.id, i + 1)}
                      disabled={!isInteractive}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600">
                {minLabel && <span>{minLabel}</span>}
                {maxLabel && <span>{maxLabel}</span>}
              </div>
            </div>
          </div>
        );
      }

      case 'feedback_collection':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💬</span>
              <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
            </div>

            {(block.settings as { question?: string }).question && (
              <label className="block text-gray-700 font-medium">
                {(block.settings as { question?: string }).question}
              </label>
            )}

            <textarea
              value={participantData[block.id] as string || ''}
              onChange={(e) => isInteractive && updateParticipantData(block.id, e.target.value)}
              placeholder={(block.settings as { placeholder?: string }).placeholder || 'Share your thoughts...'}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={!isInteractive}
              maxLength={(block.settings as { maxLength?: number }).maxLength || undefined}
            />

            {(block.settings as { maxLength?: number }).maxLength && (
              <div className="text-right text-sm text-gray-500">
                {(participantData[block.id] as string || '').length} / {(block.settings as { maxLength?: number }).maxLength} characters
              </div>
            )}
          </div>
        );

      case 'comparison_test': {
        const optionA = (block.settings as { optionA?: { title?: string; description?: string; imageUrl?: string } }).optionA;
        const optionB = (block.settings as { optionB?: { title?: string; description?: string; imageUrl?: string } }).optionB;

        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚖️</span>
              <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
            </div>

            {(block.settings as { question?: string }).question && (
              <p className="text-gray-700 font-medium">{(block.settings as { question?: string }).question}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  participantData[block.id] === 'A' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => isInteractive && updateParticipantData(block.id, 'A')}
              >
                {optionA?.imageUrl && (
                  <img src={optionA.imageUrl} alt={optionA.title} className="w-full h-32 object-cover rounded mb-3" />
                )}
                <h4 className="font-semibold text-gray-900">{optionA?.title || 'Option A'}</h4>
                {optionA?.description && (
                  <p className="text-sm text-gray-600 mt-1">{optionA.description}</p>
                )}
              </div>

              {/* Option B */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  participantData[block.id] === 'B' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => isInteractive && updateParticipantData(block.id, 'B')}
              >
                {optionB?.imageUrl && (
                  <img src={optionB.imageUrl} alt={optionB.title} className="w-full h-32 object-cover rounded mb-3" />
                )}
                <h4 className="font-semibold text-gray-900">{optionB?.title || 'Option B'}</h4>
                {optionB?.description && (
                  <p className="text-sm text-gray-600 mt-1">{optionB.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'completion_check': {
        const options = (block.settings as { options?: string[] }).options || [];
        
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
            </div>

            {(block.settings as { question?: string }).question && (
              <p className="text-gray-700 font-medium">{(block.settings as { question?: string }).question}</p>
            )}

            <div className="space-y-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    participantData[block.id] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                  onClick={() => isInteractive && updateParticipantData(block.id, option)}
                  disabled={!isInteractive}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      participantData[block.id] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {participantData[block.id] === option && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {(block.settings as { followUpQuestion?: string }).followUpQuestion && participantData[block.id] && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {(block.settings as { followUpQuestion?: string }).followUpQuestion}
                </label>
                <textarea
                  value={participantData[`${block.id}_followup`] as string || ''}
                  onChange={(e) => isInteractive && updateParticipantData(`${block.id}_followup`, e.target.value)}
                  placeholder="Please provide additional details..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={!isInteractive}
                />
              </div>
            )}
          </div>
        );
      }

      case 'thank_you_screen':
        return (
          <div className="text-center py-8 bg-gradient-to-b from-green-50 to-white">
            <div className="text-4xl mb-4">🙏</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{block.title}</h1>
            {(block.settings as { message?: string }).message && (
              <p className="text-gray-700 max-w-md mx-auto mb-6">
                {(block.settings as { message?: string }).message}
              </p>
            )}
            
            {(block.settings as { showCompletionCode?: boolean }).showCompletionCode && (
              <div className="bg-gray-100 border rounded-lg p-4 mb-4 max-w-sm mx-auto">
                <p className="text-sm text-gray-600 mb-2">Your completion code:</p>
                <div className="text-lg font-mono font-bold text-gray-900">
                  #{Math.random().toString(36).substr(2, 8).toUpperCase()}
                </div>
              </div>
            )}

            {(block.settings as { redirectUrl?: string }).redirectUrl && (
              <button 
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                disabled={!isInteractive}
              >
                Continue to Next Survey
              </button>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
            <p className="text-gray-600 mt-2">Preview for this block type coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {renderBlockPreview()}
      
      {/* Required Field Indicator */}
      {(block.settings as { required?: boolean }).required && (
        <div className="mt-4 flex items-center justify-center text-sm text-red-600">
          <span className="inline-flex items-center space-x-1">
            <span>*</span>
            <span>Required field</span>
          </span>
        </div>
      )}
    </div>
  );
};
