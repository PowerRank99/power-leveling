
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
import { CustomDatabase } from './customTypes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use the extended CustomDatabase type for better TypeScript support
export const supabase = createClient<CustomDatabase>(
  supabaseUrl,
  supabaseKey
);
