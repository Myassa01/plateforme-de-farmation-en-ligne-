import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { InstructorLayout } from '@/layouts/InstructorLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { AdminCoursesPage } from '@/pages/admin/AdminCoursesPage'
import { AdminCreateCoursePage } from '@/pages/admin/AdminCreateCoursePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { CreateCoursePage } from '@/pages/instructor/CreateCoursePage'
import { InstructorCoursesPage } from '@/pages/instructor/InstructorCoursesPage'
import { InstructorDashboardPage } from '@/pages/instructor/InstructorDashboardPage'
import { CourseDetailsPage } from '@/pages/public/CourseDetailsPage'
import { CoursesPage } from '@/pages/public/CoursesPage'
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { NotificationsPage } from '@/pages/shared/NotificationsPage'
import { ProfilePage } from '@/pages/shared/ProfilePage'
import { CertificatesPage } from '@/pages/student/CertificatesPage'
import { MyCoursesPage } from '@/pages/student/MyCoursesPage'
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage'
import { WishlistPage } from '@/pages/student/WishlistPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailsPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/courses" element={<MyCoursesPage />} />
            <Route path="/student/certificates" element={<CertificatesPage />} />
            <Route path="/student/wishlist" element={<WishlistPage />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['instructor']} />}>
          <Route element={<InstructorLayout />}>
            <Route path="/instructor" element={<InstructorDashboardPage />} />
            <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
            <Route path="/instructor/courses/new" element={<CreateCoursePage />} />
            <Route path="/instructor/notifications" element={<NotificationsPage />} />
            <Route path="/instructor/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/courses/new" element={<AdminCreateCoursePage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
