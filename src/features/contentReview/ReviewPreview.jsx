import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { http } from '@/lib/api'

/** Trường kỹ thuật, không giúp quản trị viên ra quyết định. */
const HIDDEN = new Set([
  'id', 'createdAt', 'updatedAt', 'deletedAt', 'deletedBy', 'createdBy', 'updatedBy', 'authorEmail',
  'authorId', 'isDeleted', 'deleted', 'version', 'slug', 'ownerId', 'teacherId',
])

const LABEL = {
  title: 'Tiêu đề', titleEn: 'Tiêu đề (tiếng Anh)', titleVi: 'Tiêu đề (tiếng Việt)', name: 'Tên',
  word: 'Từ vựng', pronunciation: 'Phiên âm', partOfSpeech: 'Từ loại', vietnameseMeaning: 'Nghĩa tiếng Việt',
  englishMeaning: 'Nghĩa tiếng Anh', exampleEn: 'Câu ví dụ', exampleVi: 'Dịch câu ví dụ', topic: 'Chủ đề',
  topicName: 'Chủ đề', category: 'Thể loại', cefrLevel: 'Cấp độ CEFR', level: 'Cấp độ', description: 'Mô tả',
  summary: 'Tóm tắt', content: 'Nội dung', body: 'Nội dung', transcript: 'Lời thoại', formula: 'Công thức',
  structure: 'Cấu trúc', rules: 'Quy tắc', examples: 'Ví dụ', exercises: 'Bài tập', questions: 'Câu hỏi',
  sections: 'Phần thi', status: 'Trạng thái', durationMinutes: 'Thời gian (phút)', duration: 'Thời lượng',
  totalQuestions: 'Số câu hỏi', passingScore: 'Điểm đạt', xpReward: 'Điểm thưởng (XP)', authorName: 'Người soạn',
  ipaSymbol: 'Ký hiệu IPA', symbol: 'Ký hiệu IPA', sampleWords: 'Từ mẫu', sampleSentences: 'Câu mẫu',
  mouthPosition: 'Khẩu hình', accent: 'Giọng', audioUrl: 'Âm thanh', imageUrl: 'Hình ảnh', thumbnailUrl: 'Ảnh bìa',
  estimatedMinutes: 'Thời gian học (phút)', wordCount: 'Số từ', isPremium: 'Trả phí', price: 'Giá',
  courseType: 'Loại khoá học', lessons: 'Bài học', tags: 'Thẻ', published: 'Đã xuất bản',
}

const labelOf = (key) => LABEL[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

const isEmpty = (v) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)

const isUrl = (v) => typeof v === 'string' && /^https?:\/\//.test(v)

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

