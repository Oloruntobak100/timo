import React from 'react';

export function SupabaseConfigMissing() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center">
        <h1 className="text-xl font-semibold text-white mb-2">Supabase is not configured</h1>
        <p className="text-slate-400 text-sm mb-4">
          Create a file named <code className="text-slate-300">.env</code> in the{' '}
          <strong className="text-slate-300">repository root</strong> (the folder that contains the{' '}
          <code className="text-slate-300">app</code> folder), <em>or</em> put it in{' '}
          <code className="text-slate-300">app/.env</code>. Then <strong className="text-slate-300">restart</strong>{' '}
          <code className="text-slate-300">npm run dev</code>.
        </p>
        <pre className="text-left text-xs bg-slate-950 rounded-lg p-4 text-slate-300 overflow-x-auto">
          {`VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key`}
        </pre>
        <p className="text-slate-500 text-xs mt-4">
          Supabase Dashboard → Project Settings → API → Project URL and anon public key (starts with{' '}
          <code className="text-slate-400">eyJ</code>).
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Tip: copy <code className="text-slate-400">.env.example</code> from the repo root to{' '}
          <code className="text-slate-400">.env</code> and replace the placeholders.
        </p>
      </div>
    </div>
  );
}
