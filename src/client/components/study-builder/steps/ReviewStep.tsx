import React, { useState } from 'react';
import { StepProps } from '../types';
import { StudyPreviewModal } from '../StudyPreviewModal';
import { SaveAsTemplateModal } from '../SaveAsTemplateModal';
import { CheckCircle, AlertCircle, Edit2, Eye, BookOpen, Users, Clock, HelpCircle, Monitor } from 'lucide-react';

export const ReviewStep: React.FC<StepProps> = ({
  formData,
  onNext,
  onPrevious
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Review & Launch Your Study
        </h2>
        <p className="text-lg text-gray-600">
          Final check before going live with participants. Once launched, your study will be immediately available.
        </p>
      </div>

      {/* Study Readiness Card */}
      <div className={`rounded-xl border p-6 mb-6 ${isReady 
        ? 'bg-green-50 border-green-200' 
        : errors.length > 0 
          ? 'bg-red-50 border-red-200' 
          : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
            isReady ? 'bg-green-100' : errors.length > 0 ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {isReady ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className={`w-4 h-4 ${errors.length > 0 ? 'text-red-600' : 'text-yellow-600'}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold mb-2 ${
              isReady ? 'text-green-900' : errors.length > 0 ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {isReady ? '✅ Study Ready to Launch' : errors.length > 0 ? '❌ Issues Found' : '⚠️ Minor Issues'}
            </h3>
            
            {errors.length > 0 && (
              <div className="mb-3">
                <p className="text-red-800 font-medium mb-2">Required items to fix:</p>
                <ul className="space-y-1">
                  {errors.map(error => (
                    <li key={error.id} className="flex items-center space-x-2 text-red-700">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <span className="text-sm">{error.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mb-3">
                <p className={`font-medium mb-2 ${errors.length > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                  Recommended improvements:
                </p>
                <ul className="space-y-1">
                  {warnings.map(warning => (
                    <li key={warning.id} className={`flex items-center space-x-2 ${errors.length > 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${errors.length > 0 ? 'bg-red-400' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm">{warning.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isReady && (
              <div className="mt-4">
                <p className="text-green-800 font-medium mb-3">
                  🎉 Great! Your study meets all requirements and is ready for participants.
                </p>
                <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">What happens after launch?</h4>
                  <ul className="space-y-2 text-green-800 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Your study will be immediately available to participants</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>You'll receive a unique link to share with participants</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Results will be collected in real-time and available in your dashboard</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>You can monitor progress and pause the study at any time</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Study Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Study Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Study Overview
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Study Title</label>
                <div className="text-gray-900 font-medium">
                  {formData.title || <span className="text-red-500 italic">Missing title</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Study Type</label>
                <div className="text-gray-900 capitalize flex items-center">
                  <Monitor className="w-4 h-4 mr-2 text-gray-400" />
                  {formData.type?.replace(/_/g, ' ') || 'Not specified'}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <div className="text-gray-900 text-sm">
                  {formData.description || <span className="text-red-500 italic">No description provided</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Target Participants</label>
                <div className="text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  {formData.target_participants || 0} participants
                </div>
              </div>

              {formData.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                  <div className="text-gray-900 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDuration(formData.duration)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Screening Questions */}
          {screeningQuestionsCount > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                Screening Questions
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-900 font-medium">{screeningQuestionsCount} screening questions configured</p>
                    <p className="text-blue-700 text-sm">Participants will answer these before joining the study</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Study Flow */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Study Flow ({formData.blocks?.length || 0} blocks)
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            {formData.blocks && formData.blocks.length > 0 ? (
              <div className="space-y-2">
                {formData.blocks.map((block, index) => (
                  <div key={block.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{block.title}</div>
                      <div className="text-xs text-gray-500">{block.description}</div>
                    </div>
                    <div className="text-xs text-gray-500 capitalize bg-white px-2 py-1 rounded border">
                      {block.type.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-red-600 font-medium">No blocks configured</p>
                <p className="text-sm">Add blocks to create your study flow</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Study Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 text-sm">Blocks</span>
                <span className="text-blue-900 font-bold text-xl">{formData.blocks?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 text-sm">Participants</span>
                <span className="text-blue-900 font-bold text-xl">{formData.target_participants || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 text-sm">Est. Duration</span>
                <span className="text-blue-900 font-bold text-xl">{Math.max(5, (formData.blocks?.length || 0) * 2)}m</span>
              </div>
              {screeningQuestionsCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 text-sm">Screening Q's</span>
                  <span className="text-blue-900 font-bold text-xl">{screeningQuestionsCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowPreview(true)}
                className="w-full px-4 py-3 text-left text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">Preview Study</div>
                  <div className="text-sm text-gray-500">See participant experience</div>
                </div>
              </button>
              
              <button
                onClick={() => setShowSaveTemplate(true)}
                className="w-full px-4 py-3 text-left text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">Save as Template</div>
                  <div className="text-sm text-gray-500">Reuse this study design</div>
                </div>
              </button>

              <div className="pt-3 border-t border-gray-200">
                <div className="space-y-2">
                  <button 
                    onClick={onPrevious}
                    className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous Step</span>
                  </button>
                  
                  {isReady ? (
                    <button
                      onClick={onNext}
                      className="w-full px-4 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-8.293l2-2a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L9 10.414l-1.293 1.293a1 1 0 01-1.414-1.414z" clipRule="evenodd"/>
                      </svg>
                      <span>🚀 Launch Study Now</span>
                    </button>
                  ) : (
                    <div className="w-full">
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <span>Fix Issues First</span>
                      </button>
                      <p className="text-xs text-red-600 text-center mt-1">
                        {errors.length} issue{errors.length !== 1 ? 's' : ''} to resolve
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
