// Studies API endpoint using Supabase (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Create Supabase client (use service role for server-side operations when authenticated)
  const authHeader = req.headers.authorization;
  let currentUser = null;
  let supabase;
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // First, verify the token with anon client
    const anonSupabase = createClient(supabaseUrl, supabaseKey);
    try {
      const { data: { user }, error: authError } = await anonSupabase.auth.getUser(token);
      if (user && !authError) {
        currentUser = user;
        // Use service role client for authenticated operations to bypass RLS for server-side logic
        supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);
      }
    } catch (authErr) {
      console.log('Auth token validation failed:', authErr);
    }
  }
  
  // Fallback to anon client if no valid authentication
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  try {    if (req.method === 'GET') {
      // Fetch studies from Supabase
      let query = supabase.from('studies').select('*').order('created_at', { ascending: false });
      
      // If we have an authenticated user, filter by researcher_id
      if (currentUser) {
        query = query.eq('researcher_id', currentUser.id);
      }
      
      const { data: studies, error } = await query;

      if (error) {
        console.error('Error fetching studies:', error);
        // Return sample data if no studies table exists yet
        const sampleStudies = [
          {
            id: '1',
            title: 'Website Navigation Study',
            status: 'active',
            participants: 15,
            completionRate: 87,
            createdAt: new Date().toISOString()
          },
          {
            id: '2', 
            title: 'Mobile App Usability Test',
            status: 'draft',
            participants: 0,
            completionRate: 0,
            createdAt: new Date().toISOString()
          }
        ];

        res.status(200).json({
          success: true,
          studies: sampleStudies,
          total: sampleStudies.length,
          message: 'Sample studies retrieved (studies table not yet created)'
        });
        return;      }

      // Transform Supabase data to frontend-expected format
      const transformedStudies = (studies || []).map(study => ({
        _id: study.id,
        title: study.title,
        description: study.description || '',
        type: study.settings?.type || 'usability',
        status: study.status,
        createdBy: study.researcher_id,
        tasks: study.settings?.tasks || [],
        participants: [], // TODO: fetch actual participants
        settings: {
          maxParticipants: study.target_participants || study.settings?.maxParticipants || 10,
          duration: study.settings?.duration || 30,
          compensation: study.settings?.compensation || 25,
          recordScreen: study.settings?.recording?.screen !== false,
          recordAudio: study.settings?.recording?.audio === true,
          collectHeatmaps: true
        },
        createdAt: study.created_at,
        updatedAt: study.updated_at || study.created_at
      }));

      res.status(200).json({
        success: true,
        studies: transformedStudies,
        total: transformedStudies.length,
        message: 'Studies retrieved successfully'});    } else if (req.method === 'POST') {
      // Handle study creation with authentication
      let currentUserId = null;
      
      // Use the current user if available
      if (currentUser) {
        currentUserId = currentUser.id;
      }

      const { title, description, type, tasks, settings } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }

      // Create study with full data from UI
      const studyData = {
        title,
        description: description || '',
        settings: {
          type: type || 'usability',
          recording: settings?.recording || { screen: true, audio: false, webcam: false },
          maxParticipants: settings?.maxParticipants || 10,
          duration: settings?.duration || 30,
          compensation: settings?.compensation || 25,
          tasks: tasks || []
        },
        status: 'draft',
        target_participants: settings?.maxParticipants || 10,
        researcher_id: currentUserId
      };

      // Insert study into Supabase
      const { data: newStudy, error } = await supabase
        .from('studies')
        .insert([studyData])
        .select()
        .single();      if (error) {
        console.error('Error creating study:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create study'
        });
      }

      // Transform the new study to match frontend expectations
      const transformedStudy = {
        _id: newStudy.id,
        title: newStudy.title,
        description: newStudy.description || '',
        type: newStudy.settings?.type || 'usability',
        status: newStudy.status,
        createdBy: newStudy.researcher_id,
        tasks: newStudy.settings?.tasks || [],
        participants: [],
        settings: {
          maxParticipants: newStudy.target_participants || newStudy.settings?.maxParticipants || 10,
          duration: newStudy.settings?.duration || 30,
          compensation: newStudy.settings?.compensation || 25,
          recordScreen: newStudy.settings?.recording?.screen !== false,
          recordAudio: newStudy.settings?.recording?.audio === true,
          collectHeatmaps: true
        },
        createdAt: newStudy.created_at,
        updatedAt: newStudy.updated_at || newStudy.created_at
      };

      res.status(201).json({
        success: true,
        study: transformedStudy,
        message: 'Study created successfully'
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Studies API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
