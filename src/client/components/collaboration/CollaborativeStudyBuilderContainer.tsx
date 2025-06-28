import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { collaborationService } from '../../services/collaborationService';
import { commentsService } from '../../services/commentsService';
import { CollaborationHeader } from './CollaborationHeader';
import { CollaborationIndicators } from './CollaborationIndicators';
import { CommentSystem } from './CommentSystem';
import { ActivityFeed } from './ActivityFeed';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { 
  IStudyComment, 
  CollaboratorPresence,
  EditingStatus,
  CollaborationActivity
} from '../../../shared/types';
import { MessageCircle, Activity, Users, Eye, EyeOff } from 'lucide-react';

interface CollaborativeStudyBuilderContainerProps {
  studyId: string;
  studyTitle: string;
  workspaceId?: string;
  children: React.ReactNode;
  className?: string;
}

export const CollaborativeStudyBuilderContainer: React.FC<CollaborativeStudyBuilderContainerProps> = ({
  studyId,
  studyTitle,
  workspaceId = 'workspace-1',
  children,
  className = ''
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
  const [collaborationPanelTab, setCollaborationPanelTab] = useState<'comments' | 'activity' | 'team'>('comments');

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

    const handleUserJoined = (data: { user?: { id: string; name: string; email: string; role?: string; avatar?: string }; sessionId?: string }) => {
      if (data.user?.id !== user?.id) {
        setActiveCollaborators(prev => [
          ...prev.filter(c => c.id !== data.user?.id),
          {
            id: data.user?.id || 'unknown',
            name: data.user?.name || 'Unknown User',
            email: data.user?.email || '',
            avatar: data.user?.avatar || '',
            role: (data.user?.role as any) || undefined,
            status: 'active' as const,
            lastActive: new Date(),
            currentLocation: {
              studyId: studyId
            },
            sessionId: data.sessionId || 'unknown'
          }
        ]);
      }
    };

    const handleUserLeft = (data: { user?: { id: string } }) => {
      setActiveCollaborators(prev => prev.filter(c => c.id !== data.user?.id));
    };

    const handlePresenceUpdate = (data: { user?: { id: string }; status?: string; currentLocation?: any }) => {
      setActiveCollaborators(prev => prev.map(c => 
        c.id === data.user?.id 
          ? { 
              ...c, 
              status: (data.status as any) || c.status, 
              currentLocation: data.currentLocation || c.currentLocation, 
              lastActive: new Date()
            }
          : c
      ));
    };

    const handleEditingStatusUpdate = (data: { collaboratorId: string; elementId: string; elementType: string; action: string }) => {
      setEditingStatus(prev => {
        const filtered = prev.filter(e => e.collaboratorId !== data.collaboratorId || e.elementId !== data.elementId);
        if (data.action === 'start_editing') {
          return [...filtered, {
            collaboratorId: data.collaboratorId,
            elementType: (data.elementType as any) || 'block',
            elementId: data.elementId,
            action: 'editing' as const,
            startedAt: new Date(),
            lastUpdate: new Date()
          }];
        }
        return filtered;
      });
    };

    const handleActivityUpdate = (data: CollaborationActivity) => {
      setRecentActivity(prev => [data, ...prev.slice(0, 19)]); // Keep last 20 activities
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
          entityType: 'study',
          entityId: studyId,
          parentId: undefined,
          author: {
            id: 'demo-user-1',
            name: 'Sarah Johnson',
            avatar: '',
            role: 'researcher'
          },
          content: 'Should we add a screening question before the welcome screen?',
          mentions: [],
          reactions: [
            { userId: 'demo-user-2', emoji: '👍', addedAt: new Date() }
          ],
          resolved: false,
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
          if (result.success && result.data) {
            setComments(result.data);
          }
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
  }, [user, studyId, workspaceId, isCollaborationConnected]);

  const handleAddComment = async (commentData: Omit<IStudyComment, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const result = await commentsService.addComment(commentData, token);
        if (result.success && result.data) {
          setComments(prev => [result.data, ...prev]);
          
          // Broadcast activity
          collaborationService.broadcastActivity({
            action: 'comment_added',
            entityType: 'study',
            entityId: studyId,
            details: { content: commentData.content.substring(0, 50) + '...' }
          });
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: string, updates: Partial<IStudyComment>) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const result = await commentsService.updateComment(commentId, updates, token);
        if (result.success) {
          setComments(prev => prev.map(c => 
            c._id === commentId ? { ...c, ...updates, updatedAt: new Date() } : c
          ));
        }
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
        const result = await commentsService.deleteComment(commentId, token);
        if (result.success) {
          setComments(prev => prev.filter(c => c._id !== commentId));
        }
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
        const result = await commentsService.addReaction(commentId, emoji, token);
        if (result.success) {
          setComments(prev => prev.map(c => 
            c._id === commentId 
              ? { 
                  ...c, 
                  reactions: [
                    ...c.reactions.filter(r => r.userId !== user.id || r.emoji !== emoji),
                    { emoji, userId: user.id, userName: user.email || 'Unknown' }
                  ]
                }
              : c
          ));
        }
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
        const result = await commentsService.removeReaction(commentId, emoji, token);
        if (result.success) {
          setComments(prev => prev.map(c => 
            c._id === commentId 
              ? { 
                  ...c, 
                  reactions: c.reactions.filter(r => !(r.userId === user.id && r.emoji === emoji))
                }
              : c
          ));
        }
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  // Panel tab management
  const collaborationTabs = [
    { id: 'comments', label: 'Comments', icon: MessageCircle, count: comments.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: recentActivity.length },
    { id: 'team', label: 'Team', icon: Users, count: activeCollaborators.length }
  ];

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
              tabs={collaborationTabs.map(tab => ({
                id: tab.id,
                label: tab.label,
                count: tab.count
              }))}
              activeTab={collaborationPanelTab}
              onTabChange={(tabId) => setCollaborationPanelTab(tabId as any)}
              variant="underline"
              size="sm"
            />
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
                  activities={recentActivity}
                  currentUserId={user.id}
                  showFilters={true}
                  showLoadMore={true}
                  onLoadMore={() => console.log('Load more activities')}
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
                                Last seen {Math.round((Date.now() - collaborator.lastSeen.getTime()) / 60000)}m ago
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
