import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10 dark:bg-slate-950 sm:px-6">
      <div className="min-h-screen">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                <path d="M12 3a7 7 0 0 1 7 7v4.2c0 .8.3 1.6.9 2.2l.6.6a1 1 0 0 1-.7 1.7H4.2a1 1 0 0 1-.7-1.7l.6-.6c.6-.6.9-1.4.9-2.2V10a7 7 0 0 1 7-7Zm0 18a3 3 0 0 0 2.8-2H9.2A3 3 0 0 0 12 21Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              ECT Utilization Monitoring
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
              DSWD Field Office Caraga
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full rounded border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 sm:p-7"
          >
            <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
              Sign In
            </h2>

            {error && (
              <div className="mb-5 rounded border border-red-200 bg-red-50 p-4 text-base text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-14 w-full rounded border border-slate-200 bg-white px-4 py-3 text-base leading-6 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 sm:text-lg"
              />
            </div>

            <div className="mb-7">
              <label
                htmlFor="password"
                className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-14 w-full rounded border border-slate-200 bg-white px-4 py-3 text-base leading-6 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 sm:text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
