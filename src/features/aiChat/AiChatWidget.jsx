import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Copy,
  GripHorizontal,
  Maximize2,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { sendChatMessage } from './aiChatService'

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

function loadUserMessages(userId) {
  try {
    const key = `smartenglish_teacher_cao_chat_${userId || 'guest'}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Không thể tải lịch sử chat từ localStorage:', e)
  }
  return INITIAL_MESSAGES
}

function AiChatWidget() {
  const currentUser = useAuthStore((s) => s.user)
  const userId = currentUser?.id || 'guest'

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState(() => loadUserMessages(userId))

  // Khi đổi tài khoản (đăng xuất hoặc đổi role), tự động nạp lịch sử riêng của tài khoản đó
  useEffect(() => {
    setMessages(loadUserMessages(userId))
  }, [userId])

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
    return { width: 420, height: 550 }
  })

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, width: 420, height: 550 })

  // Tự động lưu tin nhắn riêng cho từng user
  useEffect(() => {
    try {
      localStorage.setItem(`smartenglish_teacher_cao_chat_${userId}`, JSON.stringify(messages))
    } catch (e) {
      console.warn('Không thể lưu tin nhắn vào localStorage:', e)
    }
  }, [messages, userId])

  useEffect(() => {
    try {
      localStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify(size))
    } catch (e) {
      // ignore
    }
  }, [size])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  // Tự động giãn kích thước dọc của textarea theo nội dung soạn thảo
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.max(38, Math.min(textareaRef.current.scrollHeight, 200))
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [input, isOpen])

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
        newWidth = Math.max(340, Math.min(window.innerWidth - 48, dragStartRef.current.width + deltaX))
      }
      if (direction === 'corner' || direction === 'top') {
        newHeight = Math.max(420, Math.min(window.innerHeight - 48, dragStartRef.current.height + deltaY))
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

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input.trim()
    if (!textToSend || isLoading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const replyText = await sendChatMessage(updatedMessages, currentUser?.role)
      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      toast.error('Lỗi kết nối. Vui lòng thử lại!')
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau giây lát.',
          timestamp: new Date(),
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

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES)
    try {
      localStorage.removeItem(`smartenglish_teacher_cao_chat_${userId}`)
      localStorage.removeItem('smartenglish_teacher_cao_chat')
    } catch (e) {
      // ignore
    }
    toast.success('Đã làm mới đoạn chat')
  }

  // Tính toán kích thước hiển thị
  const modalStyle = isExpanded
    ? {
        width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 760) : 760,
        height: typeof window !== 'undefined' ? Math.min(window.innerHeight - 32, 820) : 800,
      }
    : {
        width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, size.width) : size.width,
        height: typeof window !== 'undefined' ? Math.min(window.innerHeight - 32, size.height) : size.height,
      }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* ─── Khung Chat Teacher Cáo (Hỗ trợ kéo góc phóng to tùy ý) ────────── */}
      {isOpen && (
        <div
          style={modalStyle}
          className="relative flex flex-col bg-[#f8fafc] border border-slate-300 shadow-2xl rounded-2xl overflow-hidden transition-all duration-75 mb-2 max-w-[96vw] max-h-[92vh] select-text"
        >
          {/* ─── Điểm kéo góc trên bên trái để resize kích thước tùy ý ────── */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'corner')}
            className="absolute top-0 left-0 h-6 w-6 cursor-nwse-resize z-30 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-colors group select-none"
            title="Kéo góc này để phóng to / thu nhỏ kích thước khung chat theo ý muốn"
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

          {/* Header với các nút điều khiển ở góc trên bên phải */}
          <div className="bg-slate-100/95 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 pl-7">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-xl shadow-2xs border border-orange-200">
                <span>🦊</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-[15px] text-slate-800 leading-none">Teacher Cáo</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI 24/7
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trợ Giảng AI
                </p>
              </div>
            </div>

            {/* Nút điều khiển ở góc trên bên phải */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearHistory}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                title="Làm mới đoạn hội thoại"
              >
                <RotateCcw size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Mở rộng tối đa'}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              {/* Nút Đóng (X) tròn ở góc trên bên phải */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/90 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer ml-0.5 shadow-2xs"
                title="Đóng khung chat"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Gợi ý câu hỏi nhanh khi mới mở */}
          {messages.length === 1 && (
            <div className="p-3 bg-white border-b border-slate-200/80 shrink-0">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <Sparkles size={13} className="text-orange-500" />
                Gợi ý câu hỏi học tập:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 transition-all text-left cursor-pointer shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc] select-text">
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
                      'p-3.5 text-[13.5px] shadow-2xs select-text cursor-text',
                      isUser
                        ? 'bg-slate-700 text-white rounded-2xl rounded-tr-xs font-medium'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-2xl rounded-tl-xs',
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
                        title="Sao chép"
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
                <span>Teacher Cáo đang phân tích câu trả lời...</span>
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
                placeholder="Nhập yêu cầu soạn bài giảng, tạo câu hỏi trắc nghiệm hoặc gửi câu cần hiệu đính..."
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
                title="Gửi"
              >
                <Send size={14} />
              </button>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                Kéo góc trên-trái để chỉnh kích thước
              </span>
              <span>Enter để gửi, Shift+Enter xuống dòng</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Nút Nổi Kích Hoạt (Chỉ hiển thị Avatar 🦊 khi khung chat đóng) ──── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer active:scale-95 border-2 border-white bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-orange-500/35 hover:shadow-orange-500/50 hover:shadow-xl hover:-translate-y-1 hover:scale-110"
          title="Teacher Cáo — Trợ lý học tập 24/7"
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
