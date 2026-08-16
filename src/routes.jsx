import { createBrowserRouter } from 'react-router-dom'
import AppShellLayout from '@/components/layout/AppShellLayout'
import PlaceholderPage from '@/components/layout/PlaceholderPage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import StudentsPage from '@/features/students/StudentsPage'
import RevenueListPage from '@/features/revenue/RevenueListPage'
import VocabularyPage from '@/features/vocabulary/VocabularyPage'
import ReadingPage from '@/features/reading/ReadingPage'
import ListeningPage from '@/features/listening/ListeningPage'
import QuizBankPage from '@/features/quiz/QuizBankPage'
import AiContentPage from '@/features/aiContent/AiContentPage'
import UiKitchenSink from '@/pages/UiKitchenSink'
import NotFound from '@/pages/NotFound'

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
          { path: 'hoc-vien', element: <StudentsPage /> },
          { path: 'hoc-lieu/tu-vung', element: <VocabularyPage /> },
          { path: 'hoc-lieu/khoa-hoc', element: <PlaceholderPage /> },
          { path: 'hoc-lieu/bai-doc', element: <ReadingPage /> },
          { path: 'hoc-lieu/bai-nghe', element: <ListeningPage /> },
          { path: 'hoc-lieu/bai-kiem-tra', element: <QuizBankPage /> },
          { path: 'noi-dung-ai', element: <AiContentPage /> },
          { path: 'voice-ai', element: <PlaceholderPage /> },
          { path: 'doanh-thu', element: <RevenueListPage /> },
          { path: 'doi-soat', element: <PlaceholderPage /> },
          { path: 'goi-premium', element: <PlaceholderPage /> },
          { path: 'phan-quyen', element: <PlaceholderPage /> },
          { path: 'thong-bao', element: <PlaceholderPage /> },
          { path: 'bao-cao', element: <PlaceholderPage /> },
          { path: 'nhat-ky', element: <PlaceholderPage /> },
          { path: 'cai-dat', element: <PlaceholderPage /> },
        ],
      },
    ],
  },
  { path: '/ui', element: <UiKitchenSink /> },
  { path: '*', element: <NotFound /> },
])
