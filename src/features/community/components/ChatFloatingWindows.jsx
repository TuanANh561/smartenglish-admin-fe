import { useState, useRef, useEffect, useLayoutEffect, Fragment } from 'react'
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
  ChevronDown,
  Loader2,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

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
  getSenderAvatar,
  onLoadOlderMessages,
  loadingOlderMap = {},
}) {
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [activeUploadConvId, setActiveUploadConvId] = useState(null)

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

        return (
          <FloatingChatWindowItem
            key={conversation.id}
            conversation={conversation}
            index={index}
            totalWindows={openConversationIds.length}
            myId={myId}
            myName={myName}
            getConversationAvatar={getConversationAvatar}
            onCloseConversation={onCloseConversation}
            onSendMessage={onSendMessage}
            onReactMessage={onReactMessage}
            onRecallMessage={onRecallMessage}
            onTogglePinMessage={onTogglePinMessage}
            typingMap={typingMap}
            onTyping={onTyping}
            onNavigateToPost={onNavigateToPost}
            getSenderAvatar={getSenderAvatar}
            onLoadOlderMessages={onLoadOlderMessages}
            isLoadingOlder={Boolean(loadingOlderMap[conversation.id])}
            onRequestImageUpload={() => {
              setActiveUploadConvId(conversation.id)
              imageInputRef.current?.click()
            }}
            onRequestFileUpload={() => {
              setActiveUploadConvId(conversation.id)
              fileInputRef.current?.click()
            }}
            handleDownloadFile={handleDownloadFile}
            globalDraft={messageDraft}
            setGlobalDraft={setMessageDraft}
          />
        )
      })}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent cho từng cửa sổ chat độc lập (quản lý scroll & draft riêng)
