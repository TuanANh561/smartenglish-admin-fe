import { Send, X } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

export default function ChatFloatingWindows({
  openConversationIds,
  conversations,
  getConversationAvatar,
  onCloseConversation,
  messageDraft,
  setMessageDraft,
  onSendMessage,
}) {
  return (
    <>
      {openConversationIds.map((conversationId, index) => {
        const conversation = conversations.find((item) => item.id === conversationId)
        if (!conversation) return null

        return (
          <div
            key={conversation.id}
            className="fixed bottom-6 z-40 flex h-[min(560px,calc(100vh-4rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
            style={{ right: `calc(6rem + ${(openConversationIds.length - index - 1) * 392}px)` }}
          >
            {/* Window Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3">
              <Avatar src={getConversationAvatar(conversation)} name={conversation.participantName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-700">{conversation.participantName}</p>
                <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                  <span className={`h-2 w-2 rounded-full ${conversation.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {conversation.online ? 'Đang trực tuyến' : 'Đang offline'}
                </div>
              </div>
              <button
                type="button"
                aria-label="Đóng cuộc trò chuyện"
                onClick={() => onCloseConversation(conversation.id)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Window Messages */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-none no-scrollbar bg-canvas px-4 py-4">
              {conversation.messages.map((message) => {
                const isMe = message.from === 'me'
                const isGroup = conversation.type === 'group'

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar người gửi */}
                    {isGroup && !isMe ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0 mb-0.5"
                      />
                    ) : (
                      isGroup && <span className="w-7 shrink-0" />
                    )}

                    <div className={`flex flex-col max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {isGroup && !isMe && (
                        <span className="mb-0.5 px-1 text-[10px] font-semibold text-slate-500">
                          {message.senderName}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isMe
                            ? 'rounded-br-sm bg-navy-700 text-white'
                            : 'rounded-bl-sm border border-line bg-white text-ink shadow-xs'
                        }`}
                      >
                        {message.text}
                        <p className={`mt-0.5 text-[10px] ${isMe ? 'text-white/60 text-right' : 'text-ink-muted'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input message box */}
            <div className="shrink-0 border-t border-line bg-white p-4">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onSendMessage(conversation.id)
                  }}
                  placeholder="Viết tin nhắn..."
                  className="h-10 flex-1 rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-brand-500"
                />
                <Button icon={Send} onClick={() => onSendMessage(conversation.id)}>Gửi</Button>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
