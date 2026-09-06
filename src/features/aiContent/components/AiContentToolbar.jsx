import { CheckCheck, Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import { STATUS_FILTERS, TABS } from './aiContentConstants'

export default function AiContentToolbar({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onOpenCreationModal,
  onBulkApprove,
  showTrash,
  setShowTrash,
  trashCount,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
      <Tabs
        tabs={TABS}
        value={activeTab}
        onChange={setActiveTab}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <SearchInput
          placeholder="Tìm nội dung..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="min-w-[180px]"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
        <Button icon={Plus} onClick={onOpenCreationModal}>
          Tạo nội dung AI
        </Button>
        <Button icon={CheckCheck} onClick={onBulkApprove}>
          Duyệt tất cả
        </Button>
        <Button
          variant="secondary"
          icon={Trash2}
          onClick={() => setShowTrash((value) => !value)}
        >
          {showTrash ? 'Đóng thùng rác' : `Thùng rác${trashCount > 0 ? ` (${trashCount})` : ''}`}
        </Button>
      </div>
    </div>
  )
}
