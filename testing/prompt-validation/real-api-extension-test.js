// Real ResearchHub API test - Research Consolidated Extension
// This should trigger api-development.md prompt and enforce ResearchHub API patterns
// Test: Adding new functionality to existing research-consolidated.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test 1: API handler structure - should follow ResearchHub action-based pattern
// Expected: Copilot should suggest action-based routing, NOT new function creation
export default async function researchHandler(req, res) {
  try {
    const { action } = req.query;
    
    // Copilot should suggest extending existing actions, not creating new functions
    switch (action) {
      case 'get-studies':
        return await getStudies(req, res);
        
      case 'create-study':
        return await createStudy(req, res);
        
      case 'get-study-analytics':
        // New action - should suggest proper implementation
        return await getStudyAnalytics(req, res);
        
      case 'duplicate-study':
        // New action - should follow ResearchHub patterns
        return await duplicateStudy(req, res);
        
      default:
        return res.status(400).json({
          success: false,
          error: `Invalid action: ${action}`
        });
    }
  } catch (error) {
    console.error('Research API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Test 2: Authentication middleware - should suggest ResearchHub auth pattern
// Expected: Copilot should understand role-based access and auth patterns
async function getStudyAnalytics(req, res) {
  // Should suggest authenticateUser with proper roles
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  
  if (!auth.success) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error
    });
  }
  
  const { studyId } = req.query;
  
  try {
    // Should suggest proper Supabase query with RLS awareness
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .eq('researcher_id', auth.user.id) // RLS enforcement
      .single();
      
    if (studyError) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }
    
    // Should suggest analytics query patterns
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        *,
        participants (*)
      `)
      .eq('study_id', studyId);
      
    // Should suggest proper error handling
    if (appsError) {
      throw new Error(`Applications query failed: ${appsError.message}`);
    }
    
    // Should suggest analytics calculation logic
    const analytics = {
      totalApplications: applications.length,
      completedApplications: applications.filter(app => app.status === 'completed').length,
      averageCompletionTime: calculateAverageCompletionTime(applications),
      participantDemographics: analyzeParticipantDemographics(applications)
    };
    
    return res.status(200).json({
      success: true,
      data: {
        study,
        analytics
      }
    });
    
  } catch (error) {
    console.error('Study analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch study analytics'
    });
  }
}

// Test 3: Study duplication - should enforce ResearchHub constraints
// Expected: Should suggest proper transaction handling and block duplication
async function duplicateStudy(req, res) {
  const auth = await authenticateUser(req, ['researcher']);
  
  if (!auth.success) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error
    });
  }
  
  const { studyId } = req.query;
  const { title } = req.body;
  
  try {
    // Should suggest proper study retrieval with ownership check
    const { data: originalStudy, error: studyError } = await supabase
      .from('studies')
      .select(`
        *,
        study_blocks (*)
      `)
      .eq('id', studyId)
      .eq('researcher_id', auth.user.id)
      .single();
      
    if (studyError) {
      return res.status(404).json({
        success: false,
        error: 'Study not found or access denied'
      });
    }
    
    // Should suggest proper duplication logic
    const duplicatedStudy = {
      ...originalStudy,
      id: undefined, // Remove ID for new record
      title: title || `${originalStudy.title} (Copy)`,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Should suggest transaction pattern
    const { data: newStudy, error: createError } = await supabase
      .from('studies')
      .insert(duplicatedStudy)
      .select()
      .single();
      
    if (createError) {
      throw new Error(`Study duplication failed: ${createError.message}`);
    }
    
    // Should suggest block duplication with new study ID
    if (originalStudy.study_blocks && originalStudy.study_blocks.length > 0) {
      const duplicatedBlocks = originalStudy.study_blocks.map(block => ({
        ...block,
        id: undefined, // Remove ID for new record
        study_id: newStudy.id,
        created_at: new Date().toISOString()
      }));
      
      const { error: blocksError } = await supabase
        .from('study_blocks')
        .insert(duplicatedBlocks);
        
      if (blocksError) {
        // Should suggest rollback on failure
        await supabase.from('studies').delete().eq('id', newStudy.id);
        throw new Error(`Block duplication failed: ${blocksError.message}`);
      }
    }
    
    return res.status(200).json({
      success: true,
      data: newStudy
    });
    
  } catch (error) {
    console.error('Study duplication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to duplicate study'
    });
  }
}

// Test 4: Helper functions - should suggest ResearchHub utility patterns
// Expected: Should understand analytics calculation patterns
function calculateAverageCompletionTime(applications) {
  const completedApps = applications.filter(app => 
    app.status === 'completed' && app.started_at && app.completed_at
  );
  
  if (completedApps.length === 0) return 0;
  
  // Should suggest proper time calculation
  const totalTime = completedApps.reduce((sum, app) => {
    const startTime = new Date(app.started_at).getTime();
    const endTime = new Date(app.completed_at).getTime();
    return sum + (endTime - startTime);
  }, 0);
  
  return Math.round(totalTime / completedApps.length / 1000 / 60); // Minutes
}

// Test 5: Input validation - should suggest ResearchHub validation patterns
// Expected: Should understand study validation requirements
function validateStudyDuplicationInput(data) {
  const errors = [];
  
  // Should suggest comprehensive validation
  if (!data.studyId) {
    errors.push('Study ID is required');
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  // Should suggest more validation rules
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Test 6: Rate limiting - should suggest ResearchHub rate limiting
// Expected: Should implement rate limiting for expensive operations
async function checkDuplicationRateLimit(userId) {
  // Should suggest rate limiting implementation
  const key = `duplication-${userId}`;
  const limit = 5; // 5 duplications per hour
  const window = 60 * 60 * 1000; // 1 hour
  
  // Should suggest rate limiting logic using Map or Redis
  return { allowed: true }; // Simplified for test
}