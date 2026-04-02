import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { mapSignInError } from '@/lib/authMessages';

export type SignUpResult = {
  error: Error | null;
  /** True when the user must confirm email before sign-in (Supabase “Confirm email” enabled). */
  pendingEmailVerification: boolean;
};

type AuthContextValue = {
  isConfigured: boolean;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<SignUpResult>;
  /** Confirm signup using the code from the email (`type: signup` OTP). */
  verifySignUpOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  resendSignupEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!cancelled) {
        setSession(s);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured') };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return { error: null };
    return { error: new Error(mapSignInError(error)) };
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured'), pendingEmailVerification: false };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      return { error: new Error(error.message), pendingEmailVerification: false };
    }

    // Never enter the app from sign-up alone: user must complete email verification (when enabled) and sign in explicitly.
    if (data.session) {
      await supabase.auth.signOut();
    }

    const pendingEmailVerification = Boolean(data.user && !data.user.email_confirmed_at);
    return { error: null, pendingEmailVerification };
  }, []);

  const verifySignUpOtp = useCallback(async (email: string, token: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured') };
    const trimmed = token.trim();
    if (!trimmed) {
      return { error: new Error('Enter the verification code from your email') };
    }
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: trimmed,
      type: 'signup',
    });
    if (!error) return { error: null };
    return { error: new Error(error.message) };
  }, []);

  const resendSignupEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured') };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (!error) return { error: null };
    return { error: new Error(error.message) };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      session,
      user: session?.user ?? null,
      loading,
      signInWithPassword,
      signUpWithPassword,
      verifySignUpOtp,
      resendSignupEmail,
      signOut,
    }),
    [session, loading, signInWithPassword, signUpWithPassword, verifySignUpOtp, resendSignupEmail, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
