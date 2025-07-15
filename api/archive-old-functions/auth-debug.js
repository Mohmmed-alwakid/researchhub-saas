// Simple authentication test endpoint to debug header passing
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
    // Debug all headers and environment
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
      }
    };

    // Try multiple ways to get authorization header
    const authMethods = {
      'headers.authorization': req.headers.authorization,
      'headers.Authorization': req.headers.Authorization,
      'headers["authorization"]': req.headers['authorization'],
      'headers["Authorization"]': req.headers['Authorization']
    };

    // Get the best authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization || req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader) {
      return res.status(200).json({
        success: true,
        debug: debugInfo,
        authMethods: authMethods,
        message: 'No authorization header found',
        headerCount: Object.keys(req.headers).length
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === authHeader) {
      return res.status(200).json({
        success: true,
        debug: debugInfo,
        authMethods: authMethods,
        message: 'Authorization header found but invalid format',
        authHeaderLength: authHeader.length,
        authHeaderPreview: authHeader.substring(0, 50) + '...'
      });
    }

    // Test token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(200).json({
        success: true,
        debug: debugInfo,
        authMethods: authMethods,
        message: 'Token found but invalid',
        tokenLength: token.length,
        tokenPreview: token.substring(0, 50) + '...',
        authError: authError?.message
      });
    }

    // Success case
    return res.status(200).json({
      success: true,
      debug: debugInfo,
      authMethods: authMethods,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      },
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
