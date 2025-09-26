import { createClient } from '@supabase/supabase-js';


/**
 * Approvals API
 * Handles approval workflow system
 */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'get_approvals':
        return handleGetApprovals(req, res);
      case 'request_approval':
        return handleRequestApproval(req, res);
      case 'approve':
        return handleApprove(req, res);
      case 'reject':
        return handleReject(req, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Approvals API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetApprovals(req, res) {
  const { workspaceId, status } = req.query;
    try {
      let query = supabase.from('approvals').select('*');
      if (workspaceId) query = query.eq('workspaceId', workspaceId);
      if (status) query = query.eq('status', status);
      query = query.order('createdAt', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
}

async function handleRequestApproval(req, res) {
  const { entityType, entityId, workspaceId, requestedBy, approvalType } = req.body;
    try {
      const { data, error } = await supabase
        .from('approvals')
        .insert([
          {
            entityType,
            entityId,
            workspaceId,
            requestedBy,
            approvalType,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ])
        .select();
      if (error) throw error;
      return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
}

async function handleApprove(req, res) {
  const { approvalId, approvedBy, notes } = req.body;
    try {
      const { data, error } = await supabase
        .from('approvals')
        .update({ status: 'approved', approvedBy, notes, approvedAt: new Date().toISOString() })
        .eq('id', approvalId)
        .select();
      if (error) throw error;
      return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
}

async function handleReject(req, res) {
  const { approvalId, rejectedBy, reason } = req.body;
    try {
      const { data, error } = await supabase
        .from('approvals')
        .update({ status: 'rejected', rejectedBy, reason, rejectedAt: new Date().toISOString() })
        .eq('id', approvalId)
        .select();
      if (error) throw error;
      return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
}
