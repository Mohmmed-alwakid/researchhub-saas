// GET /api/admin/payments/analytics - Get payment analytics
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

// Mock payment data for analytics calculation
const mockPaymentRequests = [
  { status: 'pending', amount: 29.99, requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { status: 'verified', amount: 99.99, requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { status: 'rejected', amount: 9.99, requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { status: 'pending', amount: 29.99, requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { status: 'verified', amount: 99.99, requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), processedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
];

// Calculate analytics from mock data
function calculatePaymentStats() {
  const totalRequests = mockPaymentRequests.length;
  const pendingRequests = mockPaymentRequests.filter(r => r.status === 'pending').length;
  const verifiedRequests = mockPaymentRequests.filter(r => r.status === 'verified').length;
  const rejectedRequests = mockPaymentRequests.filter(r => r.status === 'rejected').length;
  
  const totalRevenue = mockPaymentRequests
    .filter(r => r.status === 'verified')
    .reduce((sum, r) => sum + r.amount, 0);
  
  // Calculate this month's revenue (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const thisMonthRevenue = mockPaymentRequests
    .filter(r => r.status === 'verified' && r.processedAt && new Date(r.processedAt) > thirtyDaysAgo)
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    totalRequests,
    pendingRequests,
    verifiedRequests,
    rejectedRequests,
    totalRevenue,
    thisMonthRevenue
  };
}

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

    // Calculate and return analytics
    const stats = calculatePaymentStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Payment analytics error:', error);
    return res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
