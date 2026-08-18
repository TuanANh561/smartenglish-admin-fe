import { useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Laptop,
  Layers,
  Search,
  Shield,
  Smartphone,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { INITIAL_AUDIT_LOGS } from '@/mocks/data/auditLogs'

function AuditLogPage() {
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS)
  const [dateRange, setDateRange] = useState('24h')
  const [userRole, setUserRole] = useState('all')
  const [actionType, setActionType] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [page, setPage] = useState(1)
  const [activeLog, setActiveLog] = useState(null)
  const PAGE_SIZE = 5

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchRole = userRole === 'all' || log.userRole === userRole
      const matchAction = actionType === 'all' || log.actionType === actionType
      const matchSeverity = severity === 'all' || log.severity === severity
      return matchRole && matchAction && matchSeverity
    })
  }, [logs, userRole, actionType, severity])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const handleExport = (type) => {
    toast.success(`Đã xuất báo cáo ${type.toUpperCase()} nhật ký hoạt động`)
  }

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          icon={FileSpreadsheet}
          onClick={() => handleExport('csv')}
          size="sm"
        >
          Xuất CSV
        </Button>
        <Button
          variant="primary"
          icon={FileText}
          onClick={() => handleExport('pdf')}
          size="sm"
        >
          Xuất PDF
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted block mb-1">
              Date Range
            </label>
            <Select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                setPage(1)
              }}
              className="text-xs"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted block mb-1">
              User Role
            </label>
            <Select
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value)
                setPage(1)
              }}
              className="text-xs"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="system">System</option>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted block mb-1">
              Action Type
            </label>
            <Select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value)
                setPage(1)
              }}
              className="text-xs"
            >
              <option value="all">All Actions</option>
              <option value="delete">Delete / Remove</option>
              <option value="approve">Approve Content</option>
              <option value="auth">Authentication</option>
              <option value="update">Update / Modify</option>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted block mb-1">
              Severity
            </label>
            <Select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value)
                setPage(1)
              }}
              className="text-xs"
            >
              <option value="all">All Severities</option>
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">THỜI GIAN</th>
                <th className="px-6 py-3.5">NGƯỜI THỰC HIỆN</th>
                <th className="px-6 py-3.5">HÀNH ĐỘNG</th>
                <th className="px-6 py-3.5">ĐỊA CHỈ IP</th>
                <th className="px-6 py-3.5">THIẾT BỊ</th>
                <th className="px-6 py-3.5 text-center">CHI TIẾT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    Không tìm thấy bản ghi nhật ký nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                pageData.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setActiveLog(log)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-100"
                  >
                    {/* Timestamp */}
                    <td className="px-6 py-4.5 font-mono text-sm text-slate-600 whitespace-nowrap">
                      {log.timestamp} <span className="text-[10px] text-slate-400">UTC+7</span>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-white text-xs uppercase shadow-2xs"
                          style={{ backgroundColor: log.avatarColor || '#1B3A57' }}
                        >
                          {log.userInitials}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-none">{log.user}</p>
                          <p className="text-xs text-slate-500 mt-1">{log.userRoleLabel}</p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4.5">
                      {log.actionTone === 'danger' ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-100">
                          {log.action}
                        </span>
                      ) : log.actionTone === 'info' ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100">
                          {log.action}
                        </span>
                      ) : log.actionTone === 'warning' ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                          {log.action}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {log.action}
                        </span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="px-6 py-4.5 font-mono text-sm text-slate-600">
                      {log.ipAddress}
                    </td>

                    {/* Device */}
                    <td className="px-6 py-4.5 text-sm text-slate-700">
                      {log.device}
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveLog(log)
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 cursor-pointer transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{filtered.length === 0 ? 0 : start + 1}</strong>-
            <strong>{Math.min(start + PAGE_SIZE, filtered.length)}</strong> trong tổng số{' '}
            <strong>{filtered.length}</strong> bản ghi nhật ký
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Drawer Xem Chi Tiết Nhật Ký */}
      <Drawer
        open={Boolean(activeLog)}
        onClose={() => setActiveLog(null)}
        title="Chi tiết nhật ký hoạt động"
        className="max-w-[480px]"
      >
        {activeLog && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="font-mono text-ink-muted">{activeLog.id}</p>
                <h3 className="text-base font-bold text-navy-700 mt-0.5">{activeLog.actionLabel}</h3>
              </div>
              <Badge tone={activeLog.severity === 'critical' ? 'danger' : activeLog.severity === 'warning' ? 'warning' : 'neutral'}>
                {activeLog.severity.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <span className="text-ink-muted block text-[10px] uppercase font-bold">Người thực hiện:</span>
                <span className="font-bold text-navy-700">{activeLog.userName} ({activeLog.user})</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px] uppercase font-bold">Vai trò:</span>
                <span className="font-semibold text-navy-700">{activeLog.userRoleLabel}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px] uppercase font-bold">Thời gian:</span>
                <span className="font-mono text-navy-700">{activeLog.timestamp}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px] uppercase font-bold">Địa chỉ IP:</span>
                <span className="font-mono text-navy-700">{activeLog.ipAddress}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-navy-700 uppercase tracking-wide mb-1.5">Thiết bị & Trình duyệt</h4>
              <p className="rounded-lg border border-line p-2.5 font-mono text-ink bg-white">
                {activeLog.device}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-navy-700 uppercase tracking-wide mb-1.5">Dữ liệu chi tiết (Payload)</h4>
              <pre className="rounded-lg bg-navy-900 p-3 text-[11px] text-emerald-400 font-mono overflow-x-auto">
                {JSON.stringify(activeLog.details, null, 2)}
              </pre>
            </div>

            <div className="pt-4 border-t border-line">
              <Button variant="secondary" fullWidth onClick={() => setActiveLog(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AuditLogPage
