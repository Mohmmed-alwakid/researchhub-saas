import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  IStudy,
  BaseBlock,
  CollaboratorPresence,
  EditingStatus,
  CollaborationActivity,
  IStudyComment,
  CollaborationChange,
  UserCursor,
  CollaborationLock
} from '../../../shared/types';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import CollaborationIndicators from './CollaborationIndicators';
import CommentSystem from './CommentSystem';

interface CollaborativeStudyBuilderProps {
  /** Study being edited */
  study: IStudy;
  /** Current user information */
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  /** Active collaborators */
  collaborators: CollaboratorPresence[];
  /** Current editing status */
  editingStatus: EditingStatus[];
  /** Real-time activity */
  activity: CollaborationActivity[];
  /** Comments on the study */
  comments: IStudyComment[];
  /** Live user cursors */
  cursors: UserCursor[];
  /** Current locks on sections */
  locks: CollaborationLock[];
  /** Whether real-time collaboration is enabled */
  realTimeEnabled?: boolean;
  /** Whether to show collaboration panel */
  showCollaborationPanel?: boolean;
  /** Callback when study is updated */
  onStudyUpdate: (updates: Partial<IStudy>) => void;
  /** Callback when block is added */
  onAddBlock: (block: Omit<BaseBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** Callback when block is updated */
  onUpdateBlock: (blockId: string, updates: Partial<BaseBlock>) => void;
  /** Callback when block is deleted */
  onDeleteBlock: (blockId: string) => void;
  /** Callback when block is reordered */
  onReorderBlocks: (fromIndex: number, toIndex: number) => void;
  /** Comment callbacks */
  onAddComment: (comment: Omit<IStudyComment, '_id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateComment: (commentId: string, updates: Partial<IStudyComment>) => void;
  onDeleteComment: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  /** Collaboration callbacks */
  onRequestLock: (resourceType: string, resourceId: string) => void;
  onReleaseLock: (lockId: string) => void;
  onCursorMove: (position: UserCursor['position']) => void;
  className?: string;
}

export const CollaborativeStudyBuilder: React.FC<CollaborativeStudyBuilderProps> = ({
  study,
  currentUser,
  collaborators = [],
  editingStatus = [],
  activity = [],
  comments = [],
  cursors = [],
  locks = [],
  realTimeEnabled = true,
  showCollaborationPanel = true,
  onStudyUpdate,
  onAddBlock,
  onReorderBlocks,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddReaction,
  onRemoveReaction,
  onRequestLock,
  onReleaseLock,
  onCursorMove,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<string>('blocks');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(study.title);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflicts] = useState<CollaborationChange[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BaseBlock | null>(null);
  const builderRef = useRef<HTMLDivElement>(null);

  // Get study blocks (assuming they exist in the study object)
  const blocks = (study as IStudy & { blocks?: BaseBlock[] }).blocks || [];

  // Real-time collaboration effects
  useEffect(() => {
    if (!realTimeEnabled) return;

    // Throttle function for performance
    const throttle = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      let lastExecTime = 0;
      return (...args: T) => {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
          func(...args);
          lastExecTime = currentTime;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func(...args);
            lastExecTime = Date.now();
          }, delay - (currentTime - lastExecTime));
        }
      };
    };

    // Handle mouse movement for cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (builderRef.current) {
        const rect = builderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Throttle cursor updates
        onCursorMove({
          x,
          y,
          blockId: selectedBlockId || undefined
        });
      }
    };

    const throttledMouseMove = throttle(handleMouseMove, 100);
    document.addEventListener('mousemove', throttledMouseMove);

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
    };
  }, [realTimeEnabled, selectedBlockId, onCursorMove]);

  // Check if a resource is locked
  const isLocked = useCallback((resourceType: string, resourceId: string) => {
    return locks.some(lock => 
      lock.type === resourceType && 
      lock.resourceId === resourceId &&
      lock.lockedBy !== currentUser.id
    );
  }, [locks, currentUser.id]);

  // Get who has locked a resource
  const getLocker = useCallback((resourceType: string, resourceId: string) => {
    const lock = locks.find(lock => 
      lock.type === resourceType && 
      lock.resourceId === resourceId
    );
    if (!lock) return null;
    
    return collaborators.find(c => c.id === lock.lockedBy);
  }, [locks, collaborators]);

  // Handle title editing
  const handleTitleEdit = () => {
    if (isLocked('settings', 'title')) return;
    
    onRequestLock('settings', 'title');
    setIsEditingTitle(true);
  };

  const saveTitleEdit = () => {
    if (editedTitle.trim() && editedTitle !== study.title) {
      onStudyUpdate({ title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
    onReleaseLock('title');
  };

  const cancelTitleEdit = () => {
    setEditedTitle(study.title);
    setIsEditingTitle(false);
    onReleaseLock('title');
  };

  // Handle block selection
  const handleBlockSelect = (blockId: string) => {
    if (isLocked('block', blockId)) return;
    
    setSelectedBlockId(blockId);
    setActiveSection('blocks');
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, block: BaseBlock) => {
    if (isLocked('block', block.id)) {
      e.preventDefault();
      return;
    }
    
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedBlock) return;
    
    const sourceIndex = blocks.findIndex((b: BaseBlock) => b.id === draggedBlock.id);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;
    
    onReorderBlocks(sourceIndex, targetIndex);
    setDraggedBlock(null);
  };

  // Render collaboration cursors
  const renderCursors = () => {
    return cursors
      .filter(cursor => cursor.userId !== currentUser.id)
      .map(cursor => {
        const collaborator = collaborators.find(c => c.id === cursor.userId);
        if (!collaborator || !cursor.position.x || !cursor.position.y) return null;
        
        return (
          <div
            key={cursor.userId}
            className="absolute pointer-events-none z-50"
            style={{
              left: cursor.position.x,
              top: cursor.position.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: getCollaboratorColor(collaborator.id) }}
              />
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {collaborator.name}
              </div>
            </div>
          </div>
        );
      });
  };

  // Get consistent color for collaborator
  const getCollaboratorColor = (userId: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const index = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Render block with collaboration indicators
  const renderBlock = (block: BaseBlock, index: number) => {
    const isSelected = selectedBlockId === block.id;
    const locked = isLocked('block', block.id);
    const locker = getLocker('block', block.id);
    const editing = editingStatus.find(e => e.elementId === block.id);
    
    return (
      <div
        key={block.id}
        className={`relative group border-2 rounded-lg p-4 transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        } ${locked ? 'opacity-60' : ''}`}
        draggable={!locked}
        onDragStart={(e) => handleDragStart(e, block)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        onClick={() => handleBlockSelect(block.id)}
      >
        {/* Collaboration indicators */}
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          {locked && locker && (
            <Badge variant="warning" size="sm">
              🔒 {locker.name}
            </Badge>
          )}
          {editing && (
            <Badge variant="info" size="sm">
              ✏️ Editing
            </Badge>
          )}
        </div>

        {/* Block content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {block.title}
            </h3>
            <Badge variant="secondary" size="sm">
              {block.type}
            </Badge>
          </div>
          
          {block.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {block.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Order: {block.order}</span>
            <span>{block.isRequired ? 'Required' : 'Optional'}</span>
          </div>
        </div>

        {/* Drag handle */}
        {!locked && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-6 bg-gray-400 rounded-full cursor-grab active:cursor-grabbing" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`collaborative-study-builder ${className}`} ref={builderRef}>
      <div className="flex h-full">
        {/* Main editing area */}
        <div className="flex-1 flex flex-col">
          {/* Header with collaboration indicators */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
                      autoFocus
                      onBlur={saveTitleEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitleEdit();
                        if (e.key === 'Escape') cancelTitleEdit();
                      }}
                    />
                    <Button onClick={saveTitleEdit} size="sm">
                      Save
                    </Button>
                    <Button onClick={cancelTitleEdit} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 
                      className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={handleTitleEdit}
                    >
                      {study.title}
                    </h1>
                    {isLocked('settings', 'title') && (
                      <Badge variant="warning" size="sm">
                        🔒 Title locked
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Collaboration indicators */}
              <div className="flex items-center space-x-4">
                <CollaborationIndicators
                  activeCollaborators={collaborators}
                  editingStatus={editingStatus}
                  recentActivity={activity.slice(0, 3)}
                  expanded={false}
                />
                
                {realTimeEnabled && (
                  <Badge variant="success" size="sm">
                    🟢 Live
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Study blocks */}
              {blocks.length > 0 ? (
                blocks.map((block: BaseBlock, index: number) => renderBlock(block, index))
              ) : (
                <Card className="p-8 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                    No blocks yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start building your study by adding your first block.
                  </p>
                  <Button 
                    onClick={() => onAddBlock({
                      type: 'welcome',
                      order: 0,
                      title: 'Welcome',
                      description: 'Welcome participants to your study',
                      isRequired: true,
                      settings: {},
                      conditionalLogic: [],
                      analytics: {
                        trackInteractions: true,
                        trackTiming: true,
                        trackDropoff: true
                      }
                    })}
                  >
                    Add Welcome Block
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Collaboration panel */}
        {showCollaborationPanel && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Panel tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'collaborators', label: 'Team', icon: '👥' },
                { id: 'comments', label: 'Comments', icon: '💬' },
                { id: 'activity', label: 'Activity', icon: '📊' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeSection === 'collaborators' && (
                <CollaborationIndicators
                  activeCollaborators={collaborators}
                  editingStatus={editingStatus}
                  recentActivity={activity.slice(0, 5)}
                  expanded={true}
                />
              )}

              {activeSection === 'comments' && (
                <CommentSystem
                  entityId={study._id}
                  entityType="study"
                  blockId={selectedBlockId || undefined}
                  currentUser={currentUser}
                  comments={comments}
                  teamMembers={collaborators}
                  onAddComment={onAddComment}
                  onUpdateComment={onUpdateComment}
                  onDeleteComment={onDeleteComment}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                />
              )}

              {activeSection === 'activity' && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
                  {activity.length > 0 ? (
                    <div className="space-y-2">
                      {activity.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.userName}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {item.action}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge variant="secondary" size="sm">
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No recent activity
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live cursors overlay */}
      {realTimeEnabled && renderCursors()}

      {/* Conflict resolution dialog */}
      {showConflictDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full m-4 p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
              Collaboration Conflict
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Another user has made changes to this section. How would you like to proceed?
            </p>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <strong>
                    {typeof conflict.userId === 'string' ? conflict.userId : conflict.userId._id}
                  </strong> changed {conflict.path}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowConflictDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowConflictDialog(false)}>
                Accept Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CollaborativeStudyBuilder;
