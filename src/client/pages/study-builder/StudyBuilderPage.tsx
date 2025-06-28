import React from 'react';
import { StudyCreationWizard } from '../../components/study-builder/StudyCreationWizard';

export const StudyBuilderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudyCreationWizard />
    </div>
  );
};

export default StudyBuilderPage;
