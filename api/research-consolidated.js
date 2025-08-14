/**
 * CONSOLIDATED RESEARCH MANAGEMENT API
 * Handles: Study management, sessions, applications, and block types
 */

import fs from 'fs';
import path from 'path';

// In development with fallback database, we'll use a simpler approach
const isLocalDevelopment = process.env.NODE_ENV !== 'production';

// File path for persistent local storage
const STUDIES_FILE_PATH = path.join(process.cwd(), 'database', 'local-studies.json');

// Function to load studies from file or create empty
function loadStudies() {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(STUDIES_FILE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Try to load existing studies
    if (fs.existsSync(STUDIES_FILE_PATH)) {
      const data = fs.readFileSync(STUDIES_FILE_PATH, 'utf8');
      const studies = JSON.parse(data);
      console.log(`📚 Loaded ${studies.length} studies from persistent storage`);
      return studies;
    } else {
      // Create empty file for studies
      fs.writeFileSync(STUDIES_FILE_PATH, JSON.stringify([], null, 2));
      console.log(`📚 Created new empty studies file`);
      return [];
    }
  } catch (error) {
    console.error('Error loading studies:', error);
    console.log('📚 Using empty studies array');
    return [];
  }
}

// Function to save studies to file
function saveStudies(studies) {
  try {
    fs.writeFileSync(STUDIES_FILE_PATH, JSON.stringify(studies, null, 2));
    console.log(`💾 Saved ${studies.length} studies to persistent storage`);
  } catch (error) {
    console.error('Error saving studies:', error);
  }
}

// Load studies from persistent storage
let localStudies = loadStudies();

console.log('🔧 Research API initialized');

/**
 * Main handler function
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
    console.log(`🔧 API handling action: ${action}`);

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
      
      case 'dashboard-analytics':
        return await getDashboardAnalytics(req, res);
      
      case 'can-edit-study':
        return await canEditStudy(req, res);
      
      case 'validate-state-transition':
        return await validateStateTransition(req, res);
      
      case 'archive-study':
        return await archiveStudy(req, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get list of studies
 */
