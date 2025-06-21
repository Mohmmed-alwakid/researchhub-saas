// Enhanced Study Builder API - Supports 3 core study types with smart task management
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Study Type Definitions - Only 3 core types
const STUDY_TYPES = {
  usability_test: {
    id: 'usability_test',
    name: 'Usability Testing',
    description: 'Test user interactions with interfaces, prototypes, and information architecture',
    icon: '🖱️',
    allowedTasks: [
      'navigation', 'prototype_testing', 'task_completion', 'feedback',
      'tree_testing', 'card_sorting', 'findability', 'first_click',
      'menu_testing', 'search_testing', 'mobile_navigation'
    ],
    forbiddenTasks: ['survey_questions', 'interview_deep_dive', 'demographic_survey'],
    maxTasks: 10,
    minTasks: 1,
    recordingRecommended: true,
    features: ['screen_recording', 'click_tracking', 'heatmaps', 'path_analysis']
  },
  user_interview: {
    id: 'user_interview',
    name: 'User Interview',
    description: 'Gather qualitative insights through guided conversation',
    icon: '🎙️',
    allowedTasks: [
      'interview_questions', 'follow_up', 'conversation_starter',
      'background_questions', 'task_discussion', 'concept_feedback'
    ],
    forbiddenTasks: ['prototype_testing', 'navigation', 'tree_testing', 'card_sorting'],
    maxTasks: 5,
    minTasks: 1,
    recordingRecommended: true,
    features: ['audio_recording', 'note_taking', 'conversation_guides', 'video_optional']
  },
  survey: {
    id: 'survey',
    name: 'Survey Research',
    description: 'Collect structured quantitative and qualitative data',
    icon: '📋',
    allowedTasks: [
      'questionnaire', 'rating_scale', 'multiple_choice', 'demographics',
      'likert_scale', 'net_promoter_score', 'open_ended', 'ranking'
    ],
    forbiddenTasks: [
      'prototype_testing', 'navigation', 'screen_recording', 'interview_questions',
      'tree_testing', 'card_sorting'
    ],
    maxTasks: 8,    minTasks: 1,
    recordingRecommended: false,
    features: ['form_validation', 'skip_logic', 'randomization']
  }
};

