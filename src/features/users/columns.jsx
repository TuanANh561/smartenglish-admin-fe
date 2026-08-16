import { createColumnHelper } from '@tanstack/react-table'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDate, formatRelativeTime } from '@/lib/utils'

const ROLE_LABEL = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Học viên' }
const PLAN_LABEL = {
  free: 'Free',
  premium_monthly: 'Premium tháng',
  premium_yearly: 'Premium năm',
  lifetime: 'Trọn đời',
}

const columnHelper = createColumnHelper()

export const userColumns = [
  columnHelper.accessor('displayName', {
    header: 'Học viên',
    enableSorting: true,
    cell: (info) => {
      const user = info.row.original
      return (
        <div className="flex items-center gap-2.5">
          <Avatar name={user.displayName} src={user.avatarUrl} size="sm" />
          <div>
            <p className="font-medium text-navy-700">{user.displayName}</p>
            <p className="text-xs text-ink-muted">{user.email}</p>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('role', {
    header: 'Vai trò',
    enableSorting: false,
    cell: (info) => ROLE_LABEL[info.getValue()] ?? info.getValue(),
  }),
  columnHelper.accessor('plan', {
    header: 'Gói',
    enableSorting: false,
    cell: (info) => {
      const plan = info.getValue()
      return <Badge tone={plan === 'free' ? 'neutral' : 'gold'}>{PLAN_LABEL[plan] ?? plan}</Badge>
    },
  }),
  columnHelper.accessor('cefrLevel', {
    header: 'Trình độ',
    enableSorting: false,
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('isActive', {
    header: 'Trạng thái',
    enableSorting: false,
    cell: (info) => (
      <Badge tone={info.getValue() ? 'success' : 'danger'}>
        {info.getValue() ? 'Đang hoạt động' : 'Đã khoá'}
      </Badge>
    ),
  }),
  columnHelper.accessor('lastLoginAt', {
    header: 'Đăng nhập gần nhất',
    enableSorting: true,
    cell: (info) => formatRelativeTime(info.getValue()),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Ngày tạo',
    enableSorting: true,
    cell: (info) => formatDate(info.getValue()),
  }),
]

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
