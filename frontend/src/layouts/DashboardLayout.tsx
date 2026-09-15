import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/features/auth/hooks/useLogout'

interface NavItem {
  label: string
  to: string
}

interface DashboardLayoutProps {
  navItems: NavItem[]
  children?: ReactNode
}

export function DashboardLayout({ navItems }: DashboardLayoutProps) {
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6">
        <Link to="/" className="mb-8 px-2 text-xl font-bold text-brand-600">
          LearnHub
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 pt-4">
          <p className="px-2 text-sm font-medium text-slate-900">{user?.full_name}</p>
          <p className="px-2 text-xs text-slate-500">{user?.email}</p>
          <Button variant="ghost" className="mt-3 w-full justify-start" onClick={logout}>
            Se déconnecter
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
