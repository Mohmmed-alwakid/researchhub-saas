import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Users, 
  MessageSquare, 
  Activity, 
  Settings,
  Plus,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';

interface CollaborationTabProps {
  studyId?: string;
  workspaceId?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
}

interface Activity {
  id: string;
  type: 'comment' | 'edit' | 'approval' | 'participant';
  user: string;
  message: string;
  timestamp: string;
  studyId?: string;
  studyTitle?: string;
}

interface PendingApproval {
  id: string;
  type: 'study_changes' | 'participant_access' | 'data_export';
  submittedBy: string;
  submittedAt: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

const CollaborationTab: React.FC<CollaborationTabProps> = ({ studyId, workspaceId }) => {
  const { user } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('researcher');
  const [inviting, setInviting] = useState(false);

  const fetchCollaborationData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (studyId) {
        // Fetch study-specific collaboration data
        const [membersRes, activityRes, approvalsRes] = await Promise.all([
          fetch(`/api/collaboration/studies/${studyId}/collaborators`),
          fetch(`/api/collaboration/studies/${studyId}/activity`),
          fetch(`/api/collaboration/studies/${studyId}/approvals`)
        ]);

        const membersData = await membersRes.json();
        const activityData = await activityRes.json();
        const approvalsData = await approvalsRes.json();

        if (membersData.success) setTeamMembers(membersData.data || []);
        if (activityData.success) setRecentActivity(activityData.data || []);
        if (approvalsData.success) setPendingApprovals(approvalsData.data || []);
      } else {
        // Fetch workspace-level collaboration data
        const [membersRes, activityRes] = await Promise.all([
          fetch(`/api/organizations/${workspaceId}/members`),
          fetch(`/api/organizations/${workspaceId}/activity`)
        ]);

        const membersData = await membersRes.json();
        const activityData = await activityRes.json();

        if (membersData.success) setTeamMembers(membersData.data || []);
        if (activityData.success) setRecentActivity(activityData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch collaboration data:', error);
      // Set mock data for development
      setTeamMembers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'researcher',
          status: 'online',
          lastActive: '2 minutes ago'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com', 
          role: 'admin',
          status: 'away',
          lastActive: '1 hour ago'
        }
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'comment',
          user: 'John Doe',
          message: 'Added feedback on the user flow',
          timestamp: '5 minutes ago',
          studyTitle: studyId ? undefined : 'Website Usability Study'
        },
        {
          id: '2',
          type: 'edit',
          user: 'Jane Smith',
          message: 'Updated study configuration',
          timestamp: '1 hour ago',
          studyTitle: studyId ? undefined : 'Mobile App Testing'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [studyId, workspaceId]);

  useEffect(() => {
    fetchCollaborationData();
  }, [fetchCollaborationData]);

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setInviting(true);
    try {
      const endpoint = studyId 
        ? `/api/collaboration/studies/${studyId}/invite`
        : `/api/organizations/${workspaceId}/invite`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          studyId: studyId,
          workspaceId: workspaceId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setShowInviteModal(false);
        // Refresh collaboration data to show the new pending invitation
        fetchCollaborationData();
      } else {
        alert(result.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return MessageSquare;
      case 'edit':
        return Settings;
      case 'approval':
        return CheckCircle;
      case 'participant':
        return Users;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-yellow-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {studyId ? 'Study Collaboration' : 'Team Collaboration'}
            </h2>
            <p className="text-gray-600">
              {studyId 
                ? 'Collaborate with your team on this study' 
                : 'Collaborate with your team across all studies'
              }
            </p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Members ({teamMembers.length})
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="relative">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.role} • {member.lastActive}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {teamMembers.length === 0 && (
                  <div className="text-center py-4">
                    <Users className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No team members yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.message}
                          {activity.studyTitle && (
                            <span className="text-gray-600"> in {activity.studyTitle}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals (if any) */}
        {pendingApprovals.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                Pending Approvals ({pendingApprovals.length})
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.map((approval, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Study changes require approval
                      </p>
                      <p className="text-xs text-gray-600">
                        Submitted 2 hours ago by {approval.submittedBy || 'Team Member'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                      <Button size="sm">
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study-specific collaboration tools */}
        {studyId && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Study Comments</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Study-specific comments will appear here
                  </p>
                  <Button className="mt-3" variant="outline">
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Study Permissions</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Manage study access and permissions
                  </p>
                  <Button className="mt-3" variant="outline">
                    Manage Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Invite Team Member
              </h3>
              <Button 
                variant="ghost" 
                onClick={() => setShowInviteModal(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="researcher">Researcher</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteMember}
                  disabled={inviting || !inviteEmail}
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationTab;
