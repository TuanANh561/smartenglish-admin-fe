import { MessageSquare, Search } from 'lucide-react'

export default function ChatConversationSidebar({
  conversations,
  filteredConversations,
  contacts,
  conversationSearch,
  setConversationSearch,
  getConversationAvatar,
  onOpenConversation,
  onOpenCreateGroup,
}) {
  const totalUnread = conversations.reduce((total, conversation) => total + conversation.unread, 0)

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-800">Cuộc trò chuyện</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {totalUnread} tin chưa đọc
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreateGroup}
            className="rounded-lg bg-navy-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-navy-800 transition-colors cursor-pointer"
          >
            Tạo nhóm
          </button>
          <MessageSquare size={17} className="text-brand-500" />
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
          const isStudent = conversation.participantRole?.includes('Học viên') || contact?.role === 'student'
          const isGroup = conversation.type === 'group' || contact?.isGroup
          const isAdminRole = conversation.participantRole?.includes('Quản trị viên') || contact?.role === 'admin'

          const roleBadgeClass =
            isStudent
              ? 'bg-emerald-50 text-emerald-700'
              : isGroup && roleLabel?.toLowerCase().includes('học viên')
              ? 'bg-blue-50 text-blue-700'
              : isGroup
              ? 'bg-purple-50 text-purple-700'
              : isAdminRole
              ? 'bg-rose-50 text-rose-700'
              : 'bg-amber-50 text-amber-700'

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onOpenConversation(conversation.id)}
              className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={getConversationAvatar(conversation)}
                  alt={conversation.participantName}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
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
                  <p className="truncate text-[11px] text-slate-400">{conversation.lastMessage}</p>
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
