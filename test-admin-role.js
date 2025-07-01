// Test admin role checking
import { createClient } from '@supabase/supabase-js';

async function testAdminRole() {
  console.log('🔍 Testing Admin Role Access...\n');
  
  const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.o2wPqRq5wgQTmfCL4wRLcCN8uVG91xwwLBZS2CGlsD8';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Check admin user profile
  const adminUserId = '6ce4a8f6-6012-40d7-a56f-355730ded8ad';
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', adminUserId)
    .single();
    
  if (error) {
    console.log('❌ Error fetching profile:', error);
    return;
  }
  
  console.log('👤 Admin user profile:', profile);
  console.log('🎭 Role value:', profile?.role);
  console.log('🔍 Role type:', typeof profile?.role);
  console.log('✅ Is admin?', profile?.role === 'admin');
  
  // Also check auth.users metadata
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(adminUserId);
  
  if (userError) {
    console.log('❌ Error fetching user:', userError);
    return;
  }
  
  console.log('\\n🔐 Auth user metadata:', user.user?.user_metadata);
  console.log('🎭 Auth role:', user.user?.user_metadata?.role);
}

testAdminRole().catch(console.error);
