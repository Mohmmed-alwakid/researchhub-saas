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
  anonKey: process.env.SUPABASE_ANON_KEY || ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY''
};

export default supabaseConfig;
