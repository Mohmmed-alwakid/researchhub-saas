// Direct database check for edit study issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hxdgjmzxgpwcfkwxcjkt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGdqbXp4Z3B3Y2Zrd3hjamt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUxMTM3MCwiZXhwIjoyMDUwMDg3MzcwfQ.xdQcFXoJYWIcjOyNgBQpf3PXMHM_1nrQdlJLp5qOYdw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudiesInDatabase() {
    console.log('🔍 Checking studies in database...');
    
    try {
        // Get all studies
        const { data: studies, error } = await supabase
            .from('studies')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error fetching studies:', error);
            return;
        }
        
        console.log(`✅ Found ${studies.length} studies in database`);
        
        if (studies.length > 0) {
            studies.forEach((study, index) => {
                console.log(`\n--- Study ${index + 1} ---`);
                console.log('ID:', study.id);
                console.log('Title:', study.title || 'EMPTY/NULL');
                console.log('Description:', study.description || 'EMPTY/NULL'); 
                console.log('Type:', study.type || 'EMPTY/NULL');
                console.log('Researcher ID:', study.researcher_id);
                console.log('Status:', study.status);
                console.log('Created:', study.created_at);
                console.log('Settings:', study.settings ? 'Present' : 'NULL');
                if (study.settings) {
                    console.log('Settings keys:', Object.keys(study.settings));
                }
            });
        }
        
    } catch (error) {
        console.error('💥 Database connection error:', error);
    }
}

checkStudiesInDatabase();
