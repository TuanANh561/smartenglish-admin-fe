import { Building2, Globe, Sparkles, User, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import FilterChip from '@/components/ui/FilterChip'
import Tabs from '@/components/ui/Tabs'

const TABS = [
  { value: 'questions', label: 'Ngân hàng câu hỏi' },
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
  mySetsCount,
  publicQuizQuestionsCount,
  quizSetsCount,
  isTeacher,
  onResetPage,
}) {
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
              Của tôi ({activeTab === 'questions' ? myQuestionsCount : mySetsCount})
            </FilterChip>
            <FilterChip
              active={ownershipFilter === 'all'}
              onClick={() => {
                setOwnershipFilter('all')
                onResetPage()
              }}
            >
              <Globe size={13} className="mr-1.5 inline-block shrink-0" />
              Tất cả ({activeTab === 'questions' ? publicQuizQuestionsCount : quizSetsCount})
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
