import React, { useState } from 'react';
import { StepProps } from '../types';
import { StudyPreviewModal } from '../StudyPreviewModal';
import { SaveAsTemplateModal } from '../SaveAsTemplateModal';
import { CheckCircle, AlertCircle, Edit2, Eye, BookOpen, Users, Clock, HelpCircle, Monitor, Rocket } from 'lucide-react';

export const ReviewStep: React.FC<StepProps> = ({
  formData
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Study validation and readiness checks
  const getStudyReadiness = () => {
    const checks = [
      {
        id: 'title',
        label: 'Study title provided',
        isComplete: !!formData.title?.trim(),
        severity: 'error' as const
      },
      {
        id: 'description',
        label: 'Study description provided',
        isComplete: !!formData.description?.trim(),
        severity: 'error' as const
      },
      {
        id: 'participants',
        label: 'Target participants set',
        isComplete: !!formData.target_participants && formData.target_participants > 0,
        severity: 'error' as const
      },
      {
        id: 'blocks',
        label: 'Study blocks configured',
        isComplete: !!formData.blocks && formData.blocks.length >= 2,
        severity: 'error' as const
      },
      {
        id: 'welcome_block',
        label: 'Welcome block included',
        isComplete: !!formData.blocks?.some(block => block.type === 'welcome_screen'),
        severity: 'warning' as const
      },
      {
        id: 'thank_you_block',
        label: 'Thank you block included',
        isComplete: !!formData.blocks?.some(block => block.type === 'thank_you_screen'),
        severity: 'warning' as const
      }
    ];

    const errors = checks.filter(check => check.severity === 'error' && !check.isComplete);
    const warnings = checks.filter(check => check.severity === 'warning' && !check.isComplete);
    const isReady = errors.length === 0;

    return { checks, errors, warnings, isReady };
  };

  const { errors, warnings, isReady } = getStudyReadiness();

  // Get screening questions count
  const screeningQuestionsCount = formData.usability_config?.screening_questions?.length || 0;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Review & Launch Your Study
        </h2>
        <p className="text-lg text-gray-600">
          Final check before going live with participants. Once launched, your study will be immediately available.
        </p>
      </div>

      {/* Study Readiness Status */}
      <div className={`rounded-xl border-2 p-6 ${isReady 
        ? 'bg-green-50 border-green-200' 
        : errors.length > 0 
          ? 'bg-red-50 border-red-200' 
          : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isReady ? 'bg-green-100' : errors.length > 0 ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {isReady ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className={`w-6 h-6 ${errors.length > 0 ? 'text-red-600' : 'text-yellow-600'}`} />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${
              isReady ? 'text-green-900' : errors.length > 0 ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {isReady ? 'Study Ready to Launch! 🚀' : errors.length > 0 ? 'Issues Need Attention' : 'Minor Issues Found'}
            </h3>
            
            <p className={`text-sm ${
              isReady ? 'text-green-700' : errors.length > 0 ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {isReady 
                ? 'All requirements met. Your study is ready for participants.'
                : errors.length > 0 
                  ? `${errors.length} critical issue${errors.length > 1 ? 's' : ''} must be fixed before launch.`
                  : `${warnings.length} recommended improvement${warnings.length > 1 ? 's' : ''} found.`
              }
            </p>

            {/* Error List */}
            {errors.length > 0 && (
              <ul className="mt-3 space-y-1">
                {errors.map(error => (
                  <li key={error.id} className="flex items-center space-x-2 text-red-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span>{error.label}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Warning List */}
            {warnings.length > 0 && errors.length === 0 && (
              <ul className="mt-3 space-y-1">
                {warnings.map(warning => (
                  <li key={warning.id} className="flex items-center space-x-2 text-yellow-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>{warning.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Study Details - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Study Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-blue-600" />
                  Study Overview
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Study Title</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.title || <span className="text-red-500 italic">Missing title</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Study Type</label>
                  <div className="text-gray-900 flex items-center">
                    <Monitor className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="capitalize">{formData.type?.replace(/_/g, ' ') || 'Not specified'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Target Participants</label>
                  <div className="text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formData.target_participants || 0} participants</span>
                  </div>
                </div>

                {formData.duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Duration</label>
                    <div className="text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatDuration(formData.duration)}</span>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <div className="text-gray-900 text-sm p-3 bg-gray-50 rounded-lg">
                    {formData.description || <span className="text-red-500 italic">No description provided</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Flow */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Study Flow <span className="text-sm font-normal text-gray-500">({formData.blocks?.length || 0} blocks)</span>
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {formData.blocks && formData.blocks.length > 0 ? (
                <div className="space-y-3">
                  {formData.blocks.map((block, index) => (
                    <div key={block.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{block.title}</div>
                        <div className="text-sm text-gray-500">{block.description}</div>
                      </div>
                      <div className="text-xs text-gray-600 capitalize bg-white px-3 py-1 rounded-full border font-medium">
                        {block.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-red-600 font-semibold text-lg">No blocks configured</p>
                  <p className="text-sm mt-1">Add blocks to create your study flow</p>
                </div>
              )}
            </div>
          </div>

          {/* Screening Questions */}
          {screeningQuestionsCount > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-3 text-blue-600" />
                  Screening Questions
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-900 font-semibold">{screeningQuestionsCount} screening questions configured</p>
                      <p className="text-blue-700 text-sm mt-1">Participants will answer these before joining the study</p>
                    </div>
                    <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats & Actions - Right Column */}
        <div className="space-y-6">
          
          {/* Study Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Study Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Blocks</span>
                  <span className="text-blue-900 font-bold text-2xl">{formData.blocks?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Participants</span>
                  <span className="text-blue-900 font-bold text-2xl">{formData.target_participants || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Est. Duration</span>
                  <span className="text-blue-900 font-bold text-2xl">{Math.max(5, (formData.blocks?.length || 0) * 2)}m</span>
                </div>
                {screeningQuestionsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 font-medium">Screening Q's</span>
                    <span className="text-blue-900 font-bold text-2xl">{screeningQuestionsCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full px-4 py-3 text-left text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 group"
                >
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <div>
                    <div className="font-semibold">Preview Study</div>
                    <div className="text-sm text-gray-500">See participant experience</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowSaveTemplate(true)}
                  className="w-full px-4 py-3 text-left text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 group"
                >
                  <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <div>
                    <div className="font-semibold">Save as Template</div>
                    <div className="text-sm text-gray-500">Reuse this study design</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Launch Ready Status */}
          {isReady && (
            <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-2">Ready to Launch!</h3>
                <p className="text-sm text-green-700 mb-4">
                  Your study meets all requirements and is ready for participants.
                  Use the "Launch" button in the header above to publish your study.
                </p>
                
                <div className="bg-green-100 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-green-900 text-sm mb-2">
                    <span className="inline-flex items-center">
                      <Rocket className="w-4 h-4 mr-2" />
                      Ready to Launch
                    </span>
                  </h4>
                  <ul className="space-y-2 text-green-800 text-sm">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      <span>Click "Launch" in the header to publish your study</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      <span>Study will be immediately available to participants</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      <span>Real-time results tracking and data collection</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      
      <StudyPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        studyTitle={formData.title || 'Untitled Study'}
        studyDescription={formData.description || 'No description'}
        blocks={formData.blocks || []}
        onConfirm={() => setShowPreview(false)}
      />

      <SaveAsTemplateModal
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        studyData={{
          title: formData.title || 'Untitled Study',
          description: formData.description || 'No description',
          type: formData.type || 'usability_test',
          blocks: formData.blocks || []
        }}
        onSave={(templateId: string) => {
          console.log('Template saved with ID:', templateId);
          setShowSaveTemplate(false);
        }}
      />
    </div>
  );
};
