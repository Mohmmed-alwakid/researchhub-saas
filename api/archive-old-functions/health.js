/**
 * Health Check API - Enhanced with database monitoring
 * 
 * Endpoints:
 * - GET /api/health - Basic health check
 * - GET /api/health?check=database - Database health check (consolidated from db-check.js)
 * 
 * Enhanced: July 1, 2025 (Added db-check.js functionality)
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { check } = req.query;

  // Enhanced database health check (consolidated from db-check.js)
  if (check === 'database') {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Quick database check
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        return res.status(500).json({
          success: false,
          error: 'Database query failed',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Database check successful',
        profilesCount: profiles?.length || 0,
        recentProfiles: profiles,
        timestamp: new Date().toISOString(),
        source: 'Consolidated from db-check.js'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Database check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Basic health check
  res.status(200).json({
    success: true,
    message: 'ResearchHub API is healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    status: 'operational',
    endpoints: {
      database_check: '/api/health?check=database'
    }
  });
}
