import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '') || 'placeholder-key';

export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '')) && 
                                   !!(import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : ''));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  created_at: string;
  plan: 'free' | 'pro';
  daily_generations: number;
  last_reset: string;
};

export type Space = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  deployment_url: string | null;
  vercel_project_name: string | null;
  custom_domain: string | null;
  status: 'draft' | 'deployed';
  created_at: string;
  updated_at: string;
};

export type SpaceFile = {
  id: string;
  space_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type SpaceMessage = {
  id: string;
  space_id: string;
  role: 'user' | 'ai';
  text: string;
  type: string;
  status: string;
  created_at: string;
};

export type Deployment = {
  id: string;
  space_id: string;
  url: string;
  inspect_url: string | null;
  status: string;
  created_at: string;
};

export type UsageLog = {
  id: string;
  user_id: string;
  space_id: string | null;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  created_at: string;
};
