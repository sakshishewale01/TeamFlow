import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';
import EnvNotice from '../components/common/EnvNotice';
import { APP_ROUTES } from '../utils/constants';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <EnvNotice />

      {/* Top Bar */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          to={APP_ROUTES.HOME}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered Auth Card Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo & Subtitle */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
            </Link>
          </div>

          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} TeamFlow. All rights reserved. Row-Level Security Protected.
      </footer>
    </div>
  );
};

export default AuthLayout;
