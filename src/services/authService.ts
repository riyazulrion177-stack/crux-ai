import { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { HunterClass } from '../types';

const STORAGE_KEY_SUPABASE_CONFIG = 'crux_supabase_config_v1';

export interface AuthUser {
  id: string;
  email: string;
  hunterName: string;
  classTitle: HunterClass;
  createdAt: string;
  isNewAccount?: boolean;
}

export interface SignUpResult {
  user: AuthUser;
  session: Session | null;
  isNewAccount: boolean;
  requiresEmailConfirmation: boolean;
}

class AuthService {
  private supabaseClient: SupabaseClient | null = supabase;
  private currentUser: AuthUser | null = null;

  constructor() {
    // Pure Supabase Auth enforcement.
    // No mock users, local storage sessions, or demo mode allowed.
  }

  public getSupabaseClient(): SupabaseClient | null {
    return this.supabaseClient;
  }

  public updateSupabaseConfig(url: string, anonKey: string): boolean {
    try {
      if (url && anonKey) {
        localStorage.setItem(
          STORAGE_KEY_SUPABASE_CONFIG,
          JSON.stringify({ url, anonKey, isConnected: true })
        );
        return true;
      } else {
        localStorage.setItem(
          STORAGE_KEY_SUPABASE_CONFIG,
          JSON.stringify({ url: '', anonKey: '', isConnected: false })
        );
        return false;
      }
    } catch (e) {
      console.error('Error updating Supabase config:', e);
      return false;
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Strictly verifies active Supabase session.
   * Rejects unauthenticated state and returns null if no valid Supabase session exists.
   */
  public async getSessionUser(): Promise<AuthUser | null> {
    if (!this.supabaseClient) {
      this.currentUser = null;
      return null;
    }

    try {
      const { data: sessionData, error: sessionError } = await this.supabaseClient.auth.getSession();
      console.log("Result of await supabase.auth.getSession():", { sessionData, sessionError });
      if (sessionError || !sessionData || !sessionData.session || !sessionData.session.user) {
        this.currentUser = null;
        return null;
      }

      let user = sessionData.session.user;

      // Validate user token with Supabase Auth Server if available
      try {
        const { data: userData, error: userError } = await this.supabaseClient.auth.getUser();
        console.log("Result of await supabase.auth.getUser():", { userData, userError });
        if (!userError && userData && userData.user) {
          user = userData.user;
        }
      } catch (err) {
        console.warn('supabase.auth.getUser() warning, using session user:', err);
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || '',
        hunterName: user.user_metadata?.hunter_name || user.email?.split('@')[0] || 'Hunter',
        classTitle: user.user_metadata?.class_title || 'Cyber Scholar',
        createdAt: user.created_at || new Date().toISOString(),
      };

      this.currentUser = authUser;
      return authUser;
    } catch (e) {
      console.error('Supabase session verification error:', e);
      this.currentUser = null;
      return null;
    }
  }

  /**
   * Strictly signs up via Supabase Auth API.
   * If email is already registered, or invalid, throws Supabase error.
   * If email confirmation is required, returns requiresEmailConfirmation: true without setting a session.
   */
  public async signUp(
    email: string,
    pass: string,
    hunterName: string,
    classTitle: HunterClass
  ): Promise<SignUpResult> {
    console.log(`[AUTH_REQUEST] Initiating Supabase signUp for: ${email}`);
    
    if (!this.supabaseClient) {
      throw new Error('Supabase client is not initialized. Please configure Supabase URL & Anon Key in Settings.');
    }

    const { data, error } = await this.supabaseClient.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          hunter_name: hunterName,
          class_title: classTitle,
        }
      }
    });

    if (error) {
      console.error('[AUTH_REQUEST] Supabase signUp returned error:', error.message);
      this.currentUser = null;
      throw new Error(error.message);
    }

    if (!data || !data.user) {
      this.currentUser = null;
      throw new Error('Supabase did not return user data. Registration failed.');
    }

    // Check if user already exists (Supabase returns user with empty identities array if already registered)
    if (data.user.identities && data.user.identities.length === 0) {
      this.currentUser = null;
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      hunterName: data.user.user_metadata?.hunter_name || hunterName,
      classTitle: data.user.user_metadata?.class_title || classTitle,
      createdAt: data.user.created_at || new Date().toISOString(),
      isNewAccount: true
    };

    if (!data.session) {
      // Email confirmation is required by Supabase project settings
      this.currentUser = null;
      return {
        user: authUser,
        session: null,
        isNewAccount: true,
        requiresEmailConfirmation: true
      };
    }

    this.currentUser = authUser;
    return {
      user: authUser,
      session: data.session,
      isNewAccount: true,
      requiresEmailConfirmation: false
    };
  }

  /**
   * Strictly signs in via Supabase Auth API (`signInWithPassword`).
   * If credentials are wrong, email non-existent, or password invalid, throws error immediately.
   * Never creates fake sessions or navigates without a valid returned session & user.
   */
  public async signIn(email: string, pass: string): Promise<AuthUser> {
    console.log(`[AUTH_REQUEST] Initiating Supabase signIn for: ${email}`);

    if (!this.supabaseClient) {
      throw new Error('Supabase client is not initialized. Please configure valid Supabase URL & Anon Key.');
    }

    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      console.error('[AUTH_REQUEST] Supabase signIn returned error:', error.message);
      this.currentUser = null;
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Invalid login credentials. Please check your password or switch to "Create Account" if you do not have an account yet.');
      }
      throw new Error(error.message);
    }

    if (!data || !data.user || !data.session) {
      this.currentUser = null;
      throw new Error('Invalid login credentials or unconfirmed account.');
    }

    console.log(`[AUTH_REQUEST] Supabase signIn successful for user ID: ${data.user.id}`);

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      hunterName: data.user.user_metadata?.hunter_name || email.split('@')[0] || 'Hunter',
      classTitle: data.user.user_metadata?.class_title || 'Cyber Scholar',
      createdAt: data.user.created_at || new Date().toISOString(),
      isNewAccount: false
    };

    this.currentUser = authUser;
    return authUser;
  }

  // Google OAuth Login
  public async signInWithGoogle(): Promise<void> {
    if (this.supabaseClient) {
      const { error } = await this.supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        this.currentUser = null;
        throw new Error(error.message);
      }
    } else {
      throw new Error("Supabase is not configured. Please configure Supabase URL & Anon Key in Settings to enable Google OAuth.");
    }
  }

  // Password Reset
  public async resetPassword(email: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Supabase client is not initialized.");
    }
    const { error } = await this.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw new Error(error.message);
  }

  // Logout safely & completely from Supabase
  public async signOut(): Promise<void> {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout warning:', e);
      }
    }
    this.currentUser = null;
  }

  // Listen to Auth state changes directly from Supabase
  public onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (this.supabaseClient) {
      return this.supabaseClient.auth.onAuthStateChange(callback);
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
}

export const authService = new AuthService();