// Task Templates organized by study type
const TASK_TEMPLATES = {
  // Usability Testing Tasks
  website_navigation: {
    id: 'website_navigation',
    name: 'Website Navigation',
    category: 'usability',
    subcategory: 'navigation',
    description: 'Have users navigate through your website to complete specific goals',
    estimatedDuration: 5,
    complexity: 2,
    requiredFields: ['url', 'goal', 'success_criteria'],
    optionalFields: ['starting_page', 'time_limit'],
    defaultSettings: { recordScreen: true, trackClicks: true, trackScrolling: true }
  },
  prototype_testing: {
    id: 'prototype_testing',
    name: 'Prototype Testing',
    category: 'usability',
    subcategory: 'prototype',
    description: 'Test interactive prototypes and wireframes',
    estimatedDuration: 8,
    complexity: 3,
    requiredFields: ['prototype_url', 'scenario', 'expected_outcome'],
    optionalFields: ['prototype_type', 'feedback_prompts'],
    defaultSettings: { recordScreen: true, trackInteractions: true, collectFeedback: true }
  },
  tree_testing: {
    id: 'tree_testing',
    name: 'Tree Testing',
    category: 'usability',
    subcategory: 'information_architecture',
    description: 'Navigate site structure to find specific information',
    estimatedDuration: 6,
    complexity: 2,
    requiredFields: ['site_map', 'find_task', 'target_location'],
    optionalFields: ['allow_backtrack', 'show_path'],
    defaultSettings: { showPath: false, allowBacktrack: true, trackPath: true }
  },
  card_sorting: {
    id: 'card_sorting',
    name: 'Card Sorting',
    category: 'usability',
    subcategory: 'information_architecture',
    description: 'Sort items into logical categories that make sense to users',
    estimatedDuration: 12,
    complexity: 3,
    requiredFields: ['cards', 'sort_type'],
    optionalFields: ['max_categories', 'category_labels'],
    defaultSettings: { sortType: 'open', maxCategories: 10, allowCustomCategories: true }
  },
  first_click_test: {
    id: 'first_click_test',
    name: 'First Click Test',
    category: 'usability',
    subcategory: 'navigation',
    description: 'Test where users click first to complete a task',
    estimatedDuration: 3,
    complexity: 1,
    requiredFields: ['image_url', 'task_question'],
    optionalFields: ['highlight_clicks', 'time_limit'],
    defaultSettings: { highlightClicks: true, showHeatmap: true, timeLimit: 30 }
  },

  // Interview Tasks
  interview_questions: {
    id: 'interview_questions',
    name: 'Interview Questions',
    category: 'interview',
    subcategory: 'conversation',
    description: 'Structured questions for guided conversation',
    estimatedDuration: 15,
    complexity: 2,
    requiredFields: ['questions', 'question_type'],
    optionalFields: ['follow_up_prompts', 'time_per_question'],
    defaultSettings: { recordAudio: true, allowNotes: true, flexibleTiming: true }
  },
  conversation_starter: {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    category: 'interview',
    subcategory: 'warmup',
    description: 'Open-ended topics to begin discussions and build rapport',
    estimatedDuration: 5,
    complexity: 1,
    requiredFields: ['topic', 'context'],
    optionalFields: ['suggested_prompts', 'duration_guide'],
    defaultSettings: { recordAudio: true, informal: true, timeLimit: false }
  },
  background_questions: {
    id: 'background_questions',
    name: 'Background Questions',
    category: 'interview',
    subcategory: 'context',
    description: 'Understand participant background and experience',
    estimatedDuration: 8,
    complexity: 1,
    requiredFields: ['question_areas', 'depth_level'],
    optionalFields: ['follow_up_areas', 'sensitive_topics'],
    defaultSettings: { recordAudio: true, allowSkip: true, conversational: true }
  },

  // Survey Tasks
  questionnaire: {
    id: 'questionnaire',
    name: 'Questionnaire',
    category: 'survey',
    subcategory: 'structured',
    description: 'Structured questions with various response types',
    estimatedDuration: 10,
    complexity: 2,
    requiredFields: ['questions', 'response_types'],
    optionalFields: ['validation_rules', 'skip_logic'],
    defaultSettings: { allowSkip: false, randomizeOrder: false, showProgress: true }
  },
  likert_scale: {
    id: 'likert_scale',
    name: 'Likert Scale',
    category: 'survey',
    subcategory: 'rating',
    description: 'Agreement scale questions (Strongly Disagree to Strongly Agree)',
    estimatedDuration: 3,
    complexity: 1,
    requiredFields: ['statements', 'scale_points'],
    optionalFields: ['neutral_option', 'scale_labels'],
    defaultSettings: { scalePoints: 5, showLabels: true, requireAll: true }
  },
  multiple_choice: {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    category: 'survey',
    subcategory: 'selection',
    description: 'Single or multiple selection questions',
    estimatedDuration: 2,
    complexity: 1,
    requiredFields: ['question', 'options'],
    optionalFields: ['allow_multiple', 'randomize_options', 'other_option'],
    defaultSettings: { allowMultiple: false, randomizeOptions: false, showOther: true }
  },
  demographics: {
    id: 'demographics',
    name: 'Demographics',
    category: 'survey',
    subcategory: 'background',
    description: 'Collect participant demographic information',
    estimatedDuration: 4,
    complexity: 1,
    requiredFields: ['demographic_fields'],
    optionalFields: ['optional_fields', 'privacy_note'],
    defaultSettings: { allowSkip: true, showPrivacyNote: true, anonymize: true }
  },
  net_promoter_score: {
    id: 'net_promoter_score',
    name: 'Net Promoter Score',
    category: 'survey',
    subcategory: 'rating',
    description: 'Standard NPS question with follow-up',
    estimatedDuration: 3,
    complexity: 1,
    requiredFields: ['nps_question'],
    optionalFields: ['follow_up_question', 'segment_questions'],
    defaultSettings: { scale: 10, showFollowUp: true, requireReason: false }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }  // Authentication handling
  const authHeader = req.headers.authorization;
  let currentUser = null;
  let supabase = createClient(supabaseUrl, supabaseKey);
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Set the auth token on the client to work with RLS
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (user && !authError) {
        currentUser = user;
        // Create a new client with the auth token set
        supabase = createClient(supabaseUrl, supabaseKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });
      } else {
        console.log('Auth error:', authError);
      }
    } catch (authErr) {
      console.log('Auth token validation failed:', authErr);
    }
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'getStudyTypes':
        return await getStudyTypes(req, res);
      
      case 'getTaskTemplates':
        return await getTaskTemplates(req, res);
      
      case 'validateStudy':
        return await validateStudy(req, res);
      
      case 'createStudyWithTasks':
        return await createStudyWithTasks(req, res, supabase, currentUser);
      
      case 'updateStudyTasks':
        return await updateStudyTasks(req, res, supabase, currentUser);
      
      case 'reorderTasks':
        return await reorderTasks(req, res, supabase, currentUser);
      
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Study builder API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getStudyTypes(req, res) {
  return res.status(200).json({ 
    success: true, 
    studyTypes: Object.values(STUDY_TYPES)
  });
}

