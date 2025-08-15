/**
 * CONSOLIDATED RESEARCH MANAGEMENT API
 * Handles: Study management, sessions, applications, and block types
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.I_4j2vgcu2aR9Pw1d-QG2hpKunbmNKD8tWg3Psl0GNc';

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Research API initialized');

/**
 * Helper function to authenticate user
 */
async function authenticateUser(req, requiredRoles = []) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('❌ Token verification failed:', error?.message);
      return { success: false, error: 'Invalid or expired token', status: 401 };
    }

    // Get user profile for role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('⚠️ Profile fetch failed:', profileError.message);
      // Continue without profile, use user metadata
    }

    const userRole = profile?.role || user.user_metadata?.role || 'participant';

    // Check role requirements
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return { 
        success: false, 
        error: `Access denied. Required roles: ${requiredRoles.join(', ')}`, 
        status: 403 
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
        profile: profile
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication service error', status: 500 };
  }
}

// Block type definitions
const BLOCK_TYPES = {
  'welcome-screen': { name: 'Welcome Screen', category: 'introductory' },
  'open-question': { name: 'Open Question', category: 'qualitative' },
  'opinion-scale': { name: 'Opinion Scale', category: 'quantitative' },
  'simple-input': { name: 'Simple Input', category: 'data-collection' },
  'multiple-choice': { name: 'Multiple Choice', category: 'selection' },
  'context-screen': { name: 'Context Screen', category: 'informational' },
  'yes-no': { name: 'Yes/No', category: 'binary' },
  '5-second-test': { name: '5-Second Test', category: 'testing' },
  'card-sort': { name: 'Card Sort', category: 'sorting' },
  'tree-test': { name: 'Tree Test', category: 'navigation' },
  'thank-you': { name: 'Thank You', category: 'closing' },
  'image-upload': { name: 'Image Upload', category: 'media' },
  'file-upload': { name: 'File Upload', category: 'media' }
};

/**
 * Main API handler
 */
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
      case 'get-studies':
        return await getStudies(req, res);
      
      case 'create-study':
        return await createStudy(req, res);
      
      case 'get-study':
        return await getStudy(req, res);
      
      case 'update-study':
        return await updateStudy(req, res);
      
      case 'delete-study':
        return await deleteStudy(req, res);
      
      case 'get-templates':
        return await getTemplates(req, res);
      
      case 'get-block-types':
        return await getBlockTypes(req, res);
      
      case 'create-session':
        return await createSession(req, res);
      
      case 'get-applications':
        return await getApplications(req, res);
      
      case 'update-application-status':
        return await updateApplicationStatus(req, res);
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action parameter' 
        });
    }

  } catch (error) {
    console.error('Research API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

/**
 * Get studies for authenticated user
 */
async function getStudies(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    let query = supabase
      .from('studies')
      .select(`
        *,
        profiles:created_by(email, full_name)
      `)
      .order('created_at', { ascending: false });

    // Non-admin users only see their own studies
    if (auth.user.role !== 'admin') {
      query = query.eq('created_by', auth.user.id);
    }

    const { data: studies, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch studies' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: studies || [] 
    });

  } catch (error) {
    console.error('Get studies error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch studies' 
    });
  }
}

/**
 * Create a new study
 */
async function createStudy(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const studyData = req.body;

    // Validate required fields
    if (!studyData.title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study title is required' 
      });
    }

    // Prepare study data
    const newStudy = {
      title: studyData.title,
      description: studyData.description || '',
      type: studyData.type || 'unmoderated-study',
      status: studyData.status || 'draft',
      settings: studyData.settings || {},
      blocks: studyData.blocks || [],
      created_by: auth.user.id,
      updated_by: auth.user.id
    };

    const { data: study, error } = await supabase
      .from('studies')
      .insert([newStudy])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
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
    console.error('Create study error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create study' 
    });
  }
}

/**
 * Get a specific study
 */
async function getStudy(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin', 'participant']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study ID is required' 
      });
    }

    let query = supabase
      .from('studies')
      .select(`
        *,
        profiles:created_by(email, full_name)
      `)
      .eq('id', id)
      .single();

    const { data: study, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(404).json({ 
        success: false, 
        error: 'Study not found' 
      });
    }

    // Check access permissions for non-admin users
    if (auth.user.role === 'researcher' && study.created_by !== auth.user.id) {
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
    console.error('Get study error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch study' 
    });
  }
}

/**
 * Update a study
 */
async function updateStudy(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study ID is required' 
      });
    }

    // Check if study exists and user has permission
    const { data: existingStudy, error: fetchError } = await supabase
      .from('studies')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingStudy) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study not found' 
      });
    }

    if (auth.user.role !== 'admin' && existingStudy.created_by !== auth.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    // Prepare update data
    const updatedStudy = {
      ...updateData,
      updated_by: auth.user.id,
      updated_at: new Date().toISOString()
    };

    // Remove id from update data to avoid conflicts
    delete updatedStudy.id;

    const { data: study, error } = await supabase
      .from('studies')
      .update(updatedStudy)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
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
    console.error('Update study error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update study' 
    });
  }
}

/**
 * Delete a study
 */
async function deleteStudy(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study ID is required' 
      });
    }

    // Check if study exists and user has permission
    const { data: existingStudy, error: fetchError } = await supabase
      .from('studies')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingStudy) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study not found' 
      });
    }

    if (auth.user.role !== 'admin' && existingStudy.created_by !== auth.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const { error } = await supabase
      .from('studies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
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
    console.error('Delete study error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete study' 
    });
  }
}

/**
 * Get available templates
 */
async function getTemplates(req, res) {
  try {
    const { data: templates, error } = await supabase
      .from('study_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch templates' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: templates || [] 
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch templates' 
    });
  }
}

/**
 * Get available block types
 */
async function getBlockTypes(req, res) {
  try {
    return res.status(200).json({ 
      success: true, 
      data: BLOCK_TYPES 
    });
  } catch (error) {
    console.error('Get block types error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch block types' 
    });
  }
}

/**
 * Create a new session
 */
async function createSession(req, res) {
  const auth = await authenticateUser(req, ['participant']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const sessionData = req.body;

    if (!sessionData.study_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study ID is required' 
      });
    }

    const newSession = {
      study_id: sessionData.study_id,
      participant_id: auth.user.id,
      status: 'active',
      responses: sessionData.responses || [],
      metadata: sessionData.metadata || {}
    };

    const { data: session, error } = await supabase
      .from('study_sessions')
      .insert([newSession])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create session' 
      });
    }

    return res.status(201).json({ 
      success: true, 
      data: session 
    });

  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create session' 
    });
  }
}

/**
 * Get applications for studies
 */
async function getApplications(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    let query = supabase
      .from('study_applications')
      .select(`
        *,
        studies!inner(title, created_by),
        profiles:participant_id(email, full_name)
      `)
      .order('created_at', { ascending: false });

    // Non-admin users only see applications for their studies
    if (auth.user.role !== 'admin') {
      query = query.eq('studies.created_by', auth.user.id);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch applications' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: applications || [] 
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    });
  }
}

/**
 * Update application status
 */
async function updateApplicationStatus(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Application ID and status are required' 
      });
    }

    const { data: application, error } = await supabase
      .from('study_applications')
      .update({ 
        status: status,
        reviewed_by: auth.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update application status' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: application 
    });

  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update application status' 
    });
  }
}
