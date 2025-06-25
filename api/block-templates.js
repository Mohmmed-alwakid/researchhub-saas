/**
 * Block Templates API - Handle predefined block templates and configurations
 * 
 * Endpoints:
 * - GET /api/block-templates - Get all available block templates
 * - GET /api/block-templates/:type - Get templates for a specific block type
 * - POST /api/block-templates - Create a new block template (admin only)
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
    if (req.method === 'GET') {
      return await handleGetTemplates(req, res, supabase);
    } else if (req.method === 'POST') {
      return await handleCreateTemplate(req, res, supabase);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('❌ Block Templates API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGetTemplates(req, res, supabase) {
  try {
    const { type } = req.query;
    
    let query = supabase
      .from('block_templates')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data: templates, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching templates:', error);
      
      // Return default templates if database query fails
      return res.status(200).json({
        success: true,
        templates: getDefaultBlockTemplates(type),
        source: 'default'
      });
    }
    
    // If no templates found in database, return defaults
    if (!templates || templates.length === 0) {
      return res.status(200).json({
        success: true,
        templates: getDefaultBlockTemplates(type),
        source: 'default'
      });
    }
    
    return res.status(200).json({
      success: true,
      templates,
      source: 'database'
    });
    
  } catch (error) {
    console.error('❌ Error in handleGetTemplates:', error);
    
    // Fallback to default templates
    return res.status(200).json({
      success: true,
      templates: getDefaultBlockTemplates(req.query.type),
      source: 'fallback'
    });
  }
}

async function handleCreateTemplate(req, res, supabase) {
  try {
    // Authentication required for creating templates
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { name, type, category, description, settings, metadata } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }

    // Create the template
    const { data: template, error } = await supabase
      .from('block_templates')
      .insert({
        name,
        type,
        category: category || 'custom',
        description,
        settings: settings || {},
        metadata: metadata || {},
        created_by: user.id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating template:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create template'
      });
    }

    return res.status(201).json({
      success: true,
      template
    });

  } catch (error) {
    console.error('❌ Error in handleCreateTemplate:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
}

// Default block templates for fallback
function getDefaultBlockTemplates(type) {
  const allTemplates = [
    {
      id: 'welcome-basic',
      name: 'Basic Welcome',
      type: 'welcome',
      category: 'basic',
      description: 'Simple welcome screen with study introduction',
      settings: {
        title: 'Welcome to our study',
        description: 'Thank you for participating in our research.',
        showContinueButton: true,
        buttonText: 'Start Study'
      }
    },
    {
      id: 'open-question-basic',
      name: 'Basic Open Question',
      type: 'open-question',
      category: 'basic',
      description: 'Simple open-ended question',
      settings: {
        question: 'What are your thoughts?',
        placeholder: 'Please share your thoughts...',
        required: true,
        minLength: 10
      }
    },
    {
      id: 'conditional-branch-demo',
      name: 'Demo Conditional Branch',
      type: 'conditional-branch',
      category: 'advanced',
      description: 'Conditional logic demonstration',
      settings: {
        conditions: [
          {
            id: 'cond1',
            type: 'response-based',
            logic: { type: 'equals', blockId: 'prev-block', value: 'yes' },
            targetBlockId: 'next-block-a'
          }
        ],
        defaultTarget: 'next-block-b'
      }
    },
    {
      id: 'ai-followup-demo',
      name: 'Demo AI Follow-up',
      type: 'ai-followup',
      category: 'advanced',
      description: 'AI-powered follow-up questions',
      settings: {
        baseBlockId: 'previous-question',
        baseQuestion: 'What do you think about this?',
        followUpCount: 2,
        aiPrompt: 'Generate thoughtful follow-up questions based on the user response'
      }
    },
    {
      id: 'card-sort-demo',
      name: 'Demo Card Sort',
      type: 'card-sort',
      category: 'advanced',
      description: 'Card sorting exercise demonstration',
      settings: {
        instructions: 'Sort these items into the appropriate categories',
        items: [
          { id: 'item1', name: 'Apple', description: 'A fruit' },
          { id: 'item2', name: 'Carrot', description: 'A vegetable' },
          { id: 'item3', name: 'Bread', description: 'A grain product' }
        ],
        categories: [
          { id: 'cat1', name: 'Fruits' },
          { id: 'cat2', name: 'Vegetables' },
          { id: 'cat3', name: 'Grains' }
        ]
      }
    },
    {
      id: 'opinion-scale-likert',
      name: 'Likert Scale',
      type: 'opinion-scale',
      category: 'basic',
      description: '5-point Likert scale rating',
      settings: {
        question: 'How would you rate this?',
        scaleType: 'likert',
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
        steps: 5
      }
    },
    {
      id: 'multiple-choice-basic',
      name: 'Basic Multiple Choice',
      type: 'multiple-choice',
      category: 'basic',
      description: 'Simple multiple choice question',
      settings: {
        question: 'Which option do you prefer?',
        options: [
          { id: 'opt1', text: 'Option A', value: 'a' },
          { id: 'opt2', text: 'Option B', value: 'b' },
          { id: 'opt3', text: 'Option C', value: 'c' }
        ],
        allowMultiple: false,
        required: true
      }
    },
    {
      id: 'thank-you-basic',
      name: 'Basic Thank You',
      type: 'thank-you',
      category: 'completion',
      description: 'Study completion message',
      settings: {
        title: 'Thank you!',
        message: 'Your participation has been valuable to our research.',
        showCompletionCode: false,
        redirectUrl: null
      }
    }
  ];
  
  if (type) {
    return allTemplates.filter(template => template.type === type);
  }
  
  return allTemplates;
}
