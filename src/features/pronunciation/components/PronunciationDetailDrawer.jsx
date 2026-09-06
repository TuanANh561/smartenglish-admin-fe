import { Lock, Pencil, Play, Volume2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Drawer from '@/components/ui/Drawer'
import { speakWord } from '@/lib/ipaHelper'

const LEVEL_TONE = {
  A1: 'info',
  A2: 'info',
  B1: 'success',
  B2: 'warning',
  C1: 'danger',
  C2: 'danger',
}

export default function PronunciationDetailDrawer({
  activeLesson,
  onClose,
  onPlayAudio,
  onEdit,
}) {
  if (!activeLesson) return null

  return (
    <Drawer
      open={Boolean(activeLesson)}
      onClose={onClose}
      title={activeLesson?.title}
      className="max-w-lg"
    >
      <div className="space-y-5 text-sm">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
          <span className="font-mono text-base font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
            {activeLesson.ipaSymbol || '/IPA/'}
          </span>
          <Badge tone={LEVEL_TONE[activeLesson.level]}>
            Cấp độ {activeLesson.level}
          </Badge>
          <Badge tone="neutral">{activeLesson.category}</Badge>
          <Badge tone={activeLesson.status === 'published' ? 'success' : 'neutral'}>
            {activeLesson.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* Audio Waveform simulation player */}
        <div className="rounded-2xl bg-navy-900 p-4 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
              Mẫu phát âm giọng bản xứ AI
            </span>
            <span className="text-xs text-slate-400">0:04 / 0:04</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => onPlayAudio(e, activeLesson)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-400 cursor-pointer shadow-md"
            >
              <Play size={18} fill="currentColor" />
            </button>
            <div className="flex-1 space-y-1">
              <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-brand-400 rounded-full w-2/3" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-700/60">
            <span>
              Ngưỡng chuẩn: <strong>{activeLesson.aiMinScoreThreshold || 85}%</strong>
            </span>
            <span>{activeLesson.audioSampleCount || 24} mẫu giọng khác nhau</span>
          </div>
        </div>

        {/* Khẩu hình miệng */}
        {activeLesson.mouthShapeGuide && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Khẩu hình miệng & cách phát âm
            </h4>
            <p className="mt-1.5 rounded-xl border border-line bg-canvas p-3 text-xs leading-relaxed text-navy-800">
              {activeLesson.mouthShapeGuide}
            </p>
          </div>
        )}

        {/* Từ vựng luyện tập */}
        {activeLesson.sampleWords && activeLesson.sampleWords.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Từ vựng chứa âm ({activeLesson.sampleWords.length})
            </h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {activeLesson.sampleWords.map((sw, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-line bg-white p-2.5 text-xs shadow-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-navy-800">{sw.word}</p>
                    <p className="font-mono text-[11px] text-brand-600">{sw.ipa}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakWord(sw.word)
                      toast.success(`Phát âm: "${sw.word}"`)
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                    title="Phát âm từ mẫu"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Câu luyện tập */}
        {activeLesson.sampleSentences && activeLesson.sampleSentences.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Câu luyện phát âm & ngữ điệu
            </h4>
            <div className="mt-2 space-y-2">
              {activeLesson.sampleSentences.map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-line bg-canvas p-3 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-navy-800">{st.text}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        speakWord(st.text)
                        toast.success('Phát âm cả câu')
                      }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-brand-600 transition-colors cursor-pointer shrink-0"
                      title="Nghe phát âm cả câu"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-ink-muted">{st.ipa}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={(e) => {
              onClose()
              onEdit(e, activeLesson)
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            <Pencil size={15} />
            <span>Chỉnh sửa bài phát âm</span>
          </button>
        </div>
      </div>
    </Drawer>
  )
}
