import { createBrowserRouter } from 'react-router-dom'
import AppShellLayout from '@/components/layout/AppShellLayout'
import PlaceholderPage from '@/components/layout/PlaceholderPage'
import UiKitchenSink from '@/pages/UiKitchenSink'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShellLayout />,
    children: [
      { index: true, element: <PlaceholderPage /> },
      { path: 'du-lieu-chi-tiet', element: <PlaceholderPage /> },
      { path: 'hoc-vien', element: <PlaceholderPage /> },
      { path: 'hoc-lieu/tu-vung', element: <PlaceholderPage /> },
      { path: 'hoc-lieu/khoa-hoc', element: <PlaceholderPage /> },
      { path: 'hoc-lieu/bai-doc', element: <PlaceholderPage /> },
      { path: 'hoc-lieu/bai-kiem-tra', element: <PlaceholderPage /> },
      { path: 'noi-dung-ai', element: <PlaceholderPage /> },
      { path: 'voice-ai', element: <PlaceholderPage /> },
      { path: 'doanh-thu', element: <PlaceholderPage /> },
      { path: 'doi-soat', element: <PlaceholderPage /> },
      { path: 'goi-premium', element: <PlaceholderPage /> },
      { path: 'phan-quyen', element: <PlaceholderPage /> },
      { path: 'thong-bao', element: <PlaceholderPage /> },
      { path: 'bao-cao', element: <PlaceholderPage /> },
      { path: 'nhat-ky', element: <PlaceholderPage /> },
      { path: 'cai-dat', element: <PlaceholderPage /> },
    ],
  },
  { path: '/ui', element: <UiKitchenSink /> },
  { path: '*', element: <NotFound /> },
])
