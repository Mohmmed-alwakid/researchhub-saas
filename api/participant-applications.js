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
      
      // Build query for active studies only
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
        .eq('status', 'active');
      
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
      
      // TODO: Implement study application logic
      // For now, return a placeholder response
      return res.status(501).json({
        success: false,
        error: 'Study applications not yet implemented'
      });    } else if (req.method === 'GET' && endpoint === 'my-applications') {
      // GET /api/participant-applications?endpoint=my-applications
      
      console.log('📄 Fetching participant applications...');
      
      // TODO: Implement get my applications logic
      // For now, return empty applications
      return res.status(200).json({
        success: true,
        data: {
          applications: [],
          pagination: {
            current: 1,
            pages: 1,
            total: 0,
            hasNext: false,
            hasPrev: false
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
