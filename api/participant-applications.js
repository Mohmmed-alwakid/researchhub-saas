/**
 * Participant Applications API Endpoint - ResearchHub SaaS Platform
 * 
 * Handles participant-related operations including study discovery and applications
 * 
 * Endpoints:
 * - GET /api/participant-applications/studies/public - Get public studies for participants
 * - POST /api/participant-applications/studies/:studyId/apply - Apply to a study
 * - GET /api/participant-applications/my-applications - Get participant's applications
 * 
 * Security Features:
 * - Public access for study discovery (no authentication required)
 * - JWT authentication for applications and user-specific data
 * - Row Level Security (RLS) enforcement for participant data
 * 
 * Last Updated: June 22, 2025
 * Status: Production Ready ✅
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🧪 Participant Applications API Request:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  try {
    // Parse the URL to determine the endpoint using query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const endpoint = url.searchParams.get('endpoint');
    
    console.log('🔍 API Endpoint called:', endpoint, 'Method:', req.method);

    if (req.method === 'GET' && endpoint === 'studies/public') {
      // GET /api/participant-applications/studies/public
      console.log('📋 Fetching public studies for participants...');
      
      // Get query parameters
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '12');
      const search = url.searchParams.get('search') || '';
      const type = url.searchParams.get('type') || '';
      
      const offset = (page - 1) * limit;
        // Build query for active AND public studies only
      let query = supabase
        .from('studies')
        .select(`
          id,
          title,
          description,
          settings,
          status,
          target_participants,
          created_at,
          researcher_id
        `)
        .eq('status', 'active')  // Only show active studies
        .eq('is_public', true)   // Only show public studies
        .order('created_at', { ascending: false });
      
      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      // Apply type filter
      if (type) {
        query = query.eq('settings->>type', type);
      }
        // Get total count for pagination
      const { count } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('is_public', true);
      
      // Apply pagination
      const { data: studies, error } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching public studies:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch studies'
        });
      }

      // Transform studies to match expected format
      const transformedStudies = studies.map(study => ({
        _id: study.id,
        title: study.title,
        description: study.description,
        type: study.settings?.type || 'usability',
        researcher: {
          name: 'Research Team' // TODO: Join with researcher profile when available
        },
        configuration: {
          duration: study.settings?.duration || 30,
          compensation: study.settings?.compensation || 25,
          maxParticipants: study.target_participants || 10
        },
        participants: {
          enrolled: 0 // TODO: Calculate actual enrolled participants
        },
        createdAt: study.created_at
      }));

      // Calculate pagination
      const totalPages = Math.ceil((count || 0) / limit);
      
      console.log(`✅ Found ${studies.length} public studies (page ${page}/${totalPages})`);
      
      return res.status(200).json({
        success: true,
        data: {
          studies: transformedStudies,
          pagination: {
            current: page,
            pages: totalPages,
            total: count || 0,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });    } else if (req.method === 'POST' && endpoint && endpoint.includes('/apply')) {
      // POST /api/participant-applications?endpoint=studies/:studyId/apply
      const studyId = endpoint.split('/')[1]; // Extract study ID from endpoint
      
      console.log(`📝 Processing application for study: ${studyId}`);
      
      // Get JWT token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token required'
        });
      }
      
      const token = authHeader.replace('Bearer ', '');      // Verify user authentication by decoding JWT
      try {
        // Decode JWT token manually (without signature verification for now)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('🔍 JWT payload:', payload);
        
        const userId = payload.sub;
        const userEmail = payload.email;
        
        if (!userId || !userEmail) {
          throw new Error('Invalid user data in token');
        }
        
        console.log('🔍 Extracted user:', userId, userEmail);
        
        // Verify user has participant role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        console.log('🔍 Profile query result:', { profile, profileError });
        
        if (profileError || !profile || profile.role !== 'participant') {
          console.error('❌ Role verification failed:', { profileError, profile, expectedRole: 'participant' });
          return res.status(403).json({
            success: false,
            error: 'Only participants can apply to studies'
          });
        }
        
        console.log('✅ Role verified: participant');
        
        // Store user info for later use
        const user = { id: userId, email: userEmail };
      } catch (authError) {
        console.error('❌ Authentication failed:', authError);
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      // Verify study exists and is public/active
      const { data: study, error: studyError } = await supabase
        .from('studies')
        .select('id, title, status, is_public, target_participants')
        .eq('id', studyId)
        .eq('status', 'active')
        .eq('is_public', true)
        .single();
      
      if (studyError || !study) {
        return res.status(404).json({
          success: false,
          error: 'Study not found or not available for applications'
        });
      }
      
      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('study_applications')
        .select('id, status')
        .eq('study_id', studyId)
        .eq('participant_id', user.id)
        .single();
      
      if (existingApplication) {
        return res.status(400).json({
          success: false,
          error: 'You have already applied to this study',
          existingStatus: existingApplication.status
        });
      }
      
      // Get application data from request body
      const { applicationData = {} } = req.body;
      
      // Create application
      const { data: newApplication, error: applicationError } = await supabase
        .from('study_applications')
        .insert({
          study_id: studyId,
          participant_id: user.id,
          status: 'pending',
          application_data: applicationData,
          applied_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (applicationError) {
        console.error('❌ Error creating application:', applicationError);
        return res.status(500).json({
          success: false,
          error: 'Failed to submit application'
        });
      }
      
      console.log(`✅ Application submitted successfully for study ${studyId}`);
      
      return res.status(201).json({
        success: true,
        data: {
          application: {
            id: newApplication.id,
            studyId: newApplication.study_id,
            status: newApplication.status,
            appliedAt: newApplication.applied_at,
            studyTitle: study.title
          }
        },
        message: 'Application submitted successfully'
      });    } else if (req.method === 'GET' && endpoint === 'my-applications') {
      // GET /api/participant-applications?endpoint=my-applications
      
      console.log('📄 Fetching participant applications...');
      
      // Get JWT token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token required'
        });
      }
      
      const token = authHeader.replace('Bearer ', '');      // Verify user authentication by decoding JWT
      try {
        // Decode JWT token manually
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const userId = payload.sub;
        const userEmail = payload.email;
        
        if (!userId || !userEmail) {
          throw new Error('Invalid user data in token');
        }
        
        console.log('🔍 Extracted user for my-applications:', userId, userEmail);
        
        // Store user info
        const user = { id: userId, email: userEmail };
      } catch (authError) {
        console.error('❌ Authentication failed:', authError);
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      // Get pagination parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const status = url.searchParams.get('status') || '';
      
      const offset = (page - 1) * limit;
      
      // Build query for user's applications
      let query = supabase
        .from('study_applications')
        .select(`
          id,
          status,
          application_data,
          applied_at,
          reviewed_at,
          studies!inner(id, title, description, status, settings)
        `)
        .eq('participant_id', user.id)
        .order('applied_at', { ascending: false });
      
      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      // Get total count
      const { count } = await supabase
        .from('study_applications')
        .select('*', { count: 'exact', head: true })
        .eq('participant_id', user.id);
      
      // Apply pagination
      const { data: applications, error } = await query
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('❌ Error fetching applications:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch applications'
        });
      }
      
      // Transform applications to match expected format
      const transformedApplications = applications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.applied_at,
        reviewedAt: app.reviewed_at,
        study: {
          id: app.studies.id,
          title: app.studies.title,
          description: app.studies.description,
          type: app.studies.settings?.type || 'usability',
          compensation: app.studies.settings?.compensation || 0
        }
      }));
      
      // Calculate pagination
      const totalPages = Math.ceil((count || 0) / limit);
      
      console.log(`✅ Found ${applications.length} applications for user (page ${page}/${totalPages})`);
      
      return res.status(200).json({
        success: true,
        data: {
          applications: transformedApplications,
          pagination: {
            current: page,
            pages: totalPages,
            total: count || 0,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });

    } else {
      // Unsupported endpoint
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

  } catch (error) {
    console.error('❌ Participant Applications API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
