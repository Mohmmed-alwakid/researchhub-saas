// Enhanced Study Builder API - Comprehensive task management with study type constraints
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Authentication handling
  const authHeader = req.headers.authorization;
  let currentUser = null;
  let supabase;
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const anonSupabase = createClient(supabaseUrl, supabaseKey);
    try {
      const { data: { user }, error: authError } = await anonSupabase.auth.getUser(token);
      if (user && !authError) {
        currentUser = user;
        supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);
      }
    } catch (authErr) {
      console.log('Auth token validation failed:', authErr);
    }
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'getStudyTypes':
        return await getStudyTypes(req, res, supabase);
      
      case 'getTaskTemplates':
        return await getTaskTemplates(req, res, supabase);
      
      case 'getCompatibleTasks':
        return await getCompatibleTasks(req, res, supabase);
      
      case 'validateStudyConfiguration':
        return await validateStudyConfiguration(req, res, supabase);
      
      case 'createStudyWithTasks':
        return await createStudyWithTasks(req, res, supabase, currentUser);
      
      case 'updateStudyTasks':
        return await updateStudyTasks(req, res, supabase, currentUser);
      
      case 'reorderTasks':
        return await reorderTasks(req, res, supabase, currentUser);
      
      case 'updateTask':
        return await updateTask(req, res, supabase, currentUser);
      
      case 'deleteTask':
        return await deleteTask(req, res, supabase, currentUser);
      
      case 'duplicateTask':
        return await duplicateTask(req, res, supabase, currentUser);
      
      case 'getStudyWithTasks':
        return await getStudyWithTasks(req, res, supabase, currentUser);
      
      case 'previewStudy':
        return await previewStudy(req, res, supabase, currentUser);
      
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Enhanced Study Builder API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getStudyTypes(req, res, supabase) {
  const { data: studyTypes, error } = await supabase
    .from('study_types')
    .select('*')
    .order('name');

  if (error) {
    throw new Error('Failed to fetch study types: ' + error.message);
  }

  return res.status(200).json({ 
    success: true, 
    studyTypes: studyTypes || [] 
  });
}

async function getTaskTemplates(req, res, supabase) {
  const { studyType, category, complexity } = req.query;
  
  let query = supabase.from('task_templates').select('*');
  
  // Filter by category if specified
  if (category) {
    query = query.eq('category', category);
  }
  
  // Filter by complexity level if specified
  if (complexity) {
    query = query.eq('complexity_level', parseInt(complexity));
  }
  
  // If study type is specified, filter by allowed tasks
  if (studyType) {
    const { data: studyTypeData } = await supabase
      .from('study_types')
      .select('allowed_tasks, forbidden_tasks')
      .eq('id', studyType)
      .single();
    
    if (studyTypeData?.allowed_tasks?.length > 0) {
      query = query.in('id', studyTypeData.allowed_tasks);
    }
  }
  
  const { data: taskTemplates, error } = await query
    .order('category')
    .order('name');

  if (error) {
    throw new Error('Failed to fetch task templates: ' + error.message);
  }

  return res.status(200).json({ 
    success: true, 
    taskTemplates: taskTemplates || [] 
  });
}

async function getCompatibleTasks(req, res, supabase) {
  const { studyType, currentTasks } = req.query;
  
  if (!studyType) {
    return res.status(400).json({ success: false, error: 'Study type required' });
  }

  // Get study type constraints
  const { data: studyTypeData, error: studyTypeError } = await supabase
    .from('study_types')
    .select('*')
    .eq('id', studyType)
    .single();

  if (studyTypeError || !studyTypeData) {
    return res.status(404).json({ success: false, error: 'Study type not found' });
  }

  // Get all task templates
  const { data: allTasks, error: tasksError } = await supabase
    .from('task_templates')
    .select('*')
    .order('category', { ascending: true });

  if (tasksError) {
    throw new Error('Failed to fetch task templates: ' + tasksError.message);
  }

  // Parse current tasks if provided
  const currentTasksList = currentTasks ? JSON.parse(currentTasks) : [];
  
  // Filter compatible tasks
  const compatibleTasks = (allTasks || []).filter(task => {
    // Check if task is allowed for this study type
    if (!studyTypeData.allowed_tasks.includes(task.id)) return false;
    
    // Check if task is forbidden for this study type
    if (studyTypeData.forbidden_tasks.includes(task.id)) return false;
    
    // Check if adding this task would exceed max tasks
    if (currentTasksList.length >= studyTypeData.max_tasks) return false;
    
    // Check if task is already in current tasks
    if (currentTasksList.some(currentTask => currentTask.templateId === task.id)) return false;
    
    return true;
  });

  return res.status(200).json({ 
    success: true, 
    compatibleTasks,
    studyType: studyTypeData,
    constraints: {
      maxTasks: studyTypeData.max_tasks,
      minTasks: studyTypeData.min_tasks,
      currentTaskCount: currentTasksList.length,
      canAddMore: currentTasksList.length < studyTypeData.max_tasks
    }
  });
}

