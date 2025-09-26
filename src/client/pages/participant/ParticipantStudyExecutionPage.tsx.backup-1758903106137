import React from 'react';
import { useParams } from 'react-router-dom';
import StudyExecution from '../../components/participant/StudyExecution';
import { Card, CardContent } from '../../components/ui/Card';

const ParticipantStudyExecutionPage: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();

  if (!studyId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Study Not Found</h1>
            <p className="text-gray-600">
              The study you're looking for could not be found. Please check the URL and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudyExecution className="container mx-auto py-6" />
    </div>
  );
};

export default ParticipantStudyExecutionPage;
