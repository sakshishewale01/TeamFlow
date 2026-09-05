import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { APP_ROUTES } from '../../utils/constants';

export const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onLogoutClick,
}) => {
  const { user, profile } = useAuth();
  const { roleMeta } = useRole();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Dashboard',
      path: APP_ROUTES.APP,
      icon: LayoutDashboard,
      exact: true,
      badge: null,
    },
    {
      label: 'Workspaces',
      path: APP_ROUTES.WORKSPACES,
      icon: Building2,
      badge: null,
    },
    {
      label: 'Projects',
      path: APP_ROUTES.PROJECTS,
      icon: FolderKanban,
      badge: null,
    },
    {
      label: 'Tasks',
      path: '/app/tasks',
      icon: CheckSquare,
      badge: 'Soon',
    },
    {
      label: 'Team Members',
      path: '/app/team',
      icon: Users,
      badge: 'Soon',
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: Settings,
      badge: 'Soon',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white truncate">
                  Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                  Workspace
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher isCollapsed={isCollapsed} />

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Menu
              </p>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.exact}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Account
              </p>
            )}
            <nav className="space-y-1">
              <NavLink
                to={APP_ROUTES.PROFILE}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
                title={isCollapsed ? 'My Profile' : undefined}
              >
                <User className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate flex-1">My Profile</span>}
              </NavLink>
            </nav>
          </div>

          {/* Quick info card (only when expanded) */}
          {!isCollapsed && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/50 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>TeamFlow Foundation</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Prompt 1: Auth & Profiles verified with Supabase RLS security.
              </p>
            </div>
          )}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition`}
          >
            <div
              className="flex items-center gap-3 cursor-pointer min-w-0"
              onClick={() => {
                navigate(APP_ROUTES.PROFILE);
                if (window.innerWidth < 1024) onClose();
              }}
              title="View Profile"
            >
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email || 'User'}
                size="sm"
                statusIndicator
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {profile?.full_name || 'Team Member'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant={roleMeta?.badgeColor || 'emerald'} size="xs">
                      {roleMeta?.label || 'Member'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={onLogoutClick}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                aria-label="Sign Out"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
