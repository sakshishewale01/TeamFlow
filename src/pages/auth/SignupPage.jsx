import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePasswordMatch,
  getPasswordStrength,
} from '@/utils/validators'
import { APP_ROUTES } from '@/utils/constants'

export function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successInfo, setSuccessInfo] = useState(null)

  const { signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    // Form validations
    const nameErr = validateFullName(fullName)
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    const matchErr = validatePasswordMatch(password, confirmPassword)

    if (nameErr || emailErr || passErr || matchErr) {
      setErrors({
        fullName: nameErr,
        email: emailErr,
        password: passErr,
        confirmPassword: matchErr,
      })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const data = await signup(email, password, fullName)

      // Check if session was returned or email confirmation is required
      if (data?.session) {
        toast.success('Account created and profile initialized!', 'Welcome to TeamFlow')
        navigate(APP_ROUTES.DASHBOARD)
      } else {
        // Confirmation email sent
        setSuccessInfo({
          email: email.trim(),
          message: 'Please check your email inbox to confirm your account and activate your TeamFlow profile.',
        })
        toast.info('Verification link sent. Please verify your email to continue.', 'Verification Required')
      }
    } catch (err) {
      console.error('Signup error:', err)
      let message = err.message || 'Failed to create account. Please try again.'
      if (message.includes('User already registered')) {
        message = 'An account with this email address already exists. Please sign in instead.'
      }
      setAuthError(message)
      toast.error(message, 'Registration Failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (successInfo) {
    return (
      <Card className="shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Verification email sent!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            We sent a verification link to <strong className="text-slate-900 dark:text-white">{successInfo.email}</strong>. {successInfo.message}
          </p>
          <div className="space-y-3">
            <Link to={APP_ROUTES.LOGIN}>
              <Button variant="primary" fullWidth>
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl shadow-indigo-500/5">
      <CardContent className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create your account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join TeamFlow to manage your projects with full RLS security
          </p>
        </div>

        {authError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            placeholder="Sarah Connor"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }))
            }}
            error={errors.fullName}
            icon={User}
            autoComplete="name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
            }}
            error={errors.email}
            icon={Mail}
            autoComplete="email"
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              name="password"
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

            {/* Password strength meter */}
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
            label="Confirm Password"
            type="password"
            name="confirmPassword"
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
            icon={UserPlus}
            className="mt-2"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to={APP_ROUTES.LOGIN}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SignupPage
