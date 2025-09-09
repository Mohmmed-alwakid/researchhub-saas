/**
 * APPLICATIONS API - With Supabase Database Integration
 * Handles: Participant study applications
 * 
 * MIGRATION COMPLETE: Now uses Supabase database instead of in-memory storage
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.I_4j2vgcu2aR9Pw1d-QG2hpKunbmNKD8tWg3Psl0GNc';

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('📋 Applications API initialized with Supabase database');

/**
 * Helper function to authenticate user
 */
async function authenticateUser(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase Admin client (bypasses RLS)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.log('❌ Token verification failed:', error?.message);
      console.log('❌ Token verification error details:', {
        errorMessage: error?.message,
        errorCode: error?.code,
        token: token?.substring(0, 50) + '...'
      });
      return { success: false, error: 'Invalid or expired token', status: 401 };
    }

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
 * Convert database application record to frontend-compatible format
 */
function formatApplicationForFrontend(dbApplication, includeNumericId = true) {
  try {
    const applicationData = dbApplication.application_data || {};
    
    // Create a hash-based numeric ID for frontend compatibility
    const numericId = includeNumericId ? 
      Math.abs(dbApplication.id.split('-').join('').slice(0, 8).split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) :
      null;

    return {
      // Database fields
      id: includeNumericId ? numericId : dbApplication.id,
      _id: dbApplication.id, // UUID as string for compatibility
      uuid: dbApplication.id, // Keep original UUID
      study_id: dbApplication.study_id,
      participant_id: dbApplication.participant_id,
      status: dbApplication.status || 'pending',
      applied_at: dbApplication.applied_at,
      reviewed_at: dbApplication.reviewed_at,
      reviewed_by: dbApplication.reviewed_by,
      created_at: dbApplication.created_at,
      updated_at: dbApplication.updated_at,
      notes: dbApplication.notes,
      
      // Application data fields (for backward compatibility)
      responses: applicationData.responses || applicationData.screeningResponses || [],
      screeningResponses: applicationData.responses || applicationData.screeningResponses || [],
      participant_email: applicationData.participant_email || null,
      
      // Frontend compatibility (camelCase)
      studyId: dbApplication.study_id,
      participantId: dbApplication.participant_id,
      appliedAt: dbApplication.applied_at,
      reviewedAt: dbApplication.reviewed_at,
      rejectionReason: applicationData.rejectionReason || null,
      submitted_at: dbApplication.applied_at, // Alias for compatibility
      
      // Full application_data object
      application_data: applicationData
    };
  } catch (error) {
    console.error('Error formatting application:', error);
    return dbApplication; // Return original if formatting fails
  }
}

/**
 * Get participant's applications from database
 */
async function getMyApplications(req, res) {
  const auth = await authenticateUser(req);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    console.log('📋 Get my applications request:', { userId: auth.user.id, page, limit, status });

    let query = supabase
      .from('study_applications')
      .select('*')
      .eq('participant_id', auth.user.id)
      .order('applied_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('study_applications')
      .select('*', { count: 'exact', head: true })
      .eq('participant_id', auth.user.id);

    if (countError) {
      console.error('Count error:', countError);
      return res.status(500).json({
        success: false,
        error: 'Failed to count applications'
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: applications, error } = await query;

    if (error) {
      console.error('Database error fetching applications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch applications from database'
      });
    }

    // Format applications for frontend
    const formattedApplications = applications.map(app => formatApplicationForFrontend(app));
    
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`📋 Found ${totalCount} total applications for user ${auth.user.email}, showing ${applications.length} on page ${page}`);

    return res.status(200).json({ 
      success: true, 
      data: {
        applications: formattedApplications,
        pagination: {
          current: page,
          pages: totalPages,
          total: totalCount
        }
      }
    });

  } catch (error) {
    console.error('Get my applications error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    });
  }
}

/**
 * Withdraw application from database
 */
async function withdrawApplication(req, res) {
  const auth = await authenticateUser(req);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { endpoint } = req.query;
    const applicationId = endpoint.split('/')[1]; // Extract application ID

    // Update application status to 'withdrawn'
    const { data: updatedApplication, error } = await supabase
      .from('study_applications')
      .update({ 
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .eq('participant_id', auth.user.id) // Ensure user owns the application
      .select()
      .single();

    if (error) {
      console.error('Database error withdrawing application:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to withdraw application'
      });
    }

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or access denied'
      });
    }

    console.log(`✅ Application withdrawn: ${applicationId} by ${auth.user.email}`);

    return res.status(200).json({ 
      success: true, 
      data: formatApplicationForFrontend(updatedApplication),
      message: 'Application withdrawn successfully' 
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to withdraw application' 
    });
  }
}

/**
 * Get study applications (for researchers) from database
 */
