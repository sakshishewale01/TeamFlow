import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { APP_ROUTES } from '../utils/constants';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-200 dark:border-indigo-900/60 shadow-lg">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to={APP_ROUTES.HOME}>
        <Button variant="primary" icon={ArrowLeft}>
          Return to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