async function getTaskTemplates(req, res) {
  const { studyType, category } = req.query;
  
  let filteredTasks = Object.values(TASK_TEMPLATES);
  
  // Filter by study type
  if (studyType && STUDY_TYPES[studyType]) {
    const allowedTasks = STUDY_TYPES[studyType].allowedTasks;
    filteredTasks = filteredTasks.filter(task => allowedTasks.includes(task.id));
  }
  
  // Filter by category
  if (category) {
    filteredTasks = filteredTasks.filter(task => task.subcategory === category);
  }

  // Transform tasks to match the TaskTemplate interface
  const transformedTasks = filteredTasks.map(task => ({
    id: task.id,
    name: task.name,
    description: task.description,
    category: task.category,
    estimatedDuration: task.estimatedDuration,
    difficulty: task.complexity === 1 ? 'beginner' : task.complexity === 2 ? 'intermediate' : 'advanced',
    popularity: Math.floor(Math.random() * 100) + 1, // Mock popularity
    icon: getTaskIcon(task.category, task.subcategory),
    tags: generateTaskTags(task),
    settings: task.defaultSettings || {},
    previewContent: generatePreviewContent(task),
    usageCount: Math.floor(Math.random() * 500) + 10, // Mock usage count
    studyTypes: getApplicableStudyTypes(task.id)
  }));
  
  return res.status(200).json({ 
    success: true, 
    taskTemplates: transformedTasks 
  });
}

// Helper functions for task transformation
function getTaskIcon(category, subcategory) {
  const iconMap = {
    'usability': {
      'navigation': '🧭',
      'prototype': '🎨',
      'information_architecture': '🗂️',
      'interaction': '👆',
      'mobile': '📱'
    },
    'interview': {
      'conversation': '💬',
      'warmup': '🤝',
      'context': '📝',
      'feedback': '💭'
    },
    'survey': {
      'structured': '📋',
      'rating': '⭐',
      'selection': '✅',
      'demographic': '👥',
      'satisfaction': '😊'
    }
  };
  
  return iconMap[category]?.[subcategory] || '📝';
}

function generateTaskTags(task) {
  const tags = [task.category, task.subcategory];
  
  // Add complexity-based tags
  if (task.complexity === 1) tags.push('easy', 'quick');
  if (task.complexity === 2) tags.push('moderate');
  if (task.complexity === 3) tags.push('advanced', 'detailed');
  
  // Add duration-based tags
  if (task.estimatedDuration <= 5) tags.push('short');
  else if (task.estimatedDuration <= 10) tags.push('medium');
  else tags.push('long');
  
  return tags;
}

function generatePreviewContent(task) {
  return `This task involves ${task.description.toLowerCase()}. ` +
         `Estimated duration: ${task.estimatedDuration} minutes. ` +
         `Required fields: ${task.requiredFields?.join(', ') || 'None'}.`;
}

function getApplicableStudyTypes(taskId) {
  const applicableTypes = [];
  
  Object.entries(STUDY_TYPES).forEach(([typeId, typeConfig]) => {
    if (typeConfig.allowedTasks.includes(taskId)) {
      applicableTypes.push(typeId);
    }
  });
  
  return applicableTypes;
}

