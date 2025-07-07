import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findEcommerceStudy() {
  console.log('🔍 Looking for E-commerce Checkout Process Study...\n');
  
  try {
    const { data: studies, error } = await supabase
      .from('studies')
      .select('*')
      .ilike('title', '%E-commerce%')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching studies:', error);
      return;
    }
    
    console.log(`✅ Found ${studies.length} E-commerce studies:`);
    studies.forEach((study, index) => {
      console.log(`\n${index + 1}. "${study.title}"`);
      console.log(`   ID: ${study.id}`);
      console.log(`   Status: ${study.status}`);
      console.log(`   Is Public: ${study.is_public}`);
      console.log(`   Researcher: ${study.researcher_id}`);
      console.log(`   Created: ${study.created_at}`);
      
      // Check if it meets public criteria
      const isPublic = study.status === 'active' && study.is_public === true;
      console.log(`   Will appear in public studies: ${isPublic ? '✅ YES' : '❌ NO'}`);
      
      if (!isPublic) {
        console.log('   Issues:');
        if (study.status !== 'active') {
          console.log(`     - Status is "${study.status}" (needs "active")`);
        }
        if (study.is_public !== true) {
          console.log(`     - is_public is "${study.is_public}" (needs true)`);
        }
      }
    });
    
    // Fix the first E-commerce study if found
    if (studies.length > 0) {
      const study = studies[0];
      const needsUpdate = study.status !== 'active' || study.is_public !== true;
      
      if (needsUpdate) {
        console.log(`\n🔧 Fixing study "${study.title}" to make it public...`);
        
        const { data: updatedStudy, error: updateError } = await supabase
          .from('studies')
          .update({
            status: 'active',
            is_public: true
          })
          .eq('id', study.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Error updating study:', updateError);
          return;
        }
        
        console.log('✅ Study updated successfully!');
        console.log(`   New Status: ${updatedStudy.status}`);
        console.log(`   New Is Public: ${updatedStudy.is_public}`);
        console.log(`   Study ID: ${updatedStudy.id}`);
      } else {
        console.log(`\n✅ Study "${study.title}" is already properly configured for public access.`);
        console.log(`   Study ID: ${study.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

findEcommerceStudy();
