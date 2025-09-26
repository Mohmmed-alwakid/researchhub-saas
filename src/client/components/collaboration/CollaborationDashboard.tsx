import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Clock, 
  Eye,
  Edit,
  ArrowRight,
  Bell,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { collaborationService } from '../../services/collaborationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import ActivityFeed from '../collaboration/ActivityFeed';
import ApprovalQueue from '../approval/ApprovalQueue';
import type { 
  UserJoinedData, 
  UserLeftData, 
  ActivityUpdateData 
} from './types';

import type { WorkspaceRole } from '../../../shared/types';

interface CollaborationDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: WorkspaceRole;
  };
  workspaceId: string;
  className?: string;
}

interface DashboardStats {
  activeCollaborators: number;
  pendingApprovals: number;
  unreadComments: number;
  myStudies: number;
  sharedStudies: number;
  recentActivity: number;
}

interface OnlineCollaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'away' | 'idle';
  currentStudy?: {
    id: string;
    title: string;
  };
  lastSeen: Date;
}

export const CollaborationDashboard: React.FC<CollaborationDashboardProps> = ({
  currentUser,
  workspaceId,
  className = ''
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    activeCollaborators: 0,
    pendingApprovals: 0,
    unreadComments: 0,
    myStudies: 0,
    sharedStudies: 0,
    recentActivity: 0
  });
  const [onlineCollaborators, setOnlineCollaborators] = useState<OnlineCollaborator[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize collaboration service and load data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load dashboard statistics
        const [approvals, activity] = await Promise.all([
          approvalService.getApprovalQueue(workspaceId),
          collaborationService.getActivityFeed(workspaceId)
        ]);

        // Mock data for demonstration - in real app this would come from APIs
        setStats({
          activeCollaborators: 5,
          pendingApprovals: approvals.count || 0,
          unreadComments: 3,
          myStudies: 8,
          sharedStudies: 12,
          recentActivity: activity.length || 0
        });

        // Set online collaborators
        setOnlineCollaborators([
          {
            id: 'user-2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            avatar: '/avatars/sarah.jpg',
            status: 'active',
            currentStudy: { id: 'study-1', title: 'Mobile App Usability' },
            lastSeen: new Date()
          },
          {
            id: 'user-3',
            name: 'Mike Chen',
            email: 'mike.chen@company.com',
            status: 'away',
            currentStudy: { id: 'study-2', title: 'Website Navigation' },
            lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    const initializeDashboard = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          await collaborationService.initialize(token);
          
          // Set up real-time listeners
          collaborationService.on('user_joined', handleUserJoined);
          collaborationService.on('user_left', handleUserLeft);
          collaborationService.on('activity_update', handleActivityUpdate);
          
          await loadDashboardData();
        }
      } catch (error) {
        console.error('Failed to initialize collaboration dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // Cleanup listeners on unmount
    return () => {
      collaborationService.off('user_joined', handleUserJoined);
      collaborationService.off('user_left', handleUserLeft);
      collaborationService.off('activity_update', handleActivityUpdate);
    };
  }, [workspaceId]);

  // Real-time event handlers
  const handleUserJoined = (data?: unknown) => {
    const userData = data as UserJoinedData;
    console.log('User joined:', userData);
    // Update online collaborators list
  };

  const handleUserLeft = (data?: unknown) => {
    const userData = data as UserLeftData;
    console.log('User left:', userData);
    // Update online collaborators list
  };

  const handleActivityUpdate = (data?: unknown) => {
    const activityData = data as ActivityUpdateData;
    console.log('Activity update:', activityData);
    // Update activity feed and stats
    setStats(prev => ({
      ...prev,
      recentActivity: prev.recentActivity + 1
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'idle': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusDot = (status: string) => {
    const colorClass = getStatusColor(status);
    return <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')}`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collaboration Hub</h1>
            <p className="text-gray-600 mt-1">
              Real-time collaboration and team coordination for your research projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/app/studies/create')}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              New Study
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCollaborators}</p>
              <p className="text-sm text-gray-600">Online Now</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.unreadComments}</p>
              <p className="text-sm text-gray-600">New Comments</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.myStudies}</p>
              <p className="text-sm text-gray-600">My Studies</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.sharedStudies}</p>
              <p className="text-sm text-gray-600">Shared Studies</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
              <p className="text-sm text-gray-600">Recent Activity</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-between p-4 h-auto"
                    onClick={() => navigate('/app/studies/create')}
                  >
                    <div className="text-left">
                      <div className="font-medium">Create New Study</div>
                      <div className="text-sm text-gray-600">Start a new research project</div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex items-center justify-between p-4 h-auto"
                    onClick={() => setActiveTab('approvals')}
                  >
                    <div className="text-left">
                      <div className="font-medium">Review Approvals</div>
                      <div className="text-sm text-gray-600">{stats.pendingApprovals} items pending</div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex items-center justify-between p-4 h-auto"
                    onClick={() => navigate('/studies')}
                  >
                    <div className="text-left">
                      <div className="font-medium">My Studies</div>
                      <div className="text-sm text-gray-600">View and manage your studies</div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex items-center justify-between p-4 h-auto"
                    onClick={() => setActiveTab('activity')}
                  >
                    <div className="text-left">
                      <div className="font-medium">Team Activity</div>
                      <div className="text-sm text-gray-600">See what your team is working on</div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="approvals" className="space-y-6">
              <ApprovalQueue
                approvals={[]} // This would be loaded from the API
                userRole={currentUser.role}
                onApprovalAction={(id, action, comment) => {
                  console.log('Approval action:', { id, action, comment });
                }}
                onBulkAction={(ids, action) => {
                  console.log('Bulk approval action:', { ids, action });
                }}
                isLoading={false}
              />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ActivityFeed
                activities={[]} // This would be loaded from the API
                currentUser={currentUser}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Online Team Members */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Online ({onlineCollaborators.length})
            </h3>
            <div className="space-y-3">
              {onlineCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-3">
                  <div className="relative">
                    {collaborator.avatar ? (
                      <img 
                        src={collaborator.avatar} 
                        alt={collaborator.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {collaborator.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusDot(collaborator.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {collaborator.name}
                    </p>
                    {collaborator.currentStudy && (
                      <p className="text-xs text-gray-600 truncate">
                        Working on: {collaborator.currentStudy.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Notifications */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Recent Notifications
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">New comment on "Mobile UX Study"</p>
                <p className="text-xs text-blue-700 mt-1">Sarah Johnson • 5 minutes ago</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Study "E-commerce Testing" approved</p>
                <p className="text-xs text-green-700 mt-1">Mike Chen • 1 hour ago</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-900">Approval needed for "Card Sort Study"</p>
                <p className="text-xs text-orange-700 mt-1">Alex Kim • 2 hours ago</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDashboard;
