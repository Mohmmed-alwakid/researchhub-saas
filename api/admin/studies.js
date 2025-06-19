import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      return handleGetStudies(req, res);
    } else if (req.method === 'PUT') {
      return handleUpdateStudyStatus(req, res);
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Studies endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
}

async function handleGetStudies(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = supabase
      .from('studies')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        researcher_id,
        profiles!studies_researcher_id_fkey (
          id,
          name,
          email
        )
      `);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('studies')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting studies count:', countError);
    }

    // Get paginated results
    const { data: studies, error: studiesError } = await query
      .range(offset, offset + parseInt(limit) - 1);

    if (studiesError) {
      console.error('Error fetching studies:', studiesError);
      return res.status(500).json({ success: false, error: 'Failed to fetch studies' });
    }

    // Get participant counts for each study
    const studiesWithCounts = await Promise.all(
      studies.map(async (study) => {
        const { count: participantCount, error: participantError } = await supabase
          .from('study_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('study_id', study.id);

        if (participantError) {
          console.error('Error getting participant count:', participantError);
        }

        return {
          _id: study.id,
          title: study.title,
          description: study.description,
          status: study.status,
          researcher: {
            _id: study.profiles?.id || study.researcher_id,
            name: study.profiles?.name || 'Unknown',
            email: study.profiles?.email || 'Unknown'
          },
          createdAt: study.created_at,
          participantCount: participantCount || 0
        };
      })
    );

    const totalPages = Math.ceil((totalCount || 0) / parseInt(limit));
    const currentPage = parseInt(page);

    const response = {
      data: studiesWithCounts,
      pagination: {
        current: currentPage,
        total: totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };

    return res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error in handleGetStudies:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch studies'
    });
  }
}

async function handleUpdateStudyStatus(req, res) {
  try {
    const { studyId } = req.query;
    const { status, reason } = req.body;

    if (!studyId) {
      return res.status(400).json({ success: false, error: 'Study ID is required' });
    }

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // Update study status
    const { data: updatedStudy, error: updateError } = await supabase
      .from('studies')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', studyId)
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        researcher_id,
        profiles!studies_researcher_id_fkey (
          id,
          name,
          email
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating study status:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update study status' });
    }

    // Log the admin action
    if (reason) {
      const { error: logError } = await supabase
        .from('admin_logs')
        .insert({
          admin_id: req.user?.id,
          action: 'study_status_update',
          target_id: studyId,
          details: { status, reason },
          created_at: new Date().toISOString()
        });

      if (logError) {
        console.error('Error logging admin action:', logError);
      }
    }

    const formattedStudy = {
      _id: updatedStudy.id,
      title: updatedStudy.title,
      description: updatedStudy.description,
      status: updatedStudy.status,
      researcher: {
        _id: updatedStudy.profiles?.id || updatedStudy.researcher_id,
        name: updatedStudy.profiles?.name || 'Unknown',
        email: updatedStudy.profiles?.email || 'Unknown'
      },
      createdAt: updatedStudy.created_at
    };

    return res.status(200).json({
      success: true,
      data: { study: formattedStudy }
    });

  } catch (error) {
    console.error('Error in handleUpdateStudyStatus:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update study status'
    });
  }
}
