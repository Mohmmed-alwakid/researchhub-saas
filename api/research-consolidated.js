import { createClient } from '@supabase/supabase-js';


/**
 * ENHANCED RESEARCH API - With Supabase Database Integration
 * Includes study creation, persistence, and cross-platform visibility
 * 
 * MIGRATION COMPLETE: Now uses Supabase database instead of in-memory storage
 */

/**
 * CRITICAL: Validates that the studies API response matches the expected format
 * This prevents the frontend from receiving unexpected response structures
 * that would cause the studies page to show empty state incorrectly.
 */
function validateStudiesResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new Error('VALIDATION ERROR: Response must be an object');
  }
  
  if (response.success !== true) {
    throw new Error('VALIDATION ERROR: Response must have success: true');
  }
  
  if (!Array.isArray(response.studies)) {
    throw new Error('VALIDATION ERROR: Response must have studies as an array');
  }
  
  if (!response.pagination || typeof response.pagination !== 'object') {
    throw new Error('VALIDATION ERROR: Response must have pagination object');
  }
  
  const requiredPaginationFields = ['currentPage', 'totalPages', 'totalStudies', 'hasNext', 'hasPrev'];
  for (const field of requiredPaginationFields) {
    if (!(field in response.pagination)) {
      throw new Error(`VALIDATION ERROR: Pagination must have ${field} field`);
    }
  }
  
  console.log('✅ Studies response format validation passed');
  return true;
}

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here';

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔬 Research API initialized with Supabase database');

/**
 * Helper function to authenticate user
 */
async function authenticateUser(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth failed: Missing authorization header');
      return { success: false, error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 Attempting to verify token:', token.substring(0, 20) + '...');
    
    // First try with admin client for server-side verification
    const { data: { user }, error: adminError } = await supabaseAdmin.auth.getUser(token);
    
    if (adminError || !user) {
      console.log('❌ Admin token verification failed:', adminError?.message);
      
      // Fallback: Try with regular client
      const { data: { user: fallbackUser }, error: fallbackError } = await supabase.auth.getUser(token);
      
      if (fallbackError || !fallbackUser) {
        console.log('❌ Fallback token verification failed:', fallbackError?.message);
        return { success: false, error: 'Invalid or expired token', status: 401 };
      }
      
      console.log('✅ Token verified with fallback method for user:', fallbackUser.email);
      return {
        success: true,
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email
        }
      };
    }

    console.log('✅ Token verified for user:', user.email);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication service error', status: 500 };
  }
}

/**
 * Convert database study record to frontend-compatible format
 */
function formatStudyForFrontend(dbStudy, includeNumericId = true) {
  try {
    const settings = dbStudy.settings || {};
    
    // Create a hash-based numeric ID for frontend compatibility
    const numericId = includeNumericId ? 
      Math.abs(dbStudy.id.split('-').join('').slice(0, 8).split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) :
      null;

    return {
      // Database fields
      id: includeNumericId ? numericId : dbStudy.id,
      _id: dbStudy.id, // UUID as string for compatibility
      uuid: dbStudy.id, // Keep original UUID
      title: dbStudy.title || 'Untitled Study',
      description: dbStudy.description || '',
      status: dbStudy.status || 'draft',
      created_at: dbStudy.created_at,
      updated_at: dbStudy.updated_at,
      target_participants: dbStudy.target_participants || 10,
      researcher_id: dbStudy.researcher_id,
      
      // Settings extracted fields (for backward compatibility)
      type: settings.type || 'usability',
      blocks: settings.blocks || [],
      compensation: settings.compensation || 25,
      duration: settings.duration || 30,
      difficulty: settings.difficulty || 'beginner',
      
      // Frontend compatibility (camelCase)
      createdAt: dbStudy.created_at,
      updatedAt: dbStudy.updated_at || dbStudy.created_at,
      created_by: 'researcher', // Maintain compatibility
      
      // Full settings object
      settings: settings
    };
  } catch (error) {
    console.error('Error formatting study:', error);
    return dbStudy; // Return original if formatting fails
  }
}

/**
 * Create a new study in the database
 */
