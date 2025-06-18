// Simplified registration with detailed error logging
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('Registration attempt started');
    
    const { email, password, firstName, lastName, role = 'researcher' } = req.body;
    console.log('Request body parsed:', { email, firstName, lastName, role });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format');
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    console.log('Basic validation passed');

    // Check environment variables
    const hasMongoUri = !!process.env.MONGODB_URI;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    console.log('Environment check:', { hasMongoUri, hasJwtSecret });

    // For now, let's return a success response without actually saving to database
    // This will help us test if the endpoint structure works
    const mockUser = {
      id: 'test_' + Date.now(),
      email: email.toLowerCase(),
      firstName,
      lastName,
      role,
      status: 'active',
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    };

    console.log('Mock user created:', mockUser);

    res.status(201).json({
      success: true,
      message: 'User registration test successful (no database save)',
      user: mockUser,
      tokens: {
        authToken: 'test_token_' + Date.now(),
        refreshToken: 'test_refresh_' + Date.now()
      },
      test: true,
      environment: {
        hasMongoUri,
        hasJwtSecret,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack
      }
    });
  }
}
