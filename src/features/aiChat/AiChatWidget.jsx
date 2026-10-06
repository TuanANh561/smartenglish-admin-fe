import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronLeft,
  Copy,
  History,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import {
  archiveChatConversation,
  createChatConversation,
  fetchChatConversations,
  fetchChatMessages,
  fetchChatQuota,
  sendChatMessage,
} from './aiChatService'

const SUGGESTED_PROMPTS = [
  '📝 Tạo 5 câu trắc nghiệm Ngữ pháp Thì HTHT (B1)',
  '🔍 Hiệu đính ngữ pháp hội thoại & sửa lỗi',
  '🎙️ Soạn bài học phát âm âm Schwa /ə/',
  '📖 Soạn đoạn văn đọc hiểu IELTS 200 từ kèm 3 câu hỏi',
]

const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: `Kính chào Thầy/Cô và Quản trị viên! Tôi là **Teacher Cáo** 🦊 — Trợ lý AI đồng hành cùng công tác giảng dạy & quản trị học liệu của SmartEnglish.

🎯 **Tôi có thể hỗ trợ Thầy/Cô và Ban quản trị:**
1. 📝 **Soạn giáo án & Tạo câu hỏi**: Sinh bài tập Ngữ pháp, Từ vựng, Bài đọc, Bài nghe theo chuẩn **CEFR (A1-C2) / IELTS / TOEIC**.
2. 🔍 **Hiệu đính ngữ pháp hội thoại**: Rà soát câu mẫu, đoạn hội thoại và bài tập trước khi bấm Xuất bản.
3. 🎙️ **Chuẩn hóa học liệu phát âm IPA**: Soạn hướng dẫn khẩu hình miệng và danh sách từ mẫu giọng bản xứ.
4. 💡 **Tư vấn sư phạm & Khung chương trình**: Gợi ý phương pháp giải thích bài học sinh động, dễ hiểu.

Thầy/Cô cần Teacher Cáo hỗ trợ soạn nội dung hay hiệu đính học liệu nào hôm nay ạ?`,
    timestamp: new Date(),
  },
]

function formatTimeAgo(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSec = Math.floor((now - date) / 1000)
    if (diffSec < 60) return 'Vừa xong'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
  } catch (e) {
    return ''
  }
}

function renderSimpleMarkdown(text) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeBuffer = []

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div
            key={`code-${index}`}
            className="my-2.5 overflow-x-auto rounded-xl bg-slate-800 p-3.5 font-mono text-[12.5px] text-slate-100 shadow-inner"
          >
            <pre>{codeBuffer.join('\n')}</pre>
          </div>,
        )
        codeBuffer = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      return
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="mt-3 mb-1.5 font-bold text-slate-900 text-[15px]">
          {formatInline(line.replace('### ', ''))}
        </h4>,
      )
      return
    }

    if (line.startsWith('## ') || line.startsWith('# ')) {
      elements.push(
        <h3 key={index} className="mt-3 mb-1.5 font-bold text-slate-900 text-base">
          {formatInline(line.replace(/^#+\s/, ''))}
        </h3>,
      )
      return
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={index} className="flex items-start gap-2.5 my-1 text-[13.5px] text-slate-800">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
          <div className="leading-relaxed">
            {formatInline(line.trim().replace(/^[-*]\s/, ''))}
          </div>
        </div>,
      )
      return
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/)
      elements.push(
        <div key={index} className="flex items-start gap-2.5 my-1 text-[13.5px] text-slate-800">
          <span className="font-semibold text-orange-600 shrink-0">{match?.[1]}.</span>
          <div className="leading-relaxed">{formatInline(match?.[2])}</div>
        </div>,
      )
      return
    }

    if (line.trim().startsWith('> ')) {
      elements.push(
        <div
          key={index}
          className="my-2 border-l-3 border-orange-500 bg-orange-50/70 px-3.5 py-2 text-[13.5px] font-medium text-slate-800 rounded-r-xl"
        >
          {formatInline(line.replace(/^>\s*/, ''))}
        </div>,
      )
      return
    }

    if (!line.trim()) {
      elements.push(<div key={index} className="h-1.5" />)
      return
    }

    elements.push(
      <p key={index} className="my-1.5 text-[13.5px] text-slate-800 leading-relaxed">
        {formatInline(line)}
      </p>,
    )
  })

  return elements
}

