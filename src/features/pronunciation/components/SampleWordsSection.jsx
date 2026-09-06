import { Plus, Trash2, Volume2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import IpaInputField from '@/components/ui/IpaInputField'

export default function SampleWordsSection({
  sampleWords,
  sampleSentences,
  onAddWord,
  onUpdateWord,
  onRemoveWord,
  onAddSentence,
  onUpdateSentence,
  onRemoveSentence,
  onPlayAudio,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
      {/* Sample Words header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
            3
          </span>
          Từ vựng mẫu luyện tập ({sampleWords.length})
        </h3>
        <button
          type="button"
          onClick={onAddWord}
          className="flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
        >
          <Plus size={13} /> Thêm từ mẫu
        </button>
      </div>

      {/* Sample Words List */}
      <div className="space-y-3">
        {sampleWords.map((sw, swIdx) => (
          <div
            key={swIdx}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Từ mẫu {swIdx + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPlayAudio(swIdx, sw.word)}
                  className="flex items-center gap-1 text-[11px] text-brand-600 font-semibold hover:underline cursor-pointer"
                >
                  <Volume2 size={13} /> Nghe thử
                </button>
                {sampleWords.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveWord(swIdx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Xóa từ mẫu"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 items-start">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ mẫu</label>
                <Input
                  value={sw.word}
                  onChange={(e) => onUpdateWord(swIdx, 'word', e.target.value)}
                  placeholder="Từ (VD: About)"
                />
              </div>
              <IpaInputField
                value={sw.ipa}
                onChange={(newVal) => onUpdateWord(swIdx, 'ipa', newVal)}
                sourceWord={sw.word}
                onWordCorrect={(corrected) => onUpdateWord(swIdx, 'word', corrected)}
                label="Phiên âm IPA"
                placeholder="VD: /əˈbaʊt/"
              />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nghĩa tiếng Việt</label>
                <Input
                  value={sw.meaning}
                  onChange={(e) => onUpdateWord(swIdx, 'meaning', e.target.value)}
                  placeholder="Nghĩa (VD: Về, khoảng)"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sample Sentences */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Câu luyện đọc mẫu ({sampleSentences.length})
          </h4>
          <button
            type="button"
            onClick={onAddSentence}
            className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Plus size={12} /> Thêm câu mẫu
          </button>
        </div>

        <div className="space-y-3">
          {sampleSentences.map((st, stIdx) => (
            <div
              key={stIdx}
              className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 relative group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Câu {stIdx + 1}</span>
                {sampleSentences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveSentence(stIdx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Xóa câu mẫu"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <Input
                value={st.text}
                onChange={(e) => onUpdateSentence(stIdx, 'text', e.target.value)}
                placeholder="Câu tiếng Anh (VD: A cup of tea and a banana for breakfast.)"
              />
              <Input
                value={st.ipa}
                onChange={(e) => onUpdateSentence(stIdx, 'ipa', e.target.value)}
                placeholder="Phiên âm cả câu (VD: /ə kʌp əv tiː ənd ə bəˈnænə.../)"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
