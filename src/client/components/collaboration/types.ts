// 🚀 COLLABORATION SYSTEM TYPE FIXES

import { WorkspaceRole } from '../../../shared/types';

// Activity types for collaboration
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
  | 'collaboration_started';

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
    changes?: string[];
  };
}

// Event data structures for collaboration service
export interface CollaborationEventData {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: WorkspaceRole;
  };
  sessionId?: string;
  userId?: string;
  status?: 'online' | 'away' | 'offline';
  timestamp?: string;
  blockId?: string;
  isEditing?: boolean;
  activities?: ActivityItem[];
}

// Types for collaboration events
export interface UserJoinedData {
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
}

export interface UserLeftData {
  userId: string;
  timestamp: string;
}

export interface PresenceUpdateData {
  userId: string;
  status: 'online' | 'away' | 'offline';
  timestamp: string;
}

export interface EditingStatusData {
  userId: string;
  blockId?: string;
  isEditing: boolean;
  timestamp: string;
}

export interface ActivityUpdateData {
  activityId: string;
  userId: string;
  type: ActivityType;
  timestamp: string;
  metadata?: {
    studyId?: string;
    changes?: string[];
    description?: string;
  };
}
