/**
 * APPLICATIONS API
 * Handles: Participant study applications
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.I_4j2vgcu2aR9Pw1d-QG2hpKunbmNKD8tWg3Psl0GNc';

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('📋 Applications API initialized');

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
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('❌ Token verification failed:', error?.message);
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
    const { endpoint } = req.query;

    // Handle different endpoint patterns
    if (endpoint === 'applications/my-applications') {
      return await getMyApplications(req, res);
    } else if (endpoint && endpoint.includes('/withdraw')) {
      return await withdrawApplication(req, res);
    } else if (endpoint && endpoint.includes('/applications')) {
      return await getStudyApplications(req, res);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid endpoint parameter' 
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

/**
 * Get participant's applications
 */
async function getMyApplications(req, res) {
  const auth = await authenticateUser(req);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    // For now, return empty applications list
    // In the future, this would fetch from applications table
    const applications = [];

    return res.status(200).json({ 
      success: true, 
      data: {
        applications: applications,
        total: 0,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        totalPages: 0
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
 * Withdraw application
 */
async function withdrawApplication(req, res) {
  const auth = await authenticateUser(req);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    const { endpoint } = req.query;
    const applicationId = endpoint.split('/')[1]; // Extract application ID

    // For now, return success response
    // In the future, this would update the application status
    return res.status(200).json({ 
      success: true, 
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
 * Get study applications (for researchers)
 */
async function getStudyApplications(req, res) {
  const auth = await authenticateUser(req);
  if (!auth.success) {
    return res.status(auth.status).json(auth);
  }

  try {
    // For now, return empty applications list
    // In the future, this would fetch applications for the study
    const applications = [];

    return res.status(200).json({ 
      success: true, 
      data: {
        applications: applications,
        total: 0,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        totalPages: 0
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
