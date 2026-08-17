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
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Nhật ký hoạt động</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            System-wide audit trail and security logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => handleExport('csv')}
            size="sm"
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => handleExport('pdf')}
            size="sm"
          >
            Export PDF
          </Button>
        </div>
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

      {/* Main Audit Table Card */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-ink-muted border-b border-line">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3 text-center">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line bg-white">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-ink-muted">
                    Không tìm thấy bản ghi nhật ký nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                pageData.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setActiveLog(log)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    {/* Timestamp */}
                    <td className="px-4 py-3.5 font-mono text-ink-muted whitespace-nowrap">
                      {log.timestamp} <span className="text-[10px] text-slate-400">UTC+7</span>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-bold text-white text-xs uppercase"
                          style={{ backgroundColor: log.avatarColor || '#1B3A57' }}
                        >
                          {log.userInitials}
                        </span>
                        <div>
                          <p className="font-semibold text-navy-700 leading-none">{log.user}</p>
                          <p className="text-[10px] text-ink-muted mt-0.5">{log.userRoleLabel}</p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5">
                      {log.actionTone === 'danger' ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 border border-red-100">
                          {log.action}
                        </span>
                      ) : log.actionTone === 'info' ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 border border-blue-100">
                          {log.action}
                        </span>
                      ) : log.actionTone === 'warning' ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-100">
                          {log.action}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {log.action}
                        </span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3.5 font-mono text-ink-muted">
                      {log.ipAddress}
                    </td>

                    {/* Device */}
                    <td className="px-4 py-3.5 text-ink">
                      {log.device}
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveLog(log)
                        }}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 cursor-pointer transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
          <p className="text-xs text-ink-muted">
            Showing <strong className="text-navy-700">{total === 0 ? 0 : start + 1}</strong> to{' '}
            <strong className="text-navy-700">{Math.min(start + PAGE_SIZE, total)}</strong> of{' '}
            <strong className="text-navy-700">{total}</strong> results
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-navy-700 bg-slate-100 rounded-md">
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

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
    </main>
  )
}

export default AuditLogPage
