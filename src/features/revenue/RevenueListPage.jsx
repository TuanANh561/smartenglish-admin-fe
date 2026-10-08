import { Download, RefreshCw, Search, Wallet, Receipt, BarChart3, Percent } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import { exportCsv } from '@/components/ui/DataTable/exportCsv'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { formatCurrency } from '@/lib/utils'
import { useRevenueTransactions, useRevenueStats } from './hooks/useRevenue'
import { transactionColumns, transactionCsvColumns } from '@/features/revenue/columns'

function RevenueListPage() {
  const dataTable = useDataTable()
  const transactionsQuery = useRevenueTransactions(dataTable.params)
  const statsQuery = useRevenueStats()

  const hasFilters = Boolean(
    dataTable.search ||
    dataTable.filters.status ||
    dataTable.filters.planType
  )

  const handleClearFilters = () => {
    dataTable.setSearch('')
    dataTable.setFilter('status', undefined)
    dataTable.setFilter('planType', undefined)
    dataTable.setPage(1)
  }

  const handleReload = () => {
    transactionsQuery.refetch()
    statsQuery.refetch()
  }

  const handleExportCsv = () => {
    exportCsv(
      transactionsQuery.data?.items ?? [],
      transactionCsvColumns,
      'doanh-thu-smartenglish'
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI row */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-emerald-50 text-emerald-600 p-2.5 border border-emerald-100/80 shadow-2xs">
                <Wallet size={20} strokeWidth={2} />
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng doanh thu</p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              {formatCurrency(statsQuery.data.totalRevenue, { compact: true })}
            </p>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-blue-50 text-blue-600 p-2.5 border border-blue-100/80 shadow-2xs">
                <Receipt size={20} strokeWidth={2} />
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng giao dịch</p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">{statsQuery.data.totalTransactions}</p>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-amber-50 text-amber-600 p-2.5 border border-amber-100/80 shadow-2xs">
                <BarChart3 size={20} strokeWidth={2} />
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Giá trị trung bình</p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              {formatCurrency(statsQuery.data.averageOrderValue, { compact: false })}
            </p>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-violet-50 text-violet-600 p-2.5 border border-violet-100/80 shadow-2xs">
                <Percent size={20} strokeWidth={2} />
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Tỉ lệ chuyển đổi</p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">{statsQuery.data.conversionRate}%</p>
          </Card>
        </div>
      )}

      {/* Table Card với 1 ROW DUY NHẤT ở đầu */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* 1 Row duy nhất chứa thanh tìm kiếm, các nút lọc và nút bấm */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          {/* Ô tìm kiếm không viền (borderless) chuẩn Benchmark */}
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={dataTable.search}
              onChange={(e) => dataTable.setSearch(e.target.value)}
              placeholder="Tìm theo học viên, email hoặc mã đơn..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Cụm bộ lọc và nút hành động trên 1 hàng */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Lọc trạng thái */}
            <select
              value={dataTable.filters.status || 'all'}
              onChange={(e) => dataTable.setFilter('status', e.target.value === 'all' ? undefined : e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="completed">Thành công</option>
              <option value="pending">Chờ xác thực</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Hoàn tiền</option>
            </select>

            {/* Lọc gói dịch vụ */}
            <select
              value={dataTable.filters.planType || 'all'}
              onChange={(e) => dataTable.setFilter('planType', e.target.value === 'all' ? undefined : e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Gói: Tất cả</option>
              <option value="premium_monthly">Premium tháng</option>
              <option value="premium_yearly">Premium năm</option>
              <option value="lifetime">Trọn đời (VIP)</option>
              <option value="teacher_pro">Giảng viên Pro</option>
            </select>

            {/* Xóa lọc */}
            {hasFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 px-2 py-1 transition-colors cursor-pointer"
              >
                Xoá lọc
              </button>
            )}

            {/* Nút Tải lại */}
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={handleReload}
              title="Tải lại danh sách"
            />

            {/* Nút Xuất CSV */}
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              onClick={handleExportCsv}
              title="Xuất báo cáo ra file CSV"
            >
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Bảng giao dịch */}
        <DataTable
          columns={transactionColumns}
          data={transactionsQuery.data?.items ?? []}
          isLoading={transactionsQuery.isLoading}
          loadingMessage="Đang tải dữ liệu báo cáo doanh thu từ máy chủ..."
          error={transactionsQuery.error}
          onRetry={transactionsQuery.refetch}
          pagination={transactionsQuery.data}
          onPageChange={dataTable.setPage}
          sorting={dataTable.sorting}
          onSortingChange={dataTable.setSorting}
          emptyMessage="Chưa có giao dịch nào khớp bộ lọc"
        />
      </div>
    </div>
  )
}

export default RevenueListPage
