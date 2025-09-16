/**
 * Study Applications API - Handles participant study applications
 * Supports application submission, status tracking, and management
 */

// In-memory storage for development testing
// This persists applications between API calls during development
let applicationsStorage = [];
let applicationIdCounter = 1000;

// Initialize with some sample data for testing
if (applicationsStorage.length === 0) {
  applicationsStorage = [
    {
      id: 'app-001',
      studyId: 'study-003',
      studyTitle: 'Educational Platform for Arabic Learners',
      status: 'approved',
      appliedAt: '2025-09-15T10:30:00Z',
      updatedAt: '2025-09-15T14:20:00Z',
      compensation: '$40',
      duration: '45 min',
      participantId: 'participant-001',
      eligibilityConfirmed: true,
      screeningResponses: {
        age: '25-34',
        experience: 'intermediate',
        device: 'mobile'
      }
    },
    {
      id: 'app-002',
      studyId: 'study-001',
      studyTitle: 'Mobile App Usability Study',
      status: 'pending',
      appliedAt: '2025-09-16T10:45:00Z',
      updatedAt: '2025-09-16T10:45:00Z',
      compensation: '$25',
      duration: '30 min',
      participantId: 'participant-001',
      eligibilityConfirmed: true,
      screeningResponses: {
        age: '18-24',
        experience: 'beginner',
        device: 'desktop'
      }
    }
  ];
}

export default async function handler(req, res) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract action from body for POST requests or query for GET requests
    const action = req.method === 'POST' ? req.body?.action : req.query?.action;
    
    console.log(`🔧 Applications API - ${req.method} ${action || 'no-action'} (Storage: ${applicationsStorage.length} items)`);
    console.log('🔍 Headers received:', {
      authorization: req.headers.authorization ? 'Bearer ' + req.headers.authorization.substring(7, 27) + '...' : 'None',
      contentType: req.headers['content-type'],
      origin: req.headers.origin
    });

    switch (action) {
      case 'submit':
        if (req.method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await submitApplication(req, res);

      case 'get-applications':
        if (req.method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await getApplications(req, res);

      case 'update-status':
        if (req.method !== 'PUT' && req.method !== 'PATCH') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return await updateApplicationStatus(req, res);

      default:
        // If no action is provided but it's a POST to /applications, treat as submit
        if (req.method === 'POST' && !action) {
          return await submitApplication(req, res);
        }
        
        // If no action is provided but it's a GET to /applications, treat as get-applications
        if (req.method === 'GET' && !action) {
          return await getApplications(req, res);
        }

        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}. Available actions: submit, get-applications, update-status`
        });
    }

  } catch (error) {
    console.error('Applications API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * Submit a new study application
 */
async function submitApplication(req, res) {
  try {
    const { studyId, screeningResponses, eligibilityConfirmed } = req.body;
    
    console.log('📝 Processing application submission:', {
      studyId,
      eligibilityConfirmed,
      responsesCount: screeningResponses ? Object.keys(screeningResponses).length : 0
    });

    // Basic validation
    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    if (!eligibilityConfirmed) {
      return res.status(400).json({
        success: false,
        error: 'Eligibility confirmation is required'
      });
    }

    // Create new application with unique ID
    const newApplication = {
      id: `app-${++applicationIdCounter}`,
      studyId,
      studyTitle: getStudyTitle(studyId), // Helper function to get title
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      compensation: getStudyCompensation(studyId), // Helper function
      duration: getStudyDuration(studyId), // Helper function
      participantId: 'participant-001', // In real app, get from auth
      eligibilityConfirmed,
      screeningResponses: screeningResponses || {}
    };

    // Store the application in memory
    applicationsStorage.push(newApplication);
    
    console.log('✅ Application submitted and stored:', {
      applicationId: newApplication.id,
      totalApplications: applicationsStorage.length
    });
    
    return res.status(201).json({
      success: true,
      data: {
        applicationId: newApplication.id,
        status: newApplication.status,
        submittedAt: newApplication.appliedAt,
        message: 'Application submitted successfully. You will be notified of status updates.'
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
}

/**
 * Get user's applications
 */
async function getApplications(req, res) {
  try {
    console.log('📋 Fetching user applications from storage');

    // In a real implementation, this would:
    // 1. Verify user authentication
    // 2. Fetch applications from database filtered by user ID
    // 3. Return paginated results

    // For now, return all applications from memory storage
    console.log(`✅ Returning ${applicationsStorage.length} applications from storage`);
    
    return res.status(200).json({
      success: true,
      data: applicationsStorage,
      meta: {
        total: applicationsStorage.length,
        page: 1,
        limit: 10
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      details: error.message
    });
  }
}

/**
 * Update application status (for researchers/admins)
 */
async function updateApplicationStatus(req, res) {
  try {
    const { applicationId, status, notes } = req.body;
    
    console.log('🔄 Updating application status:', { applicationId, status });

    // Basic validation
    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Application ID and status are required'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find and update the application in memory storage
    const applicationIndex = applicationsStorage.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Update the application
    applicationsStorage[applicationIndex] = {
      ...applicationsStorage[applicationIndex],
      status,
      updatedAt: new Date().toISOString(),
      notes: notes || null
    };

    console.log('✅ Application status updated successfully in storage');
    
    return res.status(200).json({
      success: true,
      data: {
        applicationId,
        status,
        updatedAt: applicationsStorage[applicationIndex].updatedAt,
        notes: notes || null
      }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update application status',
      details: error.message
    });
  }
}

/**
 * Helper functions for study metadata
 */
function getStudyTitle(studyId) {
  const studyTitles = {
    'study-001': 'Mobile App Usability Study',
    'study-002': 'E-commerce Website Navigation Test',
    'study-003': 'Educational Platform for Arabic Learners',
    'study-004': 'Financial App Security Research',
    'study-005': 'Healthcare Portal User Experience'
  };
  return studyTitles[studyId] || `Study ${studyId}`;
}

function getStudyCompensation(studyId) {
  const compensations = {
    'study-001': '$25',
    'study-002': '$30',
    'study-003': '$40',
    'study-004': '$35',
    'study-005': '$45'
  };
  return compensations[studyId] || '$20';
}

function getStudyDuration(studyId) {
  const durations = {
    'study-001': '30 min',
    'study-002': '45 min',
    'study-003': '45 min',
    'study-004': '35 min',
    'study-005': '60 min'
  };
  return durations[studyId] || '30 min';
}