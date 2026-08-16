import { useMemo, useState } from 'react'
import { Clock, FileText, Plus, Settings, SlidersHorizontal } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import EmptyState from '@/components/ui/EmptyState'
import FilterChip from '@/components/ui/FilterChip'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import { formatDate } from '@/lib/utils'
import { readings } from '@/mocks/data/readings'
import { LEVEL_GROUPS, LEVEL_LABEL, LEVEL_TONE } from './levels'

const PAGE_SIZE = 6

function ReadingPage() {
  const [search, setSearch] = useState('')
  const [levelGroup, setLevelGroup] = useState('all')
  const [page, setPage] = useState(1)
  const [activeReading, setActiveReading] = useState(null)

  const activeGroup = LEVEL_GROUPS.find((group) => group.key === levelGroup)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return readings.filter((item) => {
      const matchLevel = !activeGroup.levels || activeGroup.levels.includes(item.level)
      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.topic.toLowerCase().includes(keyword)
      return matchLevel && matchSearch
    })
  }, [search, activeGroup])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleLevelChange = (key) => {
    setLevelGroup(key)
    setPage(1)
  }

  return (
    <main className="flex-1 bg-canvas p-6 space-y-5">
      <div className="flex items-center justify-end">
        <Button icon={Plus}>Thêm bài đọc mới</Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm theo tiêu đề, chủ đề, từ khoá..."
            className="min-w-xs flex-1"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Cấp độ:
            </span>
            {LEVEL_GROUPS.map((group) => (
              <FilterChip
                key={group.key}
                active={levelGroup === group.key}
                onClick={() => handleLevelChange(group.key)}
              >
                {group.label}
              </FilterChip>
            ))}
          </div>
          <span className="hidden h-6 w-px bg-line sm:block" />
          <Button variant="ghost" size="sm" icon={SlidersHorizontal}>
            Bộ lọc khác
          </Button>
        </div>
      </Card>

      {pageData.length === 0 ? (
        <EmptyState title="Không tìm thấy bài đọc" description="Thử đổi từ khoá hoặc bộ lọc cấp độ." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pageData.map((item) => (
            <Card
              key={item.id}
              className="flex cursor-pointer flex-col hover:border-brand-500"
              onClick={() => setActiveReading(item)}
            >
              <div className="flex items-start justify-between">
                <Badge tone={LEVEL_TONE[item.level]}>{LEVEL_LABEL[item.level]}</Badge>
                <button
                  type="button"
                  aria-label="Cài đặt bài đọc"
                  onClick={(event) => event.stopPropagation()}
                  className="text-ink-muted hover:text-brand-500"
                >
                  <Settings size={18} strokeWidth={1.75} />
                </button>
              </div>

              <h3 className="mt-3 line-clamp-2 text-base font-semibold text-navy-700">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{item.description}</p>

              <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-sm text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <FileText size={16} strokeWidth={1.75} />
                  {item.wordCount} từ
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} strokeWidth={1.75} />
                  {item.minutes} phút
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          Hiển thị {total === 0 ? 0 : start + 1} đến {Math.min(start + PAGE_SIZE, total)} trên tổng số{' '}
          {total} bài đọc
        </p>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Drawer
        open={Boolean(activeReading)}
        onClose={() => setActiveReading(null)}
        title={activeReading?.title}
      >
        {activeReading && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={LEVEL_TONE[activeReading.level]}>{LEVEL_LABEL[activeReading.level]}</Badge>
              <Badge tone="neutral">{activeReading.topic}</Badge>
              <span className="text-xs text-ink-muted">
                Cập nhật {formatDate(activeReading.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5">
                <FileText size={16} strokeWidth={1.75} />
                {activeReading.wordCount} từ
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} strokeWidth={1.75} />
                {activeReading.minutes} phút đọc
              </span>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-700">Nội dung bài đọc</h4>
              <p className="rounded-lg bg-canvas p-3 text-sm leading-relaxed text-ink">
                {activeReading.content}
              </p>
            </div>

            {activeReading.questions.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-navy-700">
                  Câu hỏi trắc nghiệm ({activeReading.questions.length})
                </h4>
                <div className="space-y-4">
                  {activeReading.questions.map((question, index) => (
                    <div key={question.id} className="rounded-lg border border-line p-3">
                      <p className="text-sm font-medium text-ink">
                        Câu {index + 1}. {question.question}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={option}
                            className={
                              optionIndex === question.correctIndex
                                ? 'flex items-center gap-2 rounded-md bg-[#DCFCE7] px-2 py-1 text-sm font-medium text-[#15803D]'
                                : 'flex items-center gap-2 px-2 py-1 text-sm text-ink'
                            }
                          >
                            <span className="text-xs text-ink-muted">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-xs text-ink-muted">
                        <span className="font-semibold text-navy-700">Giải thích: </span>
                        {question.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </main>
  )
}

export default ReadingPage
