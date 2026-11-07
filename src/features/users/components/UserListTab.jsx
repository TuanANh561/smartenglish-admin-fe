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
  onSelectUser,
  selectedUserId,
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
          onRowClick={onSelectUser}
          selectedRowId={selectedUserId}
        />
      </div>
    </Card>
  )
}
