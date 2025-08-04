import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { collaborationService } from '../../services/collaborationService';
import { commentsService } from '../../services/commentsService';
import { CollaborationHeader } from './CollaborationHeader';
import { CollaborationIndicators } from './CollaborationIndicators';
import { CommentSystem } from './CommentSystem';
import ActivityFeed from './ActivityFeed';
import { EnhancedBlockPreview } from '../study-builder/blocks/EnhancedBlockPreview';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { 
  IStudyComment, 
  CollaboratorPresence,
  EditingStatus,
  CollaborationActivity,
  WorkspaceRole,
  StudyBuilderBlock
} from '../../../shared/types';
import { ActivityType } from './types';
import { MessageCircle, Activity, Users, Eye, EyeOff } from 'lucide-react';

interface CollaborativeStudyBuilderContainerProps {
  studyId: string;
  studyTitle: string;
  workspaceId?: string;
  children: React.ReactNode;
  className?: string;
  studyBlocks?: StudyBuilderBlock[];
  onBlocksChange?: (blocks: StudyBuilderBlock[]) => void;
}

export const CollaborativeStudyBuilderContainer: React.FC<CollaborativeStudyBuilderContainerProps> = ({
  studyId,
  studyTitle,
  workspaceId = 'workspace-1',
  children,
  className = '',
  studyBlocks = [],
  onBlocksChange
}) => {
  const { user } = useAuthStore();
  
  // Collaboration state
  const [activeCollaborators, setActiveCollaborators] = useState<CollaboratorPresence[]>([]);
  const [editingStatus, setEditingStatus] = useState<EditingStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<CollaborationActivity[]>([]);
  const [isCollaborationConnected, setIsCollaborationConnected] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<IStudyComment[]>([]);
  
  // UI state
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [collaborationPanelTab, setCollaborationPanelTab] = useState<'comments' | 'activity' | 'team' | 'blocks'>('comments');
  
  // Enhanced Block System state
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blockEditMode, setBlockEditMode] = useState<'edit' | 'preview' | 'participant'>('edit');
  const [showBlockPreview, setShowBlockPreview] = useState(false);

  // Initialize collaboration
  useEffect(() => {
    const initializeCollaboration = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        // Initialize collaboration service
        await collaborationService.initialize(token);
        await collaborationService.joinSession('study', studyId, workspaceId);
        setIsCollaborationConnected(true);

        // Set up event listeners
        collaborationService.on('user_joined', handleUserJoined);
        collaborationService.on('user_left', handleUserLeft);
        collaborationService.on('presence_update', handlePresenceUpdate);
        collaborationService.on('editing_status_update', handleEditingStatusUpdate);
        collaborationService.on('activity_update', handleActivityUpdate);

        // Load initial comments
        await loadComments();

        // Set up mock data for demonstration
        initializeMockData();

      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
      }
    };

    const handleUserJoined = (data: unknown) => {
      const eventData = data as { 
        user?: { 
          id: string; 
          name: string; 
          email: string; 
          role?: string; 
          avatar?: string 
        }; 
        sessionId?: string 
      };
      if (eventData.user?.id !== user?.id) {
        setActiveCollaborators(prev => [
          ...prev.filter(c => c.id !== eventData.user?.id),
          {
            id: eventData.user?.id || 'unknown',
            name: eventData.user?.name || 'Unknown User',
            email: eventData.user?.email || '',
            avatar: eventData.user?.avatar || '',
            role: (eventData.user?.role as WorkspaceRole) || 'viewer',
            status: 'active' as const,
            lastActive: new Date(),
            currentLocation: {
              studyId: studyId
            },
            sessionId: eventData.sessionId || 'unknown'
          }
        ]);
      }
    };

    const handleUserLeft = (data: unknown) => {
      const eventData = data as { user?: { id: string } };
      setActiveCollaborators(prev => prev.filter(c => c.id !== eventData.user?.id));
    };

    const handlePresenceUpdate = (data: unknown) => {
      const eventData = data as { user?: { id: string }; status?: string; currentLocation?: { studyId?: string; section?: string } };
      setActiveCollaborators(prev => prev.map(c => 
        c.id === eventData.user?.id 
          ? { 
              ...c, 
              status: (eventData.status as 'active' | 'away' | 'idle') || c.status, 
              currentLocation: eventData.currentLocation || c.currentLocation, 
              lastActive: new Date()
            }
          : c
      ));
    };

    const handleEditingStatusUpdate = (data: unknown) => {
      const eventData = data as { collaboratorId: string; elementId: string; elementType: string; action: string };
      setEditingStatus(prev => {
        const filtered = prev.filter(e => e.collaboratorId !== eventData.collaboratorId || e.elementId !== eventData.elementId);
        if (eventData.action === 'start_editing') {
          return [...filtered, {
            collaboratorId: eventData.collaboratorId,
            elementType: (eventData.elementType as 'block' | 'setting') || 'block',
            elementId: eventData.elementId,
            action: 'editing' as const,
            startedAt: new Date(),
            lastUpdate: new Date()
          }];
        }
        return filtered;
      });
    };

    const handleActivityUpdate = (data: unknown) => {
      const activityData = data as CollaborationActivity;
      setRecentActivity(prev => [activityData, ...prev.slice(0, 19)]); // Keep last 20 activities
    };

    const initializeMockData = () => {
      setActiveCollaborators([
        {
          id: 'demo-user-1',
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          status: 'active',
          lastActive: new Date(),
          currentLocation: {
            studyId: studyId,
            section: 'block-editor'
          },
          sessionId: 'session-1'
        },
        {
          id: 'demo-user-2', 
          name: 'Mike Chen',
          email: 'mike@company.com',
          status: 'idle',
          lastActive: new Date(Date.now() - 300000),
          currentLocation: {
            studyId: studyId,
            section: 'study-settings'
          },
          sessionId: 'session-2'
        }
      ]);

      setEditingStatus([
        {
          collaboratorId: 'demo-user-1',
          elementType: 'block',
          elementId: 'block-welcome-1',
          action: 'editing',
          startedAt: new Date(),
          lastUpdate: new Date()
        }
      ]);

      setRecentActivity([
        {
          id: 'activity-1',
          type: 'block_added',
          userId: 'demo-user-1',
          userName: 'Sarah Johnson',
          action: 'Added a welcome screen block',
          timestamp: new Date(Date.now() - 120000),
          entityType: 'study',
          entityId: studyId,
          entityName: studyTitle,
          metadata: { blockType: 'welcome' },
          priority: 'medium',
          category: 'content'
        },
        {
          id: 'activity-2',
          type: 'settings_changed',
          userId: 'demo-user-2',
          userName: 'Mike Chen',
          action: 'Updated study title',
          timestamp: new Date(Date.now() - 300000),
          entityType: 'study',
          entityId: studyId,
          entityName: studyTitle,
          metadata: { changes: ['title'] },
          priority: 'low',
          category: 'content'
        }
      ]);

      setComments([
        {
          _id: 'comment-1',
          studyId: studyId,
          userId: 'demo-user-1',
          authorId: 'demo-user-1',
          parentId: undefined,
          content: 'Should we add a screening question before the welcome screen?',
          type: 'comment' as const,
          status: 'open' as const,
          mentions: [],
          reactions: [
            { userId: 'demo-user-2', emoji: '👍', addedAt: new Date() }
          ],
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000)
        }
      ]);
    };

    const loadComments = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          const result = await commentsService.getComments('study', studyId, token);
          setComments(result.comments || []);
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };

    initializeCollaboration();

    return () => {
      // Cleanup
      collaborationService.off('user_joined', handleUserJoined);
      collaborationService.off('user_left', handleUserLeft);
      collaborationService.off('presence_update', handlePresenceUpdate);
      collaborationService.off('editing_status_update', handleEditingStatusUpdate);
      collaborationService.off('activity_update', handleActivityUpdate);
      
      if (isCollaborationConnected) {
        collaborationService.leaveSession('study', studyId);
      }
    };
  }, [user, studyId, workspaceId, isCollaborationConnected, studyTitle]);

  const handleAddComment = async (commentData: Omit<IStudyComment, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const result = await commentsService.addComment(
          'study',
          studyId,
          commentData.content,
          workspaceId,
          commentData.parentId,
          commentData.mentions || [],
          commentData.metadata || {}
        );
        setComments(prev => [result, ...prev]);
        
        // Note: Broadcast activity would be handled if the method existed
        // collaborationService.broadcastActivity({...});
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: string, updates: Partial<IStudyComment>) => {
    if (!user || !updates.content) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const result = await commentsService.updateComment(
          commentId,
          updates.content,
          updates.mentions || []
        );
        setComments(prev => prev.map(c => 
          c._id === commentId ? result : c
        ));
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        await commentsService.deleteComment(commentId);
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleAddReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        await commentsService.addReaction(commentId, emoji);
        setComments(prev => prev.map(c => 
          c._id === commentId 
            ? { 
                ...c, 
                reactions: [
                  ...(c.reactions || []).filter(r => r.userId !== user.id || r.emoji !== emoji),
                  {
                    emoji: emoji,
                    userId: user.id,
                    userName: user.email || 'Unknown User',
                    addedAt: new Date()
                  }
                ]
              }
            : c
        ));
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        await commentsService.removeReaction(commentId, emoji);
        setComments(prev => prev.map(c => 
          c._id === commentId 
            ? { 
                ...c, 
                reactions: (c.reactions || []).filter(r => !(r.userId === user.id && r.emoji === emoji))
              }
            : c
        ));
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  // Panel tab management
  const collaborationTabs = [
    { id: 'comments', label: 'Comments', icon: MessageCircle, count: comments.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: recentActivity.length },
    { id: 'team', label: 'Team', icon: Users, count: activeCollaborators.length },
    { id: 'blocks', label: 'Blocks', icon: Eye, count: studyBlocks.length }
  ];

  // Enhanced Block Functions
  const handleBlockEdit = (blockId: string) => {
    setSelectedBlockId(blockId);
    setBlockEditMode('edit');
    setShowBlockPreview(true);
    setCollaborationPanelTab('blocks');
    setShowCollaborationPanel(true);
    
    // Note: Broadcast editing status would be handled by collaboration service
    // collaborationService.broadcastEditingStatus({...});
    console.log('Started editing block:', blockId);
  };

  const handleBlockPreview = (blockId: string) => {
    setSelectedBlockId(blockId);
    setBlockEditMode('participant');
    setShowBlockPreview(true);
    setCollaborationPanelTab('blocks');
    setShowCollaborationPanel(true);
  };

  const selectedBlock = selectedBlockId ? studyBlocks.find(b => b.id === selectedBlockId) : null;

  // Block change handler
  const handleBlockChange = (updatedBlock: StudyBuilderBlock) => {
    if (onBlocksChange) {
      const updatedBlocks = studyBlocks.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      );
      onBlocksChange(updatedBlocks);
      
      // Broadcast activity for block update
      const newActivity: CollaborationActivity = {
        id: `activity-${Date.now()}`,
        type: 'block_edited',
        userId: user?.id || 'unknown',
        userName: user?.email || 'Unknown User',
        action: `Updated ${updatedBlock.type} block`,
        timestamp: new Date(),
        entityType: 'study',
        entityId: studyId,
        entityName: studyTitle,
        metadata: { blockType: updatedBlock.type, changes: ['content'] },
        priority: 'medium',
        category: 'content'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 19)]);
    }
  };

  if (!user) return <>{children}</>;

  return (
    <div className={`collaborative-study-builder ${className}`}>
      {/* Main Study Builder Content */}
      <div className={`transition-all duration-300 ${showCollaborationPanel ? 'mr-96' : ''}`}>
        {/* Collaboration Header */}
        <CollaborationHeader
          entityType="study"
          entityId={studyId}
          entityTitle={studyTitle}
          workspaceId={workspaceId}
          onShowComments={() => {
            setCollaborationPanelTab('comments');
            setShowCollaborationPanel(true);
          }}
          onShowActivity={() => {
            setCollaborationPanelTab('activity');
            setShowCollaborationPanel(true);
          }}
        />

        {/* Collaboration Indicators - show current editing status */}
        {(editingStatus.length > 0 || activeCollaborators.length > 0) && (
          <CollaborationIndicators
            activeCollaborators={activeCollaborators}
            editingStatus={editingStatus}
            recentActivity={recentActivity.slice(0, 3)}
            expanded={false}
            onViewFullActivity={() => {
              setCollaborationPanelTab('activity');
              setShowCollaborationPanel(true);
            }}
            onFocusCollaborator={(collaboratorId) => {
              console.log('Focus collaborator:', collaboratorId);
            }}
            className="mb-4"
          />
        )}

        {/* Study Builder Content */}
        {children}
      </div>

      {/* Collaboration Panel */}
      {showCollaborationPanel && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Collaboration</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCollaborationPanel(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>

          {/* Panel Tabs */}
          <div className="px-4 py-2 border-b border-gray-200">
            <Tabs
              value={collaborationPanelTab}
              onValueChange={(tabId: string) => setCollaborationPanelTab(tabId as 'comments' | 'activity' | 'team' | 'blocks')}
            >
              <div className="flex space-x-4">
                {collaborationTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCollaborationPanelTab(tab.id as 'comments' | 'activity' | 'team' | 'blocks')}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      collaborationPanelTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Tabs>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {collaborationPanelTab === 'comments' && (
              <div className="p-4">
                <CommentSystem
                  entityId={studyId}
                  entityType="study"
                  currentUser={{
                    id: user.id,
                    name: user.email || 'Unknown User',
                    avatar: '',
                    role: user.role || 'researcher'
                  }}
                  comments={comments}
                  teamMembers={activeCollaborators}
                  onAddComment={handleAddComment}
                  onUpdateComment={handleUpdateComment}
                  onDeleteComment={handleDeleteComment}
                  onAddReaction={handleAddReaction}
                  onRemoveReaction={handleRemoveReaction}
                />
              </div>
            )}

            {collaborationPanelTab === 'activity' && (
              <div className="p-4">
                <ActivityFeed
                  activities={recentActivity.map(activity => ({
                    id: activity.id,
                    type: (activity.type === 'block_added' ? 'block_added' : 
                           activity.type === 'block_edited' ? 'block_updated' :
                           activity.type === 'comment_added' ? 'comment_added' :
                           activity.type === 'user_joined' ? 'user_joined' :
                           activity.type === 'settings_changed' ? 'study_updated' :
                           'study_updated') as ActivityType,
                    user: {
                      id: activity.userId,
                      name: activity.userName || 'Unknown User',
                      email: activity.userName || 'unknown@example.com',
                      avatar: '',
                      role: 'researcher' as WorkspaceRole
                    },
                    timestamp: activity.timestamp,
                    target: {
                      id: activity.entityId || 'unknown',
                      title: activity.entityName || 'Unknown',
                      type: activity.entityType as 'study' | 'template' | 'workspace' | 'comment'
                    },
                    metadata: activity.metadata ? {
                      previousValue: typeof activity.metadata.oldValue === 'string' ? activity.metadata.oldValue : undefined,
                      newValue: typeof activity.metadata.newValue === 'string' ? activity.metadata.newValue : undefined,
                      blockType: activity.metadata.blockType,
                      changes: activity.metadata.changes
                    } : undefined
                  }))}
                  currentUser={{
                    id: user.id,
                    name: user.email || 'Unknown User',
                    email: user.email || 'unknown@example.com',
                    avatar: '',
                    role: 'researcher' as WorkspaceRole
                  }}
                  onActivityClick={(activity) => console.log('Activity clicked:', activity)}
                />
              </div>
            )}

            {collaborationPanelTab === 'team' && (
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Active Now</h4>
                    <div className="space-y-2">
                      {activeCollaborators.filter(c => c.status === 'active').map(collaborator => (
                        <div key={collaborator.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className="relative">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">
                                {collaborator.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {collaborator.name}
                            </p>
                            {collaborator.currentElement && (
                              <p className="text-xs text-gray-500 truncate">
                                Editing: {collaborator.currentElement}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeCollaborators.filter(c => c.status !== 'active').length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Away</h4>
                      <div className="space-y-2">
                        {activeCollaborators.filter(c => c.status !== 'active').map(collaborator => (
                          <div key={collaborator.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <div className="relative">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {collaborator.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {collaborator.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {collaborator.lastSeen 
                                  ? `Last seen ${Math.round((Date.now() - collaborator.lastSeen.getTime()) / 60000)}m ago`
                                  : 'Recently active'
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {collaborationPanelTab === 'blocks' && (
              <div className="p-4">
                {showBlockPreview && selectedBlock ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Block Preview</h4>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBlockEditMode('edit')}
                          className={blockEditMode === 'edit' ? 'bg-blue-50 text-blue-600' : ''}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBlockEditMode('preview')}
                          className={blockEditMode === 'preview' ? 'bg-blue-50 text-blue-600' : ''}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBlockEditMode('participant')}
                          className={blockEditMode === 'participant' ? 'bg-blue-50 text-blue-600' : ''}
                        >
                          Participant
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBlockPreview(false)}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <EnhancedBlockPreview
                        block={selectedBlock}
                        mode={blockEditMode}
                        onModeChange={setBlockEditMode}
                        showModeToggle={false}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Study Blocks</h4>
                    {studyBlocks.length > 0 ? (
                      <div className="space-y-2">
                        {studyBlocks.map((block, index) => (
                          <div
                            key={block.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleBlockEdit(block.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {index + 1}. {block.title || `${block.type} Block`}
                                </p>
                                <p className="text-sm text-gray-500 capitalize">
                                  {block.type.replace('_', ' ')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlockPreview(block.id);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No blocks in this study yet.</p>
                        <p className="text-sm mt-1">Add blocks to start collaborating!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Collaboration Toggle */}
      {!showCollaborationPanel && (activeCollaborators.length > 0 || comments.length > 0) && (
        <Button
          onClick={() => setShowCollaborationPanel(true)}
          className="fixed right-4 top-20 z-40 shadow-lg"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Team ({activeCollaborators.length})
        </Button>
      )}
    </div>
  );
};

export default CollaborativeStudyBuilderContainer;
