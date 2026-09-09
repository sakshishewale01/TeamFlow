import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  validatePassword,
  validatePasswordMatch,
  getPasswordStrength,
} from '@/utils/validators'
import { APP_ROUTES } from '@/utils/constants'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { updatePassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError(null)

    const passErr = validatePassword(password)
    const matchErr = validatePasswordMatch(password, confirmPassword)

    if (passErr || matchErr) {
      setErrors({ password: passErr, confirmPassword: matchErr })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await updatePassword(password)
      setIsSuccess(true)
      toast.success('Your password has been updated successfully.', 'Password Reset Complete')
      setTimeout(() => {
        navigate(APP_ROUTES.DASHBOARD, { replace: true })
      }, 2000)
    } catch (err) {
      console.error('Update password error:', err)
      const msg = err.message || 'Failed to update password. Your reset session might be invalid or expired.'
      setGeneralError(msg)
      toast.error(msg, 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Password updated!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Redirecting you to your TeamFlow workspace...
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(APP_ROUTES.DASHBOARD, { replace: true })}
          >
            Continue to App
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl shadow-indigo-500/5">
      <CardContent className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Set a new password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Please enter and confirm your new secure password
          </p>
        </div>

        {generalError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
              }}
              error={errors.password}
              icon={Lock}
              autoComplete="new-password"
              required
            />
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Password strength:</span>
                  <span>{passwordStrength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                    } ${passwordStrength.score === 1 ? 'w-1/3' : passwordStrength.score === 2 ? 'w-2/3' : 'w-full'}`}
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }))
            }}
            error={errors.confirmPassword}
            icon={Lock}
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ResetPasswordPage
