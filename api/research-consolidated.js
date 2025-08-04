/**
 * CONSOLIDATED RESEARCH MANAGEMENT API
 * Merges: studies.js + study-sessions.js + applications.js + blocks.js
 * Handles: Study management, sessions, applications, and block types
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.hM5DhDshOQOhXIepbPWiznEDgpN9MzGhB0kzlxGd_6Y';

console.log('🔑 Research API - Supabase Config Debug:', {
  url: supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyPreview: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'NOT_SET',
  envServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'NOT_SET'
});

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { success: false, error: 'Invalid or expired token', status: 401 };
    }

    // Check role if specified
    if (requiredRoles.length > 0) {
      const userRole = user.user_metadata?.role || 'participant';
      if (!requiredRoles.includes(userRole)) {
        return { 
          success: false, 
          error: `Access denied. Required roles: ${requiredRoles.join(', ')}`, 
          status: 403 
        };
      }
    }

    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed', status: 500 };
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
  'card-sort': { name: 'Card Sort', category: 'organization' },
  'tree-test': { name: 'Tree Test', category: 'navigation' },
  'thank-you': { name: 'Thank You', category: 'completion' },
  'image-upload': { name: 'Image Upload', category: 'media' },
  'file-upload': { name: 'File Upload', category: 'media' }
};

/**
 * STUDIES HANDLERS
 */

/**
 * Get studies list
 */
