/**
 * ENHANCED RESEARCH API - With Study Management
 * Includes study creation, persistence, and cross-platform visibility
 */

// In-memory storage for studies (replace with database in production)
let studiesDatabase = [
  {
    id: 1,
    _id: '1', // Add _id for frontend compatibility
    title: 'Sample Research Study',
    description: 'A demonstration study for the platform',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    type: 'user_research',
    target_participants: 50,
    blocks: [],
    compensation: 25,
    duration: 30,
    difficulty: 'beginner',
    // Add camelCase versions for frontend compatibility
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let studyIdCounter = 2;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action } = req.query;
    
    console.log(`🔧 Research API - ${req.method} ${action}`);

    switch (action) {
      case 'create-study':
        if (req.method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        
        const studyData = req.body;
        const timestamp = new Date().toISOString();
        const newStudy = {
          id: studyIdCounter++,
          _id: String(studyIdCounter - 1), // Add _id for frontend compatibility
          title: studyData.title || 'Untitled Study',
          description: studyData.description || '',
          status: studyData.status || 'draft',
          created_at: timestamp,
          updated_at: timestamp,
          created_by: 'researcher', // TODO: Get from auth token
          type: studyData.type || 'usability',
          target_participants: studyData.target_participants || 10,
          blocks: studyData.blocks || [],
          compensation: studyData.compensation || 25,
          duration: studyData.duration || 30,
          difficulty: studyData.difficulty || 'beginner',
          // Add camelCase versions for frontend compatibility
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        studiesDatabase.push(newStudy);
        console.log(`✅ Study created: ${newStudy.title} (ID: ${newStudy.id})`);
        
        return res.status(201).json({
          success: true,
          data: newStudy,
          message: 'Study created successfully'
        });

      case 'get-studies':
        // Filter studies by user role if needed
        const userRole = req.headers['x-user-role'] || 'researcher';
        let filteredStudies = studiesDatabase.map(study => ({
          ...study,
          // Ensure all studies have both id and _id for compatibility
          id: study.id,
          _id: study._id || String(study.id),
          // Convert snake_case to camelCase for frontend compatibility
          createdAt: study.created_at,
          updatedAt: study.updated_at || study.created_at
        }));
        
        if (userRole === 'participant') {
          // Only show active/published studies for participants
          filteredStudies = filteredStudies.filter(study => 
            study.status === 'active' || study.status === 'published'
          );
        }
        
        console.log('📊 Research API: Returning studies:', filteredStudies.map(s => ({ id: s.id, _id: s._id, title: s.title })));
        
        return res.status(200).json({
          success: true,
          studies: filteredStudies,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalStudies: filteredStudies.length,
            hasNext: false,
            hasPrev: false
          }
        });

      case 'get-study':
        const studyId = parseInt(req.query.id);
        const study = studiesDatabase.find(s => s.id === studyId);
        
        if (!study) {
          return res.status(404).json({
            success: false,
            error: 'Study not found'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: study
        });

      case 'update-study':
        if (req.method !== 'PUT') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        
        const updateId = parseInt(req.query.id);
        const updateData = req.body;
        const studyIndex = studiesDatabase.findIndex(s => s.id === updateId);
        
        if (studyIndex === -1) {
          return res.status(404).json({
            success: false,
            error: 'Study not found'
          });
        }
        
        studiesDatabase[studyIndex] = {
          ...studiesDatabase[studyIndex],
          ...updateData,
          updated_at: new Date().toISOString()
        };
        
        return res.status(200).json({
          success: true,
          data: studiesDatabase[studyIndex],
          message: 'Study updated successfully'
        });

      case 'dashboard-analytics':
        const totalStudies = studiesDatabase.length;
        const activeStudies = studiesDatabase.filter(s => s.status === 'active').length;
        
        return res.status(200).json({
          success: true,
          data: {
            totalStudies,
            activeStudies,
            totalApplications: 0,
            completedSessions: 0,
            recentActivity: studiesDatabase.slice(-5).map(study => ({
              type: 'study_created',
              message: `Study "${study.title}" was created`,
              timestamp: study.created_at
            }))
          },
          timestamp: new Date().toISOString()
        });

      case 'get-block-types':
        return res.status(200).json({
          success: true,
          data: [
            { id: 'welcome-screen', name: 'Welcome Screen', category: 'introductory' },
            { id: 'open-question', name: 'Open Question', category: 'qualitative' },
            { id: 'multiple-choice', name: 'Multiple Choice', category: 'selection' },
            { id: 'thank-you', name: 'Thank You', category: 'closing' }
          ],
          total: 4
        });

      case 'health':
        return res.status(200).json({
          success: true,
          message: 'Research API is healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        });

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: [
            'create-study',
            'get-studies',
            'get-study',
            'update-study',
            'dashboard-analytics', 
            'get-block-types',
            'health'
          ]
        });
    }

  } catch (error) {
    console.error('❌ Research API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
