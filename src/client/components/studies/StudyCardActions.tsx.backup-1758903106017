import React from 'react';
import { Edit, FileText, Copy, Trash2, Play, Pause, BarChart3 } from 'lucide-react';
import { IStudy } from '../../../shared/types';

interface StudyCardActionsProps {
  study: IStudy;
  onEdit: (study: IStudy) => void;
  onRename: (study: IStudy) => void;
  onDuplicate: (study: IStudy) => void;
  onDelete: (study: IStudy) => void;
  onLaunch?: (study: IStudy) => void;
  onPause?: (study: IStudy) => void;
  onViewResults?: (study: IStudy) => void;
}

const StudyCardActions: React.FC<StudyCardActionsProps> = ({
  study,
  onEdit,
  onRename,
  onDuplicate,
  onDelete,
  onLaunch,
  onPause,
  onViewResults
}) => {
  const canLaunch = study.status === 'draft' && onLaunch;
  const canPause = study.status === 'active' && onPause;
  const canViewResults = (study.status === 'active' || study.status === 'completed') && onViewResults;

  return (
    <div 
      className="flex items-center space-x-1" 
      onClick={(e) => e.stopPropagation()}
    >
      {/* Launch/Start Testing Action - Only for draft studies */}
      {canLaunch && (
        <button
          onClick={() => onLaunch(study)}
          className="p-2.5 text-gray-400 hover:text-green-600 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:scale-110 border border-transparent hover:border-green-200/50"
          title="Start Testing"
          data-testid="launch-study"
        >
          <Play className="w-4 h-4" />
          <span className="sr-only">Start Testing</span>
        </button>
      )}

      {/* Pause Action - Only for recruiting/active studies */}
      {canPause && (
        <button
          onClick={() => onPause(study)}
          className="p-2.5 text-gray-400 hover:text-yellow-600 rounded-xl hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 transition-all duration-200 hover:scale-110 border border-transparent hover:border-yellow-200/50"
          title="Pause Study"
        >
          <Pause className="w-4 h-4" />
        </button>
      )}

      {/* View Results Action - Only for active/completed studies */}
      {canViewResults && (
        <button
          onClick={() => onViewResults(study)}
          className="p-2.5 text-gray-400 hover:text-purple-600 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 transition-all duration-200 hover:scale-110 border border-transparent hover:border-purple-200/50"
          title="View Results"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      )}

      {/* Edit Action */}
      <button
        onClick={() => onEdit(study)}
        className="p-2.5 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 hover:scale-110 border border-transparent hover:border-indigo-200/50"
        title="Edit study"
      >
        <Edit className="w-4 h-4" />
      </button>

      {/* Rename Action */}
      <button
        onClick={() => onRename(study)}
        className="p-2.5 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 hover:scale-110 border border-transparent hover:border-blue-200/50"
        title="Rename study"
      >
        <FileText className="w-4 h-4" />
      </button>

      {/* Duplicate Action */}
      <button
        onClick={() => onDuplicate(study)}
        className="p-2.5 text-gray-400 hover:text-green-600 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:scale-110 border border-transparent hover:border-green-200/50"
        title="Duplicate study"
      >
        <Copy className="w-4 h-4" />
      </button>

      {/* Delete Action */}
      <button
        onClick={() => onDelete(study)}
        className="p-2.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 transition-all duration-200 hover:scale-110 border border-transparent hover:border-red-200/50"
        title="Delete study"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default StudyCardActions;
