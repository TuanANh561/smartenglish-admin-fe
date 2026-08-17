import { useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ListFilter,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  Upload,
  Users,
  XCircle,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import Drawer from '@/components/ui/Drawer'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import EmptyState from '@/components/ui/EmptyState'
import Select from '@/components/ui/Select'
import StatTile from '@/components/ui/StatTile'
import Tabs from '@/components/ui/Tabs'
import { formatNumber } from '@/lib/utils'
import { QUIZ_STATS, quizQuestions } from '@/mocks/data/quizQuestions'
import { EXAM_TRACK_META, quizSets, VERIFICATION_META } from '@/mocks/data/quizSets'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { buildQuizColumns, QUESTION_TYPE_META } from './columns'

const PAGE_SIZE = 10
const SETS_PAGE_SIZE = 6

const TABS = [
  { value: 'questions', label: 'Ngân hàng câu hỏi' },
  { value: 'sets', label: 'Bộ đề thi (IELTS · TOEIC · Placement)' },
]

const TYPE_OPTIONS = Object.entries(QUESTION_TYPE_META)
const CEFR_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const TOPIC_OPTIONS = ['Từ vựng', 'Ngữ pháp', 'Đọc hiểu']
const SOURCE_OPTIONS = [
  { value: 'ai', label: 'AI tạo' },
  { value: 'manual', label: 'Thủ công' },
]
const EXAM_TRACK_CHIPS = Object.entries(EXAM_TRACK_META).map(([key, meta]) => ({
  key,
  label: meta.label,
}))

function QuizBankPage() {
  const [activeTab, setActiveTab] = useState('questions')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [cefr, setCefr] = useState('all')
  const [topic, setTopic] = useState('all')
  const [source, setSource] = useState('all')
  const [page, setPage] = useState(1)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [examTrackFilter, setExamTrackFilter] = useState('all')
  const [setsPage, setSetsPage] = useState(1)

  const filteredSets = useMemo(() => {
    if (examTrackFilter === 'all') return quizSets
    return quizSets.filter((set) => set.examTrack === examTrackFilter)
  }, [examTrackFilter])

  const setsTotal = filteredSets.length
  const setsTotalPages = Math.max(1, Math.ceil(setsTotal / SETS_PAGE_SIZE))
  const setsStart = (setsPage - 1) * SETS_PAGE_SIZE
  const setsPageData = filteredSets.slice(setsStart, setsStart + SETS_PAGE_SIZE)

  const publicQuizQuestions = useMemo(() => buildPublicContent('quiz', quizQuestions), [])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return publicQuizQuestions.filter((q) => {
      const matchSearch =
        !keyword ||
        (q.questionText || '').toLowerCase().includes(keyword) ||
        (q.relatedWord || '').toLowerCase().includes(keyword)
      const matchType = type === 'all' || q.questionType === type
      const matchCefr = cefr === 'all' || q.cefrLevel === cefr
      const matchTopic = topic === 'all' || q.topic === topic
      const matchSource = source === 'all' || (q.isAI ? 'ai' : q.source) === source
      return matchSearch && matchType && matchCefr && matchTopic && matchSource
    })
  }, [search, type, cefr, topic, source, publicQuizQuestions])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const columns = useMemo(
    () =>
      buildQuizColumns({
        onView: setActiveQuestion,
        onEdit: setActiveQuestion,
        onDelete: setDeleteTarget,
      }),
    [],
  )

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  return (
    <main className="flex-1 bg-canvas p-6 space-y-5">
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" icon={Upload}>
          Import
        </Button>
        <Button icon={Plus}>Tạo Quiz Mới</Button>
      </div>

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === 'questions' && (
      <Card>
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Tìm theo câu hỏi hoặc từ vựng..."
        >
          <div className="flex flex-wrap items-center gap-2">
            <Select value={type} onChange={handleFilterChange(setType)} className="w-40">
              <option value="all">Tất cả dạng bài</option>
              {TYPE_OPTIONS.map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
            <Select value={cefr} onChange={handleFilterChange(setCefr)} className="w-32">
              <option value="all">Tất cả CEFR</option>
              {CEFR_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
            <Select value={topic} onChange={handleFilterChange(setTopic)} className="w-36">
              <option value="all">Tất cả chủ đề</option>
              {TOPIC_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select value={source} onChange={handleFilterChange(setSource)} className="w-36">
              <option value="all">Tất cả nguồn</option>
              {SOURCE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </DataTableToolbar>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={pageData}
            pagination={{ page, size: PAGE_SIZE, total, totalPages }}
            onPageChange={setPage}
            onRowClick={setActiveQuestion}
            emptyMessage="Chưa có câu hỏi nào khớp bộ lọc"
            enableSelection
          />
        </div>
      </Card>
      )}

      {activeTab === 'sets' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChipRow
              chips={EXAM_TRACK_CHIPS}
              value={examTrackFilter}
              onChange={(value) => {
                setExamTrackFilter(value)
                setSetsPage(1)
              }}
            />
          </div>

          {setsPageData.length === 0 ? (
            <EmptyState title="Chưa có đề thi nào" description="Thử đổi bộ lọc hoặc tạo đề thi mới." />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {setsPageData.map((set) => {
                const trackMeta = EXAM_TRACK_META[set.examTrack]
                const verificationMeta = VERIFICATION_META[set.verificationStatus]
                return (
                  <Card key={set.id} className="flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                        <span className={`h-1.5 w-1.5 rounded-full ${trackMeta.dotClass}`} />
                        {trackMeta.label}
                      </span>
                      <Badge tone={verificationMeta.tone} className="gap-1">
                        <CheckCircle2 size={12} strokeWidth={1.75} />
                        {verificationMeta.label}
                      </Badge>
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-navy-700">{set.title}</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">{set.subtitle}</p>

                    <div className="mt-4 space-y-1.5 text-sm text-ink-muted">
                      <p className="flex items-center gap-1.5">
                        <Clock size={14} strokeWidth={1.75} />
                        {set.durationMinutes} phút
                        <FileText size={14} strokeWidth={1.75} className="ml-2" />
                        {set.questionCount} câu
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Users size={14} strokeWidth={1.75} />
                        {formatNumber(set.attempts)} lượt{' '}
                        {set.attemptsType === 'full' ? 'thi đầy đủ' : 'luyện tập'}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                      <Button variant="secondary" size="sm" icon={Pencil} className="flex-1">
                        Sửa đề
                      </Button>
                      <Button size="sm" icon={BarChart3} className="flex-1">
                        Xem kết quả
                      </Button>
                      <button
                        type="button"
                        aria-label="Cài đặt đề thi"
                        className="rounded-lg border border-line p-2 text-ink-muted hover:bg-canvas hover:text-ink"
                      >
                        <Settings size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              Trang {setsPage} / {setsTotalPages} · {formatNumber(setsTotal)} đề thi
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Trang trước"
                disabled={setsPage <= 1}
                onClick={() => setSetsPage((p) => p - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Trang sau"
                disabled={setsPage >= setsTotalPages}
                onClick={() => setSetsPage((p) => p + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Drawer
        open={Boolean(activeQuestion)}
        onClose={() => setActiveQuestion(null)}
        title="Chi tiết câu hỏi"
        className="max-w-[480px]"
      >
        {activeQuestion && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">{activeQuestion.cefrLevel}</Badge>
              <Badge tone="neutral">{QUESTION_TYPE_META[activeQuestion.questionType].label}</Badge>
              {activeQuestion.status === 'pending' && <Badge tone="warning">Chờ duyệt</Badge>}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-700">Câu hỏi</h4>
              <p className="rounded-lg bg-canvas p-3 text-sm leading-relaxed text-ink">
                {activeQuestion.questionText}
              </p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-700">Đáp án</h4>
              <ul className="space-y-1.5">
                {activeQuestion.options.map((option) => (
                  <li
                    key={option}
                    className={
                      option === activeQuestion.correctAnswer
                        ? 'flex items-center gap-2 rounded-md bg-[#DCFCE7] px-2 py-1.5 text-sm font-medium text-[#15803D]'
                        : 'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink'
                    }
                  >
                    {option === activeQuestion.correctAnswer && (
                      <CheckCircle2 size={16} strokeWidth={1.75} />
                    )}
                    {option}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-700">Giải thích của AI</h4>
              <p className="text-sm text-ink-muted">{activeQuestion.explanationVi}</p>
            </div>

            {activeQuestion.status === 'pending' && (
              <div className="flex gap-3 border-t border-line pt-4">
                <Button variant="secondary" icon={XCircle} fullWidth>
                  Từ chối
                </Button>
                <Button icon={CheckCircle2} fullWidth>
                  Duyệt
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
        title="Xoá câu hỏi này?"
        description={`Câu hỏi "${deleteTarget?.id}" sẽ bị xoá khỏi ngân hàng câu hỏi. Hành động này không thể hoàn tác.`}
        confirmText="Xoá câu hỏi"
      />
    </main>
  )
}

export default QuizBankPage
