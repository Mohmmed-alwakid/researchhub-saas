/**
 * PRODUCTION RESEARCH API
 * Vercel-compatible version for studies management
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.hM5DhDshOQOhXIepbPWiznEDgpN9MzGhB0kzlxGd_6Y';

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Main handler function for Vercel
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('=== RESEARCH ACTION:', req.query.action || 'undefined', '===');

  try {
    // Authenticate user first
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const action = req.query.action;

    switch (action) {
      case 'studies':
        return await handleGetStudies(req, res, auth.user);
      case 'get-study':
        return await handleGetStudy(req, res, auth.user);
      case 'create-study':
        return await handleCreateStudy(req, res, auth.user);
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
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
 * Authenticate user with simplified token validation
 */
async function authenticateUser(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // For production, use Supabase token validation
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { success: false, error: 'Invalid or expired token', status: 401 };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

/**
 * Get studies list
 */
async function handleGetStudies(req, res, user) {
  try {
    console.log('🔍 Studies API - Debug Info:', {
      userId: user.id,
      userRole: user.user_metadata?.role,
      timestamp: new Date().toISOString()
    });

    // For now, return sample data since we're setting up the infrastructure
    const sampleStudies = [
      {
        id: 'sample-1',
        title: 'Sample Study 1',
        description: 'This is a sample study for testing',
        status: 'active',
        created_at: new Date().toISOString(),
        researcher_id: user.id,
        settings: {
          type: 'usability',
          duration: 30,
          compensation: 25,
          maxParticipants: 15
        }
      }
    ];

    return res.status(200).json({
      success: true,
      studies: sampleStudies,
      meta: {
        total: sampleStudies.length,
        userRole: user.user_metadata?.role || 'participant'
      }
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
 * Get single study
 */
async function handleGetStudy(req, res, user) {
  try {
    const studyId = req.query.study_id;
    
    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    // Return sample study for now
    const sampleStudy = {
      id: studyId,
      title: 'Sample Study',
      description: 'This is a sample study for testing',
      status: 'active',
      created_at: new Date().toISOString(),
      researcher_id: user.id,
      settings: {
        type: 'usability',
        duration: 30,
        compensation: 25,
        maxParticipants: 15
      }
    };

    return res.status(200).json({
      success: true,
      study: sampleStudy
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
 * Create new study
 */
async function handleCreateStudy(req, res, user) {
  try {
    const { title, description, settings } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    // Create sample study response
    const newStudy = {
      id: `study-${Date.now()}`,
      title,
      description,
      status: 'draft',
      created_at: new Date().toISOString(),
      researcher_id: user.id,
      settings: settings || {
        type: 'usability',
        duration: 30,
        compensation: 25,
        maxParticipants: 15
      }
    };

    return res.status(201).json({
      success: true,
      study: newStudy,
      message: 'Study created successfully'
    });

  } catch (error) {
    console.error('Create study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create study'
    });
  }
}
