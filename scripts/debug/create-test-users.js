// Create test user profiles directly in the database
// This bypasses the need to manually register each account

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqofrqiqdkjnlxbxydrp.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUsers() {
  try {
    console.log('🚀 Creating test user profiles and point balances...\n');

    // Test users to create
    const testUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'abwanwr77+Researcher@gmail.com',
        first_name: 'Test',
        last_name: 'Researcher',
        role: 'researcher',
        initialPoints: 1000
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'abwanwr77+participant@gmail.com',
        first_name: 'Test',
        last_name: 'Participant',
        role: 'participant',
        initialPoints: 100
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'abwanwr77+admin@gmail.com',
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin',
        initialPoints: 5000
      }
    ];

    for (const user of testUsers) {
      console.log(`📧 Processing: ${user.email}`);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      let userId = user.id;

      if (existingProfile) {
        console.log(`✅ Profile already exists: ${existingProfile.first_name} ${existingProfile.last_name}`);
        userId = existingProfile.id;
      } else {
        // Create profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          console.log(`❌ Failed to create profile: ${profileError.message}`);
          continue;
        }

        console.log(`✅ Created profile: ${user.first_name} ${user.last_name} (${user.role})`);
      }

      // Check if points balance already exists
      const { data: existingBalance } = await supabase
        .from('points_balance')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingBalance) {
        console.log(`⚠️  Points balance already exists: ${existingBalance.available_points} points`);
        continue;
      }

      // Create points balance
      const { data: balance, error: balanceError } = await supabase
        .from('points_balance')
        .insert({
          user_id: userId,
          total_points: user.initialPoints,
          available_points: user.initialPoints,
          used_points: 0,
          expired_points: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (balanceError) {
        console.log(`❌ Failed to create balance: ${balanceError.message}`);
        continue;
      }

      // Create initial transaction record
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: userId,
          type: 'assigned',
          amount: user.initialPoints,
          balance: user.initialPoints,
          reason: 'Initial test account setup',
          assigned_by: userId, // Self-assigned for setup
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.log(`⚠️  Transaction creation failed: ${transactionError.message}`);
      }

      console.log(`✅ Created points balance: ${user.initialPoints} points\n`);
    }

    console.log('🎉 Test user setup complete!\n');
    console.log('📊 Next steps:');
    console.log('1. Refresh the admin points management page');
    console.log('2. You should now see users in the dropdown');
    console.log('3. You can assign additional points to any user');
    console.log('\n🔗 Admin interface: http://localhost:5175/app/admin/payments');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
createTestUsers();
