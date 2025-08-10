// Simplified test endpoint for debugging study creation issues
export default async function handler(req, res) {
  console.log('🔧 TEST: Study creation test endpoint called');
  console.log('🔧 TEST: Method:', req.method);
  console.log('🔧 TEST: Headers:', req.headers);
  console.log('🔧 TEST: Body:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    // Test authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization header'
      });
    }
    
    console.log('🔧 TEST: Auth header found');
    
    // Simple study creation without database
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description required'
      });
    }
    
    const testStudy = {
      id: `test-study-${Date.now()}`,
      title,
      description,
      status: 'active',
      created_at: new Date().toISOString(),
      researcher_id: 'test-researcher-001'
    };
    
    console.log('✅ TEST: Study created successfully:', testStudy);
    
    return res.status(201).json({
      success: true,
      study: testStudy,
      message: 'Test study created successfully',
      source: 'test-endpoint'
    });
    
  } catch (error) {
    console.error('🔧 TEST: Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Test endpoint error',
      debug: error.stack
    });
  }
}
