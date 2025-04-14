
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper project URL and anon key
const supabaseUrl = 'https://frzgnszosqvcgycjtntz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyemduc3pvc3F2Y2d5Y2p0bnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTAxNDAsImV4cCI6MjA1OTYyNjE0MH0.aumHzbWPsSB2rYCsyjflPTHHj3bB9a6CZqDueknNkRo';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'powerleveling-auth-session',
  }
});
