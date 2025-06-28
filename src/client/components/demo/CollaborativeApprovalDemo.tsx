import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import ApprovalQueue, { ApprovalItem } from '../approval/ApprovalQueue';
import StudyApprovalCard from '../approval/StudyApprovalCard';
import ApprovalHistory from '../approval/ApprovalHistory';
import CollaborativeStudyBuilder from '../collaboration/CollaborativeStudyBuilder';
import ActivityFeed, { ActivityItem, ActivityUser } from '../collaboration/ActivityFeed';
import CollaborationIndicators from '../collaboration/CollaborationIndicators';
import CommentSystem from '../collaboration/CommentSystem';
import { collaborationService } from '../../services/collaborationService';
import { approvalService } from '../../services/approvalService';
import { commentsService } from '../../services/commentsService';
import type { 
  WorkspaceRole,
  IStudy,
  BaseBlock,
  CollaboratorPresence,
  EditingStatus,
  CollaborationActivity,
  IStudyComment
} from '../../../shared/types';

interface CollaborativeApprovalDemoProps {
  /** Current user information */
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: WorkspaceRole;
  };
  /** Current workspace ID */
  workspaceId: string;
  className?: string;
}

export const CollaborativeApprovalDemo: React.FC<CollaborativeApprovalDemoProps> = ({
  currentUser,
  workspaceId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedStudy, setSelectedStudy] = useState<IStudy | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);

  // Mock data for demonstration
  const [mockApprovals] = useState<ApprovalItem[]>([
    {
      id: 'approval-1',
      item: {
        id: 'study-1',
        title: 'Mobile App Usability Study',
        type: 'study'
      },
      submittedBy: {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com'
      },
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      priority: 'high',
      status: 'pending',
      comments: 'Please review the new mobile interaction patterns we\'re testing.'
    },
    {
      id: 'approval-2',
      item: {
        id: 'study-2',
        title: 'E-commerce Checkout Flow',
        type: 'study'
      },
      submittedBy: {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@example.com'
      },
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      priority: 'medium',
      status: 'changes_requested',
      reviewedBy: {
        id: currentUser.id,
        name: currentUser.name
      },
      reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      comments: 'Need to add more demographic screening questions.'
    },
    {
      id: 'approval-3',
      item: {
        id: 'study-3',
        title: 'Dashboard Navigation Study',
        type: 'study'
      },
      submittedBy: {
        id: 'user-3',
        name: 'Carol Davis',
        email: 'carol@example.com'
      },
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      priority: 'urgent',
      status: 'approved',
      reviewedBy: {
        id: currentUser.id,
        name: currentUser.name
      },
      reviewedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      comments: 'Excellent study design. Approved for immediate launch.'
    }
  ]);

  const [mockCollaborators] = useState<CollaboratorPresence[]>([
    {
      id: 'user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=100&h=100&fit=crop&crop=face',
      role: 'editor',
      status: 'active',
      lastActive: new Date(),
      currentLocation: {
        studyId: 'study-1',
        blockId: 'block-1',
        section: 'blocks'
      }
    },
    {
      id: 'user-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'viewer',
      status: 'idle',
      lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: 'user-3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      role: 'admin',
      status: 'active',
      lastActive: new Date(),
      currentLocation: {
        studyId: 'study-1',
        section: 'comments'
      }
    }
  ]);

  const [mockEditingStatus] = useState<EditingStatus[]>([
    {
      collaboratorId: 'user-1',
      elementType: 'block',
      elementId: 'block-1',
      action: 'editing',
      startedAt: new Date(Date.now() - 2 * 60 * 1000),
      lastUpdate: new Date()
    }
  ]);

  const [mockActivity] = useState<CollaborationActivity[]>([
    {
      id: 'activity-1',
      type: 'study_approved',
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'approved the Dashboard Navigation Study',
      timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
      entityType: 'study',
      entityId: 'study-3',
      entityName: 'Dashboard Navigation Study',
      priority: 'high',
      category: 'administration'
    },
    {
      id: 'activity-2',
      type: 'comment_added',
      userId: 'user-3',
      userName: 'Carol Davis',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      action: 'commented on Mobile App Usability Study',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      entityType: 'study',
      entityId: 'study-1',
      entityName: 'Mobile App Usability Study',
      priority: 'medium',
      category: 'collaboration'
    },
    {
      id: 'activity-3',
      type: 'block_added',
      userId: 'user-1',
      userName: 'Alice Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=100&h=100&fit=crop&crop=face',
      action: 'added a new Opinion Scale block',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      entityType: 'block',
      entityId: 'block-2',
      priority: 'low',
      category: 'content'
    }
  ]);

  const [mockComments] = useState<IStudyComment[]>([
    {
      _id: 'comment-1',
      studyId: 'study-1',
      blockId: 'block-1',
      authorId: 'user-3',
      content: 'I think we should add a follow-up question here to understand user motivations better.',
      type: 'suggestion',
      status: 'open',
      mentions: [currentUser.id],
      reactions: [
        { userId: currentUser.id, emoji: '👍', addedAt: new Date() },
        { userId: 'user-1', emoji: '💡', addedAt: new Date() }
      ],
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      _id: 'comment-2',
      studyId: 'study-1',
      authorId: 'user-1',
      content: 'Great idea! I\'ll add that as an optional follow-up question.',
      type: 'comment',
      status: 'open',
      parentCommentId: 'comment-1',
      reactions: [
        { userId: 'user-3', emoji: '✅', addedAt: new Date() }
      ],
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000)
    }
  ]);

  const [mockStudy] = useState<IStudy>({
    _id: 'study-1',
    title: 'Mobile App Usability Study',
    description: 'Testing the new mobile app interface for usability and user satisfaction.',
    researcherId: 'user-1',
    type: 'usability',
    status: 'draft',
    participantCriteria: {
      demographics: {},
      experience: [],
      exclusions: []
    },
    incentive: {
      type: 'monetary',
      amount: 25,
      currency: 'USD'
    },
    estimatedDuration: 30,
    recordingOptions: {
      screen: true,
      audio: true,
      webcam: false,
      clicks: true,
      scrolls: true,
      keystrokes: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  } as IStudy);

  const [mockBlocks] = useState<BaseBlock[]>([
    {
      id: 'block-1',
      type: 'welcome',
      order: 0,
      title: 'Welcome to Mobile App Study',
      description: 'Welcome participants and explain the study',
      isRequired: true,
      settings: {
        welcomeMessage: 'Thank you for participating in our mobile app usability study!',
        useCustomMessage: true
      },
      conditionalLogic: [],
      analytics: {
        trackInteractions: true,
        trackTiming: true,
        trackDropoff: true
      },
      metadata: {
        category: 'welcome',
        complexity: 'beginner',
        estimatedDuration: 1,
        tags: ['introduction'],
        version: '1.0',
        lastModified: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'block-2',
      type: 'open_question',
      order: 1,
      title: 'Initial Impressions',
      description: 'Gather first impressions of the mobile interface',
      isRequired: true,
      settings: {
        question: 'What are your first impressions of this mobile app interface?',
        placeholder: 'Please share your thoughts...',
        followUpQuestions: ['What specifically caught your attention?'],
        aiFollowUp: {
          enabled: true,
          maxQuestions: 2,
          analysisDepth: 'detailed'
        },
        responseSettings: {
          minWords: 10,
          maxWords: 200,
          allowRichText: false
        }
      },
      conditionalLogic: [],
      analytics: {
        trackInteractions: true,
        trackTiming: true,
        trackDropoff: true
      },
      metadata: {
        category: 'data_collection',
        complexity: 'beginner',
        estimatedDuration: 3,
        tags: ['qualitative', 'first-impression'],
        version: '1.0',
        lastModified: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (isCollaborating) {
      const interval = setInterval(() => {
        // Simulate activity updates
        console.log('Simulating real-time collaboration updates...');
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isCollaborating]);

  // Mock handlers
  const handleApprovalAction = (approvalId: string, action: string, comment?: string) => {
    console.log('Approval action:', { approvalId, action, comment });
    // In real implementation, this would update the approval status
  };

  const handleBulkAction = (approvalIds: string[], action: string) => {
    console.log('Bulk action:', { approvalIds, action });
    // In real implementation, this would handle bulk approvals
  };

  const handleStudyUpdate = (updates: Partial<IStudy>) => {
    console.log('Study update:', updates);
    // In real implementation, this would update the study
  };

  const handleAddBlock = (block: Omit<BaseBlock, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Add block:', block);
    // In real implementation, this would add a new block
  };

  const handleStartCollaboration = (studyId: string) => {
    console.log('Starting collaboration for study:', studyId);
    setSelectedStudy(mockStudy);
    setIsCollaborating(true);
    setActiveTab('collaboration');
  };

  // Convert CollaborationActivity to ActivityItem for ActivityFeed
  const convertToActivityItems = (activities: CollaborationActivity[]): ActivityItem[] => {
    return activities.map(activity => ({
      id: activity.id,
      type: activity.type as any,
      user: {
        id: activity.userId,
        name: activity.userName,
        email: mockCollaborators.find(c => c.id === activity.userId)?.email || 'unknown@example.com',
        avatar: activity.userAvatar,
        role: mockCollaborators.find(c => c.id === activity.userId)?.role || 'viewer'
      } as ActivityUser,
      timestamp: activity.timestamp,
      target: {
        id: activity.entityId || '',
        title: activity.entityName || activity.action,
        type: activity.entityType || 'study'
      },
      metadata: activity.metadata
    }));
  };

  return (
    <div className={`collaborative-approval-demo ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Collaborative Research Platform
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time collaboration meets approval workflows
            </p>
          </div>

          {/* Live collaboration indicators */}
          <div className="flex items-center space-x-4">
            <CollaborationIndicators
              activeCollaborators={mockCollaborators}
              editingStatus={mockEditingStatus}
              recentActivity={mockActivity.slice(0, 2)}
              expanded={false}
            />
            
            {isCollaborating && (
              <Badge variant="success" size="lg">
                🟢 Live Collaboration
              </Badge>
            )}
          </div>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="queue">
              Approval Queue
              <Badge variant="warning" className="ml-2">
                {mockApprovals.filter(a => a.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="collaboration">
              Collaborative Editor
              {isCollaborating && (
                <Badge variant="success" size="sm" className="ml-2">
                  Live
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments">Comments & Discussion</TabsTrigger>
          </TabsList>

          {/* Approval Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Study Approval Workflow</h2>
                <Button 
                  onClick={() => handleStartCollaboration('study-1')}
                  className="flex items-center space-x-2"
                >
                  <span>🚀</span>
                  <span>Start Collaboration</span>
                </Button>
              </div>
              
              <ApprovalQueue
                approvals={mockApprovals}
                userRole={currentUser.role}
                onApprovalAction={handleApprovalAction}
                onBulkAction={handleBulkAction}
                isLoading={false}
              />
            </Card>
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Real-time Activity Stream</h2>
              <ActivityFeed
                activities={convertToActivityItems(mockActivity)}
                currentUser={{
                  id: currentUser.id,
                  name: currentUser.name,
                  email: currentUser.email,
                  avatar: currentUser.avatar,
                  role: currentUser.role
                }}
                showFilters={true}
                groupByTime={true}
                showUserMentions={true}
              />
            </Card>
          </TabsContent>

          {/* Collaborative Editor Tab */}
          <TabsContent value="collaboration" className="space-y-6">
            {selectedStudy ? (
              <CollaborativeStudyBuilder
                study={{ ...selectedStudy, blocks: mockBlocks } as any}
                currentUser={currentUser}
                collaborators={mockCollaborators}
                editingStatus={mockEditingStatus}
                activity={mockActivity}
                comments={mockComments}
                cursors={[]}
                locks={[]}
                realTimeEnabled={isCollaborating}
                showCollaborationPanel={true}
                onStudyUpdate={handleStudyUpdate}
                onAddBlock={handleAddBlock}
                onUpdateBlock={() => {}}
                onDeleteBlock={() => {}}
                onReorderBlocks={() => {}}
                onAddComment={() => {}}
                onUpdateComment={() => {}}
                onDeleteComment={() => {}}
                onAddReaction={() => {}}
                onRemoveReaction={() => {}}
                onRequestLock={() => {}}
                onReleaseLock={() => {}}
                onCursorMove={() => {}}
              />
            ) : (
              <Card className="p-12 text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-2">Start Collaborative Editing</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a study from the approval queue to begin real-time collaboration
                </p>
                <Button onClick={() => setActiveTab('queue')}>
                  Go to Approval Queue
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Study Discussions</h2>
              {selectedStudy ? (
                <CommentSystem
                  entityId={selectedStudy._id}
                  entityType="study"
                  currentUser={currentUser}
                  comments={mockComments}
                  teamMembers={mockCollaborators}
                  onAddComment={() => {}}
                  onUpdateComment={() => {}}
                  onDeleteComment={() => {}}
                  onAddReaction={() => {}}
                  onRemoveReaction={() => {}}
                />
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-4">💬</div>
                  <p>Select a study to view and participate in discussions</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Demo Status */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Demo Environment
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                This is a comprehensive demo showcasing the integration of approval workflows 
                with real-time collaboration features. All data is mocked for demonstration purposes.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info" size="sm">✅ Approval System</Badge>
                <Badge variant="info" size="sm">✅ Real-time Collaboration</Badge>
                <Badge variant="info" size="sm">✅ Activity Feeds</Badge>
                <Badge variant="info" size="sm">✅ Comment System</Badge>
                <Badge variant="info" size="sm">✅ Live Presence</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CollaborativeApprovalDemo;
