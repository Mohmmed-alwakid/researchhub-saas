/**
 * Check the studies table structure
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudiesTableStructure() {
  console.log('🔍 Checking studies table structure...\n');

  // Get a study to see its structure
  const { data: study, error } = await supabase
    .from('studies')
    .select('*')
    .eq('id', '6a9957f2-cbab-4013-a149-f02232b3ee9f')
    .single();

  if (error) {
    console.error('❌ Error fetching study:', error);
    return;
  }

  console.log('✅ Study found:');
  console.log('Columns available:', Object.keys(study));
  console.log('Full study data:', JSON.stringify(study, null, 2));
}

checkStudiesTableStructure().catch(console.error);
