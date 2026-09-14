import { Search, UserPlus } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export function formatLastMessage(conversation, currentUserId) {
  const raw = conversation.lastMessage
  if (!raw || raw === 'Bắt đầu cuộc trò chuyện') {
    return 'Bắt đầu cuộc trò chuyện'
  }

  // Determine sender info
  let senderId = conversation.lastMessageSenderId
  let senderName = conversation.lastMessageSenderName

  // Fallback to last message in conversation.messages if senderId is missing
  if (senderId == null && conversation.messages && conversation.messages.length > 0) {
    const lastMsg = conversation.messages[conversation.messages.length - 1]
    if (lastMsg) {
      senderId = lastMsg.senderId ?? (lastMsg.from === 'me' ? currentUserId : null)
      senderName = lastMsg.senderName || senderName
    }
  }

  const isMe =
    senderId != null &&
    currentUserId != null &&
    Number(senderId) === Number(currentUserId)

  const isGroup = conversation.type === 'group'

  // Handle recalled message
  if (raw === 'Tin nhắn đã được thu hồi' || raw.includes('đã được thu hồi')) {
    return isMe ? 'Bạn: Tin nhắn đã được thu hồi' : 'Tin nhắn đã được thu hồi'
  }

  // Determine prefix: "Bạn: " if sent by current user, or "SenderName: " if group chat
  let prefix = ''
  if (isMe) {
    prefix = 'Bạn: '
  } else if (isGroup && senderName) {
    prefix = `${senderName}: `
  }

  // 1. Image preview
  if (raw.startsWith('[Hình ảnh]')) {
    return `${prefix}[Hình ảnh]`
  }

  // 2. Shared post preview
  if (raw.startsWith('[Chia sẻ bài viết]') || raw.includes('chia sẻ một bài viết')) {
    return `${prefix}[Đã chia sẻ một bài viết]`
  }

  // 3. File attachment preview
  if (raw.startsWith('[Tệp đính kèm]') || raw.startsWith('[Tệp]')) {
    const fileName = raw.replace(/^\[Tệp( đính kèm)?\]\s*/, '').trim()
    return fileName ? `${prefix}[Tệp đính kèm] ${fileName}` : `${prefix}[Tệp đính kèm]`
  }

  // 4. Regular text message
  return `${prefix}${raw}`
}

export default function ChatConversationSidebar({
  conversations,
  filteredConversations,
  contacts,
  conversationSearch,
  setConversationSearch,
  getConversationAvatar,
  onOpenConversation,
  onOpenCreateGroup,
  onOpenFindFriends,
  pendingRequestsCount = 0,
  myId,
}) {
  const totalUnread = conversations.reduce((total, conversation) => total + conversation.unread, 0)

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-800 truncate">Cuộc trò chuyện</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {totalUnread} tin chưa đọc
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenFindFriends}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 relative"
            title="Tìm người dùng & Lời mời kết bạn"
          >
            <UserPlus size={13} className="text-brand-600" />
            <span>Tìm bạn</span>
            {pendingRequestsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenCreateGroup}
            className="rounded-lg bg-navy-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-navy-800 transition-colors cursor-pointer"
          >
            Tạo nhóm
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Search size={15} className="text-slate-400" />
        <input
          type="text"
          placeholder="Nhập tên để tìm"
          value={conversationSearch}
          onChange={(event) => setConversationSearch(event.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-0.5 max-h-112 overflow-y-auto scrollbar-none no-scrollbar">
        {filteredConversations.map((conversation) => {
          const contact = contacts.find((c) => c.id === conversation.participantId)
          const roleLabel = conversation.participantRole || contact?.roleLabel
          const isTeacher = roleLabel?.includes('Giáo viên')
          const isStudent = roleLabel?.includes('Học viên')
          const isAdminRole = roleLabel?.includes('Quản trị')
          const isGroup = conversation.type === 'group' || contact?.isGroup

          const roleBadgeClass =
            isAdminRole
              ? 'bg-rose-50 text-rose-700'
              : isTeacher
              ? 'bg-amber-50 text-amber-700'
              : isStudent
              ? 'bg-emerald-50 text-emerald-700'
              : isGroup
              ? 'bg-purple-50 text-purple-700'
              : 'bg-slate-100 text-slate-700'

          const displayLastMessage = formatLastMessage(conversation, myId)

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onOpenConversation(conversation.id)}
              className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar
                  src={getConversationAvatar(conversation)}
                  name={conversation.participantName}
                  size="md"
                />
                {conversation.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="truncate text-xs font-semibold text-slate-800">{conversation.participantName}</p>
                  <span className="shrink-0 text-[10px] text-slate-400">{conversation.lastTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {roleLabel && (
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${roleBadgeClass}`}>
                      {roleLabel}
                    </span>
                  )}
                  <p
                    className={cn(
                      'truncate text-[11px]',
                      conversation.unread > 0 ? 'font-medium text-slate-700' : 'text-slate-400',
                    )}
                  >
                    {displayLastMessage}
                  </p>
                </div>
              </div>

              {conversation.unread > 0 && (
                <span className="min-w-[18px] rounded-full bg-brand-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white shrink-0">
                  {conversation.unread}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
