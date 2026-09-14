import { useState, useRef } from 'react'
import {
  Send,
  X,
  Smile,
  Reply,
  Pin,
  RotateCcw,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Download,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const REACTIONS = [
  { type: 'LIKE', icon: '👍' },
  { type: 'LOVE', icon: '❤️' },
  { type: 'HAHA', icon: '😂' },
  { type: 'WOW', icon: '😮' },
  { type: 'SAD', icon: '😢' },
  { type: 'ANGRY', icon: '😡' },
]

export default function ChatFloatingWindows({
  myId,
  myName,
  openConversationIds,
  conversations,
  getConversationAvatar,
  onCloseConversation,
  messageDraft,
  setMessageDraft,
  onSendMessage,
  onReactMessage,
  onRecallMessage,
  onTogglePinMessage,
  onSendMediaMessage,
  typingMap = {},
  onTyping,
  onNavigateToPost,
}) {
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null)
  const [menuMessageId, setMenuMessageId] = useState(null)
  const [replyingToMap, setReplyingToMap] = useState({})
  const typingTimeoutRef = useRef({})

  const handleGoToPost = (postId, convId) => {
    if (!postId) return
    if (convId && onCloseConversation) {
      onCloseConversation(convId)
    }
    if (onNavigateToPost) {
      onNavigateToPost(postId, convId)
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
      toast('Đang tìm kiếm bài viết...', { icon: '📌' })
    }
  }

  const handleInputChange = (convId, val) => {
    setMessageDraft(val)
    if (onTyping) {
      onTyping(convId, true)
      if (typingTimeoutRef.current[convId]) {
        clearTimeout(typingTimeoutRef.current[convId])
      }
      typingTimeoutRef.current[convId] = setTimeout(() => {
        onTyping(convId, false)
      }, 2500)
    }
  }

  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [activeUploadConvId, setActiveUploadConvId] = useState(null)

  const handleStartReply = (convId, message) => {
    setReplyingToMap((prev) => ({ ...prev, [convId]: message }))
    setMenuMessageId(null)
  }

  const handleCancelReply = (convId) => {
    setReplyingToMap((prev) => {
      const next = { ...prev }
      delete next[convId]
      return next
    })
  }

  const handleSendWithReply = (convId) => {
    if (typingTimeoutRef.current[convId]) {
      clearTimeout(typingTimeoutRef.current[convId])
    }
    onTyping?.(convId, false)
    const replyTarget = replyingToMap[convId]
    onSendMessage(convId, replyTarget)
    handleCancelReply(convId)
  }

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadConvId) return

    const reader = new FileReader()
    reader.onload = () => {
      onSendMediaMessage?.(activeUploadConvId, {
        type: 'IMAGE',
        attachmentUrl: reader.result,
        content: `[Hình ảnh] ${file.name}`,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadConvId) return

    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`
    const reader = new FileReader()
    reader.onload = () => {
      onSendMediaMessage?.(activeUploadConvId, {
        type: 'FILE',
        attachmentUrl: reader.result,
        attachmentName: file.name,
        attachmentSize: sizeStr,
        content: `[Tệp đính kèm] ${file.name}`,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleDownloadFile = (attachmentUrl, attachmentName) => {
    const fileName = attachmentName || 'SmartEnglish_Document.docx'
    if (attachmentUrl && (attachmentUrl.startsWith('data:') || attachmentUrl.startsWith('blob:') || attachmentUrl.startsWith('http'))) {
      const a = document.createElement('a')
      a.href = attachmentUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      const sampleBlob = new Blob([`SmartEnglish AI Learning Platform\n\nTệp tin: ${fileName}\nNgày tải: ${new Date().toLocaleString('vi-VN')}\n`], { type: 'application/octet-stream;charset=utf-8' })
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

  return (
    <>
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

      {openConversationIds.map((conversationId, index) => {
        const conversation = conversations.find((item) => item.id === conversationId)
        if (!conversation) return null

        const pinnedMessage = conversation.messages?.find((m) => m.isPinned)
        const currentReply = replyingToMap[conversationId]

        return (
          <div
            key={conversation.id}
            className="fixed bottom-6 z-40 flex h-[min(580px,calc(100vh-4rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all"
            style={{ right: `calc(6rem + ${(openConversationIds.length - index - 1) * 412}px)` }}
          >
            {/* Window Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3">
              <Avatar src={getConversationAvatar(conversation)} name={conversation.participantName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-navy-800">{conversation.participantName}</p>
                  {conversation.participantRole && (
                    <span className="shrink-0 rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-semibold">
                      {conversation.participantRole}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <span className={`h-2 w-2 rounded-full ${conversation.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {conversation.online ? 'Đang trực tuyến' : 'Đang offline'}
                </div>
              </div>

              <button
                type="button"
                aria-label="Đóng cuộc trò chuyện"
                onClick={() => onCloseConversation(conversation.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pinned Message Sticky Banner */}
            {pinnedMessage && (
              <div className="flex items-center justify-between bg-amber-50/90 px-3.5 py-1.5 text-xs text-amber-900 border-b border-amber-200/80">
                <div className="flex items-center gap-2 min-w-0">
                  <Pin size={13} className="text-amber-600 shrink-0 fill-amber-600" />
                  <span className="truncate font-medium">
                    <span className="font-bold">Đã ghim:</span> {pinnedMessage.content || pinnedMessage.text}
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

            {/* Window Messages List */}
            <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto scrollbar-none no-scrollbar bg-slate-50/60 px-4 py-3.5">
              {conversation.messages?.map((message, index) => {
                const isMe = message.from === 'me'
                const isGroup = conversation.type === 'group'
                const isRecalled = message.isRecalled
                const isHovered = hoveredMessageId === message.id
                const isReactionOpen = reactionPickerMessageId === message.id
                const isMenuOpen = menuMessageId === message.id

                // 1. Check previous message (to show sender name on the FIRST message of a sequence)
                const prevMessage = index > 0 ? conversation.messages[index - 1] : null
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
                if (isSameSenderAsPrev && prevMessage) {
                  const prevTime = prevMessage.createdAt
                    ? new Date(prevMessage.createdAt).getTime()
                    : null
                  const currTime = message.createdAt
                    ? new Date(message.createdAt).getTime()
                    : null
                  if (prevTime && currTime && !isNaN(prevTime) && !isNaN(currTime)) {
                    isPrevWithin30Mins = currTime - prevTime < 30 * 60 * 1000
                  } else {
                    isPrevWithin30Mins = true
                  }
                }
                const isFirstOfSequence = !isSameSenderAsPrev || !isPrevWithin30Mins

                // 2. Check next message (to show avatar on the LAST/MOST RECENT message of a sequence)
                const nextMessage =
                  index < conversation.messages.length - 1 ? conversation.messages[index + 1] : null
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
                if (isSameSenderAsNext && nextMessage) {
                  const currTime = message.createdAt
                    ? new Date(message.createdAt).getTime()
                    : null
                  const nextTime = nextMessage.createdAt
                    ? new Date(nextMessage.createdAt).getTime()
                    : null
                  if (currTime && nextTime && !isNaN(currTime) && !isNaN(nextTime)) {
                    isNextWithin30Mins = nextTime - currTime < 30 * 60 * 1000
                  } else {
                    isNextWithin30Mins = true
                  }
                }
                const isLastOfSequence = !isSameSenderAsNext || !isNextWithin30Mins

                // Aggregate reactions count
                const reactionCounts = {}
                if (Array.isArray(message.reactions)) {
                  message.reactions.forEach((r) => {
                    reactionCounts[r.reactionType] = (reactionCounts[r.reactionType] || 0) + 1
                  })
                }

                return (
                  <div
                    key={message.id}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => {
                      setHoveredMessageId(null)
                      if (reactionPickerMessageId === message.id) setReactionPickerMessageId(null)
                      if (menuMessageId === message.id) setMenuMessageId(null)
                    }}
                    className={`relative flex items-end gap-2 group ${
                      isLastOfSequence ? 'mb-2.5 mt-0.5' : 'my-0.5'
                    } ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Sender Avatar: only show on the LAST (most recent) message of this sender */}
                    {!isMe ? (
                      isLastOfSequence ? (
                        <img
                          src={message.senderAvatar || getConversationAvatar(conversation)}
                          alt={message.senderName || conversation.participantName}
                          className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0 mb-0.5"
                        />
                      ) : (
                        <span className="w-7 shrink-0" />
                      )
                    ) : (
                      isGroup && <span className="w-7 shrink-0" />
                    )}

                    {/* Message Bubble Container */}
                    <div className={`relative flex flex-col max-w-[76%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Sender Name in Group: only show on FIRST message of sequence */}
                      {isGroup && !isMe && isFirstOfSequence && (
                        <span className="mb-0.5 px-1 text-[10px] font-semibold text-slate-500">
                          {message.senderName}
                        </span>
                      )}

                      {/* Main Bubble */}
                      <div
                        className={`relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs transition-shadow ${
                          isMe
                            ? 'rounded-br-xs bg-navy-700 text-white'
                            : 'rounded-bl-xs border border-slate-200/90 bg-white text-slate-800'
                        } ${isRecalled ? 'opacity-70 italic border-dashed' : ''}`}
                      >
                        {/* Reply Quote Preview inside Bubble */}
                        {message.replyTo && (
                          <div
                            className={`mb-2 rounded-lg border-l-2 p-2 text-xs text-left ${
                              isMe
                                ? 'border-brand-400 bg-navy-800/80 text-white/90'
                                : 'border-brand-500 bg-slate-100/90 text-slate-700'
                            }`}
                          >
                            <span className="font-semibold text-brand-500 block text-[11px]">
                              {message.replyTo.senderName}
                            </span>
                            <span className="line-clamp-1 text-[11px] opacity-80">
                              {message.replyTo.content}
                            </span>
                          </div>
                        )}

                        {/* Shared Post Card Attachment */}
                        {message.sharedPost && (
                          <div
                            onClick={() => handleGoToPost(message.sharedPost.postId, conversation.id)}
                            className={`mb-2 rounded-xl border p-2.5 text-xs text-left cursor-pointer transition-all duration-200 group/sharedcard hover:scale-[1.01] hover:shadow-md ${
                              isMe
                                ? 'border-navy-600 bg-navy-800/95 hover:bg-navy-700/90 text-white'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                            }`}
                            title="Nhấn để chuyển tới bài viết này"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                {message.sharedPost.authorAvatar && (
                                  <img
                                    src={message.sharedPost.authorAvatar}
                                    alt={message.sharedPost.authorName}
                                    className="h-5 w-5 rounded-full object-cover shrink-0"
                                  />
                                )}
                                <span className="font-semibold truncate">{message.sharedPost.authorName}</span>
                                <span className={`text-[10px] shrink-0 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>• Bài viết</span>
                              </div>
                              <span className={`text-[10px] font-medium shrink-0 flex items-center gap-0.5 group-hover/sharedcard:underline ${isMe ? 'text-sky-300' : 'text-brand-600'}`}>
                                Xem bài viết →
                              </span>
                            </div>
                            <p className="line-clamp-2 text-xs italic mb-1.5 opacity-90">
                              "{message.sharedPost.content}"
                            </p>
                            {message.sharedPost.imageUrl && (
                              <img
                                src={message.sharedPost.imageUrl}
                                alt="Post media"
                                className="h-24 w-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                        )}

                        {/* Image Attachment */}
                        {message.type === 'IMAGE' && message.attachmentUrl && (
                          <div className="mb-2 overflow-hidden rounded-xl">
                            <img
                              src={message.attachmentUrl}
                              alt="Attached media"
                              className="max-h-52 w-full object-cover rounded-xl"
                            />
                          </div>
                        )}

                        {/* File Attachment */}
                        {message.type === 'FILE' && (
                          <div
                            onClick={() => handleDownloadFile(message.attachmentUrl, message.attachmentName)}
                            className={`mb-2 flex items-center justify-between gap-3 rounded-xl border p-2.5 text-xs cursor-pointer hover:opacity-90 transition-opacity ${
                              isMe ? 'border-navy-600 bg-navy-800' : 'border-slate-200 bg-slate-100'
                            }`}
                            title="Bấm để tải tệp về máy"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-[10px]">
                                DOC
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-semibold">{message.attachmentName || 'Tệp đính kèm'}</p>
                                <p className={`text-[10px] ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                  {message.attachmentSize}
                                </p>
                              </div>
                            </div>
                            <Download size={15} className="shrink-0 opacity-80" />
                          </div>
                        )}

                        {/* Text Content */}
                        <div>{message.text || message.content}</div>

                        {/* Time & Pinned Indicator */}
                        <div className="mt-1 flex items-center justify-end gap-1.5">
                          {message.isPinned && (
                            <Pin size={10} className="text-amber-400 fill-amber-400" />
                          )}
                          <p className={`text-[10px] ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                            {message.time ||
                              (message.createdAt
                                ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Vừa xong')}
                          </p>
                        </div>

                        {/* Reaction Badges at bottom corner */}
                        {Object.keys(reactionCounts).length > 0 && (
                          <div
                            className={`absolute -bottom-2.5 ${
                              isMe ? 'left-2' : 'right-2'
                            } flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 shadow-xs text-[11px]`}
                          >
                            {Object.entries(reactionCounts).map(([rType, count]) => {
                              const rItem = REACTIONS.find((r) => r.type === rType)
                              return (
                                <span key={rType} className="flex items-center gap-0.5">
                                  <span>{rItem?.icon || '👍'}</span>
                                  {count > 1 && <span className="text-[9px] font-bold text-slate-600">{count}</span>}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Floating Bar on Hover */}
                    {isHovered && !isRecalled && (
                      <div
                        className={`absolute -top-3.5 ${
                          isMe ? 'right-2' : 'left-2'
                        } flex items-center gap-0.5 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 shadow-md text-slate-500 z-30`}
                      >
                        {/* Reaction Picker Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setReactionPickerMessageId(isReactionOpen ? null : message.id)}
                            className="rounded-full p-1 hover:bg-slate-100 hover:text-amber-500 transition-colors cursor-pointer"
                            title="Thả cảm xúc"
                          >
                            <Smile size={13} />
                          </button>

                          {/* Reaction Bar Popup */}
                          {isReactionOpen && (
                            <div className={`absolute bottom-7 ${isMe ? 'right-0' : 'left-0'} z-40 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-xl animate-in fade-in zoom-in duration-150`}>
                              {REACTIONS.map((r) => (
                                <button
                                  key={r.type}
                                  type="button"
                                  onClick={() => {
                                    onReactMessage?.(conversation.id, message.id, r.type)
                                    setReactionPickerMessageId(null)
                                  }}
                                  className="text-base hover:scale-125 transition-transform p-0.5 cursor-pointer"
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
                          onClick={() => handleStartReply(conversation.id, message)}
                          className="rounded-full p-1 hover:bg-slate-100 hover:text-navy-700 transition-colors cursor-pointer"
                          title="Trả lời"
                        >
                          <Reply size={13} />
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
                          <Pin size={13} />
                        </button>

                        {/* More Menu (Recall for me) */}
                        {isMe && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setMenuMessageId(isMenuOpen ? null : message.id)}
                              className="rounded-full p-1 hover:bg-slate-100 hover:text-red-500 transition-colors cursor-pointer"
                              title="Tùy chọn khác"
                            >
                              <MoreVertical size={13} />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute bottom-7 right-0 z-40 w-32 rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRecallMessage?.(conversation.id, message.id)
                                    setMenuMessageId(null)
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                                >
                                  <RotateCcw size={13} /> Thu hồi
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Dynamic Typing Indicator */}
              {typingMap?.[conversation.id]?.isTyping &&
                Number(typingMap[conversation.id].userId) !== Number(myId) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl w-fit shadow-xs">
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
                    <span className="text-[11px] font-medium text-slate-500 italic">
                      {typingMap[conversation.id].userName || 'Ai đó'} đang soạn tin nhắn...
                    </span>
                  </div>
                )}
            </div>

            {/* Input message box container */}
            <div className="shrink-0 border-t border-line bg-white p-3 space-y-2">
              {/* Replying Banner */}
              {currentReply && (
                <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs text-brand-900">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Reply size={13} className="text-brand-600 shrink-0" />
                    <span className="truncate">
                      Đang trả lời <span className="font-bold">{currentReply.senderName}</span>: "{currentReply.text || currentReply.content}"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancelReply(conversation.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Input row */}
              <div className="flex items-center gap-2">
                {/* Media Attachment Buttons */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadConvId(conversation.id)
                    imageInputRef.current?.click()
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Gửi hình ảnh"
                >
                  <ImageIcon size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadConvId(conversation.id)
                    fileInputRef.current?.click()
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Gửi tệp đính kèm"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  autoFocus
                  value={messageDraft}
                  onChange={(event) => handleInputChange(conversation.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSendWithReply(conversation.id)
                  }}
                  placeholder={currentReply ? 'Nhập câu trả lời...' : 'Viết tin nhắn...'}
                  className="h-10 flex-1 rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink outline-none focus:border-brand-500"
                />

                <Button
                  icon={Send}
                  onClick={() => handleSendWithReply(conversation.id)}
                  disabled={!messageDraft.trim()}
                >
                  Gửi
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
