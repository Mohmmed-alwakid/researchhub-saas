/**
 * Supabase Configuration
 * Environment-aware Supabase configuration
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get configuration from environment variables or fallback to existing values
export const supabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk'
};

export default supabaseConfig;
