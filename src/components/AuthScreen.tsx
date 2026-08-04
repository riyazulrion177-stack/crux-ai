import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Zap,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Sword,
  Crown,
  BookOpen,
  BrainCircuit,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import { HunterClass } from '../types';
import { authService, AuthUser } from '../services/authService';

interface Props {
  onAuthSuccess: (user: AuthUser, isNewAccount: boolean) => void;
}

const CLASSES: { type: HunterClass; icon: any; title: string; desc: string; color: string }[] = [
  {
    type: 'Shadow Monk',
    icon: Sparkles,
    title: 'Shadow Monk',
    desc: 'Master of Mindset, Meditation & Inner Discipline.',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/50 text-purple-400'
  },
  {
    type: 'Titan Athlete',
    icon: Sword,
    title: 'Titan Athlete',
    desc: 'Dominator of Conditioning, Strength & Power.',
    color: 'from-red-500/20 to-amber-500/20 border-red-500/50 text-red-400'
  },
  {
    type: 'Cyber Scholar',
    icon: BrainCircuit,
    title: 'Cyber Scholar',
    desc: 'Wielder of Deep Work, Code & Knowledge.',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400'
  },
  {
    type: 'Iron Executive',
    icon: Crown,
    title: 'Iron Executive',
    desc: 'Commander of Leadership & Financial Strategy.',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-400'
  },
  {
    type: 'Creative Weaver',
    icon: BookOpen,
    title: 'Creative Weaver',
    desc: 'Artisan of Design, Media & High-Impact Output.',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400'
  }
];