async function validateStudy(req, res) {
  const { studyType, tasks } = req.body;
  
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };
  
  const studyConfig = STUDY_TYPES[studyType];
  if (!studyConfig) {
    validation.errors.push({ type: 'INVALID_STUDY_TYPE', message: 'Invalid study type' });
    validation.isValid = false;
    return res.status(200).json({ success: true, validation });
  }
  
  // Check task count limits
  if (tasks.length > studyConfig.maxTasks) {
    validation.errors.push({
      type: 'TOO_MANY_TASKS',
      message: `Maximum ${studyConfig.maxTasks} tasks allowed for ${studyConfig.name}`
    });
    validation.isValid = false;
  }
  
  if (tasks.length < studyConfig.minTasks) {
    validation.errors.push({
      type: 'TOO_FEW_TASKS',
      message: `Minimum ${studyConfig.minTasks} task(s) required for ${studyConfig.name}`
    });
    validation.isValid = false;
  }
  
  // Check task compatibility
  tasks.forEach((task, index) => {
    if (!studyConfig.allowedTasks.includes(task.templateId)) {
      validation.errors.push({
        type: 'INCOMPATIBLE_TASK',
        taskIndex: index,
        message: `"${task.name}" is not compatible with ${studyConfig.name}`
      });
      validation.isValid = false;
    }
    
    if (studyConfig.forbiddenTasks.includes(task.templateId)) {
      validation.errors.push({
        type: 'FORBIDDEN_TASK',
        taskIndex: index,
        message: `"${task.name}" is not allowed in ${studyConfig.name}`
      });
      validation.isValid = false;
    }
  });
  
  // Calculate total duration and provide warnings
  const totalDuration = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 5), 0);
  
  if (totalDuration > 60) {
    validation.warnings.push({
      type: 'LONG_DURATION',
      message: `Study duration is ${totalDuration} minutes. Consider reducing for better completion rates.`
    });
  }
  
  if (totalDuration < 5) {
    validation.warnings.push({
      type: 'SHORT_DURATION',
      message: 'Study might be too short to gather meaningful insights.'
    });
  }
  
  // Provide suggestions
  if (studyType === 'usability' && !tasks.some(task => task.templateId === 'user_feedback')) {
    validation.suggestions.push('Consider adding a feedback task to gather qualitative insights');
  }
  
  if (studyType === 'survey' && tasks.length === 1) {
    validation.suggestions.push('Consider adding demographic questions for better analysis');
  }
  
  return res.status(200).json({ success: true, validation });
}

async function createStudyWithTasks(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { study, tasks } = req.body;
  
  // Validate study before creation
  const { validation } = await validateStudy({ body: { studyType: study.type, tasks } }, { status: () => ({ json: () => {} }) });
  
  if (!validation.isValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Study validation failed', 
      validation 
    });
  }
    // Create study
  const totalDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
  
  const studyData = {
    title: study.title,
    description: study.description,
    study_type_id: study.type,
    researcher_id: currentUser.id,
    status: 'draft',
    settings: {
      ...study.settings,
      studyType: study.type,
      totalEstimatedDuration: totalDuration
    },
    estimated_duration: totalDuration,
    target_participants: study.settings?.maxParticipants || 10
  };
  
  console.log('Creating study with data:', studyData);
  console.log('Current user:', { id: currentUser.id, email: currentUser.email });
  
  const { data: createdStudy, error: studyError } = await supabase
    .from('studies')
    .insert(studyData)
    .select()
    .single();

  if (studyError) {
    throw new Error('Failed to create study: ' + studyError.message);
  }

  // Create tasks if provided
  if (tasks && tasks.length > 0) {
    const taskInserts = tasks.map((task, index) => ({
      study_id: createdStudy.id,
      template_id: task.templateId,
      name: task.name,
      description: task.description,
      order_index: index,
      estimated_duration: task.estimatedDuration,
      settings: {
        ...task.settings,
        complexity: TASK_TEMPLATES[task.templateId]?.complexity || 1
      },
      is_required: task.isRequired !== false
    }));

    const { data: createdTasks, error: tasksError } = await supabase
      .from('study_tasks')
      .insert(taskInserts)
      .select();

    if (tasksError) {
      // Clean up study if task creation fails
      await supabase.from('studies').delete().eq('id', createdStudy.id);
      throw new Error('Failed to create tasks: ' + tasksError.message);
    }

    createdStudy.tasks = createdTasks;
  }

  // Transform to frontend format
  const transformedStudy = {
    _id: createdStudy.id,
    title: createdStudy.title,
    description: createdStudy.description,
    type: createdStudy.study_type_id,
    status: createdStudy.status,
    createdBy: createdStudy.researcher_id,
    createdAt: createdStudy.created_at,
    updatedAt: createdStudy.updated_at || createdStudy.created_at,
    settings: createdStudy.settings,
    maxParticipants: createdStudy.target_participants,
    estimatedDuration: createdStudy.estimated_duration,
    participants: [],
    tasks: createdStudy.tasks || [],
    validation: validation
  };

  return res.status(201).json({ 
    success: true, 
    study: transformedStudy 
  });
}

