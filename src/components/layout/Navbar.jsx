import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Menu, Search, LogOut, X } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearch } from '@/components/search/GlobalSearch'

export function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth() || {}
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

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
      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="absolute inset-0 z-50 flex items-center gap-2 px-3 bg-white dark:bg-slate-900 sm:hidden">
          <div className="flex-1 min-w-0">
            <GlobalSearch isMobile onMobileClose={() => setIsMobileSearchOpen(false)} />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Left side: Mobile menu toggle, mobile search trigger & Desktop global search */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Search Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:hidden cursor-pointer"
          aria-label="Search projects, tasks..."
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Global Search for Tablet & Desktop */}
        <div className="hidden sm:block">
          <GlobalSearch />
        </div>
      </div>

      {/* Right side: Actions & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Bell */}
        <NotificationBell />

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
