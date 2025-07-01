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
      // Get study activity
      const { data: activities, error: activitiesError } = await supabase
        .from('collaboration_activity')
        .select(`
          id,
          action,
          details,
          created_at,
          users!inner (
            email,
            user_metadata
          )
        `)
        .eq('study_id', studyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) {
        console.error('Activities query error:', activitiesError);
        return res.status(500).json({ success: false, error: 'Failed to fetch activities' });
      }

      // Format activities data
      const formattedActivities = activities?.map(activity => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        created_at: activity.created_at,
        user_email: activity.users.email,
        user_first_name: activity.users.user_metadata?.first_name || 'Unknown',
        user_last_name: activity.users.user_metadata?.last_name || 'User'
      })) || [];

      return res.status(200).json({
        success: true,
        activities: formattedActivities
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Study activity API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
