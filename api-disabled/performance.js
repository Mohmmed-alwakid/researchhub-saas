/**
 * Performance Issue Reporting API
 * Handles performance monitoring and issue reporting
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'report-issue':
        return await handleReportIssue(req, res);
      case 'get-issues':
        return await handleGetIssues(req, res);
      case 'update-issue':
        return await handleUpdateIssue(req, res);
      case 'get-performance-stats':
        return await handleGetPerformanceStats(req, res);
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Supported: report-issue, get-issues, update-issue, get-performance-stats' 
        });
    }
  } catch (error) {
    console.error('Performance API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Report a new performance issue
 */
async function handleReportIssue(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      type,
      description,
      url,
      userAgent,
      performanceMetrics,
      screenshot,
      userId,
      sessionId,
      severity
    } = req.body;

    // Validate required fields
    if (!type || !description || !url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, description, url'
      });
    }

    // Insert into performance_issues table
    const { data: issue, error } = await supabase
      .from('performance_issues')
      .insert({
        type,
        description,
        url,
        user_agent: userAgent,
        performance_metrics: performanceMetrics,
        screenshot,
        user_id: userId,
        session_id: sessionId,
        severity: severity || 'medium',
        status: 'open',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting performance issue:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save issue report'
      });
    }

    return res.status(200).json({
      success: true,
      data: issue,
      message: 'Issue reported successfully'
    });

  } catch (error) {
    console.error('Error reporting issue:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to report issue'
    });
  }
}

/**
 * Get performance issues (admin only)
 */
async function handleGetIssues(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get auth token and verify admin role
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { status, type, severity, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('performance_issues')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: issues, error } = await query;

    if (error) {
      console.error('Error fetching issues:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch issues'
      });
    }

    return res.status(200).json({
      success: true,
      data: issues,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: issues.length
      }
    });

  } catch (error) {
    console.error('Error fetching issues:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch issues'
    });
  }
}

/**
 * Update issue status (admin only)
 */
async function handleUpdateIssue(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get auth token and verify admin role
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { issueId } = req.query;
    const { status, notes } = req.body;

    if (!issueId) {
      return res.status(400).json({ success: false, error: 'Issue ID required' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.admin_notes = notes;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedIssue, error } = await supabase
      .from('performance_issues')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .single();

    if (error) {
      console.error('Error updating issue:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update issue'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedIssue,
      message: 'Issue updated successfully'
    });

  } catch (error) {
    console.error('Error updating issue:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update issue'
    });
  }
}

/**
 * Get performance statistics
 */
async function handleGetPerformanceStats(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get basic stats
    const { data: stats } = await supabase
      .from('performance_issues')
      .select('type, severity, status')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    const statsMap = {
      total: stats?.length || 0,
      byType: {},
      bySeverity: {},
      byStatus: {}
    };

    stats?.forEach(issue => {
      // Count by type
      statsMap.byType[issue.type] = (statsMap.byType[issue.type] || 0) + 1;
      
      // Count by severity
      statsMap.bySeverity[issue.severity] = (statsMap.bySeverity[issue.severity] || 0) + 1;
      
      // Count by status
      statsMap.byStatus[issue.status] = (statsMap.byStatus[issue.status] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: statsMap
    });

  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch performance statistics'
    });
  }
}
