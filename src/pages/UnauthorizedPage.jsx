import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { APP_ROUTES } from '../utils/constants';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 border border-rose-200 dark:border-rose-900/60 shadow-lg">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        403 — Unauthorized Access
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        Your current role does not have permission to view or modify this resource. This boundary is enforced by PostgreSQL Row Level Security.
      </p>
      <div className="flex items-center gap-3">
        <Link to={APP_ROUTES.APP}>
          <Button variant="primary" icon={ArrowLeft}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
