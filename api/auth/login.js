export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // For demo purposes, return a mock successful login
  // In production, this would validate against your database
  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: '1',
      email: email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'researcher'
    },
    token: 'mock-jwt-token-' + Date.now()
  });
}
