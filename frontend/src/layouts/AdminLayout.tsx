import { DashboardLayout } from './DashboardLayout'

const navItems = [
  { label: 'Tableau de bord', to: '/admin' },
  { label: 'Utilisateurs', to: '/admin/users' },
  { label: 'Formations', to: '/admin/courses' },
  { label: 'Catégories', to: '/admin/categories' },
  { label: 'Signalements', to: '/admin/reports' },
]

export function AdminLayout() {
  return <DashboardLayout navItems={navItems} />
}
