import { useCallback, useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Laptop,
  Layers,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  CheckCircle2,
  Edit3,
  PlusCircle,
  AlertTriangle,
  User,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getAuditLogs } from './auditLogApi'

const PAGE_SIZE = 10

function AuditLogPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'teacher'

  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Bộ lọc
  const [dateRange, setDateRange] = useState('all')
  const [userRole, setUserRole] = useState(isTeacher ? 'teacher' : 'all')
  const [actionType, setActionType] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Drawer xem chi tiết
  const [activeLog, setActiveLog] = useState(null)

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      // Nếu là giảng viên, tự động lọc theo role teacher và username/tên nếu cần
      const roleFilter = isTeacher ? 'teacher' : userRole
      const searchFilter = isTeacher && !search.trim() ? (user?.displayName || user?.username || '') : search

      const data = await getAuditLogs({
        page,
        size: PAGE_SIZE,
        dateRange,
        userRole: roleFilter,
        actionType,
        severity,
        search: searchFilter,
      })
      setLogs(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.warn('Lỗi khi tải nhật ký hoạt động:', err)
      toast.error('Không thể kết nối máy chủ nhật ký hoạt động')
    } finally {
      setIsLoading(false)
    }
  }, [page, dateRange, userRole, actionType, severity, search, isTeacher, user])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleResetFilters = () => {
    setDateRange('all')
    setUserRole(isTeacher ? 'teacher' : 'all')
    setActionType('all')
    setSeverity('all')
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters =
    dateRange !== 'all' ||
    userRole !== 'all' ||
    actionType !== 'all' ||
    severity !== 'all' ||
    search.trim() !== ''

  const handleExportCsv = () => {
    if (!logs.length) {
      toast.error('Không có dữ liệu nhật ký để xuất')
      return
    }
    const headers = ['Mã Log', 'Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Địa chỉ IP', 'Thiết bị', 'Mức độ', 'Lý do']
    const rows = logs.map((l) => [
      l.logCode || l.id,
      `"${l.timestamp}"`,
      `"${l.userName || l.user}"`,
      `"${l.userRoleLabel || l.userRole}"`,
      `"${l.actionLabel || l.action}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.device || ''}"`,
      `"${l.severity || ''}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Đã xuất báo cáo CSV nhật ký hoạt động')
  }

  const handleExportPdf = () => {
    toast.success('Đang tạo bản in PDF nhật ký hoạt động...')
    window.print()
  }

  const startRecord = (page - 1) * PAGE_SIZE + 1
  const endRecord = Math.min(page * PAGE_SIZE, total)

  // Helper render icon hành động
  const renderActionIcon = (log) => {
    const act = (log.actionType || log.action || '').toLowerCase()
    if (act.includes('delete') || act.includes('xóa')) {
      return <Trash2 size={15} className="text-red-500 shrink-0" />
    }
    if (act.includes('approve') || act.includes('duyệt')) {
      return <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
    }
    if (act.includes('lock') || act.includes('khóa') || act.includes('auth')) {
      return <ShieldAlert size={15} className="text-amber-500 shrink-0" />
    }
    if (act.includes('create') || act.includes('tạo')) {
      return <PlusCircle size={15} className="text-indigo-500 shrink-0" />
    }
    return <Edit3 size={15} className="text-blue-500 shrink-0" />
  }

  // Helper render severity badge
  const renderSeverityBadge = (sev) => {
    const s = (sev || 'normal').toLowerCase()
    if (s === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600 border border-red-200">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Nghiêm trọng
        </span>
      )
    }
    if (s === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Cảnh báo
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Bình thường
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Main Unified Container (Đồng bộ chuẩn Vocabulary & QuizBank) ─────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar & Filters (Đồng bộ chuẩn Benchmark Tab 1) */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          {/* Left: Thanh tìm kiếm không viền (borderless) đồng bộ Tab 1 */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[180px] max-w-xs xl:max-w-sm">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hành động, IP, người dùng..."
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

          {/* Right: Nhóm Dropdown Bộ lọc & Nút Thao tác */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc Thời gian */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Thời gian: Tất cả</option>
              <option value="24h">24 giờ qua</option>
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
            </select>

            {/* Lọc Vai trò (Chỉ hiển thị đầy đủ cho Admin, với Giáo viên cố định xem hoạt động giáo viên) */}
            {!isTeacher ? (
              <select
                value={userRole}
                onChange={(e) => {
                  setUserRole(e.target.value)
                  setPage(1)
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value="all">Vai trò: Tất cả</option>
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="teacher">Giáo viên (Teacher)</option>
                <option value="student">Học viên (Student)</option>
              </select>
            ) : (
              <span className="rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-2 text-sm font-medium text-brand-700">
                Vai trò: Giáo viên
              </span>
            )}

            {/* Lọc Loại thao tác */}
            <select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer max-w-[170px]"
            >
              <option value="all">Thao tác: Tất cả</option>
              <option value="delete">Xóa tài nguyên</option>
              <option value="approve">Phê duyệt</option>
              <option value="auth">Khóa / Phân quyền</option>
              <option value="update">Cập nhật</option>
              <option value="create">Tạo mới</option>
            </select>

            {/* Lọc Mức độ */}
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Mức độ: Tất cả</option>
              <option value="normal">Bình thường</option>
              <option value="warning">Cảnh báo</option>
              <option value="critical">Nghiêm trọng</option>
            </select>

            {/* Nút Đặt lại bộ lọc (nếu đang lọc) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={13} />
                <span>Đặt lại</span>
              </button>
            )}

            {/* Nút Tải lại danh sách */}
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={loadLogs}
              className={cn('rounded-xl cursor-pointer shadow-2xs', isLoading && 'pointer-events-none opacity-60')}
              title="Làm mới danh sách"
            />

            {/* Nút Xuất CSV */}
            <Button
              size="sm"
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={handleExportCsv}
              className="rounded-xl cursor-pointer shadow-2xs"
            >
              Xuất CSV
            </Button>

            {/* Nút Xuất PDF */}
            <Button
              size="sm"
              variant="primary"
              icon={FileText}
              onClick={handleExportPdf}
              className="rounded-xl bg-navy-800 hover:bg-navy-900 cursor-pointer shadow-2xs"
            >
              Xuất PDF
            </Button>
          </div>
        </div>

        {/* ── Table Danh Sách Nhật Ký ────────────────────────────────────────── */}
        <div className="overflow-x-auto min-h-[320px] relative">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5 whitespace-nowrap">THỜI GIAN</th>
                <th className="px-6 py-3.5 whitespace-nowrap">NGƯỜI THỰC HIỆN</th>
                <th className="px-6 py-3.5 whitespace-nowrap">HÀNH ĐỘNG & ĐỐI TƯỢNG</th>
                <th className="px-6 py-3.5 whitespace-nowrap">ĐỊA CHỈ IP & THIẾT BỊ</th>
                <th className="px-6 py-3.5 whitespace-nowrap text-center">MỨC ĐỘ</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">CHI TIẾT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <LoadingSpinner text="Đang tải danh sách nhật ký hoạt động..." />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <Shield size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Không tìm thấy bản ghi nhật ký nào</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'Thử nới lỏng các điều kiện lọc hoặc từ khóa tìm kiếm để xem các hoạt động khác.'
                        : 'Hệ thống chưa ghi nhận hành động quản trị mới nào.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Đặt lại bộ lọc</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setActiveLog(log)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group border-b border-slate-100"
                  >
                    {/* Cột 1: Thời gian */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {log.timestamp}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="shrink-0" />
                          <span>UTC+7</span>
                          {log.logCode && (
                            <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500 font-medium">
                              #{log.logCode}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Cột 2: Người thực hiện */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-xs uppercase shadow-xs transition-transform group-hover:scale-105"
                          style={{ backgroundColor: log.avatarColor || '#1B3A57' }}
                        >
                          {log.userInitials || 'AD'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">
                            {log.userName || log.user}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className={cn(
                                'inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                                (log.userRole || '').toLowerCase() === 'admin'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : (log.userRole || '').toLowerCase() === 'teacher'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              )}
                            >
                              {log.userRoleLabel || log.userRole}
                            </span>
                            {log.user && (
                              <span className="text-xs text-slate-400">
                                @{log.user}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Hành động & Đối tượng */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2.5 max-w-md">
                        <div className="mt-0.5 rounded-lg bg-slate-100 p-1.5 shrink-0 group-hover:bg-white transition-colors border border-slate-200/60">
                          {renderActionIcon(log)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {log.actionLabel || log.action}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {log.targetService && (
                              <span className="rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700 font-semibold">
                                {log.targetService}
                              </span>
                            )}
                            {log.targetType && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 font-medium">
                                {log.targetType} {log.targetId ? `#${log.targetId}` : ''}
                              </span>
                            )}
                            {log.reason && (
                              <span className="text-xs text-slate-500 italic truncate max-w-[220px]" title={log.reason}>
                                — {log.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 4: IP & Thiết bị */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50 w-fit">
                          {log.ipAddress || '127.0.0.1'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          {(log.device || '').toLowerCase().includes('mobile') ? (
                            <Smartphone size={13} className="text-slate-400" />
                          ) : (
                            <Laptop size={13} className="text-slate-400" />
                          )}
                          <span>{log.device || 'Web Admin Console'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Cột 5: Mức độ */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {renderSeverityBadge(log.severity)}
                    </td>

                    {/* Cột 6: Thao tác / Chi tiết */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveLog(log)
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all cursor-pointer shadow-2xs"
                        title="Xem chi tiết bản ghi"
                      >
                        <Eye size={14} />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer Phân Trang (Đồng bộ chuẩn Vocabulary & QuizBank) ────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/20">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : startRecord}</strong> - <strong>{endRecord}</strong> trong tổng số{' '}
            <strong>{total}</strong> bản ghi nhật ký
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* ── Drawer Xem Chi Tiết Nhật Ký ───────────────────────────────────────── */}
      <Drawer
        open={Boolean(activeLog)}
        onClose={() => setActiveLog(null)}
        title="Chi tiết nhật ký hoạt động"
        className="max-w-[500px]"
      >
        {activeLog && (
          <div className="space-y-5 text-sm">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="font-mono text-slate-400 text-xs">
                  {activeLog.logCode ? `#${activeLog.logCode}` : `ID: ${activeLog.id}`}
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeLog.actionLabel || activeLog.action}
                </h3>
              </div>
              <div>{renderSeverityBadge(activeLog.severity)}</div>
            </div>

            {/* Thông tin chính */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200/60">
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Người thực hiện:
                </span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {activeLog.userName || activeLog.user}
                </span>
                <span className="text-xs text-slate-500 font-medium">@{activeLog.user}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Vai trò:
                </span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {activeLog.userRoleLabel || activeLog.userRole}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Thời gian:
                </span>
                <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                  {activeLog.timestamp}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Địa chỉ IP:
                </span>
                <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                  {activeLog.ipAddress || '127.0.0.1'}
                </span>
              </div>
            </div>

            {/* Dịch vụ & Đối tượng tác động */}
            {(activeLog.targetService || activeLog.targetType) && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Dịch vụ & Đối tượng tác động:
                </span>
                <div className="flex items-center gap-2">
                  {activeLog.targetService && (
                    <span className="rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 font-mono text-xs text-indigo-700 font-bold">
                      {activeLog.targetService}
                    </span>
                  )}
                  {activeLog.targetType && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-semibold">
                      {activeLog.targetType} {activeLog.targetId ? `#${activeLog.targetId}` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Lý do / Ghi chú */}
            {activeLog.reason && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                  Lý do / Giải trình
                </h4>
                <p className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700 bg-slate-50/50 leading-relaxed">
                  {activeLog.reason}
                </p>
              </div>
            )}

            {/* Thiết bị & Trình duyệt */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                Thiết bị & Môi trường
              </h4>
              <p className="rounded-xl border border-slate-200 p-2.5 font-mono text-xs text-slate-700 bg-white">
                {activeLog.device || 'Web Admin Console'}
              </p>
            </div>

            {/* Dữ liệu chi tiết Payload */}
            {activeLog.details && Object.keys(activeLog.details).length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                  Dữ liệu thay đổi (Payload)
                </h4>
                <pre className="rounded-xl bg-slate-900 p-3 text-xs text-emerald-400 font-mono overflow-x-auto max-h-[220px] shadow-inner">
                  {JSON.stringify(activeLog.details, null, 2)}
                </pre>
              </div>
            )}

            {/* Nút đóng */}
            <div className="pt-3 border-t border-slate-100">
              <Button variant="secondary" fullWidth onClick={() => setActiveLog(null)} className="rounded-xl">
                Đóng chi tiết
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AuditLogPage
