// User Interactions API endpoint using Supabase (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (req.method === 'POST') {
      const { action } = req.query;

      if (action === 'upload' || !action) {
        return await handleInteractionsUpload(req, res, supabase);
      } else if (action === 'process') {
        return await processInteractionsForAnalytics(req, res, supabase);
      }
    }

    if (req.method === 'GET') {
      const { sessionId, studyId, type } = req.query;
      
      if (sessionId) {
        return await getInteractionsBySession(req, res, supabase, sessionId);
      } else if (studyId) {
        return await getInteractionsByStudy(req, res, supabase, studyId);
      } else {
        return await getAllInteractions(req, res, supabase);
      }
    }

    if (req.method === 'DELETE') {
      return await deleteInteractions(req, res, supabase);
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Interactions API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Handle user interactions upload
async function handleInteractionsUpload(req, res, supabase) {
  try {
    const { sessionId, interactions, isFinal, uploadedAt } = req.body;

    if (!sessionId || !interactions || !Array.isArray(interactions)) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and interactions array are required'
      });
    }

    console.log(`📥 Processing ${interactions.length} interactions for session: ${sessionId}`);

    // Prepare interactions for batch insert
    const interactionsForDB = interactions.map(interaction => ({
      id: interaction.id,
      session_id: sessionId,
      interaction_type: interaction.type,
      timestamp: interaction.timestamp,
      data: JSON.stringify(interaction.data),
      url: interaction.url,
      user_agent: interaction.userAgent,
      recorded_at: interaction.recordedAt,
      uploaded_at: uploadedAt || new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    // Batch insert interactions
    const { data: insertedInteractions, error } = await supabase
      .from('user_interactions')
      .insert(interactionsForDB)
      .select();

    if (error) {
      console.error('Error saving interactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save interactions',
        details: error.message
      });
    }

    // If this is the final upload, trigger analytics processing
    if (isFinal) {
      try {
        await triggerAnalyticsProcessing(sessionId, supabase);
      } catch (analyticsError) {
        console.warn('Analytics processing failed:', analyticsError.message);
        // Don't fail the request if analytics processing fails
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        interactionsCount: insertedInteractions.length,
        isFinal: isFinal,
        message: 'Interactions uploaded successfully'
      }
    });

  } catch (error) {
    console.error('Interactions upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload interactions',
      details: error.message
    });
  }
}

