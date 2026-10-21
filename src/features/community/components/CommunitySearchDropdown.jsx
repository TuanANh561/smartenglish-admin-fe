import { useMemo } from 'react'
import {
  TrendingUp,
  UserPlus,
  UserCheck,
  Clock,
  MessageSquare,
  ArrowRight,
  Hash,
  Sparkles,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useCommunitySearchStore } from '@/store/communitySearchStore'
import { cn } from '@/lib/utils'

// Hàm chuẩn hóa chuỗi tiếng Việt để tìm kiếm không dấu
function normalizeText(text) {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default function CommunitySearchDropdown({ onClose }) {
  const currentUser = useAuthStore((s) => s.user)
  const myId = currentUser?.id

  const {
    searchQuery,
    setSearchQuery,
    setIsSearchingMode,
    setSearchActiveTab,
    trendingTopics,
    selectedTag,
    setSelectedTag,
    users,
    friends,
    pendingRequests,
    sentRequestUserIds,
    onlineUserIds,
    onSendFriendRequest,
    onRespondFriendRequest,
    onStartChatWithUser,
  } = useCommunitySearchStore()

  // Tập hợp ID bạn bè
  const friendUserIds = useMemo(() => {
    const ids = new Set()
    friends.forEach((f) => {
      if (Number(f.requesterId) === Number(myId)) ids.add(Number(f.addresseeId))
      if (Number(f.addresseeId) === Number(myId)) ids.add(Number(f.requesterId))
    })
    return ids
  }, [friends, myId])

  // Lọc tối đa 10 người dùng gần giống nhất với từ khóa
  const { topUsers, totalMatchedUsers } = useMemo(() => {
    const q = normalizeText(searchQuery)
    if (!q) return { topUsers: [], totalMatchedUsers: 0 }

    const matched = users.filter((u) => {
      if (Number(u.id) === Number(myId)) return false
      const name = normalizeText(u.name || u.displayName || u.fullName)
      const username = normalizeText(u.username)
      const email = normalizeText(u.email)
      const role = normalizeText(u.role)
      const bio = normalizeText(u.bio)
      return (
        name.includes(q) ||
        username.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        bio.includes(q)
      )
    })

    return {
      topUsers: matched.slice(0, 10),
      totalMatchedUsers: matched.length,
    }
  }, [users, searchQuery, myId])

  // Xử lý khi chọn một chủ đề thảo luận
  const handleSelectTopic = (topic) => {
    const tag = topic.tag || topic.label?.replace('#', '')
    setSelectedTag(tag)
    setSearchQuery('')
    setIsSearchingMode(false)
    onClose?.()
  }

  // Chuyển sang xem toàn bộ kết quả tìm kiếm chi tiết
  const handleViewAllResults = (initialTab = 'users') => {
    setIsSearchingMode(true)
    setSearchActiveTab(initialTab)
    onClose?.()
  }

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── TRƯỜNG HỢP 1: KHI CHƯA NHẬP TỪ KHÓA -> HIỂN THỊ CHỦ ĐỀ THẢO LUẬN ── */}
      {!searchQuery.trim() ? (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <TrendingUp size={14} />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Chủ Đề Thảo Luận Sôi Nổi
              </h3>
            </div>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
              >
                Bỏ lọc ({selectedTag})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
            {trendingTopics.map((topic, index) => {
              const tagName = topic.tag || topic.label?.replace('#', '')
              const label = topic.label || `#${tagName}`
              const postCount =
                topic.postCount || (topic.count ? `${topic.count} bài viết` : 'Sôi nổi')
              const isSelected = selectedTag === tagName

              return (
                <div
                  key={topic.tag || index}
                  onClick={() => handleSelectTopic(topic)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group',
                    isSelected
                      ? 'bg-brand-50 border border-brand-200/80 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold shrink-0',
                        index === 0
                          ? 'bg-amber-100 text-amber-700 font-extrabold shadow-2xs'
                          : index === 1
                          ? 'bg-slate-200 text-slate-700'
                          : index === 2
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'font-semibold text-xs truncate transition-colors',
                          isSelected
                            ? 'text-brand-700 font-bold'
                            : 'text-slate-800 group-hover:text-brand-600',
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] text-slate-400">{postCount}</p>
                    </div>
                  </div>

                  <TrendingUp
                    size={14}
                    className={cn(
                      'shrink-0 transition-colors',
                      isSelected ? 'text-brand-600' : 'text-slate-300 group-hover:text-brand-500',
                    )}
                  />
                </div>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              Gõ tên giáo viên, học viên hoặc từ khóa để tìm kiếm nhanh
            </span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
              Nhấn Enter để tìm
            </span>
          </div>
        </div>
      ) : (
        /* ── TRƯỜNG HỢP 2: KHI NGƯỜI DÙNG ĐÃ NHẬP TỪ KHÓA -> TÌM NGƯỜI DÙNG & GỢI Ý ── */
        <div className="divide-y divide-slate-100">
          {/* Header kết quả tìm kiếm người dùng */}
          <div className="px-4 py-2.5 bg-slate-50/70 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Người dùng phù hợp ({totalMatchedUsers})
            </p>
            {totalMatchedUsers > 0 && (
              <span className="text-[11px] text-slate-400">
                Hiển thị {topUsers.length}/{totalMatchedUsers} người
              </span>
            )}
          </div>

          {/* Danh sách tối đa 10 người dùng */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80">
            {topUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <p className="text-xs font-semibold text-slate-600">Không tìm thấy người dùng phù hợp</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Thử tìm kiếm với tên, email hoặc chức vụ khác
                </p>
              </div>
            ) : (
              topUsers.map((targetUser) => {
                const targetId = Number(targetUser.id)
                const isFriend = friendUserIds.has(targetId)
                const isSentRequest = sentRequestUserIds?.has?.(targetId)
                const incomingRequest = pendingRequests?.find(
                  (r) => Number(r.requesterId) === targetId,
                )
                const isOnline = onlineUserIds?.has?.(targetId)

                const roleLabel =
                  targetUser.role === 'teacher'
                    ? 'Giảng viên'
                    : targetUser.role === 'admin'
                    ? 'Quản trị viên'
                    : 'Học viên'

                return (
                  <div
                    key={targetUser.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50/80 transition-colors gap-3"
                  >
                    {/* Thông tin người dùng */}
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        if (onStartChatWithUser) {
                          onStartChatWithUser(targetUser)
                          onClose?.()
                        }
                      }}
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          name={targetUser.name || targetUser.displayName}
                          src={targetUser.avatarUrl || targetUser.avatar}
                          size="md"
                        />
                        {isOnline && (
                          <span
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"
                            title="Đang hoạt động"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-xs text-navy-900 truncate">
                            {targetUser.name || targetUser.displayName || targetUser.username}
                          </p>
                          <span
                            className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                              targetUser.role === 'teacher'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : targetUser.role === 'admin'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
                            )}
                          >
                            {roleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {targetUser.email || `@${targetUser.username || 'user'}`}
                        </p>
                      </div>
                    </div>

                    {/* Các nút tương tác kết bạn / nhắn tin */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isFriend ? (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                            <UserCheck size={12} />
                            Bạn bè
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onStartChatWithUser?.(targetUser)
                              onClose?.()
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                            title="Nhắn tin"
                          >
                            <MessageSquare size={13} />
                          </button>
                        </>
                      ) : incomingRequest ? (
                        <button
                          type="button"
                          onClick={() => onRespondFriendRequest?.(incomingRequest.id, true)}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 hover:bg-brand-700 px-2.5 py-1 text-[11px] font-bold text-white transition-all cursor-pointer shadow-2xs"
                        >
                          <UserCheck size={12} />
                          Chấp nhận
                        </button>
                      ) : isSentRequest ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                          <Clock size={12} />
                          Đã gửi lời mời
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSendFriendRequest?.(targetUser)}
                          className="inline-flex items-center gap-1 rounded-lg bg-navy-900 hover:bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-all cursor-pointer shadow-2xs"
                        >
                          <UserPlus size={12} />
                          Kết bạn
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer: Nút xem tất cả kết quả chi tiết (Tab bài viết & Tab người dùng) */}
          <div className="p-3 bg-slate-50/90 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 text-[11px]">
              Nhấn <strong>Enter</strong> để tìm toàn diện
            </span>
            <button
              type="button"
              onClick={() => handleViewAllResults('users')}
              className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-bold cursor-pointer group"
            >
              <span>Xem toàn bộ kết quả ({totalMatchedUsers} người dùng)</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
