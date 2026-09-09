import { useNavigate, Link } from 'react-router-dom'
import { Menu, Search, Bell, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

export function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth() || {}

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Guest User'
  const displayEmail = user?.email || 'guest@teamflow.local'
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    try {
      if (typeof logout === 'function') {
        await logout()
      }
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      {/* Left side: Mobile menu toggle & Quick search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Placeholder */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
          />
        </div>
      </div>

      {/* Right side: Actions & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications placeholder */}
        <button
          type="button"
          disabled
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 cursor-not-allowed"
          aria-label="Notifications"
          title="Notifications will be available in later phases"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile Avatar & Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-xs">
              {initial}
            </div>
          )}

          <div className="hidden md:block text-left max-w-[140px]">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none truncate">
              {displayEmail}
            </p>
          </div>
        </Link>

        {/* Logout Action Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out of TeamFlow"
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
