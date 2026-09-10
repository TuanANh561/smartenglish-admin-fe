import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Tabs from '@/components/ui/Tabs'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import {
  getUsers,
  lockUser,
  unlockUser,
  getTeacherRegistrations,
  approveTeacherRegistration,
  rejectTeacherRegistration,
} from './api'
import { buildUserColumns } from './columns'
import { useAuthStore } from '@/store/authStore'
import UserListTab from './components/UserListTab'
import TeacherApprovalTab from './components/TeacherApprovalTab'
import CreateUserModal from './components/CreateUserModal'

const MAIN_TABS = [
  { value: 'users', label: 'Danh sách người dùng' },
  { value: 'teacher-approvals', label: 'Phê duyệt hồ sơ Giáo viên' },
]

/**
 * Màn hình Quản Lý Người Dùng & Phê Duyệt Hồ Sơ Giáo Viên
 */
export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'admin'
  const dataTable = useDataTable()

  // State chuyển đổi giữa 2 tab
  const [activeTab, setActiveTab] = useState('users')

  // State đóng/mở modal tạo người dùng mới
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)

  // State xử lý khóa / mở khóa tài khoản
  const [lockTarget, setLockTarget] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Query lấy danh sách người dùng từ API Backend
  const usersQuery = useQuery({
    queryKey: ['users', dataTable.params],
    queryFn: () => getUsers(dataTable.params),
  })

  // 2. Query lấy danh sách hồ sơ giáo viên đăng ký từ API Backend (không dùng mock)
  const registrationsQuery = useQuery({
    queryKey: ['teacher-registrations'],
    queryFn: () => getTeacherRegistrations({ page: 1, size: 50 }),
  })

  const registrations = registrationsQuery.data?.items ?? []
  const pendingRegsCount = registrations.filter((r) => r.status === 'pending').length

  // Thao tác khóa / mở khóa người dùng
  const handleToggleLock = useCallback(
    (user) => {
      if (user.id === currentUser?.id) {
        toast.error('Bạn không thể tự khóa tài khoản quản trị viên của chính mình!')
        return
      }
      setLockTarget(user)
    },
    [currentUser?.id],
  )

  const handleConfirmLockToggle = async () => {
    if (!lockTarget) return
    setIsProcessing(true)

    try {
      if (lockTarget.isActive) {
        await lockUser(lockTarget.id)
        toast.success(`Đã khóa tài khoản của "${lockTarget.displayName}"`)
      } else {
        await unlockUser(lockTarget.id)
        toast.success(`Đã mở khóa tài khoản của "${lockTarget.displayName}"`)
      }
      await usersQuery.refetch()
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi cập nhật trạng thái!')
    } finally {
      setIsProcessing(false)
      setLockTarget(null)
    }
  }

  // Thao tác phê duyệt hồ sơ giáo viên qua API Backend
  const handleApproveTeacher = async (regId) => {
    try {
      await approveTeacherRegistration(regId, {
        note: 'Đã xác minh bằng cấp & cấp quyền Teacher Pro',
      })
      toast.success('Đã phê duyệt hồ sơ và cấp tài khoản Teacher Pro thành công!')
      await Promise.all([
        registrationsQuery.refetch(),
        usersQuery.refetch(),
      ])
    } catch (err) {
      toast.error(err?.message || 'Có lỗi khi phê duyệt hồ sơ!')
    }
  }

  // Thao tác từ chối hồ sơ giáo viên qua API Backend
  const handleRejectTeacher = async (regId) => {
    try {
      await rejectTeacherRegistration(regId, {
        note: 'Tệp minh chứng chưa đáp ứng yêu cầu',
      })
      toast.success('Đã từ chối hồ sơ đăng ký giáo viên')
      await registrationsQuery.refetch()
    } catch (err) {
      toast.error(err?.message || 'Có lỗi khi từ chối hồ sơ!')
    }
  }

  const columns = useMemo(() => {
    return buildUserColumns({
      isAdmin,
      onToggleLock: handleToggleLock,
      currentUser,
    })
  }, [isAdmin, currentUser, handleToggleLock])

  return (
    <div className="space-y-4">
      {/* Thanh điều hướng tab & Nút tạo người dùng mới */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Tabs tabs={MAIN_TABS} value={activeTab} onChange={setActiveTab} />
          {pendingRegsCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
              {pendingRegsCount} hồ sơ chờ duyệt
            </span>
          )}
        </div>

        {isAdmin && (
          <Button
            size="sm"
            icon={UserPlus}
            onClick={() => setIsCreateUserOpen(true)}
            className="bg-navy-800 hover:bg-navy-900 text-white font-semibold shadow-xs shrink-0"
          >
            Tạo tài khoản mới
          </Button>
        )}
      </div>

      {/* TAB 1: BẢNG DANH SÁCH TẤT CẢ NGƯỜI DÙNG */}
      {activeTab === 'users' && (
        <UserListTab
          users={usersQuery.data?.items ?? []}
          isLoading={usersQuery.isLoading}
          error={usersQuery.error}
          pagination={usersQuery.data}
          dataTable={dataTable}
          columns={columns}
          onRetry={usersQuery.refetch}
        />
      )}

      {/* TAB 2: BẢNG PHÊ DUYỆT HỒ SƠ GIÁO VIÊN */}
      {activeTab === 'teacher-approvals' && (
        <TeacherApprovalTab
          registrations={registrations}
          isLoading={registrationsQuery.isLoading}
          onApprove={handleApproveTeacher}
          onReject={handleRejectTeacher}
        />
      )}

      {/* MODAL TẠO TÀI KHOẢN MỚI */}
      <CreateUserModal
        open={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSuccess={() => usersQuery.refetch()}
      />

      {/* DIALOG XÁC NHẬN KHÓA / MỞ KHÓA TÀI KHOẢN */}
      <ConfirmDialog
        open={Boolean(lockTarget)}
        title={lockTarget?.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        description={
          lockTarget?.isActive
            ? `Bạn có chắc chắn muốn khóa tài khoản "${lockTarget?.displayName}" (${lockTarget?.email})?`
            : `Xác nhận mở khóa tài khoản "${lockTarget?.displayName}" (${lockTarget?.email})?`
        }
        confirmText={isProcessing ? 'Đang xử lý...' : lockTarget?.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelText="Hủy"
        variant={lockTarget?.isActive ? 'danger' : 'primary'}
        onConfirm={handleConfirmLockToggle}
        onClose={() => setLockTarget(null)}
        loading={isProcessing}
      />
    </div>
  )
}
