import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl = (meta && meta.env && meta.env.VITE_SUPABASE_URL) || 'https://kwiqevtydvlvxwyborel.supabase.co';
const supabaseAnonKey = (meta && meta.env && meta.env.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3aXFldnR5ZHZsdnh3eWJvcmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTk4NzIsImV4cCI6MjEwMDQ3NTg3Mn0.jPJt-SZcw69ULHgE8cum888wR2SiJOLgT7lWt6a2WvI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