async function validateStudyConfiguration(req, res, supabase) {
  const { studyType, tasks } = req.body;
  
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Get study type data
  const { data: studyTypeData } = await supabase
    .from('study_types')
    .select('*')
    .eq('id', studyType)
    .single();

  if (!studyTypeData) {
    validation.isValid = false;
    validation.errors.push({ type: 'INVALID_STUDY_TYPE', message: 'Invalid study type' });
    return res.status(200).json({ success: true, validation });
  }

  // Validate task count
  if (tasks.length < studyTypeData.min_tasks) {
    validation.isValid = false;
    validation.errors.push({ 
      type: 'TOO_FEW_TASKS', 
      message: `Minimum ${studyTypeData.min_tasks} tasks required for ${studyTypeData.name}` 
    });
  }

  if (tasks.length > studyTypeData.max_tasks) {
    validation.isValid = false;
    validation.errors.push({ 
      type: 'TOO_MANY_TASKS', 
      message: `Maximum ${studyTypeData.max_tasks} tasks allowed for ${studyTypeData.name}` 
    });
  }

  // Validate task compatibility
  tasks.forEach((task, index) => {
    if (!studyTypeData.allowed_tasks.includes(task.templateId)) {
      validation.isValid = false;
      validation.errors.push({
        type: 'INCOMPATIBLE_TASK',
        taskIndex: index,
        taskId: task.templateId,
        message: `Task "${task.name}" is not compatible with ${studyTypeData.name}`
      });
    }

    if (studyTypeData.forbidden_tasks.includes(task.templateId)) {
      validation.isValid = false;
      validation.errors.push({
        type: 'FORBIDDEN_TASK',
        taskIndex: index,
        taskId: task.templateId,
        message: `Task "${task.name}" is not allowed in ${studyTypeData.name}`
      });
    }
  });

  // Calculate total duration and warnings
  const totalDuration = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
  
  if (totalDuration > 60) {
    validation.warnings.push({
      type: 'LONG_DURATION',
      message: `Study duration (${totalDuration} minutes) may be too long for participants`
    });
  }

  if (totalDuration < 5) {
    validation.warnings.push({
      type: 'SHORT_DURATION',
      message: `Study duration (${totalDuration} minutes) may be too short to gather meaningful data`
    });
  }

  // Add suggestions
  if (tasks.length === studyTypeData.min_tasks) {
    validation.suggestions.push(`Consider adding more tasks to gather richer insights (up to ${studyTypeData.max_tasks} tasks allowed)`);
  }

  if (studyTypeData.recording_recommended && tasks.some(task => !task.settings?.recordScreen)) {
    validation.suggestions.push('Screen recording is recommended for this study type to capture user interactions');
  }

  return res.status(200).json({ success: true, validation });
}