async function updateStudyTasks(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { studyId, tasks } = req.body;

  // Verify user owns the study
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('id, study_type_id')
    .eq('id', studyId)
    .eq('researcher_id', currentUser.id)
    .single();

  if (studyError || !study) {
    return res.status(404).json({ success: false, error: 'Study not found' });
  }

  // Validate tasks
  const validationReq = { body: { studyType: study.study_type_id, tasks } };
  const validationRes = { status: () => ({ json: (data) => data }) };
  const { validation } = await validateStudy(validationReq, validationRes);
  
  if (!validation.isValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Task validation failed', 
      validation 
    });
  }

  // Delete existing tasks
  const { error: deleteError } = await supabase
    .from('study_tasks')
    .delete()
    .eq('study_id', studyId);

  if (deleteError) {
    throw new Error('Failed to delete existing tasks: ' + deleteError.message);
  }

  // Insert new tasks
  if (tasks && tasks.length > 0) {
    const taskInserts = tasks.map((task, index) => ({
      study_id: studyId,
      template_id: task.templateId,
      name: task.name,
      description: task.description,
      order_index: index,
      estimated_duration: task.estimatedDuration,
      settings: {
        ...task.settings,
        complexity: TASK_TEMPLATES[task.templateId]?.complexity || 1
      },
      is_required: task.isRequired !== false
    }));

    const { data: createdTasks, error: tasksError } = await supabase
      .from('study_tasks')
      .insert(taskInserts)
      .select();

    if (tasksError) {
      throw new Error('Failed to create new tasks: ' + tasksError.message);
    }

    // Update study's estimated duration
    const totalDuration = tasks.reduce((total, task) => total + task.estimatedDuration, 0);
    await supabase
      .from('studies')
      .update({ 
        estimated_duration: totalDuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', studyId);

    return res.status(200).json({ 
      success: true, 
      tasks: createdTasks,
      validation: validation
    });
  }

  return res.status(200).json({ 
    success: true, 
    tasks: [],
    validation: validation
  });
}

async function reorderTasks(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { studyId, taskOrders } = req.body; // taskOrders: [{ taskId, newOrder }]

  // Verify user owns the study
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('id')
    .eq('id', studyId)
    .eq('researcher_id', currentUser.id)
    .single();

  if (studyError || !study) {
    return res.status(404).json({ success: false, error: 'Study not found' });
  }

  // Update task orders
  const updates = taskOrders.map(({ taskId, newOrder }) => 
    supabase
      .from('study_tasks')
      .update({ order_index: newOrder, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('study_id', studyId)
  );

  try {
    await Promise.all(updates);
    
    // Get updated tasks
    const { data: updatedTasks, error: fetchError } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('study_id', studyId)
      .order('order_index');

    if (fetchError) {
      throw new Error('Failed to fetch updated tasks: ' + fetchError.message);
    }

    return res.status(200).json({ 
      success: true, 
      tasks: updatedTasks 
    });
  } catch (error) {
    throw new Error('Failed to reorder tasks: ' + error.message);
  }
}
