/**
 * Admin Template Management API - ResearchHub Admin Features
 * 
 * Handles CRUD operations for curated study templates by admin users
 * 
 * Endpoints:
 * - GET /api/admin/templates - List all templates with stats
 * - POST /api/admin/templates - Create new template
 * - PUT /api/admin/templates/:id - Update template
 * - DELETE /api/admin/templates/:id - Delete template
 * - GET /api/admin/templates/:id/analytics - Get template analytics
 * 
 * Created: June 29, 2025
 * Phase 4: Admin Panel Enhancement
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Authentication - admin only
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
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const { method, query } = req;
    const templateId = query.id;

    switch (method) {
      case 'GET':
        if (templateId) {
          if (query.analytics) {
            // Get template analytics
            return await getTemplateAnalytics(supabase, templateId, res);
          } else {
            // Get specific template
            return await getTemplate(supabase, templateId, res);
          }
        } else {
          // List all templates
          return await listTemplates(supabase, res);
        }

      case 'POST':
        // Create new template
        return await createTemplate(supabase, req.body, user.id, res);

      case 'PUT':
        if (!templateId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Template ID required for update' 
          });
        }
        // Update template
        return await updateTemplate(supabase, templateId, req.body, user.id, res);

      case 'DELETE':
        if (!templateId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Template ID required for deletion' 
          });
        }
        // Delete template
        return await deleteTemplate(supabase, templateId, res);

      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }

  } catch (error) {
    console.error('Admin template API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// List all templates with usage statistics
async function listTemplates(supabase, res) {
  try {
    // Get templates from study_templates table
    const { data: templates, error } = await supabase
      .from('study_templates')
      .select(`
        *,
        template_usage_stats (
          usage_count,
          success_rate,
          average_completion_time
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.status === 'active').length;
    const totalUsage = templates.reduce((sum, t) => 
      sum + (t.template_usage_stats?.[0]?.usage_count || 0), 0
    );
    const averageSuccessRate = templates.length > 0 
      ? Math.round(templates.reduce((sum, t) => 
          sum + (t.template_usage_stats?.[0]?.success_rate || 0), 0
        ) / templates.length)
      : 0;

    // Transform data for frontend
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      title: template.title,
      description: template.description,
      category: template.category,
      blockCount: template.blocks ? template.blocks.length : 0,
      estimatedDuration: template.estimated_duration,
      usageCount: template.template_usage_stats?.[0]?.usage_count || 0,
      successRate: template.template_usage_stats?.[0]?.success_rate || 0,
      difficulty: template.difficulty,
      status: template.status,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      createdBy: template.created_by_name || 'System',
      blocks: template.blocks
    }));

    return res.status(200).json({
      success: true,
      data: {
        templates: formattedTemplates,
        stats: {
          totalTemplates,
          activeTemplates,
          totalUsage,
          averageSuccessRate
        }
      }
    });

  } catch (error) {
    console.error('Error listing templates:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to load templates' 
    });
  }
}

// Create new template
async function createTemplate(supabase, templateData, userId, res) {
  try {
    const { title, description, category, difficulty, status, estimatedDuration, blocks } = templateData;

    // Validate required fields
    if (!title || !description || !category || !blocks) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, description, category, blocks' 
      });
    }

    // Get user info for created_by
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();

    const createdByName = profile 
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : 'Admin User';

    // Insert template
    const { data: template, error } = await supabase
      .from('study_templates')
      .insert({
        title,
        description,
        category,
        difficulty: difficulty || 'Beginner',
        status: status || 'draft',
        estimated_duration: estimatedDuration || 10,
        blocks: blocks || [],
        created_by: userId,
        created_by_name: createdByName,
        is_curated: true
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data: {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        blockCount: template.blocks ? template.blocks.length : 0,
        estimatedDuration: template.estimated_duration,
        usageCount: 0,
        successRate: 0,
        difficulty: template.difficulty,
        status: template.status,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        createdBy: template.created_by_name,
        blocks: template.blocks
      }
    });

  } catch (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create template' 
    });
  }
}

// Update existing template
async function updateTemplate(supabase, templateId, templateData, userId, res) {
  try {
    const { title, description, category, difficulty, status, estimatedDuration, blocks } = templateData;

    // Update template
    const { data: template, error } = await supabase
      .from('study_templates')
      .update({
        title,
        description,
        category,
        difficulty,
        status,
        estimated_duration: estimatedDuration,
        blocks,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;

    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'Template not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        blockCount: template.blocks ? template.blocks.length : 0,
        estimatedDuration: template.estimated_duration,
        usageCount: 0, // TODO: Get from stats
        successRate: 0, // TODO: Get from stats
        difficulty: template.difficulty,
        status: template.status,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        createdBy: template.created_by_name,
        blocks: template.blocks
      }
    });

  } catch (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update template' 
    });
  }
}

// Delete template
async function deleteTemplate(supabase, templateId, res) {
  try {
    // Check if template is being used in studies
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id')
      .eq('template_id', templateId)
      .limit(1);

    if (studiesError) throw studiesError;

    if (studies && studies.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete template: it is being used in existing studies' 
      });
    }

    // Delete template
    const { error } = await supabase
      .from('study_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete template' 
    });
  }
}

// Get template analytics
async function getTemplateAnalytics(supabase, templateId, res) {
  try {
    // Get template usage statistics
    const { data: stats, error } = await supabase
      .from('template_usage_stats')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    const analytics = {
      usageCount: stats?.usage_count || 0,
      successRate: stats?.success_rate || 0,
      averageCompletionTime: stats?.average_completion_time || 0,
      lastUsed: stats?.last_used ? new Date(stats.last_used) : null,
      popularBlocks: stats?.popular_blocks || [],
      completionRates: stats?.completion_rates || {}
    };

    return res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error getting template analytics:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to load template analytics' 
    });
  }
}

// Get specific template
async function getTemplate(supabase, templateId, res) {
  try {
    const { data: template, error } = await supabase
      .from('study_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: 'Template not found' 
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        blockCount: template.blocks ? template.blocks.length : 0,
        estimatedDuration: template.estimated_duration,
        difficulty: template.difficulty,
        status: template.status,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        createdBy: template.created_by_name,
        blocks: template.blocks
      }
    });

  } catch (error) {
    console.error('Error getting template:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to load template' 
    });
  }
}
