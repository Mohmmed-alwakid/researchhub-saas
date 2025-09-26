import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgobqlfqvmhvbjwagzca.supabase.co';
const supabaseServiceKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkApplication() {
  console.log('🔍 Checking application status...');
  
  try {
    // Check the specific application
    const { data: app, error } = await supabase
      .from('study_applications')
      .select('*')
      .eq('id', '3556e16c-50b0-4279-9831-3920739d632f')
      .single();
      
    if (error) {
      console.log('❌ Error fetching application:', error);
      return;
    }
    
    console.log('📄 Application data:', app);
    
    // Also check all applications for this participant
    const { data: allApps, error: allError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('participant_id', 'f0f57e6b-0ae6-4493-8906-fca7ad2ab0ca');
      
    if (allError) {
      console.log('❌ Error fetching all applications:', allError);
    } else {
      console.log('📋 All applications for participant:', allApps);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

checkApplication();
