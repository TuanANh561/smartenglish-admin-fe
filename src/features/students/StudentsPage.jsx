import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { getUsers, lockUser, unlockUser } from '@/features/users/api'
import { buildUserColumns } from '@/features/users/columns'
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

  const usersQuery = useQuery({
    queryKey: ['students', dataTable.params],
    queryFn: () => getUsers(dataTable.params),
  })

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

  const columns = useMemo(() => {
    return buildUserColumns({
      isAdmin,
      onToggleLock: handleToggleLock,
      currentUser,
    })
  }, [isAdmin, currentUser])

  return (
    <main className="flex-1 bg-canvas p-6 space-y-5">
      <Card>
        <DataTableToolbar
          searchValue={dataTable.search}
          onSearchChange={dataTable.setSearch}
          searchPlaceholder="Tìm theo tên hoặc email..."
        >
          <FilterChipRow
            chips={ROLE_CHIPS}
            value={dataTable.filters.role}
            onChange={(value) => dataTable.setFilter('role', value)}
          />
        </DataTableToolbar>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={usersQuery.data?.items ?? []}
            isLoading={usersQuery.isLoading}
            error={usersQuery.error}
            onRetry={usersQuery.refetch}
            pagination={usersQuery.data}
            onPageChange={dataTable.setPage}
            sorting={dataTable.sorting}
            onSortingChange={dataTable.setSorting}
            emptyMessage="Chưa có người dùng nào khớp bộ lọc"
            enableSelection
            expandable
            renderExpandedRow={(user) => (
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-ink-muted">Email xác thực</p>
                  <p className="text-ink">{user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Mã người dùng</p>
                  <p className="font-mono text-ink">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Số bài nộp</p>
                  <p className="text-ink">{user.submissionCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Điểm trung bình</p>
                  <p className="text-ink">{user.averageScore ?? '—'}</p>
                </div>
              </div>
            )}
          />
        </div>
      </Card>

      {/* ─── Confirm Dialog Khóa / Mở Khóa Tài Khoản ─────────────────────── */}
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
    </main>
  )
}

export default StudentsPage
