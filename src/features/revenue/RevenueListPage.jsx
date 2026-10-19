import { useState } from 'react'
import { Download, RefreshCw, Search, Wallet, Receipt, BarChart3, Percent, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import { exportCsv } from '@/components/ui/DataTable/exportCsv'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { formatCurrency } from '@/lib/utils'
import { useRevenueTransactions, useRevenueStats } from './hooks/useRevenue'
import { transactionColumns, transactionCsvColumns } from '@/features/revenue/columns'
import { useNotificationStream } from '@/features/notifications/useNotificationStream'

function RevenueListPage() {
  const [isLiveMode, setIsLiveMode] = useState(true)
  const dataTable = useDataTable()
  const transactionsQuery = useRevenueTransactions(dataTable.params, {
    refetchInterval: isLiveMode ? 8000 : false,
  })
  const statsQuery = useRevenueStats({
    refetchInterval: isLiveMode ? 8000 : false,
  })

  // Lắng nghe biến động số dư VietQR SePay theo thời gian thực (SSE)
  useNotificationStream({
    onNotification: (notif) => {
      const type = notif?.type || notif?.notificationType || notif?.producer
      if (type === 'PAYMENT_RECEIPT' || type === 'PAYMENT' || String(notif?.title || '').toLowerCase().includes('thanh toán')) {
        transactionsQuery.refetch()
        statsQuery.refetch()
        toast.success(` Biến động số dư: ${notif.title || notif.body || 'Thanh toán thành công!'}`, {
          duration: 5000,
        })
      }
    },
  })

  // Chỉ hiển thị giao dịch thành công hoặc hoàn tiền (trừ tiền) trên trang doanh thu
  // Các trạng thái khác (expired, cancelled, pending, failed) xem ở trang Giao dịch
  const REVENUE_STATUSES = ['completed', 'SUCCESS', 'success', 'refunded', 'REFUNDED']

  const rawItems = transactionsQuery.data?.items ?? []
  const revenueItems = dataTable.filters.status
    ? rawItems // Khi user chủ động lọc theo status cụ thể → giữ nguyên
    : rawItems.filter((t) => REVENUE_STATUSES.includes(t.status))

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
      {/* 4 KPI Cards - Tinh gọn, phẳng, thẩm mỹ đồng bộ */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Tổng doanh thu */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tổng doanh thu
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet size={16} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(statsQuery.data.totalRevenue, { compact: false })}
              </span>
              {statsQuery.data.revenueDelta != null && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {statsQuery.data.revenueDelta >= 0 ? `+${statsQuery.data.revenueDelta}%` : `${statsQuery.data.revenueDelta}%`}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Doanh thu tháng */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Doanh thu tháng
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BarChart3 size={16} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(statsQuery.data.monthlyRevenue ?? statsQuery.data.totalRevenue, { compact: false })}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {statsQuery.data.totalTransactions} GD
              </span>
            </div>
          </div>

          {/* Card 3: Giá trị trung bình (AOV) */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Giá trị trung bình
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Receipt size={16} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(statsQuery.data.averageOrderValue, { compact: false })}
              </span>
              <span className="text-xs font-medium text-slate-500">
                / đơn
              </span>
            </div>
          </div>

          {/* Card 4: Tỉ lệ chuyển đổi */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tỉ lệ chuyển đổi
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Percent size={16} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {statsQuery.data.conversionRate}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                {statsQuery.data.activeSubscribers ?? 0} hội viên
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Table Card với 1 ROW DUY NHẤT ở đầu */}
      {/* Table Card với 1 ROW DUY NHẤT ở đầu */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* 1 Row duy nhất: Search (trái) + Filters & Action Buttons (phải) */}
        <div className="flex flex-col gap-3 px-5 py-3 border-b border-slate-100 bg-white lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Ô tìm kiếm không viền */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-xs xl:max-w-sm">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={dataTable.search}
              onChange={(e) => dataTable.setSearch(e.target.value)}
              placeholder="Tìm mã đơn, học viên, email..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {dataTable.search && (
              <button
                type="button"
                onClick={() => dataTable.setSearch('')}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right: Cụm bộ lọc dropdowns + Nút xóa lọc + Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-nowrap">
            {/* Lọc trạng thái */}
            <select
              value={dataTable.filters.status || 'all'}
              onChange={(e) => dataTable.setFilter('status', e.target.value === 'all' ? undefined : e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="completed">✅ Thành công</option>
              <option value="refunded">↩ Hoàn tiền</option>
            </select>

            {/* Lọc gói dịch vụ */}
            <select
              value={dataTable.filters.planType || 'all'}
              onChange={(e) => dataTable.setFilter('planType', e.target.value === 'all' ? undefined : e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer shadow-2xs transition-colors"
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
                className="h-8.5 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                Xóa lọc
              </button>
            )}

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Realtime Live Mode Badge & Toggle */}
            <button
              type="button"
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLiveMode
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title={isLiveMode ? 'Realtime SePay: Đang tự động cập nhật mỗi 8s (Bấm để tắt)' : 'Chế độ tĩnh: Bấm để bật cập nhật Realtime 24/7'}
            >
              <span className={`h-2 w-2 rounded-full ${isLiveMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>{isLiveMode ? 'Realtime 24/7' : 'Thủ công'}</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReload}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Tải lại danh sách"
                aria-label="Tải lại"
              >
                <RefreshCw size={14} />
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Xuất file CSV"
                aria-label="Xuất CSV"
              >
                <Download size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Bảng giao dịch */}
        <DataTable
          columns={transactionColumns}
          data={revenueItems}
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
