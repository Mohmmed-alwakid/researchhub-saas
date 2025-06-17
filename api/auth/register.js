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

  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  // For demo purposes, return a mock successful registration
  // In production, this would save to your database
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: {
      id: Date.now().toString(),
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: 'researcher'
    },
    token: 'mock-jwt-token-' + Date.now()
  });
}