async function getStudies(req, res) {
  try {
    console.log(`📚 Getting studies - count: ${localStudies.length}`);
    
    // Try to get user info from token (optional for public studies)
    let userRole = 'participant'; // Default to participant
    let userId = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Extract user info from token if available
        const token = authHeader.replace('Bearer ', '');
        if (token.startsWith('fallback-token-')) {
          // Parse fallback token: fallback-token-{userId}-{role}
          const parts = token.split('-');
          if (parts.length >= 4) {
            userId = parts[2];
            userRole = parts[3];
          }
        }
        console.log(`🔍 User context: role=${userRole}, id=${userId}`);
      } catch (error) {
        console.log('⚠️ Could not parse token, treating as public request');
      }
    }
    
    let filteredStudies = [...localStudies];
    
    // Filter studies based on user role
    if (userRole === 'researcher') {
      // Researchers see only their own studies
      filteredStudies = localStudies.filter(study => 
        study.created_by === userId || study.creator_id === userId
      );
      console.log(`🔬 Researcher view: ${filteredStudies.length} studies`);
    } else {
      // Participants see all active/public studies
      filteredStudies = localStudies.filter(study => 
        study.status === 'active' || study.status === 'published'
      );
      console.log(`👥 Participant view: ${filteredStudies.length} active studies`);
    }
    
    return res.status(200).json({
      success: true,
      studies: filteredStudies,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalStudies: filteredStudies.length,
        hasNext: false,
        hasPrev: false
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
 * Create a new study
 */
async function createStudy(req, res) {
  try {
    const studyData = req.body;
    console.log(`📝 Creating study: ${studyData.title}`);

    // Validate required fields
    if (!studyData.title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study title is required' 
      });
    }

    // Get user info from token
    let userId = 'test-user';
    let userEmail = 'researcher@test.com';
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        if (token.startsWith('fallback-token-')) {
          // Parse fallback token: fallback-token-{userId}-{role}
          const parts = token.split('-');
          if (parts.length >= 4) {
            userId = parts[2];
            // Try to extract email from parts[4] if available
            if (parts.length >= 5) {
              userEmail = decodeURIComponent(parts[4]);
            }
          }
        }
        console.log(`👤 Creating study for user: ${userId} (${userEmail})`);
      } catch (error) {
        console.log('⚠️ Could not parse token, using default user');
      }
    }

    // Generate new ID
    const newId = (localStudies.length + 1).toString();

    // Prepare study data
    const newStudy = {
      _id: newId,
      id: newId, // Also include id for compatibility
      title: studyData.title,
      description: studyData.description || '',
      type: studyData.type || 'usability',
      status: studyData.status || 'active', // Default to active so participants can see it
      settings: studyData.settings || {},
      blocks: studyData.blocks || [],
      target_participants: studyData.target_participants || 10,
      participants: {
        enrolled: 0,
        completed: 0,
        target: studyData.target_participants || 10
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      creator_id: userId, // Also add this for compatibility
      profiles: { email: userEmail, full_name: 'Researcher' }
    };

    // Add to local storage
    localStudies.unshift(newStudy);

    // Save to persistent storage
    saveStudies(localStudies);

    console.log(`✅ Study created successfully: ${newStudy.title} (ID: ${newId})`);

    return res.status(201).json({
      success: true,
      study: newStudy
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
 * Get single study
 */
async function getStudy(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study ID is required' 
      });
    }

    const study = localStudies.find(s => s.id === id);

    if (!study) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study not found' 
      });
    }

    return res.status(200).json({
      success: true,
      study: study
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
 * Update study
 */
async function updateStudy(req, res) {
  try {
    const { id } = req.query;
    const studyData = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study ID is required' 
      });
    }

    const studyIndex = localStudies.findIndex(s => s.id === id);

    if (studyIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study not found' 
      });
    }

    // Update study
    const updatedStudy = {
      ...localStudies[studyIndex],
      ...studyData,
      updated_at: new Date().toISOString()
    };

    localStudies[studyIndex] = updatedStudy;

    console.log(`📝 Study updated: ${updatedStudy.title} (ID: ${id})`);

    return res.status(200).json({
      success: true,
      study: updatedStudy
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
 * Delete study
 */
async function deleteStudy(req, res) {
  try {
    // Get ID from query params or request body
    const id = req.query.id || req.body.id;

    console.log('🗑️ Deleting study with ID:', id);

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Study ID is required' 
      });
    }

    const studyIndex = localStudies.findIndex(s => s._id === id || s.id === id);

    if (studyIndex === -1) {
      console.log('❌ Study not found with ID:', id);
      return res.status(404).json({ 
        success: false, 
        error: 'Study not found' 
      });
    }

    const deletedStudy = localStudies[studyIndex];
    localStudies.splice(studyIndex, 1);

    // Save to persistent storage
    saveStudies(localStudies);

    console.log('✅ Study deleted successfully:', deletedStudy.title, '(ID:', id, ')');
    console.log('📊 Remaining studies count:', localStudies.length);

    console.log(`🗑️ Study deleted: ${deletedStudy.title} (ID: ${id})`);

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
 * Get dashboard analytics
 */
async function getDashboardAnalytics(req, res) {
  try {
    const totalStudies = localStudies.length;
    const activeStudies = localStudies.filter(s => s.status === 'active').length;
    const recentStudies = localStudies.slice(0, 3);

    return res.status(200).json({
      success: true,
      data: {
        totalStudies: totalStudies,
        activeStudies: activeStudies,
        activeParticipants: 45, // Mock data for now
        completionRate: 87.5, // Mock data for now
        avgSessionTime: 8.4, // Mock data for now
        recentStudies: recentStudies.map(study => ({
          id: study.id,
          title: study.title,
          status: study.status,
          participants: study.target_participants,
          completionRate: 85, // Mock data for now
          lastUpdate: study.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
}

/**
 * Check if study can be edited
 */
async function canEditStudy(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    const study = localStudies.find(s => s.id === id || s._id === id);
    
    if (!study) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    let canEdit = false;
    let reason = '';

    switch (study.status) {
      case 'draft':
        canEdit = true;
        reason = 'Study is in draft status and can be edited';
        break;
      case 'paused':
        canEdit = true;
        reason = 'Study is paused. Changes will take effect when resumed.';
        break;
      case 'active':
        canEdit = false;
        reason = 'Cannot edit active study. Pause it first to make changes.';
        break;
      case 'completed':
        canEdit = false;
        reason = 'Cannot edit completed study';
        break;
      case 'archived':
        canEdit = false;
        reason = 'Cannot edit archived study';
        break;
      default:
        canEdit = false;
        reason = 'Unknown study status';
    }

    return res.status(200).json({
      success: true,
      canEdit,
      reason
    });

  } catch (error) {
    console.error('Can edit study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check edit permissions'
    });
  }
}

/**
 * Validate state transition
 */
async function validateStateTransition(req, res) {
  try {
    const { id, newStatus } = req.query;
    
    if (!id || !newStatus) {
      return res.status(400).json({
        success: false,
        error: 'Study ID and new status are required'
      });
    }

    const study = localStudies.find(s => s.id === id || s._id === id);
    
    if (!study) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    const currentStatus = study.status;
    let valid = false;
    let reason = '';

    // Define valid transitions
    const validTransitions = {
      'draft': ['active', 'archived'],
      'active': ['paused', 'completed'],
      'paused': ['active', 'archived'],
      'completed': ['archived'],
      'archived': [] // No transitions from archived
    };

    if (validTransitions[currentStatus]?.includes(newStatus)) {
      // Additional validation for specific transitions
      if (newStatus === 'active' && currentStatus === 'draft') {
        // Check if study has minimum required content
        if (!study.title || !study.description) {
          valid = false;
          reason = 'Study must have title and description before going active';
        } else {
          valid = true;
        }
      } else {
        valid = true;
      }
    } else {
      valid = false;
      reason = `Cannot transition from ${currentStatus} to ${newStatus}`;
    }

    return res.status(200).json({
      success: true,
      valid,
      reason
    });

  } catch (error) {
    console.error('Validate state transition error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate state transition'
    });
  }
}

/**
 * Archive study
 */
async function archiveStudy(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    const studyIndex = localStudies.findIndex(s => s.id === id || s._id === id);
    
    if (studyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    // Update study status to archived
    localStudies[studyIndex] = {
      ...localStudies[studyIndex],
      status: 'archived',
      updated_at: new Date().toISOString()
    };

    // Save updated studies
    saveStudies(localStudies);

    console.log(`📦 Archived study: ${localStudies[studyIndex].title}`);

    return res.status(200).json({
      success: true,
      study: localStudies[studyIndex]
    });

  } catch (error) {
    console.error('Archive study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to archive study'
    });
  }
}
