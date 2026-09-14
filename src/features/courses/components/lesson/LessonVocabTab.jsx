import { Plus, Trash2, Volume2, BookOpen, Edit3 } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * Tab Soạn Thảo Từ Vựng Dạng BẢNG (Table)
 * Không có viền bao quanh các ô nhập liệu, chỉ hiển thị viền khi hover/focus để biết có thể chỉnh sửa
 */
export default function LessonVocabTab({
  vocabBlock,
  updateBlock,
}) {
  const items = vocabBlock?.items || []

  const handleAddItem = () => {
    const nextItem = { word: '', ipa: '', meaningVi: '', exampleEn: '' }
    updateBlock('vocabulary', { items: [...items, nextItem] })
  }

  const handleUpdateItem = (index, field, value) => {
    const updated = items.map((it, i) =>
      i === index ? { ...it, [field]: value } : it,
    )
    updateBlock('vocabulary', { items: updated })
  }

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index)
    updateBlock('vocabulary', { items: updated })
  }

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
            <Volume2 size={15} className="text-brand-600" /> Bảng Từ Vựng Trọng Tâm
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
            {items.length} từ
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={handleAddItem}
          className="text-xs h-7.5 font-semibold bg-white border-brand-300 text-brand-700 hover:bg-brand-50 shadow-2xs"
        >
          Thêm dòng từ vựng
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-line text-ink-muted space-y-2">
          <BookOpen size={28} className="mx-auto text-slate-300" />
          <p className="text-xs">Chưa có từ vựng nào trong danh sách.</p>
          <p className="text-[11px] text-slate-400">
            Bấm "Thêm dòng từ vựng" để nhập thủ công hoặc dùng trợ lý "AI Hỗ Trợ Soạn Bài" để sinh tự động.
          </p>
        </div>
      ) : (
        /* Bảng Từ Vựng: Không viền thô, hover hiện viền trực quan */
        <div className="rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80 select-none">
                  <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                  <th className="py-2.5 px-3 w-[22%]">Từ vựng (Word) <span className="text-rose-500">*</span></th>
                  <th className="py-2.5 px-3 w-[18%]">Phiên âm IPA</th>
                  <th className="py-2.5 px-3 w-[26%]">Nghĩa tiếng Việt <span className="text-rose-500">*</span></th>
                  <th className="py-2.5 px-3">Câu ví dụ thực tế (Example)</th>
                  <th className="py-2.5 px-2 w-10 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-brand-50/20 transition-colors group"
                  >
                    {/* STT */}
                    <td className="py-2 px-3 text-center text-[11px] text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    {/* Từ vựng: Không viền tĩnh, hover hiện viền sáng */}
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={it.word}
                        onChange={(e) => handleUpdateItem(idx, 'word', e.target.value)}
                        placeholder="Từ tiếng Anh..."
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-transparent rounded-lg bg-transparent hover:border-slate-300 hover:bg-slate-50/80 focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* Phiên âm IPA: Monospace màu tím */}
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={it.ipa}
                        onChange={(e) => handleUpdateItem(idx, 'ipa', e.target.value)}
                        placeholder="/ipa/"
                        className="w-full px-2.5 py-1.5 text-xs font-mono text-purple-700 border border-transparent rounded-lg bg-transparent hover:border-purple-300 hover:bg-purple-50/30 focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* Nghĩa tiếng Việt */}
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={it.meaningVi}
                        onChange={(e) => handleUpdateItem(idx, 'meaningVi', e.target.value)}
                        placeholder="Nghĩa tiếng Việt..."
                        className="w-full px-2.5 py-1.5 text-xs font-medium text-navy-800 border border-transparent rounded-lg bg-transparent hover:border-slate-300 hover:bg-slate-50/80 focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* Ví dụ */}
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={it.exampleEn}
                        onChange={(e) => handleUpdateItem(idx, 'exampleEn', e.target.value)}
                        placeholder="Câu ví dụ thực tế..."
                        className="w-full px-2.5 py-1.5 text-xs italic text-slate-600 border border-transparent rounded-lg bg-transparent hover:border-slate-300 hover:bg-slate-50/80 focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* Nút xóa */}
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center opacity-60 group-hover:opacity-100 cursor-pointer"
                        title="Xóa từ này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dòng Footer Thêm Nhanh */}
          <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Edit3 size={12} className="text-slate-400" />
              Rê chuột vào ô bất kỳ để chỉnh sửa trực tiếp.
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 font-semibold text-xs hover:underline cursor-pointer"
            >
              <Plus size={13} /> Thêm hàng mới
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
