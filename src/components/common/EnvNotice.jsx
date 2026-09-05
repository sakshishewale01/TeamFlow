import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const EnvNotice = () => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isSupabaseConfigured) return null;

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...`;

  const copySample = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Supabase Setup Required:</strong> Connect your real Supabase project in <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> to enable authentication and database operations.
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer shrink-0"
        >
          {expanded ? 'Hide Setup Guide' : 'Setup Guide'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-sm text-slate-700 dark:text-slate-300 space-y-2 animate-fadeIn">
          <p className="font-semibold text-slate-900 dark:text-white">Quick Supabase Setup (3 Steps):</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs">
            <li>
              Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium">Supabase Dashboard</a> and copy your <strong>Project URL</strong> and <strong>anon / public key</strong> from <em>Project Settings → API</em>.
            </li>
            <li>
              Paste them into your local <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">.env</code> file:
              <div className="relative mt-1">
                <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-[11px] overflow-x-auto font-mono">
                  {envSample}
                </pre>
                <button
                  onClick={copySample}
                  className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 border border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </li>
            <li>
              Execute the migration in <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">supabase/migrations/20260905000001_create_profiles_and_roles.sql</code> inside the Supabase <strong>SQL Editor</strong>.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default EnvNotice;
