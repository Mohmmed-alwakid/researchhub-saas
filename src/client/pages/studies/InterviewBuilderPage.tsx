import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar, Video, Mic, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';
import { useAppStore } from '../../stores/appStore';


interface InterviewSettings {
  title: string;
  description: string;
  objectives: string[];
  duration: number;
  timezone: string;
  recordingEnabled: boolean;
  recordingType: 'video' | 'audio' | 'both';
  transcriptionEnabled: boolean;
  maxParticipants: number;
  compensation?: number;
  instructions: string;
  interviewGuide: string[];
}

const InterviewBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { createStudy } = useAppStore();
  
  const [settings, setSettings] = useState<InterviewSettings>({
    title: '',
    description: '',
    objectives: [''],
    duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recordingEnabled: true,
    recordingType: 'both',
    transcriptionEnabled: true,
    maxParticipants: 5,
    compensation: 0,
    instructions: '',
    interviewGuide: ['']
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof InterviewSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'objectives' | 'interviewGuide', index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'objectives' | 'interviewGuide') => {
    setSettings(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'objectives' | 'interviewGuide', index: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!settings.title.trim()) {
      alert('Please enter a study title');
      return;
    }

    setLoading(true);
    try {
      const studyData = {
        title: settings.title,
        description: settings.description,
        type: 'interview' as const,
        status: 'draft' as const,
        tasks: [], // No tasks for interviews
        settings: {
          maxParticipants: settings.maxParticipants,
          duration: settings.duration,
          compensation: settings.compensation || 0,
          recordScreen: false, // Not applicable for interviews
          recordAudio: settings.recordingEnabled,
          collectHeatmaps: false // Not applicable for interviews
        }
      };

      await createStudy(studyData);
      navigate('/app/studies');
    } catch (error) {
      console.error('Failed to create interview:', error);
      alert('Failed to create interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/studies')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Studies</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Moderated Interview</h1>
              <p className="text-gray-600">Set up live interviews with participants</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create Interview'}</span>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5" />
              <span>Basic Information</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Title *
                </label>
                <Input
                  value={settings.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., User Experience Interview for Mobile App"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the purpose and goals of this interview..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Objectives
                </label>
                {settings.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={objective}
                      onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                      placeholder="e.g., Understand user pain points in checkout process"
                      className="flex-1"
                    />
                    {settings.objectives.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('objectives', index)}
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem('objectives')}
                  className="text-blue-600"
                >
                  + Add Objective
                </Button>
              </div>
            </div>
          </Card>

          {/* Interview Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5" />
              <span>Interview Settings</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={settings.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    min="15"
                    max="180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    value={settings.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compensation ($)
                  </label>
                  <Input
                    type="number"
                    value={settings.compensation}
                    onChange={(e) => handleInputChange('compensation', parseInt(e.target.value))}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Recording Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2 mb-4">
              <Video className="h-5 w-5" />
              <span>Recording & Transcription</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recordingEnabled"
                  checked={settings.recordingEnabled}
                  onChange={(e) => handleInputChange('recordingEnabled', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="recordingEnabled" className="text-sm font-medium text-gray-700">
                  Enable session recording
                </label>
              </div>
              
              {settings.recordingEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recording Type
                    </label>
                    <select
                      value={settings.recordingType}
                      onChange={(e) => handleInputChange('recordingType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="both">Video + Audio</option>
                      <option value="video">Video Only</option>
                      <option value="audio">Audio Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="transcriptionEnabled"
                      checked={settings.transcriptionEnabled}
                      onChange={(e) => handleInputChange('transcriptionEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="transcriptionEnabled" className="text-sm font-medium text-gray-700">
                      Enable automatic transcription
                    </label>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Interview Guide */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2 mb-4">
              <Mic className="h-5 w-5" />
              <span>Interview Guide</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pre-interview Instructions
                </label>
                <textarea
                  value={settings.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Instructions for participants before the interview starts..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Questions/Topics
                </label>
                {settings.interviewGuide.map((question, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={question}
                      onChange={(e) => handleArrayChange('interviewGuide', index, e.target.value)}
                      placeholder="e.g., Tell me about your experience with our checkout process"
                      className="flex-1"
                    />
                    {settings.interviewGuide.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('interviewGuide', index)}
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem('interviewGuide')}
                  className="text-blue-600"
                >
                  + Add Question/Topic
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewBuilderPage;
