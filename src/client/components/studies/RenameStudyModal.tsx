import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Input } from '../ui';


interface RenameStudyModalProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onRename: (newTitle: string) => void;
  isLoading?: boolean;
}

const RenameStudyModal: React.FC<RenameStudyModalProps> = ({
  isOpen,
  currentTitle,
  onClose,
  onRename,
  isLoading = false
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && title.trim() !== currentTitle) {
      onRename(title.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rename Study</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="study-title" className="block text-sm font-medium text-gray-700 mb-2">
              Study Title
            </label>
            <Input
              id="study-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter study title..."
              disabled={isLoading}
              autoFocus
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !title.trim() || title.trim() === currentTitle}
              isLoading={isLoading}
            >
              Rename Study
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameStudyModal;
