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

    // Extract IDs from URL
    const studyId = req.query.studyId;
    const commentId = req.query.commentId;
    
    if (!studyId || !commentId) {
      return res.status(400).json({ success: false, error: 'Study ID and comment ID are required' });
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

    if (req.method === 'PATCH') {
      // Resolve comment
      const { error: updateError } = await supabase
        .from('collaboration_comments')
        .update({ resolved: true })
        .eq('id', commentId)
        .eq('study_id', studyId);

      if (updateError) {
        console.error('Resolve comment error:', updateError);
        return res.status(500).json({ success: false, error: 'Failed to resolve comment' });
      }

      // Log activity
      await supabase
        .from('collaboration_activity')
        .insert({
          study_id: studyId,
          user_id: user.id,
          action: 'comment_resolved',
          details: 'Resolved a comment'
        });

      return res.status(200).json({ success: true, message: 'Comment resolved successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Resolve comment API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
