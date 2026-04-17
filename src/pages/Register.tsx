import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/dswd-caraga-logo.jpg'

type FieldErrors = {
  name?: string
  email?: string
  position?: string
  contactNo?: string
  password?: string
  passwordConfirmation?: string
}

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [position, setPosition] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shakeError, setShakeError] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const errors: FieldErrors = {}

    if (!name) {
      errors.name = 'Name is required'
    }

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!position) {
      errors.position = 'Position is required'
    }

    if (!contactNo) {
      errors.contactNo = 'Contact number is required'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password'
    } else if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match'
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
      await register(name, email, password, passwordConfirmation, position, contactNo, rememberMe)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors: Record<string, string[] | undefined> = err.response.data?.errors ?? {}
        const mapped: FieldErrors = {}
        if (apiErrors.name?.[0]) mapped.name = apiErrors.name[0]
        if (apiErrors.email?.[0]) mapped.email = apiErrors.email[0]
        if (apiErrors.position?.[0]) mapped.position = apiErrors.position[0]
        if (apiErrors.contact_no?.[0]) mapped.contactNo = apiErrors.contact_no[0]
        if (apiErrors.password?.[0]) mapped.password = apiErrors.password[0]
        setFieldErrors(mapped)
      } else {
        setError('Registration failed. Please try again.')
      }
      triggerShake()
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (hasError: boolean, hasRightIcon = false) =>
    `h-14 w-full border bg-slate-50 pl-16 ${hasRightIcon ? 'pr-12' : 'pr-4'} text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 sm:text-base ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-800'
        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-blue-400 dark:focus:ring-blue-800'
    }`

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-100 dark:bg-slate-950 xl:static xl:min-h-screen xl:items-center xl:justify-center xl:px-6 xl:py-8">
      <div className="flex w-full flex-1 flex-col items-center animate-fade-in-up xl:max-w-lg xl:flex-none">
        {/* Header with inline logo */}
        <div className="flex w-full flex-col items-center bg-gradient-to-r from-blue-600 via-blue-650 to-blue-700 px-6 py-8 text-center shadow-lg dark:from-blue-700 dark:via-blue-750 dark:to-blue-800">
          <div className="mb-4 h-20 w-20 border-4 border-white/30 bg-white shadow-lg xl:h-28 xl:w-28" style={{ borderRadius: '50%' }}>
            <img
              src={logo}
              alt="DSWD Caraga"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <h1 className="text-lg font-extrabold uppercase tracking-[0.2em] text-white sm:text-2xl">
            <span className="block">Emergency Cash Transfer</span>
            <span className="block">Post Monitoring</span>
          </h1>
          <div className="mx-auto mt-4 h-0.5 w-12 bg-white/30" />
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className={`flex w-full flex-1 flex-col bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-10 xl:flex-none xl:border xl:border-t-0 xl:border-slate-200 ${shakeError ? 'animate-shake' : ''}`}
        >
          <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            Create your account
          </h2>
          <p className="mb-7 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Register for a new account
          </p>

          {error && (
            <div className="mb-5 flex items-center gap-3 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-5">
            <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full Name
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-0 flex h-14 w-14 items-center justify-center border-r border-slate-200 text-slate-400 dark:border-slate-700">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  clearFieldError('name')
                }}
                required
                autoComplete="name"
                placeholder="Juan Dela Cruz"
                className={inputClass(!!fieldErrors.name)}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                  clearFieldError('email')
                }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass(!!fieldErrors.email)}
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

          {/* Position */}
          <div className="mb-5">
            <label htmlFor="position" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Position
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-0 flex h-14 w-14 items-center justify-center border-r border-slate-200 text-slate-400 dark:border-slate-700">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75V5h2.5A2.5 2.5 0 0119 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 011 16.5v-9A2.5 2.5 0 013.5 5H6V3.75zm7 0V5H7V3.75c0-.69.56-1.25 1.25-1.25h3.5c.69 0 1.25.56 1.25 1.25z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="position"
                type="text"
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value)
                  clearFieldError('position')
                }}
                required
                autoComplete="organization-title"
                placeholder="Field Officer"
                className={inputClass(!!fieldErrors.position)}
              />
            </div>
            {fieldErrors.position && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                {fieldErrors.position}
              </p>
            )}
          </div>

          {/* Contact No. */}
          <div className="mb-5">
            <label htmlFor="contactNo" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contact No.
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-0 flex h-14 w-14 items-center justify-center border-r border-slate-200 text-slate-400 dark:border-slate-700">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="contactNo"
                type="tel"
                value={contactNo}
                onChange={(e) => {
                  setContactNo(e.target.value)
                  clearFieldError('contactNo')
                }}
                required
                autoComplete="tel"
                placeholder="09171234567"
                className={inputClass(!!fieldErrors.contactNo)}
              />
            </div>
            {fieldErrors.contactNo && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                {fieldErrors.contactNo}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                  clearFieldError('password')
                }}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={inputClass(!!fieldErrors.password, true)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
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

          {/* Confirm Password */}
          <div className="mb-5">
            <label htmlFor="passwordConfirmation" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Confirm Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-0 flex h-14 w-14 items-center justify-center border-r border-slate-200 text-slate-400 dark:border-slate-700">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="passwordConfirmation"
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value)
                  clearFieldError('passwordConfirmation')
                }}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                className={inputClass(!!fieldErrors.passwordConfirmation, true)}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation((v) => !v)}
                className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPasswordConfirmation ? (
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
            {fieldErrors.passwordConfirmation && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                {fieldErrors.passwordConfirmation}
              </p>
            )}
          </div>

          {/* Remember me (default unchecked — opt-in persistence on shared machines) */}
          <div className="mb-8 flex items-center">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
              />
              Remember me
            </label>
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
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>

          {/* Developer credit */}
          <div className="mt-auto pt-6 text-center">
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
