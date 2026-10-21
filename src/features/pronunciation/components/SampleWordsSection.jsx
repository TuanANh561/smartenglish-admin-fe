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
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 relative group"
          >
            {/* Header hàng từ vựng */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-100 text-brand-700 text-[11px] font-bold">
                  {swIdx + 1}
                </span>
                Từ mẫu {swIdx + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPlayAudio(swIdx, sw.word)}
                  className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline cursor-pointer px-2 py-0.5 rounded-md hover:bg-brand-50 transition-colors whitespace-nowrap"
                >
                  <Volume2 size={13} /> Nghe thử phát âm
                </button>
                {sampleWords.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveWord(swIdx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 cursor-pointer"
                    title="Xóa từ mẫu này"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Hàng 1: Từ vựng tiếng Anh & Nghĩa tiếng Việt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 whitespace-nowrap">
                  Từ tiếng Anh <span className="text-red-500">*</span>
                </label>
                <Input
                  value={sw.word}
                  onChange={(e) => onUpdateWord(swIdx, 'word', e.target.value)}
                  placeholder="VD: Water, Butter, About..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 whitespace-nowrap">
                  Nghĩa tiếng Việt
                </label>
                <Input
                  value={sw.meaning}
                  onChange={(e) => onUpdateWord(swIdx, 'meaning', e.target.value)}
                  placeholder="VD: Nước, Bơ, Về, khoảng..."
                />
              </div>
            </div>

            {/* Hàng 2: Phiên âm IPA chuẩn - Rộng rãi đầy đủ không gian */}
            <div className="pt-0.5">
              <IpaInputField
                value={sw.ipa}
                onChange={(newVal) => onUpdateWord(swIdx, 'ipa', newVal)}
                sourceWord={sw.word}
                onWordCorrect={(corrected) => onUpdateWord(swIdx, 'word', corrected)}
                label="Phiên âm IPA chuẩn"
                placeholder="VD: /ˈwɔː.tər/, /ˈbʌt.ər/, /əˈbaʊt/..."
              />
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
