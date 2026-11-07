import { BookOpen, CheckCircle2, Clock, FileText, Pencil, Sparkles, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export default function ReadingDetailPanel({ passage, canManage, onEditClick }) {
  if (!passage) return null

  const questions = passage.questions || []
  const vocabulary = passage.keyVocabulary || []

  return (
    <div className="flex flex-col min-h-[600px] bg-white">
      {/* ── Header thông tin & Nút hành động ── */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
              passage.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {passage.status === 'published' ? 'Đang hoạt động' : 'Bản nháp'}
            </span>
            {passage.cefrLevel && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Cấp độ {passage.cefrLevel}
              </span>
            )}
            {passage.topic && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {passage.topic}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{passage.titleEn}</h1>
          {passage.titleVi && passage.titleVi !== passage.titleEn && (
            <p className="text-xs text-slate-500 italic mt-0.5">{passage.titleVi}</p>
          )}
        </div>

        {canManage && (
          <div className="shrink-0">
            <Button
              variant="primary"
              size="sm"
              icon={Pencil}
              onClick={() => onEditClick(passage)}
            >
              Chỉnh sửa bài đọc
            </Button>
          </div>
        )}
      </div>

      {/* ── 4 ô thống kê thông số bài đọc ── */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 bg-slate-50/50">
        {[
          { label: 'Độ dài bài đọc', value: `${passage.wordCount ?? 0} từ`, Icon: FileText, bg: 'bg-blue-100', fg: 'text-blue-600' },
          { label: 'Thời gian ước tính', value: `~${passage.estimatedMin ?? 5} phút`, Icon: Clock, bg: 'bg-emerald-100', fg: 'text-emerald-600' },
          { label: 'Câu hỏi đọc hiểu', value: `${questions.length} câu`, Icon: BookOpen, bg: 'bg-amber-100', fg: 'text-amber-600' },
          { label: 'Điểm thưởng', value: `+${passage.xpReward ?? 30} XP`, Icon: Sparkles, bg: 'bg-purple-100', fg: 'text-purple-600' },
        ].map(({ label, value, Icon, bg, fg }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-3 border-r border-b md:border-b-0 border-slate-200 last:border-r-0">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${bg} ${fg}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-none mb-0.5">{label}</p>
              <p className="text-sm font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Nội dung chia 2 cột: Đoạn văn (trái) & Từ vựng + Thông tin (phải) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Cột trái: Đoạn văn bài đọc & Câu hỏi */}
        <div className="lg:col-span-8 p-6 space-y-6 overflow-y-auto">
          {/* Card Đoạn văn */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nội dung đoạn văn</span>
              <span className="text-xs text-slate-400 font-medium">{passage.wordCount ?? 0} từ</span>
            </div>
            <div className="text-slate-800 leading-relaxed font-serif text-base whitespace-pre-wrap select-text">
              {passage.passageText || <span className="text-slate-400 italic">Chưa có nội dung đoạn văn.</span>}
            </div>
          </div>

          {/* Danh sách câu hỏi đọc hiểu */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={16} className="text-brand-600" />
                <span>Câu hỏi đọc hiểu ({questions.length})</span>
              </h3>
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const opts = Array.isArray(q.options) ? q.options : []
                  const correctAnswer = q.correctAnswer || q.correctIndex
                  return (
                    <div key={idx} className="rounded-2xl border border-slate-200/90 bg-white p-4 text-xs space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-slate-800 text-sm leading-snug">
                          {q.questionText || q.question}
                        </p>
                      </div>

                      {opts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {opts.map((opt, optIdx) => {
                            const label = String.fromCharCode(65 + optIdx)
                            const isCorrect =
                              correctAnswer === label ||
                              correctAnswer === optIdx ||
                              String(correctAnswer) === String(optIdx)
                            const optText = typeof opt === 'string' ? opt : opt?.text || opt
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs transition-colors ${
                                  isCorrect
                                    ? 'bg-emerald-50/90 border border-emerald-300 text-emerald-950 font-medium'
                                    : 'bg-slate-50/70 border border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                                }`}>
                                  {label}
                                </span>
                                <span className="leading-snug truncate flex-1">{optText}</span>
                                {isCorrect && <CheckCircle2 size={13} className="text-emerald-600 shrink-0 ml-auto" />}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {(q.explanationVi || q.explanation) && (
                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600 leading-relaxed">
                          <span className="font-bold text-slate-700">Giải thích: </span>
                          {q.explanationVi || q.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Từ vựng trọng tâm & Tổng quan */}
        <div className="lg:col-span-4 p-6 space-y-5 bg-slate-50/30 overflow-y-auto">
          {/* Tổng quan */}
          {passage.description && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng quan</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{passage.description}</p>
            </div>
          )}

          {/* Từ vựng chủ chốt */}
          {vocabulary.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Từ vựng trọng tâm ({vocabulary.length})
              </h4>
              <div className="space-y-2">
                {vocabulary.map((v, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-[11px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">{v.word}</p>
                      <p className="text-slate-600 mt-0.5">{v.meaningVi}</p>
                      {v.ipaUs && <p className="text-indigo-600 font-mono text-[10px] mt-0.5">{v.ipaUs}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thông tin bài viết */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs text-slate-500 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span>Tác giả:</span>
              <span className="font-semibold text-slate-800">{passage.authorName || 'SmartEnglish'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ngày tạo:</span>
              <span className="font-medium text-slate-700">{formatDate(passage.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
