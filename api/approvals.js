/**
 * Approval Workflow API Endpoint
 * Handles approval queue management, bulk actions, and approval history
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Authorization header required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    switch (action) {
      case 'get_queue':
        return await handleGetApprovalQueue(req, res, user);
      case 'submit_for_approval':
        return await handleSubmitForApproval(req, res, user);
      case 'approve':
        return await handleApprovalAction(req, res, user, 'approved');
      case 'reject':
        return await handleApprovalAction(req, res, user, 'rejected');
      case 'request_changes':
        return await handleApprovalAction(req, res, user, 'changes_requested');
      case 'bulk_approve':
        return await handleBulkApproval(req, res, user, 'approved');
      case 'bulk_reject':
        return await handleBulkApproval(req, res, user, 'rejected');
      case 'get_history':
        return await handleGetApprovalHistory(req, res, user);
      case 'get_stats':
        return await handleGetApprovalStats(req, res, user);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Approval API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * Get approval queue with filtering and pagination
 */
async function handleGetApprovalQueue(req, res, user) {
  const { 
    workspaceId, 
    status = 'pending', 
    priority, 
    entityType,
    submittedBy,
    limit = 20, 
    offset = 0 
  } = req.query;

  if (!workspaceId) {
    return res.status(400).json({ success: false, error: 'workspaceId is required' });
  }

  try {
    // Check user permissions for this workspace
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .match({ workspace_id: workspaceId, user_id: user.id })
      .single();

    if (memberError || !memberData) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    let query = supabase
      .from('approval_queue')
      .select(`
        *,
        submitter:submitted_by (
          id,
          email,
          user_metadata
        ),
        reviewer:reviewed_by (
          id,
          email,
          user_metadata
        )
      `)
      .match({ workspace_id: workspaceId })
      .order('submitted_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (submittedBy) {
      query = query.eq('submitted_by', submittedBy);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get approval queue' });
    }

    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0,
      userRole: memberData.role
    });
  } catch (error) {
    console.error('Get approval queue error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get approval queue' });
  }
}

/**
 * Submit an item for approval
 */
async function handleSubmitForApproval(req, res, user) {
  const { 
    workspaceId, 
    entityType, 
    entityId, 
    entityTitle,
    priority = 'medium',
    comments,
    metadata = {}
  } = req.body;

  if (!workspaceId || !entityType || !entityId || !entityTitle) {
    return res.status(400).json({ 
      success: false, 
      error: 'workspaceId, entityType, entityId, and entityTitle are required' 
    });
  }

  try {
    // Check if already submitted
    const { data: existing } = await supabase
      .from('approval_queue')
      .select('id, status')
      .match({
        workspace_id: workspaceId,
        entity_type: entityType,
        entity_id: entityId,
        status: 'pending'
      })
      .single();

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'Item is already pending approval' 
      });
    }

    const { data, error } = await supabase
      .from('approval_queue')
      .insert({
        workspace_id: workspaceId,
        entity_type: entityType,
        entity_id: entityId,
        entity_title: entityTitle,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        priority: priority,
        status: 'pending',
        comments: comments,
        metadata: metadata
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to submit for approval' });
    }

    // Log activity
    await logApprovalActivity(user.id, 'approval_submitted', workspaceId, entityType, entityId, {
      entityTitle,
      priority
    });

    return res.status(201).json({ 
      success: true, 
      data: data[0],
      message: 'Successfully submitted for approval' 
    });
  } catch (error) {
    console.error('Submit for approval error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit for approval' });
  }
}

/**
 * Handle approval action (approve, reject, request changes)
 */
async function handleApprovalAction(req, res, user, action) {
  const { approvalId, comments, metadata = {} } = req.body;

  if (!approvalId) {
    return res.status(400).json({ success: false, error: 'approvalId is required' });
  }

  try {
    // Get the approval item
    const { data: approval, error: getError } = await supabase
      .from('approval_queue')
      .select('*, workspace_id, entity_type, entity_id, entity_title')
      .eq('id', approvalId)
      .single();

    if (getError || !approval) {
      return res.status(404).json({ success: false, error: 'Approval not found' });
    }

    // Check user permissions
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .match({ workspace_id: approval.workspace_id, user_id: user.id })
      .single();

    if (memberError || !memberData || !['owner', 'editor'].includes(memberData.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    // Update approval status
    const { data, error } = await supabase
      .from('approval_queue')
      .update({
        status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_comments: comments,
        review_metadata: metadata
      })
      .eq('id', approvalId)
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update approval' });
    }

    // Create approval history entry
    await supabase
      .from('approval_history')
      .insert({
        approval_id: approvalId,
        action: action,
        performed_by: user.id,
        performed_at: new Date().toISOString(),
        comments: comments,
        metadata: metadata
      });

    // Log activity
    await logApprovalActivity(user.id, `approval_${action}`, approval.workspace_id, approval.entity_type, approval.entity_id, {
      entityTitle: approval.entity_title,
      approvalId
    });

    return res.status(200).json({ 
      success: true, 
      data: data[0],
      message: `Successfully ${action} item` 
    });
  } catch (error) {
    console.error('Approval action error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process approval' });
  }
}

