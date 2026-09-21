import { useState, useEffect, useRef } from 'react'
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  Languages,
  RotateCcw,
  Loader2,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  VolumeX,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { chatRoleplayTurn } from '../speakingScenarioApi'

export default function SpeakingSimulatorModal({
  isOpen,
  onClose,
  scenario,
}) {
  if (!isOpen || !scenario) return null

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isAiReplying, setIsAiReplying] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [translatedMessages, setTranslatedMessages] = useState({})
  const [showContext, setShowContext] = useState(true)
  const [isSpeakingTts, setIsSpeakingTts] = useState(false)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize conversation with Opening Line
  useEffect(() => {
    const opening = scenario.openingLine || 'Hello! How are you today?'
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: opening,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setSessionId(null)
    setTranslatedMessages({})

    // Auto-speak opening line after short delay
    const timer = setTimeout(() => {
      speakText(opening)
    }, 600)

    return () => clearTimeout(timer)
  }, [scenario])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiReplying])

  // Web Speech API for TTS
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = scenario.defaultSpeed === 'slow' ? 0.8 : scenario.defaultSpeed === 'fast' ? 1.2 : 1.0
    utterance.onstart = () => setIsSpeakingTts(true)
    utterance.onend = () => setIsSpeakingTts(false)
    utterance.onerror = () => setIsSpeakingTts(false)
    window.speechSynthesis.speak(utterance)
  }

  // Web Speech API for STT (Voice to Text)
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast('Trình duyệt không hỗ trợ Web Speech API nhận dạng giọng nói trực tiếp. Bạn có thể gõ phím vào ô nhập liệu bên dưới.', {
        icon: 'ℹ️',
      })
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
        }
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
        setIsRecording(false)
        if (event.error === 'not-allowed') {
          toast.error('Vui lòng cấp quyền truy cập Microphone cho trình duyệt!')
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error(err)
      setIsRecording(false)
    }
  }

  // Send message turn
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim()
    if (!text || isAiReplying) return

    // Stop speaking/recording
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    }

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsAiReplying(true)

    try {
      const res = await chatRoleplayTurn(scenario.id, text, sessionId)
      const data = res?.data || res
      if (data?.sessionId) {
        setSessionId(data.sessionId)
      }

      const replyText = data?.aiResponseText || 'Thank you for your response! Keep going.'

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])

      // Auto speak AI reply
      speakText(replyText)
    } catch (err) {
      toast.error('Lỗi khi nhận phản hồi từ AI: ' + err.message)
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'I understood your point! Could you elaborate a bit more on that?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsAiReplying(false)
    }
  }

  // Suggestion click
  const handleUseKeyword = (kw) => {
    setInputText((prev) => {
      const trimmed = prev.trim()
      return trimmed ? `${trimmed} ${kw}` : kw
    })
  }

  // Toggle quick translation for AI message
  const toggleTranslate = (msgId, text) => {
    if (translatedMessages[msgId]) {
      setTranslatedMessages((prev) => {
        const next = { ...prev }
        delete next[msgId]
        return next
      })
    } else {
      // Simple translation hint
      setTranslatedMessages((prev) => ({
        ...prev,
        [msgId]: '(Bản dịch tiếng Việt đang được hỗ trợ qua mô hình dịch tự động)',
      }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="relative flex flex-col h-[90vh] w-full max-w-4xl rounded-3xl bg-white text-slate-800 shadow-2xl border border-slate-200/90 overflow-hidden font-sans">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 border border-indigo-200 shadow-xs">
              {scenario.partnerAvatarUrl ? (
                <img
                  src={scenario.partnerAvatarUrl}
                  alt={scenario.partnerName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                (scenario.partnerName || 'P')[0].toUpperCase()
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{scenario.partnerName || 'Patricia'}</h2>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase">
                  {scenario.cefrLevel || 'A1'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{scenario.titleEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Voice Info */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
              <Volume2 size={13} className="text-indigo-600" />
              <span>{scenario.defaultVoice || 'US Harper'}</span>
            </div>

            {/* End session button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors border border-slate-200 cursor-pointer"
            >
              <span>Kết thúc</span>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scenario Context Bar (Collapsible) */}
        {scenario.descriptionEn && showContext && (
          <div className="border-b border-indigo-100/90 bg-indigo-50/50 px-6 py-3 text-xs flex items-start justify-between gap-4 shrink-0">
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] text-indigo-700 uppercase tracking-wider">Kịch bản:</span>
              <p className="text-slate-800 text-xs leading-relaxed font-medium">{scenario.descriptionEn}</p>
              {scenario.descriptionVi && (
                <p className="text-slate-500 text-[11px]">{scenario.descriptionVi}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowContext(false)}
              className="text-slate-400 hover:text-slate-700 text-[11px] font-medium shrink-0 mt-0.5 cursor-pointer"
            >
              Thu gọn
            </button>
          </div>
        )}

        {/* Dialogue Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User size={15} />
                ) : scenario.partnerAvatarUrl ? (
                  <img
                    src={scenario.partnerAvatarUrl}
                    alt={scenario.partnerName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  (scenario.partnerName || 'P')[0]
                )}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                {msg.sender === 'ai' && (
                  <p className="text-[11px] font-semibold text-slate-500 pl-1">
                    {scenario.partnerName || 'Patricia'}
                  </p>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  {translatedMessages[msg.id] && (
                    <p className="mt-2 pt-2 border-t border-slate-100 text-xs text-indigo-600 italic bg-indigo-50/60 p-2 rounded-lg">
                      {translatedMessages[msg.id]}
                    </p>
                  )}
                </div>

                {/* Sub utility buttons for AI messages */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-3 pl-1 pt-0.5 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Phát lại âm thanh"
                    >
                      <Volume2 size={12} />
                      <span>Nghe lại</span>
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => toggleTranslate(msg.id, msg.text)}
                      className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <Languages size={12} />
                      <span>Dịch</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isAiReplying && (
            <div className="flex items-center gap-3 mr-auto">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shadow-xs">
                {(scenario.partnerName || 'P')[0]}
              </div>
              <div className="rounded-2xl bg-white px-4 py-2.5 text-xs text-slate-500 border border-slate-200/80 shadow-2xs flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-indigo-600" />
                <span>{scenario.partnerName || 'AI'} đang suy nghĩ phản hồi...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Interactive Area */}
        <div className="border-t border-slate-200/90 bg-white p-5 space-y-3 shrink-0">
          {/* Suggested Expressions Pills */}
          {scenario.suggestedKeywords && scenario.suggestedKeywords.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Lightbulb size={12} className="text-amber-500" />
                <span>Thử dùng các từ gợi ý sau:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {scenario.suggestedKeywords.map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleUseKeyword(kw)}
                    className="rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input & Record Controls */}
          <div className="flex items-center gap-2.5 pt-1">
            {/* Big Mic Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 shadow-md cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-indigo-500/25'
              }`}
              title={isRecording ? 'Đang nghe... Bấm để dừng' : 'Bấm để nói bằng Microphone'}
            >
              {isRecording ? <MicOff size={19} /> : <Mic size={19} />}
            </button>

            {/* Fallback Text Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecording ? 'Đang lắng nghe giọng nói của bạn...' : 'Nói hoặc gõ câu trả lời của bạn tại đây...'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-2xs pr-12 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isAiReplying}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-2 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition-colors cursor-pointer shadow-2xs"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400">
            {isRecording
              ? '🎙️ Đang thu âm... Hãy nói to, rõ ràng vào microphone để hệ thống nhận dạng'
              : 'Nhấn vào Micro để nói hoặc gõ phím để gửi phản hồi đàm thoại cùng trợ lý AI'}
          </p>
        </div>
      </div>
    </div>
  )
}
