/**
 * STUDIES API PROXY
 * Redirects /api/studies requests to research-consolidated API
 * This maintains compatibility with existing client code
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`=== STUDIES API PROXY ===`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`Query:`, req.query);
    console.log(`Body:`, req.body);

    // Parse the URL to extract study ID if present
    const urlParts = req.url.split('/');
    const studyId = urlParts[urlParts.length - 1] !== 'studies' ? urlParts[urlParts.length - 1] : null;

    // Determine the action based on method and path
    let action = '';
    let modifiedBody = req.body;
    
    if (req.method === 'GET') {
      action = 'get-studies';
      // Don't return mock data - proxy to research-consolidated
    } else if (req.method === 'POST') {
      action = 'create-study';
    } else if (req.method === 'PUT') {
      action = 'update-study';
      // Add study ID to body for update operations
      if (studyId) {
        modifiedBody = {
          ...req.body,
          studyId: studyId,
          id: studyId
        };
      }
    } else if (req.method === 'DELETE') {
      action = 'delete-study';
      // Create body with study ID for delete operations
      modifiedBody = {
        studyId: studyId,
        id: studyId
      };
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    // Import and call the research-consolidated handler
    const { default: researchHandler } = await import('./research-consolidated.js');
    
    // Create new request object with action parameter and modified body
    const modifiedReq = {
      ...req,
      body: modifiedBody,
      query: {
        ...req.query,
        action: action
      }
    };

    console.log(`Proxying to research-consolidated with action: ${action}, studyId: ${studyId}`);
    
    // Call the research-consolidated handler
    return await researchHandler(modifiedReq, res);
    
  } catch (error) {
    console.error('Studies proxy error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