function formatInline(str) {
  if (!str) return ''
  const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-orange-50 px-1.5 py-0.5 font-mono text-[12px] text-orange-700 font-semibold border border-orange-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-600">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

const SIZE_STORAGE_KEY = 'smartenglish_teacher_cao_size'

function AiChatWidget() {
  const currentUser = useAuthStore((s) => s.user)
  const userId = currentUser?.id

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [conversationPage, setConversationPage] = useState(0)
  const [hasMoreConversations, setHasMoreConversations] = useState(false)
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false)
  const [messagePage, setMessagePage] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [quota, setQuota] = useState(null)

  // Kích thước kéo thả tùy biến của người dùng
  const [size, setSize] = useState(() => {
    try {
      const saved = localStorage.getItem(SIZE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.width && parsed.height) return parsed
      }
    } catch (e) {
      // ignore
    }
    return { width: 440, height: 580 }
  })

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, width: 440, height: 580 })

  // Reset state when user changes
  useEffect(() => {
    setMessages(INITIAL_MESSAGES)
    setConversations([])
    setActiveConversationId(null)
    setConversationPage(0)
    setHasMoreConversations(false)
    setQuota(null)
    setShowHistory(false)
  }, [userId])

  // Tải danh sách cuộc trò chuyện và hạn mức khi mở widget
  useEffect(() => {
    if (!isOpen || !userId) return

    const loadInitialData = async () => {
      setLoadingHistory(true)
      try {
        const [historyRes, quotaData] = await Promise.all([
          fetchChatConversations({ page: 0, size: 20 }),
          fetchChatQuota().catch(() => null),
        ])
        const items = historyRes?.items || []
        setConversations(items)
        setHasMoreConversations(Boolean(historyRes?.hasMore))
        setConversationPage(0)
        if (quotaData) setQuota(quotaData)

        // Nếu đã có cuộc trò chuyện trước đó và chưa chọn cuộc trò chuyện nào, mở cuộc trò chuyện đầu tiên
        if (items.length > 0 && !activeConversationId) {
          await openConversation(items[0].id)
        } else if (items.length === 0) {
          // Chưa có cuộc trò chuyện nào, tạo mới
          const newConv = await createChatConversation()
          if (newConv?.id) {
            setConversations([newConv])
            setActiveConversationId(newConv.id)
            setMessages(INITIAL_MESSAGES)
          }
        }
      } catch (err) {
        console.warn('Lỗi tải lịch sử Teacher Cáo:', err)
      } finally {
        setLoadingHistory(false)
      }
    }

    loadInitialData()
  }, [isOpen, userId])

  useEffect(() => {
    try {
      localStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify(size))
    } catch (e) {
      // ignore
    }
  }, [size])

  useEffect(() => {
    if (isOpen && !showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading, showHistory])

  // Tự động giãn kích thước dọc của textarea theo nội dung soạn thảo
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.max(38, Math.min(textareaRef.current.scrollHeight, 200))
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [input, isOpen])

  // Xử lý mở một cuộc trò chuyện từ danh sách
  const openConversation = async (convId) => {
    setActiveConversationId(convId)
    setShowHistory(false)
    setLoadingMessages(true)
    try {
      const res = await fetchChatMessages(convId, { page: 0, size: 30 })
      const items = res?.items || []
      if (items.length > 0) {
        setMessages(
          items.map((m) => ({
            id: m.id,
            role: m.role?.toLowerCase() || 'assistant',
            content: m.content,
            timestamp: m.createdAt,
          })),
        )
      } else {
        setMessages(INITIAL_MESSAGES)
      }
      setMessagePage(0)
      setHasMoreMessages(Boolean(res?.hasMore))
    } catch (err) {
      toast.error('Không thể tải nội dung tin nhắn cuộc trò chuyện')
      setMessages(INITIAL_MESSAGES)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Tải thêm tin nhắn cũ hơn
  const handleLoadMoreMessages = async () => {
    if (loadingMoreMessages || !hasMoreMessages || !activeConversationId) return
    setLoadingMoreMessages(true)
    try {
      const nextPage = messagePage + 1
      const res = await fetchChatMessages(activeConversationId, { page: nextPage, size: 30 })
      const olderItems = (res?.items || []).map((m) => ({
        id: m.id,
        role: m.role?.toLowerCase() || 'assistant',
        content: m.content,
        timestamp: m.createdAt,
      }))
      setMessages((prev) => [...olderItems, ...prev])
      setMessagePage(nextPage)
      setHasMoreMessages(Boolean(res?.hasMore))
    } catch (err) {
      toast.error('Không thể tải thêm tin nhắn cũ')
    } finally {
      setLoadingMoreMessages(false)
    }
  }

  // Tải thêm danh sách cuộc trò chuyện
  const handleLoadMoreConversations = async () => {
    if (loadingMoreConversations || !hasMoreConversations) return
    setLoadingMoreConversations(true)
    try {
      const nextPage = conversationPage + 1
      const res = await fetchChatConversations({ page: nextPage, size: 20 })
      const items = res?.items || []
      setConversations((prev) => [...prev, ...items])
      setConversationPage(nextPage)
      setHasMoreConversations(Boolean(res?.hasMore))
    } catch (err) {
      toast.error('Không thể tải thêm cuộc trò chuyện')
    } finally {
      setLoadingMoreConversations(false)
    }
  }

  // Tạo cuộc trò chuyện mới
  const handleNewChat = async () => {
    try {
      const newConv = await createChatConversation()
      if (newConv?.id) {
        setConversations((prev) => [newConv, ...prev])
        setActiveConversationId(newConv.id)
        setMessages(INITIAL_MESSAGES)
        setHasMoreMessages(false)
        setShowHistory(false)
        toast.success('Đã mở cuộc trò chuyện mới!')
      }
    } catch (err) {
      toast.error('Không thể tạo cuộc trò chuyện mới')
    }
  }

  // Xóa / Lưu trữ cuộc trò chuyện
  const handleArchiveConversation = async (convId, e) => {
    e.stopPropagation()
    if (!window.confirm('Bạn có chắc muốn lưu trữ cuộc trò chuyện này?')) return

    try {
      await archiveChatConversation(convId)
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      toast.success('Đã lưu trữ cuộc trò chuyện')

      if (activeConversationId === convId) {
        const remaining = conversations.filter((c) => c.id !== convId)
        if (remaining.length > 0) {
          await openConversation(remaining[0].id)
        } else {
          await handleNewChat()
        }
      }
    } catch (err) {
      toast.error('Không thể lưu trữ cuộc trò chuyện')
    }
  }

  // Xử lý gửi tin nhắn
  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input.trim()
    if (!textToSend || isLoading) return

    // Kiểm tra quota còn lại
    if (quota && quota.remaining <= 0) {
      toast.error(
        `Bạn đã dùng hết ${quota.limit} lượt Teacher Cáo hôm nay. Hạn mức sẽ được làm mới lúc 00:00!`,
      )
      return
    }

    let targetConvId = activeConversationId
    if (!targetConvId) {
      try {
        const newConv = await createChatConversation()
        targetConvId = newConv.id
        setConversations((prev) => [newConv, ...prev])
        setActiveConversationId(targetConvId)
      } catch (err) {
        toast.error('Không thể khởi tạo phiên trò chuyện')
        return
      }
    }

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await sendChatMessage(targetConvId, textToSend)

      if (res?.assistantMessage) {
        const assistantMsg = {
          id: res.assistantMessage.id,
          role: 'assistant',
          content: res.assistantMessage.content,
          timestamp: res.assistantMessage.createdAt,
        }
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), res.userMessage, assistantMsg])
      }

      if (res?.quota) {
        setQuota(res.quota)
      }

      // Cập nhật tiêu đề cuộc trò chuyện nếu backend đổi tiêu đề
      if (res?.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === targetConvId ? { ...c, ...res.conversation } : c)),
        )
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn AI Chat:', err)
      const errMessage =
        err?.response?.data?.message || err?.message || 'Lỗi kết nối đến Teacher Cáo. Vui lòng thử lại!'
      toast.error(errMessage)

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Thông báo:** ${errMessage}`,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (msg) => {
    navigator.clipboard.writeText(msg.content)
    setCopiedId(msg.id)
    toast.success('Đã sao chép')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Xử lý kéo góc / cạnh để thay đổi kích thước modal
  const handleResizeStart = (e, direction = 'corner') => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    }

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return
      const deltaX = dragStartRef.current.x - moveEvent.clientX
      const deltaY = dragStartRef.current.y - moveEvent.clientY

      let newWidth = dragStartRef.current.width
      let newHeight = dragStartRef.current.height

      if (direction === 'corner' || direction === 'left') {
        newWidth = Math.max(360, Math.min(window.innerWidth - 48, dragStartRef.current.width + deltaX))
      }
      if (direction === 'corner' || direction === 'top') {
        newHeight = Math.max(450, Math.min(window.innerHeight - 48, dragStartRef.current.height + deltaY))
      }

      setSize({ width: Math.round(newWidth), height: Math.round(newHeight) })
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Active conversation title
  const currentConversation = conversations.find((c) => c.id === activeConversationId)

  // Tính toán kích thước hiển thị
  const modalStyle = isExpanded
    ? {
        width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 780) : 780,
        height: typeof window !== 'undefined' ? Math.min(window.innerHeight - 32, 840) : 800,
      }
    : {
        width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, size.width) : size.width,
        height: typeof window !== 'undefined' ? Math.min(window.innerHeight - 32, size.height) : size.height,
      }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* ─── Khung Chat Teacher Cáo ────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={modalStyle}
          className="relative flex flex-col bg-[#f8fafc] border border-slate-300 shadow-2xl rounded-2xl overflow-hidden transition-all duration-75 mb-2 max-w-[96vw] max-h-[92vh] select-text"
        >
          {/* Điểm kéo góc trên bên trái để resize */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'corner')}
            className="absolute top-0 left-0 h-6 w-6 cursor-nwse-resize z-30 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-colors group select-none"
            title="Kéo góc này để tùy chỉnh kích thước"
          >
            <div className="h-2.5 w-2.5 border-t-2 border-l-2 border-slate-400 group-hover:border-orange-500 rounded-tl-sm" />
          </div>

          {/* Cạnh trên kéo giãn */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'top')}
            className="absolute top-0 left-6 right-6 h-1.5 cursor-ns-resize z-20 hover:bg-orange-400/40 transition-colors"
          />

          {/* Cạnh trái kéo giãn */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'left')}
            className="absolute top-6 left-0 bottom-6 w-1.5 cursor-ew-resize z-20 hover:bg-orange-400/40 transition-colors"
          />

          {/* Header */}
          <div className="bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between shrink-0 pl-7 shadow-xs">
            {showHistory ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Quay lại cuộc trò chuyện"
                >
                  <ChevronLeft size={16} />
                  <span>Quay lại chat</span>
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <h3 className="font-bold text-sm text-slate-800">Lịch sử hội thoại</h3>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-xl shadow-xs text-white">
                  <span>🦊</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[14px] text-slate-800 truncate">
                      {currentConversation?.title || 'Teacher Cáo'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {quota && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border',
                          quota.remaining > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200',
                        )}
                        title={`Hạn mức: ${quota.used}/${quota.limit} lượt. Làm mới lúc ${quota.resetAt || '00:00'}`}
                      >
                        <Zap size={10} />
                        {currentUser?.role === 'admin'
                          ? `Admin (${quota.remaining}/${quota.limit})`
                          : `Còn ${quota.remaining}/${quota.limit} lượt`}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {currentUser?.role === 'teacher' ? 'Dành cho Thầy/Cô' : 'Quản trị viên'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Cụm nút công cụ trên header */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Nút Lịch sử hội thoại */}
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer border shadow-2xs',
                  showHistory
                    ? 'bg-orange-50 text-orange-800 border-orange-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                )}
                title="Xem danh sách lịch sử các cuộc trò chuyện"
              >
                <History size={13} />
                <span className="hidden sm:inline">Lịch sử</span>
                {conversations.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                    {conversations.length}
                  </span>
                )}
              </button>

              {/* Nút Đoạn chat mới */}
              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Tạo cuộc trò chuyện mới"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span className="hidden sm:inline">Đoạn chat mới</span>
              </button>

              {/* Nút Phóng to / Thu nhỏ */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Mở rộng tối đa'}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              {/* Nút Đóng */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                title="Đóng khung chat"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* ─── GIAO DIỆN LỊCH SỬ HỘI THOẠI ──────────────────────────────── */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Các đoạn chat gần đây ({conversations.length})
                </span>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Tạo cuộc trò chuyện</span>
                </button>
              </div>

              {loadingHistory && conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs">
                  <Loader2 size={24} className="animate-spin mb-2 text-orange-500" />
                  <span>Đang tải lịch sử hội thoại...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs text-center px-4">
                  <MessageSquare size={32} className="text-slate-300 mb-2 stroke-1" />
                  <p className="font-semibold text-slate-600 mb-1">Chưa có lịch sử trò chuyện</p>
                  <p>Bắt đầu cuộc trò chuyện đầu tiên với Teacher Cáo ngay hôm nay!</p>
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="mt-4 px-3.5 py-1.5 rounded-xl bg-orange-600 text-white font-semibold text-xs shadow-xs hover:bg-orange-700 transition-colors cursor-pointer"
                  >
                    Bắt đầu chat
                  </button>
                </div>
              ) : (
                <div className="space-y-2 flex-1">
                  {conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId

                    return (
                      <div
                        key={conv.id}
                        onClick={() => openConversation(conv.id)}
                        className={cn(
                          'group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer shadow-2xs',
                          isActive
                            ? 'bg-orange-50/70 border-orange-300 ring-1 ring-orange-200'
                            : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-slate-50',
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                          <MessageSquare
                            size={16}
                            className={cn('shrink-0 mt-0.5', isActive ? 'text-orange-600' : 'text-slate-400')}
                          />
                          <div className="min-w-0 flex-1">
                            <h4
                              className={cn(
                                'text-xs font-semibold truncate',
                                isActive ? 'text-orange-950 font-bold' : 'text-slate-800',
                              )}
                            >
                              {conv.title || 'Cuộc trò chuyện mới'}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {formatTimeAgo(conv.lastMessageAt || conv.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-orange-500 mr-1" title="Đang mở" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleArchiveConversation(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Lưu trữ cuộc trò chuyện"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Phân trang lịch sử hội thoại */}
                  {hasMoreConversations && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleLoadMoreConversations}
                        disabled={loadingMoreConversations}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                      >
                        {loadingMoreConversations && <Loader2 size={12} className="animate-spin text-orange-500" />}
                        <span>Tải thêm cuộc trò chuyện cũ hơn...</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ─── GIAO DIỆN CHAT CHÍNH ─────────────────────────────────────── */
            <>
              {/* Gợi ý câu hỏi nhanh khi mới mở hoặc chưa có tin nhắn nào */}
              {messages.length <= 1 && (
                <div className="p-3 bg-slate-50/90 border-b border-slate-200/80 shrink-0">
                  <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    Gợi ý nhanh cho {currentUser?.role === 'teacher' ? 'Thầy/Cô' : 'Quản trị viên'}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900 transition-all text-left cursor-pointer shadow-2xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc] select-text">
                {/* Nút tải thêm tin nhắn cũ hơn nếu có phân trang */}
                {hasMoreMessages && (
                  <div className="flex justify-center mb-2">
                    <button
                      type="button"
                      onClick={handleLoadMoreMessages}
                      disabled={loadingMoreMessages}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-200/70 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                    >
                      {loadingMoreMessages && <Loader2 size={12} className="animate-spin text-orange-500" />}
                      <span>Tải thêm tin nhắn trước đó...</span>
                    </button>
                  </div>
                )}

                {loadingMessages && (
                  <div className="flex items-center justify-center py-8 text-slate-400 text-xs">
                    <Loader2 size={20} className="animate-spin mr-2 text-orange-500" />
                    <span>Đang tải nội dung cuộc trò chuyện...</span>
                  </div>
                )}

                {messages.map((msg) => {
                  const isUser = msg.role === 'user'
                  const isCopied = copiedId === msg.id

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col max-w-[88%]',
                        isUser ? 'ml-auto items-end' : 'mr-auto items-start',
                      )}
                    >
                      <div
                        className={cn(
                          'p-3.5 text-[13.5px] shadow-2xs select-text cursor-text leading-relaxed',
                          isUser
                            ? 'bg-navy-800 text-white rounded-2xl rounded-tr-xs font-normal'
                            : 'bg-white border border-slate-200/90 text-slate-900 rounded-2xl rounded-tl-xs',
                        )}
                      >
                        {isUser ? (
                          <p className="leading-relaxed whitespace-pre-wrap select-text">{msg.content}</p>
                        ) : (
                          <div className="select-text">{renderSimpleMarkdown(msg.content)}</div>
                        )}
                      </div>

                      {!isUser && (
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép câu trả lời"
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl text-slate-600 text-xs max-w-[65%] mr-auto border border-orange-200 shadow-2xs">
                    <span className="animate-bounce text-base">🦊</span>
                    <span>Teacher Cáo đang suy nghĩ câu trả lời...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Ô nhập tin nhắn */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-1.5">
                <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-canvas p-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi, yêu cầu soạn đề thi, hoặc hiệu đính câu văn..."
                    className="w-full resize-none bg-transparent px-2.5 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed overflow-y-auto max-h-[200px]"
                  />
                  <button
                    type="button"
                    disabled={!input.trim() || isLoading}
                    onClick={() => handleSend()}
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all cursor-pointer shadow-2xs mb-0.5',
                      input.trim() && !isLoading
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed',
                    )}
                    title="Gửi tin nhắn"
                  >
                    <Send size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    {quota && (
                      <span className="font-semibold text-slate-600">
                        ⚡ Còn {quota.remaining}/{quota.limit} lượt hôm nay
                      </span>
                    )}
                  </span>
                  <span>Enter để gửi, Shift+Enter xuống dòng</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Nút Nổi Kích Hoạt (Chỉ hiển thị Avatar 🦊 khi khung chat đóng) ──── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer active:scale-95 border-2 border-white bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-orange-500/35 hover:shadow-orange-500/50 hover:shadow-xl hover:-translate-y-1 hover:scale-110"
          title="Teacher Cáo — Trợ lý AI học liệu & giảng dạy 24/7"
        >
          {/* Pulsing online status badge */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs" />
          </span>

          <span className="text-2xl leading-none transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            🦊
          </span>
        </button>
      )}
    </div>
  )
}

export default AiChatWidget
