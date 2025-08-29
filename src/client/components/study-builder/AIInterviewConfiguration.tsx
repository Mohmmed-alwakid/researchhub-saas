import React, { useState } from 'react';
import { Plus, Trash2, Bot, Mic, Globe } from 'lucide-react';

interface InterviewQuestion {
  id: string;
  text: string;
  type: 'opening' | 'main' | 'follow_up' | 'closing';
}

interface AIInterviewConfig {
  type: 'live_interview';
  duration_minutes: number;
  recording: {
    enabled: boolean;
    audio: boolean;
    video: boolean;
    screen_share: boolean;
    consent_required: boolean;
  };
  interview_script: {
    introduction: string;
    questions: InterviewQuestion[];
    conclusion: string;
  };
  ai_settings: {
    enabled: boolean;
    language: 'arabic' | 'english';
    personality: 'professional' | 'friendly' | 'casual';
    voice_enabled: boolean;
  };
}

interface AIInterviewConfigurationProps {
  value: AIInterviewConfig;
  onChange: (config: AIInterviewConfig) => void;
}

const AIInterviewConfiguration: React.FC<AIInterviewConfigurationProps> = ({ value, onChange }) => {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'opening' | 'main' | 'follow_up' | 'closing'>('main');

  const updateConfig = (updates: Partial<AIInterviewConfig>) => {
    onChange({ ...value, ...updates });
  };

  const updateNestedConfig = (section: keyof AIInterviewConfig, updates: Record<string, unknown>) => {
    updateConfig({
      [section]: { ...(value[section] as Record<string, unknown>), ...updates }
    } as Partial<AIInterviewConfig>);
  };

  const addQuestion = () => {
    if (!newQuestionText.trim()) return;

    const newQuestion: InterviewQuestion = {
      id: `q-${Date.now()}`,
      text: newQuestionText.trim(),
      type: newQuestionType
    };

    updateNestedConfig('interview_script', {
      questions: [...value.interview_script.questions, newQuestion]
    });
    setNewQuestionText('');
  };

  const removeQuestion = (questionId: string) => {
    const questions = value.interview_script.questions.filter(q => q.id !== questionId);
    updateNestedConfig('interview_script', { questions });
  };

  const generateQuestionsWithAI = async () => {
    try {
      const response = await fetch('/api/research-consolidated?action=ai-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyGoals: 'User experience research',
          language: value.ai_settings.language
        })
      });

      const result = await response.json();
      if (result.success) {
        updateNestedConfig('interview_script', { questions: result.data.questions });
      }
    } catch (error) {
      console.error('Failed to generate AI questions:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Settings */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            AI Interview Moderator (UE-001)
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="ai-enabled"
              checked={value.ai_settings.enabled}
              onChange={(e) => updateNestedConfig('ai_settings', { enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ai-enabled" className="text-sm font-medium text-gray-700">
              Enable AI-Powered Interview Moderator
            </label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              UE-001
            </span>
          </div>

          {value.ai_settings.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </label>
                <select
                  value={value.ai_settings.language}
                  onChange={(e) => updateNestedConfig('ai_settings', { language: e.target.value as 'arabic' | 'english' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="english">English</option>
                  <option value="arabic">العربية (Arabic)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Personality</label>
                <select
                  value={value.ai_settings.personality}
                  onChange={(e) => updateNestedConfig('ai_settings', { personality: e.target.value as 'professional' | 'friendly' | 'casual' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Voice Interaction
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="voice-enabled"
                    checked={value.ai_settings.voice_enabled}
                    onChange={(e) => updateNestedConfig('ai_settings', { voice_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="voice-enabled" className="text-sm text-gray-700">
                    Enable voice chat
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recording Settings */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recording Settings</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="recording-enabled"
              checked={value.recording.enabled}
              onChange={(e) => updateNestedConfig('recording', { enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="recording-enabled" className="text-sm font-medium text-gray-700">
              Enable session recording
            </label>
          </div>

          {value.recording.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="audio-recording"
                  checked={value.recording.audio}
                  onChange={(e) => updateNestedConfig('recording', { audio: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="audio-recording" className="text-sm text-gray-700">
                  Audio recording
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="video-recording"
                  checked={value.recording.video}
                  onChange={(e) => updateNestedConfig('recording', { video: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="video-recording" className="text-sm text-gray-700">
                  Video recording
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interview Script */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Interview Script</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
            <textarea
              value={value.interview_script.introduction}
              onChange={(e) => updateNestedConfig('interview_script', { introduction: e.target.value })}
              placeholder="Enter the introduction that the AI will use to start the interview..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Interview Questions</label>
              {value.ai_settings.enabled && (
                <button
                  onClick={generateQuestionsWithAI}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Bot className="w-4 h-4 mr-1" />
                  Generate with AI
                </button>
              )}
            </div>

            {/* Question List */}
            <div className="space-y-2 mb-4">
              {value.interview_script.questions.map((question) => (
                <div key={question.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {question.type.replace('_', ' ')}
                  </span>
                  <span className="flex-1 text-sm text-gray-700">{question.text}</span>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Question */}
            <div className="flex gap-2">
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value as 'opening' | 'main' | 'follow_up' | 'closing')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="opening">Opening</option>
                <option value="main">Main</option>
                <option value="follow_up">Follow-up</option>
                <option value="closing">Closing</option>
              </select>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter interview question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
              />
              <button
                onClick={addQuestion}
                disabled={!newQuestionText.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion</label>
            <textarea
              value={value.interview_script.conclusion}
              onChange={(e) => updateNestedConfig('interview_script', { conclusion: e.target.value })}
              placeholder="Enter the conclusion message that the AI will use to end the interview..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Session Settings</h3>
        </div>
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Duration (minutes)</label>
            <input
              type="number"
              value={value.duration_minutes}
              onChange={(e) => updateConfig({ duration_minutes: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="5"
              max="120"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewConfiguration;
