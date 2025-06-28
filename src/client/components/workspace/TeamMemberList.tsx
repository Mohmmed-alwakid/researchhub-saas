import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search,
  MoreHorizontal,
  Crown,
  Shield,
  Settings,
  Eye,
  Calendar,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { WorkspaceMember, WorkspaceRole, IUser } from '../../../shared/types';

interface TeamMemberListProps {
  members: WorkspaceMember[];
  currentUserId?: string;
  canManageMembers?: boolean;
  onInviteMember: () => void;
  onManageMember: (member: WorkspaceMember) => void;
  onRemoveMember: (member: WorkspaceMember) => void;
  isLoading?: boolean;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  currentUserId,
  canManageMembers = false,
  onInviteMember,
  onManageMember,
  onRemoveMember,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter members based on search
  const filteredMembers = members.filter(member => {
    const user = member.userId as IUser;
    const searchableText = [
      user.firstName,
      user.lastName,
      user.email,
      member.role,
      member.metadata?.department,
      member.metadata?.jobTitle
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm.toLowerCase());
  });

  const getRoleIcon = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'editor':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return 'warning';
      case 'admin':
        return 'default';
      case 'editor':
        return 'success';
      case 'viewer':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: WorkspaceMember['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
        return 'info';
      case 'suspended':
        return 'warning';
      case 'removed':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const formatName = (user: IUser) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const formatLastActive = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPendingInvitations = () => {
    return members.filter(member => member.status === 'invited');
  };

  const getActiveMembers = () => {
    return members.filter(member => member.status === 'active');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-gray-600 text-sm mt-1">
            Manage your workspace team and permissions
          </p>
        </div>
        {canManageMembers && (
          <Button
            onClick={onInviteMember}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Pending Invitations */}
      {getPendingInvitations().length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium text-gray-900">Pending Invitations</h4>
            <Badge variant="warning" size="sm">
              {getPendingInvitations().length}
            </Badge>
          </div>
          <div className="space-y-2">
            {getPendingInvitations().map((member) => {
              const user = member.userId as IUser;
              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-600">
                        Invited {formatLastActive(member.invitedAt)} as {member.role}
                      </p>
                    </div>
                  </div>
                  {canManageMembers && (
                    <button
                      onClick={() => onManageMember(member)}
                      className="p-1 hover:bg-amber-100 rounded"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{getActiveMembers().length}</div>
          <div className="text-sm text-gray-600">Active Members</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{getPendingInvitations().length}</div>
          <div className="text-sm text-gray-600">Pending Invites</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{members.length}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
      </div>

      {/* Member List */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No members found' : 'No team members yet'}
          </h4>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Invite your first team member to start collaborating'
            }
          </p>
          {!searchTerm && canManageMembers && (
            <Button onClick={onInviteMember} variant="primary">
              Invite Your First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => {
            const user = member.userId as IUser;
            const isCurrentUser = user._id === currentUserId;
            
            return (
              <Card
                key={member._id}
                className="p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {formatName(user)}
                        </h4>
                        {isCurrentUser && (
                          <Badge variant="secondary" size="sm">You</Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          <Badge 
                            variant={getRoleBadgeVariant(member.role)}
                            size="sm"
                          >
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{user.email}</span>
                        {member.metadata?.department && (
                          <span>• {member.metadata.department}</span>
                        )}
                        {member.metadata?.jobTitle && (
                          <span>• {member.metadata.jobTitle}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <Badge 
                          variant={getStatusBadgeVariant(member.status)}
                          size="sm"
                        >
                          {member.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          Last active: {formatLastActive(member.lastActiveAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManageMembers && !isCurrentUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onManageMember(member)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Manage member"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => onRemoveMember(member)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamMemberList;
