/**
 * Comments API Endpoint
 * Handles threaded comments, reactions, and real-time comment features
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
      case 'get_comments':
        return await handleGetComments(req, res, user);
      case 'add_comment':
        return await handleAddComment(req, res, user);
      case 'update_comment':
        return await handleUpdateComment(req, res, user);
      case 'delete_comment':
        return await handleDeleteComment(req, res, user);
      case 'add_reaction':
        return await handleAddReaction(req, res, user);
      case 'remove_reaction':
        return await handleRemoveReaction(req, res, user);
      case 'get_mentions':
        return await handleGetMentions(req, res, user);
      case 'mark_resolved':
        return await handleMarkResolved(req, res, user);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Comments API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * Get comments for an entity with threading
 */
async function handleGetComments(req, res, user) {
  const { entityType, entityId, workspaceId, includeResolved = 'false' } = req.query;

  if (!entityType || !entityId) {
    return res.status(400).json({ 
      success: false, 
      error: 'entityType and entityId are required' 
    });
  }

  try {
    // Check workspace access if provided
    if (workspaceId) {
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('role')
        .match({ workspace_id: workspaceId, user_id: user.id })
        .single();

      if (memberError || !memberData) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    let query = supabase
      .from('comments')
      .select(`
        *,
        author:author_id (
          id,
          email,
          user_metadata
        ),
        reactions (
          id,
          reaction_type,
          user_id,
          user:user_id (
            id,
            email,
            user_metadata
          )
        ),
        replies:comments!parent_id (
          *,
          author:author_id (
            id,
            email,
            user_metadata
          ),
          reactions (
            id,
            reaction_type,
            user_id,
            user:user_id (
              id,
              email,
              user_metadata
            )
          )
        )
      `)
      .match({
        entity_type: entityType,
        entity_id: entityId
      })
      .is('parent_id', null) // Only get top-level comments
      .order('created_at', { ascending: true });

    // Filter resolved comments if requested
    if (includeResolved === 'false') {
      query = query.eq('is_resolved', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get comments' });
    }

    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get comments' });
  }
}

/**
 * Add a new comment
 */
async function handleAddComment(req, res, user) {
  const { 
    entityType, 
    entityId, 
    workspaceId,
    content, 
    parentId,
    mentions = [],
    metadata = {}
  } = req.body;

  if (!entityType || !entityId || !content) {
    return res.status(400).json({ 
      success: false, 
      error: 'entityType, entityId, and content are required' 
    });
  }

  try {
    // Validate parent comment if replying
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parentId)
        .single();

      if (parentError || !parentComment) {
        return res.status(400).json({ success: false, error: 'Parent comment not found' });
      }
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        workspace_id: workspaceId,
        author_id: user.id,
        content: content,
        parent_id: parentId,
        mentions: mentions,
        metadata: metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_resolved: false,
        is_edited: false
      })
      .select(`
        *,
        author:author_id (
          id,
          email,
          user_metadata
        )
      `);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to add comment' });
    }

    // Create notifications for mentions
    if (mentions.length > 0) {
      const notificationPromises = mentions.map(mentionedUserId => 
        supabase
          .from('notifications')
          .insert({
            user_id: mentionedUserId,
            type: 'comment_mention',
            title: 'You were mentioned in a comment',
            message: `${user.email} mentioned you in a comment`,
            entity_type: entityType,
            entity_id: entityId,
            metadata: {
              comment_id: data[0].id,
              author_id: user.id,
              author_name: user.email
            },
            created_at: new Date().toISOString()
          })
      );

      await Promise.all(notificationPromises);
    }

    // Log activity
    await logCommentActivity(user.id, 'comment_added', entityType, entityId, workspaceId, {
      commentId: data[0].id,
      isReply: !!parentId,
      mentionsCount: mentions.length
    });

    return res.status(201).json({ 
      success: true, 
      data: data[0],
      message: 'Comment added successfully' 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
}

/**
 * Update an existing comment
 */
async function handleUpdateComment(req, res, user) {
  const { commentId, content, mentions = [] } = req.body;

  if (!commentId || !content) {
    return res.status(400).json({ 
      success: false, 
      error: 'commentId and content are required' 
    });
  }

  try {
    // Check if user owns the comment
    const { data: comment, error: getError } = await supabase
      .from('comments')
      .select('author_id, entity_type, entity_id, workspace_id')
      .eq('id', commentId)
      .single();

    if (getError || !comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.author_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const { data, error } = await supabase
      .from('comments')
      .update({
        content: content,
        mentions: mentions,
        updated_at: new Date().toISOString(),
        is_edited: true
      })
      .eq('id', commentId)
      .select(`
        *,
        author:author_id (
          id,
          email,
          user_metadata
        )
      `);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update comment' });
    }

    // Log activity
    await logCommentActivity(user.id, 'comment_updated', comment.entity_type, comment.entity_id, comment.workspace_id, {
      commentId: commentId
    });

    return res.status(200).json({ 
      success: true, 
      data: data[0],
      message: 'Comment updated successfully' 
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update comment' });
  }
}

/**
 * Delete a comment
 */
async function handleDeleteComment(req, res, user) {
  const { commentId } = req.body;

  if (!commentId) {
    return res.status(400).json({ success: false, error: 'commentId is required' });
  }

  try {
    // Check if user owns the comment or has permissions
    const { data: comment, error: getError } = await supabase
      .from('comments')
      .select('author_id, entity_type, entity_id, workspace_id')
      .eq('id', commentId)
      .single();

    if (getError || !comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Check permissions
    let canDelete = comment.author_id === user.id;
    
    if (!canDelete && comment.workspace_id) {
      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('role')
        .match({ workspace_id: comment.workspace_id, user_id: user.id })
        .single();

      canDelete = memberData && ['owner', 'editor'].includes(memberData.role);
    }

    if (!canDelete) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    // Soft delete the comment
    const { error } = await supabase
      .from('comments')
      .update({
        content: '[Comment deleted]',
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete comment' });
    }

    // Log activity
    await logCommentActivity(user.id, 'comment_deleted', comment.entity_type, comment.entity_id, comment.workspace_id, {
      commentId: commentId
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Comment deleted successfully' 
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
}

/**
 * Add a reaction to a comment
 */
async function handleAddReaction(req, res, user) {
  const { commentId, reactionType } = req.body;

  if (!commentId || !reactionType) {
    return res.status(400).json({ 
      success: false, 
      error: 'commentId and reactionType are required' 
    });
  }

  try {
    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('comment_reactions')
      .select('id')
      .match({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: reactionType
      })
      .single();

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'Reaction already exists' 
      });
    }

    const { data, error } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: reactionType,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to add reaction' });
    }

    return res.status(201).json({ 
      success: true, 
      data: data[0],
      message: 'Reaction added successfully' 
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add reaction' });
  }
}

/**
 * Remove a reaction from a comment
 */
async function handleRemoveReaction(req, res, user) {
  const { commentId, reactionType } = req.body;

  if (!commentId || !reactionType) {
    return res.status(400).json({ 
      success: false, 
      error: 'commentId and reactionType are required' 
    });
  }

  try {
    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .match({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: reactionType
      });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to remove reaction' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Reaction removed successfully' 
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove reaction' });
  }
}

/**
 * Get mentions for a user
 */
async function handleGetMentions(req, res, user) {
  const { workspaceId, limit = 20, offset = 0, unreadOnly = 'false' } = req.query;

  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        author:author_id (
          id,
          email,
          user_metadata
        )
      `)
      .contains('mentions', [user.id])
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get mentions' });
    }

    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get mentions error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get mentions' });
  }
}

/**
 * Mark a comment thread as resolved
 */
async function handleMarkResolved(req, res, user) {
  const { commentId, isResolved = true } = req.body;

  if (!commentId) {
    return res.status(400).json({ success: false, error: 'commentId is required' });
  }

  try {
    // Check permissions to resolve comments
    const { data: comment, error: getError } = await supabase
      .from('comments')
      .select('author_id, workspace_id, entity_type, entity_id')
      .eq('id', commentId)
      .single();

    if (getError || !comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    let canResolve = comment.author_id === user.id;
    
    if (!canResolve && comment.workspace_id) {
      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('role')
        .match({ workspace_id: comment.workspace_id, user_id: user.id })
        .single();

      canResolve = memberData && ['owner', 'editor'].includes(memberData.role);
    }

    if (!canResolve) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const { data, error } = await supabase
      .from('comments')
      .update({
        is_resolved: isResolved,
        resolved_by: isResolved ? user.id : null,
        resolved_at: isResolved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update comment resolution' });
    }

    // Log activity
    await logCommentActivity(user.id, isResolved ? 'comment_resolved' : 'comment_reopened', comment.entity_type, comment.entity_id, comment.workspace_id, {
      commentId: commentId
    });

    return res.status(200).json({ 
      success: true, 
      data: data[0],
      message: `Comment ${isResolved ? 'resolved' : 'reopened'} successfully` 
    });
  } catch (error) {
    console.error('Mark resolved error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update comment resolution' });
  }
}

/**
 * Utility function to log comment activities
 */
async function logCommentActivity(userId, activityType, entityType, entityId, workspaceId, metadata = {}) {
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
    console.error('Log comment activity error:', error);
    // Don't throw - logging is not critical
  }
}
