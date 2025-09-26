// Initialize point balances for test users
// Run this script to set up initial point balances for our test accounts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqofrqiqdkjnlxbxydrp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxb2ZycWlxZGtqbmx4Ynh5ZHJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU1MTEzOCwiZXhwIjoyMDUxMTI3MTM4fQ.qvYQ52tQjpT9F8A6WLEkFyGGhQyOIDcfDhTNdD4pK5c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeTestPoints() {
  try {
    console.log('🚀 Initializing test user point balances...');

    // Test user emails
    const testUsers = [
      'abwanwr77+Researcher@gmail.com',
      'abwanwr77+participant@gmail.com', 
      'abwanwr77+admin@gmail.com'
    ];

    for (const email of testUsers) {
      console.log(`\n📧 Processing user: ${email}`);

      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.role})`);

      // Check if balance already exists
      const { data: existingBalance } = await supabase
        .from('points_balance')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingBalance) {
        console.log(`⚠️  Balance already exists: ${existingBalance.available_points} points`);
        continue;
      }

      // Create initial balance based on role
      let initialPoints = 0;
      if (user.role === 'researcher') {
        initialPoints = 1000; // Researchers get 1000 points to start
      } else if (user.role === 'admin') {
        initialPoints = 5000; // Admins get more points
      } else {
        initialPoints = 100; // Participants get some points
      }

      // Create points balance
      const { data: balance, error: balanceError } = await supabase
        .from('points_balance')
        .insert({
          user_id: user.id,
          total_points: initialPoints,
          available_points: initialPoints,
          used_points: 0,
          expired_points: 0
        })
        .select()
        .single();

      if (balanceError) {
        console.log(`❌ Failed to create balance: ${balanceError.message}`);
        continue;
      }

      // Create initial transaction record
      await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          type: 'assigned',
          amount: initialPoints,
          balance: initialPoints,
          reason: 'Initial test account balance',
          assigned_by: user.id // Self-assigned for initialization
        });

      console.log(`✅ Created balance: ${initialPoints} points`);
    }

    console.log('\n🎉 Test point initialization complete!');
    console.log('\n📊 You can now:');
    console.log('1. Visit http://localhost:5175/app/admin/payments');
    console.log('2. Click the "Points Management" tab');
    console.log('3. See all users in the dropdown');
    console.log('4. Assign additional points to any user');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
  }
}

// Run the initialization
initializeTestPoints();
