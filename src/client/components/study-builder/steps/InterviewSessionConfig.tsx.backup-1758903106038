import React, { useState } from 'react';
import { StepProps, InterviewSessionConfig, InterviewQuestion } from '../types';
import { Plus, Trash2, Clock, Video, Calendar, Users } from 'lucide-react';

export const InterviewSessionConfigStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData,
  onNext,
  onPrevious,
  isFirst
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'guide' | 'scheduling'>('basic');

  const sessionConfig = formData.interview_session_config || {
    type: 'live_interview',
    duration_minutes: 60,
    recording: {
      enabled: true,
      audio: true,
      video: true,
      screen_share: false,
      consent_required: true
    },
    interview_script: {
      introduction: '',
      questions: [],
      conclusion: ''
    },
    scheduling: {
      buffer_time_minutes: 15,
      available_slots: [],
      auto_confirm: false,
      reminder_settings: {
        email_24h: true,
        email_1h: true,
        sms_15min: false
      }
    }
  };

  const handleConfigUpdate = (updates: Partial<InterviewSessionConfig>) => {
    onUpdateFormData({
      interview_session_config: {
        ...sessionConfig,
        ...updates
      }
    });
  };

  const handleRecordingUpdate = (updates: Partial<typeof sessionConfig.recording>) => {
    handleConfigUpdate({
      recording: {
        ...sessionConfig.recording,
        ...updates
      }
    });
  };

  const handleScriptUpdate = (updates: Partial<typeof sessionConfig.interview_script>) => {
    handleConfigUpdate({
      interview_script: {
        ...sessionConfig.interview_script,
        ...updates
      }
    });
  };

  const handleSchedulingUpdate = (updates: Partial<typeof sessionConfig.scheduling>) => {
    handleConfigUpdate({
      scheduling: {
        ...sessionConfig.scheduling,
        ...updates
      }
    });
  };

  const addQuestion = () => {
    const newQuestion: InterviewQuestion = {
      id: Date.now().toString(),
      text: '',
      type: 'open_ended',
      time_allocation_minutes: 5,
      follow_up_prompts: []
    };

    handleScriptUpdate({
      questions: [...sessionConfig.interview_script.questions, newQuestion]
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<InterviewQuestion>) => {
    const updatedQuestions = sessionConfig.interview_script.questions.map((q: InterviewQuestion) =>
      q.id === questionId ? { ...q, ...updates } : q
    );

    handleScriptUpdate({
      questions: updatedQuestions
    });
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = sessionConfig.interview_script.questions.filter((q: InterviewQuestion) => q.id !== questionId);
    
    handleScriptUpdate({
      questions: updatedQuestions
    });
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Session Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Duration
        </label>
        <div className="flex items-center space-x-4">
          <Clock className="h-5 w-5 text-gray-400" />
          <select
            value={sessionConfig.duration_minutes}
            onChange={(e) => handleConfigUpdate({ duration_minutes: parseInt(e.target.value) })}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Recommended: 60 minutes for comprehensive user interviews
        </p>
      </div>

      {/* Recording Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Recording Settings
        </label>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Record Sessions</div>
                <div className="text-sm text-gray-500">Save audio and video for analysis</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sessionConfig.recording.enabled}
                onChange={(e) => handleRecordingUpdate({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {sessionConfig.recording.enabled && (
            <div className="ml-8 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="audio-recording"
                  checked={sessionConfig.recording.audio}
                  onChange={(e) => handleRecordingUpdate({ audio: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="audio-recording" className="ml-2 text-sm text-gray-700">
                  Record audio
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="video-recording"
                  checked={sessionConfig.recording.video}
                  onChange={(e) => handleRecordingUpdate({ video: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="video-recording" className="ml-2 text-sm text-gray-700">
                  Record video
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="screen-recording"
                  checked={sessionConfig.recording.screen_share}
                  onChange={(e) => handleRecordingUpdate({ screen_share: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="screen-recording" className="ml-2 text-sm text-gray-700">
                  Record screen sharing
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="consent-required"
                  checked={sessionConfig.recording.consent_required}
                  onChange={(e) => handleRecordingUpdate({ consent_required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="consent-required" className="ml-2 text-sm text-gray-700">
                  Require explicit consent before recording
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participant Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pre-session Instructions for Participants
        </label>
        <textarea
          value={sessionConfig.interview_script.introduction}
          onChange={(e) => handleScriptUpdate({ introduction: e.target.value })}
          placeholder="Provide instructions participants should read before the session starts..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-1">
          Include technical requirements, what to prepare, and session expectations
        </p>
      </div>
    </div>
  );

  const renderGuideTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Interview Questions</h3>
          <p className="text-sm text-gray-500">Create your interview script with guided questions</p>
        </div>
        <button
          onClick={addQuestion}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </button>
      </div>

      <div className="space-y-4">
        {sessionConfig.interview_script.questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-4">Start building your interview script by adding questions</p>
            <button
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Question
            </button>
          </div>
        ) : (
          sessionConfig.interview_script.questions.map((question: InterviewQuestion, index: number) => (
            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Enter your interview question..."
                      className="w-full text-lg font-medium text-gray-900 border-none outline-none bg-transparent placeholder-gray-400"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, { type: e.target.value as 'open_ended' | 'behavioral' | 'scenario' | 'follow_up' })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="open_ended">Open-ended</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="scenario">Scenario-based</option>
                    <option value="follow_up">Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Allocation (minutes)
                  </label>
                  <input
                    type="number"
                    value={question.time_allocation_minutes}
                    onChange={(e) => updateQuestion(question.id, { time_allocation_minutes: parseInt(e.target.value) || 5 })}
                    min="1"
                    max="30"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Prompts (optional)
                </label>
                <textarea
                  value={question.follow_up_prompts?.join('\n') || ''}
                  onChange={(e) => updateQuestion(question.id, { 
                    follow_up_prompts: e.target.value.split('\n').filter(prompt => prompt.trim()) 
                  })}
                  placeholder="Add follow-up prompts, one per line..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  rows={3}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session Conclusion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Conclusion Script
        </label>
        <textarea
          value={sessionConfig.interview_script.conclusion}
          onChange={(e) => handleScriptUpdate({ conclusion: e.target.value })}
          placeholder="Thank you message and next steps for participants..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          rows={3}
        />
      </div>
    </div>
  );

  const renderSchedulingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduling Settings</h3>
        <p className="text-sm text-gray-500">Configure how participants can book interview sessions</p>
      </div>

      {/* Buffer Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buffer Time Between Sessions
        </label>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={sessionConfig.scheduling.buffer_time_minutes}
            onChange={(e) => handleSchedulingUpdate({ buffer_time_minutes: parseInt(e.target.value) })}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value={0}>No buffer</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </div>
      </div>

      {/* Auto-confirmation */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">Auto-confirm Bookings</div>
              <div className="text-sm text-gray-500">Automatically confirm participant bookings</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sessionConfig.scheduling.auto_confirm}
              onChange={(e) => handleSchedulingUpdate({ auto_confirm: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Reminder Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Participant Reminders
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Email 24 hours before</div>
              <div className="text-sm text-gray-500">Send reminder email 1 day ahead</div>
            </div>
            <input
              type="checkbox"
              checked={sessionConfig.scheduling.reminder_settings.email_24h}
              onChange={(e) => handleSchedulingUpdate({
                reminder_settings: {
                  ...sessionConfig.scheduling.reminder_settings,
                  email_24h: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Email 1 hour before</div>
              <div className="text-sm text-gray-500">Send final reminder email</div>
            </div>
            <input
              type="checkbox"
              checked={sessionConfig.scheduling.reminder_settings.email_1h}
              onChange={(e) => handleSchedulingUpdate({
                reminder_settings: {
                  ...sessionConfig.scheduling.reminder_settings,
                  email_1h: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">SMS 15 minutes before</div>
              <div className="text-sm text-gray-500">Send SMS reminder (requires phone number)</div>
            </div>
            <input
              type="checkbox"
              checked={sessionConfig.scheduling.reminder_settings.sms_15min}
              onChange={(e) => handleSchedulingUpdate({
                reminder_settings: {
                  ...sessionConfig.scheduling.reminder_settings,
                  sms_15min: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const getTotalQuestionTime = () => {
    return sessionConfig.interview_script.questions.reduce((total, q) => total + (q.time_allocation_minutes || 0), 0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Interview Session Setup
        </h2>
        <p className="text-lg text-gray-600">
          Configure your live interview sessions, recording settings, and interview script
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Settings', icon: Video },
            { id: 'guide', label: 'Interview Guide', icon: Users },
            { id: 'scheduling', label: 'Scheduling', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'basic' | 'guide' | 'scheduling')}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'guide' && renderGuideTab()}
        {activeTab === 'scheduling' && renderSchedulingTab()}
      </div>

      {/* Summary */}
      {activeTab === 'guide' && sessionConfig.interview_script.questions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2 text-blue-800">
            <Clock className="h-5 w-5" />
            <span className="font-medium">
              Interview Summary: {sessionConfig.interview_script.questions.length} questions, 
              ~{getTotalQuestionTime()} minutes estimated
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <div>
          {!isFirst && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Step 3 of 5
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue to Participants
          </button>
        </div>
      </div>
    </div>
  );
};
