import { DashboardLayout } from './DashboardLayout'

const navItems = [
  { label: 'Tableau de bord', to: '/instructor' },
  { label: 'Mes formations', to: '/instructor/courses' },
  { label: 'Créer une formation', to: '/instructor/courses/new' },
  { label: 'Étudiants', to: '/instructor/students' },
  { label: 'Statistiques', to: '/instructor/analytics' },
  { label: 'Notifications', to: '/instructor/notifications' },
  { label: 'Profil', to: '/instructor/profile' },
]

export function InstructorLayout() {
  return <DashboardLayout navItems={navItems} />
}
