import { useQuery } from '@tanstack/react-query'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { getUsers } from '@/features/users/api'
import { userColumns } from '@/features/users/columns'

const ROLE_CHIPS = [
  { key: 'student', label: 'Học viên' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'admin', label: 'Quản trị viên' },
]

function StudentsPage() {
  const dataTable = useDataTable()
  const usersQuery = useQuery({
    queryKey: ['students', dataTable.params],
    queryFn: () => getUsers(dataTable.params),
  })

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
            columns={userColumns}
            data={usersQuery.data?.items ?? []}
            isLoading={usersQuery.isLoading}
            error={usersQuery.error}
            onRetry={usersQuery.refetch}
            pagination={usersQuery.data}
            onPageChange={dataTable.setPage}
            sorting={dataTable.sorting}
            onSortingChange={dataTable.setSorting}
            emptyMessage="Chưa có học viên nào khớp bộ lọc"
            enableSelection
            expandable
            renderExpandedRow={(user) => (
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-ink-muted">Email xác thực</p>
                  <p className="text-ink">{user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Mã học viên</p>
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
    </main>
  )
}

export default StudentsPage
