import { useCallback, useEffect, useState } from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'
import {
  bulkResolveAdminReports,
  getAdminReports,
  getAdminReportStats,
  resolveAdminReport,
} from './reportApi'

const PAGE_SIZE = 10

function ReportsPage() {
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    pendingCount: 0,
    resolvedCount: 0,
    violationRate: 0,
    totalReports: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [contentTypeFilter, setContentTypeFilter] = useState('all')

  // Selection & Details
  const [selectedIds, setSelectedIds] = useState([])
  const [activeReport, setActiveReport] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const data = await getAdminReportStats()
      setStats(data)
    } catch (err) {
      console.warn('Lỗi khi tải thống kê báo cáo:', err)
    }
  }, [])

  // Load reports list
  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getAdminReports({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        contentType: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
        page,
        size: PAGE_SIZE,
      })
      setReports(res.items || [])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      console.error('Lỗi khi tải danh sách báo cáo:', err)
      toast.error('Không thể tải danh sách báo cáo vi phạm')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, severityFilter, contentTypeFilter, page])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Select all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(reports.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  // Toggle single selection
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setSeverityFilter('all')
    setContentTypeFilter('all')
    setPage(1)
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    severityFilter !== 'all' ||
    contentTypeFilter !== 'all'

  // Resolve single report
  const handleResolveAction = async (action, actionLabel) => {
    if (!activeReport) return
    setIsSubmitting(true)
    try {
      await resolveAdminReport(activeReport.id, {
        action,
        note: adminNote.trim() || undefined,
      })
      toast.success(`Đã xử lý: ${actionLabel}`)
      setActiveReport(null)
      setAdminNote('')
      loadReports()
      loadStats()
    } catch (err) {
      console.error('Lỗi xử lý báo cáo:', err)
      toast.error('Xử lý báo cáo thất bại, vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bulk action
  const handleBulkAction = async (action, actionLabel) => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 báo cáo')
      return
    }
    setIsSubmitting(true)
    try {
      await bulkResolveAdminReports({
        reportIds: selectedIds,
        action,
        note: `Xử lý hàng loạt (${selectedIds.length} báo cáo)`,
      })
      toast.success(`Đã thực hiện "${actionLabel}" cho ${selectedIds.length} báo cáo`)
      setSelectedIds([])
      loadReports()
      loadStats()
    } catch (err) {
      console.error('Lỗi xử lý hàng loạt:', err)
      toast.error('Xử lý hàng loạt thất bại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '—'
    try {
      const d = new Date(isoString)
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const getSeverityBadge = (severity, label) => {
    const sev = (severity || '').toUpperCase()
    if (sev === 'CRITICAL') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
          {label || 'Nghiêm trọng'}
        </span>
      )
    }
    if (sev === 'WARNING') {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
          {label || 'Trung bình'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
        {label || 'Thấp'}
      </span>
    )
  }

  const getStatusBadge = (status, label) => {
    const st = (status || '').toLowerCase()
    if (st === 'resolved') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={12} />
          {label || 'Đã xử lý'}
        </span>
      )
    }
    if (st === 'dismissed') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {label || 'Bỏ qua'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
        <Clock size={12} />
        {label || 'Đang chờ'}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Đang chờ */}
        <Card className="p-4 border border-slate-200/90 relative overflow-hidden bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Đang chờ xử lý
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle size={18} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.pendingCount ?? 0}
          </p>
          <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
            <span>● Cần kiểm duyệt sớm</span>
          </p>
        </Card>

        {/* Card 2: Đã xử lý */}
        <Card className="p-4 border border-slate-200/90 relative overflow-hidden bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Đã xử lý thành công
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck size={18} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.resolvedCount ?? 0}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} /> Đảm bảo môi trường học tập an toàn
          </p>
        </Card>

        {/* Card 3: Tỷ lệ vi phạm */}
        <Card className="p-4 border border-slate-200/90 relative overflow-hidden bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Tỷ lệ bài viết vi phạm
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <AlertOctagon size={18} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.violationRate ?? 0}%
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, (stats.violationRate || 0) * 10))}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Row Chứa Thanh Tìm Kiếm Không Viền & Bộ Lọc Dropdown */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-3.5 md:flex-row md:items-center md:justify-between bg-white">
          {/* Left: Thanh tìm kiếm KHÔNG VIỀN (Chuẩn Tab 1 & Audit Log) */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-sm">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo người dùng, nội dung, lý do..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Dropdowns Bộ Lọc & Nút Thao Tác */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc Trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="pending">Đang chờ xử lý</option>
              <option value="resolved">Đã xử lý</option>
              <option value="dismissed">Đã bỏ qua</option>
            </select>

            {/* Lọc Phân loại nội dung */}
            <select
              value={contentTypeFilter}
              onChange={(e) => {
                setContentTypeFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Loại nội dung: Tất cả</option>
              <option value="POST">Bài viết</option>
              <option value="COMMENT">Bình luận</option>
              <option value="USER_PROFILE">Hồ sơ người dùng</option>
              <option value="MESSAGE">Tin nhắn</option>
            </select>

            {/* Lọc Mức độ */}
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Mức độ: Tất cả</option>
              <option value="CRITICAL">Nghiêm trọng</option>
              <option value="WARNING">Trung bình</option>
              <option value="NORMAL">Thấp</option>
            </select>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <X size={14} />
                <span>Đặt lại</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                loadReports()
                loadStats()
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Hành động hàng loạt (khi có chọn) */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-xs font-semibold text-brand-600">
                  Đã chọn {selectedIds.length}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs py-1.5"
                  onClick={() => handleBulkAction('HIDE_CONTENT', 'Ẩn nội dung vi phạm')}
                >
                  Ẩn nội dung
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-xs py-1.5"
                  onClick={() => handleBulkAction('BAN_USER', 'Khóa tài khoản')}
                >
                  Khóa tài khoản
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-slate-600 text-xs py-1.5"
                  onClick={() => handleBulkAction('DISMISS', 'Bỏ qua')}
                >
                  Bỏ qua
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 font-bold uppercase tracking-wider text-slate-500 text-xs border-b border-slate-100">
              <tr>
                <th className="w-12 px-6 py-3.5">
                  <input
                    type="checkbox"
                    checked={reports.length > 0 && selectedIds.length === reports.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3.5">NGƯỜI BỊ BÁO CÁO</th>
                <th className="px-6 py-3.5">NỘI DUNG</th>
                <th className="px-6 py-3.5">LÝ DO</th>
                <th className="px-6 py-3.5 text-center">MỨC ĐỘ</th>
                <th className="px-6 py-3.5 text-center">TRẠNG THÁI</th>
                <th className="px-6 py-3.5">THỜI GIAN</th>
                <th className="px-6 py-3.5 text-center">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <LoadingSpinner
                      size="md"
                      text="Đang tải danh sách báo cáo vi phạm..."
                      className="py-4"
                    />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                    Không tìm thấy báo cáo vi phạm nào phù hợp điều kiện lọc.
                  </td>
                </tr>
              ) : (
                reports.map((item) => {
                  const isSelected = selectedIds.includes(item.id)
                  const reported = item.reportedUser || {}

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'hover:bg-slate-50/60 transition-colors border-b border-slate-100',
                        isSelected && 'bg-brand-50/30',
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>

                      {/* Người bị báo cáo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white text-xs shadow-2xs"
                            style={{ backgroundColor: reported.avatarColor || '#3b82f6' }}
                          >
                            {reported.initials || (reported.name ? reported.name.charAt(0).toUpperCase() : 'U')}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-none">
                              {reported.name || 'Người dùng ẩn danh'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {reported.handle || `@user_${item.targetId?.slice(0, 5) || 'unknown'}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Loại nội dung */}
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={14} className="text-slate-400" />
                          {item.contentType || 'Nội dung'}
                        </span>
                      </td>

                      {/* Lý do */}
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {item.reason}
                      </td>

                      {/* Mức độ */}
                      <td className="px-6 py-4 text-center">
                        {getSeverityBadge(item.severity, item.severityLabel)}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status, item.statusLabel)}
                      </td>

                      {/* Thời gian */}
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {item.timeAgo || formatDate(item.createdAt)}
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReport(item)
                            setAdminNote(item.note || '')
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</strong>-
            <strong>{Math.min(page * PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> báo cáo
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Drawer Chi Tiết & Xử Lý Báo Cáo */}
      <Drawer
        open={Boolean(activeReport)}
        onClose={() => {
          setActiveReport(null)
          setAdminNote('')
        }}
        title="Chi tiết & Xử lý báo cáo vi phạm"
        className="max-w-[520px]"
      >
        {activeReport && (
          <div className="space-y-5 text-sm">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-slate-400">ID: {activeReport.id}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{activeReport.reason}</h3>
              </div>
              <div className="flex items-center gap-2">
                {getSeverityBadge(activeReport.severity, activeReport.severityLabel)}
                {getStatusBadge(activeReport.status, activeReport.statusLabel)}
              </div>
            </div>

            {/* Thông tin đối tượng */}
            <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Người bị báo cáo:</span>
                <span className="font-bold text-slate-900">
                  {activeReport.reportedUser?.name} ({activeReport.reportedUser?.handle})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Người gửi báo cáo:</span>
                <span className="font-semibold text-slate-800">
                  {activeReport.reporter?.name} ({activeReport.reporter?.handle})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phân loại nội dung:</span>
                <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {activeReport.contentType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Thời điểm gửi:</span>
                <span className="font-mono text-slate-600">{formatDate(activeReport.createdAt)}</span>
              </div>
              {activeReport.reviewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Thời điểm xử lý:</span>
                  <span className="font-mono text-emerald-600 font-semibold">{formatDate(activeReport.reviewedAt)}</span>
                </div>
              )}
            </div>

            {/* Trích dẫn nội dung vi phạm */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-1.5">
                Nội dung vi phạm được báo cáo:
              </label>
              <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 text-slate-800 text-sm leading-relaxed font-sans italic">
                &ldquo;{activeReport.contentPreview || 'Không có bản trích dẫn nội dung'}&rdquo;
              </div>
            </div>

            {/* Ghi chú xử lý của Quản trị viên */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-600 block mb-1.5">
                Ghi chú kiểm duyệt (Admin Note):
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Nhập lý do xử lý hoặc căn cứ vi phạm..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Các hành động xử lý vi phạm */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-900 block mb-2">
                Hành động xử lý của Quản trị viên:
              </span>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {/* 1. Bỏ qua */}
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={isSubmitting}
                  onClick={() => handleResolveAction('DISMISS', 'Bỏ qua báo cáo (Không vi phạm)')}
                >
                  Bỏ qua báo cáo
                </Button>

                {/* 2. Cảnh cáo người dùng */}
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={isSubmitting}
                  className="text-amber-700 hover:bg-amber-50 border-amber-200"
                  onClick={() => handleResolveAction('WARN_USER', 'Gửi cảnh cáo vi phạm tới người dùng')}
                >
                  Gửi cảnh cáo
                </Button>

                {/* 3. Ẩn nội dung vi phạm */}
                <Button
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  icon={ShieldAlert}
                  onClick={() => handleResolveAction('HIDE_CONTENT', 'Ẩn nội dung vi phạm khỏi cộng đồng')}
                >
                  Ẩn nội dung vi phạm
                </Button>

                {/* 4. Khóa tài khoản */}
                <Button
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  icon={Ban}
                  onClick={() => handleResolveAction('BAN_USER', 'Khóa tài khoản người dùng vi phạm')}
                >
                  Khóa tài khoản
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default ReportsPage
