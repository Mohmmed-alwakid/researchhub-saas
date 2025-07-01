import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../src/shared/config/supabase.js';

// Regular Supabase client for public operations
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Admin Supabase client with service role key for server-side operations
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseConfig.anonKey
);
