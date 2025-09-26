import { createClient } from '@supabase/supabase-js';


/**
 * Collaboration API
 * Handles real-time collaboration features
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
      case 'join_session':
        return handleJoinSession(req, res);
      case 'leave_session':
        return handleLeaveSession(req, res);
      case 'update_presence':
        return handleUpdatePresence(req, res);
      case 'broadcast_edit':
        return handleBroadcastEdit(req, res);
      case 'log_activity':
        return handleLogActivity(req, res);
      case 'get_active_sessions':
        return handleGetActiveSessions(req, res);
      case 'get_activity_feed':
        return handleGetActivityFeed(req, res);
      case 'get_presence':
        return handleGetPresence(req, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Collaboration API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetActiveSessions(req, res) {
  const { entityType, entityId } = req.query;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get active collaboration sessions
    const { data: sessions, error: sessionError } = await supabase
      .from('collaboration_sessions')
      .select(`
        id,
        user_id,
        entity_type,
        entity_id,
        workspace_id,
        joined_at,
        last_seen,
        status,
        cursor_position,
        current_element,
        profiles!collaboration_sessions_user_id_fkey(full_name, email)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('status', 'active')
      .order('last_seen', { ascending: false });

    if (sessionError) {
      throw sessionError;
    }

    return res.status(200).json({
      success: true,
      data: sessions || []
    });

  } catch (error) {
    console.error('Error getting active sessions:', error);
    return res.status(500).json({ success: false, error: 'Failed to get active sessions' });
  }
}

async function handleGetActivityFeed(req, res) {
  const { workspaceId, entityType, entityId, limit = 50, offset = 0 } = req.query;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    let query = supabase
      .from('collaboration_activity')
      .select(`
        id,
        user_id,
        activity_type,
        entity_type,
        entity_id,
        workspace_id,
        metadata,
        timestamp,
        created_at,
        profiles!collaboration_activity_user_id_fkey(full_name, email, avatar_url)
      `)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit))
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Apply filters
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data: activities, error: activityError } = await query;

    if (activityError) {
      throw activityError;
    }

    return res.status(200).json({
      success: true,
      data: activities || []
    });

  } catch (error) {
    console.error('Error getting activity feed:', error);
    return res.status(500).json({ success: false, error: 'Failed to get activity feed' });
  }
}

async function handleGetPresence(req, res) {
  const { userIds } = req.query;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    let query = supabase
      .from('user_presence')
      .select(`
        user_id,
        status,
        last_seen,
        current_element,
        metadata,
        updated_at,
        profiles!user_presence_user_id_fkey(full_name, email, avatar_url)
      `);

    // Filter by specific user IDs if provided
    if (userIds) {
      const userIdArray = Array.isArray(userIds) ? userIds : userIds.split(',');
      query = query.in('user_id', userIdArray);
    }

    const { data: presence, error: presenceError } = await query;

    if (presenceError) {
      throw presenceError;
    }

    return res.status(200).json({
      success: true,
      data: presence || []
    });

  } catch (error) {
    console.error('Error getting presence:', error);
    return res.status(500).json({ success: false, error: 'Failed to get presence data' });
  }
}

async function handleJoinSession(req, res) {
  const { entityType, entityId, workspaceId } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Create or update collaboration session
    const { data: session, error: sessionError } = await supabase
      .from('collaboration_sessions')
      .upsert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        workspace_id: workspaceId,
        status: 'active',
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,entity_type,entity_id'
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Update user presence
    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        status: 'online',
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    // Log activity
    await supabase
      .from('collaboration_activity')
      .insert({
        user_id: user.id,
        activity_type: 'session_joined',
        entity_type: entityType,
        entity_id: entityId,
        workspace_id: workspaceId,
        metadata: {
          session_id: session.id,
          timestamp: new Date().toISOString()
        }
      });

    return res.status(200).json({
      success: true,
      data: {
        id: session.id,
        entityType: session.entity_type,
        entityId: session.entity_id,
        workspaceId: session.workspace_id,
        joinedAt: session.joined_at,
        status: session.status,
        userId: user.id
      }
    });

  } catch (error) {
    console.error('Error joining session:', error);
    return res.status(500).json({ success: false, error: 'Failed to join session' });
  }
}

async function handleLeaveSession(req, res) {
  const { entityType, entityId } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Update session status to inactive
    const { error: sessionError } = await supabase
      .from('collaboration_sessions')
      .update({
        status: 'inactive',
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (sessionError) {
      throw sessionError;
    }

    // Update user presence (check if user has other active sessions)
    const { data: activeSessions } = await supabase
      .from('collaboration_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const presenceStatus = activeSessions && activeSessions.length > 0 ? 'online' : 'away';

    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        status: presenceStatus,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    // Log activity
    await supabase
      .from('collaboration_activity')
      .insert({
        user_id: user.id,
        activity_type: 'session_left',
        entity_type: entityType,
        entity_id: entityId,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error leaving session:', error);
    return res.status(500).json({ success: false, error: 'Failed to leave session' });
  }
}

async function handleUpdatePresence(req, res) {
  const { entityType, entityId, cursorPosition, currentElement, status } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Update collaboration session presence
    const { error: sessionError } = await supabase
      .from('collaboration_sessions')
      .update({
        cursor_position: cursorPosition,
        current_element: currentElement,
        status: status || 'active',
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (sessionError) {
      throw sessionError;
    }

    // Update global user presence
    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        status: status || 'online',
        current_element: currentElement,
        last_seen: new Date().toISOString(),
        metadata: {
          cursor_position: cursorPosition,
          entity_type: entityType,
          entity_id: entityId
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    return res.status(200).json({ 
      success: true,
      data: {
        userId: user.id,
        status: status || 'active',
        cursorPosition,
        currentElement,
        lastSeen: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating presence:', error);
    return res.status(500).json({ success: false, error: 'Failed to update presence' });
  }
}

async function handleBroadcastEdit(req, res) {
  const { entityType, entityId, operation, elementId, data } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Record the collaboration edit
    const { data: edit, error: editError } = await supabase
      .from('collaboration_edits')
      .insert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        operation_type: operation,
        element_id: elementId,
        operation_data: data || {},
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (editError) {
      throw editError;
    }

    // Update session activity
    await supabase
      .from('collaboration_sessions')
      .update({
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    // Log collaboration activity
    await supabase
      .from('collaboration_activity')
      .insert({
        user_id: user.id,
        activity_type: 'edit_made',
        entity_type: entityType,
        entity_id: entityId,
        metadata: {
          operation,
          element_id: elementId,
          edit_id: edit.id,
          timestamp: new Date().toISOString()
        }
      });

    return res.status(200).json({ 
      success: true,
      data: {
        editId: edit.id,
        operation,
        elementId,
        userId: user.id,
        timestamp: edit.timestamp
      }
    });

  } catch (error) {
    console.error('Error broadcasting edit:', error);
    return res.status(500).json({ success: false, error: 'Failed to broadcast edit' });
  }
}

async function handleLogActivity(req, res) {
  const { activityType, entityType, entityId, workspaceId, metadata } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  try {
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Log the collaboration activity
    const { data: activity, error: activityError } = await supabase
      .from('collaboration_activity')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        entity_type: entityType,
        entity_id: entityId,
        workspace_id: workspaceId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (activityError) {
      throw activityError;
    }

    // Update user presence to show they're active
    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        status: 'online',
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    // If it's a major activity, create a notification for collaborators
    const majorActivities = ['study_published', 'study_archived', 'major_edit', 'approval_requested'];
    
    if (majorActivities.includes(activityType) && entityType && entityId) {
      // Get collaborators for this entity
      const { data: collaborators } = await supabase
        .from('collaboration_sessions')
        .select('user_id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('status', 'active')
        .neq('user_id', user.id);

      // Create notifications for active collaborators
      if (collaborators && collaborators.length > 0) {
        const notifications = collaborators.map(collab => ({
          user_id: collab.user_id,
          type: 'collaboration_activity',
          title: `New ${activityType.replace('_', ' ')}`,
          message: `A collaborator performed: ${activityType}`,
          entity_type: entityType,
          entity_id: entityId,
          metadata: {
            activity_id: activity.id,
            performed_by: user.id,
            activity_type: activityType
          }
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
      }
    }

    return res.status(200).json({ 
      success: true,
      data: {
        activityId: activity.id,
        activityType: activity.activity_type,
        timestamp: activity.timestamp,
        userId: user.id
      }
    });

  } catch (error) {
    console.error('Error logging activity:', error);
    return res.status(500).json({ success: false, error: 'Failed to log activity' });
  }
}
