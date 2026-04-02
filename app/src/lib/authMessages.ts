import type { AuthError } from '@supabase/supabase-js';

/** User-facing copy; avoids implying whether the email exists (except where Supabase exposes confirmation state). */
export function mapSignInError(error: AuthError): string {
  const raw = (error.message || '').toLowerCase();

  if (
    raw.includes('email not confirmed') ||
    raw.includes('not confirmed') ||
    error.message?.includes('Email not confirmed')
  ) {
    return 'Confirm your email before signing in. Check your inbox for the verification link from Supabase.';
  }

  if (raw.includes('invalid login') || raw.includes('invalid credentials')) {
    return 'No account exists for this email on Supabase, or the password is wrong. Create an account first if you have not signed up.';
  }

  return error.message || 'Sign in failed';
}
