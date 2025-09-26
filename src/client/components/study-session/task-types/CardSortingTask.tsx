import React from 'react';
import type { IStudy, IParticipant } from '../../../../shared/types/index';


interface TaskProps {
  task: unknown;
  study: IStudy;
  session: IParticipant;
  onComplete: (responses: Record<string, unknown>) => void;
  isRecording: boolean;
}

export const CardSortingTask: React.FC<TaskProps> = ({ 
  onComplete 
}) => {
  return (
    <div className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Card Sorting Task
        </h3>
        <p className="text-gray-600 mb-6">
          This task type is not yet implemented. This is a placeholder for card sorting tasks.
        </p>
        <button
          onClick={() => onComplete({})}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Complete Task
        </button>
      </div>
    </div>
  );
};
