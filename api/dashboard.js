// Dashboard Analytics API - Provides dashboard data for all authenticated users
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    // Get dashboard data based on user role
    if (profile.role === 'admin') {
      return await getAdminDashboardData(req, res);
    } else if (profile.role === 'researcher') {
      return await getResearcherDashboardData(req, res, user.id);
    } else if (profile.role === 'participant') {
      return await getParticipantDashboardData(req, res, user.id);
    } else {
      return res.status(403).json({ success: false, error: 'Invalid user role' });
    }

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics'
    });
  }
}

// Admin dashboard data
async function getAdminDashboardData(req, res) {
  try {
    // Get real counts from database
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: studyCount } = await supabase
      .from('studies')
      .select('*', { count: 'exact', head: true });

    const { count: activeStudies } = await supabase
      .from('studies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get recent activity
    const { data: recentStudies } = await supabase
      .from('studies')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const dashboardData = {
      totalStudies: studyCount || 0,
      activeParticipants: Math.floor((userCount || 0) * 0.7), // Estimate
      completionRate: 85, // Default completion rate
      avgSessionTime: 420, // 7 minutes average
      activeStudies: activeStudies || 0,
      recentStudies: (recentStudies || []).map(study => ({
        id: study.id,
        title: study.title,
        status: study.status,
        participants: 0, // TODO: Get real participant count
        completionRate: 85, // Default
        lastUpdate: study.created_at
      }))
    };

    return res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin dashboard data'
    });
  }
}

// Researcher dashboard data
async function getResearcherDashboardData(req, res, userId) {
  try {
    // Get researcher's studies
    const { data: studies, error } = await supabase
      .from('studies')
      .select('id, title, status, created_at, target_participants')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching researcher studies:', error);
    }

    const totalStudies = studies?.length || 0;
    const activeStudies = studies?.filter(s => s.status === 'active').length || 0;

    const dashboardData = {
      totalStudies,
      activeParticipants: 0, // TODO: Get real participant count from sessions
      completionRate: 85, // Default completion rate
      avgSessionTime: 420, // 7 minutes average
      activeStudies,
      recentStudies: (studies || []).slice(0, 5).map(study => ({
        id: study.id,
        title: study.title,
        status: study.status,
        participants: 0, // TODO: Get real participant count
        completionRate: 85, // Default
        lastUpdate: study.created_at
      }))
    };

    return res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Researcher dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch researcher dashboard data'
    });
  }
}

// Participant dashboard data
async function getParticipantDashboardData(req, res, userId) {
  try {
    // Get participant's study sessions
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('id, status, completed_at, study:studies(title)')
      .eq('participant_id', userId)
      .order('created_at', { ascending: false });

    const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
    const totalSessions = sessions?.length || 0;

    const dashboardData = {
      totalStudies: totalSessions,
      activeParticipants: 1, // The participant themselves
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      avgSessionTime: 420, // 7 minutes average
      activeStudies: totalSessions - completedSessions,
      recentStudies: (sessions || []).slice(0, 5).map(session => ({
        id: session.id,
        title: session.study?.title || 'Study',
        status: session.status,
        participants: 1,
        completionRate: session.status === 'completed' ? 100 : 0,
        lastUpdate: session.completed_at || new Date().toISOString()
      }))
    };

    return res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Participant dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch participant dashboard data'
    });
  }
}
