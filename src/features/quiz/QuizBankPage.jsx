import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  FileText,
  ListFilter,
  Lock,
  Pencil,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Users,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import Drawer from '@/components/ui/Drawer'
import FilterChip from '@/components/ui/FilterChip'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import EmptyState from '@/components/ui/EmptyState'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import { formatNumber } from '@/lib/utils'
import { QUIZ_STATS, quizQuestions } from '@/mocks/data/quizQuestions'
import { EXAM_TRACK_META, quizSets, VERIFICATION_META } from '@/mocks/data/quizSets'
import { buildPublicContent } from '@/features/aiContent/aiContentService'
import { buildQuizColumns, QUESTION_TYPE_META } from './columns'
import { useAuthStore } from '@/store/authStore'

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
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'

  // Mặc định giáo viên chỉ xem đề/câu hỏi của mình
  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
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

  const checkOwnership = (item) => {
    if (!user) return false
    if (isTeacher) {
      return (
        item.authorEmail === user.email ||
        item.authorName === user.displayName ||
        item.authorName === 'Hoàng Thị Mai'
      )
    }
    // Đối với admin: chỉ bài do admin/hệ thống tạo mới là của admin
    return (
      item.authorEmail === user.email ||
      item.authorEmail === 'system@smartenglish.vn' ||
      item.authorName?.includes('Hệ thống') ||
      item.authorName?.includes('Quản trị')
    )
  }

  const canManage = (item) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return checkOwnership(item)
  }

  const publicQuizQuestions = useMemo(() => buildPublicContent('quiz', quizQuestions), [])

  const myQuestionsCount = useMemo(() => {
    return publicQuizQuestions.filter((q) => checkOwnership(q)).length
  }, [publicQuizQuestions, user])

  const mySetsCount = useMemo(() => {
    return quizSets.filter((s) => checkOwnership(s)).length
  }, [user])

  // Lọc câu hỏi theo ownership + search + filter
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return publicQuizQuestions.filter((q) => {
      const isOwned = checkOwnership(q)
      const isSystem = q.authorEmail === 'system@smartenglish.vn' || q.authorName?.includes('Hệ thống')

      let matchOwner = true
      if (ownershipFilter === 'mine') {
        matchOwner = isOwned
      } else if (ownershipFilter === 'system') {
        matchOwner = isSystem
      } else if (ownershipFilter === 'others') {
        matchOwner = !isOwned && !isSystem
      } else if (ownershipFilter !== 'all') {
        matchOwner = q.authorName === ownershipFilter || q.authorEmail === ownershipFilter
      }

      const matchSearch =
        !keyword ||
        (q.questionText || '').toLowerCase().includes(keyword) ||
        (q.relatedWord || '').toLowerCase().includes(keyword)
      const matchType = type === 'all' || q.questionType === type
      const matchCefr = cefr === 'all' || q.cefrLevel === cefr
      const matchTopic = topic === 'all' || q.topic === topic
      const matchSource = source === 'all' || (q.isAI ? 'ai' : q.source) === source

      return matchOwner && matchSearch && matchType && matchCefr && matchTopic && matchSource
    })
  }, [search, type, cefr, topic, source, publicQuizQuestions, ownershipFilter, user])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  // Lọc bộ đề thi theo ownership + examTrack
  const filteredSets = useMemo(() => {
    return quizSets.filter((set) => {
      const isOwned = checkOwnership(set)
      const isSystem = set.authorEmail === 'system@smartenglish.vn' || set.authorName?.includes('Hệ thống')

      let matchOwner = true
      if (ownershipFilter === 'mine') {
        matchOwner = isOwned
      } else if (ownershipFilter === 'system') {
        matchOwner = isSystem
      } else if (ownershipFilter === 'others') {
        matchOwner = !isOwned && !isSystem
      } else if (ownershipFilter !== 'all') {
        matchOwner = set.authorName === ownershipFilter || set.authorEmail === ownershipFilter
      }

      const matchTrack = examTrackFilter === 'all' || set.examTrack === examTrackFilter
      return matchOwner && matchTrack
    })
  }, [examTrackFilter, ownershipFilter, user])

  const setsTotal = filteredSets.length
  const setsTotalPages = Math.max(1, Math.ceil(setsTotal / SETS_PAGE_SIZE))
  const setsStart = (setsPage - 1) * SETS_PAGE_SIZE
  const setsPageData = filteredSets.slice(setsStart, setsStart + SETS_PAGE_SIZE)

  const columns = useMemo(
    () =>
      buildQuizColumns({
        onView: setActiveQuestion,
        onEdit: (q) => {
          if (!checkOwnership(q) && user?.role !== 'admin') {
            toast.error(`Bạn không thể sửa câu hỏi của "${q.authorName || 'tác giả khác'}".`)
            return
          }
          setActiveQuestion(q)
        },
        onDelete: (q) => {
          if (!checkOwnership(q) && user?.role !== 'admin') {
            toast.error('Chỉ tác giả mới có quyền xoá câu hỏi này!')
            return
          }
          setDeleteTarget(q)
        },
        currentUser: user,
      }),
    [user],
  )

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const handleEditSet = (set) => {
    if (!checkOwnership(set) && user?.role !== 'admin') {
      toast.error(`Bạn không thể sửa đề thi của "${set.authorName || 'người khác'}".`)
      return
    }
    toast.success(`Mở trình chỉnh sửa đề thi: "${set.title}"`)
  }

  const handleAssignSet = (set) => {
    toast.success(`Đã mở popup giao đề thi "${set.title}" cho lớp học`)
  }

  return (
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Header & Quota */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isTeacher ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
              <Crown size={13} />
            </span>
            <div>
              <span className="font-semibold text-navy-700">Gói Teacher Pro:</span>{' '}
              <span className="text-ink-muted">
                Đã tạo <strong className="text-brand-600 font-bold">{myQuestionsCount}</strong> câu hỏi ·{' '}
                <strong className="text-brand-600 font-bold">{mySetsCount}</strong> đề thi · Hạn mức{' '}
                <strong className="text-emerald-600 font-bold">Không giới hạn</strong>
              </span>
            </div>
            <Link to="/goi-dich-vu" className="ml-2 font-semibold text-brand-600 hover:underline">
              Chi tiết gói →
            </Link>
          </div>
        ) : <div />}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="secondary" icon={Upload} onClick={() => toast.success('Mở popup Import đề/câu hỏi')}>
            Import
          </Button>
          <Button icon={Plus} onClick={() => toast.success('Mở form tạo Quiz mới')}>
            Tạo Quiz Mới
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {/* Bộ lọc quyền sở hữu chung cho cả 2 tab */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Nguồn học liệu:
            </span>
            <div className="flex items-center gap-1.5">
              <FilterChip
                active={ownershipFilter === 'mine'}
                onClick={() => { setOwnershipFilter('mine'); setPage(1); setSetsPage(1) }}
              >
                👤 Của tôi ({activeTab === 'questions' ? myQuestionsCount : mySetsCount})
              </FilterChip>
              <FilterChip
                active={ownershipFilter === 'all'}
                onClick={() => { setOwnershipFilter('all'); setPage(1); setSetsPage(1) }}
              >
                🌐 Tất cả ({activeTab === 'questions' ? publicQuizQuestions.length : quizSets.length})
              </FilterChip>
              <FilterChip
                active={ownershipFilter === 'system'}
                onClick={() => { setOwnershipFilter('system'); setPage(1); setSetsPage(1) }}
              >
                🏢 Hệ thống SmartEnglish
              </FilterChip>
              {isTeacher && (
                <FilterChip
                  active={ownershipFilter === 'others'}
                  onClick={() => { setOwnershipFilter('others'); setPage(1); setSetsPage(1) }}
                >
                  👥 Giáo viên khác
                </FilterChip>
              )}
            </div>
          </div>

          {!isTeacher && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Lọc tác giả:</span>
              <Select
                value={ownershipFilter}
                onChange={(e) => { setOwnershipFilter(e.target.value); setPage(1); setSetsPage(1) }}
                className="w-48 text-xs"
              >
                <option value="all">Tất cả tác giả</option>
                <option value="Hoàng Thị Mai">Hoàng Thị Mai (GV)</option>
                <option value="Vũ Đức Thắng">Vũ Đức Thắng (GV)</option>
                <option value="Hệ thống SmartEnglish">Hệ thống SmartEnglish</option>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* TAB 1: Ngân hàng câu hỏi */}
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
              emptyMessage={
                ownershipFilter === 'mine'
                  ? 'Bạn chưa tạo câu hỏi nào khớp bộ lọc. Bấm "Tất cả" hoặc tạo câu hỏi mới.'
                  : 'Chưa có câu hỏi nào khớp bộ lọc'
              }
              enableSelection
            />
          </div>
        </Card>
      )}

      {/* TAB 2: Bộ đề thi */}
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
            <EmptyState
              title="Chưa có đề thi nào phù hợp"
              description={
                ownershipFilter === 'mine'
                  ? 'Bạn chưa tạo bộ đề nào trong danh mục này. Hãy tạo đề thi mới hoặc chọn "Tất cả đề thi".'
                  : 'Thử đổi bộ lọc hoặc tạo đề thi mới.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {setsPageData.map((set) => {
                const trackMeta = EXAM_TRACK_META[set.examTrack] || EXAM_TRACK_META.ielts
                const verificationMeta = VERIFICATION_META[set.verificationStatus] || VERIFICATION_META.pending
                const isOwned = checkOwnership(set)
                const isSystem = set.authorEmail === 'system@smartenglish.vn' || set.authorName?.includes('Hệ thống')

                return (
                  <Card key={set.id} className="flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition-all group">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                            <span className={`h-1.5 w-1.5 rounded-full ${trackMeta.dotClass}`} />
                            {trackMeta.label}
                          </span>
                          {isTeacher && isOwned ? (
                            <Badge tone="success" className="text-[10px]">
                              👤 Của tôi
                            </Badge>
                          ) : isSystem ? (
                            <Badge tone="neutral" className="text-[10px]">
                              🏢 Hệ thống
                            </Badge>
                          ) : (
                            <Badge tone="warning" className="text-[10px]">
                              👨‍🏫 {set.authorName}
                            </Badge>
                          )}
                        </div>

                        <Badge tone={verificationMeta.tone} className="gap-1 text-[11px]">
                          <CheckCircle2 size={11} strokeWidth={1.75} />
                          {verificationMeta.label}
                        </Badge>
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-navy-700 group-hover:text-brand-600 transition-colors">
                        {set.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-ink-muted">{set.subtitle}</p>

                      <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
                        <p className="flex items-center gap-1.5">
                          <Clock size={13} strokeWidth={1.75} />
                          {set.durationMinutes} phút
                          <FileText size={13} strokeWidth={1.75} className="ml-2" />
                          {set.questionCount} câu
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users size={13} strokeWidth={1.75} />
                          {formatNumber(set.attempts)} lượt{' '}
                          {set.attemptsType === 'full' ? 'thi đầy đủ' : 'luyện tập'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line">
                      <div className="flex items-center justify-between text-[11px] text-ink-muted mb-2.5">
                        <span>Tác giả: <strong>{set.authorName || 'SmartEnglish'}</strong></span>
                        {!canManage(set) && (
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <Lock size={11} /> Chỉ xem
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Nút giao đề cho lớp: Chỉ dành cho giáo viên và đề thuộc sở hữu của mình */}
                        {isTeacher && checkOwnership(set) ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Send}
                              onClick={() => handleAssignSet(set)}
                              className="flex-1 text-xs"
                            >
                              Giao lớp
                            </Button>
                            <Button
                              size="sm"
                              icon={Pencil}
                              onClick={() => handleEditSet(set)}
                              className="flex-1 text-xs"
                            >
                              Sửa đề
                            </Button>
                          </>
                        ) : canManage(set) ? (
                          <Button
                            size="sm"
                            fullWidth
                            icon={Pencil}
                            onClick={() => handleEditSet(set)}
                            className="text-xs"
                          >
                            Sửa đề thi
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            icon={Eye}
                            onClick={() => toast.success(`Xem cấu trúc đề: "${set.title}"`)}
                            className="text-xs"
                          >
                            Xem chi tiết đề thi
                          </Button>
                        )}
                      </div>
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Trang sau"
                disabled={setsPage >= setsTotalPages}
                onClick={() => setSetsPage((p) => p + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer xem chi tiết câu hỏi */}
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
              <Badge tone="neutral">
                {QUESTION_TYPE_META[activeQuestion.questionType]?.label || 'Trắc nghiệm'}
              </Badge>
              <Badge tone={checkOwnership(activeQuestion) ? 'success' : 'neutral'}>
                Tác giả: {activeQuestion.authorName || 'Hệ thống'}
              </Badge>
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
                {activeQuestion.options?.map((option) => (
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

            {activeQuestion.explanationVi && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-navy-700">Giải thích</h4>
                <p className="text-sm text-ink-muted leading-relaxed bg-canvas p-3 rounded-lg">
                  {activeQuestion.explanationVi}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex gap-2 border-t border-line pt-4">
              {checkOwnership(activeQuestion) || user?.role === 'admin' ? (
                <>
                  <Button
                    variant="secondary"
                    fullWidth
                    icon={Trash2}
                    onClick={() => {
                      setActiveQuestion(null)
                      setDeleteTarget(activeQuestion)
                    }}
                  >
                    Xóa câu hỏi
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    icon={Pencil}
                    onClick={() => toast.success(`Mở trình sửa câu hỏi ${activeQuestion.id}`)}
                  >
                    Chỉnh sửa
                  </Button>
                </>
              ) : (
                <div className="w-full text-center text-xs text-ink-muted py-2 bg-slate-50 rounded-lg">
                  <Lock size={13} className="inline mr-1" />
                  Bạn đang xem câu hỏi của tác giả khác (Không có quyền chỉnh sửa)
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          toast.success(`Đã xoá câu hỏi ${deleteTarget?.id}`)
          setDeleteTarget(null)
        }}
        title="Xoá câu hỏi này?"
        description={`Câu hỏi "${deleteTarget?.id}" sẽ bị xoá khỏi ngân hàng câu hỏi. Hành động này không thể hoàn tác.`}
        confirmText="Xoá câu hỏi"
      />
    </main>
  )
}

export default QuizBankPage
