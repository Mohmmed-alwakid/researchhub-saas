// User activity timeline API endpoint
// GET /api/admin/users/[id]/activity - Get user activity timeline

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock activity data - replace with real Supabase queries in production
const generateMockActivity = (userId) => {
  const activities = [];
  const actionTypes = [
    'User Login',
    'Study Started',
    'Study Completed',
    'Profile Updated',
    'Password Changed',
    'Study Joined',
    'Feedback Submitted',
    'Account Created',
    'Role Changed',
    'Study Abandoned'
  ];

  const studyTitles = [
    'E-commerce Checkout Flow Study',
    'Mobile App Navigation Research',
    'Brand Perception Survey',
    'Product Feature Usability Test',
    'Customer Journey Mapping',
    'Website Redesign Feedback'
  ];

  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const isStudyRelated = action.includes('Study');
    
    activities.push({
      id: `activity_${userId}_${i}`,
      action,
      details: getActivityDetails(action),
      timestamp: timestamp.toISOString(),
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      study_id: isStudyRelated ? `study_${Math.floor(Math.random() * 10)}` : null,
      study_title: isStudyRelated ? studyTitles[Math.floor(Math.random() * studyTitles.length)] : null
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const getActivityDetails = (action) => {
  const detailsMap = {
    'User Login': 'User successfully authenticated and accessed the platform',
    'Study Started': 'User began participating in a research study',
    'Study Completed': 'User successfully completed all study requirements',
    'Profile Updated': 'User modified their profile information',
    'Password Changed': 'User updated their account password',
    'Study Joined': 'User enrolled in a new research study',
    'Feedback Submitted': 'User provided feedback on study experience',
    'Account Created': 'New user account was created and verified',
    'Role Changed': 'User role was modified by administrator',
    'Study Abandoned': 'User left study before completion'
  };
  
  return detailsMap[action] || 'User performed an action on the platform';
};

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // TODO: Replace with real Supabase query
    // const { data, error } = await supabase
    //   .from('user_activity_logs')
    //   .select(`
    //     *,
    //     studies(id, title)
    //   `)
    //   .eq('user_id', id)
    //   .order('timestamp', { ascending: false })
    //   .limit(50);

    // if (error) throw error;

    // For now, return mock data
    const activities = generateMockActivity(id);

    return res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user activity'
    });
  }
}
