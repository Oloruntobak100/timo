import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Public entry when the user is not signed in — routes to login and sign-up.
 */
export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(20, 184, 166, 0.15), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.35)',
          }}
        >
          <Building2 className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Phillips Data Stream</h1>
        <p className="text-slate-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
          Sign in to your account or create one to access jobs, finance, workforce, and the rest of
          the system.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
          <Button
            asChild
            size="lg"
            className="text-white border-0 h-12 px-8 text-base font-medium shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)',
            }}
          >
            <Link to="/login" className="inline-flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Sign in
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base font-medium border-slate-600 bg-slate-900/50 text-white hover:bg-slate-800 hover:text-white"
          >
            <Link to="/sign-up" className="inline-flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create account
            </Link>
          </Button>
        </div>

        <p className="mt-10 text-xs text-slate-600">
          Use the email and password registered in your Supabase project.
        </p>
      </motion.div>
    </div>
  );
}
