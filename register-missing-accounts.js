// Script to register missing test accounts through the local API
async function registerMissingAccounts() {
  console.log('🚀 Registering Missing Test Accounts...\n');

  const testAccounts = [
    {
      email: 'abwanwr77+Researcher@gmail.com',
      password: 'Testtest123',
      firstName: 'Research',
      lastName: 'User',
      role: 'researcher'
    },
    {
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123',
      firstName: 'Participant',
      lastName: 'User',
      role: 'participant'
    }
  ];

  for (const account of testAccounts) {
    console.log(`📝 Registering ${account.email} as ${account.role}...`);

    try {
      const response = await fetch('http://localhost:3003/api/auth?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ ${account.email} registered successfully`);
      } else {
        console.log(`⚠️  ${account.email}: ${result.error || 'Registration failed'}`);
      }
    } catch (error) {
      console.error(`❌ Error registering ${account.email}:`, error.message);
    }

    console.log('');
  }

  // Now check how many users we have
  console.log('🔍 Checking user count via admin API...');
  
  try {
    // First login as admin to get token
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abwanwr77+admin@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginResult = await loginResponse.json();

    if (loginResult.success) {
      const token = loginResult.data.token;
      
      // Now fetch users with admin token
      const usersResponse = await fetch('http://localhost:3003/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const usersResult = await usersResponse.json();

      if (usersResult.success) {
        const users = usersResult.data.data;
        const totalCount = usersResult.data.pagination.totalCount;
        
        console.log(`✅ Total users in system: ${totalCount}`);
        console.log('\n👥 User List:');
        
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      } else {
        console.error('❌ Failed to fetch users:', usersResult.error);
      }
    } else {
      console.error('❌ Failed to login as admin:', loginResult.error);
    }
  } catch (error) {
    console.error('❌ Error checking user count:', error.message);
  }
}

// Run the registration
registerMissingAccounts();
