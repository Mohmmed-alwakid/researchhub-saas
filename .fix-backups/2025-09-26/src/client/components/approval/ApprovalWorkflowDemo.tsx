import React, { useState, useEffect } from 'react';
import { ApprovalQueue, ApprovalHistory, type ApprovalItem } from '../approval';
import type { WorkspaceRole } from '../../../shared/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Clock, CheckCircle, Users, AlertTriangle } from 'lucide-react';

interface ApprovalWorkflowDemoProps {
  /** Current user's role */
  userRole: WorkspaceRole;
  /** Current user's ID */
  userId: string;
}

/**
 * Demo component showing how to integrate the approval workflow system
 * This component demonstrates:
 * - Approval queue management
 * - History tracking
 * - Real-time updates
 * - Integration with study creation flow
 */
const ApprovalWorkflowDemo: React.FC<ApprovalWorkflowDemoProps> = ({
  userRole,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockApprovals: ApprovalItem[] = [
      {
        id: '1',
        item: {
          id: 'study-1',
          title: 'Mobile App Usability Study',
          type: 'study'
        },
        submittedBy: {
          id: 'user-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com'
        },
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'high',
        status: 'pending'
      },
      {
        id: '2',
        item: {
          id: 'study-2',
          title: 'Website Navigation Test',
          type: 'study'
        },
        submittedBy: {
          id: 'user-2',
          name: 'Mike Chen',
          email: 'mike.chen@company.com'
        },
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'medium',
        status: 'approved',
        reviewedBy: {
          id: 'admin-1',
          name: 'Jessica Admin'
        },
        reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        comments: 'Looks good! Great research design and clear objectives.'
      },
      {
        id: '3',
        item: {
          id: 'template-1',
          title: 'E-commerce Checkout Template',
          type: 'template'
        },
        submittedBy: {
          id: 'user-3',
          name: 'Alex Rivera',
          email: 'alex.rivera@company.com'
        },
        submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        priority: 'urgent',
        status: 'changes_requested',
        reviewedBy: {
          id: 'admin-1',
          name: 'Jessica Admin'
        },
        reviewedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
        comments: 'Please add more context about the target audience and revise the task instructions for clarity.'
      }
    ];
    
    setApprovals(mockApprovals);
  }, []);

  const handleApprovalAction = async (
    approvalId: string, 
    action: 'approve' | 'reject' | 'request_changes', 
    comment?: string
  ) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setApprovals(prev => prev.map(approval => {
      if (approval.id === approvalId) {
        return {
          ...approval,
          status: action === 'approve' ? 'approved' : 
                  action === 'reject' ? 'rejected' : 'changes_requested',
          reviewedBy: {
            id: userId,
            name: 'Current User'
          },
          reviewedAt: new Date(),
          comments: comment || approval.comments
        };
      }
      return approval;
    }));
    
    setIsLoading(false);
  };

  const handleBulkAction = async (approvalIds: string[], action: 'approve' | 'reject') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setApprovals(prev => prev.map(approval => {
      if (approvalIds.includes(approval.id)) {
        return {
          ...approval,
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewedBy: {
            id: userId,
            name: 'Current User'
          },
          reviewedAt: new Date(),
          comments: `Bulk ${action}d by reviewer`
        };
      }
      return approval;
    }));
    
    setIsLoading(false);
  };

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const changesRequestedCount = approvals.filter(a => a.status === 'changes_requested').length;

  return (
    <div className="space-y-6">
      {/* Header with Overview */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Approval Workflow System
        </h1>
        <p className="text-gray-600 mb-6">
          Collaborative study approval management with audit trails and real-time updates
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Changes Needed</p>
                <p className="text-2xl font-bold text-yellow-600">{changesRequestedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{approvals.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <Button
          variant={activeTab === 'queue' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('queue')}
          className="pb-4 border-b-2 border-transparent data-[active=true]:border-blue-500"
          data-active={activeTab === 'queue'}
        >
          Approval Queue
          {pendingCount > 0 && (
            <Badge variant="warning" size="sm" className="ml-2">
              {pendingCount}
            </Badge>
          )}
        </Button>
        
        <Button
          variant={activeTab === 'history' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('history')}
          className="pb-4 border-b-2 border-transparent data-[active=true]:border-blue-500"
          data-active={activeTab === 'history'}
        >
          Approval History
        </Button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'queue' ? (
          <ApprovalQueue
            approvals={approvals}
            userRole={userRole}
            onApprovalAction={handleApprovalAction}
            onBulkAction={handleBulkAction}
            isLoading={isLoading}
          />
        ) : (
          <ApprovalHistory
            approvals={approvals}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Integration Notes */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Integration Notes
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>✅ Completed:</strong> Approval queue, history tracking, and individual approval cards with full TypeScript support
          </p>
          <p>
            <strong>🔄 Next Steps:</strong> Real-time notifications, email alerts, and integration with study creation modal
          </p>
          <p>
            <strong>🎯 Future Features:</strong> Advanced approval workflows, conditional routing, and approval analytics dashboard
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ApprovalWorkflowDemo;
