import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/common/Spinner'
import { APP_ROUTES } from '@/utils/constants'

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || APP_ROUTES.DASHBOARD
    return <Navigate to={from} replace />
  }

  return children
}

export default PublicOnlyRoute
