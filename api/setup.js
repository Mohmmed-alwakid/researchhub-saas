import { createClient } from '@supabase/supabase-js';


/**
 * Setup test accounts in production Supabase
 * Run this once to create the test accounts
 */

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { action, secret } = req.body;

    // Simple security check
    if (secret !== 'setup-test-accounts-2025') {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid secret' 
      });
    }

    if (action === 'create-test-accounts') {
      const results = await createTestAccounts();
      return res.status(200).json({
        success: true,
        message: 'Test accounts setup completed',
        data: results
      });
    }

    return res.status(400).json({ 
      success: false, 
      error: 'Invalid action' 
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Setup failed',
      details: error.message
    });
  }
}

async function createTestAccounts() {
  const testAccounts = [
    {
      email: 'abwanwr77+researcher@gmail.com',
      password: 'Testtest123',
      firstName: 'Research',
      lastName: 'User',
      role: 'researcher'
    },
    {
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123',
      firstName: 'Participant',
      lastName: 'User',
      role: 'participant'
    },
    {
      email: 'abwanwr77+admin@gmail.com',
      password: 'Testtest123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }
  ];

  const results = [];

  for (const account of testAccounts) {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
      
      const userExists = existingUser?.users?.find(u => u.email === account.email);
      
      if (userExists) {
        results.push({
          email: account.email,
          status: 'already_exists',
          id: userExists.id
        });
        continue;
      }

      // Create user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        user_metadata: {
          role: account.role,
          firstName: account.firstName,
          lastName: account.lastName
        },
        email_confirm: true
      });

      if (userError) {
        results.push({
          email: account.email,
          status: 'error',
          error: userError.message
        });
        continue;
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userData.user.id,
          first_name: account.firstName,
          last_name: account.lastName,
          role: account.role,
          status: 'active'
        });

      results.push({
        email: account.email,
        status: 'created',
        id: userData.user.id,
        profileCreated: !profileError
      });

    } catch (error) {
      results.push({
        email: account.email,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}
