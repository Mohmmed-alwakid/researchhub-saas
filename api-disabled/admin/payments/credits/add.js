// POST /api/admin/payments/credits/add - Add credits manually
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

// Helper function to verify admin access
async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const { data: { user }, error: authError } = await authenticatedSupabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Invalid token');
  }

  // Check admin role
  const userRole = user.user_metadata?.role;
  if (userRole === 'admin' || userRole === 'super_admin') {
    return user;
  }

  const { data: profile } = await authenticatedSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Access denied. Admin role required.');
  }

  return user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Verify admin access
    await verifyAdmin(req);

    const { email, credits, planType, expiresAt } = req.body;
    
    console.log('Request body:', req.body);

    if (!email || !credits || credits <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Email and valid credits amount are required'
      });
    }

    // Refactor email validation logic to ensure strict enforcement
    if (!email || typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.error('Validation failed: Invalid email format detected:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    console.log('Email validation logic reached. Email:', email);
    console.log('Credits:', credits);
    console.log('Plan Type:', planType);
    console.log('Expires At:', expiresAt);

    // Validate plan type
    const validPlanTypes = ['basic', 'pro', 'enterprise'];
    if (planType && !validPlanTypes.includes(planType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type. Must be basic, pro, or enterprise'
      });
    }

    console.log('Validation check: Email is', email, 'Credits are', credits);

    // Check if user exists first
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('email', email)
        .single();

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User not found with this email address'
        });
      }

      // Update user's credits in the database
      const { error: updateError } = await supabase
        .from('credits')
        .upsert({
          user_id: userProfile.id,
          credits: credits,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update credits in the database'
        });
      }

      // Log the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userProfile.id,
          credits_added: credits,
          plan_type: planType || 'current',
          expires_at: expiresAt || null,
          added_by: 'admin', // Replace with authenticated admin user ID
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
        return res.status(500).json({
          success: false,
          error: 'Failed to log the transaction'
        });
      }

      console.log(`Adding ${credits} credits to user ${email} (${userProfile.first_name} ${userProfile.last_name}) with plan ${planType || 'current'}`);

      // For now, simulate adding credits
      const response = {
        success: true,
        data: {
          message: `Successfully added ${credits} credits to ${userProfile.first_name} ${userProfile.last_name} (${email})`,
          user: {
            id: userProfile.id,
            email: userProfile.email,
            name: `${userProfile.first_name} ${userProfile.last_name}`
          },
          creditsAdded: credits,
          planType: planType || 'current',
          expiresAt: expiresAt || null,
          addedAt: new Date().toISOString(),
          addedBy: 'admin' // In real app, get from authenticated admin user
        }
      };

      return res.status(200).json(response);

    } catch (dbError) {
      console.error('Database error when adding credits:', dbError);
      return res.status(404).json({
        success: false,
        error: 'User not found with this email address'
      });
    }
    
  } catch (error) {
    console.error('Add credits error:', error);
    return res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
