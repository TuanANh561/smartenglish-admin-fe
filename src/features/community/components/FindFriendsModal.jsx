import { useState, useMemo } from 'react'
import { Check, Clock, MessageSquare, Search, UserCheck, UserPlus, Users, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils'

export default function FindFriendsModal({
  open,
  onClose,
  myId,
  myName,
  availableUsers = [],
  friends = [],
  pendingRequests = [],
  sentRequestUserIds = new Set(),
  onSendFriendRequest,
  onRespondFriendRequest,
  onStartChatWithUser,
}) {
  const [tab, setTab] = useState('search') // 'search' | 'requests'
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Map of friend user IDs
  const friendUserIds = useMemo(() => {
    const ids = new Set()
    friends.forEach((f) => {
      if (Number(f.requesterId) === Number(myId)) ids.add(Number(f.addresseeId))
      if (Number(f.addresseeId) === Number(myId)) ids.add(Number(f.requesterId))
    })
    return ids
  }, [friends, myId])

  // Filtered users for search tab
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return availableUsers.filter((u) => {
      if (Number(u.id) === Number(myId)) return false
      const matchQuery =
        !q ||
        (u.name || u.fullName || u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      const uRole = (u.role || '').toUpperCase()
      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'TEACHER' && uRole.includes('TEACHER')) ||
        (roleFilter === 'STUDENT' && (uRole.includes('STUDENT') || uRole.includes('USER'))) ||
        (roleFilter === 'ADMIN' && uRole.includes('ADMIN'))

      return matchQuery && matchRole
    })
  }, [availableUsers, myId, search, roleFilter])

  const handleSend = async (targetUser) => {
    setActionLoadingId(targetUser.id)
    try {
      await onSendFriendRequest(targetUser)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRespond = async (request, accept) => {
    setActionLoadingId(request.id)
    try {
      await onRespondFriendRequest(request.id, accept)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kết nối Bạn bè & Đồng nghiệp"
      description="Tìm kiếm giáo viên, học viên hoặc đồng nghiệp trên hệ thống để kết bạn và trò chuyện"
      size="md"
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'search'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={14} />
            <span>Tìm người dùng</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('requests')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer relative ${
              tab === 'requests'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck size={14} />
            <span>Lời mời kết bạn</span>
            {pendingRequests.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'search' ? (
          <div className="space-y-3">
            {/* Search Input & Role Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="TEACHER">Giáo viên</option>
                <option value="STUDENT">Học viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>

            {/* Users List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  Không tìm thấy người dùng nào phù hợp.
                </p>
              ) : (
                filteredUsers.map((u) => {
                  const uId = Number(u.id)
                  const isFriend = friendUserIds.has(uId)
                  const isSent = sentRequestUserIds.has(uId)
                  const pendingReq = pendingRequests.find((r) => Number(r.requesterId) === uId)
                  const name = u.name || u.fullName || u.displayName || u.email
                  const avatar = u.avatarUrl || u.avatar

                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={avatar}
                          name={name}
                          size="md"
                          className="shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
                            <span className="rounded bg-slate-200/70 px-1.5 py-0.2 text-[9px] font-semibold text-slate-600">
                              {u.role === 'admin'
                                ? 'Admin'
                                : u.role === 'teacher'
                                ? 'Giáo viên'
                                : 'Học viên'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isFriend ? (
                          <div className="flex items-center gap-1">
                            <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">
                              <Check size={12} /> Bạn bè
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onClose()
                                onStartChatWithUser(u)
                              }}
                              className="rounded-lg bg-brand-500 hover:bg-brand-600 text-white p-1.5 cursor-pointer transition-colors"
                              title="Nhắn tin"
                            >
                              <MessageSquare size={13} />
                            </button>
                          </div>
                        ) : pendingReq ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRespond(pendingReq, true)}
                              disabled={actionLoadingId === pendingReq.id}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Check size={12} /> Đồng ý
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRespond(pendingReq, false)}
                              disabled={actionLoadingId === pendingReq.id}
                              className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : isSent ? (
                          <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                            <Clock size={12} /> Đã gửi
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={actionLoadingId === u.id}
                            onClick={() => handleSend(u)}
                            className="text-xs h-7 px-2.5 gap-1 font-semibold text-brand-600 border-brand-200 hover:bg-brand-50"
                          >
                            <UserPlus size={13} />
                            Kết bạn
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          /* Tab: Lời mời kết bạn đang chờ */
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-none">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <UserCheck size={28} className="mx-auto text-slate-300 mb-2" />
                Không có lời mời kết bạn nào đang chờ.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={req.requesterAvatar}
                      name={req.requesterName}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {req.requesterName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Đã gửi {formatRelativeTime(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleRespond(req, true)}
                      className="flex items-center gap-1 rounded-lg bg-navy-800 hover:bg-navy-900 text-white px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Check size={13} />
                      Đồng ý
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleRespond(req, false)}
                      className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 px-2 py-1 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} className="px-4">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  )
}
