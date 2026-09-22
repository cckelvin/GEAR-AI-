import { createClient } from '@supabase/supabase-js';

const getEnvOrStored = (key: string, storedKey: string): string => {
  const envVal = (import.meta.env[key] as string) || (typeof process !== 'undefined' ? (process.env[key] as string) : '') || '';
  if (envVal && !envVal.includes('placeholder')) {
    return envVal;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(storedKey);
    if (stored && !stored.includes('placeholder')) {
      return stored;
    }
  }
  return '';
};

const rawUrl = getEnvOrStored('VITE_SUPABASE_URL', 'gear_supabase_url');
const rawKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'gear_supabase_key');

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawUrl.trim().length > 10 &&
  !rawUrl.includes('placeholder-project') &&
  (rawUrl.startsWith('https://') || rawUrl.startsWith('http://')) &&
  rawKey &&
  rawKey.trim().length > 10 &&
  !rawKey.includes('placeholder-key')
);

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://local-space.gear.internal';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'local-anon-key';

// Safe storage wrapper: protects against corrupt, empty, or expired session tokens in storage
const safeAuthStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // If there is no valid refresh_token or access_token, remove corrupt item
      if (!parsed || !parsed.access_token || !parsed.refresh_token) {
        window.localStorage.removeItem(key);
        return null;
      }
      return raw;
    } catch {
      if (typeof window !== 'undefined') {
        try { window.localStorage.removeItem(key); } catch {}
      }
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {}
  }
};

// Global unhandled rejection suppressor for benign AuthSessionMissingError
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || (typeof event.reason === 'string' ? event.reason : '');
    const name = event.reason?.name || '';
    if (
      msg.includes('Auth session missing') ||
      name === 'AuthSessionMissingError'
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

// Safe fetch interceptor: ensures network errors or unconfigured calls never throw uncaught TypeError
const safeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (!isSupabaseConfigured) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : ((input as any)?.url || '');
  const isAuthRequest = typeof urlStr === 'string' && urlStr.includes('/auth/v1/');

  try {
    return await fetch(input, init);
  } catch (err: any) {
    console.warn('Supabase network connection warning:', err?.message || err);
    // Never return HTTP 200 for a failed auth request; returning 200 with an empty body causes GoTrue to throw AuthSessionMissingError
    if (isAuthRequest) {
      return new Response(JSON.stringify({ error: 'network_error', message: err?.message || 'Network fetch failed' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: { message: err?.message || 'Network fetch failed' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: false,
    storage: safeAuthStorage,
  },
  global: {
    fetch: safeFetch
  }
});

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
