import { type ReactNode } from 'react'
import { Link, useLocation, type Location } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  isActive?: (location: Location) => boolean
}

interface AppShellProps {
  title: string
  subtitle?: string
  action?: ReactNode
  backTo?: string
  backLabel?: string
  showNav?: boolean
  navItems?: NavItem[]
  children: ReactNode
}

export function AppShell({
  title,
  subtitle,
  action,
  backTo,
  backLabel = 'Back',
  showNav = true,
  navItems = [],
  children,
}: AppShellProps) {
  const location = useLocation()
  const hasNav = showNav && navItems.length > 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(59,130,246,0.18),transparent)] dark:bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(59,130,246,0.22),transparent)]">
        <header className="sticky top-0 z-20 bg-blue-600 text-white shadow-lg dark:bg-blue-700">
          <div className="flex items-center justify-between px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              {backTo && (
                <Link
                  to={backTo}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label={backLabel}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
                {subtitle && (
                  <p className="text-base text-blue-100 sm:text-lg">{subtitle}</p>
                )}
              </div>
            </div>
            {action && <div className="text-base font-semibold">{action}</div>}
          </div>
        </header>

        <main className={`px-5 py-5 sm:px-6 ${hasNav ? 'pb-28' : 'pb-8'}`}>
          {children}
        </main>

        {hasNav && (
          <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = item.isActive
                  ? item.isActive(location)
                  : location.pathname === item.to
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-base font-semibold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="h-6 w-6">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
