/**
 * EMERGENCY LOCAL AUTH FOR DEVELOPMENT
 * Use when Supabase is unreachable due to network issues
 */

export default function localAuthHandler(req, res) {
  const { method, url } = req;
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const action = urlParams.get('action');

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (action === 'login' && method === 'POST') {
    const { email, password } = req.body;

    // Test accounts for local development
    const testAccounts = {
      'abwanwr77+researcher@gmail.com': {
        id: 'local-researcher',
        role: 'researcher',
        name: 'Test Researcher',
        password: 'Testtest123'
      },
      'abwanwr77+participant@gmail.com': {
        id: 'local-participant',
        role: 'participant',
        name: 'Test Participant',
        password: 'Testtest123'
      },
      'abwanwr77+admin@gmail.com': {
        id: 'local-admin',
        role: 'admin',
        name: 'Test Admin',
        password: 'Testtest123'
      }
    };

    const account = testAccounts[email];

    if (account && account.password === password) {
      console.log('✅ LOCAL AUTH SUCCESS:', email);

      const fakeToken = `local-${account.id}-${Date.now()}`;

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: account.id,
            email: email,
            role: account.role,
            name: account.name,
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {
              name: account.name,
              role: account.role
            }
          },
          session: {
            access_token: fakeToken,
            refresh_token: `refresh-${fakeToken}`,
            expires_in: 3600,
            token_type: 'bearer'
          }
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  if (action === 'verify' && method === 'POST') {
    // For local development, accept any token
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: 'local-user',
          email: 'local@test.com',
          role: 'researcher'
        }
      }
    });
  }

  return res.status(404).json({
    success: false,
    error: 'Local auth endpoint not found'
  });
}
