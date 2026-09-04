import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Home, AlertCircle } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-4">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        404
      </h1>
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mt-2">
        Page Not Found
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
        The page you are looking for does not exist or will be implemented in a future phase.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
