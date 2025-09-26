// Create payment_requests table migration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPaymentRequestsTable() {
  console.log('🏗️ Creating payment_requests table...');
  
  try {
    // Create the table using direct SQL execution
    const { data, error } = await supabase
      .from('payment_requests')
      .select('id')
      .limit(1);
      
    if (error && error.code === '42P01') {
      // Table doesn't exist, let's create it
      console.log('Table does not exist, creating it...');
      
      // We'll create it via a different method since we can't execute DDL directly
      // Let's try the Supabase REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: `
            CREATE TABLE IF NOT EXISTS payment_requests (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
              plan_type VARCHAR(50) NOT NULL DEFAULT 'basic',
              amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
              currency VARCHAR(3) NOT NULL DEFAULT 'USD',
              status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
              payment_method VARCHAR(100),
              payment_proof_url TEXT,
              admin_notes TEXT,
              requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              processed_at TIMESTAMP WITH TIME ZONE,
              processed_by UUID REFERENCES profiles(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
            CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
            CREATE INDEX IF NOT EXISTS idx_payment_requests_requested_at ON payment_requests(requested_at);
            
            ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
          `
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      console.log('✅ Successfully created payment_requests table');
    } else if (!error) {
      console.log('✅ payment_requests table already exists');
    } else {
      throw error;
    }
    
    // Now insert some sample data
    await insertSampleData();
    
    return true;
  } catch (err) {
    console.error('❌ Error creating payment_requests table:', {
      message: err.message,
      details: err.toString(),
      hint: err.hint || '',
      code: err.code || ''
    });
    return false;
  }
}

async function insertSampleData() {
  console.log('📝 Inserting sample payment requests...');
  
  // Get existing user IDs from profiles table
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(3);
    
  if (usersError || !users || users.length === 0) {
    console.log('⚠️ No users found, skipping sample data insertion');
    return;
  }
  
  const sampleRequests = [
    {
      user_id: users[0]?.id,
      plan_type: 'pro',
      amount: 29.99,
      currency: 'USD',
      status: 'pending',
      payment_method: 'Bank Transfer',
      payment_proof_url: 'https://example.com/proof1.pdf',
      admin_notes: '',
      requested_at: new Date(Date.now() - 86400000).toISOString()
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
      requested_at: new Date(Date.now() - 172800000).toISOString(),
      processed_at: new Date(Date.now() - 86400000).toISOString()
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
      requested_at: new Date(Date.now() - 259200000).toISOString(),
      processed_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  const { data, error } = await supabase
    .from('payment_requests')
    .insert(sampleRequests);
    
  if (error) {
    console.error('❌ Error inserting sample data:', error);
  } else {
    console.log('✅ Successfully inserted sample payment requests');
  }
}

// Run the migration
createPaymentRequestsTable()
  .then(success => {
    if (success) {
      console.log('🎉 Payment requests table migration completed successfully!');
    } else {
      console.log('❌ Payment requests table migration failed');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Migration crashed:', err);
    process.exit(1);
  });
