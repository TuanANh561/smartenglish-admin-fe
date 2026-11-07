import { useMemo } from 'react'
import { UserPlus, Check, MessageSquare, Clock } from 'lucide-react'
import Avatar, { sanitizeAvatarUrl } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export default function SuggestedUsersCard({
  currentUser,
  availableUsers = [],
  friends = [],
  pendingRequests = [],
  sentRequestUserIds = new Set(),
  onSendFriendRequest,
  onRespondFriendRequest,
  onStartChat,
  onOpenFindFriends,
}) {
  const myId = Number(currentUser?.id) || 0

  // Danh sách ID bạn bè đã kết nối
  const friendUserIds = useMemo(() => {
    const ids = new Set()
    friends.forEach((f) => {
      if (Number(f.requesterId) === myId) ids.add(Number(f.addresseeId))
      if (Number(f.addresseeId) === myId) ids.add(Number(f.requesterId))
    })
    return ids
  }, [friends, myId])

  // Lọc và sắp xếp 5 người dùng đề xuất
  // Ưu tiên hiển thị những người CHƯA gửi lời mời kết bạn lên trước
  const suggestedUsers = useMemo(() => {
    const list = availableUsers.filter((u) => {
      const uid = Number(u.id)
      if (!uid || uid === myId) return false
      if (friendUserIds.has(uid)) return false
      return true
    })

    return list
      .sort((a, b) => {
        const aSent = sentRequestUserIds?.has?.(Number(a.id)) ? 1 : 0
        const bSent = sentRequestUserIds?.has?.(Number(b.id)) ? 1 : 0
        return aSent - bSent
      })
      .slice(0, 5)
  }, [availableUsers, myId, friendUserIds, sentRequestUserIds])

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
      {/* ─── HÀNG THÔNG TIN TÀI KHOẢN CỦA BẠN (Chuẩn Instagram) ─── */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={sanitizeAvatarUrl(currentUser?.avatarUrl || currentUser?.avatar)}
            name={currentUser?.displayName || currentUser?.name || 'Tài khoản'}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentUser?.displayName || currentUser?.name || 'Quản trị viên'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser?.role === 'admin'
                ? 'Quản trị viên hệ thống'
                : currentUser?.role === 'teacher'
                ? 'Giảng viên SmartEnglish'
                : 'Học viên'}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
          Bạn
        </span>
      </div>

      {/* ─── HEADER PHẦN GỢI Ý KẾT BẠN ─── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Gợi ý cho bạn
        </span>
        <button
          type="button"
          onClick={onOpenFindFriends}
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
        >
          Xem tất cả
        </button>
      </div>

      {/* ─── DANH SÁCH GỢI Ý (4-5 NGƯỜI) ─── */}
      <div className="space-y-3">
        {suggestedUsers.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            Không có người dùng mới nào để gợi ý
          </div>
        ) : (
          suggestedUsers.map((u) => {
            const uid = Number(u.id)
            const isSent = sentRequestUserIds?.has?.(uid)
            const pendingReq = pendingRequests.find((r) => Number(r.requesterId) === uid)
            const roleLabel =
              u.role === 'teacher'
                ? 'Giáo viên'
                : u.role === 'admin'
                ? 'Quản trị viên'
                : 'Học viên'

            return (
              <div key={uid} className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={sanitizeAvatarUrl(u.avatarUrl || u.avatar)}
                    name={u.displayName || u.name || u.username}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {u.displayName || u.name || u.username}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {roleLabel} • Gợi ý cho bạn
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Trường hợp 1: Người đó đã gửi lời mời cho mình -> Nút Xác nhận */}
                  {pendingReq ? (
                    <button
                      type="button"
                      onClick={() => onRespondFriendRequest?.(pendingReq.id, true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs"
                      title="Chấp nhận lời mời kết bạn"
                    >
                      <Check size={11} strokeWidth={2.5} />
                      Xác nhận
                    </button>
                  ) : isSent ? (
                    /* Trường hợp 2: Mình đã gửi lời mời cho người đó -> Badge "Đã gửi" */
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-semibold border border-slate-200/90 shadow-2xs select-none"
                      title="Đã gửi lời mời kết bạn, đang chờ đối phương phản hồi"
                    >
                      <Check size={11} className="text-emerald-600" strokeWidth={2.5} />
                      Đã gửi
                    </span>
                  ) : (
                    /* Trường hợp 3: Chưa gửi lời mời -> Nút "Kết bạn" */
                    <button
                      type="button"
                      onClick={() => onSendFriendRequest?.(u)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-800 hover:bg-brand-50 transition-colors cursor-pointer px-2 py-1 rounded-lg"
                    >
                      Kết bạn
                    </button>
                  )}

                  {onStartChat && (
                    <button
                      type="button"
                      onClick={() => onStartChat(u)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Nhắn tin trực tiếp"
                    >
                      <MessageSquare size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
