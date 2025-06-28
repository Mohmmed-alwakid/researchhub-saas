/**
 * Collaboration API Endpoint
 * Handles real-time collaboration features including presence, activity, and synchronization
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
      case 'join_session':
        return await handleJoinSession(req, res, user);
      case 'leave_session':
        return await handleLeaveSession(req, res, user);
      case 'update_presence':
        return await handleUpdatePresence(req, res, user);
      case 'get_active_sessions':
        return await handleGetActiveSessions(req, res, user);
      case 'broadcast_edit':
        return await handleBroadcastEdit(req, res, user);
      case 'get_activity_feed':
        return await handleGetActivityFeed(req, res, user);
      case 'log_activity':
        return await handleLogActivity(req, res, user);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Collaboration API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * Handle user joining a collaboration session
 */
async function handleJoinSession(req, res, user) {
  const { entityType, entityId, workspaceId } = req.body;

  if (!entityType || !entityId || !workspaceId) {
    return res.status(400).json({ 
      success: false, 
      error: 'entityType, entityId, and workspaceId are required' 
    });
  }

  try {
    // Insert or update collaboration session
    const { data, error } = await supabase
      .from('collaboration_sessions')
      .upsert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        workspace_id: workspaceId,
        joined_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        status: 'active',
        cursor_position: null,
        current_element: null
      }, {
        onConflict: 'user_id,entity_type,entity_id'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to join session' });
    }

    // Log activity
    await logActivity(user.id, 'collaboration_joined', entityType, entityId, workspaceId, {
      entityName: `${entityType}-${entityId}`
    });

    return res.status(200).json({ 
      success: true, 
      data: data[0],
      message: 'Successfully joined collaboration session' 
    });
  } catch (error) {
    console.error('Join session error:', error);
    return res.status(500).json({ success: false, error: 'Failed to join session' });
  }
}

/**
 * Handle user leaving a collaboration session
 */
async function handleLeaveSession(req, res, user) {
  const { entityType, entityId } = req.body;

  if (!entityType || !entityId) {
    return res.status(400).json({ 
      success: false, 
      error: 'entityType and entityId are required' 
    });
  }

  try {
    const { error } = await supabase
      .from('collaboration_sessions')
      .delete()
      .match({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId
      });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to leave session' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully left collaboration session' 
    });
  } catch (error) {
    console.error('Leave session error:', error);
    return res.status(500).json({ success: false, error: 'Failed to leave session' });
  }
}

/**
 * Handle updating user presence information
 */
async function handleUpdatePresence(req, res, user) {
  const { entityType, entityId, cursorPosition, currentElement, status } = req.body;

  if (!entityType || !entityId) {
    return res.status(400).json({ 
      success: false, 
      error: 'entityType and entityId are required' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('collaboration_sessions')
      .update({
        last_seen: new Date().toISOString(),
        cursor_position: cursorPosition,
        current_element: currentElement,
        status: status || 'active'
      })
      .match({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update presence' });
    }

    return res.status(200).json({ 
      success: true, 
      data: data[0],
      message: 'Presence updated successfully' 
    });
  } catch (error) {
    console.error('Update presence error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update presence' });
  }
}

/**
 * Get active collaboration sessions for an entity
 */
async function handleGetActiveSessions(req, res, user) {
  const { entityType, entityId } = req.query;

  if (!entityType || !entityId) {
    return res.status(400).json({ 
      success: false, 
      error: 'entityType and entityId are required' 
    });
  }

  try {
    // Get active sessions (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('collaboration_sessions')
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .match({
        entity_type: entityType,
        entity_id: entityId
      })
      .gte('last_seen', fiveMinutesAgo)
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get active sessions' });
    }

    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get active sessions' });
  }
}

/**
 * Handle broadcasting edit operations
 */
async function handleBroadcastEdit(req, res, user) {
  const { entityType, entityId, operation, elementId, data, timestamp } = req.body;

  if (!entityType || !entityId || !operation || !elementId) {
    return res.status(400).json({ 
      success: false, 
      error: 'entityType, entityId, operation, and elementId are required' 
    });
  }

  try {
    // Store the edit operation for synchronization
    const { data: editData, error } = await supabase
      .from('collaboration_edits')
      .insert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        operation_type: operation,
        element_id: elementId,
        operation_data: data,
        timestamp: timestamp || new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to broadcast edit' });
    }

    // Log activity for significant edits
    if (['create', 'delete', 'major_update'].includes(operation)) {
      await logActivity(user.id, 'content_edited', entityType, entityId, null, {
        operation,
        elementId,
        elementType: data?.type || 'unknown'
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: editData[0],
      message: 'Edit broadcasted successfully' 
    });
  } catch (error) {
    console.error('Broadcast edit error:', error);
    return res.status(500).json({ success: false, error: 'Failed to broadcast edit' });
  }
}

/**
 * Get activity feed for workspace or entity
 */
async function handleGetActivityFeed(req, res, user) {
  const { workspaceId, entityType, entityId, limit = 50, offset = 0 } = req.query;

  try {
    let query = supabase
      .from('collaboration_activity')
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .order('timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Filter by workspace or specific entity
    if (entityType && entityId) {
      query = query.match({ entity_type: entityType, entity_id: entityId });
    } else if (workspaceId) {
      query = query.match({ workspace_id: workspaceId });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Either workspaceId or entityType+entityId is required' 
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get activity feed' });
    }

    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get activity feed error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get activity feed' });
  }
}

/**
 * Log a new activity
 */
async function handleLogActivity(req, res, user) {
  const { activityType, entityType, entityId, workspaceId, metadata } = req.body;

  if (!activityType || !entityType || !entityId) {
    return res.status(400).json({ 
      success: false, 
      error: 'activityType, entityType, and entityId are required' 
    });
  }

  try {
    const result = await logActivity(user.id, activityType, entityType, entityId, workspaceId, metadata);
    
    return res.status(200).json({ 
      success: true, 
      data: result,
      message: 'Activity logged successfully' 
    });
  } catch (error) {
    console.error('Log activity error:', error);
    return res.status(500).json({ success: false, error: 'Failed to log activity' });
  }
}

/**
 * Utility function to log activity
 */
async function logActivity(userId, activityType, entityType, entityId, workspaceId, metadata = {}) {
  const { data, error } = await supabase
    .from('collaboration_activity')
    .insert({
      user_id: userId,
      activity_type: activityType,
      entity_type: entityType,
      entity_id: entityId,
      workspace_id: workspaceId,
      metadata: metadata,
      timestamp: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('Log activity error:', error);
    throw error;
  }

  return data[0];
}
