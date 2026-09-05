import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  User,
  Layers,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { APP_ROUTES } from '../utils/constants';

export const DashboardPlaceholder = () => {
  const { user, profile } = useAuth();
  const { roleMeta } = useRole();

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'TeamFlow User';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 mb-4 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Prompt 1: Foundation & Authentication Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            Your session is authenticated via Supabase and your profile is secured with PostgreSQL Row Level Security (RLS).
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={APP_ROUTES.PROFILE}>
              <Button
                variant="secondary"
                size="sm"
                icon={User}
                className="bg-white text-indigo-700 hover:bg-indigo-50 border-0"
              >
                Manage Profile & Avatar
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <Badge variant={roleMeta?.badgeColor || 'emerald'} size="sm">
              {roleMeta?.label || 'Member'}
            </Badge>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Role Authorization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Current role enforced via database enum and security triggers.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <Badge variant="emerald" size="sm" dot>
              Active
            </Badge>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Profiles Table & Trigger
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated user provisioning trigger linked to auth.users.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <Badge variant="purple" size="sm">
              Strict
            </Badge>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Row Level Security (RLS)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SELECT & UPDATE isolated to auth.uid().
          </p>
        </Card>
      </div>

      {/* Next Phase Roadmap Notice */}
      <Card className="p-6 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Foundation Setup Complete</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              The application foundation, Supabase authentication, profiles, role checking, dark/light theme, and protected application layout are ready.
            </p>
          </div>
          <Link to={APP_ROUTES.PROFILE}>
            <Button size="sm" variant="outline" icon={ArrowRight} iconPosition="right">
              View Profile Page
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPlaceholder;
