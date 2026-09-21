import { LayoutDashboard, BookOpen, PlusCircle } from 'lucide-react'
import { DashboardLayout } from './DashboardLayout'

const navItems = [
  { label: 'Tableau de bord', to: '/instructor', icon: LayoutDashboard },
  { label: 'Mes formations', to: '/instructor/courses', icon: BookOpen },
  { label: 'Créer une formation', to: '/instructor/courses/new', icon: PlusCircle },
]

export function InstructorLayout() {
  return <DashboardLayout navItems={navItems} />
}
