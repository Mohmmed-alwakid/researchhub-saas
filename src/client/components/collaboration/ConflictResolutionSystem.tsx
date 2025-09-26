import React, { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CollaboratorPresence } from '../../../shared/types';


interface ConflictResolutionProps {
  /** Active conflicts to resolve */
  conflicts: ConflictData[];
  /** Current user information */
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  /** Available collaborators */
  collaborators: CollaboratorPresence[];
  /** Callback when conflict is resolved */
  onResolveConflict: (conflictId: string, resolution: ConflictResolution) => void;
  /** Callback to request conflict resolution from another user */
  onRequestResolution: (conflictId: string, userId: string) => void;
  className?: string;
}

export interface ConflictData {
  id: string;
  type: 'edit_conflict' | 'approval_needed' | 'version_mismatch' | 'permission_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedElement: {
    type: 'block' | 'setting' | 'study' | 'template';
    id: string;
    name: string;
  };
  conflictingUsers: Array<{
    userId: string;
    userName: string;
    userAvatar?: string;
    action: string;
    timestamp: Date;
  }>;
  currentValue: unknown;
  proposedChanges: Array<{
    userId: string;
    value: unknown;
    timestamp: Date;
    reasoning?: string;
  }>;
  autoResolvable: boolean;
  requiresApproval: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface ConflictResolution {
  action: 'accept_current' | 'accept_proposed' | 'merge_changes' | 'custom_solution' | 'escalate';
  selectedProposal?: string; // User ID of selected proposal
  customValue?: unknown;
  reasoning?: string;
  notifyUsers?: string[]; // User IDs to notify
}

export const ConflictResolutionSystem: React.FC<ConflictResolutionProps> = ({
  conflicts,
  currentUser,
  collaborators,
  onResolveConflict,
  onRequestResolution,
  className = ''
}) => {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [resolutionReasoning, setResolutionReasoning] = useState('');
  const [customValue, setCustomValue] = useState<string>('');

  // Sort conflicts by severity and recency
  const sortedConflicts = [...conflicts].sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  const getSeverityColor = (severity: ConflictData['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: ConflictData['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
    }
  };

  const formatTimeSince = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleResolveConflict = (conflict: ConflictData, resolution: ConflictResolution) => {
    onResolveConflict(conflict.id, {
      ...resolution,
      reasoning: resolutionReasoning || undefined,
      customValue: customValue || undefined
    });
    
    setSelectedConflict(null);
    setResolutionReasoning('');
    setCustomValue('');
  };

  const canUserResolve = (conflict: ConflictData): boolean => {
    // Users can resolve conflicts they're involved in or if they have admin role
    const isInvolved = conflict.conflictingUsers.some(user => user.userId === currentUser.id);
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'owner';
    
    return isInvolved || isAdmin || !conflict.requiresApproval;
  };

  if (conflicts.length === 0) {
    return (
      <div className={`conflict-resolution-system ${className}`}>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-lg font-medium mb-1">No Conflicts</div>
          <div className="text-sm">All changes are in sync!</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`conflict-resolution-system space-y-4 ${className}`}>
      {/* Conflicts Overview */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Conflicts ({conflicts.length})
        </h3>
        <div className="flex items-center space-x-2">
          {['critical', 'high', 'medium', 'low'].map(severity => {
            const count = conflicts.filter(c => c.severity === severity).length;
            if (count === 0) return null;
            
            return (
              <Badge
                key={severity}
                variant={severity === 'critical' || severity === 'high' ? 'error' : 'warning'}
                size="sm"
              >
                {getSeverityIcon(severity as ConflictData['severity'])} {count}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-3">
        {sortedConflicts.map(conflict => (
          <Card
            key={conflict.id}
            className={`p-4 border-l-4 ${getSeverityColor(conflict.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">
                    {getSeverityIcon(conflict.severity)}
                  </span>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {conflict.title}
                  </h4>
                  <Badge variant="secondary" size="sm">
                    {conflict.affectedElement.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {conflict.description}
                </p>

                {/* Conflicting Users */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Conflicting users:
                  </span>
                  <div className="flex items-center space-x-1">
                    {conflict.conflictingUsers.map(user => (
                      <div key={user.userId} className="flex items-center space-x-1">
                        <Avatar
                          src={user.userAvatar}
                          alt={user.userName}
                          size="xs"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {user.userName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed Changes */}
                {conflict.proposedChanges.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Proposed solutions:
                    </span>
                    {conflict.proposedChanges.map((proposal, index) => {
                      const proposer = collaborators.find(c => c.id === proposal.userId);
                      return (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <Avatar
                                src={proposer?.avatar}
                                alt={proposer?.name || 'Unknown'}
                                size="xs"
                              />
                              <span className="font-medium">
                                {proposer?.name || 'Unknown User'}
                              </span>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {formatTimeSince(proposal.timestamp)}
                            </span>
                          </div>
                          {proposal.reasoning && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {proposal.reasoning}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resolution Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeSince(conflict.lastUpdated)}
                </span>
                
                {canUserResolve(conflict) ? (
                  <Button
                    onClick={() => setSelectedConflict(conflict.id)}
                    size="sm"
                    variant={conflict.severity === 'critical' ? 'primary' : 'outline'}
                  >
                    Resolve
                  </Button>
                ) : (
                  <Button
                    onClick={() => onRequestResolution(conflict.id, conflict.conflictingUsers[0]?.userId)}
                    size="sm"
                    variant="ghost"
                  >
                    Request Resolution
                  </Button>
                )}
              </div>
            </div>

            {/* Resolution Interface */}
            {selectedConflict === conflict.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Choose Resolution
                </h5>
                
                <div className="space-y-3">
                  {/* Quick Resolution Options */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleResolveConflict(conflict, { action: 'accept_current' })}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      ✅ Keep Current
                    </Button>
                    
                    {conflict.proposedChanges.length > 0 && (
                      <Button
                        onClick={() => handleResolveConflict(conflict, { 
                          action: 'accept_proposed',
                          selectedProposal: conflict.proposedChanges[0].userId
                        })}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        🔄 Accept Proposal
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleResolveConflict(conflict, { action: 'merge_changes' })}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      🔀 Merge Changes
                    </Button>
                    
                    <Button
                      onClick={() => handleResolveConflict(conflict, { action: 'escalate' })}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      ⬆️ Escalate
                    </Button>
                  </div>

                  {/* Custom Resolution */}
                  <div className="space-y-2">
                    <textarea
                      placeholder="Custom solution or reasoning..."
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={2}
                    />
                    
                    <textarea
                      placeholder="Reasoning for this resolution..."
                      value={resolutionReasoning}
                      onChange={(e) => setResolutionReasoning(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => setSelectedConflict(null)}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    
                    {customValue && (
                      <Button
                        onClick={() => handleResolveConflict(conflict, { 
                          action: 'custom_solution',
                          customValue
                        })}
                        size="sm"
                      >
                        Apply Custom Solution
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConflictResolutionSystem;