// Trigger analytics processing for a session
async function triggerAnalyticsProcessing(sessionId, supabase) {
  console.log(`🔄 Processing analytics for session: ${sessionId}`);

  try {
    // Get all interactions for the session
    const { data: interactions, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp');

    if (error) {
      throw new Error(`Failed to fetch interactions: ${error.message}`);
    }

    // Generate heatmap data
    const heatmapData = generateHeatmapData(interactions);
    
    // Generate click path data
    const clickPath = generateClickPath(interactions);
    
    // Generate scroll data
    const scrollData = generateScrollData(interactions);
    
    // Calculate session metrics
    const metrics = calculateSessionMetrics(interactions);

    // Save processed analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('session_analytics')
      .insert({
        session_id: sessionId,
        heatmap_data: JSON.stringify(heatmapData),
        click_path: JSON.stringify(clickPath),
        scroll_data: JSON.stringify(scrollData),
        metrics: JSON.stringify(metrics),
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (analyticsError) {
      throw new Error(`Failed to save analytics: ${analyticsError.message}`);
    }

    console.log('✅ Analytics processing completed');
    return analytics;

  } catch (error) {
    console.error('❌ Analytics processing failed:', error);
    throw error;
  }
}

// Generate heatmap data from interactions
function generateHeatmapData(interactions) {
  const heatmapPoints = [];
  const viewports = new Set();

  interactions.forEach(interaction => {
    if (interaction.interaction_type === 'mouse_move' || interaction.interaction_type === 'click') {
      const data = JSON.parse(interaction.data);
      
      if (data.x !== undefined && data.y !== undefined) {
        heatmapPoints.push({
          x: data.x,
          y: data.y,
          timestamp: interaction.timestamp,
          type: interaction.interaction_type,
          intensity: interaction.interaction_type === 'click' ? 3 : 1
        });

        if (data.viewport) {
          viewports.add(`${data.viewport.width}x${data.viewport.height}`);
        }
      }
    }
  });

  return {
    points: heatmapPoints,
    totalPoints: heatmapPoints.length,
    viewports: Array.from(viewports),
    generatedAt: new Date().toISOString()
  };
}

// Generate click path from interactions
function generateClickPath(interactions) {
  const clickEvents = interactions
    .filter(interaction => interaction.interaction_type === 'click')
    .map(interaction => {
      const data = JSON.parse(interaction.data);
      return {
        x: data.x,
        y: data.y,
        timestamp: interaction.timestamp,
        target: data.target,
        button: data.button
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  return {
    clicks: clickEvents,
    totalClicks: clickEvents.length,
    firstClick: clickEvents[0] || null,
    lastClick: clickEvents[clickEvents.length - 1] || null
  };
}

// Generate scroll data from interactions
function generateScrollData(interactions) {
  const scrollEvents = interactions
    .filter(interaction => interaction.interaction_type === 'scroll')
    .map(interaction => {
      const data = JSON.parse(interaction.data);
      return {
        x: data.scrollX,
        y: data.scrollY,
        timestamp: interaction.timestamp
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  const maxScrollY = Math.max(...scrollEvents.map(e => e.y), 0);
  const maxScrollX = Math.max(...scrollEvents.map(e => e.x), 0);

  return {
    scrollEvents: scrollEvents,
    totalScrollEvents: scrollEvents.length,
    maxScrollY: maxScrollY,
    maxScrollX: maxScrollX,
    scrollDepth: maxScrollY > 0 ? (maxScrollY / document.documentElement.scrollHeight) : 0
  };
}

// Calculate session metrics
function calculateSessionMetrics(interactions) {
  const startTime = Math.min(...interactions.map(i => i.timestamp));
  const endTime = Math.max(...interactions.map(i => i.timestamp));
  const duration = endTime - startTime;

  const interactionCounts = interactions.reduce((counts, interaction) => {
    counts[interaction.interaction_type] = (counts[interaction.interaction_type] || 0) + 1;
    return counts;
  }, {});

  return {
    duration: duration,
    totalInteractions: interactions.length,
    interactionCounts: interactionCounts,
    interactionsPerSecond: duration > 0 ? interactions.length / (duration / 1000) : 0,
    startTime: startTime,
    endTime: endTime
  };
}

// Get interactions by session
async function getInteractionsBySession(req, res, supabase, sessionId) {
  try {
    const { data: interactions, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp');

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve interactions',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: interactions || [],
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Get interactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve interactions',
      details: error.message
    });
  }
}

// Get interactions by study
async function getInteractionsByStudy(req, res, supabase, studyId) {
  try {
    // Get all sessions for the study first
    const { data: sessions, error: sessionsError } = await supabase
      .from('recording_sessions')
      .select('id')
      .eq('study_id', studyId);

    if (sessionsError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve study sessions',
        details: sessionsError.message
      });
    }

    const sessionIds = sessions.map(session => session.id);

    if (sessionIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        studyId: studyId
      });
    }

    // Get interactions for all sessions
    const { data: interactions, error } = await supabase
      .from('user_interactions')
      .select('*')
      .in('session_id', sessionIds)
      .order('timestamp');

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve interactions',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: interactions || [],
      studyId: studyId,
      sessionCount: sessionIds.length
    });

  } catch (error) {
    console.error('Get study interactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve study interactions',
      details: error.message
    });
  }
}

// Get all interactions (admin only)
async function getAllInteractions(req, res, supabase) {
  try {
    const { data: interactions, error } = await supabase
      .from('user_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000); // Limit for performance

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve interactions',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: interactions || [],
      total: interactions?.length || 0
    });

  } catch (error) {
    console.error('Get all interactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve interactions',
      details: error.message
    });
  }
}

// Delete interactions
async function deleteInteractions(req, res, supabase) {
  try {
    const { sessionId, interactionIds } = req.body;

    let query = supabase.from('user_interactions').delete();

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else if (interactionIds && Array.isArray(interactionIds)) {
      query = query.in('id', interactionIds);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Session ID or interaction IDs required'
      });
    }

    const { error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete interactions',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interactions deleted successfully'
    });

  } catch (error) {
    console.error('Delete interactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete interactions',
      details: error.message
    });
  }
}
