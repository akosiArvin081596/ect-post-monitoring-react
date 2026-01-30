import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/dswd-caraga-logo.jpg'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shakeError, setShakeError] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {}

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const triggerShake = () => {
    setShakeError(true)
    setTimeout(() => setShakeError(false), 500)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) {
      triggerShake()
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password, rememberMe)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid email or password')
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 xl:min-h-screen xl:h-auto xl:items-center xl:justify-center xl:overflow-visible xl:px-6 xl:py-8">
      <div className="relative mx-auto flex w-full flex-col items-center animate-fade-in-up xl:max-w-lg">
        {/* Header with inline logo */}
        <div className="flex w-full flex-col items-center bg-gradient-to-r from-blue-600 via-blue-650 to-blue-700 px-6 py-8 text-center shadow-lg dark:from-blue-700 dark:via-blue-750 dark:to-blue-800">
          <div className="mb-4 h-20 w-20 border-4 border-white/30 bg-white shadow-lg xl:mb-4 xl:h-28 xl:w-28" style={{ borderRadius: '50%' }}>
            <img
              src={logo}
              alt="DSWD Caraga"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <h1 className="text-lg font-extrabold uppercase tracking-[0.2em] text-white sm:text-2xl">
            Emergency Cash Transfer Post Monitoring
          </h1>
          <div className="mx-auto mt-4 h-0.5 w-12 bg-white/30" />
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className={`w-full border-t-0 border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-10 xl:border ${shakeError ? 'animate-shake' : ''}`}
        >
          <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            Welcome back
          </h2>
          <p className="mb-7 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-5 flex items-center gap-3 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Email field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-0 flex h-14 w-14 items-center justify-center border-r border-slate-200 text-slate-400 dark:border-slate-700">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={`h-14 w-full border bg-slate-50 pl-16 pr-4 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 sm:text-base ${
                  fieldErrors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-800'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-blue-400 dark:focus:ring-blue-800'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-0 flex h-14 w-14 items-center justify-center border-r border-slate-200 text-slate-400 dark:border-slate-700">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className={`h-14 w-full border bg-slate-50 pl-16 pr-12 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 sm:text-base ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-800'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-blue-400 dark:focus:ring-blue-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember me & Forgot password */}
          <div className="mb-8 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 sm:text-base"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="relative flex w-full items-center justify-center gap-2 bg-blue-600 px-5 py-4 text-base font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-slate-900"
          >
            {isSubmitting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Developer credit */}
          <div className="mt-10 text-center">
            <div className="mx-auto mb-2 h-px w-16 bg-slate-300 dark:bg-slate-700" />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Developed by Arvin B. Edubas
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400/70 dark:text-slate-600">
              VSquared Technologies
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
