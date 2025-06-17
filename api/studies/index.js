export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Return sample studies data for now
      const studies = [
        {
          id: '1',
          title: 'Website Navigation Study',
          status: 'active',
          participants: 15,
          completionRate: 87,
          createdAt: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'Mobile App Usability Test',
          status: 'draft',
          participants: 0,
          completionRate: 0,
          createdAt: new Date().toISOString()
        }
      ];

      res.status(200).json({
        success: true,
        studies,
        total: studies.length,
        message: 'Studies retrieved successfully'
      });
    } else if (req.method === 'POST') {
      // Handle study creation
      const { title, description, type } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }

      const newStudy = {
        id: Date.now().toString(),
        title,
        description: description || '',
        type: type || 'usability',
        status: 'draft',
        participants: 0,
        completionRate: 0,
        createdAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        study: newStudy,
        message: 'Study created successfully'
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Studies API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
