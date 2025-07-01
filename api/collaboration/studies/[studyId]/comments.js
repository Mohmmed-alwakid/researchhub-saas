import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  try {
    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Extract study ID from URL
    const studyId = req.query.studyId;
    if (!studyId) {
      return res.status(400).json({ success: false, error: 'Study ID is required' });
    }

    // Check if user has access to this study
    const { data: accessCheck } = await supabase
      .from('study_collaborators')
      .select('role')
      .eq('study_id', studyId)
      .eq('user_id', user.id)
      .single();

    const { data: ownerCheck } = await supabase
      .from('studies')
      .select('researcher_id')
      .eq('id', studyId)
      .eq('researcher_id', user.id)
      .single();

    if (!accessCheck && !ownerCheck) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (req.method === 'GET') {
      // Get study comments
      const { data: comments, error: commentsError } = await supabase
        .from('collaboration_comments')
        .select(`
          id,
          content,
          created_at,
          resolved,
          users!inner (
            email,
            user_metadata
          )
        `)
        .eq('study_id', studyId)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Comments query error:', commentsError);
        return res.status(500).json({ success: false, error: 'Failed to fetch comments' });
      }

      // Format comments data
      const formattedComments = comments?.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        resolved: comment.resolved,
        user_email: comment.users.email,
        user_first_name: comment.users.user_metadata?.first_name || 'Unknown',
        user_last_name: comment.users.user_metadata?.last_name || 'User'
      })) || [];

      return res.status(200).json({
        success: true,
        comments: formattedComments
      });
    }

    if (req.method === 'POST') {
      // Add new comment
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Comment content is required' });
      }

      // Insert comment
      const { error: insertError } = await supabase
        .from('collaboration_comments')
        .insert({
          study_id: studyId,
          user_id: user.id,
          content: content.trim()
        });

      if (insertError) {
        console.error('Insert comment error:', insertError);
        return res.status(500).json({ success: false, error: 'Failed to add comment' });
      }

      // Log activity
      await supabase
        .from('collaboration_activity')
        .insert({
          study_id: studyId,
          user_id: user.id,
          action: 'comment_added',
          details: `Added a comment: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`
        });

      return res.status(201).json({ success: true, message: 'Comment added successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Study comments API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
