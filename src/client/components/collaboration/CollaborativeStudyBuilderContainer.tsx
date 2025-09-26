import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Activity, Users, Eye, EyeOff } from 'lucide-react';

import { 
  IStudyComment, 
  CollaboratorPresence,
  EditingStatus,
  CollaborationActivity,
  StudyBuilderBlock
} from '../../../shared/types';
import { Button } from '../ui/Button';
import { CollaborationHeader } from './CollaborationHeader';
import { CollaborationIndicators } from './CollaborationIndicators';
import { commentsService } from '../../services/commentsService';
import { CommentSystem } from './CommentSystem';
import { EnhancedBlockPreview } from '../study-builder/blocks/EnhancedBlockPreview';
import { Tabs } from '../ui/Tabs';
import { useAuthStore } from '../../stores/authStore';
import ActivityFeed from './ActivityFeed';
import LiveCollaborationManager from './LiveCollaborationManager';

interface CollaborativeStudyBuilderContainerProps {
  studyId: string;
  studyTitle: string;
  children: React.ReactNode;
  className?: string;
  studyBlocks?: StudyBuilderBlock[];
  onBlocksChange?: (blocks: StudyBuilderBlock[]) => void;
}

export const CollaborativeStudyBuilderContainer: React.FC<CollaborativeStudyBuilderContainerProps> = ({
  studyId,
  studyTitle,
  children,
  className = '',
  studyBlocks = [],
  onBlocksChange
}) => {
  const { user } = useAuthStore();
  
  // Live Collaboration State (managed by LiveCollaborationManager)
  const [activeCollaborators, setActiveCollaborators] = useState<CollaboratorPresence[]>([]);
  const [editingStatus, setEditingStatus] = useState<EditingStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<CollaborationActivity[]>([]);
  
  // Advanced collaboration metrics
  const [collaborationMetrics, setCollaborationMetrics] = useState({
    activeEditingSessions: 0,
    totalCollaborationTime: 0,
    concurrentEditors: 0,
    lastSyncTime: new Date()
  });
  
  // Comments state
  const [comments, setComments] = useState<IStudyComment[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'team' | 'comments' | 'activity'>('team');
  const [showTeamPanel, setShowTeamPanel] = useState(true);
  const [showLiveCursors, setShowLiveCursors] = useState(true);
  
  // Conflicts state
  const [activeConflicts, setActiveConflicts] = useState<Array<{
    id: string;
    blockId: string;
    type: 'edit' | 'delete' | 'reorder';
    users: string[];
    timestamp: Date;
  }>>([]);

  // Live collaboration event handlers
  const handleCollaboratorsUpdate = useCallback((collaborators: CollaboratorPresence[]) => {
    setActiveCollaborators(collaborators);
    setCollaborationMetrics(prev => ({
      ...prev,
      concurrentEditors: collaborators.length,
      lastSyncTime: new Date()
    }));
  }, []);

  const handleEditingStatusUpdate = useCallback((editing: EditingStatus[]) => {
    setEditingStatus(editing);
    setCollaborationMetrics(prev => ({
      ...prev,
      activeEditingSessions: editing.length,
      lastSyncTime: new Date()
    }));
  }, []);

  const handleActivityUpdate = useCallback((activity: CollaborationActivity[]) => {
    setRecentActivity(activity);
  }, []);

  const handleConnectionUpdate = useCallback((connected: boolean) => {
    console.log('Collaboration connection status:', connected);
  }, []);

  // Advanced collaboration functions
  const handleCursorMovement = useCallback((x: number, y: number, element: string) => {
    // Cursor movement is now handled by LiveCollaborationManager
    console.log('Cursor moved:', { x, y, element });
  }, []);

  const handleCollaborativeEdit = useCallback((blockId: string, field: string, content: string) => {
    // Collaborative editing is now handled by LiveCollaborationManager
    console.log('Collaborative edit:', { blockId, field, content });
    
    // Update local blocks if needed
    if (onBlocksChange && studyBlocks) {
      const updatedBlocks = studyBlocks.map(block => 
        block.id === blockId 
          ? { ...block, [field]: content }
          : block
      );
      onBlocksChange(updatedBlocks);
    }
  }, [onBlocksChange, studyBlocks]);

  const handleConflictResolution = useCallback((blockId: string, conflictType: 'edit' | 'delete' | 'reorder') => {
    // Create a conflict resolution modal or UI
    setActiveConflicts(prev => [
      ...prev.filter(c => c.blockId !== blockId),
      {
        id: `conflict-${Date.now()}`,
        blockId,
        type: conflictType,
        users: activeCollaborators.map(c => c.name),
        timestamp: new Date()
      }
    ]);

    // Auto-resolve after 5 seconds for demo
    setTimeout(() => {
      setActiveConflicts(prev => prev.filter(c => c.blockId !== blockId));
    }, 5000);
  }, [activeCollaborators]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!user) return;
      
      try {
        const studyComments = await commentsService.getComments('study', studyId);
        // Extract just the comments array from the service response
        setComments(studyComments.comments || []);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };

    loadComments();
  }, [user, studyId]);

  // Update collaboration metrics
  useEffect(() => {
    const updateMetrics = () => {
      setCollaborationMetrics(prev => ({
        activeEditingSessions: editingStatus.length,
        totalCollaborationTime: prev.totalCollaborationTime + 1,
        concurrentEditors: activeCollaborators.length,
        lastSyncTime: new Date()
      }));
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [editingStatus.length, activeCollaborators.length]);

  return (
    <LiveCollaborationManager
      studyId={studyId}
      onCollaboratorsUpdate={handleCollaboratorsUpdate}
      onEditingStatusUpdate={handleEditingStatusUpdate}
      onActivityUpdate={handleActivityUpdate}
      onConnectionUpdate={handleConnectionUpdate}
    >
      <div className={`collaborative-study-builder-container ${className}`}>
        {/* Collaboration Header */}
        <CollaborationHeader
          entityType="study"
          entityId={studyId}
          entityTitle={studyTitle}
          onShowComments={() => setActiveTab('comments')}
          onShowActivity={() => setActiveTab('activity')}
        />

        {/* Live Collaboration Indicators */}
        <CollaborationIndicators
          activeCollaborators={activeCollaborators}
          editingStatus={editingStatus}
        />

        {/* Live Editing Status */}
        {editingStatus.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-800">
                {editingStatus.length} active editing session{editingStatus.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {editingStatus.map((editing) => {
                const collaborator = activeCollaborators.find(c => c.id === editing.collaboratorId);
                return (
                  <div key={`${editing.collaboratorId}-${editing.elementId}`} className="text-xs text-yellow-700">
                    {collaborator?.name || 'Unknown'} is editing {editing.elementType} "{editing.elementId}"
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collaboration Metrics */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">Live Collaboration</h3>
            <span className="text-xs text-green-600">
              Last sync: {collaborationMetrics.lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">{collaborationMetrics.concurrentEditors}</div>
              <div className="text-xs text-green-600">Active Editors</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">{collaborationMetrics.activeEditingSessions}</div>
              <div className="text-xs text-green-600">Edit Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">{Math.floor(collaborationMetrics.totalCollaborationTime / 60)}</div>
              <div className="text-xs text-green-600">Minutes</div>
            </div>
          </div>
        </div>

        {/* Conflict Resolution Alerts */}
        {activeConflicts.map((conflict) => (
          <div key={conflict.id} className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Editing Conflict Detected
                </h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Multiple editors working on block "{conflict.blockId}"
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConflictResolution(conflict.blockId, conflict.type)}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-200"
              >
                Resolve
              </Button>
            </div>
          </div>
        ))}

        {/* Enhanced Team Panel */}
        {showTeamPanel && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Team Collaboration</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTeamPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex space-x-4">
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'team' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setActiveTab('team')}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Team ({activeCollaborators.length})
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'comments' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setActiveTab('comments')}
                  >
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Comments ({comments.length})
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'activity' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setActiveTab('activity')}
                  >
                    <Activity className="w-4 h-4 inline mr-2" />
                    Activity ({recentActivity.length})
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === 'team' && (
                  <div className="space-y-4">
                    {/* Currently Editing Section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Editing</h4>
                      <div className="space-y-2">
                        {editingStatus.map((editing) => {
                          const collaborator = activeCollaborators.find(c => c.id === editing.collaboratorId);
                          return (
                            <div key={`${editing.collaboratorId}-${editing.elementId}`} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">
                                  {collaborator?.name || 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Editing {editing.elementType}: {editing.elementId}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {editingStatus.length === 0 && (
                          <p className="text-sm text-gray-500">No active editing sessions</p>
                        )}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members</h4>
                      <div className="space-y-2">
                        {activeCollaborators.map((collaborator) => (
                          <div key={collaborator.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <div className={`w-3 h-3 rounded-full ${
                              collaborator.status === 'active' ? 'bg-green-500' :
                              collaborator.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">{collaborator.name}</div>
                              <div className="text-xs text-gray-600">{collaborator.role}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {collaborator.lastActive.toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                        {activeCollaborators.length === 0 && (
                          <p className="text-sm text-gray-500">No team members online</p>
                        )}
                      </div>
                    </div>

                    {/* Advanced Tools */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Collaboration Tools</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowLiveCursors(!showLiveCursors)}
                          className="text-xs"
                        >
                          {showLiveCursors ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                          {showLiveCursors ? 'Hide' : 'Show'} Live Cursors
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCollaborativeEdit('demo-block', 'title', 'Updated Title')}
                          className="text-xs"
                        >
                          Apply Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConflictResolution('demo-block', 'edit')}
                          className="text-xs"
                        >
                          Demo Conflict Resolution
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCursorMovement(200, 300, 'demo-element')}
                          className="text-xs"
                        >
                          Track Users
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <CommentSystem
                    entityType="study"
                    entityId={studyId}
                    currentUser={{
                      id: user?.id || '1',
                      name: user?.email?.split('@')[0] || 'Current User',
                      avatar: '',
                      role: 'researcher'
                    }}
                    comments={comments}
                    teamMembers={activeCollaborators}
                    onAddComment={() => {}}
                    onUpdateComment={() => {}}
                    onDeleteComment={() => {}}
                    onAddReaction={() => {}}
                    onRemoveReaction={() => {}}
                  />
                )}

                {activeTab === 'activity' && (
                  <ActivityFeed
                    activities={recentActivity.map(activity => {
                      // Map CollaborationActivity type to local ActivityType
                      const mappedType: 'study_created' | 'study_updated' | 'study_approved' | 'study_rejected' | 'comment_added' | 'user_joined' | 'template_created' | 'block_added' | 'block_updated' | 'collaboration_started' = 
                        activity.type === 'block_edited' ? 'block_updated' :
                        activity.type === 'template_applied' ? 'template_created' :
                        activity.type === 'study_published' ? 'study_updated' :
                        activity.type === 'settings_changed' ? 'study_updated' :
                        'collaboration_started'; // Default fallback
                      
                      return {
                        id: activity.id,
                        type: mappedType,
                        user: {
                          id: activity.userId,
                          name: activity.userName || 'Unknown User',
                          email: '', // Default value
                          avatar: activity.userAvatar || '',
                          role: 'collaborator' as const
                        },
                        timestamp: activity.timestamp,
                        target: {
                          id: activity.entityId || studyId,
                          title: activity.entityName || studyTitle,
                          type: 'study' as const
                        },
                        metadata: activity.metadata ? {
                          previousValue: String(activity.metadata.oldValue || ''),
                          newValue: String(activity.metadata.newValue || ''),
                          blockType: activity.metadata.blockType,
                          comment: activity.metadata.location
                        } : undefined
                      };
                    })}
                    currentUser={{
                      id: user?.id || '1',
                      name: user?.email?.split('@')[0] || 'Current User',
                      email: user?.email || 'user@example.com',
                      avatar: '',
                      role: 'collaborator'
                    }}
                    isLoading={false}
                  />
                )}
              </div>
            </Tabs>
          </div>
        )}

        {/* Floating Team Toggle (when panel is hidden) */}
        {!showTeamPanel && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setShowTeamPanel(true)}
              className="rounded-full shadow-lg"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Team ({activeCollaborators.length})
            </Button>
          </div>
        )}

        {/* Enhanced Block Preview for Testing */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Enhanced Block Collaboration</h3>
          <EnhancedBlockPreview
            block={{
              id: 'demo-block',
              type: 'welcome',
              order: 0,
              title: 'Welcome Block',
              description: 'This is a demo block for testing collaboration features',
              settings: {}
            }}
            mode="edit"
          />
        </div>

        {/* Main Content */}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </LiveCollaborationManager>
  );
};

export default CollaborativeStudyBuilderContainer;
