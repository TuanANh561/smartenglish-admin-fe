import { useState } from 'react'
import {
  Activity,
  Bot,
  BookOpen,
  ChevronRight,
  GraduationCap,
  History,
  Mic,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card, { CardHeader } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import { SkeletonText } from '@/components/ui/Skeleton'
import { formatRelativeTime } from '@/lib/utils'

const PAGE_SIZE = 8

const STATUS_MAP = {
  success: { tone: 'success', label: 'Thành công' },
  done: { tone: 'info', label: 'Hoàn thành' },
  completed: { tone: 'success', label: 'Hoàn thành' },
  pending: { tone: 'warning', label: 'Đang xử lý' },
  failed: { tone: 'danger', label: 'Thất bại' },
}

function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email || '—'
  const [name, domain] = email.split('@')
  if (!name) return email
  if (name.length <= 2) {
    return `${name}****@${domain}`
  }
  const prefix = name.slice(0, 2)
  const suffix = name.length > 4 ? name.slice(-1) : ''
  return `${prefix}****${suffix}@${domain}`
}

function getActivityIcon(action = '') {
  const a = action.toLowerCase()
  if (a.includes('nói') || a.includes('phát âm') || a.includes('speaking')) {
    return <Mic size={14} className="text-sky-600" />
  }
  if (a.includes('viết') || a.includes('writing') || a.includes('luận')) {
    return <Sparkles size={14} className="text-amber-600" />
  }
  if (a.includes('lớp') || a.includes('class')) {
    return <GraduationCap size={14} className="text-indigo-600" />
  }
  if (a.includes('thi') || a.includes('quiz') || a.includes('toeic')) {
    return <BookOpen size={14} className="text-purple-600" />
  }
  if (a.includes('đăng nhập') || a.includes('tài khoản') || a.includes('user')) {
    return <UserCheck size={14} className="text-emerald-600" />
  }
  return <Activity size={14} className="text-brand-500" />
}

export default function RecentActivityCard({ data = [], isLoading = false, error = null, onRetry }) {
  const [filter, setFilter] = useState('all') // 'all' | 'ai' | 'classes' | 'system'
  const [page, setPage] = useState(1)

  // Loại trừ các giao dịch mua gói để dành riêng cho Bảng Giao dịch Thành công gần đây
  const nonPurchaseItems = (Array.isArray(data) ? data : []).filter((item) => !item.isPackagePurchase)

  const filteredData = nonPurchaseItems.filter((item) => {
    const act = (item.action || '').toLowerCase()
    if (filter === 'ai') {
      return (
        act.includes('ai') ||
        act.includes('phát âm') ||
        act.includes('nói') ||
        act.includes('viết') ||
        act.includes('speaking') ||
        act.includes('writing')
      )
    }
    if (filter === 'classes') {
      return act.includes('lớp') || act.includes('bài thi') || act.includes('quiz') || act.includes('toeic')
    }
    if (filter === 'system') {
      return act.includes('đăng nhập') || act.includes('tài khoản') || act.includes('đăng ký')
    }
    return true
  })

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setPage(1)
  }

  const total = filteredData.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pagedData = filteredData.slice(start, start + PAGE_SIZE)

  return (
    <Card className="border border-line bg-white shadow-xs">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <History size={16} strokeWidth={2.2} />
            </span>
            <span className="font-bold text-navy-800 text-base">Hoạt động gần đây</span>
            {nonPurchaseItems.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                {nonPurchaseItems.length} sự kiện
              </span>
            )}
          </div>
        }
        action={
          <Link
            to="/app/nhat-ky"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Xem tất cả</span>
            <ChevronRight size={15} />
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-2.5 bg-canvas/40">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-navy-700 text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-ink hover:bg-canvas border border-line'
            }`}
          >
            Tất cả
            {nonPurchaseItems.length > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {nonPurchaseItems.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('ai')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'ai'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-brand-700 hover:bg-brand-50/50 border border-line'
            }`}
          >
            <Sparkles size={12} className={filter === 'ai' ? 'text-white' : 'text-brand-500'} />
            Luyện tập AI
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('classes')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'classes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-indigo-700 hover:bg-indigo-50/50 border border-line'
            }`}
          >
            <GraduationCap size={12} className={filter === 'classes' ? 'text-white' : 'text-indigo-500'} />
            Lớp học & Bài thi
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('system')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'system'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-slate-800 hover:bg-slate-50 border border-line'
            }`}
          >
            <UserCheck size={12} className={filter === 'system' ? 'text-white' : 'text-slate-500'} />
            Tài khoản & Hệ thống
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5">
          <SkeletonText lines={4} />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !filteredData.length ? (
        <EmptyState
          title="Chưa có hoạt động nào trong danh mục này"
          description="Các tương tác học tập và sự kiện vận hành hệ thống sẽ xuất hiện tại đây."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-canvas border-b border-line text-ink-muted">
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider">Người dùng</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider">Hành động / Sự kiện</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pagedData.map((item, idx) => {
                  const status = STATUS_MAP[item.status] ?? { tone: 'neutral', label: item.status }
                  const displayName = item.user?.displayName || item.user?.name || 'Người dùng'
                  const email = item.user?.email || ''
                  const cefrLevel = item.user?.cefrLevel

                  return (
                    <tr key={item.id || idx} className="transition-colors hover:bg-canvas/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={displayName}
                            src={item.user?.avatarUrl}
                            size="sm"
                            className="rounded-full ring-1 ring-line shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-navy-800 text-xs truncate max-w-[150px]" title={displayName}>
                                {displayName}
                              </p>
                              {cefrLevel && (
                                <span className="rounded bg-brand-50 px-1 py-0.2 text-[10px] font-bold text-brand-700 border border-brand-200 shrink-0">
                                  {cefrLevel}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5" title={email}>
                              {email ? maskEmail(email) : 'Học viên'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-800 font-medium text-xs">
                          <span className="p-1 rounded-md bg-slate-100 shrink-0">
                            {getActivityIcon(item.action)}
                          </span>
                          <span className="truncate max-w-[320px]" title={item.action}>
                            {item.action}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>

                      <td className="px-4 py-3 text-right text-slate-400 text-xs whitespace-nowrap">
                        {formatRelativeTime(item.occurredAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 bg-canvas/30">
            <p className="text-xs text-ink-muted">
              Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
              <strong>{total}</strong> hoạt động
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </Card>
  )
}
