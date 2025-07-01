// Advanced user details API endpoint
// GET /api/admin/users/[id]/details - Get detailed user information
// PUT /api/admin/users/[id]/update - Update user information

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock detailed user data - replace with real Supabase queries in production
const generateMockUserDetails = (id) => ({
  id,
  email: `user${id}@example.com`,
  first_name: `User`,
  last_name: `${id}`,
  role: ['admin', 'researcher', 'participant'][Math.floor(Math.random() * 3)],
  status: ['active', 'inactive', 'suspended'][Math.floor(Math.random() * 3)],
  created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  last_login: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
  phone: Math.random() > 0.5 ? `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : null,
  location: Math.random() > 0.4 ? ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA'][Math.floor(Math.random() * 5)] : null,
  bio: Math.random() > 0.6 ? 'Experienced researcher with a focus on user experience and behavioral analysis.' : null,
  profile_image: null,
  tags: Math.random() > 0.5 ? ['premium', 'active-researcher'].filter(() => Math.random() > 0.5) : [],
  engagement_score: Math.floor(Math.random() * 100),
  study_count: Math.floor(Math.random() * 50),
  completion_rate: Math.floor(Math.random() * 100),
  avg_session_duration: Math.floor(Math.random() * 120) + 10,
  admin_notes: Math.random() > 0.7 ? 'Highly engaged user with consistent participation.' : ''
});

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      // TODO: Replace with real Supabase query
      // const { data, error } = await supabase
      //   .from('users')
      //   .select(`
      //     *,
      //     user_profiles(*),
      //     user_stats(*)
      //   `)
      //   .eq('id', id)
      //   .single();

      // if (error) throw error;

      // For now, return mock data
      const mockUser = generateMockUserDetails(id);

      return res.status(200).json({
        success: true,
        data: mockUser
      });

    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user details'
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updateData = req.body;

      // TODO: Replace with real Supabase update
      // const { data, error } = await supabase
      //   .from('users')
      //   .update({
      //     first_name: updateData.first_name,
      //     last_name: updateData.last_name,
      //     role: updateData.role,
      //     status: updateData.status,
      //     phone: updateData.phone,
      //     location: updateData.location,
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', id)
      //   .select()
      //   .single();

      // if (error) throw error;

      // Also update admin notes
      // await supabase
      //   .from('user_admin_notes')
      //   .upsert({
      //     user_id: id,
      //     notes: updateData.admin_notes,
      //     updated_by: req.user?.id,
      //     updated_at: new Date().toISOString()
      //   });

      // For now, return updated mock data
      const updatedUser = {
        ...generateMockUserDetails(id),
        ...updateData
      };

      return res.status(200).json({
        success: true,
        data: updatedUser
      });

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
