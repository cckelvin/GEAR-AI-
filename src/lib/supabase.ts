import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  plan: 'free' | 'pro';
  daily_generations: number;
  last_reset: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  is_private: boolean;
  deployment_url: string | null;
  status: 'draft' | 'deployed';
  created_at: string;
  updated_at: string;
};

export type ProjectFile = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
};
