import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'

const ROLE_CHIPS = [
  { key: 'student', label: 'Học viên' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'admin', label: 'Quản trị viên' },
]

/**
 * Tab 1: Danh sách tất cả người dùng trong hệ thống (Học viên, Giáo viên, Quản trị viên)
 */
export default function UserListTab({
  users = [],
  isLoading = false,
  error = null,
  pagination,
  dataTable,
  columns = [],
  onRetry,
}) {
  return (
    <Card>
      {/* Thanh công cụ tìm kiếm và lọc vai trò */}
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

      {/* Bảng dữ liệu người dùng */}
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          pagination={pagination}
          onPageChange={dataTable.setPage}
          sorting={dataTable.sorting}
          onSortingChange={dataTable.setSorting}
          emptyMessage="Chưa có người dùng nào khớp bộ lọc"
          expandable
          renderExpandedRow={(user) => (
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4 py-1">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Trạng thái tài khoản</p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      user.isActive ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span>{user.isActive ? 'Đang hoạt động' : 'Đã khoá'}</span>
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">Trình độ CEFR</p>
                <span className="font-bold text-slate-800 text-sm">
                  {user.cefrLevel || 'Chưa xác định'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">Số điện thoại</p>
                <p className="text-slate-800 font-medium text-sm">{user.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">Mục tiêu học tập</p>
                <p className="text-slate-800 text-sm font-medium">
                  {user.targetGoal || 'Mặc định'}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </Card>
  )
}
