import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateEmail, validatePassword } from '../utils/validators';
import { APP_ROUTES } from '../utils/constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || APP_ROUTES.APP;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Form validation
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back to TeamFlow!', 'Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let message = err.message || 'Failed to sign in. Please verify your credentials.';
      if (message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (message.includes('Email not confirmed')) {
        message = 'Your email has not been confirmed yet. Please check your inbox or disable email confirmation in your Supabase dashboard.';
      }
      setAuthError(message);
      toast.error(message, 'Sign In Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl shadow-indigo-500/5">
      <CardContent className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your credentials to access your TeamFlow workspaces
          </p>
        </div>

        {authError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              error={errors.password}
              icon={Lock}
              autoComplete="current-password"
              required
            />
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 select-none">
                  Remember me
                </span>
              </label>
              <Link
                to={APP_ROUTES.FORGOT_PASSWORD}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            icon={LogIn}
            className="mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to={APP_ROUTES.SIGNUP}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
