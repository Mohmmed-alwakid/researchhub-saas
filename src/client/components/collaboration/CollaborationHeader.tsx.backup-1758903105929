import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Activity, Eye, Edit3 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { collaborationService } from '../../services/collaborationService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CollaborationHeaderProps {
  entityType: string;
  entityId: string;
  entityTitle: string;
  workspaceId?: string;
  onShowComments?: () => void;
  onShowActivity?: () => void;
  className?: string;
}

interface ActiveCollaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'away' | 'idle';
  currentElement?: string;
  lastSeen: Date;
}

interface UserJoinedData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface UserLeftData {
  user: {
    id: string;
  };
}

interface PresenceUpdateData {
  user: {
    id: string;
  };
  status: 'active' | 'away' | 'idle';
  currentElement?: string;
}

export const CollaborationHeader: React.FC<CollaborationHeaderProps> = ({
  entityType,
  entityId,
  entityTitle,
  workspaceId = 'workspace-1',
  onShowComments,
  onShowActivity,
  className = ''
}) => {
  const { user } = useAuthStore();
  const [activeCollaborators, setActiveCollaborators] = useState<ActiveCollaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [activityCount, setActivityCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const initializeCollaboration = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          await collaborationService.initialize(token);
          await collaborationService.joinSession(entityType, entityId, workspaceId);
          setIsConnected(true);

          // Set up event listeners
          collaborationService.on('user_joined', handleUserJoined);
          collaborationService.on('user_left', handleUserLeft);
          collaborationService.on('presence_update', handlePresenceUpdate);
          collaborationService.on('activity_update', handleActivityUpdate);

          // Mock data for demonstration
          setActiveCollaborators([
            {
              id: 'demo-user-1',
              name: 'Sarah Johnson',
              email: 'sarah@company.com',
              status: 'active',
              currentElement: 'block-editor',
              lastSeen: new Date()
            },
            {
              id: 'demo-user-2',
              name: 'Mike Chen',
              email: 'mike@company.com',
              status: 'away',
              currentElement: 'study-settings',
              lastSeen: new Date(Date.now() - 300000)
            }
          ]);

          setActivityCount(5);
          setCommentCount(3);
        }
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
      }
    };

    const handleUserJoined = (data: unknown) => {
      const userJoinedData = data as UserJoinedData;
      if (userJoinedData.user?.id !== user?.id) {
        setActiveCollaborators(prev => [
          ...prev.filter(c => c.id !== userJoinedData.user.id),
          {
            id: userJoinedData.user.id,
            name: userJoinedData.user.name || 'Unknown User',
            email: userJoinedData.user.email || '',
            status: 'active',
            lastSeen: new Date()
          }
        ]);
      }
    };

    const handleUserLeft = (data: unknown) => {
      const userLeftData = data as UserLeftData;
      setActiveCollaborators(prev => prev.filter(c => c.id !== userLeftData.user?.id));
    };

    const handlePresenceUpdate = (data: unknown) => {
      const presenceData = data as PresenceUpdateData;
      setActiveCollaborators(prev => prev.map(c => 
        c.id === presenceData.user?.id 
          ? { ...c, status: presenceData.status, currentElement: presenceData.currentElement, lastSeen: new Date() }
          : c
      ));
    };

    const handleActivityUpdate = () => {
      setActivityCount(prev => prev + 1);
    };

    initializeCollaboration();

    return () => {
      collaborationService.off('user_joined', handleUserJoined);
      collaborationService.off('user_left', handleUserLeft);
      collaborationService.off('presence_update', handlePresenceUpdate);
      collaborationService.off('activity_update', handleActivityUpdate);
      
      if (isConnected) {
        collaborationService.leaveSession(entityType, entityId);
      }
    };
  }, [user, entityType, entityId, workspaceId, isConnected]);

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

  if (!user) return null;

  return (
    <Card className={`p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Connection status and collaborators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? 'Live Collaboration' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              {entityTitle}
            </span>
          </div>

          {activeCollaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {activeCollaborators.length} collaborator{activeCollaborators.length !== 1 ? 's' : ''} online
              </span>
            </div>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {activityCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowActivity}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Activity
              <Badge variant="secondary" className="ml-1 text-xs">
                {activityCount}
              </Badge>
            </Button>
          )}

          {commentCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowComments}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Comments
              <Badge variant="secondary" className="ml-1 text-xs">
                {commentCount}
              </Badge>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCollaborators(!showCollaborators)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showCollaborators ? 'Hide' : 'Show'} Team
          </Button>
        </div>
      </div>

      {/* Active Collaborators */}
      {showCollaborators && activeCollaborators.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            {activeCollaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-700">
                      {collaborator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {getStatusDot(collaborator.status)}
                  </div>
                </div>
                <div className="min-w-0">
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
      )}
    </Card>
  );
};

export default CollaborationHeader;
