import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/common/Spinner'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Preserve the current path so the user can be returned after login
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
