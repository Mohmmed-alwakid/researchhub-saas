import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ktbucslvjqbdpakpgtzp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YnVjc2x2anFiZHBha3BndHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU3MjY0NywiZXhwIjoyMDUxMTQ4NjQ3fQ.T4vyC8K8xWHsB0vIlK7F3xkHaA9lh1V5MNiKg-TgFZw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPaymentRequestsTable() {
  console.log('🚀 Creating payment_requests table...');

  try {
    // Since we can't create tables via Supabase JS, let's just insert sample data
    // The table should be created via Supabase dashboard or SQL editor
    
    console.log('ℹ️ Note: Tables should be created via Supabase dashboard first');
    console.log('📝 Inserting sample payment requests...');
    
    // Get some existing user IDs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(3);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return false;
    }

    if (users && users.length > 0) {
      // Check if payment_requests table exists by trying to select from it
      const { data: existingRequests, error: tableError } = await supabase
        .from('payment_requests')
        .select('id')
        .limit(1);

      if (tableError) {
        console.log('ℹ️ payment_requests table does not exist yet');
        console.log('📋 Please create the table in Supabase dashboard with this SQL:');
        console.log(`
-- Create payment_requests table
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  payment_method TEXT NOT NULL,
  payment_proof_url TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
  expires_at TIMESTAMP WITH TIME ZONE,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
        return false;
      }

      // Table exists, insert sample data
      const sampleRequests = [
        {
          user_id: users[0]?.id,
          plan_type: 'pro',
          amount: 29.99,
          currency: 'USD',
          status: 'pending',
          payment_method: 'Bank Transfer',
          payment_proof_url: 'https://example.com/proof1.pdf',
          requested_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          user_id: users[1]?.id || users[0]?.id,
          plan_type: 'enterprise',
          amount: 99.99,
          currency: 'USD',
          status: 'verified',
          payment_method: 'PayPal',
          payment_proof_url: 'https://example.com/proof2.pdf',
          admin_notes: 'Payment verified successfully',
          requested_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          processed_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          user_id: users[2]?.id || users[0]?.id,
          plan_type: 'basic',
          amount: 9.99,
          currency: 'USD',
          status: 'rejected',
          payment_method: 'Credit Card',
          payment_proof_url: 'https://example.com/proof3.pdf',
          admin_notes: 'Insufficient payment proof',
          requested_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          processed_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];

      const { error: insertError } = await supabase
        .from('payment_requests')
        .insert(sampleRequests);

      if (insertError) {
        console.error('❌ Error inserting sample data:', insertError);
        return false;
      } else {
        console.log('✅ Sample payment requests inserted successfully');
        return true;
      }
    } else {
      console.log('❌ No users found to create sample payment requests');
      return false;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Run the migration
createPaymentRequestsTable()
  .then((success) => {
    if (success) {
      console.log('🎉 Payment management migration completed successfully!');
    } else {
      console.log('❌ Payment management migration failed');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration error:', error);
    process.exit(1);
  });
