// User study participation API endpoint
// GET /api/admin/users/[id]/studies - Get user's study participation history

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock study participation data - replace with real Supabase queries in production
const generateMockStudyParticipation = (userId) => {
  const studies = [];
  const studyTitles = [
    'E-commerce Checkout Flow Study',
    'Mobile App Navigation Research',
    'Brand Perception Survey',
    'Product Feature Usability Test',
    'Customer Journey Mapping',
    'Website Redesign Feedback',
    'Voice Interface Evaluation',
    'Color Scheme Preference Study',
    'Loading Time Impact Analysis',
    'Social Media Integration Test'
  ];

  const statuses = ['completed', 'in_progress', 'abandoned'];

  for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 120) + 10;
    
    studies.push({
      id: `study_participation_${userId}_${i}`,
      study_id: `study_${i}`,
      title: studyTitles[Math.floor(Math.random() * studyTitles.length)],
      status,
      start_date: startDate.toISOString(),
      completion_date: status === 'completed' ? 
        new Date(startDate.getTime() + duration * 60000).toISOString() : null,
      duration_minutes: status === 'completed' ? duration : Math.floor(duration * 0.6),
      feedback_rating: status === 'completed' && Math.random() > 0.3 ? 
        Math.floor(Math.random() * 5) + 1 : null,
      compensation_paid: status === 'completed' ? Math.floor(Math.random() * 50) + 10 : 0,
      completion_percentage: status === 'completed' ? 100 : 
        status === 'in_progress' ? Math.floor(Math.random() * 80) + 10 : 
        Math.floor(Math.random() * 40) + 5
    });
  }

  return studies.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
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
    //   .from('study_applications')
    //   .select(`
    //     *,
    //     studies(id, title, description),
    //     study_sessions(
    //       id,
    //       status,
    //       started_at,
    //       completed_at,
    //       feedback_rating
    //     )
    //   `)
    //   .eq('participant_id', id)
    //   .order('created_at', { ascending: false });

    // if (error) throw error;

    // For now, return mock data
    const studyParticipation = generateMockStudyParticipation(id);

    return res.status(200).json({
      success: true,
      data: studyParticipation
    });

  } catch (error) {
    console.error('Error fetching user studies:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user studies'
    });
  }
}
