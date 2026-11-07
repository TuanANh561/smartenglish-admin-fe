import { useState, useMemo, useRef, useEffect, useLayoutEffect, Fragment } from 'react'
import {
  Send,
  MessageCircle,
  X,
  Minimize2,
  SquarePen,
  Search,
  ChevronLeft,
  Check,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Reply,
  Pin,
  RotateCcw,
  Download,
  ChevronDown,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import Avatar, { sanitizeAvatarUrl } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { formatLastMessage } from './ChatConversationSidebar'
import toast from 'react-hot-toast'
import { http } from '@/lib/api'

// Helper phân tích thời gian tin nhắn
function parseMessageDate(m) {
  if (!m) return null
  if (m.createdAt) {
    const d = new Date(m.createdAt)
    if (!isNaN(d.getTime())) return d
  }
  if (m.timestamp) {
    const d = new Date(m.timestamp)
    if (!isNaN(d.getTime())) return d
  }
  return null
}

// Helper định dạng dòng thời gian phân cách ngày chuẩn Messenger & Zalo
function formatChatDateDivider(date) {
  if (!date || isNaN(date.getTime())) return null

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = today.getTime() - msgDay.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  const pad = (n) => String(n).padStart(2, '0')
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`

  if (diffDays <= 0) {
    return `Hôm nay, ${timeStr}`
  }
  if (diffDays === 1) {
    return `Hôm qua, ${timeStr}`
  }
  if (diffDays > 1 && diffDays < 7) {
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    const dayName = daysOfWeek[date.getDay()]
    return `${dayName}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)} lúc ${timeStr}`
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${pad(date.getDate())} tháng ${pad(date.getMonth() + 1)} lúc ${timeStr}`
  }

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} lúc ${timeStr}`
}

const REACTIONS = [
  { type: 'LIKE', icon: '👍' },
  { type: 'LOVE', icon: '❤️' },
  { type: 'HAHA', icon: '😂' },
  { type: 'WOW', icon: '😮' },
  { type: 'SAD', icon: '😢' },
  { type: 'ANGRY', icon: '😡' },
]

export default function InstagramMessagesDock({
  conversations = [],
  availableUsers = [],
  myId,
  myName,
  getConversationAvatar,
  getSenderAvatar,
  onSendMessage,
  onSendMediaMessage,
  onReactMessage,
  onRecallMessage,
  onTogglePinMessage,
  typingMap = {},
  onTyping,
  onNavigateToPost,
  onLoadOlderMessages,
  loadingOlderMap = {},
  onSelectConversationInDock,
  onStartChatInDock,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'new_message' | 'chat'
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [conversationSearch, setConversationSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const searchInputRef = useRef(null)

  // Lấy cuộc trò chuyện đang được chọn khi ở view === 'chat'
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null
    return conversations.find((c) => c.id === activeConversationId) || null
  }, [conversations, activeConversationId])

  // Tổng số tin nhắn chưa đọc
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (Number(c.unread) || 0), 0)
  }, [conversations])

  // Lấy 3 avatar của các cuộc trò chuyện gần nhất để hiển thị trên nút dock (Avatar stack chuẩn Instagram)
  const recentAvatars = useMemo(() => {
    const avatars = []
    for (const c of conversations) {
      const src = getConversationAvatar?.(c)
      if (src && !avatars.includes(src)) {
        avatars.push(src)
      }
      if (avatars.length >= 3) break
    }
    return avatars
  }, [conversations, getConversationAvatar])

  // Lọc danh sách cuộc trò chuyện theo ô tìm kiếm
  const filteredConversations = useMemo(() => {
    const q = conversationSearch.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) =>
      (c.participantName || '').toLowerCase().includes(q),
    )
  }, [conversations, conversationSearch])

  // Lọc danh sách người dùng cho màn hình "Tin nhắn mới"
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase()
    return availableUsers.filter((u) => {
      if (Number(u.id) === Number(myId)) return false
      if (!q) return true
      const name = (u.displayName || u.name || u.username || '').toLowerCase()
      const role = (u.role || '').toLowerCase()
      return name.includes(q) || role.includes(q)
    })
  }, [availableUsers, myId, userSearch])

  // Focus ô tìm kiếm khi chuyển sang màn hình "Tin nhắn mới"
  useEffect(() => {
    if (view === 'new_message' && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [view])

  // Chọn cuộc trò chuyện từ danh sách -> chuyển nội dung modal sang view 'chat'
  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId)
    setView('chat')
    onSelectConversationInDock?.(convId)
  }

  // Bắt đầu chat với user mới -> chuyển nội dung modal sang view 'chat'
  const handleStartChat = async () => {
    if (!selectedUser || isStartingChat) return
    setIsStartingChat(true)
    try {
      if (onStartChatInDock) {
        const convId = await onStartChatInDock(selectedUser)
        if (convId) {
          setActiveConversationId(convId)
          setView('chat')
          setSelectedUser(null)
          setUserSearch('')
        }
      }
    } catch (err) {
      console.error('Error starting chat in dock:', err)
    } finally {
      setIsStartingChat(false)
    }
  }

  // Đóng modal và reset trạng thái về list
  const handleCloseDock = () => {
    setIsOpen(false)
    // Nếu muốn khi mở lại vẫn giữ trạng thái thì giữ nguyên, hoặc reset về list
  }

  return (
    <>
      {/* ─── 1. NÚT NỔI DOCK TIN NHẮN (CHẾ ĐỘ THU GỌN - CHUẨN INSTAGRAM) ─── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-24 max-sm:bottom-20 max-sm:right-4 z-40 flex items-center gap-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 shadow-xl hover:shadow-2xl border border-slate-700/60 active:scale-95 transition-all cursor-pointer group"
          title="Mở tin nhắn trực tiếp"
          aria-label="Mở tin nhắn trực tiếp"
        >
          {/* Icon tin nhắn phi thuyền giấy */}
          <div className="relative flex items-center justify-center">
            <Send size={16} className="-rotate-12 group-hover:scale-110 transition-transform text-white" />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm border border-slate-900">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>

          <span className="text-xs font-bold tracking-wide">Tin nhắn</span>

          {/* Stack 3 avatar tròn đè lên nhau */}
          {recentAvatars.length > 0 && (
            <div className="flex -space-x-2 overflow-hidden py-0.5 ml-0.5">
              {recentAvatars.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="contact"
                  className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-slate-900 object-cover bg-slate-200"
                />
              ))}
            </div>
          )}
        </button>
      )}

      {/* ─── 2. CỬA SỔ DOCK NỔI (ĐỔI NỘI DUNG NGAY TRONG MODAL, CÓ NÚT QUAY LẠI) ─── */}
      {isOpen && (
        <div className="fixed bottom-5 right-24 max-sm:bottom-4 max-sm:right-2 z-40 flex w-[360px] sm:w-[380px] max-w-[calc(100vw-1rem)] h-[540px] max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
          
          {/* ════ VIEW 1: DANH SÁCH CUỘC TRÒ CHUYỆN ════ */}
          {view === 'list' && (
            <>
              {/* Header danh sách tin nhắn */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Tin nhắn</h3>
                  {totalUnread > 0 && (
                    <span className="rounded-full bg-rose-50 text-rose-600 px-2 py-0.2 text-[10px] font-bold border border-rose-200">
                      {totalUnread} mới
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setView('new_message')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Soạn tin nhắn mới"
                  >
                    <SquarePen size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Thu nhỏ cửa sổ tin nhắn"
                  >
                    <Minimize2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDock}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Đóng cửa sổ"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Ô tìm kiếm cuộc trò chuyện */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={conversationSearch}
                    onChange={(e) => setConversationSearch(e.target.value)}
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  {conversationSearch && (
                    <button
                      type="button"
                      onClick={() => setConversationSearch('')}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Danh sách các cuộc trò chuyện */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-0.5">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <MessageCircle size={24} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Chưa có cuộc trò chuyện nào</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                      Gửi tin nhắn hoặc tìm bạn mới để bắt đầu kết nối.
                    </p>
                    <button
                      type="button"
                      onClick={() => setView('new_message')}
                      className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <SquarePen size={13} />
                      <span>Nhắn tin mới</span>
                    </button>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const avatarSrc = getConversationAvatar?.(c)
                    const lastMsg = formatLastMessage(c, myId)
                    const hasUnread = Number(c.unread) > 0

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectConversation(c.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors cursor-pointer hover:bg-slate-50',
                          hasUnread && 'bg-slate-50/80',
                        )}
                      >
                        {/* Avatar kèm chấm xanh online */}
                        <div className="relative flex shrink-0 items-center justify-center w-10 h-10">
                          <Avatar
                            src={avatarSrc}
                            name={c.participantName}
                            size="md"
                          />
                          {c.online && (
                            <span
                              className="absolute bottom-0 right-0 h-3 w-3 aspect-square rounded-full border-2 border-white bg-emerald-500 shadow-xs z-10 block shrink-0"
                              title="Đang hoạt động"
                            />
                          )}
                        </div>

                        {/* Thông tin tên & tin nhắn cuối */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p
                              className={cn(
                                'truncate text-xs',
                                hasUnread ? 'font-bold text-slate-950' : 'font-semibold text-slate-800',
                              )}
                            >
                              {c.participantName}
                            </p>
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {c.lastTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                'truncate text-[11px]',
                                hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500',
                              )}
                            >
                              {lastMsg}
                            </p>
                            {hasUnread && (
                              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shrink-0">
                                {c.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {/* Nút tròn nổi soạn tin nhắn mới ở góc dưới bên phải */}
              <div className="absolute bottom-3 right-3">
                <button
                  type="button"
                  onClick={() => setView('new_message')}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg active:scale-95 transition-all cursor-pointer group"
                  title="Soạn tin nhắn mới"
                >
                  <SquarePen size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </>
          )}

          {/* ════ VIEW 2: SOẠN TIN NHẮN MỚI / TÌM BẠN (CÓ NÚT QUAY LẠI <) ════ */}
          {view === 'new_message' && (
            <>
              {/* Header có nút quay lại < và nút X */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3.5 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView('list')
                      setSelectedUser(null)
                      setUserSearch('')
                    }}
                    className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Quay lại danh sách tin nhắn"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-sm font-bold text-slate-900">Tin nhắn mới</h3>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDock}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Đóng cửa sổ"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Hàng tìm kiếm inline "Đến: Tìm kiếm..." */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-white shrink-0">
                <span className="text-xs font-bold text-slate-900 shrink-0">Đến:</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm kiếm người dùng, bạn bè..."
                  className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {userSearch && (
                  <button
                    type="button"
                    onClick={() => setUserSearch('')}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Danh sách người dùng gợi ý */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-0.5">
                <div className="px-2.5 py-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Gợi ý
                  </span>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Không tìm thấy người dùng phù hợp
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id
                    const roleLabel =
                      u.role === 'teacher'
                        ? 'Giáo viên'
                        : u.role === 'admin'
                        ? 'Quản trị viên'
                        : 'Học viên'

                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(isSelected ? null : u)}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl p-2.5 transition-colors cursor-pointer select-none',
                          isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50',
                        )}
                      >
                        {/* Avatar & Thông tin */}
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            src={sanitizeAvatarUrl(u.avatarUrl || u.avatar)}
                            name={u.displayName || u.name || u.username}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {u.displayName || u.name || u.username}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              @{u.username || `user${u.id}`} • {roleLabel}
                            </p>
                          </div>
                        </div>

                        {/* Nút Radio tròn bên phải */}
                        <div className="shrink-0 pr-1">
                          <div
                            className={cn(
                              'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all',
                              isSelected
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-slate-300 hover:border-slate-400',
                            )}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer nút "Bắt đầu trò chuyện" */}
              <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                <button
                  type="button"
                  disabled={!selectedUser || isStartingChat}
                  onClick={handleStartChat}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs text-center cursor-pointer flex items-center justify-center gap-1.5',
                    selectedUser && !isStartingChat
                      ? 'bg-brand-600 hover:bg-brand-700 text-white active:scale-98'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                  )}
                >
                  {isStartingChat ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang mở cuộc trò chuyện...</span>
                    </>
                  ) : (
                    <span>Bắt đầu trò chuyện</span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ════ VIEW 3: GIAO DIỆN CHAT TRỰC TIẾP TRONG CHÍNH MODAL (CÓ NÚT QUAY LẠI <) ════ */}
          {view === 'chat' && activeConversation && (
            <DockChatView
              conversation={activeConversation}
              myId={myId}
              myName={myName}
              getConversationAvatar={getConversationAvatar}
              getSenderAvatar={getSenderAvatar}
              onBack={() => {
                setView('list')
                setActiveConversationId(null)
              }}
              onClose={handleCloseDock}
              onSendMessage={onSendMessage}
              onSendMediaMessage={onSendMediaMessage}
              onReactMessage={onReactMessage}
              onRecallMessage={onRecallMessage}
              onTogglePinMessage={onTogglePinMessage}
              typingMap={typingMap}
              onTyping={onTyping}
              onNavigateToPost={onNavigateToPost}
              onLoadOlderMessages={onLoadOlderMessages}
              isLoadingOlder={Boolean(loadingOlderMap[activeConversation.id])}
            />
          )}

          {/* Trường hợp view === 'chat' nhưng chưa tìm thấy conversation (ví dụ đang load) */}
          {view === 'chat' && !activeConversation && (
            <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
              <Loader2 size={24} className="animate-spin text-brand-500 mb-2" />
              <p className="text-xs text-slate-500">Đang tải cuộc trò chuyện...</p>
              <button
                type="button"
                onClick={() => {
                  setView('list')
                  setActiveConversationId(null)
                }}
                className="mt-4 text-xs text-brand-600 font-semibold hover:underline cursor-pointer"
              >
                Quay lại danh sách
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent hiển thị nội dung Chat bên trong Modal Dock (DockChatView)
// Thay vì mở thêm popup ra ngoài, toàn bộ giao diện chat diễn ra ngay trong modal này!
// ─────────────────────────────────────────────────────────────────────────────
function DockChatView({
  conversation,
  myId,
  myName,
  getConversationAvatar,
  getSenderAvatar,
  onBack,
  onClose,
  onSendMessage,
  onSendMediaMessage,
  onReactMessage,
  onRecallMessage,
  onTogglePinMessage,
  typingMap,
  onTyping,
  onNavigateToPost,
  onLoadOlderMessages,
  isLoadingOlder,
}) {
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null)
  const [menuMessageId, setMenuMessageId] = useState(null)
  const [currentReply, setCurrentReply] = useState(null)
  const [draft, setDraft] = useState('')
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false)

  const messagesContainerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const isUserScrolledUpRef = useRef(false)
  const prevMessagesLengthRef = useRef(0)
  const typingTimeoutRef = useRef(null)
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)

  // 1. Tự động cuộn xuống đáy khi mở modal / nạp xong dữ liệu / nhận tin nhắn mới
  useLayoutEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return

    const currentCount = conversation.messages?.length || 0
    const prevCount = prevMessagesLengthRef.current
    prevMessagesLengthRef.current = currentCount

    if (prevCount === 0 && currentCount > 0) {
      el.scrollTop = el.scrollHeight
      isUserScrolledUpRef.current = false
      setShowScrollBottomBtn(false)
      return
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 160) {
      el.scrollTop = el.scrollHeight
      setShowScrollBottomBtn(false)
    } else {
      setShowScrollBottomBtn(true)
    }
  }, [conversation.messages?.length])

  // Đảm bảo sau khi load xong ảnh/avatar, cửa sổ vẫn ở đáy nếu chưa bị cuộn
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesContainerRef.current && !isUserScrolledUpRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }, 120)
    return () => clearTimeout(timer)
  }, [conversation.id])

  // 2. Bắt sự kiện cuộn chuột để quản lý nút cuộn đáy & tự động tải tin cũ (infinite scroll)
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom > 160) {
      isUserScrolledUpRef.current = true
      setShowScrollBottomBtn(true)
    } else {
      isUserScrolledUpRef.current = false
      setShowScrollBottomBtn(false)
    }

    if (
      scrollTop <= 30 &&
      conversation.hasMoreMessages !== false &&
      !isLoadingOlder &&
      onLoadOlderMessages
    ) {
      const oldScrollHeight = scrollHeight
      onLoadOlderMessages(conversation.id).then?.(() => {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight
            messagesContainerRef.current.scrollTop = newScrollHeight - oldScrollHeight
          }
        })
      })
    }
  }

  const handleScrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
      isUserScrolledUpRef.current = false
      setShowScrollBottomBtn(false)
    }
  }

  const handleInputChange = (val) => {
    setDraft(val)
    if (onTyping) {
      onTyping(conversation.id, true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(conversation.id, false)
      }, 2500)
    }
  }

  const handleSend = () => {
    const textToSend = draft.trim()
    if (!textToSend) return

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    onTyping?.(conversation.id, false)

    onSendMessage?.(conversation.id, currentReply, textToSend)
    setDraft('')
    setCurrentReply(null)

    setTimeout(() => {
      handleScrollToBottom()
    }, 50)
  }

  // Tải ảnh lên AWS S3 và gửi tin nhắn hình ảnh
  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const toastId = toast.loading('Đang tải ảnh lên AWS S3...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'community/chat/images')

      const res = await http.post('/admin/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const s3Url = res?.data?.url || res?.url
      if (!s3Url) throw new Error('Máy chủ không trả về URL ảnh hợp lệ')

      toast.success('Đã tải ảnh lên AWS S3!', { id: toastId })
      onSendMediaMessage?.(conversation.id, {
        type: 'IMAGE',
        attachmentUrl: s3Url,
        content: `[Hình ảnh] ${file.name}`,
      })
    } catch (err) {
      console.error('Lỗi upload ảnh lên AWS S3:', err)
      toast.error('Không thể upload ảnh lên AWS S3: ' + (err?.message || 'Lỗi kết nối'), { id: toastId })
    }
  }

  // Tải tệp lên AWS S3 và gửi tin nhắn tệp tin
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`
    const toastId = toast.loading(`Đang tải tệp ${file.name} lên AWS S3...`)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'community/chat/files')

      const res = await http.post('/admin/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const s3Url = res?.data?.url || res?.url
      if (!s3Url) throw new Error('Máy chủ không trả về URL tệp hợp lệ')

      toast.success('Đã tải tệp lên AWS S3 thành công!', { id: toastId })
      onSendMediaMessage?.(conversation.id, {
        type: 'FILE',
        attachmentUrl: s3Url,
        attachmentName: file.name,
        attachmentSize: sizeStr,
        content: `[Tệp đính kèm] ${file.name}`,
      })
    } catch (err) {
      console.error('Lỗi upload tệp lên AWS S3:', err)
      toast.error('Không thể tải tệp lên AWS S3: ' + (err?.message || 'Lỗi kết nối'), { id: toastId })
    }
  }

  const handleDownloadFile = (attachmentUrl, attachmentName) => {
    const fileName = attachmentName || 'SmartEnglish_Document.docx'
    if (
      attachmentUrl &&
      (attachmentUrl.startsWith('data:') ||
        attachmentUrl.startsWith('blob:') ||
        attachmentUrl.startsWith('http'))
    ) {
      const a = document.createElement('a')
      a.href = attachmentUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      const sampleBlob = new Blob(
        [
          `SmartEnglish AI Learning Platform\n\nTệp tin: ${fileName}\nNgày tải: ${new Date().toLocaleString(
            'vi-VN',
          )}\n`,
        ],
        { type: 'application/octet-stream;charset=utf-8' },
      )
      const blobUrl = URL.createObjectURL(sampleBlob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    }
    toast.success(`Đã tải xuống máy: ${fileName}`)
  }

  const handleGoToPost = (postId) => {
    if (!postId) return
    if (onNavigateToPost) {
      onNavigateToPost(postId, conversation.id)
      return
    }

    const targetEl = document.getElementById(`post-${postId}`)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      targetEl.classList.add('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.01]')
      setTimeout(() => {
        targetEl.classList.remove('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.01]')
      }, 3000)
    } else {
      window.location.hash = `post-${postId}`
      toast('Đang tìm kiếm bài viết...')
    }
  }

  const pinnedMessage = conversation.messages?.find((m) => m.isPinned)
  const isGroup = conversation.type === 'group'

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white select-none">
      {/* Hidden file inputs for AWS S3 uploads */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* ─── 1. CHAT HEADER: CÓ NÚT QUAY LẠI < (CHEVRONLEFT) VỀ DANH SÁCH ─── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Nút Quay lại danh sách tin nhắn */}
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Quay lại danh sách tin nhắn"
            aria-label="Quay lại danh sách tin nhắn"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Avatar đối phương hoặc nhóm */}
          <div className="relative flex shrink-0 items-center justify-center w-8 h-8">
            <Avatar
              src={getConversationAvatar ? getConversationAvatar(conversation) : sanitizeAvatarUrl(conversation.participantAvatar)}
              name={conversation.participantName}
              size="sm"
            />
            {conversation.online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 aspect-square rounded-full border-2 border-white bg-emerald-500 shadow-xs z-10 block shrink-0" />
            )}
          </div>

          {/* Tên & Trạng thái */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-bold text-slate-900">
                {conversation.participantName}
              </p>
              {conversation.participantRole && (
                <span className="shrink-0 rounded bg-slate-100 text-slate-600 px-1 py-0.2 text-[9px] font-semibold">
                  {conversation.participantRole}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {conversation.online
                ? 'Đang trực tuyến'
                : isGroup
                ? `${conversation.memberCount || 2} thành viên`
                : 'Ngoại tuyến'}
            </p>
          </div>
        </div>

        {/* Nút Đóng modal */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* ─── PINNED MESSAGE BANNER (NẾU CÓ) ─── */}
      {pinnedMessage && (
        <div className="flex items-center justify-between bg-amber-50/90 px-3 py-1.5 text-xs text-amber-900 border-b border-amber-200/80 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Pin size={12} className="text-amber-600 shrink-0 fill-amber-600" />
            <span className="truncate text-[11px] font-medium">
              <span className="font-bold">Đã ghim:</span>{' '}
              {pinnedMessage.content || pinnedMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onTogglePinMessage?.(conversation.id, pinnedMessage.id)}
            className="text-[10px] text-amber-700 hover:underline shrink-0 ml-2 font-semibold cursor-pointer"
          >
            Bỏ ghim
          </button>
        </div>
      )}

      {/* ─── 2. CHAT BODY: DANH SÁCH TIN NHẮN CUỘN MƯỢT ─── */}
      <div className="relative min-h-0 flex-1 flex flex-col overflow-hidden bg-slate-50/60">
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3 select-text"
        >
          {/* Nút hoặc Spinner tải thêm tin nhắn cũ hơn */}
          {conversation.hasMoreMessages !== false && (
            <div className="flex justify-center py-1">
              {isLoadingOlder ? (
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Loader2 size={12} className="animate-spin text-brand-500" />
                  <span>Đang tải tin cũ hơn...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onLoadOlderMessages?.(conversation.id)}
                  className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium text-brand-600 shadow-2xs border border-slate-200 hover:bg-brand-50 transition-colors cursor-pointer"
                >
                  Tải tin nhắn cũ hơn...
                </button>
              )}
            </div>
          )}

          {(!conversation.messages || conversation.messages.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <MessageCircle size={22} />
              </div>
              <p className="text-xs font-semibold text-slate-700">Chưa có tin nhắn nào</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hãy gửi lời chào để bắt đầu cuộc trò chuyện!
              </p>
            </div>
          )}

          {conversation.messages?.map((message, idx) => {
            const isMe = message.from === 'me' || Number(message.senderId) === Number(myId)
            const isRecalled = message.isRecalled
            const isHovered = hoveredMessageId === message.id
            const isReactionOpen = reactionPickerMessageId === message.id
            const isMenuOpen = menuMessageId === message.id

            const prevMessage = idx > 0 ? conversation.messages[idx - 1] : null
            const nextMessage =
              idx < conversation.messages.length - 1 ? conversation.messages[idx + 1] : null

            const currDate = parseMessageDate(message)
            const prevDate = parseMessageDate(prevMessage)
            const nextDate = parseMessageDate(nextMessage)

            let shouldShowDateDivider = false
            let dateDividerText = ''

            if (currDate) {
              if (!prevDate) {
                shouldShowDateDivider = true
                dateDividerText = formatChatDateDivider(currDate)
              } else {
                const isDifferentDay =
                  currDate.getFullYear() !== prevDate.getFullYear() ||
                  currDate.getMonth() !== prevDate.getMonth() ||
                  currDate.getDate() !== prevDate.getDate()
                const isLargeGap = Math.abs(currDate.getTime() - prevDate.getTime()) >= 4 * 60 * 60 * 1000

                if (isDifferentDay || isLargeGap) {
                  shouldShowDateDivider = true
                  dateDividerText = formatChatDateDivider(currDate)
                }
              }
            }

            const isSameSenderAsPrev = Boolean(
              prevMessage &&
                ((message.senderId != null &&
                  prevMessage.senderId != null &&
                  Number(message.senderId) === Number(prevMessage.senderId)) ||
                  (message.from &&
                    prevMessage.from &&
                    message.from === prevMessage.from &&
                    message.senderName === prevMessage.senderName)),
            )

            let isPrevWithin30Mins = false
            if (isSameSenderAsPrev && prevDate && currDate) {
              isPrevWithin30Mins = currDate.getTime() - prevDate.getTime() < 30 * 60 * 1000
            } else if (isSameSenderAsPrev && !prevDate && !currDate) {
              isPrevWithin30Mins = true
            }
            const isFirstOfSequence = !isSameSenderAsPrev || !isPrevWithin30Mins || shouldShowDateDivider

            const isSameSenderAsNext = Boolean(
              nextMessage &&
                ((message.senderId != null &&
                  nextMessage.senderId != null &&
                  Number(message.senderId) === Number(nextMessage.senderId)) ||
                  (message.from &&
                    nextMessage.from &&
                    message.from === nextMessage.from &&
                    message.senderName === nextMessage.senderName)),
            )

            let isNextWithin30Mins = false
            let nextHasDivider = false
            if (nextDate && currDate) {
              const nextDiffDay =
                nextDate.getFullYear() !== currDate.getFullYear() ||
                nextDate.getMonth() !== currDate.getMonth() ||
                nextDate.getDate() !== currDate.getDate()
              const nextLargeGap = Math.abs(nextDate.getTime() - currDate.getTime()) >= 4 * 60 * 60 * 1000
              nextHasDivider = nextDiffDay || nextLargeGap
            }

            if (isSameSenderAsNext && currDate && nextDate && !nextHasDivider) {
              isNextWithin30Mins = nextDate.getTime() - currDate.getTime() < 30 * 60 * 1000
            } else if (isSameSenderAsNext && !currDate && !nextDate) {
              isNextWithin30Mins = true
            }
            const isLastOfSequence = !isSameSenderAsNext || !isNextWithin30Mins || nextHasDivider

            // Aggregate reactions count
            const reactionCounts = {}
            if (Array.isArray(message.reactions)) {
              message.reactions.forEach((r) => {
                reactionCounts[r.reactionType] = (reactionCounts[r.reactionType] || 0) + 1
              })
            }

            return (
              <Fragment key={message.id || idx}>
                {/* Timeline divider */}
                {shouldShowDateDivider && dateDividerText && (
                  <div className="flex items-center justify-center my-2.5 select-none">
                    <div className="h-px bg-slate-200/80 flex-1 max-w-[40px]" />
                    <span className="mx-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200/60">
                      {dateDividerText}
                    </span>
                    <div className="h-px bg-slate-200/80 flex-1 max-w-[40px]" />
                  </div>
                )}

                <div
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => {
                    setHoveredMessageId(null)
                    if (reactionPickerMessageId === message.id) setReactionPickerMessageId(null)
                    if (menuMessageId === message.id) setMenuMessageId(null)
                  }}
                  className={`relative flex items-end gap-1.5 group ${
                    isLastOfSequence ? 'mb-2 mt-0.5' : 'my-0.5'
                  } ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar */}
                  {!isMe ? (
                    isLastOfSequence ? (
                      <Avatar
                        src={
                          !isGroup
                            ? getConversationAvatar ? getConversationAvatar(conversation) : sanitizeAvatarUrl(conversation.participantAvatar)
                            : getSenderAvatar?.(message) ||
                              message.senderAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                message.senderName || 'User',
                              )}&background=6366f1&color=fff`
                        }
                        name={message.senderName || conversation.participantName}
                        size="xs"
                        className="shrink-0 mb-0.5"
                      />
                    ) : (
                      <div className="w-6 shrink-0" />
                    )
                  ) : null}

                  {/* Message Bubble Container */}
                  <div
                    className={`flex flex-col max-w-[80%] ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Sender Name in Group */}
                    {!isMe && isGroup && isFirstOfSequence && (
                      <span className="text-[10px] font-semibold text-slate-500 mb-0.5 ml-1">
                        {message.senderName || 'Thành viên'}
                      </span>
                    )}

                    {/* Recalled Message */}
                    {isRecalled ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 px-3 py-1.5 text-[11px] italic text-slate-500">
                        Tin nhắn đã được thu hồi
                      </div>
                    ) : (
                      <div
                        className={`relative rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-2xs transition-colors ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {/* Reply quote */}
                        {message.replyTo && (
                          <div
                            className={`mb-1.5 rounded-lg border-l-2 p-1.5 text-[10px] ${
                              isMe
                                ? 'bg-slate-800 border-brand-400 text-slate-200'
                                : 'bg-slate-100 border-brand-500 text-slate-600'
                            }`}
                          >
                            <span className="font-bold block">
                              {message.replyTo.senderName || 'Ai đó'}
                            </span>
                            <span className="line-clamp-1 italic">
                              {message.replyTo.content || message.replyTo.text}
                            </span>
                          </div>
                        )}

                        {/* Image Message */}
                        {message.type === 'IMAGE' && message.attachmentUrl && (
                          <div className="mb-1 overflow-hidden rounded-xl">
                            <img
                              src={message.attachmentUrl}
                              alt="Hình ảnh"
                              className="max-h-48 max-w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => window.open(message.attachmentUrl, '_blank')}
                            />
                          </div>
                        )}

                        {/* File Attachment Message */}
                        {message.type === 'FILE' && (
                          <div
                            className={`flex items-center gap-2 p-2 rounded-xl mb-1 ${
                              isMe ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-brand-400 shrink-0">
                              <Paperclip size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">
                                {message.attachmentName || 'Tệp đính kèm'}
                              </p>
                              <p className="text-[9px] opacity-75">
                                {message.attachmentSize || 'Tập tin'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadFile(message.attachmentUrl, message.attachmentName)
                              }
                              className="rounded-lg p-1 hover:bg-black/10 transition-colors cursor-pointer"
                              title="Tải về"
                            >
                              <Download size={13} />
                            </button>
                          </div>
                        )}

                        {/* Shared Post Card Message */}
                        {message.type === 'SHARE_POST' && message.sharedPost && (
                          <div
                            onClick={() => handleGoToPost(message.sharedPost.postId)}
                            className={`mb-1 p-2 rounded-xl border cursor-pointer hover:shadow-xs transition-all ${
                              isMe
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-1 text-[9px] opacity-80 mb-0.5">
                              <span className="font-bold">Chia sẻ bài viết</span>
                              <span>•</span>
                              <span>{message.sharedPost.authorName || 'Tác giả'}</span>
                            </div>
                            <p className="text-xs font-semibold line-clamp-2">
                              {message.sharedPost.title || message.sharedPost.content}
                            </p>
                          </div>
                        )}

                        {/* Text Content */}
                        {message.type !== 'FILE' &&
                          message.type !== 'IMAGE' &&
                          !message.content?.startsWith('[Hình ảnh]') &&
                          !message.content?.startsWith('[Tệp đính kèm]') && (
                            <div>{message.text || message.content}</div>
                          )}

                        {/* Time & Pinned Indicator */}
                        <div className="mt-0.5 flex items-center justify-end gap-1">
                          {message.isPinned && (
                            <Pin size={9} className="text-amber-400 fill-amber-400" />
                          )}
                          <p
                            className={`text-[9px] ${
                              isMe ? 'text-white/60' : 'text-slate-400'
                            }`}
                          >
                            {message.time ||
                              (message.createdAt
                                ? new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Vừa xong')}
                          </p>
                        </div>

                        {/* Reaction Badges */}
                        {Object.keys(reactionCounts).length > 0 && (
                          <div
                            className={`absolute -bottom-2 ${
                              isMe ? 'left-1' : 'right-1'
                            } flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-1.5 py-0.2 shadow-2xs text-[10px]`}
                          >
                            {Object.entries(reactionCounts).map(([rType, count]) => {
                              const rItem = REACTIONS.find((r) => r.type === rType)
                              return (
                                <span key={rType} className="flex items-center gap-0.5">
                                  <span>{rItem?.icon || '👍'}</span>
                                  {count > 1 && (
                                    <span className="text-[9px] text-slate-600 font-semibold">
                                      {count}
                                    </span>
                                  )}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Floating Bar on Hover */}
                  {isHovered && !isRecalled && (
                    <div
                      className={`absolute -top-3 ${
                        isMe ? 'right-2' : 'left-2'
                      } flex items-center gap-0.5 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs px-1 py-0.5 shadow-md text-slate-500 z-30`}
                    >
                      {/* Reaction Picker Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setReactionPickerMessageId(isReactionOpen ? null : message.id)
                          }
                          className="rounded-full p-1 hover:bg-slate-100 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Thả cảm xúc"
                        >
                          <Smile size={12} />
                        </button>

                        {isReactionOpen && (
                          <div
                            className={`absolute bottom-6 ${
                              isMe ? 'right-0' : 'left-0'
                            } z-40 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 shadow-xl animate-in fade-in zoom-in duration-150`}
                          >
                            {REACTIONS.map((r) => (
                              <button
                                key={r.type}
                                type="button"
                                onClick={() => {
                                  onReactMessage?.(conversation.id, message.id, r.type)
                                  setReactionPickerMessageId(null)
                                }}
                                className="text-sm hover:scale-125 transition-transform p-0.5 cursor-pointer"
                              >
                                {r.icon}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reply Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentReply(message)
                          setMenuMessageId(null)
                        }}
                        className="rounded-full p-1 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Trả lời"
                      >
                        <Reply size={12} />
                      </button>

                      {/* Pin Button */}
                      <button
                        type="button"
                        onClick={() => onTogglePinMessage?.(conversation.id, message.id)}
                        className={`rounded-full p-1 hover:bg-slate-100 transition-colors cursor-pointer ${
                          message.isPinned ? 'text-amber-500' : 'hover:text-amber-500'
                        }`}
                        title={message.isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                      >
                        <Pin size={12} />
                      </button>

                      {/* Recall Button */}
                      {isMe && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setMenuMessageId(isMenuOpen ? null : message.id)}
                            className="rounded-full p-1 hover:bg-slate-100 hover:text-red-500 transition-colors cursor-pointer"
                            title="Tùy chọn khác"
                          >
                            <MoreVertical size={12} />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute bottom-6 right-0 z-40 w-28 rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  onRecallMessage?.(conversation.id, message.id)
                                  setMenuMessageId(null)
                                }}
                                className="flex w-full items-center gap-1.5 px-2.5 py-1 text-red-600 hover:bg-red-50 cursor-pointer font-medium text-[11px]"
                              >
                                <RotateCcw size={12} /> Thu hồi
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Fragment>
            )
          })}

          {/* Typing Indicator */}
          {typingMap?.[conversation.id]?.isTyping &&
            Number(typingMap[conversation.id].userId) !== Number(myId) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/80 rounded-2xl w-fit shadow-2xs">
                <div className="flex items-center gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 italic">
                  {typingMap[conversation.id].userName || 'Ai đó'} đang soạn...
                </span>
              </div>
            )}

          <div ref={messagesEndRef} className="h-0.5" />
        </div>

        {/* Nút FAB cuộn xuống tin mới nhất */}
        {showScrollBottomBtn && (
          <button
            type="button"
            onClick={handleScrollToBottom}
            className="absolute bottom-2 right-3 z-20 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold text-brand-600 shadow-lg border border-slate-200/90 hover:bg-brand-50 transition-all cursor-pointer"
          >
            <ChevronDown size={12} className="animate-bounce" />
            <span>Tin mới nhất</span>
          </button>
        )}
      </div>

      {/* ─── 3. CHAT FOOTER: SOẠN VÀ GỬI TIN NHẮN (AWS S3 UPLOAD, ENTER TO SEND) ─── */}
      <div className="shrink-0 border-t border-slate-100 bg-white p-2.5 space-y-1.5">
        {/* Replying Banner */}
        {currentReply && (
          <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/70 px-2.5 py-1 text-[11px] text-brand-900">
            <div className="flex items-center gap-1.5 min-w-0">
              <Reply size={12} className="text-brand-600 shrink-0" />
              <span className="truncate">
                Trả lời <span className="font-bold">{currentReply.senderName}</span>:{' '}
                {currentReply.text || currentReply.content}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentReply(null)}
              className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
            title="Gửi hình ảnh (AWS S3)"
          >
            <ImageIcon size={17} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
            title="Gửi tệp đính kèm (AWS S3)"
          >
            <Paperclip size={17} />
          </button>

          <input
            autoFocus
            value={draft}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            placeholder={currentReply ? 'Nhập câu trả lời...' : 'Viết tin nhắn...'}
            className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white transition-colors"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className={cn(
              'h-9 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold transition-all cursor-pointer shrink-0',
              draft.trim()
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            )}
            title="Gửi tin nhắn"
          >
            <Send size={13} />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </div>
    </div>
  )
}
