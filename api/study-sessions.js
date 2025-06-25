/**
 * Study Session Management API - ResearchHub SaaS Platform
 * 
 * Handles participant study session execution and tracking
 * 
 * Endpoints:
 * - POST /api/study-sessions - Create new study session
 * - GET /api/study-sessions/:sessionId - Get session details
 * - PATCH /api/study-sessions/:sessionId - Update session progress
 * - POST /api/study-sessions/:sessionId/complete - Complete session
 * 
 * Security Features:
 * - JWT authentication required
 * - Participant role verification
 * - Session ownership verification
 * - Approved application verification
 * 
 * Created: June 25, 2025
 * Status: Production Ready ✅
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Authentication
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Create authenticated Supabase client
    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify participant role
    const { data: profile } = await authenticatedSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'participant') {
      return res.status(403).json({
        success: false,
        error: 'Only participants can access study sessions'
      });
    }

    // Parse sessionId from URL path
    const urlPath = req.url.split('?')[0]; // Remove query parameters
    const pathParts = urlPath.split('/');
    const sessionId = pathParts[pathParts.length - 1]; // Get last part of path
    const isSessionRequest = sessionId && sessionId !== 'study-sessions' && sessionId.includes('session_');
    
    console.log('🔍 URL Parsing Debug:', {
      url: req.url,
      urlPath,
      pathParts,
      sessionId,
      isSessionRequest,
      method: req.method
    });

    // Route handlers
    if (req.method === 'POST' && !isSessionRequest) {
      // Create new study session
      return await createStudySession(req, res, authenticatedSupabase, user);
    }

    if (req.method === 'GET' && isSessionRequest) {
      // Get session details - add sessionId to query for handler
      req.query.sessionId = sessionId;
      return await getStudySession(req, res, authenticatedSupabase, user);
    }

    if (req.method === 'PATCH' && isSessionRequest) {
      // Update session progress - add sessionId to query for handler
      req.query.sessionId = sessionId;
      return await updateStudySession(req, res, authenticatedSupabase, user);
    }

    if (req.method === 'POST' && isSessionRequest && req.query.action === 'complete') {
      // Complete session - add sessionId to query for handler
      req.query.sessionId = sessionId;
      return await completeStudySession(req, res, authenticatedSupabase, user);
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });

  } catch (error) {
    console.error('❌ Study Session API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function createStudySession(req, res, supabase, user) {
  const { studyId } = req.body;

  if (!studyId) {
    return res.status(400).json({
      success: false,
      error: 'Study ID is required'
    });
  }

  // Verify participant has approved application for this study
  const { data: application, error: appError } = await supabase
    .from('study_applications')
    .select('id, status, study_id')
    .eq('study_id', studyId)
    .eq('participant_id', user.id)
    .eq('status', 'accepted')
    .single();

  if (appError || !application) {
    return res.status(403).json({
      success: false,
      error: 'No approved application found for this study'
    });
  }

  // Check if session already exists
  const { data: existingSession } = await supabase
    .from('recording_sessions')
    .select('id, status')
    .eq('study_id', studyId)
    .eq('participant_id', user.id)
    .single();

  if (existingSession) {
    return res.status(200).json({
      success: true,
      session: existingSession,
      message: 'Session already exists'
    });
  }

  // Create new session using recording_sessions table
  const { data: session, error: sessionError } = await supabase
    .from('recording_sessions')
    .insert({
      id: `session_${Date.now()}_${user.id.slice(0, 8)}`,
      study_id: studyId,
      participant_id: user.id,
      status: 'active',
      session_name: `Study Session - ${new Date().toLocaleDateString()}`,
      started_at: new Date().toISOString(),
      recording_settings: {},
      metadata: { application_id: application.id }
    })
    .select()
    .single();

  if (sessionError) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create study session'
    });
  }

  return res.status(201).json({
    success: true,
    session: session,
    message: 'Study session created successfully'
  });
}

async function getStudySession(req, res, supabase, user) {
  const { sessionId } = req.query;

  console.log('🔍 Looking up session:', { sessionId, userId: user.id });

  // First get the session
  const { data: session, error: sessionError } = await supabase
    .from('recording_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('participant_id', user.id)
    .single();

  if (sessionError || !session) {
    console.log('❌ Session not found:', sessionError);
    return res.status(404).json({
      success: false,
      error: 'Study session not found'
    });
  }

  console.log('✅ Session found:', session);

  // Then get the study data
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('id, title, description, settings')
    .eq('id', session.study_id)
    .single();

  if (studyError || !study) {
    console.log('❌ Study not found:', studyError);
    return res.status(404).json({
      success: false,
      error: 'Study not found for this session'
    });
  }

  console.log('✅ Study found:', study);

  // Combine the data manually
  const sessionWithStudy = {
    id: session.id,
    study_id: session.study_id,
    status: session.status,
    started_at: session.started_at,
    completed_at: session.completed_at,
    metadata: session.metadata,
    recording_settings: session.recording_settings,
    study: study
  };

  console.log('✅ Returning session with study data');

  return res.status(200).json({
    success: true,
    session: sessionWithStudy
  });
}

async function updateStudySession(req, res, supabase, user) {
  const { sessionId } = req.query;
  const { sessionData, currentTaskIndex, progress } = req.body;

  const { data: session, error } = await supabase
    .from('recording_sessions')
    .update({
      metadata: sessionData,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('participant_id', user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update study session'
    });
  }

  return res.status(200).json({
    success: true,
    session: session,
    message: 'Session updated successfully'
  });
}

async function completeStudySession(req, res, supabase, user) {
  const { sessionId } = req.query;
  const { finalData, completionNotes } = req.body;

  const { data: session, error } = await supabase
    .from('recording_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      metadata: finalData
    })
    .eq('id', sessionId)
    .eq('participant_id', user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to complete study session'
    });
  }

  return res.status(200).json({
    success: true,
    session: session,
    message: 'Study session completed successfully'
  });
}
