import { createClient } from '@supabase/supabase-js';


// Supabase profile management endpoint (ES modules)
const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get auth token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    if (req.method === 'GET') {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        profile: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
          status: profile.status,
          emailVerified: profile.is_email_verified,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }
      });
    }

    if (req.method === 'PUT') {
      // Update user profile
      const { firstName, lastName, role } = req.body;
      
      const updateData = {};
      if (firstName !== undefined) updateData.first_name = firstName;
      if (lastName !== undefined) updateData.last_name = lastName;
      if (role !== undefined) updateData.role = role;
      updateData.updated_at = new Date().toISOString();

      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({
          success: false,
          error: 'Profile update failed',
          message: updateError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
          status: profile.status,
          emailVerified: profile.is_email_verified,
          updatedAt: profile.updated_at
        }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('=== PROFILE ENDPOINT ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: 'Profile operation failed',
      message: error.message
    });
  }
}
