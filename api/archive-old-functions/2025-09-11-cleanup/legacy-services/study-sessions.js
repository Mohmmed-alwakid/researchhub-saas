import { createClient } from '@supabase/supabase-js';


// Study Sessions API - Participant completion workflow
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

// Initialize Supabase only if credentials are available
if (supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('📊 Study Sessions API: Supabase initialized');
  } catch (error) {
    console.log('📊 Study Sessions API: Supabase initialization failed, using memory storage');
    supabase = null;
  }
} else {
  console.log('📊 Study Sessions API: No Supabase credentials, using memory storage');
}

// In-memory fallback for development (when Supabase is unavailable)
let memoryStore = {
  sessions: new Map(),
  results: new Map(),
  nextId: 1
};

export default async function handler(req, res) {
  console.log('📊 Study Sessions API called:', req.method, req.url);
  console.log('📊 Query params:', req.query);
  console.log('📊 Body:', req.body);
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, body } = req;
    const url = new URL(req.url, `http://localhost:3003`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const query = Object.fromEntries(url.searchParams);
    
    console.log('📊 URL parts:', pathParts);
    console.log('📊 Query params:', query);
    
    // Determine action from URL path or query parameter
    let action = query.action || 'list';
    let sessionId = query.sessionId || query.id;
    
    // Parse REST-style URLs: /api/study-sessions/start, /api/study-sessions/123/progress, etc.
    if (pathParts.length > 2) {
      const apiAction = pathParts[2]; // after 'api' and 'study-sessions'
      if (apiAction === 'start' || apiAction === 'progress' || apiAction === 'complete') {
        action = apiAction;
      } else if (pathParts[3]) {
        // /api/study-sessions/123/results
        sessionId = apiAction;
        action = pathParts[3] || 'get';
      } else {
        // /api/study-sessions/123
        sessionId = apiAction;
        action = 'get';
      }
    }
    
    // Fallback: if action is still undefined, use default
    if (!action || action === 'undefined') {
      action = 'list';
    }
    
    console.log('📊 Final action:', action, 'sessionId:', sessionId);
    console.log('📊 Action type:', typeof action, 'Action value debug:', JSON.stringify(action));

    // Get user from auth token
    const authHeader = req.headers.authorization;
    let user = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        if (supabase) {
          const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
          if (!error && authUser) {
            user = authUser;
          }
        }
      } catch (error) {
        console.log('Auth error:', error.message);
      }
      
      // Fallback to mock user for development
      if (!user && token === 'mock-participant-token') {
        user = { 
          id: 'mock-participant-001', 
          email: 'participant@test.com',
          user_metadata: { role: 'participant' }
        };
      }
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    switch (method) {
      case 'POST':
        console.log('📊 POST case - comparing action:', JSON.stringify(action), 'with "start"');
        console.log('📊 Strict equality test:', action === 'start');
        console.log('📊 Loose equality test:', action == 'start');
        console.log('📊 String comparison:', String(action) === 'start');
        
        if (action === 'start') {
          console.log('📊 Matched start action, calling startSession');
          return await startSession(req, res, user, body);
        } else if (action === 'complete') {
          console.log('📊 Matched complete action, calling completeSession');
          return await completeSession(req, res, user, sessionId, body);
        } else {
          console.log('📊 No action match, returning error');
          return res.status(400).json({ 
            success: false, 
            error: `Unknown action: ${action}. Valid POST actions are: start, complete` 
          });
        }

      case 'PUT':
        return await saveProgress(req, res, user, sessionId, body);

      case 'GET':
        if (action === 'results') {
          return await getResults(req, res, user, sessionId);
        } else if (sessionId) {
          return await getSession(req, res, user, sessionId);
        } else {
          return await listSessions(req, res, user);
        }

      case 'DELETE':
        return await deleteSession(req, res, user, sessionId);

      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }

  } catch (error) {
    console.error('Study Sessions API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Start a new study session
async function startSession(req, res, user, body) {
  const { studyId, study_id, startTime = new Date().toISOString() } = body;
  
  // Support both parameter names for flexibility
  const actualStudyId = studyId || study_id;

  if (!actualStudyId) {
    return res.status(400).json({
      success: false,
      error: 'Study ID is required (use studyId or study_id parameter)'
    });
  }

  const sessionData = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    study_id: actualStudyId,
    participant_id: user.id,
    participant_email: user.email,
    status: 'in_progress',
    started_at: startTime,
    current_block: 0,
    progress: {},
    responses: [],
    metadata: {
      user_agent: req.headers['user-agent'],
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      created_at: new Date().toISOString()
    }
  };

  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data: data,
      message: 'Study session started successfully'
    });

  } catch (error) {
    // Fallback to memory store
    console.log('📄 Using fallback storage for session creation');
    memoryStore.sessions.set(sessionData.id, sessionData);
    
    return res.status(201).json({
      success: true,
      data: sessionData,
      message: 'Study session started successfully (local storage)'
    });
  }
}