function QuestionCard({ q, index }) {
  const text = q.questionText ?? q.question ?? q.content ?? q.prompt ?? q.text
  const options = Array.isArray(q.options) ? q.options : Array.isArray(q.choices) ? q.choices : []
  const answer = q.correctAnswer ?? q.answer ?? q.correctOption ?? q.correctIndex
  const isCorrect = (opt, i) => {
    const label = typeof opt === 'object' ? opt.text ?? opt.content ?? opt.label : opt
    const key = typeof opt === 'object' ? opt.key ?? opt.id : String.fromCharCode(65 + i)
    return answer != null && (String(answer) === String(label) || String(answer) === String(key) || answer === i)
  }
  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <p className="text-sm font-medium text-navy-700">
        <span className="mr-1 text-ink-muted">Câu {index + 1}.</span>
        {text ?? <ValueView value={q} />}
      </p>
      {options.length > 0 && (
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {options.map((opt, i) => {
            const label = typeof opt === 'object' ? opt.text ?? opt.content ?? opt.label ?? JSON.stringify(opt) : opt
            const correct = isCorrect(opt, i)
            return (
              <li
                key={i}
                className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm ${
                  correct ? 'bg-[#DCFCE7] text-[#15803D] font-medium' : 'bg-canvas text-ink'
                }`}
              >
                <span className="text-xs text-ink-muted">{String.fromCharCode(65 + i)}</span>
                <span className="flex-1">{String(label)}</span>
                {correct && <Check size={14} strokeWidth={2} />}
              </li>
            )
          })}
        </ul>
      )}
      {options.length === 0 && answer != null && (
        <p className="mt-1 text-sm text-[#15803D]">Đáp án: {String(answer)}</p>
      )}
      {q.explanation && <p className="mt-2 text-xs text-ink-muted">Giải thích: {q.explanation}</p>}
    </div>
  )
}

function ObjectCard({ value }) {
  const entries = Object.entries(value).filter(([k, v]) => !HIDDEN.has(k) && !isEmpty(v))
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
      {entries.map(([k, v]) => (
        <p key={k} className="py-0.5">
          <span className="text-ink-muted">{labelOf(k)}: </span>
          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
        </p>
      ))}
    </div>
  )
}

function ValueView({ value, fieldKey }) {
  if (isEmpty(value)) return <span className="text-ink-muted">Trống</span>
  if (typeof value === 'boolean') return <span>{value ? 'Có' : 'Không'}</span>
  if (isUrl(value)) {
    if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(value) || /image/i.test(fieldKey ?? ''))
      return <img src={value} alt="" className="max-h-40 rounded-lg border border-line" />
    if (/\.(mp3|wav|ogg|m4a)(\?|$)/i.test(value) || /audio/i.test(fieldKey ?? ''))
      return <audio controls src={value} className="w-full" />
    return (
      <a href={value} target="_blank" rel="noreferrer" className="break-all text-brand-600 hover:underline">
        {value}
      </a>
    )
  }
  if (Array.isArray(value)) {
    const looksLikeQuestion = value.some(
      (v) => v && typeof v === 'object' && ('options' in v || 'questionText' in v || 'question' in v),
    )
    if (looksLikeQuestion)
      return (
        <div className="space-y-2">
          {value.map((q, i) => (
            <QuestionCard key={i} q={q} index={i} />
          ))}
        </div>
      )
    if (value.every((v) => typeof v !== 'object'))
      return (
        <ul className="list-disc space-y-0.5 pl-5">
          {value.map((v, i) => (
            <li key={i}>{String(v)}</li>
          ))}
        </ul>
      )
    return (
      <div className="space-y-2">
        {value.map((v, i) => (typeof v === 'object' ? <ObjectCard key={i} value={v} /> : <p key={i}>{String(v)}</p>))}
      </div>
    )
  }
  if (typeof value === 'object') return <ObjectCard value={value} />
  return <span className="whitespace-pre-wrap break-words">{String(value)}</span>
}

function FieldRow({ fieldKey, value, before, showBefore }) {
  const changed = showBefore && !same(before, value)
  return (
    <div className={`px-4 py-3 ${changed ? 'bg-[#FFFBEB]' : ''}`}>
      <div className="mb-1 flex items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{labelOf(fieldKey)}</p>
        {changed && (
          <span className="rounded-full bg-[#FEF3C7] px-2 text-[11px] font-medium text-[#A16207]">Có thay đổi</span>
        )}
      </div>
      {changed ? (
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-2 text-sm text-ink-muted">
            <p className="mb-1 text-[11px] uppercase tracking-wide">Hiện tại</p>
            <ValueView value={before} fieldKey={fieldKey} />
          </div>
          <div className="rounded-lg border border-[#FDE68A] bg-white p-2 text-sm text-ink">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-[#A16207]">Đề xuất</p>
            <ValueView value={value} fieldKey={fieldKey} />
          </div>
        </div>
      ) : (
        <div className="text-sm text-ink">
          <ValueView value={value} fieldKey={fieldKey} />
        </div>
      )}
    </div>
  )
}

/** Bản xem trước dễ đọc của yêu cầu duyệt: tiêu đề, nội dung theo từng mục, so sánh trước / sau khi sửa. */
function ReviewPreview({ detail }) {
  const [showAll, setShowAll] = useState(false)
  const action = detail.action
  const needsCurrent = (action === 'UPDATE' || action === 'DELETE' || action === 'PUBLISH') && detail.resourceId
  const currentQuery = useQuery({
    queryKey: ['content-reviews', 'current', detail.path],
    queryFn: () => http.get(String(detail.path).replace(/^\/api(\/v1)?(?=\/)/, '').replace(/\/(restore|publish|unpublish|toggle-publish)$/, '')),
    enabled: Boolean(needsCurrent && detail.path),
    retry: 0,
    staleTime: 30000,
  })
  const current = currentQuery.data && typeof currentQuery.data === 'object' ? currentQuery.data : null

  if (action === 'DELETE') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Giáo viên đề nghị xoá học liệu này. Sau khi duyệt, học liệu được chuyển vào thùng rác.
        </div>
        {currentQuery.isLoading ? (
          <p className="text-sm text-ink-muted">Đang tải học liệu hiện tại...</p>
        ) : current ? (
          <FieldList data={current} />
        ) : (
          <p className="text-sm text-ink-muted">Không tải được học liệu hiện tại.</p>
        )}
      </div>
    )
  }

  const payload = detail.payload
  if (payload === null || payload === undefined || typeof payload !== 'object') {
    return (
      <p className="text-sm text-ink-muted">
        {payload ? String(payload) : 'Yêu cầu không kèm nội dung (VD: thêm từ vựng tự tra từ điển, hoặc xuất bản / ẩn).'}
      </p>
    )
  }

  if (Array.isArray(payload)) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink-muted">{payload.length} mục được nhập</p>
        <ValueView value={payload} />
      </div>
    )
  }

  const keys = Object.keys(payload).filter((k) => !HIDDEN.has(k))
  const comparing = Boolean(current)
  const changedKeys = comparing ? keys.filter((k) => !same(current[k], payload[k])) : keys
  const visible = comparing && !showAll ? changedKeys : keys.filter((k) => !isEmpty(payload[k]) || comparing)

  return (
    <div className="space-y-2">
      {comparing && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">
            {changedKeys.length > 0 ? `${changedKeys.length} mục thay đổi` : 'Không có mục nào thay đổi so với hiện tại'}
          </span>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-brand-600 hover:underline cursor-pointer"
          >
            {showAll ? 'Chỉ xem mục thay đổi' : 'Xem toàn bộ'}
          </button>
        </div>
      )}
      {needsCurrent && currentQuery.isLoading && (
        <p className="text-sm text-ink-muted">Đang tải bản hiện tại để so sánh...</p>
      )}
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        {visible.map((k) => (
          <FieldRow key={k} fieldKey={k} value={payload[k]} before={current?.[k]} showBefore={comparing} />
        ))}
      </div>
    </div>
  )
}

function FieldList({ data }) {
  const keys = Object.keys(data).filter((k) => !HIDDEN.has(k) && !isEmpty(data[k]))
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
      {keys.map((k) => (
        <FieldRow key={k} fieldKey={k} value={data[k]} />
      ))}
    </div>
  )
}

export default ReviewPreview
