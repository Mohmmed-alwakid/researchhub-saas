// Simple database update script for local testing
import { exec } from 'child_process';

console.log('🔧 Attempting to approve application via local database update...');

// Try to update via direct SQL command
const updateCommand = `curl -X PATCH "https://cgobqlfqvmhvbjwagzca.supabase.co/rest/v1/study_applications?id=eq.3556e16c-50b0-4279-9831-3920739d632f" -H "apikey: 'PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'" -H "Content-Type: application/json" -d '{"status": "approved"}'`;

exec(updateCommand, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Command error:', error);
    return;
  }
  
  if (stderr) {
    console.log('⚠️ Command stderr:', stderr);
  }
  
  console.log('✅ Command stdout:', stdout);
  console.log('📝 Application should now be approved!');
});
