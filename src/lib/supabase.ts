import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_CONFIG = 'crux_supabase_config_v1';

const DEFAULT_SUPABASE_URL = 'https://nbuigmslpwhcesnpljyr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable__dodluJkkNkkI1NIgmG4GA_tfPXxuKH';
const REMEMBER_ME_KEY = 'crux_remember_me_v1';

const getCredentials = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
};

const { url, anonKey } = getCredentials();
const shouldRememberSession = () => {
  const stored = localStorage.getItem(REMEMBER_ME_KEY);
  return stored !== 'false';
};

let clientInstance: SupabaseClient | null = null;

if (url && anonKey) {
  try {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: shouldRememberSession() ? window.localStorage : window.sessionStorage,
      }
    });
  } catch (e) {
    console.warn('Failed to initialize singleton Supabase client:', e);
  }
}

export const supabase: SupabaseClient | null = clientInstance;

export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}