// ─────────────────────────────────────────────────────────────────────────────
function FloatingChatWindowItem({
  conversation,
  index,
  totalWindows,
  myId,
  myName,
  getConversationAvatar,
  onCloseConversation,
  onSendMessage,
  onReactMessage,
  onRecallMessage,
  onTogglePinMessage,
  typingMap,
  onTyping,
  onNavigateToPost,
  getSenderAvatar,
  onLoadOlderMessages,
  isLoadingOlder,
  onRequestImageUpload,
  onRequestFileUpload,
  handleDownloadFile,
  globalDraft,
  setGlobalDraft,
}) {
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null)
  const [menuMessageId, setMenuMessageId] = useState(null)
  const [currentReply, setCurrentReply] = useState(null)
  const [localDraft, setLocalDraft] = useState('')
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false)

  const messagesContainerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const isUserScrolledUpRef = useRef(false)
  const prevMessagesLengthRef = useRef(0)
  const typingTimeoutRef = useRef(null)

  // 1. Tự động cuộn xuống đáy khi mở modal / nạp xong dữ liệu / nhận tin nhắn mới
  useLayoutEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return

    const currentCount = conversation.messages?.length || 0
    const prevCount = prevMessagesLengthRef.current
    prevMessagesLengthRef.current = currentCount

    // Lần đầu mount hoặc khi danh sách tin nhắn vừa được nạp từ 0 lên > 0
    if (prevCount === 0 && currentCount > 0) {
      el.scrollTop = el.scrollHeight
      isUserScrolledUpRef.current = false
      setShowScrollBottomBtn(false)
      return
    }

    // Nếu người dùng đang xem ở gần đáy (không cố ý cuộn lên xem tin cũ)
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 160) {
      el.scrollTop = el.scrollHeight
      setShowScrollBottomBtn(false)
    } else {
      // Đang cuộn lên đọc tin cũ mà có tin nhắn mới tới -> hiển thị nút FAB
      setShowScrollBottomBtn(true)
    }
  }, [conversation.messages?.length])

  // Đảm bảo sau khi hình ảnh hoặc avatar load xong, cửa sổ vẫn ở đáy nếu chưa bị cuộn
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

    // Khi cuộn sát lên đỉnh (<= 30px) và cuộc trò chuyện còn tin cũ -> tải thêm
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
    setLocalDraft(val)
    if (totalWindows === 1 && setGlobalDraft) {
      setGlobalDraft(val)
    }
    if (onTyping) {
      onTyping(conversation.id, true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(conversation.id, false)
      }, 2500)
    }
  }

  const handleSend = () => {
    const textToSend = localDraft.trim() || globalDraft.trim()
    if (!textToSend) return

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    onTyping?.(conversation.id, false)

    onSendMessage(conversation.id, currentReply, textToSend)
    setLocalDraft('')
    setCurrentReply(null)
    if (setGlobalDraft) setGlobalDraft('')

    // Sau khi gửi, cuộn xuống đáy
    setTimeout(() => {
      handleScrollToBottom()
    }, 50)
  }

  const handleGoToPost = (postId) => {
    if (!postId) return
    onCloseConversation?.(conversation.id)
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
      toast('Đang tìm kiếm bài viết...', { icon: '📌' })
    }
  }

  const pinnedMessage = conversation.messages?.find((m) => m.isPinned)

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 z-[55] flex h-[min(580px,calc(100vh-4rem))] w-[calc(100vw-2rem)] sm:w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all"
      style={{
        right: typeof window !== 'undefined' && window.innerWidth < 640
          ? '1rem'
          : `calc(6rem + ${(totalWindows - index - 1) * 412}px)`,
      }}
    >
      {/* Window Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3">
        <div className="relative flex shrink-0 items-center justify-center w-10 h-10">
          <Avatar
            src={getConversationAvatar(conversation)}
            name={conversation.participantName}
            size="md"
          />
          {conversation.online && (
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 aspect-square rounded-full border-2 border-white bg-emerald-500 shadow-xs z-10 block shrink-0" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-navy-800">
              {conversation.participantName}
            </p>
            {conversation.participantRole && (
              <span className="shrink-0 rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-semibold">
                {conversation.participantRole}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                conversation.online ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
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

      {/* Window Messages List Container */}
      <div className="relative min-h-0 flex-1 flex flex-col overflow-hidden">
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 space-y-3.5 overflow-y-auto scrollbar-none no-scrollbar bg-slate-50/60 px-4 py-3.5"
        >
          {/* Nút hoặc Spinner tải thêm tin nhắn cũ hơn trên đỉnh */}
          {conversation.hasMoreMessages !== false && (
            <div className="flex justify-center py-1">
              {isLoadingOlder ? (
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Loader2 size={13} className="animate-spin text-brand-500" />
                  <span>Đang tải tin nhắn cũ hơn...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onLoadOlderMessages?.(conversation.id)}
                  className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-brand-600 shadow-xs border border-slate-200 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
                >
                  Tải tin nhắn cũ hơn...
                </button>
              )}
            </div>
          )}

          {conversation.messages?.map((message, idx) => {
            const isMe = message.from === 'me'
            const isGroup = conversation.type === 'group'
            const isRecalled = message.isRecalled
            const isHovered = hoveredMessageId === message.id
            const isReactionOpen = reactionPickerMessageId === message.id
            const isMenuOpen = menuMessageId === message.id

            // Check previous and next messages for dates and sequences
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
                // Tin nhắn đầu tiên của cuộc trò chuyện
                shouldShowDateDivider = true
                dateDividerText = formatChatDateDivider(currDate)
              } else {
                const isDifferentDay =
                  currDate.getFullYear() !== prevDate.getFullYear() ||
                  currDate.getMonth() !== prevDate.getMonth() ||
                  currDate.getDate() !== prevDate.getDate()

                // Khác ngày hoặc khoảng cách giữa 2 tin nhắn lớn (> 4 giờ)
                const isLargeGap = Math.abs(currDate.getTime() - prevDate.getTime()) >= 4 * 60 * 60 * 1000

                if (isDifferentDay || isLargeGap) {
                  shouldShowDateDivider = true
                  dateDividerText = formatChatDateDivider(currDate)
                }
              }
            }

            // Check previous message
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

            // Check next message
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
                {/* Dòng phân cách mốc thời gian ngày tháng (chuẩn Messenger / Zalo) */}
                {shouldShowDateDivider && dateDividerText && (
                  <div className="flex items-center justify-center my-3.5 select-none">
                    <div className="h-px bg-slate-200/80 flex-1 max-w-[50px]" />
                    <span className="mx-2.5 rounded-full bg-slate-100/90 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-2xs border border-slate-200/60">
                      {dateDividerText}
                    </span>
                    <div className="h-px bg-slate-200/80 flex-1 max-w-[50px]" />
                  </div>
                )}

                <div
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
                {/* Sender Avatar */}
                {!isMe ? (
                  isLastOfSequence ? (
                    <Avatar
                      src={
                        !isGroup
                          ? getConversationAvatar(conversation)
                          : getSenderAvatar?.(message) ||
                            message.senderAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              message.senderName || 'User',
                            )}&background=6366f1&color=fff`
                      }
                      name={message.senderName || conversation.participantName}
                      size="sm"
                      className="shrink-0 mb-0.5"
                    />
                  ) : (
                    <div className="w-8 shrink-0" />
                  )
                ) : null}

                {/* Message Bubble Container */}
                <div
                  className={`flex flex-col max-w-[75%] ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Name (only on first message of sequence in Group) */}
                  {!isMe && isGroup && isFirstOfSequence && (
                    <span className="text-[11px] font-semibold text-slate-500 mb-0.5 ml-1">
                      {message.senderName || 'Thành viên'}
                    </span>
                  )}

                  {/* Recalled Message */}
                  {isRecalled ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 px-3.5 py-2 text-xs italic text-slate-500">
                      Tin nhắn đã được thu hồi
                    </div>
                  ) : (
                    <div
                      className={`relative rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs transition-colors ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200/80 text-navy-800 rounded-bl-xs'
                      }`}
                    >
                      {/* Reply preview if replying to another message */}
                      {message.replyTo && (
                        <div
                          className={`mb-1.5 rounded-lg border-l-2 p-1.5 text-[11px] ${
                            isMe
                              ? 'bg-brand-700/60 border-brand-300 text-brand-100'
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
                            alt="Hình ảnh đính kèm"
                            className="max-h-56 max-w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(message.attachmentUrl, '_blank')}
                          />
                        </div>
                      )}

                      {/* File Attachment Message */}
                      {message.type === 'FILE' && (
                        <div
                          className={`flex items-center gap-2.5 p-2 rounded-xl mb-1 ${
                            isMe ? 'bg-brand-700/50 text-white' : 'bg-slate-100 text-navy-800'
                          }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-brand-500 shrink-0">
                            <Paperclip size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                              {message.attachmentName || 'Tệp đính kèm'}
                            </p>
                            <p className="text-[10px] opacity-75">
                              {message.attachmentSize || 'Tập tin'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadFile(message.attachmentUrl, message.attachmentName)
                            }
                            className="rounded-lg p-1.5 hover:bg-black/10 transition-colors cursor-pointer"
                            title="Tải về"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      )}

                      {/* Shared Post Card Message */}
                      {message.type === 'SHARE_POST' && message.sharedPost && (
                        <div
                          onClick={() => handleGoToPost(message.sharedPost.postId)}
                          className={`mb-1 p-2.5 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                            isMe
                              ? 'bg-brand-700/40 border-brand-400/40 text-white'
                              : 'bg-slate-50 border-slate-200 text-navy-900'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] opacity-80 mb-1">
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
                      <div className="mt-1 flex items-center justify-end gap-1.5">
                        {message.isPinned && (
                          <Pin size={10} className="text-amber-400 fill-amber-400" />
                        )}
                        <p
                          className={`text-[10px] ${
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
                          className={`absolute -bottom-2.5 ${
                            isMe ? 'left-2' : 'right-2'
                          } flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 shadow-xs text-[11px]`}
                        >
                          {Object.entries(reactionCounts).map(([rType, count]) => {
                            const rItem = REACTIONS.find((r) => r.type === rType)
                            return (
                              <span key={rType} className="flex items-center gap-0.5">
                                <span>{rItem?.icon || '👍'}</span>
                                {count > 1 && (
                                  <span className="text-[10px] text-slate-600 font-semibold">
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
                    className={`absolute -top-3.5 ${
                      isMe ? 'right-2' : 'left-2'
                    } flex items-center gap-0.5 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 shadow-md text-slate-500 z-30`}
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
                        <Smile size={13} />
                      </button>

                      {isReactionOpen && (
                        <div
                          className={`absolute bottom-7 ${
                            isMe ? 'right-0' : 'left-0'
                          } z-40 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-xl animate-in fade-in zoom-in duration-150`}
                        >
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
                      onClick={() => {
                        setCurrentReply(message)
                        setMenuMessageId(null)
                      }}
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

                    {/* More Menu (Recall) */}
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
            </Fragment>
          )
        })}

          {/* Typing Indicator */}
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

          {/* Invisible target to pin bottom */}
          <div ref={messagesEndRef} className="h-0.5" />
        </div>

        {/* Nút FAB "Cuộn xuống tin nhắn mới nhất" */}
        {showScrollBottomBtn && (
          <button
            type="button"
            onClick={handleScrollToBottom}
            className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-xs px-3 py-1.5 text-[11px] font-semibold text-brand-600 shadow-xl border border-slate-200/90 hover:bg-brand-50 hover:text-brand-700 transition-all cursor-pointer animate-in fade-in zoom-in"
          >
            <ChevronDown size={14} className="animate-bounce" />
            <span>Tin mới nhất</span>
          </button>
        )}
      </div>

      {/* Input Message Box */}
      <div className="shrink-0 border-t border-line bg-white p-3 space-y-2">
        {/* Replying Banner */}
        {currentReply && (
          <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs text-brand-900">
            <div className="flex items-center gap-1.5 min-w-0">
              <Reply size={13} className="text-brand-600 shrink-0" />
              <span className="truncate">
                Đang trả lời <span className="font-bold">{currentReply.senderName}</span>: "
                {currentReply.text || currentReply.content}"
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentReply(null)}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRequestImageUpload}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Gửi hình ảnh"
          >
            <ImageIcon size={18} />
          </button>

          <button
            type="button"
            onClick={onRequestFileUpload}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Gửi tệp đính kèm"
          >
            <Paperclip size={18} />
          </button>

          <input
            autoFocus
            value={localDraft || (totalWindows === 1 ? globalDraft : '')}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            placeholder={currentReply ? 'Nhập câu trả lời...' : 'Viết tin nhắn...'}
            className="h-10 flex-1 rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink outline-none focus:border-brand-500"
          />

          <Button
            icon={Send}
            onClick={handleSend}
            disabled={!localDraft.trim() && !(totalWindows === 1 && globalDraft.trim())}
          >
            Gửi
          </Button>
        </div>
      </div>
    </div>
  )
}
