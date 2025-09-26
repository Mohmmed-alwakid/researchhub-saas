import React, { useState, useEffect } from 'react';
import { studiesService } from '../../services/studies.service';

type StudyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

interface StudyStateManagerProps {
  studyId: string;
  currentStatus: StudyStatus;
  onStatusChange?: (newStatus: StudyStatus) => void;
  children: React.ReactNode;
}

interface EditPermission {
  canEdit: boolean;
  reason?: string;
  requiresConfirmation?: boolean;
}

export const StudyStateManager: React.FC<StudyStateManagerProps> = ({
  studyId,
  currentStatus,
  onStatusChange,
  children
}) => {
  const [editPermission, setEditPermission] = useState<EditPermission>({ canEdit: false });
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Check edit permissions when component mounts or status changes
  useEffect(() => {
    const checkEditPermission = async () => {
      setIsCheckingPermission(true);
      try {
        const result = await studiesService.canEditStudy(studyId);
        setEditPermission({
          canEdit: result.canEdit,
          reason: result.reason,
          requiresConfirmation: result.reason !== undefined && result.canEdit
        });

        // Show warning if there's a reason but editing is allowed
        if (result.canEdit && result.reason) {
          setWarningMessage(result.reason);
          setShowWarning(true);
        }
      } catch (error) {
        console.error('Failed to check edit permission:', error);
        setEditPermission({ 
          canEdit: false, 
          reason: 'Failed to verify edit permissions' 
        });
      } finally {
        setIsCheckingPermission(false);
      }
    };

    if (studyId) {
      checkEditPermission();
    }
  }, [studyId, currentStatus]);

  // Validate state transitions
  const validateTransition = async (newStatus: StudyStatus): Promise<boolean> => {
    try {
      const result = await studiesService.validateStateTransition(studyId, newStatus);
      if (!result.valid) {
        alert(`Cannot change status: ${result.reason}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to validate state transition:', error);
      alert('Failed to validate state change');
      return false;
    }
  };

  // Handle status change with validation
  const handleStatusChange = async (newStatus: StudyStatus) => {
    const isValid = await validateTransition(newStatus);
    if (isValid && onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // Show loading state while checking permissions
  if (isCheckingPermission) {
    return (
      <div className="study-state-manager">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Checking edit permissions...</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Show edit restriction message if editing is not allowed
  if (!editPermission.canEdit) {
    return (
      <div className="study-state-manager">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Editing Restricted</h3>
              <p className="text-red-700 text-sm mt-1">
                {editPermission.reason || 'This study cannot be edited in its current state.'}
              </p>
            </div>
          </div>
        </div>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="study-state-manager">
      {/* Warning banner for risky edits */}
      {showWarning && warningMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-600 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-800 font-medium">Edit with Caution</h3>
              <p className="text-yellow-700 text-sm mt-1">{warningMessage}</p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Study status indicator */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600">Study Status:</span>
            <StatusBadge status={currentStatus} />
          </div>
          <div className="flex space-x-2">
            <StatusTransitionButtons 
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      {children}
    </div>
  );
};

// Status badge component
const StatusBadge: React.FC<{ status: StudyStatus }> = ({ status }) => {
  const statusConfig: Record<StudyStatus, { color: string; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
    completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
    archived: { color: 'bg-purple-100 text-purple-800', label: 'Archived' }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Status transition buttons component
const StatusTransitionButtons: React.FC<{
  currentStatus: StudyStatus;
  onStatusChange: (status: StudyStatus) => void;
}> = ({ currentStatus, onStatusChange }) => {
  const getAvailableTransitions = (status: StudyStatus): Array<{ status: StudyStatus; label: string; variant: 'primary' | 'secondary' | 'danger' }> => {
    switch (status) {
      case 'draft':
        return [
          { status: 'active', label: 'Launch Study', variant: 'primary' },
          { status: 'archived', label: 'Archive', variant: 'secondary' }
        ];
      case 'active':
        return [
          { status: 'paused', label: 'Pause', variant: 'secondary' },
          { status: 'completed', label: 'Complete', variant: 'primary' }
        ];
      case 'paused':
        return [
          { status: 'active', label: 'Resume', variant: 'primary' },
          { status: 'completed', label: 'Complete', variant: 'secondary' }
        ];
      case 'completed':
        return [
          { status: 'archived', label: 'Archive', variant: 'secondary' }
        ];
      case 'archived':
        return []; // No transitions from archived
      default:
        return [];
    }
  };

  const transitions = getAvailableTransitions(currentStatus);

  const getButtonClasses = (variant: 'primary' | 'secondary' | 'danger') => {
    const base = "px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200";
    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 text-white hover:bg-blue-700`;
      case 'secondary':
        return `${base} bg-gray-200 text-gray-800 hover:bg-gray-300`;
      case 'danger':
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      default:
        return base;
    }
  };

  if (transitions.length === 0) {
    return null;
  }

  return (
    <>
      {transitions.map((transition) => (
        <button
          key={transition.status}
          onClick={() => onStatusChange(transition.status)}
          className={getButtonClasses(transition.variant)}
        >
          {transition.label}
        </button>
      ))}
    </>
  );
};

export default StudyStateManager;
