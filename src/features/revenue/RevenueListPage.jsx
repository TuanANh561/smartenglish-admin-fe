import { useQuery } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { formatCurrency } from '@/lib/utils'
import { getTransactions, getRevenueStats } from '@/features/revenue/api'
import { transactionColumns } from '@/features/revenue/columns'

const STATUS_CHIPS = [
  { key: 'completed', label: 'Thành công' },
  { key: 'pending', label: 'Chờ xác thực' },
  { key: 'failed', label: 'Thất bại' },
  { key: 'refunded', label: 'Hoàn tiền' },
]

function RevenueListPage() {
  const dataTable = useDataTable()
  const transactionsQuery = useQuery({
    queryKey: ['revenue', 'transactions', dataTable.params],
    queryFn: () => getTransactions(dataTable.params),
  })
  const statsQuery = useQuery({
    queryKey: ['revenue', 'stats'],
    queryFn: () => getRevenueStats(),
  })

  return (
    <div className="space-y-4">
      {/* KPI row */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-brand-500/10 p-2 text-brand-500">
                <TrendingUp size={18} strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-muted">Tổng doanh thu</p>
            <p className="mt-1 text-3xl font-bold text-navy-700">
              {formatCurrency(statsQuery.data.totalRevenue, { compact: true })}
            </p>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-brand-400/10 p-2 text-brand-400">
                <TrendingUp size={18} strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-muted">Tổng giao dịch</p>
            <p className="mt-1 text-3xl font-bold text-navy-700">{statsQuery.data.totalTransactions}</p>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-brand-200/10 p-2 text-brand-400">
                <TrendingUp size={18} strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-muted">Giá trị trung bình</p>
            <p className="mt-1 text-3xl font-bold text-navy-700">
              {formatCurrency(statsQuery.data.averageOrderValue, { compact: false })}
            </p>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-chart-idle/20 p-2 text-brand-500">
                <TrendingUp size={18} strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-muted">Tỉ lệ chuyển đổi</p>
            <p className="mt-1 text-3xl font-bold text-navy-700">{statsQuery.data.conversionRate}%</p>
          </Card>
        </div>
      )}

      <Card>
        <DataTableToolbar
          searchValue={dataTable.search}
          onSearchChange={dataTable.setSearch}
          searchPlaceholder="Tìm theo học viên hoặc email..."
        >
          <FilterChipRow
            chips={STATUS_CHIPS}
            value={dataTable.filters.status}
            onChange={(value) => dataTable.setFilter('status', value)}
          />
        </DataTableToolbar>

        <div className="mt-4">
          <DataTable
            columns={transactionColumns}
            data={transactionsQuery.data?.items ?? []}
            isLoading={transactionsQuery.isLoading}
            error={transactionsQuery.error}
            onRetry={transactionsQuery.refetch}
            pagination={transactionsQuery.data}
            onPageChange={dataTable.setPage}
            sorting={dataTable.sorting}
            onSortingChange={dataTable.setSorting}
            emptyMessage="Chưa có giao dịch nào khớp bộ lọc"
          />
        </div>
      </Card>
    </div>
  )
}

export default RevenueListPage
