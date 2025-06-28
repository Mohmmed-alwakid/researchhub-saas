import React, { useState, useMemo } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, User, Calendar, Search, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ApprovalItem, ApprovalStatus } from './ApprovalQueue';

interface ApprovalHistoryProps {
  /** List of historical approval items */
  approvals: ApprovalItem[];
  /** Loading state */
  isLoading?: boolean;
  /** Show only specific user's approvals */
  userId?: string;
}

interface ApprovalTimelineEvent {
  id: string;
  approvalId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'changes_requested' | 'updated';
  actor: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: Date;
  comment?: string;
  studyTitle: string;
  studyType: string;
}

const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({
  approvals,
  isLoading = false,
  userId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Convert approvals to timeline events
  const timelineEvents = useMemo((): ApprovalTimelineEvent[] => {
    const events: ApprovalTimelineEvent[] = [];
    
    approvals.forEach(approval => {
      // Submitted event
      events.push({
        id: `${approval.id}-submitted`,
        approvalId: approval.id,
        action: 'submitted',
        actor: approval.submittedBy,
        timestamp: approval.submittedAt,
        studyTitle: approval.item.title,
        studyType: approval.item.type
      });

      // Review event if reviewed
      if (approval.reviewedBy && approval.reviewedAt) {
        events.push({
          id: `${approval.id}-reviewed`,
          approvalId: approval.id,
          action: approval.status === 'approved' ? 'approved' : 
                  approval.status === 'rejected' ? 'rejected' : 'changes_requested',
          actor: {
            id: approval.reviewedBy.id,
            name: approval.reviewedBy.name,
            email: ''
          },
          timestamp: approval.reviewedAt,
          comment: approval.comments,
          studyTitle: approval.item.title,
          studyType: approval.item.type
        });
      }
    });

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [approvals]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter(event => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        event.studyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.actor.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending' && event.action === 'submitted') ||
        (statusFilter === 'approved' && event.action === 'approved') ||
        (statusFilter === 'rejected' && event.action === 'rejected') ||
        (statusFilter === 'changes_requested' && event.action === 'changes_requested');

      // Time filter
      const now = new Date();
      const eventDate = event.timestamp;
      const matchesTime = timeFilter === 'all' ||
        (timeFilter === 'today' && isSameDay(eventDate, now)) ||
        (timeFilter === 'week' && isWithinDays(eventDate, now, 7)) ||
        (timeFilter === 'month' && isWithinDays(eventDate, now, 30));

      // User filter
      const matchesUser = !userId || event.actor.id === userId;

      return matchesSearch && matchesStatus && matchesTime && matchesUser;
    });
  }, [timelineEvents, searchQuery, statusFilter, timeFilter, userId]);

  const getActionIcon = (action: ApprovalTimelineEvent['action']) => {
    switch (action) {
      case 'submitted':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'changes_requested':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionBadge = (action: ApprovalTimelineEvent['action']) => {
    switch (action) {
      case 'submitted':
        return <Badge variant="info" size="sm">Submitted</Badge>;
      case 'approved':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error" size="sm">Rejected</Badge>;
      case 'changes_requested':
        return <Badge variant="warning" size="sm">Changes Requested</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Updated</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return formatDate(date);
    }
  };

  // Helper functions
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isWithinDays = (date: Date, referenceDate: Date, days: number) => {
    const diffTime = referenceDate.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Approval History</h1>
        <p className="text-sm mt-1 text-gray-600">
          {userId ? 'Your approval activity' : 'Complete audit trail of approval activities'}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by study title or reviewer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | 'all')}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="changes_requested">Changes Requested</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Time:</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as typeof timeFilter)}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading approval history...</p>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">No approval history found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'No approval activities have been recorded yet.'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline connector */}
                {index < filteredEvents.length - 1 && (
                  <div className="absolute left-6 top-12 h-6 w-0.5 bg-gray-200"></div>
                )}
                
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Action icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(event.action)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {event.studyTitle}
                          </h3>
                          {getActionBadge(event.action)}
                          <span className="text-sm text-blue-600 capitalize">
                            {event.studyType}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatRelativeTime(event.timestamp)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{event.actor.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      </div>
                      
                      {event.comment && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                          {event.comment}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredEvents.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredEvents.length} of {timelineEvents.length} events
        </div>
      )}
    </div>
  );
};

export default ApprovalHistory;
