import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ThemeToggle from '../ui/ThemeToggle';
import { APP_ROUTES } from '../../utils/constants';

export const Header = ({ onOpenMobileMenu, onLogoutClick }) => {
  const { user, profile } = useAuth();
  const { roleMeta } = useRole();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Hamburger & Search */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search placeholder */}
          <div className="relative hidden sm:block w-64 md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Quick search (Ctrl + K)..."
              disabled
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-800 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Right Side: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Notifications button placeholder */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Notifications"
            title="Notifications (coming in next prompt)"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950" />
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition focus:outline-none"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email || 'User'}
                size="sm"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {profile?.full_name || 'TeamFlow User'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {roleMeta?.label || 'Member'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-slide-down">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {profile?.full_name || 'Signed In'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                  <div className="mt-2">
                    <Badge variant={roleMeta?.badgeColor || 'emerald'} size="xs" dot>
                      {roleMeta?.label || 'Member'}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to={APP_ROUTES.PROFILE}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <div className="px-4 py-2 flex items-center gap-2.5 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>RLS Protected</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogoutClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
