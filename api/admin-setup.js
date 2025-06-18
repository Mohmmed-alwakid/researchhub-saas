// Admin setup endpoint - sets up admin users (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Predefined test accounts
const TEST_ACCOUNTS = {
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123',
    role: 'participant'
  },
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com', 
    password: 'Testtest123',
    role: 'researcher'
  },
  admin: {
    email: 'abwanwr+admin@gmail.com',
    role: 'admin'
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('=== ADMIN SETUP ===');

    if (req.method === 'GET') {
      // Return test account information
      return res.status(200).json({
        success: true,
        message: 'Test accounts configuration',
        testAccounts: {
          participant: {
            email: TEST_ACCOUNTS.participant.email,
            role: TEST_ACCOUNTS.participant.role,
            note: 'Use password: Testtest123'
          },
          researcher: {
            email: TEST_ACCOUNTS.researcher.email, 
            role: TEST_ACCOUNTS.researcher.role,
            note: 'Use password: Testtest123'
          },
          admin: {
            email: TEST_ACCOUNTS.admin.email,
            role: TEST_ACCOUNTS.admin.role,
            note: 'Admin account - set up via dashboard'
          }
        }
      });
    }

    const { action, email } = req.body;
    
    if (action === 'setup_admin') {
      const adminEmail = email || TEST_ACCOUNTS.admin.email;
      
      console.log('Setting up admin account for:', adminEmail);
      
      // Check if user exists in profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', adminEmail)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile check error:', profileError);
      }

      if (existingProfile) {
        // Update existing profile to admin
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('email', adminEmail)
          .select()
          .single();

        if (updateError) {
          console.error('Profile update error:', updateError);
          return res.status(400).json({
            success: false,
            error: 'Failed to update user to admin role'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'User updated to admin successfully',
          admin: {
            email: adminEmail,
            role: 'admin',
            status: 'active'
          }
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please register the user first, then set as admin.'
        });
      }
    }

    if (action === 'create_test_accounts') {
      const results = [];
      
      // Create participant account
      try {
        const { data: participantAuth, error: participantError } = await supabase.auth.signUp({
          email: TEST_ACCOUNTS.participant.email,
          password: TEST_ACCOUNTS.participant.password,
          options: {
            data: {
              first_name: 'Test',
              last_name: 'Participant',
              role: 'participant'
            }
          }
        });

        if (!participantError) {
          results.push({ type: 'participant', status: 'created', email: TEST_ACCOUNTS.participant.email });
        } else {
          results.push({ type: 'participant', status: 'error', email: TEST_ACCOUNTS.participant.email, error: participantError.message });
        }
      } catch (e) {
        results.push({ type: 'participant', status: 'error', email: TEST_ACCOUNTS.participant.email, error: 'Already exists or other error' });
      }

      // Create researcher account
      try {
        const { data: researcherAuth, error: researcherError } = await supabase.auth.signUp({
          email: TEST_ACCOUNTS.researcher.email,
          password: TEST_ACCOUNTS.researcher.password,
          options: {
            data: {
              first_name: 'Test',
              last_name: 'Researcher',
              role: 'researcher'
            }
          }
        });

        if (!researcherError) {
          results.push({ type: 'researcher', status: 'created', email: TEST_ACCOUNTS.researcher.email });
        } else {
          results.push({ type: 'researcher', status: 'error', email: TEST_ACCOUNTS.researcher.email, error: researcherError.message });
        }
      } catch (e) {
        results.push({ type: 'researcher', status: 'error', email: TEST_ACCOUNTS.researcher.email, error: 'Already exists or other error' });
      }

      return res.status(200).json({
        success: true,
        message: 'Test account creation attempted',
        results: results,
        note: 'Check Supabase dashboard to confirm emails and set admin manually'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use: setup_admin or create_test_accounts'
    });

  } catch (error) {
    console.error('=== ADMIN SETUP ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: 'Admin setup failed',
      message: error.message
    });
  }
}
