import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  FileText,
  Lock,
  Pencil,
  Plus,
  Send,
  Trash2,
  Upload,
  Users,
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
import SearchInput from '@/components/ui/SearchInput'

import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import Tabs from '@/components/ui/Tabs'
import { formatNumber } from '@/lib/utils'
import { quizQuestions } from '@/mocks/data/quizQuestions'
import { EXAM_TRACK_META, quizSets, VERIFICATION_META } from '@/mocks/data/quizSets'
import { buildPublicContent, getApprovedAIContent } from '@/features/aiContent/aiContentService'
import { buildQuizColumns, QUESTION_TYPE_META } from './columns'
import { useAuthStore } from '@/store/authStore'

const PAGE_SIZE = 10
const SETS_PAGE_SIZE = 6

const TABS = [
  { value: 'questions', label: 'Ngân hàng câu hỏi' },
  { value: 'sets', label: 'Bộ đề thi (TOEIC · Placement)' },
]

function QuizBankPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'

  // Mặc định giáo viên chỉ xem đề/câu hỏi của mình
  const [ownershipFilter, setOwnershipFilter] = useState(isTeacher ? 'mine' : 'all')
  const [activeTab, setActiveTab] = useState('questions')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [setsPage, setSetsPage] = useState(1)

  const checkOwnership = useCallback((item) => {
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
  }, [isTeacher, user])

  const canManage = (item) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return checkOwnership(item)
  }

  const publicQuizQuestions = useMemo(() => buildPublicContent('quiz', quizQuestions), [])

  const myQuestionsCount = useMemo(() => {
    return publicQuizQuestions.filter((q) => checkOwnership(q)).length
  }, [publicQuizQuestions, checkOwnership])

  const mySetsCount = useMemo(() => {
    return quizSets.filter((s) => checkOwnership(s)).length
  }, [checkOwnership])

  // Combine mock quizSets with AI-generated quiz content
  const combinedQuizSets = useMemo(() => {
    const approved = getApprovedAIContent('quiz')
    const aiSets = approved.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.content || '',
      examTrack: 'toeic2',
      collection: 'AI',
      authorName: item.createdBy || 'AI System',
      authorEmail: 'ai@smartenglish.vn',
      verificationStatus: 'verified',
      durationMinutes: 45,
      questionCount: Array.isArray(item.questions) ? item.questions.length : 10,
      attempts: 0,
      attemptsType: 'practice',
      createdAt: new Date(item.createdAt),
      isAI: true,
    }))
    return [...quizSets, ...aiSets]
  }, [])

  // Get unique collections for filter chips
  const allCollections = useMemo(() => {
    const unique = new Set(combinedQuizSets.map((s) => s.collection))
    return Array.from(unique).sort()
  }, [combinedQuizSets])

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
        (q.title || '').toLowerCase().includes(keyword) ||
        (q.questionText || '').toLowerCase().includes(keyword) ||
        (q.relatedWord || '').toLowerCase().includes(keyword)

      return matchOwner && matchSearch
    })
  }, [search, publicQuizQuestions, ownershipFilter, checkOwnership])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  // Lọc bộ đề thi theo ownership + collection + search
  const filteredSets = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return combinedQuizSets.filter((set) => {
      const isOwned = set.isAI ? false : checkOwnership(set)
      const isSystem = set.authorEmail === 'system@smartenglish.vn' || set.authorName?.includes('Hệ thống') || set.authorEmail === 'ai@smartenglish.vn'

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

      const matchCollection = collectionFilter === 'all' || set.collection === collectionFilter
      const matchSearch =
        !keyword ||
        (set.title || '').toLowerCase().includes(keyword) ||
        (set.subtitle || '').toLowerCase().includes(keyword)

      return matchOwner && matchCollection && matchSearch
    })
  }, [search, collectionFilter, ownershipFilter, checkOwnership, combinedQuizSets])

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
    [checkOwnership, user],
  )

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

        <div className="flex flex-1 items-center gap-3 self-end sm:self-auto">
          <SearchInput
            placeholder="Tìm đề thi, câu hỏi..."
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
              setSetsPage(1)
            }}
            className="flex-1 min-w-[200px]"
          />
          <Button variant="secondary" icon={Upload} onClick={() => toast.success('Mở popup Import đề/câu hỏi')}>
            Import
          </Button>
          <Button icon={Plus} onClick={() => toast.success('Mở form tạo Quiz mới')}>
            Tạo Quiz Mới
          </Button>
        </div>
      </div>

      {/* Merged Tabs + Filter Row */}
      <Card className="p-3">
        <div className="space-y-3">
          {/* Row 1: Tabs + Ownership Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
            <div className="flex items-center gap-1.5 flex-wrap">
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
                🏢 Hệ thống
              </FilterChip>
              {isTeacher && (
                <FilterChip
                  active={ownershipFilter === 'others'}
                  onClick={() => { setOwnershipFilter('others'); setPage(1); setSetsPage(1) }}
                >
                  👥 Khác
                </FilterChip>
              )}
            </div>
          </div>

          {/* Row 2: Collection chips for sets tab */}
          {activeTab === 'sets' && (
            <div className="flex items-center gap-2 flex-wrap border-t border-line pt-3">
              <FilterChip
                active={collectionFilter === 'all'}
                onClick={() => {
                  setCollectionFilter('all')
                  setSetsPage(1)
                }}
              >
                Tất cả
              </FilterChip>
              {allCollections.map((collection) => {
                const count = combinedQuizSets.filter((s) => s.collection === collection).length
                return (
                  <FilterChip
                    key={collection}
                    active={collectionFilter === collection}
                    onClick={() => {
                      setCollectionFilter(collection)
                      setSetsPage(1)
                    }}
                  >
                    {collection === 'AI' ? `✨ ${collection}` : collection} ({count})
                  </FilterChip>
                )
              })}
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
          />

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
                const isOwned = set.isAI ? false : checkOwnership(set)
                const isSystem = set.isAI || set.authorEmail === 'system@smartenglish.vn' || set.authorName?.includes('Hệ thống')

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
                          ) : set.isAI ? (
                            <Badge tone="info" className="text-[10px]">
                              ✨ AI sinh
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

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          set.isAI
                            ? 'border-purple-300 bg-purple-50 text-purple-600'
                            : 'border-brand-200 bg-brand-50 text-brand-600'
                        }`}>
                          {set.isAI ? '✨' : ''} {set.collection || 'Collection'}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-navy-700 group-hover:text-brand-600 transition-colors">
                        {set.title}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-ink-muted">
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
                        {set.examTrack === 'placement' ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Send}
                              onClick={() => toast.success(`Bắt đầu thi Placement: "${set.title}"`)}
                              className="flex-1 text-xs"
                            >
                              Thi thử
                            </Button>
                            <Button
                              size="sm"
                              icon={Pencil}
                              onClick={() => handleEditSet(set)}
                              className="flex-1 text-xs"
                            >
                              Tạo đề
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Eye}
                              onClick={() => toast.success(`Xem cấu trúc placement: "${set.title}"`)}
                              className="text-xs"
                            >
                              Chi tiết
                            </Button>
                          </>
                        ) : isTeacher && checkOwnership(set) ? (
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
            <p className="text-xs text-ink-muted">
              Hiển thị <strong>{setsTotal === 0 ? 0 : (setsPage - 1) * setsPageSize + 1}</strong>-
              <strong>{Math.min(setsPage * setsPageSize, setsTotal)}</strong> trong tổng số{' '}
              <strong>{formatNumber(setsTotal)}</strong> đề thi
            </p>
            <Pagination page={setsPage} totalPages={setsTotalPages} onChange={setSetsPage} />
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
