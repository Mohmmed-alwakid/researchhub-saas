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
    const collaboratorId = req.query.collaboratorId;
    
    if (!studyId || !collaboratorId) {
      return res.status(400).json({ success: false, error: 'Study ID and collaborator ID are required' });
    }

    // Check if user has permission to manage collaborators
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

    const hasPermission = ownerCheck || (accessCheck && ['owner', 'editor'].includes(accessCheck.role));

    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (req.method === 'DELETE') {
      // Get collaborator info before deletion for logging
      const { data: collaboratorInfo } = await supabase
        .from('study_collaborators')
        .select(`
          role,
          users!inner (email)
        `)
        .eq('id', collaboratorId)
        .single();

      // Remove collaborator
      const { error: deleteError } = await supabase
        .from('study_collaborators')
        .delete()
        .eq('id', collaboratorId)
        .eq('study_id', studyId);

      if (deleteError) {
        console.error('Delete collaborator error:', deleteError);
        return res.status(500).json({ success: false, error: 'Failed to remove collaborator' });
      }

      // Log activity
      if (collaboratorInfo) {
        await supabase
          .from('collaboration_activity')
          .insert({
            study_id: studyId,
            user_id: user.id,
            action: 'collaborator_removed',
            details: `Removed ${collaboratorInfo.users.email} (${collaboratorInfo.role})`
          });
      }

      return res.status(200).json({ success: true, message: 'Collaborator removed successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Remove collaborator API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
