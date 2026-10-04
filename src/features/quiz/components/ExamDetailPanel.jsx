import { useMemo, useState } from 'react'
import {
  Award, BookOpen, CheckCircle2, Clock, FileText,
  Headphones, Image as ImageIcon, Pencil, Search,
  Sparkles, User, Volume2, VolumeX, X, ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { useTwoLayerAudio } from '@/lib/useTwoLayerAudio'

const PART_CONFIG = [
  { id: 1, name: 'Part 1', label: 'Tranh ảnh', icon: ImageIcon, isListening: true },
  { id: 2, name: 'Part 2', label: 'Hỏi - Đáp', icon: Headphones, isListening: true },
  { id: 3, name: 'Part 3', label: 'Hội thoại', icon: Headphones, isListening: true },
  { id: 4, name: 'Part 4', label: 'Bài nói', icon: Headphones, isListening: true },
  { id: 5, name: 'Part 5', label: 'Điền câu', icon: FileText, isListening: false },
  { id: 6, name: 'Part 6', label: 'Điền đoạn', icon: FileText, isListening: false },
  { id: 7, name: 'Part 7', label: 'Đọc hiểu', icon: FileText, isListening: false },
]

function getPartNum(q, idx) {
  const n = q.questionNumber || idx + 1
  return Number(q.part) || (n <= 6 ? 1 : n <= 31 ? 2 : n <= 70 ? 3 : n <= 100 ? 4 : n <= 130 ? 5 : n <= 146 ? 6 : 7)
}

function QuestionItemCard({ q, qNum, partNum, isListening, showTranscript, audioEngine, hideIndividualAudio = false }) {
  const opts = Array.isArray(q.options) ? q.options : []
  const isPlaying = audioEngine.playingId === `dp-${qNum}`

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col justify-between">
      <div>
        {/* Header câu */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200 shrink-0">
              {qNum}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              hideIndividualAudio
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : isListening ? 'bg-blue-50 text-blue-700 border-blue-200'
                : partNum === 5 ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {hideIndividualAudio ? `Câu hỏi ${qNum}` : isListening ? '🎧 Nghe' : partNum === 5 ? '✏️ Điền câu' : '📖 Đọc'}
            </span>
            {q.groupAudioBadge && (
              <span className="hidden sm:block text-[10px] text-slate-400 truncate max-w-[160px]">{q.groupAudioBadge}</span>
            )}
          </div>

          {!hideIndividualAudio && isListening && (
            <button
              type="button"
              onClick={() => {
                const text = q.audioScript || q.questionText || opts.map(o => typeof o === 'object' ? o.text : o).join('. ')
                audioEngine.play(`dp-${qNum}`, { audioUrl: q.audioUrl, fallbackText: text })
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {isPlaying ? (
                <>
                  <VolumeX size={12} className="animate-pulse text-amber-600" />
                  <span>Dừng</span>
                </>
              ) : (
                <>
                  <Volume2 size={12} className="text-indigo-600" />
                  <span>Nghe</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Ảnh Part 1 */}
          {partNum === 1 && q.imageUrl && (
            <img
              src={q.imageUrl}
              alt={`Ảnh câu ${qNum}`}
              className="w-full max-h-52 object-cover rounded-xl border border-slate-200"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80' }}
            />
          )}

          {/* Lời thoại */}
          {isListening && showTranscript && q.audioScript && (
            <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-2.5 text-[11px] text-indigo-900 leading-relaxed italic">
              <span className="not-italic font-semibold text-indigo-700 mr-1">Lời thoại:</span>
              {q.audioScript}
            </div>
          )}

          {/* Nội dung câu hỏi */}
          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
            {q.questionText || (partNum === 1 ? 'Quan sát hình ảnh và chọn mô tả đúng nhất.' : `Câu ${qNum}`)}
          </p>

          {/* Đáp án trắc nghiệm A-B-C-D: chia lưới 2 cột gọn gàng */}
          {opts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {opts.map((opt, oi) => {
                const key = typeof opt === 'object' ? (opt.key || opt.id || opt.label) : String.fromCharCode(65 + oi)
                const text = typeof opt === 'object' ? opt.text : opt
                const isCorrect = String(q.correctAnswer || '').trim().toUpperCase() === String(key).trim().toUpperCase()
                return (
                  <div
                    key={oi}
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/90 border border-emerald-300 text-emerald-950 font-medium shadow-2xs'
                        : 'bg-slate-50/70 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                    }`}>
                      {key}
                    </span>
                    <span className="leading-snug truncate flex-1" title={text}>{text}</span>
                    {isCorrect && <CheckCircle2 size={13} className="text-emerald-600 shrink-0 ml-auto" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lời giải thích */}
      {(q.explanation || q.explanationVi) && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[11px] text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-700">Giải thích: </span>
          {q.explanation || q.explanationVi}
        </div>
      )}
    </div>
  )
}

export default function ExamDetailPanel({ exam, onClose, canManage, onEditClick }) {
  const audioEngine = useTwoLayerAudio()
  const [selectedPart, setSelectedPart] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTranscript, setShowTranscript] = useState(false)
  const [expandedTranscripts, setExpandedTranscripts] = useState({})

  const questions = useMemo(() => exam?.questions || [], [exam])

  const partCounts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
    questions.forEach((q, i) => { const p = getPartNum(q, i); if (c[p] !== undefined) c[p]++ })
    return c
  }, [questions])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q, i) => {
      const p = getPartNum(q, i)
      if (selectedPart !== 'ALL' && p !== Number(selectedPart)) return false
      if (!searchQuery.trim()) return true
      const kw = searchQuery.toLowerCase()
      const n = String(q.questionNumber || i + 1)
      return n.includes(kw) || (q.questionText || '').toLowerCase().includes(kw) || (q.passageText || '').toLowerCase().includes(kw)
    })
  }, [questions, selectedPart, searchQuery])

  // Nhóm câu hỏi thông minh:
  // 1. passageGroup (Part 6, 7): Gom câu hỏi theo bài đọc chung
  // 2. audioGroup (Part 3, 4): Gom câu hỏi theo file âm thanh / đoạn hội thoại / bài nói chung
  // 3. singleGrid (Part 1, 2, 5): Câu hỏi độc lập hiển thị dạng Lưới 2 cột
  const layoutSections = useMemo(() => {
    const sections = []
    let currentSingleBatch = null
    let lastGroupKey = null
    let currentGroup = null

    filteredQuestions.forEach((q, i) => {
      const partNum = getPartNum(q, i)
      const qNum = q.questionNumber || i + 1
      const passage = q.passageText?.trim() || null
      const isListeningGroupPart = partNum === 3 || partNum === 4

      if (passage) {
        // ── 1. NHÓM BÀI ĐỌC (PART 6 & PART 7) ──
        if (currentSingleBatch) {
          sections.push({ type: 'singleGrid', items: currentSingleBatch })
          currentSingleBatch = null
        }

        const groupKey = `passage-${q.groupRangeText || passage.slice(0, 100)}`
        if (currentGroup && currentGroup.type === 'passageGroup' && lastGroupKey === groupKey) {
          currentGroup.questions.push({ q, i, qNum, partNum })
        } else {
          currentGroup = {
            type: 'passageGroup',
            id: `pass-${qNum}-${i}`,
            passage,
            groupRangeText: q.groupRangeText,
            partNum,
            questions: [{ q, i, qNum, partNum }],
          }
          lastGroupKey = groupKey
          sections.push(currentGroup)
        }
      } else if (isListeningGroupPart) {
        // ── 2. NHÓM BÀI NGHE CHUNG (PART 3 & PART 4) ──
        if (currentSingleBatch) {
          sections.push({ type: 'singleGrid', items: currentSingleBatch })
          currentSingleBatch = null
        }

        // Tạo khóa nhóm nhận diện đoạn nghe chung:
        // Ưu tiên: groupRangeText -> groupAudioBadge -> audioUrl -> cụm 3 câu chuẩn ETS TOEIC
        const baseOffset = partNum === 3 ? 32 : 71
        const clusterIdx = Math.max(0, Math.floor((qNum - baseOffset) / 3))
        const autoStart = baseOffset + clusterIdx * 3
        const autoEnd = autoStart + 2
        const defaultRangeText = q.groupRangeText || `Nhóm câu ${autoStart}–${autoEnd}`

        let audioGroupKey = null
        if (q.groupRangeText) {
          audioGroupKey = `audio-${partNum}-${q.groupRangeText}`
        } else if (q.groupAudioBadge) {
          audioGroupKey = `audio-${partNum}-${q.groupAudioBadge}`
        } else if (q.audioUrl) {
          audioGroupKey = `audio-${partNum}-${q.audioUrl}`
        } else {
          audioGroupKey = `audio-${partNum}-cluster-${clusterIdx}`
        }

        if (currentGroup && currentGroup.type === 'audioGroup' && lastGroupKey === audioGroupKey) {
          currentGroup.questions.push({ q, i, qNum, partNum })
          if (!currentGroup.audioUrl && q.audioUrl) currentGroup.audioUrl = q.audioUrl
          if (!currentGroup.audioScript && q.audioScript) currentGroup.audioScript = q.audioScript
          if (!currentGroup.imageUrl && q.imageUrl) currentGroup.imageUrl = q.imageUrl
        } else {
          currentGroup = {
            type: 'audioGroup',
            id: `audio-${qNum}-${i}`,
            partNum,
            title: partNum === 3 ? 'Đoạn hội thoại ngắn' : 'Bài nói ngắn',
            groupRangeText: defaultRangeText,
            groupAudioBadge: q.groupAudioBadge || (partNum === 3 ? `Hội thoại (${defaultRangeText})` : `Bài nói (${defaultRangeText})`),
            audioUrl: q.audioUrl || null,
            audioScript: q.audioScript || null,
            imageUrl: q.imageUrl || null,
            questions: [{ q, i, qNum, partNum }],
          }
          lastGroupKey = audioGroupKey
          sections.push(currentGroup)
        }
      } else {
        // ── 3. CÂU HỎI ĐƠN LẺ (PART 1, 2, 5) ──
        lastGroupKey = null
        currentGroup = null
        if (!currentSingleBatch) currentSingleBatch = []
        currentSingleBatch.push({ q, i, qNum, partNum })
      }
    })

    if (currentSingleBatch) {
      sections.push({ type: 'singleGrid', items: currentSingleBatch })
    }

    return sections
  }, [filteredQuestions])

  if (!exam) return null

  const partInfo = selectedPart !== 'ALL' ? PART_CONFIG.find(p => p.id === Number(selectedPart)) : null
  const showListeningToggle = selectedPart === 'ALL' || Number(selectedPart) <= 4

  return (
    <div className="flex flex-col min-h-[600px] bg-white">

      {/* ── Top Navigation Bar: Nút quay lại danh sách ── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50/70">
        <button
          type="button"
          onClick={() => { audioEngine.stop(); onClose() }}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-brand-300 group-hover:bg-brand-50 transition-all shadow-2xs">
            <ArrowLeft size={14} className="text-slate-600 group-hover:text-brand-600" />
          </div>
          <span>Quay lại danh sách đề thi</span>
        </button>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button variant="primary" size="sm" icon={Pencil}
              onClick={() => { audioEngine.stop(); onEditClick(exam) }}>
              Chỉnh sửa đề thi
            </Button>
          )}
          <button
            onClick={() => { audioEngine.stop(); onClose() }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            title="Đóng chi tiết"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Header thông tin đề thi ── */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
            exam.status === 'published'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {exam.status === 'published' ? 'Đang hoạt động' : 'Bản nháp'}
          </span>
          {exam.cefrLevel && (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Cấp độ {exam.cefrLevel}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {exam.category || 'TOEIC'}
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 leading-snug">{exam.title}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {exam.totalQuestions ?? questions.length} câu hỏi &bull; {exam.durationMinutes || 120} phút làm bài
          {exam.description && <span className="ml-2 text-slate-400">— {exam.description}</span>}
        </p>
      </div>

      {/* ── 4 ô thống kê: bố cục lưới 4 cột gọn gàng ── */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 bg-slate-50/50">
        {[
          { label: 'Thời gian làm bài', value: `${exam.durationMinutes || 120} phút`, Icon: Clock, bg: 'bg-blue-100', fg: 'text-blue-600' },
          { label: 'Tổng số câu hỏi', value: `${exam.totalQuestions ?? questions.length} câu`, Icon: BookOpen, bg: 'bg-emerald-100', fg: 'text-emerald-600' },
          { label: 'Điểm đạt yêu cầu', value: exam.passingScore > 0 ? `${exam.passingScore} điểm` : '—', Icon: Award, bg: 'bg-amber-100', fg: 'text-amber-600' },
          { label: 'Điểm thưởng', value: `+${exam.xpReward ?? 150} XP`, Icon: Sparkles, bg: 'bg-purple-100', fg: 'text-purple-600' },
        ].map(({ label, value, Icon, bg, fg }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-3 border-r border-b md:border-b-0 border-slate-200 last:border-r-0">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${bg} ${fg}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 leading-none mb-0.5">{label}</p>
              <p className="text-sm font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Part tabs + tìm kiếm ── */}
      <div className="shrink-0 px-6 py-3 border-b border-slate-200 space-y-2.5 bg-white">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedPart('ALL')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedPart === 'ALL'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả <span className="ml-1 opacity-70">({questions.length})</span>
          </button>
          {PART_CONFIG.map(p => {
            const active = selectedPart === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPart(p.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.name} <span className={`text-[10px] ml-0.5 ${active ? 'opacity-80' : 'text-slate-400'}`}>({partCounts[p.id] || 0})</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm nội dung câu hỏi hoặc từ khóa trong đề..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 focus:bg-white transition-colors"
            />
          </div>
          {showListeningToggle && (
            <button
              type="button"
              onClick={() => setShowTranscript(v => !v)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                showTranscript
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Headphones size={12} />
              {showTranscript ? 'Ẩn lời thoại' : 'Xem lời thoại'}
            </button>
          )}
        </div>
      </div>

      {/* Part breadcrumb */}
      {partInfo && (
        <div className="shrink-0 px-6 py-2 bg-sky-50 border-b border-sky-100 flex items-center gap-1.5 text-xs text-sky-800">
          <partInfo.icon size={13} />
          <span className="font-bold">{partInfo.name} — {partInfo.label}</span>
          <ChevronRight size={11} className="text-sky-400" />
          <span>{partCounts[partInfo.id] || 0} câu hỏi</span>
        </div>
      )}

      {/* ── Danh sách câu hỏi hiển thị theo bố cục Lưới tối ưu ── */}
      <div
        className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
      >
        {layoutSections.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Không có câu hỏi nào</p>
            <p className="text-xs text-slate-400 mt-1">Thử chọn phần khác hoặc xóa từ khóa tìm kiếm</p>
          </div>
        ) : (
          layoutSections.map((sec, secIdx) => {
            if (sec.type === 'singleGrid') {
              // Câu hỏi đơn (Part 1, 2, 3, 4, 5): Hiển thị Lưới 2 cột cân đối, không trống trải
              return (
                <div key={`grid-${secIdx}`} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sec.items.map(({ q, qNum, partNum }) => (
                    <QuestionItemCard
                      key={qNum}
                      q={q}
                      qNum={qNum}
                      partNum={partNum}
                      isListening={partNum <= 4}
                      showTranscript={showTranscript}
                      audioEngine={audioEngine}
                    />
                  ))}
                </div>
              )
            }

            if (sec.type === 'passageGroup') {
              // Nhóm bài đọc (Part 6, 7): Hiển thị Grid 2 cột: Cột trái bài đọc, Cột phải các câu hỏi
              const group = sec
              return (
                <div key={group.id} className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                  {/* Header nhóm bài đọc */}
                  <div className="flex items-center justify-between px-5 py-2.5 bg-amber-50/70 border-b border-amber-200/80">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-amber-700 shrink-0" />
                      <span className="text-xs font-bold text-amber-900">
                        {group.partNum === 6 ? 'Bài đọc điền từ' : 'Bài đọc hiểu'}
                      </span>
                      {group.groupRangeText && (
                        <span className="text-xs text-amber-700 ml-1 font-medium">— {group.groupRangeText}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200/60">
                      {group.questions.length} câu hỏi
                    </span>
                  </div>

                  {/* Nội dung chia 2 cột: Đoạn văn (trái) & Các câu hỏi (phải) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* Cột trái: Đoạn văn */}
                    <div
                      className="lg:col-span-5 p-5 bg-amber-50/20 max-h-[640px] overflow-y-auto"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: '#f59e0b transparent' }}
                    >
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nội dung đoạn văn:</p>
                      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-serif">
                        {group.passage}
                      </div>
                    </div>

                    {/* Cột phải: Các câu hỏi đi kèm */}
                    <div
                      className="lg:col-span-7 p-5 space-y-4 max-h-[640px] overflow-y-auto bg-slate-50/30"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                    >
                      {group.questions.map(({ q, qNum, partNum }) => (
                        <QuestionItemCard
                          key={qNum}
                          q={q}
                          qNum={qNum}
                          partNum={partNum}
                          isListening={false}
                          showTranscript={false}
                          audioEngine={audioEngine}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            if (sec.type === 'audioGroup') {
              // Nhóm bài nghe (Part 3, 4): Hiển thị Khung phát âm thanh chung và Lưới các câu hỏi đi kèm
              const group = sec
              const isPlayingGroup = audioEngine.playingId === group.id
              const hasTranscript = Boolean(group.audioScript)
              const isExpandedTranscript = expandedTranscripts[group.id] || showTranscript

              return (
                <div key={group.id} className="rounded-2xl border border-indigo-200/90 bg-white overflow-hidden shadow-2xs">
                  {/* Header nhóm bài nghe */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-indigo-50/90 via-sky-50/50 to-white border-b border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs shrink-0">
                        <Headphones size={16} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-950">
                          {group.partNum === 3 ? 'Part 3: Hội thoại' : 'Part 4: Bài nói'}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
                          {group.groupRangeText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Nút xem lời thoại (Transcript) */}
                      {hasTranscript && (
                        <button
                          type="button"
                          onClick={() => setExpandedTranscripts(prev => ({ ...prev, [group.id]: !isExpandedTranscript }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isExpandedTranscript
                              ? 'bg-indigo-100/70 text-indigo-900 border-indigo-300'
                              : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          <FileText size={13} />
                          <span>{isExpandedTranscript ? 'Ẩn lời thoại' : 'Lời thoại'}</span>
                        </button>
                      )}

                      {/* Nút Phát / Dừng âm thanh */}
                      <button
                        type="button"
                        onClick={() => {
                          const fallback = group.audioScript || group.questions.map(item => item.q.questionText).join('. ')
                          audioEngine.play(group.id, { audioUrl: group.audioUrl, fallbackText: fallback })
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                          isPlayingGroup
                            ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                        }`}
                      >
                        {isPlayingGroup ? (
                          <>
                            <VolumeX size={14} />
                            <span>Dừng</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={14} />
                            <span>Nghe</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Lời thoại bài nghe (Transcript) */}
                  {isExpandedTranscript && group.audioScript && (
                    <div className="bg-indigo-50/40 border-b border-indigo-100 p-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-900 mb-1.5">
                        <Sparkles size={13} className="text-indigo-600" />
                        <span>Kịch bản lời thoại (Transcript đoạn nghe):</span>
                      </div>
                      <div className="text-xs text-indigo-950 font-sans leading-relaxed whitespace-pre-line bg-white/90 p-3.5 rounded-xl border border-indigo-100 shadow-2xs italic">
                        {group.audioScript}
                      </div>
                    </div>
                  )}

                  {/* Ảnh bổ trợ (nếu có biểu đồ / lịch trình đi kèm bài nghe) */}
                  {group.imageUrl && (
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={group.imageUrl}
                        alt="Biểu đồ bài nghe"
                        className="max-h-48 rounded-xl object-contain border border-slate-200 bg-white p-1"
                      />
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800">Biểu đồ / Hình ảnh đi kèm bài nghe:</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Dùng để trả lời câu hỏi có liên quan đến hình ảnh trong đoạn nghe này.</p>
                      </div>
                    </div>
                  )}

                  {/* Danh sách các câu hỏi đi kèm (Hiển thị dạng Grid) */}
                  <div className={`p-4 bg-slate-50/40 grid gap-3.5 ${
                    group.questions.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
                  }`}>
                    {group.questions.map(({ q, qNum, partNum }) => (
                      <QuestionItemCard
                        key={qNum}
                        q={q}
                        qNum={qNum}
                        partNum={partNum}
                        isListening={true}
                        showTranscript={false}
                        audioEngine={audioEngine}
                        hideIndividualAudio={true}
                      />
                    ))}
                  </div>
                </div>
              )
            }

            return null
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Ngày tạo: {formatDate(exam.createdAt) || '—'}</span>
        <span className="flex items-center gap-1"><User size={12} />{exam.authorName || 'Hệ thống'}</span>
      </div>
    </div>
  )
}