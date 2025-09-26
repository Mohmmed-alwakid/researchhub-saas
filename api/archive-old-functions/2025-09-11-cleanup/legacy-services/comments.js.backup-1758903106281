/**
 * Comments API
 * Handles threaded comment system
 */

import { createClient } from '@supabase/supabase-js';

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
      case 'get_comments':
        return handleGetComments(req, res);
      case 'add_comment':
        return handleAddComment(req, res);
      case 'update_comment':
        return handleUpdateComment(req, res);
      case 'delete_comment':
        return handleDeleteComment(req, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Comments API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetComments(req, res) {
  const { entityType, entityId } = req.query;
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entityType', entityType)
        .eq('entityId', entityId)
        .order('createdAt', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
}

async function handleAddComment(req, res) {
  const { entityType, entityId, content, parentId } = req.body;
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content,
            entityType,
            entityId,
            parentId,
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

async function handleUpdateComment(req, res) {
  const { commentId, content } = req.body;
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId)
        .select();
      if (error) throw error;
      return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
}

async function handleDeleteComment(req, res) {
  const { commentId } = req.body;
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
}
