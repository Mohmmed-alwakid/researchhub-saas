// Supabase registration endpoint (CommonJS)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

module.exports = async function handler(req, res) {
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
  }    const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('=== SUPABASE REGISTRATION ===');
    
    const { email, password, firstName, lastName, role = 'researcher' } = req.body;
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    console.log('Step 1: Creating user with Supabase Auth...');
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    console.log('Step 1 SUCCESS: User created with Supabase Auth');
    console.log('User ID:', authData.user?.id);

    // The profile will be automatically created via database trigger
    console.log('Step 2: Profile automatically created via trigger');

    res.status(201).json({
      success: true,
      message: 'User registered successfully with Supabase',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        firstName,
        lastName,
        role,
        emailConfirmed: authData.user?.email_confirmed_at ? true : false
      },
      session: authData.session,
      supabase: true
    });

  } catch (error) {
    console.error('=== SUPABASE REGISTRATION ERROR ===');
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
}