export const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hunterName, setHunterName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HunterClass>('Cyber Scholar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const isSubmittingRef = useRef<boolean>(false);

  const [supabaseUrlInput, setSupabaseUrlInput] = useState(
    (import.meta as any).env?.VITE_SUPABASE_URL || ''
  );
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
  );

  const formatFriendlyAuthError = (message: string) => {
    const normalized = (message || '').toLowerCase();

    if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
      return 'Invalid login credentials. Please check your email and password, or create a new account if you do not have one yet.';
    }

    if (normalized.includes('already exists') || normalized.includes('already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    if (normalized.includes('email not confirmed') || normalized.includes('confirm your email')) {
      return 'Your email address still needs confirmation. Check your inbox for the verification email and try again.';
    }

    if (normalized.includes('jwt') || normalized.includes('expired') || normalized.includes('token')) {
      return 'Your secure session has expired. Please sign in again to restore access.';
    }

    if (normalized.includes('network') || normalized.includes('failed to fetch')) {
      return 'A network issue interrupted authentication. Please try again in a moment.';
    }

    return message || 'Authentication failed. Please try again.';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) {
      console.warn('[AUTH_GUARD] Suppressed duplicate signIn trigger.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    isSubmittingRef.current = true;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      console.log('[AUTH_UI] Single click validated: Triggering authService.signIn');
      const user = await authService.signIn(email.trim(), password, rememberMe);

      // Strict Session Verification against Supabase Auth Server before proceeding to Dashboard
      const sessionUser = await authService.getSessionUser();
      if (!sessionUser || sessionUser.id !== user.id) {
        throw new Error('Supabase session verification failed. Access denied.');
      }

      onAuthSuccess(sessionUser, false);
    } catch (err: any) {
      console.error('[AUTH_SIGNIN_FAILED]', err);
      setError(formatFriendlyAuthError(err.message || 'Authentication failed.'));
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) {
      console.warn('[AUTH_GUARD] Suppressed duplicate signUp trigger.');
      return;
    }
    if (!hunterName.trim()) {
      setError('Please enter your Hunter designation name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    isSubmittingRef.current = true;
    setError('');
    setLoading(true);

    try {
      console.log('[AUTH_UI] Single click validated: Triggering authService.signUp');
      const res = await authService.signUp(
        email.trim(),
        password,
        hunterName.trim(),
        selectedClass
      );

      if (res.requiresEmailConfirmation || !res.session) {
        setSuccessMsg('Hunter account created! Please check your email to confirm your account before signing in.');
        setMode('signin');
      } else {
        const sessionUser = await authService.getSessionUser();
        if (!sessionUser) {
          throw new Error('Supabase session verification failed after sign up.');
        }
        onAuthSuccess(sessionUser, true);
      }
    } catch (err: any) {
      setError(formatFriendlyAuthError(err.message || 'Account registration failed.'));
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError(formatFriendlyAuthError(err.message || 'Google authentication required Supabase client connection.'));
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address for password reset.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSuccessMsg('Password reset instructions dispatched to ' + email.trim());
    } catch (err: any) {
      setError(formatFriendlyAuthError(err.message || 'Unable to process password reset request.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateSupabaseConfig(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    setShowConfigModal(false);
    setSuccessMsg('Supabase authentication configuration updated.');
  };

  return (
    <div className="min-h-screen w-full bg-[#03060c] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Cyber Ambient Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-[#080c18]/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.08)] backdrop-blur-xl relative z-10 my-8"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff]" />

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3 shadow-inner">
            <Zap className="w-3.5 h-3.5 animate-pulse text-cyan-300" /> CRUX AUTHENTICATION SYSTEM
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-purple-300 bg-clip-text text-transparent uppercase">
            {mode === 'signup' && 'AWAKEN HUNTER ACCOUNT'}
            {mode === 'signin' && 'HUNTER SYSTEM ACCESS'}
            {mode === 'forgot' && 'RESET SECURITY CREDENTIALS'}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            {mode === 'signup' && 'Create your account to claim your Level 1 status and begin your quest.'}
            {mode === 'signin' && 'Enter your security keys to access your independent Hunter stats & progress.'}
            {mode === 'forgot' && 'Provide your registered email to receive a password reset key.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-[#040711] p-1 rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-mono uppercase font-bold transition duration-200 ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-mono uppercase font-bold transition duration-200 ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('invalid login credentials') && (
              <div className="pt-2 border-t border-red-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-400">Don't have a Hunter account yet?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setSuccessMsg('Switched to Create Account tab. Enter your designation name to awaken.');
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Create Account &rarr;
                </button>
              </div>
            )}
            {error.toLowerCase().includes('already exists') && (
              <div className="pt-2 border-t border-red-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-400">Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                    setSuccessMsg('Switched to Sign In tab. Enter your password to access the system.');
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Sign In &rarr;
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Form Container */}
        <AnimatePresence mode="wait">
          {mode === 'signup' && (
            <motion.form
              key="signup_form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handleSignUp}
              className="space-y-4"
            >
              {/* Hunter Name */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1">
                  Hunter Designation (Name)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    maxLength={24}
                    value={hunterName}
                    onChange={(e) => { setHunterName(e.target.value); setError(''); }}
                    placeholder="e.g. Sung Jin-Woo / Alex Mercer"
                    className="w-full bg-[#0a0f1d] border border-white/10 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="hunter@crux.system"
                    className="w-full bg-[#0a0f1d] border border-white/10 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0a0f1d] border border-white/10 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-2">
                  Select Archetype Class
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CLASSES.map((cls) => {
                    const Icon = cls.icon;
                    const isSelected = selectedClass === cls.type;
                    return (
                      <button
                        key={`cls_${cls.type}`}
                        type="button"
                        onClick={() => setSelectedClass(cls.type)}
                        className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-2.5 ${
                          isSelected
                            ? `bg-gradient-to-br ${cls.color} ring-1 ring-cyan-400 shadow-lg`
                            : 'bg-[#0a0f1d] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-black/40 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{cls.title}</div>
                          <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{cls.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Create Account Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/45 hover:scale-[1.01] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" /> CREATE ACCOUNT & AWAKEN &rarr;
                  </>
                )}
              </button>
            </motion.form>
          )}

          {mode === 'signin' && (
            <motion.form
              key="signin_form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleSignIn}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="hunter@crux.system"
                    className="w-full bg-[#0a0f1d] border border-white/10 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0a0f1d] border border-white/10 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition font-medium"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 accent-cyan-500"
                />
                Remember me on this device
              </label>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/45 hover:scale-[1.01] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" /> SIGN IN TO SYSTEM
                  </>
                )}
              </button>

              {/* OAuth Divider */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-[#080c18] px-3 text-[10px] font-mono uppercase text-zinc-500">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-white/20 text-white text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>
            </motion.form>
          )}

          {mode === 'forgot' && (
            <motion.form
              key="forgot_form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); setSuccessMsg(''); }}
                    placeholder="hunter@crux.system"
                    className="w-full bg-[#0a0f1d] border border-white/10 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                  className="px-4 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-mono uppercase font-bold"
                >
                  &larr; Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/45 transition flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Reset Key'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer Supabase Config Button */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>SUPABASE AUTH CONNECTED</span>
          </div>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="text-cyan-400 hover:underline hover:text-cyan-300 transition"
          >
            Config Keys
          </button>
        </div>
      </motion.div>

      {/* Supabase Keys Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[#080c18] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-white relative"
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" /> Supabase Connection Config
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-mono">
                Provide your custom Supabase URL and Anon Key if self-hosting or overriding system credentials.
              </p>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 font-mono">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">
                    VITE_SUPABASE_URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-[#040711] border border-white/10 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">
                    VITE_SUPABASE_ANON_KEY
                  </label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full bg-[#040711] border border-white/10 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-black uppercase text-xs hover:bg-cyan-400"
                  >
                    Save & Initialize
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
