// Manual email confirmation endpoint for testing (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('=== MANUAL EMAIL CONFIRMATION ===');
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log('Confirming email for:', email);

    // Note: This is a testing endpoint. In production, email confirmation 
    // would be handled through Supabase's built-in email confirmation flow
    
    // For now, we'll update the user's email_confirmed_at field manually
    // This requires admin privileges, so we'll use the service role key in production
    
    res.status(200).json({
      success: true,
      message: 'Email confirmation endpoint ready',
      note: 'In production, use Supabase dashboard to manually confirm emails or set up proper SMTP',
      email: email,
      instructions: [
        '1. Go to Supabase Dashboard → Authentication → Users',
        '2. Find user with email: ' + email,
        '3. Click "..." → "Confirm email"',
        '4. User can then login successfully'
      ]
    });

  } catch (error) {
    console.error('=== EMAIL CONFIRMATION ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: 'Email confirmation failed',
      message: error.message
    });
  }
}
