/**
 * CONSOLIDATED RESEARCH MANAGEMENT API
 * Handles: Study management, sessions, applications, and block types
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let supabaseAdmin = null;

// Initialize Supabase clients only if environment variables are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('📚 Supabase client initialized');
} else {
  console.log('📚 Supabase not configured, using file storage only');
}

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  console.log('📚 Supabase admin client initialized');
}

// In development with fallback database, we'll use a simpler approach
const isLocalDevelopment = process.env.NODE_ENV !== 'production';

// Studies storage path - use temp directory for production
const STUDIES_FILE_PATH = process.env.VERCEL 
  ? '/tmp/studies.json' 
  : path.join(process.cwd(), 'testing', 'data', 'studies.json');

// Function to load studies from Supabase or file fallback
async function loadStudies() {
  try {
    // Try to load from Supabase first (if available)
    if (supabase) {
      try {
        const { data: studies, error } = await supabase
          .from('studies')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && studies && studies.length > 0) {
          console.log(`📚 Loaded ${studies.length} studies from Supabase database`);
          return studies;
        } else {
          console.log(`📚 No studies found in Supabase, using demo data`);
          // Fall through to demo data
        }
      } catch (dbError) {
        console.log('📚 Supabase query failed, trying demo data:', dbError.message);
      }
    }

    // Fallback to file storage
    try {
      const studiesData = JSON.stringify([
        {
          "id": "demo-study-1",
          "title": "E-commerce Navigation Study",
          "description": "Test how users navigate through our product pages and complete purchases. Help us improve the shopping experience.",
          "type": "usability",
          "status": "active",
          "target_participants": 10,
          "creator_id": "researcher-1",
          "created_at": new Date().toISOString(),
          "blocks": [
            {
              "id": "welcome-1",
              "order": 1,
              "type": "welcome_screen", 
              "title": "Welcome",
              "description": "Welcome to our study!",
              "settings": {
                "title": "Welcome to our E-commerce Study",
                "message": "Thank you for participating! We'll test navigation and shopping tasks.",
                "showContinueButton": true
              }
            },
            {
              "id": "task-1", 
              "order": 2,
              "type": "task_instructions",
              "title": "Navigation Task",
              "description": "Find and add a product to cart",
              "settings": {
                "instructions": "Please navigate to the Electronics section and add a laptop to your cart.",
                "timeLimit": 300,
                "required": true
              }
            },
            {
              "id": "feedback-1",
              "order": 3, 
              "type": "feedback_collection",
              "title": "Your Experience",
              "description": "Tell us about your experience",
              "settings": {
                "question": "How easy was it to find and add the product?",
                "required": false
              }
            },
            {
              "id": "thankyou-1",
              "order": 4,
              "type": "thank_you",
              "title": "Thank You",
              "description": "Thank you for participating!",
              "settings": {
                "message": "Your feedback helps us improve!",
                "redirectUrl": null
              }
            }
          ],
          "screening_questions": [
            {
              "id": "screen-1",
              "question": "How often do you shop online?",
              "type": "multiple_choice",
              "options": ["Daily", "Weekly", "Monthly", "Rarely"],
              "required": true
            }
          ]
        },
        {
          "id": "demo-study-2", 
          "title": "Mobile App Usability Test",
          "description": "Test the usability of our mobile application interface and navigation.",
          "type": "usability",
          "status": "active",
          "target_participants": 8,
          "creator_id": "researcher-1", 
          "created_at": new Date().toISOString(),
          "blocks": [
            {
              "id": "welcome-2",
              "order": 1,
              "type": "welcome_screen",
              "title": "Welcome", 
              "description": "Welcome to mobile app testing!",
              "settings": {
                "title": "Mobile App Study",
                "message": "We'll test various app features and navigation.",
                "showContinueButton": true
              }
            },
            {
              "id": "task-2",
              "order": 2, 
              "type": "task_instructions",
              "title": "App Navigation",
              "description": "Complete basic app tasks",
              "settings": {
                "instructions": "Sign up for an account and complete your profile.",
                "timeLimit": 600,
                "required": true
              }
            },
            {
              "id": "thankyou-2",
              "order": 3,
              "type": "thank_you", 
              "title": "Thank You",
              "description": "Thanks for testing our app!",
              "settings": {
                "message": "Your feedback is valuable to us!",
                "redirectUrl": null
              }
            }
          ],
          "screening_questions": [
            {
              "id": "screen-2",
              "question": "Do you regularly use mobile apps?",
              "type": "multiple_choice", 
              "options": ["Yes, daily", "Yes, weekly", "Occasionally", "Rarely"],
              "required": true
            }
          ]
        }
      ], null, 2);
      
      const studies = JSON.parse(studiesData);
      console.log(`📚 Using demo studies (${studies.length} studies available)`);
      return studies;
    } catch (parseError) {
      console.error('Error parsing demo studies:', parseError);
      return [];
    }

    // If no studies found anywhere, return empty array
    console.log('📚 No studies found in database or file storage');
    return [];

  } catch (error) {
    console.error('Error loading studies:', error);
    console.log('📚 Using empty studies array');
    return [];
  }
}

// Function to save studies to Supabase and file fallback
async function saveStudies(studies) {
  try {
    // Try to save to Supabase first (if available)
    if (supabase) {
      try {
        // Only save non-demo studies to avoid conflicts
        const realStudies = studies.filter(study => !study.id.startsWith('demo-'));
        
        for (const study of realStudies) {
          // Prepare study data for Supabase (remove any UI-only fields)
          const studyData = {
            id: study.id,
            title: study.title,
            description: study.description,
            type: study.type,
            status: study.status,
            settings: study.settings || {},
            blocks: study.blocks || [],
            target_participants: study.target_participants || 10,
            created_at: study.created_at,
            updated_at: study.updated_at || new Date().toISOString(),
            creator_id: study.creator_id || study.created_by,
            screening_questions: study.screening_questions || []
          };
          
          const { error } = await supabase
            .from('studies')
            .upsert(studyData, { onConflict: 'id' });
          
          if (error) {
            console.log(`💾 Supabase upsert error for study ${study.id}:`, error.message);
            throw error;
          }
        }
        console.log(`💾 Saved ${realStudies.length} real studies to Supabase database`);
        return; // Success, no need for file fallback
      } catch (dbError) {
        console.log('💾 Supabase save failed, using file fallback:', dbError.message);
      }
    }
      
    // Fallback to file storage
    if (!process.env.VERCEL) {
      const dbDir = path.dirname(STUDIES_FILE_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(STUDIES_FILE_PATH, JSON.stringify(studies, null, 2));
      console.log(`💾 Saved ${studies.length} studies to file storage`);
    }
  } catch (error) {
    console.error('Error saving studies:', error);
  }
}

// Initialize with empty array, will be loaded async
let localStudies = [];

// Initialize studies on first request
let studiesInitialized = false;

console.log('🔧 Research API initialized');

/**
 * Ensure studies are loaded from persistent storage
 */
