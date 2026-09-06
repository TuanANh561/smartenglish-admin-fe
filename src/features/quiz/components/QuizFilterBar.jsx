import { Building2, Globe, Sparkles, User, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import FilterChip from '@/components/ui/FilterChip'
import Tabs from '@/components/ui/Tabs'

const TABS = [
  { value: 'questions', label: 'Ngân hàng câu hỏi' },
  { value: 'short_tests', label: 'Bài test ngắn' },
  { value: 'sets', label: 'Bộ đề thi (TOEIC · Placement)' },
]

export default function QuizFilterBar({
  activeTab,
  setActiveTab,
  ownershipFilter,
  setOwnershipFilter,
  collectionFilter,
  setCollectionFilter,
  allCollections,
  combinedQuizSets,
  myQuestionsCount,
  myShortTestsCount = 0,
  mySetsCount,
  publicQuizQuestionsCount,
  publicShortTestsCount = 0,
  quizSetsCount,
  shortTestTypeFilter = 'all',
  setShortTestTypeFilter,
  isTeacher,
  onResetPage,
}) {
  const currentMineCount =
    activeTab === 'questions'
      ? myQuestionsCount
      : activeTab === 'short_tests'
        ? myShortTestsCount
        : mySetsCount

  const currentAllCount =
    activeTab === 'questions'
      ? publicQuizQuestionsCount
      : activeTab === 'short_tests'
        ? publicShortTestsCount
        : quizSetsCount

  return (
    <Card className="p-3">
      <div className="space-y-3">
        {/* Row 1: Tabs + Ownership Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip
              active={ownershipFilter === 'mine'}
              onClick={() => {
                setOwnershipFilter('mine')
                onResetPage()
              }}
            >
              <User size={13} className="mr-1.5 inline-block shrink-0" />
              Của tôi ({currentMineCount})
            </FilterChip>
            <FilterChip
              active={ownershipFilter === 'all'}
              onClick={() => {
                setOwnershipFilter('all')
                onResetPage()
              }}
            >
              <Globe size={13} className="mr-1.5 inline-block shrink-0" />
              Tất cả ({currentAllCount})
            </FilterChip>
            <FilterChip
              active={ownershipFilter === 'system'}
              onClick={() => {
                setOwnershipFilter('system')
                onResetPage()
              }}
            >
              <Building2 size={13} className="mr-1.5 inline-block shrink-0" />
              Hệ thống
            </FilterChip>
            {isTeacher && (
              <FilterChip
                active={ownershipFilter === 'others'}
                onClick={() => {
                  setOwnershipFilter('others')
                  onResetPage()
                }}
              >
                <Users size={13} className="mr-1.5 inline-block shrink-0" />
                Khác
              </FilterChip>
            )}
          </div>
        </div>

        {/* Row 2: Sub-filter for short tests tab */}
        {activeTab === 'short_tests' && setShortTestTypeFilter && (
          <div className="flex items-center gap-2 flex-wrap border-t border-line pt-3 text-xs">
            <span className="text-slate-400 text-xs mr-1 font-medium">Dạng bài:</span>
            <FilterChip
              active={shortTestTypeFilter === 'all'}
              onClick={() => {
                setShortTestTypeFilter('all')
                onResetPage()
              }}
            >
              Tất cả
            </FilterChip>
            <FilterChip
              active={shortTestTypeFilter === 'toeic_part_6'}
              onClick={() => {
                setShortTestTypeFilter('toeic_part_6')
                onResetPage()
              }}
            >
              TOEIC Part 6 (Điền đoạn văn)
            </FilterChip>
            <FilterChip
              active={shortTestTypeFilter === 'toeic_part_7'}
              onClick={() => {
                setShortTestTypeFilter('toeic_part_7')
                onResetPage()
              }}
            >
              TOEIC Part 7 (Đọc hiểu)
            </FilterChip>
            <FilterChip
              active={shortTestTypeFilter === 'reading_short'}
              onClick={() => {
                setShortTestTypeFilter('reading_short')
                onResetPage()
              }}
            >
              Đọc hiểu đoạn văn ngắn
            </FilterChip>
            <FilterChip
              active={shortTestTypeFilter === 'cloze_paragraph'}
              onClick={() => {
                setShortTestTypeFilter('cloze_paragraph')
                onResetPage()
              }}
            >
              Điền khuyết văn bản
            </FilterChip>
          </div>
        )}

        {/* Row 2: Collection chips for sets tab */}
        {activeTab === 'sets' && (
          <div className="flex items-center gap-2 flex-wrap border-t border-line pt-3">
            <FilterChip
              active={collectionFilter === 'all'}
              onClick={() => {
                setCollectionFilter('all')
                onResetPage()
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
                    onResetPage()
                  }}
                >
                  {collection === 'AI' && (
                    <Sparkles size={12} className="mr-1 inline-block shrink-0 text-purple-500" />
                  )}
                  {collection} ({count})
                </FilterChip>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
