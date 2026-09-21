import { Outlet } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { DashboardTopbar } from './DashboardTopbar'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  navItems: NavItem[]
}

export function DashboardLayout({ navItems }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <DashboardTopbar navItems={navItems} />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
