import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, error: 'User IDs array is required' });
    }

    if (!action) {
      return res.status(400).json({ success: false, error: 'Action is required' });
    }

    let updateData = {};
    
    switch (action) {
      case 'activate':
        updateData = { is_active: true };
        break;
      case 'deactivate':
        updateData = { is_active: false };
        break;
      case 'changeRole':
        if (!value) {
          return res.status(400).json({ success: false, error: 'Role value is required for changeRole action' });
        }
        updateData = { role: value };
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    // Prevent admin from deactivating themselves
    if (action === 'deactivate' && userIds.includes(user.id)) {
      return res.status(400).json({ success: false, error: 'Cannot deactivate your own account' });
    }

    // Prevent changing admin's own role
    if (action === 'changeRole' && userIds.includes(user.id)) {
      return res.status(400).json({ success: false, error: 'Cannot change your own role' });
    }

    // Perform bulk update
    const { data: updatedUsers, error: updateError, count } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select('id, name, email, role, is_active');

    if (updateError) {
      console.error('Error performing bulk update:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update users' });
    }

    // Log the admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: `bulk_${action}`,
        target_ids: userIds,
        details: { 
          action, 
          value: value || null, 
          affectedCount: count || 0 
        },
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging admin action:', logError);
    }

    const result = {
      modifiedCount: count || 0,
      matchedCount: userIds.length
    };

    return res.status(200).json({
      success: true,
      data: result,
      affectedUsers: updatedUsers
    });

  } catch (error) {
    console.error('Bulk users endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform bulk operation'
    });
  }
}