// Save progress during session
async function saveProgress(req, res, user, sessionId, body) {
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required'
    });
  }

  const { currentBlock, progress, responses, timeSpent } = body;
  const updateData = {
    current_block: currentBlock,
    progress: progress || {},
    responses: responses || [],
    time_spent: timeSpent,
    updated_at: new Date().toISOString()
  };

  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('study_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('participant_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data,
      message: 'Progress saved successfully'
    });

  } catch (error) {
    // Fallback to memory store
    console.log('📄 Using fallback storage for progress save');
    const session = memoryStore.sessions.get(sessionId);
    
    if (!session || session.participant_id !== user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    Object.assign(session, updateData);
    memoryStore.sessions.set(sessionId, session);

    return res.status(200).json({
      success: true,
      data: session,
      message: 'Progress saved successfully (local storage)'
    });
  }
}

// Complete study session
async function completeSession(req, res, user, sessionId, body) {
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required'
    });
  }

  const { finalResponses, completionTime, feedback } = body;
  const completionData = {
    status: 'completed',
    completed_at: completionTime || new Date().toISOString(),
    responses: finalResponses || [],
    feedback: feedback || null,
    updated_at: new Date().toISOString()
  };

  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('study_sessions')
      .update(completionData)
      .eq('id', sessionId)
      .eq('participant_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Create results summary
    const results = await generateResults(data);
    
    // Store results
    await supabase
      .from('study_results')
      .insert({
        session_id: sessionId,
        study_id: data.study_id,
        participant_id: user.id,
        results: results,
        created_at: new Date().toISOString()
      });

    return res.status(200).json({
      success: true,
      data: data,
      results: results,
      message: 'Study completed successfully'
    });

  } catch (error) {
    // Fallback to memory store
    console.log('📄 Using fallback storage for session completion');
    const session = memoryStore.sessions.get(sessionId);
    
    if (!session || session.participant_id !== user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    Object.assign(session, completionData);
    memoryStore.sessions.set(sessionId, session);

    // Generate and store results
    const results = await generateResults(session);
    memoryStore.results.set(sessionId, results);

    return res.status(200).json({
      success: true,
      data: session,
      results: results,
      message: 'Study completed successfully (local storage)'
    });
  }
}

// Get session details
async function getSession(req, res, user, sessionId) {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('participant_id', user.id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    // Fallback to memory store
    const session = memoryStore.sessions.get(sessionId);
    
    if (!session || session.participant_id !== user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: session
    });
  }
}

// List user's sessions
async function listSessions(req, res, user) {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('participant_id', user.id)
      .order('started_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error) {
    // Fallback to memory store
    const userSessions = Array.from(memoryStore.sessions.values())
      .filter(session => session.participant_id === user.id)
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

    return res.status(200).json({
      success: true,
      data: userSessions
    });
  }
}

// Get session results
async function getResults(req, res, user, sessionId) {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('study_results')
      .select('*')
      .eq('session_id', sessionId)
      .eq('participant_id', user.id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    // Fallback to memory store
    const results = memoryStore.results.get(sessionId);
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'Results not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { session_id: sessionId, results: results }
    });
  }
}

// Delete session (for cleanup)
async function deleteSession(req, res, user, sessionId) {
  try {
    // Try Supabase first
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('participant_id', user.id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    // Fallback to memory store
    const session = memoryStore.sessions.get(sessionId);
    
    if (!session || session.participant_id !== user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    memoryStore.sessions.delete(sessionId);
    memoryStore.results.delete(sessionId);

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully (local storage)'
    });
  }
}

// Generate results summary from session data
async function generateResults(session) {
  const results = {
    session_id: session.id,
    study_id: session.study_id,
    participant_id: session.participant_id,
    completion_time: session.completed_at,
    duration: calculateDuration(session.started_at, session.completed_at),
    total_responses: session.responses?.length || 0,
    block_analytics: analyzeBlockResponses(session.responses || []),
    completion_rate: 100, // Since they completed it
    metadata: {
      generated_at: new Date().toISOString(),
      version: '1.0'
    }
  };

  return results;
}

// Helper functions
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / 1000); // Duration in seconds
}

function analyzeBlockResponses(responses) {
  const analytics = {};
  
  responses.forEach((response, index) => {
    analytics[`block_${index}`] = {
      block_type: response.blockType || 'unknown',
      response_time: response.timeSpent || 0,
      response_length: response.value ? response.value.toString().length : 0,
      completed: !!response.value
    };
  });

  return analytics;
}
