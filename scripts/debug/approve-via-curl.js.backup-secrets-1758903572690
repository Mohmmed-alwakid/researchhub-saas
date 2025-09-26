// Simple database update script for local testing
import { exec } from 'child_process';

console.log('🔧 Attempting to approve application via local database update...');

// Try to update via direct SQL command
const updateCommand = `curl -X PATCH "https://cgobqlfqvmhvbjwagzca.supabase.co/rest/v1/study_applications?id=eq.3556e16c-50b0-4279-9831-3920739d632f" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb2JxbGZxdm1odmJqd2FnemNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk5MjkzOCwiZXhwIjoyMDQ5NTY4OTM4fQ.lzNLcBWm8Vd8Z94IhCeaSmOdFa9l3YI2c6Jp_Xj1PuY" -H "Content-Type: application/json" -d '{"status": "approved"}'`;

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