async function createStudyWithTasks(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { study, tasks } = req.body;
  
  // Validate the study configuration first
  const validationResponse = await validateStudyConfiguration({ body: { studyType: study.type, tasks } }, { status: () => ({ json: (data) => data }) }, supabase);
  const validation = validationResponse.validation;
  
  if (!validation.isValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Study configuration is invalid', 
      validation 
    });
  }

  // Create the study
  const studyData = {
    title: study.title,
    description: study.description,
    study_type_id: study.type,
    researcher_id: currentUser.id,
    status: 'draft',
    settings: study.settings || {},
    estimated_duration: tasks.reduce((total, task) => total + (task.estimatedDuration || 0), 0),
    total_tasks: tasks.length,
    max_participants: study.settings?.maxParticipants || 10,
    validation_status: 'validated',
    last_validated_at: new Date().toISOString()
  };

  const { data: createdStudy, error: studyError } = await supabase
    .from('studies')
    .insert([studyData])
    .select()
    .single();

  if (studyError) {
    throw new Error('Failed to create study: ' + studyError.message);
  }

  // Create tasks
  if (tasks && tasks.length > 0) {
    const taskInserts = tasks.map((task, index) => ({
      study_id: createdStudy.id,
      template_id: task.templateId,
      name: task.name,
      description: task.description || '',
      custom_instructions: task.customInstructions || '',
      order_index: index,
      estimated_duration: task.estimatedDuration || 5,
      complexity_level: task.complexityLevel || 1,
      settings: task.settings || {},
      validation_rules: task.validationRules || {},
      is_required: task.isRequired !== false
    }));

    const { data: createdTasks, error: tasksError } = await supabase
      .from('study_tasks')
      .insert(taskInserts)
      .select();

    if (tasksError) {
      // Clean up the study if task creation fails
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
    maxParticipants: createdStudy.max_participants,
    estimatedDuration: createdStudy.estimated_duration,
    totalTasks: createdStudy.total_tasks,
    validationStatus: createdStudy.validation_status,
    participants: [],
    tasks: createdStudy.tasks || []
  };

  return res.status(201).json({ 
    success: true, 
    study: transformedStudy,
    validation 
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

  // Validate the updated configuration
  const validationResponse = await validateStudyConfiguration({ body: { studyType: study.study_type_id, tasks } }, { status: () => ({ json: (data) => data }) }, supabase);
  const validation = validationResponse.validation;
  
  if (!validation.isValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'Task configuration is invalid', 
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
      description: task.description || '',
      custom_instructions: task.customInstructions || '',
      order_index: index,
      estimated_duration: task.estimatedDuration || 5,
      complexity_level: task.complexityLevel || 1,
      settings: task.settings || {},
      validation_rules: task.validationRules || {},
      is_required: task.isRequired !== false
    }));

    const { data: createdTasks, error: tasksError } = await supabase
      .from('study_tasks')
      .insert(taskInserts)
      .select();

    if (tasksError) {
      throw new Error('Failed to create new tasks: ' + tasksError.message);
    }

    return res.status(200).json({ 
      success: true, 
      tasks: createdTasks,
      validation 
    });
  }

  return res.status(200).json({ 
    success: true, 
    tasks: [],
    validation 
  });
}

async function reorderTasks(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { studyId, taskOrder } = req.body;

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

  // Update task order
  const updatePromises = taskOrder.map((taskId, index) =>
    supabase
      .from('study_tasks')
      .update({ order_index: index })
      .eq('id', taskId)
      .eq('study_id', studyId)
  );

  const results = await Promise.all(updatePromises);
  
  // Check for errors
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    throw new Error('Failed to reorder tasks: ' + errors[0].error.message);
  }

  return res.status(200).json({ success: true, message: 'Tasks reordered successfully' });
}

async function updateTask(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { taskId, updates } = req.body;

  // Verify user owns the task through study ownership
  const { data: task, error: taskError } = await supabase
    .from('study_tasks')
    .select('id, study_id')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('id')
    .eq('id', task.study_id)
    .eq('researcher_id', currentUser.id)
    .single();

  if (studyError || !study) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  // Update the task
  const { data: updatedTask, error: updateError } = await supabase
    .from('study_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (updateError) {
    throw new Error('Failed to update task: ' + updateError.message);
  }

  return res.status(200).json({ success: true, task: updatedTask });
}

