import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTheme } from '../../../shared/design/hooks';
import { 
  CollaboratorPresence, 
  EditingStatus, 
  CollaborationActivity 
} from '../../../shared/types';

interface CollaborationIndicatorsProps {
  /** Current active collaborators */
  activeCollaborators: CollaboratorPresence[];
  /** Current editing status information */
  editingStatus?: EditingStatus[];
  /** Recent collaboration activities */
  recentActivity?: CollaborationActivity[];
  /** Whether to show expanded view */
  expanded?: boolean;
  /** Callback when user wants to see full activity */
  onViewFullActivity?: () => void;
  /** Callback when user wants to focus on specific collaborator */
  onFocusCollaborator?: (collaboratorId: string) => void;
  className?: string;
}

export const CollaborationIndicators: React.FC<CollaborationIndicatorsProps> = ({
  activeCollaborators = [],
  editingStatus = [],
  recentActivity = [],
  expanded = false,
  onViewFullActivity,
  onFocusCollaborator,
  className = ''
}) => {
  const theme = useTheme();

  // Helper to get presence status color
  const getPresenceColor = (status: CollaboratorPresence['status']) => {
    switch (status) {
      case 'active':
        return theme.colors.success[500];
      case 'idle':
        return theme.colors.warning[500];
      case 'away':
        return theme.colors.secondary[400];
      default:
        return theme.colors.secondary[400];
    }
  };

  // Helper to get editing status info
  const getEditingInfo = (collaboratorId: string) => {
    return editingStatus.find(status => status.collaboratorId === collaboratorId);
  };

  // Helper to format time since last activity
  const formatTimeSince = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'yesterday';
  };

  // Render compact presence indicators
  const renderCompactPresence = () => (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {activeCollaborators.slice(0, 4).map((collaborator) => {
          const editing = getEditingInfo(collaborator.id);
          return (
            <div
              key={collaborator.id}
              className="relative group cursor-pointer"
              onClick={() => onFocusCollaborator?.(collaborator.id)}
            >
              <Avatar
                src={collaborator.avatar}
                alt={collaborator.name}
                size="sm"
                className="ring-2 ring-white dark:ring-gray-800"
              />
              
              {/* Presence indicator */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
                style={{ backgroundColor: getPresenceColor(collaborator.status) }}
              />
              
              {/* Editing indicator */}
              {editing && (
                <div className="absolute -top-1 -right-1">
                  <Badge
                    variant="info"
                    size="sm"
                    className="animate-pulse"
                  >
                    ✏️
                  </Badge>
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div className="font-medium">{collaborator.name}</div>
                  <div className="text-gray-300">
                    {editing ? `Editing ${editing.elementType}` : collaborator.status}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {formatTimeSince(collaborator.lastActive)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {activeCollaborators.length > 4 && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
            +{activeCollaborators.length - 4}
          </div>
        )}
      </div>

      {activeCollaborators.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {activeCollaborators.length} online
        </div>
      )}
    </div>
  );

  // Render expanded presence view
  const renderExpandedPresence = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          Active Collaborators ({activeCollaborators.length})
        </h4>
        {onViewFullActivity && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewFullActivity}
          >
            View Activity
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {activeCollaborators.map((collaborator) => {
          const editing = getEditingInfo(collaborator.id);
          return (
            <div
              key={collaborator.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => onFocusCollaborator?.(collaborator.id)}
            >
              <div className="relative">
                <Avatar
                  src={collaborator.avatar}
                  alt={collaborator.name}
                  size="sm"
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: getPresenceColor(collaborator.status) }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {collaborator.name}
                  </span>
                  <Badge
                    variant={collaborator.status === 'active' ? 'success' : 'secondary'}
                    size="sm"
                  >
                    {collaborator.status}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  {editing ? (
                    <>
                      <span className="flex items-center space-x-1">
                        <span>✏️</span>
                        <span>Editing {editing.elementType}</span>
                      </span>
                      {editing.elementId && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                          #{editing.elementId}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Last seen {formatTimeSince(collaborator.lastActive)}</span>
                  )}
                </div>
              </div>

              {collaborator.role && (
                <Badge variant="secondary" size="sm">
                  {collaborator.role}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent activity preview */}
      {recentActivity.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Recent Activity
          </div>
          <div className="space-y-1">
            {recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{activity.userName}</span>{' '}
                {activity.action} {formatTimeSince(activity.timestamp)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Don't render if no collaborators
  if (activeCollaborators.length === 0) {
    return null;
  }

  return (
    <div className={`collaboration-indicators ${className}`}>
      {expanded ? (
        <Card className="p-4">
          {renderExpandedPresence()}
        </Card>
      ) : (
        renderCompactPresence()
      )}
    </div>
  );
};

export default CollaborationIndicators;
