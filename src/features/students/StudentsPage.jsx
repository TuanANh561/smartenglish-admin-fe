import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Download,
  GraduationCap,
  Lock,
  Shield,
  ShieldAlert,
  Unlock,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import { exportCsv } from '@/components/ui/DataTable/exportCsv'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { getUsers, lockUser, unlockUser } from '@/features/users/api'
import { buildUserColumns, userCsvColumns } from '@/features/users/columns'
import { formatNumber } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const ROLE_CHIPS = [
  { key: 'student', label: 'Học viên' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'admin', label: 'Quản trị viên' },
]

function StudentsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'admin'
  const dataTable = useDataTable()

  const [lockTarget, setLockTarget] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState({})

  const usersQuery = useQuery({
    queryKey: ['students', dataTable.params],
    queryFn: () => getUsers(dataTable.params),
  })

  const usersList = usersQuery.data?.items ?? []

  // Quick stats calculation
  const stats = useMemo(() => {
    const total = usersQuery.data?.total || usersList.length
    const studentsCount = usersList.filter((u) => u.role === 'student').length
    const teachersCount = usersList.filter((u) => u.role === 'teacher').length
    const lockedCount = usersList.filter((u) => u.isActive === false).length

    return {
      total,
      studentsCount,
      teachersCount,
      lockedCount,
    }
  }, [usersQuery.data, usersList])

  const handleToggleLock = (user) => {
    if (user.id === currentUser?.id) {
      toast.error('Bạn không thể tự khóa tài khoản quản trị viên của chính mình!')
      return
    }
    setLockTarget(user)
  }

  const handleConfirmLockToggle = async () => {
    if (!lockTarget) return
    setIsProcessing(true)

    try {
      if (lockTarget.isActive) {
        await lockUser(lockTarget.id)
        toast.success(`Đã khóa tài khoản của "${lockTarget.displayName}" (${lockTarget.email})`)
      } else {
        await unlockUser(lockTarget.id)
        toast.success(`Đã mở khóa tài khoản của "${lockTarget.displayName}" (${lockTarget.email})`)
      }
      await usersQuery.refetch()
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản!')
    } finally {
      setIsProcessing(false)
      setLockTarget(null)
    }
  }

  const columns = useMemo(() => {
    return buildUserColumns({
      isAdmin,
      onToggleLock: handleToggleLock,
      currentUser,
    })
  }, [isAdmin, currentUser])

  return (
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* ─── Header & Stats Overview ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Quản lý danh sách học viên, giáo viên và kiểm soát trạng thái tài khoản hệ thống.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              onClick={() => exportCsv(usersList, userCsvColumns, 'danh-sach-nguoi-dung')}
              className="rounded-xl font-semibold text-xs"
            >
              Xuất danh sách
            </Button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tổng người dùng
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <Users size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-800">{formatNumber(stats.total)}</p>
        </Card>

        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Học viên
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <GraduationCap size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-800">{stats.studentsCount}</p>
        </Card>

        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Giáo viên
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.teachersCount}</p>
        </Card>

        <Card className="p-4 bg-white border border-line shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tài khoản bị khóa
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <UserX size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.lockedCount}</p>
        </Card>
      </div>

      {/* ─── Main User Table Card ────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden bg-white border border-line shadow-xs">
        <div className="p-4 sm:p-5 border-b border-line">
          <DataTableToolbar
            searchValue={dataTable.search}
            onSearchChange={dataTable.setSearch}
            searchPlaceholder="Tìm theo tên hoặc email người dùng..."
          >
            <FilterChipRow
              chips={ROLE_CHIPS}
              value={dataTable.filters.role}
              onChange={(value) => dataTable.setFilter('role', value)}
            />
          </DataTableToolbar>
        </div>

        <div className="px-2 pb-2">
          <DataTable
            columns={columns}
            data={usersList}
            isLoading={usersQuery.isLoading}
            error={usersQuery.error}
            onRetry={usersQuery.refetch}
            pagination={usersQuery.data}
            onPageChange={dataTable.setPage}
            sorting={dataTable.sorting}
            onSortingChange={dataTable.setSorting}
            emptyMessage="Chưa có người dùng nào khớp bộ lọc"
            enableSelection
            onSelectionChange={setSelectedRowIds}
            expandable
            renderExpandedRow={(user) => (
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Email xác thực
                  </p>
                  <p className="mt-1 font-medium text-navy-800">
                    {user.isEmailVerified ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Đã xác thực
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Chưa xác thực</span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Mã người dùng
                  </p>
                  <p className="mt-1 font-mono text-xs text-navy-800 font-bold">{user.id}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Số bài nộp / Bài tập
                  </p>
                  <p className="mt-1 font-semibold text-navy-800">
                    {user.submissionCount ?? 0} bài
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Điểm trung bình
                  </p>
                  <p className="mt-1 font-semibold text-brand-600">
                    {user.averageScore ? `${user.averageScore}/100` : '—'}
                  </p>
                </div>

                {isAdmin && (
                  <div className="sm:col-span-4 pt-3 mt-1 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-ink-muted">
                      Quyền quản trị: Bạn có thể thay đổi trạng thái hoạt động của tài khoản này.
                    </span>
                    <Button
                      size="sm"
                      variant={user.isActive ? 'danger' : 'secondary'}
                      icon={user.isActive ? Lock : Unlock}
                      disabled={user.id === currentUser?.id}
                      onClick={() => handleToggleLock(user)}
                      className="text-xs"
                    >
                      {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </Card>

      {/* ─── Confirm Dialog Khóa / Mở Khóa Tài Khoản ─────────────────────── */}
      <ConfirmDialog
        open={Boolean(lockTarget)}
        title={lockTarget?.isActive ? 'Khóa tài khoản người dùng' : 'Mở khóa tài khoản người dùng'}
        description={
          lockTarget?.isActive
            ? `Bạn có chắc chắn muốn khóa tài khoản của "${lockTarget?.displayName}" (${lockTarget?.email})? Người dùng này sẽ tạm thời bị vô hiệu hóa quyền truy cập vào hệ thống SmartEnglish.`
            : `Xác nhận mở khóa tài khoản cho "${lockTarget?.displayName}" (${lockTarget?.email})? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.`
        }
        confirmText={
          isProcessing
            ? 'Đang xử lý...'
            : lockTarget?.isActive
            ? 'Khóa tài khoản'
            : 'Mở khóa tài khoản'
        }
        cancelText="Hủy"
        variant={lockTarget?.isActive ? 'danger' : 'primary'}
        onConfirm={handleConfirmLockToggle}
        onClose={() => {
          if (!isProcessing) setLockTarget(null)
        }}
        onCancel={() => {
          if (!isProcessing) setLockTarget(null)
        }}
        loading={isProcessing}
      />
    </main>
  )
}

export default StudentsPage
