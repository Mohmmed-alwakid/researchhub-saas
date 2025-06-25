/**
 * Applications API - Consolidated participant and researcher applications
 * 
 * Endpoints:
 * - GET /api/applications?type=participant - Get participant applications
 * - POST /api/applications?type=participant - Submit participant application
 * - GET /api/applications?type=researcher - Get researcher applications
 * - POST /api/applications?type=researcher - Submit researcher application
 * - PUT /api/applications/:id?type=participant - Update participant application status
 * - PUT /api/applications/:id?type=researcher - Update researcher application status
 * 
 * Created: June 25, 2025 (Consolidated from participant-applications.js + researcher-applications.js)
 * Status: Production Ready ✅
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { type } = req.query;
  const applicationId = req.query.id || req.url?.split('/').pop();

  try {
    if (type === 'participant') {
      return await handleParticipantApplications(req, res, supabase, applicationId);
    } else if (type === 'researcher') {
      return await handleResearcherApplications(req, res, supabase, applicationId);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid type. Use: participant or researcher' 
      });
    }
  } catch (error) {
    console.error('Applications API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Participant Applications handlers
async function handleParticipantApplications(req, res, supabase, applicationId) {
  if (req.method === 'GET') {
    return await getParticipantApplications(req, res, supabase);
  } else if (req.method === 'POST') {
    return await submitParticipantApplication(req, res, supabase);
  } else if (req.method === 'PUT' && applicationId) {
    return await updateParticipantApplication(req, res, supabase, applicationId);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getParticipantApplications(req, res, supabase) {
  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  const { data: applications, error } = await supabase
    .from('participant_applications')
    .select(`
      *,
      studies (
        title,
        description,
        type,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching participant applications:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    });
  }

  return res.status(200).json({
    success: true,
    data: applications || []
  });
}

async function submitParticipantApplication(req, res, supabase) {
  const { studyId, responses, demographics } = req.body;

  if (!studyId) {
    return res.status(400).json({ 
      success: false, 
      error: 'studyId is required' 
    });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from('participant_applications')
    .select('id')
    .eq('study_id', studyId)
    .eq('user_id', user.id)
    .single();

  if (existingApplication) {
    return res.status(409).json({ 
      success: false, 
      error: 'You have already applied to this study' 
    });
  }

  const { data: application, error } = await supabase
    .from('participant_applications')
    .insert({
      study_id: studyId,
      user_id: user.id,
      screening_responses: responses || {},
      demographics: demographics || {},
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting participant application:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to submit application' 
    });
  }

  return res.status(201).json({
    success: true,
    data: application
  });
}

async function updateParticipantApplication(req, res, supabase, applicationId) {
  const { status, feedback } = req.body;

  if (!status) {
    return res.status(400).json({ 
      success: false, 
      error: 'status is required' 
    });
  }

  // Verify authentication and admin/researcher role
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check user role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || !['admin', 'researcher'].includes(profile.role)) {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin or researcher access required' 
    });
  }

  const { data: application, error } = await supabase
    .from('participant_applications')
    .update({
      status,
      feedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating participant application:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update application' 
    });
  }

  return res.status(200).json({
    success: true,
    data: application
  });
}

// Researcher Applications handlers
async function handleResearcherApplications(req, res, supabase, applicationId) {
  if (req.method === 'GET') {
    return await getResearcherApplications(req, res, supabase);
  } else if (req.method === 'POST') {
    return await submitResearcherApplication(req, res, supabase);
  } else if (req.method === 'PUT' && applicationId) {
    return await updateResearcherApplication(req, res, supabase, applicationId);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getResearcherApplications(req, res, supabase) {
  // Admin only endpoint
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const { data: applications, error } = await supabase
    .from('researcher_applications')
    .select(`
      *,
      user_profiles (
        email,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching researcher applications:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    });
  }

  return res.status(200).json({
    success: true,
    data: applications || []
  });
}

async function submitResearcherApplication(req, res, supabase) {
  const { 
    organization, 
    position, 
    experience, 
    researchInterests, 
    linkedin, 
    portfolio 
  } = req.body;

  if (!organization || !position || !experience) {
    return res.status(400).json({ 
      success: false, 
      error: 'organization, position, and experience are required' 
    });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from('researcher_applications')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existingApplication) {
    return res.status(409).json({ 
      success: false, 
      error: 'You have already submitted a researcher application' 
    });
  }

  const { data: application, error } = await supabase
    .from('researcher_applications')
    .insert({
      user_id: user.id,
      organization,
      position,
      experience,
      research_interests: researchInterests,
      linkedin_profile: linkedin,
      portfolio_url: portfolio,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting researcher application:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to submit application' 
    });
  }

  return res.status(201).json({
    success: true,
    data: application
  });
}

async function updateResearcherApplication(req, res, supabase, applicationId) {
  const { status, feedback } = req.body;

  if (!status) {
    return res.status(400).json({ 
      success: false, 
      error: 'status is required' 
    });
  }

  // Admin only
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const { data: application, error } = await supabase
    .from('researcher_applications')
    .update({
      status,
      feedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating researcher application:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update application' 
    });
  }

  // If approved, upgrade user role to researcher
  if (status === 'approved') {
    await supabase
      .from('user_profiles')
      .update({ role: 'researcher' })
      .eq('user_id', application.user_id);
  }

  return res.status(200).json({
    success: true,
    data: application
  });
}
