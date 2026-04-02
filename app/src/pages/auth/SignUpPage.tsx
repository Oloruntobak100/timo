import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { validateAuthEmail } from '@/lib/emailAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignUpPage() {
  const navigate = useNavigate();
  const {
    signUpWithPassword,
    verifySignUpOtp,
    resendSignupEmail,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifySentTo, setVerifySentTo] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [createdWithoutVerificationStep, setCreatedWithoutVerificationStep] = useState(false);

  const resetVerificationFlow = () => {
    setVerifySentTo(null);
    setVerificationCode('');
    setCreatedWithoutVerificationStep(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = validateAuthEmail(email);
    if (parsed.ok === false) {
      toast.error(parsed.message);
      return;
    }
    if (!password) {
      toast.error('Enter a password');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    setVerifySentTo(null);
    setVerificationCode('');
    setCreatedWithoutVerificationStep(false);
    const { error, pendingEmailVerification } = await signUpWithPassword(parsed.email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (pendingEmailVerification) {
      setVerifySentTo(parsed.email);
      toast.success('Check your email for a verification code');
      return;
    }
    setCreatedWithoutVerificationStep(true);
    toast.success('Account created', {
      description:
        'Turn on “Confirm email” in Supabase (Auth → Providers → Email) so new users must verify before signing in.',
      duration: 8000,
    });
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySentTo) return;
    const code = verificationCode.trim();
    if (!code) {
      toast.error('Paste the verification code from your email');
      return;
    }
    setVerifying(true);
    const { error } = await verifySignUpOtp(verifySentTo, code);
    setVerifying(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Email verified — you’re signed in');
    navigate('/', { replace: true });
  };

  const handleResend = async () => {
    if (!verifySentTo) return;
    setResending(true);
    const { error } = await resendSignupEmail(verifySentTo);
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Email sent again');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
            }}
          >
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              {verifySentTo ? 'Enter verification code' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {verifySentTo ? (
                <>
                  We sent a code to <span className="text-slate-300">{verifySentTo}</span>. Paste the full value from
                  your email (any length). You can also use the link in the email if you prefer.
                </>
              ) : (
                <>
                  Use a valid email and password. When email confirmation is on, you’ll verify with a code from
                  Supabase.
                </>
              )}
            </CardDescription>
          </CardHeader>

          {createdWithoutVerificationStep && !verifySentTo && (
            <div className="px-6 pb-2">
              <p className="text-sm text-amber-400/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                Your project allowed sign-up without a confirmation step. Enable <strong>Confirm email</strong> in
                Supabase so every user must validate their email before signing in.
              </p>
            </div>
          )}

          {verifySentTo ? (
            <form onSubmit={handleVerifyCode}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code" className="text-slate-300">
                    Verification code
                  </Label>
                  <Input
                    id="verification-code"
                    name="verification-code"
                    type="text"
                    autoComplete="one-time-code"
                    placeholder="Paste the code from your email"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-slate-950/50 border-slate-700 text-white font-mono text-base"
                    disabled={verifying || authLoading}
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-500">
                    Paste exactly what appears in the email. Not limited to numbers or length.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full text-white border-0"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
                  }}
                  disabled={verifying || authLoading}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    'Verify email'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-800"
                  disabled={resending || authLoading}
                  onClick={handleResend}
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Resend email'
                  )}
                </Button>
                <button
                  type="button"
                  className="text-sm text-slate-400 hover:text-slate-300 underline underline-offset-2"
                  onClick={resetVerificationFlow}
                >
                  Use a different email
                </button>
                <p className="text-sm text-slate-400 text-center pt-1">
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Already verified? Sign in
                  </Link>
                </p>
                <p className="text-xs text-slate-600 text-center">
                  <Link to="/" className="hover:text-slate-400">
                    ← Back to home
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950/50 border-slate-700 text-white"
                    disabled={submitting || authLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-300">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950/50 border-slate-700 text-white"
                    disabled={submitting || authLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-slate-300">
                    Confirm password
                  </Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="bg-slate-950/50 border-slate-700 text-white"
                    disabled={submitting || authLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full text-white border-0"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
                  }}
                  disabled={submitting || authLoading}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    'Sign up'
                  )}
                </Button>
                <p className="text-sm text-slate-400 text-center">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign in
                  </Link>
                </p>
                <p className="text-xs text-slate-600 text-center">
                  <Link to="/" className="hover:text-slate-400">
                    ← Back to home
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
