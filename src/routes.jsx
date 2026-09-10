import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/landing/LandingPage'
import AppShellLayout from '@/components/layout/AppShellLayout'
import PlaceholderPage from '@/components/layout/PlaceholderPage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AiContentPage from '@/features/aiContent/AiContentPage'
import AuditLogPage from '@/features/auditLog/AuditLogPage'
import LoginPage from '@/features/auth/LoginPage'
import RegisterTeacherPage from '@/features/auth/RegisterTeacherPage'
import TeacherClassesPage from '@/features/classes/TeacherClassesPage'
import CommunityPage from '@/features/community/CommunityPage'
import CourseDetailPage from '@/features/courses/CourseDetailPage'
import CoursesPage from '@/features/courses/CoursesPage'
import CreateCoursePage from '@/features/courses/CreateCoursePage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import GrammarPage from '@/features/grammar/GrammarPage'
import ListeningPage from '@/features/listening/ListeningPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import PermissionsPage from '@/features/permissions/PermissionsPage'
import PremiumPage from '@/features/premium/PremiumPage'
import TeacherPackagesPage from '@/features/premium/TeacherPackagesPage'
import PronunciationPage from '@/features/pronunciation/PronunciationPage'
import QuizBankPage from '@/features/quiz/QuizBankPage'
import ReadingPage from '@/features/reading/ReadingPage'
import ReportsPage from '@/features/reports/ReportsPage'
import RevenueListPage from '@/features/revenue/RevenueListPage'
import SettingsPage from '@/features/settings/SettingsPage'
import StudentsPage from '@/features/students/StudentsPage'
import TransactionsPage from '@/features/transactions/TransactionsPage'
import VocabularyPage from '@/features/vocabulary/VocabularyPage'
import VocabularyFormPage from '@/features/vocabulary/VocabularyFormPage'
import ReadingFormPage from '@/features/reading/ReadingFormPage'
import ListeningFormPage from '@/features/listening/ListeningFormPage'
import GrammarFormPage from '@/features/grammar/GrammarFormPage'
import PronunciationFormPage from '@/features/pronunciation/PronunciationFormPage'
import NotFound from '@/pages/NotFound'
import UiKitchenSink from '@/pages/UiKitchenSink'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/dang-nhap', element: <LoginPage /> },
  { path: '/dang-ky-giao-vien', element: <RegisterTeacherPage /> },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShellLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'cong-dong', element: <CommunityPage /> },
          { path: 'lop-hoc', element: <TeacherClassesPage /> },
          { path: 'hoc-vien', element: <StudentsPage /> },
          { path: 'hoc-lieu/tu-vung', element: <VocabularyPage /> },
          { path: 'hoc-lieu/tu-vung/tao-moi', element: <VocabularyFormPage /> },
          { path: 'hoc-lieu/tu-vung/:id/chinh-sua', element: <VocabularyFormPage /> },
          { path: 'hoc-lieu/ngu-phap', element: <GrammarPage /> },
          { path: 'hoc-lieu/ngu-phap/tao-moi', element: <GrammarFormPage /> },
          { path: 'hoc-lieu/ngu-phap/:id/chinh-sua', element: <GrammarFormPage /> },
          { path: 'hoc-lieu/phat-am', element: <PronunciationPage /> },
          { path: 'hoc-lieu/phat-am/tao-moi', element: <PronunciationFormPage /> },
          { path: 'hoc-lieu/phat-am/:id/chinh-sua', element: <PronunciationFormPage /> },
          { path: 'hoc-lieu/khoa-hoc', element: <CoursesPage /> },
          { path: 'hoc-lieu/khoa-hoc/tao-moi', element: <CreateCoursePage /> },
          { path: 'hoc-lieu/khoa-hoc/:id', element: <CourseDetailPage /> },
          { path: 'hoc-lieu/khoa-hoc/:id/chinh-sua', element: <CreateCoursePage /> },
          { path: 'hoc-lieu/bai-doc', element: <ReadingPage /> },
          { path: 'hoc-lieu/bai-doc/tao-moi', element: <ReadingFormPage /> },
          { path: 'hoc-lieu/bai-doc/:id/chinh-sua', element: <ReadingFormPage /> },
          { path: 'hoc-lieu/bai-nghe', element: <ListeningPage /> },
          { path: 'hoc-lieu/bai-nghe/tao-moi', element: <ListeningFormPage /> },
          { path: 'hoc-lieu/bai-nghe/:id/chinh-sua', element: <ListeningFormPage /> },
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
  // Redirects tiện ích cho đường dẫn học liệu không kèm tiền tố /app
  { path: '/hoc-lieu/tu-vung', element: <Navigate to="/app/hoc-lieu/tu-vung" replace /> },
  { path: '/hoc-lieu/tu-vung/tao-moi', element: <Navigate to="/app/hoc-lieu/tu-vung/tao-moi" replace /> },
  { path: '/hoc-lieu/tu-vung/:id/chinh-sua', element: <Navigate to="/app/hoc-lieu/tu-vung/:id/chinh-sua" replace /> },
  { path: '*', element: <NotFound /> },
])
