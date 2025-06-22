/**
 * Fix Participant Profile - Ensure profiles table has participant record
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
// Use service role key to bypass RLS
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.T_BgBdEUbT4vhrmCDRe3o3sQRbVyJTvCmZvQTqZcOYU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixParticipantProfile() {
  const userId = '9876c870-79e9-4106-99d6-9080049ec2aa';
  const email = 'abwanwr77+participant@gmail.com';
  
  console.log('🔍 Checking participant profile...');
  
  // First, check if profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  console.log('📋 Profile check result:', { existingProfile, checkError });
  
  if (checkError && checkError.code === 'PGRST116') {
    // Profile doesn't exist, create it
    console.log('📝 Creating participant profile...');
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        first_name: 'participant',
        last_name: 'tester',
        role: 'participant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (createError) {
      console.error('❌ Failed to create profile:', createError);
      return false;
    }
    
    console.log('✅ Profile created successfully:', newProfile);
    return true;
  } else if (existingProfile) {
    console.log('✅ Profile already exists:', existingProfile);
    
    // Update role if needed
    if (existingProfile.role !== 'participant') {
      console.log('🔄 Updating role to participant...');
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'participant',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('*')
        .single();
      
      if (updateError) {
        console.error('❌ Failed to update role:', updateError);
        return false;
      }
      
      console.log('✅ Role updated successfully:', updatedProfile);
    }
    
    return true;
  } else {
    console.error('❌ Unexpected error checking profile:', checkError);
    return false;
  }
}

// Fix researcher profile too
async function fixResearcherProfile() {
  const researcherUserId = '3f53aaf8-4411-46b9-bb9e-5b4b6dc717c1'; // Researcher user ID
  const email = 'abwanwr77+Researcher@gmail.com';
  
  console.log('🔍 Checking researcher profile...');
  
  // First, check if profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', researcherUserId)
    .single();
  
  console.log('📋 Researcher profile check result:', { existingProfile, checkError });
  
  if (checkError && checkError.code === 'PGRST116') {
    // Profile doesn't exist, create it
    console.log('📝 Creating researcher profile...');
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: researcherUserId,
        email: email,
        first_name: 'Researcher',
        last_name: 'Tester',
        role: 'researcher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (createError) {
      console.error('❌ Failed to create researcher profile:', createError);
      return false;
    }
    
    console.log('✅ Researcher profile created successfully:', newProfile);
    return true;
  } else if (existingProfile) {
    console.log('✅ Researcher profile already exists:', existingProfile);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🚀 FIXING PARTICIPANT AND RESEARCHER PROFILES');
  console.log('=' .repeat(60));
  
  const participantFixed = await fixParticipantProfile();
  const researcherFixed = await fixResearcherProfile();
  
  if (participantFixed && researcherFixed) {
    console.log('\n✅ ALL PROFILES FIXED SUCCESSFULLY!');
    console.log('🎯 Ready to test complete workflow');
  } else {
    console.log('\n❌ Some profiles could not be fixed');
  }
}

main();
