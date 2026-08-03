import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_CONFIG = 'crux_supabase_config_v1';

const DEFAULT_SUPABASE_URL = 'https://nbuigmslpwhcesnpljyr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable__dodluJkkNkkI1NIgmG4GA_tfPXxuKH';

const getCredentials = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey };
      }
    }
  } catch (e) {
    // Ignore localStorage parsing errors
  }

  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
};

const { url, anonKey } = getCredentials();

let clientInstance: SupabaseClient | null = null;

if (url && anonKey) {
  try {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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
