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

    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'desc';
    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        subscription_tier,
        created_at,
        updated_at,
        last_login_at
      `)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        // Consider users active if they've logged in within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('last_login_at', thirtyDaysAgo.toISOString());
      } else if (status === 'inactive') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.or(`last_login_at.lt.${thirtyDaysAgo.toISOString()},last_login_at.is.null`);
      }
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Execute the query
    const { data: users, error: usersError } = await query;

    if (usersError) {
      throw usersError;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Apply same filters to count query
    if (role && role !== 'all') {
      countQuery = countQuery.eq('role', role);
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        countQuery = countQuery.gte('last_login_at', thirtyDaysAgo.toISOString());
      } else if (status === 'inactive') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        countQuery = countQuery.or(`last_login_at.lt.${thirtyDaysAgo.toISOString()},last_login_at.is.null`);
      }
    }

    if (search) {
      countQuery = countQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { count: totalCount } = await countQuery;

    // Get additional stats for each user (studies created/participated)
    const userIds = users.map(user => user.id);
    
    // Get studies created by each user
    const { data: studiesCreated } = await supabase
      .from('studies')
      .select('creator_id')
      .in('creator_id', userIds);

    // Count studies per user
    const studiesCountMap = {};
    if (studiesCreated) {
      studiesCreated.forEach(study => {
        studiesCountMap[study.creator_id] = (studiesCountMap[study.creator_id] || 0) + 1;
      });
    }

    // Try to get study participations (if study_sessions table exists)
    let participationsCountMap = {};
    try {
      const { data: participations } = await supabase
        .from('study_sessions')
        .select('participant_id')
        .in('participant_id', userIds);

      if (participations) {
        participations.forEach(session => {
          participationsCountMap[session.participant_id] = (participationsCountMap[session.participant_id] || 0) + 1;
        });
      }
    } catch (error) {
      // study_sessions table might not exist yet, that's ok
      console.log('Study sessions table not found, skipping participation counts');
    }

    // Format the response to match the expected interface
    const formattedUsers = users.map(user => ({
      _id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name',
      email: user.email,
      role: user.role || 'participant',
      isActive: user.last_login_at ? new Date(user.last_login_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      subscription: user.subscription_tier || 'free',
      studiesCreated: studiesCountMap[user.id] || 0,
      studiesParticipated: participationsCountMap[user.id] || 0
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return res.status(200).json({
      success: true,
      data: {
        data: formattedUsers,
        pagination: {
          current: page,
          total: totalPages,
          hasNext,
          hasPrev,
          totalCount
        }
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
}
