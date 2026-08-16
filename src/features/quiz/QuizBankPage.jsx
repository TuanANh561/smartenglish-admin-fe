import { useMemo, useState } from 'react'
import { CheckCircle2, Sparkles, Plus, Upload, XCircle } from 'lucide-react'
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
import { formatDate, formatNumber } from '@/lib/utils'
import { QUIZ_STATS, quizQuestions } from '@/mocks/data/quizQuestions'
import { QUIZ_TYPE_META, quizSets } from '@/mocks/data/quizSets'
import { buildQuizColumns, QUESTION_TYPE_META } from './columns'

const PAGE_SIZE = 10

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
const QUIZ_TYPE_CHIPS = Object.entries(QUIZ_TYPE_META).map(([key, meta]) => ({
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
  const [quizTypeFilter, setQuizTypeFilter] = useState('all')

  const filteredSets = useMemo(() => {
    if (quizTypeFilter === 'all') return quizSets
    return quizSets.filter((set) => set.quizType === quizTypeFilter)
  }, [quizTypeFilter])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return quizQuestions.filter((q) => {
      const matchSearch =
        !keyword ||
        q.questionText.toLowerCase().includes(keyword) ||
        q.relatedWord.toLowerCase().includes(keyword)
      const matchType = type === 'all' || q.questionType === type
      const matchCefr = cefr === 'all' || q.cefrLevel === cefr
      const matchTopic = topic === 'all' || q.topic === topic
      const matchSource = source === 'all' || q.source === source
      return matchSearch && matchType && matchCefr && matchTopic && matchSource
    })
  }, [search, type, cefr, topic, source])

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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatTile label="Tổng câu hỏi" value={formatNumber(QUIZ_STATS.total)} />
        <StatTile label="AI tạo" value={formatNumber(QUIZ_STATS.aiGenerated)} tone="info" />
        <StatTile label="Chờ duyệt" value={formatNumber(QUIZ_STATS.pendingReview)} tone="danger" />
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
        <Card>
          <FilterChipRow chips={QUIZ_TYPE_CHIPS} value={quizTypeFilter} onChange={setQuizTypeFilter} />

          {filteredSets.length === 0 ? (
            <EmptyState
              className="mt-4"
              title="Chưa có bộ đề nào"
              description="Thử đổi loại bài hoặc tạo bộ đề mới."
            />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      ID
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Tên bộ đề
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Loại bài
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Nguồn
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Số câu
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Điểm đạt
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Lượt làm tối đa
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Cập nhật
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredSets.map((set) => (
                    <tr key={set.id} className="hover:bg-canvas">
                      <td className="px-4 py-3 font-mono text-xs text-ink-muted">{set.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-700">{set.title}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {set.tags.map((tag) => (
                            <span key={tag} className="text-xs text-ink-muted">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={QUIZ_TYPE_META[set.quizType].tone}>
                          {QUIZ_TYPE_META[set.quizType].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {set.aiGenerated ? (
                          <Badge tone="info" className="gap-1">
                            <Sparkles size={12} strokeWidth={1.75} />
                            AI
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Thủ công</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink">{set.questionCount}</td>
                      <td className="px-4 py-3 text-ink">{set.passingScore ?? '—'}</td>
                      <td className="px-4 py-3 text-ink">{set.maxAttempts ?? 'Không giới hạn'}</td>
                      <td className="px-4 py-3 text-ink-muted">{formatDate(set.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
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
