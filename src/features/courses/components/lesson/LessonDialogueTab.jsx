import { useState } from 'react'
import { Plus, Trash2, ArrowLeftRight, Send, User, MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/**
 * Tab Soạn Thảo Hội Thoại Dạng CUỘC TRÒ CHUYỆN NHẮN TIN (Chat Messenger)
 * - Trình bày đúng dạng bong bóng chat Messenger như trong ảnh
 * - Không hiện bản dịch thô lên bong bóng thoại
 * - Không hiện dấu mốc thời gian thừa
 * - Cho phép chỉnh sửa trực tiếp trên từng bong bóng tin nhắn
 */
export default function LessonDialogueTab({
  dialogueBlock,
  updateBlock,
}) {
  const lines = dialogueBlock?.lines || []
  const title = dialogueBlock?.title || ''

  // State thanh nhập tin nhắn thoại ở dưới
  const [quickSpeaker, setQuickSpeaker] = useState('A')
  const [quickText, setQuickText] = useState('')

  const handleAddLine = (speakerParam, textParam) => {
    const s = speakerParam || quickSpeaker
    const t = textParam || ''
    const nextLine = { speaker: s, text: t, translation: '' }
    updateBlock('dialogue', { lines: [...lines, nextLine] })
  }

  const handleAddQuickLine = (e) => {
    e?.preventDefault()
    if (!quickText.trim()) return

    const newLine = {
      speaker: quickSpeaker,
      text: quickText.trim(),
      translation: '',
    }

    updateBlock('dialogue', { lines: [...lines, newLine] })
    setQuickText('')
    // Tự động đảo lượt người nói kế tiếp
    setQuickSpeaker((prev) => (prev === 'A' ? 'B' : 'A'))
  }

  const handleUpdateLine = (index, value) => {
    const updated = lines.map((l, i) =>
      i === index ? { ...l, text: value } : l,
    )
    updateBlock('dialogue', { lines: updated })
  }

  const handleToggleSpeaker = (index) => {
    const current = lines[index]?.speaker || 'A'
    const next = current === 'A' ? 'B' : 'A'
    const updated = lines.map((l, i) =>
      i === index ? { ...l, speaker: next } : l,
    )
    updateBlock('dialogue', { lines: updated })
  }

  const handleRemoveLine = (index) => {
    const updated = lines.filter((_, i) => i !== index)
    updateBlock('dialogue', { lines: updated })
  }

  return (
    <div className="space-y-3">
      {/* Tiêu đề & Thống kê */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex-1 max-w-md">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Chủ đề đoạn hội thoại:
          </label>
          <Input
            value={title}
            onChange={(e) => updateBlock('dialogue', { title: e.target.value })}
            placeholder="VD: At the Restaurant (Gọi món tại nhà hàng)"
            className="text-xs font-semibold py-1 h-8 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            {lines.length} tin nhắn
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => handleAddLine(lines.length % 2 === 0 ? 'A' : 'B', '')}
            className="text-xs h-8 font-semibold bg-white border-brand-300 text-brand-700 hover:bg-brand-50 shadow-2xs"
          >
            Thêm tin nhắn thoại
          </Button>
        </div>
      </div>

      {/* KHUNG CUỘC TRÒ CHUYỆN NHẮN TIN (MESSENGER STREAM) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xs space-y-3.5 min-h-[320px] max-h-[500px] overflow-y-auto">
        {lines.length === 0 ? (
          <div className="py-14 text-center text-ink-muted space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center mx-auto text-slate-500">
              <MessageCircle size={24} />
            </div>
            <p className="font-semibold text-slate-700 text-xs">Chưa có câu thoại nào trong cuộc trò chuyện.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Nhập câu thoại vào thanh chat bên dưới để bắt đầu cuộc trò chuyện tự nhiên giữa hai nhân vật.
            </p>
          </div>
        ) : (
          lines.map((line, idx) => {
            const isSpeakerA = (line.speaker || 'A') === 'A'

            return (
              <div
                key={idx}
                className={`flex items-end gap-2.5 group transition-all ${
                  isSpeakerA ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Avatar Người Nói (Bên Trái cho A) - Nền sạch tự nhiên */}
                {isSpeakerA && (
                  <div className="relative shrink-0 mb-1">
                    <div
                      onClick={() => handleToggleSpeaker(idx)}
                      title="Nhân vật A (Bấm để đổi sang B)"
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center text-xs font-bold shadow-2xs cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    >
                      A
                    </div>
                  </div>
                )}

                {/* Bong Bóng Tin Nhắn - Nền trắng tự nhiên cho cả A & B */}
                <div className="relative max-w-md sm:max-w-lg group/bubble">
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-2xs transition-all border border-slate-200 bg-white text-slate-800 ${
                      isSpeakerA ? 'rounded-bl-xs' : 'rounded-br-xs'
                    }`}
                  >
                    {/* Ô nhập chỉnh sửa văn bản trực tiếp trong bong bóng (không viền thô) */}
                    <input
                      type="text"
                      value={line.text}
                      onChange={(e) => handleUpdateLine(idx, e.target.value)}
                      placeholder="Nhập câu thoại tiếng Anh..."
                      className="w-full text-xs font-medium outline-none bg-transparent border-none p-0 leading-relaxed text-slate-800 placeholder:text-slate-300"
                    />
                  </div>

                  {/* Nút hành động nhanh khi hover (Đổi người nói, Xóa) */}
                  <div
                    className={`absolute -top-3.5 flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-xs opacity-0 group-hover/bubble:opacity-100 transition-opacity z-10 ${
                      isSpeakerA ? 'left-2' : 'right-2'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSpeaker(idx)}
                      className="p-1 text-slate-400 hover:text-navy-800 rounded transition-colors text-[10px] font-bold"
                      title="Đổi nhân vật nói (A ⇄ B)"
                    >
                      <ArrowLeftRight size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Xóa câu này"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Avatar Người Nói (Bên Phải cho B) - Nền sạch tự nhiên */}
                {!isSpeakerA && (
                  <div className="relative shrink-0 mb-1">
                    <div
                      onClick={() => handleToggleSpeaker(idx)}
                      title="Nhân vật B (Bấm để đổi sang A)"
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center text-xs font-bold shadow-2xs cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    >
                      B
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* THANH NHẬP NHANH TIN NHẮN DẠNG CHAT MESSENGER (COMPOSER) */}
      <form
        onSubmit={handleAddQuickLine}
        className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2"
      >
        {/* Nút chọn nhân vật A / B */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setQuickSpeaker('A')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              quickSpeaker === 'A'
                ? 'bg-white text-navy-900 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setQuickSpeaker('B')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              quickSpeaker === 'B'
                ? 'bg-white text-navy-900 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            B
          </button>
        </div>

        {/* Ô nhập nội dung tin nhắn */}
        <input
          type="text"
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder={`Nhập câu thoại của nhân vật ${quickSpeaker}... (Nhấn Enter để gửi)`}
          className="flex-1 text-xs py-2 px-3 border border-transparent hover:border-slate-200 focus:border-brand-500 rounded-xl bg-slate-50/80 focus:bg-white focus:outline-none transition-all"
        />

        {/* Nút gửi tin nhắn */}
        <button
          type="submit"
          disabled={!quickText.trim()}
          className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 transition-all shadow-xs shrink-0 cursor-pointer"
          title="Gửi câu thoại"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
