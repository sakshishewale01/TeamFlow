import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/common/Badge'
import { useWorkspace } from '@/hooks/useWorkspace'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Workspaces', path: '/workspaces', icon: Building2 },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Team Members', path: '/members', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const roleBadgeVariant = {
  Admin:   'danger',
  Manager: 'warning',
  Member:  'primary',
  Viewer:  'default',
}

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'WS'
}

export function Sidebar({ isOpen, onClose }) {
  const { activeWorkspace } = useWorkspace()

  const displayName   = activeWorkspace?.name ?? 'No Workspace'
  const displayRole   = activeWorkspace?.role ?? null
  const displayInitials = getInitials(activeWorkspace?.name ?? '')
  const badgeVariant  = roleBadgeVariant[displayRole] ?? 'default'

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out',
          'dark:border-slate-800 dark:bg-slate-900',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                TeamFlow
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Workspace
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60">
          <NavLink
            to="/workspaces"
            onClick={() => onClose?.()}
            id="sidebar-workspace-switcher"
            className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 hover:bg-slate-100 transition-colors dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold text-xs">
                {displayInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                {displayRole && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                      {displayRole}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Phase 4 Active
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Workspace management ready
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
