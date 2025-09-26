import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studiesService } from '../../services/studies.service';
import { StudyCreationWizard } from '../../components/study-builder/StudyCreationWizard';
import { StudyFormData } from '../../components/study-builder/types';

import { StudyStateManager } from '../../components/study-builder/StudyStateManager';

// Define types locally
type StudyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

const StudyBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Partial<StudyFormData> | undefined>();
  const [currentStudy, setCurrentStudy] = useState<{ status: StudyStatus; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(id);

  // Handle study completion (create/launch)
  const handleStudyComplete = async (studyData: StudyFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode && id) {
        // Update existing study and launch it
        const updateResponse = await studiesService.updateStudy(id, {
          title: studyData.title || '',
          description: studyData.description || '',
          type: studyData.type || 'usability',
          settings: {
            recordScreen: studyData.include_audio || false, // Using available field
            recordAudio: studyData.include_audio || false,
            recordWebcam: false,
            trackClicks: true,
            trackHovers: true,
            trackScrolls: true
          }
        });

        if (updateResponse.success) {
          // Now launch the study
          const launchResponse = await studiesService.launchStudy(id);
          if (launchResponse.success) {
            alert('Study launched successfully!');
            navigate('/app/studies', { state: { fromStudyBuilder: true } });
          } else {
            throw new Error('Failed to launch study');
          }
        }
      } else {
        // Create new study
        const createResponse = await studiesService.createStudy({
          title: studyData.title || 'Untitled Study',
          description: studyData.description || '',
          type: studyData.type || 'usability',
          targetParticipants: studyData.target_participants || 15,
          duration: studyData.duration || 30,
          compensation: 0,
          requirements: [],
          tasks: [],
          settings: {
            recordScreen: studyData.include_audio || false, // Using available field
            recordAudio: studyData.include_audio || false,
            recordWebcam: false,
            trackClicks: true,
            trackHovers: true,
            trackScrolls: true
          }
        });

        if (createResponse.success) {
          alert('Study created successfully!');
          navigate('/app/studies', { state: { fromStudyBuilder: true } });
        } else {
          throw new Error('Failed to create study');
        }
      }
    } catch (error) {
      console.error('Error completing study:', error);
      setError('Failed to complete study. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle study status changes
  const handleStatusChange = async (newStatus: StudyStatus) => {
    if (!id || !currentStudy) return;

    try {
      let response;
      switch (newStatus) {
        case 'active':
          response = await studiesService.launchStudy(id);
          break;
        case 'paused':
          response = await studiesService.pauseStudy(id);
          break;
        case 'completed':
          response = await studiesService.completeStudy(id);
          break;
        case 'archived':
          response = await studiesService.archiveStudy(id);
          break;
        default:
          throw new Error(`Unsupported status transition: ${newStatus}`);
      }

      if (response.success) {
        setCurrentStudy(prev => prev ? { ...prev, status: newStatus } : null);
        
        // Show success message and navigate if archived
        const statusMessages = {
          active: 'Study launched successfully!',
          paused: 'Study paused successfully.',
          completed: 'Study completed successfully.',
          archived: 'Study archived successfully.'
        };
        
        alert(statusMessages[newStatus]);
        
        // Navigate to studies page if archived
        if (newStatus === 'archived') {
          navigate('/app/studies');
        }
      } else {
        throw new Error(response.message || 'Failed to update study status');
      }
    } catch (error) {
      console.error('Failed to change study status:', error);
      alert(`Failed to ${newStatus} study. Please try again.`);
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      const loadStudyData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log('🔄 Loading study data for editing (Study ID):', id);
          
          // Use the specific getStudy method instead of loading all studies
          const response = await studiesService.getStudy(id);
          
          if (response.success && response.study) {
            const study = response.study;
            console.log('📋 Raw study data loaded:', study);
            
            // Simplified data conversion - focus on core fields that exist in IStudy
            const studyFormData: Partial<StudyFormData> = {
              title: study.title || '',
              description: study.description || '',
              type: (study.type === 'usability' || study.type === 'interview') ? study.type : 'usability',
              target_participants: study.settings?.maxParticipants || study.configuration?.maxParticipants || 15,
              duration: study.settings?.duration || study.configuration?.duration || 30,
              include_audio: Boolean(study.configuration?.recordingOptions?.audio),
              
              // These fields may not exist yet in the database, set as empty for now
              blocks: [],
              research_objectives: [],
              instructions: '',
              template_id: undefined,
              
              // Set interview config if it's an interview study
              interview_session_config: study.type === 'interview' ? {
                type: 'live_interview',
                duration_minutes: study.configuration?.duration || 30,
                recording: {
                  enabled: Boolean(study.configuration?.recordingOptions?.audio || study.configuration?.recordingOptions?.screen),
                  audio: Boolean(study.configuration?.recordingOptions?.audio),
                  video: Boolean(study.configuration?.recordingOptions?.webcam),
                  screen_share: Boolean(study.configuration?.recordingOptions?.screen),
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
              } : undefined
            };
            
            console.log('✅ Converted study data for form:', studyFormData);
            setInitialData(studyFormData);
            
            // Store current study info for state management
            setCurrentStudy({
              status: study.status,
              title: study.title
            });
          } else {
            console.error('❌ Failed to load study - API response:', response);
            setError(response.message || 'Study not found');
          }
        } catch (err) {
          console.error('💥 Error loading study for editing:', err);
          setError('Failed to load study data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      loadStudyData();
    }
  }, [id, isEditMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isEditMode && currentStudy && id ? (
        <StudyStateManager
          studyId={id}
          currentStatus={currentStudy.status}
          onStatusChange={handleStatusChange}
        >
          <StudyCreationWizard 
            isEditMode={isEditMode}
            studyId={id}
            initialData={initialData}
            onComplete={handleStudyComplete}
          />
        </StudyStateManager>
      ) : (
        <StudyCreationWizard 
          isEditMode={isEditMode}
          studyId={id}
          initialData={initialData}
          onComplete={handleStudyComplete}
        />
      )}
    </div>
  );
};

export default StudyBuilderPage;
