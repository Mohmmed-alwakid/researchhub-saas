import React, { useState, useMemo, useEffect } from 'react';
import { Clock, User, MessageCircle, Edit, Eye, CheckCircle, XCircle, AlertTriangle, Users, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { WorkspaceRole } from '../../../shared/types/index';

// Activity types for the feed
export type ActivityType = 
  | 'study_created' 
  | 'study_updated' 
  | 'study_approved' 
  | 'study_rejected'
  | 'comment_added'
  | 'user_joined'
  | 'template_created'
  | 'block_added'
  | 'block_updated'
  | 'collaboration_started'
  | 'approval_requested';

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: WorkspaceRole;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: ActivityUser;
  timestamp: Date;
  target: {
    id: string;
    title: string;
    type: 'study' | 'template' | 'workspace' | 'comment';
  };
  metadata?: {
    previousValue?: string;
    newValue?: string;
    comment?: string;
    blockType?: string;
    collaborators?: ActivityUser[];
  };
  isRead?: boolean;
  mentions?: ActivityUser[];
}

interface ActivityFeedProps {
  /** List of activity items */
  activities: ActivityItem[];
  /** Current user for read status and mentions */
  currentUser: ActivityUser;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when activity is clicked */
  onActivityClick?: (activity: ActivityItem) => void;
  /** Callback when user is mentioned */
  onUserMention?: (user: ActivityUser, activity: ActivityItem) => void;
  /** Show compact view */
  compact?: boolean;
  /** Maximum number of items to display */
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  currentUser,
  isLoading = false,
  onActivityClick,
  onUserMention,
  compact = false,
  maxItems
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = searchQuery === '' ||
        activity.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.target.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    // Sort by timestamp (newest first)
    filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply max items limit
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [activities, searchQuery, typeFilter, maxItems]);

  // Group activities by time periods
  const groupedActivities = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as ActivityItem[],
      yesterday: [] as ActivityItem[],
      thisWeek: [] as ActivityItem[],
      older: [] as ActivityItem[]
    };

    filteredActivities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      
      if (activityDate >= today) {
        groups.today.push(activity);
      } else if (activityDate >= yesterday) {
        groups.yesterday.push(activity);
      } else if (activityDate >= thisWeek) {
        groups.thisWeek.push(activity);
      } else {
        groups.older.push(activity);
      }
    });

    return groups;
  }, [filteredActivities]);

  const getActivityIcon = (type: ActivityType) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (type) {
      case 'study_created':
      case 'template_created':
        return <Edit {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'study_updated':
      case 'block_updated':
        return <Edit {...iconProps} className="h-4 w-4 text-orange-600" />;
      case 'study_approved':
        return <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'study_rejected':
        return <XCircle {...iconProps} className="h-4 w-4 text-red-600" />;
      case 'comment_added':
        return <MessageCircle {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'user_joined':
        return <User {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'collaboration_started':
        return <Users {...iconProps} className="h-4 w-4 text-purple-600" />;
      case 'approval_requested':
        return <AlertTriangle {...iconProps} className="h-4 w-4 text-orange-600" />;
      case 'block_added':
        return <Edit {...iconProps} className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock {...iconProps} className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    const { type, user, target, metadata } = activity;
    
    switch (type) {
      case 'study_created':
        return `${user.name} created study "${target.title}"`;
      case 'study_updated':
        return `${user.name} updated study "${target.title}"`;
      case 'study_approved':
        return `${user.name} approved study "${target.title}"`;
      case 'study_rejected':
        return `${user.name} rejected study "${target.title}"`;
      case 'comment_added':
        return `${user.name} commented on "${target.title}"`;
      case 'user_joined':
        return `${user.name} joined the workspace`;
      case 'template_created':
        return `${user.name} created template "${target.title}"`;
      case 'block_added':
        return `${user.name} added ${metadata?.blockType || 'a block'} to "${target.title}"`;
      case 'block_updated':
        return `${user.name} updated ${metadata?.blockType || 'a block'} in "${target.title}"`;
      case 'collaboration_started':
        return `${user.name} started collaborating on "${target.title}"`;
      case 'approval_requested':
        return `${user.name} requested approval for "${target.title}"`;
      default:
        return `${user.name} performed an action on "${target.title}"`;
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const toggleExpanded = (activityId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedItems(newExpanded);
  };

  const renderActivityGroup = (title: string, activities: ActivityItem[]) => {
    if (activities.length === 0) return null;

    return (
      <div key={title} className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 px-2">{title}</h3>
        {activities.map((activity) => (
          <ActivityItemCard
            key={activity.id}
            activity={activity}
            currentUser={currentUser}
            compact={compact}
            isExpanded={expandedItems.has(activity.id)}
            onToggleExpanded={() => toggleExpanded(activity.id)}
            onClick={() => onActivityClick?.(activity)}
            onUserMention={onUserMention}
            getActivityIcon={getActivityIcon}
            getActivityMessage={getActivityMessage}
            formatRelativeTime={formatRelativeTime}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Clock className="h-4 w-4" />}
                />
              </div>
            </div>

            {showFilters && (
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">Type:</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as ActivityType | 'all')}
                    className="px-3 py-1 rounded border border-gray-300 bg-white text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="study_created">Study Created</option>
                    <option value="study_updated">Study Updated</option>
                    <option value="study_approved">Study Approved</option>
                    <option value="comment_added">Comment Added</option>
                    <option value="collaboration_started">Collaboration</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {filteredActivities.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">No recent activity</h3>
            <p className="text-gray-600">
              Activity from your team will appear here as it happens.
            </p>
          </Card>
        ) : compact ? (
          <Card className="p-4">
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <ActivityItemCard
                  key={activity.id}
                  activity={activity}
                  currentUser={currentUser}
                  compact={true}
                  isExpanded={false}
                  onToggleExpanded={() => {}}
                  onClick={() => onActivityClick?.(activity)}
                  onUserMention={onUserMention}
                  getActivityIcon={getActivityIcon}
                  getActivityMessage={getActivityMessage}
                  formatRelativeTime={formatRelativeTime}
                />
              ))}
            </div>
          </Card>
        ) : (
          <>
            {renderActivityGroup('Today', groupedActivities.today)}
            {renderActivityGroup('Yesterday', groupedActivities.yesterday)}
            {renderActivityGroup('This Week', groupedActivities.thisWeek)}
            {renderActivityGroup('Older', groupedActivities.older)}
          </>
        )}
      </div>
    </div>
  );
};

// Separate component for activity item to keep main component clean
interface ActivityItemCardProps {
  activity: ActivityItem;
  currentUser: ActivityUser;
  compact: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onClick?: () => void;
  onUserMention?: (user: ActivityUser, activity: ActivityItem) => void;
  getActivityIcon: (type: ActivityType) => React.ReactNode;
  getActivityMessage: (activity: ActivityItem) => string;
  formatRelativeTime: (date: Date) => string;
}

const ActivityItemCard: React.FC<ActivityItemCardProps> = ({
  activity,
  currentUser,
  compact,
  isExpanded,
  onToggleExpanded,
  onClick,
  onUserMention,
  getActivityIcon,
  getActivityMessage,
  formatRelativeTime
}) => {
  const isMentioned = activity.mentions?.some(user => user.id === currentUser.id);
  const hasDetails = activity.metadata?.comment || activity.metadata?.collaborators;

  return (
    <Card 
      className={`p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isMentioned ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${!activity.isRead ? 'bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Activity Icon */}
        <div className="flex-shrink-0 mt-1">
          {getActivityIcon(activity.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-900">
              {getActivityMessage(activity)}
            </p>
            <div className="flex items-center gap-2">
              {isMentioned && (
                <Badge variant="info" size="sm">@mentioned</Badge>
              )}
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
          </div>

          {!compact && (
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{activity.user.name}</span>
                <Badge variant="secondary" size="sm">{activity.user.role}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="capitalize">{activity.target.type}</span>
              </div>
            </div>
          )}

          {/* Expandable Details */}
          {hasDetails && !compact && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded();
                }}
                className="text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show Details
                  </>
                )}
              </Button>

              {isExpanded && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  {activity.metadata?.comment && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-700">{activity.metadata.comment}</p>
                    </div>
                  )}
                  {activity.metadata?.collaborators && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Collaborators:</p>
                      <div className="flex items-center gap-2">
                        {activity.metadata.collaborators.map((user) => (
                          <Badge
                            key={user.id}
                            variant="secondary"
                            size="sm"
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUserMention?.(user, activity);
                            }}
                          >
                            {user.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActivityFeed;
