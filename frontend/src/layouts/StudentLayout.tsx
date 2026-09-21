import { LayoutDashboard, Compass, BookOpen, Award, Heart } from 'lucide-react'
import { DashboardLayout } from './DashboardLayout'

const navItems = [
  { label: 'Tableau de bord', to: '/student', icon: LayoutDashboard },
  { label: 'Découvrir', to: '/student/discover', icon: Compass },
  { label: 'Mes formations', to: '/student/courses', icon: BookOpen },
  { label: 'Mes certificats', to: '/student/certificates', icon: Award },
  { label: 'Favoris', to: '/student/wishlist', icon: Heart },
]

export function StudentLayout() {
  return <DashboardLayout navItems={navItems} />
}
