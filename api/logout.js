// Supabase logout endpoint (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('=== SUPABASE LOGOUT ===');
    
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Sign out the user
      const { error } = await supabase.auth.signOut(token);
      
      if (error) {
        console.error('Supabase logout error:', error);
      } else {
        console.log('User signed out successfully');
      }
    }

    // Always return success for logout (even if token is invalid)
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      supabase: true
    });

  } catch (error) {
    console.error('=== SUPABASE LOGOUT ERROR ===');
    console.error('Error details:', error);
    
    // Always return success for logout
    res.status(200).json({
      success: true,
      message: 'Logout completed',
      supabase: true
    });
  }
}
