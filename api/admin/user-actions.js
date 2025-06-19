export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'Supabase configuration missing' 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (req.method === 'POST') {
      // Create new user
      const { email, password, name, role = 'participant', isActive = true } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, password, and name are required' 
        });
      }

      // Create user in Supabase Auth
      const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
        }
      });

      if (authCreateError) {
        return res.status(400).json({ 
          success: false, 
          error: authCreateError.message 
        });
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          role,
          status: isActive ? 'active' : 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(400).json({ 
          success: false, 
          error: profileError.message 
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          _id: profileData.id,
          name: `${profileData.first_name} ${profileData.last_name}`.trim(),
          email: profileData.email,
          role: profileData.role,
          isActive: profileData.status === 'active',
          createdAt: profileData.created_at,
          lastLoginAt: null,
          subscription: 'free',
          studiesCreated: 0,
          studiesParticipated: 0
        }
      });
    }

    if (req.method === 'PUT') {
      // Update existing user
      const { userId } = req.query;
      const { name, role, isActive } = req.body;

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name) {
        updateData.first_name = name.split(' ')[0] || name;
        updateData.last_name = name.split(' ').slice(1).join(' ') || '';
      }

      if (role) {
        updateData.role = role;
      }

      if (typeof isActive === 'boolean') {
        updateData.status = isActive ? 'active' : 'inactive';
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ 
          success: false, 
          error: updateError.message 
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          _id: updatedProfile.id,
          name: `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim(),
          email: updatedProfile.email,
          role: updatedProfile.role,
          isActive: updatedProfile.status === 'active',
          createdAt: updatedProfile.created_at,
          lastLoginAt: updatedProfile.last_login,
          subscription: 'free',
          studiesCreated: 0,
          studiesParticipated: 0
        }
      });
    }

    if (req.method === 'DELETE') {
      // Delete user
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      // Delete user from auth (this will cascade to delete profile via RLS)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        return res.status(400).json({ 
          success: false, 
          error: deleteError.message 
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('User action error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
