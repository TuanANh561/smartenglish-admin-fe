import { useMemo, useState } from 'react'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Headphones,
  Image as ImageIcon,
  Lock,
  Pencil,
  Search,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { formatDate } from '@/lib/utils'
import { useTwoLayerAudio } from '@/lib/useTwoLayerAudio'

const LEVEL_TONE = {
  A1: 'info',
  A2: 'info',
  B1: 'brand',
  B2: 'brand',
  C1: 'warning',
  C2: 'danger',
  ALL: 'neutral',
}

const PART_CONFIG = [
  { id: 1, name: 'Part 1', label: 'Part 1: Tranh ảnh', icon: ImageIcon, isListening: true },
  { id: 2, name: 'Part 2', label: 'Part 2: Hỏi - Đáp', icon: Headphones, isListening: true },
  { id: 3, name: 'Part 3', label: 'Part 3: Hội thoại', icon: Headphones, isListening: true },
  { id: 4, name: 'Part 4', label: 'Part 4: Bài nói', icon: Headphones, isListening: true },
  { id: 5, name: 'Part 5', label: 'Part 5: Điền câu', icon: FileText, isListening: false },
  { id: 6, name: 'Part 6', label: 'Part 6: Điền đoạn', icon: FileText, isListening: false },
  { id: 7, name: 'Part 7', label: 'Part 7: Đọc hiểu', icon: FileText, isListening: false },
]

