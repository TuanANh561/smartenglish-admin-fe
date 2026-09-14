import { Bot, Loader2, Send, Sparkles, User, Wand2, X } from 'lucide-react'

/**
 * Cột Trợ Lý AI (Gemini Pedagogical Assistant Drawer)
 * Đặt bên phải modal, hỗ trợ sinh nội dung và phản hồi thông minh
 */
export default function LessonAiChatDrawer({
  isOpen,
  onClose,
  chatMessages,
  chatPrompt,
  setChatPrompt,
  onSendMessage,
  isAiGenerating,
  chatEndRef,
}) {
  if (!isOpen) return null

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className="w-full sm:w-80 md:w-96 border-l border-line flex flex-col bg-slate-50/70 shrink-0 h-full animate-slide-left">
      {/* Header Drawer */}
      <div className="p-3.5 border-b border-line bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles size={14} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-navy-900 leading-tight">
              Trợ Lý Sư Phạm AI
            </h4>
            <p className="text-[10px] text-purple-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Powered by Google Gemini AI
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Ẩn khung chat AI"
        >
          <X size={15} />
        </button>
      </div>

      {/* Danh Sách Tin Nhắn Chat */}
      <div className="p-3.5 flex-1 overflow-y-auto space-y-3 text-xs">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400">
              {msg.role === 'user' ? (
                <>
                  <span>Bạn</span>
                  <User size={11} />
                </>
              ) : (
                <>
                  <Bot size={11} className="text-purple-600" />
                  <span className="font-semibold text-purple-700">Trợ Lý AI</span>
                </>
              )}
              <span>• {msg.time}</span>
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[90%] text-xs leading-relaxed shadow-2xs whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isAiGenerating && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-700 text-xs shadow-2xs">
            <Loader2 size={15} className="animate-spin text-purple-600 shrink-0" />
            <span>AI đang phân tích và lên cấu trúc bài học...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Gợi Ý Yêu Cầu Nhanh (Quick Prompt Chips) */}
      <div className="px-3 pt-2 pb-1 bg-white/60 border-t border-line/60">
        <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
          Gợi ý yêu cầu nhanh:
        </span>
        <div className="flex flex-wrap gap-1.5 text-[10.5px]">
          {[
            'Gọi món ở nhà hàng',
            'Phỏng vấn xin việc',
            'Thì Quá khứ đơn',
            'Du lịch & Khách sạn',
          ].map((item) => (
            <button
              key={item}
              type="button"
              disabled={isAiGenerating}
              onClick={() => onSendMessage(`Tạo bài học Unit về chủ đề: ${item}`)}
              className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded-lg transition-colors border border-slate-200/80 cursor-pointer disabled:opacity-50"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      {/* Input Nhập Lệnh Chat */}
      <div className="p-3 bg-white border-t border-line">
        <div className="relative flex items-center">
          <input
            type="text"
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAiGenerating}
            placeholder="Nhập yêu cầu bài học muốn tạo..."
            className="w-full text-xs py-2 pl-3 pr-9 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-50/50"
          />
          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={!chatPrompt.trim() || isAiGenerating}
            className="absolute right-1.5 p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 transition-all shadow-xs"
            title="Gửi yêu cầu đến AI"
          >
            {isAiGenerating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
