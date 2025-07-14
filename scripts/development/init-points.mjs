/**
 * Initialize Points for Test Accounts
 * Sets up realistic point balances for the 3 mandatory test accounts
 * 
 * Run this script to initialize the points system with test data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.1wTJ6FZJeIXNj-ZRF3Q1hVBGpuW4pC2YB8l2QzF_YGs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test account configurations
const TEST_ACCOUNTS = [
  {
    email: 'abwanwr77+researcher@gmail.com',
    role: 'researcher',
    initialPoints: 1000,
    description: 'Main researcher test account'
  },
  {
    email: 'abwanwr77+participant@gmail.com', 
    role: 'participant',
    initialPoints: 0, // Participants earn points, don't start with them
    description: 'Participant test account'
  },
  {
    email: 'abwanwr77+admin@gmail.com',
    role: 'admin', 
    initialPoints: 9999,
    description: 'Admin test account with unlimited points'
  }
];

async function initializePointsForTestAccounts() {
  console.log('🚀 Initializing Points for Test Accounts...\n');

  for (const account of TEST_ACCOUNTS) {
    try {
      console.log(`📧 Processing: ${account.email}`);
      
      // Find user by email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error(`   ❌ Error fetching users:`, userError.message);
        continue;
      }

      const user = users.users.find(u => u.email === account.email);
      
      if (!user) {
        console.log(`   ⚠️  User not found. Account may need to be created first.`);
        continue;
      }

      console.log(`   ✅ Found user: ${user.id}`);

      // Initialize or update points balance
      const { data: existingBalance, error: balanceError } = await supabase
        .from('points_balance')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error(`   ❌ Error checking balance:`, balanceError.message);
        continue;
      }

      if (existingBalance) {
        // Update existing balance
        const { error: updateError } = await supabase
          .from('points_balance')
          .update({
            total_points: account.initialPoints,
            available_points: account.initialPoints,
            used_points: 0,
            expired_points: 0,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error(`   ❌ Error updating balance:`, updateError.message);
          continue;
        }

        console.log(`   🔄 Updated balance: ${account.initialPoints} points`);
      } else {
        // Create new balance
        const { error: insertError } = await supabase
          .from('points_balance')
          .insert({
            user_id: user.id,
            total_points: account.initialPoints,
            available_points: account.initialPoints,
            used_points: 0,
            expired_points: 0
          });

        if (insertError) {
          console.error(`   ❌ Error creating balance:`, insertError.message);
          continue;
        }

        console.log(`   ✨ Created new balance: ${account.initialPoints} points`);
      }

      // Add initial transaction record
      if (account.initialPoints > 0) {
        const { error: transactionError } = await supabase
          .from('points_transactions')
          .insert({
            user_id: user.id,
            type: 'admin_assigned',
            amount: account.initialPoints,
            description: `Initial ${account.role} account setup`,
            assigned_by: user.id, // Self-assigned for setup
            expires_at: null // No expiration for initial setup
          });

        if (transactionError) {
          console.log(`   ⚠️  Transaction record failed (non-critical):`, transactionError.message);
        } else {
          console.log(`   📝 Created transaction record`);
        }
      }

      console.log(`   ✅ ${account.description}: ${account.initialPoints} points\n`);

    } catch (error) {
      console.error(`   ❌ Unexpected error for ${account.email}:`, error.message);
    }
  }

  console.log('🎉 Points initialization complete!');
  console.log('\n📋 Test Account Summary:');
  console.log('   • Researcher: 1000 points (for study creation testing)');
  console.log('   • Participant: 0 points (will earn through studies)'); 
  console.log('   • Admin: 9999 points (unlimited for testing)');
  console.log('\n🧪 Ready for real points system testing!');
}

// Run the initialization
initializePointsForTestAccounts().catch(console.error);
