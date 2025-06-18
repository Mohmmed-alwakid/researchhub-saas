// Supabase login endpoint (ES modules)
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
    console.log('=== SUPABASE LOGIN ===');
    
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    console.log('Step 1: Authenticating with Supabase...');
    
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return res.status(401).json({
        success: false,
        error: authError.message
      });
    }

    console.log('Step 1 SUCCESS: User authenticated');
    console.log('User ID:', authData.user?.id);

    // Fetch user profile from profiles table
    console.log('Step 2: Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Still return success but with basic user data
    }

    console.log('Step 2 SUCCESS: Profile fetched', profile);

    res.status(200).json({
      success: true,
      message: 'Login successful with Supabase',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        firstName: profile?.first_name || authData.user?.user_metadata?.first_name || '',
        lastName: profile?.last_name || authData.user?.user_metadata?.last_name || '',
        role: profile?.role || authData.user?.user_metadata?.role || 'researcher',
        status: profile?.status || 'active',
        emailConfirmed: authData.user?.email_confirmed_at ? true : false
      },
      session: authData.session,
      supabase: true
    });

  } catch (error) {
    console.error('=== SUPABASE LOGIN ERROR ===');
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
}