async function handleGetStudies(req, res) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    console.log('🔍 Studies API - Debug Info:', {
      userId: auth.user.id,
      userRole: auth.user.user_metadata?.role,
      timestamp: new Date().toISOString()
    });

    // Check user role to determine filtering
    const userRole = auth.user.user_metadata?.role || 'participant';
    const isParticipant = userRole === 'participant';
    
    let query = supabaseAdmin
      .from('studies')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        settings,
        researcher_id,
        target_participants,
        is_public
      `);

    // Filter studies based on user role
    if (isParticipant) {
      // Participants should only see active studies (not draft)
      // Note: Using 'active' instead of 'recruiting' based on database enum
      query = query.eq('status', 'active');
      console.log('🔒 Participant filter applied: only showing active studies');
    }

    const { data: studies, error } = await query.order('created_at', { ascending: false });

    console.log('🔍 Studies query result:', { 
      studyCount: studies?.length || 0, 
      error,
      userRole,
      isParticipant,
      sampleStudy: studies?.[0] || null
    });

    if (error) {
      console.error('Get studies error:', error);
      
      // If the full query fails, try the basic query as fallback
      console.log('🔄 Attempting fallback query...');
      let basicQuery = supabaseAdmin
        .from('studies')
        .select('id, title, description, status, created_at, settings');
        
      // Apply same filter for participants in fallback
      if (isParticipant) {
        basicQuery = basicQuery.eq('status', 'active');
      }
      
      const { data: basicStudies, error: basicError } = await basicQuery
        .order('created_at', { ascending: false });
      
      if (basicError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch studies',
          details: basicError
        });
      }

      // Transform basic data to match frontend expectations
      const transformedStudies = (basicStudies || []).map(study => ({
        _id: study.id,
        id: study.id,
        title: study.title || 'Untitled Study',
        description: study.description || 'No description available',
        status: study.status || 'draft',
        type: study.settings?.type || 'usability',
        createdAt: study.created_at,
        // Provide default values for missing fields
        participants: {
          enrolled: 0,
          target: study.target_participants || 10
        },
        settings: study.settings || {
          maxParticipants: 10,
          duration: 30,
          compensation: 25
        }
      }));

      return res.status(200).json({
        success: true,
        studies: transformedStudies,
        message: `Found ${transformedStudies.length} studies (basic mode, ${userRole} filtered)`
      });
    }

    // Transform the data to match frontend expectations
    const transformedStudies = (studies || []).map(study => ({
      _id: study.id,
      id: study.id,
      title: study.title || 'Untitled Study',
      description: study.description || 'No description available',
      status: study.status || 'draft',
      type: study.settings?.type || 'usability',
      createdAt: study.created_at,
      updatedAt: study.updated_at,
      participants: {
        enrolled: 0, // This would need to be calculated from applications table
        target: study.target_participants || 10
      },
      settings: study.settings || {
        maxParticipants: study.target_participants || 10,
        duration: 30,
        compensation: 25
      }
    }));

    return res.status(200).json({
      success: true,
      studies: transformedStudies,
      message: `Found ${transformedStudies.length} studies (${userRole} filtered)`
    });

  } catch (error) {
    console.error('Get studies exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Create new study
 */
async function handleCreateStudy(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['researcher', 'admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const {
      title,
      description,
      participantLimit,
      compensation,
      blocks = [],
      status = 'draft'
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    const studyData = {
      title,
      description,
      target_participants: participantLimit || 50,
      status,
      researcher_id: auth.user.id,
      settings: {
        compensation: compensation || 25,
        blocks: blocks || [],
        type: 'usability',
        maxParticipants: participantLimit || 50,
        duration: 30
      },
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: study, error } = await supabaseAdmin
      .from('studies')
      .insert(studyData)
      .select()
      .single();

    if (error) {
      console.error('Create study error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create study'
      });
    }

    return res.status(201).json({
      success: true,
      study,
      message: 'Study created successfully'
    });

  } catch (error) {
    console.error('Create study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Update study
 */
async function handleUpdateStudy(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['researcher', 'admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { study_id, studyId, id } = req.query;
    const studyIdFromBody = req.body?.studyId || req.body?.id;
    const actualStudyId = study_id || studyId || id || studyIdFromBody;
    
    if (!actualStudyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    // Check ownership
    const { data: existingStudy, error: checkError } = await supabaseAdmin
      .from('studies')
      .select('researcher_id')
      .eq('id', actualStudyId)
      .single();

    if (checkError || !existingStudy) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    const userRole = auth.user.user_metadata?.role || 'participant';
    if (userRole !== 'admin' && existingStudy.researcher_id !== auth.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own studies'
      });
    }

    const updateData = { updated_at: new Date().toISOString() };
    
    const { title, description, participantLimit, compensation, blocks, status } = req.body;

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (participantLimit !== undefined) updateData.participant_limit = participantLimit;
    if (compensation !== undefined) updateData.compensation = compensation;
    if (blocks !== undefined) updateData.blocks = blocks;
    if (status) updateData.status = status;

    const { data: updatedStudy, error } = await supabaseAdmin
      .from('studies')
      .update(updateData)
      .eq('id', actualStudyId)
      .select()
      .single();

    if (error) {
      console.error('Update study error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update study'
      });
    }

    return res.status(200).json({
      success: true,
      study: updatedStudy,
      message: 'Study updated successfully'
    });

  } catch (error) {
    console.error('Update study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Delete study
 */
async function handleDeleteStudy(req, res) {
  console.log('🗑️ DELETE HANDLER START - Method:', req.method);
  console.log('🗑️ DELETE HANDLER - Query params:', req.query);
  console.log('🗑️ DELETE HANDLER - Body:', req.body);
  
  // Consolidated API uses POST with action parameter, not DELETE method
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Starting authentication...');
    const auth = await authenticateUser(req, ['researcher', 'admin']);
    console.log('🔐 Auth result:', { success: auth.success, status: auth.status });
    
    if (!auth.success) {
      console.log('❌ Authentication failed:', auth.error);
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    // Get study ID from query, body, or URL path
    const studyId = req.query.study_id || req.body?.studyId || req.body?.id;
    console.log('🆔 Study ID extraction:', { 
      fromQuery: req.query.study_id, 
      fromBodyStudyId: req.body?.studyId, 
      fromBodyId: req.body?.id, 
      final: studyId 
    });
    
    if (!studyId) {
      console.log('❌ No study ID provided');
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    console.log('🗑️ Starting delete for study:', studyId);

    // Check ownership
    console.log('🔍 Looking up study in database...');
    const { data: existingStudy, error: checkError } = await supabaseAdmin
      .from('studies')
      .select('researcher_id, title')
      .eq('id', studyId)
      .single();

    console.log('🔍 Database lookup complete:', { 
      foundStudy: !!existingStudy, 
      hasError: !!checkError, 
      studyId,
      studyTitle: existingStudy?.title 
    });

    if (checkError) {
      console.error('❌ Study lookup error details:', checkError);
      return res.status(404).json({
        success: false,
        error: 'Study not found',
        details: checkError.message
      });
    }

    if (!existingStudy) {
      console.error('❌ Study not found in database:', studyId);
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    const userRole = auth.user.user_metadata?.role || 'participant';
    console.log('👤 Ownership check:', { 
      userRole, 
      authUserId: auth.user.id, 
      studyResearcherId: existingStudy.researcher_id,
      ownershipMatch: existingStudy.researcher_id === auth.user.id 
    });

    if (userRole !== 'admin' && existingStudy.researcher_id !== auth.user.id) {
      console.log('❌ Ownership check failed');
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own studies'
      });
    }

    console.log('✅ Ownership verified, proceeding with soft delete...');
    console.log('✅ Ownership verified, proceeding with soft delete...');
    // Soft delete by updating status to 'deleted'
    const { data: deletedStudy, error } = await supabaseAdmin
      .from('studies')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', studyId)
      .select()
      .single();

    console.log('🗑️ Delete operation result:', { 
      success: !!deletedStudy, 
      hasError: !!error,
      deletedStudyId: deletedStudy?.id,
      newStatus: deletedStudy?.status 
    });

    if (error) {
      console.error('❌ Delete study error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete study',
        details: error.message
      });
    }

    console.log('✅ Study successfully deleted:', deletedStudy.id);
    return res.status(200).json({
      success: true,
      study: deletedStudy,
      message: `Study "${existingStudy.title}" deleted successfully`,
      method: 'soft-delete'
    });

  } catch (error) {
    console.error('❌ Delete study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * Launch study (change status to active)
 */
async function handleLaunchStudy(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['researcher', 'admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    // Get study ID from query
    const studyId = req.query.study_id;
    
    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    console.log('Launching study with ID:', studyId);

    // Check ownership
    const { data: existingStudy, error: checkError } = await supabaseAdmin
      .from('studies')
      .select('researcher_id, title, status')
      .eq('id', studyId)
      .single();

    if (checkError || !existingStudy) {
      console.error('Study lookup error:', checkError);
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    const userRole = auth.user.user_metadata?.role || 'participant';
    if (userRole !== 'admin' && existingStudy.researcher_id !== auth.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only launch your own studies'
      });
    }

    // Update status to active
    const { data: launchedStudy, error } = await supabaseAdmin
      .from('studies')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', studyId)
      .select()
      .single();

    if (error) {
      console.error('Launch study error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to launch study'
      });
    }

    return res.status(200).json({
      success: true,
      study: launchedStudy,
      message: `Study "${existingStudy.title}" launched successfully`
    });

  } catch (error) {
    console.error('Launch study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * APPLICATIONS HANDLERS
 */

/**
 * Get applications
 */
async function handleGetApplications(req, res) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { study_id, status, limit = 50, offset = 0 } = req.query;
    const userRole = auth.user.user_metadata?.role || 'participant';

    let query = supabaseAdmin
      .from('study_applications')
      .select(`
        id, user_id, study_id, status, applied_at, completed_at,
        studies!inner(id, title, creator_id),
        users!inner(id, first_name, last_name, email)
      `)
      .order('applied_at', { ascending: false });

    // Role-based filtering
    if (userRole === 'participant') {
      query = query.eq('user_id', auth.user.id);
    } else if (userRole === 'researcher') {
      query = query.eq('studies.creator_id', auth.user.id);
    }

    if (study_id) {
      query = query.eq('study_id', study_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: applications, error } = await query;

    if (error) {
      console.error('Get applications error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch applications'
      });
    }

    return res.status(200).json({
      success: true,
      applications: applications || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get applications exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Apply to study
 */
async function handleApplyToStudy(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['participant']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { study_id } = req.body;

    if (!study_id) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    // Check if study exists and is active
    const { data: study, error: studyError } = await supabaseAdmin
      .from('studies')
      .select('id, status, participant_limit')
      .eq('id', study_id)
      .single();

    if (studyError || !study) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    if (study.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Study is not accepting applications'
      });
    }

    // Check if already applied
    const { data: existingApplication } = await supabaseAdmin
      .from('study_applications')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('study_id', study_id)
      .single();

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this study'
      });
    }

    // Create application
    const applicationData = {
      user_id: auth.user.id,
      study_id: study_id,
      status: 'pending',
      applied_at: new Date().toISOString()
    };

    const { data: application, error } = await supabaseAdmin
      .from('study_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) {
      console.error('Apply to study error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit application'
      });
    }

    return res.status(201).json({
      success: true,
      application,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Apply to study exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Update application status
 */
async function handleUpdateApplicationStatus(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['researcher', 'admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { application_id, status } = req.body;

    if (!application_id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Application ID and status are required'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: ' + validStatuses.join(', ')
      });
    }

    // Get application with study info
    const { data: application, error: getError } = await supabaseAdmin
      .from('study_applications')
      .select(`
        id, user_id, study_id,
        studies!inner(creator_id)
      `)
      .eq('id', application_id)
      .single();

    if (getError || !application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user owns the study
    const userRole = auth.user.user_metadata?.role || 'participant';
    if (userRole !== 'admin' && application.studies.creator_id !== auth.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update applications for your studies'
      });
    }

    const updateData = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedApplication, error } = await supabaseAdmin
      .from('study_applications')
      .update(updateData)
      .eq('id', application_id)
      .select()
      .single();

    if (error) {
      console.error('Update application status error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update application status'
      });
    }

    return res.status(200).json({
      success: true,
      application: updatedApplication,
      message: 'Application status updated successfully'
    });

  } catch (error) {
    console.error('Update application status exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * BLOCKS HANDLERS
 */

/**
 * Get block types
 */
async function handleGetBlockTypes(req, res) {
  try {
    const blocks = Object.entries(BLOCK_TYPES).map(([type, info]) => ({
      type,
      name: info.name,
      category: info.category,
      description: getBlockDescription(type)
    }));

    return res.status(200).json({
      success: true,
      blocks,
      totalTypes: blocks.length
    });

  } catch (error) {
    console.error('Get block types exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get block description
 */
function getBlockDescription(type) {
  const descriptions = {
    'welcome-screen': 'Welcome participants and provide study introduction',
    'open-question': 'Collect qualitative feedback with open-ended questions',
    'opinion-scale': 'Gather quantitative ratings using various scale types',
    'simple-input': 'Collect structured data like text, numbers, dates',
    'multiple-choice': 'Present options for single or multiple selection',
    'context-screen': 'Provide instructions or transitional information',
    'yes-no': 'Binary choice questions with visual indicators',
    '5-second-test': 'Test first impressions and memory recall',
    'card-sort': 'Organize information into categories',
    'tree-test': 'Evaluate navigation and information findability',
    'thank-you': 'Thank participants and conclude the study',
    'image-upload': 'Allow participants to upload images',
    'file-upload': 'Allow participants to upload documents or files'
  };

  return descriptions[type] || 'Block for collecting participant data';
}

/**
 * STUDY SESSIONS HANDLERS
 */

/**
 * Start study session
 */
async function handleStartSession(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['participant']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { study_id } = req.body;

    if (!study_id) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    // Check if user has approved application
    const { data: application, error: appError } = await supabaseAdmin
      .from('study_applications')
      .select('id, status')
      .eq('user_id', auth.user.id)
      .eq('study_id', study_id)
      .eq('status', 'approved')
      .single();

    if (appError || !application) {
      return res.status(403).json({
        success: false,
        error: 'No approved application found for this study'
      });
    }

    // Get study blocks
    const { data: study, error: studyError } = await supabaseAdmin
      .from('studies')
      .select('blocks, title')
      .eq('id', study_id)
      .single();

    if (studyError || !study) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    const sessionData = {
      user_id: auth.user.id,
      study_id: study_id,
      application_id: application.id,
      started_at: new Date().toISOString(),
      current_block: 0,
      blocks_data: study.blocks || [],
      responses: {}
    };

    const { data: session, error } = await supabaseAdmin
      .from('study_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Start session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to start study session'
      });
    }

    return res.status(201).json({
      success: true,
      session,
      study: {
        title: study.title,
        totalBlocks: study.blocks?.length || 0
      },
      message: 'Study session started successfully'
    });

  } catch (error) {
    console.error('Start session exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Submit block response
 */
async function handleSubmitResponse(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['participant']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { session_id, block_index, response_data } = req.body;

    if (!session_id || block_index === undefined || !response_data) {
      return res.status(400).json({
        success: false,
        error: 'Session ID, block index, and response data are required'
      });
    }

    // Get session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('study_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', auth.user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Update responses
    const updatedResponses = {
      ...session.responses,
      [block_index]: {
        data: response_data,
        submitted_at: new Date().toISOString()
      }
    };

    const updateData = {
      responses: updatedResponses,
      current_block: Math.max(block_index + 1, session.current_block),
      updated_at: new Date().toISOString()
    };

    // Check if this is the last block
    const totalBlocks = session.blocks_data?.length || 0;
    if (block_index >= totalBlocks - 1) {
      updateData.completed_at = new Date().toISOString();
      updateData.status = 'completed';
    }

    const { data: updatedSession, error } = await supabaseAdmin
      .from('study_sessions')
      .update(updateData)
      .eq('id', session_id)
      .select()
      .single();

    if (error) {
      console.error('Submit response error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit response'
      });
    }

    return res.status(200).json({
      success: true,
      session: updatedSession,
      nextBlock: updateData.current_block,
      isCompleted: !!updateData.completed_at,
      message: 'Response submitted successfully'
    });

  } catch (error) {
    console.error('Submit response exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Main handler - routes to appropriate sub-handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    console.log(`=== RESEARCH ACTION: ${action} ===`);

    switch (action) {
      // Studies
      case 'get-studies':
      case 'studies':
        return await handleGetStudies(req, res);
      
      case 'create-study':
        return await handleCreateStudy(req, res);
      
      case 'update-study':
        return await handleUpdateStudy(req, res);
      
      case 'delete-study':
        return await handleDeleteStudy(req, res);
      
      case 'launch-study':
        return await handleLaunchStudy(req, res);
      
      // Applications
      case 'get-applications':
      case 'applications':
        return await handleGetApplications(req, res);
      
      case 'apply':
        return await handleApplyToStudy(req, res);
      
      case 'update-application':
        return await handleUpdateApplicationStatus(req, res);
      
      // Blocks
      case 'get-blocks':
      case 'blocks':
      case 'block-types':
        return await handleGetBlockTypes(req, res);
      
      // Sessions
      case 'start-session':
        return await handleStartSession(req, res);
      
      case 'submit-response':
        return await handleSubmitResponse(req, res);
      
      default:
        // Default based on method
        if (req.method === 'GET') {
          return await handleGetStudies(req, res);
        }

        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          availableActions: [
            'studies', 'create-study', 'update-study', 'delete-study', 'launch-study',
            'applications', 'apply', 'update-application',
            'blocks', 'block-types',
            'start-session', 'submit-response'
          ]
        });
    }
  } catch (error) {
    console.error('Research handler exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