async function ensureStudiesLoaded() {
  if (!studiesInitialized) {
    console.log('📚 Loading studies from persistent storage...');
    localStudies = await loadStudies();
    studiesInitialized = true;
    console.log(`📚 Loaded ${localStudies.length} studies from storage`);
  }
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  console.log(`🔧 Research API handler called - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;
    console.log(`🔧 API handling action: ${action} (${req.method})`);

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
      
      case 'apply':
        return await applyToStudy(req, res);
      
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
 * Helper function to detect demo/test studies
 * @param {Object} study - Study object to check
 * @returns {boolean} - True if this is a demo/test study
 */
function isDemoOrTestStudy(study) {
  // Studies created by test users
  const hasTestCreator = study.created_by && (
    study.created_by.includes('test-') ||
    study.created_by.includes('demo-') ||
    study.created_by === 'test-researcher-001' ||
    study.created_by === 'test-user' ||
    study.created_by === 'test'
  );
  
  // Studies with demo/test keywords in title
  const hasTestTitle = study.title && (
    study.title.toLowerCase().includes('test') ||
    study.title.toLowerCase().includes('demo') ||
    study.title.toLowerCase().includes('sample') ||
    study.title.includes('Default')
  );
  
  // Studies with demo/test keywords in description
  const hasTestDescription = study.description && (
    study.description.toLowerCase().includes('demo') ||
    study.description.toLowerCase().includes('test') ||
    study.description.toLowerCase().includes('example') ||
    study.description.toLowerCase().includes('testing')
  );
  
  // Studies with test IDs
  const hasTestId = study.id && study.id.includes('simple-study');
  
  return hasTestCreator || hasTestTitle || hasTestDescription || hasTestId;
}

/**
 * Get list of studies
 */
async function getStudies(req, res) {
  try {
    const startTime = Date.now(); // Performance tracking
    
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
    console.log(`📚 Getting studies - count: ${localStudies.length}`);
    
    // Try to get user info from token (optional for public studies)
    let userRole = 'participant'; // Default to participant (most restrictive)
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
            
            // Validate role
            const validRoles = ['participant', 'researcher', 'admin'];
            if (!validRoles.includes(userRole)) {
              console.log(`⚠️ Invalid role '${userRole}', defaulting to participant`);
              userRole = 'participant';
            }
          } else {
            console.log(`⚠️ Invalid token format, expected 4+ parts, got ${parts.length}`);
          }
        } else {
          // Handle JWT tokens - decode to get user role
          console.log('🔑 JWT token detected, parsing with Supabase');
          
          try {
            // Try to decode JWT token with Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (user && !error) {
              userId = user.id;
              userRole = user.user_metadata?.role || 'participant';
              console.log(`✅ JWT parsed successfully: role=${userRole}, id=${userId}, email=${user.email}`);
            } else {
              console.log(`⚠️ JWT parsing failed: ${error?.message}, treating as participant`);
              // Fall back to participant for invalid JWT
              userRole = 'participant';
              userId = null;
            }
          } catch (jwtError) {
            console.log(`⚠️ JWT parsing error: ${jwtError.message}, treating as participant`);
            userRole = 'participant';
            userId = null;
          }
        }
        
        console.log(`�🔍 User context: role=${userRole}, id=${userId}, token=${token.substring(0, 20)}...`);
      } catch (error) {
        console.log(`⚠️ Token parsing error: ${error.message}, treating as public request`);
        userRole = 'participant';
        userId = null;
      }
    } else {
      console.log('👤 No authorization header, treating as participant request');
    }
    
    let filteredStudies = [...localStudies];
    
    // Filter studies based on user role
    if (userRole === 'researcher') {
      // Researchers see only their own studies
      filteredStudies = localStudies.filter(study => 
        study.created_by === userId || study.creator_id === userId
      );
      console.log(`🔬 Researcher view: ${filteredStudies.length} studies (filtered by creator: ${userId})`);
      
      // If researcher has no studies, provide demo studies for testing
      if (filteredStudies.length === 0) {
        console.log(`📚 No studies found for researcher ${userId}, providing demo studies for testing`);
        // Directly provide demo studies without calling loadStudies again
        filteredStudies = [
          {
            "id": "demo-study-1",
            "title": "E-commerce Navigation Study",
            "description": "Test how users navigate through our product pages and complete purchases. Help us improve the shopping experience.",
            "type": "usability",
            "status": "active",
            "target_participants": 10,
            "creator_id": userId, // Assign to current user
            "created_at": new Date().toISOString(),
            "blocks": [
              {
                "id": "welcome-1",
                "order": 1,
                "type": "welcome_screen", 
                "title": "Welcome",
                "description": "Welcome to our study!",
                "settings": {
                  "title": "Welcome to our E-commerce Study",
                  "message": "Thank you for participating! We'll test navigation and shopping tasks.",
                  "showContinueButton": true
                }
              },
              {
                "id": "task-1", 
                "order": 2,
                "type": "task_instructions",
                "title": "Navigation Task",
                "description": "Find and add a product to cart",
                "settings": {
                  "instructions": "Please navigate to the Electronics section and add a laptop to your cart.",
                  "timeLimit": 300,
                  "required": true
                }
              }
            ],
            "screening_questions": [
              {
                "id": "age-check",
                "question": "What is your age range?",
                "type": "multiple_choice",
                "required": true,
                "options": ["18-25", "26-35", "36-45", "46-55", "56+"]
              }
            ]
          },
          {
            "id": "demo-study-2",
            "title": "Mobile App Usability Test",
            "description": "Evaluate the user experience of our new mobile application interface.",
            "type": "usability",
            "status": "active", 
            "target_participants": 15,
            "creator_id": userId, // Assign to current user
            "created_at": new Date().toISOString(),
            "blocks": [
              {
                "id": "welcome-2",
                "order": 1,
                "type": "welcome_screen",
                "title": "Welcome",
                "description": "Welcome to our mobile app study!",
                "settings": {
                  "title": "Mobile App Usability Test",
                  "message": "Help us improve our mobile app experience!",
                  "showContinueButton": true
                }
              }
            ],
            "screening_questions": [
              {
                "id": "device-check",
                "question": "What type of mobile device do you primarily use?",
                "type": "multiple_choice",
                "required": true,
                "options": ["iPhone", "Android", "Other"]
              }
            ]
          }
        ];
        console.log(`📚 Provided ${filteredStudies.length} demo studies for researcher`);
      }
    } else if (userRole === 'admin') {
      // Admins see all studies including demo data for debugging
      filteredStudies = localStudies;
      console.log(`👑 Admin view: ${filteredStudies.length} studies (including demo data for debugging)`);
    } else {
      // Participants see active/public studies, but exclude demo/test data
      filteredStudies = localStudies.filter(study => {
        // Must be active or published to be visible to participants
        const isActive = study.status === 'active' || study.status === 'published';
        if (!isActive) return false;
        
        // Multi-criteria demo study detection
        const isDemoStudy = isDemoOrTestStudy(study);
        
        // Return true only if active and NOT demo data
        return !isDemoStudy;
      });
      console.log(`👥 Participant view: ${filteredStudies.length} real studies (filtered out demo data)`);
    }
    
    // Performance logging
    const processingTime = Date.now() - startTime;
    console.log(`⚡ Study filtering completed in ${processingTime}ms`);
    
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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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
    await saveStudies(localStudies);

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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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

    // Save to persistent storage
    await saveStudies(localStudies);

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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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
    await saveStudies(localStudies);

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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
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
    await saveStudies(localStudies);

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

/**
 * Apply to a study
 */
async function applyToStudy(req, res) {
  try {
    // Ensure studies are loaded from persistent storage
    await ensureStudiesLoaded();
    
    console.log('📋 Apply to study request:', req.body);

    const { studyId, responses } = req.body;

    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    // Get user from token
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      if (token.startsWith('fallback-token-')) {
        // Parse fallback token: fallback-token-{userId}-{role}
        const parts = token.split('-');
        if (parts.length >= 3) {
          userId = parts[2];
        }
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Find the study
    const study = localStudies.find(s => s.id === studyId);
    if (!study) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    // Create application record
    const application = {
      id: Date.now().toString(),
      study_id: studyId,
      participant_id: userId,
      status: 'pending',
      responses: responses || {},
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📋 Created application:', application);

    return res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Apply to study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
}
