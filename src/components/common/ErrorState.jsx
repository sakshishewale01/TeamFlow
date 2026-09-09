import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again or contact support if the problem persists.',
  actionLabel = 'Try Again',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 shadow-inner">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="danger"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default ErrorState
