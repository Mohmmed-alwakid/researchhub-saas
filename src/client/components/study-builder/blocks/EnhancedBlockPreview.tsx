import React, { useState } from 'react';
import { StudyBuilderBlock } from '../../../../shared/types';


interface EnhancedBlockPreviewProps {
  block: StudyBuilderBlock;
  mode: 'edit' | 'preview' | 'participant';
  onModeChange?: (mode: 'edit' | 'preview' | 'participant') => void;
  showModeToggle?: boolean;
}

export const EnhancedBlockPreview: React.FC<EnhancedBlockPreviewProps> = ({
  block,
  mode,
  onModeChange,
  showModeToggle = true
}) => {
  const [simulatedResponse, setSimulatedResponse] = useState<string | number | boolean | null>(null);

  // Render block as participant would see it
  const renderParticipantView = () => {
    switch (block.type) {
      case 'welcome': {
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👋</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{block.title}</h2>
              <p className="text-gray-600 text-lg mb-6">{block.description}</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </div>
          </div>
        );
      }

      case 'open_question': {
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{block.title}</h3>
            <p className="text-gray-600 mb-4">{block.description}</p>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Type your answer here..."
              value={typeof simulatedResponse === 'string' ? simulatedResponse : ''}
              onChange={(e) => setSimulatedResponse(e.target.value)}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {typeof simulatedResponse === 'string' ? simulatedResponse.length : 0} characters
              </span>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Continue
              </button>
            </div>
          </div>
        );
      }

      case 'multiple_choice': {
        const settings = block.settings as { options?: string[] };
        const options = settings.options || ['Option 1', 'Option 2', 'Option 3'];
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{block.title}</h3>
            <p className="text-gray-600 mb-6">{block.description}</p>
            <div className="space-y-3">
              {options.map((option: string, index: number) => (
                <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${block.id}`}
                    value={option}
                    checked={simulatedResponse === option}
                    onChange={(e) => setSimulatedResponse(e.target.value)}
                    className="mr-4 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
            <button 
              className={`mt-6 px-6 py-2 rounded-lg font-medium transition-colors ${
                simulatedResponse 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!simulatedResponse}
            >
              Continue
            </button>
          </div>
        );
      }

      case 'opinion_scale': {
        const settings = block.settings as { 
          scaleType?: string; 
          range?: { min: number; max: number };
          leftLabel?: string;
          rightLabel?: string;
        };
        const scaleType = settings.scaleType || 'numerical';
        const scaleRange = settings.range || { min: 1, max: 5 };
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{block.title}</h3>
            <p className="text-gray-600 mb-6">{block.description}</p>
            
            {scaleType === 'numerical' && (
              <div className="flex justify-between items-center mb-4">
                {Array.from({ length: scaleRange.max - scaleRange.min + 1 }, (_, i) => {
                  const value = scaleRange.min + i;
                  return (
                    <button
                      key={value}
                      onClick={() => setSimulatedResponse(value)}
                      className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                        simulatedResponse === value
                          ? 'bg-blue-500 border-blue-500 text-white transform scale-110'
                          : 'border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}

            {scaleType === 'stars' && (
              <div className="flex justify-center space-x-2 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSimulatedResponse(i + 1)}
                    className={`text-3xl transition-colors ${
                      (simulatedResponse as number || 0) > i ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between text-sm text-gray-500 mb-6">
              <span>{settings.leftLabel || 'Strongly Disagree'}</span>
              <span>{settings.rightLabel || 'Strongly Agree'}</span>
            </div>

            <button 
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                simulatedResponse 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!simulatedResponse}
            >
              Continue
            </button>
          </div>
        );
      }

      case 'thank_you': {
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-lg text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{block.title}</h2>
              <p className="text-gray-600 text-lg mb-6">{block.description}</p>
              <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
                <p className="text-sm text-gray-600">Study completed successfully!</p>
                <p className="text-xs text-gray-500 mt-1">Thank you for your participation.</p>
              </div>
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{block.title}</h3>
            <p className="text-gray-600 mb-4">{block.description}</p>
            <div className="bg-white p-4 rounded border border-gray-200">
              <p className="text-sm text-gray-500">Block type: {block.type}</p>
              <p className="text-xs text-gray-400 mt-1">Preview not yet implemented for this block type</p>
            </div>
          </div>
        );
      }
    }
  };

  // Render edit mode with settings preview
  const renderEditView = () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-medium text-gray-900">{block.title}</h4>
          <p className="text-sm text-gray-600">{block.type.replace('_', ' ')}</p>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600">{block.description}</p>
      {Object.keys(block.settings || {}).length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
          <p className="font-medium text-gray-700 mb-1">Settings:</p>
          <pre className="text-gray-600">{JSON.stringify(block.settings, null, 2)}</pre>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      {showModeToggle && onModeChange && (
        <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
          {(['edit', 'preview', 'participant'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                mode === m
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {m === 'edit' ? '⚙️ Edit' : m === 'preview' ? '👁️ Preview' : '👤 Participant'}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {mode === 'edit' && renderEditView()}
        {(mode === 'preview' || mode === 'participant') && renderParticipantView()}
        
        {/* Mode indicator */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            mode === 'edit' ? 'bg-blue-100 text-blue-800' :
            mode === 'preview' ? 'bg-purple-100 text-purple-800' :
            'bg-green-100 text-green-800'
          }`}>
            {mode === 'edit' ? '⚙️' : mode === 'preview' ? '👁️' : '👤'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlockPreview;
