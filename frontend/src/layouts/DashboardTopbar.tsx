import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, LogOut, Search, User as UserIcon } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useNotifications } from '@/features/notifications/hooks'
import { resolveMediaUrl } from '@/utils/media'
import { clsx } from '@/utils/clsx'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface DashboardTopbarProps {
  navItems: NavItem[]
}

const notificationsPathByRole: Record<string, string> = {
  student: '/student/notifications',
  instructor: '/instructor/notifications',
}

const profilePathByRole: Record<string, string> = {
  student: '/student/profile',
  instructor: '/instructor/profile',
  admin: '/admin/profile',
}

export function DashboardTopbar({ navItems }: DashboardTopbarProps) {
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const notificationsPath = user ? notificationsPathByRole[user.role] : undefined
  const { data: notifications } = useNotifications()
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = search.trim()
    navigate(trimmed ? `/courses?search=${encodeURIComponent(trimmed)}` : '/courses')
  }

  if (!user) return null

  return (
    <header className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 sm:gap-4 sm:px-6">
      <span className="shrink-0 text-xl font-bold text-brand-600">LearnHub</span>

      <nav className="hidden items-center gap-1 lg:flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student' || item.to === '/instructor' || item.to === '/admin'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
              )
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={2.25} />
            <span className="whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <form onSubmit={handleSearchSubmit} className="order-last w-full sm:order-none sm:max-w-xs sm:flex-1">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {notificationsPath && (
          <Link
            to={notificationsPath}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
        )}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-semibold text-white">
              {user.avatar_url ? (
                <img
                  src={resolveMediaUrl(user.avatar_url) ?? undefined}
                  alt={user.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.full_name.charAt(0).toUpperCase()
              )}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
              <div className="truncate px-3 py-2 text-xs text-slate-500">{user.email}</div>

              <div className="border-t border-slate-100 pt-1 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <item.icon className="h-4 w-4" strokeWidth={2} />
                    {item.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-slate-100" />
              </div>

              <Link
                to={profilePathByRole[user.role] ?? '/'}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <UserIcon className="h-4 w-4" strokeWidth={2} />
                Mon profil
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