export default function ExamDetailDrawer({ exam, onClose, canManage, onEditClick }) {
  const audioEngine = useTwoLayerAudio()
  const [selectedPartTab, setSelectedPartTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showScripts, setShowScripts] = useState(true)

  const questions = exam?.questions || []
  const sections = exam?.sections || []

  // Filter questions by Part and Search
  const filteredQuestions = useMemo(() => {
    if (!exam) return []
    return questions.filter((q, idx) => {
      const qNum = q.questionNumber || idx + 1
      const partNum = Number(q.part) || (qNum <= 6 ? 1 : qNum <= 31 ? 2 : qNum <= 70 ? 3 : qNum <= 100 ? 4 : qNum <= 130 ? 5 : qNum <= 146 ? 6 : 7)

      if (selectedPartTab !== 'ALL' && partNum !== Number(selectedPartTab)) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const numStr = String(qNum)
        return (
          numStr === query ||
          numStr.includes(query) ||
          (q.questionText || '').toLowerCase().includes(query) ||
          (q.passageText || '').toLowerCase().includes(query) ||
          (q.audioScript || '').toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [exam, questions, selectedPartTab, searchQuery])

  // Count by part
  const partCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
    if (!exam) return counts
    questions.forEach((q, idx) => {
      const qNum = q.questionNumber || idx + 1
      const p = Number(q.part) || (qNum <= 6 ? 1 : qNum <= 31 ? 2 : qNum <= 70 ? 3 : qNum <= 100 ? 4 : qNum <= 130 ? 5 : qNum <= 146 ? 6 : 7)
      if (counts[p] !== undefined) counts[p]++
    })
    return counts
  }, [exam, questions])

  if (!exam) return null

  return (
    <Drawer
      open={Boolean(exam)}
      onClose={() => {
        audioEngine.stop()
        onClose()
      }}
      title={exam.title}
      size="2xl"
    >
      <div className="space-y-5 text-sm">
        {/* Meta badges & Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={LEVEL_TONE[exam.cefrLevel] || 'brand'}>
              Cấp độ {exam.cefrLevel || 'B2'}
            </Badge>
            {exam.category && <Badge tone="neutral">{exam.category}</Badge>}
            <Badge tone={exam.status === 'published' ? 'success' : 'neutral'}>
              {exam.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                icon={Pencil}
                onClick={() => {
                  audioEngine.stop()
                  onClose()
                  onEditClick(exam)
                }}
              >
                Chỉnh sửa bài thi
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Clock size={15} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Thời gian làm</p>
              <p className="font-bold text-slate-800">{exam.durationMinutes || 120} phút</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BookOpen size={15} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Tổng câu hỏi</p>
              <p className="font-bold text-slate-800">{exam.totalQuestions ?? questions.length} câu</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Award size={15} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Điểm tối thiểu</p>
              <p className="font-bold text-slate-800">{exam.passingScore > 0 ? exam.passingScore : 'Không đặt'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <User size={15} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Tác giả</p>
              <p className="font-bold text-slate-800 truncate max-w-[120px]">{exam.authorName || 'Hệ thống'}</p>
            </div>
          </div>
        </div>

        {/* Mô tả bài thi */}
        {exam.description && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-600">
            <strong className="text-slate-800 mr-1.5">Mô tả:</strong>
            {exam.description}
          </div>
        )}

        {/* ─── Part Navigation Filter Tabs ─── */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Ngân hàng câu hỏi theo từng Part</span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] text-brand-700 font-semibold">
                {questions.length} câu
              </span>
            </h4>

            {/* Quick toggle transcript scripts */}
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showScripts}
                onChange={(e) => setShowScripts(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Hiện kịch bản nghe / Transcript</span>
            </label>
          </div>

          {/* Part Filter Pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedPartTab('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                selectedPartTab === 'ALL'
                  ? 'bg-navy-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({questions.length})
            </button>

            {PART_CONFIG.map((p) => {
              const count = partCounts[p.id] || 0
              const isActive = selectedPartTab === p.id
              const Icon = p.icon

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPartTab(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{p.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search box inside Drawer */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo số câu hỏi, từ khóa câu hỏi, đoạn văn đọc hiểu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* ─── Question Cards List ─── */}
        <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1.5 custom-scrollbar">
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-xs">Không tìm thấy câu hỏi nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const qNum = q.questionNumber || idx + 1
              const partNum = Number(q.part) || (qNum <= 6 ? 1 : qNum <= 31 ? 2 : qNum <= 70 ? 3 : qNum <= 100 ? 4 : qNum <= 130 ? 5 : qNum <= 146 ? 6 : 7)
              const opts = Array.isArray(q.options) ? q.options : []
              const isListening = partNum <= 4
              const isCurrentPlaying = audioEngine.playingId === `detail-q-${qNum}`

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  {/* Top Bar of each question */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white font-bold text-xs shadow-2xs">
                        {qNum}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                          isListening
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : partNum === 5
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        Part {partNum}
                      </span>
                      {q.groupRangeText && (
                        <span className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                          {q.groupRangeText}
                        </span>
                      )}
                      {q.groupAudioBadge && (
                        <span className="rounded-md bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 text-[10px]">
                          {q.groupAudioBadge}
                        </span>
                      )}
                    </div>

                    {/* Audio 2-Layer Controller for Listening */}
                    {isListening && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const fallbackText =
                              q.audioScript ||
                              q.questionText ||
                              opts.map((o) => (typeof o === 'object' ? o.text : o)).join('. ')
                            audioEngine.play(`detail-q-${qNum}`, {
                              audioUrl: q.audioUrl,
                              fallbackText,
                            })
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                            isCurrentPlaying
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <>
                              <VolumeX size={13} className="text-amber-700 animate-pulse" />
                              <span>
                                Dừng ({audioEngine.activeLayer === 'audio' ? 'Tầng 1: Audio' : 'Tầng 2: Web Speech'})
                              </span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} className="text-indigo-600" />
                              <span>Nghe câu này (Web Speech AI)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ─── Part 1: Bức tranh chụp (Photograph) ─── */}
                  {partNum === 1 && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <ImageIcon size={14} className="text-blue-600" />
                        <span>Hình ảnh câu hỏi Part 1:</span>
                      </div>
                      {q.imageUrl ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2.5 rounded-lg border border-blue-100">
                          <img
                            src={q.imageUrl}
                            alt={`Tranh chụp câu ${qNum}`}
                            className="h-36 w-full sm:w-60 rounded-lg object-cover border border-slate-200 shadow-2xs"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80'
                            }}
                          />
                          <div className="text-xs text-slate-600 space-y-1">
                            <p className="font-semibold text-slate-800">Ảnh mô tả bài thi TOEIC</p>
                            <p className="text-[11px] text-slate-400 break-all">{q.imageUrl}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Chưa có URL hình ảnh cho câu hỏi này</p>
                      )}
                    </div>
                  )}

                  {/* ─── Part 6, Part 7: Đoạn văn đọc hiểu (Passage Text) ─── */}
                  {(partNum === 6 || partNum === 7 || q.passageText) && q.passageText && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <FileText size={14} className="text-amber-700" />
                          <span>Đoạn văn đọc hiểu (Reading Passage — Part {partNum})</span>
                        </div>
                        {q.groupRangeText && (
                          <span className="text-[11px] font-semibold text-amber-800">
                            {q.groupRangeText}
                          </span>
                        )}
                      </div>

                      <div className="rounded-lg bg-white p-3.5 border border-amber-100 text-xs text-slate-800 font-serif leading-relaxed whitespace-pre-line shadow-2xs max-h-48 overflow-y-auto custom-scrollbar">
                        {q.passageText}
                      </div>
                    </div>
                  )}

                  {/* ─── Listening Transcript (Kịch bản nghe) ─── */}
                  {isListening && showScripts && q.audioScript && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-2.5 text-xs text-indigo-950">
                      <p className="font-bold text-[11px] text-indigo-800 mb-1 flex items-center gap-1">
                        <Headphones size={12} /> Kịch bản nghe (Audio Transcript):
                      </p>
                      <p className="italic leading-relaxed whitespace-pre-line">{q.audioScript}</p>
                    </div>
                  )}

                  {/* Câu hỏi chính */}
                  <p className="font-semibold text-navy-900 text-sm leading-snug">
                    {q.questionText || (partNum === 1 ? 'Listen to the four statements and choose the best description of the photograph.' : `Câu hỏi ${qNum}`)}
                  </p>

                  {/* Danh sách các lựa chọn A, B, C, D */}
                  {opts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {opts.map((opt, optIdx) => {
                        const optKey = typeof opt === 'object' ? (opt.key || opt.id || opt.label) : String.fromCharCode(65 + optIdx)
                        const optText = typeof opt === 'object' ? opt.text : opt
                        const isCorrect = String(q.correctAnswer).trim().toUpperCase() === String(optKey).trim().toUpperCase()

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-2.5 rounded-xl px-3 py-2 border transition-all text-xs ${
                              isCorrect
                                ? 'bg-emerald-50/90 text-emerald-900 font-semibold border-emerald-300 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-500'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="leading-snug pt-0.5">{optText}</span>
                            {isCorrect && (
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 ml-auto mt-0.5" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Giải thích chi tiết */}
                  {(q.explanation || q.explanationVi) && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-navy-800">Giải thích: </span>
                      {q.explanation || q.explanationVi}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Thông tin metadata bài thi */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-ink-muted grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="font-semibold text-navy-700">Tác giả: </span>
            {exam.authorName || '—'}
          </div>
          <div>
            <span className="font-semibold text-navy-700">Ngày tạo: </span>
            {formatDate(exam.createdAt)}
          </div>
          <div>
            <span className="font-semibold text-navy-700">Thưởng hoàn thành: </span>
            {exam.xpReward ?? 150} XP
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-line flex items-center justify-end">
          <Button variant="secondary" onClick={() => {
            audioEngine.stop()
            onClose()
          }}>
            Đóng cửa sổ
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
