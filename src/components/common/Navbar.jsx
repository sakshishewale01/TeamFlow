import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { APP_ROUTES } from '../../utils/constants';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage = [APP_ROUTES.LOGIN, APP_ROUTES.SIGNUP, APP_ROUTES.FORGOT_PASSWORD, APP_ROUTES.RESET_PASSWORD].includes(location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase">Workspace</span>
          </div>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link to={APP_ROUTES.APP}>
              <Button size="sm" icon={ArrowRight} iconPosition="right">
                Open App
              </Button>
            </Link>
          ) : !isAuthPage ? (
            <div className="flex items-center gap-2">
              <Link to={APP_ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to={APP_ROUTES.SIGNUP}>
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : location.pathname === APP_ROUTES.LOGIN ? (
            <Link to={APP_ROUTES.SIGNUP}>
              <Button variant="outline" size="sm">
                Create Account
              </Button>
            </Link>
          ) : (
            <Link to={APP_ROUTES.LOGIN}>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
