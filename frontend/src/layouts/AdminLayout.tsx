import { LayoutDashboard, Users, BookOpen, Tag, Award } from 'lucide-react'
import { DashboardLayout } from './DashboardLayout'

const navItems = [
  { label: 'Tableau de bord', to: '/admin', icon: LayoutDashboard },
  { label: 'Utilisateurs', to: '/admin/users', icon: Users },
  { label: 'Formations', to: '/admin/courses', icon: BookOpen },
  { label: 'Catégories', to: '/admin/categories', icon: Tag },
  { label: 'Certificats', to: '/admin/certificates', icon: Award },
]

export function AdminLayout() {
  return <DashboardLayout navItems={navItems} />
}
