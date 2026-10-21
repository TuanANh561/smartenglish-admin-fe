import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  FileText,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import PostCard from './PostCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { useCommunitySearchStore } from '@/store/communitySearchStore'
import { cn } from '@/lib/utils'

// Chuẩn hóa chuỗi tìm kiếm không dấu
function normalizeText(text) {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const USERS_PER_PAGE = 12

export default function CommunitySearchResults({
  posts = [],
  users = [],
  friends = [],
  pendingRequests = [],
  sentRequestUserIds = new Set(),
  onlineUserIds = new Set(),
  bookmarkedPostIds = new Set(),
  activeMenuPostId,
  setActiveMenuPostId,
  checkPostOwnership,
  handleLikePost,
  handleBookmarkPost,
  handleSharePost,
  handleDeletePost,
  setSelectedPostForComment,
  setSelectedPostForImage,
  setSelectedTag,
  onSendFriendRequest,
  onRespondFriendRequest,
  onStartChatWithUser,
}) {
  const currentUser = useAuthStore((s) => s.user)
  const myId = currentUser?.id

  const {
    searchQuery,
    setSearchQuery,
    searchActiveTab,
    setSearchActiveTab,
    setIsSearchingMode,
  } = useCommunitySearchStore()

  const [roleFilter, setRoleFilter] = useState('ALL') // 'ALL' | 'TEACHER' | 'STUDENT' | 'ADMIN'
  const [displayedUsersCount, setDisplayedUsersCount] = useState(USERS_PER_PAGE)
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false)

  // Map of friend user IDs
  const friendUserIds = useMemo(() => {
    const ids = new Set()
    friends.forEach((f) => {
      if (Number(f.requesterId) === Number(myId)) ids.add(Number(f.addresseeId))
      if (Number(f.addresseeId) === Number(myId)) ids.add(Number(f.requesterId))
    })
    return ids
  }, [friends, myId])

  // Lọc bài viết khớp với từ khóa tìm kiếm
  const matchedPosts = useMemo(() => {
    const q = normalizeText(searchQuery)
    if (!q) return posts

    return posts.filter((post) => {
      const content = normalizeText(post.content)
      const author = normalizeText(post.authorName)
      const tags = (post.tags || []).map((t) => normalizeText(t)).join(' ')
      return content.includes(q) || author.includes(q) || tags.includes(q)
    })
  }, [posts, searchQuery])

  // Lọc danh sách người dùng khớp với từ khóa tìm kiếm & role filter
  const matchedUsers = useMemo(() => {
    const q = normalizeText(searchQuery)

    return users.filter((u) => {
      if (Number(u.id) === Number(myId)) return false

      const name = normalizeText(u.name || u.displayName || u.fullName)
      const username = normalizeText(u.username)
      const email = normalizeText(u.email)
      const role = normalizeText(u.role)
      const bio = normalizeText(u.bio)

      const matchesQuery =
        !q ||
        name.includes(q) ||
        username.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        bio.includes(q)

      const uRole = (u.role || '').toUpperCase()
      const matchesRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'TEACHER' && uRole.includes('TEACHER')) ||
        (roleFilter === 'STUDENT' && (uRole.includes('STUDENT') || uRole.includes('USER'))) ||
        (roleFilter === 'ADMIN' && uRole.includes('ADMIN'))

      return matchesQuery && matchesRole
    })
  }, [users, searchQuery, myId, roleFilter])

  // Reset số lượng người dùng hiển thị khi đổi từ khóa hoặc bộ lọc role
  useEffect(() => {
    setDisplayedUsersCount(USERS_PER_PAGE)
  }, [searchQuery, roleFilter])

  // Danh sách người dùng được cắt lát theo số lượng đã load (12 -> 24 -> 36...)
  const visibleUsers = useMemo(() => {
    return matchedUsers.slice(0, displayedUsersCount)
  }, [matchedUsers, displayedUsersCount])

  const hasMoreUsers = displayedUsersCount < matchedUsers.length

  // Infinite scrolling observer cho danh sách người dùng khi kéo đến cuối
  const userObserverRef = useRef(null)
  const triggerUserRef = useCallback(
    (node) => {
      if (isLoadingMoreUsers || !hasMoreUsers) return
      if (userObserverRef.current) userObserverRef.current.disconnect()

      userObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreUsers) {
            setIsLoadingMoreUsers(true)
            setTimeout(() => {
              setDisplayedUsersCount((prev) => Math.min(prev + USERS_PER_PAGE, matchedUsers.length))
              setIsLoadingMoreUsers(false)
            }, 300)
          }
        },
        { rootMargin: '100px' },
      )

      if (node) userObserverRef.current.observe(node)
    },
    [isLoadingMoreUsers, hasMoreUsers, matchedUsers.length],
  )

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── BANNER THANH KẾT QUẢ TÌM KIẾM & NÚT QUAY LẠI ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSearchingMode(false)
                setSearchQuery('')
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-all cursor-pointer shadow-2xs"
              title="Quay lại bảng tin cộng đồng"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy-900 tracking-tight">
                  Kết quả tìm kiếm
                </h2>
                {searchQuery && (
                  <span className="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md border border-brand-200/60 font-semibold">
                    "{searchQuery}"
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tìm thấy {matchedPosts.length} bài viết và {matchedUsers.length} người dùng phù hợp
              </p>
            </div>
          </div>
        </div>

        {/* ── 2 TABS CHUYỂN ĐỔI: BÀI VIẾT (TAB 1) & NGƯỜI DÙNG (TAB 2) ── */}
        <div className="flex items-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => setSearchActiveTab('posts')}
            className={cn(
              'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
              searchActiveTab === 'posts'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
            )}
          >
            <FileText size={15} />
            <span>Bài viết liên quan</span>
            <span
              className={cn(
                'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                searchActiveTab === 'posts' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700',
              )}
            >
              {matchedPosts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSearchActiveTab('users')}
            className={cn(
              'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
              searchActiveTab === 'users'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
            )}
          >
            <Users size={15} />
            <span>Danh sách người dùng</span>
            <span
              className={cn(
                'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                searchActiveTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700',
              )}
            >
              {matchedUsers.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── NỘI DUNG TAB 1: BÀI VIẾT LIÊN QUAN ── */}
      {searchActiveTab === 'posts' && (
        <div className="space-y-4">
          {matchedPosts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center text-slate-400 shadow-2xs">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Không tìm thấy bài viết nào chứa từ khóa "{searchQuery}"
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Thử tìm với từ khóa chung hơn hoặc chuyển sang tab Người dùng để kết nối bạn mới!
              </p>
            </div>
          ) : (
            matchedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                cardRef={null}
                isOwner={checkPostOwnership(post)}
                isBookmarked={bookmarkedPostIds.has(post.id)}
                isMenuOpen={activeMenuPostId === post.id}
                onToggleMenu={() =>
                  setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                }
                onCloseMenu={() => setActiveMenuPostId(null)}
                onEditPost={() => {}}
                onDeletePost={handleDeletePost}
                onSelectTag={setSelectedTag}
                onLikePost={handleLikePost}
                onOpenCommentModal={(targetPost) => setSelectedPostForComment(targetPost)}
                onViewFullImage={(targetPost) => setSelectedPostForImage(targetPost)}
                onBookmarkPost={handleBookmarkPost}
                onSharePost={handleSharePost}
              />
            ))
          )}
        </div>
      )}

      {/* ── NỘI DUNG TAB 2: DANH SÁCH NGƯỜI DÙNG & KẾT BẠN (LOAD 10-20 MƯỢT MÀ) ── */}
      {searchActiveTab === 'users' && (
        <div className="space-y-4">
          {/* Bộ lọc phân loại vai trò người dùng */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">
              <Filter size={12} />
              Lọc theo:
            </span>
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'TEACHER', label: 'Giảng viên' },
              { id: 'STUDENT', label: 'Học viên' },
              { id: 'ADMIN', label: 'Quản trị viên' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRoleFilter(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0',
                  roleFilter === f.id
                    ? 'bg-brand-600 text-white shadow-2xs font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lưới danh sách người dùng */}
          {matchedUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center text-slate-400 shadow-2xs">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Không tìm thấy người dùng nào phù hợp với từ khóa "{searchQuery}"
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy kiểm tra lại chính tả hoặc thử tìm kiếm theo email / tên đăng nhập.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleUsers.map((targetUser, index) => {
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

                  const isTrigger = index === visibleUsers.length - 2

                  return (
                    <div
                      key={targetUser.id}
                      ref={isTrigger ? triggerUserRef : null}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      {/* Thông tin định danh người dùng */}
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <Avatar
                            name={targetUser.name || targetUser.displayName}
                            src={targetUser.avatarUrl || targetUser.avatar}
                            className="h-12 w-12 rounded-full object-cover shadow-2xs ring-2 ring-slate-100"
                          />
                          {isOnline && (
                            <span
                              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white"
                              title="Đang hoạt động"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm text-navy-900 truncate">
                              {targetUser.name || targetUser.displayName || targetUser.username}
                            </h3>
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

                          <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                            {targetUser.email || `@${targetUser.username || 'user'}`}
                          </p>

                          {targetUser.bio && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {targetUser.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Nút hành động Kết bạn & Nhắn tin */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {isFriend ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                              <CheckCircle2 size={13} />
                              Bạn bè
                            </span>
                            <button
                              type="button"
                              onClick={() => onStartChatWithUser?.(targetUser)}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <MessageSquare size={14} />
                              <span>Nhắn tin</span>
                            </button>
                          </div>
                        ) : incomingRequest ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <button
                              type="button"
                              onClick={() => onRespondFriendRequest?.(incomingRequest.id, true)}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 hover:bg-brand-700 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-2xs"
                            >
                              <UserCheck size={14} />
                              Chấp nhận kết bạn
                            </button>
                            <button
                              type="button"
                              onClick={() => onStartChatWithUser?.(targetUser)}
                              className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 text-xs transition-all cursor-pointer"
                              title="Nhắn tin"
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        ) : isSentRequest ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 py-2 text-xs font-medium text-slate-500">
                              <Clock size={13} />
                              Đã gửi lời mời
                            </span>
                            <button
                              type="button"
                              onClick={() => onStartChatWithUser?.(targetUser)}
                              className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 text-xs transition-all cursor-pointer"
                              title="Nhắn tin"
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-1">
                            <button
                              type="button"
                              onClick={() => onSendFriendRequest?.(targetUser)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy-900 hover:bg-brand-600 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-2xs"
                            >
                              <UserPlus size={14} />
                              Kết bạn
                            </button>
                            <button
                              type="button"
                              onClick={() => onStartChatWithUser?.(targetUser)}
                              className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 text-xs transition-all cursor-pointer"
                              title="Nhắn tin ngay"
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Indicator tải thêm người dùng */}
              {isLoadingMoreUsers && (
                <div className="py-4 flex items-center justify-center gap-2 text-xs text-brand-600 font-semibold">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang tải thêm người dùng...</span>
                </div>
              )}

              {/* Thông báo đã tải hết */}
              {!hasMoreUsers && matchedUsers.length > USERS_PER_PAGE && (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  ✨ Đã hiển thị toàn bộ {matchedUsers.length} người dùng phù hợp
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
