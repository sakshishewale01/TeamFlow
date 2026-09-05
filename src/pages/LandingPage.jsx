import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users2,
  CheckCircle2,
  Lock,
  Workflow,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EnvNotice from '../components/common/EnvNotice';
import { useAuth } from '../hooks/useAuth';
import { APP_ROUTES } from '../utils/constants';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <EnvNotice />
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
          {/* Subtle ambient gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[100px] pointer-events-none -z-10 rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 animate-fade-in shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>TeamFlow 1.0 Foundation is Ready</span>
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Supabase RLS Enabled</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
              Collaborate and deliver projects{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">
                at lightning speed.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The high-performance workspace engineered for fast-moving teams. Manage workspaces, assign tasks, collaborate in real time, and protect data with enterprise-grade Row Level Security.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to={APP_ROUTES.APP} className="w-full sm:w-auto">
                  <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto shadow-lg shadow-indigo-600/25">
                    Launch TeamFlow Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to={APP_ROUTES.SIGNUP} className="w-full sm:w-auto">
                    <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto shadow-lg shadow-indigo-600/25">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to={APP_ROUTES.LOGIN} className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign In to Account
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Highlights Under CTA */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Supabase PostgreSQL Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Strict Row Level Security (RLS)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Granular Roles & Avatars</span>
              </div>
            </div>

            {/* Product UI Mockup Card */}
            <div className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-indigo-500/20 via-slate-200/40 to-slate-200/10 dark:from-indigo-500/20 dark:via-slate-800/40 dark:to-slate-900/10 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
              <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left p-6 sm:p-8">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-2">
                      TeamFlow Workspace &bull; Sprint 1 Foundation
                    </span>
                  </div>
                  <Badge variant="indigo" size="sm" dot>
                    Active Session
                  </Badge>
                </div>

                {/* Dashboard preview content */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Workspaces</span>
                      <Workflow className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">Ready</div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Foundation initialized</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Role Enforcement</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">Admin / Member</div>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">RLS Protected</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profile & Avatars</span>
                      <Users2 className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">Storage Ready</div>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Supabase Storage Bucket</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="indigo" size="sm" className="mb-3">
                Core Architectural Pillars
              </Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Engineered for speed, built for security
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
                Built from day one with enterprise security standards and modern web UX.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  PostgreSQL Row Level Security
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Data access policies enforced directly in PostgreSQL. Users can never access or tamper with data outside their permission boundary.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  4-Tier Role-Based Access
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Support for Admin, Manager, Member, and Viewer roles with database-level immutability preventing unauthorized self-elevation.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Instant Auto-Provisioning
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  PostgreSQL triggers automatically initialize user profiles upon Supabase signup with zero latency and full transactional consistency.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">TeamFlow</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} TeamFlow. Built with React, Vite, Tailwind CSS & Supabase RLS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
