import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppStore, TaskInput } from '../../stores/appStore';
import { 
  BlockType, 
  StudyTemplate,
  ITask
} from '../../../shared/types';

// Import new extracted components
import { StudyMetadataForm, StudyFormData } from '../../components/studies/StudyMetadataForm';
import { StudyBlocksManager, StudyBuilderBlock } from '../../components/studies/StudyBlocksManager';

// Local interface for study builder blocks (simpler than the full StudyBlock union)
interface ValidationError {
  field: string;
  message: string;
}
import { 
  validateBlocks
} from '../../utils/validation';
import { 
  getBlockDisplayName,
  getDefaultBlockDescription,
  getDefaultBlockSettings
} from '../../utils/blockUtils';
import { CollaborationHeader } from '../../components/collaboration/CollaborationHeader';
import { CollaborationSidebar } from '../../components/collaboration/CollaborationSidebar';
import { MobileOptimizedStudyBuilder } from '../../components/studies/MobileOptimizedStudyBuilder';

// UsabilityStudyFormData type definition for type safety
interface UsabilityStudyFormData {
  title: string;
  description: string;
  deviceRequirements: string[];
  sessionType: 'moderated' | 'unmoderated';
  schedulingDetails?: {
    duration: number;
    timezone: string;
    dates: string[];
    times: string[];
    zoomDetails?: {
      meetingId?: string;
      password?: string;
      joinUrl?: string;
    };
    instructionsForParticipants?: string;
  };
  targetCountry: string;
  targetCity?: string;
  professionalCharacteristics: string[];
  participantRequirements: string[];
  screeningQuestions: Array<{
    question: string;
    type: 'multiple_choice' | 'yes_no' | 'text';
    options?: string[];
    required: boolean;
  }>;
  blocks: Record<string, unknown>[];
}

// Convert blocks to tasks for API compatibility
const convertBlocksToTaskInput = (blocks: StudyBuilderBlock[]): TaskInput[] => {
  return blocks.map(block => ({
    title: block.name,
    description: block.description,
    type: block.type === 'welcome' ? 'prototype' : 
          block.type === 'open_question' ? 'questionnaire' :
          block.type === 'multiple_choice' ? 'interaction' : 'navigation',
    order: block.order_index,
    settings: block.settings
  }));
};

// Convert tasks to blocks
const convertTasksToBlocks = (tasks: ITask[]): StudyBuilderBlock[] => {
  return tasks.map((task, index) => ({
    id: task._id || `block_${index}`,
    template_id: task.type,
    name: task.title || 'Untitled Block',
    description: task.description || '',
    estimated_duration: 2,
    order_index: task.order || index,
    type: task.type === 'navigation' ? 'simple_input' : 
          task.type === 'interaction' ? 'multiple_choice' :
          task.type === 'questionnaire' ? 'open_question' : 'welcome' as BlockType,
    settings: (task.configuration as unknown as Record<string, unknown>) || {}
  }));
};

const StudyBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { createStudy, updateStudy } = useAppStore();
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studyBlocks, setStudyBlocks] = useState<StudyBuilderBlock[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showBlockEditModal, setShowBlockEditModal] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState<{
    index: number;
    block: StudyBuilderBlock;
  } | null>(null);
  const [validation, setValidation] = useState<ValidationError[]>([]);

  // Success state for showing success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdStudyId, setCreatedStudyId] = useState<string | null>(null);

  // Collaboration state
  const [showCollaborationSidebar, setShowCollaborationSidebar] = useState(false);

  // Get template data and study type from navigation state
  const templateData = location.state?.template as StudyTemplate | undefined;
  const studyType = location.state?.studyType as string | undefined;

  // Check URL parameters for study type
  const urlParams = new URLSearchParams(location.search);
  const urlStudyType = urlParams.get('type');

  // Determine if this should show the multi-step usability builder
  const isUsabilityStudy = studyType === 'usability' || 
    studyType === 'unmoderated' ||  // Add support for unmoderated studies from modal
    urlStudyType === 'usability' ||
    (!studyType && !urlStudyType && !templateData && !id); // Default for new studies without template or specific type

  // Multi-step builder state - Initialize to true for new usability studies
  const [showUsabilityBuilder, setShowUsabilityBuilder] = useState(() => {
    // Show usability builder immediately for new studies (with or without template)
    return !id && (isUsabilityStudy || templateData);
  });

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<StudyFormData>({
    mode: 'onChange',
    defaultValues: {
      title: templateData?.name || '',
      description: templateData?.description || '',
      type: 'usability_test',
      settings: {
        maxParticipants: 10,
        duration: 30,
        compensation: 25,
        recordScreen: true,
        recordAudio: false,
        recordWebcam: false,
        collectHeatmaps: true,
        trackClicks: true,
        trackScrolls: true
      }
    }
  });

  // Load study data if editing
  useEffect(() => {
    const loadStudyData = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/studies?id=${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.study) {
              const study = data.study;
              reset({
                title: study.title,
                description: study.description,
                type: study.type || 'usability_test',
                settings: study.settings || {
                  maxParticipants: 10,
                  duration: 30,
                  compensation: 25,
                  recordScreen: true,
                  recordAudio: false,
                  recordWebcam: false,
                  collectHeatmaps: true,
                  trackClicks: true,
                  trackScrolls: true
                }
              });

              // Convert tasks to blocks
              if (study.tasks && Array.isArray(study.tasks)) {
                const blocks = convertTasksToBlocks(study.tasks);
                setStudyBlocks(blocks);
              }
              setIsEditing(true);
            }
          }
        } catch (error) {
          console.error('Error loading study:', error);
        }
      }
    };

    loadStudyData();
  }, [id, reset]);

  // Initialize form with template data
  useEffect(() => {
    if (templateData && !id && !showUsabilityBuilder) {
      // Only initialize template data if not using UsabilityBuilder
      reset({
        title: templateData.name || '',
        description: templateData.description || '',
        type: studyType === 'usability' ? 'usability' : studyType === 'survey' ? 'survey' : 'usability',
        settings: {
          maxParticipants: 10,
          duration: 30,
          compensation: 25,
          recordScreen: true,
          recordAudio: false,
          recordWebcam: false,
          collectHeatmaps: true,
          trackClicks: true,
          trackScrolls: true
        }
      });
      
      // Convert template blocks to StudyBuilderBlocks
      if (templateData.blocks && Array.isArray(templateData.blocks)) {
        const convertedBlocks: StudyBuilderBlock[] = templateData.blocks.map((block, index) => ({
          id: block.id,
          template_id: block.type,
          name: `${getBlockDisplayName(block.type)} ${index + 1}`,
          description: getDefaultBlockDescription(block.type),
          estimated_duration: 2,
          order_index: index,
          type: block.type,
          settings: block.settings || getDefaultBlockSettings(block.type)
        }));
        
        // Add automatic "Thank you" block at the end
        const thankYouBlock: StudyBuilderBlock = {
          id: `block_${Date.now()}_thank_you`,
          template_id: 'thank_you',
          name: 'Thank You!',
          description: 'Thank you for participating in our study. Your feedback is valuable to us.',
          estimated_duration: 1,
          order_index: convertedBlocks.length,
          type: 'thank_you',
          settings: {
            message: 'Thank you for participating in our study. Your feedback is valuable to us.',
            showCompletionTime: true,
            redirectUrl: '',
            customMessage: ''
          }
        };
        
        setStudyBlocks([...convertedBlocks, thankYouBlock]);
      } else {
        // If no template blocks, just add the "Thank you" block
        const thankYouBlock: StudyBuilderBlock = {
          id: `block_${Date.now()}_thank_you`,
          template_id: 'thank_you',
          name: 'Thank You!',
          description: 'Thank you for participating in our study. Your feedback is valuable to us.',
          estimated_duration: 1,
          order_index: 0,
          type: 'thank_you',
          settings: {
            message: 'Thank you for participating in our study. Your feedback is valuable to us.',
            showCompletionTime: true,
            redirectUrl: '',
            customMessage: ''
          }
        };
        
        setStudyBlocks([thankYouBlock]);
      }
    }
  }, [templateData, studyType, id, reset, showUsabilityBuilder]);

  // Initialize study with "Thank You" block for "Start from Scratch" option
  useEffect(() => {
    if (!templateData && !id && studyBlocks.length === 0 && !showUsabilityBuilder) {
      // This means we're starting from scratch with regular builder, add default "Thank you" block
      const thankYouBlock: StudyBuilderBlock = {
        id: `block_${Date.now()}_thank_you`,
        template_id: 'thank_you',
        name: 'Thank You!',
        description: 'Thank you for participating in our study. Your feedback is valuable to us.',
        estimated_duration: 1,
        order_index: 0,
        type: 'thank_you',
        settings: {
          message: 'Thank you for participating in our study. Your feedback is valuable to us.',
          showCompletionTime: true,
          redirectUrl: '',
          customMessage: '',
          allowModification: true
        }
      };
      
      setStudyBlocks([thankYouBlock]);
    }
  }, [templateData, id, studyBlocks.length, showUsabilityBuilder]);

  // Usability Study Builder handlers
  const handleUsabilityBuilderComplete = useCallback((data: UsabilityStudyFormData) => {
    // Convert usability study data to regular study form data
    reset({
      title: data.title,
      description: data.description,
      type: 'usability',
      settings: {
        maxParticipants: 10,
        duration: data.schedulingDetails?.duration || 60,
        compensation: 25,
        recordScreen: true,
        recordAudio: data.sessionType === 'moderated',
        recordWebcam: data.sessionType === 'moderated',
        collectHeatmaps: true,
        trackClicks: true,
        trackScrolls: true
      }
    });

    // Create initial blocks based on the form data
    const blocks: StudyBuilderBlock[] = [];
    
    // Add welcome block
    blocks.push({
      id: `block_${Date.now()}_welcome`,
      template_id: 'welcome',
      name: 'Welcome Screen',
      description: 'Welcome participants to your study',
      estimated_duration: 1,
      order_index: 0,
      type: 'welcome',
      settings: { showContinueButton: true }
    });

    // Add screening questions if any
    if (data.screeningQuestions && data.screeningQuestions.length > 0) {
      data.screeningQuestions.forEach((question: UsabilityStudyFormData['screeningQuestions'][0], index: number) => {
        blocks.push({
          id: `block_${Date.now()}_screening_${index}`,
          template_id: 'screener',
          name: `Screening Question ${index + 1}`,
          description: question.question,
          estimated_duration: 2,
          order_index: blocks.length,
          type: 'screener',
          settings: {
            question: question.question,
            type: question.type,
            options: question.options || [],
            required: question.required
          }
        });
      });
    }

    // Add a default task block for usability studies
    blocks.push({
      id: `block_${Date.now()}_task`,
      template_id: 'prototype_test',
      name: 'Usability Task',
      description: 'Main usability testing task',
      estimated_duration: 10,
      order_index: blocks.length,
      type: 'prototype_test',
      settings: {
        prototypeUrl: '',
        tasks: [],
        recordInteractions: true
      }
    });

    // Add thank you block
    blocks.push({
      id: `block_${Date.now()}_thank_you`,
      template_id: 'thank_you',
      name: 'Thank You!',
      description: 'Thank you for participating in our study. Your feedback is valuable to us.',
      estimated_duration: 1,
      order_index: blocks.length,
      type: 'thank_you',
      settings: {
        message: 'Thank you for participating in our study. Your feedback is valuable to us.',
        showCompletionTime: true,
        redirectUrl: '',
        customMessage: ''
      }
    });

    setStudyBlocks(blocks);
    setShowUsabilityBuilder(false);
  }, [reset]);

  const handleUsabilityBuilderCancel = useCallback(() => {
    setShowUsabilityBuilder(false);
    // If we cancelled and have no existing study, redirect back to studies page
    if (!id) {
      navigate('/studies');
    }
  }, [id, navigate]);

  // Study submission
  const onSubmit = async (data: StudyFormData) => {
    try {
      setIsSubmitting(true);

      // Validate blocks
      const blockValidation = validateBlocks(studyBlocks);
      if (blockValidation.length > 0) {
        setValidation(blockValidation);
        return;
      }

      // Convert blocks to tasks for API compatibility
      const tasksData = convertBlocksToTaskInput(studyBlocks);

      if (isEditing && id) {
        const updateData = {
          ...data,
          description: data.description || '',
          // updateStudy expects IStudy format, which might handle tasks differently
          tasks: tasksData.map(task => task.title), // Convert to string array for IStudy
          type: data.type as 'usability' | 'survey' | 'interview' | 'card-sorting' | 'a-b-testing'
        };
        await updateStudy(id, updateData);
        
        // Show success message for updates
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } else {
        const createData = {
          ...data,
          description: data.description || '',
          tasks: tasksData,
          status: 'draft' as const,
          type: data.type === 'card-sorting' ? 'prototype' : 
                data.type === 'a-b-testing' ? 'prototype' : 
                (data.type as 'usability' | 'survey' | 'interview' | 'prototype')
        };
        const newStudy = await createStudy(createData);
        
        // Show success message and stay on page
        setCreatedStudyId(newStudy._id);
        setIsEditing(true);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        
        // Update URL to show we're now editing this study
        window.history.replaceState(null, '', `/app/studies/edit/${newStudy._id}`);
      }
    } catch (error) {
      console.error('Error saving study:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show Mobile-Optimized Builder for new usability studies */}
        {showUsabilityBuilder && !id ? (
          <MobileOptimizedStudyBuilder
            onComplete={handleUsabilityBuilderComplete}
            onCancel={handleUsabilityBuilderCancel}
            initialData={templateData ? {
              title: templateData.name || '',
              description: templateData.description || '',
              sessionType: 'unmoderated',
              studyType: 'usability',
              deviceRequirements: [],
              estimatedDuration: 30,
              targetAudience: {
                countries: [],
                ageRange: { min: 18, max: 65 },
                languages: ['English'],
                professions: [],
                experience: [],
                deviceOwnership: []
              },
              recruitmentSettings: {
                maxParticipants: 10,
                compensation: { type: 'none' },
                approvalProcess: 'automatic'
              },
              screeningQuestions: [],
              studyBlocks: [],
              metadata: {
                industry: '',
                researchGoals: [],
                successMetrics: [],
                stakeholders: [],
                timeline: {
                  recruitmentDeadline: '',
                  studyStartDate: '',
                  studyEndDate: '',
                  resultsDeadline: ''
                }
              }
            } : undefined}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
              {/* Header */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {isEditing ? 'Edit Study' : 'Create New Study'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Set up your research study with custom blocks
                    </p>
                  </div>
                  
                  {/* Toggle to Usability Builder for new studies */}
                  {!id && isUsabilityStudy && (
                    <button
                      type="button"
                      onClick={() => setShowUsabilityBuilder(true)}
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-200"
                    >
                      Switch to Guided Setup
                    </button>
                  )}
                </div>
              </div>

              {/* Collaboration Header */}
              <CollaborationHeader
                entityType="study"
                entityId={id || 'new-study'}
                entityTitle={watch('title') || 'New Study'}
                workspaceId="workspace-1"
                onShowComments={() => setShowCollaborationSidebar(true)}
                onShowActivity={() => setShowCollaborationSidebar(true)}
              />

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {createdStudyId ? 'Study created successfully!' : 'Study updated successfully!'}
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        {createdStudyId 
                          ? 'Your study has been created and saved as a draft. You can continue editing or publish it when ready.'
                          : 'Your changes have been saved successfully.'
                        }
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => navigate('/studies')}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200"
                        >
                          View All Studies
                        </button>
                        {createdStudyId && (
                          <>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await updateStudy(createdStudyId, { 
                                    status: 'active',
                                    visibility: 'public' 
                                  });
                                  alert('Ready to go!\n\nLooking good! Is it time to put this in front of testers and start collecting insights?');
                                  setShowSuccessMessage(false);
                                } catch (error) {
                                  console.error('Failed to publish study:', error);
                                  alert('Failed to publish study. Please try again.');
                                }
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700"
                            >
                              Start Testing
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowSuccessMessage(false)}
                              className="bg-white text-green-800 px-3 py-1 rounded-md text-sm font-medium border border-green-200 hover:bg-green-50"
                            >
                              Continue Editing
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Study Information Form */}
            <StudyMetadataForm
              register={register}
              errors={errors}
              watch={watch}
              isSubmitting={isSubmitting}
            />

            {/* Study Blocks Section */}
            <StudyBlocksManager
              studyBlocks={studyBlocks}
              setStudyBlocks={setStudyBlocks}
              showBlockLibrary={showBlockLibrary}
              setShowBlockLibrary={setShowBlockLibrary}
              showBlockEditModal={showBlockEditModal}
              setShowBlockEditModal={setShowBlockEditModal}
              blockToEdit={blockToEdit}
              setBlockToEdit={setBlockToEdit}
              isSubmitting={isSubmitting}
              studyType="usability_test"
            />

            {/* Validation Errors */}
            {validation.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validation.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/studies')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Study' : 'Create Study')}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>

      {/* Collaboration Sidebar */}
      <CollaborationSidebar
        studyTitle={watch('title') || 'New Study'}
        isOpen={showCollaborationSidebar}
        onToggle={() => setShowCollaborationSidebar(!showCollaborationSidebar)}
      />
    </div>
  );
};

export default StudyBuilderPage;