async function deleteTask(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { taskId } = req.query;

  // Verify user owns the task through study ownership
  const { data: task, error: taskError } = await supabase
    .from('study_tasks')
    .select('id, study_id')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('id')
    .eq('id', task.study_id)
    .eq('researcher_id', currentUser.id)
    .single();

  if (studyError || !study) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  // Delete the task
  const { error: deleteError } = await supabase
    .from('study_tasks')
    .delete()
    .eq('id', taskId);

  if (deleteError) {
    throw new Error('Failed to delete task: ' + deleteError.message);
  }

  return res.status(200).json({ success: true, message: 'Task deleted successfully' });
}

async function duplicateTask(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { taskId } = req.body;

  // Get the original task
  const { data: originalTask, error: taskError } = await supabase
    .from('study_tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError || !originalTask) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  // Verify user owns the study
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('id')
    .eq('id', originalTask.study_id)
    .eq('researcher_id', currentUser.id)
    .single();

  if (studyError || !study) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  // Create duplicate task
  const duplicateData = {
    ...originalTask,
    name: `${originalTask.name} (Copy)`,
    order_index: originalTask.order_index + 1
  };
  delete duplicateData.id;
  delete duplicateData.created_at;
  delete duplicateData.updated_at;

  // Update order of subsequent tasks
  await supabase
    .from('study_tasks')
    .update({ order_index: supabase.raw('order_index + 1') })
    .eq('study_id', originalTask.study_id)
    .gt('order_index', originalTask.order_index);

  // Insert duplicate
  const { data: duplicatedTask, error: duplicateError } = await supabase
    .from('study_tasks')
    .insert([duplicateData])
    .select()
    .single();

  if (duplicateError) {
    throw new Error('Failed to duplicate task: ' + duplicateError.message);
  }

  return res.status(201).json({ success: true, task: duplicatedTask });
}

async function getStudyWithTasks(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { studyId } = req.query;

  // Get study with tasks
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select(`
      *,
      study_type:study_types(*),
      tasks:study_tasks(
        *,
        template:task_templates(*)
      )
    `)
    .eq('id', studyId)
    .eq('researcher_id', currentUser.id)
    .single();

  if (studyError || !study) {
    return res.status(404).json({ success: false, error: 'Study not found' });
  }

  // Sort tasks by order
  if (study.tasks) {
    study.tasks.sort((a, b) => a.order_index - b.order_index);
  }

  return res.status(200).json({ success: true, study });
}

async function previewStudy(req, res, supabase, currentUser) {
  if (!currentUser) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const { studyId } = req.body;

  // Get study with tasks for preview
  const { data: study, error } = await supabase
    .from('studies')
    .select(`
      *,
      study_type:study_types(*),
      tasks:study_tasks(
        *,
        template:task_templates(*)
      )
    `)
    .eq('id', studyId)
    .eq('researcher_id', currentUser.id)
    .single();

  if (error || !study) {
    return res.status(404).json({ success: false, error: 'Study not found' });
  }

  // Generate preview data
  const preview = {
    study: {
      title: study.title,
      description: study.description,
      type: study.study_type?.name,
      estimatedDuration: study.estimated_duration,
      totalTasks: study.total_tasks
    },
    tasks: study.tasks?.map(task => ({
      name: task.name,
      description: task.description,
      type: task.template?.name,
      duration: task.estimated_duration,
      settings: task.settings
    })) || [],
    timeline: generateTaskTimeline(study.tasks || []),
    participantInstructions: generateParticipantInstructions(study)
  };

  return res.status(200).json({ success: true, preview });
}

function generateTaskTimeline(tasks) {
  let currentTime = 0;
  return tasks.map(task => {
    const start = currentTime;
    const end = currentTime + task.estimated_duration;
    currentTime = end;
    return {
      taskName: task.name,
      startTime: start,
      endTime: end,
      duration: task.estimated_duration
    };
  });
}

function generateParticipantInstructions(study) {
  return {
    welcome: `Welcome to the ${study.title} study`,
    overview: study.description,
    expectations: `This study will take approximately ${study.estimated_duration} minutes to complete`,
    taskCount: `You will complete ${study.total_tasks} tasks`,
    recordingNote: study.study_type?.recording_recommended 
      ? 'This session will be recorded for analysis purposes'
      : 'No recording will be made during this session'
  };
}
