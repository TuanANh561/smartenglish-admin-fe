import { createColumnHelper } from '@tanstack/react-table'
import { Lock, Unlock } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'

const ROLE_LABEL = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Học viên' }
const PLAN_LABEL = {
  free: 'Free',
  premium_monthly: 'Premium tháng',
  premium_yearly: 'Premium năm',
  lifetime: 'Trọn đời',
}

const columnHelper = createColumnHelper()

export function buildUserColumns({ isAdmin = false, onToggleLock, currentUser } = {}) {
  const columns = [
    columnHelper.accessor('displayName', {
      header: 'Học viên / Người dùng',
      enableSorting: true,
      cell: (info) => {
        const user = info.row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar name={user.displayName} src={user.avatarUrl} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm">{user.displayName}</p>
                {user.id === currentUser?.id && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 border border-brand-200">
                    Bạn
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('role', {
      header: 'Vai trò',
      enableSorting: false,
      cell: (info) => (
        <span className="text-sm font-medium text-slate-700">
          {ROLE_LABEL[info.getValue()] ?? info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('plan', {
      header: 'Gói dịch vụ',
      enableSorting: false,
      cell: (info) => {
        const plan = info.getValue()
        return <Badge tone={plan === 'free' ? 'neutral' : 'gold'}>{PLAN_LABEL[plan] ?? plan}</Badge>
      },
    }),
    columnHelper.accessor('cefrLevel', {
      header: 'Trình độ',
      enableSorting: false,
      cell: (info) => (
        <span className="text-sm font-bold text-slate-800">
          {info.getValue() ?? '—'}
        </span>
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Trạng thái',
      enableSorting: false,
      cell: (info) => {
        const isActive = info.getValue()
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
            )}
          >
            {isActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Đang hoạt động</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Đã khoá</span>
              </>
            )}
          </span>
        )
      },
    }),
    columnHelper.accessor('lastLoginAt', {
      header: 'Đăng nhập gần nhất',
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-slate-600">
          {formatRelativeTime(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Ngày tạo',
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-slate-600">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
  ]

  // Thêm cột Thao tác khoá / mở khoá tài khoản nếu là Quản trị viên (Admin)
  if (isAdmin) {
    columns.push(
      columnHelper.display({
        id: 'actions',
        header: () => 'Thao tác',
        meta: { align: 'right' },
        cell: (info) => {
          const user = info.row.original
          const isSelf = currentUser?.id === user.id
          const isActive = user.isActive

          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              {isActive ? (
                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() => onToggleLock?.(user)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs',
                    isSelf
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-ink-muted'
                      : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 hover:shadow-xs active:scale-95',
                  )}
                  title={
                    isSelf
                      ? 'Không thể tự khoá tài khoản quản trị viên của chính bạn'
                      : 'Khoá tài khoản người dùng này'
                  }
                >
                  <Lock size={13} strokeWidth={2} />
                  Khoá tài khoản
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() => onToggleLock?.(user)}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-xs active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Mở khoá tài khoản người dùng này"
                >
                  <Unlock size={13} strokeWidth={2} />
                  Mở khoá
                </button>
              )}
            </div>
          )
        },
      }),
    )
  }

  return columns
}

export const userColumns = buildUserColumns({ isAdmin: false })

/** Cột phẳng dùng khi xuất CSV — không lấy JSX từ userColumns. */
export const userCsvColumns = [
  { key: 'displayName', label: 'Họ tên' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Vai trò', value: (row) => ROLE_LABEL[row.role] ?? row.role },
  { key: 'plan', label: 'Gói', value: (row) => PLAN_LABEL[row.plan] ?? row.plan },
  { key: 'cefrLevel', label: 'Trình độ' },
  { key: 'isActive', label: 'Trạng thái', value: (row) => (row.isActive ? 'Đang hoạt động' : 'Đã khoá') },
  { key: 'createdAt', label: 'Ngày tạo', value: (row) => formatDate(row.createdAt) },
]
