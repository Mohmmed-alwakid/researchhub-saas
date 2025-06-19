import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const limit = parseInt(req.query.limit) || 20;
    const activities = [];

    // Get recent user signups
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_signup',
          description: `New ${user.role || 'user'} registered`,
          timestamp: user.created_at,
          user: user.email,
          metadata: {
            userId: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
          }
        });
      });
    }

    // Get recent study creation
    const { data: recentStudies } = await supabase
      .from('studies')
      .select(`
        id, 
        title, 
        created_at,
        profiles:creator_id (email, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentStudies) {
      recentStudies.forEach(study => {
        activities.push({
          id: `study_${study.id}`,
          type: 'study_created',
          description: `New study "${study.title}" created`,
          timestamp: study.created_at,
          user: study.profiles?.email || 'Unknown user',
          metadata: {
            studyId: study.id,
            studyTitle: study.title
          }
        });
      });
    }

    // Get recent subscription changes (if we track them)
    const { data: recentSubscriptions } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, updated_at')
      .not('subscription_tier', 'eq', 'free')
      .not('subscription_tier', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(3);

    if (recentSubscriptions) {
      recentSubscriptions.forEach(sub => {
        activities.push({
          id: `subscription_${sub.id}`,
          type: 'subscription',
          description: `User upgraded to ${sub.subscription_tier} plan`,
          timestamp: sub.updated_at,
          user: sub.email,
          metadata: {
            userId: sub.id,
            plan: sub.subscription_tier
          }
        });
      });
    }

    // Get recent study sessions (if that table exists)
    try {
      const { data: recentSessions } = await supabase
        .from('study_sessions')
        .select(`
          id,
          created_at,
          studies (title),
          profiles:participant_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentSessions) {
        recentSessions.forEach(session => {
          activities.push({
            id: `session_${session.id}`,
            type: 'session_started',
            description: `New session started for "${session.studies?.title || 'Unknown study'}"`,
            timestamp: session.created_at,
            user: session.profiles?.email || 'Anonymous',
            metadata: {
              sessionId: session.id,
              studyTitle: session.studies?.title
            }
          });
        });
      }
    } catch (error) {
      // study_sessions table might not exist yet, that's ok
      console.log('Study sessions table not found, skipping session activity');
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    const limitedActivities = activities.slice(0, limit);

    return res.status(200).json({
      success: true,
      data: limitedActivities
    });

  } catch (error) {
    console.error('Admin activity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin activity'
    });
  }
}
