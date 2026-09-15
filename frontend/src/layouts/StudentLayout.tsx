import { DashboardLayout } from './DashboardLayout'

const navItems = [
  { label: 'Tableau de bord', to: '/student' },
  { label: 'Mes formations', to: '/student/courses' },
  { label: 'Mes certificats', to: '/student/certificates' },
  { label: 'Favoris', to: '/student/wishlist' },
  { label: 'Notifications', to: '/student/notifications' },
  { label: 'Profil', to: '/student/profile' },
]

export function StudentLayout() {
  return <DashboardLayout navItems={navItems} />
}
