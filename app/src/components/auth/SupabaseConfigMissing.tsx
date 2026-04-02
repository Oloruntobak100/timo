import React from 'react';

export function SupabaseConfigMissing() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center">
        <h1 className="text-xl font-semibold text-white mb-2">Supabase is not configured</h1>
        <p className="text-slate-400 text-sm mb-4">
          Add the following to <code className="text-slate-300">app/.env</code> (or{' '}
          <code className="text-slate-300">.env.local</code>) and restart the dev server:
        </p>
        <pre className="text-left text-xs bg-slate-950 rounded-lg p-4 text-slate-300 overflow-x-auto">
          {`VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
        <p className="text-slate-500 text-xs mt-4">
          Copy values from Supabase Dashboard → Project Settings → API.
        </p>
      </div>
    </div>
  );
}
