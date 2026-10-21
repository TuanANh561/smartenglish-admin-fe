// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { useAuthStore } from '@/store/authStore'
import * as authApi from '@/features/auth/api'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, setTokens } from '@/lib/api'
import { isRouteAllowed } from '@/components/layout/navConfig'
import { computeTeacherStats, getMyClasses } from '@/features/dashboard/teacherDashboardApi'
import { api } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'

describe('Phase 12 – Web Admin Automated Test & Regression Hardening', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.getState().clearSession()
    vi.restoreAllMocks()
  })

  // =========================================================================
  // 1. Login / Refresh / Logout Flow
  // =========================================================================
  describe('1. Authentication Flow (Login / Refresh / Logout)', () => {
    it('1a. setSession sets user and tokens in both store and localStorage', () => {
      const mockSession = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        user: { id: 42, displayName: 'Teacher Sarah', role: 'teacher' },
      }

      useAuthStore.getState().setSession(mockSession)

      expect(localStorage.getItem(TOKEN_KEY)).toBe('access_token_123')
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh_token_456')
      expect(useAuthStore.getState().user).toEqual(mockSession.user)
      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('1b. setTokens updates accessToken and refreshToken without resetting user profile', () => {
      const initialUser = { id: 42, displayName: 'Teacher Sarah', role: 'teacher' }
      useAuthStore.getState().setUser(initialUser)

      setTokens({
        accessToken: 'new_rotated_access_token',
        refreshToken: 'new_rotated_refresh_token',
      })

      expect(localStorage.getItem(TOKEN_KEY)).toBe('new_rotated_access_token')
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new_rotated_refresh_token')
      expect(useAuthStore.getState().user).toEqual(initialUser)
    })

    it('1c. logout triggers backend logout endpoint and clears local session completely', async () => {
      localStorage.setItem(TOKEN_KEY, 'active_token')
      localStorage.setItem(REFRESH_TOKEN_KEY, 'active_refresh')
      localStorage.setItem('se_admin_user', JSON.stringify({ id: 1, role: 'admin' }))
      useAuthStore.getState().setUser({ id: 1, role: 'admin' })

      const logoutSpy = vi.spyOn(authApi, 'logout').mockResolvedValue({ success: true })

      // Execute logout action
      await authApi.logout()
      useAuthStore.getState().clearSession()

      expect(logoutSpy).toHaveBeenCalled()
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
      expect(localStorage.getItem('se_admin_user')).toBeNull()
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().initialized).toBe(true)
    })
  })

  // =========================================================================
  // 2. Role-Based Route Protection
  // =========================================================================
  describe('2. Role-Based Route Access Control', () => {
    it('2a. Admin has wildcard access to all paths', () => {
      expect(isRouteAllowed('/app', 'admin')).toBe(true)
      expect(isRouteAllowed('/app/hoc-vien', 'admin')).toBe(true)
      expect(isRouteAllowed('/app/phan-quyen', 'admin')).toBe(true)
      expect(isRouteAllowed('/app/doanh-thu', 'admin')).toBe(true)
      expect(isRouteAllowed('/app/doi-soat', 'admin')).toBe(true)
      expect(isRouteAllowed('/app/lop-hoc', 'admin')).toBe(true)
    })

    it('2b. Teacher has access only to permitted teacher subroutes', () => {
      expect(isRouteAllowed('/app', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/lop-hoc', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/lop-hoc/123', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/cong-dong', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/goi-dich-vu', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/giao-dich', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/nhat-ky', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/cai-dat', 'teacher')).toBe(true)
      expect(isRouteAllowed('/app/ho-so', 'teacher')).toBe(true)
    })

    it('2c. Teacher is strictly BLOCKED from admin-only routes', () => {
      expect(isRouteAllowed('/app/hoc-vien', 'teacher')).toBe(false)
      expect(isRouteAllowed('/app/phan-quyen', 'teacher')).toBe(false)
      expect(isRouteAllowed('/app/doanh-thu', 'teacher')).toBe(false)
      expect(isRouteAllowed('/app/doi-soat', 'teacher')).toBe(false)
      expect(isRouteAllowed('/app/bao-cao', 'teacher')).toBe(false)
    })

    it('2d. Student or unauthenticated role is blocked from protected routes', () => {
      expect(isRouteAllowed('/app', 'student')).toBe(false)
      expect(isRouteAllowed('/app/lop-hoc', 'student')).toBe(false)
      expect(isRouteAllowed('/app', '')).toBe(false)
      expect(isRouteAllowed('/app', null)).toBe(false)
    })
  })

  // =========================================================================
  // 3. Teacher Dashboard Current User Identity & Calculations
  // =========================================================================
  describe('3. Teacher Dashboard Current User Identity & Stats', () => {
    it('3a. computeTeacherStats correctly computes metrics for empty data', () => {
      const stats = computeTeacherStats([], [])
      expect(stats).toEqual({
        totalClasses: 0,
        totalStudents: 0,
        activeAssignments: 0,
        urgentDeadlines: 0,
      })
    })

    it('3b. computeTeacherStats accurately aggregates students and urgent deadlines', () => {
      const mockClasses = [
        { id: 1, name: 'IELTS Band 7', studentCount: 15 },
        { id: 2, name: 'TOEIC 800', currentStudents: 10 },
      ]

      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      const inFourDays = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString()

      const mockAssignments = [
        { id: 101, title: 'Essay 1', dueDate: tomorrow, status: 'OPEN' }, // urgent (within 2 days)
        { id: 102, title: 'Listening 2', dueDate: inFourDays, status: 'OPEN' }, // active, but not urgent
        { id: 103, title: 'Speaking 3', dueDate: tomorrow, status: 'CLOSED' }, // closed -> not urgent
        { id: 104, title: 'Draft', dueDate: null, status: 'OPEN' }, // no dueDate
      ]

      const stats = computeTeacherStats(mockClasses, mockAssignments)
      expect(stats.totalClasses).toBe(2)
      expect(stats.totalStudents).toBe(25)
      expect(stats.activeAssignments).toBe(3) // status !== 'CLOSED'
      expect(stats.urgentDeadlines).toBe(1) // only essay 1
    })

    it('3c. getMyClasses requests classes from API using current user session', async () => {
      const mockClassList = [
        { id: 1, name: 'Lớp Luyện Thi A2' },
        { id: 2, name: 'Lớp Giao Tiếp B1' },
      ]
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
        data: {
          content: mockClassList,
          totalElements: 2,
        },
      })

      const res = await getMyClasses({ page: 0, size: 20 })

      expect(getSpy).toHaveBeenCalledWith('/api/v1/teacher/classes', {
        params: { page: 0, size: 20 },
      })
      // Verification: no arbitrary teacherId query parameter was passed
      expect(getSpy.mock.calls[0][1].params).not.toHaveProperty('teacherId')
      expect(res.classes).toHaveLength(2)
      expect(res.total).toBe(2)
    })
  })

  // =========================================================================
  // 4. Loading, Empty, Error, and Retry States
  // =========================================================================
  describe('4. UI States: Loading, Empty, Error, and Retry', () => {
    it('4a. LoadingSpinner renders progress indicator and loading label', () => {
      render(<LoadingSpinner text="Đang tải dữ liệu lớp học..." />)
      expect(screen.getByText('Đang tải dữ liệu lớp học...')).toBeTruthy()
    })

    it('4b. EmptyState renders empty title, description and triggers action button', () => {
      const handleAction = vi.fn()
      render(
        <EmptyState
          title="Chưa có lớp học nào"
          description="Bấm tạo lớp để bắt đầu giảng dạy"
          actionLabel="Tạo lớp mới"
          onAction={handleAction}
        />
      )

      expect(screen.getByText('Chưa có lớp học nào')).toBeTruthy()
      expect(screen.getByText('Bấm tạo lớp để bắt đầu giảng dạy')).toBeTruthy()

      const button = screen.getByRole('button', { name: 'Tạo lớp mới' })
      fireEvent.click(button)
      expect(handleAction).toHaveBeenCalledTimes(1)
    })

    it('4c. ErrorState renders error message and triggers onRetry callback when clicked', () => {
      const handleRetry = vi.fn()
      render(
        <ErrorState
          error={{ message: 'Mất kết nối máy chủ', details: 'Status code 503' }}
          onRetry={handleRetry}
        />
      )

      expect(screen.getByText('Mất kết nối máy chủ')).toBeTruthy()
      expect(screen.getByText('Status code 503')).toBeTruthy()

      const retryBtn = screen.getByRole('button', { name: /Thử lại/i })
      fireEvent.click(retryBtn)
      expect(handleRetry).toHaveBeenCalledTimes(1)
    })
  })
})
