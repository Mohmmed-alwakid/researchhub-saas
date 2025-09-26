// Check what users exist in the database
// This will help us understand the current user situation

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqofrqiqdkjnlxbxydrp.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users in profiles table...\n');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('📭 No users found in profiles table.');
      console.log('\n💡 To create test users, you need to:');
      console.log('1. Start the development server: npm run dev:fullstack');
      console.log('2. Visit http://localhost:5175');
      console.log('3. Register with the test accounts:');
      console.log('   - abwanwr77+Researcher@gmail.com / Testtest123');
      console.log('   - abwanwr77+participant@gmail.com / Testtest123');  
      console.log('   - abwanwr77+admin@gmail.com / Testtest123');
      console.log('4. Then run this points initialization script again');
      return;
    }

    console.log(`✅ Found ${profiles.length} users in profiles table:\n`);

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.first_name} ${profile.last_name}`);
      console.log(`   📧 Email: ${profile.email}`);
      console.log(`   👤 Role: ${profile.role}`);
      console.log(`   📅 Created: ${new Date(profile.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // Check if any have point balances
    console.log('💰 Checking existing point balances...\n');

    const { data: balances, error: balanceError } = await supabase
      .from('points_balance')
      .select('*, profile:profiles!points_balance_user_id_fkey(first_name, last_name, email)')
      .order('available_points', { ascending: false });

    if (balanceError) {
      console.error('❌ Error fetching balances:', balanceError);
      return;
    }

    if (!balances || balances.length === 0) {
      console.log('📭 No point balances found.');
      console.log('\n🎯 Next steps:');
      console.log('1. Run the initialization script to create balances');
      console.log('2. Or use the admin interface to assign points manually');
      return;
    }

    console.log(`✅ Found ${balances.length} users with point balances:\n`);

    balances.forEach((balance, index) => {
      console.log(`${index + 1}. ${balance.profile.first_name} ${balance.profile.last_name}`);
      console.log(`   💰 Available: ${balance.available_points} points`);
      console.log(`   📊 Total: ${balance.total_points} points`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkUsers();
