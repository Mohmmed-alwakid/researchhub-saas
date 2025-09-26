import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import StudyApprovalCard from './StudyApprovalCard';

import type { WorkspaceRole } from '../../../shared/types/index';

// Local types for approval queue
export type ApprovalPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface ApprovalItem {
  id: string;
  item: {
    id: string;
    title: string;
    type: 'study' | 'template' | 'workspace';
  };
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: Date;
  priority: ApprovalPriority;
  status: ApprovalStatus;
  reviewedBy?: {
    id: string;
    name: string;
  };
  reviewedAt?: Date;
  comments?: string;
}

interface ApprovalQueueProps {
  /** List of items pending approval */
  approvals: ApprovalItem[];
  /** Current user's role for permission checks */
  userRole: WorkspaceRole;
  /** Callback when approval action is taken */
  onApprovalAction: (approvalId: string, action: 'approve' | 'reject' | 'request_changes', comment?: string) => void;
  /** Callback for bulk approval actions */
  onBulkAction: (approvalIds: string[], action: 'approve' | 'reject') => void;
  /** Loading state */
  isLoading?: boolean;
}

type FilterStatus = ApprovalStatus | 'all';
type FilterPriority = ApprovalPriority | 'all';

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  approvals,
  userRole,
  onApprovalAction,
  onBulkAction,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('pending');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Permission check - only owners and editors can approve
  const canApprove = userRole === 'owner' || userRole === 'editor';

  // Filter and search logic
  const filteredApprovals = useMemo(() => {
    return approvals.filter(approval => {
      const matchesSearch = searchQuery === '' || 
        approval.item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [approvals, searchQuery, statusFilter, priorityFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = approvals.length;
    const pending = approvals.filter(a => a.status === 'pending').length;
    const approved = approvals.filter(a => a.status === 'approved').length;
    const rejected = approvals.filter(a => a.status === 'rejected').length;
    const urgent = approvals.filter(a => a.priority === 'urgent').length;

    return { total, pending, approved, rejected, urgent };
  }, [approvals]);

  const handleSelectAll = () => {
    if (selectedApprovals.size === filteredApprovals.length) {
      setSelectedApprovals(new Set());
    } else {
      setSelectedApprovals(new Set(filteredApprovals.map(a => a.id)));
    }
  };

  const handleSelectApproval = (approvalId: string) => {
    const newSelected = new Set(selectedApprovals);
    if (newSelected.has(approvalId)) {
      newSelected.delete(approvalId);
    } else {
      newSelected.add(approvalId);
    }
    setSelectedApprovals(newSelected);
  };

  const handleBulkApprove = () => {
    if (selectedApprovals.size > 0) {
      onBulkAction(Array.from(selectedApprovals), 'approve');
      setSelectedApprovals(new Set());
    }
  };

  const handleBulkReject = () => {
    if (selectedApprovals.size > 0) {
      onBulkAction(Array.from(selectedApprovals), 'reject');
      setSelectedApprovals(new Set());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Approval Queue
            </h1>
            <p className="text-sm mt-1 text-gray-600">
              Review and manage pending study approvals
            </p>
          </div>
          {canApprove && selectedApprovals.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedApprovals.size} selected
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={handleBulkApprove}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve Selected
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleBulkReject}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject Selected
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by study title or submitter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="changes_requested">Changes Requested</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {canApprove && filteredApprovals.length > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedApprovals.size === filteredApprovals.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Select All ({filteredApprovals.length})
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Approval List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading approvals...</p>
          </Card>
        ) : filteredApprovals.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">No approvals found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'There are no pending approvals at this time.'
              }
            </p>
          </Card>
        ) : (
          filteredApprovals.map((approval) => (
            <StudyApprovalCard
              key={approval.id}
              approval={approval}
              isSelected={selectedApprovals.has(approval.id)}
              onSelect={() => handleSelectApproval(approval.id)}
              onApprovalAction={onApprovalAction}
              canApprove={canApprove}
              showCheckbox={canApprove}
            />
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredApprovals.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredApprovals.length} of {approvals.length} approvals
          {selectedApprovals.size > 0 && ` (${selectedApprovals.size} selected)`}
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
