/**
 * Templates API - Simplified for Development
 * 
 * Endpoints:
 * - GET /api/templates-simple - Get all templates with filtering
 * - GET /api/templates-simple?action=categories - Get template categories
 * 
 * Author: AI Assistant
 * Created: July 10, 2025 - Template Creation UI Integration
 * Status: Development mode - using fallback templates only
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, category, difficulty, search, limit = 20 } = req.query;

    // Route to appropriate handler
    if (req.method === 'GET' && action === 'categories') {
      return handleGetCategories(req, res);
    } else if (req.method === 'GET') {
      return handleGetTemplates(req, res, { category, difficulty, search, limit });
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ Templates API error:', error);
    return res.status(500).json({
      success: false,
      error: 'API error',
      details: error.message
    });
  }
}

// Get template categories
async function handleGetCategories(req, res) {
  const categories = [
    { 
      id: 'usability-testing', 
      name: 'Usability Testing',
      description: 'Test user interactions and workflows',
      icon: '🖱️',
      blockSuggestions: ['welcome_screen', 'context_screen', '5_second_test', 'open_question', 'thank_you']
    },
    { 
      id: 'content-testing', 
      name: 'Content Testing',
      description: 'Evaluate content effectiveness and comprehension',
      icon: '📝',
      blockSuggestions: ['welcome_screen', 'context_screen', 'multiple_choice', 'opinion_scale', 'thank_you']
    },
    { 
      id: 'user-interviews', 
      name: 'User Interviews',
      description: 'Conduct structured user interviews',
      icon: '🎤',
      blockSuggestions: ['welcome_screen', 'open_question', 'simple_input', 'thank_you']
    },
    { 
      id: 'concept-testing', 
      name: 'Concept Testing',
      description: 'Test new ideas and concepts',
      icon: '💡',
      blockSuggestions: ['welcome_screen', 'context_screen', 'opinion_scale', 'yes_no', 'thank_you']
    },
    { 
      id: 'card-sorting', 
      name: 'Card Sorting',
      description: 'Information architecture and categorization',
      icon: '🃏',
      blockSuggestions: ['welcome_screen', 'context_screen', 'card_sort', 'open_question', 'thank_you']
    },
    { 
      id: 'survey-research', 
      name: 'Survey Research',
      description: 'Structured data collection and analysis',
      icon: '📊',
      blockSuggestions: ['welcome_screen', 'multiple_choice', 'opinion_scale', 'simple_input', 'thank_you']
    },
    { 
      id: 'first-impression', 
      name: 'First Impression',
      description: 'Capture immediate reactions and impressions',
      icon: '⚡',
      blockSuggestions: ['welcome_screen', '5_second_test', 'open_question', 'opinion_scale', 'thank_you']
    },
    { 
      id: 'a-b-testing', 
      name: 'A/B Testing',
      description: 'Compare different design variations',
      icon: '🔄',
      blockSuggestions: ['welcome_screen', 'context_screen', 'opinion_scale', 'multiple_choice', 'thank_you']
    },
    { 
      id: 'other', 
      name: 'Other',
      description: 'Custom research studies',
      icon: '🎯',
      blockSuggestions: ['welcome_screen', 'open_question', 'thank_you']
    }
  ];

  return res.status(200).json({
    success: true,
    data: categories
  });
}

// Get all templates with filtering
async function handleGetTemplates(req, res, filters = {}) {
  const { category, difficulty, search, limit } = filters;

  try {
    console.log('📝 Using default templates for development');
    
    // Default templates for development
    let templates = [
      {
        id: 'default-usability-basic',
        title: 'Basic Usability Testing',
        description: 'A simple usability testing template for websites and applications',
        category: 'usability-testing',
        purpose: 'Test user interactions and identify usability issues',
        difficulty: 'beginner',
        estimated_duration: 21,
        recommended_participants: { min: 8, max: 12 },
        tags: ['usability', 'website', 'user-testing', 'feedback'],
        blocks: [
          {
            type: 'welcome_screen',
            order: 0,
            title: 'Welcome to Usability Testing',
            description: 'Welcome message for participants',
            settings: {
              title: 'Welcome to Our Usability Study',
              description: 'Help us improve our website by sharing your experience',
              proceedText: 'Begin Study'
            }
          },
          {
            type: 'context_screen',
            order: 1,
            title: 'Instructions',
            description: 'Study instructions for participants',
            settings: {
              title: 'Study Instructions',
              content: 'Please navigate through the website naturally and complete the given tasks. Think aloud as you go.',
              continueText: 'I Understand'
            }
          },
          {
            type: '5_second_test',
            order: 2,
            title: 'First Impression',
            description: '5-second first impression test',
            settings: {
              title: 'First Impression Test',
              instruction: 'You will see a webpage for 5 seconds. Pay attention to what you notice.',
              imageUrl: '',
              timeLimit: 5,
              followUpQuestion: 'What did you notice? What do you think this website is for?'
            }
          },
          {
            type: 'open_question',
            order: 3,
            title: 'Overall Experience',
            description: 'Collect feedback about overall experience',
            settings: {
              question: 'How would you describe your overall experience with this website?',
              placeholder: 'Please share your thoughts...',
              required: true,
              characterLimit: 500
            }
          },
          {
            type: 'thank_you',
            order: 4,
            title: 'Thank You',
            description: 'Thank you message',
            settings: {
              title: 'Thank You!',
              message: 'Your feedback is valuable to us. Thank you for participating in our study.',
              redirectUrl: '',
              showSocialShare: false
            }
          }
        ],
        metadata: {
          isPublic: true,
          isTemplate: true,
          version: '1.0'
        },
        created_at: '2025-07-10T00:00:00Z',
        updated_at: '2025-07-10T00:00:00Z',
        creator_id: 'default-system',
        usage_count: 0
      },
      {
        id: 'default-user-interview',
        title: 'User Interview Template',
        description: 'Structured template for conducting user interviews',
        category: 'user-interviews',
        purpose: 'Gather qualitative insights through structured interviews',
        difficulty: 'intermediate',
        estimated_duration: 30,
        recommended_participants: { min: 5, max: 8 },
        tags: ['interview', 'qualitative', 'insights', 'user-research'],
        blocks: [
          {
            type: 'welcome_screen',
            order: 0,
            title: 'Welcome to User Interview',
            description: 'Interview introduction',
            settings: {
              title: 'User Interview Session',
              description: 'Thank you for participating in our user interview. Your insights are valuable.',
              proceedText: 'Start Interview'
            }
          },
          {
            type: 'simple_input',
            order: 1,
            title: 'Background Information',
            description: 'Collect basic participant information',
            settings: {
              label: 'Tell us a bit about your background with [product/service]',
              inputType: 'textarea',
              placeholder: 'Your experience...',
              required: true
            }
          },
          {
            type: 'open_question',
            order: 2,
            title: 'Main Questions',
            description: 'Core interview questions',
            settings: {
              question: 'What are your main goals when using [product/service]?',
              placeholder: 'Please describe your goals...',
              required: true,
              characterLimit: 800
            }
          },
          {
            type: 'open_question',
            order: 3,
            title: 'Challenges',
            description: 'Identify pain points',
            settings: {
              question: 'What challenges or frustrations do you face?',
              placeholder: 'Please describe any difficulties...',
              required: true,
              characterLimit: 800
            }
          },
          {
            type: 'thank_you',
            order: 4,
            title: 'Thank You',
            description: 'Interview completion',
            settings: {
              title: 'Thank You for Your Time',
              message: 'Your insights will help us improve our product. We appreciate your participation.',
              redirectUrl: '',
              showSocialShare: false
            }
          }
        ],
        metadata: {
          isPublic: true,
          isTemplate: true,
          version: '1.0'
        },
        created_at: '2025-07-10T00:00:00Z',
        updated_at: '2025-07-10T00:00:00Z',
        creator_id: 'default-system',
        usage_count: 0
      },
      {
        id: 'default-concept-test',
        title: 'Concept Testing Template',
        description: 'Test and validate new concepts and ideas',
        category: 'concept-testing',
        purpose: 'Validate concepts before full development',
        difficulty: 'beginner',
        estimated_duration: 15,
        recommended_participants: { min: 10, max: 15 },
        tags: ['concept', 'validation', 'testing', 'feedback'],
        blocks: [
          {
            type: 'welcome_screen',
            order: 0,
            title: 'Concept Testing',
            description: 'Introduction to concept testing',
            settings: {
              title: 'Concept Evaluation Study',
              description: 'Help us evaluate a new concept by sharing your honest feedback',
              proceedText: 'View Concept'
            }
          },
          {
            type: 'context_screen',
            order: 1,
            title: 'Concept Presentation',
            description: 'Present the concept',
            settings: {
              title: 'New Concept',
              content: '[Insert concept description, images, or prototypes here]',
              continueText: 'I\'ve Reviewed the Concept'
            }
          },
          {
            type: 'opinion_scale',
            order: 2,
            title: 'Initial Reaction',
            description: 'Rate initial impression',
            settings: {
              question: 'What is your initial reaction to this concept?',
              scaleType: 'numeric',
              scaleRange: { min: 1, max: 5 },
              scaleLabels: {
                min: 'Very Negative',
                max: 'Very Positive'
              },
              required: true
            }
          },
          {
            type: 'yes_no',
            order: 3,
            title: 'Interest Level',
            description: 'Gauge interest',
            settings: {
              question: 'Would you be interested in using this if it were available?',
              yesText: 'Yes, I would use it',
              noText: 'No, I would not use it',
              required: true
            }
          },
          {
            type: 'open_question',
            order: 4,
            title: 'Feedback',
            description: 'Collect detailed feedback',
            settings: {
              question: 'What are your thoughts about this concept? Any suggestions for improvement?',
              placeholder: 'Please share your feedback...',
              required: true,
              characterLimit: 600
            }
          },
          {
            type: 'thank_you',
            order: 5,
            title: 'Thank You',
            description: 'Study completion',
            settings: {
              title: 'Thank You!',
              message: 'Your feedback helps us create better products. Thank you for your time.',
              redirectUrl: '',
              showSocialShare: false
            }
          }
        ],
        metadata: {
          isPublic: true,
          isTemplate: true,
          version: '1.0'
        },
        created_at: '2025-07-10T00:00:00Z',
        updated_at: '2025-07-10T00:00:00Z',
        creator_id: 'default-system',
        usage_count: 0
      }
    ];

    // Apply filters
    if (category && category !== 'all') {
      templates = templates.filter(t => t.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      templates = templates.filter(t => t.difficulty === difficulty);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.purpose.toLowerCase().includes(searchLower) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    if (limit) {
      templates = templates.slice(0, parseInt(limit));
    }

    return res.status(200).json({
      success: true,
      data: templates,
      meta: {
        total: templates.length,
        usingFallback: true,
        message: 'Using development templates'
      }
    });

  } catch (error) {
    console.error('❌ Get templates error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      details: error.message
    });
  }
}
