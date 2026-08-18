import { useMemo, useState } from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  Ban,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Flag,
  Layers,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserX,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { INITIAL_REPORTS, INITIAL_REPORTS_STATS } from '@/mocks/data/reports'

function ReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [stats, setStats] = useState(INITIAL_REPORTS_STATS)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [activeReport, setActiveReport] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      return (
        !search ||
        r.reportedUser.name.toLowerCase().includes(search.toLowerCase()) ||
        r.reportedUser.handle.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase()) ||
        r.contentType.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [reports, search])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pageData.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleResolveReport = (id, actionText) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)),
    )
    setStats((prev) => ({
      ...prev,
      pendingCount: Math.max(0, prev.pendingCount - 1),
      resolvedCount: prev.resolvedCount + 1,
    }))
    setActiveReport(null)
    toast.success(`Đã xử lý vi phạm: ${actionText}`)
  }

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 báo cáo')
      return
    }

    setReports((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'resolved' } : r)),
    )
    setStats((prev) => ({
      ...prev,
      pendingCount: Math.max(0, prev.pendingCount - selectedIds.length),
      resolvedCount: prev.resolvedCount + selectedIds.length,
    }))
    setSelectedIds([])
    toast.success(`Đã thực hiện "${action}" cho ${selectedIds.length} báo cáo`)
  }

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" icon={Filter} size="sm">
          Lọc
        </Button>
        <Button
          variant="primary"
          icon={Layers}
          size="sm"
          onClick={() => handleBulkAction('Khóa nội dung vi phạm')}
        >
          Hành động hàng loạt
        </Button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Đang chờ */}
        <Card className="p-4 border border-line relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Đang chờ xử lý
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <AlertTriangle size={18} />
            </span>
          </div>
          <p className="text-3xl font-bold text-navy-700 mt-2">
            {stats.pendingCount}
          </p>
          <p className="text-xs text-red-500 font-semibold mt-1">
            ↗ +{stats.pendingDelta}% so với tuần trước
          </p>
        </Card>

        {/* Card 2: Đã xử lý */}
        <Card className="p-4 border border-line relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Đã xử lý
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <ShieldCheck size={18} />
            </span>
          </div>
          <p className="text-3xl font-bold text-navy-700 mt-2">
            {stats.resolvedCount}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} /> {stats.slaRate}% SLA đạt chuẩn
          </p>
        </Card>

        {/* Card 3: Tỷ lệ vi phạm */}
        <Card className="p-4 border border-line relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Tỷ lệ vi phạm
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <AlertOctagon size={18} />
            </span>
          </div>
          <p className="text-3xl font-bold text-navy-700 mt-2">
            {stats.violationRate}%
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${stats.violationRate * 10}%` }} />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Search Bar & Title */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-slate-900">Danh sách báo cáo</h3>

          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, nội dung..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 font-bold uppercase tracking-wider text-slate-500 text-xs border-b border-slate-100">
              <tr>
                <th className="w-12 px-6 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === pageData.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th className="px-6 py-3.5">NGƯỜI BỊ BÁO CÁO</th>
                <th className="px-6 py-3.5">NỘI DUNG</th>
                <th className="px-6 py-3.5">LÝ DO</th>
                <th className="px-6 py-3.5 text-center">MỨC ĐỘ</th>
                <th className="px-6 py-3.5">THỜI GIAN</th>
                <th className="px-6 py-3.5 text-center">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    Không có báo cáo vi phạm nào.
                  </td>
                </tr>
              ) : (
                pageData.map((item) => {
                  const isSelected = selectedIds.includes(item.id)

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'hover:bg-slate-50/50 transition-colors border-b border-slate-100',
                        isSelected && 'bg-brand-50/40',
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>

                      {/* Người bị báo cáo */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white text-xs shadow-2xs"
                            style={{ backgroundColor: item.reportedUser.avatarColor || '#64748b' }}
                          >
                            {item.reportedUser.initials}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-none">{item.reportedUser.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{item.reportedUser.handle}</p>
                          </div>
                        </div>
                      </td>

                      {/* Loại nội dung */}
                      <td className="px-6 py-4.5 text-sm font-medium text-slate-800">
                        {item.contentType}
                      </td>

                      {/* Lý do */}
                      <td className="px-6 py-4.5 text-sm font-medium text-slate-700">
                        {item.reason}
                      </td>

                      {/* Mức độ */}
                      <td className="px-6 py-4.5 text-center">
                        {item.severity === 'critical' ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            {item.severityLabel}
                          </span>
                        ) : item.severity === 'medium' ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            {item.severityLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {item.severityLabel}
                          </span>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="px-6 py-4.5 text-sm text-slate-500 whitespace-nowrap">
                        {item.timeAgo || item.createdAt}
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4.5 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveReport(item)}
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
            Hiển thị <strong>{filtered.length === 0 ? 0 : start + 1}</strong>-
            <strong>{Math.min(start + PAGE_SIZE, filtered.length)}</strong> trong tổng số{' '}
            <strong>{filtered.length}</strong> báo cáo
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Drawer Chi Tiết & Xử Lý Báo Cáo */}
      <Drawer
        open={Boolean(activeReport)}
        onClose={() => setActiveReport(null)}
        title="Chi tiết báo cáo vi phạm"
        className="max-w-[480px]"
      >
        {activeReport && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="font-mono text-[10px] text-ink-muted">{activeReport.id}</span>
                <h3 className="text-base font-bold text-navy-700">{activeReport.reason}</h3>
              </div>
              <Badge tone={activeReport.severity === 'critical' ? 'danger' : activeReport.severity === 'medium' ? 'warning' : 'neutral'}>
                {activeReport.severityLabel}
              </Badge>
            </div>

            {/* Thông tin đối tượng */}
            <div className="rounded-xl bg-slate-50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Người bị báo cáo:</span>
                <span className="font-bold text-navy-700">{activeReport.reportedUser.name} ({activeReport.reportedUser.handle})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Người báo cáo:</span>
                <span className="font-semibold text-navy-700">{activeReport.reporter.name} ({activeReport.reporter.handle})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Phân loại:</span>
                <span className="font-semibold text-navy-700">{activeReport.contentType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Thời điểm:</span>
                <span className="font-mono text-ink-muted">{activeReport.createdAt}</span>
              </div>
            </div>

            {/* Nội dung vi phạm */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted block mb-1">
                Nội dung vi phạm được báo cáo:
              </label>
              <div className="rounded-xl border border-line bg-white p-3 text-ink leading-relaxed font-sans">
                &ldquo;{activeReport.contentSnippet}&rdquo;
              </div>
            </div>

            {/* Thao tác xử lý */}
            <div className="space-y-2 pt-3 border-t border-line">
              <span className="text-[11px] font-bold uppercase tracking-wide text-navy-700 block">
                Lựa chọn hành động xử lý:
              </span>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => handleResolveReport(activeReport.id, 'Bỏ qua báo cáo (Không vi phạm)')}
                >
                  Bỏ qua báo cáo
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  className="text-amber-600 hover:bg-amber-50"
                  onClick={() => handleResolveReport(activeReport.id, 'Cảnh cáo tài khoản')}
                >
                  Gửi cảnh cáo
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  className="bg-red-600 hover:bg-red-700"
                  icon={Ban}
                  onClick={() => handleResolveReport(activeReport.id, 'Ẩn nội dung & Khóa tài khoản 7 ngày')}
                >
                  Ẩn & Khóa 7 ngày
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  className="bg-navy-900 hover:bg-black text-white"
                  icon={UserX}
                  onClick={() => handleResolveReport(activeReport.id, 'Khóa tài khoản vĩnh viễn')}
                >
                  Khóa vĩnh viễn
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
