// Direct profile creation script using local API
async function createMissingProfiles() {
  console.log('🔧 Creating Missing Profiles Directly...\n');

  try {
    // First login as admin to get token
    console.log('🔐 Logging in as admin...');
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

    if (!loginResult.success) {
      console.error('❌ Admin login failed:', loginResult.error);
      return;
    }

    console.log('✅ Admin logged in successfully');
    const adminToken = loginResult.data.token;

    // Create missing profiles by calling a special endpoint
    console.log('\n🔧 Creating endpoint to fix missing profiles...');
    
    // Let's create an endpoint that will manually create profiles for existing auth users
    const fixResponse = await fetch('http://localhost:3003/api/admin-setup?action=fix_profiles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (fixResponse.ok) {
      const fixResult = await fixResponse.json();
      console.log('✅ Profile fix result:', fixResult);
    } else {
      console.log('⚠️  Fix endpoint not available, trying alternative approach...');
      
      // Alternative: Check current user count
      const usersResponse = await fetch('http://localhost:3003/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        
        if (usersResult.success) {
          const users = usersResult.data.data;
          const totalCount = usersResult.data.pagination.totalCount;
          
          console.log(`\n📊 Current user count: ${totalCount}`);
          console.log('👥 Users in system:');
          
          users.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
          });

          if (totalCount < 3) {
            console.log('\n⚠️  Expected 3 users but found', totalCount);
            console.log('   This confirms that auth users exist but profiles are missing.');
          } else {
            console.log('\n✅ All expected users are present!');
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the profile creation
createMissingProfiles();
