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

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private isConfirmedUser(user: User | null | undefined): boolean {
    return Boolean(user?.email_confirmed_at || user?.confirmed_at);
  }

  private isSessionExpired(session: Session | null | undefined): boolean {
    if (!session?.expires_at) {
      return false;
    }

    const expiresAtMs = Number(session.expires_at) * 1000;
    const nowMs = Date.now();
    return expiresAtMs <= nowMs;
  }

  private formatAuthError(message: string): string {
    const normalized = (message || '').toLowerCase();

    if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
      return 'Invalid login credentials. Please check your email and password, or create a new account if you do not have one yet.';
    }

    if (normalized.includes('user already registered') || normalized.includes('already exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    if (normalized.includes('email not confirmed') || normalized.includes('confirm your email')) {
      return 'Your account email is not confirmed yet. Check your inbox for the verification message and try again.';
    }

    if (normalized.includes('jwt') || normalized.includes('expired') || normalized.includes('token')) {
      return 'Your secure session expired. We are refreshing your sign-in state automatically.';
    }

    if (normalized.includes('network') || normalized.includes('failed to fetch')) {
      return 'Network connection interrupted. Please check your internet connection and try again.';
    }

    return message || 'Authentication failed. Please try again.';
  }

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
        return true;
      }
      return false;
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

    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const { data: userData, error: userError } = await this.supabaseClient.auth.getUser();
      if (userError || !userData?.user) {
        const refreshResult = await this.supabaseClient.auth.refreshSession();
        if (refreshResult.error || !refreshResult.data?.session?.user) {
          await this.supabaseClient.auth.signOut({ scope: 'global' }).catch(() => undefined);
          this.currentUser = null;
          return null;
        }

        const refreshedUser = refreshResult.data.session.user;
        if (!this.isConfirmedUser(refreshedUser)) {
          await this.supabaseClient.auth.signOut({ scope: 'global' }).catch(() => undefined);
          this.currentUser = null;
          return null;
        }

        const authUser: AuthUser = {
          id: refreshedUser.id,
          email: refreshedUser.email || '',
          hunterName: refreshedUser.user_metadata?.hunter_name || refreshedUser.email?.split('@')[0] || 'Hunter',
          classTitle: refreshedUser.user_metadata?.class_title || 'Cyber Scholar',
          createdAt: refreshedUser.created_at || new Date().toISOString(),
        };

        this.currentUser = authUser;
        return authUser;
      }

      const user = userData.user;
      if (!this.isConfirmedUser(user)) {
        await this.supabaseClient.auth.signOut({ scope: 'global' }).catch(() => undefined);
        this.currentUser = null;
        return null;
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

    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

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
      throw new Error(this.formatAuthError(error.message));
    }

    if (!data || !data.user) {
      this.currentUser = null;
      throw new Error('Account registration did not return a valid profile. Please try again.');
    }

    // Check if user already exists (Supabase returns user with empty identities array if already registered)
    if (data.user.identities && data.user.identities.length === 0) {
      this.currentUser = null;
      throw new Error(this.formatAuthError('An account with this email address already exists. Please sign in instead.'));
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      hunterName: data.user.user_metadata?.hunter_name || hunterName,
      classTitle: data.user.user_metadata?.class_title || classTitle,
      createdAt: data.user.created_at || new Date().toISOString(),
      isNewAccount: true
    };

    const userHasConfirmedEmail = this.isConfirmedUser(data.user);
    if (!userHasConfirmedEmail || !data.session) {
      await this.supabaseClient.auth.signOut({ scope: 'global' }).catch(() => undefined);
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
  public async signIn(email: string, pass: string, rememberMe: boolean = true): Promise<AuthUser> {
    console.log(`[AUTH_REQUEST] Initiating Supabase signIn for: ${email}`);

    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!this.supabaseClient) {
      throw new Error('Supabase client is not initialized. Please configure valid Supabase URL & Anon Key.');
    }

    localStorage.setItem('crux_remember_me_v1', rememberMe ? 'true' : 'false');

    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      console.error('[AUTH_REQUEST] Supabase signIn returned error:', error.message);
      this.currentUser = null;
      throw new Error(this.formatAuthError(error.message));
    }

    if (!data || !data.user || !data.session) {
      this.currentUser = null;
      throw new Error('Your account could not be verified. Please confirm your email or try signing in again.');
    }

    if (!this.isConfirmedUser(data.user)) {
      await this.supabaseClient.auth.signOut({ scope: 'global' }).catch(() => undefined);
      this.currentUser = null;
      throw new Error(this.formatAuthError('Email confirmation is required before this account can sign in.'));
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
        throw new Error(this.formatAuthError(error.message));
      }
    } else {
      throw new Error('Supabase is not configured. Please configure Supabase URL & Anon Key in Settings to enable Google OAuth.');
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
    if (error) throw new Error(this.formatAuthError(error.message));
  }

  // Logout safely & completely from Supabase across all active sessions.
  public async signOut(scope: 'local' | 'global' = 'global'): Promise<void> {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.auth.signOut({ scope });
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
