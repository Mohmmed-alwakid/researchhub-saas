/**
 * Approval Service
 * Client-side service for approval workflow management
 */

import type { ApprovalItem, ApprovalPriority, ApprovalStatus } from '../components/approval/ApprovalQueue';

interface ApprovalFilter {
  status?: ApprovalStatus | 'all';
  priority?: ApprovalPriority | 'all';
  entityType?: string;
  submittedBy?: string;
  limit?: number;
  offset?: number;
}

interface ApprovalStats {
  timeframe: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  changesRequested: number;
  urgent: number;
  approvalRate: number;
  avgProcessingTimeHours: number;
}

interface ApprovalHistoryEntry {
  id: string;
  approvalId: string;
  action: 'approved' | 'rejected' | 'changes_requested' | 'resubmitted';
  performedBy: {
    id: string;
    name: string;
    email: string;
  };
  performedAt: Date;
  comments?: string;
  metadata: Record<string, unknown>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  userRole?: string;
}

class ApprovalService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3003');
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get approval queue with filtering
   */
  async getApprovalQueue(workspaceId: string, filters: ApprovalFilter = {}): Promise<{
    approvals: ApprovalItem[];
    count: number;
    userRole: string;
  }> {
    const params = new URLSearchParams({
      action: 'get_queue',
      workspaceId
    });

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await this.apiCall<{
      approvals: ApprovalItem[];
      count: number;
      userRole: string;
    }>(`/api/approvals?${params}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get approval queue');
    }

    return {
      approvals: response.data?.approvals || [],
      count: response.data?.count || 0,
      userRole: response.data?.userRole || 'viewer'
    };
  }

  /**
   * Submit an item for approval
   */
  async submitForApproval(
    workspaceId: string,
    entityType: string,
    entityId: string,
    entityTitle: string,
    priority: ApprovalPriority = 'medium',
    comments?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<ApprovalItem> {
    const response = await this.apiCall<ApprovalItem>('/api/approvals?action=submit_for_approval', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId,
        entityType,
        entityId,
        entityTitle,
        priority,
        comments,
        metadata
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to submit for approval');
    }

    return response.data!;
  }

  /**
   * Approve an item
   */
  async approveItem(
    approvalId: string,
    comments?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<ApprovalItem> {
    const response = await this.apiCall<ApprovalItem>('/api/approvals?action=approve', {
      method: 'POST',
      body: JSON.stringify({
        approvalId,
        comments,
        metadata
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to approve item');
    }

    return response.data!;
  }

  /**
   * Reject an item
   */
  async rejectItem(
    approvalId: string,
    comments?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<ApprovalItem> {
    const response = await this.apiCall<ApprovalItem>('/api/approvals?action=reject', {
      method: 'POST',
      body: JSON.stringify({
        approvalId,
        comments,
        metadata
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to reject item');
    }

    return response.data!;
  }

  /**
   * Request changes for an item
   */
  async requestChanges(
    approvalId: string,
    comments?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<ApprovalItem> {
    const response = await this.apiCall<ApprovalItem>('/api/approvals?action=request_changes', {
      method: 'POST',
      body: JSON.stringify({
        approvalId,
        comments,
        metadata
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to request changes');
    }

    return response.data!;
  }

  /**
   * Perform bulk approval
   */
  async bulkApprove(
    workspaceId: string,
    approvalIds: string[],
    comments?: string
  ): Promise<{
    approvals: ApprovalItem[];
    count: number;
  }> {
    const response = await this.apiCall<{
      approvals: ApprovalItem[];
      count: number;
    }>('/api/approvals?action=bulk_approve', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId,
        approvalIds,
        comments
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk approve');
    }

    return {
      approvals: response.data?.approvals || [],
      count: response.data?.count || 0
    };
  }

  /**
   * Perform bulk rejection
   */
  async bulkReject(
    workspaceId: string,
    approvalIds: string[],
    comments?: string
  ): Promise<{
    approvals: ApprovalItem[];
    count: number;
  }> {
    const response = await this.apiCall<{
      approvals: ApprovalItem[];
      count: number;
    }>('/api/approvals?action=bulk_reject', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId,
        approvalIds,
        comments
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk reject');
    }

    return {
      approvals: response.data?.approvals || [],
      count: response.data?.count || 0
    };
  }

  /**
   * Get approval history
   */
  async getApprovalHistory(
    workspaceId: string,
    approvalId?: string,
    entityType?: string,
    entityId?: string,
    limit = 20,
    offset = 0
  ): Promise<{
    history: ApprovalHistoryEntry[];
    count: number;
  }> {
    const params = new URLSearchParams({
      action: 'get_history',
      workspaceId,
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (approvalId) params.append('approvalId', approvalId);
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);

    const response = await this.apiCall<{
      history: ApprovalHistoryEntry[];
      count: number;
    }>(`/api/approvals?${params}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get approval history');
    }

    return {
      history: response.data?.history || [],
      count: response.data?.count || 0
    };
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats(
    workspaceId: string,
    timeframe: '7d' | '30d' | '90d' = '30d'
  ): Promise<ApprovalStats> {
    const params = new URLSearchParams({
      action: 'get_stats',
      workspaceId,
      timeframe
    });

    const response = await this.apiCall<ApprovalStats>(`/api/approvals?${params}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get approval stats');
    }

    return response.data!;
  }

  /**
   * Combined approval action handler
   */
  async handleApprovalAction(
    approvalId: string,
    action: 'approve' | 'reject' | 'request_changes',
    comments?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<ApprovalItem> {
    switch (action) {
      case 'approve':
        return this.approveItem(approvalId, comments, metadata);
      case 'reject':
        return this.rejectItem(approvalId, comments, metadata);
      case 'request_changes':
        return this.requestChanges(approvalId, comments, metadata);
      default:
        throw new Error(`Unknown approval action: ${action}`);
    }
  }

  /**
   * Combined bulk action handler
   */
  async handleBulkAction(
    workspaceId: string,
    approvalIds: string[],
    action: 'approve' | 'reject',
    comments?: string
  ): Promise<{
    approvals: ApprovalItem[];
    count: number;
  }> {
    switch (action) {
      case 'approve':
        return this.bulkApprove(workspaceId, approvalIds, comments);
      case 'reject':
        return this.bulkReject(workspaceId, approvalIds, comments);
      default:
        throw new Error(`Unknown bulk action: ${action}`);
    }
  }

  /**
   * API call utility
   */
  private async apiCall<T = unknown>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (!this.authToken) {
      throw new Error('Authentication token not set');
    }

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    };

    const response = await fetch(this.baseUrl + url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const approvalService = new ApprovalService();
export default ApprovalService;