async function getStudyApplications(req, res) {
  const auth = await authenticateUser(req);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { endpoint } = req.query;
    const studyId = endpoint.split('/')[0]; // Extract study ID
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    console.log('📋 Get study applications request:', { studyId, page, limit, status });

    // Verify researcher owns the study
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('researcher_id')
      .eq('id', studyId)
      .single();

    if (studyError || !study || study.researcher_id !== auth.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Study not found or access denied'
      });
    }

    let query = supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', studyId)
      .order('applied_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('study_applications')
      .select('*', { count: 'exact', head: true })
      .eq('study_id', studyId);

    if (countError) {
      console.error('Count error:', countError);
      return res.status(500).json({
        success: false,
        error: 'Failed to count applications'
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: applications, error } = await query;

    if (error) {
      console.error('Database error fetching study applications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch study applications'
      });
    }

    // Format applications for frontend
    const formattedApplications = applications.map(app => formatApplicationForFrontend(app));
    
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`📋 Found ${totalCount} total applications for study ${studyId}, showing ${applications.length} on page ${page}`);

    return res.status(200).json({ 
      success: true, 
      data: {
        applications: formattedApplications,
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: totalPages
      }
    });

  } catch (error) {
    console.error('Get study applications error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch study applications' 
    });
  }
}

/**
 * Submit a study application to database
 */
async function submitApplication(req, res) {
  const auth = await authenticateUser(req);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { studyId, responses, screeningResponses } = req.body;

    // Handle both possible field names for responses
    const finalResponses = responses || screeningResponses || [];

    console.log('📋 Submit application request:', { studyId, finalResponses, userId: auth.user.id });

    // Validate required studyId
    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'studyId is required'
      });
    }

    // Check if user has already applied to this study
    const { data: existingApplication, error: checkError } = await supabaseAdmin
      .from('study_applications')
      .select('id')
      .eq('participant_id', auth.user.id)
      .eq('study_id', studyId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing application:', checkError);
      console.error('Check error details:', {
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
        code: checkError.code,
        userId: auth.user.id,
        studyId: studyId
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to check existing application',
        debug: {
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint,
          code: checkError.code,
          userId: auth.user.id,
          studyId: studyId
        }
      });
    }

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_APPLICATION',
        error: 'You have already applied to this study'
      });
    }

    // Prepare application data for database
    const dbApplicationData = {
      study_id: studyId,
      participant_id: auth.user.id,
      status: 'pending',
      application_data: {
        responses: finalResponses,
        screeningResponses: finalResponses,
        participant_email: auth.user.email,
        submitted_at: new Date().toISOString()
      }
    };

    console.log('📝 Attempting to insert application with user context:', {
      userId: auth.user.id,
      studyId: studyId,
      email: auth.user.email
    });

    // Insert into database using admin client (bypasses RLS)
    const { data: newApplication, error } = await supabaseAdmin
      .from('study_applications')
      .insert([dbApplicationData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating application:', error);
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('Failed application data:', dbApplicationData);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to submit application to database',
        debug: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          applicationData: dbApplicationData
        }
      });
    }

    console.log(`✅ Application created in database: Study ${studyId} by ${auth.user.email} (UUID: ${newApplication.id})`);
    
    // Return formatted application for frontend
    const formattedApplication = formatApplicationForFrontend(newApplication);

    return res.status(201).json({ 
      success: true, 
      data: formattedApplication,
      message: 'Application submitted successfully' 
    });

  } catch (error) {
    console.error('Submit application error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to submit application' 
    });
  }
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { endpoint, action } = req.query;

    console.log('📋 Applications API (Database) - Query params:', { endpoint, action, method: req.method });

    // Handle different endpoint patterns
    if (action === 'version' || action === 'health') {
      return res.status(200).json({
        success: true,
        version: '1.1.0-rls-fix',
        timestamp: new Date().toISOString(),
        deployment: 'supabaseAdmin-fix-deployed',
        message: 'Applications API with RLS fix using supabaseAdmin client'
      });
    } else if (endpoint === 'applications/my-applications' || action === 'my-applications') {
      return await getMyApplications(req, res);
    } else if (endpoint && endpoint.includes('/withdraw')) {
      return await withdrawApplication(req, res);
    } else if (endpoint && endpoint.includes('/applications')) {
      return await getStudyApplications(req, res);
    } else if (action === 'apply' || req.method === 'POST') {
      return await submitApplication(req, res);
    } else {
      console.log('❌ Applications API - Invalid parameters:', { endpoint, action });
      return res.status(400).json({ 
        success: false, 
        error: `Invalid endpoint or action parameter. Received: endpoint=${endpoint}, action=${action}` 
      });
    }

  } catch (error) {
    console.error('Applications API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
