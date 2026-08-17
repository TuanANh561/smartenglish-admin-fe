import { createBrowserRouter } from 'react-router-dom'
import AppShellLayout from '@/components/layout/AppShellLayout'
import PlaceholderPage from '@/components/layout/PlaceholderPage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AiContentPage from '@/features/aiContent/AiContentPage'
import AuditLogPage from '@/features/auditLog/AuditLogPage'
import LoginPage from '@/features/auth/LoginPage'
import TeacherClassesPage from '@/features/classes/TeacherClassesPage'
import CourseDetailPage from '@/features/courses/CourseDetailPage'
import CoursesPage from '@/features/courses/CoursesPage'
import CreateCoursePage from '@/features/courses/CreateCoursePage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ListeningPage from '@/features/listening/ListeningPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import PermissionsPage from '@/features/permissions/PermissionsPage'
import PremiumPage from '@/features/premium/PremiumPage'
import TeacherPackagesPage from '@/features/premium/TeacherPackagesPage'
import QuizBankPage from '@/features/quiz/QuizBankPage'
import ReadingPage from '@/features/reading/ReadingPage'
import ReportsPage from '@/features/reports/ReportsPage'
import RevenueListPage from '@/features/revenue/RevenueListPage'
import SettingsPage from '@/features/settings/SettingsPage'
import StudentsPage from '@/features/students/StudentsPage'
import TransactionsPage from '@/features/transactions/TransactionsPage'
import VocabularyPage from '@/features/vocabulary/VocabularyPage'
import NotFound from '@/pages/NotFound'
import UiKitchenSink from '@/pages/UiKitchenSink'

export const router = createBrowserRouter([
  { path: '/dang-nhap', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShellLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'du-lieu-chi-tiet', element: <PlaceholderPage /> },
          { path: 'lop-hoc', element: <TeacherClassesPage /> },
          { path: 'hoc-vien', element: <StudentsPage /> },
          { path: 'hoc-lieu/tu-vung', element: <VocabularyPage /> },
          { path: 'hoc-lieu/khoa-hoc', element: <CoursesPage /> },
          { path: 'hoc-lieu/khoa-hoc/tao-moi', element: <CreateCoursePage /> },
          { path: 'hoc-lieu/khoa-hoc/:id', element: <CourseDetailPage /> },
          { path: 'hoc-lieu/khoa-hoc/:id/chinh-sua', element: <CreateCoursePage /> },
          { path: 'hoc-lieu/bai-doc', element: <ReadingPage /> },
          { path: 'hoc-lieu/bai-nghe', element: <ListeningPage /> },
          { path: 'hoc-lieu/bai-kiem-tra', element: <QuizBankPage /> },
          { path: 'noi-dung-ai', element: <AiContentPage /> },
          { path: 'voice-ai', element: <PlaceholderPage /> },
          { path: 'doanh-thu', element: <RevenueListPage /> },
          { path: 'doi-soat', element: <TransactionsPage /> },
          { path: 'goi-premium', element: <PremiumPage /> },
          { path: 'goi-dich-vu', element: <TeacherPackagesPage /> },
          { path: 'phan-quyen', element: <PermissionsPage /> },
          { path: 'thong-bao', element: <NotificationsPage /> },
          { path: 'bao-cao', element: <ReportsPage /> },
          { path: 'nhat-ky', element: <AuditLogPage /> },
          { path: 'cai-dat', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '/ui', element: <UiKitchenSink /> },
  { path: '*', element: <NotFound /> },
])