/**
 * Handle bulk approval actions
 */
async function handleBulkApproval(req, res, user, action) {
  const { approvalIds, comments, workspaceId } = req.body;

  if (!approvalIds || !Array.isArray(approvalIds) || approvalIds.length === 0) {
    return res.status(400).json({ success: false, error: 'approvalIds array is required' });
  }

  if (!workspaceId) {
    return res.status(400).json({ success: false, error: 'workspaceId is required' });
  }

  try {
    // Check user permissions
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .match({ workspace_id: workspaceId, user_id: user.id })
      .single();

    if (memberError || !memberData || !['owner', 'editor'].includes(memberData.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    // Perform bulk update
    const { data, error } = await supabase
      .from('approval_queue')
      .update({
        status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_comments: comments
      })
      .in('id', approvalIds)
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to perform bulk approval' });
    }

    // Create history entries for each approval
    const historyPromises = approvalIds.map(approvalId => 
      supabase
        .from('approval_history')
        .insert({
          approval_id: approvalId,
          action: action,
          performed_by: user.id,
          performed_at: new Date().toISOString(),
          comments: comments,
          metadata: { bulk_action: true }
        })
    );

    await Promise.all(historyPromises);

    // Log activity
    await logApprovalActivity(user.id, `bulk_approval_${action}`, workspaceId, 'multiple', 'bulk', {
      count: data?.length || 0,
      approvalIds
    });

    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0,
      message: `Successfully ${action} ${data?.length || 0} items` 
    });
  } catch (error) {
    console.error('Bulk approval error:', error);
    return res.status(500).json({ success: false, error: 'Failed to perform bulk approval' });
  }
}

/**
 * Get approval history for an item or workspace
 */
async function handleGetApprovalHistory(req, res, user) {
  const { workspaceId, approvalId, entityType, entityId, limit = 20, offset = 0 } = req.query;

  if (!workspaceId) {
    return res.status(400).json({ success: false, error: 'workspaceId is required' });
  }

  try {
    let query = supabase
      .from('approval_history')
      .select(`
        *,
        performer:performed_by (
          id,
          email,
          user_metadata
        ),
        approval:approval_id (
          entity_type,
          entity_id,
          entity_title,
          workspace_id
        )
      `)
      .order('performed_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (approvalId) {
      query = query.eq('approval_id', approvalId);
    } else {
      // Filter by workspace through approval table
      query = query.eq('approval.workspace_id', workspaceId);
    }

    if (entityType && entityId) {
      query = query.eq('approval.entity_type', entityType)
                   .eq('approval.entity_id', entityId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get approval history' });
    }

    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get approval history error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get approval history' });
  }
}

/**
 * Get approval statistics for a workspace
 */
async function handleGetApprovalStats(req, res, user) {
  const { workspaceId, timeframe = '30d' } = req.query;

  if (!workspaceId) {
    return res.status(400).json({ success: false, error: 'workspaceId is required' });
  }

  try {
    // Calculate date range
    const now = new Date();
    const timeframeDays = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30;
    const startDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

    // Get overall stats
    const { data: overallStats, error: overallError } = await supabase
      .from('approval_queue')
      .select('status, priority, submitted_at')
      .eq('workspace_id', workspaceId)
      .gte('submitted_at', startDate.toISOString());

    if (overallError) {
      console.error('Database error:', overallError);
      return res.status(500).json({ success: false, error: 'Failed to get approval stats' });
    }

    // Calculate statistics
    const total = overallStats.length;
    const pending = overallStats.filter(a => a.status === 'pending').length;
    const approved = overallStats.filter(a => a.status === 'approved').length;
    const rejected = overallStats.filter(a => a.status === 'rejected').length;
    const changesRequested = overallStats.filter(a => a.status === 'changes_requested').length;
    const urgent = overallStats.filter(a => a.priority === 'urgent').length;

    // Calculate approval rate
    const processed = approved + rejected + changesRequested;
    const approvalRate = processed > 0 ? (approved / processed * 100).toFixed(1) : 0;

    // Calculate average processing time
    const processedItems = overallStats.filter(a => a.status !== 'pending');
    const avgProcessingTime = processedItems.length > 0 
      ? processedItems.reduce((sum, item) => {
          const submitted = new Date(item.submitted_at);
          const reviewed = new Date(); // Simplified for demo
          return sum + (reviewed.getTime() - submitted.getTime());
        }, 0) / processedItems.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return res.status(200).json({ 
      success: true, 
      data: {
        timeframe,
        total,
        pending,
        approved,
        rejected,
        changesRequested,
        urgent,
        approvalRate: parseFloat(approvalRate),
        avgProcessingTimeHours: Math.round(avgProcessingTime * 10) / 10
      }
    });
  } catch (error) {
    console.error('Get approval stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get approval stats' });
  }
}

/**
 * Utility function to log approval activities
 */
async function logApprovalActivity(userId, activityType, workspaceId, entityType, entityId, metadata = {}) {
  try {
    await supabase
      .from('collaboration_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        entity_type: entityType,
        entity_id: entityId,
        workspace_id: workspaceId,
        metadata: metadata,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Log approval activity error:', error);
    // Don't throw - logging is not critical
  }
}