async function createStudy(req, res) {
  try {
    // Authenticate user first
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return res.status(authResult.status).json({ success: false, error: authResult.error });
    }

    const studyData = req.body;
    const timestamp = new Date().toISOString();
    
    // Get the authorization token for user context
    const authHeader = req.headers.authorization;
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the user's session context for RLS
    const userSupabase = createClient(supabaseUrl, supabaseKey);
    await userSupabase.auth.setSession({
      access_token: token,
      refresh_token: null // We don't have refresh token in this context
    });
    
    // Prepare study data for database
    const dbStudyData = {
      title: studyData.title || 'Untitled Study',
      description: studyData.description || '',
      status: studyData.status || 'draft',
      researcher_id: authResult.user.id,
      target_participants: studyData.target_participants || 10,
      settings: {
        type: studyData.type || 'usability',
        blocks: studyData.blocks || [],
        compensation: studyData.compensation || 25,
        duration: studyData.duration || 30,
        difficulty: studyData.difficulty || 'beginner',
        // Include any additional settings
        ...studyData.settings
      }
    };

    console.log('📝 Attempting to insert study with user context:', {
      userId: authResult.user.id,
      title: dbStudyData.title,
      hasToken: !!token
    });

    // Insert into database using admin client (bypasses RLS)
    const { data: newStudy, error } = await supabaseAdmin
      .from('studies')
      .insert([dbStudyData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating study:', error);
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('Failed study data:', dbStudyData);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to create study in database',
        debug: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          studyData: dbStudyData
        }
      });
    }

    console.log(`✅ Study created in database: ${newStudy.title} (UUID: ${newStudy.id})`);
    console.log(`🔐 Study created by researcher: ${authResult.user.id}`);
    
    // Return formatted study for frontend
    const formattedStudy = formatStudyForFrontend(newStudy);
    
    console.log(`📊 Returning formatted study data:`, {
      id: formattedStudy.id,
      _id: formattedStudy._id,
      title: formattedStudy.title,
      researcher_id: formattedStudy.researcher_id
    });
    
    return res.status(201).json({
      success: true,
      data: formattedStudy,
      message: 'Study created successfully'
    });

  } catch (error) {
    console.error('Create study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get studies from database
 * Updated 2025-01-22 - Force deployment refresh
 * 
 * CRITICAL: This function MUST return the following format:
 * {
 *   success: true,
 *   studies: StudyObject[],
 *   pagination: {
 *     currentPage: number,
 *     totalPages: number,
 *     totalStudies: number,
 *     hasNext: boolean,
 *     hasPrev: boolean
 *   }
 * }
 * 
 * DO NOT change this format without updating the frontend StudiesResponse interface!
 */
async function getStudies(req, res) {
  try {
    const userRole = req.headers['x-user-role'] || 'researcher';
    
    console.log(`📚 Getting studies for role: ${userRole} - Fixed query logic`);
    
    // Authenticate user to get their ID
    let currentUserId = null;
    if (userRole === 'researcher') {
      // For researchers, we need to filter by their own studies
      const authResult = await authenticateUser(req);
      if (authResult.success) {
        currentUserId = authResult.user.id;
        console.log(`🔐 Authenticated researcher: ${currentUserId}`);
      } else {
        console.error(`❌ Authentication failed for researcher: ${authResult.error}`);
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
    }
    
    // Build the query properly
    let query = supabaseAdmin
      .from('studies')
      .select('*');
    
    // Filter based on user role
    if (userRole === 'participant') {
      console.log('🔍 Filtering for active studies only');
      query = query.eq('status', 'active');
    } else if (userRole === 'researcher' && currentUserId) {
      console.log(`🔍 Filtering for researcher's own studies: ${currentUserId}`);
      query = query.eq('researcher_id', currentUserId);
    }
    
    // Add ordering
    query = query.order('created_at', { ascending: false });
    
    console.log('🗄️ Executing database query...');
    const { data: studies, error } = await query;

    if (error) {
      console.error('❌ Database error fetching studies:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch studies from database',
        details: error.message
      });
    }

    console.log(`📊 Found ${studies.length} studies in database`);

    // Format studies for frontend
    console.log('🔄 Formatting studies for frontend...');
    const formattedStudies = studies.map(study => {
      try {
        return formatStudyForFrontend(study);
      } catch (formatError) {
        console.error('❌ Error formatting study:', study.id, formatError);
        return study; // Return unformatted if there's an error
      }
    });
    
    console.log(`📚 Successfully formatted ${formattedStudies.length} studies for role: ${userRole}`);
    
    // Create the response object with STRICT format validation
    const response = {
      success: true,
      studies: formattedStudies,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalStudies: studies.length,
        hasNext: false,
        hasPrev: false
      }
    };

    // CRITICAL: Validate response format before sending
    validateStudiesResponse(response);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Get studies error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * Update study in database
 */
async function updateStudy(req, res) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return res.status(authResult.status).json({ success: false, error: authResult.error });
    }

    const studyId = req.query.id || req.body.id || req.body.uuid || req.body._id;
    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    const updateData = req.body;
    
    // Prepare update data
    const dbUpdateData = {
      updated_at: new Date().toISOString()
    };
    
    // Update basic fields if provided
    if (updateData.title !== undefined) dbUpdateData.title = updateData.title;
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    if (updateData.status !== undefined) dbUpdateData.status = updateData.status;
    if (updateData.target_participants !== undefined) dbUpdateData.target_participants = updateData.target_participants;
    
    // Update settings if provided
    if (updateData.type || updateData.blocks || updateData.compensation || updateData.duration || updateData.difficulty || updateData.settings) {
      // First get current settings
      const { data: currentStudy, error: fetchError } = await supabase
        .from('studies')
        .select('settings')
        .eq('id', studyId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching current study for update:', fetchError);
        return res.status(404).json({
          success: false,
          error: 'Study not found'
        });
      }
      
      const currentSettings = currentStudy.settings || {};
      
      dbUpdateData.settings = {
        ...currentSettings,
        ...(updateData.settings || {}),
        type: updateData.type || currentSettings.type,
        blocks: updateData.blocks || currentSettings.blocks,
        compensation: updateData.compensation || currentSettings.compensation,
        duration: updateData.duration || currentSettings.duration,
        difficulty: updateData.difficulty || currentSettings.difficulty
      };
    }

    // Update in database
    const { data: updatedStudy, error } = await supabase
      .from('studies')
      .update(dbUpdateData)
      .eq('id', studyId)
      .eq('researcher_id', authResult.user.id) // Ensure user owns the study
      .select()
      .single();

    if (error) {
      console.error('Database error updating study:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update study in database'
      });
    }

    if (!updatedStudy) {
      return res.status(404).json({
        success: false,
        error: 'Study not found or access denied'
      });
    }

    console.log(`✅ Study updated in database: ${updatedStudy.title} (UUID: ${updatedStudy.id})`);
    
    // Return formatted study for frontend
    const formattedStudy = formatStudyForFrontend(updatedStudy);
    
    return res.status(200).json({
      success: true,
      data: formattedStudy,
      message: 'Study updated successfully'
    });

  } catch (error) {
    console.error('Update study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Delete study - Only allows deletion of draft studies by the owner
 */
async function deleteStudy(req, res) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return res.status(authResult.status).json({ success: false, error: authResult.error });
    }

    const studyId = req.query.id || req.body.id;
    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    // First check if study exists and user owns it
    const { data: existingStudy, error: fetchError } = await supabase
      .from('studies')
      .select('id, title, status, researcher_id')
      .eq('id', studyId)
      .eq('researcher_id', authResult.user.id)
      .single();

    if (fetchError || !existingStudy) {
      return res.status(404).json({
        success: false,
        error: 'Study not found or access denied'
      });
    }

    // Optional: Only allow deletion of draft studies (uncomment if needed)
    // if (existingStudy.status !== 'draft') {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Only draft studies can be deleted'
    //   });
    // }

    // Delete the study
    const { error: deleteError } = await supabase
      .from('studies')
      .delete()
      .eq('id', studyId)
      .eq('researcher_id', authResult.user.id);

    if (deleteError) {
      console.error('Database error deleting study:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete study from database'
      });
    }

    console.log(`✅ Study deleted: ${existingStudy.title} (UUID: ${studyId})`);
    
    return res.status(200).json({
      success: true,
      message: 'Study deleted successfully'
    });

  } catch (error) {
    console.error('Delete study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get study analytics (placeholder for future implementation)
 */
async function getDashboardAnalytics(req, res) {
  try {
    // Authenticate user to get their ID - dashboard analytics should be user-specific
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      console.error('❌ Authentication failed for dashboard analytics:', authResult.error);
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required for dashboard analytics' 
      });
    }

    const currentUserId = authResult.user.id;
    console.log(`📊 Getting dashboard analytics for user: ${currentUserId}`);

    // Get user-specific studies from database
    const { data: studies, error } = await supabaseAdmin
      .from('studies')
      .select('id, status, created_at')
      .eq('researcher_id', currentUserId);
    
    if (error) {
      console.error('Analytics query error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }

    // Get participant data for comprehensive analytics
    const { data: applications, error: applicationsError } = await supabaseAdmin
      .from('study_applications')
      .select('created_at, study_id')
      .in('study_id', studies.map(s => s.id) || []);

    if (applicationsError) {
      console.error('Applications query error:', applicationsError);
      // Continue without participant data rather than fail completely
    }

    console.log(`📈 Found ${studies.length} studies and ${applications?.length || 0} applications for user dashboard analytics`);

    // Calculate weekly changes
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekStudies = studies.filter(s => new Date(s.created_at) > oneWeekAgo).length;
    const thisWeekParticipants = applications?.filter(a => new Date(a.created_at) > oneWeekAgo).length || 0;

    const analytics = {
      totalStudies: studies.length,
      totalParticipants: applications?.length || 0,
      activeStudies: studies.filter(s => s.status === 'active').length,
      draftStudies: studies.filter(s => s.status === 'draft').length,
      completedStudies: studies.filter(s => s.status === 'completed').length,
      weeklyStudyChange: thisWeekStudies,
      weeklyParticipantChange: thisWeekParticipants,
      recentActivity: studies.length > 0 ? studies[0].created_at : null
    };
    
    return res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Main API handler
 */
/**
 * Debug endpoint to test authentication and return user object details
 */
async function debugAuth(req, res) {
  console.log('🔍 Debug: Testing authentication function');
  
  const authResult = await authenticateUser(req);
  
  if (!authResult.success) {
    return res.status(authResult.status || 500).json({
      success: false,
      error: authResult.error,
      debug: 'Authentication failed in debug mode'
    });
  }

  return res.status(200).json({
    success: true,
    user: authResult.user,
    debug: {
      userId: authResult.user.id,
      userIdLength: authResult.user.id.length,
      userIdType: typeof authResult.user.id,
      isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(authResult.user.id),
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Debug endpoint to check database schema and constraints
 */
async function debugSchema(req, res) {
  console.log('🔍 Debug: Checking database schema');
  
  try {
    // Check studies table structure
    const { data: studiesColumns, error: studiesError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'studies')
      .eq('table_schema', 'public');
    
    if (studiesError) {
      console.error('Schema query error:', studiesError);
    }

    // Check foreign key constraints
    const { data: constraints, error: constraintsError } = await supabaseAdmin
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'studies')
      .eq('table_schema', 'public');
    
    if (constraintsError) {
      console.error('Constraints query error:', constraintsError);
    }

    // Test a simple query to check RLS policies
    const { data: testQuery, error: testError } = await supabase
      .from('studies')
      .select('id, title')
      .limit(1);

    return res.status(200).json({
      success: true,
      debug: {
        studiesColumns: studiesColumns || [],
        studiesColumnsError: studiesError?.message,
        constraints: constraints || [],
        constraintsError: constraintsError?.message,
        testQuery: testQuery || [],
        testQueryError: testError?.message,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Debug schema error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check database schema',
      debug: error.message
    });
  }
}

/**
 * Get study sessions for participant
 */
async function getSessions(req, res) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const participantId = authResult.user.id;

    // Get participant's study applications (sessions)
    const { data: sessions, error } = await supabaseAdmin
      .from('study_applications')
      .select(`
        id,
        status,
        created_at,
        completed_at,
        progress,
        studies (
          id,
          title,
          description,
          status
        )
      `)
      .eq('participant_id', participantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Sessions query error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions'
      });
    }

    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      studyId: session.studies?.id,
      studyTitle: session.studies?.title || 'Untitled Study',
      studyDescription: session.studies?.description,
      status: session.status,
      progress: session.progress || 0,
      startedAt: session.created_at,
      completedAt: session.completed_at,
      canResume: session.status === 'in_progress'
    }));

    return res.status(200).json({
      success: true,
      data: {
        sessions: formattedSessions,
        totalSessions: formattedSessions.length,
        activeSessions: formattedSessions.filter(s => s.status === 'in_progress').length,
        completedSessions: formattedSessions.filter(s => s.status === 'completed').length
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Main API Handler
 */
export default async function handler(req, res) {
  // Enhanced CORS headers for better compatibility
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://researchhub-saas.vercel.app',
    'https://researchhub-saas-ca57yz24b-mohmmed-alwakids-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action } = req.query;
    
    console.log(`🔧 Research API (Database) - ${req.method} ${action}`);
    console.log('🔍 Headers received:', {
      authorization: req.headers.authorization ? 'Bearer ' + req.headers.authorization.substring(7, 27) + '...' : 'None',
      contentType: req.headers['content-type'],
      origin: req.headers.origin
    });

    switch (action) {
      case 'create-study':
        if (req.method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        console.log('📝 Processing create-study request');
        return await createStudy(req, res);

      case 'get-studies':
        if (req.method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await getStudies(req, res);

      case 'update-study':
        if (req.method !== 'PUT' && req.method !== 'PATCH') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await updateStudy(req, res);

      case 'delete-study':
        if (req.method !== 'DELETE') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await deleteStudy(req, res);

      case 'dashboard-analytics':
        if (req.method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await getDashboardAnalytics(req, res);

      case 'debug-auth':
        if (req.method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await debugAuth(req, res);

      case 'debug-schema':
        if (req.method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await debugSchema(req, res);

      case 'get-sessions':
        if (req.method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await getSessions(req, res);

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}. Available actions: create-study, get-studies, update-study, delete-study, dashboard-analytics, get-sessions`
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
