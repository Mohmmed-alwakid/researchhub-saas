import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  Plus, 
  Search,
  MoreHorizontal,
  Crown,
  Shield,
  Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { IWorkspace, WorkspaceRole } from '../../../shared/types';

interface WorkspaceManagerProps {
  workspaces: IWorkspace[];
  currentWorkspaceId?: string;
  userRole?: WorkspaceRole;
  onWorkspaceSelect: (workspace: IWorkspace) => void;
  onCreateWorkspace: () => void;
  onManageWorkspace: (workspace: IWorkspace) => void;
  isLoading?: boolean;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  workspaces,
  currentWorkspaceId,
  userRole,
  onWorkspaceSelect,
  onCreateWorkspace,
  onManageWorkspace,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkspaces, setFilteredWorkspaces] = useState(workspaces);

  useEffect(() => {
    const filtered = workspaces.filter(workspace =>
      workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkspaces(filtered);
  }, [workspaces, searchTerm]);

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

  const formatMemberCount = (memberCount: number) => {
    return `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Workspaces</h2>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
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
          <h2 className="text-2xl font-semibold text-gray-900">Workspaces</h2>
          <p className="text-gray-600 mt-1">
            Manage your team workspaces and collaborate on research studies
          </p>
        </div>
        <Button
          onClick={onCreateWorkspace}
          variant="primary"
          size="md"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Workspace
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Workspace Grid */}
      {filteredWorkspaces.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No workspaces found' : 'No workspaces yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first workspace to start collaborating with your team'
            }
          </p>
          {!searchTerm && (
            <Button onClick={onCreateWorkspace} variant="primary">
              Create Your First Workspace
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => {
            const isCurrentWorkspace = workspace._id === currentWorkspaceId;
            const memberCount = workspace.members?.length || 0;
            
            return (
              <Card
                key={workspace._id}
                className={`
                  relative cursor-pointer transition-all duration-200 hover:shadow-lg
                  ${isCurrentWorkspace 
                    ? 'ring-2 ring-blue-500 shadow-md' 
                    : 'hover:shadow-md'
                  }
                `}
                onClick={() => onWorkspaceSelect(workspace)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">
                          {workspace.name}
                        </h3>
                        {isCurrentWorkspace && (
                          <Badge variant="default" size="sm" className="mt-1">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageWorkspace(workspace);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Description */}
                  {workspace.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workspace.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{formatMemberCount(memberCount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(userRole || 'viewer')}
                      <Badge 
                        variant={getRoleBadgeVariant(userRole || 'viewer')}
                        size="sm"
                      >
                        {userRole || 'viewer'}
                      </Badge>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={workspace.status === 'active' ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {workspace.status}
                    </Badge>
                    {workspace.subscription && (
                      <Badge variant="secondary" size="sm">
                        {workspace.subscription.plan}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkspaceManager;
