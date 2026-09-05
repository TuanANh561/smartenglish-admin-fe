import { useState, useMemo } from 'react'
import {
  Search,
  Users,
  Check,
  X,
  UserCheck,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

const DEFAULT_GROUP_AVATAR = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&auto=format&fit=crop&q=80'

export default function CreateGroupModal({
  open,
  onClose,
  availableUsers = [],
  onCreateGroup,
}) {
  const [groupName, setGroupName] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeRoleFilter, setActiveRoleFilter] = useState('all') // 'all' | 'teacher' | 'student'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Toggle chọn / bỏ chọn user
  const handleToggleUser = (userId) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
    if (errorMessage) setErrorMessage('')
  }

  // Bỏ chọn nhanh từ chip
  const handleRemoveSelectedUser = (userId) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
  }

  // Danh sách users đã chọn
  const selectedUsers = useMemo(() => {
    return availableUsers.filter((u) => selectedUserIds.has(u.id))
  }, [availableUsers, selectedUserIds])

  // Lọc người dùng theo từ khóa và vai trò (tên, mã định danh)
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return availableUsers.filter((u) => {
      if (activeRoleFilter !== 'all' && u.role !== activeRoleFilter) {
        return false
      }

      if (!q) return true

      const matchName = u.name?.toLowerCase().includes(q)
      const matchCode = u.userCode?.toLowerCase().includes(q)

      return matchName || matchCode
    })
  }, [availableUsers, searchQuery, activeRoleFilter])

  // Reset form khi đóng modal
  const handleClose = () => {
    setGroupName('')
    setSelectedUserIds(new Set())
    setSearchQuery('')
    setActiveRoleFilter('all')
    setErrorMessage('')
    onClose?.()
  }

  // Xử lý tạo nhóm
  const handleSubmit = (e) => {
    e?.preventDefault()

    const trimmedName = groupName.trim()
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập tên nhóm.')
      return
    }

    if (selectedUsers.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 thành viên.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    setTimeout(() => {
      onCreateGroup?.({
        name: trimmedName,
        members: selectedUsers,
        avatar: DEFAULT_GROUP_AVATAR,
      })
      setIsSubmitting(false)
      handleClose()
    }, 200)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      showCloseButton={false}
      className="max-w-lg w-full p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl"
    >
      {/* ─── HEADER ĐƠN GIẢN, TINH TẾ ─── */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Users size={18} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tạo nhóm mới</h3>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-4 text-slate-800">
        {/* ─── NHẬP TÊN NHÓM ─── */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tên nhóm <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="Nhập tên nhóm..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-medium"
            />
            {groupName && (
              <button
                type="button"
                onClick={() => setGroupName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── TÌM KIẾM & CHỌN THÀNH VIÊN ─── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Thêm thành viên
            </label>
            <span className="text-[11px] font-semibold text-brand-600">
              Đã chọn: {selectedUsers.length}
            </span>
          </div>

          {/* Thanh tìm kiếm có nút Tìm kiếm */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc mã thành viên (HV-..., GV-...)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <Search size={13} />
              <span>Tìm</span>
            </button>
          </div>

          {/* Bộ lọc nhanh: Tất cả | Giảng viên | Học viên */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveRoleFilter('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                activeRoleFilter === 'all'
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              Tất cả ({availableUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveRoleFilter('teacher')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                activeRoleFilter === 'teacher'
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              Giảng viên ({availableUsers.filter((u) => u.role === 'teacher').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveRoleFilter('student')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                activeRoleFilter === 'student'
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              Học viên ({availableUsers.filter((u) => u.role === 'student').length})
            </button>
          </div>

          {/* Chips hiển thị các thành viên đã chọn */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center gap-1">
                <UserCheck size={13} className="text-emerald-600" /> Đã chọn:
              </span>
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-2xs"
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span>{u.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedUser(u.id)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* ─── DANH SÁCH USER (CÓ DẤU TÍCH XANH HÌNH VUÔNG BÊN PHẢI) ─── */}
          <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-1 max-h-64 overflow-y-auto scrollbar-none no-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Không tìm thấy thành viên nào.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUserIds.has(u.id)
                const isTeacher = u.role === 'teacher'
                const isAdmin = u.role === 'admin'

                const roleBadgeColor = isTeacher
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : isAdmin
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'

                return (
                  <div
                    key={u.id}
                    onClick={() => handleToggleUser(u.id)}
                    className={cn(
                      'group flex items-center justify-between gap-3 rounded-xl p-2.5 transition-all cursor-pointer select-none',
                      isSelected
                        ? 'bg-emerald-50/60 border border-emerald-200'
                        : 'hover:bg-slate-50 border border-transparent',
                    )}
                  >
                    {/* Trái: Avatar + Thông tin người dùng */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200"
                        />
                        {u.status === 'online' && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="truncate text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {u.name}
                          </p>
                          <span
                            className={cn(
                              'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold border',
                              roleBadgeColor,
                            )}
                          >
                            {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giảng viên' : 'Học viên'}
                          </span>
                        </div>

                        {u.userCode && (
                          <div className="flex items-center text-[11px] text-slate-400">
                            <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {u.userCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phải: DẤU TÍCH XANH HÌNH VUÔNG */}
                    <div className="shrink-0 pl-2">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150',
                          isSelected
                            ? 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-xs'
                            : 'border-2 border-slate-300 bg-white group-hover:border-slate-400',
                        )}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Lỗi nếu có */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}
      </div>

      {/* ─── FOOTER VỚI NÚT TẠO ─── */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
        <div className="text-xs text-slate-500">
          Đã chọn: <span className="font-semibold text-slate-800">{selectedUsers.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !groupName.trim() || selectedUsers.length === 0}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer',
              isSubmitting || !groupName.trim() || selectedUsers.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-navy-700 hover:bg-navy-800 active:scale-98',
            )}
          >
            <Users size={14} />
            <span>
              {isSubmitting
                ? 'Đang tạo...'
                : selectedUsers.length > 0
                ? `Tạo nhóm (${selectedUsers.length})`
                : 'Tạo nhóm'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
