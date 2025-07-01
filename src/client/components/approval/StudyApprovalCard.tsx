import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, User, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

// Local types for approval queue
type ApprovalPriority = 'urgent' | 'high' | 'medium' | 'low';
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

interface ApprovalItem {
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

interface StudyApprovalCardProps {
  /** Approval item data */
  approval: ApprovalItem;
  /** Whether this card is selected for bulk actions */
  isSelected: boolean;
  /** Callback when card is selected */
  onSelect: () => void;
  /** Callback when approval action is taken */
  onApprovalAction: (approvalId: string, action: 'approve' | 'reject' | 'request_changes', comment?: string) => void;
  /** Whether current user can approve */
  canApprove: boolean;
  /** Whether to show selection checkbox */
  showCheckbox: boolean;
}

const StudyApprovalCard: React.FC<StudyApprovalCardProps> = ({
  approval,
  isSelected,
  onSelect,
  onApprovalAction,
  canApprove,
  showCheckbox
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');

  const handleApprove = () => {
    onApprovalAction(approval.id, 'approve');
  };

  const handleReject = () => {
    if (comment.trim()) {
      onApprovalAction(approval.id, 'reject', comment);
      setComment('');
      setShowCommentForm(false);
    } else {
      setShowCommentForm(true);
    }
  };

  const handleRequestChanges = () => {
    if (comment.trim()) {
      onApprovalAction(approval.id, 'request_changes', comment);
      setComment('');
      setShowCommentForm(false);
    } else {
      setShowCommentForm(true);
    }
  };

  const getStatusBadge = () => {
    switch (approval.status) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'changes_requested':
        return <Badge variant="warning">Changes Requested</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = () => {
    switch (approval.priority) {
      case 'urgent':
        return <Badge variant="error" size="sm">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="info" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary" size="sm">Low</Badge>;
      default:
        return null;
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

  return (
    <Card className={`p-6 transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {showCheckbox && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {approval.item.title}
                </h3>
                {getPriorityBadge()}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{approval.submittedBy.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(approval.submittedAt)}</span>
                </div>
                <span className="capitalize text-blue-600">
                  {approval.item.type}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Existing Comments */}
        {approval.comments && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{approval.comments}</p>
            {approval.reviewedBy && approval.reviewedAt && (
              <p className="text-xs text-gray-500 mt-1">
                - {approval.reviewedBy.name} on {formatDate(approval.reviewedAt)}
              </p>
            )}
          </div>
        )}

        {/* Comment Form */}
        {showCommentForm && (
          <div className="space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please provide feedback or reason for your decision..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  if (comment.trim()) {
                    setComment('');
                    setShowCommentForm(false);
                  }
                }}
                disabled={!comment.trim()}
              >
                Submit Comment
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setComment('');
                  setShowCommentForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canApprove && approval.status === 'pending' && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              variant="primary"
              onClick={handleApprove}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestChanges}
              className="flex items-center gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              Request Changes
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleReject}
              className="flex items-center gap-1"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudyApprovalCard;
