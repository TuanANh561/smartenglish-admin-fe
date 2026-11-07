import { useState, useEffect, useRef } from 'react'
import {
  Search,
  UserCheck,
  X,
  Zap,
  GraduationCap,
  Smartphone,
  Check,
  Crown,
  Loader2,
  RefreshCw,
  Lock,
} from 'lucide-react'
import { searchUsersForSubscription } from '../api/premiumApi'
import { cn } from '@/lib/utils'

function formatPlanName(plan) {
  if (!plan) return 'FREE'
  const p = plan.toLowerCase()
  if (p === 'teacher_pro' || p === 't-plan-pro' || p === 'teacher') return 'Teacher Pro'
  if (p === 'school_center' || p === 't-plan-center') return 'School & Center'
  if (p === 'premium_monthly' || p === 's-plan-monthly') return 'Premium Tháng'
  if (p === 'premium_yearly' || p === 's-plan-yearly') return 'Premium Năm'
  if (p === 'lifetime' || p === 's-plan-lifetime') return 'Trọn Đời VIP'
  return plan.toUpperCase()
}

/**
 * AdminAssistedSubscriptionToolbar
 * Thanh công cụ tìm kiếm và chọn Học viên/Giáo viên để Admin đăng ký hộ gói dịch vụ
 *
 * @param {{
 *   selectedUser: Object|null,
 *   onSelectUser: (user: Object|null) => void,
 *   onOpenDirectGrant: (user: Object) => void,
 *   isSudoUnlocked?: boolean,
 * }} props
 */
export default function AdminAssistedSubscriptionToolbar({
  selectedUser,
  onSelectUser,
  onOpenDirectGrant,
  isSudoUnlocked = false,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // 'all' | 'student' | 'teacher'
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Đồng bộ cập nhật trạng thái của selectedUser vào kết quả tìm kiếm cục bộ (ví dụ sau khi cấp gói)
  useEffect(() => {
    if (selectedUser?.id) {
      setResults((prev) =>
        prev.map((item) => (item.id === selectedUser.id ? { ...item, ...selectedUser } : item))
      )
    }
  }, [selectedUser])

  // Lắng nghe sự kiện cập nhật gói toàn cục (từ AdminDirectGrantModal)
  useEffect(() => {
    const handlePlanUpdated = (e) => {
      const updated = e.detail
      if (!updated?.id) return
      setResults((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      )
      if (selectedUser?.id === updated.id) {
        onSelectUser({ ...selectedUser, ...updated })
      }
    }
    window.addEventListener('user-plan-updated', handlePlanUpdated)
    return () => window.removeEventListener('user-plan-updated', handlePlanUpdated)
  }, [selectedUser, onSelectUser])

  // Tìm kiếm người dùng khi gõ từ khóa hoặc đổi bộ lọc vai trò
  useEffect(() => {
    if (selectedUser) return
    const timer = setTimeout(async () => {
      if (!searchTerm.trim() && roleFilter === 'all') {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const users = await searchUsersForSubscription({
          search: searchTerm.trim(),
          role: roleFilter,
          size: 6,
        })
        setResults(users || [])
        setIsOpen(true)
      } catch (err) {
        console.warn('Lỗi tìm kiếm người dùng:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, roleFilter, selectedUser])

  const handlePickUser = (user) => {
    onSelectUser(user)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClearSelection = () => {
    onSelectUser(null)
    setSearchTerm('')
    setResults([])
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all"
    >
      {/* ── TRƯỜNG HỢP 1: ĐÃ CHỌN NGƯỜI DÙNG ── */}
      {selectedUser ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            {selectedUser.avatarUrl ? (
              <img
                src={selectedUser.avatarUrl}
                alt={selectedUser.displayName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-100 shrink-0"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-bold text-sm ring-2 ring-brand-100 shrink-0">
                {(selectedUser.displayName || selectedUser.username || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}

            {/* Thông tin tài khoản */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {selectedUser.displayName || selectedUser.username}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border',
                    selectedUser.role === 'teacher'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200',
                  )}
                >
                  {selectedUser.role === 'teacher' ? (
                    <>
                      <GraduationCap size={12} /> Giáo viên
                    </>
                  ) : (
                    <>
                      <Smartphone size={12} /> Học viên
                    </>
                  )}
                </span>
                {selectedUser.plan && selectedUser.plan.toLowerCase() !== 'free' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200 shadow-2xs">
                    <Crown size={12} className="text-amber-600 fill-amber-400 shrink-0" />
                    Gói: {formatPlanName(selectedUser.plan)}
                    {selectedUser.planExpiresAt && (
                      <span className="font-medium text-amber-700/90 text-[10px]">
                        (HSD: {new Date(selectedUser.planExpiresAt).toLocaleDateString('vi-VN')})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    Gói: <strong className="uppercase">Free</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {selectedUser.email} {selectedUser.phone ? `• ${selectedUser.phone}` : ''}
              </p>
            </div>
          </div>

          {/* Các nút thao tác */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenDirectGrant && (
              <button
                type="button"
                onClick={() => onOpenDirectGrant(selectedUser)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-2xs',
                  selectedUser.plan && selectedUser.plan.toLowerCase() !== 'free'
                    ? 'border-amber-300 bg-amber-50/90 text-amber-800 hover:bg-amber-100'
                    : 'border-brand-200 bg-brand-50/80 text-brand-700 hover:bg-brand-100',
                )}
                title={
                  selectedUser.plan && selectedUser.plan.toLowerCase() !== 'free'
                    ? 'Gia hạn thêm thời gian hoặc nâng cấp gói trực tiếp (Yêu cầu xác thực Admin)'
                    : 'Kích hoạt gói dịch vụ trực tiếp (Yêu cầu xác thực Admin)'
                }
              >
                <Zap
                  size={13}
                  className={
                    selectedUser.plan && selectedUser.plan.toLowerCase() !== 'free'
                      ? 'text-amber-600'
                      : 'text-brand-600'
                  }
                />
                <span>
                  {selectedUser.plan && selectedUser.plan.toLowerCase() !== 'free'
                    ? 'Gia hạn / Nâng cấp'
                    : 'Kích hoạt trực tiếp'}
                </span>
                {!isSudoUnlocked && (
                  <Lock size={11} className="text-slate-400 shrink-0 ml-0.5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleClearSelection}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Đổi tài khoản khác"
              aria-label="Hủy chọn người dùng"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* ── TRƯỜNG HỢP 2: THANH TÌM KIẾM NGƯỜI DÙNG ── */
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
                <UserCheck size={15} />
              </div>
              <span className="text-xs font-bold text-slate-900">
                Đăng ký gói cho Học viên / Giáo viên
              </span>
            </div>

            {/* Filter pills: Tất cả / Học viên / Giáo viên */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={cn(
                  'px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer',
                  roleFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('student')}
                className={cn(
                  'px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer',
                  roleFilter === 'student'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                Học viên
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('teacher')}
                className={cn(
                  'px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer',
                  roleFilter === 'teacher'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                Giáo viên
              </button>
            </div>
          </div>

          {/* Ô nhập tìm kiếm */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              placeholder="Nhập tên, email hoặc số điện thoại người dùng để bắt đầu đăng ký hộ..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-9 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {loading ? (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
              />
            ) : searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          {/* Dropdown kết quả tìm kiếm */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {loading ? 'Đang tìm kiếm...' : 'Không tìm thấy người dùng nào phù hợp'}
                </div>
              ) : (
                results.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handlePickUser(u)}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs shrink-0">
                          {(u.displayName || u.username || 'U').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {u.displayName || u.username}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {u.email} {u.phone ? `• ${u.phone}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-bold border',
                          u.role === 'teacher'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200',
                        )}
                      >
                        {u.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                      </span>
                      {u.plan && u.plan.toLowerCase() !== 'free' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Crown size={10} className="text-amber-600 fill-amber-400 shrink-0" />
                          {formatPlanName(u.plan)}
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

