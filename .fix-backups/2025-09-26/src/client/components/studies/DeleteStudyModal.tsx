import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { IStudy } from '../../../shared/types';

interface DeleteStudyModalProps {
  isOpen: boolean;
  study: IStudy | null;
  onClose: () => void;
  onConfirm: (studyId: string) => Promise<void>;
  isDeleting?: boolean;
}

const DeleteStudyModal: React.FC<DeleteStudyModalProps> = ({
  isOpen,
  study,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !study) return null;

  const requiredText = study.title;
  const isConfirmationValid = confirmationText === requiredText;

  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      setError('Study title must match exactly');
      return;
    }

    try {
      setError(null);
      await onConfirm(String(study.id || study._id));
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete study');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && isConfirmationValid && !isDeleting) {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Study</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isDeleting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">
                    You are about to permanently delete this study:
                  </p>
                  <p className="text-red-700 font-semibold">"{study.title}"</p>
                </div>
              </div>
            </div>

            {/* Study Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  study.status === 'active' ? 'text-green-600' :
                  study.status === 'draft' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {study.status?.charAt(0).toUpperCase() + study.status?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">
                  {study.type?.charAt(0).toUpperCase() + study.type?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">
                  {new Date(study.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Type the study title to confirm deletion:
              </label>
              <div className="space-y-1">
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={`Type "${requiredText}" to confirm`}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    error ? 'border-red-300 focus:ring-red-500' :
                    isConfirmationValid ? 'border-green-300 focus:ring-green-500' :
                    'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isDeleting}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                {confirmationText && !isConfirmationValid && !error && (
                  <p className="text-sm text-gray-500">
                    Type the exact study title to enable deletion
                  </p>
                )}
              </div>
            </div>

            {/* Consequences List */}
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Study configuration and blocks</li>
                <li>All participant responses and data</li>
                <li>Study analytics and results</li>
                <li>File uploads and attachments</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isConfirmationValid || isDeleting}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                isConfirmationValid && !isDeleting
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Study</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteStudyModal;