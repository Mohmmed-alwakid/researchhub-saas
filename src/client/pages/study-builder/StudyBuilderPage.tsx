import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StudyCreationWizard } from '../../components/study-builder/StudyCreationWizard';
import { studiesService } from '../../services/studies.service';
import { StudyFormData } from '../../components/study-builder/types';

export const StudyBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<Partial<StudyFormData> | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      const loadStudyData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log('Loading study data for editing:', id);
          const response = await studiesService.getStudies();
          
          if (response.studies) {
            // Find the specific study by ID
            const study = response.studies.find(s => s._id === id);
            
            if (study) {
              // Convert study data to StudyFormData format
              const studyFormData: Partial<StudyFormData> = {
                title: study.title || '',
                description: study.description || '',
                type: study.type === 'usability' || study.type === 'interview' ? study.type : 'usability',
                target_participants: study.settings?.maxParticipants || 15,
                duration: study.settings?.duration || 30,
                // Note: blocks, research_objectives, and instructions may not be in IStudy
                // They might be part of configuration or need to be fetched separately
                blocks: [],
                research_objectives: [],
                instructions: '',
              };
              
              console.log('Loaded study data for editing:', studyFormData);
              setInitialData(studyFormData);
            } else {
              setError('Study not found');
            }
          } else {
            setError('Failed to load study data');
          }
        } catch (err) {
          console.error('Error loading study for editing:', err);
          setError('Failed to load study data');
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
      <StudyCreationWizard 
        isEditMode={isEditMode}
        studyId={id}
        initialData={initialData}
      />
    </div>
  );
};

export default StudyBuilderPage;
