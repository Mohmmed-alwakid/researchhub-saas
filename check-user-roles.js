// Check user roles in Supabase database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.8uf_3CJODn75Vw0ksQ36r2D9s2JC8pKY6uHLl9O_SdM'; // Service role key

async function checkUserRoles() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('=== CHECKING USER ROLES ===\n');
  
  try {
    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    
    console.log('All user profiles:');
    profiles.forEach(profile => {
      console.log(`- ${profile.email}: ${profile.role} (ID: ${profile.id})`);
    });
    
    // Check specific test users
    const testEmails = [
      'abwanwr77+participant@gmail.com',
      'abwanwr77+Researcher@gmail.com', 
      'abwanwr77+admin@gmail.com'
    ];
    
    console.log('\n=== TEST USER ROLES ===');
    for (const email of testEmails) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profile) {
        console.log(`${email}: ${profile.role} (should be ${email.includes('participant') ? 'participant' : email.includes('Researcher') ? 'researcher' : 'admin'})`);
      } else {
        console.log(`${email}: NO PROFILE FOUND`);
      }
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkUserRoles();
