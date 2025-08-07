/**
 * PRODUCTION RESEARCH API - Vercel Compatible
 * Handles studies without local dependencies
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return res.status(auth.status || 401).json({
        success: false,
        error: auth.error
      });
    }

    switch (action) {
      case 'studies':
        return await handleGetStudies(req, res, auth.user);
      case 'get-study':
        return await handleGetStudy(req, res, auth.user);
      case 'create-study':
        return await handleCreateStudy(req, res, auth.user);
      case 'update-study':
        return await handleUpdateStudy(req, res, auth.user);
      case 'delete-study':
        return await handleDeleteStudy(req, res, auth.user);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Research API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function authenticateUser(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { success: false, error: 'Invalid or expired token', status: 401 };
    }

    // Get user profile for role information
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const userData = {
      id: user.id,
      email: user.email,
      user_metadata: {
        role: profile?.role || user.user_metadata?.role || 'participant'
      }
    };

    return { success: true, user: userData };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

async function handleGetStudies(req, res, user) {
  try {
    const userRole = user.user_metadata?.role || 'participant';
    
    let query = supabase.from('studies').select('*');
    
    // Apply role-based filtering
    if (userRole === 'participant') {
      // Participants only see active, public studies
      query = query.eq('status', 'active').eq('is_public', true);
    } else if (userRole === 'researcher') {
      // Researchers see their own studies
      query = query.eq('researcher_id', user.id);
    }
    // Admins see all studies (no additional filtering)

    const { data: studies, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Studies query error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch studies'
      });
    }

    return res.status(200).json({
      success: true,
      data: studies || [],
      count: studies ? studies.length : 0,
      userRole: userRole
    });

  } catch (error) {
    console.error('Get studies exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch studies'
    });
  }
}

async function handleGetStudy(req, res, user) {
  try {
    const { study_id } = req.query;
    
    if (!study_id) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    const { data: study, error } = await supabase
      .from('studies')
      .select('*')
      .eq('id', study_id)
      .single();

    if (error) {
      console.error('Study query error:', error);
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    // Check access permissions
    const userRole = user.user_metadata?.role || 'participant';
    if (userRole === 'researcher' && study.researcher_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: study
    });

  } catch (error) {
    console.error('Get study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch study'
    });
  }
}

async function handleCreateStudy(req, res, user) {
  try {
    const userRole = user.user_metadata?.role || 'participant';
    
    if (userRole !== 'researcher' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only researchers can create studies'
      });
    }

    const { title, description, settings, target_participants = 10, is_public = false } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    const { data: study, error } = await supabase
      .from('studies')
      .insert({
        title,
        description,
        settings: settings || {},
        target_participants,
        is_public,
        researcher_id: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Study creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create study'
      });
    }

    return res.status(201).json({
      success: true,
      data: study
    });

  } catch (error) {
    console.error('Create study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create study'
    });
  }
}

async function handleUpdateStudy(req, res, user) {
  try {
    const { study_id } = req.query;
    const userRole = user.user_metadata?.role || 'participant';
    
    if (!study_id) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    if (userRole !== 'researcher' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only researchers can update studies'
      });
    }

    // Check if user owns the study (unless admin)
    if (userRole === 'researcher') {
      const { data: existingStudy } = await supabase
        .from('studies')
        .select('researcher_id')
        .eq('id', study_id)
        .single();

      if (!existingStudy || existingStudy.researcher_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    const updateData = {};
    const { title, description, settings, status, target_participants, is_public } = req.body;

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (settings !== undefined) updateData.settings = settings;
    if (status !== undefined) updateData.status = status;
    if (target_participants !== undefined) updateData.target_participants = target_participants;
    if (is_public !== undefined) updateData.is_public = is_public;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const { data: study, error } = await supabase
      .from('studies')
      .update(updateData)
      .eq('id', study_id)
      .select()
      .single();

    if (error) {
      console.error('Study update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update study'
      });
    }

    return res.status(200).json({
      success: true,
      data: study
    });

  } catch (error) {
    console.error('Update study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update study'
    });
  }
}

async function handleDeleteStudy(req, res, user) {
  try {
    const { study_id } = req.query;
    const userRole = user.user_metadata?.role || 'participant';
    
    if (!study_id) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    if (userRole !== 'researcher' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only researchers can delete studies'
      });
    }

    // Check if user owns the study (unless admin)
    if (userRole === 'researcher') {
      const { data: existingStudy } = await supabase
        .from('studies')
        .select('researcher_id')
        .eq('id', study_id)
        .single();

      if (!existingStudy || existingStudy.researcher_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    const { error } = await supabase
      .from('studies')
      .delete()
      .eq('id', study_id);

    if (error) {
      console.error('Study deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete study'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Study deleted successfully'
    });

  } catch (error) {
    console.error('Delete study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete study'
    });
  }
}
