import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { validateEmail } from '@/utils/validators'
import { APP_ROUTES } from '@/utils/constants'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { resetPassword } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) {
      setError(emailErr)
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await resetPassword(email)
      setIsSubmitted(true)
      toast.success('Password recovery email sent.', 'Check your inbox')
    } catch (err) {
      console.error('Password reset error:', err)
      const msg = err.message || 'Failed to send recovery email. Please check your email address.'
      setError(msg)
      toast.error(msg, 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl shadow-indigo-500/5">
      <CardContent className="p-8">
        {!isSubmitted ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Reset your password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your registered email address and we'll send you a password reset link.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                icon={Mail}
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                icon={KeyRound}
              >
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Check your inbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              We've dispatched a password reset link to <strong className="text-slate-900 dark:text-white">{email}</strong>. Please follow the instructions in the email.
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setIsSubmitted(false)}
            >
              Didn't receive the email? Try again
            </Button>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to={APP_ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to sign in</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default ForgotPasswordPage
