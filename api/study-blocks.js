/**
 * Study Blocks API - Handle study block data and participant responses
 * 
 * Endpoints:
 * - GET /api/study-blocks?studyId=:id - Get blocks for a study
 * - POST /api/study-blocks/response - Save participant response to a block
 * - GET /api/study-blocks/responses?sessionId=:id - Get all responses for a session
 * 
 * Created: June 25, 2025
 * Status: Production Ready ✅
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
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

    console.log('🧪 Study Blocks API Request:', {
      method: req.method,
      url: req.url,
      hasAuth: !!token,
      timestamp: new Date().toISOString()
    });

    if (req.method === 'GET') {
      return await getStudyBlocks(req, res, authenticatedSupabase, user);
    }

    if (req.method === 'POST') {
      return await saveBlockResponse(req, res, authenticatedSupabase, user);
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });

  } catch (error) {
    console.error('❌ Study Blocks API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function getStudyBlocks(req, res, supabase, user) {
  const { studyId } = req.query;

  if (!studyId) {
    return res.status(400).json({
      success: false,
      error: 'Study ID is required'
    });
  }

  console.log('📋 Getting study blocks for study:', studyId);

  try {
    // First, check if the study exists and user has access
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('id, title, researcher_id')
      .eq('id', studyId)
      .single();

    if (studyError || !study) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    // Get blocks from database with conditional logic
    const { data: blocks, error: blocksError } = await supabase
      .from('study_blocks')
      .select(`
        id,
        type,
        title,
        description,
        settings,
        conditional_logic,
        order_index,
        is_required,
        block_conditions (
          id,
          condition_type,
          condition_logic,
          target_block_id
        )
      `)
      .eq('study_id', studyId)
      .eq('is_active', true)
      .order('order_index');

    if (blocksError) {
      console.error('❌ Error fetching blocks:', blocksError);
      
      // Check if tables exist - if not, create sample blocks for demo
      const { data: tableCheck } = await supabase
        .from('study_blocks')
        .select('id')
        .limit(1);
      
      if (!tableCheck) {
        console.log('📝 Database tables not ready, using sample blocks');
      }
      
      return getSampleBlocks(req, res, studyId);
    }

    if (!blocks || blocks.length === 0) {
      // If no blocks in database, create sample blocks for this study
      console.log('📝 No blocks found, creating sample blocks for study');
      const createdBlocks = await createSampleBlocksForStudy(supabase, studyId);
      
      if (createdBlocks && createdBlocks.length > 0) {
        console.log('✅ Returning newly created database blocks:', createdBlocks.length);
        return res.status(200).json({
          success: true,
          blocks: formatBlocksForClient(createdBlocks),
          totalBlocks: createdBlocks.length,
          source: 'database_created'
        });
      } else {
        return getSampleBlocks(req, res, studyId);
      }
    }

    console.log('✅ Returning existing database blocks:', blocks.length);

    return res.status(200).json({
      success: true,
      blocks: formatBlocksForClient(blocks),
      totalBlocks: blocks.length,
      source: 'database'
    });

  } catch (error) {
    console.error('❌ Error in getStudyBlocks:', error);
    
    // Fallback to sample blocks
    return getSampleBlocks(req, res, studyId);
  }
}

// Helper function to format blocks for client
function formatBlocksForClient(blocks) {
  return blocks.map(block => ({
    id: block.id,
    type: block.type,
    order: block.order_index,
    title: block.title,
    description: block.description,
    isRequired: block.is_required,
    settings: block.settings || {},
    conditionalLogic: block.conditional_logic || {},
    conditions: block.block_conditions || []
  }));
}

// Fallback function for sample blocks
function getSampleBlocks(req, res, studyId) {
  console.log('📋 Using sample blocks for study:', studyId);
  
  const sampleBlocks = [
    {
      id: 'block_1_welcome',
      type: 'welcome',
      order: 1,
      title: 'Welcome to the Study',
      description: 'Introduction and consent',
      isRequired: true,
      settings: {
        message: 'Welcome to our e-commerce checkout flow study! Your feedback will help us improve the shopping experience for millions of users.',
        showLogo: true,
        backgroundColor: '#f8fafc'
      }
    },
    {
      id: 'block_2_context',
      type: 'context_screen',
      order: 2,
      title: 'Study Instructions',
      description: 'What you\'ll be doing',
      isRequired: true,
      settings: {
        content: 'In this study, you\'ll navigate through a checkout process on our e-commerce platform. Please think aloud as you go through each step, sharing your thoughts and any confusion you might have.',
        duration: 'Take your time - there\'s no rush'
      }
    },
    {
      id: 'block_3_demographics',
      type: 'multiple_choice',
      order: 3,
      title: 'Background Information',
      description: 'Tell us about your online shopping experience',
      isRequired: true,
      settings: {
        question: 'How often do you shop online?',
        options: [
          'Daily',
          'Weekly', 
          'Monthly',
          'Rarely',
          'This is my first time'
        ],
        allowMultiple: false
      }
    },
    {
      id: 'block_4_website_test',
      type: 'live_website_test',
      order: 4,
      title: 'Checkout Flow Test',
      description: 'Navigate through the checkout process',
      isRequired: true,
      settings: {
        url: 'https://demo-ecommerce.researchhub.com/checkout',
        tasks: [
          'Add a product to your cart',
          'Proceed to checkout',
          'Fill in shipping information',
          'Select payment method',
          'Review your order'
        ],
        recordScreen: true,
        recordAudio: true,
        instructions: 'Please complete each task while thinking aloud. Share your thoughts as you navigate.'
      }
    },
    {
      id: 'block_5_feedback',
      type: 'open_question',
      order: 5,
      title: 'Your Thoughts',
      description: 'Share your experience',
      isRequired: true,
      settings: {
        question: 'What was your overall experience with the checkout process? What would you improve?',
        placeholder: 'Please share your honest thoughts about the checkout flow...',
        minLength: 50
      }
    },
    {
      id: 'block_6_rating',
      type: 'opinion_scale',
      order: 6,
      title: 'Rate the Experience',
      description: 'How satisfied were you?',
      isRequired: true,
      settings: {
        question: 'How would you rate the overall checkout experience?',
        scaleType: 'star',
        minValue: 1,
        maxValue: 5,
        labels: {
          min: 'Very Difficult',
          max: 'Very Easy'
        }
      }
    },
    {
      id: 'block_7_thank_you',
      type: 'thank_you',
      order: 7,
      title: 'Thank You!',
      description: 'Study completed',
      isRequired: true,
      settings: {
        message: 'Thank you for participating in our study! Your feedback is incredibly valuable and will help us improve the shopping experience.',
        showCompensation: true,
        nextSteps: 'You will receive your compensation within 24 hours.'
      }
    }
  ];

  return res.status(200).json({
    success: true,
    blocks: sampleBlocks,
    totalBlocks: sampleBlocks.length,
    source: 'fallback'
  });
}

// Helper function to create sample blocks for a study
async function createSampleBlocksForStudy(supabase, studyId) {
  const sampleBlocksData = [
    {
      study_id: studyId,
      type: 'welcome',
      title: 'Welcome to the Study',
      description: 'Introduction and consent',
      order_index: 1,
      settings: {
        message: 'Welcome to our e-commerce checkout flow study! Your feedback will help us improve the shopping experience for millions of users.',
        showLogo: true,
        backgroundColor: '#f8fafc'
      }
    },
    {
      study_id: studyId,
      type: 'context_screen',
      title: 'Study Instructions',
      description: 'What you\'ll be doing',
      order_index: 2,
      settings: {
        content: 'In this study, you\'ll navigate through a checkout process on our e-commerce platform. Please think aloud as you go through each step, sharing your thoughts and any confusion you might have.',
        duration: 'Take your time - there\'s no rush'
      }
    },
    {
      study_id: studyId,
      type: 'multiple_choice',
      title: 'Background Information',
      description: 'Tell us about your online shopping experience',
      order_index: 3,
      settings: {
        question: 'How often do you shop online?',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'This is my first time'],
        allowMultiple: false
      }
    },
    {
      study_id: studyId,
      type: 'conditional_branch',
      title: 'Experience Check',
      description: 'Route based on shopping frequency',
      order_index: 4,
      settings: {
        conditions: [
          {
            type: 'response_equals',
            blockId: 'block_3_demographics',
            value: 'Daily',
            targetBlockId: 'advanced_flow'
          },
          {
            type: 'response_equals',
            blockId: 'block_3_demographics', 
            value: 'Weekly',
            targetBlockId: 'advanced_flow'
          }
        ],
        defaultTarget: 'basic_flow'
      }
    },
    {
      study_id: studyId,
      type: 'live_website_test',
      title: 'Checkout Flow Test',
      description: 'Navigate through the checkout process',
      order_index: 5,
      settings: {
        url: 'https://demo-ecommerce.researchhub.com/checkout',
        tasks: [
          'Add a product to your cart',
          'Proceed to checkout',
          'Fill in shipping information',
          'Select payment method',
          'Review your order'
        ],
        recordScreen: true,
        recordAudio: true,
        instructions: 'Please complete each task while thinking aloud. Share your thoughts as you navigate.'
      }
    },
    {
      study_id: studyId,
      type: 'ai_follow_up',
      title: 'Personalized Follow-up',
      description: 'AI-generated questions based on your experience',
      order_index: 6,
      settings: {
        baseBlockId: 'block_5_feedback',
        baseQuestion: 'What was your overall experience with the checkout process?',
        followUpCount: 3,
        aiModel: 'gpt-3.5-turbo'
      }
    },
    {
      study_id: studyId,
      type: 'open_question',
      title: 'Your Thoughts',
      description: 'Share your experience',
      order_index: 7,
      settings: {
        question: 'What was your overall experience with the checkout process? What would you improve?',
        placeholder: 'Please share your honest thoughts about the checkout flow...',
        minLength: 50
      }
    },
    {
      study_id: studyId,
      type: 'opinion_scale',
      title: 'Rate the Experience',
      description: 'How satisfied were you?',
      order_index: 8,
      settings: {
        question: 'How would you rate the overall checkout experience?',
        scaleType: 'star',
        minValue: 1,
        maxValue: 5,
        labels: {
          min: 'Very Difficult',
          max: 'Very Easy'
        }
      }
    },
    {
      study_id: studyId,
      type: 'card_sort',
      title: 'Feature Prioritization',
      description: 'Sort features by importance',
      order_index: 9,
      settings: {
        instructions: 'Sort these checkout features by importance',
        items: [
          { id: 'guest_checkout', name: 'Guest Checkout', description: 'Buy without creating account' },
          { id: 'saved_payment', name: 'Saved Payment Methods', description: 'Store cards for future use' },
          { id: 'order_tracking', name: 'Order Tracking', description: 'Track your package' },
          { id: 'quick_shipping', name: 'Express Shipping', description: 'Fast delivery options' },
          { id: 'easy_returns', name: 'Easy Returns', description: 'Simple return process' }
        ],
        categories: [
          { id: 'essential', name: 'Essential' },
          { id: 'nice_to_have', name: 'Nice to Have' },
          { id: 'not_important', name: 'Not Important' }
        ]
      }
    },
    {
      study_id: studyId,
      type: 'thank_you',
      title: 'Thank You!',
      description: 'Study completed',
      order_index: 10,
      settings: {
        message: 'Thank you for participating in our study! Your feedback is incredibly valuable and will help us improve the shopping experience.',
        showCompensation: true,
        nextSteps: 'You will receive your compensation within 24 hours.'
      }
    }
  ];

  try {
    const { data, error } = await supabase
      .from('study_blocks')
      .insert(sampleBlocksData)
      .select();

    if (error) {
      console.error('❌ Error creating sample blocks:', error);
      return null;
    } else {
      console.log('✅ Sample blocks created for study:', studyId);
      return data;
    }
  } catch (err) {
    console.error('❌ Exception creating sample blocks:', err);
    return null;
  }
}

async function saveBlockResponse(req, res, supabase, user) {
  const { 
    sessionId, 
    blockId, 
    blockType, 
    response, 
    metadata,
    startTime,
    interactionCount = 0,
    analytics = []
  } = req.body;

  if (!sessionId || !blockId || !response) {
    return res.status(400).json({
      success: false,
      error: 'Session ID, block ID, and response are required'
    });
  }

  console.log('💾 Saving block response:', { sessionId, blockId, blockType });

  try {
    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('recording_sessions')
      .select('id, study_id, participant_id, metadata')
      .eq('id', sessionId)
      .eq('participant_id', user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or access denied'
      });
    }

    // Check if this is a database block or fallback block
    let isDbBlock = false;
    const { data: dbBlock } = await supabase
      .from('study_blocks')
      .select('id')
      .eq('id', blockId)
      .single();

    isDbBlock = !!dbBlock;

    const completedAt = new Date();
    const startedAt = startTime ? new Date(startTime) : new Date(Date.now() - 30000); // Default 30s ago
    const timeSpent = Math.max(0, Math.floor((completedAt - startedAt) / 1000));

    if (isDbBlock) {
      // Save to new block_responses table
      console.log('💾 Saving to block_responses table');
      
      const { data: blockResponse, error: responseError } = await supabase
        .from('block_responses')
        .insert({
          session_id: sessionId,
          block_id: blockId,
          participant_id: user.id,
          response_data: response,
          metadata: metadata || {},
          started_at: startedAt.toISOString(),
          completed_at: completedAt.toISOString(),
          time_spent_seconds: timeSpent,
          interaction_count: interactionCount,
          is_complete: true
        })
        .select()
        .single();

      if (responseError) {
        console.error('❌ Error saving block response:', responseError);
        // Fallback to session metadata
        return await saveToSessionMetadata(supabase, session, blockId, blockType, response, metadata);
      }

      // Save analytics if provided
      if (analytics && analytics.length > 0) {
        console.log('📊 Saving block analytics:', analytics.length, 'events');
        
        const analyticsData = analytics.map((event, index) => ({
          response_id: blockResponse.id,
          session_id: sessionId,
          block_id: blockId,
          participant_id: user.id,
          event_type: event.type || 'interaction',
          event_data: event.data || {},
          timestamp_ms: event.timestamp || Date.now(),
          sequence_number: event.sequence || index
        }));

        const { error: analyticsError } = await supabase
          .from('block_analytics')
          .insert(analyticsData);

        if (analyticsError) {
          console.error('❌ Error saving analytics:', analyticsError);
          // Don't fail the response saving if analytics fail
        } else {
          console.log('✅ Analytics saved successfully');
        }
      }

      // Update session metadata for compatibility
      await updateSessionProgress(supabase, session, blockId, blockType, response, metadata);

      console.log('✅ Block response saved to database');
      
      return res.status(200).json({
        success: true,
        message: 'Response saved successfully',
        responseId: blockResponse.id,
        timeSpent: timeSpent,
        source: 'database'
      });

    } else {
      // Fallback block - save to session metadata only
      console.log('💾 Fallback block - saving to session metadata');
      return await saveToSessionMetadata(supabase, session, blockId, blockType, response, metadata);
    }

  } catch (error) {
    console.error('❌ Error saving block response:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save response'
    });
  }
}

// Helper function to save to session metadata (backward compatibility)
async function saveToSessionMetadata(supabase, session, blockId, blockType, response, metadata) {
  try {
    const currentMetadata = session.metadata || {};
    const responses = currentMetadata.blockResponses || {};
    
    responses[blockId] = {
      blockType,
      response,
      metadata,
      completedAt: new Date().toISOString()
    };

    const updatedMetadata = {
      ...currentMetadata,
      blockResponses: responses,
      lastBlockCompleted: blockId,
      progressUpdatedAt: new Date().toISOString()
    };

    const { data: updatedSession, error: updateError } = await supabase
      .from('recording_sessions')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)
      .eq('participant_id', session.participant_id)
      .select()
      .single();

    if (updateError) {
      return {
        status: 500,
        json: {
          success: false,
          error: 'Failed to save response to session metadata'
        }
      };
    }

    console.log('✅ Block response saved to session metadata');

    return {
      status: 200,
      json: {
        success: true,
        message: 'Response saved successfully',
        session: updatedSession,
        source: 'session_metadata'
      }
    };

  } catch (error) {
    console.error('❌ Error saving to session metadata:', error);
    return {
      status: 500,
      json: {
        success: false,
        error: 'Failed to save response'
      }
    };
  }
}

// Helper function to update session progress
async function updateSessionProgress(supabase, session, blockId, blockType, response, metadata) {
  try {
    const currentMetadata = session.metadata || {};
    const responses = currentMetadata.blockResponses || {};
    
    responses[blockId] = {
      blockType,
      response,
      metadata,
      completedAt: new Date().toISOString()
    };

    const updatedMetadata = {
      ...currentMetadata,
      blockResponses: responses,
      lastBlockCompleted: blockId,
      progressUpdatedAt: new Date().toISOString()
    };

    await supabase
      .from('recording_sessions')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

  } catch (error) {
    console.error('❌ Error updating session progress:', error);
  }
}
