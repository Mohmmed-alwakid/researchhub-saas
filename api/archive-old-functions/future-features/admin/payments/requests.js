import { createClient } from '@supabase/supabase-js';


// GET /api/admin/payments/requests - Get all payment requests
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';
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

// Mock payment data - In production, this would come from database tables
const mockPaymentRequests = [
  {
    _id: 'payment_001',
    userId: {
      _id: 'user_001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com'
    },
    planType: 'pro',
    amount: 29.99,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'Bank Transfer',
    paymentProofUrl: 'https://example.com/proof1.jpg',
    adminNotes: '',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    processedAt: null,
    processedBy: null
  },
  {
    _id: 'payment_002',
    userId: {
      _id: 'user_002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com'
    },
    planType: 'enterprise',
    amount: 99.99,
    currency: 'USD',
    status: 'verified',
    paymentMethod: 'Wire Transfer',
    paymentProofUrl: 'https://example.com/proof2.pdf',
    adminNotes: 'Payment verified via bank statement',
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    processedBy: {
      _id: 'admin_001',
      firstName: 'Admin',
      lastName: 'User'
    }
  },
  {
    _id: 'payment_003',
    userId: {
      _id: 'user_003',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@startup.io'
    },
    planType: 'basic',
    amount: 9.99,
    currency: 'USD',
    status: 'rejected',
    paymentMethod: 'PayPal',
    paymentProofUrl: 'https://example.com/proof3.png',
    adminNotes: 'Insufficient proof of payment',
    requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    processedBy: {
      _id: 'admin_001',
      firstName: 'Admin',
      lastName: 'User'
    }
  },
  {
    _id: 'payment_004',
    userId: {
      _id: 'user_004',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@research.edu'
    },
    planType: 'pro',
    amount: 29.99,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'Cryptocurrency',
    paymentProofUrl: 'https://example.com/proof4.jpg',
    adminNotes: '',
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    processedAt: null,
    processedBy: null
  },
  {
    _id: 'payment_005',
    userId: {
      _id: 'user_005',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@agency.com'
    },
    planType: 'enterprise',
    amount: 99.99,
    currency: 'USD',
    status: 'verified',
    paymentMethod: 'Bank Transfer',
    paymentProofUrl: 'https://example.com/proof5.pdf',
    adminNotes: 'Large enterprise client - priority processing',
    requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    processedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    processedBy: {
      _id: 'admin_001',
      firstName: 'Admin',
      lastName: 'User'
    }
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Verify admin access
    await verifyAdmin(req);

    // Return payment requests
    return res.status(200).json({
      success: true,
      data: mockPaymentRequests
    });
    
  } catch (error) {
    console.error('Payment requests error:', error);
    return res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
