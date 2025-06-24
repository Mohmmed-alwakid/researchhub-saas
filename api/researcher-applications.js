/**
 * Researcher Applications Management API Endpoint - ResearchHub SaaS Platform
 * 
 * Handles researcher operations for managing study applications
 * 
 * Endpoints:
 * - GET /api/researcher-applications?endpoint=study/:studyId/applications - Get applications for a study
 * - PATCH /api/researcher-applications?endpoint=applications/:applicationId/review - Review an application
 * 
 * Security Features:
 * - JWT authentication required
 * - Researcher role verification
 * - Study ownership verification
 * - Row Level Security (RLS) enforcement
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔬 Researcher Applications API Request:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Initialize variables for user and profile data (scope outside try-catch)
  let user, userProfile, authenticatedSupabase, endpoint;

  try {
    // Parse the URL to determine the endpoint
    const url = new URL(req.url, `http://${req.headers.host}`);
    endpoint = url.searchParams.get('endpoint');
    
    console.log('🔍 API Endpoint called:', endpoint, 'Method:', req.method);

    // Authentication middleware
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create authenticated Supabase client with the user's JWT token
    authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify user authentication by decoding JWT
    try {
      // Decode JWT token manually
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
      
      // Verify user has researcher or admin role using authenticated client
      const { data: profile, error: profileError } = await authenticatedSupabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      console.log('🔍 Profile query result:', { profile, profileError });
      
      if (profileError || !profile || !['researcher', 'admin'].includes(profile.role)) {
        console.error('❌ Role verification failed:', { profileError, profile, expectedRoles: ['researcher', 'admin'] });
        return res.status(403).json({
          success: false,
          error: 'Only researchers and admins can manage study applications'
        });
      }
      
      console.log('✅ Role verified:', profile.role);
      
      // Store user info for later use (make accessible outside try-catch)
      user = { id: userId, email: userEmail };
      userProfile = profile;
    } catch (authError) {
      console.error('❌ Authentication failed:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (req.method === 'GET' && endpoint && endpoint.includes('/applications')) {
      // GET /api/researcher-applications?endpoint=study/:studyId/applications
      const studyId = endpoint.split('/')[1]; // Extract study ID
      
      console.log(`📋 Fetching applications for study: ${studyId}`);
      
      // Verify study ownership (unless admin)
      if (userProfile.role !== 'admin') {
        const { data: study, error: studyError } = await authenticatedSupabase
          .from('studies')
          .select('id, researcher_id')
          .eq('id', studyId)
          .eq('researcher_id', user.id)
          .single();
        
        if (studyError || !study) {
          return res.status(404).json({
            success: false,
            error: 'Study not found or access denied'
          });
        }
      }
      
      // Get pagination parameters
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const status = url.searchParams.get('status') || '';
      
      const offset = (page - 1) * limit;
      
      // Build query for study applications using authenticated client
      let query = authenticatedSupabase
        .from('study_applications')
        .select(`
          id,
          status,
          application_data,
          notes,
          applied_at,
          reviewed_at,
          profiles!inner(id, email, first_name, last_name)
        `)
        .eq('study_id', studyId)
        .order('applied_at', { ascending: false });
      
      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      // Get total count using authenticated client
      console.log('🔍 About to query applications for study:', studyId);
      
      const { count } = await authenticatedSupabase
        .from('study_applications')
        .select('*', { count: 'exact', head: true })
        .eq('study_id', studyId);
      
      console.log('📊 Application count query result:', count);
      
      // Apply pagination
      const { data: applications, error } = await query
        .range(offset, offset + limit - 1);
      
      console.log('📋 Applications query result:', { 
        dataLength: applications ? applications.length : 0, 
        error: error ? error.message : null 
      });
      
      if (error) {
        console.error('❌ Error fetching applications:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch applications'
        });
      }
      
      // Transform applications
      const transformedApplications = applications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.applied_at,
        reviewedAt: app.reviewed_at,
        notes: app.notes,
        applicationData: app.application_data,
        participant: {
          id: app.profiles.id,
          email: app.profiles.email,
          name: (app.profiles.first_name && app.profiles.last_name) 
            ? `${app.profiles.first_name} ${app.profiles.last_name}` 
            : app.profiles.email
        }
      }));
      
      // Calculate pagination
      const totalPages = Math.ceil((count || 0) / limit);
      
      console.log(`✅ Found ${applications.length} applications for study (page ${page}/${totalPages})`);
      
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

    } else if (req.method === 'PATCH' && endpoint && endpoint.includes('/review')) {
      // PATCH /api/researcher-applications?endpoint=applications/:applicationId/review
      const applicationId = endpoint.split('/')[1]; // Extract application ID
      
      console.log(`📝 Reviewing application: ${applicationId}`);
      
      const { status, notes } = req.body;
      
      // Validate status
      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be "accepted" or "rejected"'
        });
      }
      
      // Get application and verify ownership using authenticated client
      const { data: application, error: appError } = await authenticatedSupabase
        .from('study_applications')
        .select(`
          id,
          study_id,
          studies!inner(researcher_id)
        `)
        .eq('id', applicationId)
        .single();
      
      if (appError || !application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }
      
      // Verify study ownership (unless admin)
      if (userProfile.role !== 'admin' && application.studies.researcher_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only review applications for your own studies'
        });
      }
      
      // Update application using authenticated client
      const { data: updatedApplication, error: updateError } = await authenticatedSupabase
        .from('study_applications')
        .update({
          status,
          notes: notes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', applicationId)
        .select('*')
        .single();
      
      if (updateError) {
        console.error('❌ Error updating application:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update application'
        });
      }
      
      console.log(`✅ Application ${applicationId} ${status} successfully`);
      
      return res.status(200).json({
        success: true,
        data: {
          application: {
            id: updatedApplication.id,
            status: updatedApplication.status,
            notes: updatedApplication.notes,
            reviewedAt: updatedApplication.reviewed_at
          }
        },
        message: `Application ${status} successfully`
      });

    } else {
      // Unsupported endpoint
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

  } catch (error) {
    console.error('❌ Researcher Applications API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
